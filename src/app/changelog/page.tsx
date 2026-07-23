"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Zap, 
  Sparkles, 
  RefreshCw, 
  Bug, 
  Palette, 
  Gauge, 
  Filter,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

type ChangeType = "feature" | "fix" | "ui" | "perf";

interface ChangeItem {
  type: ChangeType;
  text: string;
}

interface Release {
  version: string;
  date: string;
  title: string;
  tagline?: string;
  isLatest?: boolean;
  changes: ChangeItem[];
}

const TYPE_CONFIG: Record<ChangeType, { label: string; icon: any; badgeClass: string; dotClass: string }> = {
  feature: {
    label: "Update",
    icon: Sparkles,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    dotClass: "bg-emerald-400"
  },
  ui: {
    label: "UI Update",
    icon: Palette,
    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]",
    dotClass: "bg-cyan-400"
  },
  fix: {
    label: "Bug Fix",
    icon: Bug,
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    dotClass: "bg-rose-400"
  },
  perf: {
    label: "Performance",
    icon: Gauge,
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]",
    dotClass: "bg-purple-400"
  }
};

const RELEASES: Release[] = [
  {
    version: "v1.1.0",
    date: "July 2026",
    title: "Platform Update",
    tagline: "New interactive tools, UI visual upgrades, and bug fixes.",
    isLatest: true,
    changes: [
      {
        type: "feature",
        text: "Interactive AI Playground added with live code editing and instant preview."
      },
      {
        type: "feature",
        text: "Screenshot-to-Code converter with automatic element identification."
      },
      {
        type: "ui",
        text: "Redesigned tool cards with ambient glassmorphism and animated glows."
      },
      {
        type: "ui",
        text: "Polished dark theme navigation header and enhanced font contrast."
      },
      {
        type: "fix",
        text: "Resolved token deduction sync issues when running high-volume AI prompts."
      },
      {
        type: "fix",
        text: "Fixed mobile drawer overlay state locking during auth token refreshes."
      },
      {
        type: "perf",
        text: "Optimized client bundle loading speed and reduced script size by 24%."
      }
    ]
  },
  {
    version: "v1.0.0",
    date: "July 2026",
    title: "Exismic Release",
    tagline: "The foundation of the Exismic AI ecosystem.",
    changes: [
      {
        type: "feature",
        text: "Initial launch of the Exismic AI platform."
      },
      {
        type: "ui",
        text: "Cinematic UI design system established across core tools."
      },
      {
        type: "feature",
        text: "Core AI tooling infrastructure and payment workflow deployed."
      },
      {
        type: "fix",
        text: "Addressed initial viewport scaling and sidebar responsive alignment."
      }
    ]
  }
];

export default function ChangelogPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filterOptions = [
    { id: "all", label: "All Changes", icon: Filter },
    { id: "feature", label: "Updates", icon: Sparkles },
    { id: "ui", label: "UI Updates", icon: Palette },
    { id: "fix", label: "Bug Fixes", icon: Bug },
    { id: "perf", label: "Performance", icon: Gauge }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.06)_0%,transparent_70%)] pointer-events-none" />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 space-y-12 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Updates / Back
        </Link>

        <header className="space-y-6">
          <div className="flex items-center gap-4 text-accent-purple">
            <RefreshCw size={32} className="animate-spin-slow" />
            <div className="h-px w-20 bg-accent-purple/20" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]">
            What's <span className="gradient-text">New.</span>
          </h1>
          <p className="text-zinc-500 font-medium text-xl max-w-xl">
            Keeping track of every feature release, UI improvement, and bug fix we make.
          </p>
        </header>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5 pt-2">
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveFilter(opt.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
                  isActive
                    ? "bg-accent-purple/20 text-white border-accent-purple/40 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                    : "bg-white/[0.03] text-zinc-400 border-white/5 hover:bg-white/[0.07] hover:text-zinc-200"
                }`}
              >
                <Icon size={14} className={isActive ? "text-accent-purple" : "text-zinc-500"} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Release Cards */}
        <div className="space-y-16">
          {RELEASES.length > 0 ? (
            RELEASES.map((release, i) => {
              const filteredChanges = release.changes.filter(
                (c) => activeFilter === "all" || c.type === activeFilter
              );

              if (filteredChanges.length === 0) return null;

              return (
                <motion.div
                  key={release.version}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                >
                  {/* Glowing backdrop */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-purple rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                  
                  {/* Card */}
                  <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-[#0b0c12]/80 backdrop-blur-2xl border border-white/5 group-hover:border-white/10 transition-all duration-500 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-10">
                    {/* Subtle background glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent-purple/10 blur-[100px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2" />
                    
                    {/* Left Column: Version & Date */}
                    <div className="md:w-1/3 flex flex-col items-start space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                          <Zap size={14} className="animate-pulse" />
                          <span className="text-xs font-black tracking-widest uppercase">{release.version}</span>
                        </div>
                        {release.isLatest && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Latest
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase drop-shadow-md">
                          {release.title}
                        </h2>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-3">{release.date}</p>
                      </div>
                      {release.tagline && (
                        <p className="text-zinc-400 text-xs leading-relaxed font-medium pt-2">
                          {release.tagline}
                        </p>
                      )}
                    </div>

                    {/* Right Column: Changes list */}
                    <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0 md:pl-10 space-y-4 relative">
                      <div className="absolute -left-px top-0 md:top-10 w-full md:w-px h-px md:h-20 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-accent-purple to-transparent" />
                      
                      <AnimatePresence mode="popLayout">
                        {filteredChanges.map((change, j) => {
                          const config = TYPE_CONFIG[change.type] || TYPE_CONFIG.feature;
                          const IconComponent = config.icon;
                          
                          return (
                            <motion.div 
                              key={j}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ delay: j * 0.05 }}
                              className="flex items-start gap-4 group/item"
                            >
                              {/* Type Badge */}
                              <div className={`mt-0.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${config.badgeClass}`}>
                                <IconComponent size={12} />
                                <span>{config.label}</span>
                              </div>

                              <p className="text-zinc-300 font-medium leading-relaxed group-hover/item:text-white transition-colors text-sm pt-0.5">
                                {change.text}
                              </p>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-20 text-zinc-500 font-bold uppercase text-xs">
              No updates match the selected filter.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

