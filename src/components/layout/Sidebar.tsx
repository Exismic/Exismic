"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORIES, TOOLS, ICON_MAP, type Category } from "@/data/tools";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  LayoutDashboard, 
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
  Flame
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

interface SidebarItemProps {
  name: string;
  icon: LucideIcon;
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
  "/favorites": "bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_14px_rgba(251,191,36,0.9)]",
  "/history": "bg-gradient-to-b from-blue-400 via-cyan-400 to-indigo-400 shadow-[0_0_14px_rgba(96,165,250,0.9)]",
  "/referrals": "bg-gradient-to-b from-emerald-400 via-teal-400 to-green-500 shadow-[0_0_14px_rgba(16,185,129,0.9)]",
  "/admin": "bg-gradient-to-b from-rose-400 via-red-500 to-orange-500 shadow-[0_0_14px_rgba(244,63,94,0.9)]",
  "/pro": "bg-gradient-to-b from-purple-300 via-pink-300 to-cyan-300 shadow-[0_0_14px_rgba(168,85,247,0.9)]",

  "/category/image": "bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-500 shadow-[0_0_14px_rgba(34,211,238,0.9)]",
  "/category/video": "bg-gradient-to-b from-violet-400 via-fuchsia-400 to-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.9)]",
  "/category/audio": "bg-gradient-to-b from-pink-400 via-rose-400 to-purple-500 shadow-[0_0_14px_rgba(236,72,153,0.9)]",
  "/category/pdf": "bg-gradient-to-b from-orange-400 via-amber-500 to-red-500 shadow-[0_0_14px_rgba(249,115,22,0.9)]",
  "/category/ai": "bg-gradient-to-b from-amber-300 via-yellow-400 to-purple-400 shadow-[0_0_14px_rgba(250,204,21,0.9)]",
  "/category/productivity": "bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_14px_rgba(16,185,129,0.9)]",
  "/category/developer": "bg-gradient-to-b from-lime-400 via-emerald-400 to-teal-500 shadow-[0_0_14px_rgba(163,230,53,0.9)]",
  "/category/creator": "bg-gradient-to-b from-rose-400 via-pink-400 to-purple-500 shadow-[0_0_14px_rgba(244,63,94,0.9)]",
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
  "/favorites": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-yellow-500/15 group-hover:via-amber-950/20 group-hover:to-transparent",
    border: "group-hover:border-yellow-400/35",
    glow: "rgba(251,191,36,0.5)",
    text: "group-hover:text-yellow-200"
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
  "/category/image": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-cyan-500/15 group-hover:via-cyan-950/20 group-hover:to-transparent",
    border: "group-hover:border-cyan-400/35",
    glow: "rgba(34,211,238,0.5)",
    text: "group-hover:text-cyan-200"
  },
  "/category/video": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-violet-500/15 group-hover:via-violet-950/20 group-hover:to-transparent",
    border: "group-hover:border-violet-400/35",
    glow: "rgba(168,85,247,0.5)",
    text: "group-hover:text-violet-200"
  },
  "/category/audio": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-pink-500/15 group-hover:via-pink-950/20 group-hover:to-transparent",
    border: "group-hover:border-pink-400/35",
    glow: "rgba(236,72,153,0.5)",
    text: "group-hover:text-pink-200"
  },
  "/category/pdf": {
    bg: "group-hover:bg-gradient-to-r group-hover:from-orange-500/15 group-hover:via-orange-950/20 group-hover:to-transparent",
    border: "group-hover:border-orange-400/35",
    glow: "rgba(249,115,22,0.5)",
    text: "group-hover:text-orange-200"
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
};

