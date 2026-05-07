"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Zap, Sparkles, RefreshCw, Star } from "lucide-react";
import Link from "next/link";

const RELEASES = [
  {
    version: "v2.4.0",
    date: "May 20, 2026",
    title: "Cinematic Evolution",
    changes: [
      "New premium landing page architecture",
      "Redesigned Dashboard with real-time system stats",
      "Enhanced glassmorphism across all components",
      "Improved mobile responsiveness for tool editors"
    ]
  },
  {
    version: "v2.3.5",
    date: "May 08, 2026",
    title: "Intelligence Update",
    changes: [
      "Integrated state-of-the-art AI image models",
      "Reduced latency for vocal removal tasks by 40%",
      "Added support for multi-page PDF merging",
      "New authentication flow with premium UI"
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 space-y-20 relative z-10">
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
            Keeping track of every improvement we make.
          </p>
        </header>

        <div className="space-y-16">
          {RELEASES.map((release, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-12 border-l border-white/5 space-y-8"
            >
              <div className="absolute top-0 -left-[5px] w-[9px] h-[9px] rounded-full bg-accent-purple shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <span className="text-accent-purple font-black tracking-tighter text-2xl uppercase italic">{release.version}</span>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{release.date}</span>
                </div>
                <h2 className="text-3xl font-black text-white italic tracking-tight">{release.title}</h2>
              </div>

              <ul className="space-y-4">
                {release.changes.map((change, j) => (
                  <li key={j} className="flex items-start gap-3 text-zinc-400 font-medium">
                    <Sparkles size={14} className="mt-1 text-accent-purple/40 shrink-0" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
