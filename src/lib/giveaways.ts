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

export const CURRENT_GIVEAWAY: ActiveGiveawayConfig = {
  id: "giveaway-aug-2026-mega",
  title: "3,000 Permanent Credits Mega Giveaway",
  subtitle: "1st Place: 1,500c · 2nd Place: 1,000c · 3rd Place: 500c",
  totalPrizePool: 3000,
  prizeType: "lifetime_credits",
  prizeDisplay: "3,000 Permanent Credits Pool",
  winnersCount: 3,
  prizes: PRIZE_TIERS,
  requiredSpend: 250,
  startsAt: "2026-08-20T15:00:00+05:30", // Today at 3:00 PM
  endsAt: "2026-08-25T15:00:00+05:30",   // August 25, 3:00 PM
  status: "scheduled",
  terms: [
    "Spend at least 250 credits across any Exismic AI, Minecraft 3D Studio, or media tools during the giveaway window.",
    "Participation is 100% automatic once you reach 250 credits spent — no manual forms required.",
    "Only credits spent after the official launch will count towards entry qualification.",
    "3 winners will be drawn randomly: 1st Place (1,500c), 2nd Place (1,000c), and 3rd Place (500c).",
    "All prize credits are permanent Lifetime Credits that never expire and do not reset daily.",
    "Winners will have credits deposited automatically directly into their account balance.",
  ],
};

let isBroadcasting = false;

export async function broadcastGiveawayLaunch() {
  if (isBroadcasting) return;
  isBroadcasting = true;

  const giveaway = CURRENT_GIVEAWAY;
  try {
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, username: true },
    });

    const notifTitle = `🎁 Mega Giveaway Live: Win Up to 1,500 Credits!`;
    const notifMsg = `Spend 250+ credits across any Exismic tool to automatically enter for a chance to win 1,500 Permanent Lifetime Credits (3,000 Credits Total Pool)!`;

    for (const user of allUsers) {
      try {
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            title: notifTitle,
          },
        });

        if (!existingNotif) {
          await createNotification(user.id, notifTitle, notifMsg, "success");

          if (user.email) {
            void sendGiveawayLaunchAnnouncementEmail({
              email: user.email,
              name: user.name || user.username || "Creator",
            });
          }
        }
      } catch (userErr) {
        console.error(`[Giveaway Broadcast User Error: ${user.id}]`, userErr);
      }
    }
  } catch (err) {
    console.error("[Giveaway Launch Broadcast Error]:", err);
  } finally {
    isBroadcasting = false;
  }
}

export async function getUserGiveawayProgress(userId: string | null) {
  const giveaway = CURRENT_GIVEAWAY;
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
