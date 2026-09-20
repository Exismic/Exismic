"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Zap,
  Globe,
  Palette,
  Mail,
  Copy,
  Check,
  ArrowRight,
  Code2,
  Sparkles,
  Layers,
  Compass,
} from "lucide-react";
import Link from "next/link";

const CULTURE_PILLARS = [
  {
    icon: Zap,
    title: "Velocity & Autonomy",
    desc: "Ship to production rapidly. Zero bureaucratic drag, full ownership of features from initial spark to release.",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    icon: Globe,
    title: "Remote & Asynchronous",
    desc: "Collaborate flexibly from anywhere on Earth. We prioritize deep work, craftsmanship, and tangible output over seat time.",
    color: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/20",
    iconColor: "text-indigo-400",
  },
  {
    icon: Palette,
    title: "Obsession with Craft",
    desc: "Every pixel, micro-interaction, and millisecond counts. We view creative tooling as both high engineering and fine art.",
    color: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/20",
    iconColor: "text-sky-400",
  },
];

const FOCUS_TRACKS = [
  {
    icon: Code2,
    role: "Full-Stack & Systems",
    skills: "Next.js 15, TypeScript, WebGL/WebGPU, Low-Latency Edge APIs",
    description: "Building resilient client-side tools and distributed backend pipelines.",
  },
  {
    icon: Sparkles,
    role: "Applied AI & Computer Vision",
    skills: "MediaPipe, Stable Diffusion, ComfyUI, Real-Time Model Pipelines",
    description: "Optimizing state-of-the-art vision models for instantaneous browser execution.",
  },
  {
    icon: Layers,
    role: "Product Design & Motion UI",
    skills: "Design Systems, Micro-Interactions, Obsidian Cyber Aesthetics",
    description: "Designing tactile, cinematic user interfaces that creators fall in love with.",
  },
];

export default function CareersPage() {
  const [copied, setCopied] = useState(false);
  const email = "careers@exismictools.xyz";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="min-h-screen bg-[#060813] text-white selection:bg-cyan-500/30 pb-24 overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] rounded-full -translate-y-1/3" />
        <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-indigo-600/10 blur-[150px] rounded-full -translate-x-1/3" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/5 blur-[160px] rounded-full translate-y-1/3" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 space-y-10 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-semibold text-zinc-400 hover:text-white transition-all group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform text-zinc-500 group-hover:text-cyan-400"
            />
            <span>Back to Home</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open for Inquiries</span>
          </div>
        </div>

        {/* Hero Section */}
        <header className="relative rounded-3xl bg-[#0a0d1d]/85 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-10 md:p-12 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          {/* Top specular accent line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          <div className="absolute top-0 right-10 w-48 h-32 bg-cyan-400/10 blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Briefcase size={14} className="text-cyan-400" />
              <span>Careers & Opportunities</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
              Building the future of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
                creative AI tools.
              </span>
            </h1>

            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              At Exismic, we engineer high-performance studio utilities that empower creators,
              developers, and modern teams worldwide. We value relentless curiosity, taste, and
              execution speed over corporate bureaucracy.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#inquiries"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Direct Inquiry</span>
                <ArrowRight size={14} />
              </a>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-zinc-200 hover:text-white text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Explore What We Build</span>
                <Compass size={14} className="text-zinc-400" />
              </Link>
            </div>
          </motion.div>
        </header>

        {/* Culture & Values Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              How We Work
            </h2>
            <div className="h-px flex-1 ml-6 bg-white/[0.06]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CULTURE_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`p-6 rounded-2xl bg-[#090d1c]/80 backdrop-blur-xl border border-white/[0.07] hover:border-white/[0.15] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group shadow-lg`}
                >
                  <div
                    className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${pillar.color} blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity`}
                  />
                  <div className="relative z-10 space-y-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-white/[0.05] border ${pillar.border} flex items-center justify-center ${pillar.iconColor} group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Current Roles & Speculative Application Section */}
        <section id="inquiries" className="space-y-4 scroll-mt-28">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              Opportunities & Tracks
            </h2>
            <div className="h-px flex-1 ml-6 bg-white/[0.06]" />
          </div>

          {/* Clean Status & Tracks Container */}
          <div className="rounded-3xl bg-[#090d1c]/90 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 space-y-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            {/* Status Announcement */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-bold tracking-wide uppercase text-cyan-300">
                    Active Talent Pipeline
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  No rigid openings? We hire exceptional talent anytime.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                  We don't wait for formal headcounts to meet great minds. If your work aligns with
                  what we're building, reach out directly.
                </p>
              </div>

              <div className="shrink-0">
                <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-right">
                  <div className="text-[11px] font-semibold text-zinc-400">Response Window</div>
                  <div className="text-sm font-bold text-emerald-400">Within 48 Hours</div>
                </div>
              </div>
            </div>

            {/* Tracks We Prioritize */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Disciplines We Always Review
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {FOCUS_TRACKS.map((track) => {
                  const TrackIcon = track.icon;
                  return (
                    <div
                      key={track.role}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all space-y-2 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <TrackIcon size={14} />
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {track.role}
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {track.description}
                      </p>
                      <div className="text-[11px] font-mono text-zinc-500 pt-1">
                        {track.skills}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Card: Direct Email */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#0d1326] to-[#0f1730] border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
              <div className="space-y-1 relative z-10">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Mail size={16} className="text-cyan-400" />
                  <span>Send Your Portfolio & Work</span>
                </div>
                <p className="text-xs text-zinc-300 max-w-lg">
                  Include links to live apps, your GitHub profile, or design Figma files. We review
                  every single application personally.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto relative z-10">
                <button
                  onClick={handleCopyEmail}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-xs font-semibold text-zinc-200 hover:text-white transition-all active:scale-95"
                  title="Copy email address"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="text-zinc-400" />
                      <span>{email}</span>
                    </>
                  )}
                </button>

                <a
                  href={`mailto:${email}?subject=Careers%20Inquiry%20-%20[Your%20Name]`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>Email Us</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Reassurance Footer Banner */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 border-t border-white/[0.06] pt-6">
          <p>© {new Date().getFullYear()} Exismic. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/support" className="hover:text-zinc-300 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
