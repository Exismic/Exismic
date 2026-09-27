"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Download,
  Copy,
  Check,
  Layers,
  FileText,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { ExismicMark } from "@/components/ui/ExismicLogo";

const BRAND_COLORS = [
  {
    name: "Obsidian Void",
    hex: "#030303",
    role: "Core Canvas Background",
    textDark: false,
    border: "border-white/10",
  },
  {
    name: "Electric Cyan",
    hex: "#06b6d4",
    role: "Primary Accent & Glow",
    textDark: true,
    border: "border-cyan-400/40",
  },
  {
    name: "Cosmic Purple",
    hex: "#a855f7",
    role: "Secondary Neon Gradient",
    textDark: false,
    border: "border-purple-400/40",
  },
  {
    name: "Solaris Amber",
    hex: "#f59e0b",
    role: "AI Category & Sparks",
    textDark: true,
    border: "border-amber-400/40",
  },
  {
    name: "Emerald Mint",
    hex: "#10b981",
    role: "Productivity & Success",
    textDark: true,
    border: "border-emerald-400/40",
  },
];

const LOGO_VARIANTS = [
  {
    id: "default",
    name: "Obsidian Studio Mark",
    theme: "default" as const,
    desc: "Primary multi-color gradient brandmark for dark backgrounds.",
    svgString: `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="28" fill="#090a10" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
  <rect x="8" y="8" width="112" height="112" rx="22" fill="url(#grad_conic)"/>
  <rect x="14" y="14" width="100" height="100" rx="18" fill="#0c0d17"/>
  <text x="64" y="82" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="64" fill="white" text-anchor="middle">E</text>
  <circle cx="88" cy="40" r="6" fill="#22d3ee"/>
  <defs>
    <linearGradient id="grad_conic" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
</svg>`,
  },
  {
    id: "gold",
    name: "Solaris Gold Edition",
    theme: "gold" as const,
    desc: "Prestige luxury gold variant for AI tools and feature spotlights.",
    svgString: `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="28" fill="#090a10" stroke="rgba(245,158,11,0.3)" stroke-width="2"/>
  <rect x="8" y="8" width="112" height="112" rx="22" fill="url(#grad_gold)"/>
  <rect x="14" y="14" width="100" height="100" rx="18" fill="#120c04"/>
  <text x="64" y="82" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="64" fill="#fef08a" text-anchor="middle">E</text>
  <circle cx="88" cy="40" r="6" fill="#f59e0b"/>
  <defs>
    <linearGradient id="grad_gold" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
</svg>`,
  },
  {
    id: "blue",
    name: "Electric Cyan Edition",
    theme: "blue" as const,
    desc: "High-contrast electric cyan variant for digital media & icons.",
    svgString: `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="28" fill="#090a10" stroke="rgba(6,182,212,0.3)" stroke-width="2"/>
  <rect x="8" y="8" width="112" height="112" rx="22" fill="url(#grad_cyan)"/>
  <rect x="14" y="14" width="100" height="100" rx="18" fill="#050e18"/>
  <text x="64" y="82" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="64" fill="#cffafe" text-anchor="middle">E</text>
  <circle cx="88" cy="40" r="6" fill="#38bdf8"/>
  <defs>
    <linearGradient id="grad_cyan" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
</svg>`,
  },
  {
    id: "purple",
    name: "Cosmic Purple Edition",
    theme: "purple" as const,
    desc: "Vibrant fuchsia & purple variant for creator ecosystems.",
    svgString: `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="28" fill="#090a10" stroke="rgba(168,85,247,0.3)" stroke-width="2"/>
  <rect x="8" y="8" width="112" height="112" rx="22" fill="url(#grad_purp)"/>
  <rect x="14" y="14" width="100" height="100" rx="18" fill="#14081c"/>
  <text x="64" y="82" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="64" fill="#f5d0fe" text-anchor="middle">E</text>
  <circle cx="88" cy="40" r="6" fill="#d946ef"/>
  <defs>
    <linearGradient id="grad_purp" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="50%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
</svg>`,
  },
];

const PRESS_BOILERPLATE =
  "Exismic is a modern, all-in-one AI and media tools studio designed for creators, developers, students, and businesses. Built with high performance and zero complexity, Exismic democratizes access to state-of-the-art image editing, PDF conversion, audio processing, and AI generation tools in one unified, focused workspace.";

