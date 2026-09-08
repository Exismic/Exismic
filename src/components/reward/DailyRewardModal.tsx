"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Flame,
  Shield,
  ShieldCheck,
  Check,
  Lock,
  Trophy,
  Loader2,
  Sparkles,
  Coins,
  CheckCheck,
  Zap,
  Gift,
  Crown,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DailyRewardLootBox } from "./DailyRewardLootBox";
import { useCredits } from "@/hooks/useCredits";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MilestoneConfig {
  day: number;
  name: string;
  tier: string;
  badge: string;
  credits: number;
  rewardText: string;
  bonusType: "bonus" | "permanent";
  icon: typeof Flame;
  accentColor: string;
  glowShadow: string;
  cardGradient: string;
  borderAccent: string;
  pedestalBg: string;
  pedestalBorder: string;
  iconColor: string;
  perkText: string;
  perkDesc: string;
  perkBadge: string;
}

const MILESTONES_DATA: MilestoneConfig[] = [
  {
    day: 3,
    name: "3-Day Ignition",
    tier: "BRONZE",
    badge: "🥉 BRONZE",
    credits: 25,
    rewardText: "+25 cr",
    bonusType: "bonus",
    icon: Flame,
    accentColor: "text-amber-400",
    glowShadow: "rgba(245, 158, 11, 0.35)",
    cardGradient: "from-amber-950/30 via-[#120b05]/60 to-black/90",
    borderAccent: "border-amber-500/30 hover:border-amber-400/60",
    pedestalBg: "from-amber-500/20 via-orange-500/10 to-transparent",
    pedestalBorder: "border-amber-400/40",
    iconColor: "text-amber-400 fill-amber-400/30",
    perkText: "Ignition Boost",
    perkDesc: "Min +15 cr daily floor",
    perkBadge: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  },
  {
    day: 7,
    name: "Weekly Champion",
    tier: "SILVER",
    badge: "🥈 SILVER",
    credits: 75,
    rewardText: "+75 cr",
    bonusType: "bonus",
    icon: ShieldCheck,
    accentColor: "text-cyan-400",
    glowShadow: "rgba(6, 182, 212, 0.35)",
    cardGradient: "from-cyan-950/30 via-[#05111a]/60 to-black/90",
    borderAccent: "border-cyan-500/30 hover:border-cyan-400/60",
    pedestalBg: "from-cyan-500/20 via-sky-500/10 to-transparent",
    pedestalBorder: "border-cyan-400/40",
    iconColor: "text-cyan-300 fill-cyan-400/30",
    perkText: "+1 Free Shield 🛡️",
    perkDesc: "Auto-protects 1 missed day",
    perkBadge: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
  },
  {
    day: 14,
    name: "Fortnight Fire",
    tier: "GOLD",
    badge: "🥇 GOLD",
    credits: 150,
    rewardText: "+150 cr",
    bonusType: "bonus",
    icon: Zap,
    accentColor: "text-yellow-400",
    glowShadow: "rgba(234, 179, 8, 0.35)",
    cardGradient: "from-yellow-950/30 via-[#141004]/60 to-black/90",
    borderAccent: "border-yellow-500/30 hover:border-yellow-400/60",
    pedestalBg: "from-yellow-400/20 via-amber-500/10 to-transparent",
    pedestalBorder: "border-yellow-400/40",
    iconColor: "text-yellow-300 fill-yellow-400/30",
    perkText: "2x Vault Luck ✨",
    perkDesc: "2x Epic & Mythic drop odds",
    perkBadge: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300",
  },
  {
    day: 30,
    name: "Monthly Mythic",
    tier: "MYTHIC",
    badge: "👑 MYTHIC",
    credits: 500,
    rewardText: "+500 cr",
    bonusType: "permanent",
    icon: Crown,
    accentColor: "text-purple-400",
    glowShadow: "rgba(168, 85, 247, 0.4)",
    cardGradient: "from-purple-950/35 via-[#12071f]/60 to-black/90",
    borderAccent: "border-purple-500/30 hover:border-purple-400/60",
    pedestalBg: "from-purple-500/25 via-pink-500/10 to-transparent",
    pedestalBorder: "border-purple-400/40",
    iconColor: "text-purple-300 fill-purple-400/30",
    perkText: "Permanent Reserve 👑",
    perkDesc: "+500 lifetime (never resets)",
    perkBadge: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  },
];

