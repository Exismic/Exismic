"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  History, 
  Image as ImageIcon,
  Crown,
  Activity,
  Star,
  ArrowUpRight,
  Wand2,
  Brush,
  FileText,
  Mic2,
  Bot,
  Code2,
  Layers,
  LayoutGrid,
  Search,
  Flame,
  Gamepad2,
  Clock,
  Trophy,
  Gift,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Check,
  type LucideIcon
} from "lucide-react";
import dynamic from "next/dynamic";
import { TOOLS } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";
import { RecentlyProcessed } from "./RecentlyProcessed";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { PremiumName } from "@/components/ui/PremiumName";
import { usePro } from "@/hooks/usePro";
import { useCredits } from "@/hooks/useCredits";
import { CreditTokenIcon } from "@/components/ui/CreditTokenIcon";
import { PRICING_CONFIG } from "@/config/pricing";
import { ProBackground } from "@/components/pro/ProBackground";
import { CyberAliveBackground } from "@/components/ui/CyberAliveBackground";
import { FAVORITES_CHANGED_EVENT } from "@/lib/favorites";

const CreditModal = dynamic(
  () => import("../ui/CreditModal").then((mod) => mod.CreditModal),
  { ssr: false }
);

const DailyQuestsModal = dynamic(
  () => import("../reward/DailyQuestsModal").then((mod) => mod.DailyQuestsModal),
  { ssr: false }
);

const DailyRewardModal = dynamic(
  () => import("../reward/DailyRewardModal").then((mod) => mod.DailyRewardModal),
  { ssr: false }
);

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  color: "cyan" | "purple" | "amber" | "gold" | "zinc";
  progress?: number;
  loading?: boolean;
  isPro?: boolean;
  href?: string;
  badge?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
};

const QUICK_ACTIONS = [
  { 
    name: "Remove BG", 
    href: "/tools/image/eraser", 
    icon: Brush, 
    badge: "POPULAR", 
    theme: {
      idleBg: "bg-gradient-to-br from-purple-950/80 via-indigo-950/50 to-zinc-950/90",
      border: "border-purple-500/50 hover:border-purple-300",
      glow: "shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_45px_rgba(168,85,247,0.7)]",
      iconBg: "bg-purple-500/20 border-purple-400/50 text-purple-200",
      badge: "bg-purple-500/30 border-purple-400/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.5)]",
      pulseColor: "bg-purple-400"
    }
  },
  { 
    name: "Generate 4K Art", 
    href: "/tools/ai/img-gen", 
    icon: ImageIcon, 
    badge: "AI 4K", 
    theme: {
      idleBg: "bg-gradient-to-br from-cyan-950/80 via-blue-950/50 to-zinc-950/90",
      border: "border-cyan-500/50 hover:border-cyan-300",
      glow: "shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)]",
      iconBg: "bg-cyan-500/20 border-cyan-400/50 text-cyan-200",
      badge: "bg-cyan-500/30 border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.5)]",
      pulseColor: "bg-cyan-400"
    }
  },
  { 
    name: "Support Agent", 
    href: "/tools/support-agent", 
    icon: Bot, 
    badge: "B2B BOT", 
    theme: {
      idleBg: "bg-gradient-to-br from-amber-950/80 via-yellow-950/50 to-zinc-950/90",
      border: "border-amber-500/50 hover:border-amber-300",
      glow: "shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_45px_rgba(245,158,11,0.7)]",
      iconBg: "bg-amber-500/20 border-amber-400/50 text-amber-200",
      badge: "bg-amber-500/30 border-amber-400/50 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
      pulseColor: "bg-amber-400"
    }
  },
  { 
    name: "Vocal Remover", 
    href: "/tools/audio/vocal-remover", 
    icon: Mic2, 
    badge: "AUDIO STEM", 
    theme: {
      idleBg: "bg-gradient-to-br from-pink-950/80 via-rose-950/50 to-zinc-950/90",
      border: "border-pink-500/50 hover:border-pink-300",
      glow: "shadow-[0_0_25px_rgba(236,72,153,0.3)] hover:shadow-[0_0_45px_rgba(236,72,153,0.7)]",
      iconBg: "bg-pink-500/20 border-pink-400/50 text-pink-200",
      badge: "bg-pink-500/30 border-pink-400/50 text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.5)]",
      pulseColor: "bg-pink-400"
    }
  },
  { 
    name: "PDF Tools", 
    href: "/tools/pdf/merger", 
    icon: FileText, 
    badge: "PDF DOC", 
    theme: {
      idleBg: "bg-gradient-to-br from-red-950/80 via-rose-950/50 to-zinc-950/90",
      border: "border-red-500/50 hover:border-red-300",
      glow: "shadow-[0_0_25px_rgba(239,68,68,0.3)] hover:shadow-[0_0_45px_rgba(239,68,68,0.7)]",
      iconBg: "bg-red-500/20 border-red-400/50 text-red-200",
      badge: "bg-red-500/30 border-red-400/50 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.5)]",
      pulseColor: "bg-red-400"
    }
  },
  { 
    name: "Minecraft 3D", 
    href: "/tools/image/minecraft-skin", 
    icon: Gamepad2, 
    badge: "🔥 HOT", 
    theme: {
      idleBg: "bg-gradient-to-br from-emerald-950/80 via-green-950/50 to-zinc-950/90",
      border: "border-emerald-500/50 hover:border-lime-300",
      glow: "shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(34,197,94,0.75)]",
      iconBg: "bg-emerald-500/20 border-emerald-400/50 text-emerald-200",
      badge: "bg-emerald-500/30 border-emerald-400/50 text-emerald-200 shadow-[0_0_12px_rgba(168,85,247,0.5)]",
      pulseColor: "bg-lime-400"
    }
  },
];

