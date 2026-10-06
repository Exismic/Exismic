"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Rocket, 
  Video, 
  Store, 
  FileText, 
  ArrowRight, 
  CheckCircle2,
  Film,
  UserCheck,
  Share2,
  Scissors,
  Eraser,
  Palette,
  FileSpreadsheet,
  Receipt,
  Code2,
  Terminal,
  Layers,
  Files,
  ScanText,
  PenTool,
  Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  step: number;
  toolName: string;
  actionDesc: string;
  outputName: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  accentColor: string;
  cardBorder: string;
  cardBg: string;
  buttonGrad: string;
  buttonTextDark?: boolean;
  badgeStyle: string;
  dotColor: string;
}

interface WorkflowItem {
  id: string;
  roleName: string;
  badge: string;
  goalTitle: string;
  titleGradient: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  accentColor: string;
  activeTabGrad: string;
  steps: WorkflowStep[];
  outcomeSummary: string;
}

const WORKFLOWS: WorkflowItem[] = [
  {
    id: "creator",
    roleName: "Content Creator",
    badge: "Video & Social",
    goalTitle: "Make polished videos & social posts faster",
    titleGradient: "bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300",
    description: "Break down reference videos, clean up your script, trim your video clips, and format social captions from start to finish.",
    icon: Video,
    accentColor: "#a855f7",
    activeTabGrad: "bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.45)]",
    steps: [
      { 
        step: 1, 
        toolName: "YouTube Summarizer", 
        actionDesc: "Extract notes and timed transcript", 
        outputName: "Study notes (.MD)", 
        href: "/tools/youtube-summarizer",
        icon: Film,
        accentColor: "#f43f5e",
        cardBorder: "border-2 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.25)] hover:border-rose-400 hover:shadow-[0_0_40px_rgba(244,63,94,0.45)]",
        cardBg: "bg-gradient-to-b from-[#18080c]/95 via-[#0e0407]/95 to-[#060203]/95",
        buttonGrad: "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]",
        badgeStyle: "bg-rose-400/15 border-rose-400/40 text-rose-300",
        dotColor: "#f43f5e"
      },
      { 
        step: 2, 
        toolName: "AI Text Humanizer", 
        actionDesc: "Rewrite script into natural voice", 
        outputName: "Human script", 
        href: "/tools/ai-humanizer",
        icon: UserCheck,
        accentColor: "#f59e0b",
        cardBorder: "border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:border-amber-300 hover:shadow-[0_0_45px_rgba(245,158,11,0.55)]",
        cardBg: "bg-gradient-to-b from-[#181106]/95 via-[#0e0a03]/95 to-[#080501]/95",
        buttonGrad: "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-amber-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]",
        buttonTextDark: true,
        badgeStyle: "bg-amber-400/15 border-amber-400/50 text-amber-300",
        dotColor: "#f59e0b"
      },
      { 
        step: 3, 
        toolName: "Social Captions", 
        actionDesc: "Format for Twitter/X and Instagram", 
        outputName: "Post captions", 
        href: "/tools/social-caption-generator",
        icon: Share2,
        accentColor: "#ec4899",
        cardBorder: "border-2 border-pink-500/50 shadow-[0_0_25px_rgba(236,72,153,0.25)] hover:border-pink-400 hover:shadow-[0_0_40px_rgba(236,72,153,0.45)]",
        cardBg: "bg-gradient-to-b from-[#180712]/95 via-[#0e040b]/95 to-[#060205]/95",
        buttonGrad: "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]",
        badgeStyle: "bg-pink-400/15 border-pink-400/40 text-pink-300",
        dotColor: "#ec4899"
      },
      { 
        step: 4, 
        toolName: "Video Trimmer", 
        actionDesc: "Cut video clips right in your browser", 
        outputName: "Trimmed video", 
        href: "/tools/video/trimmer",
        icon: Scissors,
        accentColor: "#8b5cf6",
        cardBorder: "border-2 border-violet-500/50 shadow-[0_0_25px_rgba(139,92,246,0.25)] hover:border-violet-400 hover:shadow-[0_0_40px_rgba(139,92,246,0.45)]",
        cardBg: "bg-gradient-to-b from-[#100818]/95 via-[#0a040e]/95 to-[#050207]/95",
        buttonGrad: "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]",
        badgeStyle: "bg-violet-400/15 border-violet-400/40 text-violet-300",
        dotColor: "#8b5cf6"
      },
    ],
    outcomeSummary: "Publication-ready video cut, humanized script, and platform-formatted social posts.",
  },
  {
    id: "business",
    roleName: "Small Business",
    badge: "Local Store & Services",
    goalTitle: "Prepare product photos, invoices, and table QRs",
    titleGradient: "bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300",
    description: "Clean up product photos with transparent edges, design brand logos, and generate camera-scannable table QR codes.",
    icon: Store,
    accentColor: "#10b981",
    activeTabGrad: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_0_20px_rgba(16,185,129,0.45)]",
    steps: [
      { 
        step: 1, 
        toolName: "Background Remover", 
        actionDesc: "Clean cutouts for catalog photos", 
        outputName: "Transparent PNG", 
        href: "/tools/image/eraser",
        icon: Eraser,
        accentColor: "#06b6d4",
        cardBorder: "border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.45)]",
        cardBg: "bg-gradient-to-b from-[#061418]/95 via-[#030c0e]/95 to-[#010607]/95",
        buttonGrad: "bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]",
        badgeStyle: "bg-cyan-400/15 border-cyan-400/40 text-cyan-300",
        dotColor: "#06b6d4"
      },
      { 
        step: 2, 
        toolName: "Logo Generator", 
        actionDesc: "Generate brand mark & color swatches", 
        outputName: "Brand Kit (.ZIP)", 
        href: "/tools/ai/logo",
        icon: Palette,
        accentColor: "#f59e0b",
        cardBorder: "border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:border-amber-300 hover:shadow-[0_0_45px_rgba(245,158,11,0.55)]",
        cardBg: "bg-gradient-to-b from-[#181106]/95 via-[#0e0a03]/95 to-[#080501]/95",
        buttonGrad: "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-amber-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]",
        buttonTextDark: true,
        badgeStyle: "bg-amber-400/15 border-amber-400/50 text-amber-300",
        dotColor: "#f59e0b"
      },
      { 
        step: 3, 
        toolName: "Bulk QR Spreadsheets", 
        actionDesc: "Table menus and Wi-Fi auto-connect", 
        outputName: "QR Folder (.ZIP)", 
        href: "/tools/qr-code",
        icon: FileSpreadsheet,
        accentColor: "#10b981",
        cardBorder: "border-2 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:border-emerald-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.45)]",
        cardBg: "bg-gradient-to-b from-[#06180f]/95 via-[#030e09]/95 to-[#010704]/95",
        buttonGrad: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]",
        badgeStyle: "bg-emerald-400/15 border-emerald-400/40 text-emerald-300",
        dotColor: "#10b981"
      },
      { 
        step: 4, 
        toolName: "Invoice Generator", 
        actionDesc: "Send clear PDF invoices to clients", 
        outputName: "Tax Invoice (.PDF)", 
        href: "/tools/invoice-generator",
        icon: Receipt,
        accentColor: "#f97316",
        cardBorder: "border-2 border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.25)] hover:border-orange-300 hover:shadow-[0_0_40px_rgba(249,115,22,0.45)]",
        cardBg: "bg-gradient-to-b from-[#180d06]/95 via-[#0e0703]/95 to-[#080401]/95",
        buttonGrad: "bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]",
        badgeStyle: "bg-orange-400/15 border-orange-400/40 text-orange-300",
        dotColor: "#f97316"
      },
    ],
    outcomeSummary: "Clean storefront visuals, customer QR codes, and client invoice records.",
  },
  {
    id: "builder",
    roleName: "Indie Builder",
    badge: "Solo Founders & Devs",
    goalTitle: "Launch a project identity and deployable web code",
    titleGradient: "bg-gradient-to-r from-purple-300 via-blue-300 to-emerald-300",
    description: "Create your logo, generate a responsive website blueprint, and export full Next.js 15 source code ready to deploy.",
    icon: Rocket,
    accentColor: "#3b82f6",
    activeTabGrad: "bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400 shadow-[0_0_20px_rgba(59,130,246,0.45)]",
    steps: [
      { 
        step: 1, 
        toolName: "Logo Generator", 
        actionDesc: "Scalable vector SVG & favicon suite", 
        outputName: "Brand Kit (.ZIP)", 
        href: "/tools/ai/logo",
        icon: Palette,
        accentColor: "#f59e0b",
        cardBorder: "border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:border-amber-300 hover:shadow-[0_0_45px_rgba(245,158,11,0.55)]",
        cardBg: "bg-gradient-to-b from-[#181106]/95 via-[#0e0a03]/95 to-[#080501]/95",
        buttonGrad: "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-amber-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]",
        buttonTextDark: true,
        badgeStyle: "bg-amber-400/15 border-amber-400/50 text-amber-300",
        dotColor: "#f59e0b"
      },
      { 
        step: 2, 
        toolName: "Landing Page Builder", 
        actionDesc: "Responsive SaaS layout & copy", 
        outputName: "Live sandbox", 
        href: "/tools/landing-page-generator",
        icon: Code2,
        accentColor: "#8b5cf6",
        cardBorder: "border-2 border-violet-500/50 shadow-[0_0_25px_rgba(139,92,246,0.25)] hover:border-violet-400 hover:shadow-[0_0_40px_rgba(139,92,246,0.45)]",
        cardBg: "bg-gradient-to-b from-[#100818]/95 via-[#0a040e]/95 to-[#050207]/95",
        buttonGrad: "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]",
        badgeStyle: "bg-violet-400/15 border-violet-400/40 text-violet-300",
        dotColor: "#8b5cf6"
      },
      { 
        step: 3, 
        toolName: "Next.js 15 Source Export", 
        actionDesc: "TypeScript, React 19 & Tailwind", 
        outputName: "Full repo (.ZIP)", 
        href: "/tools/landing-page-generator",
        icon: Terminal,
        accentColor: "#3b82f6",
        cardBorder: "border-2 border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.25)] hover:border-blue-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.45)]",
        cardBg: "bg-gradient-to-b from-[#060c18]/95 via-[#03070e]/95 to-[#010307]/95",
        buttonGrad: "bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]",
        badgeStyle: "bg-blue-400/15 border-blue-400/40 text-blue-300",
        dotColor: "#3b82f6"
      },
      { 
        step: 4, 
        toolName: "3D Device Mockup", 
        actionDesc: "Product Hunt & Twitter share preview", 
        outputName: "4K Showcase PNG", 
        href: "/tools/creator/device-mockup",
        icon: Layers,
        accentColor: "#06b6d4",
        cardBorder: "border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.45)]",
        cardBg: "bg-gradient-to-b from-[#061418]/95 via-[#030c0e]/95 to-[#010607]/95",
        buttonGrad: "bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]",
        badgeStyle: "bg-cyan-400/15 border-cyan-400/40 text-cyan-300",
        dotColor: "#06b6d4"
      },
    ],
    outcomeSummary: "A complete brand package and a deployable Next.js 15 website repository.",
  },
  {
    id: "office",
    roleName: "Everyday Work",
    badge: "Documents & Office",
    goalTitle: "Scan documents, extract text, and organize files",
    titleGradient: "bg-gradient-to-r from-cyan-300 via-sky-200 to-emerald-300",
    description: "Scan paper receipts, extract clean text from PDFs, clean noisy voice recordings, and convert files without installing heavy software.",
    icon: FileText,
    accentColor: "#06b6d4",
    activeTabGrad: "bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-400 shadow-[0_0_20px_rgba(6,182,212,0.45)]",
    steps: [
      { 
        step: 1, 
        toolName: "PDF Merger & Splitter", 
        actionDesc: "Combine or slice document pages", 
        outputName: "Clean PDF", 
        href: "/tools/pdf/merger",
        icon: Files,
        accentColor: "#ef4444",
        cardBorder: "border-2 border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.25)] hover:border-red-400 hover:shadow-[0_0_40px_rgba(239,68,68,0.45)]",
        cardBg: "bg-gradient-to-b from-[#180606]/95 via-[#0e0303]/95 to-[#070101]/95",
        buttonGrad: "bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]",
        badgeStyle: "bg-red-400/15 border-red-400/40 text-red-300",
        dotColor: "#ef4444"
      },
      { 
        step: 2, 
        toolName: "Text Scanner (OCR)", 
        actionDesc: "Extract text from scanned pages", 
        outputName: "Editable text", 
        href: "/tools/pdf/ocr",
        icon: ScanText,
        accentColor: "#38bdf8",
        cardBorder: "border-2 border-sky-500/50 shadow-[0_0_25px_rgba(56,189,248,0.25)] hover:border-sky-300 hover:shadow-[0_0_40px_rgba(56,189,248,0.45)]",
        cardBg: "bg-gradient-to-b from-[#061218]/95 via-[#030a0e]/95 to-[#010507]/95",
        buttonGrad: "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]",
        badgeStyle: "bg-sky-400/15 border-sky-400/40 text-sky-300",
        dotColor: "#38bdf8"
      },
      { 
        step: 3, 
        toolName: "AI Writer", 
        actionDesc: "Draft clear summary memo or email", 
        outputName: "Document draft", 
        href: "/tools/ai/writer",
        icon: PenTool,
        accentColor: "#10b981",
        cardBorder: "border-2 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:border-emerald-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.45)]",
        cardBg: "bg-gradient-to-b from-[#06180f]/95 via-[#030e09]/95 to-[#010704]/95",
        buttonGrad: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]",
        badgeStyle: "bg-emerald-400/15 border-emerald-400/40 text-emerald-300",
        dotColor: "#10b981"
      },
      { 
        step: 4, 
        toolName: "Image Compressor", 
        actionDesc: "Shrink file size for email attachment", 
        outputName: "Compressed files", 
        href: "/tools/image/compressor",
        icon: Minimize2,
        accentColor: "#06b6d4",
        cardBorder: "border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.45)]",
        cardBg: "bg-gradient-to-b from-[#061418]/95 via-[#030c0e]/95 to-[#010607]/95",
        buttonGrad: "bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]",
        badgeStyle: "bg-cyan-400/15 border-cyan-400/40 text-cyan-300",
        dotColor: "#06b6d4"
      },
    ],
    outcomeSummary: "Digitized documents, editable text notes, and lightweight file attachments.",
  },
];

