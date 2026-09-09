"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORIES, TOOLS, ICON_MAP, type Category } from "@/data/tools";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  LayoutDashboard, 
  LayoutGrid,
  Star, 
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  Clock,
  Crown,
  Users,
  ShieldCheck,
  Flame,
  Gift,
  HelpCircle,
  ScrollText,
  Cloud
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import GradientText from "../ui/GradientText";
import { usePro } from "@/hooks/usePro";
import { useCredits } from "@/hooks/useCredits";
import { useSidebarStore } from "@/hooks/useSidebarStore";
import { useTranslation } from "react-i18next";
import { UserProfile } from "../ui/UserProfile";
import { ExismicLogo } from "../ui/ExismicLogo";
import { CreditTokenIcon } from "../ui/CreditTokenIcon";
import { BuyCreditsModal } from "@/components/credits/BuyCreditsModal";
import { SparkIcon } from "../ui/SparkIcon";
import { isAdminEmail } from "@/lib/admin";

interface SidebarItemProps {
  name: string;
  icon: LucideIcon | React.ComponentType<{ size?: number; className?: string; variant?: any; animated?: boolean }>;
  href: string;
  isActive: boolean;
  accentColor?: string;
  glowColor?: string;
  onClick?: () => void;
  isCompact?: boolean;
  rightElement?: React.ReactNode;
}

const CATEGORY_INDICATOR_GRADIENTS: Record<string, string> = {
  "/": "bg-gradient-to-b from-purple-400 via-pink-400 to-indigo-400 shadow-[0_0_14px_rgba(168,85,247,0.9)]",
  "/shop": "bg-gradient-to-b from-amber-300 via-yellow-400 to-orange-500 shadow-[0_0_14px_rgba(245,158,11,0.9)]",
  "/rewards": "bg-gradient-to-b from-amber-300 via-yellow-400 to-orange-500 shadow-[0_0_14px_rgba(245,158,11,0.9)]",
  "/community": "bg-gradient-to-b from-cyan-300 via-purple-400 to-pink-500 shadow-[0_0_14px_rgba(34,211,238,0.9)]",
  "/giveaway": "bg-gradient-to-b from-amber-300 via-yellow-400 to-orange-400 shadow-[0_0_16px_rgba(245,158,11,1)]",
  "/favorites": "bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_14px_rgba(251,191,36,0.9)]",
  "/library": "bg-gradient-to-b from-cyan-300 via-indigo-400 to-purple-500 shadow-[0_0_14px_rgba(34,211,238,0.9)]",
  "/history": "bg-gradient-to-b from-blue-400 via-cyan-400 to-indigo-400 shadow-[0_0_14px_rgba(96,165,250,0.9)]",
  "/referrals": "bg-gradient-to-b from-emerald-400 via-teal-400 to-green-500 shadow-[0_0_14px_rgba(16,185,129,0.9)]",
  "/admin": "bg-gradient-to-b from-rose-400 via-red-500 to-orange-500 shadow-[0_0_14px_rgba(244,63,94,0.9)]",
  "/pro": "bg-gradient-to-b from-purple-300 via-pink-300 to-cyan-300 shadow-[0_0_14px_rgba(168,85,247,0.9)]",
  "/changelog": "bg-gradient-to-b from-purple-400 via-pink-400 to-cyan-400 shadow-[0_0_14px_rgba(168,85,247,0.9)]",
  "/help": "bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-500 shadow-[0_0_14px_rgba(14,165,233,0.9)]",

  "/category/image": "bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-500 shadow-[0_0_14px_rgba(34,211,238,0.9)]",
  "/category/video": "bg-gradient-to-b from-violet-400 via-purple-400 to-indigo-500 shadow-[0_0_14px_rgba(139,92,246,0.9)]",
  "/category/audio": "bg-gradient-to-b from-pink-400 via-rose-400 to-purple-500 shadow-[0_0_14px_rgba(236,72,153,0.9)]",
  "/category/pdf": "bg-gradient-to-b from-red-400 via-rose-500 to-amber-500 shadow-[0_0_14px_rgba(239,68,68,0.9)]",
  "/category/ai": "bg-gradient-to-b from-amber-300 via-yellow-400 to-purple-400 shadow-[0_0_14px_rgba(250,204,21,0.9)]",
  "/category/productivity": "bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_14px_rgba(16,185,129,0.9)]",
  "/category/developer": "bg-gradient-to-b from-lime-400 via-emerald-400 to-green-500 shadow-[0_0_14px_rgba(132,204,22,0.9)]",
  "/category/student": "bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 shadow-[0_0_14px_rgba(251,191,36,0.9)]",
  "/category/creator": "bg-gradient-to-b from-rose-400 via-orange-400 to-pink-500 shadow-[0_0_14px_rgba(244,63,94,0.9)]",
  "/category/business": "bg-gradient-to-b from-orange-400 via-amber-400 to-yellow-500 shadow-[0_0_14px_rgba(255,153,51,0.9)]",
  "/category/seo": "bg-gradient-to-b from-cyan-400 via-blue-400 to-indigo-500 shadow-[0_0_14px_rgba(34,211,238,0.9)]",
};

const CATEGORY_HOVER_STYLES: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  "/": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-purple-500/15 group-hover:via-purple-950/20 group-hover:to-transparent",
    border: "group-hover:border-purple-400/35",
    glow: "rgba(168,85,247,0.5)",
    text: "group-hover:text-purple-200"
  },
  "/shop": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-amber-500/15 group-hover:via-amber-950/20 group-hover:to-transparent",
    border: "group-hover:border-amber-400/35",
    glow: "rgba(245,158,11,0.5)",
    text: "group-hover:text-amber-200"
  },
  "/rewards": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-amber-500/15 group-hover:via-amber-950/20 group-hover:to-transparent",
    border: "group-hover:border-amber-400/35",
    glow: "rgba(245,158,11,0.5)",
    text: "group-hover:text-amber-200"
  },
  "/community": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-cyan-500/15 group-hover:via-purple-950/20 group-hover:to-transparent",
    border: "group-hover:border-cyan-400/35",
    glow: "rgba(34,211,238,0.5)",
    text: "group-hover:text-cyan-200"
  },
  "/giveaway": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-amber-500/20 group-hover:via-yellow-950/25 group-hover:to-transparent",
    border: "group-hover:border-amber-400/50",
    glow: "rgba(245,158,11,0.8)",
    text: "group-hover:text-amber-200"
  },
  "/favorites": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-yellow-500/15 group-hover:via-amber-950/20 group-hover:to-transparent",
    border: "group-hover:border-yellow-400/35",
    glow: "rgba(251,191,36,0.5)",
    text: "group-hover:text-yellow-200"
  },
  "/library": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-cyan-500/15 group-hover:via-indigo-950/20 group-hover:to-transparent",
    border: "group-hover:border-cyan-400/35",
    glow: "rgba(34,211,238,0.5)",
    text: "group-hover:text-cyan-200"
  },
  "/history": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-blue-500/15 group-hover:via-blue-950/20 group-hover:to-transparent",
    border: "group-hover:border-blue-400/35",
    glow: "rgba(96,165,250,0.5)",
    text: "group-hover:text-blue-200"
  },
  "/referrals": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-emerald-500/15 group-hover:via-emerald-950/20 group-hover:to-transparent",
    border: "group-hover:border-emerald-400/35",
    glow: "rgba(16,185,129,0.5)",
    text: "group-hover:text-emerald-200"
  },
  "/admin": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-rose-500/15 group-hover:via-rose-950/20 group-hover:to-transparent",
    border: "group-hover:border-rose-400/35",
    glow: "rgba(244,63,94,0.5)",
    text: "group-hover:text-rose-200"
  },
  "/changelog": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-purple-500/15 group-hover:via-indigo-950/20 group-hover:to-transparent",
    border: "group-hover:border-purple-400/35",
    glow: "rgba(168,85,247,0.5)",
    text: "group-hover:text-purple-200"
  },
  "/help": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-sky-500/15 group-hover:via-blue-950/20 group-hover:to-transparent",
    border: "group-hover:border-sky-400/35",
    glow: "rgba(14,165,233,0.5)",
    text: "group-hover:text-sky-200"
  },
  "/category/image": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-cyan-500/15 group-hover:via-cyan-950/20 group-hover:to-transparent",
    border: "group-hover:border-cyan-400/35",
    glow: "rgba(34,211,238,0.5)",
    text: "group-hover:text-cyan-200"
  },
  "/category/video": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-violet-500/15 group-hover:via-violet-950/20 group-hover:to-transparent",
    border: "group-hover:border-violet-400/35",
    glow: "rgba(139,92,246,0.5)",
    text: "group-hover:text-violet-200"
  },
  "/category/audio": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-pink-500/15 group-hover:via-pink-950/20 group-hover:to-transparent",
    border: "group-hover:border-pink-400/35",
    glow: "rgba(236,72,153,0.5)",
    text: "group-hover:text-pink-200"
  },
  "/category/pdf": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-red-500/15 group-hover:via-rose-950/20 group-hover:to-transparent",
    border: "group-hover:border-red-400/35",
    glow: "rgba(239,68,68,0.5)",
    text: "group-hover:text-red-200"
  },
  "/category/ai": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-amber-500/15 group-hover:via-amber-950/20 group-hover:to-transparent",
    border: "group-hover:border-amber-400/35",
    glow: "rgba(250,204,21,0.5)",
    text: "group-hover:text-amber-200"
  },
  "/category/productivity": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-emerald-500/15 group-hover:via-emerald-950/20 group-hover:to-transparent",
    border: "group-hover:border-emerald-400/35",
    glow: "rgba(16,185,129,0.5)",
    text: "group-hover:text-emerald-200"
  },
  "/category/developer": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-lime-500/15 group-hover:via-emerald-950/20 group-hover:to-transparent",
    border: "group-hover:border-lime-400/40",
    glow: "rgba(132,204,22,0.5)",
    text: "group-hover:text-lime-200"
  },
  "/category/student": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-amber-500/15 group-hover:via-amber-950/20 group-hover:to-transparent",
    border: "group-hover:border-amber-400/40",
    glow: "rgba(251,191,36,0.5)",
    text: "group-hover:text-amber-200"
  },
  "/category/creator": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-rose-500/15 group-hover:via-pink-950/20 group-hover:to-transparent",
    border: "group-hover:border-rose-400/40",
    glow: "rgba(244,63,94,0.5)",
    text: "group-hover:text-rose-200"
  },
  "/category/business": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-orange-500/15 group-hover:via-amber-950/20 group-hover:to-transparent",
    border: "group-hover:border-orange-400/40",
    glow: "rgba(255,153,51,0.5)",
    text: "group-hover:text-orange-200"
  },
  "/category/seo": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-cyan-500/15 group-hover:via-blue-950/20 group-hover:to-transparent",
    border: "group-hover:border-cyan-400/40",
    glow: "rgba(34,211,238,0.5)",
    text: "group-hover:text-cyan-200"
  },
};

