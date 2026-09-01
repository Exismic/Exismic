import { prisma } from "./prisma";
import { getRedisClient } from "./redis";
import {
  RewardItem,
  TriviaQuestion,
  DailyPoll,
  EarningQuest,
  RewardProfileData,
  REWARDS_CATALOG,
  EARNING_QUESTS,
} from "@/config/rewards";

export * from "@/config/rewards";

// ==========================================
// 3. DAILY TECH/AI TRIVIA QUESTION POOL
// ==========================================
const TRIVIA_POOL: TriviaQuestion[][] = [
  // Day 0
  [
    {
      id: 1,
      question: "What does 'LLM' stand for in modern AI technology?",
      options: ["Large Language Model", "Linear Logic Machine", "Lightweight Learning Mode", "Linked Linguistic Matrix"],
      correctIndex: 0,
      explanation: "LLM stands for Large Language Model, trained on vast amounts of text to understand and generate human language.",
    },
    {
      id: 2,
      question: "Which neural network architecture revolutionized generative AI in 2017?",
      options: ["Convolutional Networks", "Transformer Architecture", "Recurrent Logic", "Markov Chains"],
      correctIndex: 1,
      explanation: "The Transformer architecture, introduced in 'Attention Is All You Need', forms the basis of GPT, Claude, and Gemini.",
    },
    {
      id: 3,
      question: "What is a standard pixel resolution for classic Minecraft player skins?",
      options: ["32x32", "64x64", "128x128", "256x256"],
      correctIndex: 1,
      explanation: "Standard modern Minecraft skins are 64x64 pixels with support for dual-layer overlays.",
    },
  ],
  // Day 1
  [
    {
      id: 4,
      question: "What technique generates realistic images from random noise via step-by-step denoising?",
      options: ["Diffusion Models", "Decision Trees", "K-Means Clustering", "Fourier Transform"],
      correctIndex: 0,
      explanation: "Diffusion models gradually remove Gaussian noise over several steps to produce high-resolution imagery.",
    },
    {
      id: 5,
      question: "What is 'Temperature' in an AI model's text generation settings?",
      options: ["Hardware GPU heat", "Randomness and creativity level", "Speed of response tokens", "Context window memory"],
      correctIndex: 1,
      explanation: "Higher temperature values (e.g. 0.8+) produce more creative/diverse responses, while lower values (e.g. 0.2) are more deterministic.",
    },
    {
      id: 6,
      question: "Which programming language was developed by Sun Microsystems in 1995 and powers original Minecraft?",
      options: ["C++", "Python", "Java", "Rust"],
      correctIndex: 2,
      explanation: "Minecraft Java Edition was written in Java by Markus Persson (Notch).",
    },
  ],
  // Day 2
  [
    {
      id: 7,
      question: "What does 'Tokenization' mean in Natural Language Processing?",
      options: ["Paying crypto for API access", "Splitting text into smaller subunits or words", "Encrypting database passwords", "Compiling code into binaries"],
      correctIndex: 1,
      explanation: "Tokenization breaks sentences into chunks/tokens that AI models process mathematically.",
    },
    {
      id: 8,
      question: "What is the primary role of a Vector Database in AI applications?",
      options: ["Storing 2D SVG graphics", "Storing high-dimensional embeddings for semantic search", "Backing up CSS stylesheets", "Handling WebSockets"],
      correctIndex: 1,
      explanation: "Vector databases index embeddings so AI can quickly retrieve relevant documents (RAG).",
    },
    {
      id: 9,
      question: "Which file format is standard for lossless alpha transparency in image generations?",
      options: ["JPEG", "PNG", "BMP", "GIF"],
      correctIndex: 1,
      explanation: "PNG provides 8-bit alpha channel transparency without compression artifacts.",
    },
  ],
];

// ==========================================
// 4. DAILY COMMUNITY POLLS POOL
// ==========================================
const DAILY_POLLS_POOL: DailyPoll[] = [
  {
    id: "poll_ai_usecase",
    question: "What is your #1 favorite use for AI tools right now?",
    options: [
      { id: "opt_skin", text: "Minecraft Skins & 3D Art", votes: 42 },
      { id: "opt_code", text: "Coding & Debugging Assistant", votes: 89 },
      { id: "opt_write", text: "Creative Writing & Ideation", votes: 61 },
      { id: "opt_image", text: "Image Upscaling & Generation", votes: 77 },
    ],
    totalVotes: 269,
  },
  {
    id: "poll_browser",
    question: "Which primary browser do you use when visiting Exismic?",
    options: [
      { id: "opt_chrome", text: "Google Chrome", votes: 110 },
      { id: "opt_brave", text: "Brave Browser", votes: 48 },
      { id: "opt_edge", text: "Microsoft Edge", votes: 35 },
      { id: "opt_firefox", text: "Mozilla Firefox", votes: 29 },
    ],
    totalVotes: 222,
  },
  {
    id: "poll_next_feature",
    question: "Which upcoming Exismic feature are you most excited about?",
    options: [
      { id: "opt_anim", text: "3D Skin Animator & Pose Studio", votes: 94 },
      { id: "opt_audio", text: "AI Voice & SFX Generator", votes: 81 },
      { id: "opt_code_proj", text: "Multi-File Live Web IDE", votes: 66 },
      { id: "opt_mobile", text: "Dedicated Mobile PWA", votes: 45 },
    ],
    totalVotes: 286,
  },
];