const MILESTONE_POSITIONS: Record<number, number> = {
  3: 12.5,
  7: 37.5,
  14: 62.5,
  30: 87.5,
};

/**
 * Calculates the visual roadmap progress percentage (0 - 100%)
 * precisely mapping user daily streak to waypoint node coordinates (12.5%, 37.5%, 62.5%, 87.5%).
 */
function getMilestoneProgressPercent(streak: number): number {
  if (streak <= 0) return 0;
  
  // Segment 0 -> Day 3 (0% to 12.5%): Day 1 = 4.17%, Day 2 = 8.33%, Day 3 = 12.5%
  if (streak < 3) {
    return (streak / 3) * 12.5;
  }
  
  // Segment Day 3 -> Day 7 (12.5% to 37.5%): 4 days span
  if (streak < 7) {
    return 12.5 + ((streak - 3) / 4) * 25.0;
  }
  
  // Segment Day 7 -> Day 14 (37.5% to 62.5%): 7 days span
  if (streak < 14) {
    return 37.5 + ((streak - 7) / 7) * 25.0;
  }
  
  // Segment Day 14 -> Day 30 (62.5% to 87.5%): 16 days span
  if (streak < 30) {
    return 62.5 + ((streak - 14) / 16) * 25.0;
  }
  
  // Day 30+: hits 87.5% and fills to 100%
  return Math.min(87.5 + ((streak - 30) / 10) * 12.5, 100);
}

