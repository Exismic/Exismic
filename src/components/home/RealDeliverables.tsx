"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  FolderArchive, 
  Code2, 
  FileSpreadsheet, 
  Music, 
  Eraser, 
  Search, 
  ArrowRight,
  Download,
  Check,
  Palette,
  Layers,
  Terminal,
  Globe,
  QrCode,
  Mic2,
  Headphones,
  ImageIcon,
  Crop,
  ScanText,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DeliverableItem {
  id: string;
  name: string;
  extension: string;
  tag: string;
  description: string;
  specs: string[];
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  watermarkIcons: [
    React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>,
    React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>
  ];
  accentColor: string;
  dotColor: string;
  borderGradient: string;
  conicGradient: string;
  laserStops: [string, string, string];
  cardAura: string;
  titleGradient: string;
  buttonGrad: string;
  toolUrl: string;
  actionText: string;
}

const DELIVERABLES: DeliverableItem[] = [
  {
    id: "brand-kit",
    name: "Startup Brand Kit",
    extension: ".ZIP",
    tag: "Vector + Favicons",
    description: "A complete branding pack with scalable vector SVG, 3 transparent PNG resolutions (up to 2048px), valid binary favicons, social avatars, and a Brand Guidelines PDF.",
    specs: ["vector/logo.svg", "favicons/favicon.ico", "Brand-Guidelines.pdf"],
    icon: FolderArchive,
    watermarkIcons: [Palette, Layers],
    accentColor: "#f59e0b",
    dotColor: "#f59e0b",
    borderGradient: "bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_45px_rgba(245,158,11,0.45)]",
    conicGradient: "conic-gradient(from 0deg, #f59e0b, #fb923c 35%, #f43f5e 70%, #f59e0b 100%)",
    laserStops: ["#f59e0b", "#fb923c", "#f43f5e"],
    cardAura: "bg-amber-500/30",
    titleGradient: "bg-gradient-to-r from-amber-300 via-orange-200 to-rose-300",
    buttonGrad: "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500",
    toolUrl: "/tools/ai/logo?pack=brand-kit",
    actionText: "Make Brand Kit",
  },
  {
    id: "nextjs-starter",
    name: "Next.js 15 Web Repo",
    extension: ".ZIP",
    tag: "Deployable Code",
    description: "Full Next.js 15, React 19, TypeScript, and Tailwind CSS source code. Download the repository, run npm run dev, and deploy to Vercel or your own server.",
    specs: ["app/page.tsx", "package.json", "tailwind.config.ts"],
    icon: Code2,
    watermarkIcons: [Terminal, Globe],
    accentColor: "#a855f7",
    dotColor: "#a855f7",
    borderGradient: "bg-gradient-to-br from-purple-400 via-indigo-500 to-cyan-400 shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:shadow-[0_0_45px_rgba(168,85,247,0.45)]",
    conicGradient: "conic-gradient(from 0deg, #a855f7, #6366f1 35%, #06b6d4 70%, #a855f7 100%)",
    laserStops: ["#a855f7", "#6366f1", "#06b6d4"],
    cardAura: "bg-purple-500/30",
    titleGradient: "bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300",
    buttonGrad: "bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500",
    toolUrl: "/tools/landing-page-generator",
    actionText: "Export Website Code",
  },
  {
    id: "bulk-qr-archive",
    name: "Bulk QR Batch Folder",
    extension: ".ZIP",
    tag: "Spreadsheet Output",
    description: "Dozens of camera-verified QR codes generated from your CSV spreadsheet rows. High-res transparent PNGs and scalable vector SVGs in one organized folder.",
    specs: ["50+ verified QRs", "Custom color themes", "Wi-Fi + Table links"],
    icon: FileSpreadsheet,
    watermarkIcons: [QrCode, FileSpreadsheet],
    accentColor: "#10b981",
    dotColor: "#10b981",
    borderGradient: "bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:shadow-[0_0_45px_rgba(16,185,129,0.45)]",
    conicGradient: "conic-gradient(from 0deg, #10b981, #14b8a6 35%, #06b6d4 70%, #10b981 100%)",
    laserStops: ["#10b981", "#14b8a6", "#06b6d4"],
    cardAura: "bg-emerald-500/30",
    titleGradient: "bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300",
    buttonGrad: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600",
    toolUrl: "/tools/qr-code?mode=bulk",
    actionText: "Batch QR Codes",
  },
  {
    id: "audio-stems",
    name: "Isolated Vocal & Music Stems",
    extension: ".MP3 / .WAV",
    tag: "Clean Audio",
    description: "Separated voice and musical accompaniment tracks from any uploaded audio or video song. Crisp audio files ready for podcasts, remixes, and karaoke.",
    specs: ["vocals-isolated.wav", "music-backing.wav", "Clean split"],
    icon: Music,
    watermarkIcons: [Mic2, Headphones],
    accentColor: "#ec4899",
    dotColor: "#ec4899",
    borderGradient: "bg-gradient-to-br from-pink-400 via-fuchsia-500 to-purple-500 shadow-[0_0_30px_rgba(236,72,153,0.25)] hover:shadow-[0_0_45px_rgba(236,72,153,0.45)]",
    conicGradient: "conic-gradient(from 0deg, #ec4899, #d946ef 35%, #a855f7 70%, #ec4899 100%)",
    laserStops: ["#ec4899", "#d946ef", "#a855f7"],
    cardAura: "bg-pink-500/30",
    titleGradient: "bg-gradient-to-r from-pink-300 via-fuchsia-200 to-purple-300",
    buttonGrad: "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600",
    toolUrl: "/tools/audio/vocal-remover",
    actionText: "Split Audio Stems",
  },
  {
    id: "product-cutout",
    name: "Transparent Product Cutout",
    extension: ".PNG",
    tag: "Transparent PNG",
    description: "Clean photo cutout with hair-level edge detection and zero background color halos. Exported as a transparent PNG ready to drop into product catalogs and ads.",
    specs: ["Clean transparent PNG", "Up to 4K resolution", "Hair edge detection"],
    icon: Eraser,
    watermarkIcons: [ImageIcon, Crop],
    accentColor: "#38bdf8",
    dotColor: "#38bdf8",
    borderGradient: "bg-gradient-to-br from-cyan-400 via-sky-400 to-blue-500 shadow-[0_0_30px_rgba(56,189,248,0.25)] hover:shadow-[0_0_45px_rgba(56,189,248,0.45)]",
    conicGradient: "conic-gradient(from 0deg, #06b6d4, #38bdf8 35%, #3b82f6 70%, #06b6d4 100%)",
    laserStops: ["#06b6d4", "#38bdf8", "#3b82f6"],
    cardAura: "bg-cyan-500/30",
    titleGradient: "bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300",
    buttonGrad: "bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600",
    toolUrl: "/tools/image/eraser",
    actionText: "Remove Background",
  },
  {
    id: "scanned-ocr",
    name: "Editable Document Text",
    extension: ".TXT / .MD",
    tag: "Scanned Extraction",
    description: "Accurate plain text extracted from scanned book pages, paper invoices, and PDFs. Ready to copy to your clipboard or download as clean Markdown.",
    specs: ["Full text recognition", "Preserves paragraph order", "Direct clipboard copy"],
    icon: Search,
    watermarkIcons: [ScanText, FileText],
    accentColor: "#eab308",
    dotColor: "#eab308",
    borderGradient: "bg-gradient-to-br from-amber-400 via-yellow-400 to-emerald-400 shadow-[0_0_30px_rgba(234,179,8,0.25)] hover:shadow-[0_0_45px_rgba(234,179,8,0.45)]",
    conicGradient: "conic-gradient(from 0deg, #f59e0b, #eab308 35%, #10b981 70%, #f59e0b 100%)",
    laserStops: ["#f59e0b", "#eab308", "#10b981"],
    cardAura: "bg-yellow-500/30",
    titleGradient: "bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300",
    buttonGrad: "bg-gradient-to-r from-amber-400 via-yellow-500 to-emerald-500",
    toolUrl: "/tools/pdf/ocr",
    actionText: "Scan Document Text",
  },
];

