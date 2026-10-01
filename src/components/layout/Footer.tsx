"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowRight, ArrowUpRight, Layers, LayoutGrid, Boxes, Compass, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { ExismicMark } from "@/components/ui/ExismicLogo";

interface FooterLinkItem {
  name: string;
  href: string;
}

interface FooterSection {
  title: string;
  icon: typeof LayoutGrid;
  iconColor: string;
  headerGrad: string;
  headerGlow: string;
  borderAccent: string;
  hoverColor: string;
  hoverGlow: string;
  ambientGlow: string;
  links: FooterLinkItem[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Categories",
    icon: LayoutGrid,
    iconColor: "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]",
    headerGrad: "from-cyan-300 via-sky-200 to-blue-400",
    headerGlow: "drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]",
    borderAccent: "from-cyan-400 to-transparent",
    hoverColor: "hover:text-cyan-300",
    hoverGlow: "group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]",
    ambientGlow: "bg-cyan-500/10",
    links: [
      { name: "Image Studio", href: "/category/image" },
      { name: "Video Studio", href: "/category/video" },
      { name: "Audio Studio", href: "/category/audio" },
      { name: "PDF Tools", href: "/category/pdf" },
      { name: "AI Tools", href: "/category/ai" },
    ],
  },
  {
    title: "Product",
    icon: Boxes,
    iconColor: "text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]",
    headerGrad: "from-purple-300 via-fuchsia-200 to-pink-400",
    headerGlow: "drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]",
    borderAccent: "from-purple-400 to-transparent",
    hoverColor: "hover:text-purple-300",
    hoverGlow: "group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]",
    ambientGlow: "bg-purple-600/10",
    links: [
      { name: "All 50+ Tools", href: "/tools" },
      { name: "AI Assistant", href: "/chat" },
      { name: "Exismic Pro", href: "/pro" },
      { name: "Credit Shop", href: "/shop" },
      { name: "Affiliates", href: "/affiliates" },
    ],
  },
  {
    title: "Resources",
    icon: Compass,
    iconColor: "text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]",
    headerGrad: "from-amber-300 via-yellow-200 to-orange-400",
    headerGlow: "drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]",
    borderAccent: "from-amber-400 to-transparent",
    hoverColor: "hover:text-amber-300",
    hoverGlow: "group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]",
    ambientGlow: "bg-amber-500/10",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "Developer API", href: "/developer" },
      { name: "Changelog", href: "/changelog" },
      { name: "Giveaways", href: "/giveaway" },
      { name: "Community Blog", href: "/blog" },
    ],
  },
  {
    title: "Legal & Trust",
    icon: ShieldCheck,
    iconColor: "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]",
    headerGrad: "from-emerald-300 via-teal-200 to-cyan-300",
    headerGlow: "drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]",
    borderAccent: "from-emerald-400 to-transparent",
    hoverColor: "hover:text-emerald-300",
    hoverGlow: "group-hover:drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]",
    ambientGlow: "bg-emerald-500/10",
    links: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
      { name: "Cookie Settings", href: "/cookies" },
      { name: "Refund Policy", href: "/refund-policy" },
      { name: "DMCA Notice", href: "/dmca" },
    ],
  },
];

