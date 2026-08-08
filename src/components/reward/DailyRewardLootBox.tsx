"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, Flame, Gift, Loader2, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParticleCanvasVFX, VFXStage } from "./ParticleCanvasVFX";
import { soundController } from "./SoundController";
import { getRarityConfig, RewardRarity } from "./rarityConfig";
import { QuantumEnergyVault } from "./QuantumEnergyVault";

interface DailyRewardLootBoxProps {
  user: unknown;
  claiming: boolean;
  claimLocked: boolean;
  dailyStreak: number;
  countdown: string;
  claimResult: { amount: number; rarity: string; type?: "temporary" | "permanent" } | null;
  onClaim: () => Promise<void>;
}

interface SparkleItem {
  id: number;
  x: number;
  y: number;
  size: number;
}

export const DailyRewardLootBox: React.FC<DailyRewardLootBoxProps> = ({
  user,
  claiming,
  claimLocked,
  dailyStreak,
  countdown,
  claimResult,
  onClaim,
}) => {
  const [animStage, setAnimStage] = useState<"idle" | "pause" | "charging" | "explosion" | "revealed">("idle");
  const [vfxStage, setVfxStage] = useState<VFXStage>("idle");
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [shakeOffset, setShakeOffset] = useState<{ x: number; y: number; rotate: number }>({ x: 0, y: 0, rotate: 0 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [shineSweep, setShineSweep] = useState<boolean>(false);
  const [displayCount, setDisplayCount] = useState<number>(0);
  const [sparkles, setSparkles] = useState<SparkleItem[]>([]);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const currentRarity: RewardRarity = (claimResult?.rarity?.toLowerCase() as RewardRarity) || "common";
  const rarityConfig = getRarityConfig(currentRarity);
  const targetAmount = claimResult?.amount || 50;

  // Max 6px Parallax Offset calculation
  const parallaxOffset = {
    x: (mousePos.x - 0.5) * 6,
    y: (mousePos.y - 0.5) * 6,
  };

  // Sync internal stages with external claim state if already claimed on load
  useEffect(() => {
    if (claimLocked && claimResult && animStage === "idle") {
      setAnimStage("revealed");
      setVfxStage("revealed");
      setDisplayCount(claimResult.amount);
    }
  }, [claimLocked, claimResult, animStage]);

  // Periodic Shine Sweep every 8.4 seconds
  useEffect(() => {
    const shineInterval = setInterval(() => {
      setShineSweep(true);
      setTimeout(() => setShineSweep(false), 950);
    }, 8400);

    return () => clearInterval(shineInterval);
  }, []);

  // Ambient Random Sparkles Spawns every 2.8 seconds
  useEffect(() => {
    const sparkleInterval = setInterval(() => {
      const newSparkles: SparkleItem[] = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 85 + 7.5,
        y: Math.random() * 85 + 7.5,
        size: Math.random() * 8 + 4,
      }));
      setSparkles(newSparkles);

      setTimeout(() => setSparkles([]), 1800);
    }, 2800);

    return () => clearInterval(sparkleInterval);
  }, []);

  // Smooth Animated Number Counter
  useEffect(() => {
    if (animStage === "revealed") {
      const duration = 600;
      const startTime = performance.now();

      const updateCounter = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setDisplayCount(Math.floor(eased * targetAmount));

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    } else {
      setDisplayCount(0);
    }
  }, [animStage, targetAmount]);

  // Handle Mouse Spotlight & Parallax
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  }, []);

  // AAA Opening Sequence Orchestrator
  const runSequence = async (isRealClaim: boolean = true) => {
    if (animStage === "charging" || animStage === "pause") return;

    soundController.playClick();

    // 1. Initial Click Squash & 180ms Tension Pause
    setAnimStage("pause");
    await new Promise((r) => setTimeout(r, 180));

    // 2. Trigger real backend claim API if needed
    let claimPromise: Promise<void> | null = null;
    if (isRealClaim) {
      claimPromise = onClaim();
    }

    // 3. Charging Phase: Implosion, sub-bass riser audio, screen shake build-up
    setAnimStage("charging");
    setVfxStage("charging");
    soundController.startCharge(rarityConfig.soundPitchOffset);

    // Ramping Shake Loop during charging
    const startTime = Date.now();
    const chargeDuration = rarityConfig.chargingDurationMs;

    const shakeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / chargeDuration);
      const intensity = rarityConfig.shakeIntensity * Math.pow(progress, 2.2);

      setShakeOffset({
        x: (Math.random() - 0.5) * intensity * 6,
        y: (Math.random() - 0.5) * intensity * 6,
        rotate: (Math.random() - 0.5) * intensity * 2.2,
      });

      if (progress >= 1) {
        clearInterval(shakeInterval);
      }
    }, 16);

    await new Promise((r) => setTimeout(r, chargeDuration));
    if (claimPromise) await claimPromise;

    // 4. White Fullscreen Flash (90ms)
    setFlashActive(true);
    soundController.playExplosion(currentRarity);
    setShakeOffset({ x: 0, y: 0, rotate: 0 });

    setTimeout(() => {
      setFlashActive(false);
    }, 90);

    // 5. Explosion & Detonation Phase
    setAnimStage("explosion");
    setVfxStage("explosion");

    // 6. Confetti Burst
    confetti({
      particleCount: currentRarity === "legendary" ? 240 : currentRarity === "epic" ? 160 : 90,
      spread: 90,
      origin: { y: 0.55 },
      colors: rarityConfig.particleColors,
    });

    // 7. Reveal & Shine Sweep Sequence
    await new Promise((r) => setTimeout(r, 280));
    setAnimStage("revealed");
    setVfxStage("revealed");

    // Trigger Shine Reflection Sweep
    setShineSweep(true);
    soundController.playShine();
    setTimeout(() => setShineSweep(false), 950);
  };

  const handleRewardClick = () => {
    if (!user || claiming || claimLocked || animStage !== "idle") return;
    void runSequence(true);
  };

  const handleReplayPreview = () => {
    if (animStage === "charging" || animStage === "pause") return;
    setAnimStage("idle");
    setVfxStage("idle");
    setTimeout(() => {
      void runSequence(false);
    }, 100);
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = soundController.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-[2.5rem] border border-white/15 bg-[#05060d] p-6 shadow-[0_32px_100px_rgba(0,0,0,0.95),0_0_80px_rgba(34,211,238,0.15)] backdrop-blur-3xl sm:p-8">
      {/* 1. Fullscreen / Container Blinding Flash */}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-50 bg-white"
          />
        )}
      </AnimatePresence>

      {/* 2. Procedural Canvas VFX Layer with Parallax Shift */}
      <ParticleCanvasVFX stage={vfxStage} rarity={currentRarity} mouseOffset={parallaxOffset} />

      {/* 3. Ambient Living Background & Slow Dynamic Lighting Shift */}
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]"
      />

      {/* Darkening background during charging phase */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-black transition-opacity duration-300",
          animStage === "charging" ? "opacity-70" : "opacity-0"
        )}
      />

      {/* Dynamic Animated Ambient Radial Glow (Breathing 3.7s Loop) */}
      <motion.div
        animate={{ opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 3.7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${rarityConfig.glowColor}, transparent 60%)`,
        }}
      />

      {/* Random Ambient Sparkles Layer */}
      <AnimatePresence>
        {sparkles.map((sp) => (
          <motion.div
            key={sp.id}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.3, 1.2, 0.2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
            className="pointer-events-none absolute z-30 flex items-center justify-center"
          >
            <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_12px_#ffffff] blur-[0.5px]" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Top Accent Line */}
      <div
        className="absolute inset-x-0 top-0 h-1 transition-all duration-700"
        style={{
          background: `linear-gradient(90deg, transparent, ${rarityConfig.primaryColor}, ${rarityConfig.accentColor}, transparent)`,
        }}
      />

      {/* Content Layout with Parallax Shift */}
      <div
        className="relative z-10 transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0px)`,
        }}
      >
        {/* Header Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.26em] transition-colors duration-500",
                  rarityConfig.badgeText
                )}
              >
                {animStage === "revealed" ? rarityConfig.label : "Daily Bonus Reward"}
              </p>
              {Boolean(dailyStreak) && dailyStreak > 0 ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border-2 border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-red-500/30 px-3.5 py-1 text-[9.5px] font-black uppercase tracking-wider text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.5),inset_0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-md transition-all duration-300"
                >
                  {/* Continuous Shimmer Sweep */}
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />

                  {/* Animated Fiery Flame Icon */}
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute h-4 w-4 rounded-full bg-amber-400 blur-md pointer-events-none"
                    />
                    <motion.div
                      animate={{ rotate: [-6, 6, -6], y: [0, -1.5, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Flame size={14} className="relative z-10 fill-amber-400 text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                    </motion.div>
                  </div>

                  <span className="font-black tracking-widest text-amber-100 drop-shadow-[0_1px_8px_rgba(245,158,11,0.9)]">
                    {dailyStreak} Day Streak
                  </span>

                  {/* Luck Boost Tag */}
                  <span className="inline-flex items-center rounded-md bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 px-2 py-0.5 text-[8.5px] font-black tracking-tight text-black shadow-[0_0_12px_rgba(251,191,36,0.7)]">
                    +{Math.min(dailyStreak - 1, 7) * 5}% LUCK
                  </span>
                </motion.div>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-400 backdrop-blur-md">
                  <Flame size={13} className="text-zinc-500" />
                  <span>0 Day Streak</span>
                </div>
              )}
            </div>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              {animStage === "revealed" ? "Reward Unlocked!" : "Open Daily Reward"}
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-md">
            {/* Audio Mute/Unmute Toggle */}
            <button
              onClick={toggleSound}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            <div className="h-4 w-px bg-white/10" />

            {/* Replay Animation Preview Button */}
            <button
              onClick={handleReplayPreview}
              disabled={animStage === "charging" || animStage === "pause"}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/10 hover:text-cyan-300 active:scale-95 disabled:opacity-40"
              title="Replay opening animation"
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </div>

        {/* Hero Card Container */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => {
            setIsHovered(true);
            soundController.playHover();
          }}
          onMouseLeave={() => setIsHovered(false)}
          animate={
            animStage === "charging"
              ? { scale: 1.03 }
              : animStage === "revealed"
              ? { scale: 1.0 }
              : { scale: [1, 1.012, 1] }
          }
          transition={
            animStage === "charging"
              ? { duration: 0.8, ease: "easeOut" }
              : animStage === "revealed"
              ? { duration: 0.5, ease: "easeOut" }
              : { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }
          style={{
            transform: `translate3d(${shakeOffset.x}px, ${shakeOffset.y}px, 0px) rotate(${shakeOffset.rotate}deg)`,
          }}
          className="relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-[#030408]/95 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-shadow duration-300 sm:p-8"
        >
          {/* Specular Interactive Lighting Gradient */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.08), transparent 40%)`,
            }}
          />

          {/* Periodic Diagonal Soft Shine Sweep Overlay (900ms duration, 8.4s interval) */}
          {shineSweep && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "220%" }}
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 blur-[1.5px]"
            />
          )}

          <div className="relative grid gap-6 md:grid-cols-[200px_1fr] md:items-center">
            {/* Loot Box Hero Visual Center: Sci-Fi Hexagonal Quantum Energy Vault */}
            <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
              <QuantumEnergyVault
                rarity={currentRarity}
                stage={animStage}
                displayCount={displayCount}
                mousePos={mousePos}
                isHovered={isHovered}
              />
            </div>

            {/* Description & Action Details */}
            <div className="text-center md:text-left">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[9.5px] font-black uppercase tracking-[0.22em] transition-colors duration-500",
                  rarityConfig.badgeBorder,
                  rarityConfig.badgeBg,
                  rarityConfig.badgeText
                )}
              >
                <span>
                  {animStage === "charging"
                    ? "Charging Energy..."
                    : animStage === "revealed"
                    ? `${rarityConfig.name.toUpperCase()} REWARD UNLOCKED`
                    : "Free Daily Loot Drop"}
                </span>
              </div>

              <h3
                className={cn(
                  "mt-3 text-2xl font-black uppercase tracking-tight sm:text-3xl transition-all duration-500",
                  currentRarity === "legendary"
                    ? "bg-[linear-gradient(110deg,#fff,#fcd34d,#f43f5e,#fff)] bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                    : currentRarity === "epic"
                    ? "bg-[linear-gradient(110deg,#fff,#c084fc,#ec4899,#fff)] bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(192,132,252,0.4)]"
                    : animStage === "revealed"
                    ? "bg-[linear-gradient(110deg,#fff,#a5f3fc,#38bdf8,#fff)] bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                    : "text-white"
                )}
              >
                {animStage === "charging"
                  ? "Unlocking Daily Reward..."
                  : animStage === "revealed"
                  ? `+${displayCount} Credits`.trim()
                  : "Tap to Open Daily Reward"}
              </h3>

              <p className="mt-3 text-xs font-medium leading-relaxed text-zinc-400">
                {animStage === "revealed"
                  ? "Claimed and added to your balance. Come back tomorrow for another daily reward drop!"
                  : "Daily rewards drop bonus credits every 24 hours. Higher streaks increase your chance for Epic & Legendary permanent credit rewards."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Claim Daily Reward Action Button */}
        <motion.button
          onClick={handleRewardClick}
          disabled={claiming || claimLocked || animStage === "charging" || animStage === "pause"}
          animate={
            claimLocked
              ? { scale: 1 }
              : { scale: [1, 1.01, 1] }
          }
          transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "group relative mt-6 flex min-h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl text-xs font-black uppercase tracking-[0.24em] transition-all duration-300",
            claimLocked
              ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.15)] cursor-not-allowed"
              : "border border-white/90 bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-[1.015] hover:bg-white hover:shadow-[0_0_60px_rgba(255,255,255,0.65)] active:scale-[0.97]"
          )}
        >
          {/* Faint Shimmer Sweep across button every 8.4s */}
          {shineSweep && !claimLocked && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent skew-x-12"
            />
          )}

          {/* Animated Button Spotlight Sweep */}
          {!claimLocked && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 transition-transform duration-700 group-hover:translate-x-full" />
          )}

          {claiming || animStage === "charging" ? (
            <Loader2 size={20} className="animate-spin" />
          ) : claimLocked ? (
            <CheckCircle2 size={20} className="text-emerald-400" />
          ) : (
            <Gift size={20} className="transition-transform duration-300 group-hover:scale-110" />
          )}

          <span>
            {animStage === "charging" || claiming
              ? "Opening Daily Reward..."
              : claimLocked
              ? `Next Reward Drop in ${countdown || "..."}`
              : "Claim Daily Reward"}
          </span>
        </motion.button>
      </div>
    </div>
  );
};
