import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { fulfillBillingOrder } from "@/lib/billing/fulfillment";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

type VerifyBody = {
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured.");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function dateFromUnix(value: unknown) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const date = new Date(seconds * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as VerifyBody;
    const { razorpay_order_id, razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = body;
    const providerCheckoutId = razorpay_subscription_id || razorpay_order_id;
    if (!providerCheckoutId || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing Razorpay verification fields." }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ error: "Razorpay is not configured." }, { status: 500 });

    const paymentOrder = await prisma.paymentOrder.findFirst({
      where: { providerOrderId: providerCheckoutId, gateway: "razorpay" },
    });

    if (!paymentOrder || paymentOrder.userId !== user.id) {
      return NextResponse.json({ error: "Payment order not found for this account." }, { status: 404 });
    }

    const signaturePayload = razorpay_subscription_id
      ? `${razorpay_payment_id}|${providerCheckoutId}`
      : `${providerCheckoutId}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", secret).update(signaturePayload).digest("hex");
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(razorpay_signature);
    const valid = expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!valid) {
      await prisma.paymentOrder.update({ where: { id: paymentOrder.id }, data: { status: "failed", providerPaymentId: razorpay_payment_id } });
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const paymentRecord = payment as unknown as Record<string, unknown>;
    const paymentStatus = String(payment.status || "").toLowerCase();
    if (paymentStatus !== "captured") {
      return NextResponse.json({ error: "Razorpay payment is not completed yet." }, { status: 400 });
    }
    if (Number(payment.amount) !== paymentOrder.amount || String(payment.currency) !== paymentOrder.currency) {
      return NextResponse.json({ error: "Payment amount or currency does not match this order." }, { status: 400 });
    }

    let periodEnd: Date | null = null;
    if (razorpay_subscription_id) {
      if (String(paymentRecord.subscription_id || "") !== providerCheckoutId) {
        return NextResponse.json({ error: "Payment does not belong to this subscription." }, { status: 400 });
      }
      const subscription = await razorpay.subscriptions.fetch(providerCheckoutId);
      const subscriptionRecord = subscription as unknown as Record<string, unknown>;
      periodEnd = dateFromUnix(subscriptionRecord.current_end) || dateFromUnix(subscriptionRecord.charge_at);
    } else if (String(payment.order_id || "") !== providerCheckoutId) {
      return NextResponse.json({ error: "Payment does not belong to this order." }, { status: 400 });
    }

    const result = await fulfillBillingOrder({
      orderId: paymentOrder.id,
      providerPaymentId: razorpay_payment_id,
      periodEnd,
      rawMetadata: { verifiedBy: "checkout_success", razorpaySignature: "verified", razorpayOrderId: razorpay_order_id || null, razorpaySubscriptionId: razorpay_subscription_id || null },
    });

    return NextResponse.json({ success: true, alreadyProcessed: result.alreadyProcessed, orderId: paymentOrder.id });
  } catch (error) {
    console.error("[Billing] Razorpay verify failed:", error);
    const message = process.env.NODE_ENV === "production"
      ? "Could not verify Razorpay payment. Please contact support if you were charged."
      : error instanceof Error ? error.message : "Could not verify Razorpay payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