const CATEGORY_ACTIVE_BG_STYLES: Record<string, string> = {
  "/": "bg-gradient-to-r from-purple-600/20 via-purple-900/15 to-transparent border border-purple-400/30 shadow-[0_4px_20px_rgba(168,85,247,0.2)]",
  "/shop": "bg-gradient-to-r from-amber-500/20 via-orange-950/25 to-transparent border border-amber-400/35 shadow-[0_4px_25px_rgba(245,158,11,0.2)]",
  "/rewards": "bg-gradient-to-r from-amber-500/20 via-orange-950/25 to-transparent border border-amber-400/35 shadow-[0_4px_25px_rgba(245,158,11,0.2)]",
  "/community": "bg-gradient-to-r from-cyan-500/20 via-purple-950/25 to-transparent border border-cyan-400/35 shadow-[0_4px_25px_rgba(34,211,238,0.2)]",
  "/giveaway": "bg-gradient-to-r from-amber-500/25 via-yellow-950/25 to-transparent border border-amber-400/40 shadow-[0_4px_25px_rgba(245,158,11,0.25)]",
  "/favorites": "bg-gradient-to-r from-yellow-500/20 via-amber-950/25 to-transparent border border-yellow-400/35 shadow-[0_4px_25px_rgba(251,191,36,0.2)]",
  "/library": "bg-gradient-to-r from-cyan-500/20 via-indigo-950/25 to-transparent border border-cyan-400/35 shadow-[0_4px_25px_rgba(34,211,238,0.2)]",
  "/history": "bg-gradient-to-r from-blue-500/20 via-indigo-950/25 to-transparent border border-blue-400/35 shadow-[0_4px_25px_rgba(96,165,250,0.2)]",
  "/referrals": "bg-gradient-to-r from-emerald-500/20 via-teal-950/25 to-transparent border border-emerald-400/35 shadow-[0_4px_25px_rgba(16,185,129,0.2)]",
  "/admin": "bg-gradient-to-r from-rose-500/20 via-red-950/25 to-transparent border border-rose-400/35 shadow-[0_4px_25px_rgba(244,63,94,0.2)]",
  "/pro": "bg-gradient-to-r from-purple-600/20 via-purple-900/15 to-transparent border border-purple-400/25 shadow-[0_4px_20px_rgba(168,85,247,0.18)]",
  "/changelog": "bg-gradient-to-r from-purple-600/20 via-indigo-950/25 to-transparent border border-purple-400/35 shadow-[0_4px_25px_rgba(168,85,247,0.2)]",
  "/help": "bg-gradient-to-r from-sky-500/20 via-blue-950/25 to-transparent border border-sky-400/35 shadow-[0_4px_25px_rgba(14,165,233,0.2)]",

  "/category/image": "bg-gradient-to-r from-cyan-500/20 via-sky-950/25 to-transparent border border-cyan-400/40 shadow-[0_4px_20px_rgba(34,211,238,0.25)]",
  "/category/video": "bg-gradient-to-r from-violet-600/20 via-purple-950/25 to-transparent border border-violet-400/40 shadow-[0_4px_20px_rgba(139,92,246,0.25)]",
  "/category/audio": "bg-gradient-to-r from-pink-500/20 via-rose-950/25 to-transparent border border-pink-400/40 shadow-[0_4px_20px_rgba(236,72,153,0.25)]",
  "/category/pdf": "bg-gradient-to-r from-red-500/20 via-rose-950/25 to-transparent border border-red-400/40 shadow-[0_4px_20px_rgba(239,68,68,0.25)]",
  "/category/ai": "bg-gradient-to-r from-amber-500/20 via-yellow-950/25 to-transparent border border-amber-400/40 shadow-[0_4px_20px_rgba(245,158,11,0.25)]",
  "/category/productivity": "bg-gradient-to-r from-emerald-500/20 via-teal-950/25 to-transparent border border-emerald-400/40 shadow-[0_4px_20px_rgba(16,185,129,0.25)]",
  "/category/developer": "bg-gradient-to-r from-lime-500/20 via-emerald-950/25 to-transparent border border-lime-400/40 shadow-[0_4px_20px_rgba(132,204,22,0.25)]",
  "/category/student": "bg-gradient-to-r from-amber-500/20 via-amber-950/25 to-transparent border border-amber-400/40 shadow-[0_4px_20px_rgba(251,191,36,0.25)]",
  "/category/creator": "bg-gradient-to-r from-rose-500/20 via-pink-950/25 to-transparent border border-rose-400/40 shadow-[0_4px_20px_rgba(244,63,94,0.25)]",
  "/category/business": "bg-gradient-to-r from-orange-500/20 via-amber-950/25 to-transparent border border-orange-400/40 shadow-[0_4px_20px_rgba(255,153,51,0.25)]",
  "/category/seo": "bg-gradient-to-r from-cyan-500/20 via-blue-950/25 to-transparent border border-cyan-400/40 shadow-[0_4px_20px_rgba(34,211,238,0.25)]",
};

