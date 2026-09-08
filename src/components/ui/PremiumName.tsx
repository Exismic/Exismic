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
    class: "bg-gradient-to-r from-sky-300 via-cyan-200 via-blue-400 to-sky-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(56,189,248,0.7)]",
    previewGlow: "from-sky-300/40 to-cyan-300/40",
    glowStyles: "rgba(56, 189, 248, 0.7)"
  },
  {
    id: "emerald-matrix",
    name: "Emerald Matrix",
    class: "bg-gradient-to-r from-emerald-400 via-lime-300 via-teal-400 to-emerald-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(16,185,129,0.7)]",
    previewGlow: "from-emerald-400/40 to-lime-300/40",
    glowStyles: "rgba(16, 185, 129, 0.7)"
  },
  {
    id: "solar-supernova",
    name: "Solar Supernova",
    class: "bg-gradient-to-r from-amber-400 via-orange-500 via-red-500 to-amber-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(245,158,11,0.75)]",
    previewGlow: "from-amber-400/40 to-orange-500/40",
    glowStyles: "rgba(245, 158, 11, 0.75)"
  },
  {
    id: "hyper-fuchsia",
    name: "Hyper Fuchsia",
    class: "bg-gradient-to-r from-fuchsia-500 via-pink-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(232,121,249,0.75)]",
    previewGlow: "from-fuchsia-500/40 to-pink-400/40",
    glowStyles: "rgba(232, 121, 249, 0.75)"
  },
  {
    id: "electric-amber",
    name: "Electric Amber",
    class: "bg-gradient-to-r from-yellow-400 via-amber-500 via-yellow-300 to-yellow-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(250,204,21,0.75)]",
    previewGlow: "from-yellow-400/40 to-amber-500/40",
    glowStyles: "rgba(250, 204, 21, 0.75)"
  },
  {
    id: "stealth-silver",
    name: "Stealth Silver Platinum",
    class: "bg-gradient-to-r from-zinc-200 via-white via-zinc-400 to-zinc-200 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_18px_rgba(255,255,255,0.6)]",
    previewGlow: "from-zinc-200/40 to-white/40",
    glowStyles: "rgba(255, 255, 255, 0.6)"
  },
  {
    id: "hologram-prism",
    name: "Holographic Prism",
    isNew: true,
    class: "bg-gradient-to-r from-sky-400 via-pink-400 via-purple-400 via-teal-300 to-sky-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3.5s_linear_infinite] drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]",
    previewGlow: "from-sky-400/40 via-pink-400/30 to-teal-400/40",
    glowStyles: "rgba(56, 189, 248, 0.8)"
  },
  {
    id: "crimson-inferno",
    name: "Crimson Inferno",
    isNew: true,
    class: "bg-gradient-to-r from-red-600 via-rose-500 via-orange-600 to-red-600 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3s_linear_infinite] drop-shadow-[0_0_20px_rgba(220,38,38,0.85)]",
    previewGlow: "from-red-600/40 to-rose-600/40",
    glowStyles: "rgba(220, 38, 38, 0.85)"
  },
  {
    id: "quantum-mint",
    name: "Quantum Mint Flux",
    isNew: true,
    class: "bg-gradient-to-r from-teal-300 via-cyan-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3.5s_linear_infinite] drop-shadow-[0_0_20px_rgba(45,212,191,0.8)]",
    previewGlow: "from-teal-300/40 to-cyan-400/40",
    glowStyles: "rgba(45, 212, 191, 0.8)"
  },
  {
    id: "aurora-borealis",
    name: "Northern Aurora",
    isNew: true,
    class: "bg-gradient-to-r from-emerald-400 via-teal-300 via-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]",
    previewGlow: "from-emerald-400/40 to-purple-500/40",
    glowStyles: "rgba(52, 211, 153, 0.8)"
  },
  {
    id: "plasma-neon",
    name: "Electric Plasma",
    isNew: true,
    class: "bg-gradient-to-r from-yellow-300 via-cyan-400 via-indigo-400 to-yellow-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3s_linear_infinite] drop-shadow-[0_0_20px_rgba(250,204,21,0.85)]",
    previewGlow: "from-yellow-300/40 to-cyan-400/40",
    glowStyles: "rgba(250, 204, 21, 0.85)"
  },
  {
    id: "sakura-bloom",
    name: "Sakura Cyber Blossom",
    isNew: true,
    class: "bg-gradient-to-r from-pink-400 via-rose-300 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3.5s_linear_infinite] drop-shadow-[0_0_20px_rgba(244,114,182,0.8)]",
    previewGlow: "from-pink-400/40 to-rose-300/40",
    glowStyles: "rgba(244, 114, 182, 0.8)"
  },
  {
    id: "mythic-pharaoh",
    name: "Mythic Pharaoh Gold",
    isNew: true,
    class: "bg-gradient-to-r from-yellow-500 via-amber-300 via-yellow-100 via-amber-500 to-yellow-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3s_linear_infinite] drop-shadow-[0_0_22px_rgba(234,179,8,0.9)]",
    previewGlow: "from-yellow-400/45 to-amber-500/45",
    glowStyles: "rgba(234, 179, 8, 0.9)"
  },
  {
    id: "abyssal-violet",
    name: "Abyssal Ultra Violet",
    isNew: true,
    class: "bg-gradient-to-r from-purple-400 via-violet-300 via-indigo-500 to-purple-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3.5s_linear_infinite] drop-shadow-[0_0_20px_rgba(167,139,250,0.85)]",
    previewGlow: "from-purple-400/40 to-indigo-500/40",
    glowStyles: "rgba(167, 139, 250, 0.85)"
  },
  {
    id: "astral-void",
    name: "Astral Void Singularity",
    isNew: true,
    class: "bg-gradient-to-r from-violet-400 via-cyan-300 via-indigo-300 to-violet-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3.5s_linear_infinite] drop-shadow-[0_0_20px_rgba(6,182,212,0.85)]",
    previewGlow: "from-violet-500/40 to-cyan-400/40",
    glowStyles: "rgba(6, 182, 212, 0.85)"
  },
  {
    id: "molten-dragon",
    name: "Molten Dragon Flame",
    isNew: true,
    class: "bg-gradient-to-r from-red-500 via-amber-300 via-yellow-300 to-red-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3s_linear_infinite] drop-shadow-[0_0_20px_rgba(239,68,68,0.85)]",
    previewGlow: "from-red-500/40 to-amber-400/40",
    glowStyles: "rgba(239, 68, 68, 0.85)"
  },
  {
    id: "cyber-glitch",
    name: "Cyber Matrix Glitch",
    isNew: true,
    class: "bg-gradient-to-r from-emerald-400 via-pink-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3s_linear_infinite] drop-shadow-[0_0_20px_rgba(16,185,129,0.85)]",
    previewGlow: "from-emerald-400/40 to-pink-400/40",
    glowStyles: "rgba(16, 185, 129, 0.85)"
  },
  {
    id: "frostfire-eclipse",
    name: "Frostfire Celestial",
    isNew: true,
    class: "bg-gradient-to-r from-sky-300 via-indigo-300 via-orange-400 to-sky-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3.5s_linear_infinite] drop-shadow-[0_0_20px_rgba(56,189,248,0.85)]",
    previewGlow: "from-sky-300/40 to-orange-400/40",
    glowStyles: "rgba(56, 189, 248, 0.85)"
  },
  {
    id: "chrono-warp",
    name: "Chrono Temporal Flux",
    isNew: true,
    class: "bg-gradient-to-r from-amber-400 via-sky-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3.5s_linear_infinite] drop-shadow-[0_0_20px_rgba(217,119,6,0.85)]",
    previewGlow: "from-amber-400/40 to-sky-300/40",
    glowStyles: "rgba(217, 119, 6, 0.85)"
  },
  {
    id: "void-walker",
    name: "Voidwalker Eclipse",
    isNew: true,
    class: "bg-gradient-to-r from-purple-500 via-fuchsia-300 via-violet-400 to-purple-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3.5s_linear_infinite] drop-shadow-[0_0_22px_rgba(147,51,234,0.9)]",
    previewGlow: "from-purple-500/40 to-violet-400/40",
    glowStyles: "rgba(147, 51, 234, 0.9)"
  },
  {
    id: "synthwave-80s",
    name: "Retro Synthwave Sunset",
    isNew: true,
    class: "bg-gradient-to-r from-pink-500 via-rose-300 via-amber-400 to-pink-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3s_linear_infinite] drop-shadow-[0_0_20px_rgba(244,63,94,0.85)]",
    previewGlow: "from-pink-500/40 to-amber-400/40",
    glowStyles: "rgba(244, 63, 94, 0.85)"
  },
  {
    id: "jade-dynasty",
    name: "Imperial Jade Sovereign",
    isNew: true,
    class: "bg-gradient-to-r from-emerald-400 via-yellow-200 via-teal-300 to-emerald-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3.5s_linear_infinite] drop-shadow-[0_0_20px_rgba(16,185,129,0.85)]",
    previewGlow: "from-emerald-400/40 to-yellow-300/40",
    glowStyles: "rgba(16, 185, 129, 0.85)"
  },
  {
    id: "blood-moon",
    name: "Blood Moon Eclipse",
    isNew: true,
    class: "bg-gradient-to-r from-red-600 via-rose-400 via-red-700 to-red-600 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3s_linear_infinite] drop-shadow-[0_0_22px_rgba(220,38,38,0.9)]",
    previewGlow: "from-red-600/40 to-rose-400/40",
    glowStyles: "rgba(220, 38, 38, 0.9)"
  },
  {
    id: "quantum-maglev",
    name: "Quantum Superconductor",
    isNew: true,
    class: "bg-gradient-to-r from-blue-400 via-cyan-200 via-indigo-300 to-blue-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3s_linear_infinite] drop-shadow-[0_0_22px_rgba(37,99,235,0.85)]",
    previewGlow: "from-blue-400/40 to-cyan-300/40",
    glowStyles: "rgba(37, 99, 235, 0.85)"
  },
  {
    id: "starlight-valkyrie",
    name: "Starlight Valkyrie",
    isNew: true,
    class: "bg-gradient-to-r from-slate-100 via-pink-200 via-amber-100 to-slate-100 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3.5s_linear_infinite] drop-shadow-[0_0_20px_rgba(244,114,182,0.85)]",
    previewGlow: "from-pink-300/40 to-amber-200/40",
    glowStyles: "rgba(244, 114, 182, 0.85)"
  },
  {
    id: "toxic-biohazard",
    name: "Biohazard Radioactive",
    isNew: true,
    class: "bg-gradient-to-r from-lime-400 via-yellow-200 via-emerald-300 to-lime-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3s_linear_infinite] drop-shadow-[0_0_20px_rgba(163,230,53,0.85)]",
    previewGlow: "from-lime-400/40 to-yellow-300/40",
    glowStyles: "rgba(163, 230, 53, 0.85)"
  },
  {
    id: "phantom-wraith",
    name: "Ethereal Phantom Mist",
    isNew: true,
    class: "bg-gradient-to-r from-violet-300 via-teal-200 via-indigo-200 to-violet-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite] drop-shadow-[0_0_20px_rgba(167,139,250,0.85)]",
    previewGlow: "from-violet-400/40 to-teal-300/40",
    glowStyles: "rgba(167, 139, 250, 0.85)"
  },
  {
    id: "solaris-apex",
    name: "Solaris Apex Corona",
    isNew: true,
    class: "bg-gradient-to-r from-yellow-300 via-amber-200 via-orange-300 to-yellow-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3s_linear_infinite] drop-shadow-[0_0_25px_rgba(251,191,36,0.9)]",
    previewGlow: "from-yellow-300/45 to-orange-400/45",
    glowStyles: "rgba(251, 191, 36, 0.9)"
  },
  {
    id: "abyssal-kraken",
    name: "Abyssal Trench Biolume",
    isNew: true,
    class: "bg-gradient-to-r from-cyan-300 via-teal-200 via-blue-400 to-cyan-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_3.5s_linear_infinite] drop-shadow-[0_0_22px_rgba(6,182,212,0.85)]",
    previewGlow: "from-cyan-400/40 to-teal-300/40",
    glowStyles: "rgba(6, 182, 212, 0.85)"
  }
];

