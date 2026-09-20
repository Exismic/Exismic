"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  ShieldCheck,
  Layers,
  Upload,
  Sliders,
  Download,
  BookOpen,
  ChevronDown,
  Check,
  ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "@/data/tools";

interface BackgroundRemoverLivingGuideProps {
  toolName: string;
  toolDescription: string;
  features: string[];
  howToSteps: string[];
  faqs: Array<{ question: string; answer: string }>;
  showRelatedTools?: boolean;
  relatedTools?: Array<{
    id: string;
    name: string;
    description: string;
    href: string;
    icon?: string;
  }>;
  categoryName?: string;
}

export function BackgroundRemoverLivingGuide({
  toolName = "Background Remover",
  toolDescription,
  features,
  howToSteps,
  faqs,
  showRelatedTools = false,
  relatedTools = [],
  categoryName = "Image Tools",
}: BackgroundRemoverLivingGuideProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse on hero container for ambient spotlight
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // 4 Living Value Cards styled strictly to Image Category (Cyan Palette)
  const valueProps = [
    {
      title: "100% Private & Secure",
      badge: "On-Device Only",
      desc: "Everything runs directly on your device. Your photos are never saved, uploaded, or shared with anyone.",
      icon: ShieldCheck,
    },
    {
      title: "Clean & Crisp Edges",
      badge: "Smooth Cutouts",
      desc: "Smooth, accurate cutouts around hair, clothing, and fine details with zero blurry outlines or jagged borders.",
      icon: Layers,
    },
    {
      title: "Fast 1-Click Results",
      badge: "Under 3 Seconds",
      desc: "Removes backgrounds automatically in seconds with no software to install or account needed.",
      icon: Zap,
    },
    {
      title: "Zero Watermarks",
      badge: "100% Free Forever",
      desc: "Completely free with no watermarks. Download full-quality transparent PNGs ready to use anywhere.",
      icon: CheckCircle2,
    },
  ];

  // 3-Step Living Workflow (All aligned to Image Category Cyan Palette)
  const steps = [
    {
      stepNumber: "01",
      stepBadge: "Step 01 • Drag & Drop",
      title: "Upload Your Photo",
      desc: "Choose any photo from your phone or computer, or simply drag and drop it onto the canvas above.",
      icon: Upload,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      stepNumber: "02",
      stepBadge: "Step 02 • Automatic",
      title: "Automatic Cutout",
      desc: "The tool automatically detects your main subject and cleanly cuts out the background in seconds.",
      icon: Sliders,
      gradient: "from-cyan-400 to-teal-500",
    },
    {
      stepNumber: "03",
      stepBadge: "Step 03 • Ready to Use",
      title: "Download Transparent Image",
      desc: "Preview your clean cutout against any background and download your transparent PNG with zero watermarks.",
      icon: Download,
      gradient: "from-sky-500 to-cyan-600",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6">
      
      {/* =========================================================
          1. HERO LIVING CONTAINER (BORDER BEAM CIRCLING ENTIRE CARD)
      ========================================================== */}
      <div className="relative p-[1.5px] overflow-hidden rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] group/beam">
        {/* Animated Laser Beam Circling the Entire Card Perimeter */}
        <div 
          className="absolute inset-[-150%] animate-[spin_5s_linear_infinite] pointer-events-none will-change-transform"
          style={{
            background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(6,182,212,0.1) 295deg, #06b6d4 325deg, #22d3ee 348deg, #a5f3fc 356deg, transparent 360deg)",
          }}
        />
        {/* Glowing Bloom following the circling laser beam */}
        <div 
          className="absolute inset-[-150%] animate-[spin_5s_linear_infinite] pointer-events-none blur-md opacity-70 will-change-transform"
          style={{
            background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #06b6d4 325deg, #22d3ee 348deg, transparent 360deg)",
          }}
        />

        {/* Inner Card Content */}
        <div 
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          className="group relative overflow-hidden rounded-[calc(1.5rem-1.5px)] border border-white/[0.06] bg-[#070914]/95 p-6 sm:p-7 lg:p-8 backdrop-blur-2xl transition-all"
        >
          {/* Ambient Breathing Lighting (Cyan category theme) */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none animate-pulse-glow" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none animate-pulse-glow" />

          {/* Interactive Mouse Spotlight */}
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[calc(1.5rem-1.5px)]"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.08), transparent 60%)`,
            }}
          />

          <div className="relative z-10 space-y-6">
            
            {/* Header: Badges & Title closely connected with zero awkward gaps */}
            <div className="space-y-2.5 max-w-3xl">
              
              {/* Top Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-0.5 text-[11px] font-semibold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
                  </span>
                  <span>Guide & Overview</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-500/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300/90">
                  <Check size={11} className="text-cyan-400" />
                  <span>100% Free • No Sign-Up</span>
                </div>
              </div>

              {/* Main Title & Description */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 tracking-tight leading-tight">
                About {toolName}
              </h2>
              <p className="text-sm sm:text-base font-normal text-zinc-300 leading-relaxed pt-0.5">
                The easiest way to remove backgrounds from any photo in seconds. Whether you need clean white backgrounds for online shop products, transparent portraits for profiles, or cutouts for graphics and social media, Background Remover gives you crisp results—completely free, right in your browser.
              </p>
            </div>

            {/* 4 Living Value Cards (Unified to Image Category Cyan Palette) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              {valueProps.map((vp, idx) => {
                const Icon = vp.icon;
                return (
                  <div
                    key={idx}
                    className="group/card relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070914]/90 p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/50 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(6,182,212,0.18)]"
                  >
                    {/* Top Specular Rim Highlight */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />

                    {/* Ambient Card Cyan Spotlight on Hover */}
                    <div
                      className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                      style={{
                        background: "radial-gradient(280px circle at top left, rgba(6, 182, 212, 0.16), transparent 70%)",
                      }}
                    />

                    <div className="relative z-10 flex flex-col justify-between h-full gap-3.5">
                      <div className="flex items-center justify-between">
                        {/* Icon with Cyan Category Accent & Hover Bounce */}
                        <div className="size-9 rounded-xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/card:scale-110 group-hover/card:-rotate-3 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                          <Icon className="w-4 h-4 text-cyan-300" />
                        </div>

                        {/* Live Cyan Radar Beacon Badge */}
                        <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/[0.08] border border-cyan-400/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-200">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
                          </span>
                          <span>{vp.badge}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-white group-hover/card:text-cyan-200 transition-colors">
                          {vp.title}
                        </div>
                        <div className="text-xs text-zinc-400 leading-relaxed mt-1">
                          {vp.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================
          2. 3-STEP HOW TO USE WORKFLOW (WITH CONNECTING LASER CONDUIT)
      ========================================================== */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
              How to Use {toolName} in 3 Simple Steps
            </h3>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
              Fast and easy from start to finish
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Connecting Cyan Laser Conduit Line on Desktop */}
          <div className="hidden md:block absolute top-12 left-[18%] right-[18%] h-[2px] bg-gradient-to-r from-cyan-500/30 via-cyan-400/50 to-cyan-500/30 z-0 pointer-events-none" />
          <div className="hidden md:block absolute top-12 left-[18%] right-[18%] h-[2px] overflow-hidden z-0 pointer-events-none">
            <div className="w-24 h-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-shimmer" />
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="group relative z-10 flex flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#070914]/90 p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/50 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(6,182,212,0.18)] shadow-xl"
              >
                {/* Specular Top Rim */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("size-9 rounded-xl bg-gradient-to-br text-white font-black text-xs flex items-center justify-center shadow-lg border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]", step.gradient)}>
                        {step.stepNumber}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                        {step.stepBadge}
                      </span>
                    </div>
                    <div className="size-8 rounded-lg border border-cyan-400/30 bg-cyan-500/15 text-cyan-300 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Icon size={15} className="text-cyan-300" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-cyan-100 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-xs font-medium leading-relaxed text-zinc-300 mt-2">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          3. KEY FEATURES GRID (WHY CHOOSE BACKGROUND REMOVER)
      ========================================================== */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
              Why Choose Exismic {toolName}?
            </h3>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
              Simple, reliable, and completely free to use
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-[#070914]/80 p-6 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-500/[0.04] hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]"
            >
              <div className="size-8 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <CheckCircle2 size={18} />
              </div>
              <p className="text-sm font-medium leading-relaxed text-zinc-200">{feat}</p>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================
          4. FREQUENTLY ASKED QUESTIONS (INTERACTIVE ACCORDION)
      ========================================================== */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
              Frequently Asked Questions (FAQ)
            </h3>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
              Answers to common questions about {toolName}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "rounded-2xl border transition-all duration-300 overflow-hidden",
                  isOpen
                    ? "border-cyan-400/50 bg-cyan-500/[0.04] shadow-[0_0_25px_rgba(6,182,212,0.12)]"
                    : "border-white/[0.08] bg-[#070914]/80 hover:border-cyan-400/30 hover:bg-white/[0.02]"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 pr-4">
                    <div className={cn(
                      "size-7 rounded-lg text-xs font-mono font-black flex items-center justify-center shrink-0 border transition-all duration-300",
                      isOpen
                        ? "bg-cyan-400/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-105"
                        : "bg-white/[0.05] border-white/10 text-zinc-400"
                    )}>
                      Q
                    </div>
                    <h4 className={cn(
                      "text-base font-bold transition-colors duration-200",
                      isOpen ? "text-cyan-100" : "text-white"
                    )}>
                      {faq.question}
                    </h4>
                  </div>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "text-zinc-400 transition-transform duration-300 ease-in-out shrink-0",
                      isOpen && "rotate-180 text-cyan-300"
                    )}
                  />
                </button>

                {/* Silky Smooth Accordion Body (CSS Grid Rows 0fr -> 1fr) */}
                <div
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
                      <p className="text-sm font-medium leading-relaxed text-zinc-300 pl-10 sm:pl-11 border-t border-white/[0.06] pt-3.5">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          5. RELATED TOOLS (IMPROVED HIGH-END SUGGESTIONS UI)
      ========================================================== */}
      {showRelatedTools && relatedTools.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#070914]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Top Specular Rim */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent pointer-events-none" />

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Explore More {categoryName}
                </h3>
                <p className="text-xs font-semibold text-zinc-400">
                  Popular companion tools to edit and enhance your pictures
                </p>
              </div>
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 px-3.5 py-1.5 rounded-full transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] self-start sm:self-auto group"
            >
              <span>View All Tools</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* 4 Enhanced Suggestion Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedTools.map((relTool) => {
              const ToolIcon = (relTool.icon && ICON_MAP[relTool.icon as keyof typeof ICON_MAP]) || ImageIcon || Layers;
              return (
                <Link
                  key={relTool.id}
                  href={relTool.href}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090d1f]/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/50 hover:bg-[#0c1228]/90 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(6,182,212,0.18)]"
                >
                  {/* Top Specular Rim */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none" />

                  {/* Ambient Hover Spotlight */}
                  <div
                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "radial-gradient(280px circle at top left, rgba(6, 182, 212, 0.16), transparent 70%)",
                    }}
                  />

                  <div className="relative z-10 space-y-3.5">
                    {/* Top Row: 3D Tool Icon & Free Badge */}
                    <div className="flex items-center justify-between">
                      <div className="size-10 rounded-xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                        <ToolIcon size={18} className="text-cyan-300" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/[0.08] border border-cyan-400/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-200">
                        <span className="size-1 rounded-full bg-cyan-400" />
                        <span>Instant</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                        {relTool.name}
                      </h4>
                      <p className="text-xs font-medium text-zinc-400 leading-relaxed line-clamp-2 mt-1">
                        {relTool.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Link at Bottom */}
                  <div className="relative z-10 mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-cyan-400 group-hover:text-cyan-300">
                    <span>Open Tool</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
