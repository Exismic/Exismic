"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  History, 
  Image as ImageIcon,
  Crown,
  Activity,
  Star,
  ArrowUpRight,
  Plus,
  Wand2,
  Brush,
  FileText,
  Mic2,
  Code2,
  Terminal,
  Monitor,
  RefreshCw,
  Layers,
  Scale,
  Search,
  X,
  Command,
  Flame,
  Filter,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  type LucideIcon
} from "lucide-react";
import { TOOLS, ICON_MAP } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";
import { RecentlyProcessed } from "./RecentlyProcessed";
import Link from "next/link";
import { ProBadge } from "../ui/ProBadge";
import { cn } from "@/lib/utils";
import GradientText from "@/components/ui/GradientText";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { PremiumName } from "@/components/ui/PremiumName";
import { usePro } from "@/hooks/usePro";
import { PRICING_CONFIG } from "@/config/pricing";
import { ProBackground } from "@/components/pro/ProBackground";
import { CyberAliveBackground } from "@/components/ui/CyberAliveBackground";
import { CATEGORY_ANIM_STYLES } from "@/lib/category-styles";
import { FAVORITES_CHANGED_EVENT } from "@/lib/favorites";

type DashboardAction = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category?: keyof typeof CATEGORY_ANIM_STYLES;
  isPremium?: boolean;
};

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  color: "cyan" | "purple" | "amber" | "gold" | "zinc";
  progress?: number;
  loading?: boolean;
  isPro?: boolean;
  href?: string;
  badge?: ReactNode;
};

const CREATIVE_SUITE: DashboardAction[] = [
  {
    label: "AI Image Generator",
    description: "Generate stunning high-fidelity 4K art and photos from text prompts.",
    href: "/tools/ai/img-gen",
    icon: ImageIcon,
    category: "ai"
  },
  {
    label: "Background Remover",
    description: "Instantly isolate products, subjects, and portraits from backgrounds.",
    href: "/tools/image/eraser",
    icon: Brush,
    isPremium: true,
    category: "image"
  },
  {
    label: "Magic Eraser",
    description: "Remove unwanted objects, text, and defects from photos instantly.",
    href: "/tools/image/eraser",
    icon: Wand2,
    category: "image"
  },
  {
    label: "Social Media Caption Generator",
    description: "Create engaging high-conversion copy and captions for your platforms.",
    href: "/tools/social-caption-generator",
    icon: Sparkles,
    category: "ai"
  },
  {
    label: "Resume Builder",
    description: "Design premium ATS-optimized professional resumes using smart builders.",
    href: "/tools/resume-builder",
    icon: FileText,
    isPremium: true,
    category: "productivity"
  },
  {
    label: "Vocal Remover",
    description: "Extract vocals or split music tracks into clear instrumental stems.",
    href: "/tools/audio/vocal-remover",
    icon: Mic2,
    category: "audio"
  }
];

const DEVELOPER_SUITE: DashboardAction[] = [
  {
    label: "Code Studio",
    description: "Full stack AI IDE with Monaco editor, live previews, and agentic assistant.",
    href: "/tools/ai/code",
    icon: Code2,
    isPremium: true,
    category: "ai"
  },
  {
    label: "AI Code Generator",
    description: "Write, refactor, and debug production code instantly using AI chat.",
    href: "/tools/ai/code?mode=chat",
    icon: Terminal,
    isPremium: true,
    category: "ai"
  },
  {
    label: "Screenshot to Code",
    description: "Upload mockups and design screenshots to compile clean React markup.",
    href: "/tools/screenshot-to-code",
    icon: Monitor,
    isPremium: true,
    category: "ai"
  },
  {
    label: "Format Converter",
    description: "Quickly convert code formats, JSON configurations, and markup languages.",
    href: "/tools/image/converter",
    icon: RefreshCw,
    category: "productivity"
  }
];

