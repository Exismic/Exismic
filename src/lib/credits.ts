import { prisma } from "./prisma";
import { FREE_DAILY_CREDITS, getDailyCreditLimit } from "@/lib/credit-policy";
import { Prisma } from "@prisma/client";
import { isDevAccountEmail, DEV_INFINITE_BALANCE } from "@/lib/dev-account";

import { getTodayInIndia, getMostRecentResetTimestamp } from './daily-cycle';
export { getTodayInIndia, getMostRecentResetTimestamp } from './daily-cycle';
import { runSerializable } from './serializable';
import { MAX_STREAK_SHIELDS, resolveStreak } from './streak-state';
import { settleUserStreak, settleStreakInTransaction, deliverStreakProtectionEmails } from './streaks';

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
            email: true,
            role: true,
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
        if (isDevAccountEmail(user.email) || user.role === "developer") {
          return user;
        }

        const now = new Date();
        let currentPlan = user.plan;
        let isPlanExpired = false;

        if (user.plan === "pro" && user.planExpiresAt && new Date(user.planExpiresAt) < now) {
          currentPlan = "free";
          isPlanExpired = true;
        }

        const mostRecentReset = getMostRecentResetTimestamp(now);
        const creditLimit = getDailyCreditLimit(currentPlan);
        const isNewDay =
          !user.creditsLastReset || user.creditsLastReset < mostRecentReset;

        if (!isNewDay && !isPlanExpired) return user;

        const updatedDailyCredits = creditLimit;
        const updatedBonusCredits = 0;

        const updatedUser = await transaction.user.update({
          where: { id: userId },
          data: isNewDay
            ? {
                plan: currentPlan,
                subscriptionStatus: isPlanExpired ? "none" : undefined,
                dailyCredits: updatedDailyCredits,
                bonusCredits: updatedBonusCredits,
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

        // Top up amount for daily credits (never negative)
        const dailyAllowanceAdded = Math.max(0, creditLimit - user.dailyCredits);

        await transaction.creditTransaction.create({
          data: {
            userId,
            amount: dailyAllowanceAdded,
            balanceType: "daily",
            transactionType: isNewDay ? "daily_reset" : "manual_adjustment",
            description: isPlanExpired
              ? "Pro plan expired; membership degraded to free tier"
              : (isNewDay
                  ? `Daily allowance restored to ${creditLimit} credits`
                  : `Daily allowance normalized to ${creditLimit} credits`),
          },
        });

        return updatedUser;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000, maxWait: 10000 }),
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
  transactionType: string = "tool_usage",
  descriptionOverride?: string,
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
          select: { email: true, role: true, dailyCredits: true, bonusCredits: true, lifetimeCredits: true },
        });
        if (!user) throw new Error("User not found");

        if (isDevAccountEmail(user.email) || user.role === "developer") {
          return {
            balances: {
              dailyCredits: DEV_INFINITE_BALANCE,
              bonusCredits: DEV_INFINITE_BALANCE,
              lifetimeCredits: DEV_INFINITE_BALANCE,
            },
            spent: { dailySpend: 0, bonusSpend: 0, permanentSpend: 0 },
          };
        }

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
            transactionType,
            toolId,
            description: descriptionOverride || (toolId ? `Used ${amount} credits for ${toolId}` : `Used ${amount} credits`),
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
  lastClaimDate?: Date | string | null,
  streakShields?: number | null,
  streakFreezeUsedAt?: Date | string | null,
  now = new Date(),
): number {
  return resolveStreak({ dailyStreak, lastClaimDate, streakShields, streakFreezeUsedAt }, now).dailyStreak;
}

