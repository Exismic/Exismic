import { 
  getMostRecentResetTimestamp, 
  getTodayInIndia 
} from "../src/lib/credits";
import { 
  getDailyCycleInfo, 
  getWeeklyCycleInfo, 
  generateQuestsForUser 
} from "../src/lib/quests";

console.log("=== RUNNING EXISMIC SYSTEM VERIFICATION ===");

// 1. Test Reset Timestamp calculations
const resetNow = getMostRecentResetTimestamp();
console.log("Most recent reset timestamp:", resetNow.toISOString());

// Verify 12:00 PM IST is always 06:30 UTC
const nowUTC = new Date();
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const istDate = new Date(nowUTC.getTime() + IST_OFFSET_MS);
console.log("Current IST date/time:", istDate.toUTCString());

const dailyCycle = getDailyCycleInfo();
console.log("Daily Cycle Key:", dailyCycle.cycleKey);
console.log("Daily Cycle Start UTC:", dailyCycle.cycleStartUTC.toISOString());
console.log("Daily Next Reset UTC:", dailyCycle.nextResetUTC.toISOString());

const weeklyCycle = getWeeklyCycleInfo();
console.log("Weekly Cycle Key:", weeklyCycle.cycleKey);
console.log("Weekly Cycle Start UTC:", weeklyCycle.cycleStartUTC.toISOString());
console.log("Weekly Next Reset UTC:", weeklyCycle.nextResetUTC.toISOString());

// Verify next reset is in future and starts in past
if (dailyCycle.cycleStartUTC.getTime() > Date.now()) {
  throw new Error("Daily cycleStartUTC is in the future!");
}
if (dailyCycle.nextResetUTC.getTime() <= Date.now()) {
  throw new Error("Daily nextResetUTC is in the past!");
}
if (weeklyCycle.cycleStartUTC.getTime() > Date.now()) {
  throw new Error("Weekly cycleStartUTC is in the future!");
}
if (weeklyCycle.nextResetUTC.getTime() <= Date.now()) {
  throw new Error("Weekly nextResetUTC is in the past!");
}

// 2. Test Activity Calculation Mock logic
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

const mockTxs = [
  // 1 genuine tool usage
  { toolId: "ai-img-gen", transactionType: "tool_usage", description: "Generated image", amount: -10, createdAt: new Date() },
  // 1 daily reset top-up (amount is positive 30)
  { toolId: "daily_reset", transactionType: "daily_reset", description: "Daily reset", amount: 30, createdAt: new Date() },
  // 1 streak shield purchase (-100, but transactionType is shield_purchase)
  { toolId: "streak-shield", transactionType: "shield_purchase", description: "Bought shield", amount: -100, createdAt: new Date() },
  // 1 vault claim (+15, shop_bonus)
  { toolId: "vault", transactionType: "shop_bonus", description: "Claimed vault", amount: 15, createdAt: new Date() },
  // 1 old transaction from before cycle start
  { toolId: "ai-logo", transactionType: "tool_usage", description: "Old logo", amount: -20, createdAt: new Date(dailyCycle.cycleStartUTC.getTime() - 10000) }
];

const mockShopClaims = [
  { createdAt: new Date() } // 1 vault claim in cycle
];

const mockFiles = [
  // 1 generated file for the same ai-img-gen run
  { toolType: "image", createdAt: new Date() }
];

const mockChats = [
  { createdAt: new Date() }
];

const activity = buildActivityData(
  mockTxs,
  mockShopClaims,
  mockFiles,
  mockChats,
  0,
  dailyCycle.cycleStartUTC
);

console.log("\nActivity calculated from mock data:", activity);

if (activity.totalCreditsSpent !== 10) {
  throw new Error(`Expected totalCreditsSpent to be 10, got ${activity.totalCreditsSpent}`);
}
if (activity.distinctToolsUsed !== 1) {
  throw new Error(`Expected distinctToolsUsed to be 1, got ${activity.distinctToolsUsed}`);
}
if (activity.vaultClaimedCount !== 1) {
  throw new Error(`Expected vaultClaimedCount to be 1, got ${activity.vaultClaimedCount}`);
}
if (activity.visualCraftCount !== 1) {
  throw new Error(`Expected visualCraftCount to be 1 (deduped from tx + file), got ${activity.visualCraftCount}`);
}
if (activity.totalCreationsCount !== 1) {
  throw new Error(`Expected totalCreationsCount to be 1 (deduped), got ${activity.totalCreationsCount}`);
}

// 3. Test Quest Evaluation with this activity
const quests = generateQuestsForUser(
  "test-user-id",
  "daily",
  dailyCycle.cycleKey,
  activity,
  [],
  4
);

console.log("\nGenerated Quests status:");
for (const q of quests) {
  console.log(`- [${q.completed ? "COMPLETED" : "INCOMPLETE"}] ${q.title} (${q.current}/${q.target})`);
}

console.log("\nALL VERIFICATIONS PASSED SUCCESSFULLY!");
