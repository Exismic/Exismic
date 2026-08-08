import { prisma } from "./prisma";
import { FREE_DAILY_CREDITS, getDailyCreditLimit } from "@/lib/credit-policy";
import { Prisma } from "@prisma/client";

function getMostRecentResetTimestamp(): Date {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const nowIst = new Date(istString);
  if (nowIst.getHours() < 12) {
    nowIst.setDate(nowIst.getDate() - 1);
  }
  nowIst.setHours(12, 0, 0, 0);
  return nowIst;
}

export function getTodayInIndia() {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const nowIst = new Date(istString);

  // Daily giftbox reward resets at 12:00 PM IST (noon)
  if (nowIst.getHours() < 12) {
    nowIst.setDate(nowIst.getDate() - 1);
  }

  return new Date(Date.UTC(
    nowIst.getFullYear(),
    nowIst.getMonth(),
    nowIst.getDate(),
  ));
}

function isRetryableTransactionError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

async function runSerializable<T>(operation: () => Promise<T>) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryableTransactionError(error) || attempt === 2) throw error;
    }
  }
  throw lastError;
}

export function getCreditTotal(credits: {
  dailyCredits?: number | null;
  bonusCredits?: number | null;
  lifetimeCredits?: number | null;
}) {
  return (credits.dailyCredits ?? 0) + (credits.bonusCredits ?? 0) + (credits.lifetimeCredits ?? 0);
}

export async function resetCreditsIfNewDay(userId: string) {
  try {
    return await runSerializable(() =>
      prisma.$transaction(async (transaction) => {
        const user = await transaction.user.findUnique({
          where: { id: userId },
          select: {
            dailyCredits: true,
            bonusCredits: true,
            lifetimeCredits: true,
            creditsLastReset: true,
            aiMessagesToday: true,
            plan: true,
            planExpiresAt: true,
          },
        });

        if (!user) return null;

        const now = new Date();
        let currentPlan = user.plan;
        let isPlanExpired = false;

        if (user.plan === "pro" && user.planExpiresAt && new Date(user.planExpiresAt) < now) {
          currentPlan = "free";
          isPlanExpired = true;
        }

        const mostRecentReset = getMostRecentResetTimestamp();
        const creditLimit = getDailyCreditLimit(currentPlan);
        const isNewDay =
          !user.creditsLastReset || user.creditsLastReset < mostRecentReset;

        if (!isNewDay && user.dailyCredits <= creditLimit && !isPlanExpired) return user;

        const updatedUser = await transaction.user.update({
          where: { id: userId },
          data: isNewDay
            ? {
                plan: currentPlan,
                subscriptionStatus: isPlanExpired ? "none" : undefined,
                dailyCredits: creditLimit,
                bonusCredits: 0,
                creditsLastReset: now,
                aiMessagesToday: 0,
                aiMessagesReset: now,
              }
            : {
                plan: currentPlan,
                subscriptionStatus: isPlanExpired ? "none" : undefined,
                dailyCredits: creditLimit,
              },
          select: {
            dailyCredits: true,
            bonusCredits: true,
            lifetimeCredits: true,
            creditsLastReset: true,
            aiMessagesToday: true,
            plan: true,
          },
        });

        await transaction.creditTransaction.create({
          data: {
            userId,
            amount: isNewDay
              ? creditLimit - user.dailyCredits - user.bonusCredits
              : creditLimit - user.dailyCredits,
            balanceType: isNewDay ? "mixed" : "daily",
            transactionType: isNewDay ? "daily_reset" : "manual_adjustment",
            description: isPlanExpired
              ? "Pro plan expired; membership degraded to free tier"
              : (isNewDay
                  ? "Daily allowance restored and temporary credits expired"
                  : "Daily allowance normalized to the current plan limit"),
          },
        });

        return updatedUser;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }),
    );
  } catch (err) {
    console.error(`[CREDITS] Error resetting credits for ${userId}:`, err);
    throw err;
  }
}

