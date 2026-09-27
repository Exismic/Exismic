"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Crown, 
  FolderLock, 
  Flame, 
  Layers, 
  ArrowRight, 
  LayoutGrid,
  Cpu,
  Coins,
  Maximize2,
  Compass,
  FolderArchive,
  FileSpreadsheet,
  FolderPlus,
  Code2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";
import Link from "next/link";
import GradientText from "@/components/ui/GradientText";

export default function ProBenefitsPage() {
  const { isPro } = usePro();
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"all" | "creative" | "speed" | "style">("all");

  const benefits = [
    { 
      id: "brandkit",
      category: "creative",
      title: "1-Click Startup Brand Kit (.ZIP)", 
      desc: "Download complete, production-ready brand identity packages in Logo Studio containing scalable vector SVGs, high-res transparent PNGs, browser favicons, pre-sized social media avatars, and clean brand guidelines PDFs.", 
      icon: FolderArchive, 
      tag: "BRAND KIT (.ZIP)",
      badgeStyle: "border-amber-400/40 bg-amber-500/10 text-amber-300",
      iconColor: "text-amber-400",
      glow: "bg-amber-500/25",
      cardBorder: "hover:border-amber-400/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-amber-400 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
      privilegeLevel: 5
    },
    { 
      id: "bulkstudio",
      category: "speed",
      title: "Bulk CSV & Batch Processing Studio", 
      desc: "Batch generate dozens or hundreds of custom QR codes from spreadsheets in seconds with 1-click ZIP export, and batch compress up to 50 high-resolution images in a single click.", 
      icon: FileSpreadsheet, 
      tag: "BATCH PROCESSING",
      badgeStyle: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
      iconColor: "text-emerald-400",
      glow: "bg-emerald-500/25",
      cardBorder: "hover:border-emerald-400/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(16,185,129,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
      privilegeLevel: 5
    },
    { 
      id: "projectfolders",
      category: "speed",
      title: "Custom Project Folders & Asset Organization", 
      desc: "Create unlimited custom project folders (such as My Startup, Client Deliverables, or Social Content) in your Library to organize, file, and manage all your generated assets across devices.", 
      icon: FolderPlus, 
      tag: "PROJECT FOLDERS",
      badgeStyle: "border-cyan-400/40 bg-cyan-500/10 text-cyan-300",
      iconColor: "text-cyan-400",
      glow: "bg-cyan-500/25",
      cardBorder: "hover:border-cyan-400/50 hover:shadow-[0_0_35px_rgba(6,182,212,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(6,182,212,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]",
      privilegeLevel: 5
    },
    { 
      id: "nextjsstarter",
      category: "creative",
      title: "AI Landing Page Next.js 15 Starter (.ZIP)", 
      desc: "Export your generated landing pages into a complete, modern Next.js 15 App Router codebase with built-in Tailwind CSS, TypeScript, and 1-click publishing instructions with zero Exismic branding.", 
      icon: Code2, 
      tag: "NEXT.JS 15 STARTER",
      badgeStyle: "border-violet-400/40 bg-violet-500/10 text-violet-300",
      iconColor: "text-violet-400",
      glow: "bg-violet-500/25",
      cardBorder: "hover:border-violet-400/50 hover:shadow-[0_0_35px_rgba(139,92,246,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(139,92,246,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-violet-400 to-purple-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]",
      privilegeLevel: 5
    },
    { 
      id: "credits",
      category: "creative",
      title: "500 Daily Studio Credits", 
      desc: "Massive daily allowance of 500 generation credits replenished every 24 hours at 12:00 PM IST — 10x more power than the 50-credit free tier.", 
      icon: Coins, 
      tag: "10X DAILY CREDITS",
      badgeStyle: "border-amber-400/40 bg-amber-500/10 text-amber-300",
      iconColor: "text-amber-400",
      glow: "bg-amber-500/25",
      cardBorder: "hover:border-amber-400/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
      privilegeLevel: 5
    },
    { 
      id: "gpu",
      category: "speed",
      title: "Priority GPU Worker Queues", 
      desc: "Skip public waiting queues. Your image generation, background removal, and audio stem splitting run on dedicated high-speed rendering lanes.", 
      icon: Cpu, 
      tag: "ZERO WAITING",
      badgeStyle: "border-purple-400/40 bg-purple-500/10 text-purple-300",
      iconColor: "text-purple-400",
      glow: "bg-purple-500/25",
      cardBorder: "hover:border-purple-400/50 hover:shadow-[0_0_35px_rgba(168,85,247,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(168,85,247,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-purple-400 to-indigo-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]",
      privilegeLevel: 5
    },
    { 
      id: "vault",
      category: "speed",
      title: "5 GB High-Speed Cloud Vault", 
      desc: "Permanent high-capacity cloud storage for your artwork, generated audio tracks, and studio assets — 100x larger than the free 50 MB allowance.", 
      icon: FolderLock, 
      tag: "5 GB CLOUD VAULT",
      badgeStyle: "border-cyan-400/40 bg-cyan-500/10 text-cyan-300",
      iconColor: "text-cyan-400",
      glow: "bg-cyan-500/25",
      cardBorder: "hover:border-cyan-400/50 hover:shadow-[0_0_35px_rgba(6,182,212,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(6,182,212,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]",
      privilegeLevel: 5
    },
    { 
      id: "limits",
      category: "creative",
      title: "Extended Media Processing Limits", 
      desc: "Upload and process heavy video files, lossless audio tracks, and high-resolution documents with multi-gigabyte memory limits.", 
      icon: Maximize2, 
      tag: "EXPANDED LIMITS",
      badgeStyle: "border-blue-400/40 bg-blue-500/10 text-blue-300",
      iconColor: "text-blue-400",
      glow: "bg-blue-500/25",
      cardBorder: "hover:border-blue-400/50 hover:shadow-[0_0_35px_rgba(59,130,246,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(59,130,246,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-blue-400 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
      privilegeLevel: 4
    },
    { 
      id: "commercial",
      category: "style",
      title: "100% Commercial Rights & No Watermarks", 
      desc: "Every export is 100% clean and unbranded with full commercial rights for client deliverables, commercial campaigns, and social channels.", 
      icon: ShieldCheck, 
      tag: "COMMERCIAL USE",
      badgeStyle: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
      iconColor: "text-emerald-400",
      glow: "bg-emerald-500/25",
      cardBorder: "hover:border-emerald-400/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(16,185,129,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
      privilegeLevel: 5
    },
    { 
      id: "cosmetics",
      category: "style",
      title: "Exclusive Pro Avatar & Name Cosmetics", 
      desc: "Instantly unlock exclusive Pro starter avatar frames and glowing signature name gradients to showcase your status across the community.", 
      icon: Crown, 
      tag: "PRO COSMETICS",
      badgeStyle: "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-300",
      iconColor: "text-fuchsia-400",
      glow: "bg-fuchsia-500/25",
      cardBorder: "hover:border-fuchsia-400/50 hover:shadow-[0_0_35px_rgba(217,70,239,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(217,70,239,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-fuchsia-400 to-purple-400 shadow-[0_0_8px_rgba(217,70,239,0.6)]",
      privilegeLevel: 4
    },
    { 
      id: "stackable",
      category: "creative",
      title: "Stackable Lifetime Credit Reserves", 
      desc: "Purchased credit packages stack permanently on top of your daily 500 credits and never expire, protecting your creative momentum.", 
      icon: Flame, 
      tag: "LIFETIME VAULT",
      badgeStyle: "border-amber-400/40 bg-amber-500/10 text-amber-300",
      iconColor: "text-amber-400",
      glow: "bg-amber-500/25",
      cardBorder: "hover:border-amber-400/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
      privilegeLevel: 4
    },
    { 
      id: "early",
      category: "speed",
      title: "First-Look Studio Tool Beta Access", 
      desc: "Be the first to test upcoming AI models, new creative tools, and developer features before they launch to the general public.", 
      icon: Compass, 
      tag: "EARLY ACCESS",
      badgeStyle: "border-rose-400/40 bg-rose-500/10 text-rose-300",
      iconColor: "text-rose-400",
      glow: "bg-rose-500/25",
      cardBorder: "hover:border-rose-400/50 hover:shadow-[0_0_35px_rgba(244,63,94,0.2)]",
      spinConic: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(244,63,94,0.6)_25%,transparent_50%)]",
      dotColor: "bg-gradient-to-r from-pink-400 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
      privilegeLevel: 5
    }
  ];

  const filteredBenefits = activeTab === "all" 
    ? benefits 
    : benefits.filter(b => b.category === activeTab);

  return (
    <div className="min-h-screen bg-[#030308] text-white selection:bg-purple-500/30 pb-32 overflow-hidden relative">
      {/* 🌌 High-End Ambient Lighting Architecture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] right-[-10%] w-[1000px] h-[1000px] bg-gradient-to-br from-purple-600/15 via-indigo-600/10 to-transparent blur-[160px] rounded-full animate-pulse" />
        <div className="absolute top-[40%] -left-[15%] w-[900px] h-[900px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-transparent blur-[150px] rounded-full" />
        <div className="absolute -bottom-[20%] right-[10%] w-[800px] h-[800px] bg-gradient-to-tl from-fuchsia-600/10 via-purple-900/10 to-transparent blur-[140px] rounded-full" />
        
        {/* Subtle Luxury Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 relative z-10">
        
        {/* Navigation & Header */}
        <div className="space-y-8 mb-12 md:mb-16">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 text-zinc-400 hover:text-white transition-all duration-300 group shadow-lg backdrop-blur-md"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-purple-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Return to Studio</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Crown size={14} className="text-purple-400 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-purple-300">
                  Exismic Pro Membership
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] text-white">
                Pro <GradientText className="from-purple-400 via-fuchsia-300 to-cyan-300">Privileges</GradientText>
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base font-medium leading-relaxed">
                Everything included with Exismic Pro: 10x daily generation credits, dedicated GPU worker lanes, high-capacity cloud storage, and exclusive studio cosmetics.
              </p>
            </div>

            {/* Status Card */}
            <div className="relative isolate group p-6 rounded-[2rem] border-2 border-white/[0.08] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden min-w-[310px] hover:border-purple-400/40 hover:shadow-[0_0_35px_rgba(168,85,247,0.2)] transition-all duration-500">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/20 blur-[60px] opacity-40 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Current Status</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-200 to-white">
                      {isPro ? "PRO MEMBER" : "FREE TIER"}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    {isPro ? "500 Credits Refreshed Daily" : "50 Credits Refreshed Daily"}
                  </div>
                  {isPro ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 pt-1">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>All Pro Perks Active</span>
                    </div>
                  ) : (
                    <Link href="/pro" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 pt-1.5 transition-colors group/link">
                      <span>Upgrade for 500 Daily Credits</span>
                      <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>

                <div className="relative h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden bg-[#090a14] border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                  <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,rgba(168,85,247,0.6)_25%,transparent_50%)]" />
                  <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#090a14] z-0" />
                  <Crown size={26} className="relative z-10 text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-3 px-1.5 mb-10 no-scrollbar">
          {[
            { id: "all", label: "All Privileges", icon: LayoutGrid },
            { id: "creative", label: "Creation Power", icon: Zap },
            { id: "speed", label: "GPU & Storage", icon: Cpu },
            { id: "style", label: "Studio Privileges", icon: ShieldCheck }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer border",
                  isActive 
                    ? "bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white border-purple-400/60 shadow-[0_4px_25px_rgba(168,85,247,0.4)]" 
                    : "bg-white/[0.04] text-zinc-400 hover:text-white border-white/10 hover:border-white/20 hover:bg-white/[0.08]"
                )}
              >
                <TabIcon size={15} className={isActive ? "text-white" : "text-zinc-500"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Privileges Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-24"
          >
            {filteredBenefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div 
                  key={b.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                  whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.02 }}
                  className={cn(
                    "group relative overflow-hidden rounded-[2rem] border-2 border-white/[0.08] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 p-7 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500 flex flex-col justify-between",
                    b.cardBorder
                  )}
                >
                  {/* Ambient Glow Mesh */}
                  <div className={cn("absolute -right-16 -top-16 h-40 w-40 rounded-full blur-[80px] opacity-25 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none", b.glow)} />
                  
                  {/* Micro Dot Matrix Watermark Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none" />

                  {/* Shine Hover Sweep */}
                  <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.06),transparent)] skew-x-[-30deg] transition-transform duration-1000 group-hover:translate-x-full pointer-events-none" />

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                    {/* Top Row: Rotating Conic Aura Orb on left, Tag Chip on right */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="relative h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden bg-[#090a14] border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                        {/* Rotating Conic Aura */}
                        <div className={cn("absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", b.spinConic)} />
                        {/* Inner dark glass */}
                        <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#090a14] z-0" />
                        <Icon size={24} className={cn("relative z-10 transition-all duration-500 group-hover:scale-110", b.iconColor)} />
                      </div>

                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm", b.badgeStyle)}>
                        {b.tag}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-2.5 flex-1">
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-purple-100 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                        {b.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] font-medium leading-relaxed text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        {b.desc}
                      </p>
                    </div>

                    {/* Privilege Tier Meter */}
                    <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        Privilege Tier
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[...Array(5)].map((_, idx) => (
                          <div 
                            key={idx} 
                            className={cn(
                              "w-2.5 h-1.5 rounded-full transition-all duration-300",
                              idx < b.privilegeLevel 
                                ? b.dotColor 
                                : "bg-zinc-800/80"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Hero Callout */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative isolate p-8 sm:p-12 lg:p-16 rounded-[2.5rem] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 border-2 border-white/[0.08] overflow-hidden text-center backdrop-blur-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)]"
        >
          {/* Glowing Center Radial */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-7">
            {/* Pro Crown Badge with Rotating Conic Aura */}
            <div className="relative w-16 h-16 rounded-3xl flex items-center justify-center overflow-hidden bg-[#090a14] border border-amber-400/40 mx-auto shadow-[0_0_35px_rgba(245,158,11,0.25)]">
              <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-80 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.8)_25%,transparent_50%)]" />
              <div className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] bg-[#090a14] z-0" />
              <Crown size={32} className="relative z-10 text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              {isPro ? (
                <>
                  Ready to Craft <br />
                  <span className="bg-gradient-to-r from-purple-300 via-fuchsia-200 to-cyan-300 bg-clip-text text-transparent">
                    Your Next Creation?
                  </span>
                </>
              ) : (
                <>
                  Unlock Full <br />
                  <span className="bg-gradient-to-r from-amber-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    Studio Capacity
                  </span>
                </>
              )}
            </h2>

            <p className="text-zinc-300 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto">
              {isPro 
                ? "Your Pro membership is active with unrestricted privileges. Jump into any tool and start creating without limits."
                : "Get 500 generation credits every day, priority GPU rendering, 5 GB cloud storage, and full commercial rights."
              }
            </p>

            {/* Quick Feature Badges for non-Pro */}
            {!isPro && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 text-left">
                <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d16]/80 p-3.5 text-center shadow-lg">
                  <Coins size={18} className="text-amber-400 mx-auto mb-1.5" />
                  <span className="text-[11px] font-bold text-white block">500 Credits/Day</span>
                  <span className="text-[10px] text-zinc-500">10x Free Tier</span>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d16]/80 p-3.5 text-center shadow-lg">
                  <Cpu size={18} className="text-purple-400 mx-auto mb-1.5" />
                  <span className="text-[11px] font-bold text-white block">Priority GPU</span>
                  <span className="text-[10px] text-zinc-500">Dedicated lanes</span>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d16]/80 p-3.5 text-center shadow-lg">
                  <FolderLock size={18} className="text-cyan-400 mx-auto mb-1.5" />
                  <span className="text-[11px] font-bold text-white block">5 GB Cloud Vault</span>
                  <span className="text-[10px] text-zinc-500">Permanent storage</span>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d16]/80 p-3.5 text-center shadow-lg">
                  <ShieldCheck size={18} className="text-emerald-400 mx-auto mb-1.5" />
                  <span className="text-[11px] font-bold text-white block">Commercial Rights</span>
                  <span className="text-[10px] text-zinc-500">Clean, no watermark</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              {isPro ? (
                <Link 
                  href="/" 
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black uppercase tracking-wider text-xs shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Launch Studio Dashboard</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link 
                  href="/pro" 
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 hover:brightness-110 text-white font-black uppercase tracking-wider text-xs shadow-[0_0_35px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
                >
                  <Crown size={16} className="text-amber-300" />
                  <span>Upgrade to Exismic Pro</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link 
                href="/tools" 
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
              >
                Browse All Tools
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
