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
          title: "Next-Gen Image & Graphics Processing",
          intro:
            "Transform, upscale, convert, and craft visual media in seconds. Exismic combines in-browser canvas speed with deep neural cutouts to remove backgrounds, compress photos without quality loss, and create custom Minecraft 3D skins with zero watermarks.",
          valueCards: [
            {
              title: "Zero Watermarks",
              desc: "Export 100% clean PNG, WebP, and SVG files ready for client deliverables and commercial branding.",
              badge: "Royalty Free",
              icon: Shield,
            },
            {
              title: "Lossless Edge Detail",
              desc: "Preserve fine hair, furry edges, and semi-transparent alpha channels with pixel-perfect precision.",
              badge: "Precision",
              icon: Layers,
            },
            {
              title: "In-Browser Speed",
              desc: "Resize, convert, and compress images directly inside your browser with zero upload lag.",
              badge: "Instant",
              icon: Zap,
            },
            {
              title: "Universal Formats",
              desc: "Full support for PNG, JPG, WebP, AVIF, SVG, and high-resolution texture maps.",
              badge: "Universal",
              icon: ImageIcon,
            },
          ],
          features: [
            "Zero-Loss Compression: Shrink bloated image file sizes up to 85% without noticeable artifacting or blur.",
            "Ephemeral Canvas Sandbox: Your personal photos, screenshots, and artwork never leave your device.",
            "Commercial Royalty-Free: 100% full commercial copyright on all created skins, cutouts, and banners.",
            "Cross-Tool Chaining: Send your transparent cutout directly into the compressor, resizer, or meme studio with 1 click.",
          ],
          faqs: [
            {
              question: "Does Exismic degrade photo resolution or sharpness?",
              answer:
                "No. Exismic uses perceptual image preservation algorithms that maintain pixel sharpness, dynamic contrast, and vibrant color depth across all export formats.",
            },
            {
              question: "Can I use edited images commercially?",
              answer:
                "Yes. Any asset processed or created on Exismic is completely yours for personal, client, or commercial use without royalties or licensing restrictions.",
            },
            {
              question: "How does the Minecraft Skin Maker work?",
              answer:
                "Our AI skin studio turns text prompts and reference palettes into game-ready 64x64 PNG skins with full 3D interactive inspection and layer editing.",
            },
            {
              question: "Are uploads stored on Exismic servers?",
              answer:
                "Your uploads are processed securely in an encrypted client-side sandbox and are never retained, monitored, or used for model training.",
            },
          ],
        };

      case "video":
        return {
          title: "Studio-Grade Video Editing & Subtitle Suite",
          intro:
            "Produce high-impact video content without bulky software or slow rendering queues. Trim clips, generate animated captions, isolate backgrounds, and compress videos directly in your browser with zero watermarks.",
          valueCards: [
            {
              title: "Clean Video Exports",
              desc: "Export clean MP4 and WebM videos ready for YouTube Shorts, TikTok, and Instagram Reels.",
              badge: "Zero Watermarks",
              icon: VideoIcon,
            },
            {
              title: "Auto Captions Engine",
              desc: "Generate word-by-word synced subtitles that boost retention and watch time.",
              badge: "High Retention",
              icon: FileText,
            },
            {
              title: "Lossless Video Shrink",
              desc: "Reduce GB-sized raw video files to lightweight web-friendly clips in seconds.",
              badge: "Fast Render",
              icon: Zap,
            },
            {
              title: "1-Click Social Ratios",
              desc: "Instant 9:16 vertical, 1:1 square, and 16:9 widescreen formats for every channel.",
              badge: "Multi-Platform",
              icon: Sliders,
            },
          ],
          features: [
            "In-Browser WebAssembly Encoding: Process and trim clips locally without uploading gigabytes to cloud servers.",
            "High-Retention Subtitles: Animated word highlights keep viewers hooked through the critical first 3 seconds.",
            "Crisp 1080p & 4K Output: Crystal-clear video exports without blurry downscaling or forced brand watermarks.",
            "Platform-Ready Presets: Tailored export profiles optimized for TikTok, Instagram Reels, and YouTube Shorts.",
          ],
          faqs: [
            {
              question: "Does Exismic put watermarks on exported videos?",
              answer:
                "Never. All video exports from Exismic are 100% clean and watermark-free for both personal and commercial use.",
            },
            {
              question: "How does in-browser video processing work without software installation?",
              answer:
                "We utilize WebAssembly and WebGPU engines directly inside modern browsers to decode, transform, and encode clips locally with zero latency.",
            },
            {
              question: "What video formats does Exismic support?",
              answer:
                "You can import and export MP4, WebM, MOV, and MKV video formats across all major desktop and mobile browsers.",
            },
            {
              question: "Can I use generated video clips for commercial client work?",
              answer:
                "Yes, 100%. All video assets produced on Exismic are unencumbered and approved for commercial deliverables.",
            },
          ],
        };

      case "audio":
        return {
          title: "Studio-Grade Audio, Music & Voice Workflows",
          intro:
            "Shape, refine, and produce pristine audio in seconds. Isolate crisp vocals, split instrumental stems, craft viral slowed + reverb mixes, generate lifelike speech, and visualize soundwaves with zero audio compression artifacts.",
          valueCards: [
            {
              title: "Crystal Stem Split",
              desc: "Isolate vocals, drums, bass, and melody lines with studio-grade acoustic clarity.",
              badge: "AI Stems",
              icon: Headphones,
            },
            {
              title: "Real-Time DSP Engine",
              desc: "Apply cathedral reverb, bass boost, and pitch shifts instantly with zero buffer lag.",
              badge: "Zero Buffer Lag",
              icon: Sliders,
            },
            {
              title: "Lossless Audio Master",
              desc: "Export studio-mastered 16-bit 44.1kHz audio files ready for streaming platforms.",
              badge: "Lossless Master",
              icon: Award,
            },
            {
              title: "Waveform Video Studio",
              desc: "Render animated audiogram videos for podcast teasers and social music sharing.",
              badge: "Visualizer",
              icon: Zap,
            },
          ],
          features: [
            "Hardware-Accelerated DSP: Real-time frequency filtering and convolution reverb run natively on your device.",
            "Zero Telemetry Privacy: Audio files, private voiceovers, and voice notes are processed securely in an isolated sandbox.",
            "Studio Acoustic Integrity: Perceptual audio engines prevent robotic phase cancellation and muddy low-end frequencies.",
            "1-Click Chaining: Seamlessly move from audio slowing and stem splitting to animated waveform video creation.",
          ],
          faqs: [
            {
              question: "Can I split vocals and instruments from any song?",
              answer:
                "Yes. Our stem separation algorithms accurately separate lead vocals from backing instruments, drums, and basslines in seconds.",
            },
            {
              question: "Are audio exports compressed or degraded in quality?",
              answer:
                "No. Exismic exports clean 16-bit 44.1kHz WAV and high-bitrate 320kbps MP3 audio with full dynamic frequency range.",
            },
            {
              question: "Can I use Exismic audio tools on mobile phones?",
              answer:
                "Yes. All audio tools feature responsive touch sliders, low-latency Web Audio engines, and mobile-friendly media players.",
            },
            {
              question: "Are my uploaded tracks or recordings saved on Exismic servers?",
              answer:
                "Never. Audio files are processed locally in your browser session and are never retained, analyzed, or monetized.",
            },
          ],
        };

      case "pdf":
        return {
          title: "Effortless PDF Document & Publishing Suite",
          intro:
            "Organize, merge, convert, compress, and extract text from PDF documents with complete privacy. Everything executes inside your browser with bank-grade sandboxing, ensuring sensitive contracts and records never leave your control.",
          valueCards: [
            {
              title: "Bank-Grade Privacy",
              desc: "Documents are processed locally in an ephemeral sandbox and never uploaded or stored.",
              badge: "Zero Leakage",
              icon: Lock,
            },
            {
              title: "Instant Document Merge",
              desc: "Combine unlimited PDF pages and files into a single organized document in seconds.",
              badge: "High Speed",
              icon: Layers,
            },
            {
              title: "Lossless File Shrink",
              desc: "Reduce bloated document file sizes by up to 75% while keeping text and diagrams razor-sharp.",
              badge: "Sharp Text",
              icon: FileCheck,
            },
            {
              title: "Optical OCR Engine",
              desc: "Extract searchable text from scanned paperwork and screenshots with high accuracy.",
              badge: "High Accuracy",
              icon: Zap,
            },
          ],
          features: [
            "Strict Client-Side Encryption: Financial records, signed contracts, and tax filings stay 100% on your device.",
            "Vector Text Preservation: Document compression reduces image weight while keeping fonts crisp and vector-sharp.",
            "Zero File Size Limits: Process lengthy research papers and multi-chapter eBooks without artificial file barriers.",
            "Cross-Platform Ready: Merge, sign, and convert documents effortlessly across iPhones, Androids, iPads, and PCs.",
          ],
          faqs: [
            {
              question: "Are my confidential PDF documents safe on Exismic?",
              answer:
                "Yes, 100%. Exismic PDF utilities process documents in client-side WebAssembly sandboxes without ever transmitting pages to cloud servers.",
            },
            {
              question: "How much can Exismic compress a PDF without losing readability?",
              answer:
                "You can reduce file sizes between 40% and 80% while retaining crisp, printable typography and sharp graphics.",
            },
            {
              question: "Can I extract text from scanned PDFs or images?",
              answer:
                "Yes. Our built-in OCR (Optical Character Recognition) engine extracts plain text and formatting from scanned documents.",
            },
            {
              question: "Is there any limit on the number of PDFs I can merge?",
              answer:
                "No. You can combine as many pages and individual documents as needed with instant 1-click downloads.",
            },
          ],
        };

      case "ai":
        return {
          title: "High-Intelligence AI Studio & Creative Generators",
          intro:
            "Unlock next-generation generative AI for writing, coding, visual design, and prompt engineering. From drafting viral content to architecting multi-model LLM prompts and building custom avatars, create with cutting-edge neural models.",
          valueCards: [
            {
              title: "Multi-Model Power",
              desc: "Leverage state-of-the-art LLMs engineered for reasoning, copywriting, and code generation.",
              badge: "Multi-Model",
              icon: Cpu,
            },
            {
              title: "Structured Frameworks",
              desc: "Generate bulletproof XML-tagged prompts using CREATE, CoT, and RTF methodologies.",
              badge: "High Precision",
              icon: Wand2,
            },
            {
              title: "Human-Sounding Copy",
              desc: "Write compelling articles, scripts, and product hooks free from robotic filler and clichés.",
              badge: "Natural Tone",
              icon: FileText,
            },
            {
              title: "Daily Free Credits",
              desc: "Receive a fresh replenishment of generation credits every 24 hours across all AI studios.",
              badge: "Free Refreshes",
              icon: RefreshCw,
            },
          ],
          features: [
            "Zero Hallucination Guardrails: AI prompts and generators enforce strict formatting rules for consistent outputs.",
            "One-Click AI Launchers: Instantly launch your generated prompts into ChatGPT, Claude, or DeepSeek.",
            "Privacy-First Sessions: Prompts and generative queries are strictly ephemeral and never used to train public models.",
            "Commercial Rights Included: Retain 100% ownership of all generated articles, code snippets, and creative assets.",
          ],
          faqs: [
            {
              question: "What AI models power Exismic's generative tools?",
              answer:
                "We orchestrate top-tier neural models including DeepSeek, Claude, and specialized vision models for maximum precision.",
            },
            {
              question: "How do free credits work for AI tools?",
              answer:
                "Every account receives free credits every 24 hours. Pro members receive expanded credit pools and priority generation queues.",
            },
            {
              question: "Can I use AI-generated copy and code commercially?",
              answer:
                "Yes. All copy, code, and creative media generated on Exismic are 100% royalty-free and yours to monetize.",
            },
            {
              question: "Are my AI prompts or inputs kept private?",
              answer:
                "Absolutely. We enforce strict data privacy policies; your inputs are never sold, exposed, or used for model training.",
            },
          ],
        };

      case "productivity":
        return {
          title: "High-Efficiency Productivity & Daily Utilities",
          intro:
            "Eliminate friction from your daily workflow with instantaneous web utilities. Generate scannable custom QR codes, generate cryptographically secure passwords, calculate conversions, and organize notes without installing extensions.",
          valueCards: [
            {
              title: "Zero-Latency Launch",
              desc: "Tools launch and execute in milliseconds with zero loading screens or server wait times.",
              badge: "0ms Latency",
              icon: Zap,
            },
            {
              title: "High-Entropy Security",
              desc: "Generate randomized passwords with cryptographic entropy directly in your browser.",
              badge: "High Security",
              icon: Lock,
            },
            {
              title: "Vector QR Codes",
              desc: "Create high-contrast QR codes with custom colors and logo inserts in SVG and PNG.",
              badge: "Vector Sharp",
              icon: Globe,
            },
            {
              title: "Universal Device Sync",
              desc: "Access all utilities seamlessly across smartphones, tablets, laptops, and desktops.",
              badge: "Multi-Device",
              icon: Sliders,
            },
          ],
          features: [
            "Offline-Capable Execution: Core utilities run locally so you can generate QR codes and passwords anywhere.",
            "Zero Account Wall: Access essential converters and generators immediately without mandatory sign-up hurdles.",
            "One-Click Clipboard: Copy formatted outputs, codes, or credentials straight to your clipboard with 1 click.",
            "Ad-Free Clean Workspace: Distraction-free interfaces focused strictly on rapid task completion.",
          ],
          faqs: [
            {
              question: "Are passwords generated on Exismic secure?",
              answer:
                "Yes. We utilize the browser's native crypto.getRandomValues() CSPRNG, ensuring passwords are mathematically unpredictable.",
            },
            {
              question: "Do QR codes created on Exismic expire?",
              answer:
                "Never. Static QR codes encode your data directly into the pixel matrix and will function indefinitely without recurring fees.",
            },
            {
              question: "Do I need an account to use productivity tools?",
              answer:
                "No. All essential productivity utilities are open and accessible with zero sign-up requirements.",
            },
            {
              question: "Can I print QR codes on commercial merchandise?",
              answer:
                "Yes. You can export high-resolution PNG and scalable vector SVG files suitable for billboards, menus, and business cards.",
            },
          ],
        };

      case "developer":
        return {
          title: "Engineered for Modern Web Developers",
          intro:
            "High-throughput development utilities built to run in your browser with zero latency and zero data leakage. Test regex patterns, format JSON, inspect diffs, build cron schedules, and generate hashes locally in an isolated sandbox.",
          valueCards: [
            {
              title: "Client-Side Sandbox",
              desc: "Code and sensitive JSON payloads are parsed locally with zero telemetry logging.",
              badge: "Zero Telemetry",
              icon: Code2,
            },
            {
              title: "RFC Spec Compliance",
              desc: "Formatted outputs strictly follow ECMAScript, TypeScript, and RFC cryptographic standards.",
              badge: "RFC Compliant",
              icon: Award,
            },
            {
              title: "Zero CLI Overhead",
              desc: "Instant browser utilities that replace heavy npm CLI packages and browser extensions.",
              badge: "Zero Installs",
              icon: Zap,
            },
            {
              title: "1-Click Code Exports",
              desc: "Copy formatted JSON, SHA-256 hashes, or Git patches directly into your editor.",
              badge: "Instant Copy",
              icon: FileText,
            },
          ],
          features: [
            "Client-Side Sandboxing: Code and sensitive JSON payloads are parsed locally with zero telemetry logging.",
            "AST & Spec Compliance: Formatted outputs strictly follow ECMAScript, TypeScript, and RFC standards.",
            "Zero Dependency Overhead: Instant tools that replace bulky npm CLI packages and browser extensions.",
            "One-Click Clipboard Exports: Instantly copy formatted code, hashes, or SQL queries directly into your codebase.",
          ],
          faqs: [
            {
              question: "Are my code snippets, JSON feeds, or database queries logged on Exismic?",
              answer:
                "No. Exismic developer tools operate in strict privacy-first environments. Transformations, hashing, and regex evaluations run client-side in your browser and are never stored or inspected.",
            },
            {
              question: "Can I use outputs from Exismic developer tools in commercial proprietary projects?",
              answer:
                "Yes, 100%. All code, types, SQL queries, and hashes generated on Exismic are completely unencumbered and open for commercial production use.",
            },
            {
              question: "Does Exismic support modern JavaScript and TypeScript dialects?",
              answer:
                "Yes. Our developer utilities support ES2024+, TypeScript 5+, JSON5, standard SQL dialects (PostgreSQL, MySQL, SQLite), and POSIX cron formats.",
            },
            {
              question: "Are developer tools free on Exismic?",
              answer:
                "All core developer tools (Regex Tester, JSON Formatter, Hash Generator, UUID Creator, Cron Builder) are completely free with unlimited daily usage.",
            },
          ],
        };

      case "creator":
        return {
          title: "Audience Growth & Social Media Workflows",
          intro:
            "Built for creators, YouTubers, newsletter writers, and social strategists. Create realistic viral post mockups, design 1200x630 social share banners, analyze video thumbnail contrast, and craft high-retention script hooks.",
          valueCards: [
            {
              title: "Retention Science",
              desc: "Script hooks and carousel layouts structured around proven organic engagement formulas.",
              badge: "High Retention",
              icon: TrendingUp,
            },
            {
              title: "Multi-Platform Native",
              desc: "Formatted specifically for YouTube, Instagram Reels, TikTok, LinkedIn, and X.",
              badge: "Social Native",
              icon: Globe,
            },
            {
              title: "2.5x Retina Exports",
              desc: "Export ultra-sharp graphics and copy images directly to your operating system clipboard.",
              badge: "2.5x Retina",
              icon: Award,
            },
            {
              title: "Royalty-Free Assets",
              desc: "100% full commercial copyright on all created banners, post mockups, and scripts.",
              badge: "100% Free",
              icon: Shield,
            },
          ],
          features: [
            "Audience Retention Science: Script hooks and carousel layouts structured around proven organic engagement formulas.",
            "Multi-Platform Native: Formatted specifically for YouTube, Instagram Reels, TikTok, LinkedIn, and X.",
            "Visual Thumbnail Analysis: Preview your video thumbnails against light and dark feed backgrounds with contrast ratings.",
            "Clean Exports: Download ready-to-publish assets and copy clean formatting directly to your clipboard.",
          ],
          faqs: [
            {
              question: "How do the creator tools help improve video reach?",
              answer:
                "Our hook script generator and thumbnail analyzer focus on the first 3 seconds of viewer psychology and visual contrast to maximize click-through rate (CTR) and average view duration (AVD).",
            },
            {
              question: "Can I format LinkedIn posts with bold and italic text?",
              answer:
                "Yes! Our LinkedIn Formatter converts text into compliant Unicode styling with clean line spacing that reads effortlessly on mobile feeds.",
            },
            {
              question: "Does Exismic claim rights to my scripts or designs?",
              answer:
                "Never. You retain 100% copyright and ownership of all content and assets generated on Exismic.",
            },
            {
              question: "How many credits do creator tools cost?",
              answer:
                "Most creator utilities cost between 5 and 15 credits, and all users receive free credits refreshed every 24 hours.",
            },
          ],
        };

      case "student":
        return {
          title: "Supercharge Your Academic Research & Studies",
          intro:
            "Empowering learners to study smarter and write with academic rigor. Convert lecture notes into interactive mind maps, evaluate reading grade levels, generate structured essay outlines, and calculate step-by-step solutions.",
          valueCards: [
            {
              title: "Academic Rigor",
              desc: "Structure research arguments and essay outlines around scholarly thesis standards.",
              badge: "Thesis Ready",
              icon: Award,
            },
            {
              title: "Step-by-Step Clarity",
              desc: "Break down complex concepts into visual mind maps and easy-to-follow outlines.",
              badge: "Visual Learning",
              icon: Layers,
            },
            {
              title: "Standard Citations",
              desc: "Support for APA 7th, MLA 9th, Chicago, and Harvard academic bibliography standards.",
              badge: "APA & MLA",
              icon: FileText,
            },
            {
              title: "Ephemeral Privacy",
              desc: "Notes, papers, and essays are processed in an ephemeral sandbox and never logged.",
              badge: "Zero Leakage",
              icon: Lock,
            },
          ],
          features: [
            "Academic Rigor & Integrity: Tools engineered to assist your research, outline logic, and citation accuracy.",
            "Step-by-Step Learning: Math solver and readability tools explain intermediate steps to facilitate deep understanding.",
            "Standard Citation Formats: Built-in support for APA 7th, MLA 9th, Chicago, and Harvard academic styles.",
            "Cross-Platform Accessibility: Study from laptops, tablets, or smartphones with zero software installation.",
          ],
          faqs: [
            {
              question: "How does the AI Essay Outline Builder work?",
              answer:
                "The outline builder takes your topic or thesis statement and generates a comprehensive, paragraph-by-paragraph structure with topic sentences, supporting arguments, and research prompts.",
            },
            {
              question: "Does Exismic save or share my student papers and research?",
              answer:
                "Never. Your academic papers, essays, and notes are processed in an ephemeral sandbox and permanently deleted immediately after processing.",
            },
            {
              question: "How does the Readability Assessor evaluate text?",
              answer:
                "It calculates standard linguistic metrics including the Flesch-Kincaid Grade Level, Flesch Reading Ease, and average sentence length, while offering simplified rewrites to enhance clarity.",
            },
            {
              question: "Can students use Exismic for free?",
              answer:
                "Yes! Every student gets a daily allowance of free generation credits refreshed every 24 hours to use across all academic and creative tools.",
            },
          ],
        };

      case "business":
        return {
          title: "Financial Calculators & Business Operations Suite",
          intro:
            "Accelerate daily financial planning and commerce operations. Generate clean professional PDF invoices, calculate GST and sales tax, compute loan EMI amortization schedules, and evaluate gross profit margins in seconds.",
          valueCards: [
            {
              title: "Tax & GST Accuracy",
              desc: "Compute accurate tax breakdowns, inclusive and exclusive pricing with 1 click.",
              badge: "Tax Compliant",
              icon: Award,
            },
            {
              title: "Branded PDF Invoices",
              desc: "Generate branded, itemized client invoices with custom logos and payment terms.",
              badge: "Client Ready",
              icon: FileCheck,
            },
            {
              title: "Loan EMI Schedules",
              desc: "Visualize monthly principal vs. interest payments with complete breakdown tables.",
              badge: "Clear Figures",
              icon: Sliders,
            },
            {
              title: "Zero Financial Leakage",
              desc: "Financial data, revenue numbers, and customer details never leave your device.",
              badge: "100% Private",
              icon: Lock,
            },
          ],
          features: [
            "Zero Setup Invoicing: Generate and print polished commercial invoices without costly accounting software.",
            "Precise Financial Math: Decimal-exact rounding ensures calculations match bank and accounting ledger totals.",
            "Instant Print & PDF Export: Download clean, printable documents formatted perfectly for standard A4 and Letter paper.",
            "Unrestricted Commercial Use: All generated invoices, receipts, and reports are 100% yours to bill clients.",
          ],
          faqs: [
            {
              question: "Can I customize invoices with my company logo and currency?",
              answer:
                "Yes. You can add your business logo, choose any global currency (USD, EUR, GBP, INR, etc.), and customize payment notes.",
            },
            {
              question: "Is my business financial data kept private?",
              answer:
                "Completely. Invoices and calculations are processed entirely in your browser memory and are never stored on Exismic servers.",
            },
            {
              question: "Does Exismic charge fees per invoice or transaction?",
              answer:
                "No fees at all. You can generate unlimited invoices and calculations for free with zero hidden platform cuts.",
            },
            {
              question: "Are invoice PDFs compliant with standard business tax practices?",
              answer:
                "Yes. Our invoice layouts include standard fields for Tax IDs (GST/VAT), itemized line items, and payment instructions.",
            },
          ],
        };

      case "seo":
        return {
          title: "Search Engine Optimization & SERP Dominance",
          intro:
            "Inspect, preview, and optimize your web pages to rank higher on Google. Generate valid Schema.org JSON-LD markup, design 1200x630 social share cards, preview Google SERP snippets, and build XML sitemaps.",
          valueCards: [
            {
              title: "Googlebot Schema Engine",
              desc: "Generate syntax-validated JSON-LD markup for FAQPage, Product, and Article schemas.",
              badge: "Google Validated",
              icon: Award,
            },
            {
              title: "SERP Pixel Simulator",
              desc: "Preview title and description truncate limits across mobile and desktop search results.",
              badge: "SERP Preview",
              icon: Globe,
            },
            {
              title: "Open Graph Banners",
              desc: "Design 1200x630 social share cards that double CTR on Twitter, LinkedIn, and Discord.",
              badge: "2x Social CTR",
              icon: Zap,
            },
            {
              title: "Robots & Sitemap Tools",
              desc: "Build error-free robots.txt rules and XML sitemaps to optimize crawl budgets.",
              badge: "Fast Indexing",
              icon: FileCheck,
            },
          ],
          features: [
            "Direct Search Console Compliance: Schemas strictly adhere to Google Search Central structured data specifications.",
            "Real-Time Pixel Truncation: Calculates exact Google pixel widths to ensure meta tags never get cut off with ugly dots.",
            "Social Platform Simulators: Preview how your links look when shared on X/Twitter, Discord, LinkedIn, and Facebook.",
            "Instant Code Exports: Copy validated JSON-LD scripts and HTML meta tags directly into your Next.js or HTML head.",
          ],
          faqs: [
            {
              question: "How does structured schema markup help search ranking?",
              answer:
                "Schema markup enables rich search results (rich snippets, FAQ dropdowns, star ratings) that dramatically improve click-through rates.",
            },
            {
              question: "What are the character and pixel limits for Google meta descriptions?",
              answer:
                "Google typically displays up to ~155-160 characters (~960px) on desktop and ~120 characters (~680px) on mobile viewports.",
            },
            {
              question: "Are generated schemas validated against Schema.org standards?",
              answer:
                "Yes. All generated JSON-LD code strictly follows Schema.org schemas and passes the Google Rich Results Test.",
            },
            {
              question: "Can I use the OG Banner maker for commercial client websites?",
              answer:
                "Yes, 100%. All banner graphics, meta tags, and structured data created on Exismic are open for commercial production use.",
            },
          ],
        };

      default:
        return {
          title: `Professional ${name} Solutions Online`,
          intro: `Access Exismic's purpose-built suite of online ${name.toLowerCase()}. Streamline repetitive tasks, enhance creative output, and achieve professional results in seconds directly within your browser with zero server latency.`,
          valueCards: [
            {
              title: "In-Browser Sandbox",
              desc: "Processing executes directly inside your browser with zero software installation and zero data leakage.",
              badge: "100% Private",
              icon: Lock,
            },
            {
              title: "Studio-Grade Precision",
              desc: "High-fidelity outputs built to meet professional creator, developer, and business standards.",
              badge: "Studio Grade",
              icon: Award,
            },
            {
              title: "Zero Watermarks",
              desc: "All exports and generated assets are 100% clean and approved for commercial deliverables.",
              badge: "Royalty Free",
              icon: Shield,
            },
            {
              title: "Daily Free Credits",
              desc: "Test, create, and refine with free generation credits refreshed automatically every 24 hours.",
              badge: "Free Refreshes",
              icon: RefreshCw,
            },
          ],
          features: [
            "Instant In-Browser Processing: Zero software installation, zero setup, accessible on any modern device.",
            "Privacy-First Security: Uploaded files and inputs are strictly sandboxed and never monetized or exposed.",
            "Studio-Grade Precision: High-fidelity outputs built to meet professional creator and business standards.",
            "Daily Free Allowance: Test, create, and refine with free daily generation credits refreshed every 24 hours.",
          ],
          faqs: [
            {
              question: `Are ${name} on Exismic free to use?`,
              answer: `Yes! Every tool in our ${name.toLowerCase()} suite can be accessed for free with your daily credit allowance. Pro subscriptions are available for extended capacity.`,
            },
            {
              question: `Do I need to install any software to use ${name}?`,
              answer: `None at all. All Exismic tools run entirely inside modern web browsers on desktop, tablet, and mobile devices.`,
            },
            {
              question: `How does Exismic safeguard user privacy?`,
              answer: `We use end-to-end SSL encryption. Your uploaded documents and generated files are ephemeral and automatically purged after processing.`,
            },
            {
              question: `Can I use assets from ${name} for commercial projects?`,
              answer: `Yes, all outputs generated through Exismic are 100% royalty-free and approved for commercial and client deliverables.`,
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
                    <span>Category Overview & Standards</span>
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
                    <span>100% Free • In-Browser Processing</span>
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            2. CATEGORY STANDARDS & ARCHITECTURE
        ========================================================== */}
        <div className="space-y-6">
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
                Why Creators Rely on Exismic {categoryName}
              </h3>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
                Precision engineering and high-performance infrastructure
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {content.features.map((feat, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-[#070914]/80 p-6 backdrop-blur-md transition-all duration-300",
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
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            3. FREQUENTLY ASKED QUESTIONS (SILKY SMOOTH ACCORDION)
        ========================================================== */}
        <div className="space-y-6">
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
                Key questions answered regarding performance, privacy, and commercial rights
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
        </div>

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
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                  <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", theme.badgeDot)} />
                  {categoryName} Suite
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic leading-snug">
                  More tools on the <span className={cn("inline-block pr-3 text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]", animStyle.textGrad)}>horizon.</span>
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
                  We continuously drop new tools, creators, and workflow enhancements. Have a specific generator or feature you want to see here next?
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
        <div className="space-y-6 pt-8 border-t border-white/[0.08] relative z-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Explore Other Creative Suites
              </h3>
              <p className="text-xs font-medium text-zinc-400 mt-0.5">
                Switch workspaces to streamline image, audio, video, or developer workflows
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
            {otherCategories.map((cat) => {
              const CatIcon = ICON_MAP[cat.icon] || Layers;
              const catTheme = CATEGORY_THEMES[cat.id] || CATEGORY_THEMES.image;

              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070914]/90 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 isolate",
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

                  <div className="relative z-10 flex flex-col justify-between h-full gap-4">
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
                      <p className="text-xs text-zinc-400 line-clamp-3 mt-1.5 leading-relaxed min-h-[36px]">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