export function DailyRewardModal({ isOpen, onClose }: DailyRewardModalProps) {
  const { user } = useAuth(null);
  const {
    dailyStreak = 0,
    streakShields = 0,
    streakMilestonesClaimed = [],
    todayClaim,
    countdown,
    refreshCredits,
    updateState,
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

  // Visual track progress calculation
  const trackProgress = useMemo(() => {
    return getMilestoneProgressPercent(dailyStreak);
  }, [dailyStreak]);

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

      // Instantly update streak & credits in local state
      const updatedStreak = typeof data.streak === "number" ? data.streak : dailyStreak + 1;
      updateState({
        dailyStreak: updatedStreak,
        todayClaim: {
          amount: Number(data.amount),
          rarity: String(data.rarity),
          type: data.type,
        },
        ...(data.credits
          ? {
              dailyCredits: data.credits.dailyCredits,
              bonusCredits: data.credits.bonusCredits,
              lifetimeCredits: data.credits.lifetimeCredits,
              streakShields: data.credits.streakShields,
            }
          : {}),
      });

      // Force refresh in background
      await refreshCredits(true);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("credits-updated"));
        window.dispatchEvent(new Event("quests-updated"));
      }

      toast(`+${data.amount} Credits Added to Your Vault! (Streak: ${updatedStreak}d)`, "success");
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
      toast("You already hold maximum shield capacity (2/2)", "info");
      return;
    }
    if (credits < 30) {
      toast("Insufficient credits. You need 30 credits to equip a Streak Shield.", "warning");
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

      // Confetti burst for defensive shield equip
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#06b6d4", "#38bdf8", "#67e8f9", "#ffffff"],
      });

      // Immediate UI update
      const newShields = typeof data.streakShields === "number" ? data.streakShields : streakShields + 1;
      updateState({
        streakShields: newShields,
        ...(data.credits
          ? {
              dailyCredits: data.credits.dailyCredits,
              bonusCredits: data.credits.bonusCredits,
              lifetimeCredits: data.credits.lifetimeCredits,
            }
          : {}),
      });

      await refreshCredits(true);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("credits-updated"));
      }

      toast("Shield Equipped! 1 Missed Day is Now Protected.", "success");
    } catch {
      toast("Network error while equipping shield", "warning");
    } finally {
      setBuyingShield(false);
    }
  };

  const handleClaimMilestone = async (day: number) => {
    if (!user) {
      toast("Please sign in to claim milestone reward", "warning");
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

      // Celebratory Gold Confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#f59e0b", "#fbbf24", "#fef08a", "#10b981", "#ffffff"],
      });

      // Immediate UI update
      const milestoneDayStr = day.toString();
      const updatedClaimed = streakMilestonesClaimed.includes(milestoneDayStr)
        ? streakMilestonesClaimed
        : [...streakMilestonesClaimed, milestoneDayStr];

      updateState({
        streakMilestonesClaimed: updatedClaimed,
        ...(data.credits
          ? {
              dailyCredits: data.credits.dailyCredits,
              bonusCredits: data.credits.bonusCredits,
              lifetimeCredits: data.credits.lifetimeCredits,
              streakShields: data.credits.streakShields,
            }
          : {}),
      });

      await refreshCredits(true);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("credits-updated"));
      }

      const shieldText = data.shieldAwarded ? " + 1 Free Streak Shield!" : "";
      toast(`Unlocked Day ${day} Milestone: +${data.milestone.credits} credits${shieldText}`, "success");
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
            className="relative w-full max-w-2xl sm:max-w-3xl max-h-[92vh] flex flex-col rounded-[2.5rem] border border-amber-500/25 bg-gradient-to-b from-[#0e0a05]/95 via-[#08070e]/95 to-[#040408]/95 p-5 sm:p-7 text-left shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(245,158,11,0.15)] overflow-hidden"
          >
            {/* Top Amber Halo Glow */}
            <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-44 w-72 rounded-full bg-gradient-to-b from-amber-500/30 via-orange-500/15 to-transparent blur-3xl" />

            {/* Modal Header */}
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] shrink-0">
                  <Flame size={22} className="fill-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black uppercase italic tracking-tight text-white">
                      Daily Mystery Vault
                    </h3>
                    {dailyStreak > 0 ? (
                      <span className="rounded-full bg-gradient-to-r from-amber-500/25 to-orange-500/25 border border-amber-400/40 px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] flex items-center gap-1">
                        <Flame size={10} className="fill-amber-400 text-amber-400 animate-pulse" />
                        {dailyStreak}d Streak
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-800/80 border border-zinc-700/80 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Flame size={10} className="text-zinc-500" />
                        0d Streak
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    {dailyStreak > 0
                      ? "Keep your daily check-in alive to compound luck and unlock mythic vault drops"
                      : "Claim today's drop to start your Day 1 streak and unlock bonus luck multipliers"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={claiming || buyingShield}
                className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-40 shrink-0"
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

              {/* 1. Streak Freeze Shield — Cyber Defense Hub */}
              <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#04151f]/90 via-[#071018]/90 to-[#02060a]/95 p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(6,182,212,0.25)]">
                {/* Background Ambient Glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-500/15 blur-3xl" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column: Shield Core & Slots */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 via-sky-600/15 to-blue-900/30 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-cyan-300">
                      {streakShields > 0 ? (
                        <ShieldCheck size={24} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                      ) : (
                        <Shield size={24} className="text-cyan-400/80" />
                      )}
                      {streakShields > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300 shadow-[0_0_8px_rgba(6,182,212,1)]"></span>
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black uppercase tracking-wider text-white">
                          Streak Freeze Shield
                        </span>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wide",
                            streakShields >= 2
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                              : streakShields === 1
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          )}
                        >
                          {streakShields}/2 Equipped
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                        Auto-protects your streak if you miss a check-in day. 1 shield absorbs 1 missed day.
                      </p>

                      {/* Dual Socket Inventory Visualizer */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-wider">
                          Sockets:
                        </span>
                        {/* Slot 1 */}
                        <div
                          className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9.5px] font-black tracking-tight transition-all",
                            streakShields >= 1
                              ? "bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                              : "bg-black/40 border border-dashed border-zinc-700 text-zinc-500"
                          )}
                        >
                          <Shield
                            size={10}
                            className={streakShields >= 1 ? "fill-cyan-400 text-cyan-400" : "text-zinc-600"}
                          />
                          <span>{streakShields >= 1 ? "Slot 1 Active" : "Slot 1 Empty"}</span>
                        </div>
                        {/* Slot 2 */}
                        <div
                          className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9.5px] font-black tracking-tight transition-all",
                            streakShields >= 2
                              ? "bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                              : "bg-black/40 border border-dashed border-zinc-700 text-zinc-500"
                          )}
                        >
                          <Shield
                            size={10}
                            className={streakShields >= 2 ? "fill-cyan-400 text-cyan-400" : "text-zinc-600"}
                          />
                          <span>{streakShields >= 2 ? "Slot 2 Active" : "Slot 2 Empty"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Equip CTA or Max Badge */}
                  <div className="w-full sm:w-auto shrink-0">
                    {streakShields >= 2 ? (
                      <div className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <CheckCheck size={14} className="text-emerald-400" />
                        <span>Max Protection (2/2)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleBuyShield}
                        disabled={buyingShield || credits < 30}
                        title={credits < 30 ? `Need 30 credits (You have ${credits})` : "Equip Streak Shield for 30 credits"}
                        className={cn(
                          "w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all shadow-md cursor-pointer",
                          credits >= 30 && !buyingShield
                            ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-900/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95"
                            : "bg-zinc-800 border border-zinc-700 text-zinc-400 opacity-60 cursor-not-allowed"
                        )}
                      >
                        {buyingShield ? (
                          <>
                            <Loader2 size={14} className="animate-spin text-cyan-300" />
                            <span>Equipping...</span>
                          </>
                        ) : (
                          <>
                            <Shield size={14} className="fill-cyan-300 text-cyan-200" />
                            <span>Equip Shield</span>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 border border-cyan-400/30 text-[10.5px] font-mono text-cyan-200">
                              <Coins size={10} className="text-amber-300" />
                              30 cr
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Streak Milestones — Duolingo / Cyber Quest Roadmap */}
              <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-[#100c18]/95 via-[#08060f]/95 to-[#040308]/98 p-4 sm:p-5 shadow-[0_15px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]">
                {/* Ambient Radial Spotlight */}
                <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-36 w-80 rounded-full bg-gradient-to-b from-amber-500/15 via-purple-500/10 to-transparent blur-3xl" />

                {/* Header */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-500/15 border border-amber-400/40 text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.3)]">
                      <Trophy size={18} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white whitespace-nowrap">
                          Streak Quest Roadmap
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide bg-amber-500/15 border border-amber-400/30 text-amber-300 whitespace-nowrap">
                          4 Milestones
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[8.5px] sm:text-[9px] font-bold">
                          <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                          <span>Active In-Game Perks</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Unlock bonus credit reserves & permanent perks along your streak journey
                      </p>
                    </div>
                  </div>

                  {/* Sleek Live Streak HUD */}
                  <div className="self-start sm:self-auto shrink-0">
                    {dailyStreak > 0 ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-black shadow-[0_0_15px_rgba(245,158,11,0.25)] whitespace-nowrap">
                        <Flame size={14} className="fill-amber-400 text-amber-400 animate-pulse" />
                        <span>Day {dailyStreak} Streak Active</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-400 text-xs font-bold whitespace-nowrap">
                        <Flame size={13} className="text-zinc-500" />
                        <span>0 Days Active · Claim to Start</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cyber Progression Energy Rail */}
                <div className="relative my-4">
                  {/* Outer Glowing Channel */}
                  <div className="relative h-3 w-full rounded-full bg-black/90 border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] overflow-hidden p-0.5">
                    {/* Animated Plasma Beam */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trackProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 via-cyan-400 to-emerald-400 shadow-[0_0_15px_rgba(245,158,11,0.8)] relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                      {dailyStreak > 0 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 -mr-1 rounded-full bg-yellow-200 blur-[1px] shadow-[0_0_8px_rgba(253,224,71,1)]" />
                      )}
                    </motion.div>
                  </div>

                  {/* Waypoint Energy Nodes */}
                  <div className="absolute inset-0 pointer-events-none">
                    {MILESTONES_DATA.map((milestone) => {
                      const isClaimed = streakMilestonesClaimed.includes(milestone.day.toString());
                      const isReached = dailyStreak >= milestone.day;
                      const nodePos = MILESTONE_POSITIONS[milestone.day] ?? 0;

                      return (
                        <div
                          key={milestone.day}
                          style={{ left: `${nodePos}%` }}
                          className={cn(
                            "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 text-[9px] sm:text-[9.5px] font-black transition-all shadow-md z-10",
                            isClaimed
                              ? "bg-emerald-500 border-emerald-300 text-black shadow-[0_0_12px_rgba(16,185,129,0.9)]"
                              : isReached
                              ? "bg-amber-400 border-yellow-200 text-black shadow-[0_0_15px_rgba(245,158,11,1)] animate-bounce"
                              : "bg-[#0c0d14] border-zinc-700 text-zinc-400"
                          )}
                        >
                          {isClaimed ? (
                            <Check size={11} className="stroke-[3]" />
                          ) : isReached ? (
                            <Flame size={12} className="fill-black text-black" />
                          ) : (
                            <span>{milestone.day}d</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Milestone Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                  {MILESTONES_DATA.map((milestone) => {
                    const isClaimed = streakMilestonesClaimed.includes(milestone.day.toString());
                    const isEligible = dailyStreak >= milestone.day && !isClaimed;
                    const isLocked = dailyStreak < milestone.day;
                    const isClaimingThis = claimingMilestone === milestone.day;
                    const daysRemaining = Math.max(milestone.day - dailyStreak, 0);
                    const progressPercent = Math.min(Math.round((dailyStreak / milestone.day) * 100), 100);
                    const IconComp = milestone.icon;

                    return (
                      <div
                        key={milestone.day}
                        className={cn(
                          "group/card relative rounded-2xl sm:rounded-3xl border p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-300 overflow-hidden backdrop-blur-xl",
                          isClaimed
                            ? "bg-gradient-to-b from-emerald-950/40 via-[#04150c]/70 to-[#020a06]/95 border-emerald-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.15)]"
                            : isEligible
                            ? "bg-gradient-to-b from-amber-500/25 via-orange-500/15 to-[#0e0702]/95 border-amber-400 shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_35px_rgba(245,158,11,0.45)] ring-1 ring-amber-400/50 animate-pulse"
                            : "bg-gradient-to-b " + milestone.cardGradient + " " + milestone.borderAccent + " shadow-[0_6px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.7)]"
                        )}
                      >
                        {/* Specular Rim Light */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        {/* Ambient Halo Glow */}
                        <div
                          className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover/card:opacity-100"
                          style={{
                            background: isClaimed ? "rgba(16, 185, 129, 0.2)" : isEligible ? "rgba(245, 158, 11, 0.3)" : milestone.glowShadow,
                            opacity: 0.6
                          }}
                        />

                        {/* Card Header: Tier Badge & Status Icon */}
                        <div className="relative z-10 flex items-center justify-between gap-1 mb-2">
                          <span className={cn("px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider border", milestone.perkBadge)}>
                            {milestone.tier}
                          </span>

                          {isClaimed ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0">
                              <CheckCheck size={11} className="stroke-[3]" />
                            </div>
                          ) : isEligible ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/30 border border-amber-300 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.9)] animate-spin shrink-0">
                              <Sparkles size={11} className="fill-amber-300" />
                            </div>
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 border border-white/10 text-zinc-500 shrink-0">
                              <Lock size={10} />
                            </div>
                          )}
                        </div>

                        {/* Hero Visual Artifact Podium */}
                        <div className="relative z-10 my-1 flex flex-col items-center justify-center text-center">
                          <div
                            className={cn(
                              "relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border transition-all duration-300 group-hover/card:scale-105",
                              isClaimed
                                ? "bg-gradient-to-br from-emerald-500/25 to-teal-900/30 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                                : isEligible
                                ? "bg-gradient-to-br from-amber-400/30 via-orange-500/20 to-yellow-600/30 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-bounce"
                                : "bg-gradient-to-br " + milestone.pedestalBg + " " + milestone.pedestalBorder
                            )}
                            style={{
                              boxShadow: !isClaimed && !isEligible ? `0 0 16px ${milestone.glowShadow}` : undefined
                            }}
                          >
                            <IconComp
                              size={24}
                              className={cn(
                                "transition-all duration-300",
                                isClaimed
                                  ? "text-emerald-300 fill-emerald-400/40 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                                  : isEligible
                                  ? "text-amber-200 fill-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,1)]"
                                  : milestone.iconColor
                              )}
                            />
                          </div>

                          {/* Day & Reward Amount */}
                          <div className="mt-2 text-center">
                            <span className="text-[10px] sm:text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider block">
                              Day {milestone.day}
                            </span>
                            <div className="flex items-center justify-center gap-1 mt-0.5">
                              <Coins size={13} className="text-amber-300 shrink-0" />
                              <span className="text-sm sm:text-base font-black text-white tracking-tight">
                                +{milestone.credits}
                              </span>
                              <span className="text-[10px] font-bold text-zinc-400">cr</span>
                            </div>
                          </div>

                          {/* Perk Pill & Benefit Description (Completely finishes without truncation!) */}
                          <div className="mt-2 w-full flex flex-col items-center gap-1">
                            <span className={cn("inline-flex items-center justify-center w-full py-1 px-1.5 rounded-xl text-[9px] sm:text-[9.5px] font-black leading-tight tracking-tight text-center border shadow-sm", milestone.perkBadge)}>
                              {milestone.perkText}
                            </span>
                            <span className="text-[8.5px] sm:text-[9px] text-zinc-400 text-center leading-tight font-medium">
                              {milestone.perkDesc}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer: Progress Pill or Claim CTA */}
                        <div className="relative z-10 mt-2.5">
                          {isClaimed ? (
                            <div className="w-full py-2 rounded-xl text-center text-[10px] sm:text-[11px] font-black text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                              <CheckCheck size={12} className="text-emerald-400 stroke-[2.5]" />
                              <span>Claimed</span>
                            </div>
                          ) : isEligible ? (
                            <button
                              type="button"
                              onClick={() => handleClaimMilestone(milestone.day)}
                              disabled={isClaimingThis}
                              className="w-full py-2 rounded-xl text-center text-[10px] sm:text-[11px] font-black text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.7)] transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                            >
                              {isClaimingThis ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Sparkles size={12} className="fill-black" />
                              )}
                              <span>Claim Drop</span>
                            </button>
                          ) : (
                            <div className="w-full rounded-xl bg-black/60 border border-white/5 px-2 py-1.5 text-center">
                              {/* Mini Segmented Progress Track */}
                              <div className="flex items-center justify-between text-[9px] font-mono font-bold mb-1 leading-none">
                                <span className="text-zinc-500">{dailyStreak}/{milestone.day}d</span>
                                <span className="text-amber-300 font-bold">{daysRemaining}d left</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-zinc-800/80 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
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
