"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Bot, 
  Wrench, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Bell, 
  CheckCircle2,
  Clock
} from "lucide-react";

interface Props {
  isAdmin?: boolean;
  onBypass?: () => void;
}

export function SupportAgentMaintenanceScreen({ isAdmin = false, onBypass }: Props) {
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
    }, 700);
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,rgba(6,182,212,0.08)_45%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 max-w-xl w-full bg-[#070814]/90 border border-white/10 p-8 sm:p-12 rounded-[2.5rem] backdrop-blur-2xl shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.2)] space-y-8 text-center overflow-hidden"
      >
        {/* Subtle Conic Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/[0.12] rounded-full blur-3xl" />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-[10px] font-black uppercase tracking-[0.25em] shadow-[0_0_15px_rgba(245,158,11,0.25)]">
          <Clock size={12} className="animate-pulse" />
          <span>Scheduled Engine Maintenance</span>
        </div>

        {/* Icon Showcase */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#0b0c16] border border-white/10 flex items-center justify-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-cyan-500/10 to-transparent rounded-3xl blur-md animate-pulse" />
          <div className="relative z-10 flex items-center justify-center">
            <Bot size={48} className="text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md">
              <Wrench size={15} />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase italic">
            Support Agent Offline
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
            The Exismic Support Agent engine, document embeddings pipeline, and widget servers are currently undergoing scheduled upgrades and optimizations.
          </p>
        </div>

        {/* Updates Info Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-300">
            <Sparkles size={13} />
            <span>What's Being Upgraded</span>
          </div>
          <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
            <li>Faster inference with upgraded embedding models</li>
            <li>Real-time document sync and multi-language support</li>
            <li>Customizable widget styling & zero-latency visitor streaming</li>
          </ul>
        </div>

        {/* Email Notification Option */}
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Bell size={13} className="text-purple-400" />
            <span>Get notified when the Support Agent is back:</span>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 p-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span>You're on the list! We'll notify you as soon as this tool is back online.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-11 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] focus:border-purple-400/60 rounded-xl px-3.5 text-xs text-white placeholder:text-zinc-500 outline-hidden transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs transition-all duration-200 shadow-[0_0_20px_rgba(168,85,247,0.35)] active:scale-95 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <span>{isSubmitting ? "Saving..." : "Notify Me"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 text-xs font-black uppercase tracking-wider text-zinc-300 transition-all hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>

          <Link
            href="/tools"
            className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-purple-600/20 border border-purple-500/30 px-6 text-xs font-black uppercase tracking-wider text-purple-200 transition-all hover:bg-purple-600/30 hover:text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            Explore Other Tools
          </Link>

          {isAdmin && onBypass && (
            <button
              onClick={onBypass}
              className="w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 text-xs font-black uppercase tracking-wider text-amber-300 transition-all hover:bg-amber-500/20"
            >
              <ShieldCheck size={14} />
              Admin Bypass
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
