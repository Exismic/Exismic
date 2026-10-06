"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eraser, 
  FolderArchive, 
  FileSpreadsheet, 
  Code2, 
  Download, 
  Check, 
  ArrowRight, 
  Eye, 
  FileCode, 
  SlidersHorizontal,
  Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LuxuryButton, LuxuryButtonTheme } from "@/components/ui/LuxuryButton";

type WorkspaceToolId = "cutout" | "brand-kit" | "bulk-qr" | "code-export";

interface WorkspaceTool {
  id: WorkspaceToolId;
  name: string;
  tabLabel: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  deliverableIcon: React.ComponentType<{ className?: string }>;
  deliverableFile: string;
  deliverableSize: string;
  toolUrl: string;
  ctaText: string;
  specsSnippet: string;
}

const WORKSPACE_TOOLS: WorkspaceTool[] = [
  {
    id: "cutout",
    name: "Background Remover",
    tabLabel: "Cutout",
    category: "Images",
    icon: Eraser,
    deliverableIcon: Eraser,
    deliverableFile: "product-cutout-4k.png",
    deliverableSize: "2.4 MB · Transparent",
    toolUrl: "/tools/image/eraser",
    ctaText: "Open tool",
    specsSnippet: "Instant transparent cutout • High resolution PNG",
  },
  {
    id: "brand-kit",
    name: "Brand Kit Generator",
    tabLabel: "Brand Kit",
    category: "Branding",
    icon: FolderArchive,
    deliverableIcon: FolderArchive,
    deliverableFile: "vanguard-brand-kit.zip",
    deliverableSize: "5.8 MB · Complete Pack",
    toolUrl: "/tools/ai/logo?pack=brand-kit",
    ctaText: "Open tool",
    specsSnippet: "Vector logo • Favicons • Style guide (.ZIP)",
  },
  {
    id: "bulk-qr",
    name: "Bulk QR Spreadsheet",
    tabLabel: "Bulk QR",
    category: "Work with files",
    icon: FileSpreadsheet,
    deliverableIcon: FileSpreadsheet,
    deliverableFile: "restaurant-tables-qr.zip",
    deliverableSize: "1.2 MB · 50 Codes",
    toolUrl: "/tools/qr-code?mode=bulk",
    ctaText: "Open tool",
    specsSnippet: "50+ verified QR codes • Ready to print (.ZIP)",
  },
  {
    id: "code-export",
    name: "Website to Next.js 15",
    tabLabel: "Next.js 15",
    category: "Code & Web",
    icon: Code2,
    deliverableIcon: Code2,
    deliverableFile: "saas-landing-nextjs15.zip",
    deliverableSize: "340 KB · Full Repo",
    toolUrl: "/tools/landing-page-generator",
    ctaText: "Open tool",
    specsSnippet: "Clean website project • Ready to launch (.ZIP)",
  },
];

const TOOL_THEMES: Record<
  WorkspaceToolId,
  {
    borderColor: string;
    shadowColor: string;
    auraColor: string;
    badgeBg: string;
    buttonGrad: string;
    iconColor: string;
    tabActive: string;
    luxuryTheme: LuxuryButtonTheme;
  }
> = {
  cutout: {
    borderColor: "border-cyan-400/40",
    shadowColor: "shadow-[0_0_45px_rgba(6,182,212,0.22)]",
    auraColor: "bg-cyan-500/25",
    badgeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
    buttonGrad: "bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-zinc-950 shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)]",
    iconColor: "text-cyan-400",
    tabActive: "bg-cyan-500/15 border-cyan-400/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    luxuryTheme: "cyan",
  },
  "brand-kit": {
    borderColor: "border-amber-400/40",
    shadowColor: "shadow-[0_0_45px_rgba(245,158,11,0.22)]",
    auraColor: "bg-amber-500/25",
    badgeBg: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    buttonGrad: "bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-zinc-950 shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:shadow-[0_0_35px_rgba(245,158,11,0.65)]",
    iconColor: "text-amber-400",
    tabActive: "bg-amber-500/15 border-amber-400/30 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    luxuryTheme: "gold",
  },
  "bulk-qr": {
    borderColor: "border-emerald-400/40",
    shadowColor: "shadow-[0_0_45px_rgba(16,185,129,0.22)]",
    auraColor: "bg-emerald-500/25",
    badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    buttonGrad: "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-zinc-950 shadow-[0_0_25px_rgba(16,185,129,0.45)] hover:shadow-[0_0_35px_rgba(16,185,129,0.65)]",
    iconColor: "text-emerald-400",
    tabActive: "bg-emerald-500/15 border-emerald-400/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    luxuryTheme: "emerald",
  },
  "code-export": {
    borderColor: "border-purple-400/40",
    shadowColor: "shadow-[0_0_45px_rgba(168,85,247,0.22)]",
    auraColor: "bg-purple-500/25",
    badgeBg: "bg-purple-500/15 text-purple-300 border-purple-400/30",
    buttonGrad: "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-500 text-zinc-950 shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(168,85,247,0.65)]",
    iconColor: "text-purple-400",
    tabActive: "bg-purple-500/15 border-purple-400/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    luxuryTheme: "purple",
  },
};

