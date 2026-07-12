import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createNotification } from "@/lib/notifications";
import { cancelPayPalSubscription } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay is not configured.");
  }

  return new Razorpay({ key_id, key_secret });
}

function fallbackExpiryDate() {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);
  return expiryDate;
}

type RazorpaySubscriptionLike = {
  end_at?: number;
  current_end?: number;
  charge_at?: number;
};

function resolveRazorpayExpiry(subscription: RazorpaySubscriptionLike) {
  const endAt = subscription.end_at || subscription.current_end || subscription.charge_at;
  if (typeof endAt === "number" && Number.isFinite(endAt)) {
    return new Date(endAt * 1000);
  }
  return fallbackExpiryDate();
}

function resolveLocalExpiry(existingExpiry?: Date | null) {
  if (existingExpiry && existingExpiry > new Date()) return existingExpiry;
  return fallbackExpiryDate();
}

function getProvider(subscriptionId?: string | null) {
  if (!subscriptionId) return "local";
  if (subscriptionId.startsWith("I-")) return "paypal";
  if (subscriptionId.startsWith("sub_")) return "razorpay";
  return "local";
}

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser =
      (await prisma.user.findUnique({ where: { id: user.id } })) ||
      (await prisma.user.findUnique({ where: { email: user.email } }));

    if (!dbUser) {
      return NextResponse.json({ error: "User record not found. Please sync your account and try again." }, { status: 404 });
    }

    const currentPlan = (dbUser.plan || "free").toLowerCase();
    const subscriptionStatus = (dbUser.subscriptionStatus || "none").toLowerCase();

    if (subscriptionStatus === "cancelled") {
      return NextResponse.json({
        success: true,
        message: "Subscription is already cancelled.",
        subscriptionStatus: "cancelled",
        expiryDate: dbUser.planExpiresAt?.toISOString() || null,
        provider: getProvider(dbUser.subscriptionId),
        cancelledFlag: true,
      });
    }

    if (currentPlan !== "pro" && !dbUser.subscriptionId) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 400 });
    }

    const billingOrder = dbUser.subscriptionId
      ? await prisma.paymentOrder.findFirst({
          where: { providerOrderId: dbUser.subscriptionId, planId: "pro" },
          orderBy: { createdAt: "desc" },
          select: { gateway: true },
        })
      : null;
    const provider = billingOrder?.gateway === "paypal" || billingOrder?.gateway === "razorpay"
      ? billingOrder.gateway
      : getProvider(dbUser.subscriptionId);
    let providerCancelled = false;
    let expiryDate = resolveLocalExpiry(dbUser.planExpiresAt);

    if (provider === "paypal" && dbUser.subscriptionId) {
      try {
        await cancelPayPalSubscription(dbUser.subscriptionId);
        providerCancelled = true;
      } catch (error) {
        console.error("[PayPal] Subscription cancel failed:", error);
        return NextResponse.json({ error: "PayPal could not confirm the cancellation. Your subscription was not changed; please try again." }, { status: 502 });
      }
    }

    if (provider === "razorpay" && dbUser.subscriptionId) {
      try {
        const razorpay = getRazorpayClient();
        const subscription = await razorpay.subscriptions.cancel(dbUser.subscriptionId, true);
        expiryDate = resolveRazorpayExpiry(subscription as RazorpaySubscriptionLike);
        providerCancelled = true;
      } catch (error) {
        console.error("[Razorpay] Subscription cancel failed:", error);
        return NextResponse.json({ error: "Razorpay could not confirm the cancellation. Your subscription was not changed; please try again." }, { status: 502 });
      }
    }

    if (provider === "local") providerCancelled = true;

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        subscriptionStatus: "cancelled",
        planExpiresAt: expiryDate,
      },
    });

    await prisma.userBilling.upsert({
      where: { userId: dbUser.id },
      update: {
        status: "cancelled",
        currentPeriodEnd: expiryDate,
      },
      create: {
        userId: dbUser.id,
        planId: "pro",
        status: "cancelled",
        currentPeriodEnd: expiryDate,
      },
    });

    createNotification(
      updatedUser.id,
      "Subscription cancelled",
      `Your Pro plan has been cancelled. You will keep Pro access until ${expiryDate.toLocaleDateString()}.`,
      "warning",
    ).catch((notificationError) => {
      console.error("Cancellation notification failed:", notificationError);
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully.",
      subscriptionStatus: updatedUser.subscriptionStatus,
      expiryDate: updatedUser.planExpiresAt?.toISOString() || expiryDate.toISOString(),
      provider,
      providerCancelled,
      cancelledFlag: true,
    });
  } catch (error: unknown) {
    console.error("Cancellation error:", error);
    const message = error instanceof Error ? error.message : "Failed to cancel subscription.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
