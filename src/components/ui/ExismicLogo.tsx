"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface ExismicLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  innerClassName?: string;
  logoLink?: boolean;
}

export interface ExismicMarkProps {
  size?: number;
  className?: string;
  animated?: boolean;
  letter?: string;
  theme?: "default" | "blue" | "purple" | "gold";
}

export function ExismicMark({
  size = 36,
  className,
  animated = true,
  letter = "E",
  theme = "default",
}: ExismicMarkProps) {
  const themeConfig = {
    default: {
      conic: "bg-[conic-gradient(from_10deg,#67e8f9,#22d3ee_18%,#a855f7_42%,#d946ef_67%,#67e8f9_100%)]",
      bevel: "bg-[linear-gradient(145deg,rgba(168,85,247,0.8),rgba(12,13,23,0.95)_48%,rgba(34,211,238,0.7))]",
      dot: "bg-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.9)]",
      glow: "drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]",
    },
    blue: {
      conic: "bg-[conic-gradient(from_10deg,#06b6d4,#38bdf8_25%,#3b82f6_50%,#67e8f9_75%,#06b6d4_100%)]",
      bevel: "bg-[linear-gradient(145deg,rgba(34,211,238,0.85),rgba(6,18,36,0.95)_48%,rgba(59,130,246,0.75))]",
      dot: "bg-cyan-100 shadow-[0_0_8px_rgba(34,211,238,0.95)]",
      glow: "drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]",
    },
    purple: {
      conic: "bg-[conic-gradient(from_10deg,#a855f7,#d946ef_25%,#ec4899_50%,#c084fc_75%,#a855f7_100%)]",
      bevel: "bg-[linear-gradient(145deg,rgba(217,70,239,0.85),rgba(20,8,34,0.95)_48%,rgba(168,85,247,0.75))]",
      dot: "bg-fuchsia-100 shadow-[0_0_8px_rgba(217,70,239,0.95)]",
      glow: "drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]",
    },
    gold: {
      conic: "bg-[conic-gradient(from_10deg,#f59e0b,#f97316_25%,#ef4444_50%,#fcd34d_75%,#f59e0b_100%)]",
      bevel: "bg-[linear-gradient(145deg,rgba(245,158,11,0.85),rgba(28,12,6,0.95)_48%,rgba(239,68,68,0.75))]",
      dot: "bg-amber-100 shadow-[0_0_8px_rgba(245,158,11,0.95)]",
      glow: "drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]",
    },
  }[theme];

  const isSmall = size <= 26;

  return (
    <div
      className={cn(
        "group/mark relative isolate shrink-0 transition-all duration-500 group-hover:scale-110",
        themeConfig.glow,
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Animated gradient border shell */}
      <div className="absolute inset-0 overflow-hidden [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]">
        <div
          className={cn("absolute -inset-1/2", themeConfig.conic, animated ? "animate-[spin_4s_linear_infinite]" : "")}
        />
      </div>

      {/* Dark divider (the border width) */}
      <div className={cn("absolute [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[#05060b]", isSmall ? "inset-[1px]" : "inset-[2px]")} />
      
      {/* Inner 3D Bevel with Shine */}
      <div className={cn("absolute overflow-hidden [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]", themeConfig.bevel, isSmall ? "inset-[1.8px]" : "inset-[3px]")}>
        <span className="absolute -left-10 top-0 h-full w-4 skew-x-[-18deg] bg-white/40 blur-[1px] transition-transform duration-1000 group-hover/mark:translate-x-20" />
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.4),transparent_26%)]" />
      </div>

      {/* Deep Core where the letter lives */}
      <div
        className="absolute flex items-center justify-center [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[#080914] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
        style={{
          top: isSmall ? '13%' : '16%',
          left: isSmall ? '13%' : '16%',
          bottom: isSmall ? '13%' : '16%',
          right: isSmall ? '13%' : '16%',
        }}
      >
        {/* The letter C or E */}
        <span 
          className="relative z-10 text-white font-black leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] font-sans" 
          style={{ fontSize: isSmall ? size * 0.52 : size * 0.45, marginTop: '2%' }}
        >
          {letter}
        </span>
      </div>

      {/* Decorative Themed Glowing Dot */}
      <span className={cn("absolute right-[4%] top-[19%] rounded-full animate-pulse", isSmall ? "w-[15%] h-[15%]" : "w-[12%] h-[12%]", themeConfig.dot)} />
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
    ? "text-[7.5px] tracking-[0.24em]" 
    : size <= 40 
      ? "text-[8px] tracking-[0.26em]" 
      : "text-[9px] tracking-[0.28em]";

  const logoContent = (
    <div 
      suppressHydrationWarning 
      className={cn(
        "flex items-center group relative cursor-pointer select-none notranslate", 
        showText ? "gap-2.5" : "justify-center", 
        className
      )} 
      translate="no"
    >
      <ExismicMark size={size} className={innerClassName} />

      {/* Premium Typography Branding */}
      {showText && (
        <div className="flex flex-col justify-center text-left notranslate leading-none" translate="no">
          <div className={cn(
            "font-black tracking-[-0.02em] bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400 group-hover:from-white group-hover:via-purple-100 group-hover:to-indigo-300 leading-none flex items-center transition-all duration-500 notranslate m-0 p-0",
            titleSizeClass
          )} translate="no">
            <span>Exismic</span>
            <span className="inline-block text-cyan-400 font-black drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] ml-[1px] group-hover:text-purple-400 group-hover:scale-125 transition-all duration-300">.</span>
          </div>
          <span className={cn(
            "font-black text-zinc-500 uppercase transition-colors duration-300 notranslate leading-none mt-1",
            subtitleSizeClass
          )} translate="no">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400/90 to-indigo-400/90 drop-shadow-[0_0_6px_rgba(168,85,247,0.3)]">AI</span>
            <span className="group-hover:text-zinc-400 transition-colors duration-300"> STUDIO</span>
          </span>
        </div>
      )}
    </div>
  );

  if (logoLink) {
    return (
      <Link 
        href="/" 
        className={cn(
          "outline-none transition-transform", 
          showText ? "inline-flex items-center" : "flex items-center justify-center w-full mx-auto"
        )} 
        suppressHydrationWarning
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

