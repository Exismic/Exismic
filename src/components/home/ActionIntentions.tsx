"use client";

import React from "react";
import Link from "next/link";
import { Palette, Scissors, FileSpreadsheet, Code2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const INTENTIONS = [
  {
    title: "I need to create something",
    detail: "Brand logos, original art, video scripts, and social content.",
    href: "/category/ai",
    badgeText: "CREATE",
    tags: ["Logo Maker", "AI Art", "Scripts"],
    icon: Palette,
    accentColor: "#f59e0b",
    cardBorder: "border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:border-amber-300 hover:shadow-[0_0_45px_rgba(245,158,11,0.55)]",
    cardBg: "bg-gradient-to-b from-[#181106]/95 via-[#0e0a03]/95 to-[#080501]/95",
    buttonGrad: "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-amber-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]",
    buttonTextDark: true,
    badgeStyle: "bg-amber-400/15 border-amber-400/50 text-amber-300",
    dotColor: "#f59e0b",
  },
  {
    title: "I need to edit something",
    detail: "Remove photo backgrounds, isolate vocals, and trim video clips.",
    href: "/category/image",
    badgeText: "EDIT",
    tags: ["Background Eraser", "Vocal Split", "Video Trim"],
    icon: Scissors,
    accentColor: "#06b6d4",
    cardBorder: "border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:border-cyan-300 hover:shadow-[0_0_45px_rgba(6,182,212,0.55)]",
    cardBg: "bg-gradient-to-b from-[#061418]/95 via-[#030c0e]/95 to-[#010607]/95",
    buttonGrad: "bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]",
    badgeStyle: "bg-cyan-400/15 border-cyan-400/50 text-cyan-300",
    dotColor: "#06b6d4",
  },
  {
    title: "I need to process a lot of files",
    detail: "Generate batch QR codes from CSV spreadsheets or compress photos.",
    href: "/tools/qr-code?mode=bulk",
    badgeText: "FILES",
    tags: ["Bulk QR Codes", "Photo Compress", "PDF OCR"],
    icon: FileSpreadsheet,
    accentColor: "#10b981",
    cardBorder: "border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-emerald-300 hover:shadow-[0_0_45px_rgba(16,185,129,0.55)]",
    cardBg: "bg-gradient-to-b from-[#06180f]/95 via-[#030e09]/95 to-[#010704]/95",
    buttonGrad: "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    badgeStyle: "bg-emerald-400/15 border-emerald-400/50 text-emerald-300",
    dotColor: "#10b981",
  },
  {
    title: "I need to build something",
    detail: "Design website blueprints and export clean Next.js 15 repositories.",
    href: "/category/developer",
    badgeText: "BUILD",
    tags: ["Landing to Next.js", "SQL Builder", "Regex"],
    icon: Code2,
    accentColor: "#a855f7",
    cardBorder: "border-2 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:border-purple-300 hover:shadow-[0_0_45px_rgba(168,85,247,0.55)]",
    cardBg: "bg-gradient-to-b from-[#100818]/95 via-[#0a040e]/95 to-[#050207]/95",
    buttonGrad: "bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    badgeStyle: "bg-purple-400/15 border-purple-400/50 text-purple-300",
    dotColor: "#a855f7",
  },
];

export function ActionIntentions() {
  return (
    <section id="actions" className="pt-5 pb-6 sm:pt-6 sm:pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full scroll-mt-24">
      {/* Big Box Container with 2.5px Multi-Category Gradient Border Mix */}
      <div className="group relative p-[2.5px] rounded-3xl sm:rounded-[2.25rem] bg-gradient-to-br from-amber-400 via-cyan-400 via-emerald-400 to-purple-500 shadow-[0_0_40px_rgba(245,158,11,0.2),0_0_40px_rgba(6,182,212,0.2),0_0_40px_rgba(16,185,129,0.2),0_0_40px_rgba(168,85,247,0.2)] hover:shadow-[0_0_65px_rgba(245,158,11,0.3),0_0_65px_rgba(6,182,212,0.3),0_0_65px_rgba(16,185,129,0.3),0_0_65px_rgba(168,85,247,0.3)] transition-all duration-700">
        
        {/* Inner Dark Shell */}
        <div className="relative h-full w-full p-6 sm:p-8 md:p-10 rounded-[calc(2.25rem-2.5px)] bg-gradient-to-b from-[#0e0f17]/98 via-[#0a0a10]/98 to-[#06060a]/98 backdrop-blur-3xl overflow-hidden">
          
          {/* Continuous Hover Shine Sweep — elevated z-30 pointer-events-none */}
          <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-30">
            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
          </div>

          {/* 4 Corner Ambient Mesh Glow Auras (Mixing Amber, Cyan, Emerald, Purple) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
            {/* Top-Left: Amber (Create) */}
            <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full blur-[90px] bg-amber-500/25 opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            {/* Top-Right: Cyan (Edit) */}
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-[90px] bg-cyan-500/25 opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            {/* Bottom-Left: Emerald (Batch) */}
            <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full blur-[90px] bg-emerald-500/25 opacity-35 group-hover:opacity-55 transition-opacity duration-700" />
            {/* Bottom-Right: Purple (Build) */}
            <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full blur-[90px] bg-purple-500/25 opacity-35 group-hover:opacity-55 transition-opacity duration-700" />
          </div>

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-1.5 relative z-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
              START HERE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-[1.18] sm:leading-[1.15] py-0.5 pb-2">
              What are you{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-400 via-emerald-400 to-purple-400 inline-block pb-1">
                trying to do?
              </span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Jump straight into the tools designed for what you need to do.
            </p>
          </div>

          {/* 4 Category Cards Grid - Tight, balanced, zero-void layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
            {INTENTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "group/card relative p-5 sm:p-5.5 rounded-[1.75rem] flex flex-col transition-all duration-300 transform-gpu hover:-translate-y-1.5 active:translate-y-0 hover:shadow-2xl overflow-hidden cursor-pointer",
                    item.cardBg,
                    item.cardBorder
                  )}
                >
                  {/* Continuous Hover Shine Sweep */}
                  <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10">
                    <div className="absolute inset-0 translate-x-[-150%] group-hover/card:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  {/* Ambient Watermark Icon in Top Right Corner */}
                  <Icon 
                    className="absolute -top-4 -right-4 w-28 h-28 opacity-[0.06] group-hover/card:opacity-[0.14] transition-opacity duration-500 stroke-[1.2] pointer-events-none select-none"
                    style={{ color: item.accentColor }}
                  />

                  {/* Colored Micro Dot Matrix Pattern */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                    <div 
                      className="absolute -top-10 -left-10 w-44 h-44 rounded-full blur-[45px] opacity-30 group-hover/card:opacity-55 transition-opacity duration-700"
                      style={{ backgroundColor: item.accentColor }}
                    />
                    <div 
                      className="absolute inset-0 opacity-20 group-hover/card:opacity-45 transition-opacity duration-500"
                      style={{
                        backgroundImage: `radial-gradient(${item.dotColor} 1.5px, transparent 1.5px)`,
                        backgroundSize: "20px 20px",
                      }}
                    />
                  </div>

                  {/* Top Row: Luxury Squircle Icon with Conic Spinning Neon Ring + Category Badge */}
                  <div className="relative z-10 flex items-start justify-between gap-3 mb-3">
                    {/* Squircle Icon with Conic Gradient Ring */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 shadow-xl bg-[#0b0c12] border border-white/10 group-hover/card:rotate-6 group-hover/card:scale-105 shrink-0">
                      <div 
                        className="absolute inset-[-100%] animate-spin-smooth opacity-80"
                        style={{
                          background: `conic-gradient(from 0deg, transparent 0%, ${item.accentColor} 30%, transparent 60%)`,
                        }}
                      />
                      <div className="absolute inset-[1.5px] rounded-[14.5px] bg-[#0b0c12] z-0" />
                      <Icon 
                        className="w-5.5 h-5.5 transition-all duration-300 relative z-10 group-hover/card:scale-110"
                        style={{ color: item.accentColor }}
                        strokeWidth={2}
                      />
                    </div>

                    {/* Category Badge on Top Right */}
                    <div className={cn(
                      "px-2.5 py-1 rounded-xl border font-mono text-[10px] font-bold uppercase tracking-wider shrink-0",
                      item.badgeStyle
                    )}>
                      {item.badgeText}
                    </div>
                  </div>

                  {/* Details Wrapper */}
                  <div className="relative z-10 flex-1 flex flex-col">
                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight group-hover/card:text-zinc-100 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-normal line-clamp-2 min-h-[34px]">
                        {item.detail}
                      </p>
                    </div>

                    {/* Key Workspace Tool Pills (Fills empty space with real value, zero void gap) */}
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-white/[0.06] min-h-[44px] items-start content-start">
                      {item.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-mono text-zinc-300 bg-white/[0.04] border border-white/[0.06] group-hover/card:border-white/15 transition-colors whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Full-Width Saturated Launch Button - Pinned to bottom */}
                  <div className="relative z-10 mt-3 pt-1">
                    <div
                      className={cn(
                        "relative w-full py-2.5 px-4 rounded-full flex items-center justify-center gap-2 uppercase tracking-wider text-xs transition-all duration-300 transform-gpu group-hover/card:scale-[1.02] active:scale-95 shadow-lg overflow-hidden antialiased",
                        item.buttonGrad,
                        item.buttonTextDark ? "text-amber-950 font-black" : "text-white font-bold"
                      )}
                    >
                      <div className="absolute inset-0 rounded-full pointer-events-none bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.35)_50%,transparent_75%)] bg-[length:200%_100%] opacity-0 group-hover/card:opacity-100 group-hover/card:animate-[shine_2.5s_linear_infinite] transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center gap-1.5">
                        Explore tools
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/card:translate-x-1" strokeWidth={2.2} />
                      </span>
                    </div>
                  </div>

                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
