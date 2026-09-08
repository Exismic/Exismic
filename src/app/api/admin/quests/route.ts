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
    const type = searchParams.get("type") || "all"; // all | daily | weekly
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    // Base filter for quest completions
    const where: any = {
      source: { in: ["quest_completion", "quest_claim"] },
    };

    if (type === "daily") {
      where.OR = [
        { description: { contains: "Daily", mode: "insensitive" } },
        { metadata: { path: ["questType"], equals: "daily" } },
      ];
    } else if (type === "weekly") {
      where.OR = [
        { description: { contains: "Weekly", mode: "insensitive" } },
        { metadata: { path: ["questType"], equals: "weekly" } },
      ];
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

    // Parallel execution: fetch stats + paginated list + total
    const [
      transactions,
      total,
      totalQuestsCount,
      sparksAggregate,
      dailyCount,
      weeklyCount,
    ] = await Promise.all([
      prisma.sparksTransaction.findMany({
        where,
        select: {
          id: true,
          userId: true,
          amount: true,
          balanceAfter: true,
          source: true,
          description: true,
          metadata: true,
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
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.sparksTransaction.count({ where }),
      prisma.sparksTransaction.count({
        where: { source: { in: ["quest_completion", "quest_claim"] } },
      }),
      prisma.sparksTransaction.aggregate({
        where: { source: { in: ["quest_completion", "quest_claim"] } },
        _sum: { amount: true },
      }),
      prisma.sparksTransaction.count({
        where: {
          source: { in: ["quest_completion", "quest_claim"] },
          OR: [
            { description: { contains: "Daily", mode: "insensitive" } },
            { metadata: { path: ["questType"], equals: "daily" } },
          ],
        },
      }),
      prisma.sparksTransaction.count({
        where: {
          source: { in: ["quest_completion", "quest_claim"] },
          OR: [
            { description: { contains: "Weekly", mode: "insensitive" } },
            { metadata: { path: ["questType"], equals: "weekly" } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalQuestsClaimed: totalQuestsCount,
        totalSparksAwarded: sparksAggregate._sum.amount ?? 0,
        dailyQuestsCompleted: dailyCount,
        weeklyQuestsCompleted: weeklyCount,
      },
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[ADMIN_QUESTS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
