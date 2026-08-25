import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendGiveawayWinnerEmail, sendGiveawayLaunchAnnouncementEmail } from "@/lib/emails";

export interface GiveawayPrizeTier {
  place: number;
  rankTitle: string;
  prizeAmount: number;
  prizeDisplay: string;
  badge: string;
}

export interface ActiveGiveawayConfig {
  id: string;
  title: string;
  subtitle: string;
  totalPrizePool: number;
  prizeType: "lifetime_credits";
  prizeDisplay: string;
  winnersCount: number;
  prizes: GiveawayPrizeTier[];
  requiredSpend: number;
  startsAt: string; // ISO String
  endsAt: string;   // ISO String
  status: "scheduled" | "active" | "ended" | "drawing";
  terms: string[];
}

export const TEST_WINNER_EMAIL = "syedrayan.dev@gmail.com";
export const TEST_WINNER_NAME = "SYED RAYAN";

export const PRIZE_TIERS: GiveawayPrizeTier[] = [
  {
    place: 1,
    rankTitle: "1st Place Winner",
    prizeAmount: 1500,
    prizeDisplay: "1,500 Permanent Credits",
    badge: "👑 Grand Champion",
  },
  {
    place: 2,
    rankTitle: "2nd Place Winner",
    prizeAmount: 1000,
    prizeDisplay: "1,000 Permanent Credits",
    badge: "🥈 Runner Up",
  },
  {
    place: 3,
    rankTitle: "3rd Place Winner",
    prizeAmount: 500,
    prizeDisplay: "500 Permanent Credits",
    badge: "🥉 Third Place",
  },
];

export const CURRENT_GIVEAWAY: ActiveGiveawayConfig | null = null;

let isBroadcasting = false;

export async function broadcastGiveawayLaunch() {
  if (!CURRENT_GIVEAWAY || isBroadcasting) return;
  // Giveaway is inactive/cancelled, send no notifications or emails
}

