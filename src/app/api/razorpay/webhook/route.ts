import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRICING_CONFIG } from "@/config/pricing";
import { getCreditPackagePrice, getProPrice, normalizeCheckoutCurrency } from "@/lib/payment-pricing";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: { entity?: Record<string, unknown> };
    order?: { entity?: Record<string, unknown> };
    subscription?: { entity?: Record<string, unknown> };
  };
};

function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

function getNotes(entity?: Record<string, unknown>) {
  const notes = entity?.notes;
  return notes && typeof notes === "object" ? notes as Record<string, string | undefined> : {};
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 503 });
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const event = payload.event || "";
    const payment = payload.payload?.payment?.entity;
    const order = payload.payload?.order?.entity;
    const subscription = payload.payload?.subscription?.entity;

    if (event === "subscription.cancelled" && subscription?.id) {
      await prisma.user.updateMany({
        where: { subscriptionId: String(subscription.id) },
        data: {
          subscriptionStatus: "cancelled",
          planExpiresAt: subscription.end_at ? new Date(Number(subscription.end_at) * 1000) : undefined,
        },
      });
      return NextResponse.json({ success: true });
    }

    if (event === "payment.captured" || event === "order.paid") {
      const notes = { ...getNotes(order), ...getNotes(payment) };
      const userId = notes.userId;
      const plan = notes.plan === "credits" ? "credits" : "pro";
      const currency = normalizeCheckoutCurrency(String(payment?.currency || order?.currency || "USD"));
      const amount = Number(payment?.amount || order?.amount || 0);
      const providerPaymentId = String(payment?.id || "");
      const providerOrderId = String(payment?.order_id || order?.id || "");

      if (!userId) return NextResponse.json({ success: true, ignored: "missing-user" });
      if (!providerPaymentId) return NextResponse.json({ success: true, ignored: "missing-payment-id" });

      const existingTransaction = await prisma.paymentTransaction.findUnique({
        where: { providerPaymentId },
      });
      if (existingTransaction) return NextResponse.json({ success: true, duplicate: true });

      if (plan === "credits") {
        const packagePrice = getCreditPackagePrice(notes.tierId, currency);
        if (!packagePrice || packagePrice.amountMinor !== amount) {
          return NextResponse.json({ success: true, ignored: "amount-mismatch" });
        }
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { lifetimeCredits: { increment: packagePrice.tier.credits } },
          }),
          prisma.creditTransaction.create({
            data: {
              userId,
              amount: packagePrice.tier.credits,
              balanceType: "permanent",
              transactionType: "purchase",
              description: `Purchased ${packagePrice.tier.credits} permanent credits`,
              metadata: { tierId: packagePrice.tier.id, providerPaymentId, providerOrderId, event },
            },
          }),
          prisma.paymentTransaction.create({
            data: {
              providerPaymentId,
              providerOrderId,
              userId,
              kind: "credits",
              amount,
              currency,
              metadata: { tierId: packagePrice.tier.id, credits: packagePrice.tier.credits, event },
            },
          }),
        ]);
      } else {
        const proPrice = getProPrice(currency);
        if (proPrice.amountMinor !== amount) {
          return NextResponse.json({ success: true, ignored: "amount-mismatch" });
        }
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: {
              plan: "pro",
              subscriptionStatus: "active",
              subscriptionId: String(payment?.subscription_id || order?.id || payment?.order_id || ""),
              planExpiresAt: nextBillingDate,
              aiGenerationsLimit: 1000,
              dailyCredits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS,
            },
          }),
          prisma.paymentTransaction.create({
            data: {
              providerPaymentId,
              providerOrderId,
              userId,
              kind: "pro",
              amount,
              currency,
              metadata: { planExpiresAt: nextBillingDate.toISOString(), event },
            },
          }),
        ]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Razorpay webhook] Failed:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
