"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getRarityConfig, RewardRarity } from "./rarityConfig";

interface QuantumEnergyVaultProps {
  rarity: RewardRarity;
  stage: "idle" | "pause" | "charging" | "explosion" | "revealed";
  displayCount: number;
  mousePos: { x: number; y: number };
  isHovered: boolean;
}

interface ElectricalArc {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const QuantumEnergyVault: React.FC<QuantumEnergyVaultProps> = ({
  rarity,
  stage,
  displayCount,
  mousePos,
  isHovered,
}) => {
  const rarityConfig = useMemo(() => getRarityConfig(rarity), [rarity]);
  const [electricArc, setElectricArc] = useState<ElectricalArc | null>(null);
  const [ambientEvent, setAmbientEvent] = useState<"flare" | "pulse" | "spark" | null>(null);

  // Hexagonal vertices calculation for SVG (center 100,100, radius 82)
  const hexPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = 100 + 82 * Math.cos(angle);
      const y = 100 + 82 * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  }, []);

  const pointsString = hexPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Random Electrical Micro-Arcs (triggers every 5-9 seconds for 60ms)
  useEffect(() => {
    const arcInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        const idx = Math.floor(Math.random() * 6);
        const p1 = hexPoints[idx];
        const p2 = hexPoints[(idx + 1) % 6];
        setElectricArc({
          id: Date.now(),
          x1: p1.x,
          y1: p1.y,
          x2: p1.x + (p2.x - p1.x) * (0.3 + Math.random() * 0.4),
          y2: p1.y + (p2.y - p1.y) * (0.3 + Math.random() * 0.4),
        });

        setTimeout(() => setElectricArc(null), 65);
      }
    }, 6200);

    return () => clearInterval(arcInterval);
  }, [hexPoints]);

  // Random Ambient Micro-Events (triggers every 7-11 seconds)
  useEffect(() => {
    const eventInterval = setInterval(() => {
      const events: Array<"flare" | "pulse" | "spark"> = ["flare", "pulse", "spark"];
      const chosen = events[Math.floor(Math.random() * events.length)];
      setAmbientEvent(chosen);
      setTimeout(() => setAmbientEvent(null), 1200);
    }, 8500);

    return () => clearInterval(eventInterval);
  }, []);

  // Smooth 3D tilt calculation (max 5 degrees as specified)
  const tiltX = (mousePos.y - 0.5) * -5;
  const tiltY = (mousePos.x - 0.5) * 5;

  return (
    <motion.div
      animate={
        stage === "pause"
          ? { scale: 0.88, rotateX: tiltX, rotateY: tiltY }
          : stage === "charging"
          ? { scale: [1, 1.08, 0.96, 1.08], rotateX: tiltX * 1.5, rotateY: tiltY * 1.5 }
          : stage === "revealed"
          ? { scale: [0, 1.35, 0.95, 1.05, 1], rotateX: 0, rotateY: 0 }
          : {
              scale: rarity === "legendary" ? [1, 1.035, 1] : [1, 1.025, 1],
              rotateX: tiltX,
              rotateY: tiltY,
            }
      }
      transition={
        stage === "pause"
          ? { duration: 0.18 }
          : stage === "charging"
          ? { duration: 0.25, repeat: Infinity, ease: "easeInOut" }
          : stage === "revealed"
          ? { duration: 0.9, times: [0, 0.45, 0.7, 0.85, 1], ease: [0.34, 1.56, 0.64, 1] }
          : { duration: 5.4, repeat: Infinity, ease: "easeInOut" }
      }
      style={{ perspective: 1000 }}
      className="relative flex h-56 w-56 items-center justify-center"
    >
      {/* 1. Subsurface Radial Bloom (Rarity Glow - 3.7s Breathing Loop) */}
      <motion.div
        animate={{
          scale: stage === "charging" ? [1, 1.35, 1] : ambientEvent === "pulse" ? [1, 1.25, 1] : [1, 1.12, 1],
          opacity: stage === "charging" ? [0.8, 1, 0.8] : ambientEvent === "flare" ? 0.95 : [0.55, 0.85, 0.55],
        }}
        transition={{
          duration: stage === "charging" ? 0.3 : 3.7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "pointer-events-none absolute inset-2 rounded-full blur-3xl transition-colors duration-700",
          rarity === "legendary" && "shadow-[0_0_90px_rgba(251,191,36,0.6)]"
        )}
        style={{ backgroundColor: rarityConfig.primaryColor }}
      />

      {/* 2. Legendary Rarity Golden Rays & Halo */}
      {rarity === "legendary" && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-0 rounded-full border border-amber-400/30 opacity-70 blur-sm shadow-[0_0_40px_rgba(251,191,36,0.4)]"
        />
      )}

      {/* 3. Dual Counter-Rotating Orbital Energy Rings */}
      {/* Outer Ring: Clockwise (21.4s per revolution) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: stage === "charging" ? 1.2 : 21.4, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -inset-3 rounded-full border border-dashed border-white/20 opacity-40 blur-[0.5px]"
        style={{ borderColor: rarityConfig.primaryColor }}
      />

      {/* Inner Ring: Counter-Clockwise (17.8s per revolution) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: stage === "charging" ? 0.9 : 17.8, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -inset-1.5 rounded-full border border-dotted border-white/30 opacity-55 blur-[0.5px]"
        style={{ borderColor: rarityConfig.accentColor }}
      />

      {/* 4. Main Sci-Fi Hexagonal Energy Vault Structure */}
      <div className="relative flex h-48 w-48 items-center justify-center">
        {/* SVG Procedural Hexagonal Armor Frame */}
        <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)]">
          <defs>
            {/* Dark Titanium Outer Armor Gradient */}
            <linearGradient id="titaniumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#353a50" />
              <stop offset="35%" stopColor="#181c2b" />
              <stop offset="80%" stopColor="#0a0c14" />
              <stop offset="100%" stopColor="#040508" />
            </linearGradient>

            {/* Brushed Metal Bevel Gradient */}
            <linearGradient id="titaniumBevelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#4b526d" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
            </linearGradient>

            {/* Glass Core Radial Gradient */}
            <radialGradient id="glassCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f1326" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#050711" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#010204" stopOpacity="1" />
            </radialGradient>

            {/* Animated Seam Energy Flow Gradient */}
            <linearGradient id="energySeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={rarityConfig.accentColor} />
              <stop offset="50%" stopColor={rarityConfig.primaryColor} />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            {/* Hexagon ClipPath */}
            <clipPath id="hexClipPath">
              <polygon points={pointsString} />
            </clipPath>

            {/* Reflection Sheen Linear Gradient */}
            <linearGradient id="sheenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Vault Bloom Glow Filter */}
            <filter id="vaultGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Hexagonal Outer Dark Titanium Armor Plate */}
          <polygon
            points={pointsString}
            fill="url(#titaniumGrad)"
            stroke={rarityConfig.primaryColor}
            strokeWidth={isHovered || stage === "charging" ? "3" : "2.2"}
            className="transition-all duration-500"
            filter="url(#vaultGlow)"
          />

          {/* Brushed Metal Bevel Rim Accent */}
          <polygon
            points={pointsString}
            fill="none"
            stroke="url(#titaniumBevelGrad)"
            strokeWidth="1.5"
          />

          {/* Inner Hexagonal Glass Window Inset */}
          <polygon
            points={hexPoints.map((p) => `${100 + (p.x - 100) * 0.82},${100 + (p.y - 100) * 0.82}`).join(" ")}
            fill="url(#glassCoreGrad)"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1.5"
          />

          {/* Flowing Energy Seams (Continuous strokeDashoffset 3.4s loop) */}
          {hexPoints.map((p, idx) => {
            const nextIdx = (idx + 1) % 6;
            const p2 = hexPoints[nextIdx];

            return (
              <motion.line
                key={`flow-${idx}`}
                x1={p.x}
                y1={p.y}
                x2={p2.x}
                y2={p2.y}
                stroke="url(#energySeamGrad)"
                strokeWidth="2.5"
                strokeDasharray="10 16"
                strokeLinecap="round"
                animate={{ strokeDashoffset: [0, -52] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
                style={{
                  strokeOpacity: stage === "charging" ? 1 : 0.75,
                }}
              />
            );
          })}

          {/* Mechanical Panel Displacement Lines (Splits Open during Charging) */}
          {hexPoints.map((p, idx) => {
            const p1In = { x: 100 + (p.x - 100) * 0.82, y: 100 + (p.y - 100) * 0.82 };

            return (
              <g key={idx}>
                {/* Internal Radial Mechanical Joint Seam */}
                <line
                  x1={p1In.x}
                  y1={p1In.y}
                  x2={100}
                  y2={100}
                  stroke={rarityConfig.primaryColor}
                  strokeWidth="1"
                  strokeOpacity={stage === "charging" ? "0.95" : "0.3"}
                  strokeDasharray={stage === "charging" ? "3 2" : "none"}
                />

                {/* Engineered Corner Rivets / Bolts */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3.2"
                  fill="#181a26"
                  stroke={rarityConfig.primaryColor}
                  strokeWidth="1"
                />
                <circle cx={p.x} cy={p.y} r="1" fill="#ffffff" opacity="0.9" />
              </g>
            );
          })}

          {/* Micro Electrical Escape Arc */}
          <AnimatePresence>
            {electricArc && (
              <motion.line
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                x1={electricArc.x1}
                y1={electricArc.y1}
                x2={electricArc.x2}
                y2={electricArc.y2}
                stroke="#ffffff"
                strokeWidth="2"
                filter="url(#vaultGlow)"
              />
            )}
          </AnimatePresence>
            {/* SVG Hexagon Clipped Diagonal Reflection Sheen */}
            <g clipPath="url(#hexClipPath)" className="pointer-events-none">
              <motion.rect
                x="-100"
                y="0"
                width="70"
                height="200"
                fill="url(#sheenGradient)"
                transform="skewX(-20)"
                animate={{ x: [-100, 300] }}
                transition={{ duration: 8.1, repeat: Infinity, ease: "easeInOut" }}
              />
            </g>
          </svg>

        {/* 5. Center Living Quantum Energy Reactor Core */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Outer Glass Core Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute h-24 w-24 rounded-full border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.12)]"
          >
            {/* Inner Rotating Energy Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-dashed opacity-65"
              style={{ borderColor: rarityConfig.accentColor }}
            />
          </motion.div>

          {/* Core Content: Charging Spinner vs Revealed Credit Count vs Floating Living Core */}
          <div className="relative z-20 flex h-20 w-20 items-center justify-center">
            {stage === "charging" ? (
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.25, 1] }}
                transition={{ duration: 0.45, repeat: Infinity, ease: "linear" }}
                className="flex items-center justify-center"
              >
                <div
                  className="h-11 w-11 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: `${rarityConfig.primaryColor} transparent ${rarityConfig.accentColor} transparent` }}
                />
              </motion.div>
            ) : stage === "revealed" ? (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className={cn(
                  "pr-1 text-3.5xl font-black italic tracking-tighter bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,255,255,0.85)]",
                  rarity === "legendary"
                    ? "bg-[linear-gradient(110deg,#fff,#fcd34d,#f43f5e,#fff)]"
                    : rarity === "epic"
                    ? "bg-[linear-gradient(110deg,#fff,#c084fc,#ec4899,#fff)]"
                    : "bg-[linear-gradient(110deg,#fff,#a5f3fc,#38bdf8,#fff)]"
                )}
              >
                +{displayCount}
              </motion.span>
            ) : (
              /* Floating Quantum Energy Reactor Core (Living Core: 4.8s Breathing Loop) */
              <motion.div
                animate={{
                  rotate: [-3, 3, -3],
                  scale: [1, 1.06, 1],
                  y: [0, -3.5, 0],
                }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex items-center justify-center"
              >
                {/* Floating Octahedron Sci-Fi Diamond Crystal SVG */}
                <svg viewBox="0 0 60 60" className="h-14 w-14 drop-shadow-[0_0_22px_rgba(255,255,255,0.85)]">
                  <polygon
                    points="30,5 55,30 30,55 5,30"
                    fill={`url(#crystalGrad-${rarity})`}
                    stroke={rarityConfig.accentColor}
                    strokeWidth="1.5"
                  />
                  <polygon points="30,5 42,30 30,55 18,30" fill="rgba(255,255,255,0.3)" />
                  <line x1="5" y1="30" x2="55" y2="30" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
                  <defs>
                    <linearGradient id={`crystalGrad-${rarity}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor={rarityConfig.primaryColor} />
                      <stop offset="100%" stopColor={rarityConfig.secondaryColor} />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Subsurface Pulsating Core Plasma Light */}
                <motion.div
                  animate={{ opacity: [0.45, 0.95, 0.45], scale: [0.8, 1.25, 0.8] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute h-8 w-8 rounded-full blur-md"
                  style={{ backgroundColor: rarityConfig.primaryColor }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
