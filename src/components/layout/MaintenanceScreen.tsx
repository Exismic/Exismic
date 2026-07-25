"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wrench, 
  Sparkles, 
  ArrowRight, 
  Bell, 
  CheckCircle2,
  ShieldAlert,
  Lock
} from "lucide-react";

export function MaintenanceScreen() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#04050a] text-white flex items-center justify-center relative overflow-hidden px-4 sm:px-6 py-12 font-sans selection:bg-purple-500/30">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,rgba(99,102,241,0.06)_45%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 max-w-lg w-full bg-[#090b14]/90 border border-white/[0.08] p-8 sm:p-11 rounded-3xl sm:rounded-[2.5rem] backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.12)] space-y-7 text-center overflow-hidden"
      >
        {/* Shimmering Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400" />

        {/* Icon & Title */}
        <div className="space-y-4">
          <div className="relative inline-block">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300 shadow-[0_0_35px_rgba(168,85,247,0.25)] mx-auto relative">
              <Wrench size={30} className="text-purple-300 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Sparkles size={11} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-300">
                Scheduled Maintenance
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none pt-1">
              System Upgrade <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
                In Progress
              </span>
            </h1>
          </div>

          <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto">
            We are currently performing scheduled maintenance to improve system performance. We will be back online shortly. Thank you for your patience!
          </p>
        </div>

        {/* Email Notification Subscription Form */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/70 border border-white/[0.06] space-y-3 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Bell size={14} className="text-purple-400" />
            <span>Get notified when we are back online</span>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
              <CheckCircle2 size={16} />
              <span>You're on the list! We'll email you as soon as site access is restored.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>{isSubmitting ? "Saving..." : "Notify Me"}</span>
                <ArrowRight size={13} />
              </button>
            </form>
          )}
        </div>

        {/* Bottom Footer Row */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span className="uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Status: Temporary Hold
          </span>

          <a 
            href="/auth/login" 
            className="hover:text-white transition-colors font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1"
          >
            <Lock size={10} /> Admin Access &rarr;
          </a>
        </div>
      </motion.div>
    </div>
  );
}