function SidebarItem({ name, icon: Icon, href, isActive, accentColor = "text-accent-purple", glowColor = "rgba(124, 58, 237, 0.5)", onClick, isCompact, rightElement }: SidebarItemProps) {
  const indicatorGradient = CATEGORY_INDICATOR_GRADIENTS[href] || "bg-gradient-to-b from-purple-400 via-pink-400 to-cyan-400 shadow-[0_0_14px_rgba(168,85,247,0.9)]";
  const hoverStyle = CATEGORY_HOVER_STYLES[href] || {
    bg: "group-hover:bg-gradient-to-r group-hover:from-purple-500/12 group-hover:via-purple-900/10 group-hover:to-transparent",
    border: "group-hover:border-purple-400/35",
    glow: glowColor,
    text: "group-hover:text-purple-200"
  };

  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover="hover"
        whileTap={{ scale: 0.97 }}
        className={cn(
          "relative h-[52px] flex items-center rounded-2xl transition-all duration-300 group mb-1.5",
          isCompact ? "justify-center w-[52px] mx-auto px-0" : "gap-3 px-3.5",
          isActive ? "text-white" : "text-zinc-400 hover:text-white"
        )}
      >
        {/* Active Background - Luminous Glassmorphic Depth */}
        {isActive && (
          <motion.div 
            layoutId="sidebarActiveBg"
            className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-purple-900/15 to-transparent backdrop-blur-xl rounded-2xl border border-purple-400/25 shadow-[0_4px_20px_rgba(168,85,247,0.18),inset_0_1px_0_rgba(255,255,255,0.1)] -z-10"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        
        {/* Ultra-Premium Category Hover Background for Inactive */}
        {!isActive && (
          <div className={cn(
            "absolute inset-0 rounded-2xl border border-transparent backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 -z-20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
            hoverStyle.bg,
            hoverStyle.border
          )} />
        )}

        {/* Active Left Accent Bar - Category Specific Glowing Gradient */}
        {isActive && (
          <motion.div 
            layoutId="sidebarActiveBar"
            className={cn("absolute left-0 w-1.5 h-6 rounded-r-full z-20", indicatorGradient)}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

        {/* Inactive Hover Micro Left Indicator Bar */}
        {!isActive && (
          <div className={cn(
            "absolute left-0 w-1 h-5 rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20",
            indicatorGradient
          )} />
        )}

        {/* Icon Container with Glass Box */}
        <div className="relative shrink-0">
          <motion.div
            variants={{
              hover: { scale: 1.1, y: -1 }
            }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
              isActive 
                ? "bg-gradient-to-br from-purple-500/25 via-purple-800/30 to-indigo-900/40 border border-purple-400/40 text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.35)]" 
                : "bg-white/[0.02] border border-white/5 group-hover:border-white/20 text-zinc-400 group-hover:text-white shadow-sm"
            )}
          >
            <Icon size={17} className={cn("transition-all duration-300", isActive ? "text-purple-200 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" : "group-hover:scale-110", hoverStyle.text)} />
          </motion.div>
          
          {/* Dynamic Ambient Icon Glow */}
          <div 
            className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 -z-10 scale-175 rounded-full pointer-events-none" 
            style={{ backgroundColor: hoverStyle.glow }} 
          />
        </div>

        {!isCompact && (
          <span 
            className={cn(
              "text-[13px] font-extrabold tracking-tight transition-all duration-300 whitespace-nowrap overflow-hidden min-w-0 flex-1 select-none group-hover:translate-x-0.5",
              isActive ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" : "text-zinc-300 group-hover:text-white"
            )}
          >
            {name === 'Go Pro' ? <GradientText className="text-[13px] font-extrabold tracking-tight">{name}</GradientText> : name}
          </span>
        )}
        
        {!isCompact && rightElement && (
          <div className="ml-auto shrink-0 relative z-30">
            {rightElement}
          </div>
        )}

        {isActive && !isCompact && !rightElement && (
          <motion.div 
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-auto text-purple-400 opacity-60 group-hover:opacity-100 transition-opacity"
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
  
  const categoryTools = useMemo(() => {
    const list = TOOLS.filter(t => t.category === category.id);
    return list.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0)).slice(0, 3);
  }, [category.id]);

  const viewStyle = CATEGORY_VIEW_ALL_STYLES[category.id] || CATEGORY_VIEW_ALL_STYLES.student;

  const isCategoryActive = pathname === `/category/${category.id}` || categoryTools.some(t => pathname === t.href);
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
        accentColor={category.color}
        glowColor={catGlow}
        isCompact={true}
      />
    );
  }

  return (
    <div className="relative group/cat space-y-1">
      <SidebarItem 
        name={catName}
        icon={Icon}
        href={`/category/${category.id}`}
        isActive={isCategoryActive}
        accentColor={category.color}
        glowColor={catGlow}
        isCompact={false}
        rightElement={
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            className="p-1.5 flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-200 cursor-pointer active:scale-90 opacity-60 group-hover/cat:opacity-100"
            aria-label={`Toggle ${catName} tools`}
          >
            <ChevronDown
              size={14}
              className={cn("transition-transform duration-300", isOpen && "rotate-180 text-purple-300")}
            />
          </button>
        }
      />

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden pl-4 pr-1 space-y-1.5 border-l-2 border-purple-500/20 ml-6 my-1.5"
          >
            {categoryTools.map((tool) => {
              const ToolIcon = ICON_MAP[tool.icon] || Sparkles;
              const isToolActive = pathname === tool.href;

              return (
                <Link key={tool.id} href={tool.href}>
                  <div className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group/tool select-none",
                    isToolActive
                      ? "bg-gradient-to-r from-purple-500/20 via-indigo-500/15 to-transparent text-white border border-purple-400/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  )}>
                    <ToolIcon size={14} className={cn("shrink-0 transition-transform group-hover/tool:scale-110", isToolActive ? "text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]" : "text-zinc-500 group-hover/tool:text-purple-300")} />
                    <span className="truncate">{tool.name}</span>
                  </div>
                </Link>
              );
            })}

            <Link href={`/category/${category.id}`}>
              <div className={cn(
                "relative overflow-hidden flex items-center justify-between px-3.5 py-2.5 mt-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 group/viewall",
                viewStyle.bg,
                viewStyle.border,
                viewStyle.text,
                "hover:scale-[1.02] active:scale-[0.98]",
                viewStyle.hoverShadow
              )}>
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_3s_linear_infinite]" />
                <span className="relative z-10">
                  View All Tools
                </span>
                <ArrowRight size={13} className="relative z-10 transition-transform group-hover/viewall:translate-x-1" />
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
  const [isOpen, setIsOpen] = useState(true);
  const { isCompact, toggleCompact } = useSidebarStore();
  const { isPro, user: dbUser, isLoading: isProLoading } = usePro();
  const { credits, loading: isCreditsLoading } = useCredits();
  const [session, setSession] = useState<Session | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsOpen(false);
      else setIsOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const topItems = [
    { name: t('common.dashboard'), icon: LayoutDashboard, href: '/', accent: 'text-accent-purple', glow: 'rgba(124, 58, 237, 0.5)' },
    { name: 'Daily Vault', icon: Flame, href: '/shop', accent: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.5)' },
    { name: t('common.favorites'), icon: Star, href: '/favorites', accent: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.5)' },
    { name: t('common.history'), icon: Clock, href: '/history', accent: 'text-blue-400', glow: 'rgba(96, 165, 250, 0.5)' },
    { name: t('common.pro'), icon: Sparkles, href: '/pro', accent: 'text-accent-purple', glow: 'rgba(168, 85, 247, 0.5)' },
    { name: t('common.referrals', 'Referrals'), icon: Users, href: '/referrals', accent: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.5)' },
  ];

  const catGlows: Record<string, string> = {
    image: 'rgba(34, 211, 238, 0.5)',
    video: 'rgba(168, 85, 247, 0.5)',
    audio: 'rgba(236, 72, 153, 0.5)',
    pdf: 'rgba(249, 115, 22, 0.5)',
    ai: 'rgba(250, 204, 21, 0.5)',
    productivity: 'rgba(16, 185, 129, 0.5)',
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
      {/* Mobile Trigger */}
      <button 
        type="button"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        className={cn(
          "fixed top-4 z-[150] min-h-11 min-w-11 lg:hidden glass-dark rounded-[1.1rem] shadow-2xl border-white/10 text-white transition-all duration-500 flex items-center justify-center",
          "left-4"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div 
               suppressHydrationWarning
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            />
            
            <motion.aside 
              suppressHydrationWarning
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "fixed inset-y-0 left-0 z-[140] w-[calc(100vw-16px)] max-w-[300px] bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800 shadow-2xl lg:static lg:inset-0 transition-[width] duration-300 ease-in-out",
                isCompact ? "lg:w-[88px]" : "lg:w-[300px]"
              )}
            >
              {/* Compact Toggle Button */}
              <button 
                onClick={toggleCompact} 
                className={cn(
                  "hidden lg:flex absolute top-[60px] -right-3 w-6 h-6 rounded-full bg-[#0a0a0e] border border-white/10 items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all z-[150] shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                )}
              >
                {isCompact ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
              </button>

              <div suppressHydrationWarning className="flex flex-col h-full relative overflow-hidden">
                {/* Background Noise/Gradient - Lux Style */}
                <div suppressHydrationWarning className="absolute inset-0 bg-[#070708] pointer-events-none" />
                <div suppressHydrationWarning className="absolute inset-0 bg-linear-to-b from-accent-purple/[0.05] via-transparent to-transparent pointer-events-none" />
                <div suppressHydrationWarning className="absolute inset-0 grain opacity-[0.03] pointer-events-none" />
                <div suppressHydrationWarning className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-purple/10 blur-[120px] rounded-full pointer-events-none" />

                {/* Logo / Branding Section - High-Octane Branding */}
                <div className={cn("pt-12 pb-8 relative z-50 flex items-center", isCompact ? "justify-center px-0" : "justify-between px-6")}>
                  <ExismicLogo size={isCompact ? 32 : 42} showText={!isCompact} />
                  
                  {!isCompact && !isProLoading && isPro && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent-purple/10 border border-accent-purple/30 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                       <Crown size={8} className="text-accent-purple" fill="currentColor" />
                       <span className="text-[6.5px] font-black tracking-widest uppercase text-accent-purple">PRO ACTIVE</span>
                    </div>
                  )}

                </div>

                {/* Nav Groups */}
                <nav suppressHydrationWarning className="flex-1 px-4 py-2 space-y-3 overflow-y-auto no-scrollbar relative z-10">
                  <LayoutGroup>
                    {/* Main Menu */}
                    <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="space-y-1">
                       {!isCompact && (
                         <div className="flex items-center justify-between px-4 mb-3 pt-2">
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
                        {!isProLoading && dbUser?.role === 'admin' && (
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
                         <div className="flex items-center justify-between px-4 mb-2 pt-1">
                            <div className="flex items-center gap-2">
                               <Sparkles size={12} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
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
                  </LayoutGroup>
                </nav>

                {/* Footer Section: Credits, Upgrades & User Info */}
                <div suppressHydrationWarning className={cn("mt-auto border-t border-white/5 bg-[#050506]/95 backdrop-blur-3xl space-y-4 relative z-50", isCompact ? "p-3" : "p-5")}>
                  {/* Real-time Credits Display Badge */}
                  {!isCompact && (
                    <div className="group/credits relative overflow-hidden rounded-2xl border border-white/10 bg-[#07070c]/80 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:border-cyan-300/25 hover:shadow-[0_22px_60px_rgba(34,211,238,0.10)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(124,58,237,0.24),transparent_36%),radial-gradient(circle_at_85%_65%,rgba(34,211,238,0.16),transparent_34%)]" />
                    <div className="pointer-events-none absolute inset-y-0 -left-10 w-10 skew-x-[-18deg] bg-white/10 blur-sm transition-transform duration-1000 group-hover/credits:translate-x-64" />
                    <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3 relative z-10">
                      <CreditTokenIcon size="md" />
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 leading-none">Credits</p>
                        <h4 className="mt-1 text-sm font-black leading-none text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                          {isCreditsLoading ? "..." : credits.toLocaleString()}
                        </h4>
                      </div>
                    </div>
                    {!isProLoading && !isPro && (
                      <Link href="/pro" className="relative z-10 shrink-0">
                        <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest text-amber-200 transition-colors hover:bg-amber-300/15">
                          TOP UP
                        </div>
                      </Link>
                    )}
                    </div>
                  </div>
                  )}

                  {/* Ultra Premium Animated Upgrade Button */}
                  {!isCompact && !isProLoading && !isPro && (
                    <Link href="/pro" className="block w-full relative group pb-1">
                      {/* Pulsing Animated Glow Backdrop */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 rounded-full blur-[8px] opacity-60 group-hover:opacity-100 transition duration-1000 animate-gradient-x bg-[length:200%_auto]" />
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="relative w-full py-3.5 rounded-full bg-zinc-950/90 backdrop-blur-xl border border-white/20 text-xs font-black uppercase tracking-[0.2em] overflow-hidden"
                      >
                        {/* Infinite Shimmer Sweep */}
                        <motion.div
                          animate={{ x: ["-200%", "200%"] }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 0.5 }}
                          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                        />

                        <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {/* Pulsing Crown */}
                          <Crown size={15} className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                          
                          {/* Animated Gradient Text */}
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
    </>
  );
}
