"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, Rocket, Compass, LayoutGrid } from "lucide-react";
import { HeroProductWorkspace } from "@/components/home/HeroProductWorkspace";
import { WhatExismicDoes } from "@/components/home/WhatExismicDoes";
import { RealDeliverables } from "@/components/home/RealDeliverables";
import { PracticalWorkflows } from "@/components/home/PracticalWorkflows";
import { ToolDiscovery } from "@/components/home/ToolDiscovery";
import { ActionIntentions } from "@/components/home/ActionIntentions";
import { ProSection } from "@/components/home/ProSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCta } from "@/components/home/FinalCta";
import { LuxuryButton } from "@/components/ui/LuxuryButton";
import { LandingScrollControls } from "@/components/home/LandingScrollControls";
import { SectionLaserBridge } from "@/components/home/SectionLaserBridge";
import { FallingIconsBackground } from "@/components/ui/FallingIconsBackground";
import { motion } from "framer-motion";



export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col w-full overflow-x-hidden bg-[#030306] selection:bg-amber-500/30 font-sans text-zinc-100 relative"
    >

      {/* Dynamic Falling Icons Background (Matching Category & Dashboard Visual Identity) */}
      <FallingIconsBackground variant="landing" showOrbs={false} showGrid={false} />

      {/* 1. HERO SECTION — CLEAN, GROUNDED, PRODUCT-FIRST WITH STAGGERED ENTRANCE */}
      <section id="hero" className="relative flex flex-col items-center justify-center pt-6 sm:pt-10 pb-8 sm:pb-12 px-4 sm:px-6 overflow-hidden scroll-mt-20">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 25%, transparent 80%)'
            }}
          />
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 25%, rgba(56, 189, 248, 0.05) 0%, transparent 45%),
                radial-gradient(circle at 20% 40%, rgba(168, 85, 247, 0.05) 0%, transparent 45%)
              `
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center w-full space-y-4 sm:space-y-6">
          
          {/* Ultra-Premium Eyebrow Badge - Smooth Drop-In */}
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block"
          >
            <div className="group relative inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-[#151006] to-amber-500/15 backdrop-blur-2xl shadow-[0_0_20px_rgba(245,158,11,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-300 hover:border-amber-400/70 hover:shadow-[0_0_28px_rgba(245,158,11,0.35)]">
              {/* Ambient Shimmer Sweep */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div className="w-full h-full bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.15)_50%,transparent_80%)] animate-[shine_3s_linear_infinite]" />
              </div>

              {/* Pulsing Luminous Beacon */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,1)]" />
              </span>

              {/* Badge Title */}
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.18em] bg-gradient-to-r from-amber-100 via-white to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                Exismic
              </span>
            </div>
          </motion.div>

          {/* Main Primary Heading with Radiant Gradient - Staggered Float Up */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3 max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.2] sm:leading-[1.16] bg-[linear-gradient(110deg,#ffffff_0%,#ffffff_32%,#fef08a_60%,#f59e0b_85%,#ea580c_100%)] bg-clip-text text-transparent drop-shadow-[0_4px_35px_rgba(245,158,11,0.22)] py-1 pb-3 sm:pb-4">
              Create, edit, and get things done in one place.
            </h1>

            {/* Natural Supporting Copy */}
            <motion.p 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg md:text-xl text-zinc-400 font-normal max-w-2xl mx-auto leading-relaxed"
            >
              Tools for images, video, audio, documents, writing, code, and everyday creative work.
            </motion.p>
          </motion.div>

          {/* Primary Action Buttons - Staggered Slide In */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full pt-1"
          >
            <LuxuryButton
              href="/tools"
              title="Start creating free"
              centerMobileText
              subtitle="Free access • No card required"
              theme="gold"
              icon={<Rocket size={17} className="text-amber-300" />}
            />

            <LuxuryButton
              href="#tools"
              title="Explore all tools"
              centerMobileText
              subtitle="Browse 50+ creative tools"
              theme="cyan"
              icon={<LayoutGrid size={17} className="text-cyan-300" />}
            />
          </motion.div>

          {/* Factual Reassurance Row - Soft Fade In */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400 font-medium pt-1"
          >
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Free to start
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Make and download files directly
            </span>
          </motion.div>

          {/* PRODUCT VISUAL HERO: ACTUAL EXISMIC WORKSPACE PREVIEW - Smooth Zoom & De-blur */}
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.98, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.85, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <HeroProductWorkspace />
          </motion.div>

        </div>
      </section>

      {/* 2. WHAT EXISMIC ACTUALLY DOES (CREATE, EDIT, BUILD, WORK) */}
      <SectionLaserBridge variant="multi" />
      <WhatExismicDoes />

      {/* 3. REAL DELIVERABLES (REAL FILES READY TO USE) */}
      <SectionLaserBridge variant="cyan-purple" />
      <RealDeliverables />

      {/* 4. PRACTICAL WORKFLOWS (HOW TOOLS FIT TOGETHER) */}
      <SectionLaserBridge variant="purple-amber" />
      <PracticalWorkflows />

      {/* 5. TOOL DISCOVERY (8 CURATED POPULAR TOOLS WITH FILTER TABS) */}
      <SectionLaserBridge variant="multi" />
      <ToolDiscovery />

      {/* 6. WHAT ARE YOU TRYING TO DO? (ACTION STARTING POINTS) */}
      <SectionLaserBridge variant="emerald-cyan" />
      <ActionIntentions />

      {/* 7. ACCESS & PLANS: UNIFIED FREE VS PRO COMPARISON */}
      <SectionLaserBridge variant="purple-amber" />
      <ProSection />

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <SectionLaserBridge variant="multi" />
      <FaqSection />

      {/* 10. FINAL CALL TO ACTION WITH LASER HORIZON BRIDGE */}
      <SectionLaserBridge variant="multi" />
      <FinalCta />

      {/* 11. DUAL SCROLL CONTROLS (SCROLL UP & SCROLL DOWN) */}
      <LandingScrollControls />

    </div>
  );
}