const PRODUCTIVITY_SUITE: DashboardAction[] = [
  {
    label: "Invoice Generator",
    description: "Generate sleek professional custom PDF invoices for clients instantly.",
    href: "/tools/invoice-generator",
    icon: Layers,
    category: "productivity"
  },
  {
    label: "PDF Tools",
    description: "Compress, merge, lock, and manage PDF documents directly in-browser.",
    href: "/tools/pdf/merger",
    icon: FileText,
    category: "pdf"
  },
  {
    label: "Unit Converter",
    description: "Convert length, weights, and metrics accurately with conversion scales.",
    href: "/tools/productivity/units",
    icon: Scale,
    category: "productivity"
  }
];

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
    name: "Code Studio", 
    href: "/tools/ai/code", 
    icon: Code2, 
    badge: "PRO IDE", 
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
    badge: "DOC PDF", 
    theme: {
      idleBg: "bg-gradient-to-br from-emerald-950/80 via-teal-950/50 to-zinc-950/90",
      border: "border-emerald-500/50 hover:border-emerald-300",
      glow: "shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_45px_rgba(16,185,129,0.7)]",
      iconBg: "bg-emerald-500/20 border-emerald-400/50 text-emerald-200",
      badge: "bg-emerald-500/30 border-emerald-400/50 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.5)]",
      pulseColor: "bg-emerald-400"
    }
  },
  { 
    name: "Post Formatter", 
    href: "/tools/social-caption-generator", 
    icon: Sparkles, 
    badge: "VIRAL COPY", 
    theme: {
      idleBg: "bg-gradient-to-br from-violet-950/80 via-purple-950/50 to-zinc-950/90",
      border: "border-violet-500/50 hover:border-violet-300",
      glow: "shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:shadow-[0_0_45px_rgba(139,92,246,0.7)]",
      iconBg: "bg-violet-500/20 border-violet-400/50 text-violet-200",
      badge: "bg-violet-500/30 border-violet-400/50 text-violet-200 shadow-[0_0_12px_rgba(139,92,246,0.5)]",
      pulseColor: "bg-violet-400"
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

function SuiteCard({ action, i }: { action: DashboardAction; i: number }) {
  const isPro = action.isPremium;
  const style = CATEGORY_ANIM_STYLES[action.category || "ai"] || CATEGORY_ANIM_STYLES.ai;
  const Icon = action.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * i, duration: 0.6 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative h-full min-w-0"
    >
      <Link href={action.href} className="block h-full rounded-[1.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303] sm:rounded-[2.5rem] md:rounded-[3rem]">
        <div className={cn(
          "relative h-full min-h-[260px] flex flex-col p-5 sm:p-6 md:p-8 backdrop-blur-3xl transition-all duration-500 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden touch-manipulation",
          "border border-white/5",
          isPro 
            ? "bg-zinc-950/60 border-amber-500/20 shadow-[inset_0_1px_2px_rgba(245,158,11,0.1),0_0_15px_rgba(245,158,11,0.05)] hover:border-amber-400/60 hover:shadow-[0_0_50px_rgba(245,158,11,0.25)]" 
            : cn("bg-zinc-950/50 hover:bg-zinc-900/60 transition-all duration-500 border", style.cardBorder),
          "md:group-hover:scale-[1.03] active:scale-[0.99]"
        )}>
          {/* Shine Animation Layer */}
          <div className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden pointer-events-none z-10">
            <div className={cn(
              "absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/10 to-transparent",
              isPro && "via-amber-500/20"
            )} />
          </div>

          {/* Badges */}
          {isPro && (
             <div className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 z-20">
               <div className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 backdrop-blur-md border border-amber-400/40 text-[8px] font-black uppercase tracking-widest text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                 <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_3s_linear_infinite]" />
                 <Crown size={9} className="relative z-10 fill-amber-200 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                 <span className="relative z-10">Pro</span>
               </div>
             </div>
          )}

          {/* Icon Section */}
          <div className="mb-6 sm:mb-8 relative pr-20 sm:pr-24">
            <div className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center relative overflow-hidden md:group-hover:rotate-6 md:group-hover:scale-110 transition-all duration-500 shadow-2xl",
              "bg-[#0b0c12] border border-white/5",
            )}>
              <div className={cn("absolute inset-0 blur-xl animate-pulse transition-colors duration-500", isPro ? "bg-amber-500/20 group-hover:bg-amber-400/40" : style.aura)} />
              <div className={cn("absolute inset-[-100%] animate-[spin_3s_linear_infinite] transition-colors duration-500", isPro ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.4)_25%,transparent_50%)] group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.9)_25%,transparent_50%)]" : cn(style.spinIdle, style.spinHover))} />
              <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] md:rounded-[calc(2rem-1.5px)] bg-[#0b0c12] z-0 overflow-hidden">
                <div className={cn("absolute inset-0 bg-gradient-to-br from-white/5 to-transparent", isPro && "from-amber-500/10")} />
                <motion.div
                  className={cn("absolute top-0 left-[-100%] h-full w-[50%] skew-x-[-20deg]", isPro ? "bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" : "bg-gradient-to-r from-transparent via-white/10 to-transparent")}
                  animate={{ left: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatType: "mirror" }}
                />
              </div>
              <Icon className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 transition-all duration-700 z-10",
                "group-hover:scale-110",
                isPro ? "text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] group-hover:text-amber-200 group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.9)]" : style.iconGlow
              )} />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-3">
            <h3 className={cn(
              "text-xl sm:text-2xl font-black tracking-tighter leading-tight transition-colors break-words text-transparent bg-clip-text bg-[length:200%_100%] animate-[shine_4s_linear_infinite]",
              isPro ? "bg-[linear-gradient(110deg,#fde68a_0%,#ffffff_45%,#fbbf24_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(245,158,11,0.2)]" : style.textGrad
            )}>
              {action.label}
            </h3>
            <p className="text-xs sm:text-[13px] font-medium text-zinc-500 line-clamp-3 sm:line-clamp-2 leading-relaxed tracking-tight group-hover:text-zinc-300 transition-colors break-words">
              {action.description}
            </p>
          </div>

          {/* Premium Button CTA */}
          <div className="mt-6 sm:mt-8">
            <div className={cn(
              "w-full min-h-12 py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all duration-500 relative overflow-hidden",
              isPro 
                ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-[1.02] group-hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] border border-amber-300/50" 
                : cn("group-hover:scale-[1.02] border shadow-lg", style.buttonGrad)
            )}>
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_2s_linear_infinite]" />
              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                Launch Tool
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
              </span>
            </div>
          </div>

          {/* Ambient Bottom Glow */}
          <div className={cn(
            "absolute inset-x-16 bottom-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-[0.5px]",
            isPro ? "bg-linear-to-r from-transparent via-amber-400 to-transparent" : "bg-linear-to-r from-transparent via-white/50 to-transparent"
          )} />
        </div>
      </Link>
    </motion.div>
  );
}