const ITEM_ICON_STYLES: Record<string, {
  borderGrad: string;
  glowPool: string;
  icon: string;
  activeBorderGrad: string;
  activeGlowPool: string;
  activeIcon: string;
  ambientGlow: string;
}> = {
  "/": {
    borderGrad: "from-violet-400/50 via-purple-500/15 to-transparent group-hover:from-violet-400 group-hover:via-purple-500/40",
    glowPool: "from-violet-600/35 via-indigo-600/20 to-transparent",
    icon: "text-violet-300 fill-violet-400/15 drop-shadow-[0_0_10px_rgba(167,139,250,0.95)]",
    activeBorderGrad: "from-violet-400 via-purple-400 to-indigo-500",
    activeGlowPool: "from-violet-600/70 via-purple-600/45 to-indigo-900/60",
    activeIcon: "text-violet-200 fill-violet-300/35 drop-shadow-[0_0_14px_rgba(167,139,250,1)]",
    ambientGlow: "rgba(139,92,246,0.7)"
  },
  "/shop": {
    borderGrad: "from-orange-500/50 via-amber-500/15 to-transparent group-hover:from-orange-400 group-hover:via-amber-500/40",
    glowPool: "from-orange-500/35 via-amber-600/20 to-transparent",
    icon: "text-orange-400 fill-orange-500/20 drop-shadow-[0_0_10px_rgba(251,146,60,0.95)]",
    activeBorderGrad: "from-orange-400 via-amber-400 to-red-500",
    activeGlowPool: "from-orange-500/70 via-amber-600/45 to-red-900/60",
    activeIcon: "text-orange-200 fill-orange-400/40 drop-shadow-[0_0_14px_rgba(251,146,60,1)]",
    ambientGlow: "rgba(249,115,22,0.7)"
  },
  "/rewards": {
    borderGrad: "from-amber-400/60 via-yellow-500/25 to-transparent group-hover:from-amber-300 group-hover:via-yellow-500/50",
    glowPool: "from-amber-500/50 via-yellow-600/30 to-orange-900/20",
    icon: "text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,1)]",
    activeBorderGrad: "from-amber-300 via-yellow-400 to-orange-500",
    activeGlowPool: "from-amber-500/80 via-yellow-600/60 to-orange-900/70",
    activeIcon: "text-amber-200 drop-shadow-[0_0_14px_rgba(251,191,36,1)]",
    ambientGlow: "rgba(245,158,11,0.85)"
  },
  "/community": {
    borderGrad: "from-cyan-400/50 via-purple-500/15 to-transparent group-hover:from-cyan-400 group-hover:via-purple-500/40",
    glowPool: "from-cyan-500/35 via-purple-600/20 to-transparent",
    icon: "text-cyan-300 fill-cyan-400/15 drop-shadow-[0_0_10px_rgba(34,211,238,0.95)]",
    activeBorderGrad: "from-cyan-300 via-purple-400 to-pink-500",
    activeGlowPool: "from-cyan-500/70 via-purple-600/45 to-pink-900/60",
    activeIcon: "text-cyan-200 fill-cyan-400/30 drop-shadow-[0_0_14px_rgba(34,211,238,1)]",
    ambientGlow: "rgba(34,211,238,0.7)"
  },
  "/giveaway": {
    borderGrad: "from-amber-400/60 via-yellow-500/25 to-transparent group-hover:from-amber-300 group-hover:via-yellow-500/50",
    glowPool: "from-amber-500/50 via-yellow-600/30 to-orange-900/20",
    icon: "text-amber-300 fill-amber-400/20 drop-shadow-[0_0_12px_rgba(245,158,11,1)]",
    activeBorderGrad: "from-amber-300 via-yellow-400 to-orange-500",
    activeGlowPool: "from-amber-500/80 via-yellow-600/60 to-orange-900/70",
    activeIcon: "text-amber-200 fill-amber-300/35 drop-shadow-[0_0_16px_rgba(251,191,36,1)]",
    ambientGlow: "rgba(245,158,11,0.85)"
  },
  "/favorites": {
    borderGrad: "from-yellow-300/55 via-amber-400/15 to-transparent group-hover:from-yellow-300 group-hover:via-amber-400/40",
    glowPool: "from-yellow-400/35 via-amber-500/20 to-transparent",
    icon: "text-yellow-300 fill-yellow-300/25 drop-shadow-[0_0_10px_rgba(253,224,71,1)]",
    activeBorderGrad: "from-yellow-300 via-amber-400 to-yellow-500",
    activeGlowPool: "from-yellow-400/70 via-amber-500/45 to-yellow-900/60",
    activeIcon: "text-yellow-200 fill-yellow-300/50 drop-shadow-[0_0_14px_rgba(253,224,71,1)]",
    ambientGlow: "rgba(250,204,21,0.75)"
  },
  "/library": {
    borderGrad: "from-cyan-400/50 via-indigo-500/15 to-transparent group-hover:from-cyan-300 group-hover:via-indigo-500/40",
    glowPool: "from-cyan-500/35 via-indigo-600/20 to-transparent",
    icon: "text-cyan-400 fill-cyan-500/15 drop-shadow-[0_0_10px_rgba(34,211,238,0.95)]",
    activeBorderGrad: "from-cyan-300 via-indigo-400 to-purple-500",
    activeGlowPool: "from-cyan-400/70 via-indigo-500/45 to-purple-900/60",
    activeIcon: "text-cyan-200 fill-cyan-400/30 drop-shadow-[0_0_14px_rgba(34,211,238,1)]",
    ambientGlow: "rgba(34,211,238,0.7)"
  },
  "/history": {
    borderGrad: "from-blue-500/50 via-sky-500/15 to-transparent group-hover:from-blue-400 group-hover:via-sky-500/40",
    glowPool: "from-blue-600/35 via-sky-600/20 to-transparent",
    icon: "text-blue-400 fill-blue-500/15 drop-shadow-[0_0_10px_rgba(96,165,250,0.95)]",
    activeBorderGrad: "from-blue-400 via-sky-400 to-indigo-500",
    activeGlowPool: "from-blue-500/70 via-indigo-600/45 to-sky-900/60",
    activeIcon: "text-blue-200 fill-blue-400/30 drop-shadow-[0_0_14px_rgba(96,165,250,1)]",
    ambientGlow: "rgba(59,130,246,0.7)"
  },
  "/referrals": {
    borderGrad: "from-emerald-400/50 via-teal-500/15 to-transparent group-hover:from-emerald-300 group-hover:via-teal-500/40",
    glowPool: "from-emerald-500/35 via-teal-600/20 to-transparent",
    icon: "text-emerald-400 fill-emerald-500/15 drop-shadow-[0_0_10px_rgba(52,211,153,0.95)]",
    activeBorderGrad: "from-emerald-400 via-teal-400 to-green-500",
    activeGlowPool: "from-emerald-400/70 via-teal-500/45 to-green-900/60",
    activeIcon: "text-emerald-200 fill-emerald-400/30 drop-shadow-[0_0_14px_rgba(52,211,153,1)]",
    ambientGlow: "rgba(16,185,129,0.7)"
  },
  "/admin": {
    borderGrad: "from-rose-500/50 via-red-500/15 to-transparent group-hover:from-rose-400 group-hover:via-red-500/40",
    glowPool: "from-rose-600/35 via-red-600/20 to-transparent",
    icon: "text-rose-400 fill-rose-500/15 drop-shadow-[0_0_10px_rgba(244,63,94,0.95)]",
    activeBorderGrad: "from-rose-400 via-red-400 to-pink-500",
    activeGlowPool: "from-rose-500/70 via-red-600/45 to-pink-900/60",
    activeIcon: "text-rose-200 fill-rose-400/30 drop-shadow-[0_0_14px_rgba(244,63,94,1)]",
    ambientGlow: "rgba(244,63,94,0.7)"
  },
  "/changelog": {
    borderGrad: "from-purple-400/50 via-indigo-500/15 to-transparent group-hover:from-purple-300 group-hover:via-indigo-500/40",
    glowPool: "from-purple-500/35 via-indigo-600/20 to-transparent",
    icon: "text-purple-300 fill-purple-400/15 drop-shadow-[0_0_10px_rgba(168,85,247,0.95)]",
    activeBorderGrad: "from-purple-400 via-indigo-400 to-cyan-500",
    activeGlowPool: "from-purple-500/70 via-indigo-600/45 to-cyan-900/60",
    activeIcon: "text-purple-200 fill-purple-400/30 drop-shadow-[0_0_14px_rgba(168,85,247,1)]",
    ambientGlow: "rgba(168,85,247,0.7)"
  },
  "/help": {
    borderGrad: "from-sky-400/50 via-blue-500/15 to-transparent group-hover:from-sky-300 group-hover:via-blue-500/40",
    glowPool: "from-sky-500/35 via-blue-600/20 to-transparent",
    icon: "text-sky-300 fill-sky-400/15 drop-shadow-[0_0_10px_rgba(56,189,248,0.95)]",
    activeBorderGrad: "from-sky-400 via-blue-400 to-indigo-500",
    activeGlowPool: "from-sky-500/70 via-blue-600/45 to-indigo-900/60",
    activeIcon: "text-sky-200 fill-sky-400/30 drop-shadow-[0_0_14px_rgba(56,189,248,1)]",
    ambientGlow: "rgba(14,165,233,0.7)"
  },
  "/category/image": {
    borderGrad: "from-cyan-400/50 via-teal-500/15 to-transparent group-hover:from-cyan-300 group-hover:via-teal-500/40",
    glowPool: "from-cyan-400/35 via-sky-500/20 to-transparent",
    icon: "text-cyan-300 fill-cyan-400/15 drop-shadow-[0_0_10px_rgba(34,211,238,0.95)]",
    activeBorderGrad: "from-cyan-300 via-sky-400 to-blue-500",
    activeGlowPool: "from-cyan-400/70 via-sky-500/45 to-blue-900/60",
    activeIcon: "text-cyan-200 fill-cyan-400/35 drop-shadow-[0_0_14px_rgba(34,211,238,1)]",
    ambientGlow: "rgba(6,182,212,0.75)"
  },
  "/category/video": {
    borderGrad: "from-violet-500/50 via-purple-500/15 to-transparent group-hover:from-violet-400 group-hover:via-purple-500/40",
    glowPool: "from-violet-500/35 via-purple-600/20 to-transparent",
    icon: "text-violet-300 fill-violet-500/15 drop-shadow-[0_0_10px_rgba(139,92,246,0.95)]",
    activeBorderGrad: "from-violet-400 via-purple-400 to-indigo-500",
    activeGlowPool: "from-violet-500/70 via-purple-600/45 to-indigo-900/60",
    activeIcon: "text-violet-200 fill-violet-400/35 drop-shadow-[0_0_14px_rgba(139,92,246,1)]",
    ambientGlow: "rgba(139,92,246,0.75)"
  },
  "/category/audio": {
    borderGrad: "from-pink-500/50 via-rose-500/15 to-transparent group-hover:from-pink-400 group-hover:via-rose-500/40",
    glowPool: "from-pink-500/35 via-rose-500/20 to-transparent",
    icon: "text-pink-400 fill-pink-500/15 drop-shadow-[0_0_10px_rgba(236,72,153,0.95)]",
    activeBorderGrad: "from-pink-400 via-rose-400 to-purple-500",
    activeGlowPool: "from-pink-500/70 via-rose-500/45 to-purple-900/60",
    activeIcon: "text-pink-200 fill-pink-400/35 drop-shadow-[0_0_14px_rgba(236,72,153,1)]",
    ambientGlow: "rgba(236,72,153,0.75)"
  },
  "/category/pdf": {
    borderGrad: "from-red-500/50 via-rose-500/15 to-transparent group-hover:from-red-400 group-hover:via-rose-500/40",
    glowPool: "from-red-500/35 via-rose-600/20 to-transparent",
    icon: "text-red-400 fill-red-500/15 drop-shadow-[0_0_10px_rgba(239,68,68,0.95)]",
    activeBorderGrad: "from-red-400 via-rose-500 to-amber-500",
    activeGlowPool: "from-red-500/70 via-rose-600/45 to-amber-900/60",
    activeIcon: "text-red-200 fill-red-400/35 drop-shadow-[0_0_14px_rgba(239,68,68,1)]",
    ambientGlow: "rgba(239,68,68,0.75)"
  },
  "/category/ai": {
    borderGrad: "from-amber-300/60 via-yellow-400/20 to-transparent group-hover:from-amber-200 group-hover:via-yellow-300/50",
    glowPool: "from-amber-400/40 via-yellow-500/25 to-purple-900/20",
    icon: "text-amber-200 fill-amber-300/25 drop-shadow-[0_0_12px_rgba(254,240,138,1)]",
    activeBorderGrad: "from-amber-300 via-yellow-300 to-purple-400",
    activeGlowPool: "from-amber-400/75 via-yellow-500/50 to-purple-900/60",
    activeIcon: "text-white fill-white/60 drop-shadow-[0_0_16px_rgba(255,255,255,1)]",
    ambientGlow: "rgba(245,158,11,0.85)"
  },
  "/category/productivity": {
    borderGrad: "from-emerald-400/50 via-teal-500/15 to-transparent group-hover:from-emerald-300 group-hover:via-teal-500/40",
    glowPool: "from-emerald-400/35 via-teal-500/20 to-transparent",
    icon: "text-emerald-300 fill-emerald-400/15 drop-shadow-[0_0_10px_rgba(16,185,129,0.95)]",
    activeBorderGrad: "from-emerald-400 via-teal-400 to-green-500",
    activeGlowPool: "from-emerald-400/70 via-teal-500/45 to-green-900/60",
    activeIcon: "text-emerald-200 fill-emerald-400/35 drop-shadow-[0_0_14px_rgba(16,185,129,1)]",
    ambientGlow: "rgba(16,185,129,0.7)"
  },
  "/category/developer": {
    borderGrad: "from-lime-400/50 via-green-500/15 to-transparent group-hover:from-lime-300 group-hover:via-green-500/40",
    glowPool: "from-lime-400/35 via-green-500/20 to-transparent",
    icon: "text-lime-300 fill-lime-400/15 drop-shadow-[0_0_10px_rgba(132,204,22,0.95)]",
    activeBorderGrad: "from-lime-400 via-emerald-400 to-green-500",
    activeGlowPool: "from-lime-400/70 via-green-500/45 to-emerald-900/60",
    activeIcon: "text-lime-200 fill-lime-400/35 drop-shadow-[0_0_14px_rgba(132,204,22,1)]",
    ambientGlow: "rgba(132,204,22,0.7)"
  },
  "/category/student": {
    borderGrad: "from-amber-400/50 via-yellow-500/15 to-transparent group-hover:from-amber-300 group-hover:via-yellow-500/40",
    glowPool: "from-amber-400/35 via-yellow-500/20 to-transparent",
    icon: "text-amber-300 fill-amber-400/15 drop-shadow-[0_0_10px_rgba(251,191,36,0.95)]",
    activeBorderGrad: "from-amber-300 via-yellow-400 to-amber-500",
    activeGlowPool: "from-amber-400/70 via-yellow-500/45 to-amber-900/60",
    activeIcon: "text-amber-200 fill-amber-300/35 drop-shadow-[0_0_14px_rgba(251,191,36,1)]",
    ambientGlow: "rgba(251,191,36,0.75)"
  },
  "/category/creator": {
    borderGrad: "from-rose-400/50 via-orange-400/15 to-transparent group-hover:from-rose-300 group-hover:via-orange-400/40",
    glowPool: "from-rose-400/35 via-orange-400/20 to-transparent",
    icon: "text-rose-300 fill-rose-400/15 drop-shadow-[0_0_10px_rgba(251,113,133,0.95)]",
    activeBorderGrad: "from-rose-400 via-orange-400 to-pink-500",
    activeGlowPool: "from-rose-400/70 via-orange-400/45 to-pink-900/60",
    activeIcon: "text-rose-200 fill-rose-400/35 drop-shadow-[0_0_14px_rgba(251,113,133,1)]",
    ambientGlow: "rgba(244,63,94,0.7)"
  },
  "/category/business": {
    borderGrad: "from-orange-400/50 via-amber-500/15 to-transparent group-hover:from-orange-300 group-hover:via-amber-500/40",
    glowPool: "from-orange-400/35 via-amber-500/20 to-transparent",
    icon: "text-orange-300 fill-orange-400/15 drop-shadow-[0_0_10px_rgba(255,153,51,0.95)]",
    activeBorderGrad: "from-orange-400 via-amber-400 to-yellow-500",
    activeGlowPool: "from-orange-400/70 via-amber-500/45 to-yellow-900/60",
    activeIcon: "text-orange-200 fill-orange-400/35 drop-shadow-[0_0_14px_rgba(255,153,51,1)]",
    ambientGlow: "rgba(255,153,51,0.7)"
  },
  "/category/seo": {
    borderGrad: "from-cyan-400/50 via-blue-500/15 to-transparent group-hover:from-cyan-300 group-hover:via-blue-500/40",
    glowPool: "from-cyan-400/35 via-blue-500/20 to-transparent",
    icon: "text-cyan-300 fill-cyan-400/15 drop-shadow-[0_0_10px_rgba(34,211,238,0.95)]",
    activeBorderGrad: "from-cyan-400 via-blue-400 to-indigo-500",
    activeGlowPool: "from-cyan-400/70 via-blue-500/45 to-indigo-900/60",
    activeIcon: "text-cyan-200 fill-cyan-400/35 drop-shadow-[0_0_14px_rgba(34,211,238,1)]",
    ambientGlow: "rgba(34,211,238,0.7)"
  },
};

