import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
    }

    // 2. Validate expiration date
    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
      return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
    }

    // 3. Validate overall usage limits
    if (promo.redemptionCount >= promo.maxRedemptions) {
      return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 });
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

    // 5. Execute transaction: Increment redemptions, write redemption mapping, award credits
    await prisma.$transaction(async (tx) => {
      // Increment redemption count
      await tx.promoCode.update({
        where: { id: promo.id },
        data: { redemptionCount: { increment: 1 } },
      });

      // Create redemption mapping
      await tx.promoRedemption.create({
        data: {
          promoId: promo.id,
          userId: authUser.id,
        },
      });

      // Award credits to user
      await tx.user.update({
        where: { id: authUser.id },
        data: {
          bonusCredits: { increment: promo.bonusCredits },
          lifetimeCredits: { increment: promo.bonusCredits },
        },
      });

      // Write credit transaction log
      await tx.creditTransaction.create({
        data: {
          userId: authUser.id,
          amount: promo.bonusCredits,
          balanceType: "bonus",
          transactionType: "voucher_redemption",
          description: `Redeemed promo code: ${promo.code}`,
        },
      });
    });

    // Send dashboard notification
    await createNotification(
      authUser.id,
      "Voucher Redeemed!",
      `Successfully claimed +${promo.bonusCredits} bonus credits using code ${promo.code}!`,
      "success"
    );

    return NextResponse.json({
      success: true,
      bonusCredits: promo.bonusCredits,
    });
  } catch (error) {
    console.error("[PROMO_REDEEM_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
