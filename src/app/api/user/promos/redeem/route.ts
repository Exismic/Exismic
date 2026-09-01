import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Please sign in to redeem promo codes." }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code?.trim()) {
      return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Fetch promo details
    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (!promo) {
      return NextResponse.json({ error: "Invalid or non-existent promo code" }, { status: 404 });
    }

    // 2. Validate expiration date
    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
      return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
    }

    // 3. Validate overall usage limits
    if (promo.redemptionCount >= promo.maxRedemptions) {
      return NextResponse.json({ error: "This promo code has already been fully claimed" }, { status: 400 });
    }

    // 4. Check if user already claimed this specific voucher
    const alreadyRedeemed = await prisma.promoRedemption.findUnique({
      where: {
        promoId_userId: {
          promoId: promo.id,
          userId: authUser.id,
        },
      },
    });

    if (alreadyRedeemed) {
      return NextResponse.json({ error: "You have already redeemed this promo code" }, { status: 400 });
    }

    // Detect Reward Voucher Type
    const isPro365d = cleanCode.includes("PRO365") || cleanCode.includes("PRO-365") || cleanCode.includes("PRO1Y") || cleanCode.includes("PROYEAR");
    const isPro30d = cleanCode.includes("PRO30") || cleanCode.includes("PRO-30") || cleanCode.includes("PRO1M") || cleanCode.includes("PROMONTH");
    const isPro7d = cleanCode.includes("PRO7D") || cleanCode.includes("PRO-7D") || cleanCode.includes("PRO1W");
    const isPro24h = cleanCode.includes("PRO24H") || cleanCode.includes("PRO-24H") || cleanCode.includes("PRO1D");
    const isBadge = cleanCode.includes("BADGE") || cleanCode.includes("COSMIC");

    let rewardMessage = "";
    let rewardType: "credits" | "pro" | "badge" = "credits";
    let rewardValue = promo.bonusCredits;

    // 5. Execute transaction: Increment redemptions, write redemption mapping, award reward
    await prisma.$transaction(async (tx) => {
      // Atomic increment with strict capacity check
      const updateResult = await tx.promoCode.updateMany({
        where: { 
          id: promo.id,
          redemptionCount: { lt: promo.maxRedemptions }
        },
        data: { redemptionCount: { increment: 1 } },
      });

      if (updateResult.count === 0) {
        throw new Error("This voucher code has already been claimed and cannot be used again.");
      }

      // Create redemption mapping
      await tx.promoRedemption.create({
        data: {
          promoId: promo.id,
          userId: authUser.id,
        },
      });

      const dbUser = await tx.user.findUnique({ where: { id: authUser.id } });
      const now = new Date();

      if (isPro365d || isPro30d || isPro7d || isPro24h) {
        rewardType = "pro";
        let hoursToAdd = 24;
        if (isPro7d) hoursToAdd = 168;
        if (isPro30d) hoursToAdd = 720;
        if (isPro365d) hoursToAdd = 8760;
        rewardValue = hoursToAdd;

        let currentExpiry = dbUser?.planExpiresAt ? new Date(dbUser.planExpiresAt) : now;
        if (currentExpiry.getTime() < now.getTime()) {
          currentExpiry = now;
        }

        const newExpiry = new Date(currentExpiry.getTime() + hoursToAdd * 60 * 60 * 1000);

        await tx.user.update({
          where: { id: authUser.id },
          data: {
            plan: "pro",
            planExpiresAt: newExpiry,
            subscriptionStatus: "promo_pro",
            dailyCredits: 500,
          },
        });

        rewardMessage = isPro365d
          ? "Unlocked 1-Year Exismic Pro Membership!"
          : isPro30d
          ? "Unlocked 1-Month Exismic Pro Pass!"
          : isPro7d
          ? "Unlocked 7-Day Exismic Pro Pass!"
          : "Unlocked 24-Hour Exismic Pro Pass!";
      } else if (isBadge) {
        rewardType = "badge";
        await tx.user.update({
          where: { id: authUser.id },
          data: {
            avatarFrame: "gold",
            nameGradient: "cosmic-gold",
          },
        });
        rewardMessage = "Unlocked Cosmic Star Profile Badge & Aura!";
      } else {
        // Standard Bonus Credits
        rewardType = "credits";
        await tx.user.update({
          where: { id: authUser.id },
          data: {
            bonusCredits: { increment: promo.bonusCredits },
            lifetimeCredits: { increment: promo.bonusCredits },
          },
        });

        await tx.creditTransaction.create({
          data: {
            userId: authUser.id,
            amount: promo.bonusCredits,
            balanceType: "bonus",
            transactionType: "voucher_redemption",
            description: `Redeemed gift voucher: ${promo.code}`,
          },
        });

        rewardMessage = `Claimed +${promo.bonusCredits} generation credits!`;
      }
    });

    // Send notification
    await createNotification(
      authUser.id,
      "Reward Code Redeemed!",
      `Successfully claimed ${rewardMessage} using code ${cleanCode}!`,
      "success"
    );

    return NextResponse.json({
      success: true,
      rewardType,
      rewardValue,
      message: rewardMessage,
      code: cleanCode,
    });
  } catch (error) {
    console.error("[PROMO_REDEEM_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
