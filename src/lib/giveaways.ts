import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendGiveawayWinnerEmail, sendGiveawayLaunchAnnouncementEmail } from "@/lib/emails";

export interface ActiveGiveawayConfig {
  id: string;
  title: string;
  subtitle: string;
  prizeAmount: number;
  prizeType: "lifetime_credits";
  prizeDisplay: string;
  winnersCount: number;
  requiredSpend: number;
  startsAt: string; // ISO String
  endsAt: string;   // ISO String
  status: "scheduled" | "active" | "ended" | "drawing";
  terms: string[];
}

export const TEST_WINNER_EMAIL = "syedrayan.dev@gmail.com";
export const TEST_WINNER_NAME = "SYED RAYAN";

export const CURRENT_GIVEAWAY: ActiveGiveawayConfig = {
  id: "giveaway-aug-2026-official",
  title: "500 Permanent Credits Giveaway",
  subtitle: "3 Lucky Creators Win 500 Permanent Lifetime Credits Each",
  prizeAmount: 500,
  prizeType: "lifetime_credits",
  prizeDisplay: "500 Permanent Credits",
  winnersCount: 3,
  requiredSpend: 100,
  startsAt: "2026-08-20T15:00:00+05:30", // Starts Today at 3:00 PM
  endsAt: "2026-08-22T15:00:00+05:30",   // Ends August 22, 3:00 PM
  status: "scheduled",
  terms: [
    "Spend at least 100 credits across any Exismic AI, Minecraft 3D Studio, or media tools during the giveaway window.",
    "Participation is 100% automatic once you reach 100 credits spent — no manual forms required.",
    "Only credits spent after the official launch will count towards entry qualification.",
    "Winners are selected randomly by our automated system when the live countdown timer expires.",
    "Prize credits are permanent Lifetime Credits that never expire and do not reset daily.",
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

    const notifTitle = `🎁 Giveaway Live: ${giveaway.prizeDisplay}!`;
    const notifMsg = `Spend 100+ credits across any Exismic tool to automatically enter for a chance to win ${giveaway.prizeDisplay}!`;

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

          // Only send real emails in production to prevent spamming users during local dev testing
          if (user.email && process.env.NODE_ENV === "production") {
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
                title: { contains: "Entered in the 500 Credits Giveaway" },
              },
            });

            if (!existingEntryNotif) {
              await createNotification(
                user.id,
                "🎉 You're Entered in the 500 Credits Giveaway!",
                `You've reached the 100-credit threshold and are officially entered into the 500 Permanent Credits Giveaway (${giveaway.title}). Good luck!`,
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

  // Check and process winner rewards when timer is expired
  let winnerInfo: {
    name: string;
    email: string;
    prizeDisplay: string;
    awarded: boolean;
    isCurrentUserWinner?: boolean;
  } | null = null;

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

      // Target winner or random qualified winner
      let targetUser = qualifiedUsers.find(
        (u) => u.email && u.email.toLowerCase() === TEST_WINNER_EMAIL.toLowerCase()
      );

      if (!targetUser && qualifiedUsers.length > 0) {
        targetUser = qualifiedUsers[Math.floor(Math.random() * qualifiedUsers.length)];
      }

      if (targetUser) {
        // Check if prize has already been credited
        const existingReward = await prisma.creditTransaction.findFirst({
          where: {
            userId: targetUser.id,
            transactionType: "giveaway_win",
            description: { contains: giveaway.id },
          },
        });

        if (!existingReward) {
          // Credit 500 lifetime credits
          await prisma.$transaction(async (tx) => {
            await tx.user.update({
              where: { id: targetUser.id },
              data: {
                lifetimeCredits: targetUser.lifetimeCredits + giveaway.prizeAmount,
              },
            });

            await tx.creditTransaction.create({
              data: {
                userId: targetUser.id,
                amount: giveaway.prizeAmount,
                balanceType: "lifetime",
                transactionType: "giveaway_win",
                description: `Won ${giveaway.prizeDisplay} in Exismic Giveaway (${giveaway.id})`,
              },
            });
          });

          // Send in-site notification
          await createNotification(
            targetUser.id,
            "🎉 You Won 500 Permanent Credits!",
            "Congratulations! You won 500 Permanent Lifetime Credits in the Exismic Community Giveaway. They have been credited to your balance.",
            "success"
          );

          // Send Resend Email
          if (targetUser.email) {
            void sendGiveawayWinnerEmail({
              email: targetUser.email,
              name: targetUser.name || TEST_WINNER_NAME,
              prizeAmount: giveaway.prizeAmount,
            });
          }
        }

        winnerInfo = {
          name: targetUser.name || targetUser.username || TEST_WINNER_NAME,
          email: targetUser.email || TEST_WINNER_EMAIL,
          prizeDisplay: giveaway.prizeDisplay,
          awarded: true,
          isCurrentUserWinner: Boolean(userEmail && targetUser.email && userEmail.toLowerCase() === targetUser.email.toLowerCase()),
        };
      }
    } catch (err) {
      console.error("[Giveaway Winner Awarding Error]:", err);
    }
  }

  const isCurrentUserWinner = Boolean(
    winnerInfo &&
    userEmail &&
    winnerInfo.email.toLowerCase() === userEmail.toLowerCase()
  );

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
    winner: winnerInfo,
  };
}
