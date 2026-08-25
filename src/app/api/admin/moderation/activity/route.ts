import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";

export async function GET(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const toolFilter = searchParams.get("toolId") || "";
    const searchQuery = (searchParams.get("search") || "").trim();
    const filterType = searchParams.get("type") || "all"; // "all" | "spends" | "media" | "errors"

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Calculate 24h summary metrics for dashboard cards
    const [
      transactionsTodayCount,
      spendsTodayAgg,
      failedJobsCount,
      totalUsersCount,
    ] = await Promise.all([
      prisma.creditTransaction.count({
        where: {
          createdAt: { gte: oneDayAgo },
          amount: { lt: 0 },
        },
      }),
      prisma.creditTransaction.aggregate({
        where: {
          createdAt: { gte: oneDayAgo },
          amount: { lt: 0 },
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.job.count({
        where: {
          createdAt: { gte: oneDayAgo },
          status: "FAILED",
        },
      }),
      prisma.user.count(),
    ]);

    const totalCreditsSpentToday = Math.abs(spendsTodayAgg._sum.amount || 0);

    // 2. Build where filter for CreditTransactions
    const whereClause: any = {
      amount: { lt: 0 }, // tool spend events
    };

    if (toolFilter) {
      whereClause.toolId = toolFilter;
    }

    if (searchQuery) {
      whereClause.user = {
        OR: [
          { email: { contains: searchQuery, mode: "insensitive" } },
          { name: { contains: searchQuery, mode: "insensitive" } },
          { username: { contains: searchQuery, mode: "insensitive" } },
        ],
      };
    }

    // 3. Fetch paginated recent transactions
    const [transactions, totalCount] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              image: true,
              customAvatarUrl: true,
              plan: true,
              role: true,
              status: true,
              subscriptionStatus: true,
              dailyCredits: true,
              bonusCredits: true,
              lifetimeCredits: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.creditTransaction.count({ where: whereClause }),
    ]);

    // 4. Fetch recent media outputs from UserFile to cross-reference previews
    const userIdsInBatch = Array.from(new Set(transactions.map((t) => t.userId)));
    const relatedFiles = await prisma.userFile.findMany({
      where: {
        userId: { in: userIdsInBatch },
        createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        userId: true,
        toolType: true,
        originalName: true,
        resultUrl: true,
        fileType: true,
        status: true,
        createdAt: true,
        metadata: true,
      },
    });

    // 5. Build enriched activity items
    const activities = transactions.map((t) => {
      // Find matching output file if available around the transaction time
      const matchedFile = relatedFiles.find(
        (f) =>
          f.userId === t.userId &&
          Math.abs(new Date(f.createdAt).getTime() - new Date(t.createdAt).getTime()) < 60000
      );

      return {
        id: t.id,
        userId: t.userId,
        user: {
          id: t.user.id,
          name: t.user.name || t.user.username || "Creator",
          email: t.user.email,
          username: t.user.username,
          avatar: t.user.customAvatarUrl || t.user.image,
          plan: t.user.plan || (t.user.subscriptionStatus === "active" ? "pro" : "free"),
          status: t.user.status || "active",
          role: t.user.role,
          totalCreditsRemaining: t.user.dailyCredits + t.user.bonusCredits + t.user.lifetimeCredits,
          joinedAt: t.user.createdAt,
        },
        toolId: t.toolId || (t.metadata as any)?.toolId || "exismic-tool",
        toolType: (t.metadata as any)?.toolType || t.toolId || "general",
        amountSpent: Math.abs(t.amount),
        balanceType: t.balanceType,
        transactionType: t.transactionType,
        description: t.description || "Used AI Tool",
        metadata: t.metadata || {},
        mediaPreview: matchedFile
          ? {
              id: matchedFile.id,
              resultUrl: matchedFile.resultUrl,
              fileType: matchedFile.fileType,
              originalName: matchedFile.originalName,
            }
          : null,
        createdAt: t.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        executionsToday: transactionsTodayCount,
        creditsSpentToday: totalCreditsSpentToday,
        failedJobsToday: failedJobsCount,
        totalUsers: totalUsersCount,
      },
      activities,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[ADMIN_MODERATION_ACTIVITY_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch moderation activity logs" }, { status: 500 });
  }
}
