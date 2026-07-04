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

type DashboardAction = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  glow: string;
  accent: string;
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
    glow: "from-cyan-600/20 to-blue-600/20",
    accent: "text-accent-cyan"
  },
  {
    label: "Background Remover",
    description: "Instantly isolate products, subjects, and portraits from backgrounds.",
    href: "/tools/image/bg-remover",
    icon: Brush,
    glow: "from-purple-600/20 to-pink-600/20",
    accent: "text-accent-purple",
    isPremium: true
  },
  {
    label: "Magic Eraser",
    description: "Remove unwanted objects, text, and defects from photos instantly.",
    href: "/tools/image/eraser",
    icon: Wand2,
    glow: "from-pink-600/20 to-red-600/20",
    accent: "text-pink-500"
  },
  {
    label: "Social Media Caption Generator",
    description: "Create engaging high-conversion copy and captions for your platforms.",
    href: "/tools/social-caption-generator",
    icon: Sparkles,
    glow: "from-amber-600/20 to-orange-600/20",
    accent: "text-amber-500"
  },
  {
    label: "Resume Builder",
    description: "Design premium ATS-optimized professional resumes using smart builders.",
    href: "/tools/resume-builder",
    icon: FileText,
    glow: "from-emerald-600/20 to-teal-600/20",
    accent: "text-emerald-500",
    isPremium: true
  },
  {
    label: "Vocal Remover",
    description: "Extract vocals or split music tracks into clear instrumental stems.",
    href: "/tools/audio/vocal-remover",
    icon: Mic2,
    glow: "from-blue-600/20 to-cyan-600/20",
    accent: "text-accent-blue"
  }
];

const DEVELOPER_SUITE: DashboardAction[] = [
  {
    label: "Code Studio",
    description: "Full stack AI IDE with Monaco editor, live previews, and agentic assistant.",
    href: "/tools/ai/code",
    icon: Code2,
    glow: "from-purple-600/30 via-red-500/30 to-orange-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)]",
    accent: "text-red-500",
    isPremium: true
  },
  {
    label: "AI Code Generator",
    description: "Write, refactor, and debug production code instantly using AI chat.",
    href: "/tools/ai/code?mode=chat",
    icon: Terminal,
    glow: "from-red-600/20 via-orange-500/20 to-yellow-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)]",
    accent: "text-orange-500",
    isPremium: true
  },
  {
    label: "Screenshot to Code",
    description: "Upload mockups and design screenshots to compile clean React markup.",
    href: "/tools/screenshot-to-code",
    icon: Monitor,
    glow: "from-orange-600/20 via-amber-500/20 to-yellow-500/20",
    accent: "text-amber-500",
    isPremium: true
  },
  {
    label: "Format Converter",
    description: "Quickly convert code formats, JSON configurations, and markup languages.",
    href: "/tools/format-converter",
    icon: RefreshCw,
    glow: "from-zinc-600/20 to-zinc-800/20",
    accent: "text-zinc-400"
  }
];

const PRODUCTIVITY_SUITE: DashboardAction[] = [
  {
    label: "Invoice Generator",
    description: "Generate sleek professional custom PDF invoices for clients instantly.",
    href: "/tools/productivity/invoice",
    icon: Layers,
    glow: "from-emerald-600/20 to-cyan-600/20",
    accent: "text-emerald-400"
  },
  {
    label: "PDF Tools",
    description: "Compress, merge, lock, and manage PDF documents directly in-browser.",
    href: "/tools/productivity/pdf",
    icon: FileText,
    glow: "from-red-600/20 to-orange-600/20",
    accent: "text-red-400"
  },
  {
    label: "Unit Converter",
    description: "Convert length, weights, and metrics accurately with conversion scales.",
    href: "/tools/productivity/units",
    icon: Scale,
    glow: "from-blue-600/20 to-zinc-600/20",
    accent: "text-accent-blue"
  }
];