export async function getUserGiveawayProgress(userId: string | null) {
  const giveaway = CURRENT_GIVEAWAY;

  if (!giveaway) {
    return {
      giveaway: null,
      userProgress: null,
      isUpcoming: false,
      isActive: false,
      isExpired: false,
      isCurrentUserWinner: false,
      winner: null,
      winners: [],
    };
  }

  const now = Date.now();
  const startDate = new Date(giveaway.startsAt);
  const endDate = new Date(giveaway.endsAt);

  const isUpcoming = now < startDate.getTime();
  const isActive = now >= startDate.getTime() && now < endDate.getTime();
  const isExpired = now >= endDate.getTime();

  // When active, broadcast in-site notification and emails to all users (idempotent)
  if (isActive) {
    void broadcastGiveawayLaunch();
  }

  let creditsSpent = 0;
  let isParticipated = false;
  let userEmail = "";
  let userName = "";

  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, username: true, lifetimeCredits: true },
      });

      if (user) {
        userEmail = user.email || "";
        userName = user.name || user.username || "Creator";

        // Credits spent ONLY count after the official start time (startsAt)
        if (!isUpcoming) {
          const spendAgg = await prisma.creditTransaction.aggregate({
            where: {
              userId: user.id,
              amount: { lt: 0 },
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            _sum: {
              amount: true,
            },
          });

          creditsSpent = Math.abs(spendAgg._sum.amount || 0);
          isParticipated = creditsSpent >= giveaway.requiredSpend;

          // Send in-site notification when user meets the participation threshold
          if (isParticipated) {
            const existingEntryNotif = await prisma.notification.findFirst({
              where: {
                userId: user.id,
                title: { contains: "Entered in the 3,000 Credits Mega Giveaway" },
              },
            });

            if (!existingEntryNotif) {
              await createNotification(
                user.id,
                "🎉 You're Entered in the 3,000 Credits Mega Giveaway!",
                `You've reached the 250-credit threshold and are officially entered into the 3,000 Permanent Credits Giveaway (1st: 1,500c · 2nd: 1,000c · 3rd: 500c). Good luck!`,
                "success"
              );
            }
          }
        } else {
          // Before launch, credit count is 0
          creditsSpent = 0;
          isParticipated = false;
        }
      }
    } catch (err) {
      console.error("[Giveaway Progress Error]:", err);
    }
  }

  // Process tiered winner rewards when timer is expired
  const winnersList: Array<{
    place: number;
    rankTitle: string;
    badge: string;
    name: string;
    email: string;
    prizeAmount: number;
    prizeDisplay: string;
    awarded: boolean;
    isCurrentUserWinner?: boolean;
  }> = [];

  if (isExpired) {
    try {
      // Find qualified participants
      const qualifiedUsers = await prisma.user.findMany({
        where: {
          creditTransactions: {
            some: {
              amount: { lt: 0 },
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
        select: { id: true, email: true, name: true, username: true, lifetimeCredits: true },
      });

      // Target winner or random qualified winners for 3 tiers
      const eligiblePool = [...qualifiedUsers];
      
      for (const tier of giveaway.prizes) {
        let winnerUser = eligiblePool.find(
          (u) => tier.place === 1 && u.email && u.email.toLowerCase() === TEST_WINNER_EMAIL.toLowerCase()
        );

        if (!winnerUser && eligiblePool.length > 0) {
          const randomIndex = Math.floor(Math.random() * eligiblePool.length);
          winnerUser = eligiblePool.splice(randomIndex, 1)[0];
        } else if (winnerUser) {
          const idx = eligiblePool.findIndex(u => u.id === winnerUser!.id);
          if (idx !== -1) eligiblePool.splice(idx, 1);
        }

        if (winnerUser) {
          // Check if prize has already been credited for this tier
          const existingReward = await prisma.creditTransaction.findFirst({
            where: {
              userId: winnerUser.id,
              transactionType: "giveaway_win",
              description: { contains: `${giveaway.id}-place-${tier.place}` },
            },
          });

          if (!existingReward) {
            await prisma.$transaction(async (tx) => {
              await tx.user.update({
                where: { id: winnerUser!.id },
                data: {
                  lifetimeCredits: winnerUser!.lifetimeCredits + tier.prizeAmount,
                },
              });

              await tx.creditTransaction.create({
                data: {
                  userId: winnerUser!.id,
                  amount: tier.prizeAmount,
                  balanceType: "lifetime",
                  transactionType: "giveaway_win",
                  description: `Won ${tier.prizeDisplay} (${tier.rankTitle}) in Exismic Giveaway (${giveaway.id}-place-${tier.place})`,
                },
              });
            });

            // Send in-site notification
            await createNotification(
              winnerUser.id,
              `🎉 You Won ${tier.prizeDisplay}!`,
              `Congratulations! You won ${tier.prizeDisplay} (${tier.rankTitle}) in the Exismic Mega Giveaway. They have been credited to your balance.`,
              "success"
            );

            // Send Resend Email
            if (winnerUser.email) {
              void sendGiveawayWinnerEmail({
                email: winnerUser.email,
                name: winnerUser.name || winnerUser.username || TEST_WINNER_NAME,
                prizeAmount: tier.prizeAmount,
              });
            }
          }

          winnersList.push({
            place: tier.place,
            rankTitle: tier.rankTitle,
            badge: tier.badge,
            name: winnerUser.name || winnerUser.username || TEST_WINNER_NAME,
            email: winnerUser.email || TEST_WINNER_EMAIL,
            prizeAmount: tier.prizeAmount,
            prizeDisplay: tier.prizeDisplay,
            awarded: true,
            isCurrentUserWinner: Boolean(userEmail && winnerUser.email && userEmail.toLowerCase() === winnerUser.email.toLowerCase()),
          });
        }
      }
    } catch (err) {
      console.error("[Giveaway Winner Awarding Error]:", err);
    }
  }

  const isCurrentUserWinner = winnersList.some((w) => w.isCurrentUserWinner);
  const currentStatus = isUpcoming ? "scheduled" : isExpired ? "ended" : "active";

  return {
    giveaway: {
      ...giveaway,
      status: currentStatus,
    },
    userProgress: {
      userId,
      creditsSpent,
      targetCredits: giveaway.requiredSpend,
      remainingCredits: Math.max(0, giveaway.requiredSpend - creditsSpent),
      percentage: Math.min(100, Math.round((creditsSpent / giveaway.requiredSpend) * 100)),
      isParticipated,
    },
    isUpcoming,
    isActive,
    isExpired,
    isCurrentUserWinner,
    winner: winnersList.length > 0 ? winnersList[0] : null,
    winners: winnersList,
  };
}
