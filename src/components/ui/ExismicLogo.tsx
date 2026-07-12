"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface ExismicLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  innerClassName?: string;
  logoLink?: boolean;
}

export function ExismicMark({
  size = 36,
  className,
  animated = true,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/mark relative isolate shrink-0 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all duration-500 group-hover:scale-110",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Animated gradient border shell */}
      <div className="absolute inset-0 overflow-hidden [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]">
        <div
          className={cn("absolute -inset-1/2 bg-[conic-gradient(from_10deg,#67e8f9,#22d3ee_18%,#a855f7_42%,#d946ef_67%,#67e8f9_100%)]", animated ? "animate-[spin_4s_linear_infinite]" : "")}
        />
      </div>

      {/* Dark divider (the border width) */}
      <div className="absolute inset-[2px] [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[#05060b]" />
      
      {/* Inner 3D Bevel with Shine */}
      <div className="absolute inset-[3px] overflow-hidden [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[linear-gradient(145deg,rgba(168,85,247,0.8),rgba(12,13,23,0.95)_48%,rgba(34,211,238,0.7))]">
        <span className="absolute -left-10 top-0 h-full w-4 skew-x-[-18deg] bg-white/40 blur-[1px] transition-transform duration-1000 group-hover/mark:translate-x-20" />
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.4),transparent_26%)]" />
      </div>

      {/* Deep Core where the E lives */}
      <div
        className="absolute flex items-center justify-center [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[#080914] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
        style={{ top: '16%', left: '16%', bottom: '16%', right: '16%' }}
      >
        {/* The letter E */}
        <span 
          className="relative z-10 text-white font-black leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
          style={{ fontSize: size * 0.45, marginTop: '2%' }}
        >
          E
        </span>
      </div>

      {/* Decorative Cyan Dot */}
      <span className="absolute right-[4%] top-[19%] w-[12%] h-[12%] rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse" />
    </div>
  );
}

export function ExismicLogo({
  size = 36,
  showText = true,
  className = "",
  innerClassName = "",
  logoLink = true,
}: ExismicLogoProps) {
  const titleSizeClass = size <= 32 
    ? "text-[14px]" 
    : size <= 40 
      ? "text-[17px]" 
      : "text-[22px]";
      
  const subtitleSizeClass = size <= 32 
    ? "text-[7px] tracking-[0.28em] mt-0.5" 
    : size <= 40 
      ? "text-[8px] tracking-[0.3em] mt-1" 
      : "text-[9px] tracking-[0.32em] mt-1.5";

  const logoContent = (
    <div suppressHydrationWarning className={cn("flex items-center gap-3 group relative cursor-pointer select-none", className)}>
      <ExismicMark size={size} className={innerClassName} />

      {/* Premium Typography Branding */}
      {showText && (
        <div className="flex flex-col justify-center text-left">
          <h1 className={cn(
            "font-black tracking-[-0.015em] text-white leading-none flex items-center transition-colors duration-300 group-hover:text-zinc-100",
            titleSizeClass
          )}>
            Exismic
            <span className="text-cyan-400 font-extrabold drop-shadow-[0_0_6px_rgba(34,211,238,0.6)] ml-[1px]">.</span>
          </h1>
          <span className={cn(
            "font-black text-zinc-500 uppercase transition-colors duration-300 group-hover:text-zinc-400",
            subtitleSizeClass
          )}>
            AI Studio
          </span>
        </div>
      )}
    </div>
  );

  if (logoLink) {
    return (
      <Link href="/" className="inline-block outline-none" suppressHydrationWarning>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

