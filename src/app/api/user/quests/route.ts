import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { 
  getDailyCycleInfo, 
  getWeeklyCycleInfo, 
  generateQuestsForUser, 
  UserActivityData,
  QuestItem
} from "@/lib/quests";
import { addBonusCredits } from "@/lib/credits";
import { addSparks } from "@/lib/sparks";
import { getOrCreateUser } from "@/lib/user-access";

export const dynamic = "force-dynamic";

const VISUAL_TOOL_IDS = [
  "image-minecraft-skin",
  "minecraft-skin-maker",
  "ai-img-gen",
  "ai-logo",
  "image-restorer",
  "image-bg-remover",
  "bg-remove",
  "image-eraser",
  "icon-generator",
  "svg-generator",
];

const DOC_TOOL_IDS = [
  "pdf-to-notes",
  "pdf-sidebar",
  "resume-analyzer",
  "plagiarism-checker",
  "schema-markup-generator",
  "flashcard-generator",
  "linkedin-formatter",
];

function buildActivityData(
  recentTx: Array<{ toolId: string | null; transactionType: string; description: string | null; amount: number; createdAt: Date }>,
  shopClaims: Array<{ createdAt: Date }>,
  userFiles: Array<{ createdAt: Date; toolType: string }>,
  chatSessions: Array<{ updatedAt: Date }>,
  communityInteractionsCount: number,
  sinceDate: Date
): UserActivityData {
  const txInWindow = recentTx.filter((t) => t.createdAt >= sinceDate);
  const claimsInWindow = shopClaims.filter((c) => c.createdAt >= sinceDate);
  const filesInWindow = userFiles.filter((f) => f.createdAt >= sinceDate);
  const chatsInWindow = chatSessions.filter((c) => c.updatedAt >= sinceDate);

  const distinctTools = new Set(
    txInWindow.filter((t) => t.toolId && t.toolId !== "chat" && t.toolId !== "vault").map((t) => t.toolId as string)
  );

  const visualTxCount = txInWindow.filter((t) => t.toolId && VISUAL_TOOL_IDS.includes(t.toolId)).length;
  const visualFilesCount = filesInWindow.filter((f) => VISUAL_TOOL_IDS.includes(f.toolType) || f.toolType === "image" || f.toolType === "skin").length;
  const visualCraftCount = visualTxCount + visualFilesCount;

  const chatTxCount = txInWindow.filter((t) => 
    t.toolId === "chat" || 
    t.toolId === "ai-chat" || 
    t.transactionType === "chat_message" || 
    (t.description && t.description.toLowerCase().includes("chat"))
  ).length;
  const chatCount = chatsInWindow.length + chatTxCount;

  const vaultClaimedCount = claimsInWindow.length + txInWindow.filter((t) => 
    t.transactionType === "daily_vault" || 
    (t.description && (t.description.toLowerCase().includes("vault") || t.description.toLowerCase().includes("daily bonus")))
  ).length;

  const docProcessCount = txInWindow.filter((t) => t.toolId && DOC_TOOL_IDS.includes(t.toolId)).length +
    filesInWindow.filter((f) => DOC_TOOL_IDS.includes(f.toolType) || f.toolType === "pdf").length;

  const totalCreationsCount = filesInWindow.length + txInWindow.filter((t) => t.toolId).length;

  const totalCreditsSpent = txInWindow.reduce((acc, t) => {
    if (t.amount < 0) return acc + Math.abs(t.amount);
    if (t.transactionType === "tool_usage" || t.transactionType === "generation") return acc + Math.abs(t.amount);
    return acc;
  }, 0);

  return {
    distinctToolsUsed: distinctTools.size,
    visualCraftCount,
    chatCount,
    vaultClaimedCount: vaultClaimedCount > 0 ? vaultClaimedCount : 0,
    docProcessCount,
    totalCreationsCount,
    totalCreditsSpent,
    communityInteractions: communityInteractionsCount,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    const userId = dbUser.id;

    const dailyCycle = getDailyCycleInfo();
    const weeklyCycle = getWeeklyCycleInfo();

    // The weekly cycle start is always earlier or equal to daily cycle start
    const windowStart = weeklyCycle.cycleStartUTC < dailyCycle.cycleStartUTC 
      ? weeklyCycle.cycleStartUTC 
      : dailyCycle.cycleStartUTC;

    // Fetch user activity from DB in a single consolidated batch
    const [
      recentTx,
      shopClaims,
      userFiles,
      chatSessions,
      userContext
    ] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: {
          userId,
          createdAt: { gte: windowStart },
        },
        select: { toolId: true, transactionType: true, description: true, amount: true, createdAt: true },
      }),
      prisma.creditShopClaim.findMany({
        where: {
          userId,
          createdAt: { gte: windowStart },
        },
        select: { createdAt: true },
      }),
      prisma.userFile.findMany({
        where: {
          userId,
          createdAt: { gte: windowStart },
        },
        select: { createdAt: true, toolType: true },
      }),
      prisma.chatSession.findMany({
        where: {
          userId,
          updatedAt: { gte: windowStart },
        },
        select: { updatedAt: true },
      }),
      prisma.userContext.findUnique({
        where: { userId },
        select: { preferences: true },
      }),
    ]);

    const communityInteractions = 0;

    // Build Activity Data for Daily and Weekly
    const dailyActivity = buildActivityData(
      recentTx,
      shopClaims,
      userFiles,
      chatSessions,
      communityInteractions,
      dailyCycle.cycleStartUTC
    );

    const weeklyActivity = buildActivityData(
      recentTx,
      shopClaims,
      userFiles,
      chatSessions,
      communityInteractions,
      weeklyCycle.cycleStartUTC
    );

    // Extract claimed quest IDs
    let claimedDailyQuests: string[] = [];
    let claimedWeeklyQuests: string[] = [];

    if (userContext?.preferences) {
      try {
        const parsed = JSON.parse(userContext.preferences);
        if (parsed.claimedDailyDate === dailyCycle.cycleKey) {
          claimedDailyQuests = parsed.claimedDailyQuests || [];
        } else if (parsed.claimedQuestsDate === dailyCycle.cycleKey) {
          claimedDailyQuests = parsed.claimedQuests || [];
        }

        if (parsed.claimedWeeklyDate === weeklyCycle.cycleKey) {
          claimedWeeklyQuests = parsed.claimedWeeklyQuests || [];
        }
      } catch {}
    }

    // Generate deterministic randomized daily & weekly quests
    const dailyQuests = generateQuestsForUser(
      userId,
      "daily",
      dailyCycle.cycleKey,
      dailyActivity,
      claimedDailyQuests,
      4
    );

    const weeklyQuests = generateQuestsForUser(
      userId,
      "weekly",
      weeklyCycle.cycleKey,
      weeklyActivity,
      claimedWeeklyQuests,
      4
    );

    const dailyCompleted = dailyQuests.filter((q) => q.completed).length;
    const dailyUnclaimed = dailyQuests.filter((q) => q.completed && !q.claimed).length;

    const weeklyCompleted = weeklyQuests.filter((q) => q.completed).length;
    const weeklyUnclaimed = weeklyQuests.filter((q) => q.completed && !q.claimed).length;

    const totalUnclaimed = dailyUnclaimed + weeklyUnclaimed;
    const totalCompleted = dailyCompleted + weeklyCompleted;
    const totalAvailable = dailyQuests.length + weeklyQuests.length;

    return NextResponse.json({
      daily: {
        quests: dailyQuests,
        totalCompleted: dailyCompleted,
        totalAvailable: dailyQuests.length,
        unclaimedCount: dailyUnclaimed,
        cycleKey: dailyCycle.cycleKey,
        nextResetUTC: dailyCycle.nextResetUTC.toISOString(),
      },
      weekly: {
        quests: weeklyQuests,
        totalCompleted: weeklyCompleted,
        totalAvailable: weeklyQuests.length,
        unclaimedCount: weeklyUnclaimed,
        cycleKey: weeklyCycle.cycleKey,
        nextResetUTC: weeklyCycle.nextResetUTC.toISOString(),
      },
      quests: dailyQuests,
      totalCompleted,
      totalAvailable,
      totalUnclaimed,
      unclaimedCount: totalUnclaimed,
      cycleKey: dailyCycle.cycleKey,
      nextResetUTC: dailyCycle.nextResetUTC.toISOString(),
      resetLabel: "12:00 PM",
    });
  } catch (error) {
    console.error("[API_QUESTS_ERROR]", error);
    return NextResponse.json({ error: "Failed to load quests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    const userId = dbUser.id;

    const body = await request.json();
    const { questId, questType: providedType } = body;

    if (!questId) {
      return NextResponse.json({ error: "Quest ID is required" }, { status: 400 });
    }

    // Determine type ("daily" or "weekly")
    const isWeekly = providedType === "weekly" || String(questId).startsWith("weekly_");
    const questType: "daily" | "weekly" = isWeekly ? "weekly" : "daily";

    const dailyCycle = getDailyCycleInfo();
    const weeklyCycle = getWeeklyCycleInfo();
    const activeCycle = questType === "weekly" ? weeklyCycle : dailyCycle;

    const windowStart = activeCycle.cycleStartUTC;

    const [
      recentTx,
      shopClaims,
      userFiles,
      chatSessions,
      communityLikesResult,
      communityPostsResult,
      userContext
    ] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: {
          userId,
          createdAt: { gte: windowStart },
        },
        select: { toolId: true, transactionType: true, description: true, amount: true, createdAt: true },
      }),
      prisma.creditShopClaim.findMany({
        where: {
          userId,
          createdAt: { gte: windowStart },
        },
        select: { createdAt: true },
      }),
      prisma.userFile.findMany({
        where: {
          userId,
          createdAt: { gte: windowStart },
        },
        select: { createdAt: true, toolType: true },
      }),
      prisma.chatSession.findMany({
        where: {
          userId,
          updatedAt: { gte: windowStart },
        },
        select: { updatedAt: true },
      }),
      prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int as count FROM community_likes 
        WHERE user_id = ${userId} AND created_at >= ${windowStart}
      `.catch(() => [{ count: 0 }]),
      prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int as count FROM community_posts 
        WHERE user_id = ${userId} AND created_at >= ${windowStart}
      `.catch(() => [{ count: 0 }]),
      prisma.userContext.findUnique({
        where: { userId },
      }),
    ]);

    const communityLikes = Number(communityLikesResult?.[0]?.count || 0);
    const communityPosts = Number(communityPostsResult?.[0]?.count || 0);
    const communityInteractions = communityLikes + communityPosts;

    let currentPreferences: Record<string, any> = {};
    if (userContext?.preferences) {
      try {
        currentPreferences = JSON.parse(userContext.preferences);
      } catch {}
    }

    const claimedDailyQuests: string[] =
      currentPreferences.claimedDailyDate === dailyCycle.cycleKey
        ? currentPreferences.claimedDailyQuests || []
        : [];

    const claimedWeeklyQuests: string[] =
      currentPreferences.claimedWeeklyDate === weeklyCycle.cycleKey
        ? currentPreferences.claimedWeeklyQuests || []
        : [];

    const claimedList = questType === "weekly" ? claimedWeeklyQuests : claimedDailyQuests;

    // Build Activity Data and recreate the active quests
    const activity = buildActivityData(
      recentTx,
      shopClaims,
      userFiles,
      chatSessions,
      communityInteractions,
      windowStart
    );

    const userQuests = generateQuestsForUser(
      userId,
      questType,
      activeCycle.cycleKey,
      activity,
      claimedList,
      4
    );

    const normalizedQuestId = String(questId).replace(/^(daily_|weekly_)/, "");
    const quest = userQuests.find(
      (q) => 
        q.id === questId || 
        q.templateId === questId || 
        q.templateId === normalizedQuestId ||
        `${questType}_${q.templateId}` === questId
    );

    if (!quest) {
      return NextResponse.json({ error: "Quest not found in active cycle" }, { status: 404 });
    }

    if (quest.claimed || claimedList.includes(quest.templateId) || claimedList.includes(quest.id)) {
      return NextResponse.json({ error: "Quest reward already claimed for this cycle" }, { status: 400 });
    }

    // Award Exismic Sparks
    const rewardSparks = quest.rewardSparks || quest.rewardCredits || 15;
    const reason = `${questType === "weekly" ? "Weekly" : "Daily"} Quest Reward: ${quest.title}`;
    
    const sparksResult = await addSparks(userId, rewardSparks, "quest_completion", reason, {
      questId: quest.id,
      templateId: quest.templateId,
      questType,
      cycleKey: activeCycle.cycleKey,
    });

    // Update preferences in userContext
    if (questType === "weekly") {
      if (!claimedWeeklyQuests.includes(quest.templateId)) {
        claimedWeeklyQuests.push(quest.templateId);
      }
      currentPreferences.claimedWeeklyDate = weeklyCycle.cycleKey;
      currentPreferences.claimedWeeklyQuests = claimedWeeklyQuests;
    } else {
      if (!claimedDailyQuests.includes(quest.templateId)) {
        claimedDailyQuests.push(quest.templateId);
      }
      currentPreferences.claimedDailyDate = dailyCycle.cycleKey;
      currentPreferences.claimedDailyQuests = claimedDailyQuests;
      currentPreferences.claimedQuestsDate = dailyCycle.cycleKey;
      currentPreferences.claimedQuests = claimedDailyQuests;
    }

    await prisma.userContext.upsert({
      where: { userId },
      create: {
        userId,
        preferences: JSON.stringify(currentPreferences),
      },
      update: {
        preferences: JSON.stringify(currentPreferences),
      },
    });

    return NextResponse.json({
      success: true,
      rewardSparks,
      rewardCredits: rewardSparks,
      sparksBalance: sparksResult.balance,
      claimedQuestId: quest.id,
      questType,
    });
  } catch (error) {
    console.error("[API_CLAIM_QUEST_ERROR]", error);
    return NextResponse.json({ error: "Failed to claim reward" }, { status: 500 });
  }
}

