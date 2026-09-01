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
  Code2,
  FileText,
  Calendar,
  Layers
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import { useQuests, QuestItem } from "@/hooks/useQuests";

const ICON_MAP: Record<string, { icon: React.ReactNode; bg: string; border: string; glow: string; text: string }> = {
  Wand2: {
    icon: <Wand2 size={22} className="text-cyan-300" />,
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.35)]",
    text: "text-cyan-300",
  },
  Palette: {
    icon: <Palette size={22} className="text-fuchsia-300" />,
    bg: "bg-fuchsia-500/15",
    border: "border-fuchsia-500/30",
    glow: "shadow-[0_0_20px_rgba(217,70,239,0.35)]",
    text: "text-fuchsia-300",
  },
  MessageSquare: {
    icon: <MessageSquare size={22} className="text-purple-300" />,
    bg: "bg-purple-500/15",
    border: "border-purple-500/30",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.35)]",
    text: "text-purple-300",
  },
  Coins: {
    icon: <Coins size={22} className="text-amber-300" />,
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
    text: "text-amber-300",
  },
  Code2: {
    icon: <Code2 size={22} className="text-emerald-300" />,
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
    text: "text-emerald-300",
  },
  FileText: {
    icon: <FileText size={22} className="text-blue-300" />,
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.35)]",
    text: "text-blue-300",
  },
  Sparkles: {
    icon: <Sparkles size={22} className="text-yellow-300" />,
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.35)]",
    text: "text-yellow-300",
  },
  Zap: {
    icon: <Zap size={22} className="text-amber-300" />,
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
    text: "text-amber-300",
  },
  Flame: {
    icon: <Flame size={22} className="text-rose-300" />,
    bg: "bg-rose-500/15",
    border: "border-rose-500/30",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
    text: "text-rose-300",
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

  const handleClaimSingle = async (questId: string, type?: "daily" | "weekly") => {
    const isWeekly = type === "weekly" || activeTab === "weekly" || String(questId).startsWith("weekly_");
    const success = await claimQuest(questId, isWeekly ? "weekly" : "daily");
    if (success) {
      confetti({
        particleCount: isWeekly ? 110 : 70,
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
    const count = await claimAll(activeTab);
    if (count > 0) {
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.55 },
        colors: ["#fbbf24", "#f59e0b", "#a855f7", "#06b6d4", "#22c55e", "#ec4899"],
      });
      refreshCredits();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop with Cyber Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl transition-all"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative w-full max-w-2xl rounded-[2.5rem] border border-white/10 bg-[#090910]/95 p-5 sm:p-7 shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_60px_rgba(168,85,247,0.15)] overflow-hidden z-10 backdrop-blur-3xl flex flex-col max-h-[92vh]"
        >
          {/* Ambient Lighting Accents */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 via-purple-500/60 to-transparent" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          {/* Header Section */}
          <div className="relative z-10 flex flex-col gap-4 pb-4 border-b border-white/[0.08] shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                {/* Glowing Trophy Badge */}
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 via-purple-500/20 to-cyan-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.25)] shrink-0">
                  <Trophy size={24} className="drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  {unclaimedCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,1)]"></span>
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                      Quests & Challenges
                    </h2>
                    
                    {unclaimedCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse">
                        <Gift size={11} className="fill-amber-950" />
                        {unclaimedCount} {unclaimedCount === 1 ? "Reward Ready" : "Rewards Ready"}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Earn Bonus Credits
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">
                    Complete randomized challenges to claim free AI generation credits
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Close quests modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* TAB SELECTOR: Daily Quests vs Weekly Quests */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-zinc-950/80 border border-white/[0.08] backdrop-blur-md relative gap-1.5">
              {/* Daily Tab Button */}
              <button
                type="button"
                onClick={() => setActiveTab("daily")}
                className={cn(
                  "relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer z-10",
                  activeTab === "daily"
                    ? "text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                )}
              >
                {activeTab === "daily" && (
                  <motion.div
                    layoutId="activeQuestTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-purple-500/25 border border-amber-400/40"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <Flame size={14} className={activeTab === "daily" ? "text-amber-400 fill-amber-400" : "text-zinc-500"} />
                  <span>Daily Quests</span>
                  {dailyUnclaimedCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-amber-950 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                      +{dailyUnclaimedCount}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">
                      ({dailyQuests.filter(q => q.completed).length}/{dailyQuests.length || 4})
                    </span>
                  )}
                </div>
              </button>

              {/* Weekly Tab Button */}
              <button
                type="button"
                onClick={() => setActiveTab("weekly")}
                className={cn(
                  "relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer z-10",
                  activeTab === "weekly"
                    ? "text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                )}
              >
                {activeTab === "weekly" && (
                  <motion.div
                    layoutId="activeQuestTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/30 via-fuchsia-500/25 to-amber-500/25 border border-purple-400/50"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <Crown size={14} className={activeTab === "weekly" ? "text-purple-300" : "text-zinc-500"} />
                  <span>Weekly Quests</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-widest bg-purple-400/20 text-purple-300 border border-purple-400/30 hidden sm:inline">
                    MEGA
                  </span>
                  {weeklyUnclaimedCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-400 text-purple-950 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                      +{weeklyUnclaimedCount}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">
                      ({weeklyQuests.filter(q => q.completed).length}/{weeklyQuests.length || 4})
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Quick Status Bar & Live Reset Timer */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-lg border",
                  activeTab === "weekly"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                )}>
                  {activeTab === "weekly" ? (
                    <Calendar size={13} className="text-purple-300" />
                  ) : (
                    <Clock size={13} className="text-amber-300 animate-pulse" />
                  )}
                </div>
                <span className="text-zinc-400 text-[11px] font-medium hidden sm:inline">
                  {activeTab === "weekly" ? "Weekly Reset in:" : "Daily Reset in:"}
                </span>
                <span className={cn(
                  "font-mono font-bold text-xs tracking-wider px-2 py-0.5 rounded-md border shadow-sm",
                  activeTab === "weekly"
                    ? "text-purple-300 bg-purple-400/10 border-purple-400/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                    : "text-amber-300 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                )}>
                  {currentTimeRemaining}
                </span>
              </div>

              {/* Batch Claim Button if Unclaimed in this section */}
              {currentUnclaimed > 0 && (
                <button
                  onClick={handleClaimAll}
                  className={cn(
                    "px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 active:scale-95",
                    activeTab === "weekly"
                      ? "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-400 text-purple-950 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                      : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  )}
                >
                  <Sparkles size={13} className="fill-current" />
                  <span>Claim All ({currentUnclaimed})</span>
                </button>
              )}
            </div>
          </div>

          {/* Quest Cards Scrollable Container */}
          <div className="relative z-10 mt-4 space-y-3.5 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar flex-1 pb-2">
            {loading && quests.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Syncing Dynamic Quests...</p>
              </div>
            ) : quests.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <p className="text-zinc-400 text-sm font-bold">No active quests found for this cycle.</p>
                <p className="text-zinc-500 text-xs">Check back soon as new challenges are generated!</p>
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
                  icon: <Sparkles size={22} className="text-purple-300" />,
                  bg: "bg-purple-500/15",
                  border: "border-purple-500/30",
                  glow: "shadow-[0_0_20px_rgba(168,85,247,0.35)]",
                  text: "text-purple-300",
                };

                return (
                  <motion.div
                    key={quest.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "group relative p-5 sm:p-5.5 rounded-3xl border transition-all duration-300 overflow-hidden",
                      quest.claimed
                        ? "bg-zinc-950/40 border-white/[0.04] opacity-55"
                        : isClaimable
                        ? isWeekly
                          ? "bg-gradient-to-br from-[#1b0a33]/90 via-[#130726]/80 to-[#0a0515]/95 border-purple-400/50 shadow-[0_8px_32px_rgba(168,85,247,0.22)] ring-1 ring-purple-400/40"
                          : "bg-gradient-to-br from-[#261504]/90 via-[#1c0f04]/80 to-[#0c0804]/95 border-amber-400/50 shadow-[0_8px_32px_rgba(245,158,11,0.18)] ring-1 ring-amber-400/40"
                        : isWeekly
                        ? "bg-zinc-950/70 border-purple-500/20 hover:border-purple-500/40 hover:bg-zinc-900/50"
                        : "bg-zinc-950/60 border-white/[0.07] hover:border-amber-500/30 hover:bg-zinc-900/40"
                    )}
                  >
                    {/* Active Glowing Sheen on Claimable Items */}
                    {isClaimable && (
                      <div className={cn(
                        "absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none animate-pulse",
                        isWeekly ? "bg-purple-400/20" : "bg-amber-400/15"
                      )} />
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                      {/* Left: Icon Box + Details */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105",
                            iconMeta.bg,
                            iconMeta.border,
                            isClaimable ? iconMeta.glow : ""
                          )}
                        >
                          {iconMeta.icon}
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
                              {quest.title}
                            </h3>

                            {/* Category Tag */}
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white/[0.05] border border-white/[0.08] text-zinc-400">
                              {quest.category}
                            </span>
                            
                            {/* Reward Token Pill */}
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider shadow-sm",
                              isWeekly
                                ? "bg-gradient-to-r from-purple-400/20 via-fuchsia-400/20 to-amber-400/20 border border-purple-400/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                                : "bg-amber-400/15 border border-amber-400/35 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                            )}>
                              <Coins size={11} className={isWeekly ? "text-purple-300" : "text-amber-400"} />
                              +{quest.rewardCredits} Credits
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            {quest.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Interactive Action / Claim Button */}
                      <div className="shrink-0 flex items-center justify-end">
                        {quest.claimed ? (
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-black tracking-wider">
                            <Check size={14} className="stroke-[3]" />
                            <span>CLAIMED</span>
                          </div>
                        ) : isClaimable ? (
                          <button
                            onClick={() => handleClaimSingle(quest.id, quest.type)}
                            disabled={claimingId === quest.id}
                            className={cn(
                              "px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 shadow-xl",
                              isWeekly
                                ? "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-400 hover:from-purple-300 hover:to-amber-300 text-purple-950 shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                                : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-amber-950 shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                            )}
                          >
                            <Gift size={14} className="fill-current" />
                            <span>{claimingId === quest.id ? "CLAIMING..." : "CLAIM REWARD"}</span>
                          </button>
                        ) : (
                          <Link
                            href={quest.actionUrl}
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 hover:border-purple-500/40 text-xs font-bold uppercase tracking-wider transition-all duration-200 group/btn"
                          >
                            <span>{quest.actionLabel}</span>
                            <ChevronRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Counter (With ample bottom padding) */}
                    {!quest.claimed && (
                      <div className="mt-4 pt-3.5 border-t border-white/[0.06] relative z-10 pb-0.5">
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-2">
                          <span className={cn(
                            "uppercase tracking-wider font-sans font-bold flex items-center gap-1.5",
                            isClaimable ? "text-emerald-400" : "text-zinc-500"
                          )}>
                            {isClaimable ? (
                              <>
                                <CheckCircle2 size={12} className="text-emerald-400" />
                                <span>Objective Completed!</span>
                              </>
                            ) : (
                              "Progress"
                            )}
                          </span>
                          <span className={cn(
                            "font-bold",
                            isClaimable 
                              ? isWeekly 
                                ? "text-purple-300 font-sans uppercase tracking-widest text-[9.5px] px-2 py-0.5 rounded bg-purple-400/10 border border-purple-400/20" 
                                : "text-amber-300 font-sans uppercase tracking-widest text-[9.5px] px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20" 
                              : "text-zinc-400 font-mono text-[11px]"
                          )}>
                            {isClaimable ? "READY TO CLAIM" : `${quest.current} / ${quest.target} (${percent}%)`}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden p-[1.5px] border border-white/[0.08]">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isClaimable
                                ? isWeekly
                                  ? "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-300 shadow-[0_0_14px_rgba(168,85,247,0.85)]"
                                  : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 shadow-[0_0_14px_rgba(245,158,11,0.85)]"
                                : isWeekly
                                ? "bg-gradient-to-r from-purple-600 to-fuchsia-400"
                                : "bg-gradient-to-r from-amber-500 to-cyan-400"
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer Info & Shop Link */}
          <div className="relative z-10 mt-4 pt-3.5 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 font-medium shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {activeTab === "weekly" 
                  ? "Weekly mega quests rotate every 7 days with bigger rewards" 
                  : "Daily quests rotate automatically every 24 hours"}
              </span>
            </div>
            
            <Link
              href="/shop"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold uppercase tracking-wider text-[11px] group transition-colors"
            >
              <Coins size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Open Loot Vault</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
