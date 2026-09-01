"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToolCard } from "@/components/ui/ToolCard";
import { TOOLS } from "@/data/tools";
import { 
  Search, 
  Sparkles, 
  X, 
  LayoutGrid, 
  ArrowRight, 
  Flame, 
  Palette, 
  Mic2, 
  PenTool, 
  Film, 
  FileText, 
  Code2,
  Crown
} from "lucide-react";
import { CategorySection } from "@/components/tool/CategorySection";
import { createClient } from "@/utils/supabase/client";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import type { Session } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import Link from "next/link";

const FILTER_TABS = [
  { id: "all", label: "All Tools", icon: LayoutGrid, color: "text-purple-400" },
  { id: "popular", label: "Trending", icon: Flame, color: "text-amber-400" },
  { id: "image", label: "Image & Photo", icon: Palette, color: "text-fuchsia-400" },
  { id: "audio", label: "Audio & Music", icon: Mic2, color: "text-cyan-400" },
  { id: "ai", label: "AI Writing", icon: PenTool, color: "text-emerald-400" },
  { id: "video", label: "Video", icon: Film, color: "text-rose-400" },
  { id: "pdf", label: "PDF & Docs", icon: FileText, color: "text-blue-400" },
  { id: "developer", label: "Developer", icon: Code2, color: "text-indigo-400" }
];

