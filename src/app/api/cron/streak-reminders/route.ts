import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendStreakExpiryWarningEmail } from "@/lib/emails";
import { getTodayInIndia } from "@/lib/credits";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/streak-reminders
 * Triggered periodically (e.g. hourly or 4h before noon IST).
 * Finds users with active streaks (>= 2 days) who haven't claimed today,
 * where remaining hours <= 8, and sends an urgent streak-saver email.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const expectedAuth = cronSecret ? `Bearer ${cronSecret}` : null;

  if (expectedAuth && authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();

  try {
    const now = new Date();
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const nowIST = new Date(istString);

    const nextResetIST = new Date(nowIST);
    nextResetIST.setHours(12, 0, 0, 0);
    if (nowIST.getTime() >= nextResetIST.getTime()) {
      nextResetIST.setDate(nextResetIST.getDate() + 1);
    }

    const diffMs = nextResetIST.getTime() - nowIST.getTime();
    const hoursRemaining = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));

    // Only send if reset is approaching (within 8 hours)
    if (hoursRemaining > 8) {
      return NextResponse.json({
        success: true,
        message: `Skipping streak reminders: ${hoursRemaining}h remaining until 12:00 PM IST reset (> 8h threshold).`,
        hoursRemaining,
      });
    }

    const today = getTodayInIndia();
    const eighteenHoursAgo = new Date(now.getTime() - 18 * 60 * 60 * 1000);

    // Find users with streak >= 2 who haven't been reminded recently
    const candidateUsers = await prisma.user.findMany({
      where: {
        dailyStreak: { gte: 2 },
        email: { not: null },
        OR: [
          { lastStreakReminderSentAt: null },
          { lastStreakReminderSentAt: { lte: eighteenHoursAgo } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        dailyStreak: true,
        streakShields: true,
        lastClaimDate: true,
      },
      take: 200, // Batch limit per cron run
    });

    let emailsSent = 0;
    const sentUserIds: string[] = [];

    for (const user of candidateUsers) {
      if (!user.email) continue;

      // Check if user already claimed today
      const alreadyClaimed = await prisma.creditShopClaim.findUnique({
        where: {
          userId_claimDate: {
            userId: user.id,
            claimDate: today,
          },
        },
        select: { id: true },
      });

      if (alreadyClaimed) continue;

      // Send the streak expiry reminder email
      const sent = await sendStreakExpiryWarningEmail({
        email: user.email,
        name: user.name,
        streak: user.dailyStreak || 1,
        hoursRemaining,
        hasShield: (user.streakShields || 0) > 0,
      });

      if (sent) {
        emailsSent += 1;
        sentUserIds.push(user.id);
      }
    }

    // Update lastStreakReminderSentAt timestamp for notified users
    if (sentUserIds.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: sentUserIds } },
        data: { lastStreakReminderSentAt: now },
      });
    }

    const duration = Date.now() - start;
    return NextResponse.json({
      success: true,
      message: `Sent ${emailsSent} streak reminder emails in ${duration}ms.`,
      hoursRemaining,
      emailsSent,
      usersEvaluated: candidateUsers.length,
    });
  } catch (err) {
    console.error("[CRON_STREAK_REMINDERS_ERROR]", err);
    return NextResponse.json(
      { error: "Streak reminder cron failed", details: String(err) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
