"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { 
  Zap, 
  Infinity as InfinityIcon,
  Sparkles, 
  ArrowRight, 
  Eraser, 
  Mic2, 
  PenTool, 
  ShieldCheck, 
  Zap as ZapIcon, 
  CheckCircle2, 
  Lock, 
  Plus, 
  Crown, 
  Layers, 
  Search, 
  Video, 
  Music, 
  Wand2, 
  HelpCircle,
  Flame,
  Maximize2,
  FileText,
  Activity,
  Sliders,
  Check,
  ChevronRight,
  Shield,
  Gauge,
  Sparkle,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ToolCard } from "@/components/ui/ToolCard";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";
import { InteractivePlayground } from "@/components/tool/InteractivePlayground";

interface FeaturedTool {
  id: string;
  name: string;
  description: string;
  category: "image" | "audio" | "video" | "pdf" | "ai";
  icon: any;
  href: string;
  popular?: boolean;
  pro?: boolean;
  proPowerPack?: boolean;
  highlightTag?: string;
}

const FEATURED_TOOLS: FeaturedTool[] = [
  {
    id: "image-eraser",
    name: "Background Remover",
    description: "Erase backgrounds from photos in one click with clean, crisp edges.",
    category: "image",
    icon: "ImageIcon",
    href: "/tools/image/eraser",
    proPowerPack: true,
    popular: true,
    highlightTag: "Clean Cutout"
  },
  {
    id: "ai-img-gen",
    name: "AI Image Generator",
    description: "Turn your words and ideas into stunning artwork, photos, and wallpapers.",
    category: "image",
    icon: "Sparkles",
    href: "/tools/ai/img-gen",
    pro: true,
    proPowerPack: true,
    popular: true,
    highlightTag: "4K Art"
  },
  {
    id: "audio-vocal-remover",
    name: "Vocal Remover",
    description: "Split voice and music tracks from any song in seconds.",
    category: "audio",
    icon: "Mic2",
    href: "/tools/audio/vocal-remover",
    popular: true,
    highlightTag: "Clean Separation"
  },
  {
    id: "ai-writer",
    name: "AI Writer",
    description: "Write video scripts, blog posts, and catchy social captions in seconds.",
    category: "ai",
    icon: "PenTool",
    href: "/tools/ai/writer",
    pro: true,
    highlightTag: "Smart Writer"
  },
  {
    id: "video-trimmer",
    name: "Video Trimmer",
    description: "Quickly cut and trim your videos right in your browser.",
    category: "video",
    icon: "Video",
    href: "/tools/video/trimmer",
    highlightTag: "Quick Cut"
  },
  {
    id: "pdf-ocr",
    name: "Text Scanner (OCR)",
    description: "Copy and edit text from images, scanned documents, and PDFs.",
    category: "pdf",
    icon: "Search",
    href: "/tools/pdf/ocr",
    popular: true,
    highlightTag: "Scan Text"
  }
];

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIndia, setIsIndia] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    let active = true;
    fetch("/api/billing/market", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (active) {
          setIsIndia(data.countryCode === "UNKNOWN" ? getIsIndia() : data.market === "IN");
        }
      })
      .catch(() => {
        if (active) setIsIndia(getIsIndia());
      });
    return () => {
      active = false;
    };
  }, []);

  const proPriceVal = isIndia ? PRICING_CONFIG.PRO_PLAN.INR : PRICING_CONFIG.PRO_PLAN.USD;
  const proPrice = isIndia ? `₹${proPriceVal}` : `$${proPriceVal}`;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const filteredTools = activeCategory === "all" 
    ? FEATURED_TOOLS 
    : FEATURED_TOOLS.filter(t => t.category === activeCategory);

  return (
    <div ref={containerRef} className="flex flex-col w-full overflow-hidden bg-[#030306] selection:bg-purple-500/30 font-sans text-zinc-100">

      {/* 1. HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden">
        
        {/* Ambient Grid & Multi-Spectrum Radial Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-[0.3]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%, black 40%, transparent 80%)'
            }}
          />
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 16%, rgba(168, 85, 247, 0.18) 0%, transparent 60%),
                radial-gradient(circle at 85% 35%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
                radial-gradient(circle at 15% 65%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
              `
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center space-y-6 sm:space-y-10"
          >
            {/* Top Badge */}
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative group/herobadge inline-flex items-center mx-auto select-none"
              >
                {/* Ambient Aura */}
                <div 
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600/50 via-cyan-500/40 to-pink-500/50 opacity-60 blur-[10px] group-hover/herobadge:opacity-100 group-hover/herobadge:blur-[14px] transition-all duration-300"
                />

                {/* Metallic Gradient Border */}
                <div className="relative p-[1.5px] rounded-full bg-gradient-to-r from-purple-500/80 via-cyan-400/80 to-pink-500/80 shadow-[0_0_25px_rgba(168,85,247,0.35),0_0_15px_rgba(34,211,238,0.25)]">
                  <div className="flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-[#070919]/90 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-85" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-purple-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      Simple & Powerful AI Tools
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.88] uppercase">
                ALL-IN-ONE <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 drop-shadow-[0_0_50px_rgba(168,85,247,0.4)]">
                  AI STUDIO.
                </span>
              </h1>
            </div>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl md:text-2xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed px-2">
              Remove backgrounds, make images, split vocals, edit videos, and write content — <span className="text-zinc-200">everything you need, in one simple place.</span>
            </p>

            {/* ULTRA-PREMIUM CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-xl mx-auto pt-2">
              
              {/* Primary Action: Try for Free */}
              <Link href="/tools" className="w-full sm:w-auto group/btn flex-1">
                <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 shadow-[0_0_35px_rgba(217,70,239,0.45),0_10px_25px_-5px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(217,70,239,0.7),0_15px_35px_-5px_rgba(168,85,247,0.4)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300">
                  <button className="w-full h-15 sm:h-16 px-8 rounded-[14.5px] bg-gradient-to-r from-[#9333ea] via-[#6366f1] to-[#06b6d4] hover:from-[#a855f7] hover:via-[#4f46e5] hover:to-[#22d3ee] flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.2em] text-xs sm:text-[13px] relative overflow-hidden shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.6)] whitespace-nowrap cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out" />
                    <Rocket size={17} className="text-cyan-100 shrink-0 drop-shadow-[0_0_8px_rgba(34,211,238,1)] group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 group-hover/btn:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10">Try for Free</span>
                    <ArrowRight size={15} className="text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </Link>

              {/* Secondary Action: Upgrade to Pro */}
              <Link href="/pro" className="w-full sm:w-auto group/btn flex-1">
                <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-amber-400/60 via-yellow-300/60 to-amber-500/60 hover:from-amber-300 hover:via-yellow-200 hover:to-amber-400 transition-all duration-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_45px_rgba(245,158,11,0.6)] hover:scale-[1.03] active:scale-[0.98]">
                  <button className="w-full h-15 sm:h-16 px-8 rounded-[14.5px] bg-[#0c0d18]/95 hover:bg-[#15172b]/95 backdrop-blur-2xl flex items-center justify-center gap-3 text-amber-200 hover:text-white font-black uppercase tracking-[0.2em] text-xs sm:text-[13px] transition-colors relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] whitespace-nowrap cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out" />
                    <Crown size={16} className="text-amber-400 fill-amber-400/40 shrink-0 drop-shadow-[0_0_10px_rgba(251,191,36,1)] group-hover/btn:scale-110 group-hover/btn:text-yellow-200 transition-transform" />
                    <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent group-hover/btn:from-white group-hover/btn:to-amber-100">Upgrade to Pro</span>
                    <ArrowRight size={15} className="group-hover/btn:translate-x-1.5 transition-transform text-amber-400 group-hover/btn:text-white" />
                  </button>
                </div>
              </Link>

            </div>

            {/* BENEFIT TILES */}
            <div className="pt-6 sm:pt-10 w-full max-w-5xl mx-auto">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
                
                {/* Tile 1: Speed */}
                <div className="relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#111326]/80 via-[#0a0a16]/70 to-[#05050c]/85 border border-white/[0.08] hover:border-purple-500/45 backdrop-blur-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] hover:shadow-[0_20px_45px_-10px_rgba(168,85,247,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] transition-all duration-300 group/tile hover:-translate-y-1 overflow-hidden cursor-default text-left">
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/tile:via-purple-400/80 transition-all duration-500" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover/tile:scale-150 transition-transform duration-500" />
                  
                  <div className="relative z-10 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover/tile:scale-110 transition-transform duration-300">
                      <Zap size={18} className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug group-hover/tile:text-purple-200 transition-colors">
                        Lightning Fast
                      </h4>
                      <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 group-hover/tile:text-zinc-300 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        Instant Results
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tile 2: Privacy */}
                <div className="relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#111326]/80 via-[#0a0a16]/70 to-[#05050c]/85 border border-white/[0.08] hover:border-cyan-500/45 backdrop-blur-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] hover:shadow-[0_20px_45px_-10px_rgba(6,182,212,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] transition-all duration-300 group/tile hover:-translate-y-1 overflow-hidden cursor-default text-left">
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/tile:via-cyan-400/80 transition-all duration-500" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover/tile:scale-150 transition-transform duration-500" />
                  
                  <div className="relative z-10 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover/tile:scale-110 transition-transform duration-300">
                      <Lock size={18} className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug group-hover/tile:text-cyan-200 transition-colors">
                        100% Private
                      </h4>
                      <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 group-hover/tile:text-zinc-300 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Your Files Stay Safe
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tile 3: 50+ Tools */}
                <div className="relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#111326]/80 via-[#0a0a16]/70 to-[#05050c]/85 border border-white/[0.08] hover:border-indigo-500/45 backdrop-blur-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] hover:shadow-[0_20px_45px_-10px_rgba(99,102,241,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] transition-all duration-300 group/tile hover:-translate-y-1 overflow-hidden cursor-default text-left">
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/tile:via-indigo-400/80 transition-all duration-500" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover/tile:scale-150 transition-transform duration-500" />
                  
                  <div className="relative z-10 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover/tile:scale-110 transition-transform duration-300">
                      <Layers size={18} className="drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug group-hover/tile:text-indigo-200 transition-colors">
                        50+ Creative Tools
                      </h4>
                      <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 group-hover/tile:text-zinc-300 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        All In One Place
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tile 4: Free Tier */}
                <div className="relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#111326]/80 via-[#0a0a16]/70 to-[#05050c]/85 border border-white/[0.08] hover:border-emerald-500/45 backdrop-blur-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] hover:shadow-[0_20px_45px_-10px_rgba(16,185,129,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)] transition-all duration-300 group/tile hover:-translate-y-1 overflow-hidden cursor-default text-left">
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/tile:via-emerald-400/80 transition-all duration-500" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover/tile:scale-150 transition-transform duration-500" />
                  
                  <div className="relative z-10 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover/tile:scale-110 transition-transform duration-300">
                      <ShieldCheck size={18} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug group-hover/tile:text-emerald-200 transition-colors">
                        Free to Start
                      </h4>
                      <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 group-hover/tile:text-zinc-300 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        No Card Needed
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        </div>

        {/* Smooth Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="mt-8 flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => {
            document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-500 group-hover:text-purple-400 transition-colors">
            Scroll to explore
          </span>
          <div className="w-5 h-8 rounded-full border border-zinc-800 group-hover:border-purple-500/50 flex justify-center p-1 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.05)]">
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]"
            />
          </div>
        </motion.div>
      </section>

      {/* 2. INTERACTIVE SANDBOX PLAYGROUND */}
      <InteractivePlayground />

      {/* 3. CURATED POWER TOOLS SHOWCASE (WITH INTERACTIVE CATEGORY TABS) */}
      <section id="explore" className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full relative">
        
        <div className="flex flex-col items-center mb-10 sm:mb-12 text-center space-y-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <Wand2 size={13} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">Popular Tools</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-[0.98]">
            Curated <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">Power Tools.</span>
          </h2>

          <p className="text-zinc-400 font-medium text-xs sm:text-sm md:text-base max-w-xl">
            Our most popular creative tools to help you work faster and make better content.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: "all", label: "All Tools" },
              { id: "image", label: "🎨 Image & Art" },
              { id: "audio", label: "🎵 Audio & Music" },
              { id: "ai", label: "✍️ Writing" },
              { id: "video", label: "🎬 Video Tools" },
              { id: "pdf", label: "📄 PDF & Documents" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer border",
                  activeCategory === cat.id
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/15"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Tool Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool, idx) => (
              <motion.div
                key={tool.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className="h-full"
              >
                <ToolCard 
                  id={tool.id} 
                  name={tool.name} 
                  description={tool.description} 
                  category={tool.category} 
                  icon={tool.icon} 
                  href={tool.href} 
                  proPowerPack={tool.proPowerPack}
                  pro={tool.pro}
                  popular={tool.popular} 
                  index={idx}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Explore All Link CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link href="/tools">
             <button className="group h-14 px-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-[0.25em] transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] cursor-pointer">
                <span>Explore All 50+ Tools</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-purple-400" />
             </button>
          </Link>
        </div>
      </section>

      {/* 4. PRO MEMBERSHIP TEASER */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
         {/* Background ambient lighting */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,rgba(168,85,247,0.06)_40%,transparent_75%)] rounded-full blur-[140px] pointer-events-none" />

         <div className="max-w-4xl mx-auto relative z-10">
           
           {/* Glassmorphic Pricing Card Frame */}
           <div className="p-[1.5px] sm:p-[2px] rounded-3xl sm:rounded-[3.5rem] bg-gradient-to-b from-amber-500/40 via-purple-500/30 via-cyan-500/30 to-amber-500/40 shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_60px_rgba(245,158,11,0.15)]">
             <div className="bg-[#070814]/95 p-6 sm:p-12 md:p-16 rounded-[22px] sm:rounded-[3.3rem] backdrop-blur-2xl border border-white/[0.08] text-center space-y-8 sm:space-y-10 relative overflow-hidden group">
               
               {/* Internal ambient corner glows */}
               <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 via-purple-500/50 to-transparent group-hover:via-amber-400/80 transition-all duration-700" />
               <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-transparent blur-[100px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-purple-500/20 via-cyan-500/10 to-transparent blur-[100px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
               
               <div className="relative z-10 space-y-6 sm:space-y-8">
                 
                 {/* Top Badge & Header */}
                 <div className="space-y-3 sm:space-y-4">
                   <div className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border border-amber-400/30 text-amber-300 w-fit mx-auto shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                      <Crown size={14} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-200">Exismic Pro</span>
                   </div>

                   <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase leading-[0.96]">
                      UPGRADE <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-purple-300 to-cyan-400">
                        TO PRO.
                      </span>
                   </h2>

                   <p className="text-zinc-400 font-medium text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                     Get 500 fresh credits every day, high-quality 4K downloads, and fast priority speed across every tool.
                   </p>
                 </div>

                 {/* Real Accurate Features Grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 max-w-2xl mx-auto text-left py-2">
                    {[
                      { 
                        title: '500 Daily Credits', 
                        desc: 'Fresh credits added every 24 hours (10x the free tier)',
                        badge: '10x Daily',
                        icon: Zap,
                        iconBg: 'bg-amber-500/15 border-amber-500/30',
                        iconColor: 'text-amber-400'
                      },
                      { 
                        title: 'Ultra-Sharp 4K Quality', 
                        desc: 'Export clear, high-resolution visuals & audio stems',
                        badge: 'Ultra HD',
                        icon: Sparkles,
                        iconBg: 'bg-cyan-500/15 border-cyan-500/30',
                        iconColor: 'text-cyan-400'
                      },
                      { 
                        title: 'VIP Priority Speed', 
                        desc: 'Skip waiting lines with instant fast processing',
                        badge: 'Instant',
                        icon: ZapIcon,
                        iconBg: 'bg-purple-500/15 border-purple-500/30',
                        iconColor: 'text-purple-400'
                      },
                      { 
                        title: 'No Watermarks or Ads', 
                        desc: 'Clean files ready to use, publish, and share',
                        badge: 'Clean',
                        icon: CheckCircle2,
                        iconBg: 'bg-emerald-500/15 border-emerald-500/30',
                        iconColor: 'text-emerald-400'
                      },
                      { 
                        title: 'Commercial License', 
                        desc: '100% royalty-free for client and business projects',
                        badge: 'Commercial',
                        icon: Lock,
                        iconBg: 'bg-indigo-500/15 border-indigo-500/30',
                        iconColor: 'text-indigo-400'
                      },
                      { 
                        title: 'Unlock All Pro Tools', 
                        desc: 'Full access to all premium tools & future features',
                        badge: 'Full Access',
                        icon: Crown,
                        iconBg: 'bg-pink-500/15 border-pink-500/30',
                        iconColor: 'text-pink-400'
                      }
                    ].map(feat => (
                      <div key={feat.title} className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.06] hover:border-amber-500/40 transition-all duration-300 flex items-start gap-3.5 group/item shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:-translate-y-0.5">
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-sm group-hover/item:scale-110 transition-transform", feat.iconBg)}>
                           <feat.icon size={15} className={feat.iconColor} />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-xs sm:text-sm block group-hover/item:text-amber-200 transition-colors">{feat.title}</span>
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-black uppercase bg-white/[0.04] text-zinc-400 border border-white/10 shrink-0">
                              {feat.badge}
                            </span>
                          </div>
                          <span className="text-zinc-400 text-[10px] sm:text-[11px] block leading-tight font-medium">{feat.desc}</span>
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 {/* Price Display & CTA Section */}
                 <div className="pt-3 space-y-5 sm:space-y-6 border-t border-white/[0.08]">
                    
                    <div className="flex flex-col items-center gap-1.5 pt-2">
                       <div className="flex items-baseline justify-center gap-2">
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-amber-200 text-5xl sm:text-7xl font-black tracking-tight drop-shadow-[0_0_35px_rgba(245,158,11,0.3)]">
                            {proPrice}
                          </span>
                          <span className="text-zinc-400 text-xs sm:text-sm font-bold tracking-normal uppercase">
                            / month
                          </span>
                       </div>

                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                         Simple Monthly Subscription • Cancel Anytime with 1 Click
                       </p>
                    </div>

                    {/* CTA Button */}
                    <div className="space-y-4">
                      <Link href="/pro" className="inline-block w-full max-w-md group/pro">
                        <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-400 shadow-[0_0_40px_rgba(245,158,11,0.35)] hover:shadow-[0_0_60px_rgba(168,85,247,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                          <button className="w-full h-15 sm:h-16 px-8 rounded-[14.5px] bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs sm:text-sm flex items-center justify-center gap-2.5 relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/pro:translate-x-full transition-transform duration-1000 ease-out" />
                            <Crown size={16} className="text-amber-200" />
                            <span className="relative z-10">Get Pro Membership Now</span>
                            <ArrowRight size={16} className="group-hover/pro:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </Link>

                      {/* Trust Badges */}
                      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-85 text-zinc-400 text-[10px] font-mono">
                         <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                           <Lock size={12} className="text-amber-400" />
                           Secure Checkout
                         </div>
                         <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                           <CheckCircle2 size={12} className="text-emerald-400" />
                           Cancel Anytime in 1-Click
                         </div>
                      </div>
                    </div>

                 </div>
               </div>
             </div>
           </div>
         </div>
      </section>

      {/* 5. FAQ ACCORDION SECTION */}
      <FaqAccordion />

      {/* 6. CLOSING RADIANT CALL-TO-ACTION BANNER */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          
          {/* Multi-Spectrum Glowing Frame */}
          <div className="p-[1.5px] sm:p-[2px] rounded-3xl sm:rounded-[3.5rem] bg-gradient-to-r from-purple-500/50 via-indigo-500/40 via-cyan-500/40 to-purple-500/50 shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_70px_rgba(168,85,247,0.25)]">
            <div className="bg-[#070815]/95 p-8 sm:p-16 md:p-20 rounded-[22px] sm:rounded-[3.3rem] backdrop-blur-3xl border border-white/[0.08] relative overflow-hidden text-center space-y-8 sm:space-y-10 group">
              
              {/* Internal Ambient Light Highlights & Orbs */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent group-hover:via-cyan-400/80 transition-all duration-700" />
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />
              <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

              {/* Banner Content */}
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-cyan-500/15 border border-purple-400/30 text-[10px] font-black uppercase tracking-[0.28em] text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Sparkle size={12} className="text-purple-400 animate-pulse" />
                  <span>Start Creating Today</span>
                </div>

                <h2 className="text-3xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase leading-[0.95]">
                  Ready to Make <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                    Something Great?
                  </span>
                </h2>

                <p className="text-zinc-300 font-medium text-xs sm:text-base leading-relaxed max-w-xl mx-auto">
                  Start editing photos, making music, cutting videos, and writing content in seconds.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-lg mx-auto pt-2">
                
                <Link href="/tools" className="w-full sm:w-auto group/btn flex-1">
                  <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_35px_rgba(168,85,247,0.45)] hover:shadow-[0_0_55px_rgba(168,85,247,0.65)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300">
                    <button className="w-full h-15 sm:h-16 px-8 rounded-[14.5px] bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 flex items-center justify-center gap-2.5 text-white font-black uppercase tracking-[0.2em] text-xs sm:text-[13px] relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)] whitespace-nowrap cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out" />
                      <Sparkles size={16} className="text-white shrink-0" />
                      <span className="relative z-10">Start Creating Free</span>
                    </button>
                  </div>
                </Link>

                <Link href="/pro" className="w-full sm:w-auto group/btn flex-1">
                  <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-white/15 via-purple-500/30 to-cyan-500/20 hover:from-purple-500/50 hover:via-indigo-500/50 hover:to-cyan-500/50 transition-all duration-400 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(168,85,247,0.3)] hover:scale-[1.03] active:scale-[0.98]">
                    <button className="w-full h-15 sm:h-16 px-8 rounded-[14.5px] bg-[#0b0c16]/95 hover:bg-[#121424]/95 backdrop-blur-2xl flex items-center justify-center gap-2.5 text-zinc-100 hover:text-white font-black uppercase tracking-[0.2em] text-xs sm:text-[13px] transition-colors relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] whitespace-nowrap cursor-pointer">
                      <Crown size={16} className="text-purple-400 shrink-0 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                      <span>Explore Pro Plan</span>
                      <ArrowRight size={15} className="group-hover/btn:translate-x-1.5 transition-transform text-zinc-400 group-hover/btn:text-white" />
                    </button>
                  </div>
                </Link>

              </div>

              {/* Bottom Trust Chips */}
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-[10px] sm:text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Zap size={11} className="text-purple-400" />
                  Works in Seconds
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <Lock size={11} className="text-cyan-400" />
                  100% Private
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  Free to Start
                </span>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is Exismic free to use?",
      a: "Yes! Exismic gives you free daily access to all our tools, including background removal, vocal separation, and AI image generation. No credit card is needed."
    },
    {
      q: "What tools are included?",
      a: "You get over 50+ creative tools for making images, removing backgrounds, splitting vocals and music, trimming video clips, scanning text from PDFs, and writing content."
    },
    {
      q: "Do I need a credit card to sign up?",
      a: "No credit card or payment info is needed to use our free tools."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes, you can cancel your Pro plan anytime from your account settings with a single click. You will keep your benefits until the end of your billing cycle."
    },
    {
      q: "Are my files private and safe?",
      a: "Yes, 100%. Your photos, audio, and documents belong only to you. We never share or sell your files, and we do not use your content to train AI models."
    }
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full relative">
      <div className="flex flex-col items-center mb-10 text-center space-y-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <HelpCircle size={13} />
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Help & FAQ</span>
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-[0.98]">
          Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">Questions</span>
        </h2>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className={cn(
                "border rounded-2xl overflow-hidden transition-all duration-300",
                isOpen 
                  ? "bg-zinc-900/60 border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.1)]" 
                  : "bg-zinc-950/40 border-white/[0.05] hover:border-white/10"
              )}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left text-white font-bold text-sm sm:text-base hover:bg-white/[0.01] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className={cn("text-zinc-500 transition-transform duration-300 shrink-0 ml-4", isOpen ? "rotate-45 text-purple-400" : "")}>
                  <Plus size={18} />
                </span>
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="p-5 sm:p-6 pt-0 text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed border-t border-white/[0.03]">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
