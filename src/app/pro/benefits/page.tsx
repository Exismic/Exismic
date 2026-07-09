"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Globe,
  Star,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Crown,
  Archive,
  ImageDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GradientText from "@/components/ui/GradientText";

export default function ProBenefitsPage() {
  const { isPro, isLoading } = usePro();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isPro) {
      router.push('/pro');
    }
  }, [isPro, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-purple animate-spin" />
      </div>
    );
  }

  if (!isPro) return null;

  const benefits = [
    { 
      title: "Unlimited Generations", 
      desc: "No more daily limits. Create as much as you want without worrying about quotas.", 
      icon: Zap, 
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    },
    { 
      title: "4K High Definition", 
      desc: "Export your videos and images in stunning 4K quality for professional results.", 
      icon: Sparkles, 
      color: "text-accent-cyan",
      bg: "bg-accent-cyan/10"
    },
    { 
      title: "Priority Mode",
      desc: "Skip the normal queue with faster routing and premium Modal endpoints where supported.",
      icon: ShieldCheck, 
      color: "text-accent-purple",
      bg: "bg-accent-purple/10"
    },
    { 
      title: "Batch Processing",
      desc: "Upload multiple images in supported tools, process in one go, and download as a ZIP.",
      icon: Archive,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    { 
      title: "No Watermarks + Commercial License",
      desc: "Export clean generated images with commercial usage rights for client and business work.",
      icon: ImageDown,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      title: "Global CDN", 
      desc: "Fast access to your files from anywhere in the world with our global network.", 
      icon: Globe, 
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    { 
      title: "Early Access", 
      desc: "Be the first to test our new AI tools and features before they go public.", 
      icon: Star, 
      color: "text-pink-400",
      bg: "bg-pink-400/10"
    },
    {
      title: "Custom Avatar Frames & Animated Name Styles",
      desc: "Make your identity feel elite with premium frames and profile-wide animated name styles.",
      icon: Crown,
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-400/10"
    },
    {
      title: "Exclusive Profile Themes",
      desc: "Own the look of Exismic with private Pro themes, accents, and polished interface glows.",
      icon: Sparkles,
      color: "text-violet-400",
      bg: "bg-violet-400/10"
    }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32">
      {/* 🔮 Background Architecture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-accent-purple/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-5%] w-[700px] h-[700px] bg-accent-cyan/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 mb-14 md:mb-20"
        >
          <div className="space-y-4 text-center md:text-left">
            <Link href="/" className="inline-flex items-center gap-3 text-zinc-500 hover:text-white transition-all mb-4 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Hub</span>
            </Link>
            <div className="flex items-center justify-center md:justify-start gap-4">
               <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  <ShieldCheck size={32} />
               </div>
               <div className="space-y-1">
                  <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                     <GradientText>Pro Privileges</GradientText>
                  </h1>
                  <div className="flex items-center gap-2 text-emerald-500">
                     <CheckCircle2 size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Active Subscription</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="w-full sm:w-auto px-5 sm:px-8 py-4 rounded-3xl glass-dark border border-white/5 flex items-center justify-between sm:justify-start gap-6">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Plan Status</p>
                <p className="text-sm font-black italic uppercase text-white">Elite Member</p>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple animate-pulse">
                <Sparkles size={24} />
             </div>
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 lg:gap-10 mb-20 md:mb-32">
           {benefits.map((benefit, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="group relative p-6 sm:p-8 lg:p-10 rounded-[2rem] md:rounded-[3.5rem] bg-zinc-950/40 border border-white/5 hover:border-white/20 transition-all duration-700 overflow-hidden"
             >
                {/* 🌈 Dynamic Background Glow */}
                <div className={cn(
                  "absolute -top-20 -right-20 w-64 h-64 blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none",
                  benefit.bg.replace('/10', '')
                )} />
                
                {/* ✨ Animated Border Light (Corner) */}
                <div className={cn(
                  "absolute top-0 left-0 w-32 h-px bg-linear-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000",
                  benefit.color
                )} />
                <div className={cn(
                  "absolute top-0 left-0 h-32 w-px bg-linear-to-b from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000",
                  benefit.color
                )} />

                <div className="space-y-10 relative z-10">
                   <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shrink-0 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-2xl",
                        benefit.bg, 
                        benefit.color,
                        "border border-white/5 group-hover:border-white/20"
                      )}>
                         <benefit.icon size={30} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                      </div>
                      
                      <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <h3 className="text-2xl font-black italic uppercase tracking-tight">
                         <span className="text-white group-hover:gradient-text transition-all duration-500">{benefit.title}</span>
                      </h3>
                      <p className="text-xs font-medium text-zinc-500 leading-relaxed group-hover:text-zinc-300 transition-colors">{benefit.desc}</p>
                   </div>
                   
                   <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-zinc-400">Privilege Level</span>
                      <div className="flex gap-1">
                         {[...Array(5)].map((_, i) => (
                           <div key={i} className={cn("w-1 h-3 rounded-full", i < 4 ? "bg-accent-purple" : "bg-zinc-800")} />
                         ))}
                      </div>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Action Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-6 sm:p-10 md:p-20 rounded-[2rem] md:rounded-[4rem] bg-linear-to-br from-zinc-900 to-black border border-white/5 overflow-hidden text-center space-y-8 md:space-y-10"
        >
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0%,transparent_70%)]" />
           <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                 Ready to Build <br />
                 <span className="gradient-text">Something Great?</span>
              </h2>
              <p className="max-w-xl mx-auto text-zinc-500 font-medium text-lg leading-relaxed">
                 Your Pro status is active. You have full access to our entire suite of professional tools with no restrictions.
              </p>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link href="/" className="px-12 py-6 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-110 active:scale-95 transition-all">
                 Go to Dashboard
              </Link>
              <Link href="/tools" className="px-12 py-6 rounded-2xl glass-dark border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
                 Browse Tools
              </Link>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