export function HeroProductWorkspace() {
  const [activeToolId, setActiveToolId] = useState<WorkspaceToolId>("cutout");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [codeTab, setCodeTab] = useState<"preview" | "code">("preview");
  const sliderBoxRef = useRef<HTMLDivElement>(null);

  const updateSlider = (clientX: number) => {
    if (!sliderBoxRef.current) return;
    const rect = sliderBoxRef.current.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(rawX, rect.width));
    const percent = Math.round((clampedX / rect.width) * 100);
    setSliderPosition(percent);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateSlider(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging || e.buttons === 1) {
      updateSlider(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    setIsDragging(false);
  };

  const currentTool = WORKSPACE_TOOLS.find((t) => t.id === activeToolId) || WORKSPACE_TOOLS[0];
  const currentTheme = TOOL_THEMES[activeToolId];

  return (
    <div className="w-full max-w-5xl mx-auto pt-2 sm:pt-3 select-none">
      
      {/* Outer Floating Window Container with Screenshot 2 Styling */}
      <div 
        className={cn(
          "group/window relative rounded-2xl sm:rounded-[2.25rem] bg-gradient-to-b from-[#0e0f17]/95 via-[#0a0a10]/95 to-[#06060a]/95 border-2 transition-all duration-500 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.9)] backdrop-blur-3xl",
          currentTheme.borderColor,
          currentTheme.shadowColor
        )}
      >
        {/* Continuous Hover Shine Sweep */}
        <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10">
          <div className="absolute inset-0 translate-x-[-150%] group-hover/window:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Ambient Glowing Mesh Auras in Corners */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
          <div
            className={cn(
              "absolute -top-20 -left-20 w-80 h-80 rounded-full blur-[85px] transition-all duration-700 opacity-30 group-hover/window:opacity-50",
              currentTheme.auraColor
            )}
          />
          <div
            className={cn(
              "absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-[95px] transition-all duration-700 opacity-20 group-hover/window:opacity-40",
              currentTheme.auraColor
            )}
          />
          {/* Micro Dot Matrix Watermark */}
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.035]" />
        </div>
        
        {/* macOS Titlebar & Workspace Navigation */}
        <div className="relative z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-white/[0.08] bg-[#0c0e18]/85 backdrop-blur-2xl px-4 sm:px-6 py-2.5 sm:py-3 gap-2.5 sm:gap-3">
          
          {/* Traffic lights + App Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]/80 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
              <span className="w-3 h-3 rounded-full bg-[#f59e0b]/80 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
              <span className="w-3 h-3 rounded-full bg-[#10b981]/80 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
            </div>
            <span className="text-xs font-mono font-medium text-zinc-400 pl-2 border-l border-white/[0.08] hidden sm:inline">
              Exismic Workspace
            </span>
          </div>

          {/* Interactive Tool Switcher Tabs - Guaranteed 100% visible, never cut off */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5 p-1 rounded-xl bg-black/50 border border-white/[0.08] max-w-full">
            {WORKSPACE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = tool.id === activeToolId;
              const theme = TOOL_THEMES[tool.id];
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveToolId(tool.id)}
                  className={cn(
                    "flex min-h-11 sm:min-h-0 items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border min-w-0",
                    isActive
                      ? theme.tabActive
                      : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? theme.iconColor : "text-zinc-500")} />
                  <span className="whitespace-nowrap">{tool.tabLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Luminous Launch Pill Button */}
          <div className="hidden lg:flex items-center shrink-0">
            <Link
              href={currentTool.toolUrl}
              className={cn(
                "min-h-9 px-4 py-2 rounded-full flex items-center justify-center gap-2 font-black uppercase tracking-wider text-[11px] transition-all duration-300 transform-gpu hover:scale-105 active:scale-95 cursor-pointer shadow-lg",
                currentTheme.buttonGrad
              )}
            >
              <Zap className="w-3 h-3 fill-current shrink-0" />
              <span>{currentTool.ctaText}</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
            </Link>
          </div>

        </div>

        {/* Workspace Canvas Stage */}
        <div className="relative z-20 p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#090a12]/90 to-[#05060a]/90">
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: Background Remover Workspace */}
            {activeToolId === "cutout" && (
              <motion.div
                key="cutout"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Left Controls Column with Screenshot 2 Identity Block */}
                <div className="lg:col-span-5 space-y-4 text-left order-2 lg:order-1">
                  
                  {/* Identity Header: 3D Squircle Icon Orb + Title */}
                  <div className="flex items-start gap-3.5">
                    <div className={cn(
                      "w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl shrink-0 bg-[#0b0c14] border transition-colors duration-500",
                      currentTheme.borderColor
                    )}>
                      <div className={cn("absolute inset-0 blur-lg opacity-40", currentTheme.auraColor)} />
                      <Eraser className={cn("w-6 h-6 sm:w-7 sm:h-7 relative z-10", currentTheme.iconColor)} />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm", currentTheme.badgeBg)}>
                          Images
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Background Cutout
                      </h3>
                    </div>
                  </div>

                  {/* Output summary pill - Plain English */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300 backdrop-blur-xl shadow-inner max-w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span className="shrink-0 text-zinc-400 font-medium text-[11px]">Includes:</span>
                    <span className="min-w-0 whitespace-normal text-zinc-100 font-medium text-[11.5px]">
                      Instant transparent cutout • High resolution PNG
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Hair-level edge detection with transparent PNG output. Processed entirely on your device with complete privacy.
                  </p>

                  {/* Settings Inspector Mockup */}
                  <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Edge detection</span>
                      <span className="font-mono text-cyan-400 font-semibold">High Precision</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Background mode</span>
                      <span className="font-mono text-zinc-300 font-semibold">Transparent PNG</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Output resolution</span>
                      <span className="font-mono text-zinc-300 font-semibold">Up to 4K Ultra-HD</span>
                    </div>
                  </div>

                  {/* Luxury VIP Action Button */}
                  <LuxuryButton
                    href="/tools/image/eraser"
                    theme="cyan"
                    size="sm"
                    icon={<Eraser className="w-4 h-4 text-cyan-300" />}
                    title="Try Background Remover"
                    subtitle="4K PNG Cutout • Instant Export"
                  />
                </div>

                {/* Right Interactive Canvas (Split-view slider with zero clipping) */}
                <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-center">
                  <div 
                    ref={sliderBoxRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="relative w-full aspect-[4/3] sm:aspect-auto sm:h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#090b14] touch-none cursor-ew-resize select-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    role="slider"
                    tabIndex={0}
                    aria-label="Before and after split comparison slider"
                    aria-valuenow={sliderPosition}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowLeft") {
                        setSliderPosition((prev) => Math.max(0, prev - 5));
                      } else if (e.key === "ArrowRight") {
                        setSliderPosition((prev) => Math.min(100, prev + 5));
                      }
                    }}
                  >
                    
                    {/* Left side: Clean cutout over transparency grid */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{
                        backgroundImage: `
                          linear-gradient(45deg, #141624 25%, transparent 25%),
                          linear-gradient(-45deg, #141624 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, #141624 75%),
                          linear-gradient(-45deg, transparent 75%, #141624 75%)
                        `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                      }}
                    >
                      {/* Scalable Product Illustration */}
                      <svg viewBox="0 0 240 140" className="w-56 sm:w-72 drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]">
                        <path d="M30 85 Q50 45 105 50 Q150 55 185 40 Q210 30 220 40 Q225 50 220 75 Q210 95 190 95 L45 95 Q30 95 30 85 Z" fill="#0284c7" />
                        <path d="M40 95 L215 95 L220 108 L35 108 Z" fill="#ffffff" />
                        <path d="M85 55 Q110 70 140 60" stroke="#ffffff" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                        <circle cx="190" cy="65" r="9" fill="#0f172a" />
                      </svg>

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-cyan-400/30 text-[10px] font-mono text-cyan-300 font-bold shadow-lg">
                        Clean Cutout (Transparent)
                      </div>
                    </div>

                    {/* Right side: Original photo with studio background */}
                    <div 
                      className="absolute inset-0 overflow-hidden bg-gradient-to-tr from-amber-800/80 via-rose-900/60 to-purple-900/80 flex items-center justify-center pointer-events-none transition-none"
                      style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                    >
                      <svg viewBox="0 0 240 140" className="w-56 sm:w-72 opacity-95">
                        <path d="M30 85 Q50 45 105 50 Q150 55 185 40 Q210 30 220 40 Q225 50 220 75 Q210 95 190 95 L45 95 Q30 95 30 85 Z" fill="#0284c7" />
                        <path d="M40 95 L215 95 L220 108 L35 108 Z" fill="#ffffff" />
                        <path d="M85 55 Q110 70 140 60" stroke="#ffffff" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                        <circle cx="190" cy="65" r="9" fill="#0f172a" />
                      </svg>

                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400 font-bold shadow-lg">
                        Original Photo
                      </div>
                    </div>

                    {/* Split line divider - moves cleanly 0% to 100% */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)] pointer-events-none z-20"
                      style={{ left: `${sliderPosition}%` }}
                    />

                    {/* Handle knob - clamped with 20px buffer so it NEVER gets chopped off */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.6),0_0_12px_rgba(255,255,255,0.5)] border-2 border-white/80 pointer-events-none z-25 select-none"
                      style={{ 
                        left: `clamp(20px, ${sliderPosition}%, calc(100% - 20px))` 
                      }}
                    >
                      <SlidersHorizontal className="w-4 h-4 rotate-90 text-zinc-900" />
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-400 mt-2.5 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                    <span>Drag slider anywhere to compare cutout precision (0% to 100%)</span>
                  </span>
                </div>
              </motion.div>
            )}

            {/* VIEW 2: Brand Kit Generator Workspace */}
            {activeToolId === "brand-kit" && (
              <motion.div
                key="brand-kit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Left Controls Column with Screenshot 2 Identity Block */}
                <div className="lg:col-span-5 space-y-4 text-left order-2 lg:order-1">
                  
                  <div className="flex items-start gap-3.5">
                    <div className={cn(
                      "w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl shrink-0 bg-[#0b0c14] border transition-colors duration-500",
                      currentTheme.borderColor
                    )}>
                      <div className={cn("absolute inset-0 blur-lg opacity-40", currentTheme.auraColor)} />
                      <FolderArchive className={cn("w-6 h-6 sm:w-7 sm:h-7 relative z-10", currentTheme.iconColor)} />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm", currentTheme.badgeBg)}>
                          Branding
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Startup Brand Kit (.ZIP)
                      </h3>
                    </div>
                  </div>

                  {/* Output summary pill - Plain English */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300 backdrop-blur-xl shadow-inner max-w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="shrink-0 text-zinc-400 font-medium text-[11px]">Includes:</span>
                    <span className="min-w-0 whitespace-normal text-zinc-100 font-medium text-[11.5px]">
                      Vector logo • Favicons • Style guide (.ZIP)
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Download a structured ZIP archive with editable vector paths, complete favicons, and production guidelines.
                  </p>

                  {/* Deliverables Checklist */}
                  <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                    {[
                      { file: "vector/logo.svg", note: "Infinite scale vector" },
                      { file: "favicons/favicon.ico", note: "32x32, 16x16, apple-touch" },
                      { file: "transparent-png/ (3 sizes)", note: "512px, 1024px, 2048px" },
                      { file: "Brand-Guidelines.pdf", note: "Typography & color codes" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 text-zinc-300">
                        <div className="flex min-w-0 items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="min-w-0 break-words font-mono text-zinc-200">{item.file}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">{item.note}</span>
                      </div>
                    ))}
                  </div>

                  <LuxuryButton
                    href="/tools/ai/logo"
                    theme="gold"
                    size="sm"
                    icon={<FolderArchive className="w-4 h-4 text-amber-300" />}
                    title="Create Project Brand Kit"
                    subtitle="Vector SVG & Favicons (.ZIP)"
                  />
                </div>

                {/* Right Canvas: Vector Crest & Swatches */}
                <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#10121d] to-[#080911] border border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
                  
                  {/* Emblem */}
                  <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#141624] border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                    <svg viewBox="0 0 100 100" className="w-16 h-16 text-amber-400">
                      <polygon points="50,15 85,35 85,75 50,95 15,75 15,35" fill="none" stroke="currentColor" strokeWidth="4" />
                      <circle cx="50" cy="55" r="16" fill="rgba(245, 158, 11, 0.15)" stroke="currentColor" strokeWidth="3" />
                      <path d="M50 30 L50 45 M50 65 L50 80 M35 55 L42 55 M58 55 L65 55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div className="relative z-10 text-center mt-4 space-y-1">
                    <h4 className="text-base font-bold text-white tracking-wider">VANGUARD LABS</h4>
                    <p className="text-[11px] font-mono text-amber-300">Scalable Vector · Commercial License</p>
                  </div>

                  {/* Swatches */}
                  <div className="relative z-10 flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.06] w-full justify-center">
                    <span className="text-[10px] font-mono text-zinc-500">Color System:</span>
                    <span className="w-4 h-4 rounded-full bg-[#080911] border border-white/20" title="Obsidian #080911" />
                    <span className="w-4 h-4 rounded-full bg-[#f59e0b]" title="Solaris Gold #f59e0b" />
                    <span className="w-4 h-4 rounded-full bg-[#10b981]" title="Emerald #10b981" />
                    <span className="w-4 h-4 rounded-full bg-[#f8fafc]" title="Clean White #f8fafc" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: Bulk QR Spreadsheet Workspace */}
            {activeToolId === "bulk-qr" && (
              <motion.div
                key="bulk-qr"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Left Controls Column with Screenshot 2 Identity Block */}
                <div className="lg:col-span-5 space-y-4 text-left order-2 lg:order-1">
                  
                  <div className="flex items-start gap-3.5">
                    <div className={cn(
                      "w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl shrink-0 bg-[#0b0c14] border transition-colors duration-500",
                      currentTheme.borderColor
                    )}>
                      <div className={cn("absolute inset-0 blur-lg opacity-40", currentTheme.auraColor)} />
                      <FileSpreadsheet className={cn("w-6 h-6 sm:w-7 sm:h-7 relative z-10", currentTheme.iconColor)} />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm", currentTheme.badgeBg)}>
                          Work with files
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Spreadsheets to QR Codes
                      </h3>
                    </div>
                  </div>

                  {/* Output summary pill - Plain English */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300 backdrop-blur-xl shadow-inner max-w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="shrink-0 text-zinc-400 font-medium text-[11px]">Includes:</span>
                    <span className="min-w-0 whitespace-normal text-zinc-100 font-medium text-[11.5px]">
                      50+ verified QR codes • Ready to print (.ZIP)
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Upload any CSV file. Generate 50+ camera-verified QR codes for menus, tables, or guest Wi-Fi in 1 click.
                  </p>

                  <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Input format</span>
                      <span className="font-mono text-zinc-200">CSV Spreadsheet</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Camera scan verification</span>
                      <span className="font-mono text-emerald-400 font-semibold">100% Tested</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Export bundle</span>
                      <span className="font-mono text-zinc-200">Organized .ZIP</span>
                    </div>
                  </div>

                  <LuxuryButton
                    href="/tools/qr-code"
                    theme="emerald"
                    size="sm"
                    icon={<FileSpreadsheet className="w-4 h-4 text-emerald-300" />}
                    title="Open Bulk QR Tool"
                    subtitle="Batch CSV to QR Codes (.ZIP)"
                  />
                </div>

                {/* Right Canvas: Spreadsheet Table */}
                <div className="lg:col-span-7 order-1 lg:order-2 rounded-2xl bg-[#0a0c16] border border-white/10 p-4 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/[0.06] text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span className="min-w-0 break-all font-mono font-bold text-zinc-200">restaurant-tables.csv</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[10px]">
                      4 of 4 Ready
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { label: "Table 01 - Main Dining", link: "bistro.menu/table-1" },
                      { label: "Table 02 - Patio Garden", link: "bistro.menu/table-2" },
                      { label: "Guest Wi-Fi Auto-Connect", link: "WIFI:S:Guest;P:Secret;;" },
                      { label: "Instagram & Review", link: "bistro.menu/review" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-zinc-200 block truncate">{row.label}</span>
                          <span className="text-[10px] font-mono text-zinc-500 block truncate">{row.link}</span>
                        </div>
                        {/* Live Micro QR Vector */}
                        <div className="w-7 h-7 rounded bg-white p-0.5 shrink-0 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-full h-full text-zinc-950 fill-current">
                            <rect x="2" y="2" width="6" height="6" />
                            <rect x="16" y="2" width="6" height="6" />
                            <rect x="2" y="16" width="6" height="6" />
                            <rect x="10" y="4" width="2" height="2" />
                            <rect x="12" y="10" width="4" height="2" />
                            <rect x="16" y="16" width="6" height="6" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
                    <span>Export format: 2000px PNG + SVG</span>
                    <span className="text-emerald-400 font-semibold">1-Click ZIP</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 4: Next.js 15 Source Code Export Workspace */}
            {activeToolId === "code-export" && (
              <motion.div
                key="code-export"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Left Controls Column with Screenshot 2 Identity Block */}
                <div className="lg:col-span-5 space-y-4 text-left order-2 lg:order-1">
                  
                  <div className="flex items-start gap-3.5">
                    <div className={cn(
                      "w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl shrink-0 bg-[#0b0c14] border transition-colors duration-500",
                      currentTheme.borderColor
                    )}>
                      <div className={cn("absolute inset-0 blur-lg opacity-40", currentTheme.auraColor)} />
                      <Code2 className={cn("w-6 h-6 sm:w-7 sm:h-7 relative z-10", currentTheme.iconColor)} />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm", currentTheme.badgeBg)}>
                          Code & Web
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Website Source Code
                      </h3>
                    </div>
                  </div>

                  {/* Output summary pill - Plain English */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300 backdrop-blur-xl shadow-inner max-w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span className="shrink-0 text-zinc-400 font-medium text-[11px]">Includes:</span>
                    <span className="min-w-0 whitespace-normal text-zinc-100 font-medium text-[11.5px]">
                      Clean website project • Ready to launch (.ZIP)
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Design landing pages and download a clean Next.js 15, React 19, and Tailwind CSS starter repository. Zero vendor lock-in.
                  </p>

                  <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Next.js 15 App Router + TypeScript</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Tailwind CSS + Lucide Icons</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Ready to deploy: build passes cleanly</span>
                    </div>
                  </div>

                  <LuxuryButton
                    href="/tools/landing-page-generator"
                    theme="purple"
                    size="sm"
                    icon={<Code2 className="w-4 h-4 text-purple-300" />}
                    title="Open Website Builder"
                    subtitle="Next.js 15 Clean Starter Repo"
                  />
                </div>

                {/* Right Canvas: Code / Preview Sandbox */}
                <div className="lg:col-span-7 order-1 lg:order-2 rounded-2xl bg-[#090b16] border border-white/10 overflow-hidden shadow-xl">
                  {/* Tab Selector */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3.5 py-2 border-b border-white/[0.06] bg-[#0d0f1e]">
                    <div className="flex max-w-full flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCodeTab("preview")}
                        className={cn(
                          "min-h-11 sm:min-h-0 shrink-0 whitespace-nowrap px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1",
                          codeTab === "preview" ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <Eye className="w-3 h-3 shrink-0" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCodeTab("code")}
                        className={cn(
                          "min-h-11 sm:min-h-0 shrink-0 whitespace-nowrap px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1",
                          codeTab === "code" ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <FileCode className="w-3 h-3 shrink-0" />
                        <span>app/page.tsx</span>
                      </button>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500">React 19 · TypeScript</span>
                  </div>

                  {/* Body Content */}
                  <div className="p-3 sm:p-5 h-60 sm:h-72 overflow-auto font-mono text-xs">
                    {codeTab === "preview" ? (
                      <div className="p-4 rounded-xl bg-gradient-to-b from-[#111322] to-[#070810] border border-white/10 space-y-2.5 font-sans">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-1.5 border-b border-white/10">
                          <span className="font-bold text-white tracking-wider">APEX METRICS</span>
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">v1.0 Live</span>
                        </div>
                        <h4 className="text-base font-bold text-white leading-snug">
                          Real-time Product Growth Analytics
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Track cohort retention, churn velocity, and revenue metrics in one clean dashboard.
                        </p>
                        <div className="flex items-center gap-2 pt-1.5">
                          <span className="px-3 py-1 rounded bg-purple-600 text-white font-semibold text-xs">
                            Start Free Trial
                          </span>
                        </div>
                      </div>
                    ) : (
                      <pre className="whitespace-pre text-[11px] leading-relaxed text-zinc-300">
                        <code>{`// app/page.tsx - Clean Next.js 15 Source Code
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <Hero title="Apex Metrics" cta="Start Free Trial" />
      <Features />
    </main>
  );
}`}</code>
                      </pre>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Bottom Deliverable Dock (Upgraded visual architecture) */}
        <div className="relative z-20 border-t border-white/[0.08] bg-gradient-to-r from-[#0c0e18]/95 via-[#080911]/95 to-[#0c0e18]/95 backdrop-blur-2xl px-4 sm:px-6 py-3 sm:py-3.5 overflow-hidden">
          
          {/* Category-reactive laser horizon divider across top of dock */}
          <div className={cn("absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-current to-transparent opacity-70 transition-colors duration-500", currentTheme.iconColor)} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            
            {/* Left: Deliverable Asset Card */}
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              
              {/* Live Glowing Pulse Beacon */}
              <div className="relative flex items-center justify-center shrink-0 pl-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute opacity-70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative z-10 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              </div>

              {/* Asset Jewel Orb */}
              <div className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0 backdrop-blur-md shadow-lg transition-colors duration-500 bg-[#090b14]",
                currentTheme.badgeBg
              )}>
                {React.createElement(currentTool.deliverableIcon, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
              </div>

              {/* Structured Asset Metadata */}
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    File Ready
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                    {currentTool.deliverableSize}
                  </span>
                </div>
                <div className="font-mono font-bold text-white text-xs sm:text-sm tracking-tight break-all sm:truncate">
                  {currentTool.deliverableFile}
                </div>
              </div>
            </div>

            {/* Right: Tactile Download Pill Card */}
            <div className="flex items-center self-stretch sm:self-auto shrink-0 w-full sm:w-auto">
              <Link
                href={currentTool.toolUrl}
                className={cn(
                  "group/dl relative flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto px-4.5 py-2.5 rounded-xl border font-bold text-xs transition-all duration-300 transform-gpu hover:scale-[1.02] active:scale-95 shadow-lg",
                  "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20 text-white cursor-pointer"
                )}
              >
                <div className={cn("absolute inset-0 rounded-xl opacity-0 group-hover/dl:opacity-20 transition-opacity duration-300 blur-sm", currentTheme.auraColor)} />
                
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-300 group-hover/dl:scale-105 shadow-sm",
                    currentTheme.badgeBg
                  )}>
                    <Download className="w-3.5 h-3.5 group-hover/dl:translate-y-0.5 transition-transform" />
                  </div>
                  <div className="text-left">
                    <span className="block text-white font-bold text-xs tracking-wide">
                      Download {currentTool.deliverableFile.endsWith(".zip") ? "Archive (.ZIP)" : "Cutout (.PNG)"}
                    </span>
                    <span className={cn("block text-[10px] font-mono transition-colors", currentTheme.iconColor)}>
                      Open in {currentTool.name} &rarr;
                    </span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover/dl:text-white group-hover/dl:translate-x-1 transition-all sm:hidden" />
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
