"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Clock, 
  Star, 
  ArrowRight, 
  ArrowUpRight,
  Crown, 
  FolderLock, 
  History, 
  Compass, 
  Zap,
  CheckCircle2,
  type LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_MAP, type Tool } from "@/data/tools";
import { usePersonalizedHome, getEffectiveToolCategory } from "@/hooks/usePersonalizedHome";
import { PremiumName } from "@/components/ui/PremiumName";
import { SparkIcon } from "@/components/ui/SparkIcon";
import { CATEGORY_ANIM_STYLES, type CategoryAnimStyle } from "@/lib/category-styles";

interface PersonalizedHomeSectionProps {
  userName: string;
  isPro?: boolean;
  initialFavorites?: string[];
  gradientId?: string | null;
  greeting: { text: string; icon: LucideIcon };
  statsSlot?: React.ReactNode;
}

function getStyleForTool(tool?: Tool | null): CategoryAnimStyle {
  const effectiveCat = getEffectiveToolCategory(tool);
  return CATEGORY_ANIM_STYLES[effectiveCat] || CATEGORY_ANIM_STYLES.image;
}

export function PersonalizedHomeSection({
  userName,
  isPro = false,
  initialFavorites = [],
  gradientId = null,
  greeting,
  statsSlot,
}: PersonalizedHomeSectionProps) {
  const {
    continueUsing,
    recentlyUsed,
    favoriteTools,
    hasCustomFavorites,
    recommendedTools,
  } = usePersonalizedHome(initialFavorites);

  const GreetingIcon = greeting.icon;

  const continueStyle = getStyleForTool(continueUsing.tool);
  const ContinueToolIcon =
    continueUsing.tool?.icon && ICON_MAP[continueUsing.tool.icon]
      ? ICON_MAP[continueUsing.tool.icon]
      : ICON_MAP.Wand2;

  return (
    <div className="space-y-12 sm:space-y-14">
      {/* 1. ADAPTIVE GREETING & STATUS COCKPIT */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="space-y-2.5">
          {/* Greeting Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-cyan-500/15 border border-purple-400/30 text-purple-200 text-xs font-black uppercase tracking-wider backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span suppressHydrationWarning className="inline-flex items-center gap-1.5">
              <GreetingIcon size={14} className="text-amber-400 animate-pulse" />
              <span>{greeting.text}</span>
            </span>
            {isPro && (
              <span className="inline-flex items-center gap-1 ml-1 text-amber-300 font-black">
                · <Crown size={12} className="fill-amber-400 text-amber-400 inline" /> Pro Pass Active
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white flex flex-wrap items-center gap-x-3 gap-y-1">
            Welcome back,{" "}
            <PremiumName
              name={userName}
              isPro={isPro}
              gradientId={gradientId}
              className="text-4xl sm:text-5xl lg:text-6xl"
            />
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
            Your personalized AI cockpit. Resume past generations, launch bookmarked suites, and accelerate your workflow.
          </p>
        </div>

        {/* Studio Quick Shortcuts */}
        <div className="flex flex-wrap items-center gap-3.5 self-start sm:self-auto shrink-0">
          {/* 1. Cloud Drive Button */}
          <div className="relative group inline-flex">
            {/* Radiant Exterior Aura */}
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/60 via-sky-400/50 to-blue-500/40 blur-md opacity-75 group-hover:opacity-100 group-hover:blur-lg transition-all duration-300" />

            <Link
              href="/library"
              className="relative inline-flex items-center gap-2.5 pl-2.5 pr-4 py-2.5 rounded-2xl bg-gradient-to-b from-[#0e2742]/95 via-[#081a2e]/95 to-[#04101d]/98 border border-cyan-400/70 hover:border-cyan-300 text-white text-xs font-black transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),inset_0_0_16px_rgba(6,182,212,0.3),0_4px_20px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.65),inset_0_0_24px_rgba(6,182,212,0.5),0_8px_28px_rgba(6,182,212,0.55)] hover:scale-[1.02] active:scale-95 overflow-hidden backdrop-blur-xl cursor-pointer"
            >
              {/* Ambient Glass Shimmer Sweep */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-cyan-200/25 to-transparent skew-x-12" />

              {/* Glowing Icon Core */}
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/40 via-cyan-500/30 to-blue-600/35 border border-cyan-300 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.7),inset_0_1px_2px_rgba(255,255,255,0.5)] group-hover:scale-105 group-hover:border-white transition-all shrink-0">
                <FolderLock size={16} className="text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,1)]" />
              </div>

              {/* Label */}
              <span className="tracking-tight text-[13px] font-bold text-white group-hover:text-cyan-100 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                Cloud Drive
              </span>

              {/* Micro Arrow */}
              <ArrowUpRight
                size={14}
                className="text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,1)] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
              />
            </Link>
          </div>

          {/* 2. Creation Vault Button */}
          <div className="relative group inline-flex">
            {/* Radiant Exterior Aura */}
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/60 via-fuchsia-500/50 to-violet-500/40 blur-md opacity-75 group-hover:opacity-100 group-hover:blur-lg transition-all duration-300" />

            <Link
              href="/history"
              className="relative inline-flex items-center gap-2.5 pl-2.5 pr-4 py-2.5 rounded-2xl bg-gradient-to-b from-[#2a1347]/95 via-[#1a0b30]/95 to-[#0f041d]/98 border border-purple-400/70 hover:border-purple-300 text-white text-xs font-black transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),inset_0_0_16px_rgba(168,85,247,0.3),0_4px_20px_rgba(0,0,0,0.6),0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.65),inset_0_0_24px_rgba(168,85,247,0.5),0_8px_28px_rgba(168,85,247,0.55)] hover:scale-[1.02] active:scale-95 overflow-hidden backdrop-blur-xl cursor-pointer"
            >
              {/* Ambient Glass Shimmer Sweep */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-purple-200/25 to-transparent skew-x-12" />

              {/* Glowing Icon Core */}
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400/40 via-fuchsia-500/30 to-violet-600/35 border border-purple-300 text-purple-100 shadow-[0_0_16px_rgba(168,85,247,0.7),inset_0_1px_2px_rgba(255,255,255,0.5)] group-hover:scale-105 group-hover:border-white transition-all shrink-0">
                <History size={16} className="text-purple-100 drop-shadow-[0_0_8px_rgba(168,85,247,1)]" />
              </div>

              {/* Label */}
              <span className="tracking-tight text-[13px] font-bold text-white group-hover:text-purple-100 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                Creation Vault
              </span>

              {/* Micro Arrow */}
              <ArrowUpRight
                size={14}
                className="text-purple-300 drop-shadow-[0_0_6px_rgba(168,85,247,1)] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
              />
            </Link>
          </div>

          {/* 3. Sparks Shop Button */}
          <div className="relative group inline-flex">
            {/* Radiant Exterior Aura */}
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/65 via-yellow-500/55 to-orange-500/45 blur-md opacity-75 group-hover:opacity-100 group-hover:blur-lg transition-all duration-300" />

            <Link
              href="/rewards"
              className="relative inline-flex items-center gap-2.5 pl-2.5 pr-4 py-2.5 rounded-2xl bg-gradient-to-b from-[#3a2203]/95 via-[#261502]/95 to-[#140b01]/98 border border-amber-400/80 hover:border-amber-300 text-white text-xs font-black transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),inset_0_0_16px_rgba(245,158,11,0.35),0_4px_20px_rgba(0,0,0,0.6),0_0_22px_rgba(245,158,11,0.45)] hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.65),inset_0_0_24px_rgba(245,158,11,0.55),0_8px_28px_rgba(245,158,11,0.6)] hover:scale-[1.02] active:scale-95 overflow-hidden backdrop-blur-xl cursor-pointer"
            >
              {/* Ambient Glass Shimmer Sweep */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent skew-x-12" />

              {/* Glowing Icon Core */}
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/45 via-yellow-500/35 to-orange-600/40 border border-amber-300 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.8),inset_0_1px_2px_rgba(255,255,255,0.5)] group-hover:scale-105 group-hover:border-white transition-all shrink-0">
                <SparkIcon size={16} variant="amber" animated />
              </div>

              {/* Label */}
              <span className="tracking-tight text-[13px] font-extrabold text-amber-200 group-hover:text-amber-100 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.9),0_0_10px_rgba(245,158,11,0.7)]">
                Sparks Shop
              </span>

              {/* Micro Arrow */}
              <ArrowUpRight
                size={14}
                className="text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,1)] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
              />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 2. EXECUTIVE VITALS HUD (4 STAT REACTOR CARDS) */}
      {statsSlot && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          className="w-full"
        >
          {statsSlot}
        </motion.div>
      )}

      {/* 3. CONTINUE USING — EXACT TOOLCARD LUXURY COCKPIT CARD */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.6 }}
        className="space-y-3.5"
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-white">
              {continueUsing.isNewUser ? "GET STARTED" : "CONTINUE USING"}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono font-semibold text-zinc-300">
            <Clock size={12} className="text-zinc-400" />
            <span>{continueUsing.timeAgo}</span>
          </div>
        </div>

        {/* Flagship Continue Card */}
        <div
          className={cn(
            "group relative rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 backdrop-blur-3xl transition-all duration-500 overflow-hidden touch-manipulation",
            "bg-gradient-to-b from-[#0e0f17]/95 via-[#0a0a10]/90 to-[#06060a]/95 border-2",
            continueStyle.cardBorder
          )}
        >
          {/* Continuous Hover Shine Sweep */}
          <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden pointer-events-none z-10">
            <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          {/* Ambient Glowing Mesh Auras */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
            <div
              className={cn(
                "absolute -top-16 -left-16 w-80 h-80 rounded-full blur-[80px] transition-all duration-700 opacity-35 group-hover:opacity-65 group-hover:scale-110",
                continueStyle.aura
              )}
            />
            <div
              className={cn(
                "absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[90px] transition-all duration-700 opacity-25 group-hover:opacity-50",
                continueStyle.aura
              )}
            />
            {/* Micro Dot Matrix Watermark */}
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04] group-hover:opacity-[0.08] transition-opacity" />
            {/* Giant Background Watermark Category Icon */}
            <div className="absolute -top-6 -right-6 opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6 pointer-events-none">
              <ContinueToolIcon
                size={240}
                strokeWidth={1}
                className={cn("transition-colors duration-500", continueStyle.iconGlow)}
              />
            </div>
          </div>

          {/* Content Row */}
          <div className="relative z-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
            {/* Left: Icon Orb & Identity */}
            <div className="flex items-start sm:items-center gap-5 sm:gap-6 min-w-0">
              {/* Conic Spinning Icon Box */}
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl sm:rounded-[2rem] flex items-center justify-center relative overflow-hidden group-hover:rotate-6 group-hover:scale-105 transition-all duration-500 shadow-2xl shrink-0 bg-[#0b0c12] border border-white/10">
                <div
                  className={cn(
                    "absolute inset-0 blur-xl animate-pulse transition-colors duration-500",
                    continueStyle.aura
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-[-100%] animate-[spin_3s_linear_infinite] transition-colors duration-500",
                    continueStyle.spinIdle,
                    continueStyle.spinHover
                  )}
                />
                <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] sm:rounded-[calc(2rem-1.5px)] bg-[#0b0c14] z-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                </div>
                <ContinueToolIcon
                  className={cn(
                    "w-9 h-9 sm:w-11 sm:h-11 transition-all duration-700 z-10 group-hover:scale-110",
                    continueStyle.iconGlow
                  )}
                />
              </div>

              {/* Text & Activity Snippet */}
              <div className="space-y-2.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={cn(
                      "text-[9.5px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm",
                      continueStyle.badge
                    )}
                  >
                    {continueUsing.tool?.category || "IMAGE"}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span>Engine Ready</span>
                  </span>
                </div>

                <h3
                  className={cn(
                    "text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text truncate pb-1.5 pt-0.5 leading-normal",
                    continueStyle.textGrad
                  )}
                >
                  {continueUsing.tool?.name || "AI Image Generator"}
                </h3>

                {/* Prompt Preview Terminal Box */}
                {continueUsing.prompt ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-zinc-300 max-w-full backdrop-blur-xl shadow-inner">
                    <Zap size={13} className="text-cyan-400 shrink-0 animate-pulse" />
                    <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider shrink-0">
                      {continueUsing.isNewUser ? "Featured:" : "Recent:"}
                    </span>
                    <span className="truncate text-white font-medium">
                      &ldquo;{continueUsing.prompt}&rdquo;
                    </span>
                  </div>
                ) : (
                  <p className="text-zinc-400 text-xs sm:text-sm font-medium line-clamp-1">
                    {continueUsing.tool?.description || "Pick up your session and process creations with 1 click"}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Big Full-Fidelity Launch Button */}
            <div className="flex items-center gap-3 self-end lg:self-auto shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
              <Link
                href={continueUsing.replayUrl}
                className={cn(
                  "w-full sm:w-auto min-h-12 py-3.5 sm:py-4 px-8 sm:px-10 rounded-full flex items-center justify-center gap-3 font-black uppercase tracking-[0.18em] text-xs sm:text-sm transition-all duration-500 relative overflow-hidden isolate transform-gpu group-hover:scale-[1.02] cursor-pointer",
                  continueStyle.buttonGrad
                )}
              >
                <Zap size={16} className="relative z-10 animate-pulse" />
                <span className="relative z-10">
                  {continueUsing.isNewUser ? "Start Creating" : "Continue Session"}
                </span>
                <ArrowRight size={16} className="relative z-10 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. YOUR FAVORITES — FULL-FIDELITY TOOLCARDS (MATCHING CATALOG STYLES) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]">
              <Star size={12} className="fill-amber-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-sm">
              YOUR FAVORITES
            </span>
          </div>

          <span className="text-[11px] font-bold text-zinc-400">
            {hasCustomFavorites
              ? `${favoriteTools.length} Saved Tools`
              : "Studio Essentials · Star tools across catalog to pin here"}
          </span>
        </div>

        {/* Favorite Tool Cards Grid — Exact Same Proportions as Other Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteTools.map((tool) => {
            const Icon = tool.icon && ICON_MAP[tool.icon] ? ICON_MAP[tool.icon] : ICON_MAP.Wand2;
            const style = getStyleForTool(tool);

            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="block h-full rounded-[2.5rem] focus-visible:outline-none"
              >
                <div
                  className={cn(
                    "relative h-full min-h-[260px] flex flex-col justify-between p-6 sm:p-8 backdrop-blur-3xl transition-all duration-500 rounded-[2.5rem] overflow-hidden touch-manipulation",
                    "bg-gradient-to-b from-[#0e0f17]/90 via-[#0a0a10]/85 to-[#06060a]/90 transition-all duration-500 border-2",
                    style.cardBorder,
                    "hover:scale-[1.03] active:scale-[0.99] group"
                  )}
                >
                  {/* Hover Shine Sweep */}
                  <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-10">
                    <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  {/* Ambient Aura */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                    <div
                      className={cn(
                        "absolute -top-12 -left-12 w-64 h-64 rounded-full blur-[70px] transition-all duration-700 opacity-30 group-hover:opacity-60 group-hover:scale-125",
                        style.aura
                      )}
                    />
                    <div
                      className={cn(
                        "absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-[80px] transition-all duration-700 opacity-20 group-hover:opacity-40",
                        style.aura
                      )}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04] group-hover:opacity-[0.09] transition-opacity duration-500" />
                    <div className="absolute -top-6 -right-6 opacity-[0.04] group-hover:opacity-[0.09] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6 pointer-events-none">
                      <Icon size={160} strokeWidth={1} className={cn("transition-colors duration-500", style.iconGlow)} />
                    </div>
                  </div>

                  {/* Top Row: Icon on left, Favorite Star Button on right */}
                  <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-2xl shrink-0 bg-[#0b0c12] border border-white/5">
                      <div
                        className={cn(
                          "absolute inset-0 blur-xl animate-pulse transition-colors duration-500",
                          style.aura
                        )}
                      />
                      <div
                        className={cn(
                          "absolute inset-[-100%] animate-[spin_3s_linear_infinite] transition-colors duration-500",
                          style.spinIdle,
                          style.spinHover
                        )}
                      />
                      <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#0b0c12] z-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                      </div>
                      <Icon
                        className={cn(
                          "w-8 h-8 transition-all duration-700 z-10 group-hover:scale-110",
                          style.iconGlow
                        )}
                      />
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <Star size={16} className="fill-amber-400" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0 relative z-10 mb-4">
                    <h3
                      className={cn(
                        "text-lg sm:text-xl font-black tracking-tight leading-snug transition-colors break-words text-transparent bg-clip-text",
                        style.textGrad
                      )}
                    >
                      {tool.name}
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-[13px] font-medium text-zinc-400 line-clamp-4 leading-relaxed tracking-tight group-hover:text-zinc-200 transition-colors">
                      {tool.description}
                    </p>
                  </div>

                  {/* Premium Full-Width Rounded Button */}
                  <div className="mt-4 relative z-10">
                    <div
                      className={cn(
                        "w-full min-h-12 py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 font-black uppercase tracking-[0.18em] text-[11px] text-white transition-all duration-500 relative overflow-hidden isolate transform-gpu group-hover:scale-[1.02]",
                        style.buttonGrad
                      )}
                    >
                      <span className="relative z-10">Launch Tool</span>
                      <ArrowRight size={14} className="relative z-10 transition-transform duration-500 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.section>

      {/* 4. RECENTLY USED — FULL-FIDELITY TOOLCARDS */}
      {recentlyUsed.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-purple-400/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                <Clock size={12} className="text-purple-300" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-fuchsia-200 to-cyan-200 drop-shadow-sm">
                RECENTLY USED
              </span>
            </div>

            <Link
              href="/history"
              className="group text-[11px] font-black text-purple-300 hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>View All History</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyUsed.map((item) => {
              const ToolIcon =
                item.tool?.icon && ICON_MAP[item.tool.icon]
                  ? ICON_MAP[item.tool.icon]
                  : ICON_MAP.Wand2;
              const style = getStyleForTool(item.tool);

              return (
                <Link
                  key={item.tool.id}
                  href={item.replayUrl}
                  className="block h-full rounded-[2.5rem] focus-visible:outline-none"
                >
                  <div
                    className={cn(
                      "relative h-full min-h-[260px] flex flex-col justify-between p-6 sm:p-8 backdrop-blur-3xl transition-all duration-500 rounded-[2.5rem] overflow-hidden touch-manipulation",
                      "bg-gradient-to-b from-[#0e0f17]/90 via-[#0a0a10]/85 to-[#06060a]/90 transition-all duration-500 border-2",
                      style.cardBorder,
                      "hover:scale-[1.03] active:scale-[0.99] group"
                    )}
                  >
                    {/* Hover Shine Sweep */}
                    <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-10">
                      <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    {/* Ambient Glow Aura */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                      <div
                        className={cn(
                          "absolute -top-12 -left-12 w-64 h-64 rounded-full blur-[70px] transition-all duration-700 opacity-30 group-hover:opacity-60 group-hover:scale-125",
                          style.aura
                        )}
                      />
                      <div
                        className={cn(
                          "absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-[80px] transition-all duration-700 opacity-20 group-hover:opacity-40",
                          style.aura
                        )}
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04] group-hover:opacity-[0.09] transition-opacity duration-500" />
                      <div className="absolute -top-6 -right-6 opacity-[0.04] group-hover:opacity-[0.09] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6 pointer-events-none">
                        <ToolIcon size={160} strokeWidth={1} className={cn("transition-colors duration-500", style.iconGlow)} />
                      </div>
                    </div>

                    {/* Top Row: Icon on left, Timestamp on right */}
                    <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-2xl shrink-0 bg-[#0b0c12] border border-white/5">
                        <div
                          className={cn(
                            "absolute inset-0 blur-xl animate-pulse transition-colors duration-500",
                            style.aura
                          )}
                        />
                        <div
                          className={cn(
                            "absolute inset-[-100%] animate-[spin_3s_linear_infinite] transition-colors duration-500",
                            style.spinIdle,
                            style.spinHover
                          )}
                        />
                        <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#0b0c12] z-0 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                        </div>
                        <ToolIcon
                          className={cn(
                            "w-8 h-8 transition-all duration-700 z-10 group-hover:scale-110",
                            style.iconGlow
                          )}
                        />
                      </div>

                      <div
                        className={cn(
                          "relative z-10 px-3 py-1 rounded-full border text-[10.5px] font-mono font-bold shadow-sm",
                          style.badge
                        )}
                      >
                        {item.timeAgo}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0 relative z-10 mb-4">
                      <h3
                        className={cn(
                          "text-lg sm:text-xl font-black tracking-tight leading-snug transition-colors break-words text-transparent bg-clip-text",
                          style.textGrad
                        )}
                      >
                        {item.tool.name}
                      </h3>
                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-[13px] font-medium text-zinc-400 line-clamp-4 leading-relaxed tracking-tight group-hover:text-zinc-200 transition-colors">
                        {item.prompt ? `“${item.prompt}”` : item.tool.description}
                      </p>
                    </div>

                    {/* Premium Full-Width Rounded Button */}
                    <div className="mt-4 relative z-10">
                      <div
                        className={cn(
                          "w-full min-h-12 py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 font-black uppercase tracking-[0.18em] text-[11px] text-white transition-all duration-500 relative overflow-hidden isolate transform-gpu group-hover:scale-[1.02]",
                          style.buttonGrad
                        )}
                      >
                        <span className="relative z-10">Replay Session</span>
                        <ArrowRight size={14} className="relative z-10 transition-transform duration-500 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* 5. RECOMMENDED FOR YOU — TAILORED ACTIVITY-BASED RECOMMENDATIONS */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            {/* Related Recommendations Compass Icon */}
            <div className="w-5 h-5 rounded-lg bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]">
              <Compass size={13} className="text-cyan-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-200 to-white drop-shadow-sm">
              RECOMMENDED FOR YOU
            </span>
          </div>

          <span className="text-[11px] font-bold text-zinc-400">
            {recentlyUsed.length > 0
              ? "Tailored dynamically to your studio activity"
              : "Trending studio starter picks to jumpstart your workflow"}
          </span>
        </div>

        {/* Activity-Tailored Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedTools.map((rec) => {
            const ToolIcon =
              rec.tool?.icon && ICON_MAP[rec.tool.icon]
                ? ICON_MAP[rec.tool.icon]
                : ICON_MAP.Wand2;
            const style = getStyleForTool(rec.tool);

            return (
              <Link
                key={rec.tool.id}
                href={rec.tool.href}
                className="block h-full rounded-[2.5rem] focus-visible:outline-none"
              >
                <div
                  className={cn(
                    "relative h-full min-h-[280px] flex flex-col justify-between p-6 sm:p-7 backdrop-blur-3xl transition-all duration-500 rounded-[2.5rem] overflow-hidden touch-manipulation",
                    "bg-gradient-to-b from-[#0e0f17]/90 via-[#0a0a10]/85 to-[#06060a]/90 transition-all duration-500 border-2",
                    style.cardBorder,
                    "hover:scale-[1.03] active:scale-[0.99] group"
                  )}
                >
                  {/* Hover Shine Sweep */}
                  <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-10">
                    <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  {/* Ambient Glow Aura */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                    <div
                      className={cn(
                        "absolute -top-12 -left-12 w-64 h-64 rounded-full blur-[70px] transition-all duration-700 opacity-30 group-hover:opacity-60 group-hover:scale-125",
                        style.aura
                      )}
                    />
                    <div
                      className={cn(
                        "absolute -bottom-16 -right-16 w-56 h-56 rounded-full blur-[80px] transition-all duration-700 opacity-20 group-hover:opacity-40",
                        style.aura
                      )}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.04] group-hover:opacity-[0.09] transition-opacity duration-500" />
                    <div className="absolute -top-6 -right-6 opacity-[0.04] group-hover:opacity-[0.09] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6 pointer-events-none">
                      <ToolIcon size={160} strokeWidth={1} className={cn("transition-colors duration-500", style.iconGlow)} />
                    </div>
                  </div>

                  {/* Top Row: Icon on left, Tailored Badge on right */}
                  <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-2xl shrink-0 bg-[#0b0c12] border border-white/5">
                      <div
                        className={cn(
                          "absolute inset-0 blur-xl animate-pulse transition-colors duration-500",
                          style.aura
                        )}
                      />
                      <div
                        className={cn(
                          "absolute inset-[-100%] animate-[spin_3s_linear_infinite] transition-colors duration-500",
                          style.spinIdle,
                          style.spinHover
                        )}
                      />
                      <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#0b0c12] z-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                      </div>
                      <ToolIcon
                        className={cn(
                          "w-8 h-8 transition-all duration-700 z-10 group-hover:scale-110",
                          style.iconGlow
                        )}
                      />
                    </div>

                    <span
                      className={cn(
                        "relative z-10 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm",
                        style.badge
                      )}
                    >
                      {rec.badge}
                    </span>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0 relative z-10 mb-4">
                    <h3
                      className={cn(
                        "text-lg sm:text-xl font-black tracking-tight leading-snug transition-colors break-words text-transparent bg-clip-text",
                        style.textGrad
                      )}
                    >
                      {rec.tool.name}
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-[13px] font-medium text-zinc-400 line-clamp-4 leading-relaxed tracking-tight group-hover:text-zinc-200 transition-colors">
                      {rec.tool.description}
                    </p>
                    <p className="mt-2 text-[10.5px] font-bold text-zinc-400 truncate flex items-center gap-1.5">
                      <span className="text-cyan-400">⚡</span>
                      <span>{rec.reason}</span>
                    </p>
                  </div>

                  {/* Premium Full-Width Rounded Button */}
                  <div className="mt-4 relative z-10">
                    <div
                      className={cn(
                        "w-full min-h-12 py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 font-black uppercase tracking-[0.18em] text-[11px] text-white transition-all duration-500 relative overflow-hidden isolate transform-gpu group-hover:scale-[1.02]",
                        style.buttonGrad
                      )}
                    >
                      <span className="relative z-10">Launch Tool</span>
                      <ArrowRight size={14} className="relative z-10 transition-transform duration-500 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
