"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Eraser, 
  FolderArchive, 
  FileSpreadsheet, 
  ImageIcon, 
  Mic2, 
  Search, 
  Code2, 
  PenTool, 
  ArrowRight,
  Flame,
  LayoutGrid,
  Disc3,
  FileText
} from "lucide-react";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { cn } from "@/lib/utils";

interface CuratedTool {
  id: string;
  name: string;
  category: "all" | "image" | "audio" | "writing" | "code";
  categoryLabel: string;
  isPopular?: boolean;
  tags: string[];
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  accentColor: string;
  cardBorder: string;
  cardBg: string;
  buttonGrad: string;
  buttonTextDark?: boolean;
  badgeStyle: string;
  dotColor: string;
  href: string;
}

const CURATED_TOOLS: CuratedTool[] = [
  {
    id: "image-eraser",
    name: "Background Remover",
    category: "image",
    categoryLabel: "IMAGE",
    isPopular: true,
    tags: ["Transparent PNG", "4K Ultra-HD", "Instant Cutout"],
    description: "Remove the background from a photo and download a clean PNG.",
    icon: Eraser,
    accentColor: "#06b6d4",
    cardBorder: "border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:border-cyan-300 hover:shadow-[0_0_45px_rgba(6,182,212,0.55)]",
    cardBg: "bg-gradient-to-b from-[#061418]/95 via-[#030c0e]/95 to-[#010607]/95",
    buttonGrad: "bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]",
    badgeStyle: "bg-cyan-400/15 border-cyan-400/50 text-cyan-300",
    dotColor: "#06b6d4",
    href: "/tools/image/eraser",
  },
  {
    id: "ai-logo",
    name: "Logo & Brand Kit",
    category: "image",
    categoryLabel: "BRANDING",
    isPopular: true,
    tags: ["Vector SVG", "Favicon Kit", "Brand PDF"],
    description: "Make a logo, get vector files, and download favicons in a clean ZIP.",
    icon: FolderArchive,
    accentColor: "#f59e0b",
    cardBorder: "border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:border-amber-300 hover:shadow-[0_0_50px_rgba(245,158,11,0.6)]",
    cardBg: "bg-gradient-to-b from-[#181106]/95 via-[#0e0a03]/95 to-[#080501]/95",
    buttonGrad: "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-amber-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]",
    buttonTextDark: true,
    badgeStyle: "bg-amber-400/15 border-amber-400/50 text-amber-300",
    dotColor: "#f59e0b",
    href: "/tools/ai/logo",
  },
  {
    id: "qr-code",
    name: "Bulk QR Codes",
    category: "code",
    categoryLabel: "QR & FILES",
    tags: ["CSV Spreadsheets", "Custom Branded", "ZIP Export"],
    description: "Turn spreadsheet rows into camera-ready QR codes in a batch ZIP.",
    icon: FileSpreadsheet,
    accentColor: "#10b981",
    cardBorder: "border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-emerald-300 hover:shadow-[0_0_45px_rgba(16,185,129,0.55)]",
    cardBg: "bg-gradient-to-b from-[#06180f]/95 via-[#030e09]/95 to-[#010704]/95",
    buttonGrad: "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    badgeStyle: "bg-emerald-400/15 border-emerald-400/50 text-emerald-300",
    dotColor: "#10b981",
    href: "/tools/qr-code",
  },
  {
    id: "ai-img-gen",
    name: "AI Image Generator",
    category: "image",
    categoryLabel: "IMAGE",
    isPopular: true,
    tags: ["High-Res Art", "Wallpapers", "Product Shots"],
    description: "Turn a simple idea into an image.",
    icon: ImageIcon,
    accentColor: "#38bdf8",
    cardBorder: "border-2 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:border-sky-300 hover:shadow-[0_0_45px_rgba(56,189,248,0.55)]",
    cardBg: "bg-gradient-to-b from-[#061218]/95 via-[#030a0e]/95 to-[#010507]/95",
    buttonGrad: "bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]",
    badgeStyle: "bg-sky-400/15 border-sky-400/50 text-sky-300",
    dotColor: "#38bdf8",
    href: "/tools/ai/img-gen",
  },
  {
    id: "vocal-remover",
    name: "Vocal Remover",
    category: "audio",
    categoryLabel: "AUDIO",
    isPopular: true,
    tags: ["Voice Isolation", "Backing Track", "Clean WAV"],
    description: "Separate vocals and music from an audio file.",
    icon: Mic2,
    accentColor: "#ec4899",
    cardBorder: "border-2 border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:border-pink-300 hover:shadow-[0_0_45px_rgba(236,72,153,0.55)]",
    cardBg: "bg-gradient-to-b from-[#180712]/95 via-[#0e040b]/95 to-[#060205]/95",
    buttonGrad: "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]",
    badgeStyle: "bg-pink-400/15 border-pink-400/50 text-pink-300",
    dotColor: "#ec4899",
    href: "/tools/audio/vocal-remover",
  },
  {
    id: "pdf-ocr",
    name: "Text Scanner (OCR)",
    category: "writing",
    categoryLabel: "DOCUMENTS",
    tags: ["Scanned Docs", "Receipts", "Clean Text"],
    description: "Pull editable text from scanned documents.",
    icon: Search,
    accentColor: "#eab308",
    cardBorder: "border-2 border-amber-400 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:border-amber-300 hover:shadow-[0_0_45px_rgba(234,179,8,0.55)]",
    cardBg: "bg-gradient-to-b from-[#181106]/95 via-[#0e0a03]/95 to-[#080501]/95",
    buttonGrad: "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-amber-950 font-black shadow-[0_0_20px_rgba(234,179,8,0.4)]",
    buttonTextDark: true,
    badgeStyle: "bg-amber-400/15 border-amber-400/50 text-amber-300",
    dotColor: "#eab308",
    href: "/tools/pdf/ocr",
  },
  {
    id: "landing-page",
    name: "Landing Page to Next.js",
    category: "code",
    categoryLabel: "DEVELOPER",
    isPopular: true,
    tags: ["Next.js 15", "Tailwind Code", "Full ZIP"],
    description: "Turn a website idea into a ready-to-download Next.js project.",
    icon: Code2,
    accentColor: "#a855f7",
    cardBorder: "border-2 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:border-purple-300 hover:shadow-[0_0_45px_rgba(168,85,247,0.55)]",
    cardBg: "bg-gradient-to-b from-[#100818]/95 via-[#0a040e]/95 to-[#050207]/95",
    buttonGrad: "bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    badgeStyle: "bg-purple-400/15 border-purple-400/50 text-purple-300",
    dotColor: "#a855f7",
    href: "/tools/landing-page-generator",
  },
  {
    id: "ai-writer",
    name: "AI Writer",
    category: "writing",
    categoryLabel: "WRITING",
    isPopular: true,
    tags: ["Video Scripts", "Blog Articles", "Clear Emails"],
    description: "Draft video scripts, articles, and clear customer emails.",
    icon: PenTool,
    accentColor: "#10b981",
    cardBorder: "border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-emerald-300 hover:shadow-[0_0_45px_rgba(16,185,129,0.55)]",
    cardBg: "bg-gradient-to-b from-[#06180f]/95 via-[#030e09]/95 to-[#010704]/95",
    buttonGrad: "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    badgeStyle: "bg-emerald-400/15 border-emerald-400/50 text-emerald-300",
    dotColor: "#10b981",
    href: "/tools/ai/writer",
  },
];

