import { NextRequest, NextResponse } from "next/server";
import { PRICING_CONFIG } from "@/config/pricing";
import { fulfillBillingOrder, fulfillProRenewal, recordBillingFailure } from "@/lib/billing/fulfillment";
import { getPayPalAccessToken, getPayPalApiBase, getPayPalSubscription } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { sendPaymentFailedEmail } from "@/lib/emails";

type PayPalWebhookPayload = {
  id?: string;
  event_type?: string;
  resource?: Record<string, unknown>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function stringField(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" ? value : undefined;
}

function extractOrderId(payload: PayPalWebhookPayload) {
  const resource = asRecord(payload.resource);
  const supplementaryData = asRecord(resource.supplementary_data);
  const relatedIds = asRecord(supplementaryData.related_ids);
  return stringField(relatedIds, "order_id") || stringField(resource, "id");
}

function extractCaptureId(payload: PayPalWebhookPayload) {
  const resource = asRecord(payload.resource);
  return stringField(resource, "id");
}

function extractSubscriptionId(payload: PayPalWebhookPayload) {
  const resource = asRecord(payload.resource);
  const eventType = String(payload.event_type || "");

  if (eventType.startsWith("BILLING.SUBSCRIPTION")) return stringField(resource, "id");

  const supplementaryData = asRecord(resource.supplementary_data);
  const relatedIds = asRecord(supplementaryData.related_ids);
  return (
    stringField(resource, "billing_agreement_id") ||
    stringField(resource, "subscription_id") ||
    stringField(relatedIds, "subscription_id") ||
    stringField(relatedIds, "billing_agreement_id")
  );
}

function extractAmountMinor(payload: PayPalWebhookPayload) {
  const resource = asRecord(payload.resource);
  const amount = asRecord(resource.amount);
  const billingInfo = asRecord(resource.billing_info);
  const lastPayment = asRecord(billingInfo.last_payment);
  const lastPaymentAmount = asRecord(lastPayment.amount);
  const value = stringField(amount, "value") || stringField(amount, "total") || stringField(lastPaymentAmount, "value") || "0";
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric * 100) : null;
}

function extractCurrency(payload: PayPalWebhookPayload) {
  const resource = asRecord(payload.resource);
  const amount = asRecord(resource.amount);
  const billingInfo = asRecord(resource.billing_info);
  const lastPayment = asRecord(billingInfo.last_payment);
  const lastPaymentAmount = asRecord(lastPayment.amount);
  return stringField(amount, "currency_code") || stringField(amount, "currency") || stringField(lastPaymentAmount, "currency_code") || "USD";
}

async function verifyPayPalWebhook(req: NextRequest, event: PayPalWebhookPayload) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID || process.env.PAYPAL_SANDBOX_WEBHOOK_ID;
  if (!webhookId) throw new Error("PayPal webhook id is not configured.");

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: req.headers.get("paypal-auth-algo"),
      cert_url: req.headers.get("paypal-cert-url"),
      transmission_id: req.headers.get("paypal-transmission-id"),
      transmission_sig: req.headers.get("paypal-transmission-sig"),
      transmission_time: req.headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: event,
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null) as { verification_status?: string } | null;
  return response.ok && data?.verification_status === "SUCCESS";
}

async function renewSubscription(subscriptionId: string, event: PayPalWebhookPayload) {
  const paymentOrder = await prisma.paymentOrder.findFirst({
    where: { gateway: "paypal", providerOrderId: subscriptionId, planId: "pro" },
    orderBy: { createdAt: "desc" },
  });
  if (!paymentOrder) return { processed: false, reason: "subscription_order_not_found" };

  const subscription = await getPayPalSubscription(subscriptionId).catch(() => null);
  const rawNextBilling = subscription?.billing_info?.next_billing_time;
  const nextBillingDate = rawNextBilling ? new Date(rawNextBilling) : new Date();
  if (!rawNextBilling || Number.isNaN(nextBillingDate.getTime())) nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  const providerPaymentId = extractCaptureId(event) || event.id || `${subscriptionId}:${event.event_type || "renewal"}`;
  const amount = extractAmountMinor(event);
  const currency = extractCurrency(event);
  if (amount !== paymentOrder.amount || currency !== paymentOrder.currency) {
    console.error("[Billing] PayPal subscription amount mismatch", {
      paymentOrderId: paymentOrder.id,
      providerPaymentId,
      expectedAmount: paymentOrder.amount,
      receivedAmount: amount,
      expectedCurrency: paymentOrder.currency,
      receivedCurrency: currency,
    });
    return { processed: false, reason: "amount_or_currency_mismatch" };
  }

  if (paymentOrder.status !== "paid") {
    const result = await fulfillBillingOrder({
      orderId: paymentOrder.id,
      providerPaymentId,
      periodEnd: nextBillingDate,
      rawMetadata: { verifiedBy: "paypal_webhook", eventId: event.id, eventType: event.event_type },
    });
    return { processed: true, userId: paymentOrder.userId, alreadyProcessed: result.alreadyProcessed };
  }

  const result = await fulfillProRenewal({
    userId: paymentOrder.userId,
    provider: "paypal",
    subscriptionId,
    providerPaymentId,
    amount,
    currency,
    periodEnd: nextBillingDate,
    rawMetadata: { eventId: event.id, eventType: event.event_type },
  });

  return { processed: true, userId: paymentOrder.userId, alreadyProcessed: result.alreadyProcessed };
}