export async function initializeUserCredits(userId: string) {
  try {
    const now = new Date();
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dailyCredits: true,
        bonusCredits: true,
        lifetimeCredits: true,
        plan: true,
      },
    });
    if (existing) return existing;

    const user = await prisma.user.create({
      data: {
        id: userId,
        dailyCredits: FREE_DAILY_CREDITS,
        bonusCredits: 0,
        lifetimeCredits: 0,
        creditsLastReset: now,
        aiMessagesToday: 0,
        aiMessagesReset: now,
        plan: "free",
      },
      select: {
        id: true,
        dailyCredits: true,
        bonusCredits: true,
        lifetimeCredits: true,
        plan: true,
      },
    });

    console.log(`[CREDITS] Initialized user ${userId} with ${FREE_DAILY_CREDITS} credits`);
    return user;
  } catch (err) {
    console.error(`[CREDITS] Error initializing credits for ${userId}:`, err);
    throw err;
  }
}

export async function deductCredits(
  userId: string,
  amount: number,
  toolId?: string,
  operationId?: string,
) {
  if (!Number.isInteger(amount) || amount <= 0 || amount > 10000) {
    return { success: false, error: "Invalid credit amount" };
  }

  try {
    await resetCreditsIfNewDay(userId);
    const debit = await runSerializable(() =>
      prisma.$transaction(async (transaction) => {
        if (operationId) {
          const prior = await transaction.creditTransaction.findUnique({
            where: { id: operationId },
          });
          if (prior) {
            const balances = await transaction.user.findUnique({
              where: { id: userId },
              select: { dailyCredits: true, bonusCredits: true, lifetimeCredits: true },
            });
            return { balances, spent: prior.metadata };
          }
        }

        const user = await transaction.user.findUnique({
          where: { id: userId },
          select: { dailyCredits: true, bonusCredits: true, lifetimeCredits: true },
        });
        if (!user) throw new Error("User not found");

        const totalAvailable = getCreditTotal(user);
        if (totalAvailable < amount) throw new Error(`Insufficient credits:${totalAvailable}`);

        const dailySpend = Math.min(user.dailyCredits, amount);
        const afterDaily = amount - dailySpend;
        const bonusSpend = Math.min(user.bonusCredits, afterDaily);
        const permanentSpend = afterDaily - bonusSpend;

        const balances = await transaction.user.update({
          where: { id: userId },
          data: {
            dailyCredits: user.dailyCredits - dailySpend,
            bonusCredits: user.bonusCredits - bonusSpend,
            lifetimeCredits: user.lifetimeCredits - permanentSpend,
          },
          select: { dailyCredits: true, bonusCredits: true, lifetimeCredits: true },
        });

        const spent = { dailySpend, bonusSpend, permanentSpend };
        await transaction.creditTransaction.create({
          data: {
            ...(operationId ? { id: operationId } : {}),
            userId,
            amount: -amount,
            balanceType: "mixed",
            transactionType: "tool_usage",
            toolId,
            description: toolId ? `Used ${amount} credits for ${toolId}` : `Used ${amount} credits`,
            metadata: spent,
          },
        });

        return { balances, spent };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }),
    );

    console.log(`[CREDITS] Deducted ${amount} credits from user ${userId}`);
    return { success: true, data: debit.balances, spent: debit.spent };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Insufficient credits:")) {
      const available = Number(message.split(":")[1] || 0);
      return { success: false, error: "Insufficient credits", available };
    }
    console.error(`[CREDITS] Error deducting credits from ${userId}:`, err);
    return { success: false, error: String(err) };
  }
}

