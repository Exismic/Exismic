"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Gift, Sparkles, X, Check, ArrowRight, Coins, Zap, Flame, Crown } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { QuestItem, useQuests } from "@/hooks/useQuests";
import { useCredits } from "@/hooks/useCredits";
import { SparkIcon } from "@/components/ui/SparkIcon";
import { soundController } from "./SoundController";

export function QuestCompletionToast() {
  const [activeQuest, setActiveQuest] = useState<QuestItem | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const { claimQuest } = useQuests();
  const { refreshCredits } = useCredits();
  const questQueueRef = useRef<QuestItem[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(5000);
  const totalDuration = 5000; // 5 seconds auto-dismiss

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveQuest(null);
    setIsClaimed(false);
    setIsClaiming(false);
    setProgress(100);

    // If there is another quest in queue, show next after slight delay
    setTimeout(() => {
      if (questQueueRef.current.length > 0) {
        const next = questQueueRef.current.shift()!;
        showQuestToast(next);
      }
    }, 400);
  }, []);

  const showQuestToast = useCallback((quest: QuestItem) => {
    setActiveQuest(quest);
    setIsClaimed(false);
    setIsClaiming(false);
    setProgress(100);
    remainingTimeRef.current = totalDuration;
    startTimeRef.current = Date.now();

    // Play victory sound effect
    try {
      if (quest.type === "weekly") {
        soundController.playExplosion("epic");
      } else {
        soundController.playShine();
      }
    } catch {}

    // Trigger subtle confetti burst
    confetti({
      particleCount: quest.type === "weekly" ? 50 : 35,
      spread: 60,
      origin: { y: 0.15, x: 0.85 },
      colors: quest.type === "weekly" 
        ? ["#a855f7", "#c084fc", "#fbbf24", "#38bdf8"]
        : ["#fbbf24", "#f59e0b", "#a855f7", "#22c55e"],
    });

    if (timerRef.current) clearInterval(timerRef.current);

    // 50ms tick interval for smooth countdown progress bar
    timerRef.current = setInterval(() => {
      if (isPaused) return;

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, remainingTimeRef.current - elapsed);
      const pct = (remaining / totalDuration) * 100;
      setProgress(pct);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        dismissToast();
      }
    }, 50);
  }, [dismissToast, isPaused]);

  // Listen to quest-completed events from window
  useEffect(() => {
    const handleQuestCompleted = (e: Event) => {
      const customEvent = e as CustomEvent<QuestItem>;
      const quest = customEvent.detail;
      if (!quest) return;

      if (!activeQuest) {
        showQuestToast(quest);
      } else if (activeQuest.id !== quest.id) {
        // Queue if not already queued
        if (!questQueueRef.current.some((q) => q.id === quest.id)) {
          questQueueRef.current.push(quest);
        }
      }
    };

    window.addEventListener("quest-completed", handleQuestCompleted);
    return () => {
      window.removeEventListener("quest-completed", handleQuestCompleted);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuest, showQuestToast]);

  const handleClaim = async () => {
    if (!activeQuest || isClaiming || isClaimed) return;
    setIsClaiming(true);

    // Pause timer while claiming
    if (timerRef.current) clearInterval(timerRef.current);

    const success = await claimQuest(activeQuest.id, activeQuest.type);
    if (success) {
      setIsClaimed(true);
      refreshCredits();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sparks-updated"));
      }

      confetti({
        particleCount: activeQuest.type === "weekly" ? 100 : 70,
        spread: 80,
        origin: { y: 0.25, x: 0.8 },
        colors: ["#fbbf24", "#f59e0b", "#a855f7", "#06b6d4", "#22c55e"],
      });

      try {
        soundController.playExplosion("legendary");
      } catch {}

      // Auto dismiss after 1.5 seconds of showing claimed state
      setTimeout(() => {
        dismissToast();
      }, 1600);
    } else {
      setIsClaiming(false);
      // Resume timer if claim failed
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingTimeRef.current - elapsed);
        setProgress((remaining / totalDuration) * 100);
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          dismissToast();
        }
      }, 50);
    }
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
    // Snapshot current remaining time
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  return (
    <AnimatePresence>
      {activeQuest && (
        <motion.div
          initial={{ opacity: 0, y: -25, scale: 0.92, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, scale: 0.94, filter: "blur(6px)" }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="fixed top-20 right-3 sm:right-6 z-[9999] w-[calc(100vw-1.5rem)] sm:w-[410px] pointer-events-auto"
        >
          {/* Main Cyber Toast Card */}
          <div className={cn(
            "relative rounded-3xl border p-4 sm:p-4.5 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.25)] overflow-hidden backdrop-blur-2xl transition-all duration-300",
            activeQuest.type === "weekly"
              ? "bg-[#0c0817]/95 border-purple-500/40 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/30"
              : "bg-[#0d0a14]/95 border-amber-400/40 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30"
          )}>
            {/* Top Glowing Beam */}
            <div className={cn(
              "absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent",
              activeQuest.type === "weekly" ? "via-purple-400" : "via-amber-400"
            )} />

            {/* Ambient Background Aura */}
            <div className={cn(
              "absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none",
              activeQuest.type === "weekly" ? "bg-purple-600/30" : "bg-amber-500/25"
            )} />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Content Row */}
            <div className="relative z-10 flex items-start gap-3.5">
              {/* Glowing Icon Badge */}
              <div className={cn(
                "relative flex items-center justify-center w-11 h-11 rounded-2xl border shrink-0 transition-transform shadow-md",
                activeQuest.type === "weekly"
                  ? "bg-purple-500/20 border-purple-400/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              )}>
                {activeQuest.type === "weekly" ? (
                  <Crown size={22} className="text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.9)]" />
                ) : (
                  <Trophy size={22} className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                )}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                </span>
              </div>

              {/* Quest Details */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                    <Sparkles size={11} className="fill-amber-400" />
                    Quest Completed!
                  </span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-widest border",
                    activeQuest.type === "weekly"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  )}>
                    {activeQuest.type === "weekly" ? "WEEKLY" : "DAILY"}
                  </span>
                </div>

                <h4 className="text-sm font-black text-white tracking-tight mt-0.5 truncate">
                  {activeQuest.title}
                </h4>

                <p className="text-xs text-zinc-400 line-clamp-1 font-medium mt-0.5">
                  {activeQuest.description}
                </p>

                {/* Reward Pill and Claim Button */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/[0.08]">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.15)]",
                    activeQuest.type === "weekly"
                      ? "bg-purple-500/15 border border-purple-400/35 text-purple-200"
                      : "bg-amber-400/15 border border-amber-400/35 text-amber-300"
                  )}>
                    <SparkIcon size={14} variant={activeQuest.type === "weekly" ? "purple" : "amber"} />
                    <span>+{(activeQuest.rewardSparks ?? activeQuest.rewardCredits ?? 10)} Sparks</span>
                  </span>

                  {isClaimed ? (
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-xs font-bold tracking-wider animate-in fade-in">
                      <Check size={13} className="stroke-[3]" />
                      <span>Claimed!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleClaim}
                      disabled={isClaiming}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 active:scale-95",
                        activeQuest.type === "weekly"
                          ? "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-400 text-purple-950 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-pulse"
                          : "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse"
                      )}
                    >
                      <Gift size={13} className="fill-current" />
                      <span>{isClaiming ? "Claiming..." : "Claim Reward"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={dismissToast}
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
                aria-label="Dismiss quest notification"
              >
                <X size={14} />
              </button>
            </div>

            {/* 5-Second Countdown Progress Bar */}
            {!isClaimed && (
              <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-900 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-75 ease-linear",
                    activeQuest.type === "weekly"
                      ? "bg-gradient-to-r from-purple-500 via-fuchsia-400 to-amber-400"
                      : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
