"use client";

import { motion } from "framer-motion";
import { useState, useEffect, type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
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
  type LucideIcon
} from "lucide-react";
import { TOOLS } from "@/data/tools";
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
import { CATEGORY_ANIM_STYLES } from "@/lib/category-styles";

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
    href: "/tools/image/bg-remover",
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
    href: "/tools/ai/code\?mode=chat",
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
    href: "/tools/format-converter",
    icon: RefreshCw,
    category: "productivity"
  }
];

const PRODUCTIVITY_SUITE: DashboardAction[] = [
  {
    label: "Invoice Generator",
    description: "Generate sleek professional custom PDF invoices for clients instantly.",
    href: "/tools/productivity/invoice",
    icon: Layers,
    category: "productivity"
  },
  {
    label: "PDF Tools",
    description: "Compress, merge, lock, and manage PDF documents directly in-browser.",
    href: "/tools/productivity/pdf",
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
  const supabase = createClient();

  const [gradientOverride, setGradientOverride] = useState<string | null>(null);
  const localGradientId = gradientOverride ?? authUser?.user_metadata?.name_gradient ?? dbUser?.name_gradient ?? null;

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
      if (dbUser?.id) {
        const { data: favs } = await supabase
          .from('Favorite')
          .select('toolId')
          .eq('userId', dbUser.id);
        
        if (favs) setFavorites(favs.map(f => f.toolId));
      }
    };
    fetchFavorites();
  }, [dbUser, supabase]);

  const popularTools = TOOLS.filter(t => t.popular).slice(0, 6);
  const userName = (authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || dbUser?.name || dbUser?.username || authUser?.email?.split('@')[0] || 'Explorer').split(' ')[0];

  return (
    <div className="min-h-screen bg-[#030303] selection:bg-purple-500/30 overflow-x-hidden">
      {/* BACKGROUND ELEMENTS */}
      {isPro ? (
        <ProBackground />
      ) : (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-purple/10 blur-[120px] rounded-full opacity-30" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-blue/10 blur-[120px] rounded-full opacity-30" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 md:pt-16 pb-24 md:pb-32 space-y-12 md:space-y-20">
        
        {/* 1. TOP WELCOME SECTION */}
        <section className="space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-1.5"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex flex-wrap items-center gap-x-3 gap-y-1">
               Welcome back, <PremiumName name={userName} isPro={isPro} gradientId={localGradientId} className="text-3xl sm:text-4xl md:text-5xl" />
            </h1>
            <p className="text-zinc-500 text-base font-semibold tracking-tight">
               What will you build or create today?
            </p>
          </motion.div>
        </section>

        {/* 2. STATS ROW (REFINED GLASS CARDS) */}
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
              label="Pro Status" 
              value={isPro ? "PRO" : "FREE"} 
              icon={isPro ? Crown : ShieldCheck}
              color={isPro ? "purple" : "zinc"}
              loading={statsLoading}
              isPro={isPro}
           />
        </section>

        {/* 3. SUITE WORKSPACE SECTIONS */}
        <section className="space-y-10 md:space-y-16">
          {/* Creative AI Suite */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                 <Wand2 size={18} className="text-accent-purple" />
                 Creative AI Suite
              </h2>
              <p className="text-zinc-500 text-xs font-semibold">Transform and generate art, backgrounds, media, and writing instantly</p>
            </div>
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
              {CREATIVE_SUITE.map((action, idx) => (
                <SuiteCard key={action.label} action={action} i={idx} />
              ))}
            </div>
          </div>

          {/* Developer Tools Suite */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                 <Code2 size={18} className="text-red-500" />
                 Developer Tools
              </h2>
              <p className="text-zinc-500 text-xs font-semibold">Design, preview, test, and convert high-performance clean application code</p>
            </div>
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
              {DEVELOPER_SUITE.map((action, idx) => (
                <SuiteCard key={action.label} action={action} i={idx} />
              ))}
            </div>
          </div>

          {/* Productivity Tools Suite */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                 <Layers size={18} className="text-emerald-400" />
                 Productivity Suite
              </h2>
              <p className="text-zinc-500 text-xs font-semibold">Build professional business invoices, compress data, and convert metrics</p>
            </div>
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
              {PRODUCTIVITY_SUITE.map((action, idx) => (
                <SuiteCard key={action.label} action={action} i={idx} />
              ))}
            </div>
          </div>
        </section>

        {/* 4. POPULAR TOOLS SHOWCASE */}
        <section className="space-y-8 md:space-y-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
             <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                   <Star size={20} className="text-amber-500 fill-amber-500/20" />
                   Popular This Week
                </h2>
                <p className="text-zinc-500 text-sm font-medium">Tools used most by the community</p>
             </div>
             <Link href="/tools" className="group flex min-h-11 w-fit items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <span className="font-bold text-xs text-zinc-400 group-hover:text-white">View All</span>
                <ArrowRight size={14} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
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

        {/* 5. RECENT ACTIVITY & INSIGHTS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 pt-8 border-t border-white/5">
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                 <History className="text-zinc-600" size={20} />
                 <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity</h3>
              </div>
              <RecentlyProcessed />
           </div>

           <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <Zap className="text-accent-purple" size={20} />
                 <h3 className="text-xl font-bold text-white tracking-tight">System Updates</h3>
              </div>
              
              <div className="space-y-4">
                 <motion.div 
                   whileHover={{ x: 5 }}
                   className="p-6 rounded-3xl bg-zinc-900/30 border border-white/5 space-y-3 cursor-pointer group hover:bg-zinc-900/50 transition-colors"
                 >
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                       <Plus size={12} /> New Tool
                    </div>
                    <h4 className="text-white font-bold text-base group-hover:text-cyan-400 transition-colors">AI Video Restorer (Beta)</h4>
                    <p className="text-zinc-500 text-xs leading-relaxed">Restore old videos to 4K with smooth, clear playback. Exclusive for Pro.</p>
                 </motion.div>

                 {!isPro && (
                   <div className="p-8 rounded-[2.5rem] bg-linear-to-br from-accent-purple/20 via-accent-blue/10 to-transparent border border-accent-purple/20 space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                      <div className="space-y-3 relative z-10">
                         <Crown className="text-accent-purple w-8 h-8" />
                         <h4 className="text-xl font-black text-white tracking-tight">Go Pro.</h4>
                         <p className="text-zinc-500 text-xs font-medium leading-relaxed">Unlock priority processing and all premium AI models.</p>
                      </div>
                      <Link href="/pro" className="block relative z-10">
                         <button className="w-full py-3 rounded-2xl bg-white text-black font-bold text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                            Upgrade Now
                         </button>
                      </Link>
                   </div>
                 )}
              </div>
           </div>
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

function StatCard({ label, value, icon: Icon, color, progress, loading, isPro }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "group relative isolate min-h-[160px] p-5 sm:p-6 rounded-[1.75rem] sm:rounded-[2rem] bg-[linear-gradient(145deg,rgba(12,10,24,0.95),rgba(4,7,12,0.98)_55%,rgba(4,13,17,0.95))] backdrop-blur-2xl border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden touch-manipulation hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(0,0,0,0.6)] shadow-xl",
        isPro && "border-accent-purple/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
      )}
    >
      {loading ? (
        <div className="absolute inset-0 bg-zinc-950/40 animate-pulse z-40" />
      ) : null}

      {/* Premium Accents */}
      <div className="absolute inset-x-0 top-0 z-30 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 transition-opacity duration-500 group-hover:opacity-50" />
      <div className={cn(
        "absolute -bottom-10 -right-10 w-48 h-48 blur-[80px] opacity-0 group-hover:opacity-30 transition-all duration-700",
        color === "purple" && "bg-purple-500",
        color === "cyan" && "bg-cyan-400",
        color === "amber" && "bg-amber-400",
        color === "gold" && "bg-amber-300"
      )} />

      {isPro && (
        <div className="absolute -inset-1 bg-accent-purple/5 blur-2xl animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-20">
         <div className={cn(
           "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-[linear-gradient(115deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))] shadow-lg transition-all duration-500 group-hover:scale-110",
           color === "purple" ? "text-accent-purple shadow-[0_0_30px_rgba(168,85,247,0.1)] border-purple-500/20 group-hover:border-purple-500/40 group-hover:bg-purple-500/10" : 
           color === "cyan" ? "text-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.1)] border-cyan-500/20 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10" : 
           color === "amber" ? "text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)] border-amber-500/20 group-hover:border-amber-500/40 group-hover:bg-amber-500/10" : 
           color === "gold" ? "text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.1)] border-amber-400/20 group-hover:border-amber-400/40 group-hover:bg-amber-400/10" : "text-zinc-500 border-white/10"
         )}>
            <Icon size={24} />
         </div>
         
         {progress !== undefined && (
            <div className="relative w-12 h-12 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                     strokeDasharray={125} strokeDashoffset={125 - Math.min(progress, 100) * 1.25}
                     strokeLinecap="round"
                     className={cn(color === "cyan" ? "text-cyan-400" : "text-accent-purple", "transition-all duration-1000 ease-out")} 
                  />
               </svg>
            </div>
         )}
      </div>
      
      <div className="space-y-1 relative z-20">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-400 transition-colors break-words">{label}</p>
         <h3 className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent tracking-tight break-words">
            {isPro && label === "Pro Status" ? (
              <GradientText className="from-accent-purple to-accent-blue cyber-neon-glow drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">PRO</GradientText>
            ) : value}
         </h3>
      </div>
    </motion.div>
  );
}
