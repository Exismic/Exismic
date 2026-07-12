import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { fulfillBillingOrder, fulfillProRenewal, recordBillingFailure } from "@/lib/billing/fulfillment";
import { prisma } from "@/lib/prisma";
import { PRICING_CONFIG } from "@/config/pricing";
import { sendPaymentFailedEmail } from "@/lib/emails";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: { entity?: Record<string, unknown> };
    order?: { entity?: Record<string, unknown> };
    subscription?: { entity?: Record<string, unknown> };
  };
};

function stringField(source: Record<string, unknown> | undefined, key: string) {
  const value = source?.[key];
  return typeof value === "string" ? value : undefined;
}

function numberField(source: Record<string, unknown> | undefined, key: string) {
  const value = Number(source?.[key]);
  return Number.isFinite(value) ? value : undefined;
}

function dateFromUnix(value: unknown) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const date = new Date(seconds * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return NextResponse.json({ error: "Razorpay webhook is not configured." }, { status: 500 });

    const signature = req.headers.get("x-razorpay-signature") || "";
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const valid = signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) return NextResponse.json({ error: "Invalid Razorpay webhook signature." }, { status: 401 });

    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const eventType = payload.event || "unknown";
    const payment = payload.payload?.payment?.entity;
    const order = payload.payload?.order?.entity;
    const subscription = payload.payload?.subscription?.entity;
    const providerPaymentId = stringField(payment, "id");
    const providerOrderId = stringField(payment, "order_id") || stringField(payment, "subscription_id") || stringField(order, "id") || stringField(subscription, "id");
    const providerEventId = stringField(payload as unknown as Record<string, unknown>, "id") || `${eventType}:${providerPaymentId || providerOrderId || crypto.createHash("sha256").update(rawBody).digest("hex")}`;

    let duplicateEvent = false;
    try {
      await prisma.paymentEvent.create({
        data: {
          gateway: "razorpay",
          providerEventId,
          eventType,
          providerOrderId,
          providerPaymentId,
          rawPayload: payload as object,
        },
      });
    } catch {
      duplicateEvent = true;
      const existingEvent = await prisma.paymentEvent.findUnique({
        where: { gateway_providerEventId: { gateway: "razorpay", providerEventId } },
      });
      if (existingEvent?.processed) return NextResponse.json({ received: true, duplicate: true });
    }

    if (["subscription.pending", "subscription.activated", "subscription.resumed"].includes(eventType) && providerOrderId) {
      const periodEnd = dateFromUnix(subscription?.current_end) || dateFromUnix(subscription?.charge_at);
      const active = eventType !== "subscription.pending";
      const affectedUsers = await prisma.user.findMany({
        where: { subscriptionId: providerOrderId },
        select: { id: true },
      });
      await prisma.user.updateMany({
        where: { subscriptionId: providerOrderId },
        data: {
          ...(active ? { plan: "pro", dailyCredits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS, aiGenerationsLimit: 1000 } : {}),
          subscriptionStatus: active ? "active" : "past_due",
          ...(periodEnd ? { planExpiresAt: periodEnd } : {}),
        },
      });
      await prisma.userBilling.updateMany({
        where: { userId: { in: affectedUsers.map((user) => user.id) } },
        data: {
          planId: "pro",
          status: active ? "active" : "past_due",
          ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
        },
      });
      await prisma.paymentEvent.updateMany({
        where: { gateway: "razorpay", providerEventId },
        data: { processed: true },
      });
      return NextResponse.json({ received: true, processed: true, duplicate: duplicateEvent });
    }

    if (["subscription.cancelled", "subscription.completed", "subscription.halted"].includes(eventType) && providerOrderId) {
      const expiryDate = dateFromUnix(subscription?.current_end) || dateFromUnix(subscription?.ended_at) || new Date();
      const accessEnded = expiryDate <= new Date();
      await prisma.user.updateMany({
        where: { subscriptionId: providerOrderId },
        data: {
          ...(accessEnded ? { plan: "free", dailyCredits: 50, aiGenerationsLimit: 50 } : {}),
          subscriptionStatus: eventType === "subscription.halted" ? "suspended" : "cancelled",
          planExpiresAt: expiryDate,
        },
      });

      const affectedUsers = await prisma.user.findMany({
        where: { subscriptionId: providerOrderId },
        select: { id: true },
      });
      await prisma.userBilling.updateMany({
        where: { userId: { in: affectedUsers.map((user) => user.id) } },
        data: {
          planId: accessEnded ? "free" : "pro",
          status: eventType === "subscription.halted" ? "suspended" : "cancelled",
          currentPeriodEnd: expiryDate,
        },
      });

      await prisma.paymentEvent.updateMany({
        where: { gateway: "razorpay", providerEventId },
        data: { processed: true },
      });

      return NextResponse.json({ received: true, processed: true, duplicate: duplicateEvent });
    }

    if (eventType === "payment.failed" && providerOrderId) {
      const paymentOrder = await prisma.paymentOrder.findFirst({ where: { gateway: "razorpay", providerOrderId } });
      if (paymentOrder) {
        const failureReason = stringField(payment, "error_description") || stringField(payment, "error_reason") || "Razorpay could not complete this payment.";
        if (paymentOrder.status === "paid" && paymentOrder.planId === "pro") {
          const user = await prisma.user.findUnique({ where: { id: paymentOrder.userId }, select: { email: true } });
          if (user?.email) await sendPaymentFailedEmail(user.email, { purchaseType: "pro", orderId: providerEventId, reason: failureReason });
        } else {
          await recordBillingFailure({
            orderId: paymentOrder.id,
            userId: paymentOrder.userId,
            providerPaymentId,
            reason: failureReason,
          });
        }
      }
      await prisma.paymentEvent.updateMany({
        where: { gateway: "razorpay", providerEventId },
        data: { processed: true },
      });
      return NextResponse.json({ received: true, processed: Boolean(paymentOrder), duplicate: duplicateEvent });
    }

    if (!["payment.captured", "order.paid", "subscription.charged"].includes(eventType) || !providerOrderId || !providerPaymentId) {
      return NextResponse.json({ received: true, processed: false });
    }

    const paymentOrder = await prisma.paymentOrder.findFirst({ where: { gateway: "razorpay", providerOrderId } });
    if (!paymentOrder) return NextResponse.json({ received: true, processed: false, reason: "order_not_found" });

    const paidAmount = numberField(payment, "amount");
    const paidCurrency = stringField(payment, "currency");
    if (paidAmount !== paymentOrder.amount || paidCurrency !== paymentOrder.currency) {
      console.error("[Billing] Razorpay webhook amount mismatch", {
        paymentOrderId: paymentOrder.id,
        providerPaymentId,
        expectedAmount: paymentOrder.amount,
        receivedAmount: paidAmount,
        expectedCurrency: paymentOrder.currency,
        receivedCurrency: paidCurrency,
      });
      await prisma.paymentEvent.updateMany({
        where: { gateway: "razorpay", providerEventId },
        data: { processed: true },
      });
      return NextResponse.json({ received: true, processed: false, reason: "amount_or_currency_mismatch" });
    }

    const periodEnd = dateFromUnix(subscription?.current_end) || dateFromUnix(subscription?.charge_at) || (() => {
      const fallback = new Date();
      fallback.setMonth(fallback.getMonth() + 1);
      return fallback;
    })();

    let alreadyProcessed = false;
    if (paymentOrder.planId === "pro" && paymentOrder.status === "paid") {
      const renewal = await fulfillProRenewal({
        userId: paymentOrder.userId,
        provider: "razorpay",
        subscriptionId: providerOrderId,
        providerPaymentId,
        amount: paidAmount,
        currency: paidCurrency,
        periodEnd,
        rawMetadata: { verifiedBy: "razorpay_webhook", webhookEventId: providerEventId, eventType },
      });
      alreadyProcessed = renewal.alreadyProcessed;
    } else {
      const result = await fulfillBillingOrder({
        orderId: paymentOrder.id,
        providerPaymentId,
        periodEnd: paymentOrder.planId === "pro" ? periodEnd : null,
        rawMetadata: { verifiedBy: "razorpay_webhook", webhookEventId: providerEventId, razorpaySubscriptionId: stringField(payment, "subscription_id") || null },
      });
      alreadyProcessed = result.alreadyProcessed;
    }

    await prisma.paymentEvent.updateMany({
      where: { gateway: "razorpay", providerEventId },
      data: { processed: true },
    });

    return NextResponse.json({ received: true, processed: true, duplicate: duplicateEvent, alreadyProcessed });
  } catch (error) {
    console.error("[Billing] Razorpay webhook failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Razorpay webhook failed." }, { status: 500 });
  }
}

