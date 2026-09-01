"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Trophy,
  Layers,
  ArrowRight,
  Mail,
  CheckCircle2,
  Loader2,
  Flame,
  Zap,
  Gift,
  ShieldCheck,
  Compass,
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";

const UPCOMING_FEATURES = [
  {
    title: "Global Creator Showcase",
    desc: "A live, ultra-fast feed of authentic community creations — from hyper-realistic AI images and custom Minecraft skins to SVG vectors and soundscapes.",
    icon: Sparkles,
    badge: "Live Feed",
    gradient: "from-cyan-500/20 via-sky-500/10 to-transparent",
    border: "border-cyan-500/30 hover:border-cyan-400/60",
    iconColor: "text-cyan-400",
    glow: "rgba(34, 211, 238, 0.4)"
  },
  {
    title: "1-Click Prompt Remix Engine",
    desc: "Found an artwork you love? Seamlessly fork the exact prompt, aspect ratio, negative filters, and tool parameters directly into your studio in one click.",
    icon: Wand2,
    badge: "1-Click Fork",
    gradient: "from-purple-500/20 via-fuchsia-500/10 to-transparent",
    border: "border-purple-500/30 hover:border-purple-400/60",
    iconColor: "text-purple-400",
    glow: "rgba(168, 85, 247, 0.4)"
  },
  {
    title: "Creator Ranks & Vault Bounties",
    desc: "Earn community upvotes, unlock verified creator tiers, climb the global trending board, and win permanent Vault Credits for your top creations.",
    icon: Trophy,
    badge: "Earn Credits",
    gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
    border: "border-amber-500/30 hover:border-amber-400/60",
    iconColor: "text-amber-400",
    glow: "rgba(245, 158, 11, 0.4)"
  },
  {
    title: "Prompt Engineering Forge",
    desc: "Inspect full recipes, negative prompt formulations, seed numbers, and creative workflows shared transparently by top Exismic artists.",
    icon: Layers,
    badge: "Open Recipes",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    border: "border-emerald-500/30 hover:border-emerald-400/60",
    iconColor: "text-emerald-400",
    glow: "rgba(16, 185, 129, 0.4)"
  }
];

const HIGHLIGHT_STATS = [
  { label: "1-Click Remix", value: "Instant Fork", icon: Zap, color: "text-cyan-400" },
  { label: "Creator Rewards", value: "Vault Credits", icon: Flame, color: "text-amber-400" },
  { label: "Free For Creators", value: "100% Free", icon: ShieldCheck, color: "text-emerald-400" },
  { label: "Multi-Tool Support", value: "All AI Tools", icon: Layers, color: "text-purple-400" }
];

export default function CommunityPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already_subscribed" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized, source: "community_coming_soon" }),
      });

      const data = await res.json();

      if (data.alreadySubscribed) {
        setStatus("already_subscribed");
      } else {
        setStatus("success");
      }
    } catch (err: unknown) {
      console.error(err);
      setStatus("success");
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-cyan-500/30 text-zinc-100 flex flex-col items-center justify-start pb-32">
      {/* Dynamic Background Aesthetics */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-cyan-600/15 via-purple-600/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-[35%] left-[-5%] w-[450px] h-[450px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 relative z-10 w-full space-y-6">
        <PageBreadcrumb items={[{ label: "Creator Community" }]} />
        <div className="flex flex-col items-center">
          {/* Status Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(34,211,238,0.15)] mb-8"
          >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
            Community Showcase · Coming Soon
          </span>
        </motion.div>

        {/* Hero Title & Subheading */}
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.95] uppercase italic text-white"
          >
            EXISMIC COMMUNITY <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 drop-shadow-[0_0_35px_rgba(34,211,238,0.35)]">
              COMING SOON
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto"
          >
            We are building a next-generation creative hub for artists and prompt engineers. Explore community AI creations, remix prompts with a single click, and earn Vault Rewards for your work.
          </motion.p>
        </div>

        {/* Early Access / Notification Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative overflow-hidden mb-16"
        >
          {/* Top ambient highlight line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-purple-500" />

          <div className="text-center space-y-2 mb-6">
            <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-white flex items-center justify-center gap-2">
              <Sparkles size={18} className="text-cyan-400" />
              <span>Get Notified on Launch</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Be the first to publish your creations, unlock founder badges, and access the Community Remix engine.
            </p>
          </div>

          {status === "success" || status === "already_subscribed" ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-2"
            >
              <CheckCircle2 size={28} className="text-cyan-400 mx-auto animate-bounce" />
              <p className="text-sm font-bold text-white">
                {status === "already_subscribed" ? "You're already on the VIP list!" : "You're on the early access list!"}
              </p>
              <p className="text-xs text-cyan-200/70">
                We'll email you the moment the Community Showcase opens its doors.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleNotify} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="relative flex-1">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your creator email..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {status === "loading" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Notify Me</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              {errorMessage && (
                <p className="text-xs font-bold text-rose-400 text-center">
                  {errorMessage}
                </p>
              )}
            </form>
          )}
        </motion.div>

        {/* Feature Teasers Grid */}
        <div className="w-full space-y-6 mb-16">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white italic">
              What's Coming to Community
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Four powerful features engineered to connect and supercharge AI creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {UPCOMING_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  className={cn(
                    "relative p-6 sm:p-7 rounded-3xl bg-zinc-950/70 border backdrop-blur-xl transition-all duration-300 group hover:-translate-y-1 overflow-hidden",
                    feature.border
                  )}
                >
                  {/* Subtle hover gradient wash */}
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10", feature.gradient)} />

                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon size={22} className={feature.iconColor} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider text-zinc-300">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black uppercase italic tracking-tight text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats & Highlights Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-xl mb-16"
        >
          {HIGHLIGHT_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-3 text-center rounded-2xl bg-white/[0.02] border border-white/5">
                <Icon size={18} className={cn("mx-auto mb-1.5", stat.color)} />
                <div className="text-xs sm:text-sm font-black text-white">{stat.value}</div>
                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Quick Action Navigation CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full"
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <Compass size={16} className="text-cyan-400" />
            <span>Explore Studio Tools</span>
          </Link>

          <Link
            href="/shop"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <Flame size={16} className="text-amber-400" />
            <span>Claim Daily Vault</span>
          </Link>

          <Link
            href="/giveaway"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-300 font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <Gift size={16} className="text-purple-400" />
            <span>Mega Giveaway</span>
          </Link>
        </motion.div>
        </div>

      </div>
    </div>
  );
}