// Helper: Get Current Day Index
export function getRewardDayIndex(): number {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);
  const startOfYear = new Date(istDate.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((istDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  return dayOfYear;
}

export function getTodayDateString(): string {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);
  return `${istDate.getFullYear()}-${String(istDate.getMonth() + 1).padStart(2, "0")}-${String(istDate.getDate()).padStart(2, "0")}`;
}

export function getTodayTrivia(): TriviaQuestion[] {
  const dayIndex = getRewardDayIndex();
  const poolIndex = Math.abs(dayIndex) % TRIVIA_POOL.length;
  return TRIVIA_POOL[poolIndex];
}

export function getTodayPoll(): DailyPoll {
  const dayIndex = getRewardDayIndex();
  const poolIndex = Math.abs(dayIndex) % DAILY_POLLS_POOL.length;
  return DAILY_POLLS_POOL[poolIndex];
}

// Generate human-readable unique voucher promo code
function generateUniqueVoucherCode(rewardType: string, rewardValue: number): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let randomSuffix = "";
  for (let i = 0; i < 5; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  if (rewardType === "bonus_credits") {
    return `EXIS-CRED${rewardValue}-${randomSuffix}`;
  } else if (rewardType === "pro_duration_hours") {
    if (rewardValue === 24) return `EXIS-PRO24H-${randomSuffix}`;
    if (rewardValue === 168) return `EXIS-PRO7D-${randomSuffix}`;
    return `EXIS-PRO30D-${randomSuffix}`;
  } else if (rewardType === "cosmetic_badge") {
    return `EXIS-BADGE-${randomSuffix}`;
  }
  return `EXIS-REWARD-${randomSuffix}`;
}

// ==========================================
// 5. USER REWARD STATE MANAGEMENT (REDIS + DB)
// ==========================================

export async function getUserRewardProfile(userId: string): Promise<RewardProfileData> {
  const today = getTodayDateString();
  const redis = getRedisClient();

  let state: {
    points?: number;
    lifetimePoints?: number;
    currentStreak?: number;
    lastCheckInDate?: string | null;
    lastQuizDate?: string | null;
    lastPollDate?: string | null;
    selectedGoalId?: string;
    completedQuestIds?: string[];
    recentRedemptions?: any[];
  } = {};

  if (redis) {
    try {
      const raw = await redis.get(`rewards:user:${userId}`);
      if (raw) {
        state = JSON.parse(raw);
      }
    } catch (err) {
      console.warn("[REWARDS] Redis read failed, continuing:", err);
    }
  }

  const points = state.points ?? 0;
  const lifetimePoints = state.lifetimePoints ?? points;
  const currentStreak = state.currentStreak ?? 0;
  const lastCheckInDate = state.lastCheckInDate ?? null;
  const lastQuizDate = state.lastQuizDate ?? null;
  const lastPollDate = state.lastPollDate ?? null;
  const selectedGoalId = state.selectedGoalId ?? "reward_pro_30d";
  const completedQuestIds = state.completedQuestIds ?? [];
  const recentRedemptions = state.recentRedemptions ?? [];

  return {
    userId,
    points,
    lifetimePoints,
    currentStreak,
    lastCheckInDate,
    hasCheckedInToday: lastCheckInDate === today,
    hasCompletedQuizToday: lastQuizDate === today,
    hasVotedPollToday: lastPollDate === today,
    selectedGoalId,
    completedQuestIds,
    recentRedemptions,
  };
}

export async function saveUserRewardProfile(userId: string, data: Partial<RewardProfileData>) {
  const current = await getUserRewardProfile(userId);
  const updated = {
    ...current,
    ...data,
  };

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(`rewards:user:${userId}`, JSON.stringify(updated), "EX", 86400 * 30);
    } catch (err) {
      console.warn("[REWARDS] Redis save failed:", err);
    }
  }

  return updated;
}