function SidebarItem({ name, icon: Icon, href, isActive, glowColor = "rgba(124, 58, 237, 0.5)", onClick, isCompact, rightElement }: SidebarItemProps) {
  const indicatorGradient = CATEGORY_INDICATOR_GRADIENTS[href] || "bg-gradient-to-b from-purple-400 via-pink-400 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]";
  const hoverStyle = CATEGORY_HOVER_STYLES[href] || {
    bg: "group-hover:bg-gradient-to-r group-hover:from-purple-500/10 group-hover:via-white/[0.02] group-hover:to-transparent",
    border: "group-hover:border-purple-400/30",
    glow: glowColor,
    text: "group-hover:text-purple-200"
  };

  const iconStyle = ITEM_ICON_STYLES[href] || {
    borderGrad: "from-purple-400/40 via-purple-500/10 to-transparent group-hover:from-purple-400 group-hover:via-purple-500/30",
    glowPool: "from-purple-500/25 via-indigo-600/15 to-transparent",
    icon: "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]",
    activeBorderGrad: "from-purple-400 via-purple-400 to-indigo-500",
    activeGlowPool: "from-purple-500/50 via-indigo-600/35 to-purple-900/40",
    activeIcon: "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]",
    ambientGlow: "rgba(168,85,247,0.5)"
  };

  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative h-[42px] flex items-center rounded-xl transition-all duration-200 group mb-1",
          isCompact ? "justify-center w-[44px] mx-auto px-0" : "gap-2.5 px-3",
          isActive ? "text-white" : "text-zinc-400 hover:text-white"
        )}
      >
        {/* Active Background - Luminous Glassmorphic Depth */}
        {isActive && (
          <motion.div 
            layoutId="sidebarActiveBg"
            className={cn(
              "absolute inset-0 backdrop-blur-xl rounded-xl -z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
              CATEGORY_ACTIVE_BG_STYLES[href] || "bg-gradient-to-r from-purple-600/15 via-purple-900/10 to-transparent border border-purple-400/25 shadow-[0_4px_16px_rgba(168,85,247,0.15)]"
            )}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          />
        )}
        
        {/* Hover Highlight Pill for Inactive */}
        {!isActive && (
          <div className={cn(
            "absolute inset-0 rounded-xl border border-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 -z-20 shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
            hoverStyle.bg,
            hoverStyle.border
          )} />
        )}

        {/* Active Left Accent Bar */}
        {isActive && (
          <motion.div 
            layoutId="sidebarActiveBar"
            className={cn("absolute left-0 w-1 h-4.5 rounded-r-full z-20", indicatorGradient)}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          />
        )}

        {/* Inactive Hover Indicator */}
        {!isActive && (
          <div className={cn(
            "absolute left-0 w-0.5 h-3.5 rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-20",
            indicatorGradient
          )} />
        )}

        {/* Sleek Glass Icon Capsule */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div
            className={cn(
              "w-7.5 h-7.5 rounded-[10px] p-[1px] transition-all duration-300 relative select-none flex items-center justify-center",
              isActive
                ? cn(
                    "bg-gradient-to-br shadow-[0_0_16px_rgba(168,85,247,0.3)]",
                    iconStyle.activeBorderGrad
                  )
                : cn("bg-gradient-to-br group-hover:scale-105", iconStyle.borderGrad)
            )}
          >
            {/* Inner Glass Chamber */}
            <div className="relative w-full h-full rounded-[9px] bg-[#090a10]/90 flex items-center justify-center overflow-hidden border border-white/[0.04]">
              {/* Subtle ambient neon pool */}
              <div 
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br transition-opacity duration-300",
                  isActive ? cn(iconStyle.activeGlowPool, "opacity-100") : cn(iconStyle.glowPool, "opacity-40 group-hover:opacity-75")
                )} 
              />

              {/* Icon */}
              <Icon 
                size={15} 
                className={cn(
                  "relative z-20 transition-transform duration-200 group-hover:scale-110", 
                  isActive ? iconStyle.activeIcon : iconStyle.icon
                )} 
              />
            </div>
          </div>
          
          {/* Subtle Ambient Pulse Bloom */}
          <div 
            className={cn(
              "absolute inset-0 blur-md transition-opacity duration-300 -z-10 rounded-full pointer-events-none",
              isActive ? "opacity-60 scale-125" : "opacity-0 group-hover:opacity-40 scale-110"
            )}
            style={{ backgroundColor: iconStyle.ambientGlow }} 
          />
        </div>

        {!isCompact && (
          <span 
            className={cn(
              "text-[12.5px] font-bold tracking-tight transition-all duration-200 whitespace-nowrap overflow-hidden min-w-0 flex-1 select-none",
              isActive ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" : "text-zinc-300 group-hover:text-white"
            )}
          >
            {name === 'Go Pro' ? <GradientText className="text-[12.5px] font-bold tracking-tight">{name}</GradientText> : name}
          </span>
        )}
        
        {!isCompact && rightElement && (
          <div className="ml-auto shrink-0 relative z-30 flex items-center">
            {rightElement}
          </div>
        )}

        {isActive && !isCompact && !rightElement && (
          <motion.div 
            initial={{ opacity: 0, x: -3 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-auto text-purple-400/80 group-hover:text-purple-300 transition-colors"
          >
            <ChevronRight size={13} />
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
}

interface CategoryDropdownProps {
  category: Category;
  catName: string;
  pathname: string;
  catGlow: string;
  isCompact?: boolean;
}

const CATEGORY_VIEW_ALL_STYLES: Record<string, { bg: string; border: string; text: string; hoverShadow: string }> = {
  pdf: {
    bg: "bg-red-500/10 hover:bg-red-500/20",
    border: "border-red-500/30 hover:border-red-400/60",
    text: "text-red-300 group-hover/viewall:text-red-200",
    hoverShadow: "shadow-[0_0_15px_rgba(239,68,68,0.25)]"
  },
  image: {
    bg: "bg-cyan-500/10 hover:bg-cyan-500/20",
    border: "border-cyan-500/30 hover:border-cyan-400/60",
    text: "text-cyan-300 group-hover/viewall:text-cyan-200",
    hoverShadow: "shadow-[0_0_15px_rgba(6,182,212,0.25)]"
  },
  audio: {
    bg: "bg-pink-500/10 hover:bg-pink-500/20",
    border: "border-pink-500/30 hover:border-pink-400/60",
    text: "text-pink-300 group-hover/viewall:text-pink-200",
    hoverShadow: "shadow-[0_0_15px_rgba(236,72,153,0.25)]"
  },
  video: {
    bg: "bg-violet-500/10 hover:bg-violet-500/20",
    border: "border-violet-500/30 hover:border-violet-400/60",
    text: "text-violet-300 group-hover/viewall:text-violet-200",
    hoverShadow: "shadow-[0_0_15px_rgba(139,92,246,0.25)]"
  },
  ai: {
    bg: "bg-amber-500/10 hover:bg-amber-500/20",
    border: "border-amber-500/30 hover:border-amber-400/60",
    text: "text-amber-300 group-hover/viewall:text-amber-200",
    hoverShadow: "shadow-[0_0_15px_rgba(245,158,11,0.25)]"
  },
  productivity: {
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20",
    border: "border-emerald-500/30 hover:border-emerald-400/60",
    text: "text-emerald-300 group-hover/viewall:text-emerald-200",
    hoverShadow: "shadow-[0_0_15px_rgba(16,185,129,0.25)]"
  },
  business: {
    bg: "bg-orange-500/10 hover:bg-orange-500/20",
    border: "border-orange-500/30 hover:border-orange-400/60",
    text: "text-orange-300 group-hover/viewall:text-orange-200",
    hoverShadow: "shadow-[0_0_15px_rgba(255,153,51,0.25)]"
  },
  seo: {
    bg: "bg-cyan-500/10 hover:bg-cyan-500/20",
    border: "border-cyan-500/30 hover:border-cyan-400/60",
    text: "text-cyan-300 group-hover/viewall:text-cyan-200",
    hoverShadow: "shadow-[0_0_15px_rgba(34,211,238,0.25)]"
  },
  developer: {
    bg: "bg-lime-500/10 hover:bg-lime-500/20",
    border: "border-lime-500/30 hover:border-lime-400/60",
    text: "text-lime-300 group-hover/viewall:text-lime-200",
    hoverShadow: "shadow-[0_0_15px_rgba(163,230,53,0.25)]"
  },
  student: {
    bg: "bg-amber-500/10 hover:bg-amber-500/20",
    border: "border-amber-500/30 hover:border-amber-400/60",
    text: "text-amber-300 group-hover/viewall:text-amber-200",
    hoverShadow: "shadow-[0_0_15px_rgba(251,191,36,0.25)]"
  },
  creator: {
    bg: "bg-rose-500/10 hover:bg-rose-500/20",
    border: "border-rose-500/30 hover:border-rose-400/60",
    text: "text-rose-300 group-hover/viewall:text-rose-200",
    hoverShadow: "shadow-[0_0_15px_rgba(244,63,94,0.25)]"
  }
};

function CategoryDropdown({ category, catName, pathname, catGlow, isCompact }: CategoryDropdownProps) {
  const Icon = ICON_MAP[category.icon] || Sparkles;
  
  const allCategoryTools = useMemo(() => {
    return TOOLS.filter(t => t.category === category.id);
  }, [category.id]);

  const categoryTools = useMemo(() => {
    return [...allCategoryTools].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0)).slice(0, 3);
  }, [allCategoryTools]);

  const totalToolCount = allCategoryTools.length;
  const viewStyle = CATEGORY_VIEW_ALL_STYLES[category.id] || CATEGORY_VIEW_ALL_STYLES.student;

  const isCategoryActive = pathname === `/category/${category.id}` || allCategoryTools.some(t => pathname === t.href);
  const [isOpen, setIsOpen] = useState(isCategoryActive);

  useEffect(() => {
    if (isCategoryActive) setIsOpen(true);
  }, [isCategoryActive]);

  if (isCompact) {
    return (
      <SidebarItem 
        name={catName}
        icon={Icon}
        href={`/category/${category.id}`}
        isActive={isCategoryActive}
        glowColor={catGlow}
        isCompact={true}
      />
    );
  }

  return (
    <div className="relative group/cat space-y-0.5">
      <SidebarItem 
        name={catName}
        icon={Icon}
        href={`/category/${category.id}`}
        isActive={isCategoryActive}
        glowColor={catGlow}
        isCompact={false}
        rightElement={
          <div className="flex items-center gap-1.5">
            {totalToolCount > 0 && (
              <span className={cn(
                "text-[9.5px] font-bold rounded-md px-1.5 py-0.5 leading-none transition-all duration-200",
                isCategoryActive
                  ? (
                      category.id === "developer" ? "text-lime-300 bg-lime-500/15 border border-lime-400/30" :
                      category.id === "image" ? "text-cyan-300 bg-cyan-500/15 border border-cyan-400/30" :
                      category.id === "video" ? "text-violet-300 bg-violet-500/15 border border-violet-400/30" :
                      category.id === "audio" ? "text-pink-300 bg-pink-500/15 border border-pink-400/30" :
                      category.id === "pdf" ? "text-red-300 bg-red-500/15 border border-red-400/30" :
                      category.id === "ai" ? "text-amber-300 bg-amber-500/15 border border-amber-400/30" :
                      category.id === "productivity" ? "text-emerald-300 bg-emerald-500/15 border border-emerald-400/30" :
                      category.id === "student" ? "text-amber-300 bg-amber-500/15 border border-amber-400/30" :
                      category.id === "creator" ? "text-rose-300 bg-rose-500/15 border border-rose-400/30" :
                      category.id === "business" ? "text-orange-300 bg-orange-500/15 border border-orange-400/30" :
                      category.id === "seo" ? "text-cyan-300 bg-cyan-500/15 border border-cyan-400/30" :
                      "text-purple-300 bg-purple-500/15 border border-purple-400/30"
                    )
                  : "text-zinc-400 group-hover/cat:text-zinc-300 bg-white/[0.04] border border-white/[0.06]"
              )}>
                {totalToolCount}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen((prev) => !prev);
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer active:scale-90"
              aria-label={`Toggle ${catName} tools`}
            >
              <ChevronDown
                size={13}
                className={cn(
                  "transition-transform duration-200",
                  isOpen && "rotate-180",
                  isOpen && (
                    category.id === "developer" ? "text-lime-300" :
                    category.id === "image" ? "text-cyan-300" :
                    category.id === "video" ? "text-violet-300" :
                    category.id === "audio" ? "text-pink-300" :
                    category.id === "pdf" ? "text-red-400" :
                    category.id === "ai" ? "text-amber-300" :
                    category.id === "productivity" ? "text-emerald-300" :
                    category.id === "student" ? "text-amber-300" :
                    category.id === "creator" ? "text-rose-300" :
                    category.id === "business" ? "text-orange-300" :
                    category.id === "seo" ? "text-cyan-300" : "text-purple-300"
                  )
                )}
              />
            </button>
          </div>
        }
      />

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn(
              "overflow-hidden pl-3.5 pr-1 space-y-1 border-l ml-5 my-1",
              category.id === "developer" ? "border-lime-500/25" :
              category.id === "image" ? "border-cyan-500/25" :
              category.id === "video" ? "border-violet-500/25" :
              category.id === "audio" ? "border-pink-500/25" :
              category.id === "pdf" ? "border-red-500/25" :
              category.id === "ai" ? "border-amber-500/25" :
              category.id === "productivity" ? "border-emerald-500/25" :
              category.id === "student" ? "border-amber-500/25" :
              category.id === "creator" ? "border-rose-500/25" :
              category.id === "business" ? "border-orange-500/25" :
              category.id === "seo" ? "border-cyan-500/25" : "border-purple-500/25"
            )}
          >
            {categoryTools.map((tool) => {
              const ToolIcon = ICON_MAP[tool.icon] || Sparkles;
              const isToolActive = pathname === tool.href;

              return (
                <Link key={tool.id} href={tool.href}>
                  <div className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all duration-150 group/tool select-none",
                    isToolActive
                      ? "bg-purple-500/15 text-white border border-purple-400/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  )}>
                    <ToolIcon size={13} className={cn("shrink-0 transition-transform group-hover/tool:scale-110", isToolActive ? "text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]" : "text-zinc-500 group-hover/tool:text-purple-300")} />
                    <span className="truncate">{tool.name}</span>
                  </div>
                </Link>
              );
            })}

            <Link href={`/category/${category.id}`}>
              <div className={cn(
                "relative overflow-hidden flex items-center justify-between px-3 py-1.5 mt-1.5 rounded-lg border text-[9.5px] font-black uppercase tracking-[0.15em] transition-all duration-200 group/viewall",
                viewStyle.bg,
                viewStyle.border,
                viewStyle.text,
                "hover:scale-[1.01] active:scale-[0.99]",
                viewStyle.hoverShadow
              )}>
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_3s_linear_infinite]" />
                <span className="relative z-10">
                  View All ({totalToolCount})
                </span>
                <ArrowRight size={11} className="relative z-10 transition-transform group-hover/viewall:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isCompact, toggleCompact, isFocusMode, setCompact, isMobileOpen, setMobileOpen } = useSidebarStore();
  const { isPro, user: dbUser, isLoading: isProLoading } = usePro();
  const { credits, loading: isCreditsLoading, dailyStreak, countdown } = useCredits();
  const [session, setSession] = useState<Session | null>(null);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMobileOpen]);

  const isOpen = isDesktop || isMobileOpen;

  const isStudioRoute = useMemo(() => {
    return (
      pathname.includes("resume-builder") ||
      pathname.includes("invoice-generator") ||
      pathname.includes("image-eraser") ||
      pathname.includes("meme-generator") ||
      pathname.includes("minecraft-skin")
    );
  }, [pathname]);

  useEffect(() => {
    if (isStudioRoute) {
      setCompact(true);
    }
  }, [isStudioRoute, setCompact]);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const topItems = [
    { name: t('common.dashboard'), icon: LayoutDashboard, href: '/', accent: 'text-accent-purple', glow: 'rgba(124, 58, 237, 0.5)' },
    { name: 'Sparks Shop', icon: SparkIcon, href: '/rewards', accent: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.5)' },
    { name: 'Daily Vault', icon: Flame, href: '/shop', accent: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.5)' },
    { name: 'Cloud Drive', icon: Cloud, href: '/library', accent: 'text-cyan-400', glow: 'rgba(34, 211, 238, 0.5)' },
    { name: t('common.favorites'), icon: Star, href: '/favorites', accent: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.5)' },
    { name: t('common.history'), icon: Clock, href: '/history', accent: 'text-blue-400', glow: 'rgba(96, 165, 250, 0.5)' },
    { name: t('common.pro'), icon: Crown, href: '/pro', accent: 'text-accent-purple', glow: 'rgba(168, 85, 247, 0.5)' },
    { name: t('common.referrals', 'Referrals'), icon: Users, href: '/referrals', accent: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.5)' },
    { name: 'Giveaways', icon: Gift, href: '/giveaway', accent: 'text-amber-300', glow: 'rgba(245, 158, 11, 0.5)' },
  ];

  const catGlows: Record<string, string> = {
    image: 'rgba(34, 211, 238, 0.5)',
    video: 'rgba(139, 92, 246, 0.5)',
    audio: 'rgba(236, 72, 153, 0.5)',
    pdf: 'rgba(239, 68, 68, 0.5)',
    ai: 'rgba(250, 204, 21, 0.5)',
    productivity: 'rgba(16, 185, 129, 0.5)',
    developer: 'rgba(132, 204, 22, 0.5)',
    student: 'rgba(251, 191, 36, 0.5)',
    creator: 'rgba(244, 63, 94, 0.5)',
    business: 'rgba(255, 153, 51, 0.5)',
    seo: 'rgba(34, 211, 238, 0.5)',
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const [localFrameId, setLocalFrameId] = useState<string | null | undefined>(undefined);
  const [localGradientId, setLocalGradientId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const handleFrameUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setLocalFrameId(customEvent.detail);
    };
    const handleGradientUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setLocalGradientId(customEvent.detail);
    };
    window.addEventListener('avatar-frame-updated', handleFrameUpdate);
    window.addEventListener('name-gradient-updated', handleGradientUpdate);
    return () => {
      window.removeEventListener('avatar-frame-updated', handleFrameUpdate);
      window.removeEventListener('name-gradient-updated', handleGradientUpdate);
    };
  }, []);

  const fullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Explorer";
  const frameId = localFrameId !== undefined
    ? localFrameId
    : session?.user?.user_metadata?.avatar_frame ?? dbUser?.avatar_frame ?? null;
  const gradientId = localGradientId !== undefined
    ? localGradientId
    : session?.user?.user_metadata?.name_gradient ?? dbUser?.name_gradient ?? null;

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            {isMobileOpen && (
              <motion.div 
                 suppressHydrationWarning
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setMobileOpen(false)}
                 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[135] lg:hidden"
              />
            )}
            
            <motion.aside 
              suppressHydrationWarning
              initial={{ x: isDesktop ? 0 : -300, opacity: isDesktop ? 1 : 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isDesktop ? 0 : -300, opacity: isDesktop ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "fixed inset-y-0 left-0 z-[140] w-[calc(100vw-16px)] max-w-[300px] h-full bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800 shadow-2xl lg:static lg:h-full lg:max-h-full transition-[width,transform] duration-300 ease-in-out shrink-0 overflow-hidden",
                isFocusMode ? "hidden" : isCompact ? "lg:w-[88px]" : "lg:w-[300px]"
              )}
            >
              {/* Compact Toggle Button */}
              <button 
                onClick={toggleCompact} 
                aria-label={isCompact ? "Expand sidebar" : "Collapse sidebar"}
                className={cn(
                  "hidden lg:flex absolute top-[26px] -right-3 w-6 h-6 rounded-full bg-[#0a0a0e] border border-white/10 items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all z-[150] shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                )}
              >
                {isCompact ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
              </button>

              <div suppressHydrationWarning className="flex flex-col h-full max-h-full relative overflow-hidden">
                {/* Background Noise/Gradient - Lux Style */}
                <div suppressHydrationWarning className="absolute inset-0 bg-[#070708] pointer-events-none" />
                <div suppressHydrationWarning className="absolute inset-0 bg-linear-to-b from-accent-purple/[0.05] via-transparent to-transparent pointer-events-none" />
                <div suppressHydrationWarning className="absolute inset-0 grain opacity-[0.03] pointer-events-none" />
                <div suppressHydrationWarning className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-purple/10 blur-[120px] rounded-full pointer-events-none" />

                {/* Logo / Branding Section - High-Octane Branding */}
                <div className={cn("pt-5 pb-3.5 shrink-0 relative z-50 flex items-center justify-between w-full", isCompact ? "justify-center px-0 text-center" : "px-5")}>
                  <div className="flex items-center gap-2 min-w-0">
                    <ExismicLogo size={isCompact ? 34 : 38} showText={!isCompact} className={isCompact ? "justify-center mx-auto" : ""} />
                    
                    {!isCompact && !isProLoading && isPro && (
                      <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-accent-purple/10 border border-accent-purple/30 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                         <Crown size={8} className="text-accent-purple" fill="currentColor" />
                         <span className="text-[6.5px] font-black tracking-widest uppercase text-accent-purple">PRO ACTIVE</span>
                      </div>
                    )}
                  </div>

                  {/* Mobile Close Button - Positioned cleanly on the right of header, never overlapping the logo */}
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation"
                    className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0 ml-2"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Nav Groups */}
                <nav suppressHydrationWarning className="flex-1 px-3 py-1.5 space-y-3 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] relative z-10 min-h-0">
                  <LayoutGroup>
                    {/* Main Menu */}
                    <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="space-y-1">
                       {!isCompact && (
                         <div className="flex items-center justify-between px-3.5 mb-2 pt-1">
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                               <p className="text-[10px] font-black uppercase tracking-[0.35em] bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">EXPLORE</p>
                            </div>
                            <div className="w-12 h-px bg-gradient-to-r from-purple-500/40 to-transparent" />
                         </div>
                       )}
                       {topItems.map((item) => {
                         if (item.name === t('common.pro')) {
                           if (isPro) return null;
                           return null; // Skip Pro rendering in list to focus on bottom banner upgrade button
                         }
                         return (
                           <SidebarItem 
                               key={item.href} 
                               {...item} 
                               isActive={pathname === item.href} 
                               glowColor={item.glow}
                               isCompact={isCompact}
                           />
                         );
                       })}
                        {!isProLoading && (dbUser?.role === 'admin' || isAdminEmail(dbUser?.email)) && (
                          <SidebarItem 
                              key="/admin"
                              name="Admin Center"
                              icon={ShieldCheck}
                              href="/admin"
                              isActive={pathname === "/admin"}
                              accentColor="text-red-400"
                              glowColor="rgba(239, 68, 68, 0.5)"
                              isCompact={isCompact}
                          />
                        )}
                    </motion.div>

                    {/* Categories Group */}
                    <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="space-y-1 pt-1">
                       {!isCompact && (
                         <div className="flex items-center justify-between px-3.5 mb-2 pt-1">
                            <div className="flex items-center gap-2">
                                <LayoutGrid size={12} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                               <p className="text-[10px] font-black uppercase tracking-[0.35em] bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">STUDIO TOOLS</p>
                            </div>
                            <div className="w-16 h-px bg-gradient-to-r from-purple-500/50 via-cyan-500/30 to-transparent" />
                         </div>
                       )}
                       {CATEGORIES.map((cat) => {
                          const catName = t(`nav.${cat.id.replace(/-/g, '_')}_tools`, cat.name);
                          return (
                            <CategoryDropdown
                              key={cat.id}
                              category={cat}
                              catName={catName}
                              pathname={pathname}
                              catGlow={catGlows[cat.id]}
                              isCompact={isCompact}
                            />
                          );
                       })}
                    </motion.div>

                    {/* Ecosystem & Resources Group */}
                    <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="space-y-1 pt-1">
                       {!isCompact && (
                         <div className="flex items-center justify-between px-3.5 mb-2 pt-1">
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                               <p className="text-[10px] font-black uppercase tracking-[0.35em] bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">ECOSYSTEM</p>
                            </div>
                            <div className="w-14 h-px bg-gradient-to-r from-cyan-500/40 to-transparent" />
                         </div>
                       )}
                       <SidebarItem 
                         name="Changelog" 
                         icon={ScrollText} 
                         href="/changelog" 
                         isActive={pathname === "/changelog"} 
                         glowColor="rgba(168, 85, 247, 0.5)" 
                         isCompact={isCompact} 
                         rightElement={
                           <span className="text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                             NEW
                           </span>
                         }
                       />
                       <SidebarItem 
                         name="Help & Guides" 
                         icon={HelpCircle} 
                         href="/help" 
                         isActive={pathname === "/help"} 
                         glowColor="rgba(14, 165, 233, 0.5)" 
                         isCompact={isCompact} 
                       />
                     </motion.div>
                  </LayoutGroup>
                </nav>

                {/* Account & Billing Section - Fixed Pinned Bottom Footer */}
                <div className={cn("border-t border-white/[0.06] bg-[#07070a]/95 backdrop-blur-2xl relative z-20 space-y-2 shrink-0", isCompact ? "p-2" : "p-3")}>
                  {/* Real-time Credits Display Vault Card */}
                  {!isCompact && (
                    <div className="block group/credits relative">
                      <div 
                        onClick={() => setIsBuyCreditsOpen(true)}
                        className="cursor-pointer relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0c0d16]/90 via-[#07080f]/95 to-[#05060a]/98 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:border-cyan-400/35 hover:shadow-[0_16px_40px_rgba(34,211,238,0.15),0_0_20px_rgba(168,85,247,0.12)] hover:-translate-y-0.5 active:scale-[0.99]"
                      >
                        
                        {/* Background Neon Plasma Bloom */}
                        <div className="pointer-events-none absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-cyan-500/20 via-purple-500/15 to-transparent rounded-full blur-2xl transition-opacity duration-500 group-hover/credits:opacity-100 opacity-60" />
                        <div className="pointer-events-none absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-tr from-purple-600/15 via-blue-600/10 to-transparent rounded-full blur-xl transition-opacity duration-500 group-hover/credits:opacity-100 opacity-40" />

                        {/* Shimmer Light Sweep on Hover */}
                        <div className="pointer-events-none absolute inset-y-0 -left-20 w-16 skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-[2px] transition-transform duration-1000 ease-out group-hover/credits:translate-x-[500px]" />

                        {/* Top Header Row: Core & Status Badge */}
                        <div className="relative flex items-center justify-between z-10 mb-2">
                          <div className="flex items-center gap-2">
                            <CreditTokenIcon size="sm" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 group-hover/credits:text-zinc-200 transition-colors">
                                CREDIT VAULT
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse" />
                            </div>
                          </div>

                          {/* Right Badge / Action */}
                          {!isProLoading && isPro ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-200 text-[8.5px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.25)]">
                              <Crown size={9} className="text-amber-300" fill="currentColor" />
                              <span>PRO</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsBuyCreditsOpen(true);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/30 active:scale-95 border border-amber-300/30 text-amber-200 text-[8.5px] font-black uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer"
                            >
                              <span>+ TOP UP</span>
                            </button>
                          )}
                        </div>

                        {/* Main Balance Display Row */}
                        <div className="relative z-10 flex items-baseline justify-between mb-1.5">
                          <div className="flex items-baseline gap-1.5">
                            <h4 className="text-xl font-black tracking-tight text-white leading-none drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]">
                              {isCreditsLoading ? "..." : credits.toLocaleString()}
                            </h4>
                            <span className="text-[9.5px] font-extrabold tracking-wider uppercase text-cyan-300/80 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]">
                              available
                            </span>
                          </div>

                          <Link
                            href="/shop"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9.5px] text-zinc-500 hover:text-cyan-300 transition-colors flex items-center gap-0.5 font-bold cursor-pointer"
                          >
                            <span>{isPro ? "Vault" : "Refill"}</span>
                            <ArrowRight size={10} className="transition-transform group-hover/credits:translate-x-0.5" />
                          </Link>
                        </div>

                        {/* Bottom Micro Meter / Status Pill */}
                        <div className="relative z-10 pt-1.5 border-t border-white/[0.05] flex items-center justify-between text-[9px] text-zinc-400 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Flame size={10} className={(dailyStreak ?? 0) > 0 ? "text-amber-400" : "text-zinc-500"} />
                            <span>{(dailyStreak ?? 0) > 0 ? `${dailyStreak} day streak` : "Daily active"}</span>
                          </div>
                          
                          {countdown && (
                            <div className="flex items-center gap-1 text-[8.5px] text-zinc-500 font-mono">
                              <Clock size={8.5} />
                              <span>{countdown}</span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Ultra Premium Animated Upgrade Button */}
                  {!isCompact && !isProLoading && !isPro && (
                    <Link href="/pro" className="block w-full relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 rounded-full blur-[8px] opacity-60 group-hover:opacity-100 transition duration-1000 animate-gradient-x bg-[length:200%_auto]" />
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="relative w-full py-2.5 rounded-full bg-zinc-950/90 backdrop-blur-xl border border-white/20 text-xs font-black uppercase tracking-[0.2em] overflow-hidden"
                      >
                        <motion.div
                          animate={{ x: ["-200%", "200%"] }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 0.5 }}
                          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                        />

                        <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          <Crown size={13} className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                          <span className="bg-gradient-to-r from-amber-100 via-white to-amber-200 bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                            UPGRADE TO PRO
                          </span>
                        </span>
                      </motion.button>
                    </Link>
                  )}

                  {/* Elegant User Account Footer */}
                  <UserProfile 
                    fullName={fullName} 
                    email={session?.user?.email} 
                    avatarUrl={dbUser?.custom_avatar_url || session?.user?.user_metadata?.avatar_url}
                    isPro={isPro} 
                    frameId={frameId}
                    gradientId={gradientId}
                    variant="sidebar" 
                    isCompact={isCompact}
                  />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Dynamic Buy Credits Modal */}
      <BuyCreditsModal 
        isOpen={isBuyCreditsOpen} 
        onClose={() => setIsBuyCreditsOpen(false)} 
      />
    </>
  );
}
