import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";
import { CURRENT_GIVEAWAY, PRIZE_TIERS } from "@/lib/giveaways";

export async function GET(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // "all" | "qualified" | "in_progress"
    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));

    const giveaway = CURRENT_GIVEAWAY;
    if (!giveaway) {
      return NextResponse.json({
        success: true,
        giveaway: null,
        stats: {
          totalParticipants: 0,
          qualifiedParticipants: 0,
          inProgressParticipants: 0,
          totalCreditsBurned: 0,
          averageSpendPerUser: 0,
          requiredThreshold: 250,
          totalPrizePool: 0,
          windowStartsAt: null,
          windowEndsAt: null,
          isUpcoming: false,
          isActive: false,
          isEnded: true,
        },
        participants: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      });
    }

    const startDate = new Date(giveaway.startsAt);
    const endDate = new Date(giveaway.endsAt);
    const now = new Date();

    const isUpcoming = now.getTime() < startDate.getTime();
    const isActive = now.getTime() >= startDate.getTime() && now.getTime() < endDate.getTime();
    const isEnded = now.getTime() >= endDate.getTime();

    // 1. Fetch all debit credit transactions in the giveaway window
    const windowTransactions = await prisma.creditTransaction.findMany({
      where: {
        amount: { lt: 0 },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        userId: true,
        amount: true,
        toolId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // 2. Aggregate spend per user
    const userSpendMap = new Map<string, {
      totalSpent: number;
      firstSpendAt: Date;
      lastSpendAt: Date;
      toolsUsed: Set<string>;
    }>();

    for (const tx of windowTransactions) {
      const existing = userSpendMap.get(tx.userId);
      const spentAmount = Math.abs(tx.amount);
      if (existing) {
        existing.totalSpent += spentAmount;
        existing.lastSpendAt = tx.createdAt;
        if (tx.toolId) existing.toolsUsed.add(tx.toolId);
      } else {
        const toolsSet = new Set<string>();
        if (tx.toolId) toolsSet.add(tx.toolId);
        userSpendMap.set(tx.userId, {
          totalSpent: spentAmount,
          firstSpendAt: tx.createdAt,
          lastSpendAt: tx.createdAt,
          toolsUsed: toolsSet,
        });
      }
    }

    const participantUserIds = Array.from(userSpendMap.keys());

    // 3. Fetch user accounts for all participants
    const users = await prisma.user.findMany({
      where: {
        id: { in: participantUserIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        customAvatarUrl: true,
        plan: true,
        subscriptionStatus: true,
        status: true,
        dailyCredits: true,
        bonusCredits: true,
        lifetimeCredits: true,
        createdAt: true,
      },
    });

    // 4. Transform into structured participant records
    let participants = users.map((u) => {
      const spendData = userSpendMap.get(u.id);
      const creditsSpent = spendData?.totalSpent || 0;
      const isQualified = creditsSpent >= giveaway.requiredSpend;
      const progressPercent = Math.min(100, Math.round((creditsSpent / giveaway.requiredSpend) * 100));

      return {
        id: u.id,
        name: u.name || u.username || "Creator",
        email: u.email || "No Email",
        username: u.username,
        avatar: u.customAvatarUrl || u.image,
        plan: u.plan || (u.subscriptionStatus === "active" ? "pro" : "free"),
        status: u.status || "active",
        currentBalance: u.dailyCredits + u.bonusCredits + u.lifetimeCredits,
        creditsSpent,
        requiredSpend: giveaway.requiredSpend,
        progressPercent,
        isQualified,
        firstSpendAt: spendData?.firstSpendAt || u.createdAt,
        lastSpendAt: spendData?.lastSpendAt || u.createdAt,
        toolsUsedCount: spendData?.toolsUsed.size || 0,
        toolsUsedList: Array.from(spendData?.toolsUsed || []),
      };
    });

    // 5. Compute global statistics
    const totalParticipants = participants.length;
    const qualifiedParticipants = participants.filter((p) => p.isQualified);
    const inProgressParticipants = participants.filter((p) => !p.isQualified);
    const totalCreditsSpentInWindow = participants.reduce((acc, p) => acc + p.creditsSpent, 0);
    const avgCreditsSpent = totalParticipants > 0 ? Math.round(totalCreditsSpentInWindow / totalParticipants) : 0;

    // 6. Search and Filter
    if (searchQuery) {
      participants = participants.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.email.toLowerCase().includes(searchQuery) ||
          (p.username && p.username.toLowerCase().includes(searchQuery))
      );
    }

    if (filter === "qualified") {
      participants = participants.filter((p) => p.isQualified);
    } else if (filter === "in_progress") {
      participants = participants.filter((p) => !p.isQualified);
    }

    // Sort by highest credits spent first
    participants.sort((a, b) => b.creditsSpent - a.creditsSpent);

    // 7. Paginate
    const totalFiltered = participants.length;
    const paginatedParticipants = participants.slice((page - 1) * limit, page * limit);

    // 8. Fetch any already recorded giveaway winner transactions for audit
    const awardedWinners = await prisma.creditTransaction.findMany({
      where: {
        transactionType: "giveaway_win",
        description: { contains: giveaway.id },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, username: true, image: true, customAvatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      giveaway: {
        id: giveaway.id,
        title: giveaway.title,
        subtitle: giveaway.subtitle,
        totalPrizePool: giveaway.totalPrizePool,
        prizeDisplay: giveaway.prizeDisplay,
        requiredSpend: giveaway.requiredSpend,
        prizes: PRIZE_TIERS,
        startsAt: giveaway.startsAt,
        endsAt: giveaway.endsAt,
        status: isEnded ? "ended" : isActive ? "active" : "scheduled",
      },
      stats: {
        totalParticipants,
        qualifiedCount: qualifiedParticipants.length,
        inProgressCount: inProgressParticipants.length,
        totalCreditsSpentInWindow,
        avgCreditsSpent,
        estimatedWinChancePercent:
          qualifiedParticipants.length > 0
            ? Math.min(100, Number(((3 / qualifiedParticipants.length) * 100).toFixed(1)))
            : 100,
      },
      participants: paginatedParticipants,
      awardedWinners: awardedWinners.map((w) => ({
        id: w.id,
        userId: w.userId,
        userName: w.user.name || w.user.username || "Winner",
        userEmail: w.user.email,
        avatar: w.user.customAvatarUrl || w.user.image,
        prizeAmount: w.amount,
        description: w.description,
        awardedAt: w.createdAt,
      })),
      pagination: {
        page,
        limit,
        totalCount: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[ADMIN_GIVEAWAY_MODERATION_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch giveaway moderation data" }, { status: 500 });
  }
}
