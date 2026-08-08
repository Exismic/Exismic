export type RewardRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface RarityTheme {
  name: string;
  label: string;
  primaryColor: string; // hex for canvas
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardBorder: string;
  cardGlow: string;
  auraGradient: string;
  particleColors: string[];
  particleCount: number;
  shakeIntensity: number;
  chargingDurationMs: number;
  raysCount: number;
  soundPitchOffset: number; // pitch modifier for synthesizer
  raysOpacity: number;
}

export const RARITY_CONFIGS: Record<RewardRarity, RarityTheme> = {
  common: {
    name: "common",
    label: "Common Reward",
    primaryColor: "#10b981", // Emerald
    secondaryColor: "#059669",
    accentColor: "#a7f3d0",
    glowColor: "rgba(16, 185, 129, 0.4)",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-300",
    cardBorder: "border-emerald-400/40",
    cardGlow: "shadow-[0_0_40px_rgba(16,185,129,0.25)]",
    auraGradient: "from-emerald-400/30 via-teal-500/10 to-transparent",
    particleColors: ["#10b981", "#34d399", "#6ee7b7", "#ffffff", "#059669"],
    particleCount: 60,
    shakeIntensity: 2.5,
    chargingDurationMs: 650,
    raysCount: 0,
    soundPitchOffset: 0,
    raysOpacity: 0.05,
  },
  uncommon: {
    name: "uncommon",
    label: "Uncommon Reward",
    primaryColor: "#06b6d4", // Cyan
    secondaryColor: "#0284c7",
    accentColor: "#67e8f9",
    glowColor: "rgba(6, 182, 212, 0.45)",
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/30",
    badgeText: "text-cyan-300",
    cardBorder: "border-cyan-400/45",
    cardGlow: "shadow-[0_0_50px_rgba(6,182,212,0.3)]",
    auraGradient: "from-cyan-400/35 via-blue-500/15 to-transparent",
    particleColors: ["#06b6d4", "#22d3ee", "#67e8f9", "#ffffff", "#3b82f6"],
    particleCount: 90,
    shakeIntensity: 3.5,
    chargingDurationMs: 750,
    raysCount: 4,
    soundPitchOffset: 2,
    raysOpacity: 0.08,
  },
  rare: {
    name: "rare",
    label: "Rare Reward",
    primaryColor: "#3b82f6", // Electric Blue
    secondaryColor: "#1d4ed8",
    accentColor: "#93c5fd",
    glowColor: "rgba(59, 130, 246, 0.55)",
    badgeBg: "bg-blue-500/10",
    badgeBorder: "border-blue-500/35",
    badgeText: "text-blue-300",
    cardBorder: "border-blue-400/50",
    cardGlow: "shadow-[0_0_60px_rgba(59,130,246,0.35)]",
    auraGradient: "from-blue-500/40 via-indigo-500/20 to-transparent",
    particleColors: ["#3b82f6", "#60a5fa", "#93c5fd", "#ffffff", "#818cf8"],
    particleCount: 130,
    shakeIntensity: 5.0,
    chargingDurationMs: 850,
    raysCount: 8,
    soundPitchOffset: 4,
    raysOpacity: 0.12,
  },
  epic: {
    name: "epic",
    label: "Epic Reward",
    primaryColor: "#c084fc", // Purple / Fuchsia
    secondaryColor: "#9333ea",
    accentColor: "#f0abfc",
    glowColor: "rgba(192, 132, 252, 0.65)",
    badgeBg: "bg-purple-500/15",
    badgeBorder: "border-purple-400/40",
    badgeText: "text-purple-300",
    cardBorder: "border-purple-400/60",
    cardGlow: "shadow-[0_0_75px_rgba(192,132,252,0.45)]",
    auraGradient: "from-purple-500/50 via-fuchsia-500/25 to-transparent",
    particleColors: ["#c084fc", "#e879f9", "#f0abfc", "#ffffff", "#a855f7", "#ec4899"],
    particleCount: 180,
    shakeIntensity: 7.5,
    chargingDurationMs: 950,
    raysCount: 14,
    soundPitchOffset: 6,
    raysOpacity: 0.15,
  },
  legendary: {
    name: "legendary",
    label: "LEGENDARY REWARD",
    primaryColor: "#fbbf24", // Radiant Gold
    secondaryColor: "#d97706",
    accentColor: "#fef08a",
    glowColor: "rgba(251, 191, 36, 0.8)",
    badgeBg: "bg-amber-500/20",
    badgeBorder: "border-amber-400/60",
    badgeText: "text-amber-200",
    cardBorder: "border-amber-400/80",
    cardGlow: "shadow-[0_0_100px_rgba(251,191,36,0.6)]",
    auraGradient: "from-amber-400/60 via-fuchsia-500/30 to-amber-500/15",
    particleColors: ["#fbbf24", "#f59e0b", "#fef08a", "#ffffff", "#f43f5e", "#fb7185", "#ffd700"],
    particleCount: 260,
    shakeIntensity: 12.0,
    chargingDurationMs: 1050,
    raysCount: 22,
    soundPitchOffset: 9,
    raysOpacity: 0.22,
  },
};

export function getRarityConfig(rarity?: string): RarityTheme {
  if (!rarity) return RARITY_CONFIGS.common;
  const key = rarity.toLowerCase() as RewardRarity;
  return RARITY_CONFIGS[key] || RARITY_CONFIGS.common;
}
