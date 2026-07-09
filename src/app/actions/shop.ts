"use server";

import { getCurrentUserId } from "@/lib/auth";
import { addCredits } from "@/lib/credits";
import Razorpay from "razorpay";
import crypto from "crypto";
import { CheckoutCurrency, getCreditPackageByCredits, getCreditPackagePrice, normalizeCheckoutCurrency } from "@/lib/payment-pricing";
import { prisma } from "@/lib/prisma";
import { PRICING_CONFIG } from "@/config/pricing";

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Payment provider is not configured.");
  }

  return new Razorpay({ key_id, key_secret });
}

export async function createRazorpayOrder(tierId: string, currencyInput: CheckoutCurrency = "USD") {
  if (!PRICING_CONFIG.PAYMENTS_ENABLED) {
    return { success: false, error: PRICING_CONFIG.PAYMENT_UNAVAILABLE_MESSAGE };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const currency = normalizeCheckoutCurrency(currencyInput);
    const packagePrice = getCreditPackagePrice(tierId, currency);

    if (!packagePrice) {
      return { success: false, error: "Invalid credit package selected" };
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: packagePrice.amountMinor,
      currency,
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId,
        packName: `${packagePrice.tier.credits} Credits Pack`,
        tierId: packagePrice.tier.id,
        currency,
      },
    });

    return { success: true, order };
  } catch (err: unknown) {
    console.error("[SHOP] Order creation failed:", err);
    return { success: false, error: "Failed to create order" };
  }
}

export async function verifyRazorpayPayment(
  razorpay_payment_id: string,
  razorpay_order_id: string,
  razorpay_signature: string,
  creditsToAdd: number
) {
  if (!PRICING_CONFIG.PAYMENTS_ENABLED) {
    return { success: false, error: PRICING_CONFIG.PAYMENT_UNAVAILABLE_MESSAGE };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  if (!secret) {
    return { success: false, error: "Payment provider is not configured." };
  }

  const tier = getCreditPackageByCredits(creditsToAdd);
  if (!tier) {
    return { success: false, error: "Invalid credit package." };
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return { success: false, error: "Invalid payment signature" };
  }

  const razorpay = getRazorpayClient();
  const [order, payment] = await Promise.all([
    razorpay.orders.fetch(razorpay_order_id),
    razorpay.payments.fetch(razorpay_payment_id),
  ]);

  const orderNotes = (order.notes || {}) as Record<string, string | undefined>;
  const currency = normalizeCheckoutCurrency(String(order.currency || orderNotes.currency || "USD"));
  const expectedPrice = getCreditPackagePrice(tier.id, currency);

  if (!expectedPrice) {
    return { success: false, error: "Invalid credit package price." };
  }

  if (orderNotes.userId && orderNotes.userId !== userId) {
    return { success: false, error: "This payment order does not belong to your account." };
  }

  if (payment.order_id !== razorpay_order_id) {
    return { success: false, error: "Payment does not belong to this order." };
  }

  if (!["captured", "authorized"].includes(String(payment.status))) {
    return { success: false, error: "Payment is not completed yet." };
  }

  if (Number(order.amount) !== expectedPrice.amountMinor || Number(payment.amount) !== expectedPrice.amountMinor) {
    return { success: false, error: "Payment amount does not match the selected package." };
  }

  const existingTransaction = await prisma.paymentTransaction.findUnique({
    where: { providerPaymentId: razorpay_payment_id },
  });
  if (existingTransaction) {
    return { success: true, duplicate: true };
  }

  // Add credits to user
  const result = await addCredits(userId, creditsToAdd, `Shop purchase: ${creditsToAdd} credits`);
  
  if (!result.success) {
    return { success: false, error: "Failed to add credits to your account" };
  }

  await prisma.paymentTransaction.create({
    data: {
      providerPaymentId: razorpay_payment_id,
      providerOrderId: razorpay_order_id,
      userId,
      kind: "credits",
      amount: expectedPrice.amountMinor,
      currency,
      metadata: {
        credits: creditsToAdd,
        source: "shop",
      },
    },
  });

  return { success: true };
}