export async function addCredits(userId: string, amount: number, reason?: string) {
  if (!Number.isInteger(amount) || amount <= 0 || amount > 1_000_000) {
    return { success: false, error: "Invalid credit amount" };
  }
  try {
    const user = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.user.update({
        where: { id: userId },
        data: {
          lifetimeCredits: { increment: amount },
        },
        select: { lifetimeCredits: true },
      });

      await transaction.creditTransaction.create({
        data: {
          userId,
          amount,
          balanceType: "permanent",
          transactionType: "purchase",
          description: reason || "Permanent credits added",
        },
      });

      return updated;
    });

    console.log(`[CREDITS] Added ${amount} permanent credits to user ${userId}${reason ? ` (${reason})` : ""}`);
    return { success: true, data: user };
  } catch (err) {
    console.error(`[CREDITS] Error adding credits to ${userId}:`, err);
    return { success: false, error: String(err) };
  }
}

export async function addBonusCredits(userId: string, amount: number, reason?: string, metadata?: Record<string, unknown>) {
  if (!Number.isInteger(amount) || amount <= 0 || amount > 10_000) {
    return { success: false, error: "Invalid bonus amount" };
  }
  try {
    const user = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.user.update({
        where: { id: userId },
        data: {
          bonusCredits: { increment: amount },
        },
        select: {
          dailyCredits: true,
          bonusCredits: true,
          lifetimeCredits: true,
        },
      });

      await transaction.creditTransaction.create({
        data: {
          userId,
          amount,
          balanceType: "bonus",
          transactionType: "shop_bonus",
          description: reason || "Shop bonus credits added",
            metadata: metadata as Prisma.InputJsonObject | undefined,
        },
      });

      return updated;
    });

    console.log(`[CREDITS] Added ${amount} bonus credits to user ${userId}${reason ? ` (${reason})` : ""}`);
    return { success: true, data: user };
  } catch (err) {
    console.error(`[CREDITS] Error adding bonus credits to ${userId}:`, err);
    return { success: false, error: String(err) };
  }
}

export function calculateEffectiveStreak(
  dailyStreak?: number | null,
  lastClaimDate?: Date | string | null
): number {
  if (!dailyStreak || !lastClaimDate) return 0;

  const today = getTodayInIndia();
  const lastDate = new Date(lastClaimDate);
  if (Number.isNaN(lastDate.getTime())) return 0;

  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const lastUtc = Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate());

  const diffInDays = Math.round((todayUtc - lastUtc) / (24 * 60 * 60 * 1000));

  if (diffInDays === 0 || diffInDays === 1) {
    return dailyStreak;
  }
  return 0;
}

export async function getUserCredits(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyCredits: true,
        bonusCredits: true,
        lifetimeCredits: true,
        creditsLastReset: true,
        aiMessagesToday: true,
        plan: true,
        dailyStreak: true,
        lastClaimDate: true,
      },
    });

    if (!user) {
      await initializeUserCredits(userId);
    }

    await resetCreditsIfNewDay(userId);

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyCredits: true,
        bonusCredits: true,
        lifetimeCredits: true,
        creditsLastReset: true,
        aiMessagesToday: true,
        plan: true,
        dailyStreak: true,
        lastClaimDate: true,
      },
    });

    if (!updatedUser) return null;

    const effectiveStreak = calculateEffectiveStreak(updatedUser.dailyStreak, updatedUser.lastClaimDate);

    return {
      ...updatedUser,
      dailyStreak: effectiveStreak,
    };
  } catch (err) {
    console.error(`[CREDITS] Error getting credits for ${userId}:`, err);
    return null;
  }
}

