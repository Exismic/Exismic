"use client";

import React from "react";
import Link from "next/link";
import { 
  Palette, 
  ImageIcon, 
  PenTool, 
  MessageSquare, 
  Eraser, 
  Video, 
  Mic2, 
  FileText, 
  Code2, 
  Terminal, 
  Clock, 
  Layers, 
  FileSpreadsheet, 
  Receipt, 
  Film, 
  Files, 
  ArrowRight, 
  Check 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SideIconItem {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
}

interface ToolItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  bgClass: string;
  borderClass: string;
  hoverBorder: string;
}

interface FunctionalArea {
  id: string;
  tag: string;
  capabilities: string;
  title: string;
  titleGradient: string;
  description: string;
  cardAuraTop: string;
  cardAuraBottom: string;
  borderGradient: string;
  conicGradient: string;
  laserStops: [string, string, string];
  dotColor: string;
  badgeStyle: string;
  statusBadge: string;
  deliverableColor: string;
  deliverableBadge: string;
  mainButtonGrad: string;
  mainButtonText: string;
  primaryHref: string;
  primaryIcon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  sideIcons: [SideIconItem, SideIconItem, SideIconItem, SideIconItem];
  tools: ToolItem[];
}

const FUNCTIONAL_AREAS: FunctionalArea[] = [
  {
    id: "create",
    tag: "CREATE SOMETHING",
    capabilities: "Image Generation · Brand Design · AI Copywriting",
    title: "Images, graphics, and writing",
    titleGradient: "bg-gradient-to-r from-cyan-300 via-amber-200 to-emerald-300 drop-shadow-[0_2px_15px_rgba(6,182,212,0.35)]",
    description: "Generate original brand emblems, high-resolution artwork, video scripts, and social posts from simple plain English prompts.",
    cardAuraTop: "bg-cyan-500/35",
    cardAuraBottom: "bg-amber-500/30",
    borderGradient: "bg-gradient-to-br from-cyan-400 via-amber-400 to-emerald-400 shadow-[0_0_40px_rgba(6,182,212,0.35),0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_55px_rgba(6,182,212,0.55),0_0_45px_rgba(245,158,11,0.4)]",
    conicGradient: "conic-gradient(from 0deg, #06b6d4, #f59e0b 30%, #10b981 65%, #ec4899 90%, #06b6d4 100%)",
    laserStops: ["#06b6d4", "#f59e0b", "#10b981"],
    dotColor: "#22d3ee",
    badgeStyle: "bg-cyan-500/15 border-cyan-400/40 text-cyan-300",
    statusBadge: "bg-cyan-500/15 border-cyan-400/40 text-cyan-200",
    deliverableColor: "text-amber-300",
    deliverableBadge: "Vector SVG · 4K PNG · Markdown",
    mainButtonGrad: "bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)]",
    mainButtonText: "Explore image tools",
    primaryHref: "/category/image",
    primaryIcon: ImageIcon,
    sideIcons: [
      { icon: ImageIcon, label: "Images", color: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-400/50", glow: "shadow-[0_0_10px_rgba(6,182,212,0.35)]" },
      { icon: Palette, label: "Graphics", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-400/50", glow: "shadow-[0_0_10px_rgba(245,158,11,0.35)]" },
      { icon: PenTool, label: "Writing", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-400/50", glow: "shadow-[0_0_10px_rgba(16,185,129,0.35)]" },
      { icon: MessageSquare, label: "Social", color: "text-pink-400", bg: "bg-pink-500/20", border: "border-pink-400/50", glow: "shadow-[0_0_10px_rgba(236,72,153,0.35)]" },
    ],
    tools: [
      { name: "Logo Generator", href: "/tools/ai/logo", icon: Palette, color: "text-amber-300", bgClass: "bg-amber-500/20", borderClass: "border-amber-400/40", hoverBorder: "hover:border-amber-400/60" },
      { name: "Image Generator", href: "/tools/ai/img-gen", icon: ImageIcon, color: "text-cyan-300", bgClass: "bg-cyan-500/20", borderClass: "border-cyan-400/40", hoverBorder: "hover:border-cyan-400/60" },
      { name: "AI Writer", href: "/tools/ai/writer", icon: PenTool, color: "text-emerald-300", bgClass: "bg-emerald-500/20", borderClass: "border-emerald-400/40", hoverBorder: "hover:border-emerald-400/60" },
      { name: "Social Captions", href: "/tools/social-caption-generator", icon: MessageSquare, color: "text-pink-300", bgClass: "bg-pink-500/20", borderClass: "border-pink-400/40", hoverBorder: "hover:border-pink-400/60" },
    ],
  },
  {
    id: "edit",
    tag: "EDIT SOMETHING",
    capabilities: "Background Cutouts · Video Clips · Audio Stems",
    title: "Photos, audio, video, and PDFs",
    titleGradient: "bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 drop-shadow-[0_2px_15px_rgba(168,85,247,0.35)]",
    description: "Cut out distracting backgrounds, split audio tracks into isolated vocals and music, trim video files, and scan text from scanned PDFs.",
    cardAuraTop: "bg-cyan-500/35",
    cardAuraBottom: "bg-purple-500/35",
    borderGradient: "bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_40px_rgba(168,85,247,0.35),0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_55px_rgba(168,85,247,0.55),0_0_45px_rgba(6,182,212,0.4)]",
    conicGradient: "conic-gradient(from 0deg, #06b6d4, #a855f7 35%, #ec4899 70%, #3b82f6 90%, #06b6d4 100%)",
    laserStops: ["#06b6d4", "#a855f7", "#ec4899"],
    dotColor: "#c084fc",
    badgeStyle: "bg-purple-500/15 border-purple-400/40 text-purple-300",
    statusBadge: "bg-purple-500/15 border-purple-400/40 text-purple-200",
    deliverableColor: "text-purple-300",
    deliverableBadge: "Transparent PNG · MP3 Stems · Cut Video",
    mainButtonGrad: "bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)]",
    mainButtonText: "Explore media tools",
    primaryHref: "/category/video",
    primaryIcon: Eraser,
    sideIcons: [
      { icon: Eraser, label: "Cutout", color: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-400/50", glow: "shadow-[0_0_10px_rgba(6,182,212,0.35)]" },
      { icon: Video, label: "Video", color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-400/50", glow: "shadow-[0_0_10px_rgba(168,85,247,0.35)]" },
      { icon: Mic2, label: "Audio", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-400/50", glow: "shadow-[0_0_10px_rgba(168,85,247,0.35)]" },
      { icon: FileText, label: "OCR", color: "text-sky-400", bg: "bg-sky-500/20", border: "border-sky-400/50", glow: "shadow-[0_0_10px_rgba(56,189,248,0.35)]" },
    ],
    tools: [
      { name: "Background Remover", href: "/tools/image/eraser", icon: Eraser, color: "text-cyan-300", bgClass: "bg-cyan-500/20", borderClass: "border-cyan-400/40", hoverBorder: "hover:border-cyan-400/60" },
      { name: "Vocal Remover", href: "/tools/audio/vocal-remover", icon: Mic2, color: "text-emerald-300", bgClass: "bg-emerald-500/20", borderClass: "border-emerald-400/40", hoverBorder: "hover:border-emerald-400/60" },
      { name: "Video Trimmer", href: "/tools/video/trimmer", icon: Video, color: "text-purple-300", bgClass: "bg-purple-500/20", borderClass: "border-purple-400/40", hoverBorder: "hover:border-purple-400/60" },
      { name: "Text Scanner (OCR)", href: "/tools/pdf/ocr", icon: FileText, color: "text-sky-300", bgClass: "bg-sky-500/20", borderClass: "border-sky-400/40", hoverBorder: "hover:border-sky-400/60" },
    ],
  },
  {
    id: "build",
    tag: "BUILD SOMETHING",
    capabilities: "Next.js 15 Blueprints · TypeScript Types · SVG Vectors",
    title: "Web code, repositories, and utilities",
    titleGradient: "bg-gradient-to-r from-purple-300 via-blue-300 to-emerald-300 drop-shadow-[0_2px_15px_rgba(59,130,246,0.35)]",
    description: "Turn ideas into clean website blueprints and download full Next.js 15 starter projects with TypeScript, Tailwind, and zero setup errors.",
    cardAuraTop: "bg-purple-500/35",
    cardAuraBottom: "bg-blue-500/35",
    borderGradient: "bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-400 shadow-[0_0_40px_rgba(59,130,246,0.35),0_0_30px_rgba(168,85,247,0.25)] hover:shadow-[0_0_55px_rgba(59,130,246,0.55),0_0_40px_rgba(168,85,247,0.4)]",
    conicGradient: "conic-gradient(from 0deg, #a855f7, #3b82f6 35%, #10b981 70%, #6366f1 90%, #a855f7 100%)",
    laserStops: ["#a855f7", "#3b82f6", "#10b981"],
    dotColor: "#60a5fa",
    badgeStyle: "bg-blue-500/15 border-blue-400/40 text-blue-300",
    statusBadge: "bg-blue-500/15 border-blue-400/40 text-blue-200",
    deliverableColor: "text-blue-300",
    deliverableBadge: "Next.js 15 .ZIP · TypeScript · Vector SVG",
    mainButtonGrad: "bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400 text-white shadow-[0_0_25px_rgba(59,130,246,0.45)] hover:shadow-[0_0_40px_rgba(59,130,246,0.7)]",
    mainButtonText: "Explore developer tools",
    primaryHref: "/category/developer",
    primaryIcon: Code2,
    sideIcons: [
      { icon: Code2, label: "Next.js", color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-400/50", glow: "shadow-[0_0_10px_rgba(168,85,247,0.35)]" },
      { icon: Terminal, label: "Types", color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-400/50", glow: "shadow-[0_0_10px_rgba(59,130,246,0.35)]" },
      { icon: Clock, label: "Cron", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-400/50", glow: "shadow-[0_0_10px_rgba(245,158,11,0.35)]" },
      { icon: Layers, label: "Vector", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-400/50", glow: "shadow-[0_0_10px_rgba(16,185,129,0.35)]" },
    ],
    tools: [
      { name: "Landing Page to Next.js", href: "/tools/landing-page-generator", icon: Code2, color: "text-purple-300", bgClass: "bg-purple-500/20", borderClass: "border-purple-400/40", hoverBorder: "hover:border-purple-400/60" },
      { name: "JSON to TypeScript", href: "/tools/developer/json-to-types", icon: Terminal, color: "text-blue-300", bgClass: "bg-blue-500/20", borderClass: "border-blue-400/40", hoverBorder: "hover:border-blue-400/60" },
      { name: "Cron Schedule Generator", href: "/tools/developer/cron-generator", icon: Clock, color: "text-amber-300", bgClass: "bg-amber-500/20", borderClass: "border-amber-400/40", hoverBorder: "hover:border-amber-400/60" },
      { name: "SVG Vectorizer", href: "/tools/image/vectorizer", icon: Layers, color: "text-emerald-300", bgClass: "bg-emerald-500/20", borderClass: "border-emerald-400/40", hoverBorder: "hover:border-emerald-400/60" },
    ],
  },
  {
    id: "work",
    tag: "WORK WITH LOTS OF FILES",
    capabilities: "Bulk QR Codes · Tax Invoices · Study Summaries",
    title: "Spreadsheets, invoices, and documents",
    titleGradient: "bg-gradient-to-r from-emerald-300 via-amber-200 to-rose-300 drop-shadow-[0_2px_15px_rgba(16,185,129,0.35)]",
    description: "Automate practical busywork. Batch-generate hundreds of branded QR codes from CSV files, create client invoices, and summarize long videos.",
    cardAuraTop: "bg-emerald-500/35",
    cardAuraBottom: "bg-amber-500/30",
    borderGradient: "bg-gradient-to-br from-emerald-400 via-amber-400 to-rose-400 shadow-[0_0_40px_rgba(16,185,129,0.35),0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_55px_rgba(16,185,129,0.55),0_0_40px_rgba(245,158,11,0.4)]",
    conicGradient: "conic-gradient(from 0deg, #10b981, #f59e0b 35%, #f43f5e 70%, #06b6d4 90%, #10b981 100%)",
    laserStops: ["#10b981", "#f59e0b", "#f43f5e"],
    dotColor: "#34d399",
    badgeStyle: "bg-emerald-500/15 border-emerald-400/40 text-emerald-300",
    statusBadge: "bg-emerald-500/15 border-emerald-400/40 text-emerald-200",
    deliverableColor: "text-emerald-300",
    deliverableBadge: "Batch .ZIP · PDF Invoice · Study Notes",
    mainButtonGrad: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-[0_0_25px_rgba(16,185,129,0.45)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)]",
    mainButtonText: "Explore document tools",
    primaryHref: "/category/productivity",
    primaryIcon: FileSpreadsheet,
    sideIcons: [
      { icon: FileSpreadsheet, label: "Batch QR", color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-400/50", glow: "shadow-[0_0_10px_rgba(16,185,129,0.35)]" },
      { icon: Receipt, label: "Invoice", color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-400/50", glow: "shadow-[0_0_10px_rgba(245,158,11,0.35)]" },
      { icon: Film, label: "Summary", color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-400/50", glow: "shadow-[0_0_10px_rgba(244,63,94,0.35)]" },
      { icon: Files, label: "PDFs", color: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-400/50", glow: "shadow-[0_0_10px_rgba(6,182,212,0.35)]" },
    ],
    tools: [
      { name: "Bulk QR Spreadsheets", href: "/tools/qr-code?mode=bulk", icon: FileSpreadsheet, color: "text-emerald-300", bgClass: "bg-emerald-500/20", borderClass: "border-emerald-400/40", hoverBorder: "hover:border-emerald-400/60" },
      { name: "Invoice Generator", href: "/tools/invoice-generator", icon: Receipt, color: "text-amber-300", bgClass: "bg-amber-500/20", borderClass: "border-amber-400/40", hoverBorder: "hover:border-amber-400/60" },
      { name: "YouTube Summarizer", href: "/tools/youtube-summarizer", icon: Film, color: "text-rose-300", bgClass: "bg-rose-500/20", borderClass: "border-rose-400/40", hoverBorder: "hover:border-rose-400/60" },
      { name: "PDF Merger", href: "/tools/pdf/merger", icon: Files, color: "text-cyan-300", bgClass: "bg-cyan-500/20", borderClass: "border-cyan-400/40", hoverBorder: "hover:border-cyan-400/60" },
    ],
  },
];

export function WhatExismicDoes() {
  return (
    <section id="capabilities" className="pt-4 pb-6 sm:pt-6 sm:pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full scroll-mt-24">
      
      {/* Section Header */}
      <div className="flex flex-col items-center mb-7 sm:mb-10 text-center space-y-2.5 max-w-3xl mx-auto">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
          EXISMIC
        </span>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.18] sm:leading-[1.15] py-0.5 pb-2">
          Four ways to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-400 inline-block pb-1">
            get work done.
          </span>
        </h2>

        <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed">
          Start with a single tool, or start with what you are trying to make. Everything is organized around real output.
        </p>
      </div>

      {/* 4 Multi-Discipline Cards Grid with Zero Waste Gap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {FUNCTIONAL_AREAS.map((area) => {
          const PrimaryToolIcon = area.primaryIcon;
          return (
            <div
              key={area.id}
              className={cn(
                "group relative p-[2px] rounded-[1.75rem] sm:rounded-[2rem] transition-all duration-500 transform-gpu hover:scale-[1.012]",
                area.borderGradient
              )}
            >
              {/* Inner Card Container - Compact & Zero Waste Gap */}
              <div className="relative h-full w-full p-4 sm:p-5.5 pb-3.5 sm:pb-4.5 rounded-[calc(1.75rem-2px)] sm:rounded-[calc(2rem-2px)] bg-gradient-to-b from-[#0e0f17]/98 via-[#0a0a10]/98 to-[#06060a]/98 backdrop-blur-3xl overflow-hidden flex flex-col justify-between gap-3">
                
                {/* 1. Continuous Hover Shine Sweep — z-30 pointer-events-none to sweep over full card */}
                <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-30">
                  <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                </div>

                {/* 2. Dual Corner Ambient Glowing Mesh Auras */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                  <div
                    className={cn(
                      "absolute -top-16 -left-16 w-80 h-80 rounded-full blur-[80px] transition-all duration-700 opacity-30 group-hover:opacity-60",
                      area.cardAuraTop
                    )}
                  />
                  <div
                    className={cn(
                      "absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[90px] transition-all duration-700 opacity-25 group-hover:opacity-50",
                      area.cardAuraBottom
                    )}
                  />
                  {/* Colored Micro Dot Matrix Watermark Pattern */}
                  <div 
                    className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500"
                    style={{
                      backgroundImage: `radial-gradient(${area.dotColor} 1.5px, transparent 1.5px)`,
                      backgroundSize: "22px 22px",
                    }}
                  />
                </div>

                {/* 3. Four Ambient Watermark Icons on 4 Sides/Corners */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                  {React.createElement(area.sideIcons[0].icon, {
                    className: cn("absolute -top-2 -left-2 w-16 h-16 opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110", area.sideIcons[0].color),
                    strokeWidth: 1.5
                  })}
                  {React.createElement(area.sideIcons[1].icon, {
                    className: cn("absolute -top-2 -right-2 w-16 h-16 opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110", area.sideIcons[1].color),
                    strokeWidth: 1.5
                  })}
                  {React.createElement(area.sideIcons[2].icon, {
                    className: cn("absolute -bottom-2 -right-2 w-16 h-16 opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110", area.sideIcons[2].color),
                    strokeWidth: 1.5
                  })}
                  {React.createElement(area.sideIcons[3].icon, {
                    className: cn("absolute -bottom-2 -left-2 w-16 h-16 opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110", area.sideIcons[3].color),
                    strokeWidth: 1.5
                  })}
                </div>

                {/* Card Top & Middle Content */}
                <div className="relative z-20 space-y-2.5">
                  
                  {/* Header row: Circling Neon Gradient 4-Icon Hub + Tag Badge + 4 Tools */}
                  <div className="flex items-center justify-between gap-3">
                    
                    <div className="flex items-center gap-3">
                      
                      {/* Circling Gradient Neon Ring around the 4 Icons */}
                      <div className="relative p-[2.5px] rounded-2xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-2xl">
                        
                        {/* 1. Continuous Circling Gradient Neon Line (Rotating Conic Disk) */}
                        <div 
                          className="absolute -inset-[150%] animate-spin-smooth"
                          style={{
                            background: area.conicGradient,
                          }} 
                        />
                        
                        {/* 2. Neon Halo Diffusion (Glowing Bloom) */}
                        <div 
                          className="absolute -inset-[100%] blur-[4px] animate-spin-smooth opacity-90"
                          style={{
                            background: area.conicGradient,
                          }} 
                        />

                        {/* 3. Deep Obsidian Core holding 4 Icons on 4 Sides */}
                        <div className="relative z-10 p-1.5 rounded-[13.5px] bg-[#090a12]/95 backdrop-blur-xl border border-white/15">
                          <div className="grid grid-cols-2 gap-1.5">
                            {area.sideIcons.map((side, sIdx) => {
                              const SideIcon = side.icon;
                              return (
                                <div
                                  key={sIdx}
                                  className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-300 shadow-sm hover:scale-115",
                                    side.bg,
                                    side.border,
                                    side.glow
                                  )}
                                  title={side.label}
                                >
                                  <SideIcon className={cn("w-3.5 h-3.5", side.color)} strokeWidth={2.2} />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 4. Active Circling Neon Laser Pulse Overlay */}
                        <svg 
                          className="absolute inset-0 w-full h-full pointer-events-none z-20"
                          viewBox="0 0 72 72"
                          fill="none"
                        >
                          <defs>
                            <linearGradient id={`neon-laser-${area.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                              <stop offset="25%" stopColor={area.laserStops[0]} stopOpacity="1" />
                              <stop offset="65%" stopColor={area.laserStops[1]} stopOpacity="0.8" />
                              <stop offset="100%" stopColor={area.laserStops[2]} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <rect 
                            x="1.5" 
                            y="1.5" 
                            width="69" 
                            height="69" 
                            rx="15" 
                            stroke={`url(#neon-laser-${area.id})`}
                            strokeWidth="2.2"
                            strokeDasharray="45 195"
                            className="animate-laser-dash"
                          />
                        </svg>

                      </div>

                      {/* Studio Tag & Capabilities */}
                      <div className="space-y-0.5">
                        <span className={cn(
                          "text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm inline-block",
                          area.badgeStyle
                        )}>
                          {area.tag}
                        </span>
                        <div className="text-[10.5px] font-medium text-zinc-400 hidden sm:block">
                          {area.capabilities}
                        </div>
                      </div>
                    </div>

                    {/* Simple, Non-Tech Badge: "4 Tools" */}
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold shadow-sm shrink-0",
                      area.statusBadge
                    )}>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>4 Tools</span>
                    </div>

                  </div>

                  {/* Title & Description with Real Multi-Tone Gradients */}
                  <div>
                    <h3 className={cn("text-lg sm:text-xl font-black tracking-tight leading-snug text-transparent bg-clip-text transition-colors", area.titleGradient)}>
                      {area.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-zinc-400 mt-1 leading-relaxed font-normal">
                      {area.description}
                    </p>
                  </div>

                  {/* 4 Tactile Tool Buttons with Cool Hover Animations */}
                  <div className="pt-0.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {area.tools.map((tool) => {
                      const ToolIcon = tool.icon;
                      return (
                        <Link
                          key={tool.name}
                          href={tool.href}
                          className={cn(
                            "group/btn relative px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between transition-all duration-300 transform-gpu hover:scale-[1.025] active:scale-95 shadow-md overflow-hidden",
                            "bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-transparent hover:from-white/[0.12] hover:via-white/[0.08] hover:to-white/[0.04] border-white/10 hover:border-white/30",
                            "hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]",
                            tool.hoverBorder
                          )}
                        >
                          {/* 1. Interactive Shimmer Light Ray on Hover */}
                          <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                          </div>

                          <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                            {/* Icon with interactive scale & slight rotation */}
                            <div className={cn(
                              "w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex items-center justify-center border shrink-0 transition-all duration-300 group-hover/btn:scale-115 group-hover/btn:rotate-6 shadow-sm",
                              tool.bgClass,
                              tool.borderClass
                            )}>
                              <ToolIcon className={cn("w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:scale-110", tool.color)} strokeWidth={2.2} />
                            </div>
                            <span className="text-zinc-200 group-hover/btn:text-white transition-colors truncate text-xs font-bold tracking-wide">
                              {tool.name}
                            </span>
                          </div>
                          
                          {/* Arrow with elastic bounce */}
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-white group-hover/btn:translate-x-1.5 group-hover/btn:scale-110 transition-all duration-300 shrink-0 ml-1.5 relative z-10" strokeWidth={2.2} />
                        </Link>
                      );
                    })}
                  </div>

                </div>

                {/* Tightly Integrated Bottom Action Dock - ZERO Waste Gap */}
                <div className="relative z-20 space-y-2 mt-auto pt-1">
                  
                  {/* Compact Deliverable Row - Flush & Clean */}
                  <div className="flex items-center justify-between text-[11px] font-mono px-1">
                    <span className="text-zinc-400 text-[10.5px]">Output formats:</span>
                    <span className={cn(
                      "font-semibold text-[10.5px] px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-sm", 
                      area.deliverableColor
                    )}>
                      {area.deliverableBadge}
                    </span>
                  </div>

                  {/* Flagship Launch Pill Button with Cool Animated Liquid Neon & Sweeping Laser Shimmer */}
                  <div className="relative group/launch">
                    {/* Pulsing Neon Underglow Aura */}
                    <div 
                      className={cn(
                        "absolute -inset-0.5 rounded-full blur-md opacity-45 group-hover/launch:opacity-85 transition-opacity duration-500 animate-gradient-flow",
                        area.mainButtonGrad
                      )} 
                    />

                    <Link
                      href={area.primaryHref}
                      className={cn(
                        "relative w-full py-2.5 sm:py-3 px-5 rounded-full flex items-center justify-center gap-2.5 font-bold uppercase tracking-wider text-xs sm:text-[12.5px] transition-all duration-300 transform-gpu hover:scale-[1.02] active:scale-95 shadow-xl cursor-pointer text-white overflow-hidden animate-gradient-flow antialiased",
                        area.mainButtonGrad
                      )}
                    >
                      {/* Sweeping Periodic Laser Shimmer */}
                      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      </div>

                      {/* Tool Icon with interactive spring rotation */}
                      <PrimaryToolIcon className="w-4 h-4 shrink-0 text-white relative z-10 transition-transform duration-300 group-hover/launch:rotate-[-8deg] group-hover/launch:scale-120" strokeWidth={2} />
                      <span className="relative z-10">{area.mainButtonText}</span>
                      <ArrowRight className="w-4 h-4 shrink-0 text-white relative z-10 transition-transform duration-300 group-hover/launch:translate-x-1.5" strokeWidth={2} />
                    </Link>
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