export default function ToolsLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      setSession(data?.session || null);
    });
  }, [supabase]);

  // Compute filtered tools based on search and category
  const filteredTools = useMemo(() => {
    let result = TOOLS;

    // Filter by category tab
    if (activeCategory === "popular") {
      result = result.filter(t => t.popular);
    } else if (activeCategory !== "all") {
      result = result.filter(t => t.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [searchQuery, activeCategory]);

  const trendingTools = useMemo(() => TOOLS.filter(t => t.popular), []);

  return (
    <div className="min-h-screen bg-[#03040b] text-white p-4 sm:p-6 md:p-10 pb-28 md:pb-32 overflow-x-hidden relative">
      {/* Ambient Cyber Radial Light Beams */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] left-[20%] w-[600px] h-[600px] bg-purple-600/[0.08] blur-[180px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-cyan-500/[0.06] blur-[180px] rounded-full" />
        <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-600/[0.05] blur-[160px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">
        
        {/* Peak Cyber Header */}
        <header className="space-y-8 pt-4 sm:pt-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Title & Copy */}
            <div className="space-y-4 max-w-2xl">
              <div className="relative group/toolbadge inline-flex items-center select-none">
                <div 
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600/40 via-indigo-500/30 to-cyan-400/40 opacity-60 blur-[8px] group-hover/toolbadge:opacity-100 group-hover/toolbadge:blur-[12px] transition-all duration-300"
                />
                <div className="relative p-[1.5px] rounded-full bg-gradient-to-r from-purple-500/70 via-cyan-400/70 to-indigo-500/70 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#080a1c]/95 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                    <LayoutGrid size={13} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,1)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
                      Studio Directory • 50+ Tools
                    </span>
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05]">
                Explore All <span className="bg-gradient-to-r from-purple-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(168,85,247,0.3)]">Tools</span>
              </h1>
              
              <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
                Everything you need to edit photos, isolate vocals, write content, generate art, and build applications — all in one unified studio.
              </p>
            </div>

            {/* Peak Cyber Capsule Widget (Matches Screenshot 3 Style) */}
            <div className="group relative select-none shrink-0 self-start lg:self-center">
              {/* Radiant Cyber Aura Halo */}
              <div 
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600/40 via-cyan-500/30 to-pink-500/40 opacity-70 blur-[8px] group-hover:opacity-100 group-hover:blur-[12px] transition-all duration-500"
              />

              {/* Metallic Gradient Outer Rim */}
              <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-purple-500/50 via-cyan-400/50 to-pink-500/50 group-hover:from-purple-400 group-hover:via-cyan-300 group-hover:to-pink-400 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.25)]">
                
                {/* Cyber-Obsidian Core */}
                <div className="relative flex items-center gap-4 px-4 py-3 rounded-2xl bg-[#070918]/95 border border-purple-500/20 backdrop-blur-2xl overflow-hidden">
                  
                  {/* Top Specular Sheen Beam */}
                  <div 
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent"
                  />

                  {/* Left Cyber Emblem */}
                  <div className="relative shrink-0">
                    <ExismicMark size={36} animated={true} />
                  </div>

                  {/* Center Text */}
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-white">
                        Exismic Studio
                      </span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 block mt-0.5">
                      {TOOLS.length} Ready Tools
                    </span>
                  </div>

                  {/* Right Action Key Box */}
                  <Link 
                    href="/pro"
                    className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 hover:border-amber-400/50 hover:bg-amber-500/15 flex items-center justify-center text-zinc-300 hover:text-amber-300 transition-all shrink-0 cursor-pointer shadow-sm group/btn"
                    title="Exismic Pro Membership"
                  >
                    <Crown size={16} className="group-hover/btn:scale-110 transition-transform text-amber-400" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Search & Filter Bar Suite */}
          <div className="space-y-5 pt-2">
            
            {/* Peak Luxury Cyber-Obsidian Search Bar */}
            <div className="group/search relative flex h-14 sm:h-16 w-full cursor-pointer items-center rounded-2xl sm:rounded-3xl p-[1.5px] select-none isolate transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(168,85,247,0.15)] focus-within:shadow-[0_20px_50px_rgba(34,211,238,0.25),0_0_30px_rgba(168,85,247,0.3)]">
              
              {/* Radiant Cyber Halo Glow */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-600/35 via-indigo-500/30 to-cyan-500/35 opacity-70 blur-[6px] transition-all duration-500 group-focus-within/search:opacity-100 group-focus-within/search:blur-[10px]"
              />

              {/* Metallic Gradient Outer Border Rim */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl p-[1.5px] bg-gradient-to-r from-purple-500/40 via-cyan-400/40 to-indigo-500/40 group-focus-within/search:from-purple-400 group-focus-within/search:via-cyan-300 group-focus-within/search:to-indigo-400 transition-all duration-300"
              />

              {/* Glassmorphic Cyber-Obsidian Core */}
              <div className="relative flex h-full w-full items-center gap-3.5 overflow-hidden rounded-2xl sm:rounded-3xl px-4 sm:px-6 bg-gradient-to-r from-[#060814]/95 via-[#0b0e22]/95 to-[#070918]/95 border border-purple-500/20 group-focus-within/search:border-cyan-400/50 backdrop-blur-2xl transition-all duration-300">
                
                {/* Top Edge Light Rim */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent"
                />

                {/* Electric Search Jewel Emblem */}
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-b from-purple-500/30 via-cyan-500/20 to-indigo-900/40 border border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.35)] group-focus-within/search:border-cyan-300 group-focus-within/search:shadow-[0_0_18px_rgba(34,211,238,0.6)] group-focus-within/search:scale-105 transition-all duration-300">
                    <Search
                      size={16}
                      className="text-cyan-200 drop-shadow-[0_0_6px_rgba(34,211,238,1)] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Input */}
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 50+ tools (e.g. background remover, vocal isolator, pdf, resume)..."
                  className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base font-semibold text-white placeholder:text-zinc-500 leading-none"
                />

                {/* Clear search or shortcut */}
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <kbd className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-[10px] font-mono font-bold text-zinc-400">
                    Ctrl + K
                  </kbd>
                )}
              </div>
            </div>

            {/* Cyber-Obsidian Category Filter Tabs */}
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2 px-1.5 -mx-1.5">
              {FILTER_TABS.map((tab) => {
                const isSelected = activeCategory === tab.id;
                const TabIcon = tab.icon;
                const count = tab.id === "all" 
                  ? TOOLS.length 
                  : tab.id === "popular" 
                    ? trendingTools.length 
                    : TOOLS.filter(t => t.category.toLowerCase() === tab.id.toLowerCase()).length;

                return isSelected ? (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className="relative shrink-0 p-[1.5px] rounded-xl bg-gradient-to-r from-purple-500/80 via-cyan-400/80 to-indigo-500/80 shadow-[0_0_20px_rgba(168,85,247,0.35),0_0_10px_rgba(34,211,238,0.25)] select-none cursor-pointer active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-[10.5px] bg-[#0b0e24]/95 border border-purple-500/30">
                      <TabIcon 
                        size={14} 
                        className={cn(tab.color, "drop-shadow-[0_0_6px_currentColor]")} 
                      />
                      <span className="text-xs font-black text-white tracking-wide">{tab.label}</span>
                      <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-md bg-purple-500/25 text-cyan-200 border border-cyan-400/35">
                        {count}
                      </span>
                    </div>
                  </button>
                ) : (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className="group/tab relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#070918]/80 border border-white/[0.08] text-zinc-400 hover:text-white hover:border-purple-400/40 hover:bg-white/[0.04] transition-all duration-200 shrink-0 select-none cursor-pointer active:scale-95"
                  >
                    <TabIcon 
                      size={14} 
                      className={cn("transition-transform group-hover/tab:scale-110", tab.color)} 
                    />
                    <span>{tab.label}</span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-500 group-hover/tab:text-zinc-300 border border-white/5">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </header>

        {/* Dynamic Tool Grid Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
              <LayoutGrid size={15} className="text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              <span>
                {searchQuery.trim() 
                  ? `Search Results (${filteredTools.length})` 
                  : activeCategory === "all" 
                    ? `All Studio Tools (${filteredTools.length})` 
                    : `${FILTER_TABS.find(t => t.id === activeCategory)?.label || "Category"} (${filteredTools.length})`
                }
              </span>
            </div>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {filteredTools.map((tool, i) => (
                <ToolCard key={tool.id} {...tool} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-20 px-6 text-center space-y-6 bg-gradient-to-b from-[#0e1024]/60 to-[#070814]/80 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-2xl max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mx-auto shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <Search size={28} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white">No tools found for &ldquo;{searchQuery}&rdquo;</h3>
                <p className="text-xs text-zinc-400 font-medium">Try checking your spelling or browse using the category tabs above.</p>
              </div>

              {/* Peak Reset Button styled like Screenshot 3 */}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="group/reset relative inline-flex items-center gap-3 p-[1.5px] rounded-2xl bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500 shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#080918] border border-purple-500/30">
                  <Sparkles size={14} className="text-cyan-300" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">Reset Filters</span>
                  <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 group-hover/reset:text-white">
                    <ArrowRight size={12} className="group-hover/reset:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Category Universe Section (when in default view) */}
        {!searchQuery.trim() && activeCategory === "all" && (
          <section className="space-y-6 pt-12 border-t border-white/[0.06]">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Explore by <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Category</span>
              </h2>
              <p className="text-zinc-400 font-medium text-xs sm:text-sm">
                Browse our focused collections organized by creative discipline.
              </p>
            </div>
            <CategorySection />
          </section>
        )}

      </div>
    </div>
  );
}
