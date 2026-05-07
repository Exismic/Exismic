"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToolCard } from "@/components/ui/ToolCard";
import { TOOLS } from "@/data/tools";
import { LayoutGrid, Search, AlertCircle, TrendingUp, LogIn } from "lucide-react";
import { CategorySection } from "@/components/tool/CategorySection";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect } from "react";

export default function ToolsLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, [supabase]);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const trendingTools = useMemo(() => TOOLS.filter(t => t.popular), []);

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6 md:p-12 pb-32">
      {/* 🔮 Background Architecture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[5%] right-[10%] w-[500px] h-[500px] bg-accent-purple/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-[5%] left-[10%] w-[500px] h-[500px] bg-accent-cyan/[0.03] blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto space-y-20">
        {/* Header Section */}
        <header className="space-y-8 pt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                     <LayoutGrid size={12} className="text-accent-purple" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tool Library</span>
                  </div>
                  {!session && (
                    <Link href="/auth/login" className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple hover:bg-accent-purple/20 transition-all group">
                       <LogIn size={12} className="group-hover:translate-x-0.5 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Sign In</span>
                    </Link>
                  )}
                </div>
                <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9]">
                   Elite <br />
                   <span className="gradient-text">Collection</span>
                </h1>
             </div>
             
             <div className="max-w-md text-zinc-500 font-medium text-sm leading-relaxed md:text-right">
                Browse our complete suite of AI-powered creative tools. From cinematic video editing to advanced image manipulation, everything you need is right here.
             </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
             <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-accent-purple transition-colors">
                <Search size={24} />
             </div>
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search for a tool (e.g. 'bg remover', 'meme generator')..."
               className="w-full bg-zinc-900/50 border border-white/5 rounded-[2.5rem] py-8 pl-20 pr-10 text-xl font-bold placeholder:text-zinc-800 outline-none focus:ring-2 focus:ring-accent-purple/20 focus:border-accent-purple/40 transition-all shadow-4xl backdrop-blur-md"
             />
             <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                {searchQuery && (
                   <button 
                     onClick={() => setSearchQuery("")}
                     className="p-2 rounded-full hover:bg-white/10 text-zinc-500 transition-colors"
                   >
                      <AlertCircle size={20} className="rotate-45" />
                   </button>
                )}
                <kbd className="hidden md:flex px-3 py-1.5 rounded-lg bg-zinc-800 border border-white/5 text-[10px] font-black text-zinc-500">⌘ K</kbd>
             </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {searchQuery.trim() ? (
             <motion.section 
               key="search-results"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-12"
             >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Search size={18} className="text-accent-purple" />
                      <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">Search Results</h2>
                   </div>
                   <p className="text-[10px] font-black text-zinc-600">{filteredTools.length} tools found</p>
                </div>

                {filteredTools.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredTools.map((tool, i) => (
                        <ToolCard key={tool.id} {...tool} index={i} />
                      ))}
                   </div>
                ) : (
                   <div className="py-20 text-center space-y-6 bg-zinc-900/30 rounded-[3rem] border border-white/5">
                      <div className="w-16 h-16 rounded-3xl bg-zinc-800 flex items-center justify-center text-zinc-600 mx-auto">
                         <Search size={32} />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-xl font-black italic uppercase">No tools found</h3>
                         <p className="text-zinc-600 text-xs font-medium">Try searching for something else or browse categories below.</p>
                      </div>
                   </div>
                )}
             </motion.section>
          ) : (
             <motion.div
               key="default-view"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-20"
             >
                {/* Featured Section */}
                <section className="space-y-8">
                   <div className="flex items-center gap-3">
                      <TrendingUp size={18} className="text-accent-cyan" />
                      <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">Trending Now</h2>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {trendingTools.map((tool, i) => (
                        <ToolCard key={tool.id} {...tool} index={i} />
                      ))}
                   </div>
                </section>

                {/* Complete Explorer */}
                <section className="space-y-12 pt-12 border-t border-zinc-900">
                   <div className="flex items-center justify-between">
                      <div className="space-y-2">
                         <h2 className="text-3xl font-black italic uppercase tracking-tighter">Explore by <span className="gradient-text">Category</span></h2>
                         <p className="text-zinc-500 font-medium text-xs">Dive deep into our specialized toolsets</p>
                      </div>
                   </div>
                   
                   <CategorySection />
                </section>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

