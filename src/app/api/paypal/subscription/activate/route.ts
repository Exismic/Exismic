import { NextRequest, NextResponse } from "next/server";
import { getPlanPrice } from "@/lib/billing/plans";
import { fulfillBillingOrder } from "@/lib/billing/fulfillment";
import { getPayPalSubscription, parsePayPalCustomId, resolvePayPalProPlanId } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

type ActivateBody = {
  subscriptionId?: string;
};

function fallbackNextBillingDate() {
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  return nextBillingDate;
}

function resolveNextBillingDate(subscription: Awaited<ReturnType<typeof getPayPalSubscription>>) {
  const rawNextBilling = subscription.billing_info?.next_billing_time;
  if (rawNextBilling) {
    const nextBillingDate = new Date(rawNextBilling);
    if (!Number.isNaN(nextBillingDate.getTime())) return nextBillingDate;
  }
  return fallbackNextBillingDate();
}

function amountsMatch(actual: number | null | undefined, expected: number) {
  if (typeof actual !== "number" || !Number.isFinite(actual) || actual <= 0) return true;
  return Math.round(actual * 100) === Math.round(expected * 100);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId } = (await req.json()) as ActivateBody;
    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing PayPal subscription id." }, { status: 400 });
    }

    const existingTransaction = await prisma.paymentTransaction.findUnique({
      where: { providerPaymentId: subscriptionId },
    });

    if (existingTransaction) {
      if (existingTransaction.userId !== user.id) {
        return NextResponse.json({ error: "This PayPal subscription does not belong to your account." }, { status: 403 });
      }
      return NextResponse.json({
        success: true,
        duplicate: true,
        plan: "pro",
        subscriptionId,
        message: "PayPal subscription was already verified.",
      });
    }

    const subscription = await getPayPalSubscription(subscriptionId);
    const customContext = parsePayPalCustomId(subscription.custom_id);

    if (!customContext || customContext.userId !== user.id || customContext.plan !== "pro") {
      console.error("[PayPal] Subscription user mismatch", {
        sessionUserId: user.id,
        customUserId: customContext?.userId,
        subscriptionId,
      });
      return NextResponse.json({ error: "This PayPal subscription does not belong to your account." }, { status: 403 });
    }

    if (String(subscription.status).toUpperCase() !== "ACTIVE") {
      return NextResponse.json({ error: "PayPal subscription is not active yet." }, { status: 400 });
    }

    if (customContext.currency !== "USD") {
      return NextResponse.json({ error: "PayPal subscription currently accepts USD only." }, { status: 400 });
    }

    const proPrice = getPlanPrice("pro", "GLOBAL");
    const expectedPlanId = await resolvePayPalProPlanId(proPrice.amount, "USD");
    if (subscription.plan_id !== expectedPlanId) {
      return NextResponse.json({ error: "PayPal subscription plan does not match Exismic Pro." }, { status: 400 });
    }
    if (Number.isFinite(customContext.amount) && Math.round(customContext.amount * 100) !== proPrice.amountMinor) {
      return NextResponse.json({ error: "PayPal subscription amount does not match Exismic Pro pricing." }, { status: 400 });
    }
    const paidAmount = subscription.billing_info?.last_payment?.amount?.value
      ? Number(subscription.billing_info.last_payment.amount.value)
      : null;
    const paidCurrency = subscription.billing_info?.last_payment?.amount?.currency_code;

    if (paidCurrency && paidCurrency !== "USD") {
      return NextResponse.json({ error: "PayPal subscription currency does not match Exismic Pro pricing." }, { status: 400 });
    }

    if (!amountsMatch(paidAmount, proPrice.amount)) {
      return NextResponse.json({ error: "PayPal subscription amount does not match Exismic Pro pricing." }, { status: 400 });
    }

    const nextBillingDate = resolveNextBillingDate(subscription);
    const paymentOrder = await prisma.paymentOrder.findFirst({
      where: { providerOrderId: subscriptionId, gateway: "paypal", planId: "pro" },
      orderBy: { createdAt: "desc" },
    });
    if (!paymentOrder || paymentOrder.userId !== user.id) {
      return NextResponse.json({ error: "Payment order not found for this account." }, { status: 404 });
    }

    const result = await fulfillBillingOrder({
      orderId: paymentOrder.id,
      providerPaymentId: subscriptionId,
      periodEnd: nextBillingDate,
      rawMetadata: {
        verifiedBy: "paypal_subscription_lookup",
        paypalStatus: subscription.status,
        paypalPlanId: subscription.plan_id,
        nextBillingTime: nextBillingDate.toISOString(),
        lastPayment: subscription.billing_info?.last_payment || null,
      },
    });

    return NextResponse.json({
      success: true,
      plan: "pro",
      subscriptionId,
      nextBillingDate: nextBillingDate.toISOString(),
      alreadyProcessed: result.alreadyProcessed,
    });
  } catch (error) {
    console.error("[PayPal] Subscription activation failed:", error);
    const message = error instanceof Error ? error.message : "Could not verify PayPal subscription.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


