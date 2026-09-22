"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_ANIM_STYLES, CATEGORY_PRIMARY_HEX } from "@/lib/category-styles";

interface CategoryHeadingProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  categoryId: string;
  isPro?: boolean;
  className?: string;
}

const CATEGORY_LABEL_STYLES: Record<string, { label: string; text: string; iconStyle: string }> = {
  pdf: { 
    label: "PDF & Document Tools", 
    text: "text-red-300", 
    iconStyle: "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
  },
  image: { 
    label: "Image & Photo Tools", 
    text: "text-cyan-300", 
    iconStyle: "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" 
  },
  audio: { 
    label: "Audio & Music Tools", 
    text: "text-pink-300", 
    iconStyle: "text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" 
  },
  video: { 
    label: "Video Tools", 
    text: "text-violet-300", 
    iconStyle: "text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" 
  },
  ai: { 
    label: "AI Tools", 
    text: "text-amber-300", 
    iconStyle: "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" 
  },
  productivity: { 
    label: "Productivity Tools", 
    text: "text-emerald-300", 
    iconStyle: "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" 
  },
  business: { 
    label: "Business & Finance Tools", 
    text: "text-orange-300", 
    iconStyle: "text-orange-400 drop-shadow-[0_0_8px_rgba(255,153,51,0.8)]" 
  },
  seo: { 
    label: "Search & SEO Tools", 
    text: "text-cyan-300", 
    iconStyle: "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
  },
  developer: { 
    label: "Developer Tools", 
    text: "text-lime-300", 
    iconStyle: "text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]" 
  },
  student: { 
    label: "Student & Study Tools", 
    text: "text-amber-300", 
    iconStyle: "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" 
  },
  creator: { 
    label: "Creator & Social Media Tools", 
    text: "text-rose-300", 
    iconStyle: "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" 
  },
};

const CategoryHeading: React.FC<CategoryHeadingProps> = ({
  icon: Icon,
  title,
  subtitle,
  categoryId,
  className
}) => {
  const animStyle = CATEGORY_ANIM_STYLES[categoryId] || CATEGORY_ANIM_STYLES.pdf;
  const primaryHex = CATEGORY_PRIMARY_HEX[categoryId] || "#f59e0b";
  const labelStyle = CATEGORY_LABEL_STYLES[categoryId] || { 
    label: "Curated Tools", 
    text: "text-zinc-300", 
    iconStyle: "text-zinc-400" 
  };

  return (
    <div className={cn("relative space-y-5 sm:space-y-6", className)}>
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Compact, Integrated Eyebrow Pill */}
        <div className="flex items-center">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-xs">
            <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
              <div className={cn("absolute -inset-1 rounded-full blur-xs opacity-60", animStyle.aura)} />
              <Icon size={14} className={cn("relative z-10 shrink-0", labelStyle.iconStyle)} />
            </div>
            <span className={cn("text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em]", labelStyle.text)}>
              {labelStyle.label}
            </span>
          </div>
        </div>

        {/* Hero Title & Subtitle - Zero Edge Clipping with generous inner padding */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="relative overflow-visible py-1"> 
            <h1 
              className={cn(
                "text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black tracking-tighter uppercase italic leading-[1.08] select-none bg-clip-text text-transparent bg-[length:200%_100%] animate-[shine_4s_linear_infinite] px-4 sm:px-8 py-1 -mx-4 sm:-mx-8 overflow-visible inline-block",
                animStyle.textGrad,
                className
              )}
            >
              {title}
            </h1>
            {/* Soft Ambient Depth */}
            <span 
              className="absolute inset-0 text-white/5 blur-3xl -z-10 select-none uppercase italic font-black text-4xl sm:text-6xl md:text-7xl xl:text-8xl tracking-tighter leading-[1.08] px-4 sm:px-8 -mx-4 sm:-mx-8 py-1"
            >
              {title}
            </span>
          </div>

          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-3xl leading-relaxed font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Category-Reactive Laser Horizon Bridge (like Screenshot 5) */}
      <div className="relative w-full py-1 pointer-events-none select-none">
        <div className="relative flex items-center justify-center">
          {/* Ambient Diffused Glow Flare */}
          <div
            className="absolute h-9 w-2/3 max-w-md rounded-full blur-xl opacity-40 will-change-transform animate-pulse-glow"
            style={{
              background: `radial-gradient(ellipse at center, ${primaryHex}, transparent 70%)`
            }}
          />

          {/* Primary Tapered Neon Laser Hairline */}
          <div
            className="relative w-full h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${primaryHex}20 15%, ${primaryHex} 50%, ${primaryHex}20 85%, transparent 100%)`
            }}
          />

          {/* Center Specular High-Intensity White Needle */}
          <div
            className="absolute w-44 sm:w-80 h-[1.5px] blur-[0.5px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)`
            }}
          />

          {/* Center Glowing Cyber Core Jewel */}
          <div className="absolute flex items-center justify-center">
            <div
              className="size-1.5 rounded-full"
              style={{
                background: "#ffffff",
                boxShadow: `0 0 10px 2px ${primaryHex}`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryHeading;
