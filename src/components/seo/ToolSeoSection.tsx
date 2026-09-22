"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  ShieldCheck,
  Layers,
  Upload,
  Sliders,
  Download,
  BookOpen,
  ChevronDown,
  Check,
  ImageIcon
} from "lucide-react";
import { TOOLS, ICON_MAP } from "@/data/tools";
import { getRelatedTools } from "@/lib/related-tools";
import { cn } from "@/lib/utils";

interface ToolSeoSectionProps {
  toolName: string;
  toolDescription: string;
  categoryName?: string;
  categoryId?: string;
  toolSlug?: string;
  features?: string[];
  howToSteps?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  useCases?: string[];
  limitations?: string[];
  examples?: string[];
  terminology?: Array<{ term: string; definition: string }>;
  seoIntro?: string;
  keywords?: string[];
  showRelatedTools?: boolean;
}

// Dynamic Category Theme Specifications (11 categories)
interface CategoryThemeConfig {
  primaryHex: string;
  laserGradient: string;
  laserBloom: string;
  textAccent: string;
  headingGradient: string;
  badgeBorder: string;
  badgeBg: string;
  badgeDot: string;
  badgeText: string;
  ambientLight1: string;
  ambientLight2: string;
  cardBorderHover: string;
  cardShadowHover: string;
  cardSpotlight: string;
  heroSpotlight: string;
  iconContainer: string;
  conduitGradient: string;
  conduitShimmer: string;
  stepNumberGradients: [string, string, string];
  stepBadgeText: string;
  whyChooseIconBg: string;
  whyChooseIconBorder: string;
  whyChooseIconText: string;
  whyChooseCardHover: string;
  faqOpenBorder: string;
  faqBadgeOpen: string;
  faqTextOpen: string;
  faqChevronOpen: string;
  suggestionsCardHover: string;
  suggestionsActionText: string;
  viewAllBtn: string;
}

