"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORIES, ICON_MAP } from "@/data/tools";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  LayoutDashboard, 
  Star, 
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Clock,
  Crown,
  Users
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
                               <LayoutDashboard size={10} className="text-zinc-800" />
                               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Explore</p>
                            </div>
                            <div className="w-12 h-px bg-zinc-900/50" />
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
                    </motion.div>

                    {/* Categories Group */}
                    <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="space-y-1 pt-4">
                       {!isCompact && (
                         <div className="flex items-center justify-between px-6 mb-4">
                            <div className="flex items-center gap-2">
                               <Sparkles size={10} className="text-accent-purple" />
                               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Studio Tools</p>
                            </div>
                            <div className="w-12 h-px bg-zinc-900/50" />
                         </div>
                       )}
                       {CATEGORIES.map((cat) => {
                          const Icon = ICON_MAP[cat.icon];
                          const isActive = pathname === `/category/${cat.id}`;
                          const catName = t(`nav.${cat.id.replace(/-/g, '_')}_tools`, cat.name);
                          return (
                            <div key={cat.id} className="relative group/cat">
                              <SidebarItem 
                                name={catName}
                                icon={Icon}
                                href={`/category/${cat.id}`}
                                isActive={isActive}
                                accentColor={cat.color}
                                glowColor={catGlows[cat.id]}
                                isCompact={isCompact}
                              />
                              {!isCompact && cat.id === 'ai' && (
                                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-accent-purple/10 border border-accent-purple/20 shadow-[0_0_10px_rgba(168,85,247,0.2)] z-30">
                                   <Crown size={8} className="text-accent-purple" fill="currentColor" />
                                   <span className="text-[7px] font-black text-accent-purple uppercase tracking-widest">PRO</span>
                                </div>
                              )}
                            </div>
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
