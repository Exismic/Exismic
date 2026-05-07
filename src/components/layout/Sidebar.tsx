"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CATEGORIES, ICON_MAP } from "@/data/tools";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Star, 
  HelpCircle,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import GradientText from "../ui/GradientText";
import PremiumButton from "../ui/PremiumButton";
import { usePro } from "@/hooks/usePro";
import { useTranslation } from "react-i18next";

interface SidebarItemProps {
  name: string;
  icon: any;
  href: string;
  isActive: boolean;
  accentColor?: string;
  glowColor?: string;
  onClick?: () => void;
}

function SidebarItem({ name, icon: Icon, href, isActive, accentColor = "text-accent-purple", glowColor = "rgba(124, 58, 237, 0.5)", onClick }: SidebarItemProps) {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative h-[56px] flex items-center gap-4 px-6 rounded-2xl transition-all duration-300 group",
          isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
        )}
      >
        {/* Active Background Glow */}
        {isActive && (
          <motion.div 
            layoutId="sidebarActiveBg"
            className="absolute inset-0 bg-zinc-900/60 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] -z-10"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        
        {/* Active Left Accent Bar */}
        {isActive && (
          <motion.div 
            layoutId="sidebarActiveBar"
            className="absolute left-0 w-1.5 h-8 premium-gradient rounded-r-full shadow-[0_0_20px_rgba(124,58,237,0.8)]"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

        <div className="relative">
          <motion.div
            variants={{
              hover: { scale: 1.15, rotate: 5 }
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className={cn(
              "p-2 rounded-xl transition-all",
              isActive ? "bg-accent-purple/10 text-accent-purple" : "bg-transparent"
            )}
            style={{ 
              color: isActive ? undefined : undefined,
              boxShadow: isActive ? `0 0 15px ${glowColor.replace('0.5', '0.2')}` : 'none'
            }}
          >
            <Icon size={22} className={cn("transition-colors", isActive ? accentColor : "group-hover:text-white")} />
          </motion.div>
          {/* Subtle icon glow on hover */}
          <div className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-40 transition-opacity bg-current -z-10" style={{ color: glowColor }} />
        </div>

        <motion.span 
          variants={{
            hover: { x: 4 }
          }}
          className={cn(
            "text-sm font-bold tracking-tight transition-all",
            isActive ? "text-white" : "group-hover:text-zinc-100"
          )}
        >
          {name === 'Go Pro' ? <GradientText className="text-sm">{name}</GradientText> : name}
        </motion.span>
        
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-auto text-accent-purple/50"
          >
            <ChevronRight size={14} />
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
  const { isPro, isLoading: isProLoading } = usePro();
  const [session, setSession] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const supabase = createClient();

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

  const fullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Explorer";

  return (
    <>
      {/* Mobile Trigger */}
      <button 
        className="fixed top-6 left-6 z-50 p-3 lg:hidden glass-dark rounded-[1.25rem] shadow-2xl border-white/10 text-white"
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
              className="fixed inset-y-0 left-0 z-40 w-[280px] bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800 shadow-2xl lg:static lg:inset-0"
            >
              <div suppressHydrationWarning className="flex flex-col h-full relative overflow-hidden">
                {/* Background Noise/Gradient */}
                <div suppressHydrationWarning className="absolute inset-0 bg-linear-to-b from-accent-purple/[0.03] to-transparent pointer-events-none" />
                <div suppressHydrationWarning className="absolute inset-0 grain opacity-[0.02] pointer-events-none" />

                {/* Logo Area */}
                <div suppressHydrationWarning className="p-10">
                  <Link href="/" className="flex items-center gap-4 group">
                    <div suppressHydrationWarning className="relative">
                      <div suppressHydrationWarning className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center p-[2px] shadow-[0_0_30px_rgba(124,58,237,0.3)] group-hover:rotate-6 transition-transform">
                        <div suppressHydrationWarning className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                          <span className="text-white font-black text-2xl font-mono leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">L</span>
                        </div>
                      </div>
                      <div suppressHydrationWarning className="absolute -inset-2 bg-accent-purple/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full animate-pulse-glow" />
                    </div>
                    <div suppressHydrationWarning className="flex flex-col">
                      <span className="text-2xl font-black tracking-tighter text-white leading-tight">Lumora</span>
                      <div suppressHydrationWarning className="flex items-center gap-1.5">
                         <div suppressHydrationWarning className={cn(
                           "w-1.5 h-1.5 rounded-full animate-pulse",
                           isPro ? "bg-accent-purple shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "bg-zinc-600"
                         )} />
                         <span className={cn(
                           "text-[10px] font-black tracking-[0.3em] uppercase transition-colors",
                           isPro ? "text-accent-purple" : "text-zinc-600"
                         )}>
                           {isPro ? <GradientText className="text-[10px]">PRO ACTIVE</GradientText> : t('common.pro')}
                         </span>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Nav Groups */}
                <nav suppressHydrationWarning className="flex-1 px-4 py-2 space-y-10 overflow-y-auto no-scrollbar relative z-10">
                  <LayoutGroup>
                    {/* Main Menu */}
                    <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="space-y-2">
                       <div className="flex items-center justify-between px-6 mb-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">{t('common.dashboard')}</p>
                          <div className="w-8 h-px bg-zinc-800/50" />
                       </div>
                       {topItems.map((item) => {
                         if (item.name === t('common.pro')) {
                           if (isPro) return null;
                           return (
                             <Link href="/pro" key={item.href} className="block px-2 py-2">
                               <PremiumButton variant="gopro" size="sm" className="w-full" />
                             </Link>
                           );
                         }
                         return (
                           <SidebarItem 
                               key={item.href} 
                               {...item} 
                               isActive={pathname === item.href} 
                               glowColor={item.glow}
                           />
                         );
                       })}
                    </motion.div>

                    {/* Categories Group */}
                    <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="space-y-2 pt-4">
                       <div className="flex items-center justify-between px-6 mb-4">
                          <div className="flex items-center gap-2">
                             <Sparkles size={10} className="text-accent-purple" />
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">{t('common.tools')}</p>
                          </div>
                          <div className="w-8 h-px bg-zinc-800/50" />
                       </div>
                       {CATEGORIES.map((cat) => {
                          const Icon = ICON_MAP[cat.icon];
                          const isActive = pathname === `/category/${cat.id}`;
                          const catName = t(`nav.${cat.id.replace(/-/g, '_')}_tools`, cat.name);
                          return (
                            <SidebarItem 
                              key={cat.id} 
                              name={catName}
                              icon={Icon}
                              href={`/category/${cat.id}`}
                              isActive={isActive}
                              accentColor={cat.color}
                              glowColor={catGlows[cat.id]}
                            />
                          );
                       })}
                    </motion.div>
                  </LayoutGroup>
                </nav>

                {/* Footer Section - Premium Profile */}
                <div className="p-6 mt-auto border-t border-white/5 bg-black/40 backdrop-blur-3xl">
                   <div className="relative group rounded-[2rem] p-[1px] overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
                      {/* Animated Border Glow */}
                      <div className="absolute inset-0 bg-linear-to-r from-accent-purple/40 via-accent-cyan/40 to-accent-purple/40 opacity-0 group-hover:opacity-100 animate-spin-slow transition-opacity duration-700" />
                      
                      <div className="relative bg-zinc-950/80 rounded-[2rem] p-4 flex items-center gap-4 border border-white/5">
                         <div className="absolute inset-0 bg-linear-to-br from-white/[0.03] to-transparent pointer-events-none" />
                         
                         <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl relative z-10">
                               {session?.user?.user_metadata?.avatar_url ? (
                                  <img src={session.user.user_metadata.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                               ) : (
                                  <div className="w-full h-full bg-linear-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
                                    <span className="text-lg font-black text-white">{fullName[0].toUpperCase()}</span>
                                  </div>
                               )}
                            </div>
                            {/* Cinematic Ring */}
                            <div className="absolute -inset-1 border border-accent-purple/30 rounded-[1.2rem] opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
                            
                            {isPro && (
                               <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent-purple rounded-full border-4 border-[#09090b] shadow-[0_0_15px_rgba(168,85,247,0.8)] z-20" />
                            )}
                         </div>
                         
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                               <p className="text-sm font-black text-white truncate tracking-tight leading-none italic">
                                  {isPro ? <GradientText className="font-black italic">{fullName}</GradientText> : fullName}
                               </p>
                            </div>
                            <p className="text-[10px] font-bold text-zinc-600 truncate leading-none mt-1.5 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
                               {session?.user?.email?.split('@')[0] || "Explorer"}
                            </p>
                         </div>
 
                         <Link 
                            href="/account/settings" 
                            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/10 transition-all border border-white/5 group/settings"
                         >
                            <Settings size={16} className="group-hover/settings:rotate-90 transition-transform duration-500" />
                         </Link>
                      </div>
                   </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


