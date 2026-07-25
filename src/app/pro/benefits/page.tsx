"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  Crown, 
  Archive, 
  ImageDown,
  Diamond,
  Flame,
  Wand2,
  Layers,
  ArrowRight,
  Gift,
  Infinity as InfinityIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GradientText from "@/components/ui/GradientText";

export default function ProBenefitsPage() {
  const { isPro, isLoading } = usePro();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "creative" | "speed" | "style">("all");

  useEffect(() => {
    if (!isLoading && !isPro) {
      router.push('/pro');
    }
  }, [isPro, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030308] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
          <Crown className="w-6 h-6 text-purple-400 animate-pulse" />
        </div>
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-zinc-400">Loading VIP Perks...</p>
      </div>
    );
  }

  if (!isPro) return null;

  const benefits = [
    { 
      id: "unlimited",
      category: "creative",
      title: "Limitless Creative Freedom", 
      desc: "Creation without boundaries. Craft as many images, videos, and projects as your imagination demands.", 
      icon: InfinityIcon, 
      color: "from-amber-400 to-orange-500",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-400/10 border-amber-400/30",
      glowColor: "rgba(245, 158, 11, 0.25)",
      badgeText: "UNLIMITED",
      privilegeLevel: 5
    },
    { 
      id: "quality",
      category: "creative",
      title: "Ultra-Sharp 4K Quality", 
      desc: "Export crystal-clear visuals with breathtaking detail, rich colors, and razor-sharp resolution.", 
      icon: Sparkles, 
      color: "from-cyan-400 to-blue-500",
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-400/10 border-cyan-400/30",
      glowColor: "rgba(6, 182, 212, 0.25)",
      badgeText: "ULTRA HD",
      privilegeLevel: 5
    },
    { 
      id: "speed",
      category: "speed",
      title: "VIP Express Speed",
      desc: "Skip all waiting lines. Your requests run on dedicated high-performance lanes for instant results.",
      icon: Zap, 
      color: "from-purple-400 to-indigo-500",
      iconColor: "text-purple-400",
      iconBg: "bg-purple-400/10 border-purple-400/30",
      glowColor: "rgba(168, 85, 247, 0.25)",
      badgeText: "INSTANT",
      privilegeLevel: 5
    },
    { 
      id: "batch",
      category: "creative",
      title: "One-Click Bulk Magic",
      desc: "Transform multiple files simultaneously with effortless ease and save countless hours of manual work.",
      icon: Archive,
      color: "from-blue-400 to-cyan-400",
      iconColor: "text-blue-400",
      iconBg: "bg-blue-400/10 border-blue-400/30",
      glowColor: "rgba(96, 165, 250, 0.25)",
      badgeText: "BULK POWER",
      privilegeLevel: 4
    },
    { 
      id: "commercial",
      category: "creative",
      title: "100% Commercial Rights",
      desc: "Clean exports without any watermarks, fully licensed for your personal, client, and commercial projects.",
      icon: ShieldCheck,
      color: "from-emerald-400 to-teal-500",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-400/10 border-emerald-400/30",
      glowColor: "rgba(52, 211, 153, 0.25)",
      badgeText: "LICENSED",
      privilegeLevel: 5
    },
    { 
      id: "cloud",
      category: "speed",
      title: "Instant Everywhere Access", 
      desc: "Your creations are automatically synced and accessible from any device, anywhere, anytime.", 
      icon: Layers, 
      color: "from-teal-400 to-emerald-400",
      iconColor: "text-teal-400",
      iconBg: "bg-teal-400/10 border-teal-400/30",
      glowColor: "rgba(45, 212, 191, 0.25)",
      badgeText: "SYNCED",
      privilegeLevel: 4
    },
    { 
      id: "early",
      category: "speed",
      title: "First-Look VIP Features", 
      desc: "Be the very first to experience groundbreaking new creative tools long before they launch to the public.", 
      icon: Flame, 
      color: "from-pink-400 to-rose-500",
      iconColor: "text-pink-400",
      iconBg: "bg-pink-400/10 border-pink-400/30",
      glowColor: "rgba(244, 114, 182, 0.25)",
      badgeText: "VIP ACCESS",
      privilegeLevel: 5
    },
    {
      id: "customization",
      category: "style",
      title: "Elite Profile Badging",
      desc: "Stand out with exclusive glowing profile frames, custom title badges, and animated signature styling.",
      icon: Crown,
      color: "from-fuchsia-400 to-purple-500",
      iconColor: "text-fuchsia-400",
      iconBg: "bg-fuchsia-400/10 border-fuchsia-400/30",
      glowColor: "rgba(232, 121, 249, 0.25)",
      badgeText: "EXCLUSIVE",
      privilegeLevel: 5
    },
    {
      id: "themes",
      category: "style",
      title: "Luxury Workspace Themes",
      desc: "Personalize your studio workspace with private handcrafted luxury accent themes and ambient glass glows.",
      icon: Diamond,
      color: "from-violet-400 to-indigo-500",
      iconColor: "text-violet-400",
      iconBg: "bg-violet-400/10 border-violet-400/30",
      glowColor: "rgba(167, 139, 250, 0.25)",
      badgeText: "LUXURY",
      privilegeLevel: 4
    }
  ];

  const filteredBenefits = activeTab === "all" 
    ? benefits 
    : benefits.filter(b => b.category === activeTab);

  return (
    <div className="min-h-screen bg-[#030308] text-white selection:bg-purple-500/30 pb-32 overflow-hidden relative">
      {/* 🌌 High-End Ambient Lighting Architecture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] right-[-10%] w-[1000px] h-[1000px] bg-gradient-to-br from-purple-600/15 via-indigo-600/10 to-transparent blur-[160px] rounded-full animate-pulse" />
        <div className="absolute top-[40%] -left-[15%] w-[900px] h-[900px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-transparent blur-[150px] rounded-full" />
        <div className="absolute -bottom-[20%] right-[10%] w-[800px] h-[800px] bg-gradient-to-tl from-fuchsia-600/10 via-purple-900/10 to-transparent blur-[140px] rounded-full" />
        
        {/* Subtle Luxury Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 relative z-10">
        
        {/* Navigation & Header */}
        <div className="space-y-8 mb-12 md:mb-16">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 text-zinc-400 hover:text-white transition-all duration-300 group shadow-lg backdrop-blur-md"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-purple-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Return to Studio</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Crown size={14} className="text-purple-400 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-purple-300">Exclusive VIP Access</span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] text-white">
                VIP <GradientText className="from-purple-400 via-fuchsia-300 to-cyan-300">Privileges</GradientText>
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base font-medium leading-relaxed">
                Welcome to the top tier. Your membership unlocks priority access, unlimited creation power, and high-resolution perfection.
              </p>
            </div>

            {/* Status Card */}
            <div className="relative isolate group p-6 rounded-3xl bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent border border-purple-500/30 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.5)] overflow-hidden min-w-[280px]">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/5 to-cyan-500/10 opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">Membership Tier</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-200 to-white">
                      ELITE MEMBER
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 pt-1">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>All Perks Unlocked</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.3)] shrink-0">
                  <Crown size={28} className="drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily VIP Bonus & Streak Multiplier Widget */}
        <VipDailyBonusCard />

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-3 px-1.5 mb-10 no-scrollbar">
          {[
            { id: "all", label: "All Privileges", icon: Diamond },
            { id: "creative", label: "Creative Power", icon: Wand2 },
            { id: "speed", label: "Speed & Access", icon: Zap },
            { id: "style", label: "Style & Prestige", icon: Crown }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer border",
                  isActive 
                    ? "bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white border-purple-400/60 shadow-[0_4px_20px_rgba(168,85,247,0.4)]" 
                    : "bg-white/[0.04] text-zinc-400 hover:text-white border-white/10 hover:border-white/20 hover:bg-white/[0.08]"
                )}
              >
                <TabIcon size={15} className={isActive ? "text-white" : "text-zinc-500"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Privileges Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-24"
          >
            {filteredBenefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div 
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative isolate p-7 sm:p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.05] via-white/[0.015] to-transparent border border-white/10 hover:border-purple-500/40 transition-all duration-500 overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
                >
                  {/* Dynamic Glowing Background Aura */}
                  <div 
                    className="absolute -top-24 -right-24 w-64 h-64 blur-[90px] opacity-20 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"
                    style={{ background: b.glowColor }}
                  />

                  {/* Top Header Row inside Card */}
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 shadow-lg shrink-0",
                      b.iconBg || "border-white/15 bg-white/[0.05]"
                    )}>
                      <Icon size={28} className={cn("drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]", b.iconColor)} />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-400 tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                      </span>
                      {b.badgeText}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3 relative z-10 mb-8">
                    <h3 className="text-xl font-extrabold tracking-tight text-white group-hover:text-purple-200 transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-xs font-medium text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                      {b.desc}
                    </p>
                  </div>

                  {/* Privilege Level Meter */}
                  <div className="pt-5 border-t border-white/10 flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                      Privilege Tier
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[...Array(5)].map((_, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "w-2.5 h-1.5 rounded-full transition-all duration-300",
                            idx < b.privilegeLevel 
                              ? "bg-gradient-to-r from-purple-400 to-fuchsia-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" 
                              : "bg-zinc-800"
                          )} 
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Hero Callout */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative isolate p-8 sm:p-12 lg:p-16 rounded-[2.5rem] bg-gradient-to-br from-purple-950/40 via-zinc-950 to-black border border-purple-500/30 overflow-hidden text-center backdrop-blur-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)]"
        >
          {/* Glowing Center Radial */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mx-auto shadow-[0_0_35px_rgba(168,85,247,0.3)]">
              <Sparkles size={32} className="animate-pulse" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Ready to Craft <br />
              <GradientText className="from-purple-300 via-fuchsia-200 to-cyan-300">Your Next Masterpiece?</GradientText>
            </h2>

            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Your VIP status is active with unrestricted privileges. Jump right in and start creating without limits.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="/" 
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold uppercase tracking-wider text-xs shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Launch Studio Dashboard</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/tools" 
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-extrabold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
              >
                Browse All Tools
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function VipDailyBonusCard() {
  const [claimed, setClaimed] = useState(false);
  const [streak, setStreak] = useState(3);
  const [timeLeft, setTimeLeft] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const lastClaim = localStorage.getItem("exismic_vip_daily_claim");
    const storedStreak = parseInt(localStorage.getItem("exismic_vip_streak") || "3", 10);
    setStreak(storedStreak);

    if (lastClaim) {
      const lastClaimDate = new Date(lastClaim);
      const now = new Date();
      const diffMs = now.getTime() - lastClaimDate.getTime();
      if (diffMs < 24 * 60 * 60 * 1000 && now.getDate() === lastClaimDate.getDate()) {
        setClaimed(true);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(24, 0, 0, 0);
      const diffSecs = Math.max(0, Math.floor((nextReset.getTime() - now.getTime()) / 1000));
      const hours = Math.floor(diffSecs / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      const secs = diffSecs % 60;
      setTimeLeft(
        `${hours.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClaim = () => {
    if (claimed || claiming) return;
    setClaiming(true);

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#a855f7", "#e879f9", "#38bdf8", "#fbbf24"]
    });

    setTimeout(() => {
      const nextStreak = Math.min(streak + 1, 5);
      setStreak(nextStreak);
      setClaimed(true);
      setClaiming(false);
      localStorage.setItem("exismic_vip_daily_claim", new Date().toISOString());
      localStorage.setItem("exismic_vip_streak", nextStreak.toString());
    }, 600);
  };

  const streakItems = [
    { day: 1, reward: "+100 Bonus", icon: Gift },
    { day: 2, reward: "+125 Bonus", icon: Zap },
    { day: 3, reward: "+150 Bonus", icon: Flame },
    { day: 4, reward: "+200 Bonus", icon: Star },
    { day: 5, reward: "+300 Mega", icon: Crown }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative isolate group p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-950/20 via-purple-950/20 to-black border border-amber-500/30 backdrop-blur-2xl shadow-[0_15px_50px_rgba(245,158,11,0.1)] overflow-hidden mb-12"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.15)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.12)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Flame size={14} className="text-amber-400 animate-pulse" />
            <span>Daily VIP Reward Pass</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <span>VIP Streak Bonus</span>
            <span className="text-amber-400 font-extrabold text-xs px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 shadow-inner">
              {streak}x Streak Active
            </span>
          </h3>

          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            Maintain your daily login streak to increase your VIP reward bonus. Claim every 24 hours to maximize your exclusive member perks.
          </p>

          {claimed && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400/90 pt-1">
              <Sparkles size={14} className="text-amber-400 animate-spin" />
              <span>Next Reward Reset in: <strong className="font-mono text-white text-sm tracking-wider">{timeLeft || "12h 00m 00s"}</strong></span>
            </div>
          )}
        </div>

        <div className="w-full lg:w-auto space-y-6 flex flex-col items-start lg:items-end">
          
          <button
            onClick={handleClaim}
            disabled={claimed || claiming}
            className={cn(
              "w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 shadow-xl border",
              claimed 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 cursor-default shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                : "bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white border-amber-300/40 shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95 cursor-pointer"
            )}
          >
            {claimed ? (
              <>
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>Today's VIP Bonus Claimed (+150)</span>
              </>
            ) : claiming ? (
              <>
                <Loader2 size={18} className="animate-spin text-white" />
                <span>Unlocking Reward...</span>
              </>
            ) : (
              <>
                <Gift size={18} className="text-amber-200 animate-bounce" />
                <span>Claim +150 Daily VIP Bonus</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 sm:gap-3 w-full justify-between sm:justify-end">
            {streakItems.map((item) => {
              const isPassed = item.day <= streak;
              const isCurrent = item.day === streak;
              const ItemIcon = item.icon;
              return (
                <div key={item.day} className="flex flex-col items-center gap-1.5">
                  <div 
                    className={cn(
                      "w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border transition-all duration-300 relative",
                      isPassed 
                        ? "bg-gradient-to-br from-amber-400/20 to-purple-600/20 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]" 
                        : "bg-white/[0.03] border-white/10 text-zinc-600"
                    )}
                  >
                    <ItemIcon size={18} />
                    {isPassed && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black font-black text-[9px] flex items-center justify-center shadow-md">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className={cn("text-[9px] font-extrabold uppercase tracking-wide", isCurrent ? "text-amber-400" : isPassed ? "text-zinc-300" : "text-zinc-600")}>
                    Day {item.day}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </motion.div>
  );
}

