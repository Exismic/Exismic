import { prisma } from "./prisma";
import { SPARKS_SHOP_ITEMS, SparksShopItem, FREE_SPARKS_GIFT_EXPIRES_AT } from "@/config/sparks-shop";

export interface UserSparksProfile {
  userId: string;
  sparks: number;
  lifetimeSparks: number;
  unlockedAvatarFrames: string[];
  unlockedNameGradients: string[];
  unlockedInsignias: string[];
  unlockedCanopies: string[];
  activeAvatarFrame: string | null;
  activeNameGradient: string | null;
  activeInsignia: string | null;
  activeCanopy: string | null;
  plan: string;
  planExpiresAt: Date | null;
  dailyCredits: number;
  bonusCredits: number;
  lifetimeCredits: number;
  streakShields?: number;
  dailyStreak?: number;
  voucherCooldowns?: Record<string, { availableAt: string; remainingMs: number; lastPurchasedAt: string }>;
  hasClaimedFreeSparks?: boolean;
}

/**
 * Retrieves the complete Sparks treasury profile for a user.
 */
export async function getUserSparksData(userId: string): Promise<UserSparksProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        sparks: true,
        lifetimeSparks: true,
        unlockedAvatarFrames: true,
        unlockedNameGradients: true,
        unlockedInsignias: true,
        unlockedCanopies: true,
        avatarFrame: true,
        nameGradient: true,
        insignia: true,
        canopy: true,
        plan: true,
        planExpiresAt: true,
        dailyCredits: true,
        bonusCredits: true,
        lifetimeCredits: true,
        streakShields: true,
        dailyStreak: true,
      },
    });

    if (!user) return null;

    const rawFrames = user.unlockedAvatarFrames;
    const unlockedAvatarFrames: string[] = Array.isArray(rawFrames)
      ? (rawFrames as unknown as string[])
      : [];

    const rawGradients = user.unlockedNameGradients;
    const unlockedNameGradients: string[] = Array.isArray(rawGradients)
      ? (rawGradients as unknown as string[])
      : [];

    const rawInsignias = user.unlockedInsignias;
    const unlockedInsignias: string[] = Array.isArray(rawInsignias)
      ? (rawInsignias as unknown as string[])
      : [];

    const rawCanopies = user.unlockedCanopies;
    const unlockedCanopies: string[] = Array.isArray(rawCanopies)
      ? (rawCanopies as unknown as string[])
      : [];

    // Calculate 7-day cooldown for shop vouchers
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentVoucherSpends = await prisma.sparksTransaction.findMany({
      where: {
        userId,
        source: "shop_redemption",
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, metadata: true },
      orderBy: { createdAt: "desc" },
    });

    const voucherCooldowns: Record<string, { availableAt: string; remainingMs: number; lastPurchasedAt: string }> = {};
    for (const spend of recentVoucherSpends) {
      const meta = spend.metadata as Record<string, unknown> | null;
      if (meta?.itemId && (meta?.itemType === "shop_voucher" || String(meta?.itemId).startsWith("voucher_"))) {
        const iId = String(meta.itemId);
        if (!voucherCooldowns[iId]) {
          const availableAt = new Date(spend.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
          const remainingMs = Math.max(0, availableAt.getTime() - Date.now());
          if (remainingMs > 0) {
            voucherCooldowns[iId] = {
              availableAt: availableAt.toISOString(),
              remainingMs,
              lastPurchasedAt: spend.createdAt.toISOString(),
            };
          }
        }
      }
    }

    // Check if user has already claimed the 100 free sparks gift
    const freeSparksClaim = await prisma.sparksTransaction.findFirst({
      where: {
        userId,
        OR: [
          { source: "free_gift_100" },
          { metadata: { path: ["itemId"], equals: "sparks_free_gift_100" } },
        ],
      },
      select: { id: true },
    });
    const hasClaimedFreeSparks = !!freeSparksClaim;

    return {
      userId: user.id,
      sparks: user.sparks ?? 0,
      lifetimeSparks: user.lifetimeSparks ?? 0,
      unlockedAvatarFrames,
      unlockedNameGradients,
      unlockedInsignias,
      unlockedCanopies,
      activeAvatarFrame: user.avatarFrame,
      activeNameGradient: user.nameGradient,
      activeInsignia: user.insignia,
      activeCanopy: user.canopy,
      plan: user.plan || "free",
      planExpiresAt: user.planExpiresAt,
      dailyCredits: user.dailyCredits,
      bonusCredits: user.bonusCredits,
      lifetimeCredits: user.lifetimeCredits,
      streakShields: user.streakShields ?? 0,
      dailyStreak: user.dailyStreak ?? 0,
      voucherCooldowns,
      hasClaimedFreeSparks,
    };
  } catch (err) {
    console.error("[SPARKS] getUserSparksData error:", err);
    return null;
  }
}

