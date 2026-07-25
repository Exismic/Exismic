"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function CreditTokenIcon({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const shellSize = size === "lg" ? "h-11 w-11" : size === "md" ? "h-9 w-9" : "h-7 w-7";
  const coreSize = size === "lg" ? "inset-[8px] text-[14px]" : size === "md" ? "inset-[7px] text-[12px]" : "inset-[5px] text-[9px]";

  return (
    <div
      className={cn(
        "relative isolate shrink-0 transition-all duration-500 group-hover/credits:scale-110 group-hover/vault:scale-110",
        shellSize
      )}
      aria-hidden="true"
    >
      {/* Outer Neon Halo */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-fuchsia-500/40 blur-sm opacity-70 group-hover/vault:opacity-100 transition-opacity" />

      {/* Rotating Outer Hex Rim */}
      <div className="absolute inset-0 overflow-hidden [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]">
        <div
          className="absolute -inset-1/2 animate-spin bg-[conic-gradient(from_0deg,#38bdf8,#a855f7_35%,#f43f5e_65%,#38bdf8_100%)] opacity-90"
          style={{ animationDuration: "4s" }}
        />
      </div>

      {/* Dark Bevel Base */}
      <div className="absolute inset-[1.5px] [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[#04040a]" />

      {/* Crystalline Metallic Gradient Body */}
      <div className="absolute inset-[2.5px] overflow-hidden [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[linear-gradient(135deg,rgba(168,85,247,0.9),rgba(15,17,32,0.95)_45%,rgba(34,211,238,0.85))]">
        {/* Shiny Sheen Reflection */}
        <span className="absolute -left-6 top-0 h-full w-3 skew-x-[-20deg] bg-white/40 blur-[1px] transition-transform duration-1000 group-hover/credits:translate-x-16 group-hover/vault:translate-x-16" />
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.6),transparent_35%)]" />
      </div>

      {/* Core Dark Inset with Holographic "C" */}
      <div
        className={cn(
          "absolute flex items-center justify-center [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[#070814] font-black leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
          coreSize
        )}
      >
        <span className="translate-y-[-0.25px] bg-gradient-to-b from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">
          C
        </span>
      </div>

      {/* Pulsing Satellite Dot */}
      <span className="absolute right-[2%] top-[16%] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(56,189,248,1)] animate-ping" />
      <span className="absolute right-[2%] top-[16%] h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_6px_rgba(56,189,248,0.9)]" />
    </div>
  );
}