export async function claimDailyShopCredits(userId: string) {
  const claimDate = getTodayInIndia();

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.creditShopClaim.findUnique({
        where: {
          userId_claimDate: {
            userId,
            claimDate,
          },
        },
      });

      if (existing) {
        throw new Error(`Already claimed:${existing.amount}:${existing.rarity}`);
      }

      const user = await transaction.user.findUnique({
        where: { id: userId },
        select: { dailyStreak: true, lastClaimDate: true }
      });

      const todayUtc = Date.UTC(claimDate.getUTCFullYear(), claimDate.getUTCMonth(), claimDate.getUTCDate());
      let newStreak = 1;

      if (user?.lastClaimDate) {
        const lastDate = new Date(user.lastClaimDate);
        if (!Number.isNaN(lastDate.getTime())) {
          const lastUtc = Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate());
          const diffInDays = Math.round((todayUtc - lastUtc) / (24 * 60 * 60 * 1000));

          if (diffInDays === 1) {
            newStreak = (user.dailyStreak || 0) + 1;
          } else if (diffInDays === 0) {
            newStreak = user.dailyStreak || 1;
          } else {
            newStreak = 1;
          }
        }
      }

      let reward = rollDailyShopReward();
      // Milestone bonus at 7 days: guarantee at least rare drop if roll was common/uncommon
      if (newStreak % 7 === 0 && (reward.rarity === "common" || reward.rarity === "uncommon")) {
        reward = { rarity: "rare", amount: 50, type: "temporary" };
      }

      // Calculate streak boost multiplier (+5% per streak day, max +35% at day 7+)
      const streakMultiplier = 1 + Math.min(newStreak - 1, 7) * 0.05;
      const finalAmount = Math.round(reward.amount * streakMultiplier);

      const claim = await transaction.creditShopClaim.create({
        data: {
          userId,
          claimDate,
          amount: finalAmount,
          rarity: reward.rarity,
        },
      });

      const updatedUser = await transaction.user.update({
        where: { id: userId },
        data: {
          dailyStreak: newStreak,
          lastClaimDate: claimDate,
          ...(reward.type === "permanent"
            ? { lifetimeCredits: { increment: finalAmount } }
            : { bonusCredits: { increment: finalAmount } }),
        },
        select: {
          dailyCredits: true,
          bonusCredits: true,
          lifetimeCredits: true,
          dailyStreak: true,
        },
      });

      await transaction.creditTransaction.create({
        data: {
          userId,
          amount: finalAmount,
          balanceType: reward.type === "permanent" ? "permanent" : "bonus",
          transactionType: "shop_bonus",
          description: `Daily shop reward (${newStreak}-day streak): ${reward.rarity} (${reward.type})`,
          metadata: { rarity: reward.rarity, type: reward.type, streak: newStreak, claimId: claim.id },
        },
      });

      return { claim, credits: updatedUser, streak: newStreak, finalAmount, reward };
    });

    return {
      success: true as const,
      rarity: result.reward.rarity,
      amount: result.finalAmount,
      type: result.reward.type,
      streak: result.streak,
      credits: result.credits,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Already claimed:")) {
      const [, amount, rarity] = message.split(":");
      return {
        success: false as const,
        alreadyClaimed: true,
        amount: Number(amount || 0),
        rarity: rarity || "claimed",
        error: "You already claimed today's shop reward.",
      };
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existing = await prisma.creditShopClaim.findUnique({
        where: { userId_claimDate: { userId, claimDate } },
      });
      return {
        success: false as const,
        alreadyClaimed: true,
        amount: existing?.amount || 0,
        rarity: existing?.rarity || "claimed",
        error: "You already claimed today's shop reward.",
      };
    }
    console.error("[CREDITS] Daily shop claim failed:", err);
    return { success: false as const, error: "Could not claim today's reward." };
  }
}

function rollDailyShopReward(): { rarity: string; amount: number; type: "temporary" | "permanent" } {
  const roll = Math.random();
  // Permanent: 4% total chance
  if (roll < 0.002) return { rarity: "legendary", amount: 200, type: "permanent" }; // 0.2%
  if (roll < 0.010) return { rarity: "epic", amount: 50, type: "permanent" };      // 0.8%
  if (roll < 0.040) return { rarity: "rare", amount: 25, type: "permanent" };      // 3.0%
  
  // Temporary: 96% total chance
  if (roll < 0.100) return { rarity: "epic", amount: 100, type: "temporary" };     // 6.0%
  if (roll < 0.250) return { rarity: "rare", amount: 50, type: "temporary" };      // 15.0%
  if (roll < 0.550) return { rarity: "uncommon", amount: 25, type: "temporary" };  // 30.0%
  return { rarity: "common", amount: 10, type: "temporary" };                      // 45.0%
}