const CATEGORY_THEMES: Record<string, CategoryThemeConfig> = {
  image: {
    primaryHex: "#06b6d4",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(6,182,212,0.1) 295deg, #06b6d4 325deg, #22d3ee 348deg, #a5f3fc 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #06b6d4 325deg, #22d3ee 348deg, transparent 360deg)",
    textAccent: "text-cyan-300",
    headingGradient: "from-white via-slate-100 to-cyan-200",
    badgeBorder: "border-cyan-400/40",
    badgeBg: "bg-cyan-500/10",
    badgeDot: "bg-cyan-400",
    badgeText: "text-cyan-300",
    ambientLight1: "bg-cyan-500/15",
    ambientLight2: "bg-cyan-600/10",
    cardBorderHover: "hover:border-cyan-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(6,182,212,0.18)]",
    cardSpotlight: "rgba(6, 182, 212, 0.16)",
    heroSpotlight: "rgba(6, 182, 212, 0.08)",
    iconContainer: "border-cyan-400/30 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]",
    conduitGradient: "from-cyan-500/30 via-cyan-400/50 to-cyan-500/30",
    conduitShimmer: "via-cyan-300",
    stepNumberGradients: ["from-cyan-500 to-blue-600", "from-cyan-400 to-teal-500", "from-sky-500 to-cyan-600"],
    stepBadgeText: "text-cyan-300",
    whyChooseIconBg: "bg-cyan-500/15",
    whyChooseIconBorder: "border-cyan-400/30",
    whyChooseIconText: "text-cyan-400",
    whyChooseCardHover: "hover:border-cyan-400/50 hover:bg-cyan-500/[0.04] hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]",
    faqOpenBorder: "border-cyan-400/50 bg-cyan-500/[0.04] shadow-[0_0_25px_rgba(6,182,212,0.12)]",
    faqBadgeOpen: "bg-cyan-400/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]",
    faqTextOpen: "text-cyan-100",
    faqChevronOpen: "text-cyan-300",
    suggestionsCardHover: "hover:border-cyan-400/50 hover:shadow-[0_15px_35px_rgba(6,182,212,0.18)]",
    suggestionsActionText: "text-cyan-400 group-hover:text-cyan-300",
    viewAllBtn: "text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-400/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]",
  },
  video: {
    primaryHex: "#8b5cf6",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(139,92,246,0.1) 295deg, #8b5cf6 325deg, #a78bfa 348deg, #ddd6fe 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #8b5cf6 325deg, #a78bfa 348deg, transparent 360deg)",
    textAccent: "text-violet-300",
    headingGradient: "from-white via-slate-100 to-violet-200",
    badgeBorder: "border-violet-400/40",
    badgeBg: "bg-violet-500/10",
    badgeDot: "bg-violet-400",
    badgeText: "text-violet-300",
    ambientLight1: "bg-violet-500/15",
    ambientLight2: "bg-purple-600/10",
    cardBorderHover: "hover:border-violet-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(139,92,246,0.18)]",
    cardSpotlight: "rgba(139, 92, 246, 0.16)",
    heroSpotlight: "rgba(139, 92, 246, 0.08)",
    iconContainer: "border-violet-400/30 bg-violet-500/15 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.2)]",
    conduitGradient: "from-violet-500/30 via-violet-400/50 to-violet-500/30",
    conduitShimmer: "via-violet-300",
    stepNumberGradients: ["from-violet-600 to-indigo-600", "from-violet-500 to-purple-600", "from-indigo-500 to-violet-500"],
    stepBadgeText: "text-violet-300",
    whyChooseIconBg: "bg-violet-500/15",
    whyChooseIconBorder: "border-violet-400/30",
    whyChooseIconText: "text-violet-400",
    whyChooseCardHover: "hover:border-violet-400/50 hover:bg-violet-500/[0.04] hover:shadow-[0_10px_30px_rgba(139,92,246,0.15)]",
    faqOpenBorder: "border-violet-400/50 bg-violet-500/[0.04] shadow-[0_0_25px_rgba(139,92,246,0.12)]",
    faqBadgeOpen: "bg-violet-400/20 border-violet-400 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.3)]",
    faqTextOpen: "text-violet-100",
    faqChevronOpen: "text-violet-300",
    suggestionsCardHover: "hover:border-violet-400/50 hover:shadow-[0_15px_35px_rgba(139,92,246,0.18)]",
    suggestionsActionText: "text-violet-400 group-hover:text-violet-300",
    viewAllBtn: "text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border-violet-400/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)]",
  },
  audio: {
    primaryHex: "#ec4899",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(236,72,153,0.1) 295deg, #ec4899 325deg, #f472b6 348deg, #fbcfe8 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #ec4899 325deg, #f472b6 348deg, transparent 360deg)",
    textAccent: "text-pink-300",
    headingGradient: "from-white via-slate-100 to-pink-200",
    badgeBorder: "border-pink-400/40",
    badgeBg: "bg-pink-500/10",
    badgeDot: "bg-pink-400",
    badgeText: "text-pink-300",
    ambientLight1: "bg-pink-500/15",
    ambientLight2: "bg-rose-600/10",
    cardBorderHover: "hover:border-pink-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(236,72,153,0.18)]",
    cardSpotlight: "rgba(236, 72, 153, 0.16)",
    heroSpotlight: "rgba(236, 72, 153, 0.08)",
    iconContainer: "border-pink-400/30 bg-pink-500/15 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.2)]",
    conduitGradient: "from-pink-500/30 via-pink-400/50 to-pink-500/30",
    conduitShimmer: "via-pink-300",
    stepNumberGradients: ["from-pink-600 to-rose-600", "from-pink-500 to-fuchsia-600", "from-rose-500 to-pink-500"],
    stepBadgeText: "text-pink-300",
    whyChooseIconBg: "bg-pink-500/15",
    whyChooseIconBorder: "border-pink-400/30",
    whyChooseIconText: "text-pink-400",
    whyChooseCardHover: "hover:border-pink-400/50 hover:bg-pink-500/[0.04] hover:shadow-[0_10px_30px_rgba(236,72,153,0.15)]",
    faqOpenBorder: "border-pink-400/50 bg-pink-500/[0.04] shadow-[0_0_25px_rgba(236,72,153,0.12)]",
    faqBadgeOpen: "bg-pink-400/20 border-pink-400 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)]",
    faqTextOpen: "text-pink-100",
    faqChevronOpen: "text-pink-300",
    suggestionsCardHover: "hover:border-pink-400/50 hover:shadow-[0_15px_35px_rgba(236,72,153,0.18)]",
    suggestionsActionText: "text-pink-400 group-hover:text-pink-300",
    viewAllBtn: "text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 border-pink-400/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.25)]",
  },
  pdf: {
    primaryHex: "#ef4444",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(239,68,68,0.1) 295deg, #ef4444 325deg, #f87171 348deg, #fecaca 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #ef4444 325deg, #f87171 348deg, transparent 360deg)",
    textAccent: "text-red-300",
    headingGradient: "from-white via-slate-100 to-red-200",
    badgeBorder: "border-red-400/40",
    badgeBg: "bg-red-500/10",
    badgeDot: "bg-red-400",
    badgeText: "text-red-300",
    ambientLight1: "bg-red-500/15",
    ambientLight2: "bg-rose-700/10",
    cardBorderHover: "hover:border-red-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(239,68,68,0.18)]",
    cardSpotlight: "rgba(239, 68, 68, 0.16)",
    heroSpotlight: "rgba(239, 68, 68, 0.08)",
    iconContainer: "border-red-400/30 bg-red-500/15 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.2)]",
    conduitGradient: "from-red-500/30 via-red-400/50 to-red-500/30",
    conduitShimmer: "via-red-300",
    stepNumberGradients: ["from-red-600 to-orange-600", "from-red-500 to-rose-600", "from-rose-600 to-red-500"],
    stepBadgeText: "text-red-300",
    whyChooseIconBg: "bg-red-500/15",
    whyChooseIconBorder: "border-red-400/30",
    whyChooseIconText: "text-red-400",
    whyChooseCardHover: "hover:border-red-400/50 hover:bg-red-500/[0.04] hover:shadow-[0_10px_30px_rgba(239,68,68,0.15)]",
    faqOpenBorder: "border-red-400/50 bg-red-500/[0.04] shadow-[0_0_25px_rgba(239,68,68,0.12)]",
    faqBadgeOpen: "bg-red-400/20 border-red-400 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]",
    faqTextOpen: "text-red-100",
    faqChevronOpen: "text-red-300",
    suggestionsCardHover: "hover:border-red-400/50 hover:shadow-[0_15px_35px_rgba(239,68,68,0.18)]",
    suggestionsActionText: "text-red-400 group-hover:text-red-300",
    viewAllBtn: "text-red-300 bg-red-500/10 hover:bg-red-500/20 border-red-400/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.25)]",
  },
  ai: {
    primaryHex: "#f59e0b",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(245,158,11,0.1) 295deg, #f59e0b 325deg, #fbbf24 348deg, #fde68a 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #f59e0b 325deg, #fbbf24 348deg, transparent 360deg)",
    textAccent: "text-amber-300",
    headingGradient: "from-white via-slate-100 to-amber-200",
    badgeBorder: "border-amber-400/40",
    badgeBg: "bg-amber-500/10",
    badgeDot: "bg-amber-400",
    badgeText: "text-amber-300",
    ambientLight1: "bg-amber-500/15",
    ambientLight2: "bg-orange-600/10",
    cardBorderHover: "hover:border-amber-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(245,158,11,0.18)]",
    cardSpotlight: "rgba(245, 158, 11, 0.16)",
    heroSpotlight: "rgba(245, 158, 11, 0.08)",
    iconContainer: "border-amber-400/30 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    conduitGradient: "from-amber-500/30 via-amber-400/50 to-amber-500/30",
    conduitShimmer: "via-amber-300",
    stepNumberGradients: ["from-amber-500 to-orange-600", "from-amber-400 to-yellow-600", "from-yellow-500 to-amber-600"],
    stepBadgeText: "text-amber-300",
    whyChooseIconBg: "bg-amber-500/15",
    whyChooseIconBorder: "border-amber-400/30",
    whyChooseIconText: "text-amber-400",
    whyChooseCardHover: "hover:border-amber-400/50 hover:bg-amber-500/[0.04] hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]",
    faqOpenBorder: "border-amber-400/50 bg-amber-500/[0.04] shadow-[0_0_25px_rgba(245,158,11,0.12)]",
    faqBadgeOpen: "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
    faqTextOpen: "text-amber-100",
    faqChevronOpen: "text-amber-300",
    suggestionsCardHover: "hover:border-amber-400/50 hover:shadow-[0_15px_35px_rgba(245,158,11,0.18)]",
    suggestionsActionText: "text-amber-400 group-hover:text-amber-300",
    viewAllBtn: "text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border-amber-400/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]",
  },
  productivity: {
    primaryHex: "#10b981",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(16,185,129,0.1) 295deg, #10b981 325deg, #34d399 348deg, #a7f3d0 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #10b981 325deg, #34d399 348deg, transparent 360deg)",
    textAccent: "text-emerald-300",
    headingGradient: "from-white via-slate-100 to-emerald-200",
    badgeBorder: "border-emerald-400/40",
    badgeBg: "bg-emerald-500/10",
    badgeDot: "bg-emerald-400",
    badgeText: "text-emerald-300",
    ambientLight1: "bg-emerald-500/15",
    ambientLight2: "bg-teal-600/10",
    cardBorderHover: "hover:border-emerald-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(16,185,129,0.18)]",
    cardSpotlight: "rgba(16, 185, 129, 0.16)",
    heroSpotlight: "rgba(16, 185, 129, 0.08)",
    iconContainer: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
    conduitGradient: "from-emerald-500/30 via-emerald-400/50 to-emerald-500/30",
    conduitShimmer: "via-emerald-300",
    stepNumberGradients: ["from-emerald-600 to-teal-600", "from-emerald-500 to-green-600", "from-teal-500 to-emerald-500"],
    stepBadgeText: "text-emerald-300",
    whyChooseIconBg: "bg-emerald-500/15",
    whyChooseIconBorder: "border-emerald-400/30",
    whyChooseIconText: "text-emerald-400",
    whyChooseCardHover: "hover:border-emerald-400/50 hover:bg-emerald-500/[0.04] hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)]",
    faqOpenBorder: "border-emerald-400/50 bg-emerald-500/[0.04] shadow-[0_0_25px_rgba(16,185,129,0.12)]",
    faqBadgeOpen: "bg-emerald-400/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
    faqTextOpen: "text-emerald-100",
    faqChevronOpen: "text-emerald-300",
    suggestionsCardHover: "hover:border-emerald-400/50 hover:shadow-[0_15px_35px_rgba(16,185,129,0.18)]",
    suggestionsActionText: "text-emerald-400 group-hover:text-emerald-300",
    viewAllBtn: "text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-400/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]",
  },
  developer: {
    primaryHex: "#84cc16",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(132,204,22,0.1) 295deg, #84cc16 325deg, #a3e635 348deg, #d9f99d 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #84cc16 325deg, #a3e635 348deg, transparent 360deg)",
    textAccent: "text-lime-300",
    headingGradient: "from-white via-slate-100 to-lime-200",
    badgeBorder: "border-lime-400/40",
    badgeBg: "bg-lime-500/10",
    badgeDot: "bg-lime-400",
    badgeText: "text-lime-300",
    ambientLight1: "bg-lime-500/15",
    ambientLight2: "bg-emerald-600/10",
    cardBorderHover: "hover:border-lime-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(132,204,22,0.18)]",
    cardSpotlight: "rgba(132, 204, 22, 0.16)",
    heroSpotlight: "rgba(132, 204, 22, 0.08)",
    iconContainer: "border-lime-400/30 bg-lime-500/15 text-lime-300 shadow-[0_0_12px_rgba(132,204,22,0.2)]",
    conduitGradient: "from-lime-500/30 via-lime-400/50 to-lime-500/30",
    conduitShimmer: "via-lime-300",
    stepNumberGradients: ["from-lime-600 to-emerald-600", "from-lime-500 to-green-600", "from-emerald-500 to-lime-500"],
    stepBadgeText: "text-lime-300",
    whyChooseIconBg: "bg-lime-500/15",
    whyChooseIconBorder: "border-lime-400/30",
    whyChooseIconText: "text-lime-400",
    whyChooseCardHover: "hover:border-lime-400/50 hover:bg-lime-500/[0.04] hover:shadow-[0_10px_30px_rgba(132,204,22,0.15)]",
    faqOpenBorder: "border-lime-400/50 bg-lime-500/[0.04] shadow-[0_0_25px_rgba(132,204,22,0.12)]",
    faqBadgeOpen: "bg-lime-400/20 border-lime-400 text-lime-300 shadow-[0_0_12px_rgba(132,204,22,0.3)]",
    faqTextOpen: "text-lime-100",
    faqChevronOpen: "text-lime-300",
    suggestionsCardHover: "hover:border-lime-400/50 hover:shadow-[0_15px_35px_rgba(132,204,22,0.18)]",
    suggestionsActionText: "text-lime-400 group-hover:text-lime-300",
    viewAllBtn: "text-lime-300 bg-lime-500/10 hover:bg-lime-500/20 border-lime-400/30 hover:shadow-[0_0_15px_rgba(132,204,22,0.25)]",
  },
  creator: {
    primaryHex: "#f43f5e",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(244,63,94,0.1) 295deg, #f43f5e 325deg, #fb7185 348deg, #fecdd3 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #f43f5e 325deg, #fb7185 348deg, transparent 360deg)",
    textAccent: "text-rose-300",
    headingGradient: "from-white via-slate-100 to-rose-200",
    badgeBorder: "border-rose-400/40",
    badgeBg: "bg-rose-500/10",
    badgeDot: "bg-rose-400",
    badgeText: "text-rose-300",
    ambientLight1: "bg-rose-500/15",
    ambientLight2: "bg-pink-600/10",
    cardBorderHover: "hover:border-rose-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(244,63,94,0.18)]",
    cardSpotlight: "rgba(244, 63, 94, 0.16)",
    heroSpotlight: "rgba(244, 63, 94, 0.08)",
    iconContainer: "border-rose-400/30 bg-rose-500/15 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
    conduitGradient: "from-rose-500/30 via-rose-400/50 to-rose-500/30",
    conduitShimmer: "via-rose-300",
    stepNumberGradients: ["from-rose-600 to-pink-600", "from-rose-500 to-orange-600", "from-pink-500 to-rose-500"],
    stepBadgeText: "text-rose-300",
    whyChooseIconBg: "bg-rose-500/15",
    whyChooseIconBorder: "border-rose-400/30",
    whyChooseIconText: "text-rose-400",
    whyChooseCardHover: "hover:border-rose-400/50 hover:bg-rose-500/[0.04] hover:shadow-[0_10px_30px_rgba(244,63,94,0.15)]",
    faqOpenBorder: "border-rose-400/50 bg-rose-500/[0.04] shadow-[0_0_25px_rgba(244,63,94,0.12)]",
    faqBadgeOpen: "bg-rose-400/20 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]",
    faqTextOpen: "text-rose-100",
    faqChevronOpen: "text-rose-300",
    suggestionsCardHover: "hover:border-rose-400/50 hover:shadow-[0_15px_35px_rgba(244,63,94,0.18)]",
    suggestionsActionText: "text-rose-400 group-hover:text-rose-300",
    viewAllBtn: "text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border-rose-400/30 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)]",
  },
  student: {
    primaryHex: "#6366f1",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(99,102,241,0.1) 295deg, #6366f1 325deg, #818cf8 348deg, #c7d2fe 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #6366f1 325deg, #818cf8 348deg, transparent 360deg)",
    textAccent: "text-indigo-300",
    headingGradient: "from-white via-slate-100 to-indigo-200",
    badgeBorder: "border-indigo-400/40",
    badgeBg: "bg-indigo-500/10",
    badgeDot: "bg-indigo-400",
    badgeText: "text-indigo-300",
    ambientLight1: "bg-indigo-500/15",
    ambientLight2: "bg-purple-600/10",
    cardBorderHover: "hover:border-indigo-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(99,102,241,0.18)]",
    cardSpotlight: "rgba(99, 102, 241, 0.16)",
    heroSpotlight: "rgba(99, 102, 241, 0.08)",
    iconContainer: "border-indigo-400/30 bg-indigo-500/15 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]",
    conduitGradient: "from-indigo-500/30 via-indigo-400/50 to-indigo-500/30",
    conduitShimmer: "via-indigo-300",
    stepNumberGradients: ["from-indigo-600 to-blue-600", "from-indigo-500 to-violet-600", "from-blue-500 to-indigo-500"],
    stepBadgeText: "text-indigo-300",
    whyChooseIconBg: "bg-indigo-500/15",
    whyChooseIconBorder: "border-indigo-400/30",
    whyChooseIconText: "text-indigo-400",
    whyChooseCardHover: "hover:border-indigo-400/50 hover:bg-indigo-500/[0.04] hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)]",
    faqOpenBorder: "border-indigo-400/50 bg-indigo-500/[0.04] shadow-[0_0_25px_rgba(99,102,241,0.12)]",
    faqBadgeOpen: "bg-indigo-400/20 border-indigo-400 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]",
    faqTextOpen: "text-indigo-100",
    faqChevronOpen: "text-indigo-300",
    suggestionsCardHover: "hover:border-indigo-400/50 hover:shadow-[0_15px_35px_rgba(99,102,241,0.18)]",
    suggestionsActionText: "text-indigo-400 group-hover:text-indigo-300",
    viewAllBtn: "text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-400/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]",
  },
  business: {
    primaryHex: "#f97316",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(249,115,22,0.1) 295deg, #f97316 325deg, #fb923c 348deg, #fed7aa 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #f97316 325deg, #fb923c 348deg, transparent 360deg)",
    textAccent: "text-orange-300",
    headingGradient: "from-white via-slate-100 to-orange-200",
    badgeBorder: "border-orange-400/40",
    badgeBg: "bg-orange-500/10",
    badgeDot: "bg-orange-400",
    badgeText: "text-orange-300",
    ambientLight1: "bg-orange-500/15",
    ambientLight2: "bg-amber-600/10",
    cardBorderHover: "hover:border-orange-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(249,115,22,0.18)]",
    cardSpotlight: "rgba(249, 115, 22, 0.16)",
    heroSpotlight: "rgba(249, 115, 22, 0.08)",
    iconContainer: "border-orange-400/30 bg-orange-500/15 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.2)]",
    conduitGradient: "from-orange-500/30 via-orange-400/50 to-orange-500/30",
    conduitShimmer: "via-orange-300",
    stepNumberGradients: ["from-orange-600 to-amber-600", "from-orange-500 to-red-600", "from-amber-500 to-orange-500"],
    stepBadgeText: "text-orange-300",
    whyChooseIconBg: "bg-orange-500/15",
    whyChooseIconBorder: "border-orange-400/30",
    whyChooseIconText: "text-orange-400",
    whyChooseCardHover: "hover:border-orange-400/50 hover:bg-orange-500/[0.04] hover:shadow-[0_10px_30px_rgba(249,115,22,0.15)]",
    faqOpenBorder: "border-orange-400/50 bg-orange-500/[0.04] shadow-[0_0_25px_rgba(249,115,22,0.12)]",
    faqBadgeOpen: "bg-orange-400/20 border-orange-400 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)]",
    faqTextOpen: "text-orange-100",
    faqChevronOpen: "text-orange-300",
    suggestionsCardHover: "hover:border-orange-400/50 hover:shadow-[0_15px_35px_rgba(249,115,22,0.18)]",
    suggestionsActionText: "text-orange-400 group-hover:text-orange-300",
    viewAllBtn: "text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border-orange-400/30 hover:shadow-[0_0_15px_rgba(249,115,22,0.25)]",
  },
  seo: {
    primaryHex: "#0284c7",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(2,132,199,0.1) 295deg, #0284c7 325deg, #38bdf8 348deg, #bae6fd 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #0284c7 325deg, #38bdf8 348deg, transparent 360deg)",
    textAccent: "text-sky-300",
    headingGradient: "from-white via-slate-100 to-sky-200",
    badgeBorder: "border-sky-400/40",
    badgeBg: "bg-sky-500/10",
    badgeDot: "bg-sky-400",
    badgeText: "text-sky-300",
    ambientLight1: "bg-sky-500/15",
    ambientLight2: "bg-cyan-600/10",
    cardBorderHover: "hover:border-sky-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(2,132,199,0.18)]",
    cardSpotlight: "rgba(2, 132, 199, 0.16)",
    heroSpotlight: "rgba(2, 132, 199, 0.08)",
    iconContainer: "border-sky-400/30 bg-sky-500/15 text-sky-300 shadow-[0_0_12px_rgba(2,132,199,0.2)]",
    conduitGradient: "from-sky-500/30 via-sky-400/50 to-sky-500/30",
    conduitShimmer: "via-sky-300",
    stepNumberGradients: ["from-sky-600 to-cyan-600", "from-sky-500 to-blue-600", "from-cyan-500 to-sky-500"],
    stepBadgeText: "text-sky-300",
    whyChooseIconBg: "bg-sky-500/15",
    whyChooseIconBorder: "border-sky-400/30",
    whyChooseIconText: "text-sky-400",
    whyChooseCardHover: "hover:border-sky-400/50 hover:bg-sky-500/[0.04] hover:shadow-[0_10px_30px_rgba(2,132,199,0.15)]",
    faqOpenBorder: "border-sky-400/50 bg-sky-500/[0.04] shadow-[0_0_25px_rgba(2,132,199,0.12)]",
    faqBadgeOpen: "bg-sky-400/20 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(2,132,199,0.3)]",
    faqTextOpen: "text-sky-100",
    faqChevronOpen: "text-sky-300",
    suggestionsCardHover: "hover:border-sky-400/50 hover:shadow-[0_15px_35px_rgba(2,132,199,0.18)]",
    suggestionsActionText: "text-sky-400 group-hover:text-sky-300",
    viewAllBtn: "text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border-sky-400/30 hover:shadow-[0_0_15px_rgba(2,132,199,0.25)]",
  },
};