export function ToolDiscovery() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = activeCategory === "all"
    ? CURATED_TOOLS
    : CURATED_TOOLS.filter((t) => t.category === activeCategory);

  return (
    <section id="tools" className="pt-5 pb-6 sm:pt-6 sm:pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full scroll-mt-20">
      
      {/* Section Header */}
      <div className="flex flex-col items-center mb-8 sm:mb-10 text-center space-y-2.5 max-w-3xl mx-auto">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
          Tool Library
        </span>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.05]">
          Explore the{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-400">
            tools.
          </span>
        </h2>

        <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed">
          A curated selection of tools for everyday creative, business, and developer work.
        </p>

        {/* Filter Tabs with Authentic Lucide Icons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2.5">
          {[
            { id: "all", label: "All Tools", icon: LayoutGrid, activeGrad: "bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-400 text-black font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.4)]" },
            { id: "image", label: "Image & Brand", icon: ImageIcon, activeGrad: "bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]" },
            { id: "audio", label: "Audio & Music", icon: Disc3, activeGrad: "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)]" },
            { id: "writing", label: "Writing & Docs", icon: FileText, activeGrad: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]" },
            { id: "code", label: "Developer & Code", icon: Code2, activeGrad: "bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)]" },
          ].map((cat) => {
            const isSelected = activeCategory === cat.id;
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "relative group/pill px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer transform-gpu hover:scale-[1.03] active:scale-95 select-none overflow-hidden antialiased flex items-center gap-2",
                  isSelected
                    ? cat.activeGrad
                    : "bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/[0.07]"
                )}
              >
                {/* Tab Hover Shimmer */}
                <div className="absolute inset-0 -translate-x-[150%] group-hover/pill:translate-x-[150%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none" />
                <CatIcon className="w-3.5 h-3.5 shrink-0 relative z-10" />
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}

          {/* Subtle vertical divider on desktop */}
          <div className="hidden sm:block w-px h-5 bg-white/15 my-auto mx-1" />

          {/* Sleek Browse All 50+ Tools Link Pill */}
          <Link
            href="/tools"
            className="group/all relative px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 transform-gpu hover:scale-[1.03] active:scale-95 flex items-center gap-2 bg-gradient-to-r from-white/[0.06] via-white/[0.09] to-white/[0.06] border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.18)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 -translate-x-[150%] group-hover/all:translate-x-[150%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent skew-x-[-20deg] pointer-events-none" />
            <span className="relative z-10">Browse all 50+ tools</span>
            <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover/all:translate-x-1" strokeWidth={2.2} />
          </Link>
        </div>
      </div>

      {/* 8 Curated Cards Grid - Tight, balanced, zero-void layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {filtered.map((tool) => {
          const ToolIcon = tool.icon;

          return (
            <div
              key={tool.id}
              className={cn(
                "group/card relative p-5 sm:p-5.5 rounded-[1.75rem] flex flex-col justify-between transition-all duration-300 transform-gpu hover:-translate-y-1.5 active:translate-y-0 hover:shadow-2xl overflow-hidden h-full",
                tool.cardBg,
                tool.cardBorder
              )}
            >
              {/* Continuous Hover Shine Sweep */}
              <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10">
                <div className="absolute inset-0 translate-x-[-150%] group-hover/card:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Ambient Watermark Icon in Top Right Corner */}
              <ToolIcon 
                className="absolute -top-4 -right-4 w-28 h-28 opacity-[0.06] group-hover/card:opacity-[0.14] transition-opacity duration-500 stroke-[1.2] pointer-events-none select-none"
                style={{ color: tool.accentColor }}
              />

              {/* Ambient Mesh Glow Aura & Colored Micro Dot Matrix Pattern */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                <div 
                  className="absolute -top-10 -left-10 w-44 h-44 rounded-full blur-[45px] opacity-30 group-hover/card:opacity-55 transition-opacity duration-700"
                  style={{ backgroundColor: tool.accentColor }}
                />
                <div 
                  className="absolute inset-0 opacity-20 group-hover/card:opacity-45 transition-opacity duration-500"
                  style={{
                    backgroundImage: `radial-gradient(${tool.dotColor} 1.5px, transparent 1.5px)`,
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>

              {/* Top Details Wrapper */}
              <div className="relative z-10 flex-1 flex flex-col">
                {/* Top Row: Luxury Squircle Icon with Conic Spinning Neon Ring + Category/Popular Badge */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  {/* Squircle Icon Container with Circling Conic Neon Ring */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 shadow-xl bg-[#0b0c12] border border-white/10 group-hover/card:rotate-6 group-hover/card:scale-105 shrink-0">
                    <div 
                      className="absolute inset-[-100%] animate-spin-smooth opacity-80"
                      style={{
                        background: `conic-gradient(from 0deg, transparent 0%, ${tool.accentColor} 30%, transparent 60%)`,
                      }}
                    />
                    <div className="absolute inset-[1.5px] rounded-[14.5px] bg-[#0b0c12] z-0" />
                    <ToolIcon 
                      className="w-5.5 h-5.5 transition-all duration-300 relative z-10 group-hover/card:scale-110"
                      style={{ color: tool.accentColor }}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Tool Badge (Top-Right Balanced Placement) */}
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm",
                    tool.badgeStyle
                  )}>
                    {tool.isPopular && <Flame className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                    <span>{tool.isPopular ? "POPULAR" : tool.categoryLabel}</span>
                  </div>
                </div>

                {/* Tool Title & Description with balanced height */}
                <div>
                  <h3 className="text-base sm:text-[17px] font-bold text-white tracking-tight group-hover/card:text-zinc-100 transition-colors line-clamp-1">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-normal line-clamp-2 min-h-[34px]">
                    {tool.description}
                  </p>
                </div>

                {/* Concrete Format / Deliverable Pills (Even height across all cards) */}
                <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-white/[0.06] min-h-[48px] items-start content-start">
                  {tool.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono text-zinc-300 bg-white/[0.04] border border-white/[0.06] group-hover/card:border-white/15 transition-colors whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full-Width Saturated Launch Button - Pinned to Exact Same Bottom Baseline */}
              <div className="relative z-10 mt-3 pt-1">
                <Link
                  href={tool.href}
                  className={cn(
                    "relative w-full py-2.5 px-4 rounded-full flex items-center justify-center gap-2 uppercase tracking-wider text-xs transition-all duration-300 transform-gpu group-hover/card:scale-[1.02] active:scale-95 shadow-lg overflow-hidden antialiased cursor-pointer",
                    tool.buttonGrad,
                    tool.buttonTextDark ? "text-amber-950 font-black" : "text-white font-bold"
                  )}
                >
                  <div className="absolute inset-0 rounded-full pointer-events-none bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.35)_50%,transparent_75%)] bg-[length:200%_100%] opacity-0 group-hover/card:opacity-100 group-hover/card:animate-[shine_2.5s_linear_infinite] transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center gap-1.5">
                    Open Tool
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/card:translate-x-1" strokeWidth={2.2} />
                  </span>
                </Link>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
