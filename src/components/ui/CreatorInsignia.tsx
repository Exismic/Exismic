"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface InsigniaDefinition {
  id: string;
  name: string;
  tier: "rare" | "epic" | "legendary";
  description: string;
  costSparks: number;
  badgeGlow: string;
  borderColor: string;
  iconSvg: React.ReactNode;
}

export const CREATOR_INSIGNIAS: InsigniaDefinition[] = [
  // Rare Tier (250 ⚡)
  {
    id: "bolt-spark",
    name: "Overcharged Spark",
    tier: "rare",
    description: "High-voltage kinetic spark with electric lightning pulse.",
    costSparks: 250,
    badgeGlow: "shadow-[0_0_12px_rgba(6,182,212,0.6)]",
    borderColor: "border-cyan-400/50 bg-cyan-950/40 text-cyan-300",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_6px_#06b6d4]">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#bolt-grad)" stroke="#22d3ee" strokeWidth="1.2" strokeLinejoin="round" />
        <defs>
          <linearGradient id="bolt-grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67e8f9" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: "matrix-cube",
    name: "Matrix Core",
    tier: "rare",
    description: "Cybernetic data cube pulsing with encrypted sub-nodes.",
    costSparks: 250,
    badgeGlow: "shadow-[0_0_12px_rgba(16,185,129,0.6)]",
    borderColor: "border-emerald-400/50 bg-emerald-950/40 text-emerald-300",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_6px_#10b981]">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#10b981" fillOpacity="0.4" stroke="#34d399" strokeWidth="1.2" />
        <path d="M2 17L12 22L22 17" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2" fill="#6ee7b7" />
      </svg>
    ),
  },
  {
    id: "emerald-prism",
    name: "Emerald Prism",
    tier: "rare",
    description: "Bio-synthetic prism radiating pure photosynthetic light.",
    costSparks: 250,
    badgeGlow: "shadow-[0_0_12px_rgba(52,211,153,0.6)]",
    borderColor: "border-teal-400/50 bg-teal-950/40 text-teal-300",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_6px_#2dd4bf]">
        <polygon points="12,2 21,9 17,21 7,21 3,9" fill="url(#prism-grad)" stroke="#2dd4bf" strokeWidth="1.2" />
        <line x1="12" y1="2" x2="12" y2="21" stroke="#99f6e4" strokeWidth="0.8" strokeDasharray="1 1" />
        <defs>
          <linearGradient id="prism-grad" x1="3" y1="2" x2="21" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2dd4bf" stopOpacity="0.7" />
            <stop offset="1" stopColor="#0f766e" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: "ice-shard",
    name: "Glacier Shard",
    tier: "rare",
    description: "Cold-forged crystalline diamond shard with sub-zero refraction.",
    costSparks: 250,
    badgeGlow: "shadow-[0_0_12px_rgba(56,189,248,0.6)]",
    borderColor: "border-sky-400/50 bg-sky-950/40 text-sky-300",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_6px_#38bdf8]">
        <path d="M12 2L16 9L12 22L8 9L12 2Z" fill="url(#ice-grad)" stroke="#7dd3fc" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M12 2L19 12L12 16L5 12L12 2Z" stroke="#bae6fd" strokeWidth="0.7" opacity="0.6" />
        <defs>
          <linearGradient id="ice-grad" x1="8" y1="2" x2="16" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#bae6fd" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },

  // Epic Tier (450 ⚡)
  {
    id: "void-singularity",
    name: "Void Singularity",
    tier: "epic",
    description: "Gravitational event horizon with a swirling cosmic accretion disk.",
    costSparks: 450,
    badgeGlow: "shadow-[0_0_14px_rgba(168,85,247,0.7)]",
    borderColor: "border-purple-400/60 bg-purple-950/40 text-purple-300",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_8px_#a855f7]">
        <circle cx="12" cy="12" r="5" fill="#1e1035" stroke="#c084fc" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#e879f9" strokeWidth="1.2" transform="rotate(-25 12 12)" />
        <circle cx="12" cy="12" r="2" fill="#f0abfc" />
      </svg>
    ),
  },
  {
    id: "synth-prime",
    name: "Synthesizer Prime",
    tier: "epic",
    description: "Triple-ringed gyroscopic holographic orb of synthetic intelligence.",
    costSparks: 450,
    badgeGlow: "shadow-[0_0_14px_rgba(236,72,153,0.7)]",
    borderColor: "border-pink-400/60 bg-pink-950/40 text-pink-300",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_8px_#ec4899]">
        <circle cx="12" cy="12" r="9" stroke="#f472b6" strokeWidth="1" strokeDasharray="3 2" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#ec4899" strokeWidth="1.2" transform="rotate(45 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#a855f7" strokeWidth="1.2" transform="rotate(-45 12 12)" />
        <circle cx="12" cy="12" r="3" fill="#fdf2f8" stroke="#f43f5e" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    tier: "epic",
    description: "Coronal mass eruption radiating burning thermonuclear energy.",
    costSparks: 450,
    badgeGlow: "shadow-[0_0_14px_rgba(249,115,22,0.7)]",
    borderColor: "border-orange-400/60 bg-orange-950/40 text-orange-300",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_8px_#f97316]">
        <circle cx="12" cy="12" r="5" fill="url(#sun-grad)" stroke="#fbbf24" strokeWidth="1.2" />
        <path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.9 4.9L7.1 7.1M16.9 16.9L19.1 19.1M4.9 19.1L7.1 16.9M16.9 7.1L19.1 4.9" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" />
        <defs>
          <linearGradient id="sun-grad" x1="7" y1="7" x2="17" y2="17" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde047" />
            <stop offset="1" stopColor="#ea580c" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: "master-architect",
    name: "Master Architect",
    tier: "epic",
    description: "Golden ratio precision compass drawing hyper-dimensional blueprints.",
    costSparks: 450,
    badgeGlow: "shadow-[0_0_14px_rgba(234,179,8,0.7)]",
    borderColor: "border-yellow-400/60 bg-yellow-950/40 text-yellow-300",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_8px_#eab308]">
        <circle cx="12" cy="6" r="2.5" stroke="#fde047" strokeWidth="1.5" fill="#713f12" />
        <line x1="10" y1="8" x2="4" y2="21" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="8" x2="20" y2="21" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6.5 15.5H17.5" stroke="#ca8a04" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },

  // Legendary Tier (750 ⚡)
  {
    id: "sovereign-crown",
    name: "Sovereign Crown",
    tier: "legendary",
    description: "Imperial obsidian-gold crown infused with apex creator sovereignty.",
    costSparks: 750,
    badgeGlow: "shadow-[0_0_18px_rgba(234,179,8,0.85)]",
    borderColor: "border-amber-400/80 bg-amber-950/50 text-amber-200",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_10px_#f59e0b]">
        <path d="M3 18L5 7L9.5 12L12 4L14.5 12L19 7L21 18H3Z" fill="url(#crown-grad)" stroke="#fde047" strokeWidth="1.2" strokeLinejoin="round" />
        <rect x="3" y="18" width="18" height="3" rx="1" fill="#78350f" stroke="#fde047" strokeWidth="1" />
        <circle cx="12" cy="4" r="1.2" fill="#fffbeb" />
        <circle cx="5" cy="7" r="1" fill="#fde047" />
        <circle cx="19" cy="7" r="1" fill="#fde047" />
        <defs>
          <linearGradient id="crown-grad" x1="3" y1="4" x2="21" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbbf24" />
            <stop offset="0.5" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: "paragon-hypercube",
    name: "Paragon Singularity",
    tier: "legendary",
    description: "4-dimensional hyper-tesseract bending space, light, and geometry.",
    costSparks: 750,
    badgeGlow: "shadow-[0_0_18px_rgba(139,92,246,0.85)]",
    borderColor: "border-violet-400/80 bg-violet-950/50 text-violet-200",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_10px_#a855f7]">
        <rect x="3" y="3" width="12" height="12" stroke="#c084fc" strokeWidth="1.2" rx="1.5" />
        <rect x="9" y="9" width="12" height="12" stroke="#38bdf8" strokeWidth="1.2" rx="1.5" />
        <line x1="3" y1="3" x2="9" y2="9" stroke="#e879f9" strokeWidth="1" />
        <line x1="15" y1="3" x2="21" y2="9" stroke="#e879f9" strokeWidth="1" />
        <line x1="3" y1="15" x2="9" y2="21" stroke="#e879f9" strokeWidth="1" />
        <line x1="15" y1="15" x2="21" y2="21" stroke="#e879f9" strokeWidth="1" />
        <circle cx="12" cy="12" r="1.5" fill="#fbcfe8" />
      </svg>
    ),
  },
  {
    id: "cyber-dragon",
    name: "Cyber Leviathan",
    tier: "legendary",
    description: "Biomechanical dragon crest harboring ancient primordial reactor energy.",
    costSparks: 750,
    badgeGlow: "shadow-[0_0_18px_rgba(16,185,129,0.85)]",
    borderColor: "border-emerald-400/80 bg-emerald-950/50 text-emerald-200",
    iconSvg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-[0_0_10px_#10b981]">
        <path d="M4 18C6 14 8 11 11 10C10 7 12 3 15 3C16.5 4.5 17 6.5 16 8.5C18.5 7.5 21 8 22 10.5C21 12 19 13.5 17 13.5C18 16 16.5 18.5 14 19.5C11 18 8 19 4 18Z" fill="url(#dragon-grad)" stroke="#34d399" strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="15.5" cy="7.5" r="1" fill="#6ee7b7" />
        <defs>
          <linearGradient id="dragon-grad" x1="4" y1="3" x2="22" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="0.6" stopColor="#059669" />
            <stop offset="1" stopColor="#064e3b" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

interface CreatorInsigniaProps {
  insigniaId?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTooltip?: boolean;
  tooltipPlacement?: "top" | "bottom";
  tooltipAlign?: "center" | "right" | "left";
}

export function CreatorInsignia({
  insigniaId,
  size = "md",
  className,
  showTooltip = true,
  tooltipPlacement = "bottom",
  tooltipAlign = "right",
}: CreatorInsigniaProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!insigniaId) return null;
  const insignia = CREATOR_INSIGNIAS.find((i) => i.id === insigniaId);
  if (!insignia) return null;

  const sizeStyles = {
    sm: "w-4 h-4 p-0.5",
    md: "w-5 h-5 p-0.5",
    lg: "w-7 h-7 p-1",
    xl: "w-10 h-10 p-1.5",
  }[size];

  const tierColors = {
    rare: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    epic: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    legendary: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  }[insignia.tier];

  const alignStyles = {
    center: "left-1/2 -translate-x-1/2",
    right: "right-0",
    left: "left-0",
  }[tooltipAlign];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center select-none not-italic normal-case tracking-normal group/insignia", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer cyber jewel bezel */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-300 group-hover/insignia:scale-110",
          sizeStyles,
          insignia.borderColor,
          insignia.badgeGlow
        )}
      >
        {insignia.iconSvg}
      </div>

      {/* Luxury Glass Hover Tooltip */}
      {showTooltip && isHovered && (
        <div
          className={cn(
            "absolute z-50 pointer-events-none w-56 p-3 rounded-2xl bg-[#090912]/95 border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 not-italic font-normal normal-case tracking-normal text-left font-sans",
            tooltipPlacement === "top" ? "bottom-full mb-2.5" : "top-full mt-2.5",
            alignStyles
          )}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-bold text-xs text-white tracking-normal truncate">{insignia.name}</span>
            <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wide shrink-0", tierColors)}>
              {insignia.tier}
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 font-normal leading-relaxed tracking-normal">{insignia.description}</p>
        </div>
      )}
    </div>
  );
}
