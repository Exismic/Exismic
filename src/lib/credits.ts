import { prisma } from "./prisma";
import { FREE_DAILY_CREDITS, getDailyCreditLimit } from "@/lib/credit-policy";

type CreditBalanceType = "daily" | "bonus" | "permanent" | "mixed";
type CreditTransactionType = "daily_reset" | "tool_usage" | "shop_bonus" | "purchase" | "manual_adjustment";

function getMostRecentResetTimestamp(): Date {
  const now = new Date();
  const resetToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 6, 30, 0, 0));
  if (now.getTime() < resetToday.getTime()) {
    resetToday.setUTCDate(resetToday.getUTCDate() - 1);
  }
  return resetToday;
}

export function getTodayInIndia() {
  const reset = getMostRecentResetTimestamp();
  return new Date(Date.UTC(reset.getUTCFullYear(), reset.getUTCMonth(), reset.getUTCDate()));
}

export function getCreditTotal(credits: {
  dailyCredits?: number | null;
  bonusCredits?: number | null;
  lifetimeCredits?: number | null;
}) {
  return (credits.dailyCredits ?? 0) + (credits.bonusCredits ?? 0) + (credits.lifetimeCredits ?? 0);
}

async function logCreditTransaction(input: {
  userId: string;
  amount: number;
  balanceType: CreditBalanceType;
  transactionType: CreditTransactionType;
  toolId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.creditTransaction.create({
    data: {
      userId: input.userId,
      amount: input.amount,
      balanceType: input.balanceType,
      transactionType: input.transactionType,
      toolId: input.toolId,
      description: input.description,
      metadata: input.metadata,
    },
  }).catch((error) => {
    console.warn("[CREDITS] Transaction log skipped:", error);
  });
}

export async function resetCreditsIfNewDay(userId: string) {
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
      },
    });

    if (!user) {
      console.warn(`[CREDITS] User not found: ${userId}`);
      return null;
    }

    const now = new Date();
    const lastReset = user.creditsLastReset || new Date(0);
    const mostRecentReset = getMostRecentResetTimestamp();

    const isNewDay = lastReset.getTime() < mostRecentReset.getTime();

    const creditLimit = getDailyCreditLimit(user.plan);

    if (!isNewDay) {
      if (user.dailyCredits <= creditLimit) return user;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
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

      await logCreditTransaction({
        userId,
        amount: creditLimit - user.dailyCredits,
        balanceType: "daily",
        transactionType: "manual_adjustment",
        description: "Daily credit allowance normalized to current plan limit",
      });

      return updatedUser;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCredits: creditLimit,
        bonusCredits: 0, // Reset temporary credits daily
        creditsLastReset: now,
        aiMessagesToday: 0,
        aiMessagesReset: now,
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

    await logCreditTransaction({
      userId,
      amount: creditLimit,
      balanceType: "daily",
      transactionType: "daily_reset",
      description: "Daily credit allowance restored",
    });

    console.log(`[CREDITS] Daily reset for user ${userId}: ${creditLimit} credits restored`);
    return updatedUser;
  } catch (err) {
    console.error(`[CREDITS] Error resetting credits for ${userId}:`, err);
    throw err;
  }
}

export async function initializeUserCredits(userId: string) {
  try {
    const now = new Date();
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        dailyCredits: FREE_DAILY_CREDITS,
        bonusCredits: 0,
        creditsLastReset: now,
        aiMessagesToday: 0,
        aiMessagesReset: now,
        plan: "free",
      },
      create: {
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

export async function deductCredits(userId: string, amount: number, toolId?: string) {
  try {
    const updated = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({
        where: { id: userId },
        select: {
          dailyCredits: true,
          bonusCredits: true,
          lifetimeCredits: true,
        },
      });

      if (!user) throw new Error("User not found");

      const totalAvailable = getCreditTotal(user);
      if (totalAvailable < amount) throw new Error(`Insufficient credits:${totalAvailable}`);

      const dailySpend = Math.min(user.dailyCredits, amount);
      const afterDaily = amount - dailySpend;
      const bonusSpend = Math.min(user.bonusCredits, afterDaily);
      const permanentSpend = afterDaily - bonusSpend;

      const updatedUser = await transaction.user.update({
        where: { id: userId },
        data: {
          dailyCredits: { decrement: dailySpend },
          bonusCredits: { decrement: bonusSpend },
          lifetimeCredits: { decrement: permanentSpend },
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
          amount: -amount,
          balanceType: "mixed",
          transactionType: "tool_usage",
          toolId,
          description: toolId ? `Used ${amount} credits for ${toolId}` : `Used ${amount} credits`,
          metadata: { dailySpend, bonusSpend, permanentSpend },
        },
      });

      return updatedUser;
    });

    console.log(`[CREDITS] Deducted ${amount} credits from user ${userId}`);
    return { success: true, data: updated };
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
          metadata,
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
      },
    });

    if (!user) {
      console.log(`[CREDITS] User ${userId} not found, initializing...`);
      const initialized = await initializeUserCredits(userId);
      return {
        dailyCredits: initialized.dailyCredits,
        bonusCredits: initialized.bonusCredits,
        lifetimeCredits: initialized.lifetimeCredits,
        creditsLastReset: new Date(),
        aiMessagesToday: 0,
        plan: initialized.plan,
      };
    }

    await resetCreditsIfNewDay(userId);

    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyCredits: true,
        bonusCredits: true,
        lifetimeCredits: true,
        creditsLastReset: true,
        aiMessagesToday: true,
        plan: true,
      },
    });
  } catch (err) {
    console.error(`[CREDITS] Error getting credits for ${userId}:`, err);
    return null;
  }
}

export async function claimDailyShopCredits(userId: string) {
  const claimDate = getTodayInIndia();

  const reward = rollDailyShopReward();

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

      const claim = await transaction.creditShopClaim.create({
        data: {
          userId,
          claimDate,
          amount: reward.amount,
          rarity: reward.rarity,
        },
      });

      const updatedUser = await transaction.user.update({
        where: { id: userId },
        data: reward.type === "permanent"
          ? { lifetimeCredits: { increment: reward.amount } }
          : { bonusCredits: { increment: reward.amount } },
        select: {
          dailyCredits: true,
          bonusCredits: true,
          lifetimeCredits: true,
        },
      });

      await transaction.creditTransaction.create({
        data: {
          userId,
          amount: reward.amount,
          balanceType: reward.type === "permanent" ? "permanent" : "bonus",
          transactionType: "shop_bonus",
          description: `Daily shop reward: ${reward.rarity} (${reward.type})`,
          metadata: { rarity: reward.rarity, type: reward.type, claimId: claim.id },
        },
      });

      return { claim, credits: updatedUser };
    });

    return { success: true, ...reward, credits: result.credits };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Already claimed:")) {
      const [, amount, rarity] = message.split(":");
      return {
        success: false,
        alreadyClaimed: true,
        amount: Number(amount || 0),
        rarity: rarity || "claimed",
        error: "You already claimed today's shop reward.",
      };
    }
    console.error("[CREDITS] Daily shop claim failed:", err);
    return { success: false, error: "Could not claim today's reward." };
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
