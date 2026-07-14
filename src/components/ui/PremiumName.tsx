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
