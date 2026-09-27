"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type LuxuryButtonTheme = "gold" | "purple" | "cyan" | "emerald" | "obsidian";

export interface LuxuryButtonProps {
  href?: string;
  onClick?: () => void;
  title: string;
  subtitle: string;
  theme?: LuxuryButtonTheme;
  icon?: React.ReactNode;
  className?: string;
  size?: "default" | "sm";
  target?: string;
  rel?: string;
}

export function LuxuryButton({
  href,
  onClick,
  title,
  subtitle,
  theme = "gold",
  icon,
  className,
  size = "default",
  target,
  rel,
}: LuxuryButtonProps) {
  // Theme visual variations matching ProClient VIP button architecture
  const config = {
    gold: {
      shadow: "shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:shadow-[0_0_50px_rgba(245,158,11,0.75)]",
      conic: "bg-[conic-gradient(from_0deg,#d97706,#f59e0b_25%,#fbbf24_50%,#fde68a_75%,#d97706_100%)]",
      halo: "bg-[conic-gradient(from_0deg,#d97706,#f59e0b,#fbbf24,#d97706)]",
      core: "border-amber-400/35 bg-gradient-to-br from-[#171005]/98 via-[#0e0903]/98 to-[#060401]/98",
      hoverCore: "group-hover/launch:from-[#211707]/98 group-hover/launch:to-[#0f0702]/98",
      iconFrame: "border-amber-400/40 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]",
      dot: "bg-amber-200 shadow-[0_0_6px_rgba(251,191,36,0.9)]",
      subtitle: "text-amber-200/90",
      arrow: "text-amber-300 group-hover/launch:text-amber-200",
    },
    purple: {
      shadow: "shadow-[0_0_40px_rgba(168,85,247,0.55)] hover:shadow-[0_0_55px_rgba(168,85,247,0.8)]",
      conic: "bg-[conic-gradient(from_0deg,#a855f7,#d946ef_25%,#ec4899_50%,#c084fc_75%,#a855f7_100%)]",
      halo: "bg-[conic-gradient(from_0deg,#a855f7,#d946ef,#ec4899,#a855f7)]",
      core: "border-purple-400/35 bg-gradient-to-br from-[#120822]/98 via-[#0e071a]/98 to-[#07030e]/98",
      hoverCore: "group-hover/launch:from-[#1b0c33]/98 group-hover/launch:to-[#0f041c]/98",
      iconFrame: "border-purple-400/40 bg-purple-500/20 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.35)]",
      dot: "bg-fuchsia-200 shadow-[0_0_6px_rgba(217,70,239,0.9)]",
      subtitle: "text-purple-200",
      arrow: "text-purple-300 group-hover/launch:text-purple-200",
    },
    cyan: {
      shadow: "shadow-[0_0_35px_rgba(6,182,212,0.45)] hover:shadow-[0_0_50px_rgba(6,182,212,0.7)]",
      conic: "bg-[conic-gradient(from_0deg,#0284c7,#06b6d4_25%,#38bdf8_50%,#bae6fd_75%,#0284c7_100%)]",
      halo: "bg-[conic-gradient(from_0deg,#0284c7,#06b6d4,#38bdf8,#0284c7)]",
      core: "border-cyan-400/35 bg-gradient-to-br from-[#06121d]/98 via-[#040c14]/98 to-[#02060a]/98",
      hoverCore: "group-hover/launch:from-[#0a1c2d]/98 group-hover/launch:to-[#040e17]/98",
      iconFrame: "border-cyan-400/40 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]",
      dot: "bg-cyan-200 shadow-[0_0_6px_rgba(34,211,238,0.9)]",
      subtitle: "text-cyan-200/90",
      arrow: "text-cyan-300 group-hover/launch:text-cyan-200",
    },
    emerald: {
      shadow: "shadow-[0_0_35px_rgba(16,185,129,0.45)] hover:shadow-[0_0_50px_rgba(16,185,129,0.7)]",
      conic: "bg-[conic-gradient(from_0deg,#059669,#10b981_25%,#34d399_50%,#a7f3d0_75%,#059669_100%)]",
      halo: "bg-[conic-gradient(from_0deg,#059669,#10b981,#34d399,#059669)]",
      core: "border-emerald-400/35 bg-gradient-to-br from-[#04160e]/98 via-[#020e09]/98 to-[#010604]/98",
      hoverCore: "group-hover/launch:from-[#072216]/98 group-hover/launch:to-[#03110b]/98",
      iconFrame: "border-emerald-400/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]",
      dot: "bg-emerald-200 shadow-[0_0_6px_rgba(52,211,153,0.9)]",
      subtitle: "text-emerald-200/90",
      arrow: "text-emerald-300 group-hover/launch:text-emerald-200",
    },
    obsidian: {
      shadow: "shadow-[0_0_30px_rgba(255,255,255,0.12)] hover:shadow-[0_0_45px_rgba(255,255,255,0.22)]",
      conic: "bg-[conic-gradient(from_0deg,rgba(255,255,255,0.25)_0%,rgba(210,210,230,0.6)_25%,rgba(255,255,255,0.35)_50%,rgba(170,170,200,0.5)_75%,rgba(255,255,255,0.25)_100%)]",
      halo: "bg-[conic-gradient(from_0deg,rgba(255,255,255,0.15),rgba(210,210,230,0.3),rgba(255,255,255,0.15))]",
      core: "border-white/20 bg-gradient-to-br from-[#12131f]/98 via-[#0b0c14]/98 to-[#06060a]/98",
      hoverCore: "group-hover/launch:from-[#181a2b]/98 group-hover/launch:to-[#0c0d16]/98",
      iconFrame: "border-white/25 bg-white/[0.08] text-zinc-200 shadow-[0_0_10px_rgba(255,255,255,0.1)]",
      dot: "bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.8)]",
      subtitle: "text-zinc-400 group-hover/launch:text-zinc-200",
      arrow: "text-zinc-400 group-hover/launch:text-white",
    },
  }[theme];

  const minHeightClass = size === "sm" ? "min-h-[56px] sm:min-h-[60px]" : "min-h-[62px] sm:min-h-[66px]";

  const content = (
    <motion.div
      whileHover={{ y: -2, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group/launch relative flex w-full items-center justify-center overflow-hidden rounded-[22px] p-[2.5px] isolate transition-all duration-500 cursor-pointer select-none",
        minHeightClass,
        config.shadow,
        className
      )}
    >
      {/* 1. Rotating Sharp Neon Border */}
      <motion.span
        aria-hidden="true"
        className={cn(
          "absolute -inset-[150%] opacity-100 mix-blend-screen",
          config.conic
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />

      {/* 2. Halo Diffusion Layer */}
      <motion.span
        aria-hidden="true"
        className={cn(
          "absolute -inset-[100%] blur-md opacity-80 mix-blend-screen",
          config.halo
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />

      {/* 3. Obsidian Glass Inner Core with Full Text Visibility */}
      <span
        className={cn(
          "relative flex h-full w-full items-center justify-between gap-3 sm:gap-4 rounded-[19px] border px-4 sm:px-5 py-2.5 sm:py-3 backdrop-blur-2xl transition-colors duration-500",
          config.core,
          config.hoverCore
        )}
      >
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
          {/* Distinct Custom Icon in Luminous Jewel Frame */}
          {icon && (
            <div className="relative shrink-0 flex items-center justify-center">
              <div
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border backdrop-blur-md transition-transform duration-300 group-hover/launch:scale-105",
                  config.iconFrame
                )}
              >
                {icon}
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full",
                    config.dot
                  )}
                />
              </div>
            </div>
          )}

          {/* Full Text Visibility Stack with clean spacing */}
          <div className="text-left min-w-0 flex-1">
            <span className="block text-[11px] sm:text-xs md:text-[12.5px] font-black uppercase tracking-[0.05em] sm:tracking-[0.08em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] leading-tight">
              {title}
            </span>
            <span
              className={cn(
                "block mt-0.5 text-[9.5px] sm:text-[10px] md:text-[10.5px] font-semibold tracking-normal sm:tracking-wide transition-colors leading-snug whitespace-normal",
                config.subtitle
              )}
            >
              {subtitle}
            </span>
          </div>
        </div>

        {/* Clean Squircle Right Arrow Box (Matching Reference Screenshot) */}
        <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover/launch:translate-x-0.5 group-hover/launch:bg-white/[0.08]">
          <ArrowRight
            size={15}
            className={cn(
              "shrink-0",
              config.arrow
            )}
          />
        </div>
      </span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} prefetch={true} target={target} rel={rel} className="w-full inline-block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="w-full inline-block text-left p-0 border-0 bg-transparent">
      {content}
    </button>
  );
}