export function PracticalWorkflows() {
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>("creator");

  const currentWorkflow = WORKFLOWS.find((w) => w.id === activeWorkflowId) || WORKFLOWS[0];

  return (
    <section id="workflows" className="pt-5 pb-6 sm:pt-6 sm:pb-8 px-4 sm:px-6 max-w-7xl mx-auto w-full scroll-mt-20">
      
      {/* Section Header */}
      <div className="flex flex-col items-center mb-8 sm:mb-10 text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
          USE TOGETHER
        </span>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.18] sm:leading-[1.15] py-0.5 pb-2">
          How tools{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 via-amber-300 to-emerald-400 inline-block pb-1">
            fit together.
          </span>
        </h2>

        <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed">
          You do not need to guess which tool to use. Pick what you want to make and follow a simple step-by-step path.
        </p>

        {/* Role Switcher Luxury Pills with Category-Reactive Colors */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-2.5 pt-3 w-full sm:w-auto">
          {WORKFLOWS.map((w) => {
            const Icon = w.icon;
            const isSelected = w.id === activeWorkflowId;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setActiveWorkflowId(w.id)}
                className={cn(
                  "relative group/tab flex min-h-11 sm:min-h-0 min-w-0 items-center justify-center gap-2 px-2.5 sm:px-4.5 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer transform-gpu hover:scale-[1.03] active:scale-95 select-none overflow-hidden antialiased",
                  isSelected
                    ? cn("text-white", w.activeTabGrad)
                    : "bg-white/[0.03] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06]"
                )}
              >
                {/* Tab Hover Shimmer */}
                <div className="absolute inset-0 -translate-x-[150%] group-hover/tab:translate-x-[150%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none" />

                <Icon 
                  className={cn("w-3.5 h-3.5 shrink-0 relative z-10 transition-transform duration-300 group-hover/tab:scale-110", isSelected ? "text-white" : "text-zinc-400")}
                  strokeWidth={2}
                />
                <span className="relative z-10">{w.roleName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workflow Stage Container - 2.5px Multi-Category Gradient Border Mix */}
      <div className="group relative p-[2.5px] rounded-3xl sm:rounded-[2.25rem] bg-gradient-to-br from-cyan-400 via-purple-500 via-amber-400 to-emerald-400 shadow-[0_0_40px_rgba(6,182,212,0.25),0_0_40px_rgba(168,85,247,0.2),0_0_40px_rgba(245,158,11,0.2),0_0_40px_rgba(16,185,129,0.2)] hover:shadow-[0_0_65px_rgba(6,182,212,0.35),0_0_65px_rgba(168,85,247,0.3),0_0_65px_rgba(245,158,11,0.3),0_0_65px_rgba(16,185,129,0.3)] transition-all duration-700">
        
        {/* Inner Big Box Container */}
        <div className="relative h-full w-full p-4 sm:p-8 md:p-10 rounded-[calc(2.25rem-2.5px)] bg-gradient-to-b from-[#0e0f17]/98 via-[#0a0a10]/98 to-[#06060a]/98 backdrop-blur-3xl overflow-hidden flex flex-col justify-between">
          
          {/* 1. Continuous Hover Shine Sweep — elevated z-30 pointer-events-none to sweep over full box */}
          <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-30">
            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
          </div>

          {/* 2. Four Corner Ambient Mesh Glow Auras (Mixing All 4 Categories: Cyan, Purple, Amber, Emerald) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
            {/* Top-Left: Cyan (Create) */}
            <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full blur-[90px] bg-cyan-500/25 opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            {/* Top-Right: Purple (Edit) */}
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-[90px] bg-purple-500/25 opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
            {/* Bottom-Right: Amber (Batch) */}
            <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full blur-[90px] bg-amber-500/25 opacity-35 group-hover:opacity-55 transition-opacity duration-700" />
            {/* Bottom-Left: Emerald (Build) */}
            <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full blur-[90px] bg-emerald-500/25 opacity-35 group-hover:opacity-55 transition-opacity duration-700" />
            
            {/* Micro Dot Matrix Watermark Pattern that brightens on hover */}
            <div 
              className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500"
              style={{
                backgroundImage: "radial-gradient(#22d3ee 1.5px, transparent 1.5px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentWorkflow.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="relative z-20 space-y-6"
            >
              {/* Workflow Header */}
              <div className="space-y-2 max-w-2xl">
                <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-zinc-200 inline-block shadow-xs">
                  {currentWorkflow.badge}
                </span>
                <h3 className={cn("text-xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text", currentWorkflow.titleGradient)}>
                  {currentWorkflow.goalTitle}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  {currentWorkflow.description}
                </p>
              </div>

              {/* Laser Horizon Divider */}
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/40 via-purple-400/40 via-amber-400/40 to-transparent" />

              {/* 4 Steps Visual Pipeline - Horizontal Swipeable Rail on Mobile, 4-Col Grid on Desktop */}
              <div className="flex lg:grid lg:grid-cols-4 gap-4.5 overflow-x-auto lg:overflow-visible pt-2.5 pb-3 px-1 sm:px-2 lg:px-0 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {currentWorkflow.steps.map((st) => {
                  const StepIcon = st.icon;
                  return (
                    <div 
                      key={st.step}
                      className={cn(
                        "group/step relative p-5 rounded-[1.75rem] flex min-w-0 flex-col justify-between transition-all duration-300 transform-gpu hover:-translate-y-1.5 active:translate-y-0 hover:shadow-2xl overflow-hidden w-full sm:w-[290px] lg:w-auto shrink-0 snap-start",
                        st.cardBg,
                        st.cardBorder
                      )}
                    >
                      {/* 1. Continuous Hover Shine Sweep */}
                      <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10">
                        <div className="absolute inset-0 translate-x-[-150%] group-hover/step:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      </div>

                      {/* 2. Ambient Mesh Glow Aura & Colored Micro Dot Matrix Pattern */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                        <div 
                          className="absolute -top-10 -left-10 w-44 h-44 rounded-full blur-[45px] opacity-25 group-hover/step:opacity-50 transition-opacity duration-700"
                          style={{ backgroundColor: st.accentColor }}
                        />
                        <div 
                          className="absolute inset-0 opacity-[0.05] group-hover/step:opacity-[0.12] transition-opacity duration-500"
                          style={{
                            backgroundImage: `radial-gradient(${st.dotColor} 1.5px, transparent 1.5px)`,
                            backgroundSize: "20px 20px",
                          }}
                        />
                      </div>

                      {/* 3. Top Row: Luxury Squircle Icon on left + Step Badge on right */}
                      <div className="relative z-10 flex items-start justify-between gap-3 mb-3.5">
                        {/* Squircle Icon Container with Circling Conic Neon Ring */}
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 shadow-xl bg-[#0b0c12] border border-white/10 group-hover/step:rotate-6 group-hover/step:scale-110 shrink-0">
                          <div 
                            className="absolute inset-[-100%] animate-spin-smooth opacity-75"
                            style={{
                              background: `conic-gradient(from 0deg, transparent 0%, ${st.accentColor} 30%, transparent 60%)`,
                            }}
                          />
                          <div className="absolute inset-[1.5px] rounded-[14.5px] bg-[#0b0c12] z-0" />
                          <StepIcon 
                            className="w-5.5 h-5.5 transition-all duration-300 relative z-10 group-hover/step:scale-115"
                            style={{ color: st.accentColor }}
                            strokeWidth={2}
                          />
                        </div>

                        {/* Step badge on top right */}
                        <div className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-[10px] text-zinc-400 font-bold shrink-0">
                          Step 0{st.step}
                        </div>
                      </div>

                      {/* 4. Output / Format Tag */}
                      <div className="relative z-10 mb-2">
                        <span className={cn(
                          "inline-block px-2.5 py-0.5 rounded-full border text-[9.5px] font-bold uppercase tracking-wider",
                          st.badgeStyle
                        )}>
                          {st.outputName}
                        </span>
                      </div>

                      {/* 5. Tool Title & Description */}
                      <div className="relative z-10 flex-1 mb-4">
                        <h4 className="text-base font-bold text-white tracking-tight group-hover/step:text-zinc-100 transition-colors">
                          {st.toolName}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2 font-normal">
                          {st.actionDesc}
                        </p>
                      </div>

                      {/* 6. Full-Width Saturated Launch Button (Matching Screenshot 2!) */}
                      <div className="relative z-10 mt-auto pt-1">
                        <Link
                          href={st.href}
                          className={cn(
                            "relative w-full min-h-11 sm:min-h-0 py-2.5 px-4 rounded-full flex items-center justify-center gap-2 uppercase tracking-wider text-xs transition-all duration-300 transform-gpu group-hover/step:scale-[1.02] active:scale-95 shadow-lg overflow-hidden antialiased cursor-pointer",
                            st.buttonGrad,
                            st.buttonTextDark ? "text-amber-950 font-black" : "text-white font-bold"
                          )}
                        >
                          <div className="absolute inset-0 rounded-full pointer-events-none bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.35)_50%,transparent_75%)] bg-[length:200%_100%] opacity-0 group-hover/step:opacity-100 group-hover/step:animate-[shine_2.5s_linear_infinite] transition-opacity duration-300" />
                          <span className="relative z-10 flex items-center gap-1.5">
                            Open Tool
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/step:translate-x-1" strokeWidth={2.2} />
                          </span>
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Outcome Footer & Animated Flowing Action Button */}
              <div className="mt-8 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.2} />
                  <span><strong>Final outcome:</strong> {currentWorkflow.outcomeSummary}</span>
                </div>

                {/* Flagship Workflow Launch Button */}
                <div className="relative group/launch shrink-0">
                  {/* Pulsing Underglow Aura */}
                  <div 
                    className="absolute -inset-0.5 rounded-full blur-md opacity-45 group-hover/launch:opacity-85 transition-opacity duration-500 animate-gradient-flow bg-gradient-to-r from-cyan-500 via-purple-500 via-amber-500 to-emerald-500" 
                  />

                  <Link
                    href="/tools"
                    className="relative px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 via-amber-500 to-emerald-500 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 transform-gpu hover:scale-[1.02] active:scale-95 shadow-xl overflow-hidden animate-gradient-flow antialiased cursor-pointer"
                  >
                    {/* Sweeping Periodic Laser Shimmer */}
                    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                    </div>

                    <span className="relative z-10">Explore all tools</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white relative z-10 transition-transform duration-300 group-hover/launch:translate-x-1.5" strokeWidth={2.2} />
                  </Link>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

        </div>
      </div>

    </section>
  );
}
