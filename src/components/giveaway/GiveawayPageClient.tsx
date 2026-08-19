"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Sparkles,
  Trophy,
  Users,
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Coins,
  Crown,
  ExternalLink,
  Wand2,
  Box,
  Image as ImageIcon,
  FileText,
  Code2,
  Music,
  Share2,
} from "lucide-react";
import { CURRENT_GIVEAWAY } from "@/lib/giveaways";
import { useCredits } from "@/hooks/useCredits";
import { CreditTokenIcon } from "@/components/ui/CreditTokenIcon";
import { cn } from "@/lib/utils";

interface GiveawayData {
  userProgress?: {
    userId: string | null;
    creditsSpent: number;
    targetCredits: number;
    remainingCredits: number;
    percentage: number;
    isParticipated: boolean;
  };
  winner?: {
    name: string;
    email: string;
    prizeDisplay: string;
    awarded: boolean;
    isCurrentUserWinner?: boolean;
  } | null;
  isUpcoming?: boolean;
  isActive?: boolean;
  isExpired?: boolean;
  isCurrentUserWinner?: boolean;
  user?: {
    id: string;
    email?: string;
    name?: string;
  } | null;
}

const FEATURED_TOOLS = [
  {
    id: "minecraft-skin",
    name: "Minecraft Skin Studio",
    desc: "AI 3D skins, anime eyes & armor textures",
    href: "/tools/image/minecraft-skin",
    icon: Box,
    badge: "Hot · 24c",
    cost: "24c",
    borderGlow: "border-cyan-500/35 hover:border-cyan-400 shadow-[0_10px_35px_rgba(6,182,212,0.15)]",
    cardBg: "from-[#081822]/90 via-[#071018]/95 to-[#04080e]/98",
    iconBg: "border-cyan-400/40 bg-gradient-to-br from-cyan-400/25 to-blue-600/30 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)]",
    pillColor: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    btnColor: "bg-cyan-500/15 border-cyan-500/30 text-cyan-200 group-hover:bg-cyan-500 group-hover:text-black",
  },
  {
    id: "ai-img-gen",
    name: "AI Image Generator",
    desc: "Ultra HD Flux & SDXL image creation",
    href: "/tools/image/generator",
    icon: ImageIcon,
    badge: "Popular · 10c",
    cost: "10c",
    borderGlow: "border-purple-500/35 hover:border-purple-400 shadow-[0_10px_35px_rgba(168,85,247,0.15)]",
    cardBg: "from-[#180824]/90 via-[#100618]/95 to-[#07030b]/98",
    iconBg: "border-purple-400/40 bg-gradient-to-br from-purple-400/25 to-pink-600/30 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.35)]",
    pillColor: "border-purple-400/30 bg-purple-400/10 text-purple-300",
    btnColor: "bg-purple-500/15 border-purple-500/30 text-purple-200 group-hover:bg-purple-500 group-hover:text-black",
  },
  {
    id: "ai-writer",
    name: "AI Copywriter Studio",
    desc: "SEO blogs, viral hooks & ad scripts",
    href: "/tools/ai/writer",
    icon: FileText,
    badge: "Fast · 5c",
    cost: "5c",
    borderGlow: "border-amber-500/35 hover:border-amber-400 shadow-[0_10px_35px_rgba(245,158,11,0.15)]",
    cardBg: "from-[#1c1206]/90 via-[#120b04]/95 to-[#080502]/98",
    iconBg: "border-amber-400/40 bg-gradient-to-br from-amber-400/25 to-orange-600/30 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)]",
    pillColor: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    btnColor: "bg-amber-500/15 border-amber-500/30 text-amber-200 group-hover:bg-amber-500 group-hover:text-black",
  },
  {
    id: "youtube-thumbnail",
    name: "YouTube Thumbnail Studio",
    desc: "Viral high-CTR clickable thumbnails",
    href: "/tools/youtube/thumbnail",
    icon: Wand2,
    badge: "Creator · 5c",
    cost: "5c",
    borderGlow: "border-rose-500/35 hover:border-rose-400 shadow-[0_10px_35px_rgba(244,63,94,0.15)]",
    cardBg: "from-[#1e0812]/90 via-[#12050b]/95 to-[#080205]/98",
    iconBg: "border-rose-400/40 bg-gradient-to-br from-rose-400/25 to-red-600/30 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.35)]",
    pillColor: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    btnColor: "bg-rose-500/15 border-rose-500/30 text-rose-200 group-hover:bg-rose-500 group-hover:text-black",
  },
];

