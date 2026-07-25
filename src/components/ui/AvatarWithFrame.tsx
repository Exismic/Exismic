"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Premium Pro Avatar Frames Definition (8 Elite Frames with animated unique titles)
export const PRO_FRAMES = [
  {
    id: "neon-glow",
    name: "Neon Cyber Glow",
    borderStyles: "bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 animate-[spin_6s_linear_infinite] shadow-[0_0_20px_rgba(168,85,247,0.6)]",
    glowStyles: "from-purple-600/75 via-pink-500/65 to-cyan-400/75",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    titleColor: "bg-gradient-to-r from-purple-400 via-pink-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold Status",
    borderStyles: "bg-[linear-gradient(110deg,#d97706,#fde047,#ca8a04,#fde047)] bg-[length:200%_200%] animate-[gradient-x_3s_ease_infinite] shadow-[0_0_20px_rgba(245,158,11,0.6)]",
    glowStyles: "from-amber-600/65 via-yellow-400/55 to-yellow-600/65",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    titleColor: "bg-gradient-to-r from-amber-400 via-yellow-300 via-amber-200 to-amber-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "cosmic-nebula",
    name: "Cosmic Nebula Dust",
    borderStyles: "bg-gradient-to-br from-indigo-600 via-fuchsia-500 to-rose-400 animate-[pulse_2.5s_ease-in-out_infinite] shadow-[0_0_20px_rgba(99,102,241,0.6)]",
    glowStyles: "from-indigo-600/75 via-fuchsia-500/65 to-rose-400/75",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    titleColor: "bg-gradient-to-r from-indigo-400 via-fuchsia-400 via-rose-300 to-indigo-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "purple-energy",
    name: "Void Purple Spark",
    borderStyles: "bg-gradient-to-tr from-purple-950 via-purple-500 to-indigo-600 animate-[spin_10s_linear_infinite] shadow-[0_0_20px_rgba(147,51,234,0.65)]",
    glowStyles: "from-purple-800/75 via-purple-500/65 to-indigo-600/75",
    badgeColor: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    titleColor: "bg-gradient-to-r from-purple-400 via-violet-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "cyberpunk-vibe",
    name: "Cyber Grid Circuit",
    borderStyles: "bg-gradient-to-tr from-red-600 via-orange-500 to-yellow-400 animate-[spin_8s_linear_infinite] shadow-[0_0_20px_rgba(239,68,68,0.6)]",
    glowStyles: "from-red-600/65 via-orange-500/55 to-yellow-400/65",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    titleColor: "bg-gradient-to-r from-red-400 via-orange-400 via-yellow-300 to-red-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "cyan-beast",
    name: "Liquid Cyan Glow",
    borderStyles: "bg-[linear-gradient(110deg,#06b6d4,#3b82f6,#10b981,#06b6d4)] bg-[length:200%_200%] animate-[gradient-x_3s_ease_infinite] shadow-[0_0_20px_rgba(6,182,212,0.6)]",
    glowStyles: "from-cyan-400/75 via-blue-600/65 to-emerald-400/75",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    titleColor: "bg-gradient-to-r from-cyan-400 via-blue-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "royal-purple",
    name: "Royal Purple Glow",
    borderStyles: "bg-gradient-to-tr from-violet-600 via-purple-500 to-indigo-700 animate-[spin_7s_linear_infinite] shadow-[0_0_25px_rgba(124,58,237,0.7)]",
    glowStyles: "from-violet-600/75 via-purple-500/65 to-indigo-700/75",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    titleColor: "bg-gradient-to-r from-violet-400 via-purple-300 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "futuristic-hex",
    name: "Futuristic Hex Grid",
    borderStyles: "bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 animate-[spin_8s_linear_infinite] shadow-[0_0_25px_rgba(6,182,212,0.7)]",
    glowStyles: "from-cyan-500/75 via-indigo-500/65 to-purple-600/75",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    titleColor: "bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "emerald-viper",
    name: "Emerald Toxic Matrix",
    isNew: true,
    borderStyles: "bg-gradient-to-br from-emerald-500 via-lime-400 to-teal-600 animate-[spin_6s_linear_infinite] shadow-[0_0_25px_rgba(16,185,129,0.7)]",
    glowStyles: "from-emerald-500/75 via-lime-400/65 to-teal-600/75",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    titleColor: "bg-gradient-to-r from-emerald-400 via-lime-300 to-teal-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "diamond-ice",
    name: "Glacier Diamond Frost",
    isNew: true,
    borderStyles: "bg-gradient-to-tr from-sky-300 via-cyan-200 via-blue-400 to-white animate-[spin_7s_linear_infinite] shadow-[0_0_25px_rgba(56,189,248,0.7)]",
    glowStyles: "from-sky-300/80 via-cyan-200/70 to-blue-400/80",
    badgeColor: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    titleColor: "bg-gradient-to-r from-sky-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "solar-flare",
    name: "Solar Flare Supernova",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#f59e0b,#ef4444,#eab308,#f59e0b)] bg-[length:200%_200%] animate-[gradient-x_2.5s_ease_infinite] shadow-[0_0_25px_rgba(245,158,11,0.75)]",
    glowStyles: "from-amber-500/80 via-orange-500/70 to-red-600/80",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    titleColor: "bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "hyper-violet",
    name: "Hyper Violet Singularity",
    isNew: true,
    borderStyles: "bg-gradient-to-br from-purple-700 via-fuchsia-600 to-indigo-800 animate-[spin_5s_linear_infinite] shadow-[0_0_25px_rgba(168,85,247,0.75)]",
    glowStyles: "from-purple-700/80 via-fuchsia-600/70 to-indigo-800/80",
    badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    titleColor: "bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "aurora-borealis",
    name: "Aurora Northern Lights",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#10b981,#14b8a6,#06b6d4,#a855f7,#10b981)] bg-[length:300%_300%] animate-[gradient-x_4s_ease_infinite] shadow-[0_0_25px_rgba(45,212,191,0.75)]",
    glowStyles: "from-emerald-400/80 via-teal-400/70 to-purple-500/80",
    badgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/20",
    titleColor: "bg-gradient-to-r from-emerald-300 via-teal-200 to-purple-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "obsidian-onyx",
    name: "Obsidian Stealth Onyx",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#3f3f46,#fafafa,#18181b,#fafafa)] bg-[length:200%_200%] animate-[gradient-x_3.5s_ease_infinite] shadow-[0_0_25px_rgba(255,255,255,0.4)]",
    glowStyles: "from-zinc-500/60 via-zinc-300/40 to-zinc-800/60",
    badgeColor: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
    titleColor: "bg-gradient-to-r from-zinc-200 via-white to-zinc-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  }
];

interface AvatarWithFrameProps {
  avatarUrl?: string;
  displayName: string;
  isPro: boolean;
  frameId?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AvatarWithFrame({
  avatarUrl,
  displayName,
  isPro,
  frameId,
  size = "md",
  className
}: AvatarWithFrameProps) {
  const activeFrame = isPro ? PRO_FRAMES.find(f => f.id === frameId) : null;
  const initial = displayName[0] || "E";

  const sizeStyles = {
    sm: { 
      container: "w-[38px] h-[38px]", 
      padding: "2.5px", 
      outerRounded: "rounded-[12px]", 
      innerRounded: "rounded-[9px]", 
      initialText: "text-[10px]" 
    },
    md: { 
      container: "w-[48px] h-[48px]", 
      padding: "3.5px", 
      outerRounded: "rounded-[16px]", 
      innerRounded: "rounded-[13px]", 
      initialText: "text-xs" 
    },
    lg: { 
      container: "w-[72px] h-[72px]", 
      padding: "4.5px", 
      outerRounded: "rounded-[24px]", 
      innerRounded: "rounded-[20px]", 
      initialText: "text-lg" 
    },
    xl: { 
      container: "w-[104px] h-[104px]", 
      padding: "5.5px", 
      outerRounded: "rounded-[32px]", 
      innerRounded: "rounded-[27px]", 
      initialText: "text-3xl" 
    }
  }[size];

  return (
    <div className={cn("relative shrink-0 select-none group/avatar-frame", className)}>
      
      {/* 1. Double Layer High-Fidelity Volumetric Backdrop Glow Rings */}
      {isPro && activeFrame && (
        <>
          {/* Soft atmospheric glow */}
          <div className={cn(
            "absolute -inset-4 blur-2xl opacity-40 scale-105 pointer-events-none transition-all duration-500 z-0 bg-gradient-to-tr group-hover/avatar-frame:opacity-55",
            sizeStyles.outerRounded,
            activeFrame.glowStyles
          )} />
          {/* Refined outer halo */}
          <div className={cn(
            "absolute -inset-2.5 blur-xl opacity-35 pointer-events-none transition-all duration-500 z-0 bg-gradient-to-tr group-hover/avatar-frame:opacity-50",
            sizeStyles.outerRounded,
            activeFrame.glowStyles
          )} />
          {/* Crisp edge light */}
          <div className={cn(
            "absolute -inset-1 blur-sm opacity-60 pointer-events-none transition-all duration-500 z-0 bg-gradient-to-tr group-hover/avatar-frame:opacity-75",
            sizeStyles.outerRounded,
            activeFrame.glowStyles
          )} />
        </>
      )}

      {/* 2. Main Outer Frame Ring Container with thick absolute padding layout */}
      <div
        className={cn(
          "transition-all duration-500 relative z-10 flex items-center justify-center overflow-hidden shadow-2xl",
          sizeStyles.container,
          sizeStyles.outerRounded,
          activeFrame ? "" : (isPro ? "bg-gradient-to-tr from-purple-500 via-cyan-400 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-white/10")
        )}
        style={{ padding: activeFrame ? sizeStyles.padding : (isPro ? "2.5px" : "1px") }}
      >
        {/* Animated Gradient border loop */}
        {activeFrame ? (
          <div className={cn("absolute inset-0 z-0", activeFrame.borderStyles)} />
        ) : isPro ? (
          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-purple-500 via-cyan-400 to-pink-500" />
        ) : null}

        {/* 3. Inner Avatar picture wrapper */}
        <div
          className={cn(
            "w-full h-full bg-[#0b0b11] overflow-hidden flex items-center justify-center transition-all duration-500 shadow-inner relative z-10",
            sizeStyles.innerRounded
          )}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover relative z-10" />
          ) : (
            <div
              className={cn(
                "w-full h-full flex items-center justify-center font-sans font-extrabold tracking-tighter uppercase relative z-10",
                sizeStyles.initialText,
                isPro
                  ? "bg-gradient-to-br from-purple-500 via-cyan-400 to-pink-500 text-white shadow-lg"
                  : "bg-zinc-900 text-zinc-400"
              )}
            >
              {initial}
            </div>
          )}
          
          {/* 4. Luxury Inner Glow Ring Overlay - Bleeds frame color onto image edges */}
          {isPro && activeFrame && (
            <div className={cn(
              "absolute inset-0 z-20 pointer-events-none opacity-25 mix-blend-screen rounded-inherit border-[1.5px] border-transparent bg-gradient-to-tr [mask-image:linear-gradient(#fff_0_0)_border-box,_linear-gradient(#fff_0_0)] [mask-clip:padding-box,_border-box] [mask-composite:intersect]",
              activeFrame.glowStyles
            )} />
          )}
        </div>
      </div>
    </div>
  );
}
