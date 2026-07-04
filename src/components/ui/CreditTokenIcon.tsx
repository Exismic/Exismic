"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function CreditTokenIcon({ size = "sm" }: { size?: "sm" | "md" }) {
  const shellSize = size === "md" ? "h-9 w-9" : "h-7 w-7";
  const coreSize = size === "md" ? "inset-[7px] text-[12px]" : "inset-[5px] text-[9px]";

  return (
    <div
      className={cn(
        "relative isolate shrink-0 drop-shadow-[0_0_10px_rgba(124,58,237,0.38)] transition-all duration-500 group-hover/credits:scale-110 group-hover/vault:scale-110",
        shellSize
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 overflow-hidden [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]">
        <div
          className="absolute -inset-1/2 animate-spin bg-[conic-gradient(from_10deg,#67e8f9,#22d3ee_18%,#7558ff_42%,#d946ef_67%,#67e8f9_100%)]"
          style={{ animationDuration: "5.5s" }}
        />
      </div>

      <div className="absolute inset-[2px] [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[#05060b]" />
      <div className="absolute inset-[3px] overflow-hidden [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[linear-gradient(145deg,rgba(139,92,246,0.82),rgba(12,13,23,0.94)_48%,rgba(34,211,238,0.7))]">
        <span className="absolute -left-5 top-0 h-full w-2 skew-x-[-18deg] bg-white/35 blur-[1px] transition-transform duration-1000 group-hover/credits:translate-x-12 group-hover/vault:translate-x-12" />
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.48),transparent_26%)]" />
      </div>

      <div
        className={cn(
          "absolute flex items-center justify-center [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[#080914] font-black leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
          coreSize
        )}
      >
        <span className="translate-y-[-0.25px] drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">C</span>
      </div>

      <span className="absolute right-[4%] top-[19%] h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_7px_rgba(103,232,249,0.95)]" />
    </div>
  );
}
