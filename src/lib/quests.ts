export type QuestCategory = 
  | "creation" 
  | "exploration" 
  | "documents" 
  | "vault" 
  | "mastery";

export interface QuestItem {
  id: string;
  templateId: string;
  type: "daily" | "weekly";
  title: string;
  description: string;
  icon: string;
  category: QuestCategory;
  target: number;
  current: number;
  rewardCredits: number;
  actionUrl: string;
  actionLabel: string;
  completed: boolean;
  claimed: boolean;
  difficulty?: "normal" | "epic" | "legendary";
}

export interface QuestTemplate {
  templateId: string;
  type: "daily" | "weekly";
  title: string;
  descriptionTemplate: (target: number) => string;
  icon: string;
  category: QuestCategory;
  targetMin: number;
  targetMax: number;
  rewardMin: number;
  rewardMax: number;
  actionUrl: string;
  actionLabel: string;
  difficulty?: "normal" | "epic" | "legendary";
  evaluateProgress: (activity: UserActivityData) => number;
}

export interface UserActivityData {
  distinctToolsUsed: number;
  visualCraftCount: number;
  chatCount: number;
  vaultClaimedCount: number;
  docProcessCount: number;
  totalCreationsCount: number;
  totalCreditsSpent: number;
  communityInteractions: number;
}

// ==========================================
// DAILY QUEST TEMPLATES POOL (100% Live Public Features)
// ==========================================
export const DAILY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    templateId: "ai_tools",
    type: "daily",
    title: "AI Maestro",
    descriptionTemplate: (target) => `Use ${target} different Exismic AI tools today`,
    icon: "Wand2",
    category: "exploration",
    targetMin: 2,
    targetMax: 3,
    rewardMin: 15,
    rewardMax: 25,
    actionUrl: "/tools",
    actionLabel: "Explore Tools",
    difficulty: "normal",
    evaluateProgress: (a) => a.distinctToolsUsed,
  },
  {
    templateId: "visual_craft",
    type: "daily",
    title: "Visual Craftsman",
    descriptionTemplate: (target) => 
      target === 1 
        ? "Generate or edit a Minecraft skin, image, or graphic" 
        : `Create or edit ${target} visual assets or skins`,
    icon: "Palette",
    category: "creation",
    targetMin: 1,
    targetMax: 2,
    rewardMin: 15,
    rewardMax: 25,
    actionUrl: "/tools/image/minecraft-skin",
    actionLabel: "Open Editor",
    difficulty: "normal",
    evaluateProgress: (a) => a.visualCraftCount,
  },
  {
    templateId: "chat_session",
    type: "daily",
    title: "Deep Dialogue",
    descriptionTemplate: (target) => 
      target === 1 
        ? "Have a conversation with Exismic AI Assistant" 
        : `Start ${target} interactive AI chat sessions`,
    icon: "MessageSquare",
    category: "exploration",
    targetMin: 1,
    targetMax: 2,
    rewardMin: 10,
    rewardMax: 20,
    actionUrl: "/chat",
    actionLabel: "Start Chat",
    difficulty: "normal",
    evaluateProgress: (a) => a.chatCount,
  },
  {
    templateId: "loot_vault",
    type: "daily",
    title: "Loot Collector",
    descriptionTemplate: () => "Open the Daily Credit Loot Vault in the Shop",
    icon: "Coins",
    category: "vault",
    targetMin: 1,
    targetMax: 1,
    rewardMin: 10,
    rewardMax: 15,
    actionUrl: "/shop",
    actionLabel: "Open Vault",
    difficulty: "normal",
    evaluateProgress: (a) => a.vaultClaimedCount,
  },
  {
    templateId: "doc_insights",
    type: "daily",
    title: "Doc Prodigy",
    descriptionTemplate: () => "Extract notes, analyze a PDF, or run Resume Analyzer",
    icon: "FileText",
    category: "documents",
    targetMin: 1,
    targetMax: 1,
    rewardMin: 15,
    rewardMax: 20,
    actionUrl: "/tools/pdf-to-notes",
    actionLabel: "Doc Tools",
    difficulty: "normal",
    evaluateProgress: (a) => a.docProcessCount,
  },
  {
    templateId: "creation_spree",
    type: "daily",
    title: "Spark Creator",
    descriptionTemplate: (target) => `Produce ${target} AI creations across creative tools`,
    icon: "Sparkles",
    category: "creation",
    targetMin: 2,
    targetMax: 3,
    rewardMin: 15,
    rewardMax: 25,
    actionUrl: "/tools",
    actionLabel: "Create Now",
    difficulty: "normal",
    evaluateProgress: (a) => a.totalCreationsCount,
  },
  {
    templateId: "credit_power",
    type: "daily",
    title: "Power Invocation",
    descriptionTemplate: (target) => `Utilize ${target} credits across AI tool generations`,
    icon: "Zap",
    category: "mastery",
    targetMin: 20,
    targetMax: 35,
    rewardMin: 15,
    rewardMax: 25,
    actionUrl: "/tools",
    actionLabel: "Launch Tools",
    difficulty: "normal",
    evaluateProgress: (a) => a.totalCreditsSpent,
  },
  {
    templateId: "avatar_craft",
    type: "daily",
    title: "Avatar Designer",
    descriptionTemplate: (target) => 
      target === 1 
        ? "Design or edit a custom Minecraft skin or avatar" 
        : `Create or customize ${target} skins or avatars`,
    icon: "Palette",
    category: "creation",
    targetMin: 1,
    targetMax: 2,
    rewardMin: 15,
    rewardMax: 25,
    actionUrl: "/tools/image/minecraft-skin",
    actionLabel: "Design Skin",
    difficulty: "normal",
    evaluateProgress: (a) => a.visualCraftCount,
  },
  {
    templateId: "art_enhancer",
    type: "daily",
    title: "Art Refiner",
    descriptionTemplate: () => "Remove background, erase objects, or enhance an image",
    icon: "Palette",
    category: "creation",
    targetMin: 1,
    targetMax: 1,
    rewardMin: 15,
    rewardMax: 20,
    actionUrl: "/tools/image/eraser",
    actionLabel: "Enhance Art",
    difficulty: "normal",
    evaluateProgress: (a) => a.visualCraftCount,
  },
];

