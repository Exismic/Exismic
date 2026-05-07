"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Video, 
  Sparkles, 
  Bell,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Star,
  Film,
  Camera,
  Layers,
  Wand2,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideoBgRemover() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden relative selection:bg-accent-purple/30" suppressHydrationWarning>
      
      {/* 1. Cinematic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-purple/10 blur-[180px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-cyan/10 blur-[180px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        {/* Film Reel Pattern Overlay (Subtle) */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        {/* Floating Film Elements */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[15%] text-accent-cyan/10"
        >
          <Film size={120} strokeWidth={0.5} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-[10%] text-accent-purple/10"
        >
          <Camera size={140} strokeWidth={0.5} />
        </motion.div>
      </div>

      <div className="max-w-5xl w-full text-center space-y-16 relative z-10">
        
        {/* 2. Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent-purple via-accent-cyan to-pink-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative px-6 py-2 bg-zinc-900/80 border border-white/10 rounded-full backdrop-blur-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80 shadow-glow-cyan">Coming Soon</span>
            </div>
          </div>
        </motion.div>

        {/* 3. Hero Header */}
        <div className="space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.9] italic"
          >
            AI Video <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple via-accent-cyan to-pink-500 bg-[length:200%_auto] animate-gradient-x drop-shadow-2xl">
              Background <br /> Remover
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-zinc-500 text-lg md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed"
          >
            Studio-grade precision meets zero technical effort. <br className="hidden md:block" />
            The most powerful AI background removal engine ever built for video.
          </motion.p>
        </div>

        {/* 4. Central Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1.2 }}
          className="relative py-10"
        >
          <div className="absolute inset-0 bg-accent-cyan/10 blur-[100px] rounded-full animate-pulse" />
          <div className="relative mx-auto w-48 h-48 md:w-64 md:h-64 bg-zinc-900 border border-white/10 rounded-[4rem] flex items-center justify-center shadow-5xl rotate-3 hover:rotate-0 transition-transform duration-700 group">
             <div className="absolute inset-4 border-2 border-dashed border-white/5 rounded-[3rem] animate-spin-slow opacity-50" />
             <Camera className="w-24 h-24 md:w-32 md:h-32 text-white group-hover:scale-110 transition-transform duration-700" />
             <div className="absolute -top-6 -right-6 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-accent-purple via-accent-cyan to-pink-500 rounded-3xl flex items-center justify-center shadow-4xl animate-bounce-slow">
                <Wand2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
             </div>
          </div>
        </motion.div>

        {/* 5. Trust Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="flex flex-wrap justify-center gap-6 md:gap-12"
        >
          {[
            { icon: Layers, text: "Studio-Grade Precision" },
            { icon: Zap, text: "Zero Technical Effort" },
            { icon: Cpu, text: "Powered by Neural AI" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 group">
               <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-accent-cyan transition-colors">
                  <item.icon size={18} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* 6. Notification Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="max-w-2xl mx-auto pt-8"
        >
          {isSuccess ? (
            <div className="p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] flex flex-col items-center gap-6 backdrop-blur-xl">
              <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShieldCheck size={40} className="text-white" />
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-2xl font-black uppercase tracking-tight italic text-emerald-400">You're on the list!</h4>
                <p className="text-zinc-500 font-medium italic">We'll invite you to the private beta very soon.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative group transition-all duration-500">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent-purple via-accent-cyan to-pink-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-focus-within:opacity-100" />
              <div className="relative flex items-center p-2 bg-zinc-950/80 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl shadow-5xl">
                <div className="flex-1 flex items-center px-6 md:px-8">
                  <Bell className="w-5 h-5 text-zinc-600 mr-4 shrink-0" />
                  <input
                    type="email"
                    placeholder="Enter your email for early access"
                    className="w-full bg-transparent border-none text-white placeholder:text-zinc-700 text-sm md:text-lg font-medium py-4 outline-none focus:ring-0"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 md:px-12 py-4 bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-purple bg-[length:200%_auto] animate-gradient-x text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.8rem] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-accent-cyan/20 shrink-0"
                >
                  <span className="hidden md:inline">{isSubmitting ? "Processing..." : "Notify Me"}</span>
                  <span className="md:hidden">{isSubmitting ? "..." : "Join"}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* 7. Bottom Footnote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="pt-12 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
             <Star size={12} className="text-accent-purple fill-accent-purple" />
             <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">A Lumora Pro Studio Engine</span>
          </div>
        </motion.div>
      </div>

      {/* 8. Global Styles & Animations */}
      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 6s ease infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-10%); }
          50% { transform: translateY(10%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .shadow-glow-cyan {
          text-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}

function Cpu(props: any) {
  return (
    <svg 
      {...props}
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  );
}
