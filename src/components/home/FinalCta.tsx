"use client";

import React from "react";
import { Lock, CheckCircle2, Zap, Rocket, LayoutGrid } from "lucide-react";
import { LuxuryButton } from "@/components/ui/LuxuryButton";

export function FinalCta() {
  return (
    <section id="final-cta" className="pt-2 pb-8 sm:pt-3 sm:pb-12 px-4 sm:px-6 max-w-5xl mx-auto w-full relative scroll-mt-24">
      
      {/* Grand Container with 2.5px Multi-Category Gradient Border Mix */}
      <div className="group relative p-[2.5px] rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-amber-400 via-cyan-400 via-purple-500 to-emerald-400 shadow-[0_0_50px_rgba(245,158,11,0.22),0_0_50px_rgba(6,182,212,0.22)] hover:shadow-[0_0_75px_rgba(245,158,11,0.32),0_0_75px_rgba(6,182,212,0.32)] transition-all duration-700">
        
        {/* Inner Dark Shell */}
        <div className="relative h-full w-full p-8 sm:p-12 md:p-14 rounded-[calc(2.5rem-2.5px)] bg-gradient-to-b from-[#0e0f17]/98 via-[#0a0a10]/98 to-[#06060a]/98 backdrop-blur-3xl overflow-hidden text-center space-y-6 sm:space-y-8">
          
          {/* Continuous Hover Shine Sweep — elevated z-30 pointer-events-none so it sweeps over the entire card from top to bottom, including over the bottom buttons and badges */}
          <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-30">
            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
          </div>

          {/* 4 Corner Ambient Mesh Glow Auras */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
            {/* Top-Left: Amber */}
            <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full blur-[90px] bg-amber-500/25 opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            {/* Top-Right: Cyan */}
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-[90px] bg-cyan-500/25 opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            {/* Bottom-Left: Emerald */}
            <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full blur-[90px] bg-emerald-500/20 opacity-35 group-hover:opacity-55 transition-opacity duration-700" />
            {/* Bottom-Right: Purple */}
            <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full blur-[90px] bg-purple-500/25 opacity-35 group-hover:opacity-55 transition-opacity duration-700" />
          </div>

          {/* Header */}
          <div className="space-y-2.5 max-w-xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>Get Started Today</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.18] sm:leading-[1.15] py-0.5 pb-2">
              Ready to make{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-400 to-purple-400 inline-block pb-1">
                something?
              </span>
            </h2>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Pick any tool, create or edit your file, and download the finished result directly to your computer.
            </p>
          </div>

          {/* Action Buttons with Squircle Arrow Frames */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full relative z-10">
            <LuxuryButton
              href="/tools"
              title="Start creating free"
              subtitle="Free access • No card required"
              theme="gold"
              icon={<Rocket size={17} className="text-amber-300" />}
            />

            <LuxuryButton
              href="#tools"
              title="Explore all tools"
              subtitle="Browse 50+ creative tools"
              theme="cyan"
              icon={<LayoutGrid size={17} className="text-cyan-300" />}
            />
          </div>

          {/* Bottom Trust Row in Jewel Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>100% private in browser</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Free daily credits</span>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