const CATEGORY_TABS = [
  { id: "all", label: "All Tools", icon: Sparkles },
  { id: "creative", label: "AI & Design", icon: Wand2 },
  { id: "dev", label: "Developer", icon: Code2 },
  { id: "productivity", label: "Productivity", icon: Layers },
  { id: "favorites", label: "Favorites", icon: Star },
];

export function Dashboard({ initialUser }: { initialUser?: any }) {
  const { 
    toolsUsedToday, 
    totalGenerations, 
    isPro: statsIsPro, 
    loading: statsLoading 
  } = useDashboardStats();
  const { isPro: verifiedIsPro, user: dbUser, authUser, isLoading: proLoading } = usePro();
  const { 
    credits, 
    dailyStreak, 
    todayClaim,
    countdown, 
    loading: creditsLoading 
  } = useCredits();

  const effectiveAuthUser = authUser || initialUser;

  const isPro = Boolean(
    verifiedIsPro ||
    statsIsPro ||
    dbUser?.is_pro ||
    dbUser?.role === "admin" ||
    dbUser?.plan === "pro" ||
    effectiveAuthUser?.email === "syedyaseeralirayan@gmail.com" ||
    dbUser?.email === "syedyaseeralirayan@gmail.com"
  );
  const [favorites, setFavorites] = useState<string[]>([]);
  const [gradientOverride, setGradientOverride] = useState<string | null>(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [questsModalOpen, setQuestsModalOpen] = useState(false);
  const [dailyRewardModalOpen, setDailyRewardModalOpen] = useState(false);
  
  // Interactive Dashboard States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const localGradientId = gradientOverride ?? effectiveAuthUser?.user_metadata?.name_gradient ?? dbUser?.name_gradient ?? null;

  // Keyboard shortcut listener (/ or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.ctrlKey && e.key === "k") || (e.metaKey && e.key === "k")) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleGradientUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setGradientOverride(customEvent.detail);
    };
    window.addEventListener('name-gradient-updated', handleGradientUpdate);
    return () => window.removeEventListener('name-gradient-updated', handleGradientUpdate);
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (dbUser) {
        import('@/app/actions/favorites').then(async ({ getFavorites }) => {
          const favs = await getFavorites();
          if (favs) setFavorites(favs);
        });
      }
    };
    fetchFavorites();
  }, [dbUser]);

  useEffect(() => {
    const handleFavoritesChanged = (event: Event) => {
      const nextFavorites = (event as CustomEvent<{ favorites?: string[] }>).detail?.favorites;
      if (Array.isArray(nextFavorites)) setFavorites(nextFavorites);
    };

    window.addEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesChanged);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, handleFavoritesChanged);
  }, []);

  // Dynamic Local Device Time Greeting (Client-side sync)
  const getGreetingByHour = () => {
    if (typeof window === "undefined") {
      return { text: "Good morning", icon: Sunrise };
    }
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: "Good morning", icon: Sunrise };
    } else if (hour >= 12 && hour < 17) {
      return { text: "Good afternoon", icon: Sun };
    } else if (hour >= 17 && hour < 22) {
      return { text: "Good evening", icon: Sunset };
    } else {
      return { text: "Good night", icon: Moon };
    }
  };

  const [greeting, setGreeting] = useState<{ text: string; icon: typeof Sun }>(getGreetingByHour);

  useEffect(() => {
    setGreeting(getGreetingByHour());
    const interval = setInterval(() => {
      setGreeting(getGreetingByHour());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const popularTools = TOOLS.filter(t => t.popular).slice(0, 6);
  const userName = (effectiveAuthUser?.user_metadata?.full_name || effectiveAuthUser?.user_metadata?.name || dbUser?.name || dbUser?.username || effectiveAuthUser?.email?.split('@')[0] || 'Explorer').split(' ')[0];

  // Filtering Logic
  const filteredTools = useMemo(() => {
    let result = TOOLS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      );
    }
    if (activeTab === "creative") {
      result = result.filter(t => t.category === "image" || t.category === "ai" || t.category === "audio");
    } else if (activeTab === "dev") {
      result = result.filter(t => t.category === "ai" || t.category === "productivity");
    } else if (activeTab === "productivity") {
      result = result.filter(t => t.category === "productivity" || t.category === "pdf");
    } else if (activeTab === "favorites") {
      result = result.filter(t => favorites.includes(t.id));
    }
    return result;
  }, [searchQuery, activeTab, favorites]);

  return (
    <div className="min-h-screen bg-[#030303] selection:bg-purple-500/30 overflow-x-hidden">
      {/* CYBER ALIVE ANIMATED BACKGROUND ENGINE */}
      {isPro ? <ProBackground /> : <CyberAliveBackground />}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-8 md:pt-14 pb-36 md:pb-32 space-y-12 md:space-y-16">
        
        {/* 1. ULTRA-PREMIUM HERO COCKPIT HEADER */}
        <section className="relative space-y-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left Hero Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-3.5 max-w-2xl"
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                {(() => {
                  const GreetingIcon = greeting.icon;
                  return (
                    <div 
                      suppressHydrationWarning
                      className="relative overflow-hidden inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-cyan-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-black uppercase tracking-widest backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
                      </span>
                      <GreetingIcon size={13} className="text-amber-400 animate-pulse" />
                      <span suppressHydrationWarning>{greeting.text}</span>
                    </div>
                  );
                })()}

                {isPro && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-widest backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                    <Crown size={12} className="fill-amber-400 text-amber-400" />
                    <span>Pro Studio Active</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white flex flex-wrap items-center gap-x-3.5 gap-y-1 py-1 overflow-visible drop-shadow-[0_2px_20px_rgba(255,255,255,0.1)]">
                 Welcome back, <PremiumName name={userName} isPro={isPro} gradientId={localGradientId} className="text-4xl sm:text-5xl lg:text-6xl" />
              </h1>

              <p className="text-zinc-400 text-base sm:text-lg font-medium leading-relaxed tracking-tight">
                 Your next-gen AI workspace. Launch engines, process media, and build products seamlessly.
              </p>
            </motion.div>
          </div>

          {/* QUICK LAUNCH GRID (UNCONSTRAINED, NO SCROLLBAR, FULL NEON BURST) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 pt-2"
          >
            <div className="flex items-center gap-2 pl-12 lg:pl-0">
              <Sparkles size={14} className="text-purple-400 animate-pulse shrink-0" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300">Quick Launch Cockpit</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
              {QUICK_ACTIONS.map((qa) => {
                const Icon = qa.icon;
                return (
                  <Link
                    key={qa.name}
                    href={qa.href}
                    className={cn(
                      "group relative isolate flex flex-col justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border backdrop-blur-3xl transition-all duration-300 hover:scale-[1.04] active:scale-95 min-w-0",
                      qa.theme.idleBg,
                      qa.theme.border,
                      qa.theme.glow
                    )}
                  >
                    {/* Continuous Hover Shine Beam (Clipped to pill border) */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
                      <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    </div>

                    {/* Top Row: Icon Box & Badge */}
                    <div className="flex items-center justify-between gap-1.5 relative z-20 w-full min-w-0">
                      <div className={cn(
                        "w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-inner shrink-0",
                        qa.theme.iconBg
                      )}>
                        <Icon size={18} className="sm:w-5 sm:h-5" />
                      </div>

                      <span className={cn(
                        "relative z-20 text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border shrink-0 max-w-[55%] truncate text-center",
                        qa.theme.badge
                      )}>
                        {qa.badge}
                      </span>
                    </div>

                    {/* Bottom Row: Tool Title & Status Dot */}
                    <div className="flex items-center justify-between gap-1 relative z-20 w-full pt-1 min-w-0">
                      <span className="text-xs sm:text-sm font-black text-white tracking-tight truncate group-hover:text-white transition-colors">
                        {qa.name}
                      </span>
                      <span className="relative flex h-2 w-2 shrink-0 ml-1">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", qa.theme.pulseColor)} />
                        <span className={cn("relative inline-flex rounded-full h-2 w-2", qa.theme.pulseColor)} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* 2. STATS ROW (⚡️ LIVE REACTOR & STREAK COCKPIT WIDGETS) */}
        <section className="grid gap-4 sm:gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
           {/* Card 1: Live Energy Reactor Vault */}
           <StatCard 
              label="Credits Remaining" 
              value={
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 drop-shadow-[0_2px_15px_rgba(6,182,212,0.4)]">
                    {credits.toLocaleString()}
                  </span>
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/30 text-cyan-200">
                    {isPro ? "500 Daily" : "Available"}
                  </span>
                </div>
              }
              icon={CreditTokenIcon}
              color="cyan"
              loading={creditsLoading}
              progress={Math.min(100, Math.round((credits / (isPro ? PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS : 50)) * 100))}
              badge={
                <button
                  type="button"
                  onClick={() => setCreditModalOpen(true)}
                  className="group/btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-[10px] font-black text-cyan-200 uppercase tracking-wider hover:bg-cyan-400/25 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.35)] transition-all cursor-pointer select-none active:scale-95"
                >
                  <span>+ TOP UP</span>
                  <ArrowRight size={11} className="transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              }
              footer={
                <div className="flex items-center text-[10.5px] text-cyan-300 font-mono">
                  <Clock size={12} className="text-cyan-400 mr-1.5 shrink-0" />
                  <span>Resets in {countdown || "12:00:00"}</span>
                </div>
              }
           />

           {/* Card 2: Daily Quest Streak & Mystery Vault */}
           <StatCard 
              label="Daily Quest Streak" 
              value={
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)]">
                    {dailyStreak || 1}
                  </span>
                  <span className="text-sm font-bold text-amber-200/90 lowercase">
                    {(dailyStreak || 1) === 1 ? "day" : "days"}
                  </span>
                </div>
              }
              icon={Flame}
              color="amber"
              loading={creditsLoading}
              onClick={() => setDailyRewardModalOpen(true)}
              badge={
                !todayClaim ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500/25 to-amber-500/25 border border-orange-400/50 text-[10px] font-black uppercase tracking-wider text-amber-200 shadow-[0_0_15px_rgba(249,115,22,0.35)] shrink-0">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-400"></span>
                    </span>
                    <span>Ready</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 shrink-0">
                    <Check size={11} className="text-emerald-400" />
                    <span>Claimed</span>
                  </span>
                )
              }
              footer={
                <div className="flex items-center justify-between w-full text-[11px] font-medium text-amber-200/90 pt-1">
                  <span className="flex items-center gap-1.5 truncate">
                    <Gift size={12} className={cn("shrink-0", !todayClaim ? "text-orange-400 animate-bounce" : "text-amber-400")} />
                    <span className="truncate">{!todayClaim ? "Open Mystery Vault" : `Resets in ${countdown || "12h"}`}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuestsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-400/20 border border-amber-400/20 text-[10px] font-bold text-amber-300 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trophy size={10} />
                    <span>Quests</span>
                  </button>
                </div>
              }
           />

           {/* Card 3: Studio Activity Velocity */}
           <StatCard 
              label="Tools Used Today" 
              value={toolsUsedToday} 
              icon={Activity}
              color="purple"
              loading={statsLoading}
              footer={
                <div className="text-[10.5px] text-purple-200/90 font-medium">
                  <span>{totalGenerations.toLocaleString()} Total Runs</span>
                </div>
              }
           />

           {/* Card 4: Studio Membership Tier */}
           <StatCard 
              label="Membership Status" 
              value={isPro ? "PRO STUDIO" : "FREE TIER"} 
              icon={isPro ? Crown : ShieldCheck}
              color={isPro ? "gold" : "zinc"}
              loading={statsLoading || proLoading}
              isPro={isPro}
              href="/pro/benefits"
              footer={
                <div className="text-[10.5px] font-semibold">
                  {isPro ? (
                    <span className="text-amber-300 flex items-center gap-1.5">
                      <Crown size={12} className="fill-amber-300 text-amber-300 shrink-0" />
                      Pro Active
                    </span>
                  ) : (
                    <span className="text-purple-300 group-hover:text-cyan-200 transition-colors flex items-center gap-1">
                      Upgrade to Pro <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  )}
                </div>
              }
           />
        </section>

        {/* 3. FUTURISTIC 3D CYBER SUITE COMMAND DECK */}
        <section className="space-y-4 pt-2">
          {/* Header Title Bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse shadow-[0_0_12px_rgba(168,85,247,1)]" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-fuchsia-100 to-cyan-200 drop-shadow-sm">
                TOOL SUITE CATALOG
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-cyan-500/20 border border-purple-400/40 text-purple-100 font-black text-[11px] uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span>{filteredTools.length} {filteredTools.length === 1 ? "Tool Ready" : "Tools Ready"}</span>
              </div>

              {(searchQuery || activeTab !== "all") && (
                <button
                  onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
                  className="text-[11px] font-black text-purple-200 hover:text-white transition-colors uppercase tracking-wider px-4 py-1.5 rounded-full bg-purple-500/30 hover:bg-purple-500/40 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* 5-Suite Cyber Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              const suiteToolCount = tab.id === "all" 
                ? TOOLS.length 
                : tab.id === "creative"
                  ? TOOLS.filter(t => t.category === "image" || t.category === "ai" || t.category === "audio").length
                  : tab.id === "dev"
                    ? TOOLS.filter(t => t.category === "ai" || t.category === "productivity").length
                    : tab.id === "productivity"
                      ? TOOLS.filter(t => t.category === "productivity" || t.category === "pdf").length
                      : tab.id === "favorites"
                        ? favorites.length 
                        : 0;

              const suiteBadgeLabel = tab.id === "all" 
                ? "ALL" 
                : tab.id === "creative" 
                  ? "DESIGN" 
                  : tab.id === "dev" 
                    ? "CODE" 
                    : tab.id === "productivity" 
                      ? "PROD" 
                      : "SAVED";

              const cardThemes: Record<string, { 
                activeBg: string; 
                activeBorder: string; 
                activeGlow: string; 
                activeText: string;
                badgeBg: string;
                badgeText: string;
                idleBg: string;
                idleBorder: string;
                idleGlow: string;
                iconColor: string;
              }> = {
                all: {
                  activeBg: "bg-gradient-to-br from-purple-900/90 via-indigo-950/90 to-cyan-950/90",
                  activeBorder: "border-purple-400",
                  activeGlow: "shadow-[0_0_35px_rgba(168,85,247,0.7)]",
                  activeText: "text-white",
                  badgeBg: "bg-purple-500/30 border-purple-400/50",
                  badgeText: "text-purple-200",
                  idleBg: "bg-gradient-to-br from-[#1b0c3d]/90 via-[#100726]/80 to-[#080314]/90",
                  idleBorder: "border-purple-500/30 hover:border-purple-400/70",
                  idleGlow: "shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)]",
                  iconColor: "text-purple-300"
                },
                creative: {
                  activeBg: "bg-gradient-to-br from-fuchsia-900/90 via-pink-950/90 to-rose-950/90",
                  activeBorder: "border-fuchsia-400",
                  activeGlow: "shadow-[0_0_35px_rgba(236,72,153,0.7)]",
                  activeText: "text-white",
                  badgeBg: "bg-fuchsia-500/30 border-fuchsia-400/50",
                  badgeText: "text-fuchsia-200",
                  idleBg: "bg-gradient-to-br from-[#3b0a2a]/90 via-[#210517]/80 to-[#0f020a]/90",
                  idleBorder: "border-fuchsia-500/30 hover:border-fuchsia-400/70",
                  idleGlow: "shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5)]",
                  iconColor: "text-fuchsia-300"
                },
                dev: {
                  activeBg: "bg-gradient-to-br from-amber-900/90 via-orange-950/90 to-red-950/90",
                  activeBorder: "border-amber-400",
                  activeGlow: "shadow-[0_0_35px_rgba(245,158,11,0.7)]",
                  activeText: "text-white",
                  badgeBg: "bg-amber-500/30 border-amber-400/50",
                  badgeText: "text-amber-200",
                  idleBg: "bg-gradient-to-br from-[#381c03]/90 via-[#241001]/80 to-[#120700]/90",
                  idleBorder: "border-amber-500/30 hover:border-amber-400/70",
                  idleGlow: "shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)]",
                  iconColor: "text-amber-300"
                },
                productivity: {
                  activeBg: "bg-gradient-to-br from-emerald-900/90 via-teal-950/90 to-cyan-950/90",
                  activeBorder: "border-emerald-400",
                  activeGlow: "shadow-[0_0_35px_rgba(16,185,129,0.7)]",
                  activeText: "text-white",
                  badgeBg: "bg-emerald-500/30 border-emerald-400/50",
                  badgeText: "text-emerald-200",
                  idleBg: "bg-gradient-to-br from-[#063324]/90 via-[#032117]/80 to-[#01120c]/90",
                  idleBorder: "border-emerald-500/30 hover:border-emerald-400/70",
                  idleGlow: "shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)]",
                  iconColor: "text-emerald-300"
                },
                favorites: {
                  activeBg: "bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500",
                  activeBorder: "border-amber-200",
                  activeGlow: "shadow-[0_0_40px_rgba(251,191,36,0.9)]",
                  activeText: "text-amber-950",
                  badgeBg: "bg-amber-500/25 border-amber-400/50",
                  badgeText: "text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.4)]",
                  idleBg: "bg-gradient-to-br from-[#382603]/90 via-[#241801]/80 to-[#120c00]/90",
                  idleBorder: "border-amber-400/50 hover:border-amber-300",
                  idleGlow: "shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.7)]",
                  iconColor: "text-amber-300 fill-amber-300"
                }
              };

              const theme = cardThemes[tab.id] || cardThemes.all;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group relative isolate flex flex-col justify-between gap-3 p-4 rounded-2xl border backdrop-blur-3xl transition-all duration-300 text-left overflow-hidden touch-manipulation",
                    isActive
                      ? cn(theme.activeBg, theme.activeBorder, theme.activeGlow, theme.activeText, "scale-[1.04] z-20")
                      : cn(theme.idleBg, theme.idleBorder, theme.idleGlow, "hover:-translate-y-1 hover:scale-[1.02]")
                  )}
                >
                  {/* Hardware Laser Sheen Sweep on Hover */}
                  <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-10" />

                  {/* Top Row: Icon Orb & Suite Badge */}
                  <div className="flex items-center justify-between w-full relative z-20">
                    <div className={cn(
                      "w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-inner shrink-0",
                      isActive 
                        ? (tab.id === "favorites" ? "bg-amber-950/20 border-amber-950/40 text-amber-950" : "bg-white/20 border-white/40 text-white") 
                        : "bg-white/5 border-white/10"
                    )}>
                      <Icon size={18} className={isActive ? (tab.id === "favorites" ? "fill-amber-950 text-amber-950" : "text-white") : theme.iconColor} />
                    </div>

                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shrink-0",
                      isActive 
                        ? (tab.id === "favorites" ? "bg-amber-950/30 border-amber-950/40 text-amber-950" : "bg-white/20 border-white/30 text-white") 
                        : theme.badgeBg + " " + theme.badgeText
                    )}>
                      {suiteBadgeLabel}
                    </span>
                  </div>

                  {/* Middle Row: Suite Title */}
                  <div className="relative z-20 pt-1">
                    <h4 className={cn(
                      "text-xs font-black uppercase tracking-wider whitespace-nowrap",
                      isActive ? (tab.id === "favorites" ? "text-amber-950" : "text-white") : "text-zinc-100 group-hover:text-white"
                    )}>
                      {tab.label}
                    </h4>
                  </div>

                  {/* Bottom Row: Suite Tool Count */}
                  <div className="flex items-center justify-between relative z-20 pt-1 border-t border-white/10 w-full">
                    <span className={cn(
                      "text-[10px] font-bold tracking-tight",
                      isActive ? (tab.id === "favorites" ? "text-amber-950/80" : "text-white/80") : "text-zinc-400 group-hover:text-zinc-200"
                    )}>
                      {suiteToolCount} {suiteToolCount === 1 ? "Tool" : "Tools"}
                    </span>

                    {isActive && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", tab.id === "favorites" ? "bg-amber-950" : "bg-white")} />
                        <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", tab.id === "favorites" ? "bg-amber-950" : "bg-white")} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. UNIFIED DYNAMIC TOOL CATALOG GRID */}
        <section className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                {activeTab === "all" && <LayoutGrid size={22} className="text-purple-400" />}
                {activeTab === "creative" && <Wand2 size={22} className="text-fuchsia-400" />}
                {activeTab === "dev" && <Code2 size={22} className="text-amber-400" />}
                {activeTab === "productivity" && <Layers size={22} className="text-emerald-400" />}
                {activeTab === "favorites" && <Star size={22} className="text-amber-300 fill-amber-300" />}
                <span>
                  {activeTab === "all" && "All Available Tools"}
                  {activeTab === "creative" && "AI & Design Suite"}
                  {activeTab === "dev" && "Developer AI Suite"}
                  {activeTab === "productivity" && "Productivity Suite"}
                  {activeTab === "favorites" && "Saved Favorite Tools"}
                </span>
              </h2>
              <p className="text-zinc-400 text-xs font-semibold">
                {activeTab === "all" && "Explore and launch all tools available in your workspace catalog."}
                {activeTab === "creative" && "Transform media, generate high-fidelity 4K art, remove backgrounds, and erase objects."}
                {activeTab === "dev" && "Full-stack AI IDEs, code generation, refactoring, and developer utilities."}
                {activeTab === "productivity" && "Document converters, PDF suites, resume builders, and workflow tools."}
                {activeTab === "favorites" && "Quick access to your bookmarked favorite tools."}
              </p>
            </div>

            {(searchQuery || activeTab !== "all") && (
              <button
                onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
                className="self-start sm:self-auto text-xs font-black text-purple-300 hover:text-white transition-colors uppercase tracking-wider px-4 py-2 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 shadow-sm shrink-0"
              >
                View All Tools
              </button>
            )}
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
              {filteredTools.map((tool, idx) => (
                <ToolCard 
                  key={tool.id} 
                  {...tool} 
                  index={idx} 
                  initialFavorited={favorites.includes(tool.id)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 px-6 text-center space-y-4 bg-zinc-950/50 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
              <Search size={40} className="text-zinc-600 mx-auto animate-pulse" />
              <h3 className="text-xl font-bold text-white">
                {activeTab === "favorites" ? "No favorite tools saved yet" : "No matching tools found"}
              </h3>
              <p className="text-zinc-500 text-xs max-w-md mx-auto">
                {activeTab === "favorites" 
                  ? "Click the star icon on any tool card across the dashboard to bookmark it here for quick access." 
                  : `We couldn't find any tool matching "${searchQuery}". Try searching for broader terms like "image", "audio", "code", or "pdf".`}
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all uppercase tracking-wider shadow-lg"
              >
                Clear Filter & View All Tools
              </button>
            </div>
          )}
        </section>

        {/* 5. POPULAR TOOLS SHOWCASE */}
        {!searchQuery && activeTab === "all" && (
          <section className="space-y-8 md:space-y-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
               <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                     <Star size={20} className="text-amber-500 fill-amber-500/20" />
                     Popular Tools This Week
                  </h2>
                  <p className="text-zinc-400 text-sm font-medium">Tools used most by the community</p>
               </div>
               <Link href="/tools" className="group flex min-h-11 w-fit items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                  <span className="font-bold text-xs text-zinc-400 group-hover:text-white">View All</span>
                  <ArrowRight size={14} className="text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
               </Link>
            </div>

            <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
               {popularTools.map((tool, idx) => (
                  <ToolCard 
                    key={tool.id} 
                    {...tool} 
                    index={idx} 
                    initialFavorited={favorites.includes(tool.id)}
                  />
               ))}
            </div>
          </section>
        )}

        {/* 6. RECENT ACTIVITY */}
        <section className="space-y-8 pt-8 border-t border-white/5">
           <div className="flex items-center gap-3">
              <History className="text-zinc-400" size={20} />
              <h3 className="text-2xl font-black text-white tracking-tight">Recent Activity</h3>
           </div>
           <RecentlyProcessed />
        </section>

        {/* 7. FAVORITES SECTION */}
        <section className="pt-16 pb-8 space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
               <Star className="text-amber-400 fill-amber-400/20" size={24} />
               <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">Your <span className="inline-block pr-3 py-0.5 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-sm">Favorites</span></h2>
            </div>
            {favorites.length > 0 && (
              <div className="flex items-center gap-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{favorites.length} saved tools</p>
                 {favorites.length > 6 && (
                   <Link href="/favorites" className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest">
                     View All <ArrowRight size={14} />
                   </Link>
                 )}
              </div>
            )}
          </div>
          
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {favorites.slice(0, 6).map((toolId, i) => {
                const tool = TOOLS.find(t => t.id === toolId);
                if (!tool) return null;
                return (
                  <ToolCard key={tool.id} {...tool} index={i} initialFavorited={true} />
                );
              })}
            </div>
          ) : (
            <div className="py-16 sm:py-20 px-5 text-center space-y-6 bg-zinc-950/50 rounded-[2rem] sm:rounded-[3rem] border border-white/5 backdrop-blur-xl">
               <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                  <Star size={32} className="fill-amber-500/20 animate-pulse" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">No favorites yet</h3>
                  <p className="text-zinc-400 text-xs font-medium">Click the premium star icon on any tool card to add it to your collection.</p>
               </div>
            </div>
          )}
        </section>
      </div>

      {/* Dynamic Credit Vault Modal */}
      <CreditModal 
        isOpen={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        plan={isPro ? "pro" : "free"}
        credits={credits}
      />

      {/* Dynamic Daily Quests Modal */}
      <DailyQuestsModal 
        isOpen={questsModalOpen}
        onClose={() => setQuestsModalOpen(false)}
      />

      {/* Dynamic Daily Mystery Vault Modal */}
      <DailyRewardModal 
        isOpen={dailyRewardModalOpen}
        onClose={() => setDailyRewardModalOpen(false)}
      />

      <style jsx global>{`
        .cyber-neon-glow {
          filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.3));
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, progress, loading, isPro, href, badge, footer, onClick }: StatCardProps) {
  const themeStyles = {
    cyan: {
      cardBg: "bg-gradient-to-br from-cyan-950/70 via-blue-950/35 to-[#040810]",
      border: "border-cyan-500/40 hover:border-cyan-300",
      glow: "shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.7),0_0_30px_rgba(6,182,212,0.4)]",
      iconBg: "bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.5)]",
      textGrad: "from-white via-cyan-100 to-cyan-400 drop-shadow-[0_2px_15px_rgba(6,182,212,0.4)]",
      pillBg: "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
    },
    purple: {
      cardBg: "bg-gradient-to-br from-purple-950/70 via-fuchsia-950/35 to-[#080312]",
      border: "border-purple-500/40 hover:border-purple-300",
      glow: "shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.7),0_0_30px_rgba(168,85,247,0.4)]",
      iconBg: "bg-purple-500/20 border-purple-400/50 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.5)]",
      textGrad: "from-white via-purple-100 to-fuchsia-400 drop-shadow-[0_2px_15px_rgba(168,85,247,0.4)]",
      pillBg: "bg-purple-500/20 border-purple-400/50 text-purple-200"
    },
    amber: {
      cardBg: "bg-gradient-to-br from-amber-950/70 via-yellow-950/35 to-[#0c0803]",
      border: "border-amber-500/40 hover:border-amber-300",
      glow: "shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.7),0_0_30px_rgba(245,158,11,0.4)]",
      iconBg: "bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.5)]",
      textGrad: "from-white via-amber-100 to-yellow-400 drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)]",
      pillBg: "bg-amber-500/20 border-amber-400/50 text-amber-200"
    },
    gold: {
      cardBg: "bg-gradient-to-br from-amber-950/80 via-yellow-950/40 to-[#0e0a03]",
      border: "border-amber-400/60 hover:border-amber-300",
      glow: "shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_22px_rgba(251,191,36,0.22)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.7),0_0_32px_rgba(251,191,36,0.45)]",
      iconBg: "bg-amber-400/25 border-amber-300/60 text-amber-100 shadow-[0_0_25px_rgba(251,191,36,0.6)]",
      textGrad: "from-amber-100 via-yellow-300 to-amber-400 drop-shadow-[0_2px_18px_rgba(245,158,11,0.6)]",
      pillBg: "bg-amber-400/20 border-amber-400/50 text-amber-200"
    },
    zinc: {
      cardBg: "bg-gradient-to-br from-zinc-900/70 via-purple-950/20 to-[#08080a]",
      border: "border-purple-500/30 hover:border-purple-400/60",
      glow: "shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_18px_rgba(168,85,247,0.12)] hover:shadow-[0_16px_44px_rgba(0,0,0,0.7),0_0_26px_rgba(168,85,247,0.3)]",
      iconBg: "bg-purple-500/15 border-purple-400/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
      textGrad: "from-white via-zinc-100 to-zinc-300 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]",
      pillBg: "bg-zinc-800/80 border-white/15 text-zinc-300"
    }
  };

  const t = themeStyles[color] || themeStyles.zinc;

  const cardContent = (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className={cn(
        "group relative isolate min-h-[185px] p-5 sm:p-6 rounded-[2.25rem] border backdrop-blur-3xl transition-all duration-500 overflow-hidden touch-manipulation hover:-translate-y-1.5 hover:scale-[1.02] flex flex-col justify-between",
        t.cardBg,
        t.border,
        t.glow,
        onClick && "cursor-pointer"
      )}
    >
      {loading && (
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-pulse z-40" />
      )}

      {/* In-Card Ambient Radial Glows */}
      {color === "gold" && (
        <>
          <div className="pointer-events-none absolute -top-10 -left-10 size-40 rounded-full bg-amber-500/20 blur-2xl z-0" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full bg-yellow-500/15 blur-2xl z-0" />
        </>
      )}
      {color === "cyan" && (
        <>
          <div className="pointer-events-none absolute -top-10 -left-10 size-40 rounded-full bg-cyan-500/20 blur-2xl z-0" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full bg-blue-500/15 blur-2xl z-0" />
        </>
      )}
      {color === "purple" && (
        <>
          <div className="pointer-events-none absolute -top-10 -left-10 size-40 rounded-full bg-purple-500/20 blur-2xl z-0" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full bg-fuchsia-500/15 blur-2xl z-0" />
        </>
      )}
      {color === "amber" && (
        <>
          <div className="pointer-events-none absolute -top-10 -left-10 size-40 rounded-full bg-amber-500/20 blur-2xl z-0" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full bg-orange-500/15 blur-2xl z-0" />
        </>
      )}

      {/* Sweeping Laser Sheen Beam */}
      <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-3 relative z-20">
         <div className={cn(
           "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shrink-0",
           t.iconBg
         )}>
            <Icon size={22} />
         </div>
         
         {progress !== undefined && !badge && (
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                     strokeDasharray={125} strokeDashoffset={125 - Math.min(progress, 100) * 1.25}
                     strokeLinecap="round"
                     className={cn("transition-all duration-1000 ease-out", color === "cyan" ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]" : "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]")} 
                  />
               </svg>
            </div>
         )}

         {badge ? (
           badge
         ) : isPro && (label === "Status" || label === "Membership Status" || label === "Tier Status") ? (
           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-[10px] font-black text-amber-200 tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
             </span>
             PRO MEMBER
           </div>
         ) : !isPro && (label === "Status" || label === "Membership Status" || label === "Tier Status") ? (
           <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-[10px] font-black text-purple-200 tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.3)]">
             FREE TIER
           </div>
         ) : href ? (
           <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-all">
             <ArrowUpRight size={18} />
           </div>
         ) : null}
      </div>
      
      {/* Middle Content */}
      <div className="space-y-1 relative z-20">
         <p className="text-[10.5px] font-black uppercase tracking-[0.25em] text-zinc-400 group-hover:text-zinc-200 transition-colors break-words">{label}</p>
         <div className={cn(
           "font-black tracking-tight break-words",
           (isPro && (label === "Status" || label === "Membership Status" || label === "Tier Status"))
             ? "bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(245,158,11,0.7)] text-3xl sm:text-4xl"
             : typeof value === "string" || typeof value === "number"
               ? cn("text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r bg-clip-text text-transparent", t.textGrad)
               : ""
         )}>
            {(isPro && (label === "Status" || label === "Membership Status" || label === "Tier Status")) ? (
              <span>PRO STUDIO</span>
            ) : value}
         </div>
      </div>

      {/* Optional Footer */}
      {footer && (
        <div className="relative z-20 pt-2.5 mt-2.5 border-t border-white/10">
          {footer}
        </div>
      )}
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="block group/link">{cardContent}</Link>;
  }

  return cardContent;
}
