import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        customAvatarUrl: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        subscriptionStatus: true,
        status: true,
        dailyCredits: true,
        bonusCredits: true,
        lifetimeCredits: true,
        dailyStreak: true,
        streakShields: true,
        lastClaimDate: true,
        streakFreezeUsedAt: true,
        streakMilestonesClaimed: true,
        sparks: true,
        lifetimeSparks: true,
        avatarFrame: true,
        nameGradient: true,
        insignia: true,
        canopy: true,
        themePreference: true,
        unlockedAvatarFrames: true,
        unlockedNameGradients: true,
        unlockedProfileThemes: true,
        unlockedInsignias: true,
        unlockedCanopies: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [
      questCompletions,
      vaultClaims,
      sparksRedemptions,
      paymentTransactions,
      promoRedemptions,
    ] = await Promise.all([
      prisma.sparksTransaction.findMany({
        where: {
          userId: id,
          source: { in: ["quest_completion", "quest_claim"] },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.creditShopClaim.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.sparksTransaction.findMany({
        where: {
          userId: id,
          OR: [
            { source: { in: ["shop_redemption", "free_gift_100"] } },
            { amount: { lt: 0 } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.paymentTransaction.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.promoRedemption.findMany({
        where: { userId: id },
        include: { promo: true },
        orderBy: { redeemedAt: "desc" },
        take: 30,
      }),
    ]);

    // Aggregate totals for this user
    const totalVaultCreditsWon = vaultClaims.reduce((sum, c) => sum + c.amount, 0);
    const totalQuestSparksEarned = questCompletions.reduce((sum, q) => sum + q.amount, 0);
    const totalSparksSpent = sparksRedemptions
      .filter((s) => s.amount < 0)
      .reduce((sum, s) => sum + Math.abs(s.amount), 0);

    return NextResponse.json({
      success: true,
      user,
      summary: {
        totalVaultClaims: vaultClaims.length,
        totalVaultCreditsWon,
        totalQuestsCompleted: questCompletions.length,
        totalQuestSparksEarned,
        totalSparksSpent,
        totalOrdersCount: paymentTransactions.length,
      },
      history: {
        questCompletions,
        vaultClaims,
        sparksRedemptions,
        paymentTransactions,
        promoRedemptions,
      },
    });
  } catch (error) {
    console.error("[ADMIN_USER_DOSSIER_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
