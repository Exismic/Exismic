import { prisma } from "@/lib/prisma";
import { PRICING_CONFIG, isLaunchPromoActive } from "@/config/pricing";

export type LaunchDiscountEligibility = {
  eligible: boolean;
  reason?: string;
  code: string;
  expiresAt: string;
  prices: {
    USD: number;
    INR: number;
    regularUSD: number;
    regularINR: number;
    discountUSD: number;
    discountINR: number;
  };
};

export async function checkUserLaunchDiscountEligibility(userId?: string | null): Promise<LaunchDiscountEligibility> {
  const promo = PRICING_CONFIG.V16_LAUNCH_PROMO;
  const regular = PRICING_CONFIG.PRO_PLAN;

  const baseResponse: LaunchDiscountEligibility = {
    eligible: false,
    code: promo.CODE,
    expiresAt: promo.EXPIRES_AT,
    prices: {
      USD: promo.DISCOUNTED_PRICE_USD,
      INR: promo.DISCOUNTED_PRICE_INR,
      regularUSD: regular.USD,
      regularINR: regular.INR,
      discountUSD: promo.DISCOUNT_AMOUNT_USD,
      discountINR: promo.DISCOUNT_AMOUNT_INR,
    },
  };

  if (!isLaunchPromoActive()) {
    return {
      ...baseResponse,
      eligible: false,
      reason: "The v1.6 Launch Special promotional period has concluded.",
    };
  }

  if (!userId) {
    // Guest or unauthenticated user: conditionally eligible until they sign in
    return {
      ...baseResponse,
      eligible: true,
    };
  }

  try {
    // 1. Check if user already has a successful order with the launch discount (self or gift)
    const existingOrder = await prisma.paymentOrder.findFirst({
      where: {
        userId,
        status: { in: ["paid", "completed", "active"] },
        OR: [
          { metadata: { path: ["isLaunchDiscount"], equals: true } },
          { metadata: { path: ["appliedCouponCode"], equals: promo.CODE } },
        ],
      },
    });

    if (existingOrder) {
      return {
        ...baseResponse,
        eligible: false,
        reason: "You have already redeemed your one-time v1.6 Launch Special discount.",
      };
    }

    // 2. Check if user has redeemed promo in promoRedemption table
    const promoRecord = await prisma.promoCode.findUnique({
      where: { code: promo.CODE },
      select: { id: true },
    });

    if (promoRecord) {
      const existingClaim = await prisma.promoRedemption.findUnique({
        where: {
          promoId_userId: {
            promoId: promoRecord.id,
            userId,
          },
        },
      });

      if (existingClaim) {
        return {
          ...baseResponse,
          eligible: false,
          reason: "You have already redeemed your one-time v1.6 Launch Special discount.",
        };
      }
    }

    return {
      ...baseResponse,
      eligible: true,
    };
  } catch (error) {
    console.error("[LaunchDiscount] Error checking eligibility:", error);
    return {
      ...baseResponse,
      eligible: false,
      reason: "Could not verify discount eligibility.",
    };
  }
}
