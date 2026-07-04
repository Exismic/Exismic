"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Cloud,
  Globe,
  Star,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProTourModal({ isOpen, onClose }: ProTourModalProps) {
  const benefits = [
    { 
      title: "Unlimited Generations", 
      desc: "No more daily limits. Create as much as you want.", 
      icon: Zap, 
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    },
    { 
      title: "4K High Definition", 
      desc: "Export your videos and images in stunning 4K quality.", 
      icon: Sparkles, 
      color: "text-accent-cyan",
      bg: "bg-accent-cyan/10"
    },
    { 
      title: "Priority Processing", 
      desc: "Skip the queue. Your tasks get processed 10x faster.", 
      icon: ShieldCheck, 
      color: "text-accent-purple",
      bg: "bg-accent-purple/10"
    },
    { 
      title: "Cloud Backup", 
      desc: "Automatically save all your projects to our secure cloud.", 
      icon: Cloud, 
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    { 
      title: "Global CDN", 
      desc: "Fast access to your files from anywhere in the world.", 
      icon: Globe, 
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    { 
      title: "Early Access", 
      desc: "Be the first to test our new AI tools and features.", 
      icon: Star, 
      color: "text-pink-400",
      bg: "bg-pink-400/10"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center bg-[#030303]/90 p-3 backdrop-blur-xl sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-label="Pro membership benefits"
            className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] sm:rounded-[3rem] sm:p-8 md:p-12"
          >
            {/* Background Architecture */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-purple/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-cyan/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            
            <button 
                onClick={onClose}
                aria-label="Close Pro benefits"
                className="absolute right-4 top-4 z-20 flex min-h-11 min-w-11 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-white/5 hover:text-white sm:right-8 sm:top-8"
            >
                <X size={20} />
            </button>

            <div className="relative z-10 space-y-8 sm:space-y-12">
               <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3 mb-6">
                     <div className="w-12 h-12 rounded-2xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center text-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        <ShieldCheck size={28} />
                     </div>
                     <CheckCircle2 size={20} className="text-emerald-500 animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white sm:text-4xl md:text-6xl">
                     You are a <span className="gradient-text">Pro Member</span>
                  </h2>
                  <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] max-w-md mx-auto">
                     Enjoy the full power of Lumora with your active subscription
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {benefits.map((benefit, i) => (
                    <motion.div 
                       key={i}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="group rounded-[1.75rem] border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10 hover:bg-white/[0.05] sm:rounded-[2.5rem] sm:p-6 md:p-8"
                    >
                       <div className="flex items-center gap-4 sm:gap-6">
                          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-16 sm:w-16 sm:rounded-2xl", benefit.bg, benefit.color)}>
                             <benefit.icon size={28} />
                          </div>
                          <div className="space-y-1.5">
                             <h4 className="text-lg font-black uppercase italic tracking-tight text-white leading-tight">{benefit.title}</h4>
                             <p className="text-[11px] text-zinc-600 font-medium leading-relaxed group-hover:text-zinc-400 transition-colors">{benefit.desc}</p>
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>

               <div className="pt-6">
                  <button 
                      onClick={onClose}
                      className="w-full py-6 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                      Continue Creating
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