// ============================================
// WEEKLY MEGA QUEST TEMPLATES POOL (100% Live Public Features)
// ============================================
export const WEEKLY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    templateId: "grand_maestro",
    type: "weekly",
    title: "Grand AI Architect",
    descriptionTemplate: (target) => `Use ${target} different AI tools across this week`,
    icon: "Wand2",
    category: "exploration",
    targetMin: 12,
    targetMax: 18,
    rewardMin: 80,
    rewardMax: 110,
    actionUrl: "/tools",
    actionLabel: "Explore All",
    difficulty: "epic",
    evaluateProgress: (a) => a.distinctToolsUsed,
  },
  {
    templateId: "artistic_powerhouse",
    type: "weekly",
    title: "Artistic Powerhouse",
    descriptionTemplate: (target) => `Craft ${target} skins, images, or graphical artworks`,
    icon: "Palette",
    category: "creation",
    targetMin: 15,
    targetMax: 25,
    rewardMin: 90,
    rewardMax: 120,
    actionUrl: "/tools/image/minecraft-skin",
    actionLabel: "Art Studio",
    difficulty: "legendary",
    evaluateProgress: (a) => a.visualCraftCount,
  },
  {
    templateId: "omniscient_scholar",
    type: "weekly",
    title: "Omniscient Scholar",
    descriptionTemplate: (target) => `Complete ${target} in-depth AI chat conversations`,
    icon: "MessageSquare",
    category: "exploration",
    targetMin: 15,
    targetMax: 25,
    rewardMin: 70,
    rewardMax: 95,
    actionUrl: "/chat",
    actionLabel: "Chat Hub",
    difficulty: "epic",
    evaluateProgress: (a) => a.chatCount,
  },
  {
    templateId: "vault_loyalty",
    type: "weekly",
    title: "Vault Baron",
    descriptionTemplate: (target) => `Open the Daily Shop Vault ${target} times this week`,
    icon: "Coins",
    category: "vault",
    targetMin: 5,
    targetMax: 7,
    rewardMin: 80,
    rewardMax: 110,
    actionUrl: "/shop",
    actionLabel: "Shop Vault",
    difficulty: "legendary",
    evaluateProgress: (a) => a.vaultClaimedCount,
  },
  {
    templateId: "credit_tycoon",
    type: "weekly",
    title: "Credit Tycoon",
    descriptionTemplate: (target) => `Invest ${target} credits utilizing platform AI tools`,
    icon: "Zap",
    category: "mastery",
    targetMin: 250,
    targetMax: 500,
    rewardMin: 90,
    rewardMax: 120,
    actionUrl: "/tools",
    actionLabel: "Explore Tools",
    difficulty: "legendary",
    evaluateProgress: (a) => a.totalCreditsSpent,
  },
  {
    templateId: "creation_machine",
    type: "weekly",
    title: "Creation Machine",
    descriptionTemplate: (target) => `Generate ${target} files & assets across all tools`,
    icon: "Sparkles",
    category: "creation",
    targetMin: 25,
    targetMax: 40,
    rewardMin: 95,
    rewardMax: 125,
    actionUrl: "/tools",
    actionLabel: "Create Now",
    difficulty: "legendary",
    evaluateProgress: (a) => a.totalCreationsCount,
  },
  {
    templateId: "research_specialist",
    type: "weekly",
    title: "Research Specialist",
    descriptionTemplate: (target) => `Process or analyze ${target} documents, notes & PDFs`,
    icon: "FileText",
    category: "documents",
    targetMin: 10,
    targetMax: 18,
    rewardMin: 75,
    rewardMax: 105,
    actionUrl: "/tools/pdf-to-notes",
    actionLabel: "Doc Tools",
    difficulty: "epic",
    evaluateProgress: (a) => a.docProcessCount,
  },
  {
    templateId: "weekly_explorer",
    type: "weekly",
    title: "Platform Vanguard",
    descriptionTemplate: (target) => `Explore and utilize ${target} creative AI tools this week`,
    icon: "Wand2",
    category: "exploration",
    targetMin: 10,
    targetMax: 16,
    rewardMin: 70,
    rewardMax: 95,
    actionUrl: "/tools",
    actionLabel: "Explore Tools",
    difficulty: "epic",
    evaluateProgress: (a) => a.distinctToolsUsed,
  },
  {
    templateId: "studio_virtuoso",
    type: "weekly",
    title: "Visual Virtuoso",
    descriptionTemplate: (target) => `Generate or refine ${target} visual & media assets`,
    icon: "Palette",
    category: "creation",
    targetMin: 12,
    targetMax: 20,
    rewardMin: 85,
    rewardMax: 115,
    actionUrl: "/tools/image/eraser",
    actionLabel: "Visual Suite",
    difficulty: "legendary",
    evaluateProgress: (a) => a.visualCraftCount,
  },
];

