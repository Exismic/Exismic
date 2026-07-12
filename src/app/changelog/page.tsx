"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Zap, Sparkles, RefreshCw, Star } from "lucide-react";
import Link from "next/link";

const RELEASES: any[] = [
  {
    version: "v1.0.0",
    date: "July 2026",
    title: "Exismic Release",
    changes: [
      "Initial launch of the Exismic AI platform.",
      "Cinematic UI design system established.",
      "Core AI tooling infrastructure deployed."
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
          {RELEASES.length > 0 ? (
            RELEASES.map((release, i) => (
              <motion.div
                key={i}
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                      <Zap size={14} className="animate-pulse" />
                      <span className="text-xs font-black tracking-widest uppercase">{release.version}</span>
                    </div>
                    <div>
                      <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase drop-shadow-md">{release.title}</h2>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-3">{release.date}</p>
                    </div>
                  </div>

                  {/* Right Column: Changes list */}
                  <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0 md:pl-10 space-y-4 relative">
                    <div className="absolute -left-px top-0 md:top-10 w-full md:w-px h-px md:h-20 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-accent-purple to-transparent" />
                    
                    {release.changes.map((change: string, j: number) => (
                      <motion.div 
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + j * 0.1 + 0.2 }}
                        className="flex items-start gap-4 group/item"
                      >
                        <div className="mt-1 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/item:border-accent-purple/50 group-hover/item:bg-accent-purple/10 group-hover/item:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300">
                          <Sparkles size={12} className="text-zinc-500 group-hover/item:text-accent-purple transition-colors" />
                        </div>
                        <p className="text-zinc-400 font-medium leading-relaxed group-hover/item:text-white transition-colors">{change}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center justify-center">
                <RefreshCw size={32} className="text-accent-purple/40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-widest text-zinc-500 italic">No updates tracked yet</h3>
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em]">Official release logs are being prepared.</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