// Award points for completing a daily task or quest
export async function completeRewardTask(
  userId: string,
  taskId: string,
  extraData?: { answers?: number[]; pollOptionId?: string; proofUrl?: string }
): Promise<{ success: boolean; error?: string; pointsAwarded?: number; newTotal?: number; streak?: number }> {
  const profile = await getUserRewardProfile(userId);
  const today = getTodayDateString();

  let pointsToAward = 0;
  let newStreak = profile.currentStreak;
  const updates: Partial<RewardProfileData> = {};

  if (taskId === "daily_check_in") {
    if (profile.hasCheckedInToday) {
      return { success: false, error: "You already checked in today! Check back tomorrow." };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (profile.lastCheckInDate === yesterdayStr) {
      newStreak = (profile.currentStreak || 0) + 1;
    } else {
      newStreak = 1;
    }

    pointsToAward = 15;
    if (newStreak % 7 === 0) {
      pointsToAward += 50;
    } else if (newStreak % 3 === 0) {
      pointsToAward += 20;
    }

    updates.lastCheckInDate = today;
    updates.currentStreak = newStreak;
  } else if (taskId === "daily_quiz") {
    if (profile.hasCompletedQuizToday) {
      return { success: false, error: "You already completed today's AI trivia!" };
    }

    const questions = getTodayTrivia();
    const userAnswers = extraData?.answers || [];
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    pointsToAward = Math.max(10, correctCount * 10);
    updates.hasCompletedQuizToday = true;

    const redis = getRedisClient();
    if (redis) {
      await redis.set(`rewards:user:${userId}:quiz:${today}`, "1", "EX", 86400 * 2);
    }
  } else if (taskId === "daily_poll") {
    if (profile.hasVotedPollToday) {
      return { success: false, error: "You already voted in today's community poll!" };
    }

    pointsToAward = 20;
    updates.hasVotedPollToday = true;

    const redis = getRedisClient();
    if (redis) {
      await redis.set(`rewards:user:${userId}:poll:${today}`, "1", "EX", 86400 * 2);
    }
  } else {
    const quest = EARNING_QUESTS.find((q) => q.id === taskId);
    if (!quest) {
      return { success: false, error: "Unknown quest task ID" };
    }

    if (profile.completedQuestIds.includes(taskId)) {
      return { success: false, error: "You have already completed this quest!" };
    }

    pointsToAward = quest.points;
    updates.completedQuestIds = [...profile.completedQuestIds, taskId];
  }

  const newPoints = profile.points + pointsToAward;
  const newLifetime = profile.lifetimePoints + pointsToAward;

  updates.points = newPoints;
  updates.lifetimePoints = newLifetime;

  await saveUserRewardProfile(userId, updates);

  return {
    success: true,
    pointsAwarded: pointsToAward,
    newTotal: newPoints,
    streak: newStreak,
  };
}

// Redeem Reward with Points -> Generates an Exismic Promo Code Voucher!
export async function redeemRewardWithPoints(
  userId: string,
  rewardId: string
): Promise<{ success: boolean; error?: string; reward?: RewardItem; voucherCode?: string; remainingPoints?: number }> {
  const reward = REWARDS_CATALOG.find((r) => r.id === rewardId);
  if (!reward) {
    return { success: false, error: "Invalid reward selection." };
  }

  const profile = await getUserRewardProfile(userId);

  if (profile.points < reward.costPoints) {
    return {
      success: false,
      error: `Insufficient Reward Points! You need ${reward.costPoints} RP (you currently have ${profile.points} RP).`,
    };
  }

  // 1. Generate unique Exismic Promo Voucher Code
  const voucherCode = generateUniqueVoucherCode(reward.rewardType, reward.rewardValue);

  // 2. Insert into prisma.promoCode database table
  try {
    await prisma.promoCode.create({
      data: {
        code: voucherCode,
        bonusCredits: reward.rewardType === "bonus_credits" ? reward.rewardValue : 0,
        maxRedemptions: 1,
        redemptionCount: 0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiration
      },
    });
  } catch (err) {
    console.error("[REWARDS] Failed to create promo code voucher in database:", err);
    return { success: false, error: "Database error generating reward voucher code." };
  }

  // 3. Deduct Points & save to user's vouchers history
  const remainingPoints = profile.points - reward.costPoints;
  const newRedemptions = [
    {
      id: `red_${Date.now()}`,
      rewardTitle: reward.title,
      costPoints: reward.costPoints,
      voucherCode: voucherCode,
      redeemedAt: new Date().toISOString(),
      status: "active",
    },
    ...profile.recentRedemptions.slice(0, 19),
  ];

  await saveUserRewardProfile(userId, {
    points: remainingPoints,
    recentRedemptions: newRedemptions,
  });

  return {
    success: true,
    reward,
    voucherCode,
    remainingPoints,
  };
}