async function activateSubscription(subscriptionId: string, event: PayPalWebhookPayload) {
  const paymentOrder = await prisma.paymentOrder.findFirst({
    where: { gateway: "paypal", providerOrderId: subscriptionId, planId: "pro" },
    orderBy: { createdAt: "desc" },
  });
  if (!paymentOrder) return { processed: false, reason: "subscription_order_not_found" };

  const subscription = await getPayPalSubscription(subscriptionId);
  const rawNextBilling = subscription.billing_info?.next_billing_time;
  const nextBillingDate = rawNextBilling ? new Date(rawNextBilling) : new Date();
  if (!rawNextBilling || Number.isNaN(nextBillingDate.getTime())) nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  if (paymentOrder.status !== "paid") {
    const result = await fulfillBillingOrder({
      orderId: paymentOrder.id,
      providerPaymentId: subscriptionId,
      periodEnd: nextBillingDate,
      rawMetadata: { verifiedBy: "paypal_webhook", eventId: event.id, eventType: event.event_type },
    });
    return { processed: true, userId: paymentOrder.userId, alreadyProcessed: result.alreadyProcessed };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: paymentOrder.userId },
      data: {
        plan: "pro",
        subscriptionId,
        subscriptionStatus: "active",
        planExpiresAt: nextBillingDate,
        dailyCredits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS,
        aiGenerationsLimit: 1000,
      },
    });
    await tx.userBilling.upsert({
      where: { userId: paymentOrder.userId },
      update: { planId: "pro", status: "active", currentPeriodEnd: nextBillingDate },
      create: { userId: paymentOrder.userId, planId: "pro", status: "active", currentPeriodEnd: nextBillingDate },
    });
  });

  return { processed: true, userId: paymentOrder.userId, alreadyProcessed: true };
}

async function markSubscription(subscriptionId: string, status: "cancelled" | "suspended" | "expired" | "past_due") {
  const dbUser = await prisma.user.findFirst({ where: { subscriptionId } });
  if (!dbUser) return { processed: false, reason: "subscription_user_not_found" };

  if (status === "expired") {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: dbUser.id },
        data: {
          plan: "free",
          subscriptionStatus: "expired",
          planExpiresAt: new Date(),
          dailyCredits: 50,
          aiGenerationsLimit: 50,
        },
      });

      await tx.userBilling.upsert({
        where: { userId: dbUser.id },
        update: {
          planId: "free",
          status: "expired",
          currentPeriodEnd: new Date(),
        },
        create: {
          userId: dbUser.id,
          planId: "free",
          status: "expired",
          currentPeriodEnd: new Date(),
        },
      });
    });
    return { processed: true, userId: dbUser.id };
  }

  const periodEnd = dbUser.planExpiresAt && dbUser.planExpiresAt > new Date() ? dbUser.planExpiresAt : new Date();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: dbUser.id },
      data: {
        subscriptionStatus: status,
        planExpiresAt: periodEnd,
      },
    });

    await tx.userBilling.upsert({
      where: { userId: dbUser.id },
      update: {
        status,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId: dbUser.id,
        planId: "pro",
        status,
        currentPeriodEnd: periodEnd,
      },
    });
  });

  return { processed: true, userId: dbUser.id };
}