export async function getUserCredits(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        role: true,
        dailyCredits: true,
        bonusCredits: true,
        lifetimeCredits: true,
        creditsLastReset: true,
        aiMessagesToday: true,
        plan: true,
        dailyStreak: true,
        lastClaimDate: true,
        streakShields: true,
        streakFreezeUsedAt: true,
        streakMilestonesClaimed: true,
      },
    });

    if (user && (isDevAccountEmail(user.email) || user.role === "developer")) {
      return {
        dailyCredits: DEV_INFINITE_BALANCE,
        bonusCredits: DEV_INFINITE_BALANCE,
        lifetimeCredits: DEV_INFINITE_BALANCE,
        creditsLastReset: new Date(),
        aiMessagesToday: 0,
        plan: "pro",
        dailyStreak: 999,
        streakShields: 99,
        streakFreezeUsedAt: null,
        streakMilestonesClaimed: [],
      };
    }

    if (!user) {
      await initializeUserCredits(userId);
    }

    await settleUserStreak(userId);
    await deliverStreakProtectionEmails(userId, 5);
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
        streakShields: true,
        streakFreezeUsedAt: true,
        streakMilestonesClaimed: true,
      },
    });

    if (!updatedUser) return null;

    const effectiveStreak = calculateEffectiveStreak(
      updatedUser.dailyStreak,
      updatedUser.lastClaimDate,
      updatedUser.streakShields,
      updatedUser.streakFreezeUsedAt
    );

    const rawClaimed = updatedUser.streakMilestonesClaimed;
    const claimedMilestones: string[] = Array.isArray(rawClaimed)
      ? (rawClaimed as unknown as string[])
      : [];

    return {
      ...updatedUser,
      dailyStreak: effectiveStreak,
      streakMilestonesClaimed: claimedMilestones,
    };
  } catch (err) {
    console.error(`[CREDITS] Error getting credits for ${userId}:`, err);
    return null;
  }
}