// ==========================================
// SEEDED PSEUDO-RANDOM GENERATOR
// ==========================================
function createSeededRNG(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  let s = Math.abs(hash) || 123456789;

  return function nextFloat(): number {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function getRandomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ==========================================
// CYCLE CALCULATIONS (Daily & Weekly)
// ==========================================

/**
 * Calculates Daily Quest cycle starting at 12:00 PM IST (06:30 UTC).
 */
export function getDailyCycleInfo(now: Date = new Date()) {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + IST_OFFSET_MS);

  const istYear = istDate.getUTCFullYear();
  const istMonth = istDate.getUTCMonth();
  const istDay = istDate.getUTCDate();
  const istHour = istDate.getUTCHours();

  let cycleStartYear = istYear;
  let cycleStartMonth = istMonth;
  let cycleStartDay = istDay;

  if (istHour < 12) {
    const yesterday = new Date(Date.UTC(istYear, istMonth, istDay - 1));
    cycleStartYear = yesterday.getUTCFullYear();
    cycleStartMonth = yesterday.getUTCMonth();
    cycleStartDay = yesterday.getUTCDate();
  }

  const cycleStartUTC = new Date(Date.UTC(cycleStartYear, cycleStartMonth, cycleStartDay, 6, 30, 0, 0));
  const nextResetUTC = new Date(cycleStartUTC.getTime() + 24 * 60 * 60 * 1000);
  const cycleKey = `${cycleStartYear}-${String(cycleStartMonth + 1).padStart(2, "0")}-${String(cycleStartDay).padStart(2, "0")}-12PM`;

  return {
    cycleStartUTC,
    nextResetUTC,
    cycleKey,
  };
}

export const getQuestCycleInfo = getDailyCycleInfo;

/**
 * Calculates Weekly Quest cycle starting every Monday at 12:00 PM IST (06:30 UTC).
 */
export function getWeeklyCycleInfo(now: Date = new Date()) {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + IST_OFFSET_MS);

  const istDayOfWeek = istDate.getUTCDay();
  const istHour = istDate.getUTCHours();

  let daysSinceMonday = (istDayOfWeek + 6) % 7;
  if (daysSinceMonday === 0 && istHour < 12) {
    daysSinceMonday = 7;
  }

  const istYear = istDate.getUTCFullYear();
  const istMonth = istDate.getUTCMonth();
  const istDay = istDate.getUTCDate();

  const cycleStartDate = new Date(Date.UTC(istYear, istMonth, istDay - daysSinceMonday));
  const cycleStartYear = cycleStartDate.getUTCFullYear();
  const cycleStartMonth = cycleStartDate.getUTCMonth();
  const cycleStartDay = cycleStartDate.getUTCDate();

  const cycleStartUTC = new Date(Date.UTC(cycleStartYear, cycleStartMonth, cycleStartDay, 6, 30, 0, 0));
  const nextResetUTC = new Date(cycleStartUTC.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const tempDate = new Date(cycleStartUTC.getTime());
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const cycleKey = `${cycleStartYear}-W${String(weekNo).padStart(2, "0")}-12PM`;

  return {
    cycleStartUTC,
    nextResetUTC,
    cycleKey,
  };
}

// =======================================================
// GENERATE RANDOM SELECTION OF QUESTS (Deterministic Per Cycle)
// =======================================================

export function generateQuestsForUser(
  userId: string,
  type: "daily" | "weekly",
  cycleKey: string,
  activity: UserActivityData,
  claimedQuestIds: string[] = [],
  questCount = 4
): QuestItem[] {
  const seed = `${userId}:${cycleKey}:${type}:v5`;
  const rng = createSeededRNG(seed);

  const pool = type === "daily" ? DAILY_QUEST_TEMPLATES : WEEKLY_QUEST_TEMPLATES;
  const shuffledPool = seededShuffle(pool, rng);
  const selectedTemplates = shuffledPool.slice(0, questCount);

  return selectedTemplates.map((tpl) => {
    const target = getRandomInt(rng, tpl.targetMin, tpl.targetMax);
    
    const step = tpl.targetMax > tpl.targetMin ? (target - tpl.targetMin) / (tpl.targetMax - tpl.targetMin) : 0.5;
    const rawReward = tpl.rewardMin + step * (tpl.rewardMax - tpl.rewardMin);
    const rewardCredits = Math.round(rawReward / 5) * 5;

    const current = tpl.evaluateProgress(activity);
    const completed = current >= target;
    const claimed = claimedQuestIds.includes(tpl.templateId) || claimedQuestIds.includes(`${type}_${tpl.templateId}`);

    return {
      id: `${type}_${tpl.templateId}`,
      templateId: tpl.templateId,
      type,
      title: tpl.title,
      description: tpl.descriptionTemplate(target),
      icon: tpl.icon,
      category: tpl.category,
      target,
      current: Math.min(current, target),
      rewardCredits,
      actionUrl: tpl.actionUrl,
      actionLabel: tpl.actionLabel,
      completed,
      claimed,
      difficulty: tpl.difficulty,
    };
  });
}

// Static backwards-compatibility default for imports expecting DAILY_QUESTS
export const DAILY_QUESTS: QuestItem[] = DAILY_QUEST_TEMPLATES.slice(0, 4).map((tpl) => ({
  id: `daily_${tpl.templateId}`,
  templateId: tpl.templateId,
  type: "daily",
  title: tpl.title,
  description: tpl.descriptionTemplate(tpl.targetMin),
  icon: tpl.icon,
  category: tpl.category,
  target: tpl.targetMin,
  current: 0,
  rewardCredits: tpl.rewardMin,
  actionUrl: tpl.actionUrl,
  actionLabel: tpl.actionLabel,
  completed: false,
  claimed: false,
  difficulty: tpl.difficulty,
}));
