import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const rarity = searchParams.get("rarity") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (rarity !== "all") {
      where.rarity = rarity;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);

    const [
      claims,
      total,
      totalClaimsCount,
      creditsAggregate,
      claimsTodayCount,
      topStreakers,
      activeStreakersCount,
      maxStreakUser,
    ] = await Promise.all([
      prisma.creditShopClaim.findMany({
        where,
        select: {
          id: true,
          userId: true,
          claimDate: true,
          rarity: true,
          amount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              image: true,
              customAvatarUrl: true,
              avatarFrame: true,
              nameGradient: true,
              insignia: true,
              plan: true,
              dailyStreak: true,
              streakShields: true,
              lastClaimDate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.creditShopClaim.count({ where }),
      prisma.creditShopClaim.count(),
      prisma.creditShopClaim.aggregate({
        _sum: { amount: true },
        _avg: { amount: true },
      }),
      prisma.creditShopClaim.count({
        where: { createdAt: { gte: todayUtc } },
      }),
      prisma.user.findMany({
        where: { dailyStreak: { gt: 0 } },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
          customAvatarUrl: true,
          avatarFrame: true,
          nameGradient: true,
          insignia: true,
          plan: true,
          dailyStreak: true,
          streakShields: true,
          lastClaimDate: true,
          sparks: true,
          _count: {
            select: { creditShopClaims: true },
          },
        },
        orderBy: [{ dailyStreak: "desc" }, { lastClaimDate: "desc" }],
        take: 20,
      }),
      prisma.user.count({
        where: { dailyStreak: { gt: 0 } },
      }),
      prisma.user.findFirst({
        orderBy: { dailyStreak: "desc" },
        select: { dailyStreak: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalVaultClaims: totalClaimsCount,
        totalCreditsGranted: creditsAggregate._sum.amount ?? 0,
        claimsToday: claimsTodayCount,
        avgCreditsPerDrop: Math.round(creditsAggregate._avg.amount ?? 0),
        activeStreakers: activeStreakersCount,
        maxStreak: maxStreakUser?.dailyStreak ?? 0,
      },
      topStreakers,
      claims,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[ADMIN_VAULT_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
