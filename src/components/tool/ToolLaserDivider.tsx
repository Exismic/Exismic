"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_PRIMARY_HEX } from "@/lib/category-styles";

interface ToolLaserDividerProps {
  categoryId?: string;
  primaryHex?: string;
  className?: string;
}

/**
 * Mandatory Category-Reactive Anamorphic Laser Horizon Divider
 * Strict compliance with TOOL_STANDARDS_AND_GUIDELINES.md Standard 3
 */
export function ToolLaserDivider({
  categoryId = "audio",
  primaryHex,
  className,
}: ToolLaserDividerProps) {
  const hex = primaryHex || CATEGORY_PRIMARY_HEX[categoryId] || "#ec4899";

  return (
    <div
      className={cn(
        "relative w-full max-w-6xl mx-auto my-6 sm:my-8 flex items-center justify-center select-none pointer-events-none z-10",
        className
      )}
      aria-hidden="true"
    >
      {/* 1. Extended Ambient Flare */}
      <div
        className="absolute w-72 sm:w-96 md:w-[36rem] h-10 -top-4 rounded-full blur-2xl pointer-events-none opacity-45"
        style={{
          background: `radial-gradient(ellipse at center, ${hex}, transparent 70%)`,
        }}
      />

      {/* 2. Laser Hairline */}
      <div
        className="w-full h-[1.5px] rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${hex}20 15%, ${hex} 50%, ${hex}20 85%, transparent 100%)`,
        }}
      />

      {/* 3. Specular White Needle */}
      <div
        className="absolute w-36 sm:w-64 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)`,
        }}
      />

      {/* 4. Cyber Core Jewel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Outer optic halo ring */}
          <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.9)]">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "#ffffff",
                boxShadow: `0 0 10px 2px ${hex}`,
              }}
            />
          </div>
          {/* Crosshair micro flare */}
          <div className="absolute w-12 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
