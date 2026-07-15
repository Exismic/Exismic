import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";

export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const [
      totalUsers,
      proUsers,
      creditsAggregate,
      totalReferrals,
      generationsAggregate,
      totalTransactions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: "pro" } }),
      prisma.user.aggregate({
        _sum: {
          dailyCredits: true,
          bonusCredits: true,
        }
      }),
      prisma.referral.count(),
      prisma.user.aggregate({
        _sum: {
          aiGenerationsUsed: true,
        }
      }),
      prisma.creditTransaction.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        proUsers,
        totalCredits: (creditsAggregate._sum.dailyCredits ?? 0) + (creditsAggregate._sum.bonusCredits ?? 0),
        totalReferrals,
        totalGenerations: generationsAggregate._sum.aiGenerationsUsed ?? 0,
        totalTransactions,
      }
    });
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
