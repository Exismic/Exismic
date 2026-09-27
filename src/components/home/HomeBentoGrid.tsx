"use client";

import React from "react";
import Link from "next/link";
import { 
  FolderArchive, 
  FileSpreadsheet, 
  Code2, 
  ArrowRight, 
  Check, 
  Download, 
  Layers, 
  ShieldCheck, 
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeBentoGrid() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full relative">
      
      {/* Section Header */}
      <div className="flex flex-col items-center mb-12 sm:mb-16 text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-[0.22em]">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Real Deliverables, Not Just Chat</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-[0.98]">
          Built to Save You <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
            Hours of Busywork.
          </span>
        </h2>

        <p className="text-zinc-400 font-medium text-xs sm:text-sm md:text-base max-w-xl">
          Everything inside Exismic is engineered to deliver complete, production-ready files you can hand to clients or ship to users today.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Card 1: Startup Brand Kit (.ZIP) - Span 7 */}
        <div className="lg:col-span-7 rounded-3xl bg-gradient-to-b from-[#0e0f17]/95 via-[#0a0a10]/90 to-[#06060a]/95 border border-white/[0.08] hover:border-amber-500/40 p-6 sm:p-8 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col justify-between transition-all duration-300 group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <FolderArchive className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300">
                Brand Studio
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-amber-200 transition-colors">
                Download Complete Brand Kits in 1 Click
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Skip hiring expensive designers for simple branding. Design your logo and instantly download an organized ZIP archive containing editable vector SVGs, 3 high-res PNG resolutions, valid binary favicons, social media profile avatars, and an official Brand Guidelines PDF.
              </p>
            </div>

            {/* Visual File Tree Pill Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {[
                { title: "Vector SVG", sub: "Infinite scale" },
                { title: "Favicon Bundle", sub: ".ico + apple-touch" },
                { title: "3 Transparent PNGs", sub: "Up to 2048px Ultra-HD" },
                { title: "Brand Guidelines", sub: "Official PDF booklet" },
              ].map((item, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-left">
                  <span className="text-[11px] font-bold text-white block truncate">{item.title}</span>
                  <span className="text-[10px] font-mono text-zinc-400 block truncate">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Included in Pro & Free Preview</span>
            <Link
              href="/tools/ai/logo"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors group/link"
            >
              <span>Try Logo Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Card 2: Bulk CSV Spreadsheets - Span 5 */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-[#0e0f17]/95 via-[#0a0a10]/90 to-[#06060a]/95 border border-white/[0.08] hover:border-emerald-500/40 p-6 sm:p-8 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col justify-between transition-all duration-300 group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                Productivity & Batch
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-emerald-200 transition-colors">
                Process Hundreds of Files from Spreadsheets
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Forget doing things one by one. Drag-and-drop a CSV spreadsheet to generate custom branded QR codes for all your restaurant tables, or compress 50 high-res client photos at the same time.
              </p>
            </div>

            {/* Visual Micro Progress */}
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-300 font-bold">menu-table-links.csv</span>
                <span className="font-mono text-emerald-400 font-bold">100% Completed</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
              </div>
              <span className="text-[10px] font-mono text-zinc-400 block">
                50 QR codes designed and camera-verified in 1.2s
              </span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Batch Export to .ZIP</span>
            <Link
              href="/tools/qr-code"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors group/link"
            >
              <span>Explore Bulk QR Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Card 3: Next.js 15 Source Code Export - Span 12 Full Width */}
        <div className="lg:col-span-12 rounded-3xl bg-gradient-to-b from-[#0e0f17]/95 via-[#0a0a10]/90 to-[#06060a]/95 border border-white/[0.08] hover:border-purple-500/40 p-6 sm:p-8 md:p-10 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300 group">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300">
                Developer Freedom
              </span>
            </div>

            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight group-hover:text-purple-200 transition-colors">
              Export Full Next.js 15 + Tailwind Source Code (.ZIP)
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Never get locked into proprietary website builders. Generate responsive landing pages and download the full Next.js 15, React 19, TypeScript, and Tailwind CSS repository with zero configuration needed. Unzip, run <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-purple-300 font-mono text-xs">npm run dev</code>, and deploy anywhere.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Full source code ownership</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1-Click Vercel / Netlify deploy</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> No recurring builder fees</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/tools/landing-page-generator"
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-all cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>Launch Website Builder</span>
            </Link>
            <span className="text-[11px] font-mono text-zinc-500 text-center">
              Includes full project setup files
            </span>
          </div>
        </div>

      </div>

    </section>
  );
}
