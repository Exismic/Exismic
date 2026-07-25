"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const NAME_GRADIENTS = [
  {
    id: "cyber-purple",
    name: "Cyber Purple",
    class: "bg-gradient-to-r from-purple-500 via-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(168,85,247,0.65)]",
    previewGlow: "from-purple-500/35 to-cyan-500/35",
    glowStyles: "rgba(168, 85, 247, 0.65)"
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    class: "bg-gradient-to-r from-amber-600 via-yellow-400 via-orange-500 to-amber-600 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(245,158,11,0.65)]",
    previewGlow: "from-amber-500/35 to-yellow-500/35",
    glowStyles: "rgba(245, 158, 11, 0.65)"
  },
  {
    id: "cosmic-rainbow",
    name: "Cosmic Rainbow",
    class: "bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-400 via-pink-500 to-pink-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(236,72,153,0.65)]",
    previewGlow: "from-pink-500/35 to-purple-500/35",
    glowStyles: "rgba(236, 72, 153, 0.65)"
  },
  {
    id: "neon-emerald",
    name: "Neon Emerald",
    class: "bg-gradient-to-r from-emerald-500 via-cyan-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(52,211,153,0.65)]",
    previewGlow: "from-emerald-400/35 to-cyan-400/35",
    glowStyles: "rgba(52, 211, 153, 0.65)"
  },
  {
    id: "royal-crimson",
    name: "Royal Crimson",
    class: "bg-gradient-to-r from-red-600 via-purple-600 via-pink-500 to-red-600 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(239,68,68,0.65)]",
    previewGlow: "from-red-500/35 to-purple-500/35",
    glowStyles: "rgba(239, 68, 68, 0.65)"
  },
  {
    id: "void-blue",
    name: "Void Blue",
    class: "bg-gradient-to-r from-blue-600 via-indigo-500 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(37,99,235,0.65)]",
    previewGlow: "from-blue-600/35 to-purple-500/35",
    glowStyles: "rgba(37, 99, 235, 0.65)"
  },
  {
    id: "sunset-flame",
    name: "Sunset Flame",
    class: "bg-gradient-to-r from-orange-500 via-pink-500 via-yellow-400 to-orange-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(249,115,22,0.65)]",
    previewGlow: "from-orange-500/35 to-pink-500/35",
    glowStyles: "rgba(249, 115, 22, 0.65)"
  },
  {
    id: "diamond-glacier",
    name: "Diamond Glacier",
    isNew: true,
    class: "bg-gradient-to-r from-sky-300 via-cyan-200 via-blue-400 to-sky-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(56,189,248,0.7)]",
    previewGlow: "from-sky-300/40 to-cyan-300/40",
    glowStyles: "rgba(56, 189, 248, 0.7)"
  },
  {
    id: "emerald-matrix",
    name: "Emerald Matrix",
    isNew: true,
    class: "bg-gradient-to-r from-emerald-400 via-lime-300 via-teal-400 to-emerald-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(16,185,129,0.7)]",
    previewGlow: "from-emerald-400/40 to-lime-300/40",
    glowStyles: "rgba(16, 185, 129, 0.7)"
  },
  {
    id: "solar-supernova",
    name: "Solar Supernova",
    isNew: true,
    class: "bg-gradient-to-r from-amber-400 via-orange-500 via-red-500 to-amber-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(245,158,11,0.75)]",
    previewGlow: "from-amber-400/40 to-orange-500/40",
    glowStyles: "rgba(245, 158, 11, 0.75)"
  },
  {
    id: "hyper-fuchsia",
    name: "Hyper Fuchsia",
    isNew: true,
    class: "bg-gradient-to-r from-fuchsia-500 via-pink-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(232,121,249,0.75)]",
    previewGlow: "from-fuchsia-500/40 to-pink-400/40",
    glowStyles: "rgba(232, 121, 249, 0.75)"
  },
  {
    id: "electric-amber",
    name: "Electric Amber",
    isNew: true,
    class: "bg-gradient-to-r from-yellow-400 via-amber-500 via-yellow-300 to-yellow-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(250,204,21,0.75)]",
    previewGlow: "from-yellow-400/40 to-amber-500/40",
    glowStyles: "rgba(250, 204, 21, 0.75)"
  },
  {
    id: "stealth-silver",
    name: "Stealth Silver Platinum",
    isNew: true,
    class: "bg-gradient-to-r from-zinc-200 via-white via-zinc-400 to-zinc-200 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(255,255,255,0.6)]",
    previewGlow: "from-zinc-200/40 to-white/40",
    glowStyles: "rgba(255, 255, 255, 0.6)"
  }
];

interface PremiumNameProps {
  name: string;
  isPro: boolean;
  gradientId?: string | null;
  className?: string;
}

export function PremiumName({ name, isPro, gradientId, className }: PremiumNameProps) {
  if (!isPro) {
    return <span className={className}>{name}</span>;
  }

  const activeGradient = NAME_GRADIENTS.find(g => g.id === gradientId) || NAME_GRADIENTS[0];

  // Strip conflicting color utility classes (e.g., text-white, text-zinc-100) when rendering transparent gradient text
  const cleanedClassName = className
    ? className.replace(/\btext-(white|zinc-\d+|zinc-\w+|white\/\d+|neutral-\d+|gray-\d+|slate-\d+|purple-\d+|cyan-\d+)\b/g, '')
    : '';

  return (
    <span 
      className={cn(
        "inline-block font-black tracking-tight pb-1 pr-1",
        activeGradient.class,
        cleanedClassName
      )}
    >
      {name}
    </span>
  );
}
