"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wrench, 
  ArrowRight, 
  Bell, 
  CheckCircle2 
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
    <div className="min-h-screen w-full bg-[#04050a] text-white flex items-center justify-center relative overflow-hidden px-4 sm:px-6 py-12 selection:bg-purple-500/30">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,rgba(99,102,241,0.05)_45%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 max-w-md w-full bg-[#070814]/90 border-2 border-purple-500/50 p-8 sm:p-10 rounded-[2rem] backdrop-blur-2xl shadow-[0_25px_80px_-20px_rgba(0,0,0,0.95),0_0_45px_rgba(168,85,247,0.25)] space-y-6 text-center overflow-hidden"
      >

        {/* Ambient Top Glow Bloom */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/[0.08] rounded-full blur-3xl" />

        {/* Icon & Title */}
        <div className="space-y-3 relative z-10">
          <div className="w-15 h-15 rounded-2xl bg-purple-500/10 border border-purple-400/25 flex items-center justify-center text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.2)] mx-auto">
            <Wrench size={24} className="text-purple-300" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white pt-1">
            We'll be right back
          </h1>

          <p className="text-zinc-400 text-xs sm:text-sm font-normal leading-relaxed max-w-xs mx-auto">
            We're making updates to improve your experience. Everything will be back up and running shortly.
          </p>
        </div>

        {/* Email Notification Subscription Form */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3 text-left relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Bell size={14} className="text-purple-400" />
            <span>Notify me when back online</span>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 p-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
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
                className="flex-1 h-11 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.14] focus:border-purple-400/60 focus:bg-white/[0.06] rounded-xl px-3.5 text-xs text-white placeholder:text-zinc-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all duration-200 shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40"
              >
                <span>{isSubmitting ? "Saving..." : "Notify Me"}</span>
                <ArrowRight size={13} />
              </button>
            </form>
          )}
        </div>

        {/* Clean Footer Note */}
        <div className="pt-2 text-center text-xs text-zinc-500 font-normal relative z-10">
          <span>Thank you for your patience</span>
        </div>
      </motion.div>
    </div>
  );
}
