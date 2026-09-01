import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export type GiftType = "pro_monthly" | "pro_yearly" | "credits";

export interface GiftMetadata {
  isGift: boolean;
  giftType: GiftType;
  giftCredits?: number;
  buyerUserId: string;
  buyerEmail?: string;
  recipientName?: string;
  recipientMessage?: string;
  giftCode?: string;
}

/**
 * Generates a clean, cryptographically secure human-readable 1-time gift code.
 * Format: GIFT-[PRO30|PRO365|500CR|1000CR]-[4CHARS]-[4CHARS]
 */
export function generateGiftCode(giftType: GiftType, credits = 0): string {
  let prefix = "GIFT";
  if (giftType === "pro_monthly") {
    prefix = "GIFT-PRO30";
  } else if (giftType === "pro_yearly") {
    prefix = "GIFT-PRO365";
  } else {
    prefix = `GIFT-${credits || 500}CR`;
  }

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // unambiguous characters (no 0, O, 1, I)
  const randomBytes = crypto.randomBytes(8);
  
  let part1 = "";
  let part2 = "";
  
  for (let i = 0; i < 4; i++) {
    part1 += chars[randomBytes[i] % chars.length];
  }
  for (let i = 4; i < 8; i++) {
    part2 += chars[randomBytes[i] % chars.length];
  }

  return `${prefix}-${part1}-${part2}`;
}

/**
 * Registers a unique single-use gift voucher promo code in database.
 */
export async function createGiftVoucherRecord(options: {
  code: string;
  giftType: GiftType;
  credits?: number;
  buyerUserId: string;
  recipientName?: string;
  recipientMessage?: string;
}) {
  const { code, giftType, credits = 0 } = options;
  const cleanCode = code.trim().toUpperCase();

  // One-year expiration for gift vouchers
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const bonusCredits = giftType === "credits" ? credits : 0;

  const promo = await prisma.promoCode.create({
    data: {
      code: cleanCode,
      bonusCredits,
      maxRedemptions: 1,
      redemptionCount: 0,
      expiresAt,
    },
  });

  return promo;
}

/**
 * Fetches all gift vouchers purchased by a specific user.
 */
export async function getUserPurchasedGifts(userId: string) {
  const orders = await prisma.paymentOrder.findMany({
    where: {
      userId,
      status: "paid",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      planId: true,
      amount: true,
      currency: true,
      createdAt: true,
      metadata: true,
    },
  });

  const giftOrders = orders.filter((order) => {
    const meta = (order.metadata as Record<string, any>) || {};
    return meta.isGift === true && Boolean(meta.giftCode);
  });

  if (giftOrders.length === 0) return [];

  const giftCodes = giftOrders.map((o) => ((o.metadata as Record<string, any>).giftCode as string).toUpperCase());

  // Check redemptions from DB
  const promos = await prisma.promoCode.findMany({
    where: {
      code: { in: giftCodes },
    },
    include: {
      redemptions: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const promoMap = new Map(promos.map((p) => [p.code.toUpperCase(), p]));

  return giftOrders.map((order) => {
    const meta = (order.metadata as Record<string, any>) || {};
    const code = (meta.giftCode as string).toUpperCase();
    const promo = promoMap.get(code);

    const isRedeemed = Boolean(promo && promo.redemptionCount >= 1);
    const redeemedBy = promo?.redemptions?.[0]?.user?.name || promo?.redemptions?.[0]?.user?.email || null;
    const redeemedAt = promo?.redemptions?.[0]?.redeemedAt || null;

    return {
      orderId: order.id,
      giftCode: code,
      giftType: meta.giftType || (order.planId.startsWith("pro") ? "pro" : "credits"),
      planId: order.planId,
      credits: meta.giftCredits || order.planId,
      recipientName: meta.recipientName || null,
      recipientMessage: meta.recipientMessage || null,
      purchasedAt: order.createdAt,
      isRedeemed,
      redeemedBy,
      redeemedAt,
      expiresAt: promo?.expiresAt || null,
    };
  });
}