export function ToolSeoSection({
  toolName,
  toolDescription,
  categoryName = "Image Tools",
  categoryId = "image",
  toolSlug,
  features,
  howToSteps,
  faqs,
  useCases,
  limitations,
  examples,
  terminology,
  seoIntro,
  keywords,
  showRelatedTools = true,
}: ToolSeoSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Resolve active theme with fallback to Image (cyan) or AI (amber)
  const normCatId = (categoryId || "image").toLowerCase();
  const theme = CATEGORY_THEMES[normCatId] || CATEGORY_THEMES.image;

  // Track mouse on hero container for interactive spotlight
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Category-specific human-friendly, zero-jargon content blueprints
  const getCategoryDefaults = (catId: string, name: string) => {
    switch (catId) {
      case "video":
        return {
          valueProps: [
            { title: "Smooth High-Def Quality", badge: "Up to 4K", desc: "Exports silky, crisp video without stutter, pixelation, or frame drops.", icon: Zap },
            { title: "Universal Formats", badge: "MP4 • WebM • MOV", desc: "Native support for all major phone, camera, and screen recording formats.", icon: Layers },
            { title: "Fast In-Browser Cuts", badge: "Instant Processing", desc: "Edit clips directly on your device with no queues, software installs, or waiting.", icon: Sliders },
            { title: "Zero Watermarks", badge: "100% Clean Exports", desc: "Completely watermark-free. Ready for YouTube, TikTok, Instagram Reels, and ads.", icon: CheckCircle2 },
          ],
          features: [
            `Smooth High-Def Playback: Exports silky 1080p and 4K clips without stutter or frame drops.`,
            `Universal Video Compatibility: Native support for MP4, MOV, WebM, and MKV files.`,
            `Fast In-Browser Cuts: Trim, split, and edit video directly on your device with zero lag.`,
            `Watermark-Free Rendering: Produce studio-ready clips for YouTube, TikTok, Reels, and ads.`
          ],
          howToSteps: [
            `Select or drag your video file into the ${name} studio timeline.`,
            `Fine-tune your cuts, captions, or resolution preset to get the exact clip you want.`,
            `Click export and download your smooth, watermark-free video immediately.`
          ],
          faqs: [
            { question: `What video resolutions and formats does ${name} support?`, answer: `${name} supports widescreen 16:9, vertical 9:16 reels/shorts, and 1:1 square feeds up to 4K resolution.` },
            { question: `Will my video have a watermark after exporting?`, answer: `No! All videos rendered on Exismic are 100% clean and free of watermarks.` },
            { question: `How fast does video processing take?`, answer: `Most clips process in just a few seconds directly in your browser with zero server waiting.` },
            { question: `Are my private videos kept safe?`, answer: `Yes, your video files are processed safely and are never stored, saved, or shared.` }
          ]
        };
      case "audio":
        return {
          valueProps: [
            { title: "Studio Sound Quality", badge: "Crystal-Clear", desc: "Preserves deep sub-bass, warm vocals, and clean highs without metallic distortion.", icon: Zap },
            { title: "Clean Vocal Isolation", badge: "Zero Bleed", desc: "Separates singing voices and instruments cleanly with natural acoustic balance.", icon: Layers },
            { title: "Universal Audio Codecs", badge: "MP3 • WAV • FLAC", desc: "Handles all standard audio formats from voice notes to high-resolution master tracks.", icon: Upload },
            { title: "Zero Watermarks", badge: "Commercial Ready", desc: "Export clean stems and audio files ready for Spotify, YouTube, and podcasts.", icon: CheckCircle2 },
          ],
          features: [
            `Studio Sound Quality: Clean audio preservation with deep bass, warm mids, and crisp highs.`,
            `Clean Vocal Isolation: Separate singing voices from background music without harsh distortion.`,
            `Universal Audio Formats: Complete support for MP3, WAV, FLAC, AAC, and M4A sound files.`,
            `Live Waveform Monitor: Real-time interactive frequency playback to listen before exporting.`
          ],
          howToSteps: [
            `Drop your audio track or voice recording into the ${name} player above.`,
            `Choose your vocal mode, reverb fader, or noise reduction preset.`,
            `Listen to the live preview and download your clean WAV or MP3 stem.`
          ],
          faqs: [
            { question: `Does ${name} alter the stereo depth or sound fidelity?`, answer: `No. ${name} preserves full stereo depth and rich sound quality without robotic distortion.` },
            { question: `What audio formats can I upload and export?`, answer: `You can upload and export across all major audio formats including MP3, WAV, FLAC, AAC, and M4A.` },
            { question: `Can I use processed audio for commercial tracks or podcasts?`, answer: `Yes! Any audio you process is 100% royalty-free for personal, commercial, or client work.` },
            { question: `Are my music tracks and voice recordings kept private?`, answer: `Yes. Your audio files are processed securely and are never stored or shared.` }
          ]
        };
      case "pdf":
        return {
          valueProps: [
            { title: "Keeps Layouts Intact", badge: "Pixel-Perfect", desc: "Preserves your original fonts, high-res pictures, and clickable links without shifting.", icon: Layers },
            { title: "100% Private & Local", badge: "Zero Server Uploads", desc: "Your confidential agreements, invoices, and documents never leave your computer.", icon: ShieldCheck },
            { title: "Compact File Sizes", badge: "Optimized Weight", desc: "Shrinks file size significantly while keeping text sharp and readable.", icon: Zap },
            { title: "Simple Page Reordering", badge: "Visual Thumbnails", desc: "Drag and drop to rearrange, merge, or delete pages in seconds.", icon: CheckCircle2 },
          ],
          features: [
            `Keeps Layouts & Fonts Intact: Preserves original typography, graphics, and links perfectly.`,
            `100% Private & Local: Your confidential documents stay safely on your computer.`,
            `Compact File Sizes: Shrinks PDF weights while keeping text crisp and readable.`,
            `Simple Page Reordering: Effortlessly merge, split, and rotate pages with visual thumbnails.`
          ],
          howToSteps: [
            `Upload your PDF files or drag them straight onto the ${name} workspace.`,
            `Reorder pages, select page ranges, or choose your target compression level.`,
            `Click process and download your merged, compressed, or converted document.`
          ],
          faqs: [
            { question: `Are my confidential contracts and documents safe?`, answer: `Yes. All processing happens privately on your computer. Your files are never uploaded or saved to any server.` },
            { question: `Will compressing or converting disrupt the fonts or links?`, answer: `No. Your layouts, embedded fonts, and clickable links remain sharp and readable.` },
            { question: `Can I use this tool on my phone or tablet?`, answer: `Yes! ${name} works smoothly in mobile Safari, Chrome, and desktop browsers on iOS, Android, and PC.` },
            { question: `Is there a page limit for documents?`, answer: `You can process large documents with dozens of pages with fast, reliable performance.` }
          ]
        };
      case "ai":
        return {
          valueProps: [
            { title: "Creative Brainstorming", badge: "Instant Inspiration", desc: "Get sharp copy, fresh concepts, and creative visual assets in seconds.", icon: Zap },
            { title: "Natural Human Flow", badge: "Engaging Tone", desc: "Well-structured writing and responses that sound authentic, relatable, and natural.", icon: Layers },
            { title: "1-Click Customization", badge: "Tailored to You", desc: "Tune the tone, length, and style in seconds to match your exact personal voice.", icon: Sliders },
            { title: "Zero Wait Queues", badge: "Instant Results", desc: "Generates your content immediately with no complicated setup or software to install.", icon: CheckCircle2 },
          ],
          features: [
            `Creative Brainstorming: Instant inspiration, sharp copy, and creative visual concepts.`,
            `Natural Human Flow: Engaging, well-structured writing that sounds authentic and relatable.`,
            `1-Click Customization: Tune the tone, length, and style in seconds to match your exact voice.`,
            `Instant Results: Fast generation with zero waiting queues or complicated setups.`
          ],
          howToSteps: [
            `Enter your prompt, text, or parameters into the ${name} workspace above.`,
            `Choose your preferred style, format, or options.`,
            `Review your generated output and copy or export your completed result in seconds.`
          ],
          faqs: [
            { question: `Can I use the output from ${name} for commercial projects?`, answer: `Yes! Everything you generate is 100% yours to publish, sell, or use for client work.` },
            { question: `How do I get the best results from ${name}?`, answer: `Be specific about your topic, audience, and preferred tone for optimal output.` },
            { question: `Are my prompts and ideas kept private?`, answer: `Yes. We do not use your personal prompts or private text to train public models.` },
            { question: `Do I need technical skills or coding knowledge to use this?`, answer: `Not at all. Every tool is designed with a simple, intuitive interface for creators.` }
          ]
        };
      case "productivity":
        return {
          valueProps: [
            { title: "Streamlined Workflows", badge: "Instant Output", desc: "Finish routine tasks in seconds without clutter, confusion, or busywork.", icon: Zap },
            { title: "Clear Visual Formatting", badge: "Clean Layouts", desc: "Generate resumes, barcodes, and palettes with modern high-contrast styling.", icon: Layers },
            { title: "Customizable Styles", badge: "Full Flexibility", desc: "Tweak colors, margins, fonts, and details to fit your personal or brand needs.", icon: Sliders },
            { title: "1-Click Copy & Export", badge: "Fast Downloads", desc: "Save your results as PNG or PDF, or copy directly to your clipboard in 1 tap.", icon: CheckCircle2 },
          ],
          features: [
            `Streamlined Daily Workflows: Finish routine tasks in seconds without clutter or friction.`,
            `Instant Visual Output: Generate barcodes, QR codes, palettes, and formatted outputs immediately.`,
            `Customizable Styles: Tweak colors, fonts, margins, and options to fit your needs.`,
            `Fast 1-Click Exports: Save your results as PDF, PNG, or copy directly to your clipboard.`
          ],
          howToSteps: [
            `Enter your values, details, or preferences into the ${name} form above.`,
            `Configure your layout, formatting, or parameters.`,
            `Click copy or download to save and share your work immediately.`
          ],
          faqs: [
            { question: `Is ${name} completely free to use?`, answer: `Yes, it is 100% free with no sign-up or credit card required.` },
            { question: `Does it work well on mobile devices?`, answer: `Yes, the interface is fully responsive and works smoothly on smartphones and tablets.` },
            { question: `Can I export or copy my results easily?`, answer: `Yes, you can copy outputs directly to your clipboard or download formatted files instantly.` },
            { question: `Is my input data saved or tracked?`, answer: `No. Your inputs are used only during your active session and are never saved or sold.` }
          ]
        };
      case "developer":
        return {
          valueProps: [
            { title: "Runs In Your Browser", badge: "Zero Latency", desc: "Instant formatting and parsing with zero network round-trips or delays.", icon: Zap },
            { title: "Clean Syntax Styling", badge: "Readable Code", desc: "Beautiful code formatting with color highlighting, line numbers, and indentation.", icon: Layers },
            { title: "1-Click Clipboard Sync", badge: "Instant Copy", desc: "Fast copy buttons for JSON, regex, tokens, and styled snippets.", icon: Sliders },
            { title: "100% Private & Secure", badge: "Zero Telemetry", desc: "Sensitive tokens, API keys, and schemas never leave your browser window.", icon: ShieldCheck },
          ],
          features: [
            `Runs Entirely In Browser: Instant formatting and parsing with zero network round-trips.`,
            `Clean Syntax Highlighting: Beautiful code formatting with color tags and line numbers.`,
            `1-Click Clipboard Actions: Fast copy buttons for JSON, regex, tokens, and code snippets.`,
            `Zero Data Storage: Sensitive tokens, keys, and schemas never leave your browser window.`
          ],
          howToSteps: [
            `Enter your code, text, or parameters into the ${name} workspace above.`,
            `Select your formatting, options, or conversion settings.`,
            `Inspect the verified output and copy or download your clean result.`
          ],
          faqs: [
            { question: `Is my proprietary source code or data transmitted to a server?`, answer: `No. Everything runs client-side in your browser. Your code never leaves your computer.` },
            { question: `Can I use generated code in commercial software?`, answer: `Yes! All outputs are completely open for use in open-source and commercial applications.` },
            { question: `Does ${name} require installing any packages or CLI tools?`, answer: `None at all. It runs directly inside your browser with zero installation.` },
            { question: `Does it validate syntax errors automatically?`, answer: `Yes, it highlights formatting mistakes and syntax errors in real time as you type.` }
          ]
        };
      case "creator":
        return {
          valueProps: [
            { title: "Attention-Grabbing", badge: "Viral Formats", desc: "Designed to maximize audience retention, click-throughs, and social shares.", icon: Zap },
            { title: "Platform Ready", badge: "Pixel-Perfect", desc: "Built to exact dimensions for Instagram, X/Twitter, LinkedIn, TikTok, and YouTube.", icon: Layers },
            { title: "High-Res Exports", badge: "Crystal-Clear", desc: "Download sharp PNG graphics and scripts ready to post or broadcast right away.", icon: Sliders },
            { title: "Zero Watermarks", badge: "100% Free Forever", desc: "Create and export clean content with zero branding or watermarks.", icon: CheckCircle2 },
          ],
          features: [
            `Attention-Grabbing Visuals: Designed to maximize click-throughs, likes, and shares.`,
            `Pixel-Perfect Platform Sizes: Built for Instagram, Twitter/X, LinkedIn, TikTok, and YouTube.`,
            `High-Resolution Exports: Crisp PNG and MP4 downloads ready to post immediately.`,
            `Fast Studio Presets: Jumpstart your content with curated templates for any niche.`
          ],
          howToSteps: [
            `Type your copy or choose a curated template from the ${name} library.`,
            `Customize colors, avatar, typography, and layout accents.`,
            `Export your clean graphic or script and share with your audience.`
          ],
          faqs: [
            { question: `Are exports formatted for social media algorithms?`, answer: `Yes! Dimensions, contrast ratios, and typography are optimized for maximum engagement.` },
            { question: `Will downloaded graphics have any watermarks?`, answer: `Never. All graphics and templates are 100% clean and watermark-free.` },
            { question: `Can I customize brand colors and fonts?`, answer: `Yes, you can customize color schemes, fonts, and layout styles to match your personal brand.` },
            { question: `Is this tool easy to use on a smartphone?`, answer: `Yes, the mobile layout includes quick touch tabs and simplified controls for on-the-go creators.` }
          ]
        };
      case "student":
        return {
          valueProps: [
            { title: "Bite-Sized Summaries", badge: "Clear Takeaways", desc: "Condenses dense textbooks and lecture notes into easy-to-digest study points.", icon: Zap },
            { title: "Step-by-Step Solutions", badge: "Easy to Follow", desc: "Breaks down complex formulas, math problems, and science questions logically.", icon: Layers },
            { title: "Structured References", badge: "Academic Formats", desc: "Generate organized study guides, summaries, and accurate references.", icon: Sliders },
            { title: "Zero Cost for Students", badge: "100% Free", desc: "Study tools accessible to everyone with zero paywalls, limits, or accounts.", icon: CheckCircle2 },
          ],
          features: [
            `Clear Learning Summaries: Condenses dense textbooks and lecture notes into bite-sized key points.`,
            `Accurate Step-by-Step Solutions: Breaks down complex math, equations, and science concepts.`,
            `Structured Learning Support: Generates clear, well-formatted reference outputs and study guides.`,
            `Interactive Study Aids: Flip flashcards and visual mind maps to master difficult topics.`
          ],
          howToSteps: [
            `Enter your study material, problem, or text into ${name} above.`,
            `Pick your study format, calculation mode, or options.`,
            `Review the structured learning notes and download your revision sheet.`
          ],
          faqs: [
            { question: `How does ${name} help improve study retention?`, answer: `By structuring complex topics into visual diagrams, key bullet points, and recall cards.` },
            { question: `Can I export study notes to print or share?`, answer: `Yes, you can export your notes, flashcards, and diagrams as clean PDF or image files.` },
            { question: `Does ${name} follow standard academic conventions?`, answer: `Yes, all outputs follow verified educational methodologies and standard formatting conventions.` },
            { question: `Is this tool free for students?`, answer: `Yes! It is completely free with no subscription or account required.` }
          ]
        };
      case "business":
        return {
          valueProps: [
            { title: "Accurate Math & Rates", badge: "Precise Formulas", desc: "Accurate tax deductions, EMIs, salary take-homes, and profit margins.", icon: Zap },
            { title: "Clear Breakdowns", badge: "Easy Tables", desc: "Simple visual charts showing every deduction, interest payment, and net revenue.", icon: Layers },
            { title: "Client-Ready Documents", badge: "Clean Exports", desc: "Produce professional estimates, invoices, and summaries with clean branding.", icon: Sliders },
            { title: "100% Private Data", badge: "Runs Locally", desc: "Your revenue, expenses, and salary numbers remain strictly on your device.", icon: ShieldCheck },
          ],
          features: [
            `Accurate Financial Calculations: Precise profit margins, taxes, EMIs, and take-home salary projections.`,
            `Clear Financial Breakdowns: Easy-to-read charts and tables showing every deduction and revenue stream.`,
            `Client-Ready Documents: Generate professional invoices and estimates with clean branding.`,
            `Private & Secure: Financial figures remain strictly on your local browser.`
          ],
          howToSteps: [
            `Input your principal amount, rate, salary, or transaction values into ${name}.`,
            `Adjust the sliders for tenure, tax rates, or margin goals.`,
            `View your complete financial summary and export or print your sheet.`
          ],
          faqs: [
            { question: `Are financial calculations accurate and up-to-date?`, answer: `Yes, calculations follow current standard tax formulas, banking compounding rules, and profit margin formulas.` },
            { question: `Is my private financial information stored anywhere?`, answer: `Never. All numbers are calculated locally in your browser and are deleted when you leave.` },
            { question: `Can I export or print the breakdown for client proposals?`, answer: `Yes, you can print or download the complete summary table in 1 click.` },
            { question: `Can I use this on a mobile device during client meetings?`, answer: `Yes! The mobile interface is fully responsive and easy to read on any phone.` }
          ]
        };
      case "seo":
        return {
          valueProps: [
            { title: "Higher Google Clicks", badge: "SERP Optimized", desc: "Craft headlines and descriptions that stand out on Google search pages.", icon: Zap },
            { title: "Social Share Cards", badge: "Open Graph Tags", desc: "Generates beautiful link preview cards for Twitter/X, LinkedIn, and Facebook.", icon: Layers },
            { title: "Search Engine Validated", badge: "Clean Standards", desc: "Produces valid Schema.org tags, robots.txt directives, and XML sitemaps.", icon: Sliders },
            { title: "Live Desktop & Mobile SERP", badge: "Instant Preview", desc: "See exactly how your search snippet looks before publishing your website.", icon: CheckCircle2 },
          ],
          features: [
            `Higher Search Visibility: Formulate titles and descriptions that earn clicks on Google.`,
            `Standard Meta Tags: Generate Open Graph tags for beautiful link cards on Twitter, LinkedIn, and Facebook.`,
            `Search Engine Validated: Outputs valid XML sitemaps, robots.txt, and Schema.org structured data.`,
            `Live SERP Previews: Inspect exactly how your links appear on desktop and mobile search screens.`
          ],
          howToSteps: [
            `Enter your webpage URL, page title, or target search keyword into ${name}.`,
            `Preview your real-time Google search snippet or social share preview card.`,
            `Copy your validated meta tags and paste them directly into your website's <head>.`
          ],
          faqs: [
            { question: `Why are meta tags and snippets important for SEO?`, answer: `They tell search engines what your page is about and determine how your links look when shared on social media.` },
            { question: `Does this tool enforce character and pixel limits?`, answer: `Yes! It warns you if titles or descriptions exceed Google's recommended desktop and mobile cutoff points.` },
            { question: `Can I preview how my link looks on Twitter and LinkedIn?`, answer: `Yes, the Open Graph previewer displays realistic mockups for all major social platforms.` },
            { question: `Is any coding required to use these tags?`, answer: `Just copy the generated HTML tags and paste them into your website header or CMS.` }
          ]
        };
      default: // image default
        return {
          valueProps: [
            { title: "100% Private & Secure", badge: "On-Device Only", desc: "Everything runs directly on your device. Your files are never uploaded or shared.", icon: ShieldCheck },
            { title: "Crisp High-Res Quality", badge: "Smooth Details", desc: "Clean, sharp output preserving full resolution and true vibrant colors.", icon: Layers },
            { title: "Fast 1-Click Results", badge: "Instant Output", desc: "Completes your task automatically in seconds with no software to install.", icon: Zap },
            { title: "Zero Watermarks", badge: "100% Free Forever", desc: "Completely free with no watermarks. Download studio-quality files ready for anything.", icon: CheckCircle2 },
          ],
          features: [
            `High-Resolution Clarity: Keeps your images crisp and sharp with rich colors and clean transparency.`,
            `Works with Common Formats: Easily handles PNG, JPG, JPEG, and WebP pictures from any device.`,
            `Fast In-Browser Processing: Runs directly on your device with no waiting queues or slow loading.`,
            `Watermark-Free Downloads: Save full-quality pictures ready for your store, social media, or personal projects.`
          ],
          howToSteps: [
            `Select your file or drag and drop it directly onto the ${name} canvas above.`,
            `Adjust the settings or options to get the exact look you want.`,
            `Preview your result and download your high-resolution export instantly.`
          ],
          faqs: [
            { question: `Does using ${name} reduce the quality of my original file?`, answer: `No. ${name} keeps your original sharpness, detail, and resolution intact while making your edits.` },
            { question: `What file formats can I upload to ${name}?`, answer: `You can upload all standard image and media formats from your phone, tablet, or computer.` },
            { question: `Can I use files processed with ${name} for commercial projects?`, answer: `Yes, 100%. Any file you process is yours to use for personal, commercial, or client work with zero watermarks.` },
            { question: `How does Exismic protect my private files?`, answer: `Privacy is our top priority. Your files are processed privately on your device and are never stored, saved, or shared with anyone.` }
          ]
        };
    }
  };

  // Contextually relevant companion tools & tool-specific content resolution
  const currentTool = TOOLS.find(
    (t) =>
      (toolSlug && (t.id === toolSlug || t.href === toolSlug || t.href.endsWith(`/${toolSlug}`) || t.href.endsWith(toolSlug))) ||
      t.name.toLowerCase() === toolName.toLowerCase()
  );

  const catDefaults = getCategoryDefaults(normCatId, toolName);

  const defaultFeatures = features || currentTool?.features || catDefaults.features;
  const defaultHowToSteps = howToSteps || currentTool?.howToSteps || catDefaults.howToSteps;
  const defaultFaqs = faqs || currentTool?.faqs || catDefaults.faqs;
  const defaultCards = catDefaults.valueProps;
  const effectiveSeoIntro = seoIntro || currentTool?.seoIntro;
  const effectiveUseCases = useCases || currentTool?.useCases;

  const relatedTools = currentTool
    ? getRelatedTools(currentTool, 2, 4)
    : TOOLS.filter(
        (t) => t.category === normCatId && t.name !== toolName && t.indexable !== false && !t.hidden
      ).slice(0, 4);

  // SEO Structured Data for Googlebot
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": defaultFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${toolName}`,
    "description": effectiveSeoIntro || toolDescription,
    "step": defaultHowToSteps.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "name": `Step ${idx + 1}`,
      "text": step,
    })),
  };

  return (
    <section className="mt-2 sm:mt-4 w-full text-left">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* =========================================================
          ANAMORPHIC NEON HORIZON DIVIDER (SECTION BRIDGE)
      ========================================================== */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-6 sm:mb-8 pointer-events-none select-none">
        <div className="relative flex items-center justify-center">
          {/* Ambient Diffused Glow Flare */}
          <div
            className="absolute h-10 w-2/3 max-w-lg rounded-full blur-2xl opacity-40 will-change-transform animate-pulse-glow"
            style={{
              background: `radial-gradient(ellipse at center, ${theme.primaryHex}, transparent 70%)`
            }}
          />

          {/* Primary Tapered Neon Laser Hairline */}
          <div
            className="relative w-full h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${theme.primaryHex}20 15%, ${theme.primaryHex} 50%, ${theme.primaryHex}20 85%, transparent 100%)`
            }}
          />

          {/* Center Specular High-Intensity White Needle */}
          <div
            className="absolute w-44 sm:w-80 h-[1.5px] blur-[0.5px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)`
            }}
          />

          {/* Center Glowing Cyber Core Jewel */}
          <div className="absolute flex items-center justify-center">
            <div
              className="size-1.5 rounded-full"
              style={{
                background: "#ffffff",
                boxShadow: `0 0 10px 2px ${theme.primaryHex}`
              }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6">
        
        {/* =========================================================
            1. HERO LIVING CONTAINER (360° LASER BORDER BEAM)
        ========================================================== */}
        <div className="relative p-[1.5px] overflow-hidden rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] group/beam">
          {/* Animated Conic Laser Beam Circling the Entire Perimeter */}
          <div 
            className="absolute inset-[-150%] animate-[spin_5s_linear_infinite] pointer-events-none will-change-transform"
            style={{ background: theme.laserGradient }}
          />
          {/* Glowing Bloom Layer */}
          <div 
            className="absolute inset-[-150%] animate-[spin_5s_linear_infinite] pointer-events-none blur-md opacity-70 will-change-transform"
            style={{ background: theme.laserBloom }}
          />

          {/* Inner Card Content */}
          <div 
            ref={heroRef}
            onMouseMove={handleHeroMouseMove}
            className="group relative overflow-hidden rounded-[calc(1.5rem-1.5px)] border border-white/[0.06] bg-[#070914]/95 p-6 sm:p-7 lg:p-8 backdrop-blur-2xl transition-all"
          >
            {/* Ambient Breathing Lighting */}
            <div className={cn("absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[100px] pointer-events-none animate-pulse-glow", theme.ambientLight1)} />
            <div className={cn("absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[100px] pointer-events-none animate-pulse-glow", theme.ambientLight2)} />

            {/* Interactive Mouse Spotlight */}
            <div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[calc(1.5rem-1.5px)]"
              style={{
                background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${theme.heroSpotlight}, transparent 60%)`,
              }}
            />

            <div className="relative z-10 space-y-6">
              
              {/* Header: Badges & Title closely connected */}
              <div className="space-y-2.5 max-w-3xl">
                
                {/* Top Badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-0.5 text-[11px] font-semibold", theme.badgeBorder, theme.badgeBg, theme.badgeText)}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", theme.badgeDot)} />
                      <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", theme.badgeDot)} />
                    </span>
                    <span>Guide & Overview</span>
                  </div>
                  <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", theme.badgeBorder, theme.badgeBg, theme.badgeText)}>
                    <Check size={11} className={theme.textAccent} />
                    <span>100% Free • No Sign-Up</span>
                  </div>
                </div>

                {/* Main Title & Description */}
                <h2 className={cn("text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r tracking-tight leading-tight", theme.headingGradient)}>
                  About {toolName}
                </h2>
                <p className="text-sm sm:text-base font-normal text-zinc-300 leading-relaxed pt-0.5">
                  {effectiveSeoIntro || toolDescription}
                </p>
              </div>

              {/* 4 Living Value Cards (Tailored strictly to Category Theme) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                {defaultCards.map((vp, idx) => {
                  const Icon = vp.icon;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "group/card relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070914]/90 p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5",
                        theme.cardBorderHover,
                        theme.cardShadowHover
                      )}
                    >
                      {/* Top Specular Rim Highlight */}
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                      {/* Ambient Card Category Spotlight on Hover */}
                      <div
                        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `radial-gradient(280px circle at top left, ${theme.cardSpotlight}, transparent 70%)`,
                        }}
                      />

                      <div className="relative z-10 flex flex-col justify-between h-full gap-3.5">
                        <div className="flex items-center justify-between">
                          {/* 3D Icon Container with Category Accent & Micro-Tilt */}
                          <div className={cn("size-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/card:scale-110 group-hover/card:-rotate-3", theme.iconContainer)}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Live Radar Beacon Badge */}
                          <div className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold", theme.badgeBorder, theme.badgeBg, theme.badgeText)}>
                            <span className="relative flex h-1.5 w-1.5">
                              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", theme.badgeDot)} />
                              <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", theme.badgeDot)} />
                            </span>
                            <span>{vp.badge}</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-bold text-white group-hover/card:text-zinc-100 transition-colors">
                            {vp.title}
                          </div>
                          <div className="text-xs text-zinc-400 leading-relaxed mt-1">
                            {vp.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* =========================================================
            2. 3-STEP WORKFLOW (WITH CATEGORY LASER CONDUIT)
        ========================================================== */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={cn("flex size-10 items-center justify-center rounded-2xl border shadow-lg", theme.iconContainer)}>
              <Zap size={18} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                How to Use {toolName} in 3 Simple Steps
              </h3>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
                Fast and easy from start to finish
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Connecting Laser Conduit Line on Desktop */}
            <div className={cn("hidden md:block absolute top-12 left-[18%] right-[18%] h-[2px] bg-gradient-to-r z-0 pointer-events-none", theme.conduitGradient)} />
            <div className="hidden md:block absolute top-12 left-[18%] right-[18%] h-[2px] overflow-hidden z-0 pointer-events-none">
              <div className={cn("w-24 h-full bg-gradient-to-r from-transparent to-transparent animate-shimmer", theme.conduitShimmer)} />
            </div>

            {defaultHowToSteps.map((stepDesc, idx) => {
              const stepIcons = [Upload, Sliders, Download];
              const StepIcon = stepIcons[idx] || Check;
              const stepBadges = ["Step 01 • Upload", "Step 02 • Adjust", "Step 03 • Download"];

              return (
                <div
                  key={idx}
                  className={cn(
                    "group relative z-10 flex flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#070914]/90 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 shadow-xl",
                    theme.cardBorderHover,
                    theme.cardShadowHover
                  )}
                >
                  {/* Specular Top Rim */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("size-9 rounded-xl bg-gradient-to-br text-white font-black text-xs flex items-center justify-center shadow-lg border border-white/20", theme.stepNumberGradients[idx] || theme.stepNumberGradients[0])}>
                          {`0${idx + 1}`}
                        </div>
                        <span className={cn("text-[11px] font-bold uppercase tracking-wider", theme.stepBadgeText)}>
                          {stepBadges[idx]}
                        </span>
                      </div>
                      <div className={cn("size-8 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-110", theme.iconContainer)}>
                        <StepIcon size={15} />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-zinc-100 transition-colors">
                        {idx === 0 ? "Upload or Input" : idx === 1 ? "Configure & Process" : "Export & Download"}
                      </h4>
                      <p className="text-xs font-medium leading-relaxed text-zinc-300 mt-2">
                        {stepDesc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            3. KEY FEATURES GRID (WHY CHOOSE)
        ========================================================== */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={cn("flex size-10 items-center justify-center rounded-2xl border shadow-lg", theme.iconContainer)}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                Why Choose Exismic {toolName}?
              </h3>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
                Simple, reliable, and completely free to use
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {defaultFeatures.map((feat, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-[#070914]/80 p-6 backdrop-blur-md transition-all duration-300",
                  theme.whyChooseCardHover
                )}
              >
                <div className={cn("size-8 rounded-xl border flex items-center justify-center shrink-0 shadow-md", theme.whyChooseIconBg, theme.whyChooseIconBorder, theme.whyChooseIconText)}>
                  <CheckCircle2 size={18} />
                </div>
                <p className="text-sm font-medium leading-relaxed text-zinc-200">{feat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            3B. PRACTICAL USE CASES (IF AVAILABLE)
        ========================================================== */}
        {effectiveUseCases && effectiveUseCases.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className={cn("flex size-10 items-center justify-center rounded-2xl border shadow-lg", theme.iconContainer)}>
                <BookOpen size={18} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                  Popular Real-World Use Cases
                </h3>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
                  How creators, students, and professionals use {toolName}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {effectiveUseCases.map((useCase: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-[#070914]/80 p-4 backdrop-blur-md"
                >
                  <span className="size-2 rounded-full mt-1.5 bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                  <p className="text-xs sm:text-sm font-medium text-zinc-300 leading-relaxed">{useCase}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            4. FREQUENTLY ASKED QUESTIONS (SILKY SMOOTH ACCORDION)
        ========================================================== */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={cn("flex size-10 items-center justify-center rounded-2xl border shadow-lg", theme.iconContainer)}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                Frequently Asked Questions (FAQ)
              </h3>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
                Answers to common questions about {toolName}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {defaultFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={cn(
                    "rounded-2xl border transition-all duration-300 overflow-hidden",
                    isOpen
                      ? theme.faqOpenBorder
                      : "border-white/[0.08] bg-[#070914]/80 hover:border-white/20 hover:bg-white/[0.02]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 pr-4">
                      <div className={cn(
                        "size-7 rounded-lg text-xs font-mono font-black flex items-center justify-center shrink-0 border transition-all duration-300",
                        isOpen
                          ? cn(theme.faqBadgeOpen, "scale-105")
                          : "bg-white/[0.05] border-white/10 text-zinc-400"
                      )}>
                        Q
                      </div>
                      <h4 className={cn(
                        "text-base font-bold transition-colors duration-200",
                        isOpen ? theme.faqTextOpen : "text-white"
                      )}>
                        {faq.question}
                      </h4>
                    </div>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "text-zinc-400 transition-transform duration-300 ease-in-out shrink-0",
                        isOpen && cn("rotate-180", theme.faqChevronOpen)
                      )}
                    />
                  </button>

                  {/* Silky Smooth Accordion Body (CSS Grid Rows 0fr -> 1fr) */}
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
                        <p className="text-sm font-medium leading-relaxed text-zinc-300 pl-10 sm:pl-11 border-t border-white/[0.06] pt-3.5">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            5. RELATED TOOLS (UPGRADED HIGH-END SUGGESTIONS UI)
        ========================================================== */}
        {showRelatedTools && relatedTools.length > 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#070914]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Top Specular Rim */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn("size-9 rounded-xl border flex items-center justify-center shrink-0 shadow-lg", theme.iconContainer)}>
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Explore More {categoryName}
                  </h3>
                  <p className="text-xs font-semibold text-zinc-400">
                    Popular companion tools to edit and enhance your projects
                  </p>
                </div>
              </div>
              <Link
                href="/tools"
                className={cn("inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all self-start sm:self-auto group", theme.viewAllBtn)}
              >
                <span>View All Tools</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* 4 Enhanced Suggestion Cards with Authentic 3D Tool Icons */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map((relTool) => {
                const ToolIcon = (relTool.icon && ICON_MAP[relTool.icon as keyof typeof ICON_MAP]) || ImageIcon || Layers;
                return (
                  <Link
                    key={relTool.id}
                    href={relTool.href}
                    className={cn(
                      "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090d1f]/70 p-5 backdrop-blur-md transition-all duration-300 hover:bg-[#0c1228]/90 hover:-translate-y-1.5",
                      theme.suggestionsCardHover
                    )}
                  >
                    {/* Top Specular Rim */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {/* Ambient Hover Spotlight */}
                    <div
                      className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(280px circle at top left, ${theme.cardSpotlight}, transparent 70%)`,
                      }}
                    />

                    <div className="relative z-10 space-y-3.5">
                      {/* Top Row: 3D Tool Icon & Instant Badge */}
                      <div className="flex items-center justify-between">
                        <div className={cn("size-10 rounded-xl border flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3", theme.iconContainer)}>
                          <ToolIcon size={18} />
                        </div>
                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold", theme.badgeBorder, theme.badgeBg, theme.badgeText)}>
                          <span className={cn("size-1 rounded-full", theme.badgeDot)} />
                          <span>Instant</span>
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-zinc-100 transition-colors">
                          {relTool.name}
                        </h4>
                        <p className="text-xs font-medium text-zinc-400 leading-relaxed line-clamp-2 mt-1">
                          {relTool.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Link at Bottom */}
                    <div className={cn("relative z-10 mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider transition-colors", theme.suggestionsActionText)}>
                      <span>Open Tool</span>
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