export async function POST(req: NextRequest) {
  try {
    const event = (await req.json()) as PayPalWebhookPayload;
    const eventType = event.event_type || "unknown";
    const providerEventId = event.id || `${eventType}:${Date.now()}`;

    const verified = await verifyPayPalWebhook(req, event);
    if (!verified) return NextResponse.json({ error: "Invalid PayPal webhook signature." }, { status: 401 });

    const providerPaymentId = extractCaptureId(event);
    const providerOrderId = extractOrderId(event);
    const subscriptionId = extractSubscriptionId(event);

    let duplicateEvent = false;
    try {
      await prisma.paymentEvent.create({
        data: {
          gateway: "paypal",
          providerEventId,
          eventType,
          providerOrderId: providerOrderId || subscriptionId,
          providerPaymentId,
          rawPayload: event as object,
        },
      });
    } catch {
      duplicateEvent = true;
      const existingEvent = await prisma.paymentEvent.findUnique({
        where: { gateway_providerEventId: { gateway: "paypal", providerEventId } },
      });
      if (existingEvent?.processed) return NextResponse.json({ received: true, duplicate: true });
    }

    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED" && subscriptionId) {
      const result = await activateSubscription(subscriptionId, event);
      await prisma.paymentEvent.updateMany({ where: { gateway: "paypal", providerEventId }, data: { processed: true } });
      return NextResponse.json({ received: true, duplicate: duplicateEvent, ...result });
    }

    if (eventType === "PAYMENT.SALE.COMPLETED" && subscriptionId) {
      const result = await renewSubscription(subscriptionId, event);
      await prisma.paymentEvent.updateMany({ where: { gateway: "paypal", providerEventId }, data: { processed: true } });
      return NextResponse.json({ received: true, duplicate: duplicateEvent, ...result });
    }

    if (["BILLING.SUBSCRIPTION.CANCELLED", "BILLING.SUBSCRIPTION.SUSPENDED", "BILLING.SUBSCRIPTION.EXPIRED"].includes(eventType) && subscriptionId) {
      const nextStatus = eventType.endsWith("EXPIRED") ? "expired" : eventType.endsWith("SUSPENDED") ? "suspended" : "cancelled";
      const result = await markSubscription(subscriptionId, nextStatus);
      await prisma.paymentEvent.updateMany({ where: { gateway: "paypal", providerEventId }, data: { processed: true } });
      return NextResponse.json({ received: true, duplicate: duplicateEvent, ...result });
    }

    if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED" && subscriptionId) {
      const result = await markSubscription(subscriptionId, "past_due");
      const dbUser = await prisma.user.findFirst({ where: { subscriptionId }, select: { email: true } });
      if (dbUser?.email) {
        await sendPaymentFailedEmail(dbUser.email, {
          purchaseType: "pro",
          orderId: providerEventId,
          reason: "PayPal could not complete your latest Pro renewal payment. Update your payment method to keep uninterrupted access.",
        });
      }
      await prisma.paymentEvent.updateMany({ where: { gateway: "paypal", providerEventId }, data: { processed: true } });
      return NextResponse.json({ received: true, duplicate: duplicateEvent, ...result });
    }

    if (["PAYMENT.CAPTURE.DENIED", "PAYMENT.CAPTURE.DECLINED"].includes(eventType) && providerOrderId) {
      const paymentOrder = await prisma.paymentOrder.findFirst({ where: { gateway: "paypal", providerOrderId } });
      if (paymentOrder) {
        await recordBillingFailure({
          orderId: paymentOrder.id,
          userId: paymentOrder.userId,
          providerPaymentId,
          reason: "PayPal declined this payment. Try again or choose another payment method.",
        });
      }
      await prisma.paymentEvent.updateMany({ where: { gateway: "paypal", providerEventId }, data: { processed: true } });
      return NextResponse.json({ received: true, processed: Boolean(paymentOrder), duplicate: duplicateEvent });
    }

    if (eventType !== "PAYMENT.CAPTURE.COMPLETED" || !providerOrderId) {
      return NextResponse.json({ received: true, processed: false });
    }

    const paymentOrder = await prisma.paymentOrder.findFirst({ where: { gateway: "paypal", providerOrderId } });
    if (!paymentOrder) return NextResponse.json({ received: true, processed: false, reason: "order_not_found" });

    const result = await fulfillBillingOrder({
      orderId: paymentOrder.id,
      providerPaymentId,
      rawMetadata: { verifiedBy: "paypal_webhook", webhookEventId: providerEventId },
    });

    await prisma.paymentEvent.updateMany({ where: { gateway: "paypal", providerEventId }, data: { processed: true } });
    return NextResponse.json({ received: true, processed: true, duplicate: duplicateEvent, alreadyProcessed: result.alreadyProcessed });
  } catch (error) {
    console.error("[Billing] PayPal webhook failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "PayPal webhook failed." }, { status: 500 });
  }
}
