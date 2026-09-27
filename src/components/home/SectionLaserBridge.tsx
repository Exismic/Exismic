"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionLaserBridgeProps {
  className?: string;
  variant?: "multi" | "cyan-purple" | "purple-amber" | "emerald-cyan";
  label?: string;
}

export function SectionLaserBridge({ 
  className,
  variant = "multi",
  label
}: SectionLaserBridgeProps) {
  const getGradient = () => {
    switch (variant) {
      case "cyan-purple":
        return "from-transparent via-cyan-400/50 via-blue-500/50 via-purple-500/50 to-transparent";
      case "purple-amber":
        return "from-transparent via-purple-500/50 via-rose-500/50 via-amber-400/50 to-transparent";
      case "emerald-cyan":
        return "from-transparent via-emerald-400/50 via-teal-400/50 via-cyan-400/50 to-transparent";
      case "multi":
      default:
        return "from-transparent via-cyan-400/45 via-purple-500/50 via-amber-400/45 to-transparent";
    }
  };

  const getGlow = () => {
    switch (variant) {
      case "cyan-purple":
        return "from-cyan-500/20 via-blue-500/25 to-purple-500/20";
      case "purple-amber":
        return "from-purple-500/20 via-rose-500/25 to-amber-500/20";
      case "emerald-cyan":
        return "from-emerald-500/20 via-teal-500/25 to-cyan-500/20";
      case "multi":
      default:
        return "from-cyan-500/20 via-purple-500/30 to-amber-500/20";
    }
  };

  const getCenterDot = () => {
    switch (variant) {
      case "cyan-purple":
        return "bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]";
      case "purple-amber":
        return "bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.9)]";
      case "emerald-cyan":
        return "bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]";
      case "multi":
      default:
        return "bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-300 shadow-[0_0_14px_rgba(168,85,247,0.9)]";
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full max-w-6xl mx-auto px-4 sm:px-6 my-2 sm:my-3.5 flex items-center justify-center select-none pointer-events-none z-10",
        className
      )}
      aria-hidden="true"
    >
      {/* 1. Extended Ambient Mesh Glow Aura */}
      <div 
        className={cn(
          "absolute w-72 sm:w-96 md:w-[32rem] h-8 -top-3.5 rounded-full blur-2xl pointer-events-none opacity-40 bg-gradient-to-r",
          getGlow()
        )} 
      />

      {/* 2. Razor-Sharp Radiant Laser Horizon Line */}
      <div 
        className={cn(
          "w-full h-[1.5px] rounded-full bg-gradient-to-r",
          getGradient()
        )}
      />

      {/* 3. Center Optic Jewel Node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        {label ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0a12]/95 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
            <span className={cn("w-1.5 h-1.5 rounded-full animate-ping opacity-75", getCenterDot())} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              {label}
            </span>
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            {/* Outer Optic Diamond Halo */}
            <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.9)]">
              {/* Pulsing Luminous Beacon Dot */}
              <span className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", getCenterDot())} />
                <span className={cn("relative inline-flex rounded-full h-2 w-2", getCenterDot())} />
              </span>
            </div>
            {/* Subtle Crosshair Micro Flares */}
            <div className="absolute w-10 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
}
