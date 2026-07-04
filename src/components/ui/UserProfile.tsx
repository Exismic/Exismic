"use client";

import React from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { VerifiedTick } from "../ui/VerifiedTick";
import { AvatarWithFrame } from "./AvatarWithFrame";
import { PremiumName } from "./PremiumName";
import { ProBadge } from "./ProBadge";

interface UserProfileProps {
  fullName: string;
  email?: string;
  avatarUrl?: string;
  isPro: boolean;
  frameId?: string;
  gradientId?: string | null;
  variant?: "sidebar" | "menu-trigger" | "menu-header";
  className?: string;
  showSettings?: boolean;
}

export function UserProfile({
  fullName,
  email = "",
  avatarUrl,
  isPro,
  frameId,
  gradientId,
  variant = "sidebar",
  className = "",
  showSettings = true,
}: UserProfileProps) {
  // Safe uppercase name
  const displayName = fullName.toUpperCase();

  // Determine subtext
  const subtext = isPro ? "LUMORA PRO" : "LUMORA EXPLORER";

  if (variant === "sidebar") {
    return (
      <div 
        className={cn(
          "relative group rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] ease-[cubic-bezier(0.16,1,0.3,1)]",
          className
        )}
      >
        {/* Outer luxurious ambient backdrop glow (subtle color glow that wakes up on hover) */}
        <div 
          className={cn(
            "absolute -inset-2 rounded-[24px] transition-all duration-700 blur-[16px] -z-10 pointer-events-none",
            isPro 
              ? "bg-gradient-to-r from-purple-600/10 via-cyan-500/10 to-pink-500/10 opacity-60 group-hover:opacity-100 group-hover:scale-105 group-hover:from-purple-600/35 group-hover:via-cyan-500/30 group-hover:to-pink-500/35" 
              : "bg-white/[0.01] opacity-20 group-hover:opacity-100 group-hover:bg-white/[0.04]"
          )}
        />

        {/* Outer gradient border layer that shines on hover */}
        <div className={cn(
          "absolute inset-0 rounded-2xl p-[1px] -z-5 pointer-events-none transition-all duration-700",
          isPro 
            ? "bg-gradient-to-br from-white/[0.08] to-white/[0.02] group-hover:from-purple-500/50 group-hover:via-cyan-400/40 group-hover:to-pink-500/50"
            : "bg-gradient-to-br from-white/[0.06] to-white/[0.01] group-hover:from-white/20 group-hover:to-white/5"
        )} />
        
        {/* Inner Card */}
        <div 
          className={cn(
            "relative flex items-center gap-3.5 p-3.5 rounded-[15px] transition-all duration-500 overflow-hidden shadow-2xl",
            "bg-[#07070b]/60 backdrop-blur-xl",
            isPro 
              ? "shadow-[0_4px_30px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.06)] group-hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.22),0_10px_35px_-10px_rgba(6,182,212,0.18),inset_0_1px_1px_rgba(255,255,255,0.08)]" 
              : "shadow-[0_4px_25px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.03)] group-hover:shadow-[0_15px_30px_-10px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.05)]"
          )}
        >
          {/* Metallic Sweep Shine Effect (Premium reflections on hover) */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out pointer-events-none" />

          {/* Avatar Area with double ring glows & status beacons */}
          <div className="relative shrink-0 select-none">
            <AvatarWithFrame 
              avatarUrl={avatarUrl}
              displayName={displayName}
              isPro={isPro}
              frameId={frameId}
              size="md"
            />
            
            {/* Active Status Beacon - Emerald/Cyan Pulsing Indicator */}
            <span className={cn(
              "absolute -top-1 -right-1 w-3.5 h-3.5 border-[2.5px] border-[#07070b] rounded-full z-20 shadow-md flex items-center justify-center",
              isPro 
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" 
                : "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            )}>
              <span className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-75",
                isPro ? "bg-emerald-400" : "bg-cyan-400"
              )} />
            </span>

            <VerifiedTick className="absolute -bottom-2 -right-2 z-20 shadow-lg" size="sm" />
          </div>

          {/* Name & Plan Info with luxurious high-contrast typography */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            <div className="text-[14.5px] font-black font-sans text-zinc-100 tracking-wide leading-none truncate group-hover:text-white transition-colors duration-300 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.6)]">
              <PremiumName name={displayName} isPro={isPro} gradientId={gradientId} />
            </div>
            <div className="flex items-center gap-1.5">
              {isPro ? (
                <ProBadge size="sm" />
              ) : (
                <span className="text-[9px] font-extrabold text-zinc-500 tracking-[0.15em] leading-none uppercase select-none">
                  {subtext}
                </span>
              )}
            </div>
          </div>

          {/* Settings Trigger with luxury jewel glass container */}
          {showSettings && (
            <Link 
              href="/account/settings" 
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 transition-all duration-500 border shrink-0 shadow-inner group/settings relative overflow-hidden",
                "bg-white/[0.02] border-white/[0.05] hover:text-white",
                isPro 
                  ? "hover:bg-gradient-to-br hover:from-purple-500/15 hover:to-pink-500/15 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                  : "hover:bg-white/10 hover:border-white/20"
              )}
            >
              {/* Settings Hover Ambient Glow */}
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_60%)] opacity-0 group-hover/settings:opacity-100 transition-opacity duration-500" />
              <Settings size={14.5} className="group-hover/settings:rotate-180 group-hover/settings:scale-110 transition-all duration-700 ease-out relative z-10" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (variant === "menu-trigger") {
    return (
      <div 
        className={cn(
          "flex items-center gap-3.5 pl-4.5 pr-2.5 py-1.5 rounded-full transition-all duration-500 border overflow-hidden relative cursor-pointer group",
          "bg-white/[0.01] backdrop-blur-xl border-white/[0.06] hover:bg-[#0c0c11]/85 hover:border-purple-500/30",
          isPro && "hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]",
          className
        )}
      >
        {/* Shine reflect on navbar trigger too! */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out pointer-events-none" />

        <div className="hidden md:flex flex-col items-end justify-center min-w-0 pr-1 space-y-1">
          <span className="text-xs font-sans tracking-wide leading-none truncate uppercase">
            <PremiumName name={displayName.split(" ")[0]} isPro={isPro} gradientId={gradientId} className="font-extrabold text-zinc-100 group-hover:text-white transition-colors duration-300" />
          </span>
          {isPro ? (
            <ProBadge size="sm" />
          ) : (
            <span className="text-[8px] font-extrabold text-zinc-500 tracking-wider leading-none uppercase">
              EXPLORER
            </span>
          )}
        </div>

        <div className="relative select-none shrink-0">
          <AvatarWithFrame 
            avatarUrl={avatarUrl}
            displayName={displayName}
            isPro={isPro}
            frameId={frameId}
            size="sm"
          />
          {/* Active Status Beacon - pulsing */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-[1.5px] border-[#09090b] rounded-full z-20 shadow-[0_0_8px_#10b981] flex items-center justify-center">
            <span className="absolute inset-0 rounded-full animate-ping opacity-60 bg-emerald-400" />
          </span>
        </div>
      </div>
    );
  }

  // menu-header
  return (
    <div className={cn("p-8 pb-6 text-center space-y-6 flex flex-col items-center relative overflow-hidden", className)}>
      {/* Cinematic animated atmospheric glows reflecting the user's active theme */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.08)_0%,transparent_60%)] animate-pulse duration-[6000ms]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] via-transparent to-black/40" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative inline-block select-none z-10 scale-105 transition-transform duration-500 hover:scale-110">
        {/* Soft magical floating aura ring behind avatar */}
        <div className="absolute -inset-4 bg-linear-to-tr from-accent-purple/10 via-accent-cyan/5 to-pink-500/10 rounded-full opacity-60 blur-xl animate-pulse" />
        
        <AvatarWithFrame 
          avatarUrl={avatarUrl}
          displayName={displayName}
          isPro={isPro}
          frameId={frameId}
          size="xl"
        />
        <VerifiedTick className="absolute -bottom-1 -right-1 z-20 shadow-xl border-2 border-zinc-950 rounded-full" size="md" />
      </div>
      
      <div className="space-y-2 relative z-10">
        <h3 className="text-2xl font-sans tracking-wide uppercase leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <PremiumName name={displayName} isPro={isPro} gradientId={gradientId} className="font-extrabold text-white tracking-tighter" />
        </h3>
        <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase opacity-80 select-all font-mono bg-white/[0.02] border border-white/5 px-3 py-1 rounded-md">{email}</p>
      </div>

      <div className="pt-2 relative z-10">
        {isPro ? (
          <ProBadge size="md" />
        ) : (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-900 border border-white/5">
             <span className="text-[9.5px] font-extrabold text-zinc-400 uppercase tracking-[0.15em]">{subtext}</span>
          </div>
        )}
      </div>
    </div>
  );
}