/**
 * Credits Sparks to a user's account and records a transparent ledger transaction.
 */
export async function addSparks(
  userId: string,
  amount: number,
  source: string,
  description: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string; balance?: number; lifetime?: number }> {
  if (amount <= 0) return { success: false, error: "Invalid Sparks amount" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          sparks: { increment: amount },
          lifetimeSparks: { increment: amount },
        },
        select: {
          sparks: true,
          lifetimeSparks: true,
        },
      });

      await tx.sparksTransaction.create({
        data: {
          userId,
          amount,
          balanceAfter: updatedUser.sparks,
          source,
          description,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        },
      });

      return updatedUser;
    });

    return {
      success: true,
      balance: result.sparks,
      lifetime: result.lifetimeSparks,
    };
  } catch (err) {
    console.error("[SPARKS] addSparks error:", err);
    return { success: false, error: "Failed to add Sparks" };
  }
}

/**
 * Atomically redeems a shop item using Exismic Sparks.
 * Grants instant Pro time passes, compute credits, or permanent cosmetics.
 */
export async function redeemSparksShopItem(
  userId: string,
  itemId: string
): Promise<{
  success: boolean;
  error?: string;
  item?: SparksShopItem;
  remainingSparks?: number;
  details?: Record<string, unknown>;
}> {
  const item = SPARKS_SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) {
    return { success: false, error: "Unknown shop item selected" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          sparks: true,
          lifetimeSparks: true,
          unlockedAvatarFrames: true,
          unlockedNameGradients: true,
          unlockedInsignias: true,
          unlockedCanopies: true,
          plan: true,
          planExpiresAt: true,
          dailyCredits: true,
          bonusCredits: true,
          lifetimeCredits: true,
          streakShields: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const currentSparks = user.sparks ?? 0;
      if (currentSparks < item.costSparks) {
        throw new Error(`Insufficient Sparks! You need ${item.costSparks} ⚡ (you have ${currentSparks} ⚡).`);
      }

      // 1. Calculate next Sparks balance
      let newSparksBalance = currentSparks - item.costSparks;

      // 2. Prepare Updates based on Item Type
      const userUpdates: Record<string, unknown> = {
        sparks: newSparksBalance,
      };

      const details: Record<string, unknown> = {};

      if (item.type === "free_sparks" || item.id === "sparks_free_gift_100") {
        if (new Date() > FREE_SPARKS_GIFT_EXPIRES_AT) {
          throw new Error("This limited-time gift has ended.");
        }

        const existingClaim = await tx.sparksTransaction.findFirst({
          where: {
            userId,
            OR: [
              { source: "free_gift_100" },
              { metadata: { path: ["itemId"], equals: "sparks_free_gift_100" } },
            ],
          },
          select: { id: true },
        });

        if (existingClaim) {
          throw new Error("You have already claimed this free gift.");
        }

        const giftSparks = 100;
        newSparksBalance = currentSparks + giftSparks;
        userUpdates.sparks = newSparksBalance;
        userUpdates.lifetimeSparks = (user.lifetimeSparks ?? 0) + giftSparks;

        await tx.notification.create({
          data: {
            userId,
            title: "100 Free Sparks Added!",
            message: "Enjoy your gift! Use your 100 Sparks to unlock avatar frames, glowing names, or streak shields in the shop.",
            type: "reward",
          },
        });

        details.sparksAwarded = giftSparks;
        details.hasClaimedFreeSparks = true;
      } else if (item.type === "streak_shield") {
        const currentShields = user.streakShields ?? 0;
        if (currentShields >= 3) {
          throw new Error("You already have the maximum of 3 Streak Shields active in your vault!");
        }
        const shieldsToAdd = Number(item.value);
        const newShields = Math.min(3, currentShields + shieldsToAdd);
        userUpdates.streakShields = newShields;

        await tx.notification.create({
          data: {
            userId,
            title: `Streak Shield Charged! (${newShields}/3)`,
            message: `You activated ${item.title}. If you ever miss logging in for a day, this shield will automatically prevent your streak from breaking!`,
            type: "reward",
          },
        });

        details.shieldsAwarded = shieldsToAdd;
        details.totalShields = newShields;
      } else if (item.type === "shop_voucher") {
        // Enforce 7-day cooldown per voucher purchase
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentSpends = await tx.sparksTransaction.findMany({
          where: {
            userId,
            source: "shop_redemption",
            createdAt: { gte: sevenDaysAgo },
          },
          select: { id: true, createdAt: true, metadata: true },
          orderBy: { createdAt: "desc" },
        });

        const recentRedemption = recentSpends.find((s) => {
          const meta = s.metadata as Record<string, unknown> | null;
          return meta?.itemId === itemId;
        });

        if (recentRedemption) {
          const elapsed = Date.now() - recentRedemption.createdAt.getTime();
          const remainingMs = Math.max(0, 7 * 24 * 60 * 60 * 1000 - elapsed);
          const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
          const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          throw new Error(
            `Weekly limit reached: This voucher can only be purchased once per week. Restocks in ${days}d ${hours}h.`
          );
        }

        const discountVal = Number(item.value);
        const prefix = discountVal === 20 ? "PRO20" : "OFF100";
        const randomBlock1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const randomBlock2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const voucherCode = `${prefix}-${randomBlock1}-${randomBlock2}`;

        await tx.promoCode.create({
          data: {
            code: voucherCode,
            bonusCredits: discountVal === 20 ? 100 : 50,
            maxRedemptions: 1,
            redemptionCount: 0,
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          },
        });

        await tx.notification.create({
          data: {
            userId,
            title: `Shop Voucher Unlocked: ${voucherCode}`,
            message: `You redeemed ${item.title}! Use code "${voucherCode}" at checkout or in Redeem Codes to claim bonus value.`,
            type: "reward",
          },
        });

        const cooldownAvailableAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        details.voucherCode = voucherCode;
        details.isVoucher = true;
        details.cooldownAvailableAt = cooldownAvailableAt;
        details.cooldownRemainingMs = 7 * 24 * 60 * 60 * 1000;
      } else if (item.type === "credits_emergency") {
        const creditAmount = Number(item.value);
        userUpdates.bonusCredits = { increment: creditAmount };

        await tx.creditTransaction.create({
          data: {
            userId,
            amount: creditAmount,
            balanceType: "bonus",
            transactionType: "sparks_emergency",
            description: `Redeemed ${item.title} (Emergency Refuel)`,
            metadata: { itemId, costSparks: item.costSparks },
          },
        });
        details.creditsAwarded = creditAmount;
      } else if (item.type === "credits_bonus") {
        const creditAmount = Number(item.value);
        userUpdates.bonusCredits = { increment: creditAmount };

        await tx.creditTransaction.create({
          data: {
            userId,
            amount: creditAmount,
            balanceType: "bonus",
            transactionType: "sparks_shop",
            description: `Redeemed ${item.title} from Sparks Exchange`,
            metadata: { itemId, costSparks: item.costSparks },
          },
        });
        details.creditsAwarded = creditAmount;
      } else if (item.type === "credits_permanent") {
        const creditAmount = Number(item.value);
        userUpdates.lifetimeCredits = { increment: creditAmount };

        await tx.creditTransaction.create({
          data: {
            userId,
            amount: creditAmount,
            balanceType: "permanent",
            transactionType: "sparks_shop",
            description: `Redeemed ${item.title} from Sparks Exchange`,
            metadata: { itemId, costSparks: item.costSparks },
          },
        });
        details.creditsAwarded = creditAmount;
      } else if (item.type === "pro_pass") {
        const hours = Number(item.value);
        // Generate human-readable single-use voucher code
        // Prefix: PRO-24H-XXXX-XXXX or PRO-7D-XXXX-XXXX
        const prefix = hours >= 168 ? "PRO-7D" : "PRO-24H";
        const randomBlock1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const randomBlock2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const voucherCode = `${prefix}-${randomBlock1}-${randomBlock2}`;

        // Insert into prisma.promoCode table
        await tx.promoCode.create({
          data: {
            code: voucherCode,
            bonusCredits: 0,
            maxRedemptions: 1,
            redemptionCount: 0,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
          },
        });

        // Store notification for the user so their code is never lost
        await tx.notification.create({
          data: {
            userId,
            title: `Pro Pass Voucher: ${voucherCode}`,
            message: `You redeemed ${item.title} for ${item.costSparks} Sparks! Activate code ${voucherCode} whenever you want or gift it to a friend.`,
            type: "reward",
          },
        });

        details.voucherCode = voucherCode;
        details.durationHours = hours;
        details.isVoucher = true;
      } else if (item.type === "avatar_frame") {
        const frameId = String(item.value);
        const rawFrames = user.unlockedAvatarFrames;
        const frames: string[] = Array.isArray(rawFrames)
          ? (rawFrames as unknown as string[])
          : [];

        const updatedFrames = frames.includes(frameId) ? frames : [...frames, frameId];
        userUpdates.unlockedAvatarFrames = updatedFrames;
        userUpdates.avatarFrame = frameId; // auto-equip
        details.equippedFrame = frameId;
      } else if (item.type === "name_gradient") {
        const gradientId = String(item.value);
        const rawGradients = user.unlockedNameGradients;
        const gradients: string[] = Array.isArray(rawGradients)
          ? (rawGradients as unknown as string[])
          : [];

        const updatedGradients = gradients.includes(gradientId) ? gradients : [...gradients, gradientId];
        userUpdates.unlockedNameGradients = updatedGradients;
        userUpdates.nameGradient = gradientId; // auto-equip
        details.equippedGradient = gradientId;
      } else if (item.type === "creator_insignia") {
        const insigniaId = String(item.value);
        const rawInsignias = user.unlockedInsignias;
        const insignias: string[] = Array.isArray(rawInsignias)
          ? (rawInsignias as unknown as string[])
          : [];

        const updatedInsignias = insignias.includes(insigniaId) ? insignias : [...insignias, insigniaId];
        userUpdates.unlockedInsignias = updatedInsignias;
        userUpdates.insignia = insigniaId; // auto-equip
        details.equippedInsignia = insigniaId;
      } else if (item.type === "studio_canopy") {
        const canopyId = String(item.value);
        const rawCanopies = user.unlockedCanopies;
        const canopies: string[] = Array.isArray(rawCanopies)
          ? (rawCanopies as unknown as string[])
          : [];

        const updatedCanopies = canopies.includes(canopyId) ? canopies : [...canopies, canopyId];
        userUpdates.unlockedCanopies = updatedCanopies;
        userUpdates.canopy = canopyId; // auto-equip
        details.equippedCanopy = canopyId;
      }

      // Apply User Updates
      await tx.user.update({
        where: { id: userId },
        data: userUpdates,
      });

      // Record Sparks Ledger Spend or Free Gift
      await tx.sparksTransaction.create({
        data: {
          userId,
          amount: item.type === "free_sparks" ? 100 : -item.costSparks,
          balanceAfter: newSparksBalance,
          source: item.type === "free_sparks" ? "free_gift_100" : "shop_redemption",
          description: item.type === "free_sparks" ? "100 Free Sparks Gift" : `Redeemed: ${item.title}`,
          metadata: { itemId, itemType: item.type, costSparks: item.costSparks, ...details },
        },
      });

      return {
        remainingSparks: newSparksBalance,
        details,
      };
    });

    return {
      success: true,
      item,
      remainingSparks: result.remainingSparks,
      details: result.details,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[SPARKS] redeemSparksShopItem error:", msg);
    return { success: false, error: msg };
  }
}