const GithubIcon = ({ size = 15, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const InstagramIcon = ({ size = 15, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const XIcon = ({ size = 15, className = "" }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

export function Footer() {
  const [session, setSession] = useState<Session | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }: any) => {
      setSession(data?.session || null);
    });
  }, [supabase]);

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#020205] pb-16 sm:pb-8" suppressHydrationWarning>
      {/* Ambient Multi-Spectrum Laser Horizon Top Border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 via-fuchsia-500 via-purple-500 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.7)]" />
      
      {/* Cyber Grid Texture */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Multi-Spectrum Ambient Light Spotlights */}
      <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[850px] h-56 bg-purple-600/20 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute top-48 left-1/4 w-80 h-80 bg-cyan-500/12 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute top-48 right-1/4 w-80 h-80 bg-fuchsia-600/12 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 blur-[150px] rounded-full" />
      <div className="pointer-events-none absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 blur-[150px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Call-to-Action Horizon Section */}
        <section className="grid items-center gap-8 border-b border-white/[0.08] py-10 sm:py-14 md:py-16 md:grid-cols-[1fr_auto] text-center md:text-left">
          <div className="max-w-3xl mx-auto md:mx-0 flex flex-col items-center md:items-start">
            <div className="relative overflow-hidden inline-flex min-h-8 items-center gap-2 rounded-full border border-purple-400/50 bg-gradient-to-r from-purple-500/25 via-fuchsia-600/20 to-purple-500/25 px-4 py-1 text-[9.5px] font-black uppercase tracking-[0.24em] text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:200%_100%] animate-[shine_3s_linear_infinite]" />
              <Layers size={13} className="relative z-10 text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
              <span className="relative z-10 text-purple-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)] font-black">
                Exismic Studio
              </span>
            </div>
            <h2 className="mt-5 bg-[linear-gradient(100deg,#ffffff_0%,#f5f3ff_40%,#e9d5ff_70%,#67e8f9_100%)] bg-clip-text text-[clamp(2.2rem,5.5vw,4.8rem)] font-black leading-[1.08] pb-2 tracking-[-0.045em] text-transparent drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
              Make something worth shipping.
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-zinc-300 sm:text-base">
              Create, edit, and get things done with fast, privacy-first tools built for everyday work.
            </p>
          </div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-full max-w-[280px] sm:max-w-[292px] md:w-[292px] md:justify-self-end relative group/launch isolate mx-auto md:mx-0"
          >
            {/* Ambient Aura Glow behind the button */}
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/30 via-fuchsia-600/30 to-cyan-500/30 rounded-[24px] blur-xl opacity-40 group-hover/launch:opacity-80 transition duration-500 animate-pulse pointer-events-none" />

            <Link
              href={session ? "/tools" : "/auth/login"}
              prefetch={true}
              className="relative isolate flex h-[58px] sm:h-[66px] md:h-[72px] w-full overflow-hidden rounded-[20px] p-[2px] shadow-[0_20px_55px_rgba(0,0,0,0.7),0_0_35px_rgba(124,58,237,0.25)] transition-all duration-500 hover:shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(34,211,238,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              {/* Subtle underlying track border */}
              <div className="absolute inset-0 rounded-[20px] border border-white/10 pointer-events-none" />

              {/* Circling Laser Beam (Sharp Core) */}
              <div
                aria-hidden="true"
                className="absolute inset-[-150%] animate-[spin_3.5s_linear_infinite] pointer-events-none will-change-transform"
                style={{
                  background:
                    "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(168,85,247,0.2) 290deg, #7c3aed 315deg, #ec4899 335deg, #22d3ee 350deg, #ffffff 358deg, transparent 360deg)",
                }}
              />

              {/* Circling Laser Beam (Neon Bloom Glow) */}
              <div
                aria-hidden="true"
                className="absolute inset-[-150%] animate-[spin_3.5s_linear_infinite] pointer-events-none blur-[4px] opacity-80 will-change-transform"
                style={{
                  background:
                    "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #7c3aed 315deg, #ec4899 335deg, #22d3ee 350deg, transparent 360deg)",
                }}
              />

              <span className="relative z-10 flex h-full w-full items-center gap-3 sm:gap-3.5 rounded-[18px] bg-gradient-to-br from-[#0c0c14]/98 via-[#07070e]/98 to-[#030306]/98 px-3.5 sm:px-4 backdrop-blur-2xl transition-colors duration-500 group-hover/launch:from-[#131322]/98 group-hover/launch:to-[#0a0a14]/98">
                {/* Shimmer Sweep */}
                <motion.div
                  animate={{ x: ["-250%", "250%"] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1.5 }}
                  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg] pointer-events-none"
                />

                <div className="shrink-0">
                  <div className="hidden sm:block">
                    <ExismicMark size={38} className="drop-shadow-[0_0_18px_rgba(124,58,237,0.6)] transition-all duration-500 group-hover/launch:scale-110 group-hover/launch:rotate-3" />
                  </div>
                  <div className="sm:hidden">
                    <ExismicMark size={30} className="drop-shadow-[0_0_14px_rgba(124,58,237,0.5)] transition-all duration-500 group-hover/launch:scale-110" />
                  </div>
                </div>
                
                <span className="min-w-0 flex-1 text-left relative z-10">
                  <span className="block text-[11px] sm:text-[12px] font-black uppercase tracking-[0.18em] sm:tracking-[0.22em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-500 group-hover/launch:text-cyan-100 whitespace-nowrap">
                    {session ? "Open Exismic" : "Enter Exismic"}
                  </span>
                  <span className="mt-0.5 sm:mt-1 block text-[8px] sm:text-[8.5px] font-black uppercase tracking-[0.16em] sm:tracking-[0.18em] text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-colors duration-500 group-hover/launch:text-fuchsia-300 whitespace-nowrap">
                    Explore 50+ tools
                  </span>
                </span>

                <span className="relative z-10 flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)] transition-all duration-500 group-hover/launch:border-cyan-300/60 group-hover/launch:bg-cyan-400/[0.22] group-hover/launch:text-cyan-50 group-hover/launch:shadow-[0_0_35px_rgba(34,211,238,0.55),inset_0_1px_8px_rgba(255,255,255,0.3)]">
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="text-white group-hover/launch:text-cyan-100 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </motion.div>
                </span>
              </span>
            </Link>
          </motion.div>
        </section>

        {/* Main Grid: Brand Block (Left) + 4 Categorized Columns (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 py-14 sm:py-16 items-start">
          {/* Brand & Systems Status (Takes 2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left space-y-5">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2">
                <ExismicMark size={44} className="drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
              </div>
              <div className="text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black tracking-[-0.03em] text-white">
                    Exismic<span className="text-cyan-400 drop-shadow-[0_0_16px_rgba(34,211,238,1)]">.</span>
                  </p>
                </div>
                <p className="text-[10.5px] font-black uppercase tracking-[0.24em] bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                  All-in-One Creative Studio
                </p>
              </div>
            </Link>

            <p className="text-[13.5px] font-semibold leading-relaxed text-zinc-300 max-w-sm">
              The unified creative workspace for images, audio, video, PDFs, and code. Built for ultimate speed, power, and privacy.
            </p>

            {/* Glowing Radiant ALL SYSTEMS ACTIVE Status Capsule */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/60 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-emerald-950/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300 shadow-[0_0_28px_rgba(16,185,129,0.45)] backdrop-blur-xl transition-all duration-300 hover:border-emerald-300 hover:shadow-[0_0_38px_rgba(52,211,153,0.65)]">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,1)]" />
                </span>
                <span className="drop-shadow-[0_0_10px_rgba(16,185,129,0.9)] font-black text-emerald-200 tracking-[0.22em]">
                  All systems active
                </span>
              </div>
            </div>
          </div>

          {/* 4 Categorized Columns with Bold Radiant Headers & Accented Links */}
          {FOOTER_SECTIONS.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.title} className="relative flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                {/* Column Background Ambient Aura */}
                <div className={`pointer-events-none absolute -top-8 -left-4 w-40 h-40 ${section.ambientGlow} blur-[70px] rounded-full`} />

                {/* Bold Header with Colored Icon & Underline Accent */}
                <div className="relative z-10 flex flex-col items-center md:items-start gap-1.5">
                  <div className="flex items-center gap-2">
                    <SectionIcon size={15} className={section.iconColor} />
                    <h3 className={`text-[12px] font-black uppercase tracking-[0.24em] bg-gradient-to-r ${section.headerGrad} bg-clip-text text-transparent ${section.headerGlow}`}>
                      {section.title}
                    </h3>
                  </div>
                  <div className={`h-[2px] w-9 bg-gradient-to-r ${section.borderAccent} rounded-full`} />
                </div>

                {/* Bold Clean Links with Column Hover Glow & Slide */}
                <ul className="relative z-10 space-y-2.5 w-full">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        prefetch={true}
                        className={`group inline-flex items-center gap-2 text-[14px] font-bold text-zinc-200 transition-all duration-200 ${section.hoverColor} hover:translate-x-1.5`}
                      >
                        <span className={`transition-all duration-200 ${section.hoverGlow}`}>
                          {link.name}
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="opacity-0 -translate-x-1.5 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 text-current"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Sub-Footer Bar: Added sm:pr-28 / lg:pr-32 to clear the floating AI Helper widget */}
        <div className="border-t border-white/[0.08] py-7 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left sm:pr-28 lg:pr-32">
          <p className="text-[11.5px] font-black uppercase tracking-[0.2em] text-zinc-400">
            &copy; 2026 <span className="text-white font-black drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">EXISMIC STUDIO</span>. ALL RIGHTS RESERVED.
          </p>

          {/* Social Icons with Distinct Colored Hover Rings */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-zinc-300 transition-all duration-300 hover:border-purple-400 hover:bg-purple-500/20 hover:text-purple-200 hover:shadow-[0_0_22px_rgba(168,85,247,0.55)] hover:scale-110"
            >
              <GithubIcon size={16} />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X (Twitter)"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-zinc-300 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-200 hover:shadow-[0_0_22px_rgba(34,211,238,0.55)] hover:scale-110"
            >
              <XIcon size={16} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-zinc-300 transition-all duration-300 hover:border-pink-400 hover:bg-pink-500/20 hover:text-pink-200 hover:shadow-[0_0_22px_rgba(236,72,153,0.55)] hover:scale-110"
            >
              <InstagramIcon size={16} />
            </a>
          </div>

          {/* Quick Legal Links: Fully visible with ample clearance before the AI helper button */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11.5px] font-black uppercase tracking-[0.18em] text-zinc-300">
            <Link href="/privacy-policy" className="hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all">Privacy</Link>
            <span className="text-zinc-600 font-bold">•</span>
            <Link href="/terms-of-service" className="hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all">Terms</Link>
            <span className="text-zinc-600 font-bold">•</span>
            <Link href="/refund-policy" className="hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all">Refunds</Link>
            <span className="text-zinc-600 font-bold">•</span>
            <Link href="/help" className="hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
