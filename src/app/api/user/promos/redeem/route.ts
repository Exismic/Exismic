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
    const { code, verifyOnly } = body;

    if (!code?.trim()) {
      return NextResponse.json({ error: "Promo or voucher code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Fetch promo details
    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (!promo) {
      return NextResponse.json({ error: "Invalid or non-existent voucher code" }, { status: 404 });
    }

    // 2. Validate expiration date
    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
      return NextResponse.json({ error: "This voucher code has expired" }, { status: 400 });
    }

    // 3. Validate overall usage limits
    if (promo.redemptionCount >= promo.maxRedemptions) {
      return NextResponse.json({ error: "This voucher code has already been claimed" }, { status: 400 });
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
      return NextResponse.json({ error: "You have already redeemed this code" }, { status: 400 });
    }

    // Guard: Prevent burning real-money checkout discount vouchers in the free promo code box
    if (cleanCode.startsWith("OFF") || cleanCode.startsWith("SAVE")) {
      return NextResponse.json(
        {
          error: "This is a Shop checkout voucher! Apply this code during checkout in the Shop on purchases of $3.00 (₹249) or more to get ₹100 / $1.50 off.",
        },
        { status: 400 }
      );
    }

    if (cleanCode.startsWith("PRO20")) {
      return NextResponse.json(
        {
          error: "This is a 20% discount coupon for Monthly Pro! Apply this code during checkout in the Shop when upgrading to Monthly Exismic Pro.",
        },
        { status: 400 }
      );
    }

    // Detect Reward Voucher Type
    const isPro365d = cleanCode.includes("PRO365") || cleanCode.includes("PRO-365") || cleanCode.includes("PRO1Y") || cleanCode.includes("PROYEAR");
    const isPro30d = cleanCode.includes("PRO30") || cleanCode.includes("PRO-30") || cleanCode.includes("PRO1M") || cleanCode.includes("PROMONTH");
    const isPro7d = cleanCode.includes("PRO7D") || cleanCode.includes("PRO-7D") || cleanCode.includes("PRO1W");
    const isPro24h = cleanCode.includes("PRO24H") || cleanCode.includes("PRO-24H") || cleanCode.includes("PRO1D");
    const isBadge = cleanCode.includes("BADGE") || cleanCode.includes("COSMIC");

    let rewardMessage = "";
    let rewardType: "credits" | "pro" | "badge" = "credits";
    let rewardTitle = `+${promo.bonusCredits} Generation Credits`;
    let rewardDescription = "Bonus credits added directly to your Vault with zero expiration cooldown.";
    let rewardValue = promo.bonusCredits;

    if (isPro365d || isPro30d || isPro7d || isPro24h) {
      rewardType = "pro";
      if (isPro365d) {
        rewardTitle = "1-Year Exismic Pro Pass";
        rewardDescription = "365 days of full Pro access, 500 daily credits, and all VIP creator tools.";
        rewardValue = 8760;
      } else if (isPro30d) {
        rewardTitle = "30-Day Exismic Pro Pass";
        rewardDescription = "30 days of full Pro access, 500 daily credits, and all VIP creator tools.";
        rewardValue = 720;
      } else if (isPro7d) {
        rewardTitle = "7-Day Exismic Pro Pass";
        rewardDescription = "7 days of full Pro access, 500 daily credits, and all VIP creator tools.";
        rewardValue = 168;
      } else {
        rewardTitle = "24-Hour Exismic Pro Pass";
        rewardDescription = "24 hours of full Pro access, 500 daily credits, and all VIP creator tools.";
        rewardValue = 24;
      }
    } else if (isBadge) {
      rewardType = "badge";
      rewardTitle = "Cosmic Star Profile Badge";
      rewardDescription = "Exclusive animated profile badge and name style in your closet.";
    }

    // If only verifying, return reward preview without mutating state
    if (verifyOnly) {
      return NextResponse.json({
        success: true,
        valid: true,
        code: cleanCode,
        rewardType,
        rewardTitle,
        rewardDescription,
        rewardValue,
        expiresAt: promo.expiresAt,
      });
    }

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
