"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FlagIconProps {
  country: string; // ISO 2-letter code: 'us', 'in', 'es', 'fr', 'de', 'sa', 'jp', etc.
  className?: string;
  size?: number;
}

export function FlagIcon({ country, className, size = 18 }: FlagIconProps) {
  const code = country.toLowerCase();

  switch (code) {
    case "us":
    case "en":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#bd3d44" d="M0 0h640v480H0z" />
          <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 277h640M0 350.8h640M0 424.6h640" />
          <path fill="#192f5d" d="M0 0h256v258.5H0z" />
          <circle cx="128" cy="129" r="60" fill="#fff" opacity="0.9" />
          <path fill="#192f5d" d="M128 85l12 37h39l-31 23 12 37-32-23-32 23 12-37-31-23h39z" />
        </svg>
      );
    case "in":
    case "hi":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#ff9933" d="M0 0h640v160H0z" />
          <path fill="#fff" d="M0 160h640v160H0z" />
          <path fill="#128807" d="M0 320h640v160H0z" />
          <circle cx="320" cy="240" r="50" fill="none" stroke="#000080" strokeWidth="8" />
          <circle cx="320" cy="240" r="14" fill="#000080" />
        </svg>
      );
    case "es":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#aa151b" d="M0 0h640v480H0z" />
          <path fill="#f1bf00" d="M0 120h640v240H0z" />
          <circle cx="180" cy="240" r="30" fill="#aa151b" opacity="0.8" />
        </svg>
      );
    case "fr":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#002395" d="M0 0h213.3v480H0z" />
          <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
          <path fill="#ed2939" d="M426.7 0H640v480H426.7z" />
        </svg>
      );
    case "de":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#000" d="M0 0h640v160H0z" />
          <path fill="#d00" d="M0 160h640v160H0z" />
          <path fill="#ffce00" d="M0 320h640v160H0z" />
        </svg>
      );
    case "sa":
    case "ar":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#007a3d" d="M0 0h640v480H0z" />
          <path fill="#fff" d="M180 270h280v15H180zM240 220h160v15H240z" />
        </svg>
      );
    case "jp":
    case "ja":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0 border border-white/10", className)}>
          <path fill="#fff" d="M0 0h640v480H0z" />
          <circle cx="320" cy="240" r="120" fill="#bc002d" />
        </svg>
      );
    case "kr":
    case "ko":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0 border border-white/10", className)}>
          <path fill="#fff" d="M0 0h640v480H0z" />
          <circle cx="320" cy="240" r="100" fill="#c60c30" />
          <path fill="#003478" d="M320 140a100 100 0 000 200 50 50 0 000-100 50 50 0 010-100z" />
        </svg>
      );
    case "ru":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#fff" d="M0 0h640v160H0z" />
          <path fill="#0039a6" d="M0 160h640v160H0z" />
          <path fill="#d52b1e" d="M0 320h640v160H0z" />
        </svg>
      );
    case "pt":
    case "br":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#009c3b" d="M0 0h640v480H0z" />
          <path fill="#ffdf00" d="M320 60l260 180-260 180L60 240z" />
          <circle cx="320" cy="240" r="85" fill="#002776" />
        </svg>
      );
    case "it":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#009246" d="M0 0h213.3v480H0z" />
          <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
          <path fill="#ce2b37" d="M426.7 0H640v480H426.7z" />
        </svg>
      );
    case "cn":
    case "zh":
    case "zh-cn":
    case "zh-tw":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#de2910" d="M0 0h640v480H0z" />
          <path fill="#ffde00" d="M120 70l15 45h48l-39 28 15 45-39-28-39 28 15-45-39-28h48z" />
        </svg>
      );
    case "tr":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#e30a17" d="M0 0h640v480H0z" />
          <circle cx="280" cy="240" r="110" fill="#fff" />
          <circle cx="310" cy="240" r="90" fill="#e30a17" />
          <path fill="#fff" d="M380 215l10 25h25l-20 15 8 25-23-16-23 16 8-25-20-15h25z" />
        </svg>
      );
    case "id":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0 border border-white/10", className)}>
          <path fill="#e70011" d="M0 0h640v240H0z" />
          <path fill="#fff" d="M0 240h640v240H0z" />
        </svg>
      );
    case "vn":
    case "vi":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#da251d" d="M0 0h640v480H0z" />
          <path fill="#ff0" d="M320 120l35 108h114l-92 67 35 108-92-67-92 67 35-108-92-67h114z" />
        </svg>
      );
    case "nl":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#ae1c28" d="M0 0h640v160H0z" />
          <path fill="#fff" d="M0 160h640v160H0z" />
          <path fill="#21468b" d="M0 320h640v160H0z" />
        </svg>
      );
    case "pl":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0 border border-white/10", className)}>
          <path fill="#fff" d="M0 0h640v240H0z" />
          <path fill="#dc143c" d="M0 240h640v240H0z" />
        </svg>
      );
    case "ua":
    case "uk":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#0057b7" d="M0 0h640v240H0z" />
          <path fill="#ffd700" d="M0 240h640v240H0z" />
        </svg>
      );
    case "pk":
    case "ur":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#fff" d="M0 0h160v480H0z" />
          <path fill="#01411c" d="M160 0h480v480H160z" />
          <circle cx="400" cy="240" r="100" fill="#fff" />
          <circle cx="430" cy="220" r="90" fill="#01411c" />
        </svg>
      );
    case "bd":
    case "bn":
      return (
        <svg viewBox="0 0 640 480" width={size} height={(size * 3) / 4} className={cn("rounded-[3px] shadow-sm shrink-0", className)}>
          <path fill="#006a4e" d="M0 0h640v480H0z" />
          <circle cx="280" cy="240" r="130" fill="#f42a41" />
        </svg>
      );
    default:
      return (
        <span className={cn("inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-[9px] font-black uppercase text-cyan-300 font-mono select-none", className)}>
          {code.substring(0, 2).toUpperCase()}
        </span>
      );
  }
}