import { CreatorInsignia } from "@/components/ui/CreatorInsignia";

interface PremiumNameProps {
  name: string;
  isPro: boolean;
  gradientId?: string | null;
  insigniaId?: string | null;
  className?: string;
}

export function PremiumName({ name, isPro, gradientId, insigniaId, className }: PremiumNameProps) {
  const renderText = () => {
    if (!isPro && !gradientId) {
      return (
        <span
          className={cn("inline-block", className)}
          style={{
            WebkitBoxDecorationBreak: "clone",
            boxDecorationBreak: "clone",
            paddingBottom: "0.25em",
            marginBottom: "-0.25em",
          }}
        >
          {name}
        </span>
      );
    }

    const activeGradient = NAME_GRADIENTS.find(g => g.id === gradientId) || NAME_GRADIENTS[0];

    const cleanedClassName = className
      ? className
          .replace(/\btext-(white|zinc-\d+|zinc-\w+|white\/\d+|neutral-\d+|gray-\d+|slate-\d+|purple-\d+|cyan-\d+)\b/g, '')
          .replace(/\bleading-(none|tight|3|4|5)\b/g, '')
      : '';

    return (
      <span 
        className={cn(
          "inline-block font-black tracking-tight leading-[1.25] overflow-visible",
          activeGradient.class,
          cleanedClassName
        )}
        style={{
          WebkitBoxDecorationBreak: "clone",
          boxDecorationBreak: "clone",
          paddingBottom: "0.25em",
          marginBottom: "-0.25em",
          paddingTop: "0.08em",
          paddingRight: "0.1em",
          display: "inline-block",
        }}
      >
        {name}
      </span>
    );
  };

  if (!insigniaId) {
    return renderText();
  }

  return (
    <span className="inline-flex items-center gap-2 align-middle">
      {renderText()}
      <CreatorInsignia insigniaId={insigniaId} size="md" />
    </span>
  );
}
