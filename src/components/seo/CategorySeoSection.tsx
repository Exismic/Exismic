"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES, ICON_MAP } from "@/data/tools";
import { CATEGORY_ANIM_STYLES } from "@/lib/category-styles";
import { SuggestToolModal } from "@/components/modals/SuggestToolModal";
import {
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Layers,
  Check,
  ChevronDown,
  Shield,
  Globe,
  Award,
  Lock,
  RefreshCw,
  Compass,
  Users,
  Sliders,
  Cpu,
  FileCheck,
  Code2,
  Wand2,
  TrendingUp,
  Headphones,
  FileText,
  Rocket,
  Clock,
  MessageSquare,
  Video as VideoIcon,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySeoSectionProps {
  categoryId: string;
  categoryName: string;
  categoryDescription: string;
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
    primaryHex: "#6366f1",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(99,102,241,0.1) 295deg, #6366f1 325deg, #818cf8 348deg, #38bdf8 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #6366f1 325deg, #818cf8 348deg, transparent 360deg)",
    textAccent: "text-indigo-300",
    headingGradient: "from-white via-slate-100 to-indigo-200",
    badgeBorder: "border-indigo-400/40",
    badgeBg: "bg-indigo-500/10",
    badgeDot: "bg-indigo-400",
    badgeText: "text-indigo-300",
    ambientLight1: "bg-indigo-500/15",
    ambientLight2: "bg-blue-600/10",
    cardBorderHover: "hover:border-indigo-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(99,102,241,0.18)]",
    cardSpotlight: "rgba(99, 102, 241, 0.16)",
    heroSpotlight: "rgba(99, 102, 241, 0.08)",
    iconContainer: "border-indigo-400/30 bg-indigo-500/15 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]",
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
  student: {
    primaryHex: "#fbbf24",
    laserGradient: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(251,191,36,0.1) 295deg, #fbbf24 325deg, #fde68a 348deg, #fef3c7 356deg, transparent 360deg)",
    laserBloom: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #fbbf24 325deg, #fde68a 348deg, transparent 360deg)",
    textAccent: "text-amber-300",
    headingGradient: "from-white via-slate-100 to-amber-200",
    badgeBorder: "border-amber-400/40",
    badgeBg: "bg-amber-500/10",
    badgeDot: "bg-amber-400",
    badgeText: "text-amber-300",
    ambientLight1: "bg-amber-500/15",
    ambientLight2: "bg-yellow-600/10",
    cardBorderHover: "hover:border-amber-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(251,191,36,0.18)]",
    cardSpotlight: "rgba(251, 191, 36, 0.16)",
    heroSpotlight: "rgba(251, 191, 36, 0.08)",
    iconContainer: "border-amber-400/30 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.2)]",
    whyChooseIconBg: "bg-amber-500/15",
    whyChooseIconBorder: "border-amber-400/30",
    whyChooseIconText: "text-amber-400",
    whyChooseCardHover: "hover:border-amber-400/50 hover:bg-amber-500/[0.04] hover:shadow-[0_10px_30px_rgba(251,191,36,0.15)]",
    faqOpenBorder: "border-amber-400/50 bg-amber-500/[0.04] shadow-[0_0_25px_rgba(251,191,36,0.12)]",
    faqBadgeOpen: "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]",
    faqTextOpen: "text-amber-100",
    faqChevronOpen: "text-amber-300",
    suggestionsCardHover: "hover:border-amber-400/50 hover:shadow-[0_15px_35px_rgba(251,191,36,0.18)]",
    suggestionsActionText: "text-amber-400 group-hover:text-amber-300",
    viewAllBtn: "text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border-amber-400/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.25)]",
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
    ambientLight2: "bg-blue-600/10",
    cardBorderHover: "hover:border-sky-400/50",
    cardShadowHover: "hover:shadow-[0_12px_30px_rgba(2,132,199,0.18)]",
    cardSpotlight: "rgba(2, 132, 199, 0.16)",
    heroSpotlight: "rgba(2, 132, 199, 0.08)",
    iconContainer: "border-sky-400/30 bg-sky-500/15 text-sky-300 shadow-[0_0_12px_rgba(2,132,199,0.2)]",
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

interface LivingValueCard {
  title: string;
  desc: string;
  badge: string;
  icon: React.ElementType;
}

interface CategoryContent {
  title: string;
  intro: string;
  valueCards: LivingValueCard[];
  features: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export function CategorySeoSection({
  categoryId,
  categoryName,
}: CategorySeoSectionProps) {
  const theme = CATEGORY_THEMES[categoryId] || CATEGORY_THEMES.image;
  const animStyle = CATEGORY_ANIM_STYLES[categoryId] || CATEGORY_ANIM_STYLES.image;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getCategoryContent = (id: string, name: string): CategoryContent => {
    switch (id) {
      case "image":
        return {
          title: "Simple, High-Quality Photo & Image Tools",
          intro:
            "Edit, shrink, convert, and create photos in seconds. Remove backgrounds cleanly, compress file sizes without losing clarity, make custom Minecraft skins, and save everything with zero watermarks.",
          valueCards: [
            {
              title: "No Watermarks",
              desc: "Download clean PNG, JPG, and SVG pictures ready to use anywhere.",
              badge: "Free to Use",
              icon: Shield,
            },
            {
              title: "Clean Cutouts",
              desc: "Keep fine details like hair and soft edges looking sharp and natural.",
              badge: "High Detail",
              icon: Layers,
            },
            {
              title: "Instant Editing",
              desc: "Resize, change formats, and shrink pictures right in your browser with no waiting.",
              badge: "Fast",
              icon: Zap,
            },
            {
              title: "Works with Any Photo",
              desc: "Full support for standard picture formats including PNG, JPG, WebP, and SVG.",
              badge: "All Formats",
              icon: ImageIcon,
            },
          ],
          features: [
            "Shrink File Sizes: Reduce large picture sizes up to 85% without making them blurry or pixelated.",
            "100% Private: Your photos, screenshots, and graphics are processed right in your browser and never leave your device.",
            "Free for Any Project: Use every cutout, skin, and graphic you make for personal, business, or client work.",
            "Easy Workflow: Send your cut out photo directly to other tools like our compressor or resizer with one click.",
          ],
          faqs: [
            {
              question: "Does Exismic degrade photo resolution or sharpness?",
              answer:
                "No. Exismic keeps your photos crisp and sharp, maintaining natural colors and fine details across all downloads.",
            },
            {
              question: "Can I use edited images commercially?",
              answer:
                "Yes. Any image processed or created on Exismic is completely yours for personal, client, or commercial use with zero royalties or restrictions.",
            },
            {
              question: "How does the Minecraft Skin Maker work?",
              answer:
                "You can type in ideas or pick colors to create a ready-to-play 64x64 PNG Minecraft skin with an interactive 3D preview.",
            },
            {
              question: "Are uploads stored on Exismic servers?",
              answer:
                "Your uploads are processed right inside your browser on your device and are never saved, monitored, or shared.",
            },
          ],
        };

      case "video":
        return {
          title: "Fast Video Tools & Automatic Subtitles",
          intro:
            "Create great videos without heavy software or long waits. Cut clips, add captions that match your speech, shrink video file sizes, and export clean videos with no watermarks.",
          valueCards: [
            {
              title: "No Watermarks",
              desc: "Download clean MP4 and WebM videos ready to share on any social app.",
              badge: "Clean Videos",
              icon: VideoIcon,
            },
            {
              title: "Auto Subtitles",
              desc: "Add synchronized subtitles word-by-word so people can watch with sound off.",
              badge: "Clear Captions",
              icon: FileText,
            },
            {
              title: "Shrink Video Size",
              desc: "Make large video files much smaller so they are easy to send and upload.",
              badge: "Smaller Files",
              icon: Zap,
            },
            {
              title: "Preset Sizes",
              desc: "Quickly switch between vertical for phones, square, and widescreen formats.",
              badge: "All Sizes",
              icon: Sliders,
            },
          ],
          features: [
            "Runs on Your Device: Edit and trim clips right in your browser without waiting for long file uploads.",
            "Easy-to-Read Captions: Highlight words as you speak to help viewers follow along easily.",
            "High Resolution: Save your videos in clear quality without any forced brand stamps or logos.",
            "Ready for Social Media: Preset sizes made specifically for TikTok, Instagram Reels, and YouTube Shorts.",
          ],
          faqs: [
            {
              question: "Does Exismic put watermarks on exported videos?",
              answer:
                "Never. All videos you export from Exismic are 100% clean and watermark-free for both personal and commercial use.",
            },
            {
              question: "How does video editing work without installing software?",
              answer:
                "Our tools run directly inside your web browser on your phone, tablet, or computer, so you can edit and trim clips without installing anything.",
            },
            {
              question: "What video formats does Exismic support?",
              answer:
                "You can open and export popular video formats including MP4, WebM, MOV, and MKV across all devices.",
            },
            {
              question: "Can I use video clips for commercial or client work?",
              answer:
                "Yes, 100%. All video clips and files you make on Exismic are yours to use for client deliverables, ads, or social channels.",
            },
          ],
        };

      case "audio":
        return {
          title: "Simple Audio, Music & Voice Tools",
          intro:
            "Clean up, remix, and create audio in seconds. Separate vocals from background music, make slowed and reverb tracks, turn text into speech, and create soundwave videos without losing sound quality.",
          valueCards: [
            {
              title: "Separate Vocals",
              desc: "Split voice and background music cleanly from any song or recording.",
              badge: "Split Audio",
              icon: Headphones,
            },
            {
              title: "Sound Effects",
              desc: "Add reverb, boost the bass, or change the speed and pitch with simple controls.",
              badge: "Simple Controls",
              icon: Sliders,
            },
            {
              title: "Clear Sound Quality",
              desc: "Download high quality WAV and MP3 files that sound great on headphones and speakers.",
              badge: "High Quality",
              icon: Award,
            },
            {
              title: "Soundwave Videos",
              desc: "Turn your audio into animated video clips for sharing podcasts and music online.",
              badge: "Visualizer",
              icon: Zap,
            },
          ],
          features: [
            "Instant Playback: Listen to your changes in real time without annoying loading delays.",
            "Private & Secure: Your songs, voice notes, and recordings stay on your computer and are never saved online.",
            "Natural Sound: Clean filters keep your voice clear and natural without robotic glitches or muffled bass.",
            "Connected Tools: Easily take your separated vocal or remix and turn it into a shareable video.",
          ],
          faqs: [
            {
              question: "Can I split vocals and instruments from any song?",
              answer:
                "Yes. Our audio splitter cleanly separates lead singing from backing music, drums, and bass in seconds.",
            },
            {
              question: "Are audio exports compressed or degraded in quality?",
              answer:
                "No. Exismic gives you clear, high-quality audio downloads in both WAV and high-bitrate MP3 formats.",
            },
            {
              question: "Can I use Exismic audio tools on mobile phones?",
              answer:
                "Yes. All audio tools feature easy touch controls, volume sliders, and mobile-friendly media players.",
            },
            {
              question: "Are my uploaded songs or recordings saved on Exismic servers?",
              answer:
                "Never. Audio tracks are processed right in your browser session and are never saved or shared.",
            },
          ],
        };

      case "pdf":
        return {
          title: "Easy & Private PDF Tools",
          intro:
            "Combine, shrink, convert, and read PDF files with complete privacy. Everything works right in your browser, so sensitive forms, receipts, and contracts never leave your computer or phone.",
          valueCards: [
            {
              title: "Completely Private",
              desc: "Your documents are processed right on your device and are never saved or seen by anyone.",
              badge: "100% Private",
              icon: Lock,
            },
            {
              title: "Combine PDFs",
              desc: "Put multiple PDF files and pages together into one neat document in seconds.",
              badge: "Merge Files",
              icon: Layers,
            },
            {
              title: "Make Files Smaller",
              desc: "Cut PDF file sizes by up to 75% so they are easy to email while keeping text sharp.",
              badge: "Smaller Files",
              icon: FileCheck,
            },
            {
              title: "Text from Scans",
              desc: "Copy and search text from scanned papers, photos, and screenshots easily.",
              badge: "Copy Text",
              icon: Zap,
            },
          ],
          features: [
            "Safe for Personal Documents: Tax papers, bills, and signed agreements never get sent to cloud servers.",
            "Keeps Letters Sharp: Shrinks document sizes while making sure words and charts remain clear and easy to read.",
            "No Page Limits: Work with big books, long reports, and study guides without getting blocked.",
            "Works on Any Device: Open, combine, and convert PDFs smoothly on your phone, tablet, or computer.",
          ],
          faqs: [
            {
              question: "Are my confidential PDF documents safe on Exismic?",
              answer:
                "Yes, 100%. All PDF tools process your files directly inside your web browser, so your pages never get sent to cloud servers.",
            },
            {
              question: "How much can Exismic compress a PDF without losing readability?",
              answer:
                "You can reduce file sizes between 40% and 80% while keeping text and diagrams crisp and easy to read.",
            },
            {
              question: "Can I extract text from scanned PDFs or images?",
              answer:
                "Yes. Our text scanner reads text from scanned papers and screenshots so you can copy and edit it easily.",
            },
            {
              question: "Is there any limit on the number of PDFs I can merge?",
              answer:
                "No. You can combine as many pages and files as you need with instant downloads.",
            },
          ],
        };

      case "ai":
        return {
          title: "Helpful AI Writing & Idea Generators",
          intro:
            "Get help writing, brainstorming, and making content with smart AI assistants. Draft clear articles, write video ideas, build useful prompts, and create images with simple tools.",
          valueCards: [
            {
              title: "Smart Assistance",
              desc: "Get quick answers, clear writing drafts, and practical ideas whenever you are stuck.",
              badge: "Helpful AI",
              icon: Cpu,
            },
            {
              title: "Better Prompts",
              desc: "Turn simple thoughts into clear instructions that get great results from AI.",
              badge: "Easy Prompts",
              icon: Wand2,
            },
            {
              title: "Natural Writing",
              desc: "Draft friendly, natural text that sounds like a real person wrote it.",
              badge: "Natural Tone",
              icon: FileText,
            },
            {
              title: "Daily Free Credits",
              desc: "Get fresh free credits every day to try out and use any AI tool you like.",
              badge: "Free Daily",
              icon: RefreshCw,
            },
          ],
          features: [
            "Clear & Useful Results: Structured to give you direct, helpful answers without confusing text.",
            "Use with Other AI Apps: Copy your generated prompt directly into ChatGPT, Claude, or any AI app in one click.",
            "Private Questions: Your questions and notes are private and are never used to train public systems.",
            "You Own Everything: Everything you write or generate is yours to use for personal projects or business.",
          ],
          faqs: [
            {
              question: "What AI models power Exismic's tools?",
              answer:
                "We use top-tier, reliable AI models to help you brainstorm, write drafts, and create content quickly.",
            },
            {
              question: "How do free credits work for AI tools?",
              answer:
                "Every account receives free credits refreshed every day. Pro members receive extra credits and faster generations.",
            },
            {
              question: "Can I use AI-generated copy and ideas commercially?",
              answer:
                "Yes. Everything you create with our AI tools is 100% yours to publish, share, or monetize.",
            },
            {
              question: "Are my prompts and ideas kept private?",
              answer:
                "Yes. Your prompts, notes, and drafts are private and are never shared or used to train public models.",
            },
          ],
        };

      case "productivity":
        return {
          title: "Everyday Helpers & Productivity Tools",
          intro:
            "Save time with quick, helpful tools for everyday tasks. Make custom QR codes, generate strong random passwords, convert numbers, and take notes without installing any apps or browser extensions.",
          valueCards: [
            {
              title: "Instant Results",
              desc: "Every tool opens and gives you results right away without loading screens.",
              badge: "Instant",
              icon: Zap,
            },
            {
              title: "Strong Passwords",
              desc: "Create secure, random passwords directly on your device to keep accounts safe.",
              badge: "Safe & Secure",
              icon: Lock,
            },
            {
              title: "Custom QR Codes",
              desc: "Make scannable QR codes with your favorite colors and download them as clean images.",
              badge: "QR Codes",
              icon: Globe,
            },
            {
              title: "Works Anywhere",
              desc: "Open and use every helper smoothly on your phone, tablet, laptop, or desktop.",
              badge: "Any Device",
              icon: Sliders,
            },
          ],
          features: [
            "Works Without Internet: Essential tools run right in your browser, so you can make QR codes and passwords anywhere.",
            "No Sign-up Needed: Use calculators, converters, and generators right away without needing an account.",
            "One-Click Copy: Copy your finished text, password, or code straight to your clipboard with one click.",
            "Clean & Distraction-Free: Simple, clean pages with no pop-ups or clutter so you can finish your task quickly.",
          ],
          faqs: [
            {
              question: "Are passwords generated on Exismic secure?",
              answer:
                "Yes. They are generated with strong random formulas directly inside your browser so they are impossible to guess.",
            },
            {
              question: "Do QR codes created on Exismic expire?",
              answer:
                "Never. The QR codes you download hold your links or info permanently and will work forever with no fees.",
            },
            {
              question: "Do I need an account to use productivity tools?",
              answer:
                "No. Essential converters, timers, and generators are completely open to use without needing to sign up.",
            },
            {
              question: "Can I print QR codes on signs or business cards?",
              answer:
                "Yes. You can download sharp PNG pictures and scalable vector SVG files that stay clear at any print size.",
            },
          ],
        };

      case "developer":
        return {
          title: "Helpful Tools for Coding & Data",
          intro:
            "Fast, reliable utilities for formatting and inspecting code. Format and clean up JSON, test pattern searches, compare text differences, set up repeating schedules, and generate IDs right in your browser with complete privacy.",
          valueCards: [
            {
              title: "Completely Private",
              desc: "Your code and data are checked right on your computer and never sent over the internet.",
              badge: "100% Private",
              icon: Code2,
            },
            {
              title: "Clean Formatting",
              desc: "Fix messy data and code into clean, readable text that is easy to understand.",
              badge: "Clean Format",
              icon: Award,
            },
            {
              title: "No Installs Needed",
              desc: "Quick browser tools that work right away without needing to install packages.",
              badge: "No Installs",
              icon: Zap,
            },
            {
              title: "One-Click Copy",
              desc: "Copy cleaned JSON, generated IDs, or formatted text directly into your project.",
              badge: "Easy Copy",
              icon: FileText,
            },
          ],
          features: [
            "Runs on Your Device: Your code snippets and private data are formatted locally and never logged or stored.",
            "Accurate Standards: Results follow standard coding rules so you can paste them into your projects without errors.",
            "Fast & Lightweight: Open and use tools in seconds without heavy installations or extra plugins.",
            "Instant Clipboard Copy: Grab formatted text, hashes, or database queries in one click ready for your editor.",
          ],
          faqs: [
            {
              question: "Are my code snippets or data logged on Exismic?",
              answer:
                "No. Everything runs right in your browser. Your code, JSON data, and queries are never stored or inspected.",
            },
            {
              question: "Can I use outputs from developer tools in work projects?",
              answer:
                "Yes, 100%. All code formatting, hashes, IDs, and queries are free to use in personal and client projects.",
            },
            {
              question: "What formats and languages are supported?",
              answer:
                "Our tools support modern JavaScript, TypeScript, JSON, SQL queries, and common schedule formats.",
            },
            {
              question: "Are developer tools free on Exismic?",
              answer:
                "Yes. Core utilities like the JSON Formatter, Regex Tester, and Hash Generator are completely free to use.",
            },
          ],
        };

      case "creator":
        return {
          title: "Tools for Creators & Social Media",
          intro:
            "Made for creators, YouTubers, and writers. Preview realistic social media posts, design share images, check your video thumbnails, and write video hooks that grab attention.",
          valueCards: [
            {
              title: "Engaging Hooks",
              desc: "Write video intros and carousel layouts that grab attention and keep people watching.",
              badge: "Catchy Hooks",
              icon: TrendingUp,
            },
            {
              title: "Ready for Social Media",
              desc: "Sized and formatted for YouTube, Instagram, TikTok, LinkedIn, and X.",
              badge: "All Platforms",
              icon: Globe,
            },
            {
              title: "Sharp Image Downloads",
              desc: "Save clear, high-resolution pictures and copy images straight to your clipboard.",
              badge: "High Quality",
              icon: Award,
            },
            {
              title: "Completely Yours",
              desc: "100% free to use for your personal channels, business, or client work.",
              badge: "100% Free",
              icon: Shield,
            },
          ],
          features: [
            "Grab Attention Fast: Write hooks and post layouts that get viewers interested right away.",
            "Made for All Platforms: Create content fitted for YouTube, Instagram, TikTok, LinkedIn, and X.",
            "Thumbnail Preview: Check how your video cover looks on both light and dark backgrounds before publishing.",
            "Easy Downloads: Save finished graphics or copy formatted text directly to your clipboard.",
          ],
          faqs: [
            {
              question: "How do the creator tools help improve video reach?",
              answer:
                "Our hook generator and thumbnail previewer help you grab viewer interest in the first few seconds and stand out on feeds.",
            },
            {
              question: "Can I format LinkedIn posts with bold and italic text?",
              answer:
                "Yes! Our post formatter lets you add bold, italic, and clean line breaks that look great on phones and computers.",
            },
            {
              question: "Does Exismic claim rights to my scripts or designs?",
              answer:
                "Never. You own 100% of all scripts, post previews, and graphics you create.",
            },
            {
              question: "How many credits do creator tools cost?",
              answer:
                "Most creator tools cost just a few credits, and every user gets free credits refreshed daily.",
            },
          ],
        };

      case "student":
        return {
          title: "Helpful Study & Homework Tools",
          intro:
            "Study smarter and write better papers with simple tools. Turn class notes into visual mind maps, check reading difficulty, build clear essay outlines, and see step-by-step problem explanations.",
          valueCards: [
            {
              title: "Clear Essay Outlines",
              desc: "Organize your main ideas, thesis, and paragraphs into a clean, logical outline.",
              badge: "Essay Ready",
              icon: Award,
            },
            {
              title: "Step-by-Step Help",
              desc: "Break complicated topics and math problems down into simple, easy-to-follow steps.",
              badge: "Step-by-Step",
              icon: Layers,
            },
            {
              title: "Simple Citations",
              desc: "Format sources easily using standard formats like APA, MLA, and Chicago.",
              badge: "Easy Sources",
              icon: FileText,
            },
            {
              title: "Private Homework",
              desc: "Your notes, papers, and study materials stay on your device and are never saved.",
              badge: "100% Private",
              icon: Lock,
            },
          ],
          features: [
            "Organize Your Thoughts: Plan research papers and essays with clear outlines and logical arguments.",
            "Understand Every Step: Math and problem solvers walk you through each step so you actually understand the answer.",
            "Format Your Sources: Easily create citations in APA, MLA, and Chicago styles for your bibliographies.",
            "Study on Any Device: Access your study tools anytime from your phone, tablet, or laptop.",
          ],
          faqs: [
            {
              question: "How does the Essay Outline Builder work?",
              answer:
                "Type in your topic or main thesis, and the outline builder organizes it into clear paragraphs with main points and supporting ideas.",
            },
            {
              question: "Does Exismic save or share my student papers?",
              answer:
                "Never. Your essays, notes, and homework stay on your device and are never saved or shared.",
            },
            {
              question: "How does the Readability Assessor evaluate text?",
              answer:
                "It checks reading levels, sentence lengths, and word choices, suggesting simpler phrasing so your writing is easy to follow.",
            },
            {
              question: "Can students use Exismic for free?",
              answer:
                "Yes! Every student gets a daily allowance of free credits refreshed every 24 hours.",
            },
          ],
        };

      case "business":
        return {
          title: "Simple Invoicing & Business Calculators",
          intro:
            "Handle everyday business tasks without complicated software. Create clean PDF invoices for clients, calculate sales taxes and discounts, figure out monthly loan payments, and check your profit margins in seconds.",
          valueCards: [
            {
              title: "Quick Tax Math",
              desc: "Calculate exact tax additions or deductions with a single click.",
              badge: "Exact Math",
              icon: Award,
            },
            {
              title: "Custom Invoices",
              desc: "Make clean client invoices with your own logo, payment info, and item lists.",
              badge: "Clean Invoices",
              icon: FileCheck,
            },
            {
              title: "Loan Payment Tables",
              desc: "See exactly how much you pay each month for principal and interest on a loan.",
              badge: "Clear Numbers",
              icon: Sliders,
            },
            {
              title: "Private Financial Data",
              desc: "Your prices, customer names, and revenue numbers are never uploaded or stored.",
              badge: "100% Private",
              icon: Lock,
            },
          ],
          features: [
            "No Accounting Software Needed: Make and print professional invoices without paying for expensive subscriptions.",
            "Accurate Numbers: Exact calculations make sure your invoices and tax totals match your bank records.",
            "Easy to Print or Send: Download neat PDF invoices that look great when printed or emailed to clients.",
            "Free to Bill Clients: All invoices, receipts, and calculations are 100% yours to use for your business.",
          ],
          faqs: [
            {
              question: "Can I customize invoices with my company logo and currency?",
              answer:
                "Yes. You can add your business logo, select your preferred currency (USD, EUR, GBP, INR, etc.), and add payment notes.",
            },
            {
              question: "Is my business financial data kept private?",
              answer:
                "Completely. Invoices and calculations run right in your browser and are never saved on Exismic servers.",
            },
            {
              question: "Does Exismic take any cuts or transaction fees?",
              answer:
                "No fees at all. You can generate unlimited invoices and calculations for free with zero hidden platform charges.",
            },
            {
              question: "Can I print or email the generated invoices?",
              answer:
                "Yes. Invoices download as clean, professional PDFs formatted neatly for standard A4 and Letter paper.",
            },
          ],
        };

      case "seo":
        return {
          title: "Simple Tools to Help People Find Your Website",
          intro:
            "Improve how your website appears on Google and social media. Preview how your pages look in search results, design share banners, create structured tags, and check your titles before you publish.",
          valueCards: [
            {
              title: "Search Previews",
              desc: "See how your page title and description will look on Google before publishing.",
              badge: "Search Preview",
              icon: Globe,
            },
            {
              title: "Social Share Cards",
              desc: "Design images that show up nicely when people share your link on Twitter or LinkedIn.",
              badge: "Social Cards",
              icon: Zap,
            },
            {
              title: "Google Schema Tags",
              desc: "Create structured code for FAQs and products that helps Google understand your site.",
              badge: "Clean Code",
              icon: Award,
            },
            {
              title: "Sitemap Helpers",
              desc: "Make clean site maps and search instructions to help Google find all your pages.",
              badge: "Easy Setup",
              icon: FileCheck,
            },
          ],
          features: [
            "Follows Search Guidelines: Generates clean tags and code that search engines can read and index easily.",
            "Check Title Length: Make sure your titles and descriptions don't get cut off awkwardly in Google results.",
            "Social Link Preview: Preview how your links look when shared on X/Twitter, Discord, LinkedIn, and Facebook.",
            "One-Click Copy: Copy ready-to-use tags and code snippets directly into your website.",
          ],
          faqs: [
            {
              question: "How does structured schema markup help search ranking?",
              answer:
                "Schema markup helps search engines understand your content, often showing extra details like FAQ drop-downs and review stars in search results.",
            },
            {
              question: "How long can my Google title and description be?",
              answer:
                "Titles usually look best under 60 characters, and descriptions under 155 characters so Google doesn't cut them off.",
            },
            {
              question: "Are generated tags checked for errors?",
              answer:
                "Yes. All code follows official search engine guidelines and passes standard structured data tests.",
            },
            {
              question: "Can I use the banner maker for client websites?",
              answer:
                "Yes, 100%. All share cards and graphics created on Exismic are free to use for any commercial or personal site.",
            },
          ],
        };

      default:
        return {
          title: `Useful Online ${name}`,
          intro: `A collection of simple, fast online tools for ${name.toLowerCase()}. Get tasks done in seconds right in your web browser with complete privacy and zero setup.`,
          valueCards: [
            {
              title: "Runs in Your Browser",
              desc: "Everything works right on your device with no downloads and complete privacy.",
              badge: "100% Private",
              icon: Lock,
            },
            {
              title: "High Quality",
              desc: "Clean, reliable results built for everyday personal and work projects.",
              badge: "Reliable",
              icon: Award,
            },
            {
              title: "No Watermarks",
              desc: "All downloads and generated files are clean and completely free to use.",
              badge: "Clean Files",
              icon: Shield,
            },
            {
              title: "Daily Free Credits",
              desc: "Get fresh free credits every day to try out and use any tool.",
              badge: "Free Daily",
              icon: RefreshCw,
            },
          ],
          features: [
            "Instant In-Browser Tools: Zero software installation, zero setup, accessible on any modern device.",
            "Privacy-First Security: Uploaded files and inputs are strictly private and never monetized or exposed.",
            "Reliable Results: High-quality outputs built for everyday personal and work projects.",
            "Daily Free Allowance: Test, create, and refine with free daily generation credits refreshed every 24 hours.",
          ],
          faqs: [
            {
              question: `Are ${name} on Exismic free to use?`,
              answer: `Yes! Every tool in our ${name.toLowerCase()} suite can be accessed with your free daily credits. Pro accounts are available if you need extra capacity.`,
            },
            {
              question: `Do I need to install any software to use ${name}?`,
              answer: `No installation needed. All Exismic tools run smoothly right in your web browser on computers, phones, and tablets.`,
            },
            {
              question: `How does Exismic protect my privacy?`,
              answer: `Your files and inputs are processed right on your device and are never saved or shared.`,
            },
            {
              question: `Can I use outputs from ${name} for client work?`,
              answer: `Yes. Everything you make on Exismic is completely free to use for personal, work, or client projects.`,
            },
          ],
        };
    }
  };

  const content = getCategoryContent(categoryId, categoryName);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const otherCategories = CATEGORIES.filter((c) => c.id !== categoryId).slice(0, 4);

  return (
    <section className="mt-1 sm:mt-2 w-full text-left pb-28 sm:pb-36">
      {/* Schema Injection for Googlebot */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* =========================================================
          ANAMORPHIC NEON HORIZON DIVIDER (SECTION BRIDGE)
      ========================================================== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 mb-6 sm:mb-8 pointer-events-none select-none">
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

      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 md:px-12">
        {/* =========================================================
            1. HERO LIVING CONTAINER (360° LASER BORDER BEAM)
        ========================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative p-[1.5px] overflow-hidden rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] group/beam"
        >
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
            className="group relative overflow-hidden rounded-[calc(1.5rem-1.5px)] border border-white/[0.06] bg-[#070914]/95 p-6 sm:p-8 lg:p-10 backdrop-blur-2xl transition-all"
          >
            {/* Ambient Breathing Lighting */}
            <div
              className={cn(
                "absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[100px] pointer-events-none animate-pulse-glow",
                theme.ambientLight1
              )}
            />
            <div
              className={cn(
                "absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[100px] pointer-events-none animate-pulse-glow",
                theme.ambientLight2
              )}
            />

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
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                      theme.badgeBorder,
                      theme.badgeBg,
                      theme.badgeText
                    )}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span
                        className={cn(
                          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                          theme.badgeDot
                        )}
                      />
                      <span
                        className={cn(
                          "relative inline-flex rounded-full h-1.5 w-1.5",
                          theme.badgeDot
                        )}
                      />
                    </span>
                    <span>Overview & Features</span>
                  </div>
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      theme.badgeBorder,
                      theme.badgeBg,
                      theme.badgeText
                    )}
                  >
                    <Check size={11} className={theme.textAccent} />
                    <span>100% Free • Runs in Your Browser</span>
                  </div>
                </div>

                {/* Main Title & Description */}
                <h2
                  className={cn(
                    "text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r tracking-tight leading-tight",
                    theme.headingGradient
                  )}
                >
                  {content.title}
                </h2>
                <p className="text-sm sm:text-base font-normal text-zinc-300 leading-relaxed pt-0.5">
                  {content.intro}
                </p>
              </div>

              {/* 4 Living Value Cards (Tailored strictly to Category Theme) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                {content.valueCards.map((vp, idx) => {
                  const Icon = vp.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.45, delay: 0.08 + idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        "group/card relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070914]/90 p-4 sm:p-5 backdrop-blur-xl transition-colors duration-300",
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

                      <div className="relative z-10 flex flex-col gap-3 sm:gap-3.5">
                        <div className="flex items-center justify-between">
                          {/* 3D Icon Container with Category Accent & Micro-Tilt */}
                          <div
                            className={cn(
                              "size-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/card:scale-110 group-hover/card:-rotate-3",
                              theme.iconContainer
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Live Radar Beacon Badge */}
                          <div
                            className={cn(
                              "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                              theme.badgeBorder,
                              theme.badgeBg,
                              theme.badgeText
                            )}
                          >
                            <span className="relative flex h-1.5 w-1.5">
                              <span
                                className={cn(
                                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                  theme.badgeDot
                                )}
                              />
                              <span
                                className={cn(
                                  "relative inline-flex rounded-full h-1.5 w-1.5",
                                  theme.badgeDot
                                )}
                              />
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
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================
            2. CATEGORY STANDARDS & ARCHITECTURE
        ========================================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-2xl border shadow-lg",
                theme.iconContainer
              )}
            >
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                Why People Choose Exismic {categoryName}
              </h3>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
                Simple, reliable tools made for everyday work
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {content.features.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-[#070914]/80 p-6 backdrop-blur-md transition-colors duration-300",
                  theme.whyChooseCardHover
                )}
              >
                <div
                  className={cn(
                    "size-8 rounded-xl border flex items-center justify-center shrink-0 shadow-md",
                    theme.whyChooseIconBg,
                    theme.whyChooseIconBorder,
                    theme.whyChooseIconText
                  )}
                >
                  <CheckCircle2 size={18} />
                </div>
                <p className="text-sm font-medium leading-relaxed text-zinc-200">{feat}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* =========================================================
            3. FREQUENTLY ASKED QUESTIONS (SILKY SMOOTH ACCORDION)
        ========================================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-2xl border shadow-lg",
                theme.iconContainer
              )}
            >
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                Frequently Asked Questions about {categoryName}
              </h3>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
                Common questions about privacy, features, and how to use these tools
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {content.faqs.map((faq, idx) => {
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
                      <div
                        className={cn(
                          "size-7 rounded-lg text-xs font-mono font-black flex items-center justify-center shrink-0 border transition-all duration-300",
                          isOpen
                            ? cn(theme.faqBadgeOpen, "scale-105")
                            : "bg-white/[0.05] border-white/10 text-zinc-400"
                        )}
                      >
                        Q
                      </div>
                      <h4
                        className={cn(
                          "text-base font-bold transition-colors duration-200",
                          isOpen ? theme.faqTextOpen : "text-white"
                        )}
                      >
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
        </motion.div>

        {/* =========================================================
            4. MORE TO COME SHOWCASE BANNER (SUGGEST A TOOL)
        ========================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative overflow-hidden p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-[#07070e]/80 backdrop-blur-2xl transition-all duration-500 group border shadow-2xl",
            animStyle.cardBorder
          )}
        >
          {/* Dynamic Category Ambient Aura */}
          <div className={cn("pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-[90px] transition-all duration-700 opacity-60 group-hover:opacity-100", animStyle.aura)} />
          <div className={cn("pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-[90px] transition-all duration-700 opacity-40 group-hover:opacity-75", animStyle.aura)} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between lg:gap-10">
            <div className="space-y-3.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={cn("inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg", animStyle.badge)}>
                  <Compass size={11} className="animate-pulse" />
                  More To Come
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                  <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", theme.badgeDot)} />
                  {categoryName} Suite
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic leading-snug">
                  More tools on the <span className={cn("inline-block pr-3 text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]", animStyle.textGrad)}>horizon.</span>
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
                  We are always adding new tools and helpful features. Have a specific tool or idea you want to see here next?
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Users size={11} className="text-purple-400" /> Community Driven
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Clock size={11} className={theme.textAccent} /> Frequent Updates
                </span>
              </div>
            </div>

            <div className="shrink-0 pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(true)}
                className={cn(
                  "group/btn relative inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl sm:rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all overflow-hidden touch-manipulation hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                  animStyle.buttonGrad
                )}
              >
                <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite]" />
                <MessageSquare size={15} className="relative z-10 text-white" />
                <span className="relative z-10">Suggest A Tool</span>
                <ArrowRight size={14} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Suggest Tool Interactive Modal */}
        <SuggestToolModal
          isOpen={isSuggestModalOpen}
          onClose={() => setIsSuggestModalOpen(false)}
          defaultCategory={categoryId}
        />

        {/* =========================================================
            5. OTHER CATEGORIES NAVIGATION (ZERO CLIPPING AGAINST FOOTER)
        ========================================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6 pt-8 border-t border-white/[0.08] relative z-20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Explore More Tool Categories
              </h3>
              <p className="text-xs font-medium text-zinc-400 mt-0.5">
                Check out more free online tools for photos, audio, video, documents, and code
              </p>
            </div>
            <Link
              href="/"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border backdrop-blur-xl transition-all duration-300 w-fit shrink-0 relative z-20 shadow-md",
                theme.viewAllBtn
              )}
            >
              <span>View All 80+ Tools</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pb-4 overflow-visible">
            {otherCategories.map((cat, idx) => {
              const CatIcon = ICON_MAP[cat.icon] || Layers;
              const catTheme = CATEGORY_THEMES[cat.id] || CATEGORY_THEMES.image;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  <Link
                    href={`/category/${cat.id}`}
                    className={cn(
                      "group relative flex flex-col justify-between h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070914]/90 p-5 sm:p-6 backdrop-blur-xl transition-colors duration-300 isolate",
                      catTheme.suggestionsCardHover
                    )}
                  >
                    {/* Top Specular Rim */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                    {/* Ambient Hover Spotlight */}
                    <div
                      className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(220px circle at top left, ${catTheme.cardSpotlight}, transparent 70%)`,
                      }}
                    />

                    <div className="relative z-10 flex flex-col gap-3.5">
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "size-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
                            catTheme.iconContainer
                          )}
                        >
                          <CatIcon size={18} />
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            catTheme.textAccent
                          )}
                        >
                          Explore →
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-zinc-100 transition-colors">
                          {cat.name}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed min-h-[36px]">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
