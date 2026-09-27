"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderArchive, 
  Eraser, 
  QrCode, 
  Code2, 
  ArrowRight, 
  Download, 
  Check, 
  SlidersHorizontal,
  Layers,
  FileSpreadsheet,
  Monitor,
  Eye,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PreviewTabId = "brand-kit" | "cutout" | "bulk-qr" | "code-export";

interface PreviewTab {
  id: PreviewTabId;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  toolUrl: string;
  ctaText: string;
}

const TABS: PreviewTab[] = [
  {
    id: "brand-kit",
    label: "Startup Brand Kit (.ZIP)",
    badge: "1-Click Download",
    icon: FolderArchive,
    accentColor: "#f59e0b",
    toolUrl: "/tools/ai/logo",
    ctaText: "Open Logo Studio",
  },
  {
    id: "cutout",
    label: "Background Cutout",
    badge: "Instant Transparency",
    icon: Eraser,
    accentColor: "#38bdf8",
    toolUrl: "/tools/image/eraser",
    ctaText: "Erase Background Free",
  },
  {
    id: "bulk-qr",
    label: "Bulk QR Spreadsheets",
    badge: "Batch Engine",
    icon: FileSpreadsheet,
    accentColor: "#10b981",
    toolUrl: "/tools/qr-code",
    ctaText: "Create Bulk QR Codes",
  },
  {
    id: "code-export",
    label: "Next.js 15 Source Code",
    badge: "Full Repo Export",
    icon: Code2,
    accentColor: "#a855f7",
    toolUrl: "/tools/landing-page-generator",
    ctaText: "Build Website & Export",
  },
];

