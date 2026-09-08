"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Gift, 
  X, 
  ArrowRight, 
  Wand2, 
  Palette, 
  MessageSquare, 
  Coins, 
  Flame, 
  Check, 
  Clock, 
  Zap, 
  ChevronRight, 
  Crown, 
  FileText, 
  Calendar, 
  Target, 
  Compass,
  Star,
  Shield,
  Layers,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import { useQuests, QuestItem } from "@/hooks/useQuests";
import { useSparks } from "@/hooks/useSparks";
import { SparkIcon } from "@/components/ui/SparkIcon";
import { soundController } from "@/components/reward/SoundController";

const ICON_MAP: Record<string, { icon: React.ReactNode; bg: string; border: string; glow: string; text: string; glowColor: string }> = {
  Wand2: {
    icon: <Wand2 size={22} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />,
    bg: "bg-gradient-to-br from-cyan-500/25 via-blue-900/30 to-black/60",
    border: "border-cyan-400/40",
    glow: "shadow-[0_0_25px_rgba(6,182,212,0.4)]",
    glowColor: "rgba(6,182,212,0.25)",
    text: "text-cyan-300",
  },
  Palette: {
    icon: <Palette size={22} className="text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" />,
    bg: "bg-gradient-to-br from-fuchsia-500/25 via-purple-900/30 to-black/60",
    border: "border-fuchsia-400/40",
    glow: "shadow-[0_0_25px_rgba(217,70,239,0.4)]",
    glowColor: "rgba(217,70,239,0.25)",
    text: "text-fuchsia-300",
  },
  MessageSquare: {
    icon: <MessageSquare size={22} className="text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />,
    bg: "bg-gradient-to-br from-purple-500/25 via-indigo-900/30 to-black/60",
    border: "border-purple-400/40",
    glow: "shadow-[0_0_25px_rgba(168,85,247,0.4)]",
    glowColor: "rgba(168,85,247,0.25)",
    text: "text-purple-300",
  },
  Coins: {
    icon: <Coins size={22} className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />,
    bg: "bg-gradient-to-br from-amber-500/25 via-orange-900/30 to-black/60",
    border: "border-amber-400/40",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.4)]",
    glowColor: "rgba(245,158,11,0.25)",
    text: "text-amber-300",
  },
  FileText: {
    icon: <FileText size={22} className="text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />,
    bg: "bg-gradient-to-br from-blue-500/25 via-indigo-900/30 to-black/60",
    border: "border-blue-400/40",
    glow: "shadow-[0_0_25px_rgba(59,130,246,0.4)]",
    glowColor: "rgba(59,130,246,0.25)",
    text: "text-blue-300",
  },
  Sparkles: {
    icon: <Sparkles size={22} className="text-yellow-300 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />,
    bg: "bg-gradient-to-br from-yellow-500/25 via-amber-900/30 to-black/60",
    border: "border-yellow-400/40",
    glow: "shadow-[0_0_25px_rgba(234,179,8,0.4)]",
    glowColor: "rgba(234,179,8,0.25)",
    text: "text-yellow-300",
  },
  Zap: {
    icon: <Zap size={22} className="text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />,
    bg: "bg-gradient-to-br from-amber-500/25 via-orange-900/30 to-black/60",
    border: "border-amber-400/40",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.4)]",
    glowColor: "rgba(245,158,11,0.25)",
    text: "text-amber-300",
  },
  Flame: {
    icon: <Flame size={22} className="text-rose-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />,
    bg: "bg-gradient-to-br from-rose-500/25 via-orange-900/30 to-black/60",
    border: "border-rose-400/40",
    glow: "shadow-[0_0_25px_rgba(244,63,94,0.4)]",
    glowColor: "rgba(244,63,94,0.25)",
    text: "text-rose-300",
  },
  Compass: {
    icon: <Compass size={22} className="text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />,
    bg: "bg-gradient-to-br from-emerald-500/25 via-teal-900/30 to-black/60",
    border: "border-emerald-400/40",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.4)]",
    glowColor: "rgba(16,185,129,0.25)",
    text: "text-emerald-300",
  },
};

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyQuestsModal({ isOpen, onClose }: DailyQuestsModalProps) {
  const { 
    activeTab,
    setActiveTab,
    quests,
    dailyQuests,
    weeklyQuests,
    dailyUnclaimedCount,
    weeklyUnclaimedCount,
    unclaimedCount, 
    currentUnclaimed,
    currentCompleted,
    currentTotal,
    currentTimeRemaining,
    loading, 
    claimingId, 
    claimQuest, 
    claimAll 
  } = useQuests();
  
  const { refreshCredits } = useCredits();
  const { sparks } = useSparks();

  const handleClaimSingle = async (questId: string, type?: "daily" | "weekly") => {
    soundController.playClick();
    const isWeekly = type === "weekly" || activeTab === "weekly" || String(questId).startsWith("weekly_");
    const success = await claimQuest(questId, isWeekly ? "weekly" : "daily");
    if (success) {
      soundController.playExplosion(isWeekly ? "legendary" : "epic");
      confetti({
        particleCount: isWeekly ? 120 : 80,
        spread: isWeekly ? 90 : 70,
        origin: { y: 0.6 },
        colors: isWeekly 
          ? ["#fbbf24", "#f59e0b", "#c084fc", "#e879f9", "#38bdf8"]
          : ["#fbbf24", "#a855f7", "#06b6d4", "#ec4899"],
      });
      refreshCredits();
    }
  };

  const handleClaimAll = async () => {
    soundController.playShine();
    const count = await claimAll(activeTab);
    if (count > 0) {
      soundController.playExplosion("legendary");
      confetti({
        particleCount: 160,
        spread: 110,
        origin: { y: 0.55 },
        colors: ["#fbbf24", "#f59e0b", "#a855f7", "#06b6d4", "#22c55e", "#ec4899"],
      });
      refreshCredits();
    }
  };

  if (!isOpen) return null;

  const isWeeklyActive = activeTab === "weekly";
  const activeQuests = isWeeklyActive ? weeklyQuests : dailyQuests;

  // Aggregate statistics for active tab
  const totalEarnableSparks = activeQuests.reduce(
    (acc, q) => acc + (q.rewardSparks || q.rewardCredits || 0),
    0
  );
  const earnedSparksInTab = activeQuests
    .filter((q) => q.claimed)
    .reduce((acc, q) => acc + (q.rewardSparks || q.rewardCredits || 0), 0);
  const completedInTab = activeQuests.filter((q) => q.completed).length;
  const totalInTab = activeQuests.length || 4;
  const tabProgressPercent = totalInTab > 0 ? Math.min(100, Math.round((completedInTab / totalInTab) * 100)) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
        {/* Dynamic Frosted Cyber Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-2xl transition-all"
        />

        {/* Modal Window: AAA Gaming Cyber-Vault Terminal */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={cn(
            "relative w-full max-w-3xl rounded-[2.5rem] border-2 p-5 sm:p-7 overflow-hidden z-10 backdrop-blur-3xl flex flex-col max-h-[92vh] transition-colors duration-500",
            isWeeklyActive
              ? "border-purple-500/50 bg-gradient-to-b from-[#140d28]/98 via-[#0c071a]/98 to-[#05030c]/98 shadow-[0_32px_120px_rgba(0,0,0,0.95),0_0_80px_rgba(168,85,247,0.3)]"
              : "border-amber-500/50 bg-gradient-to-b from-[#191209]/98 via-[#0e0a05]/98 to-[#040301]/98 shadow-[0_32px_120px_rgba(0,0,0,0.95),0_0_80px_rgba(245,158,11,0.28)]"
          )}
        >

          {/* Ambient Glowing Atmospheric Orbs */}
          <div className={cn(
            "pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-70 transition-all duration-700",
            isWeeklyActive ? "bg-purple-600/25" : "bg-amber-500/20"
          )} />
          <div className={cn(
            "pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-70 transition-all duration-700",
            isWeeklyActive ? "bg-fuchsia-600/20" : "bg-cyan-500/15"
          )} />

          {/* Cyber Micro-Grid Pattern */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:28px_28px] opacity-60" />

          {/* ============================================================ */}
          {/* 1. HEADER BAR: Title, Balance & Close */}
          {/* ============================================================ */}
          <div className="relative z-10 flex flex-col gap-4 pb-4 border-b border-white/[0.08] shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                {/* 3D Holographic Crest Socket */}
                <div className="relative group/emblem shrink-0">
                  <div className={cn(
                    "absolute -inset-1.5 rounded-2xl blur-md transition-all opacity-80 group-hover/emblem:opacity-100",
                    isWeeklyActive ? "bg-purple-500/40" : "bg-amber-500/40"
                  )} />
                  <div className={cn(
                    "relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]",
                    isWeeklyActive
                      ? "border-purple-400/50 bg-gradient-to-br from-[#23123f]/95 via-[#130926]/98 to-[#06020f]/98 shadow-[0_0_25px_rgba(168,85,247,0.4)] text-purple-300"
                      : "border-amber-400/50 bg-gradient-to-br from-[#2b1806]/95 via-[#160c02]/98 to-[#050300]/98 shadow-[0_0_25px_rgba(245,158,11,0.4)] text-amber-300"
                  )}>
                    {isWeeklyActive ? (
                      <Crown size={26} className="text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
                    ) : (
                      <Trophy size={26} className="text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
                    )}
                    {unclaimedCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,1)] border-2 border-black" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Tagline */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                      Quests & Challenges
                    </h2>
                    
                    {unclaimedCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse">
                        <Gift size={11} className="fill-amber-950" />
                        {unclaimedCount} {unclaimedCount === 1 ? "Reward Ready" : "Rewards Ready"}
                      </span>
                    ) : (
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1",
                        isWeeklyActive
                          ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          : "bg-amber-400/15 text-amber-300 border-amber-400/30"
                      )}>
                        <SparkIcon size={11} variant={isWeeklyActive ? "purple" : "amber"} animated />
                        <span>Daily & Weekly Rotation</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-400 font-medium mt-0.5 truncate sm:whitespace-normal">
                    Complete challenges to earn Sparks and unlock Pro passes, credits, avatar frames & themes.
                  </p>
                </div>
              </div>

              {/* Right Side: Sparks Balance + Close */}
              <div className="flex items-center gap-2 shrink-0">
                {/* User Live Sparks Balance Badge */}
                <Link
                  href="/rewards"
                  onClick={onClose}
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 border border-amber-400/40 hover:border-amber-400/70 text-amber-200 text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all group"
                  title="Your current Sparks balance. Click to visit the shop!"
                >
                  <SparkIcon size={14} variant="amber" animated />
                  <span className="font-mono font-black text-amber-300">{sparks.toLocaleString()}</span>
                  <span className="text-[10px] text-amber-400/80 font-bold">⚡</span>
                </Link>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="group flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/25 hover:bg-white/[0.1] hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                  aria-label="Close quests modal"
                >
                  <X size={17} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* ============================================================ */}
            {/* 2. TAB SELECTOR: Daily Quests vs Weekly Quests */}
            {/* ============================================================ */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl relative gap-2">
              {/* Daily Tab Button */}
              <button
                type="button"
                onClick={() => { soundController.playClick(); setActiveTab("daily"); }}
                className={cn(
                  "relative flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer z-10 select-none",
                  !isWeeklyActive
                    ? "text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                )}
              >
                {!isWeeklyActive && (
                  <motion.div
                    layoutId="activeQuestTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-600/25 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <Flame size={15} className={!isWeeklyActive ? "text-amber-400 fill-amber-400" : "text-zinc-500"} />
                  <span>Daily Quests</span>
                  {dailyUnclaimedCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-amber-950 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.9)]">
                      +{dailyUnclaimedCount}
                    </span>
                  ) : (
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md",
                      !isWeeklyActive ? "bg-amber-400/20 text-amber-300" : "text-zinc-500"
                    )}>
                      {dailyQuests.filter(q => q.completed).length}/{dailyQuests.length || 4}
                    </span>
                  )}
                </div>
              </button>

              {/* Weekly Tab Button */}
              <button
                type="button"
                onClick={() => { soundController.playClick(); setActiveTab("weekly"); }}
                className={cn(
                  "relative flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer z-10 select-none",
                  isWeeklyActive
                    ? "text-purple-200 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                )}
              >
                {isWeeklyActive && (
                  <motion.div
                    layoutId="activeQuestTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/35 via-fuchsia-500/30 to-purple-800/35 border border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.3)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <Crown size={15} className={isWeeklyActive ? "text-purple-300 fill-purple-300/30" : "text-zinc-500"} />
                  <span>Weekly Quests</span>
                  {weeklyUnclaimedCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-400 text-purple-950 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.9)]">
                      +{weeklyUnclaimedCount}
                    </span>
                  ) : (
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md",
                      isWeeklyActive ? "bg-purple-400/20 text-purple-300" : "text-zinc-500"
                    )}>
                      {weeklyQuests.filter(q => q.completed).length}/{weeklyQuests.length || 4}
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* ============================================================ */}
            {/* 3. MISSION COMMAND BAR: Cycle Progress & Countdown */}
            {/* ============================================================ */}
            <div className={cn(
              "p-3 rounded-2xl border backdrop-blur-xl relative overflow-hidden transition-all duration-300",
              isWeeklyActive
                ? "bg-gradient-to-r from-purple-950/40 via-[#100b22]/70 to-purple-950/30 border-purple-500/30"
                : "bg-gradient-to-r from-amber-950/40 via-[#160f06]/70 to-amber-950/30 border-amber-500/30"
            )}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10">
                {/* Left: Quest Milestone Progress Bar with pips */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Target size={13} className={isWeeklyActive ? "text-purple-300" : "text-amber-300"} />
                      <span>{isWeeklyActive ? "Weekly Mission Progress" : "Daily Mission Progress"}</span>
                    </span>
                    <span className={cn(
                      "font-mono font-black",
                      isWeeklyActive ? "text-purple-300" : "text-amber-300"
                    )}>
                      {completedInTab}/{totalInTab} Completed ({tabProgressPercent}%)
                    </span>
                  </div>

                  {/* Segmented Milestone Conduit Bar */}
                  <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner relative">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 relative",
                        isWeeklyActive
                          ? "bg-gradient-to-r from-purple-500 via-fuchsia-400 to-amber-300 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                          : "bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                      )}
                      style={{ width: `${Math.max(4, tabProgressPercent)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>

                {/* Right: Reset Countdown & Fast Batch Claim */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.06] shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Clock size={13} className={isWeeklyActive ? "text-purple-400 animate-pulse" : "text-amber-400 animate-pulse"} />
                    <span className="text-[11px] text-zinc-400">Resets in:</span>
                    <span className={cn(
                      "font-mono font-bold text-[11px] px-2 py-0.5 rounded-lg border",
                      isWeeklyActive
                        ? "text-purple-300 bg-purple-400/10 border-purple-400/30"
                        : "text-amber-300 bg-amber-400/10 border-amber-400/30"
                    )}>
                      {currentTimeRemaining}
                    </span>
                  </div>

                  {currentUnclaimed > 0 && (
                    <button
                      onClick={handleClaimAll}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 active:scale-95",
                        isWeeklyActive
                          ? "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-300 text-purple-950 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                          : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                      )}
                    >
                      <Sparkles size={13} className="fill-current animate-pulse" />
                      <span>Claim All ({currentUnclaimed})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4. QUEST CARDS LIST: Rich, Cyberpunk Glass Cards */}
          {/* ============================================================ */}
          <div className="relative z-10 mt-3 space-y-3 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar flex-1 pb-1">
            {loading && quests.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className={cn(
                  "w-9 h-9 rounded-full border-2 border-t-transparent animate-spin mx-auto",
                  isWeeklyActive ? "border-purple-400" : "border-amber-400"
                )} />
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Syncing Quests...</p>
              </div>
            ) : quests.length === 0 ? (
              <div className="py-16 text-center space-y-2 rounded-2xl border border-white/10 bg-white/[0.02]">
                <p className="text-zinc-300 text-sm font-bold">No active quests found for this cycle.</p>
                <p className="text-zinc-500 text-xs">New daily challenges rotate in at midnight UTC!</p>
              </div>
            ) : (
              quests.map((quest) => {
                const percent = Math.min(
                  100,
                  Math.round((quest.current / quest.target) * 100)
                );
                const isClaimable = quest.completed && !quest.claimed;
                const isWeekly = quest.type === "weekly" || activeTab === "weekly";
                const iconMeta = ICON_MAP[quest.icon] || {
                  icon: <Sparkles size={22} className="text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />,
                  bg: "bg-gradient-to-br from-purple-500/25 via-indigo-900/30 to-black/60",
                  border: "border-purple-500/40",
                  glow: "shadow-[0_0_25px_rgba(168,85,247,0.4)]",
                  glowColor: "rgba(168,85,247,0.25)",
                  text: "text-purple-300",
                };

                return (
                  <motion.div
                    key={quest.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={cn(
                      "group relative p-4 sm:p-5 rounded-[1.75rem] border transition-all duration-300 overflow-hidden",
                      quest.claimed
                        ? "bg-[#06070e]/70 border-emerald-500/20 opacity-75"
                        : isClaimable
                        ? isWeekly
                          ? "bg-gradient-to-br from-[#240e44]/95 via-[#15092a]/95 to-[#080412]/98 border-purple-400/80 shadow-[0_12px_40px_rgba(168,85,247,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-purple-400/60"
                          : "bg-gradient-to-br from-[#331c07]/95 via-[#1c0f03]/95 to-[#0a0501]/98 border-amber-400/80 shadow-[0_12px_40px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-amber-400/60"
                        : isWeekly
                        ? "bg-gradient-to-br from-[#18112c]/90 via-[#100a1e]/90 to-[#080510]/95 border-purple-500/25 hover:border-purple-400/50 hover:bg-[#1f1538]/90 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                        : "bg-gradient-to-br from-[#1c1409]/90 via-[#120d06]/90 to-[#080603]/95 border-amber-500/20 hover:border-amber-400/45 hover:bg-[#241a0b]/90 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                    )}
                  >
                    {/* Glowing Back-Light on Claimable or Hover */}
                    {isClaimable && (
                      <div className={cn(
                        "absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none animate-pulse opacity-75",
                        isWeekly ? "bg-purple-400/40" : "bg-amber-400/35"
                      )} />
                    )}

                    {/* Specular Top Edge Line */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 relative z-10">
                      {/* Left: Holographic Icon Tile + Quest Info */}
                      <div className="flex items-center sm:items-start gap-3.5 min-w-0 flex-1">
                        <div
                          className={cn(
                            "w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-md",
                            iconMeta.bg,
                            iconMeta.border,
                            isClaimable ? iconMeta.glow : ""
                          )}
                        >
                          {iconMeta.icon}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-sm sm:text-base text-white tracking-tight truncate">
                              {quest.title}
                            </h3>

                            {/* Category Tag */}
                            <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-white/[0.06] border border-white/10 text-zinc-300">
                              {quest.category}
                            </span>
                            
                            {/* Glowing Sparks Reward Chip */}
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider shadow-sm",
                              isWeekly
                                ? "bg-gradient-to-r from-purple-500/25 via-fuchsia-500/20 to-amber-400/25 border border-purple-400/50 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                                : "bg-amber-400/20 border border-amber-400/45 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                            )}>
                              <SparkIcon size={12} variant={isWeekly ? "purple" : "amber"} animated />
                              <span>+{quest.rewardSparks || quest.rewardCredits} Sparks</span>
                            </span>
                          </div>

                          <p className="text-xs text-zinc-300 leading-relaxed font-medium line-clamp-1 sm:line-clamp-2">
                            {quest.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Interactive Action / Claim Button */}
                      <div className="shrink-0 flex items-center justify-end sm:self-center">
                        {quest.claimed ? (
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 text-xs font-black tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <Check size={14} className="stroke-[3] text-emerald-400" />
                            <span>CLAIMED</span>
                          </div>
                        ) : isClaimable ? (
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleClaimSingle(quest.id, quest.type)}
                            disabled={claimingId === quest.id}
                            className={cn(
                              "px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xl",
                              isWeekly
                                ? "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-300 hover:from-purple-300 hover:to-amber-200 text-purple-950 shadow-[0_0_30px_rgba(168,85,247,0.7)]"
                                : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-amber-950 shadow-[0_0_30px_rgba(245,158,11,0.7)]"
                            )}
                          >
                            <Gift size={15} className="fill-current animate-bounce" />
                            <span>{claimingId === quest.id ? "CLAIMING..." : "CLAIM REWARD"}</span>
                          </motion.button>
                        ) : (
                          <Link
                            href={quest.actionUrl}
                            onClick={onClose}
                            className={cn(
                              "inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 group/btn shadow-sm",
                              isWeekly
                                ? "bg-purple-500/15 hover:bg-purple-500/30 text-purple-200 hover:text-white border border-purple-400/30 hover:border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                : "bg-amber-400/15 hover:bg-amber-400/30 text-amber-200 hover:text-white border border-amber-400/30 hover:border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                            )}
                          >
                            <span>{quest.actionLabel}</span>
                            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Progress Conduit (Illuminated & Stepped) */}
                    {!quest.claimed && (
                      <div className="mt-3 pt-2.5 border-t border-white/[0.06] relative z-10">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className={cn(
                            "uppercase tracking-wider font-black flex items-center gap-1.5 text-[10px]",
                            isClaimable ? "text-emerald-400" : "text-zinc-400"
                          )}>
                            {isClaimable ? (
                              <>
                                <CheckCircle2 size={12} className="text-emerald-400" />
                                <span>Quest Ready to Claim!</span>
                              </>
                            ) : (
                              <>
                                <Target size={11} className={isWeekly ? "text-purple-400" : "text-amber-400"} />
                                <span>Progress</span>
                              </>
                            )}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-black text-xs font-mono px-2 py-0.5 rounded-md",
                              isClaimable
                                ? isWeekly
                                  ? "text-purple-300 bg-purple-400/15 border border-purple-400/30"
                                  : "text-amber-300 bg-amber-400/15 border border-amber-400/30"
                                : "text-zinc-300 bg-black/50 border border-white/10"
                            )}>
                              {isClaimable ? "100% COMPLETE" : `${quest.current} / ${quest.target}`}
                            </span>
                            {!isClaimable && (
                              <span className={cn(
                                "font-bold font-mono text-[10px]",
                                isWeekly ? "text-purple-300" : "text-amber-400"
                              )}>
                                ({percent}%)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* High-Energy Conduit Bar */}
                        <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700 relative",
                              isClaimable
                                ? isWeekly
                                  ? "bg-gradient-to-r from-purple-500 via-fuchsia-400 to-amber-300 shadow-[0_0_15px_rgba(168,85,247,0.9)]"
                                  : "bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.9)]"
                                : isWeekly
                                ? "bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                : "bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            )}
                            style={{ width: `${Math.max(3, percent)}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* ============================================================ */}
          {/* 5. RICH FOOTER BAR: Sparks Teaser & Shop Action */}
          {/* ============================================================ */}
          <div className="relative z-10 mt-3 pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            {/* Left: Sparks Economy Motivator */}
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/30 shrink-0">
                <SparkIcon size={12} variant="amber" animated />
              </span>
              <span>
                Earned <strong className="text-amber-300 font-mono font-black">+{earnedSparksInTab}</strong> of <span className="text-zinc-300 font-mono font-bold">+{totalEarnableSparks} ⚡</span> available in this cycle.
              </span>
            </div>

            {/* Right: Visit Sparks Shop Action Button */}
            <Link
              href="/rewards"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-yellow-500/25 hover:from-amber-500/40 hover:to-orange-500/35 border border-amber-400/50 hover:border-amber-400/80 text-amber-200 font-black uppercase tracking-wider text-xs group transition-all shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={14} className="text-amber-300" />
              <span>Spend in Sparks Shop</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform text-amber-300" />
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
