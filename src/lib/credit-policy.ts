import { PRICING_CONFIG } from "@/config/pricing";

export const FREE_DAILY_CREDITS = 50;
export const PRO_DAILY_CREDITS = PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS;

export const CREDIT_COSTS = {
  "ai-img-gen": 18,
  "ai-logo": 18,
  "image-minecraft-skin": 24,
  "minecraft-skin-maker": 24,
  "image-restorer": 18,
  "watermark-remover": 16,
  "image-eraser": 8,
  "video-enhancer": 35,
  "video-bg-remover": 30,
  "audio-vocal-remover": 14,
  "audio-stem-splitter": 18,
  "screenshot-to-code": 20,
  "support-agent": 10,
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