export async function claimDailyShopCredits(userId: string) {
  const now = new Date();
  const claimDate = getTodayInIndia(now);

  try {
    const result = await runSerializable(() => prisma.$transaction(async (transaction) => {
      const settled = await settleStreakInTransaction(transaction, userId, now);
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
        select: {
          dailyStreak: true,
          lastClaimDate: true,
          streakShields: true,
          streakFreezeUsedAt: true,
          streakMilestonesClaimed: true,
        },
      });

      if (!user) throw new Error('User not found');
      const state = resolveStreak(user, now);
      const newStreak = state.claimedToday ? Math.max(1, state.dailyStreak) : state.dailyStreak + 1;
      const shieldConsumed = Boolean(settled?.shieldsConsumed);

      const rawClaimed = user?.streakMilestonesClaimed;
      const claimedMilestones: string[] = Array.isArray(rawClaimed)
        ? (rawClaimed as unknown as string[])
        : [];
      const hasDoubleLuck = claimedMilestones.includes("14") || newStreak >= 14;
      const hasIgnitionBoost = claimedMilestones.includes("3") || newStreak >= 3;

      let reward = rollDailyShopReward(hasDoubleLuck);

      // Ignition Boost (Day 3+ perk): Guarantees minimum drop floor of 15 credits
      if (hasIgnitionBoost && reward.amount < 15) {
        reward = { ...reward, amount: 15 };
      }

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

      // Calculate updated shield count
      let currentShields = (user?.streakShields || 0);
      let bonusShieldEarned = false;
      if (newStreak % 7 === 0 && currentShields < MAX_STREAK_SHIELDS) {
        currentShields += 1;
        bonusShieldEarned = true;
      }

      const updatedUser = await transaction.user.update({
        where: { id: userId },
        data: {
          dailyStreak: newStreak,
          lastClaimDate: claimDate,
          streakShields: currentShields,
          ...(reward.type === "permanent"
            ? { lifetimeCredits: { increment: finalAmount } }
            : { bonusCredits: { increment: finalAmount } }),
        },
        select: {
          dailyCredits: true,
          bonusCredits: true,
          lifetimeCredits: true,
          dailyStreak: true,
          streakShields: true,
          streakFreezeUsedAt: true,
          streakMilestonesClaimed: true,
        },
      });

      await transaction.creditTransaction.create({
        data: {
          userId,
          amount: finalAmount,
          balanceType: reward.type === "permanent" ? "permanent" : "bonus",
          transactionType: "shop_bonus",
          description: `Daily shop reward (${newStreak}-day streak): ${reward.rarity} (${reward.type})${shieldConsumed ? " [Shield Preserved]" : ""}${hasDoubleLuck ? " [2x Luck Active]" : ""}`,
          metadata: {
            rarity: reward.rarity,
            type: reward.type,
            streak: newStreak,
            claimId: claim.id,
            shieldConsumed,
            bonusShieldEarned,
            hasDoubleLuck,
            hasIgnitionBoost,
          },
        },
      });

      return {
        claim,
        credits: updatedUser,
        streak: newStreak,
        finalAmount,
        reward,
        shieldConsumed,
        bonusShieldEarned,
        hasDoubleLuck,
        hasIgnitionBoost,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));

    await deliverStreakProtectionEmails(userId, 5);
    return {
      success: true as const,
      rarity: result.reward.rarity,
      amount: result.finalAmount,
      type: result.reward.type,
      streak: result.streak,
      credits: result.credits,
      shieldConsumed: result.shieldConsumed,
      bonusShieldEarned: result.bonusShieldEarned,
      hasDoubleLuck: result.hasDoubleLuck,
      hasIgnitionBoost: result.hasIgnitionBoost,
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

export async function buyStreakShield(userId: string) {
  try {
    await settleUserStreak(userId);
    await deliverStreakProtectionEmails(userId, 5);
    await resetCreditsIfNewDay(userId);
    const updatedUser = await runSerializable(() => prisma.$transaction(async tx => {
      await settleStreakInTransaction(tx, userId);
      const user = await tx.user.findUnique({ where: { id: userId }, select: {
        dailyCredits: true, bonusCredits: true, lifetimeCredits: true, streakShields: true,
      } });
      if (!user) throw new Error('User not found');
      if (user.streakShields >= MAX_STREAK_SHIELDS) throw new Error('Maximum savers reached (limit: 3).');
      const cost = 30;
      if (getCreditTotal(user) < cost) throw new Error('You need 30 credits to equip a streak saver.');
      const dailySpend = Math.min(user.dailyCredits, cost);
      const bonusSpend = Math.min(user.bonusCredits, cost - dailySpend);
      const permanentSpend = cost - dailySpend - bonusSpend;
      const updated = await tx.user.update({ where: { id: userId }, data: {
        dailyCredits: user.dailyCredits - dailySpend, bonusCredits: user.bonusCredits - bonusSpend,
        lifetimeCredits: user.lifetimeCredits - permanentSpend, streakShields: { increment: 1 },
      }, select: { streakShields: true, dailyCredits: true, bonusCredits: true, lifetimeCredits: true } });
      await tx.creditTransaction.create({ data: {
        userId, amount: -cost, balanceType: 'mixed', transactionType: 'shield_purchase', toolId: 'streak-shield',
        description: 'Equipped streak saver (-30 credits)', metadata: { dailySpend, bonusSpend, permanentSpend },
      } });
      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));
    return { success: true, streakShields: updatedUser.streakShields, credits: updatedUser };
  } catch (error) {
    console.error('[CREDITS] Streak saver purchase failed:', error);
    const message = error instanceof Error ? error.message : '';
    const expected = ['User not found', 'Maximum savers reached (limit: 3).', 'You need 30 credits to equip a streak saver.'];
    return { success: false, error: expected.includes(message) ? message : 'Could not equip a streak saver. Please try again later.' };
  }
}

export const STREAK_MILESTONES = {
  3: { credits: 25, type: "bonus" as const, name: "3-Day Ignition", shield: 0 },
  7: { credits: 75, type: "bonus" as const, name: "Weekly Champion", shield: 1 },
  14: { credits: 150, type: "bonus" as const, name: "Fortnight Fire", shield: 0, cosmetic: "neon_fire" },
  30: { credits: 500, type: "permanent" as const, name: "Monthly Mythic", shield: 0, cosmetic: "mythic_gold" },
} as const;

export async function claimStreakMilestone(userId: string, milestoneDay: number) {
  const milestone = STREAK_MILESTONES[milestoneDay as keyof typeof STREAK_MILESTONES];
  if (!milestone) {
    return { success: false, error: "Invalid milestone day" };
  }

  try {
    await settleUserStreak(userId);
    await deliverStreakProtectionEmails(userId, 5);
    const result = await runSerializable(() => prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({
        where: { id: userId },
        select: {
          dailyStreak: true,
          lastClaimDate: true,
          streakShields: true,
          streakFreezeUsedAt: true,
          streakMilestonesClaimed: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const effectiveStreak = calculateEffectiveStreak(user.dailyStreak, user.lastClaimDate, user.streakShields, user.streakFreezeUsedAt);
      if (effectiveStreak < milestoneDay) {
        throw new Error(`Your streak (${effectiveStreak}) has not reached the ${milestoneDay}-day milestone yet.`);
      }

      const rawClaimed = user.streakMilestonesClaimed;
      const claimed: string[] = Array.isArray(rawClaimed)
        ? (rawClaimed as unknown as string[])
        : [];
      const milestoneKey = milestoneDay.toString();
      if (claimed.includes(milestoneKey)) {
        throw new Error(`Milestone for day ${milestoneDay} has already been claimed.`);
      }

      const shouldAddShield = milestone.shield > 0 && (user.streakShields || 0) < MAX_STREAK_SHIELDS;

      const updatedUser = await transaction.user.update({
        where: { id: userId },
        data: {
          streakMilestonesClaimed: [...claimed, milestoneKey],
          ...(milestone.type === "permanent"
            ? { lifetimeCredits: { increment: milestone.credits } }
            : { bonusCredits: { increment: milestone.credits } }),
          ...(shouldAddShield ? { streakShields: { increment: 1 } } : {}),
        },
        select: {
          dailyCredits: true,
          bonusCredits: true,
          lifetimeCredits: true,
          dailyStreak: true,
          streakShields: true,
          streakMilestonesClaimed: true,
        },
      });

      await transaction.creditTransaction.create({
        data: {
          userId,
          amount: milestone.credits,
          balanceType: milestone.type,
          transactionType: "shop_bonus",
          description: `Milestone ${milestoneDay} Days unlocked: ${milestone.name} (+${milestone.credits} credits${shouldAddShield ? " + 1 Shield" : ""})`,
          metadata: {
            milestoneDay,
            milestoneName: milestone.name,
            shieldAwarded: shouldAddShield,
            cosmetic: "cosmetic" in milestone ? milestone.cosmetic : undefined,
          },
        },
      });

      return {
        milestone,
        credits: updatedUser,
        shieldAwarded: shouldAddShield,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));

    return {
      success: true,
      milestone: result.milestone,
      credits: result.credits,
      shieldAwarded: result.shieldAwarded,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

function rollDailyShopReward(doubleLuck = false): { rarity: string; amount: number; type: "temporary" | "permanent" } {
  const roll = Math.random();
  
  // 2x Vault Luck (Unlocked at Day 14 milestone or 14+ day streak)
  if (doubleLuck) {
    // Permanent: 8% total chance (doubled from 4%)
    if (roll < 0.005) return { rarity: "legendary", amount: 200, type: "permanent" }; // 0.5% (was 0.2%)
    if (roll < 0.025) return { rarity: "epic", amount: 50, type: "permanent" };      // 2.0% (was 0.8%)
    if (roll < 0.080) return { rarity: "rare", amount: 25, type: "permanent" };      // 5.5% (was 3.0%)
    
    // Temporary: 92% total chance (higher tiers doubled)
    if (roll < 0.200) return { rarity: "epic", amount: 100, type: "temporary" };     // 12.0% (was 6.0%)
    if (roll < 0.500) return { rarity: "rare", amount: 50, type: "temporary" };      // 30.0% (was 15.0%)
    if (roll < 0.750) return { rarity: "uncommon", amount: 25, type: "temporary" };  // 25.0% (was 30.0%)
    return { rarity: "common", amount: 15, type: "temporary" };                      // 25.0% (was 45.0%, floor 15)
  }

  // Standard Drop Rates
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
