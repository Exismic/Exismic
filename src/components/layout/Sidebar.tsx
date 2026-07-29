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
}

function SidebarItem({ name, icon: Icon, href, isActive, accentColor = "text-accent-purple", glowColor = "rgba(124, 58, 237, 0.5)", onClick, isCompact }: SidebarItemProps) {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative h-[52px] flex items-center rounded-2xl transition-all duration-300 group mb-1",
          isCompact ? "justify-center w-[52px] mx-auto px-0" : "gap-3.5 px-5",
          isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
        )}
      >
        {/* Active Background - Glassmorphic Depth */}
        {isActive && (
          <motion.div 
            layoutId="sidebarActiveBg"
            className="absolute inset-0 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] -z-10"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        
        {/* Hover Glow Background */}
        <div className="absolute inset-0 bg-white/[0.02] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-20" />

        {/* Active Left Accent Indicator - Cinematic Glow */}
        {isActive && (
          <motion.div 
            layoutId="sidebarActiveBar"
            className={cn(
              "absolute left-0 w-1 h-6 rounded-r-full shadow-[0_0_15px_rgba(168,85,247,0.5)] z-20",
              accentColor.includes('purple') ? "bg-accent-purple" : "bg-current"
            )}
            style={{ backgroundColor: !accentColor.includes('purple') ? glowColor.replace('0.5', '0.8') : undefined }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

        <div className="relative">
          <motion.div
            variants={{
              hover: { scale: 1.1, y: -1 }
            }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              isActive ? "bg-zinc-900 border border-white/10" : "bg-transparent"
            )}
          >
            <Icon size={18} className={cn("transition-colors duration-300", isActive ? accentColor : "group-hover:text-white")} />
          </motion.div>
          
          {/* Dynamic Icon Glow */}
          <div 
            className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-30 transition-opacity -z-10 scale-150" 
            style={{ backgroundColor: glowColor }} 
          />
        </div>

        {!isCompact && (
          <span 
            className={cn(
              "text-[13px] font-black tracking-tight transition-all duration-300 whitespace-nowrap overflow-hidden",
              isActive ? "text-white" : "group-hover:text-zinc-100"
            )}
          >
            {name === 'Go Pro' ? <GradientText className="text-[13px] font-black tracking-tight">{name}</GradientText> : name}
          </span>
        )}
        
        {isActive && !isCompact && (
          <motion.div 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-auto opacity-20"
          >
            <ChevronRight size={12} />
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
      <div className="flex items-center justify-between group">
        <div className="flex-1 min-w-0">
          <SidebarItem 
            name={catName}
            icon={Icon}
            href={`/category/${category.id}`}
            isActive={isCategoryActive}
            accentColor={category.color}
            glowColor={catGlow}
            isCompact={false}
          />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="p-2 text-zinc-500 hover:text-white transition-colors rounded-xl hover:bg-white/5 mr-1"
          aria-label={`Toggle ${catName} tools`}
        >
          <ChevronDown
            size={14}
            className={cn("transition-transform duration-300", isOpen && "rotate-180")}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden pl-5 pr-2 space-y-1 border-l border-white/10 ml-6 my-1"
          >
            {categoryTools.map((tool) => {
              const ToolIcon = ICON_MAP[tool.icon] || Sparkles;
              const isToolActive = pathname === tool.href;

              return (
                <Link key={tool.id} href={tool.href}>
                  <div className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group/tool",
                    isToolActive
                      ? "bg-white/10 text-white border border-white/10 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}>
                    <ToolIcon size={14} className={cn("shrink-0 transition-transform group-hover/tool:scale-110", isToolActive ? "text-amber-400" : "text-zinc-500 group-hover/tool:text-zinc-200")} />
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
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "fixed inset-y-0 left-0 z-[140] w-[calc(100vw-16px)] max-w-[280px] bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800 shadow-2xl lg:static lg:inset-0 transition-[width] duration-300 ease-in-out",
                isCompact ? "lg:w-[88px]" : "lg:w-[280px]"
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
                <nav suppressHydrationWarning className="flex-1 px-4 py-2 space-y-10 overflow-y-auto no-scrollbar relative z-10">
                  <LayoutGroup>
                    {/* Main Menu */}
                    <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="space-y-1">
                       {!isCompact && (
                         <div className="flex items-center justify-between px-6 mb-4">
                            <div className="flex items-center gap-2">
                               <LayoutDashboard size={12} className="text-accent-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                               <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-400">Explore</p>
                            </div>
                            <div className="w-14 h-px bg-gradient-to-r from-accent-purple/40 to-transparent" />
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
                    <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="space-y-1 pt-4">
                       {!isCompact && (
                         <div className="flex items-center justify-between px-6 mb-4">
                            <div className="flex items-center gap-2">
                               <Sparkles size={12} className="text-accent-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                               <p className="text-[10px] font-black uppercase tracking-[0.35em] text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">Studio Tools</p>
                            </div>
                            <div className="w-14 h-px bg-gradient-to-r from-accent-purple/50 to-transparent" />
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
                        <h4 className="animate-gradient-x mt-1 bg-linear-to-r from-cyan-200 via-white to-purple-300 bg-[length:220%_100%] bg-clip-text text-sm font-black leading-none text-transparent">
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
