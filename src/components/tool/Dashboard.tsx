"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Sparkles, 
  Clock, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  History, 
  CreditCard, 
  Cloud, 
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  Search,
  LayoutGrid,
  Crown,
  Activity,
  Plus,
  MousePointer2,
  ChevronRight,
  TrendingUp,
  Star
} from "lucide-react";
import { TOOLS } from "@/data/tools";
import { ToolCard } from "@/components/ui/ToolCard";
import { RecentlyProcessed } from "./RecentlyProcessed";
import Link from "next/link";
import { cn } from "@/lib/utils";
import GradientText from "@/components/ui/GradientText";
import { usePro } from "@/hooks/usePro";

const QUICK_ACTIONS = [
  { label: "New AI Chat", href: "/tools/ai/chat", icon: MessageSquare, color: "purple" },
  { label: "Generate Image", href: "/tools/ai/img-gen", icon: ImageIcon, color: "cyan" },
  { label: "Browse All", href: "/tools", icon: LayoutGrid, color: "zinc" },
];

export function Dashboard() {
  const { isPro, user: dbUser, authUser, isLoading } = usePro();
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return <div className="min-h-screen bg-[#030303]" />;

  return (
    <div className="min-h-screen bg-[#030303] selection:bg-purple-500/30 overflow-x-hidden">
      {/* 1. CINEMATIC BACKGROUND ARCHITECTURE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
           {[...Array(20)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: Math.random() * 1000 }}
               animate={{ 
                 y: [Math.random() * 1000, -100],
                 opacity: [0, 0.4, 0]
               }}
               transition={{ 
                 duration: Math.random() * 20 + 10,
                 repeat: Infinity,
                 ease: "linear"
               }}
               className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
               style={{ left: `${Math.random() * 100}%` }}
             />
           ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-40 space-y-32">
        
        {/* 2. HERO / WELCOME SECTION */}
        <section className="text-center space-y-12">
          <div className="space-y-6">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md shadow-2xl mb-4"
             >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">System Ready • Optimized</span>
             </motion.div>
             
             <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter text-white uppercase italic leading-[0.8] py-4">
                Welcome back, <br />
                <GradientText className="cyber-neon-glow px-4 inline-block">
                  {dbUser?.username || (dbUser?.name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Explorer').split(' ')[0]}
                </GradientText>
             </h1>
             
             <p className="text-xl md:text-2xl text-zinc-500 font-medium uppercase tracking-tight max-w-2xl mx-auto">
                Master the AI Hub <span className="text-zinc-800">•</span> <span className="text-zinc-300">What will you create today?</span>
             </p>
          </div>

          {/* Quick Actions Grid */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-10">
             {QUICK_ACTIONS.map((action, i) => (
               <Link href={action.href} key={i} className="group">
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-4 px-8 py-5 rounded-[2rem] glass-dark border border-white/5 transition-all duration-500",
                      "group-hover:border-white/20 group-hover:bg-white/[0.05] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]",
                      action.color === "purple" && "hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)]",
                      action.color === "cyan" && "hover:shadow-[0_20px_40px_rgba(0,255,255,0.15)]"
                    )}
                  >
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                       action.color === "purple" ? "bg-purple-500/10 text-purple-400" : 
                       action.color === "cyan" ? "bg-cyan-500/10 text-cyan-400" : "bg-white/5 text-zinc-400"
                     )}>
                        <action.icon size={24} />
                     </div>
                     <span className="font-black uppercase tracking-widest text-xs text-white/70 group-hover:text-white transition-colors">
                        {action.label}
                     </span>
                     <ChevronRight size={16} className="text-zinc-600 group-hover:translate-x-1 group-hover:text-white transition-all" />
                  </motion.div>
               </Link>
             ))}
          </div>
        </section>

        {/* 3. STATS ROW (GLASS CARDS) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* Credits Card */}
           <StatCard 
              label="Credits Remaining" 
              value={(dbUser?.aiGenerationsLimit || 50) - (dbUser?.aiGenerationsUsed || 0)} 
              icon={Zap}
              color="cyan"
              progress={(((dbUser?.aiGenerationsLimit || 50) - (dbUser?.aiGenerationsUsed || 0)) / (dbUser?.aiGenerationsLimit || 50)) * 100}
           />
           {/* Tools Card */}
           <StatCard 
              label="Tools Used Today" 
              value={4} 
              icon={Activity}
              color="purple"
           />
           {/* AI Generations Card */}
           <StatCard 
              label="Total Generations" 
              value={dbUser?.aiGenerationsUsed || 0} 
              icon={Sparkles}
              color="amber"
           />
           {/* Pro Status Card */}
           <StatCard 
              label="Account Level" 
              value={isPro ? "PRO" : "FREE"} 
              icon={isPro ? Crown : ShieldCheck}
              color={isPro ? "gold" : "zinc"}
           />
        </section>

        {/* 4. POPULAR TOOLS SHOWCASE */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div className="space-y-4">
                <div className="flex items-center gap-3 text-purple-500">
                   <TrendingUp size={24} />
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Trending Now</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                   Popular <br />
                   <span className="gradient-text">Instruments.</span>
                </h2>
             </div>
             <Link href="/tools" className="group flex items-center gap-4 text-zinc-600 hover:text-white transition-colors">
                <span className="font-black uppercase tracking-[0.3em] text-[10px]">Explore All 50+ Tools</span>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all">
                   <ArrowRight size={16} />
                </div>
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        {/* 5. RECENT ACTIVITY & UPDATES */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                 <History className="text-zinc-700" />
                 <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Recent Activity</h3>
              </div>
              <RecentlyProcessed />
           </div>

           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <Star className="text-amber-500" />
                 <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Pro Insights</h3>
              </div>
              
              <div className="space-y-4">
                 <motion.div 
                   whileHover={{ x: 10 }}
                   className="p-8 rounded-[2rem] glass-dark border border-white/5 space-y-4 cursor-pointer group"
                 >
                    <div className="flex items-center gap-3 text-cyan-400">
                       <Zap size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">New Update</span>
                    </div>
                    <h4 className="text-white font-black text-lg leading-tight group-hover:text-cyan-400 transition-colors">AI Video Restorer is now in Beta for Pro users.</h4>
                    <p className="text-zinc-600 text-[10px] font-medium leading-relaxed uppercase tracking-tight">Restore legacy footage to 4K with temporal stability.</p>
                 </motion.div>

                 <motion.div 
                   whileHover={{ x: 10 }}
                   className="p-8 rounded-[2rem] glass-dark border border-white/5 space-y-4 cursor-pointer group"
                 >
                    <div className="flex items-center gap-3 text-purple-400">
                       <Sparkles size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Tip of the Day</span>
                    </div>
                    <h4 className="text-white font-black text-lg leading-tight group-hover:text-purple-400 transition-colors">Use 'Vibe' prompts for more creative AI images.</h4>
                    <p className="text-zinc-600 text-[10px] font-medium leading-relaxed uppercase tracking-tight">Combine artistic styles with cinematic lighting descriptors.</p>
                 </motion.div>
              </div>

              {!isPro && (
                <div className="p-10 rounded-[3rem] bg-linear-to-br from-purple-600/20 via-blue-600/10 to-transparent border border-purple-500/20 space-y-8 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                   <div className="space-y-4 relative z-10">
                      <Crown className="text-purple-400 w-10 h-10" />
                      <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic">Go Unlimited.</h4>
                      <p className="text-zinc-500 text-xs font-medium leading-relaxed">Unlock high-priority processing and exclusive models.</p>
                   </div>
                   <Link href="/pro" className="block relative z-10">
                      <button className="w-full py-4 rounded-xl premium-gradient text-white font-black uppercase tracking-widest text-[10px] shadow-4xl hover:scale-[1.02] transition-all">
                         Upgrade to Pro
                      </button>
                   </Link>
                </div>
              )}
           </div>
        </section>
      </div>

      <style jsx global>{`
        .cyber-neon-glow {
          filter: drop-shadow(0 0 15px rgba(124, 58, 237, 0.4));
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, progress }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative p-8 rounded-[3rem] glass-dark border border-white/5 group hover:border-white/20 transition-all duration-500 overflow-hidden"
    >
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700",
        color === "purple" && "bg-purple-600",
        color === "cyan" && "bg-cyan-500",
        color === "amber" && "bg-amber-500",
        color === "gold" && "bg-amber-400"
      )} />

      <div className="flex items-center justify-between mb-10 relative z-10">
         <div className={cn(
           "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
           color === "purple" ? "bg-purple-500/10 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]" : 
           color === "cyan" ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.2)]" : 
           color === "amber" ? "bg-amber-500/10 text-amber-500" : 
           color === "gold" ? "bg-amber-400/10 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]" : "bg-white/5 text-zinc-500"
         )}>
            <Icon size={26} />
         </div>
         
         {progress !== undefined && (
           <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                 <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-900" />
                 <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                    strokeDasharray={126} strokeDashoffset={126 - (126 * progress) / 100}
                    className={cn(color === "cyan" ? "text-cyan-400" : "text-purple-400", "transition-all duration-1000")} 
                 />
              </svg>
              <span className="absolute text-[8px] font-black text-white">{Math.round(progress)}%</span>
           </div>
         )}
      </div>
      
      <div className="space-y-2 relative z-10">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-zinc-400 transition-colors">{label}</p>
         <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
            {value === "PRO" ? <GradientText>PRO</GradientText> : value}
         </h3>
      </div>
    </motion.div>
  );
}
