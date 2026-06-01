"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

interface LumoraLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  innerClassName?: string;
  logoLink?: boolean;
}

export function LumoraLogo({
  size = 36,
  showText = true,
  className = "",
  innerClassName = "",
  logoLink = true,
}: LumoraLogoProps) {
  // Proportional sizing calculations
  const iconRadius = size * 0.32;
  const letterSize = size * 0.52;
  
  // Font sizes scaled according to the icon size
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
    <div className={cn("flex items-center gap-3 group relative cursor-pointer select-none", className)}>
      {/* Premium Glowing Squircle Icon */}
      <div className="relative shrink-0">
        {/* Soft, deep ambient neon glow under the squircle */}
        <div 
          className="absolute -inset-1.5 bg-gradient-to-r from-purple-600 to-cyan-400 blur-xl opacity-35 group-hover:opacity-75 transition-opacity duration-500"
          style={{ borderRadius: iconRadius + 4 }}
        />
        
        {/* The sharp premium gradient outline border */}
        <div 
          className="relative bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-500 group-hover:rotate-[3deg] group-hover:scale-[1.03]"
          style={{ width: size, height: size, borderRadius: iconRadius }}
        >
          {/* Dark luxury core container */}
          <div 
            className={cn(
              "w-full h-full bg-[#07070a] flex items-center justify-center relative overflow-hidden",
              innerClassName
            )}
            style={{ borderRadius: iconRadius - 1.5 }}
          >
            {/* Metallic sweep reflection line */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-cyan-500/5 pointer-events-none" />
            <div className="absolute inset-y-0 -left-[100%] w-[50%] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent skew-x-12 group-hover:animate-shine pointer-events-none" />
            
            {/* Elegant "L" Glyph */}
            <span 
              className="bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent font-black font-mono leading-none select-none drop-shadow-[0_0_8px_rgba(255,255,255,0.25)] group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all duration-500"
              style={{ fontSize: letterSize }}
            >
              L
            </span>
          </div>
        </div>
      </div>

      {/* Premium Typography Branding */}
      {showText && (
        <div className="flex flex-col justify-center text-left">
          <h1 className={cn(
            "font-black tracking-[-0.015em] text-white leading-none flex items-center transition-colors duration-300 group-hover:text-zinc-100",
            titleSizeClass
          )}>
            Lumora
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
      <Link href="/" className="inline-block outline-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
