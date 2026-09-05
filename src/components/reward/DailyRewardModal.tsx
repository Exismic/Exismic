"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Shield, ShieldCheck, Check, Lock, Trophy, Loader2 } from "lucide-react";
import { DailyRewardLootBox } from "./DailyRewardLootBox";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MILESTONES_DATA = [
  { day: 3, name: "3-Day Ignition", credits: 25, rewardText: "+25 cr" },
  { day: 7, name: "Weekly Champion", credits: 75, rewardText: "+75 cr + 1 🛡️" },
  { day: 14, name: "Fortnight Fire", credits: 150, rewardText: "+150 cr" },
  { day: 30, name: "Monthly Mythic", credits: 500, rewardText: "+500 cr" },
];

export function DailyRewardModal({ isOpen, onClose }: DailyRewardModalProps) {
  const { user } = useAuth();
  const {
    dailyStreak = 0,
    streakShields = 0,
    streakMilestonesClaimed = [],
    todayClaim,
    countdown,
    refreshCredits,
    toast,
    credits = 0,
  } = useCredits();

  const [claiming, setClaiming] = useState(false);
  const [claimLocked, setClaimLocked] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    amount: number;
    rarity: string;
    type?: "temporary" | "permanent";
  } | null>(null);
  const [buyingShield, setBuyingShield] = useState(false);
  const [claimingMilestone, setClaimingMilestone] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (todayClaim) {
      setClaimResult(todayClaim);
      setClaimLocked(true);
    } else {
      setClaimLocked(false);
      setClaimResult(null);
    }
  }, [todayClaim]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !claiming && !buyingShield) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, claiming, buyingShield, onClose]);

  const handleClaim = async () => {
    if (!user) {
      toast("Please sign in to claim your daily mystery reward", "warning");
      return;
    }

    setClaiming(true);

    try {
      const res = await fetch("/api/credits/daily-claim", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setClaimLocked(Boolean(data.alreadyClaimed));
        if (data.alreadyClaimed && data.amount && data.rarity) {
          setClaimResult({
            amount: Number(data.amount),
            rarity: String(data.rarity),
            type: data.type,
          });
        }
        toast(
          data.error || "Daily reward already claimed today",
          data.alreadyClaimed ? "info" : "warning"
        );
        return;
      }

      setClaimLocked(true);
      setClaimResult({
        amount: Number(data.amount),
        rarity: String(data.rarity),
        type: data.type,
      });

      await refreshCredits();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("credits-updated"));
        window.dispatchEvent(new Event("quests-updated"));
      }

      toast(`+${data.amount} Credits Added to Your Vault!`, "success");
    } catch {
      toast("Could not connect to daily vault service", "warning");
    } finally {
      setClaiming(false);
    }
  };

  const handleBuyShield = async () => {
    if (!user) {
      toast("Please sign in to equip a streak shield", "warning");
      return;
    }
    if (streakShields >= 2) {
      toast("You already hold the maximum number of shields (2/2)", "info");
      return;
    }
    if (credits < 30) {
      toast("Insufficient credits. You need 30 credits to buy a shield.", "warning");
      return;
    }

    setBuyingShield(true);
    try {
      const res = await fetch("/api/credits/streak-shield", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast(data.error || "Failed to equip shield", "warning");
        return;
      }

      await refreshCredits();
      toast("Shield Equipped! Your streak will be protected against a missed day.", "success");
    } catch {
      toast("Network error while equipping shield", "warning");
    } finally {
      setBuyingShield(false);
    }
  };

  const handleClaimMilestone = async (day: number) => {
    if (!user) {
      toast("Please sign in to claim milestone", "warning");
      return;
    }

    setClaimingMilestone(day);
    try {
      const res = await fetch("/api/credits/streak-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneDay: day }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast(data.error || "Failed to claim milestone", "warning");
        return;
      }

      await refreshCredits();
      toast(`Unlocked Day ${day} Milestone: +${data.milestone.credits} credits!`, "success");
    } catch {
      toast("Network error claiming milestone", "warning");
    } finally {
      setClaimingMilestone(null);
    }
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !claiming && !buyingShield) onClose();
          }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-[2.5rem] border border-amber-500/20 bg-gradient-to-b from-[#0e0a05]/95 via-[#08070e]/95 to-[#040408]/95 p-5 sm:p-7 text-left shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(245,158,11,0.15)] overflow-hidden"
          >
            {/* Top Amber Halo Glow */}
            <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-44 w-72 rounded-full bg-gradient-to-b from-amber-500/30 via-orange-500/15 to-transparent blur-3xl" />

            {/* Modal Header */}
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  <Flame size={20} className="fill-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black uppercase italic tracking-tight text-white">
                      Daily Mystery Vault
                    </h3>
                    <span className="rounded-md bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                      {dailyStreak}d Streak
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Unlock your daily mystery credit drop and level up your streak
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={claiming || buyingShield}
                className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-40"
              >
                <X size={17} />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="relative z-10 pt-4 overflow-y-auto space-y-4 pr-0.5">
              {/* Main Interactive Loot Box */}
              <DailyRewardLootBox
                user={user}
                claiming={claiming}
                claimLocked={claimLocked}
                dailyStreak={dailyStreak}
                countdown={countdown}
                claimResult={claimResult}
                onClaim={handleClaim}
                embedded={true}
              />

              {/* Streak Shield Protection Module */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    {streakShields > 0 ? (
                      <ShieldCheck size={20} className="text-emerald-400" />
                    ) : (
                      <Shield size={20} className="text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wide">
                        Streak Freeze Shield
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        streakShields > 0
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}>
                        {streakShields}/2 Equipped
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Auto-protects your streak if you miss a check-in day.
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  {streakShields >= 2 ? (
                    <div className="text-center sm:text-right text-[11px] font-semibold text-zinc-400 px-3 py-1.5 rounded-xl bg-zinc-800/60 border border-white/5">
                      Max Shields
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBuyShield}
                      disabled={buyingShield || credits < 30}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {buyingShield ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Shield size={13} />
                      )}
                      <span>Equip Shield (30 cr)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Milestone Rewards Roadmap */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy size={15} className="text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Streak Milestones
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-500">
                    Current: {dailyStreak} days
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MILESTONES_DATA.map((milestone) => {
                    const isClaimed = streakMilestonesClaimed.includes(milestone.day.toString());
                    const isEligible = dailyStreak >= milestone.day && !isClaimed;
                    const isLocked = dailyStreak < milestone.day;
                    const isClaimingThis = claimingMilestone === milestone.day;

                    return (
                      <div
                        key={milestone.day}
                        className={`rounded-xl border p-2.5 flex flex-col justify-between transition-all ${
                          isClaimed
                            ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                            : isEligible
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                            : "bg-black/30 border-white/5 text-zinc-400"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black tracking-wide">
                              Day {milestone.day}
                            </span>
                            {isClaimed ? (
                              <Check size={13} className="text-emerald-400" />
                            ) : isLocked ? (
                              <Lock size={12} className="text-zinc-500" />
                            ) : (
                              <Flame size={12} className="text-amber-400" />
                            )}
                          </div>
                          <div className="text-[11px] font-bold text-white mt-1">
                            {milestone.rewardText}
                          </div>
                        </div>

                        <div className="mt-2.5">
                          {isClaimed ? (
                            <div className="w-full py-1 rounded-lg text-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                              Claimed
                            </div>
                          ) : isEligible ? (
                            <button
                              type="button"
                              onClick={() => handleClaimMilestone(milestone.day)}
                              disabled={isClaimingThis}
                              className="w-full py-1 rounded-lg text-center text-[10px] font-black text-black bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-110 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              {isClaimingThis && <Loader2 size={10} className="animate-spin" />}
                              Claim
                            </button>
                          ) : (
                            <div className="w-full py-1 rounded-lg text-center text-[10px] font-medium text-zinc-500 bg-white/[0.02]">
                              {milestone.day - dailyStreak}d left
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