export default function BrandClient() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedBoilerplate, setCopiedBoilerplate] = useState(false);
  const [copiedSvgId, setCopiedSvgId] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleCopyBoilerplate = () => {
    navigator.clipboard.writeText(PRESS_BOILERPLATE);
    setCopiedBoilerplate(true);
    setTimeout(() => setCopiedBoilerplate(false), 2000);
  };

  const handleCopySvg = (id: string, svg: string) => {
    navigator.clipboard.writeText(svg);
    setCopiedSvgId(id);
    setTimeout(() => setCopiedSvgId(null), 2000);
  };

  const handleDownloadSvg = (name: string, svg: string) => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exismic-mark-${name.toLowerCase().replace(/\s+/g, "-")}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[650px] h-[650px] bg-cyan-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[700px] h-[700px] bg-purple-500/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      <main className="max-w-6xl mx-auto px-5 sm:px-6 pt-24 sm:pt-28 space-y-16 relative z-10">
        <PageBreadcrumb items={[{ label: "Brand Assets & Media Kit" }]} />

        {/* Hero Section */}
        <header className="relative w-full rounded-[2.5rem] bg-[#090a10]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 md:p-16 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-center sm:text-left">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4 mx-auto sm:mx-0">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-wide uppercase shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Palette size={14} className="text-cyan-300" />
              <span>Official Media Kit & Visual Assets</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Official Exismic{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 bg-clip-text text-transparent">
                Brand Assets.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-medium leading-relaxed max-w-2xl">
              Download high-resolution vector logos, grab official color palettes, and access verified media boilerplate descriptions for articles, video reviews, and press features.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Download size={14} className="text-cyan-400" />
                <span>Vector Logos: <strong className="text-white">Scalable SVG</strong></span>
              </div>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <div className="flex items-center gap-1.5">
                <Palette size={14} className="text-purple-400" />
                <span>Format: <strong className="text-white">Dark Mode Optimized</strong></span>
              </div>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-emerald-400" />
                <span>Press Contact: <strong className="text-white">press@exismic.xyz</strong></span>
              </div>
            </div>
          </div>
        </header>

        {/* Vector Logos Grid */}
        <div className="space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Logomarks & Icons
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Download Official Vector SVGs
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Clean vector marks ready for print, 4K video overlays, blog thumbnails, and web showcases.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LOGO_VARIANTS.map((item) => {
              const isCopied = copiedSvgId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-[2rem] bg-[#090a10]/80 backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between space-y-5 transition-all duration-300 hover:border-white/20 hover:scale-[1.02]"
                >
                  <div className="space-y-4">
                    <div className="h-40 rounded-2xl bg-[#040407] border border-white/5 flex items-center justify-center p-6 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-radial-gradient opacity-30" />
                      <ExismicMark size={72} theme={item.theme} animated={false} />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{item.name}</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => handleDownloadSvg(item.name, item.svgString)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-white transition-colors"
                      title="Download SVG file"
                    >
                      <Download size={13} className="text-cyan-300" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopySvg(item.id, item.svgString)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-300 transition-colors"
                      title="Copy raw SVG code"
                    >
                      {isCopied ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy SVG</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Color Palette */}
        <div className="space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Color Palette
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Official Hex Color Codes
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Click any color swatch to copy its exact hex code directly to your clipboard.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {BRAND_COLORS.map((color) => {
              const isCopied = copiedHex === color.hex;

              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => handleCopyHex(color.hex)}
                  className={`relative rounded-2xl bg-[#090a10]/80 backdrop-blur-xl border ${color.border} p-4 text-left transition-all duration-300 hover:scale-105 group`}
                >
                  <div
                    className="h-16 w-full rounded-xl shadow-inner mb-3 flex items-end justify-end p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      {isCopied ? "COPIED" : color.hex}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white tracking-tight">{color.name}</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{color.role}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Media & Press Boilerplate Card */}
        <div className="rounded-[2.5rem] bg-[#090a10]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Media Boilerplate
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Official Company One-Liner & Summary
              </h2>
            </div>

            <button
              type="button"
              onClick={handleCopyBoilerplate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-xs font-bold text-cyan-300 transition-colors self-start sm:self-auto"
            >
              {copiedBoilerplate ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Boilerplate</span>
                </>
              )}
            </button>
          </div>

          <blockquote className="text-sm sm:text-base text-zinc-300 leading-relaxed bg-white/[0.02] border border-white/5 rounded-2xl p-6 italic font-medium">
            &ldquo;{PRESS_BOILERPLATE}&rdquo;
          </blockquote>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs">
            <div className="space-y-3 rounded-2xl bg-white/[0.02] border border-white/5 p-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                <CheckCircle2 size={16} />
                <span>Usage Guidelines (Do&apos;s)</span>
              </div>
              <ul className="space-y-2 text-zinc-300">
                <li>• Maintain proportional scaling without stretching or squishing the logomark.</li>
                <li>• Provide ample padding around the logo when placing alongside other marks.</li>
                <li>• Use high-contrast dark backgrounds whenever possible.</li>
              </ul>
            </div>

            <div className="space-y-3 rounded-2xl bg-white/[0.02] border border-white/5 p-5">
              <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
                <XCircle size={16} />
                <span>Usage Restrictions (Don&apos;ts)</span>
              </div>
              <ul className="space-y-2 text-zinc-300">
                <li>• Do not alter, rotate, or recolor individual gradient segments.</li>
                <li>• Do not superimpose the logo onto visually cluttered photo textures.</li>
                <li>• Do not imply formal endorsement without prior written consent.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Category Laser Horizon Bridge */}
        <div className="relative w-full py-8">
          <div
            className="absolute inset-0 pointer-events-none blur-xl opacity-40"
            style={{ background: "radial-gradient(ellipse at center, #06b6d4, transparent 70%)" }}
          />
          <div
            className="w-full h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.2) 15%, #06b6d4 50%, rgba(6,182,212,0.2) 85%, transparent 100%)",
            }}
          />
          <div
            className="w-1/3 mx-auto h-0.5 -mt-px blur-[1px]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)",
            }}
          />
        </div>

        {/* Bottom Helpful Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 pb-8">
          <Link href="/about" className="hover:text-cyan-300 transition-colors">
            About Exismic
          </Link>
          <span>•</span>
          <Link href="/affiliates" className="hover:text-cyan-300 transition-colors">
            Creator Affiliate Program
          </Link>
          <span>•</span>
          <Link href="/help" className="hover:text-cyan-300 transition-colors">
            Press & Media Contact
          </Link>
          <span>•</span>
          <Link href="/changelog" className="hover:text-cyan-300 transition-colors">
            Product Updates
          </Link>
        </div>
      </main>
    </div>
  );
}