export function HeroStudioPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTabId>("brand-kit");
  const [sliderPos, setSliderPos] = useState(52); // for cutout slider
  const [codeMode, setCodeMode] = useState<"preview" | "code">("preview");

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="w-full max-w-5xl mx-auto pt-6 sm:pt-10">
      
      {/* 1. Tab Selector Bar */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 pb-3 px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 shrink-0 cursor-pointer border select-none",
                isActive
                  ? "bg-white/[0.08] text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)]"
                  : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.04] hover:border-white/10"
              )}
              style={
                isActive
                  ? {
                      borderColor: `${tab.accentColor}55`,
                      boxShadow: `0 0 25px ${tab.accentColor}1a`,
                    }
                  : {}
              }
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: isActive ? `${tab.accentColor}25` : "rgba(255,255,255,0.05)",
                  color: isActive ? tab.accentColor : "inherit",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">{tab.label}</span>
              <span
                className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border hidden md:inline-block"
                style={{
                  backgroundColor: isActive ? `${tab.accentColor}15` : "rgba(255,255,255,0.03)",
                  borderColor: isActive ? `${tab.accentColor}35` : "rgba(255,255,255,0.08)",
                  color: isActive ? tab.accentColor : "rgb(161, 161, 170)",
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Flagship macOS Studio Window */}
      <div 
        className="relative rounded-2xl sm:rounded-3xl bg-[#090a10]/95 border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500"
        style={{
          boxShadow: `0 30px 100px -20px rgba(0,0,0,0.9), 0 0 45px -10px ${currentTab.accentColor}20`,
        }}
      >
        {/* macOS Window Titlebar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#0c0d15]/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]/80 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
            <span className="w-3 h-3 rounded-full bg-[#f59e0b]/80 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
            <span className="w-3 h-3 rounded-full bg-[#10b981]/80 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            <span className="ml-3 text-[11px] font-mono text-zinc-400 hidden sm:inline-block">
              exismic-studio / {currentTab.id}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-bold text-zinc-300">
              <span 
                className="w-1.5 h-1.5 rounded-full animate-pulse" 
                style={{ backgroundColor: currentTab.accentColor }} 
              />
              <span>Live Deliverable Preview</span>
            </div>
            
            <Link
              href={currentTab.toolUrl}
              className="text-xs font-bold text-white hover:text-amber-300 flex items-center gap-1 transition-colors group"
            >
              <span className="hidden sm:inline-block">{currentTab.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Studio Window Stage Content */}
        <div className="p-4 sm:p-8 min-h-[380px] sm:min-h-[440px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: Startup Brand Kit */}
            {activeTab === "brand-kit" && (
              <motion.div
                key="brand-kit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Visual Emblem Stage */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#121422] to-[#0a0b12] border border-white/[0.08] relative group overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,transparent_70%)]" />
                  
                  {/* Luxury Vector Emblem Mockup */}
                  <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-[#1b1c2b] to-[#0f101a] border-2 border-amber-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                    <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">
                      <polygon points="50,15 85,35 85,75 50,95 15,75 15,35" fill="none" stroke="currentColor" strokeWidth="4" />
                      <circle cx="50" cy="55" r="16" fill="rgba(245, 158, 11, 0.2)" stroke="currentColor" strokeWidth="3" />
                      <path d="M50 30 L50 45 M50 65 L50 80 M35 55 L42 55 M58 55 L65 55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div className="relative z-10 text-center mt-5 space-y-1">
                    <h4 className="text-lg font-black text-white tracking-wide">VANGUARD</h4>
                    <p className="text-[11px] font-mono text-amber-300 uppercase tracking-widest">
                      Scalable Vector · 2048px Ultra-HD
                    </p>
                  </div>

                  {/* Brand Color Swatches */}
                  <div className="relative z-10 flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.06] w-full justify-center">
                    <span className="text-[10px] font-mono text-zinc-400 mr-1">Palette:</span>
                    <span className="w-5 h-5 rounded-full bg-[#0a0b12] border border-white/20" title="#0a0b12 Obsidian" />
                    <span className="w-5 h-5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.6)]" title="#f59e0b Solaris Gold" />
                    <span className="w-5 h-5 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="#10b981 Nordic Emerald" />
                    <span className="w-5 h-5 rounded-full bg-[#f8fafc] border border-white/40" title="#f8fafc Clean White" />
                  </div>
                </div>

                {/* Package Breakdown */}
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Export Ready Deliverables
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                      Complete Brand Kit (.ZIP) in 1 Click
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                      Download an agency-grade asset pack ready for production. No manual resizing or design work needed.
                    </p>
                  </div>

                  {/* Folder Checklist */}
                  <div className="space-y-2 pt-1">
                    {[
                      { name: "vector/logo.svg", desc: "Editable vector paths with infinite resolution" },
                      { name: "favicons/favicon.ico + apple-touch-icon", desc: "Binary valid 32x32, 16x16, 180x180 app icons" },
                      { name: "transparent-png/ (512px, 1024px, 2048px)", desc: "Alpha-cut transparent PNGs for web & pitch decks" },
                      { name: "Brand-Guidelines.pdf", desc: "Hex color codes, typography pairings, and layout guide" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-xs font-mono font-bold text-zinc-200 block truncate">{item.name}</span>
                          <span className="text-[11px] text-zinc-400 block">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      href="/tools/ai/logo"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Make Your Brand Kit Free</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: Background Cutout */}
            {activeTab === "cutout" && (
              <motion.div
                key="cutout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Interactive Split View Slider Stage */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/10 select-none shadow-2xl bg-[#0b0c14]">
                    
                    {/* Left: Cutout with Checkerboard Grid */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backgroundImage: `
                          linear-gradient(45deg, #181926 25%, transparent 25%),
                          linear-gradient(-45deg, #181926 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, #181926 75%),
                          linear-gradient(-45deg, transparent 75%, #181926 75%)
                        `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                      }}
                    >
                      {/* Crisp Isolated Sneaker SVG */}
                      <svg viewBox="0 0 200 120" className="w-48 sm:w-64 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
                        <path d="M20 75 Q40 40 85 45 Q125 50 155 35 Q175 25 185 35 Q190 45 185 65 Q175 85 160 85 L35 85 Q20 85 20 75 Z" fill="#38bdf8" />
                        <path d="M30 85 L180 85 L185 95 L25 95 Z" fill="#ffffff" />
                        <path d="M70 48 Q90 60 115 52" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <circle cx="160" cy="55" r="8" fill="#0f172a" />
                      </svg>
                      
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 font-bold">
                        Clean Cutout (Transparent)
                      </div>
                    </div>

                    {/* Right: Original with Background (Clipped by slider) */}
                    <div 
                      className="absolute inset-0 overflow-hidden bg-gradient-to-tr from-amber-700/80 via-rose-900/60 to-purple-900/80 flex items-center justify-center"
                      style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                    >
                      <svg viewBox="0 0 200 120" className="w-48 sm:w-64 opacity-95">
                        <path d="M20 75 Q40 40 85 45 Q125 50 155 35 Q175 25 185 35 Q190 45 185 65 Q175 85 160 85 L35 85 Q20 85 20 75 Z" fill="#38bdf8" />
                        <path d="M30 85 L180 85 L185 95 L25 95 Z" fill="#ffffff" />
                        <path d="M70 48 Q90 60 115 52" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <circle cx="160" cy="55" r="8" fill="#0f172a" />
                      </svg>

                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400 font-bold">
                        Original Photo
                      </div>
                    </div>

                    {/* Vertical Divider Line with Draggable Handle */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg font-bold">
                        <SlidersHorizontal className="w-3.5 h-3.5 rotate-90" />
                      </div>
                    </div>

                    {/* Transparent Click/Drag Overlay */}
                    <input 
                      type="range"
                      min={10}
                      max={90}
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                      aria-label="Before and after slider"
                    />
                  </div>
                  
                  <span className="text-[11px] font-mono text-zinc-400 mt-2">
                    Drag the slider to preview instant edge precision
                  </span>
                </div>

                {/* Explanation */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      Hair & Edge Precision
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                      Razor-Sharp Background Removal
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                      Automatically detect product edges, portraits, clothing, and vehicles. Exports clean transparent PNGs ready for Amazon, Shopify, or YouTube thumbnails.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-cyan-400" />
                      <span>Zero blur or halo artifacts on edges</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-cyan-400" />
                      <span>Export up to 4K Ultra-HD resolution</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-cyan-400" />
                      <span>100% private in-browser computation</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/tools/image/eraser"
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                    >
                      <Eraser className="w-4 h-4" />
                      <span>Erase Background Free</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: Bulk QR Spreadsheets */}
            {activeTab === "bulk-qr" && (
              <motion.div
                key="bulk-qr"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Spreadsheet Table Stage */}
                <div className="lg:col-span-7 rounded-2xl bg-[#0d0e18] border border-white/[0.08] p-4 overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-xs">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono font-bold text-zinc-200">restaurant-tables.csv</span>
                      <span className="text-[10px] font-mono text-zinc-400">(4 rows)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold">
                      Batch Ready
                    </span>
                  </div>

                  {/* Rows */}
                  <div className="space-y-2">
                    {[
                      { name: "Table 01 - Main Room", dest: "menu.bistro.com/t1", qrColor: "#10b981" },
                      { name: "Table 02 - Window Seat", dest: "menu.bistro.com/t2", qrColor: "#10b981" },
                      { name: "Guest Wi-Fi (Auto-Connect)", dest: "WIFI:S:Bistro;P:FreshCoffee;;", qrColor: "#06b6d4" },
                      { name: "VIP Lounge Order", dest: "menu.bistro.com/vip", qrColor: "#f59e0b" },
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-white/[0.05] flex items-center justify-center font-mono text-[10px] text-zinc-400">
                            0{idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-zinc-200 font-bold block truncate">{row.name}</span>
                            <span className="text-[10px] font-mono text-zinc-400 block truncate">{row.dest}</span>
                          </div>
                        </div>

                        {/* Live Micro QR Vector Simulation */}
                        <div className="w-8 h-8 rounded-lg bg-white p-1 shrink-0 flex items-center justify-center shadow-sm">
                          <QrCode className="w-full h-full text-zinc-950" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-zinc-400">
                      4 camera-tested QRs generated in 0.4s
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> 1-Click ZIP
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Batch Automation
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                      Generate 100s of QR Codes from Spreadsheets
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                      Drop any CSV with links, Wi-Fi keys, or product IDs. Exismic automatically designs and exports verified, camera-ready QR codes in a single neat folder.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Custom brand logos & color palettes</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Wi-Fi auto-connect & digital business cards</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Export high-res PNG or scalable SVG</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/tools/qr-code"
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Open QR Code Studio</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: Next.js 15 Source Code */}
            {activeTab === "code-export" && (
              <motion.div
                key="code-export"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Code / Visual Toggle Box */}
                <div className="lg:col-span-7 rounded-2xl bg-[#0b0c16] border border-white/[0.08] overflow-hidden shadow-2xl">
                  {/* Mode Bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-[#0f101d]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCodeMode("preview")}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                          codeMode === "preview" ? "bg-purple-600/30 text-purple-200 border border-purple-500/40" : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Preview</span>
                      </button>
                      <button
                        onClick={() => setCodeMode("code")}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                          codeMode === "code" ? "bg-purple-600/30 text-purple-200 border border-purple-500/40" : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Next.js Code</span>
                      </button>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-400">
                      Next.js 15 · React 19 · Tailwind
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 h-64 sm:h-72 overflow-y-auto font-mono text-xs text-zinc-300">
                    {codeMode === "preview" ? (
                      <div className="p-4 rounded-xl bg-gradient-to-b from-[#131424] to-[#0a0a14] border border-white/10 space-y-3 font-sans">
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                          <span className="font-bold text-white tracking-wider uppercase">ApexMetrics</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">v1.0 Live</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                          Real-time Product Growth Analytics for Modern SaaS
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Track cohort retention, churn velocity, and Stripe MRR in one dark-mode dashboard.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <span className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs">
                            Start Free Trial
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-white/5 text-zinc-300 text-xs">
                            View Live Demo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <pre className="text-[11px] leading-relaxed text-zinc-300 selection:bg-purple-500/40">
                        <code>{`// app/page.tsx - Clean Next.js 15 Source Code
import { Hero } from "@/components/Hero";
import { FeatureGrid } from "@/components/Features";
import { PricingTable } from "@/components/Pricing";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#05060b] text-white">
      <Hero 
        title="ApexMetrics"
        headline="Modern SaaS Analytics"
        ctaText="Start Free Trial" 
      />
      <FeatureGrid />
      <PricingTable />
    </main>
  );
}`}</code>
                      </pre>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      Developer Freedom
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
                      Deployable Code, Not Locked-In Templates
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                      Design websites and download a full Next.js 15 repository with TypeScript, Tailwind CSS, and Lucide icons. Host on Vercel with zero vendor lock-in.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-purple-400" />
                      <span>Ready to deploy: `npm run build` with 0 errors</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-purple-400" />
                      <span>Includes package.json, tailwind.config, and README</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-purple-400" />
                      <span>Full ownership with 100% commercial license</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/tools/landing-page-generator"
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
                    >
                      <Code2 className="w-4 h-4" />
                      <span>Design & Export Code</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