export function Dashboard() {
  const { 
    creditsRemaining, 
    toolsUsedToday, 
    totalGenerations, 
    isPro, 
    loading: statsLoading 
  } = useDashboardStats();
  const { user: dbUser, authUser } = usePro();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [gradientOverride, setGradientOverride] = useState<string | null>(null);
  
  // Interactive Dashboard States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const localGradientId = gradientOverride ?? authUser?.user_metadata?.name_gradient ?? dbUser?.name_gradient ?? null;

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
  const userName = (authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || dbUser?.name || dbUser?.username || authUser?.email?.split('@')[0] || 'Explorer').split(' ')[0];

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 md:pt-14 pb-24 md:pb-32 space-y-12 md:space-y-16">
        
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
                    <div className="relative overflow-hidden inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-cyan-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-black uppercase tracking-widest backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
                      </span>
                      <GreetingIcon size={13} className="text-amber-400 animate-pulse" />
                      <span>{greeting.text}</span>
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

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white flex flex-wrap items-center gap-x-3.5 gap-y-1 drop-shadow-[0_2px_20px_rgba(255,255,255,0.1)]">
                 Welcome back, <PremiumName name={userName} isPro={isPro} gradientId={localGradientId} className="text-4xl sm:text-5xl lg:text-6xl" />
              </h1>

              <p className="text-zinc-400 text-base sm:text-lg font-medium leading-relaxed tracking-tight">
                 Your next-gen AI workspace. Launch engines, process media, and build products seamlessly.
              </p>
            </motion.div>

            {/* Right: Cyber Purple VIP Pro Banner Card (Only visible to Free Users) */}
            {!isPro && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: [0, -6, 0],
                }}
                transition={{ 
                  y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.5 }
                }}
                whileHover={{ scale: 1.025 }}
                className="group relative isolate lg:max-w-md w-full shrink-0 my-1"
              >
                {/* Outer Rounded Container */}
                <div className="relative rounded-[2.35rem] p-[2px] overflow-hidden border border-purple-400/50 bg-[#0a0418]">
                  
                  {/* Spinning Conic Light Beam Ring */}
                  <div className="absolute inset-[-100%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,#a855f7_0%,#ec4899_25%,#06b6d4_50%,#fbbf24_75%,#a855f7_100%)] opacity-90 group-hover:opacity-100 transition-opacity" />

                  {/* Card Content Container (Solid dark glass background, 0 backdrop-blur tile clipping) */}
                  <div className="relative p-6 sm:p-7 rounded-[2.25rem] bg-gradient-to-br from-[#160933] via-[#0d051a] to-[#06020e] space-y-5 overflow-hidden shadow-[inset_0_0_30px_rgba(168,85,247,0.25)]">
                    
                    {/* In-Card Ambient Radial Light Orbs */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-purple-600/35 via-fuchsia-500/25 to-transparent blur-xl rounded-full pointer-events-none z-0" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-cyan-500/25 via-indigo-600/25 to-transparent blur-xl rounded-full pointer-events-none z-0" />

                    {/* Sweeping Laser Sheen Beam */}
                    <div className="absolute -inset-y-10 -left-full w-[250%] pointer-events-none z-10 group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-[-25deg]">
                      <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/35 via-purple-200/45 to-transparent" />
                    </div>

                    {/* Top Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-20">
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-amber-400 p-[1.5px] shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.6)] group-hover:scale-110 transition-transform">
                          <div className="w-full h-full rounded-[calc(1rem-1.5px)] bg-[#0c0617] flex items-center justify-center">
                            <Crown size={22} className="fill-amber-300 text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,1)] animate-pulse sm:w-6 sm:h-6" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] sm:tracking-[0.25em] text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] leading-tight">
                            EXISMIC PRO STUDIO
                          </span>
                          <h3 className="text-sm sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-fuchsia-200 to-cyan-200 tracking-tight drop-shadow-[0_2px_15px_rgba(168,85,247,0.6)] leading-tight">
                            UNLOCK UNLIMITED POWER
                          </h3>
                        </div>
                      </div>

                      <div className="self-start sm:self-auto px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/30 to-fuchsia-500/30 border border-purple-400/70 text-purple-100 text-[9px] font-black uppercase tracking-widest whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-1.5 animate-pulse">
                        <Crown size={10} className="text-amber-300 fill-amber-300 shrink-0" />
                        <span>PRO PASS</span>
                      </div>
                    </div>

                    {/* Subtitle & Value Proposition */}
                    <p className="text-xs sm:text-sm font-bold text-zinc-200 leading-relaxed relative z-20">
                      Supercharge your workflow with unlimited AI credits, 4K ultra-render speeds, 10x faster generations & commercial rights.
                    </p>

                    {/* Bullet Feature Pills */}
                    <div className="grid grid-cols-2 gap-2.5 relative z-20 pt-1">
                      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-[11px] font-bold text-purple-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(168,85,247,0.25)]">
                        <Zap size={14} className="text-cyan-300 fill-cyan-300/60" />
                        <span>Unlimited Credits</span>
                      </div>
                      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-[11px] font-bold text-purple-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(168,85,247,0.25)]">
                        <Sparkles size={14} className="text-fuchsia-300" />
                        <span>4K Ultra Render</span>
                      </div>
                      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-[11px] font-bold text-purple-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(168,85,247,0.25)]">
                        <ShieldCheck size={14} className="text-purple-300" />
                        <span>Commercial Rights</span>
                      </div>
                      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-[11px] font-bold text-purple-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(168,85,247,0.25)]">
                        <Crown size={14} className="text-amber-300" />
                        <span>Pro Code IDE</span>
                      </div>
                    </div>

                    {/* Action Button CTA (Liquid Gold VIP Masterpiece) */}
                    <div className="pt-2 relative z-20">
                      <Link 
                        href="/pro/benefits" 
                        className="group/btn relative overflow-hidden w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_55px_rgba(245,158,11,0.9)] hover:scale-[1.03] active:scale-95 transition-all duration-300 border border-amber-200/60"
                      >
                        {/* Hardware GPU-Accelerated Liquid Sheen Beam (120 FPS, 0 stutter, 0 cut jumps) */}
                        <motion.div
                          className="absolute -inset-y-10 -left-full w-[250%] pointer-events-none z-10 skew-x-[-25deg]"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ repeat: Infinity, duration: 2.8, ease: "linear" }}
                        >
                          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/50 via-amber-100/60 to-transparent" />
                        </motion.div>

                        <Crown size={18} className="fill-amber-950 text-amber-950 shrink-0 drop-shadow-sm" />
                        <span className="relative z-10 font-black tracking-widest">UPGRADE TO PRO STUDIO</span>
                        <ArrowRight size={18} className="relative z-10 shrink-0 group-hover/btn:translate-x-2 transition-transform duration-300" />
                      </Link>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
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

        {/* 2. STATS ROW (LUXURY GLASS WIDGETS) */}
        <section className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr))]">
           <StatCard 
              label="Credits Remaining" 
              value={creditsRemaining.toLocaleString()} 
              icon={Zap}
              color="cyan"
              loading={statsLoading}
              progress={(creditsRemaining / (isPro ? PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS : 50)) * 100}
           />
           <StatCard 
              label="Tools Used Today" 
              value={toolsUsedToday} 
              icon={Activity}
              color="purple"
              loading={statsLoading}
           />
           <StatCard 
              label="Total Generations" 
              value={totalGenerations.toLocaleString()} 
              icon={Sparkles}
              color="amber"
              loading={statsLoading}
           />
           <StatCard 
              label="Status" 
              value={isPro ? "PRO" : "FREE"} 
              icon={isPro ? Crown : ShieldCheck}
              color={isPro ? "purple" : "zinc"}
              loading={statsLoading}
              isPro={isPro}
              href="/pro/benefits"
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
                {activeTab === "all" && <Sparkles size={22} className="text-purple-400" />}
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

      <style jsx global>{`
        .cyber-neon-glow {
          filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.3));
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, progress, loading, isPro, href, badge }: StatCardProps) {
  const themeStyles = {
    cyan: {
      cardBg: "bg-gradient-to-br from-cyan-950/80 via-blue-950/40 to-zinc-950/90",
      border: "border-cyan-500/40 hover:border-cyan-300",
      glow: "shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_55px_rgba(6,182,212,0.6)]",
      iconBg: "bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.5)]",
      textGrad: "from-white via-cyan-100 to-cyan-400 drop-shadow-[0_2px_15px_rgba(6,182,212,0.4)]",
      pillBg: "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
    },
    purple: {
      cardBg: "bg-gradient-to-br from-purple-950/80 via-fuchsia-950/40 to-zinc-950/90",
      border: "border-purple-500/40 hover:border-purple-300",
      glow: "shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:shadow-[0_0_55px_rgba(168,85,247,0.6)]",
      iconBg: "bg-purple-500/20 border-purple-400/50 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.5)]",
      textGrad: "from-white via-purple-100 to-fuchsia-400 drop-shadow-[0_2px_15px_rgba(168,85,247,0.4)]",
      pillBg: "bg-purple-500/20 border-purple-400/50 text-purple-200"
    },
    amber: {
      cardBg: "bg-gradient-to-br from-amber-950/80 via-yellow-950/40 to-zinc-950/90",
      border: "border-amber-500/40 hover:border-amber-300",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_55px_rgba(245,158,11,0.6)]",
      iconBg: "bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.5)]",
      textGrad: "from-white via-amber-100 to-yellow-400 drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)]",
      pillBg: "bg-amber-500/20 border-amber-400/50 text-amber-200"
    },
    gold: {
      cardBg: "bg-gradient-to-br from-amber-950/90 via-yellow-950/60 to-zinc-950/95",
      border: "border-amber-400/60 hover:border-amber-300",
      glow: "shadow-[0_0_35px_rgba(251,191,36,0.3)] hover:shadow-[0_0_65px_rgba(251,191,36,0.7)]",
      iconBg: "bg-amber-400/25 border-amber-300/60 text-amber-100 shadow-[0_0_25px_rgba(251,191,36,0.6)]",
      textGrad: "from-amber-100 via-yellow-300 to-amber-400 drop-shadow-[0_2px_18px_rgba(245,158,11,0.6)]",
      pillBg: "bg-amber-400/20 border-amber-400/50 text-amber-200"
    },
    zinc: {
      cardBg: "bg-gradient-to-br from-zinc-900/90 via-purple-950/30 to-zinc-950/90",
      border: "border-purple-500/30 hover:border-purple-400/60",
      glow: "shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:shadow-[0_0_45px_rgba(168,85,247,0.4)]",
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
      className={cn(
        "group relative isolate min-h-[175px] p-6 rounded-[2.25rem] border backdrop-blur-3xl transition-all duration-500 overflow-hidden touch-manipulation hover:-translate-y-1.5 hover:scale-[1.02]",
        t.cardBg,
        t.border,
        t.glow
      )}
    >
      {loading && (
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-pulse z-40" />
      )}

      {/* Sweeping Laser Sheen Beam */}
      <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-6 relative z-20">
         <div className={cn(
           "w-13 h-13 rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shrink-0",
           t.iconBg
         )}>
            <Icon size={24} />
         </div>
         
         {progress !== undefined && (
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
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
         ) : isPro && (label === "Status" || label === "Pro Status") ? (
           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-[10px] font-black text-amber-200 tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
             </span>
             PRO MEMBER
           </div>
         ) : !isPro && (label === "Status" || label === "Pro Status") ? (
           <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-[10px] font-black text-purple-200 tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.3)]">
             FREE TIER
           </div>
         ) : href ? (
           <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-all">
             <ArrowUpRight size={18} />
           </div>
         ) : null}
      </div>
      
      {/* Bottom Content */}
      <div className="space-y-1 relative z-20">
         <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 group-hover:text-zinc-200 transition-colors break-words">{label}</p>
         <h3 className={cn(
           "text-4xl sm:text-5xl font-black bg-gradient-to-r bg-clip-text text-transparent tracking-tight break-words",
           t.textGrad
         )}>
            {(isPro && (label === "Status" || label === "Pro Status")) ? (
              <GradientText className="from-amber-200 via-yellow-300 to-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.7)]">PRO</GradientText>
            ) : value}
         </h3>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="block group/link">{cardContent}</Link>;
  }

  return cardContent;
}