export function GiveawayPageClient() {
  const { credits, userId, isPro } = useCredits();
  const [data, setData] = useState<GiveawayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
    isUpcoming: true,
  });

  const giveaway = CURRENT_GIVEAWAY;

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/giveaways/status");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch (err) {
      console.error("Failed to load giveaway data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [userId]);

  // Live dual-phase countdown timer calculation
  useEffect(() => {
    const startTime = new Date(giveaway.startsAt).getTime();
    const endTime = new Date(giveaway.endsAt).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();

      // Phase 1: Upcoming (counting down to start time: Tomorrow 3:00 PM IST)
      if (now < startTime) {
        const difference = startTime - now;
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isEnded: false, isUpcoming: true });
        return;
      }

      // Phase 2: Concluded (after Aug 25 3:00 PM IST)
      const difference = endTime - now;
      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true,
          isUpcoming: false,
        });
        void fetchStatus();
        return;
      }

      // Phase 3: Active Live Giveaway (counting down to Aug 25 3:00 PM IST)
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false, isUpcoming: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [giveaway.startsAt, giveaway.endsAt]);

  const userProgress = data?.userProgress;
  const isParticipated = userProgress?.isParticipated || false;
  const creditsSpent = userProgress?.creditsSpent || 0;
  const targetCredits = giveaway.requiredSpend;
  const remainingCredits = Math.max(0, targetCredits - creditsSpent);
  const percentage = Math.min(100, Math.round((creditsSpent / targetCredits) * 100));

  const isUpcoming = Boolean(
    data?.isUpcoming !== undefined
      ? data.isUpcoming
      : new Date().getTime() < new Date(giveaway.startsAt).getTime()
  );
  const isGiveawayEnded = Boolean(
    !isUpcoming && (data?.winner || timeLeft.isEnded || data?.isExpired)
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isUpcoming) {
        document.title = "New Giveaway Coming Soon | Exismic";
      } else {
        document.title = `${giveaway.title} | Exismic`;
      }
    }
  }, [isUpcoming, giveaway.title]);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://exismic.com/giveaway";
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 text-white">
      {/* Dynamic Background Mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/15 via-purple-600/10 to-transparent blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-10 left-10 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Top Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs font-semibold text-zinc-400 transition hover:text-white"
            >
              Dashboard
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-bold text-amber-300">Giveaways</span>
          </div>
        </div>

        {/* UPCOMING STATE: Dedicated Full "NEW GIVEAWAY" Teaser Screen */}
        {isUpcoming ? (
          <div className="mx-auto max-w-4xl pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl p-[1.5px] shadow-[0_25px_100px_rgba(245,158,11,0.25)]"
            >
              {/* Static Background Border Outline */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl border border-amber-400/25 z-10" />

              {/* Rotating Conic Gradient Beam that travels around all 4 sides & rounded corners */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
                className="pointer-events-none absolute -inset-[150%] origin-center [background:conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,rgba(245,158,11,0.2)_300deg,#f59e0b_335deg,#ffffff_355deg,#fbbf24_360deg)]"
              />

              {/* Inner Card Content */}
              <div className="relative h-full w-full overflow-hidden rounded-[22.5px] bg-gradient-to-b from-[#181006]/98 via-[#0f0a18]/98 to-[#06060c]/99 p-8 sm:p-14 backdrop-blur-2xl z-10 text-center">
                {/* Ambient Top Glow Spheres */}
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full bg-amber-500/15 blur-[100px]" />
                <div className="pointer-events-none absolute -bottom-24 right-0 size-80 rounded-full bg-purple-600/10 blur-[100px]" />

                {/* Badge */}
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 px-4 py-1.5 text-xs font-black text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                  >
                    <Sparkles className="size-3.5 text-amber-300 animate-spin" />
                    <span className="tracking-wider uppercase">✨ SPECIAL COMMUNITY EVENT · COMING SOON</span>
                  </motion.div>
                </div>

                {/* Big Title */}
                <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                  Yay! A New Giveaway is{" "}
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(245,158,11,0.6)]">
                    Coming Soon 🎁
                  </span>
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                  We have something very special in store for our creators! The official grand prizes, rules, and entry qualification will be revealed right here the instant the countdown reaches zero.
                </p>

                {/* Large Luxury Countdown Box */}
                <div className="mx-auto mt-8 max-w-xl overflow-hidden rounded-3xl border border-amber-400/35 bg-black/60 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.7)]">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex size-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-300 sm:text-sm">
                        Giveaway Starts In
                      </span>
                    </div>
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 text-[10px] font-bold text-amber-300">
                      Tomorrow at 3:00 PM
                    </span>
                  </div>

                  {/* 4 Digit Boxes */}
                  <div className="grid grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { label: "DAYS", value: timeLeft.days },
                      { label: "HOURS", value: timeLeft.hours },
                      { label: "MINUTES", value: timeLeft.minutes },
                      { label: "SECONDS", value: timeLeft.seconds },
                    ].map((unit, idx) => (
                      <div
                        key={idx}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-3 sm:p-4 shadow-inner"
                      >
                        <div className="font-mono text-2xl sm:text-4xl font-black text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                          {String(unit.value).padStart(2, "0")}
                        </div>
                        <div className="mt-1 text-[9px] sm:text-[10px] font-black tracking-widest text-zinc-500">
                          {unit.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-3 text-center text-xs text-amber-200/90 font-medium">
                    ⚡ All prizes, entry requirements, and live qualification progress will unlock at zero
                  </div>
                </div>

                {/* 3 Teaser Chips */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] px-4 py-2.5 backdrop-blur-md">
                    <Trophy className="size-4 text-amber-400" />
                    <span className="text-xs font-bold text-zinc-200">Grand Community Prizes</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] px-4 py-2.5 backdrop-blur-md">
                    <Zap className="size-4 text-emerald-400" />
                    <span className="text-xs font-bold text-zinc-200">Automatic Qualification</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-purple-400/20 bg-purple-400/[0.04] px-4 py-2.5 backdrop-blur-md">
                    <Crown className="size-4 text-purple-400" />
                    <span className="text-xs font-bold text-zinc-200">Open to All Creators</span>
                  </div>
                </div>

                {/* Buttons / Actions */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/tools/image/generator"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-black text-black shadow-[0_0_30px_rgba(245,158,11,0.35)] transition hover:scale-105 hover:brightness-110"
                  >
                    <span>Explore Studios</span>
                    <ArrowRight className="size-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-zinc-300 backdrop-blur-md transition hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="size-4 text-emerald-400" />
                        <span className="text-emerald-300">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="size-4 text-amber-400" />
                        <span>Share Giveaway</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Pre-launch Note */}
                <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-zinc-400">
                  💡 <strong className="text-zinc-200">Get Ready:</strong> When the timer hits zero, this page will automatically unlock to reveal the full giveaway dashboard with interactive entry tracking and prize slots!
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* LIVE ACTIVE & CONCLUDED STATE: Full Giveaway Dashboard */
          <div>
            {/* Personal Winner Announcement Banner (Only shown to the winner when concluded) */}
            {data?.winner && (data?.isCurrentUserWinner || data?.winner?.isCurrentUserWinner) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 overflow-hidden rounded-3xl border border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-orange-500/20 p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] backdrop-blur-xl sm:p-8"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="grid size-16 place-items-center rounded-2xl border border-amber-300 bg-amber-400/30 text-3xl shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                      🏆
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300">
                          Official Winner Announced
                        </span>
                      </div>
                      <h2 className="mt-1 text-2xl font-black text-white">
                        Congratulations <span className="text-amber-300">{data.winner.name}</span>!
                      </h2>
                      <p className="text-xs text-zinc-300">
                        {data.winner.prizeDisplay} deposited directly into your account balance.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-400/40 bg-black/50 px-5 py-3 text-center">
                    <div className="text-xs font-bold text-zinc-400">Prize Awarded</div>
                    <div className="font-mono text-xl font-black text-amber-300">+500 CREDITS</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Encouraging Banner for Non-Winning Participants (Red Theme) */}
            {isGiveawayEnded &&
              isParticipated &&
              !(data?.isCurrentUserWinner || data?.winner?.isCurrentUserWinner) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 overflow-hidden rounded-3xl border border-rose-500/40 bg-gradient-to-r from-rose-500/15 via-red-950/25 to-[#12080d]/90 p-6 shadow-[0_0_50px_rgba(244,63,94,0.18)] backdrop-blur-xl sm:p-8"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="grid size-16 shrink-0 place-items-center rounded-2xl border border-rose-400/40 bg-rose-500/20 text-3xl shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                        🎯
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-300">
                            Giveaway Concluded · Participant Result
                          </span>
                        </div>
                        <h2 className="mt-1 text-2xl font-black text-white">
                          Better Luck Next Time!
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-300 max-w-xl">
                          You participated in this giveaway, but your account was not selected this round. We host community giveaways regularly — keep creating with Exismic and stay tuned for the next exclusive drop!
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-rose-400/30 bg-black/60 px-5 py-3 text-center shrink-0">
                      <div className="text-[10px] font-black tracking-wider uppercase text-rose-400">Next Giveaway</div>
                      <div className="font-mono text-sm font-black text-white mt-0.5">NEW DROPS SOON 🔥</div>
                    </div>
                  </div>
                </motion.div>
              )}

            {/* Hero Banner Card with 360° Continuous Animated Border Beam */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl p-[1.5px] shadow-[0_20px_90px_rgba(245,158,11,0.22)]"
            >
              {/* Static Background Border Outline */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl border border-amber-400/25 z-10" />

              {/* Rotating Conic Gradient Beam that travels around all 4 sides & rounded corners */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
                className="pointer-events-none absolute -inset-[150%] origin-center [background:conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,rgba(245,158,11,0.2)_300deg,#f59e0b_335deg,#ffffff_355deg,#fbbf24_360deg)]"
              />

              {/* Inner Card Content */}
              <div className="relative h-full w-full overflow-hidden rounded-[22.5px] bg-gradient-to-b from-[#160f06]/98 via-[#0e0a16]/98 to-[#06060c]/99 p-6 backdrop-blur-2xl sm:p-10 z-10">
                {/* Ambient Background Glow Mesh Inside Card */}
                <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-amber-500/10 blur-[90px]" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-purple-600/10 blur-[90px]" />

                <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
                  {/* Left Column: Title & Subtitle */}
                  <div className="space-y-4 lg:col-span-7">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                    >
                      <Gift className="size-3.5 text-amber-400 animate-bounce" />
                      <span>
                        {isGiveawayEnded
                          ? "Special Community Event · Concluded"
                          : "Special Community Event · Live Active Event"}
                      </span>
                    </motion.div>

                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.15]">
                      Win{" "}
                      <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(245,158,11,0.5)]">
                        500 Permanent
                      </span>{" "}
                      Credits
                    </h1>

                    <p className="text-sm leading-relaxed text-zinc-300 sm:text-base max-w-xl">
                      We are hosting an exclusive giveaway! <strong className="text-amber-200 font-black">3 lucky creators</strong> will randomly win <strong className="text-white font-black">500 Permanent Lifetime Credits</strong> each. Spend at least 100 credits across any Exismic tool to automatically qualify.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <motion.div
                        whileHover={{ y: -3, scale: 1.02 }}
                        className="flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] px-4 py-2.5 backdrop-blur-md shadow-sm transition hover:border-amber-400/40"
                      >
                        <Trophy className="size-4 text-amber-400" />
                        <span className="text-xs font-bold text-zinc-200">3 Winners (500c Each)</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -3, scale: 1.02 }}
                        className="flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] px-4 py-2.5 backdrop-blur-md shadow-sm transition hover:border-amber-400/40"
                      >
                        <Coins className="size-4 text-amber-400" />
                        <span className="text-xs font-bold text-zinc-200">1,500 Credits Prize Pool</span>
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -3, scale: 1.02 }}
                        className="flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] px-4 py-2.5 backdrop-blur-md shadow-sm transition hover:border-amber-400/40"
                      >
                        <Crown className="size-4 text-amber-300" />
                        <span className="text-xs font-bold text-zinc-200">Permanent Credits</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Right Column: Live Countdown Box (Active / Ended) */}
                  <div className="lg:col-span-5">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative overflow-hidden rounded-3xl border border-amber-400/35 bg-gradient-to-b from-[#140e06]/98 via-[#0b0814]/98 to-[#05040a]/98 p-6 shadow-[0_15px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
                    >
                      {/* Ambient Top Glow Spot */}
                      <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-amber-400/15 blur-[40px]" />

                      {isGiveawayEnded ? (
                        data?.winner ? (
                          <div>
                            {/* Concluded Header */}
                            <div className="mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Trophy className="size-4 text-amber-400" />
                                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                                  Giveaway Ended
                                </span>
                              </div>
                              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                                Winners Announced
                              </span>
                            </div>

                            {/* Main Concluded Card */}
                            <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-black/60 p-5 text-center shadow-inner">
                              {/* Floating Animated 3D Trophy Icon */}
                              <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                                className="mx-auto mb-2.5 grid size-12 place-items-center rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-400/30 to-yellow-500/20 text-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)]"
                              >
                                🏆
                              </motion.div>

                              <div className="text-xl font-black text-white tracking-tight">
                                ✨ Giveaway Concluded
                              </div>
                              <p className="mt-1.5 text-xs text-amber-200/90 font-medium leading-relaxed">
                                {isParticipated
                                  ? "🙌 Thanks for participating! Check the selected winners below."
                                  : "The giveaway has ended. Selected winners are listed below."}
                              </p>
                            </div>

                            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-3 text-center text-xs text-zinc-300 font-medium flex items-center justify-center gap-1.5">
                              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span>
                                {isParticipated
                                  ? "🎉 Official winners have been credited and announced below!"
                                  : "Stay tuned for the next community giveaway drop!"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {/* Selecting State */}
                            <div className="mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-amber-400 animate-spin" />
                                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                                  Giveaway Ended
                                </span>
                              </div>
                              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 text-[10px] font-black uppercase text-amber-300 animate-pulse">
                                Selecting Winners...
                              </span>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/60 p-5 text-center">
                              <div className="text-lg font-black text-amber-300">⚡ Selecting Winners...</div>
                              <p className="mt-1 text-xs text-zinc-400">
                                Winners will be announced shortly.
                              </p>
                            </div>

                            <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-3 text-center text-xs text-amber-200/90 font-medium">
                              ⏳ Selecting winners automatically...
                            </div>
                          </div>
                        )
                      ) : (
                        <div>
                          {/* Live Active Countdown State */}
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="relative flex size-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                              </span>
                              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                                Giveaway Ends In
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                              Live Active Countdown
                            </span>
                          </div>

                          {/* Countdown Digit Blocks with Glassmorphism */}
                          <div className="grid grid-cols-4 gap-2.5 text-center">
                            {[
                              { label: "DAYS", value: timeLeft.days },
                              { label: "HOURS", value: timeLeft.hours },
                              { label: "MINUTES", value: timeLeft.minutes },
                              { label: "SECONDS", value: timeLeft.seconds },
                            ].map((unit, idx) => (
                              <div
                                key={idx}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-3 shadow-inner"
                              >
                                <div className="text-2xl font-black text-amber-300 sm:text-3xl font-mono drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                                  {String(unit.value).padStart(2, "0")}
                                </div>
                                <div className="mt-1 text-[9px] font-black tracking-widest text-zinc-500">
                                  {unit.label}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-3 text-center text-xs text-amber-200/90 font-medium">
                            ⏳ Winners are selected automatically on August 25 when the timer reaches zero
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* User Participation & Automatic Entry Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e0c18]/95 via-[#090812]/95 to-[#05050a]/98 p-6 shadow-[0_15px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8"
            >
              {/* Header & Status Pill */}
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "grid size-9 place-items-center rounded-xl border",
                        isGiveawayEnded
                          ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : "border-amber-400/30 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      )}
                    >
                      {isGiveawayEnded ? (
                        <ShieldCheck className="size-5" />
                      ) : (
                        <Zap className="size-5" />
                      )}
                    </div>
                    <h2 className="text-xl font-black text-white sm:text-2xl">
                      {isGiveawayEnded ? "Your Final Entry Status" : "Your Entry Progress"}
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 sm:text-sm">
                    {isGiveawayEnded
                      ? "Giveaway window has concluded and all participant entries are locked and finalized."
                      : "Spend 100 credits across any Exismic AI or media tool to automatically qualify."}
                  </p>
                </div>

                {/* Participation Badge */}
                <div>
                  {!userId ? (
                    <Link
                      href="/login?next=/giveaway"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-xs font-black text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] transition hover:brightness-110"
                    >
                      <span>Sign In to Check Status</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : isGiveawayEnded ? (
                    isParticipated ? (
                      <div className="inline-flex items-center gap-2.5 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5 text-xs font-black text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 className="size-5 text-emerald-400" />
                        <span>QUALIFIED PARTICIPANT (Entered)</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2.5 rounded-2xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-xs font-black text-zinc-400">
                        <span>🔒 ENTRIES CLOSED (Not Qualified)</span>
                      </div>
                    )
                  ) : isParticipated ? (
                    <div className="inline-flex items-center gap-2.5 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5 text-xs font-black text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="size-5 text-emerald-400" />
                      <span>QUALIFIED & AUTOMATICALLY ENTERED</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2.5 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-xs font-black text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                      <Flame className="size-4 text-amber-400 animate-pulse" />
                      <span>Spend {remainingCredits} More Credits to Enter</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stat Tiles Grid (Logged In) */}
              {userId && (
                <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                  {/* Stat 1: Credits Spent */}
                  <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                      <span>Credits Spent in Window</span>
                      <Coins className="size-3.5 text-amber-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="font-mono text-2xl font-black text-white">{creditsSpent}</span>
                      <span className="text-xs font-semibold text-zinc-500">/ {targetCredits} Credits</span>
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-zinc-400">
                      {creditsSpent >= targetCredits ? "✅ Threshold Met" : `${remainingCredits} credits needed`}
                    </div>
                  </div>

                  {/* Stat 2: Entry Status */}
                  <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                      <span>Participation Status</span>
                      <Zap className="size-3.5 text-emerald-400" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={cn(
                          "font-mono text-2xl font-black",
                          isParticipated ? "text-emerald-300" : "text-amber-300"
                        )}
                      >
                        {isParticipated ? "QUALIFIED" : "NOT ENTERED"}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-zinc-400">
                      {isParticipated ? "100% Entered in Giveaway" : "Requires 100 credits spend"}
                    </div>
                  </div>

                  {/* Stat 3: Final Pool Status */}
                  <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                      <span>Giveaway Window</span>
                      <Clock className="size-3.5 text-cyan-400" />
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 font-mono text-2xl font-black text-white">
                      {isGiveawayEnded ? (
                        <span className="text-amber-300">CONCLUDED</span>
                      ) : (
                        <span className="text-emerald-300">ACTIVE</span>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-zinc-400">
                      {isGiveawayEnded ? "Selection finalized" : "Auto-selection on expiry"}
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar & Footer Note */}
              {userId && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-300">
                      {isGiveawayEnded ? "Final Entry Progress" : "Live Qualification Progress"}
                    </span>
                    <span className="font-mono text-amber-300">{percentage}%</span>
                  </div>

                  <div className="relative h-3.5 w-full overflow-hidden rounded-full border border-white/10 bg-black/60 p-0.5 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full transition-all",
                        isParticipated
                          ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]"
                          : "bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                      )}
                    />
                  </div>

                  <div>
                    {isGiveawayEnded ? (
                      isParticipated ? (
                        <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="size-4 shrink-0" />
                          <span>
                            Your entry was recorded and included in the final winner selection!
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-400 pt-1">
                          Entries are closed for this giveaway. Stay active and keep creating for the upcoming community drop!
                        </p>
                      )
                    ) : isParticipated ? (
                      <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 pt-1">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>
                          You are fully entered! Your account is entered in the giveaway.
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-400 pt-1">
                        💡 Tip: Use any AI generator, Minecraft skin studio, or copywriter tool to easily reach 100 credits!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Prize Pool & Selected Winners Section */}
            <div className="mt-12">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <h2 className="text-xl font-black text-white sm:text-2xl">
                      {data?.winner ? "Official Selected Winners" : "Official Prize Distribution & Slots"}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                    {data?.winner
                      ? "The giveaway has concluded. Here are the 3 winning slots and awarded permanent credit balances."
                      : "3 random participants who spend 100+ credits will be awarded 500 Permanent Credits each on August 25."}
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <Crown className="size-3.5 text-amber-400" />
                  <span>1,500 Credits Total Pool</span>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[
                  {
                    slotNum: 1,
                    rankLabel: "1ST PRIZE",
                    rankBadge: "👑 Grand Prize",
                    winnerName: data?.winner ? data.winner.name : null,
                    amount: "500 Permanent Credits",
                    statusText: data?.winner
                      ? "Deposited into Account Balance"
                      : "Random Selection at Expiry",
                    borderColor: "border-amber-400/45 hover:border-amber-300",
                    bgGradient: "from-[#1a1205]/95 via-[#0e0a16]/95 to-[#07060b]/98",
                    glowShadow: "shadow-[0_15px_50px_rgba(245,158,11,0.2)]",
                    pillColor: "border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300",
                    avatarBg: "border-amber-400/50 bg-gradient-to-br from-amber-400/30 via-yellow-500/20 to-orange-500/30 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.4)]",
                    iconColor: "text-amber-300",
                    accentTag: "Champion",
                  },
                  {
                    slotNum: 2,
                    rankLabel: "2ND PRIZE",
                    rankBadge: "🥈 Lucky Winner #2",
                    winnerName: data?.winner ? data.winner.name : null,
                    amount: "500 Permanent Credits",
                    statusText: data?.winner
                      ? "Deposited into Account Balance"
                      : "Random Selection at Expiry",
                    borderColor: "border-slate-300/35 hover:border-slate-200",
                    bgGradient: "from-[#121624]/95 via-[#0c0e18]/95 to-[#07060b]/98",
                    glowShadow: "shadow-[0_15px_50px_rgba(148,163,184,0.15)]",
                    pillColor: "border-slate-300/30 bg-gradient-to-r from-slate-400/20 to-cyan-500/20 text-slate-200",
                    avatarBg: "border-slate-300/40 bg-gradient-to-br from-slate-400/30 via-cyan-500/15 to-blue-500/20 text-slate-100 shadow-[0_0_25px_rgba(148,163,184,0.3)]",
                    iconColor: "text-slate-200",
                    accentTag: "Runner Up",
                  },
                  {
                    slotNum: 3,
                    rankLabel: "3RD PRIZE",
                    rankBadge: "🥉 Lucky Winner #3",
                    winnerName: data?.winner ? data.winner.name : null,
                    amount: "500 Permanent Credits",
                    statusText: data?.winner
                      ? "Deposited into Account Balance"
                      : "Random Selection at Expiry",
                    borderColor: "border-amber-600/35 hover:border-amber-500",
                    bgGradient: "from-[#18100a]/95 via-[#0e0a14]/95 to-[#07060b]/98",
                    glowShadow: "shadow-[0_15px_50px_rgba(217,119,6,0.15)]",
                    pillColor: "border-amber-600/30 bg-gradient-to-r from-amber-700/20 to-orange-600/20 text-amber-300",
                    avatarBg: "border-amber-600/40 bg-gradient-to-br from-amber-600/30 via-orange-600/20 to-yellow-600/20 text-amber-200 shadow-[0_0_25px_rgba(217,119,6,0.3)]",
                    iconColor: "text-amber-400",
                    accentTag: "Winner",
                  },
                ].map((prize, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      "relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-b p-6 backdrop-blur-2xl transition-all duration-300",
                      prize.borderColor,
                      prize.bgGradient,
                      prize.glowShadow
                    )}
                  >
                    {/* Top Corner Ambient Glow */}
                    <div className="pointer-events-none absolute -top-16 -right-16 size-36 rounded-full bg-amber-400/10 blur-[40px]" />

                    <div>
                      {/* Card Header Tag */}
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-[11px] font-black tracking-wider uppercase backdrop-blur-md",
                            prize.pillColor
                          )}
                        >
                          {prize.rankBadge}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-400">
                          <Sparkles className="size-3 text-amber-400" />
                          <span>{prize.rankLabel}</span>
                        </span>
                      </div>

                      {/* Winner Profile Body */}
                      <div className="mt-6 flex items-center gap-4">
                        <div
                          className={cn(
                            "relative grid size-14 shrink-0 place-items-center rounded-2xl border text-xl font-black transition-transform duration-300 group-hover:scale-105",
                            prize.avatarBg
                          )}
                        >
                          {prize.winnerName ? (
                            prize.winnerName.slice(0, 2).toUpperCase()
                          ) : (
                            <Gift className="size-6 text-amber-300/80" />
                          )}
                          {prize.winnerName && (
                            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-black ring-2 ring-black">
                              ✓
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            {prize.winnerName ? "Verified Winner" : "Prize Slot Status"}
                          </div>
                          <div className="mt-0.5 text-base font-black text-white">
                            {prize.winnerName ? (
                              prize.winnerName
                            ) : (
                              <span className="text-zinc-400 italic">Unclaimed Slot</span>
                            )}
                          </div>

                          {prize.winnerName ? (
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono text-[11px] font-black text-amber-300">
                                +500 CREDITS
                              </span>
                            </div>
                          ) : (
                            <div>
                              <div className="text-xl font-black text-white">500 Credits</div>
                              <div className="text-xs font-semibold text-amber-300">
                                Permanent Lifetime Prize
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Footer */}
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-zinc-300 font-medium">
                          <span
                            className={cn(
                              "relative flex size-2 shrink-0 rounded-full",
                              prize.winnerName ? "bg-emerald-400" : "bg-amber-400"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute inline-flex size-full animate-ping rounded-full opacity-75",
                                prize.winnerName ? "bg-emerald-400" : "bg-amber-400"
                              )}
                            />
                          </span>
                          <span className="truncate text-[11px] font-semibold text-zinc-300">
                            {prize.statusText}
                          </span>
                        </div>

                        <span className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                          LIFETIME
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Launch: Tools to Spend Credits & Enter */}
            <div className="mt-14">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white sm:text-2xl">
                    Spend Credits & Enter Instantly
                  </h2>
                  <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                    Launch any tool to generate images, remix Minecraft skins, or write articles to easily reach 100 credits.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {FEATURED_TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-b p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5",
                        tool.borderGlow,
                        tool.cardBg
                      )}
                    >
                      {/* Subtle Top Radial Aura */}
                      <div className="pointer-events-none absolute -top-12 -right-12 size-28 rounded-full bg-white/[0.03] blur-[30px]" />

                      <div>
                        {/* Top Row: Icon and Badge */}
                        <div className="flex items-center justify-between">
                          <div
                            className={cn(
                              "grid size-12 place-items-center rounded-2xl border transition-transform duration-300 group-hover:scale-110",
                              tool.iconBg
                            )}
                          >
                            <Icon className="size-6" />
                          </div>
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider",
                              tool.pillColor
                            )}
                          >
                            {tool.badge}
                          </span>
                        </div>

                        {/* Tool Name & Description */}
                        <div className="mt-5">
                          <h3 className="text-base font-black text-white transition-colors duration-200 group-hover:text-amber-200">
                            {tool.name}
                          </h3>
                          <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                            {tool.desc}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Action Area */}
                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-400">
                          <Zap className="size-3 text-amber-400" />
                          <span>{tool.cost}</span>
                        </div>

                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition-all duration-200 shadow-sm",
                            tool.btnColor
                          )}
                        >
                          <span>Launch Studio</span>
                          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Giveaway Terms & Transparency Section */}
            <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0c0915]/90 via-[#07060e]/95 to-[#040408]/98 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-10">
              {/* Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl border border-emerald-400/40 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <ShieldCheck className="size-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Giveaway Rules & Transparency</h3>
                    <p className="text-xs text-zinc-400">Simple, fair, and automated terms for the Exismic community.</p>
                  </div>
                </div>

                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-xs font-bold text-emerald-300">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Automated & Provably Fair</span>
                </div>
              </div>

              {/* Rules Cards Grid */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    num: "01",
                    icon: Flame,
                    title: "100 Credits Qualification",
                    desc: "Spend at least 100 credits across any Exismic AI, Minecraft 3D Studio, or media tools during the active giveaway window.",
                    border: "border-amber-400/25 hover:border-amber-400/50",
                    iconBg: "border-amber-400/30 bg-amber-400/10 text-amber-300",
                    badgeBg: "bg-amber-400/10 text-amber-300",
                  },
                  {
                    num: "02",
                    icon: CheckCircle2,
                    title: "100% Automatic Entry",
                    desc: "No manual forms, surveys, or external sign-ups required. Your entry is registered automatically the instant you hit 100 credits.",
                    border: "border-emerald-400/25 hover:border-emerald-400/50",
                    iconBg: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
                    badgeBg: "bg-emerald-400/10 text-emerald-300",
                  },
                  {
                    num: "03",
                    icon: Sparkles,
                    title: "Random Winner Selection",
                    desc: "Winners are selected completely at random by our automated backend system when the live countdown timer expires.",
                    border: "border-purple-400/25 hover:border-purple-400/50",
                    iconBg: "border-purple-400/30 bg-purple-400/10 text-purple-300",
                    badgeBg: "bg-purple-400/10 text-purple-300",
                  },
                  {
                    num: "04",
                    icon: Crown,
                    title: "Permanent Lifetime Credits",
                    desc: "Prize credits are permanent Lifetime Credits that never expire, do not reset with daily allowances, and work across all 40+ tools.",
                    border: "border-yellow-400/25 hover:border-yellow-400/50",
                    iconBg: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
                    badgeBg: "bg-yellow-400/10 text-yellow-300",
                  },
                  {
                    num: "05",
                    icon: Zap,
                    title: "Instant Direct Auto-Deposit",
                    desc: "Winning credits are credited directly to your account balance immediately with an in-site confirmation notification and email.",
                    border: "border-cyan-400/25 hover:border-cyan-400/50",
                    iconBg: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
                    badgeBg: "bg-cyan-400/10 text-cyan-300",
                  },
                  {
                    num: "06",
                    icon: Users,
                    title: "Community First & Transparent",
                    desc: "Every creator has equal winning odds. Winning accounts are publicly showcased in the official winners showcase at conclusion.",
                    border: "border-rose-400/25 hover:border-rose-400/50",
                    iconBg: "border-rose-400/30 bg-rose-400/10 text-rose-300",
                    badgeBg: "bg-rose-400/10 text-rose-300",
                  },
                ].map((rule, idx) => {
                  const RuleIcon = rule.icon;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#0b0914]/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg backdrop-blur-xl",
                        rule.border
                      )}
                    >
                      <div>
                        {/* Top Row: Icon & Step Number */}
                        <div className="flex items-center justify-between">
                          <div
                            className={cn(
                              "grid size-10 place-items-center rounded-xl border transition-transform duration-300 group-hover:scale-110",
                              rule.iconBg
                            )}
                          >
                            <RuleIcon className="size-5" />
                          </div>
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 font-mono text-[10px] font-black",
                              rule.badgeBg
                            )}
                          >
                            {rule.num}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div className="mt-4">
                          <h4 className="text-sm font-black text-white group-hover:text-amber-200 transition-colors">
                            {rule.title}
                          </h4>
                          <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                            {rule.desc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-white/5 pt-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          Official Exismic Rule
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Share Action Footer Bar */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-amber-400/10 text-amber-300">
                    <Gift className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Spread the Word</div>
                    <div className="text-[11px] text-zinc-400">
                      Invite other creators to participate and win 500 permanent credits.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2.5 text-xs font-black text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] transition hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <Share2 className="size-4 text-black" />
                  <span>{copied ? "Link Copied to Clipboard!" : "Copy Giveaway Link"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
