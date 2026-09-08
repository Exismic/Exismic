import { PRICING_CONFIG } from "@/config/pricing";

export const FREE_DAILY_CREDITS = 50;
export const PRO_DAILY_CREDITS = PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS;

export const CREDIT_COSTS = {
  // Heavy Generative (GPU / High compute)
  "ai-img-gen": 20,
  "ai-image": 20,
  "ai-logo": 20,
  "image-minecraft-skin": 25,
  "minecraft-skin-maker": 25,
  "video-enhancer": 40,
  "video-bg-remover": 35,
  "audio-stem-splitter": 25,
  "audio-vocal-remover": 20,
  "text-to-3d": 25,
  "sfx-generator": 15,

  // Medium Image Processing
  "image-restorer": 20,
  "watermark-remover": 20,
  "image-eraser": 10,
  "image-bg-remover": 6,
  "bg-remove": 6,

  // Text, Writing & Analysis
  "resume-builder": 15,
  "resume-analyzer": 10,
  "landing-page-generator": 15,
  "youtube-summarizer": 10,
  "pdf-to-notes": 10,
  "cover-letter-generator": 8,
  "hook-script-generator": 8,
  "invoice-generator": 8,
  "ai-writer": 8,
  "ai-humanizer": 8,
  "flashcard-generator": 8,
  "essay-outline": 8,
  "plagiarism-checker": 8,
  "support-agent": 8,
  "resume-bullet-generator": 6,
  "social-caption": 6,
  "social-caption-generator": 6,
  "readability-assessor": 4,
  "ai-chat": 2,

  // API equivalents
  "api-generate-text": 6,
  "api-bg-remove": 6,
} as const;

export type CreditCostToolId = keyof typeof CREDIT_COSTS;

export function getDailyCreditLimit(plan?: string | null) {
  return plan === "pro" ? PRO_DAILY_CREDITS : FREE_DAILY_CREDITS;
}

export function getToolCreditCost(toolId: string, fallback = 1) {
  return CREDIT_COSTS[toolId as CreditCostToolId] ?? fallback;
}

export function getCreditBalanceLabel() {
  return {
    daily: "Daily credits",
    bonus: "Bonus credits",
    permanent: "Permanent credits",
  };
}