function SuiteCard({ action, i }: { action: DashboardAction; i: number }) {
  return (
    <Link href={action.href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 * i, duration: 0.6 }}
        whileHover={{ y: -4, scale: 1.01 }}
        className={cn(
          "group relative min-h-[190px] p-5 sm:p-6 rounded-[1.75rem] sm:rounded-[2.5rem] bg-zinc-900/20 backdrop-blur-2xl border border-white/5 hover:border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] transition-all duration-500 overflow-hidden h-full flex flex-col justify-between touch-manipulation active:scale-[0.99]",
          action.isPremium && "border-accent-purple/20 bg-linear-to-br from-zinc-900/30 via-zinc-900/30 to-accent-purple/[0.04] shadow-[0_0_30px_rgba(168,85,247,0.05)_inset]"
        )}
      >
        {/* Premium Pro Badge */}
        {action.isPremium && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
            <ProBadge size="sm" type={action.label.includes("Code") || action.label.includes("Screenshot") ? "studio" : "default"} />
          </div>
        )}

        {/* Shine Hover Effect Layer */}
        <div className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden pointer-events-none z-10">
          <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-linear-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Ambient Hover Glows */}
        <div className={cn(
          "absolute -inset-px rounded-[1.75rem] sm:rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl -z-10 bg-linear-to-br",
          action.glow
        )} />

        <div className="space-y-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 md:group-hover:scale-110 md:group-hover:rotate-3 shadow-2xl",
            "bg-zinc-900/40 border border-white/5"
          )}>
            <div className={cn("absolute inset-0 opacity-10 bg-linear-to-br", action.glow)} />
            <action.icon size={22} className={cn("relative z-10 transition-all duration-500 group-hover:scale-110", action.accent)} />
          </div>

          <div className="space-y-1.5">
            <h3 className="pr-10 text-base font-bold leading-snug tracking-tight text-white transition-colors [overflow-wrap:normal] [word-break:normal] group-hover:text-white sm:text-lg">
              {action.label}
            </h3>
            <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500 transition-colors [overflow-wrap:normal] [word-break:normal] group-hover:text-zinc-400 sm:line-clamp-2 sm:text-[13px]">
              {action.description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex min-h-11 items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white transition-all">
          Launch Tool 
          <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-zinc-500 group-hover:text-white" />
        </div>
      </motion.div>
    </Link>
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
        "relative min-h-[150px] p-5 sm:p-6 rounded-[1.75rem] sm:rounded-[2rem] bg-zinc-950/40 backdrop-blur-md border border-white/5 group hover:border-white/10 transition-all duration-500 overflow-hidden touch-manipulation",
        isPro && "border-accent-purple/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
      )}
    >
      {loading ? (
        <div className="absolute inset-0 bg-zinc-950/20 animate-pulse z-20" />
      ) : null}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700",
        color === "purple" && "bg-purple-600",
        color === "cyan" && "bg-cyan-500",
        color === "amber" && "bg-amber-500",
        color === "gold" && "bg-amber-400"
      )} />

      {isPro && (
        <div className="absolute -inset-1 bg-accent-purple/10 blur-2xl animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-6 sm:mb-8 relative z-10">
         <div className={cn(
           "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
           color === "purple" ? "bg-purple-500/10 text-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.2)] border border-purple-500/20" : 
           color === "cyan" ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.2)] border border-cyan-500/20" : 
           color === "amber" ? "bg-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-amber-500/20" : 
           color === "gold" ? "bg-amber-400/10 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)] border border-amber-400/20" : "bg-white/5 text-zinc-500 border border-white/10"
         )}>
            <Icon size={22} />
         </div>
         
         {progress !== undefined && (
            <div className="relative w-10 h-10 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-zinc-900" />
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" 
                     strokeDasharray={100} strokeDashoffset={100 - Math.min(progress, 100)}
                     className={cn(color === "cyan" ? "text-cyan-400" : "text-accent-purple", "transition-all duration-1000")} 
                  />
               </svg>
            </div>
         )}
      </div>
      
      <div className="space-y-1 relative z-10">
         <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors break-words">{label}</p>
         <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight break-words">
            {isPro && label === "Pro Status" ? (
              <GradientText className="from-accent-purple to-accent-blue cyber-neon-glow">PRO</GradientText>
            ) : value}
         </h3>
      </div>
    </motion.div>
  );
}
