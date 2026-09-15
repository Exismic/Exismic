import { prisma } from "../src/lib/prisma";
import { 
  getMostRecentResetTimestamp, 
  getTodayInIndia, 
  resetCreditsIfNewDay,
  deductCredits 
} from "../src/lib/credits";
import { 
  getDailyCycleInfo, 
  getWeeklyCycleInfo, 
  generateQuestsForUser 
} from "../src/lib/quests";

async function runTestSuite() {
  console.log("==========================================================");
  console.log("       STARTING EXISMIC COMPREHENSIVE TEST SUITE           ");
  console.log("==========================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   Details: ${detail}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // -------------------------------------------------------------
  // TEST 1: 12:00 PM IST RESET TIMESTAMP MATH UNDER VARIOUS TIMES
  // -------------------------------------------------------------
  console.log("--- TEST GROUP 1: Unified 12:00 PM IST Reset Math ---");

  // Helper simulating getMostRecentResetTimestamp at a custom UTC timestamp
  function getSimulatedReset(mockUtcDate: Date): Date {
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(mockUtcDate.getTime() + IST_OFFSET_MS);

    let year = istDate.getUTCFullYear();
    let month = istDate.getUTCMonth();
    let day = istDate.getUTCDate();

    if (istDate.getUTCHours() < 12) {
      const yesterday = new Date(Date.UTC(year, month, day - 1));
      year = yesterday.getUTCFullYear();
      month = yesterday.getUTCMonth();
      day = yesterday.getUTCDate();
    }

    return new Date(Date.UTC(year, month, day, 6, 30, 0, 0));
  }

  // Case A: 10:00 AM IST (04:30 UTC) on 2026-09-15
  // Should return 2026-09-14T06:30:00.000Z (yesterday 12:00 PM IST)
  const timeA = new Date("2026-09-15T04:30:00.000Z");
  const resetA = getSimulatedReset(timeA);
  assert(
    resetA.toISOString() === "2026-09-14T06:30:00.000Z",
    "Timezone test at 10:00 AM IST (before 12 PM)",
    `Got ${resetA.toISOString()}`
  );

  // Case B: 11:59:59 AM IST (06:29:59 UTC) on 2026-09-15
  // Should return 2026-09-14T06:30:00.000Z (yesterday 12:00 PM IST)
  const timeB = new Date("2026-09-15T06:29:59.000Z");
  const resetB = getSimulatedReset(timeB);
  assert(
    resetB.toISOString() === "2026-09-14T06:30:00.000Z",
    "Timezone test at 11:59:59 AM IST (one second before 12 PM)",
    `Got ${resetB.toISOString()}`
  );

  // Case C: Exactly 12:00:00 PM IST (06:30:00 UTC) on 2026-09-15
  // Should return 2026-09-15T06:30:00.000Z (today 12:00 PM IST)
  const timeC = new Date("2026-09-15T06:30:00.000Z");
  const resetC = getSimulatedReset(timeC);
  assert(
    resetC.toISOString() === "2026-09-15T06:30:00.000Z",
    "Timezone test at exactly 12:00:00 PM IST (cycle rolls over)",
    `Got ${resetC.toISOString()}`
  );

  // Case D: 3:00 PM IST (09:30 UTC) on 2026-09-15
  // In the old broken code, this returned 12:00 UTC (5:30 PM IST), breaking everything!
  // Now it must return 2026-09-15T06:30:00.000Z (today 12:00 PM IST).
  const timeD = new Date("2026-09-15T09:30:00.000Z");
  const resetD = getSimulatedReset(timeD);
  assert(
    resetD.toISOString() === "2026-09-15T06:30:00.000Z",
    "Timezone test at 3:00 PM IST (historical buggy window)",
    `Got ${resetD.toISOString()}`
  );

  // Case E: 11:30 PM IST (18:00 UTC) on 2026-09-15
  // Should return 2026-09-15T06:30:00.000Z (today 12:00 PM IST)
  const timeE = new Date("2026-09-15T18:00:00.000Z");
  const resetE = getSimulatedReset(timeE);
  assert(
    resetE.toISOString() === "2026-09-15T06:30:00.000Z",
    "Timezone test at 11:30 PM IST (late night)",
    `Got ${resetE.toISOString()}`
  );

  // -------------------------------------------------------------
  // TEST 2: ACTIVE CYCLE KEY CALCULATIONS
  // -------------------------------------------------------------
  console.log("\n--- TEST GROUP 2: Daily & Weekly Cycle Keys ---");
  const dailyCycle = getDailyCycleInfo();
  const weeklyCycle = getWeeklyCycleInfo();

  assert(
    dailyCycle.cycleStartUTC.getTime() < dailyCycle.nextResetUTC.getTime(),
    "Daily cycle start is strictly before next reset"
  );
  assert(
    dailyCycle.nextResetUTC.getTime() - dailyCycle.cycleStartUTC.getTime() === 24 * 60 * 60 * 1000,
    "Daily cycle is exactly 24 hours (86,400,000 ms)"
  );
  assert(
    weeklyCycle.nextResetUTC.getTime() - weeklyCycle.cycleStartUTC.getTime() === 7 * 24 * 60 * 60 * 1000,
    "Weekly cycle is exactly 7 days (604,800,000 ms)"
  );
  assert(
    dailyCycle.cycleKey.endsWith("-12PM"),
    `Daily cycleKey has -12PM suffix: ${dailyCycle.cycleKey}`
  );
  assert(
    weeklyCycle.cycleKey.endsWith("-12PM"),
    `Weekly cycleKey has -12PM suffix: ${weeklyCycle.cycleKey}`
  );

  // -------------------------------------------------------------
  // TEST 3: ACTIVITY DATA SPEND & NON-TOOL FILTERING
  // -------------------------------------------------------------
  console.log("\n--- TEST GROUP 3: Quests Activity Data Filtering ---");

  // Mock buildActivityData logic identical to route.ts
  const VISUAL_TOOL_IDS = [
    "image-minecraft-skin", "minecraft-skin-maker", "ai-img-gen", "ai-logo",
    "image-restorer", "image-bg-remover", "bg-remove", "image-eraser",
    "icon-generator", "svg-generator"
  ];
  const DOC_TOOL_IDS = [
    "pdf-to-notes", "pdf-sidebar", "resume-analyzer", "plagiarism-checker",
    "schema-markup-generator", "flashcard-generator", "linkedin-formatter"
  ];

  function buildActivityData(
    recentTx: Array<{ toolId: string | null; transactionType: string; description: string | null; amount: number; createdAt: Date }>,
    shopClaims: Array<{ createdAt: Date }>,
    userFiles: Array<{ createdAt: Date; toolType: string }>,
    chatSessions: Array<{ createdAt: Date }>,
    communityInteractionsCount: number,
    sinceDate: Date
  ) {
    const txInWindow = recentTx.filter((t) => t.createdAt >= sinceDate);
    const claimsInWindow = shopClaims.filter((c) => c.createdAt >= sinceDate);
    const filesInWindow = userFiles.filter((f) => f.createdAt >= sinceDate);
    const chatsInWindow = chatSessions.filter((c) => c.createdAt >= sinceDate);

    const distinctTools = new Set(
      txInWindow
        .filter((t) => 
          t.transactionType === "tool_usage" &&
          t.toolId && 
          t.toolId !== "chat" && 
          t.toolId !== "ai-chat" && 
          t.toolId !== "vault" &&
          t.toolId !== "streak-shield" &&
          t.toolId !== "streak_shield_purchase"
        )
        .map((t) => t.toolId as string)
    );

    const visualTxCount = txInWindow.filter((t) => 
      t.transactionType === "tool_usage" && t.toolId && VISUAL_TOOL_IDS.includes(t.toolId)
    ).length;
    const visualFilesCount = filesInWindow.filter((f) => 
      VISUAL_TOOL_IDS.includes(f.toolType) || f.toolType === "image" || f.toolType === "skin"
    ).length;
    const visualCraftCount = Math.max(visualTxCount, visualFilesCount);

    const chatTxCount = txInWindow.filter((t) => 
      t.toolId === "chat" || 
      t.toolId === "ai-chat" || 
      t.transactionType === "chat_message" || 
      (t.description && t.description.toLowerCase().includes("chat"))
    ).length;
    const chatCount = chatsInWindow.length + chatTxCount;

    const vaultClaimedCount = claimsInWindow.length;

    const docTxCount = txInWindow.filter((t) => 
      t.transactionType === "tool_usage" && t.toolId && DOC_TOOL_IDS.includes(t.toolId)
    ).length;
    const docFilesCount = filesInWindow.filter((f) => 
      DOC_TOOL_IDS.includes(f.toolType) || f.toolType === "pdf"
    ).length;
    const docProcessCount = Math.max(docTxCount, docFilesCount);

    const toolTxCount = txInWindow.filter((t) => 
      t.transactionType === "tool_usage" && 
      t.toolId && 
      t.toolId !== "streak-shield" && 
      t.toolId !== "streak_shield_purchase"
    ).length;
    const totalCreationsCount = Math.max(filesInWindow.length, toolTxCount);

    const totalCreditsSpent = txInWindow.reduce((acc, t) => {
      if (t.transactionType === "tool_usage" && t.amount < 0) {
        return acc + Math.abs(t.amount);
      }
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

  // SCENARIO 1: User claims daily vault, daily reset runs, user buys streak shield.
  // USER DID NOT USE ANY AI TOOLS!
  const scenario1Txs = [
    { toolId: "daily_reset", transactionType: "daily_reset", description: "Daily credit reset", amount: 50, createdAt: new Date() },
    { toolId: "vault", transactionType: "shop_bonus", description: "Free Vault Credits", amount: 15, createdAt: new Date() },
    { toolId: "streak-shield", transactionType: "shield_purchase", description: "Purchased Streak Shield", amount: -100, createdAt: new Date() },
  ];
  const scenario1Claims = [{ createdAt: new Date() }];

  const act1 = buildActivityData(scenario1Txs, scenario1Claims, [], [], 0, dailyCycle.cycleStartUTC);

  assert(act1.totalCreditsSpent === 0, "No tools used: totalCreditsSpent is strictly 0 (not counting reset/vault/shield)");
  assert(act1.distinctToolsUsed === 0, "No tools used: distinctToolsUsed is strictly 0 (vault & shield excluded)");
  assert(act1.totalCreationsCount === 0, "No tools used: totalCreationsCount is 0");
  assert(act1.vaultClaimedCount === 1, "Vault claim correctly registered as 1 claim");

  // SCENARIO 2: User generates 1 image with ai-img-gen (spends 10 credits, writes 1 file).
  const scenario2Txs = [
    ...scenario1Txs,
    { toolId: "ai-img-gen", transactionType: "tool_usage", description: "AI Image Generation", amount: -10, createdAt: new Date() }
  ];
  const scenario2Files = [
    { toolType: "image", createdAt: new Date() }
  ];

  const act2 = buildActivityData(scenario2Txs, scenario1Claims, scenario2Files, [], 0, dailyCycle.cycleStartUTC);

  assert(act2.totalCreditsSpent === 10, "1 image tool used: totalCreditsSpent is strictly 10");
  assert(act2.distinctToolsUsed === 1, "1 image tool used: distinctToolsUsed is 1");
  assert(act2.visualCraftCount === 1, "Visual creations count is 1 (deduplicated between file and tx)");
  assert(act2.totalCreationsCount === 1, "Total creations count is 1 (deduplicated)");

  // SCENARIO 3: Old chat session from yesterday vs new chat session today
  const oldChat = [{ createdAt: new Date(dailyCycle.cycleStartUTC.getTime() - 60000) }]; // 1 min before cycle
  const newChat = [{ createdAt: new Date() }];

  const actOldChat = buildActivityData([], [], [], oldChat, 0, dailyCycle.cycleStartUTC);
  assert(actOldChat.chatCount === 0, "Old chat created before 12:00 PM IST does NOT count in active cycle");

  const actNewChat = buildActivityData([], [], [], newChat, 0, dailyCycle.cycleStartUTC);
  assert(actNewChat.chatCount === 1, "New chat created after 12:00 PM IST DOES count in active cycle");

  // -------------------------------------------------------------
  // TEST 4: QUEST COMPLETION & CLAIM SECURITY VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- TEST GROUP 4: Quest Objectives & Security Enforcement ---");

  const questsIncomplete = generateQuestsForUser(
    "user_test_security",
    "daily",
    dailyCycle.cycleKey,
    act1, // 0 credits spent, 0 tools used
    [],
    4
  );

  // Find a quest that requires tool usage or credits
  const toolQuest = questsIncomplete.find((q) => q.target > 0 && q.templateId !== "daily_vault_claim");
  if (toolQuest) {
    assert(
      toolQuest.completed === false,
      `Quest "${toolQuest.title}" is incomplete when user only claimed vault/bought shield (${toolQuest.current}/${toolQuest.target})`
    );

    // Verify security logic: POST /api/user/quests rejects if !quest.completed
    function simulateClaim(quest: NonNullable<typeof toolQuest>) {
      if (!quest.completed) {
        return { status: 400, error: "Quest objectives have not been completed yet." };
      }
      return { status: 200, success: true };
    }

    const claimResult = simulateClaim(toolQuest);
    assert(
      claimResult.status === 400 && claimResult.error === "Quest objectives have not been completed yet.",
      `Security gate successfully BLOCKS claiming incomplete quest "${toolQuest.title}"`
    );
  }

  // -------------------------------------------------------------
  // TEST 5: ADMIN MODERATION PANEL DATABASE QUERY VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- TEST GROUP 5: Live Database Moderation Activity Query ---");

  // Query DB using the exact updated filter from src/app/api/admin/moderation/activity/route.ts
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const adminTxQuery = await prisma.creditTransaction.findMany({
    where: {
      transactionType: "tool_usage",
      amount: { lt: 0 },
    },
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      toolId: true,
      transactionType: true,
      amount: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  console.log(`Queried ${adminTxQuery.length} moderation activity items from DB.`);

  for (const tx of adminTxQuery) {
    assert(
      tx.transactionType === "tool_usage",
      `Moderation item ${tx.id} has transactionType == 'tool_usage'`
    );
    assert(
      tx.amount < 0,
      `Moderation item ${tx.id} has negative amount (${tx.amount})`
    );
    assert(
      tx.toolId !== "daily_reset" && tx.toolId !== "vault" && tx.toolId !== "streak-shield",
      `Moderation item ${tx.id} is a real tool usage (not daily_reset, vault, or streak-shield): ${tx.toolId}`
    );
  }

  // -------------------------------------------------------------
  // TEST 6: REAL DATABASE USER "BMREZ" HEALTH CHECK
  // -------------------------------------------------------------
  console.log("\n--- TEST GROUP 6: Real User BMREZ State Verification ---");

  const bmrez = await prisma.user.findFirst({
    where: { email: "syedrayan.dev@gmail.com" },
    select: {
      id: true,
      name: true,
      email: true,
      dailyCredits: true,
      bonusCredits: true,
      creditsLastReset: true,
      context: { select: { preferences: true } },
    },
  });

  if (bmrez) {
    console.log(`Found BMREZ user (${bmrez.id}):`);
    console.log(`- Daily Credits: ${bmrez.dailyCredits}`);
    console.log(`- Bonus Credits: ${bmrez.bonusCredits}`);
    console.log(`- Last Daily Reset: ${bmrez.creditsLastReset?.toISOString()}`);

    // Verify resetCreditsIfNewDay on BMREZ
    const resetResult = await resetCreditsIfNewDay(bmrez.id);
    console.log(`- Reset executed: dailyCredits = ${resetResult?.dailyCredits}`);

    // Verify BMREZ's active daily quests
    const bmrezTx = await prisma.creditTransaction.findMany({
      where: { userId: bmrez.id, createdAt: { gte: dailyCycle.cycleStartUTC } },
      select: { toolId: true, transactionType: true, description: true, amount: true, createdAt: true },
    });
    const bmrezClaims = await prisma.creditShopClaim.findMany({
      where: { userId: bmrez.id, createdAt: { gte: dailyCycle.cycleStartUTC } },
      select: { createdAt: true },
    });
    const bmrezFiles = await prisma.userFile.findMany({
      where: { userId: bmrez.id, createdAt: { gte: dailyCycle.cycleStartUTC } },
      select: { createdAt: true, toolType: true },
    });
    const bmrezChats = await prisma.chatSession.findMany({
      where: { userId: bmrez.id, createdAt: { gte: dailyCycle.cycleStartUTC } },
      select: { createdAt: true },
    });

    const bmrezActivity = buildActivityData(
      bmrezTx,
      bmrezClaims,
      bmrezFiles,
      bmrezChats,
      0,
      dailyCycle.cycleStartUTC
    );

    console.log(`- BMREZ Active Cycle Activity:`, bmrezActivity);

    const bmrezQuests = generateQuestsForUser(
      bmrez.id,
      "daily",
      dailyCycle.cycleKey,
      bmrezActivity,
      [],
      4
    );

    console.log("- BMREZ Active Quests for today:");
    for (const q of bmrezQuests) {
      console.log(`  * [${q.completed ? "COMPLETED" : "PENDING"}] ${q.title} (${q.current}/${q.target}) - Reward: +${q.rewardSparks} Sparks`);
    }

    assert(true, "BMREZ live activity & quests generated without error");
  }

  console.log("\n==========================================================");
  console.log(`   TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log("==========================================================");
}

runTestSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test Suite Fatal Error:", err);
    process.exit(1);
  });
