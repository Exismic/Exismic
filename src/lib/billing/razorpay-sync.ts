import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { PRICING_CONFIG } from "@/config/pricing";

function getRazorpayClient(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
}

/**
 * Synchronizes user subscription status with Razorpay in real-time.
 * If payment was not received or the subscription halted/cancelled/expired,
 * downgrades the account cleanly so users do not retain perpetual Pro on failed renewals.
 */
export async function syncUserRazorpaySubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      plan: true,
      subscriptionId: true,
      subscriptionStatus: true,
      planExpiresAt: true,
      dailyCredits: true,
      avatarFrame: true,
      nameGradient: true,
      insignia: true,
      canopy: true,
    },
  });

  if (!user) return null;
  // If user does not have a recurring Razorpay subscription, skip
  if (!user.subscriptionId || !user.subscriptionId.startsWith("sub_")) {
    return user;
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) return user;

  try {
    const sub = await razorpay.subscriptions.fetch(user.subscriptionId);
    const subRecord = sub as unknown as {
      id: string;
      status: string; // 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired'
      current_end?: number;
      charge_at?: number;
      ended_at?: number;
      paid_count?: number;
    };

    const status = String(subRecord.status || "").toLowerCase();
    const endTimestamp = subRecord.current_end || subRecord.charge_at || subRecord.ended_at;
    const periodEnd = endTimestamp ? new Date(endTimestamp * 1000) : null;
    const now = new Date();

    // 1. Subscription is active in Razorpay
    if (status === "active") {
      const newExpiry = periodEnd && periodEnd > now ? periodEnd : user.planExpiresAt;
      if (
        newExpiry &&
        (!user.planExpiresAt ||
          newExpiry.getTime() !== user.planExpiresAt.getTime() ||
          user.plan !== "pro" ||
          user.subscriptionStatus !== "active")
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: "pro",
            subscriptionStatus: "active",
            planExpiresAt: newExpiry,
            dailyCredits: Math.max(user.dailyCredits || 0, PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS),
            aiGenerationsLimit: 1000,
          },
        });
        user.plan = "pro";
        user.subscriptionStatus = "active";
        user.planExpiresAt = newExpiry;
      }
      return user;
    }

    // 2. Subscription is halted, cancelled, completed, or expired
    if (["halted", "cancelled", "completed", "expired"].includes(status)) {
      const isPast = periodEnd ? periodEnd <= now : (user.planExpiresAt ? user.planExpiresAt <= now : true);
      if (isPast) {
        // Access period finished and renewal was NOT received!
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: "free",
            subscriptionStatus: status === "halted" ? "past_due" : status,
            dailyCredits: Math.min(user.dailyCredits || 50, 50),
            aiGenerationsLimit: 50,
            ...(periodEnd ? { planExpiresAt: periodEnd } : {}),
          },
        });

        user.plan = "free";
        user.subscriptionStatus = status === "halted" ? "past_due" : status;
        if (periodEnd) user.planExpiresAt = periodEnd;
      } else {
        // Still within paid cycle until periodEnd
        if (user.subscriptionStatus !== status) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: status,
              ...(periodEnd ? { planExpiresAt: periodEnd } : {}),
            },
          });
          user.subscriptionStatus = status;
          if (periodEnd) user.planExpiresAt = periodEnd;
        }
      }
      return user;
    }

    // 3. Subscription is pending (Razorpay retrying charge)
    if (status === "pending") {
      const gracePeriodCutoff = new Date(Date.now() - 48 * 3600 * 1000);
      const isOverdue = periodEnd ? periodEnd < gracePeriodCutoff : false;
      if (isOverdue) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: "free",
            subscriptionStatus: "past_due",
            dailyCredits: Math.min(user.dailyCredits || 50, 50),
            aiGenerationsLimit: 50,
          },
        });
        user.plan = "free";
        user.subscriptionStatus = "past_due";
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: "past_due" },
        });
        user.subscriptionStatus = "past_due";
      }
      return user;
    }

    return user;
  } catch (err) {
    console.error("[RazorpaySync] Failed to fetch subscription from Razorpay:", err);
    return user;
  }
}