export function RealDeliverables() {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(DELIVERABLES.length / cardsPerPage);
  const activePage = Math.min(currentPage, totalPages - 1);

  const startItem = activePage * cardsPerPage + 1;
  const endItem = Math.min(DELIVERABLES.length, startItem + cardsPerPage - 1);
  const visibleRange = cardsPerPage > 1
    ? `Files ${startItem}–${endItem} of ${DELIVERABLES.length}`
    : `File ${startItem} of ${DELIVERABLES.length}`;

  const canScrollLeft = activePage > 0;
  const canScrollRight = activePage < totalPages - 1;

  const nextPage = () => {
    if (canScrollRight) {
      setDirection(1);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (canScrollLeft) {
      setDirection(-1);
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToPage = (pageIdx: number) => {
    if (pageIdx !== activePage) {
      setDirection(pageIdx > activePage ? 1 : -1);
      setCurrentPage(pageIdx);
    }
  };

  const visibleItems = DELIVERABLES.slice(activePage * cardsPerPage, (activePage + 1) * cardsPerPage);

  return (
    <section id="deliverables" className="pt-2 pb-3 sm:pt-3 sm:pb-4 px-4 sm:px-6 max-w-7xl mx-auto w-full scroll-mt-24">
      
      {/* Section Header with Luxury Carousel Navigation Console */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 sm:mb-6 gap-6">
        <div className="space-y-2.5 max-w-xl text-center md:text-left">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
            WHAT YOU GET
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.05]">
            Real files.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400">
              Ready to use.
            </span>
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Create something here and take the finished file with you. No watermarks, no locked-in viewers, and no extra export hoops.
          </p>
        </div>

        {/* Luxury Carousel Navigation Console */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 shrink-0">
          
          {/* Glass Jewel Status Capsule */}
          <div className="relative p-[1.5px] rounded-full bg-gradient-to-r from-amber-400/40 via-rose-500/40 to-purple-500/40 shadow-[0_4px_25px_rgba(0,0,0,0.7),0_0_20px_rgba(244,63,94,0.2)]">
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0a0c16]/95 backdrop-blur-2xl">
              
              {/* Pulsing Luminous Beacon */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-amber-400 to-rose-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
              </span>

              {/* Range text */}
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 select-none">
                {visibleRange}
              </span>

              {/* Vertical divider */}
              <div className="w-px h-3.5 bg-white/20 shrink-0" />

              {/* Page Pill indicator */}
              <span className="text-[11px] font-mono text-zinc-400 font-semibold uppercase tracking-wider">
                Page {activePage + 1}/{totalPages}
              </span>

            </div>
          </div>

          {/* Navigation Chevron Pill Group */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#0a0c16]/90 border border-white/10 backdrop-blur-xl shadow-lg">
            
            {/* Previous Button */}
            <button
              type="button"
              onClick={prevPage}
              disabled={!canScrollLeft}
              aria-label="Previous files"
              className={cn(
                "w-11 h-11 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300",
                canScrollLeft
                  ? "bg-white/[0.08] hover:bg-gradient-to-r hover:from-amber-400 hover:to-rose-400 text-white hover:text-black hover:scale-110 active:scale-95 shadow-md cursor-pointer border border-white/15"
                  : "text-zinc-600 cursor-not-allowed opacity-30"
              )}
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextPage}
              disabled={!canScrollRight}
              aria-label="Next files"
              className={cn(
                "w-11 h-11 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300",
                canScrollRight
                  ? "bg-white/[0.08] hover:bg-gradient-to-r hover:from-rose-400 hover:to-purple-400 text-white hover:text-black hover:scale-110 active:scale-95 shadow-md cursor-pointer border border-white/15"
                  : "text-zinc-600 cursor-not-allowed opacity-30"
              )}
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>

          </div>

        </div>
      </div>

      {/* 6 Real Deliverables Paginated Grid with Fluid Framer Motion Transitions */}
      <div className="relative overflow-visible">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={activePage}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? 30 : -30,
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
              },
              exit: (dir: number) => ({
                x: dir > 0 ? -30 : 30,
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch w-full"
          >
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative p-[2px] rounded-3xl transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-full shrink-0 flex flex-col",
                    item.borderGradient
                  )}
                >
              {/* Inner Card Container */}
              <div className="relative h-full w-full p-5 sm:p-6 rounded-[calc(1.5rem-2px)] bg-gradient-to-b from-[#0e0f17]/98 via-[#0a0a10]/98 to-[#06060a]/98 backdrop-blur-3xl overflow-hidden flex flex-col justify-between gap-4">
                
                {/* 1. Continuous Hover Shine Sweep */}
                <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10">
                  <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                {/* 2. Ambient Glowing Mesh Aura + Micro Dot Matrix Watermark Pattern */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                  <div
                    className={cn(
                      "absolute -top-12 -left-12 w-64 h-64 rounded-full blur-[70px] transition-all duration-700 opacity-25 group-hover:opacity-55",
                      item.cardAura
                    )}
                  />
                  {/* Colored Micro Dot Matrix Watermark Pattern that brightens on hover */}
                  <div 
                    className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.14] transition-opacity duration-500"
                    style={{
                      backgroundImage: `radial-gradient(${item.dotColor} 1.5px, transparent 1.5px)`,
                      backgroundSize: "22px 22px",
                    }}
                  />
                </div>

                {/* 3. Ambient Watermark Icons floating on Corners/Sides that illuminate on hover */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                  {/* Top-Right Watermark Icon */}
                  {React.createElement(item.watermarkIcons[0], {
                    className: "absolute -top-2 -right-2 w-20 h-20 opacity-[0.04] group-hover:opacity-[0.12] transition-all duration-500 group-hover:scale-110",
                    style: { color: item.accentColor },
                    strokeWidth: 1.5
                  })}
                  {/* Bottom-Right Watermark Icon */}
                  {React.createElement(item.watermarkIcons[1], {
                    className: "absolute -bottom-2 -right-2 w-20 h-20 opacity-[0.03] group-hover:opacity-[0.10] transition-all duration-500 group-hover:scale-110",
                    style: { color: item.accentColor },
                    strokeWidth: 1.5
                  })}
                </div>

                {/* Top Content */}
                <div className="relative z-20 space-y-3.5">
                  
                  {/* Header: Circling Neon Icon + Extension & Tag Badges */}
                  <div className="flex items-center justify-between gap-3">
                    
                    {/* Circling Gradient Neon Ring around the Deliverable Icon */}
                    <div className="relative p-[2.5px] rounded-2xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-xl">
                      
                      {/* Rotating Conic Disk */}
                      <div 
                        className="absolute -inset-[150%] animate-spin-smooth"
                        style={{
                          background: item.conicGradient,
                        }} 
                      />

                      {/* Neon Halo Diffusion */}
                      <div 
                        className="absolute -inset-[100%] blur-[4px] animate-spin-smooth opacity-80"
                        style={{
                          background: item.conicGradient,
                        }} 
                      />

                      {/* Deep Obsidian Core holding the Icon */}
                      <div className="relative z-10 w-11 h-11 rounded-[13.5px] bg-[#090a12]/95 backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-inner">
                        <Icon 
                          className="w-5 h-5 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6"
                          style={{ color: item.accentColor }}
                          strokeWidth={2}
                        />
                      </div>

                      {/* Active Circling Neon Laser Pulse Overlay */}
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none z-20"
                        viewBox="0 0 54 54"
                        fill="none"
                      >
                        <defs>
                          <linearGradient id={`laser-deliverable-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                            <stop offset="25%" stopColor={item.laserStops[0]} stopOpacity="1" />
                            <stop offset="65%" stopColor={item.laserStops[1]} stopOpacity="0.8" />
                            <stop offset="100%" stopColor={item.laserStops[2]} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <rect 
                          x="1.5" 
                          y="1.5" 
                          width="51" 
                          height="51" 
                          rx="14" 
                          stroke={`url(#laser-deliverable-${item.id})`}
                          strokeWidth="2"
                          strokeDasharray="35 140"
                          className="animate-laser-dash"
                        />
                      </svg>

                    </div>

                    {/* Extension and Format Tag Badges */}
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                      <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-zinc-200">
                        {item.extension}
                      </span>
                      <span 
                        className="px-2.5 py-1 rounded-full border shadow-xs"
                        style={{
                          backgroundColor: `${item.accentColor}15`,
                          borderColor: `${item.accentColor}35`,
                          color: item.accentColor,
                        }}
                      >
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className={cn("text-lg sm:text-xl font-bold tracking-tight text-transparent bg-clip-text", item.titleGradient)}>
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-zinc-400 mt-1.5 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Checklist Specs */}
                  <div className="space-y-1.5 pt-1">
                    {item.specs.map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: item.accentColor }} strokeWidth={2.5} />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Bottom Action Pill Button with Flowing Gradient & Laser Sweep */}
                <div className="pt-3 mt-auto">
                  <div className="relative group/launch">
                    {/* Pulsing Neon Underglow Aura */}
                    <div 
                      className={cn(
                        "absolute -inset-0.5 rounded-full blur-md opacity-40 group-hover/launch:opacity-80 transition-opacity duration-500 animate-gradient-flow",
                        item.buttonGrad
                      )} 
                    />

                    <Link
                      href={item.toolUrl}
                      className={cn(
                        "relative w-full min-h-11 sm:min-h-0 py-2.5 px-4 rounded-full flex items-center justify-between font-bold uppercase tracking-wider text-xs transition-all duration-300 transform-gpu hover:scale-[1.015] active:scale-95 shadow-xl cursor-pointer text-white overflow-hidden animate-gradient-flow antialiased",
                        item.buttonGrad
                      )}
                    >
                      {/* Sweeping Periodic Laser Shimmer */}
                      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      </div>

                      <div className="flex items-center gap-2 relative z-10">
                        <Download className="w-3.5 h-3.5 text-white transition-transform duration-300 group-hover/launch:scale-115" strokeWidth={2} />
                        <span>{item.actionText}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-white relative z-10 transition-transform duration-300 group-hover/launch:translate-x-1.5" strokeWidth={2} />
                    </Link>
                  </div>
                </div>

              </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Luxury Pagination Page Pill Track */}
      <div className="flex flex-wrap items-center justify-center gap-0 sm:gap-3 pt-3 sm:pt-4">
        {Array.from({ length: totalPages }).map((_, pageIdx) => {
          const isActive = activePage === pageIdx;
          return (
            <button
              key={pageIdx}
              type="button"
              onClick={() => goToPage(pageIdx)}
              aria-label={`Jump to page ${pageIdx + 1}`}
              className="group w-11 sm:w-auto min-h-11 sm:min-h-0 py-2 px-1.5 cursor-pointer flex items-center justify-center gap-2.5 transition-all"
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={cn(
                  "block h-2 rounded-full transition-all duration-500",
                  isActive
                    ? "w-8 sm:w-20 bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 shadow-[0_0_18px_rgba(244,63,94,0.7)]"
                    : "w-4 sm:w-8 bg-white/15 group-hover:bg-white/35"
                )}
              />
              <span className={cn(
                "text-[10px] font-mono uppercase tracking-wider font-bold transition-colors duration-300 hidden sm:inline",
                isActive ? "text-zinc-200" : "text-zinc-500 group-hover:text-zinc-300"
              )}>
                Page {pageIdx + 1}
              </span>
            </button>
          );
        })}
      </div>

    </section>
  );
}
