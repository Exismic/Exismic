"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Command, ArrowRight, Zap, Sparkles, X, TrendingUp, History, Star, MousePointer2, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TOOLS, Tool, ICON_MAP, CATEGORIES } from "@/data/tools";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  isHero?: boolean;
}

export function SearchBar({ isHero = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Suggested tools when query is empty
  const suggestions = useMemo(() => {
    return TOOLS.filter(t => t.pro || ['image-eraser', 'audio-vocal-remover', 'ai-img-gen'].includes(t.id)).slice(0, 4);
  }, []);

  // Filter tools based on query
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const searchTerms = query.toLowerCase().split(/\s+/);
    return TOOLS.filter((tool) => {
      const toolCategory = CATEGORIES.find(c => c.id === tool.category)?.name || tool.category;
      const searchableText = `${tool.name} ${toolCategory} ${tool.description}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    }).slice(0, 6);
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isHero && e.key === "/" && !isOpen && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (!isHero && (e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }

      const activeList = query.trim() ? results : suggestions;
      if (activeList.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % activeList.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleSelect(activeList[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, suggestions, selectedIndex, query, isHero]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (tool: Tool) => {
    router.push(tool.href);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className={cn("relative z-50 transition-all duration-500", isHero ? "w-full max-w-4xl mx-auto" : "max-w-xl flex-1 px-4")} ref={dropdownRef}>
      {/* Dynamic Master Glow - Scaled down for header */}
      <div suppressHydrationWarning className={cn(
        "absolute -inset-1 bg-linear-to-r from-accent-purple via-accent-cyan to-accent-purple blur-2xl transition-all duration-1000 opacity-0 rounded-[2rem] pointer-events-none",
        isFocused && (isHero ? "opacity-30 animate-pulse scale-110" : "opacity-15 animate-pulse")
      )} />
      
      <div className={cn(
        "relative transition-all duration-500",
        isFocused && isHero ? "scale-[1.02]" : "scale-100"
      )}>
        {/* Input Surface */}
        <div className={cn(
            "relative flex items-center transition-all duration-500 border",
            isHero ? "h-20 px-8 rounded-[2rem]" : "h-12 px-5 rounded-2xl",
            isFocused 
                ? "bg-zinc-900/90 border-white/20 shadow-2xl backdrop-blur-3xl" 
                : "bg-white/[0.03] border-white/5 backdrop-blur-md hover:border-white/10"
        )}>
          {isFocused && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none rounded-[inherit]" />}

          <div className={cn(
            "transition-all duration-500 flex items-center justify-center",
            isHero ? "mr-5" : "mr-3",
            isFocused ? "text-accent-purple filter drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "text-zinc-600"
          )}>
            {query ? <Search size={isHero ? 28 : 18} strokeWidth={3} /> : <Zap size={isHero ? 28 : 18} strokeWidth={3} className="animate-pulse" />}
          </div>
          
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
            }}
            onFocus={() => { setIsFocused(true); setIsOpen(true); }}
            onBlur={() => setIsFocused(false)}
            placeholder={isHero ? "Search all tools..." : "Search..."}
            className={cn(
                "flex-1 bg-transparent border-none font-black text-white placeholder:text-zinc-700 outline-none select-none uppercase italic tracking-tighter",
                isHero ? "text-2xl" : "text-[11px] tracking-widest"
            )}
          />

          <div className="flex items-center gap-3 relative z-10">
            {query && (
              <button 
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90"
              >
                <X size={14} />
              </button>
            )}
            {!isHero && (
                <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-md bg-black border border-white/5 text-[9px] font-black tracking-widest text-zinc-600 uppercase">
                    <Command size={10} />
                    <span>K</span>
                </div>
            )}
          </div>
        </div>

        {/* Results Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={cn(
                "absolute top-full left-0 right-0 z-[100] overflow-hidden",
                isHero ? "mt-6 rounded-[2.5rem]" : "mt-3 rounded-[1.5rem]",
                "border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.9)] bg-zinc-950/95 backdrop-blur-3xl"
              )}
            >
              <div className={cn("flex flex-col p-4 gap-6")}>
                {/* 1. Results Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-600">
                      Searching Tools...
                    </p>
                    <div className="h-px flex-1 mx-4 bg-white/5" />
                  </div>

                  <div className="space-y-2">
                    {(query.trim() ? results : suggestions).map((tool, index) => {
                      const Icon = ICON_MAP[tool.icon] || Zap;
                      const isSelected = index === selectedIndex;
                      const category = CATEGORIES.find(c => c.id === tool.category);
                      
                      return (
                        <div
                          key={tool.id}
                          onMouseEnter={() => setSelectedIndex(index)}
                          onClick={() => handleSelect(tool)}
                          className={cn(
                            "group/item relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden",
                            isSelected 
                              ? "bg-white/[0.07] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] translate-x-2" 
                              : "hover:bg-white/[0.03] border border-transparent"
                          )}
                        >
                          {/* Selected Item Glow */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-linear-to-r from-accent-purple/10 to-transparent pointer-events-none" />
                          )}

                          <div className={cn(
                            "w-12 h-12 rounded-[1rem] flex items-center justify-center transition-all duration-500 shrink-0 relative overflow-hidden",
                            isSelected 
                              ? "bg-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white scale-110" 
                              : "bg-zinc-900 border border-white/5 text-zinc-600"
                          )}>
                             <Icon size={22} className={cn(isSelected && "animate-pulse")} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-3">
                                <h4 className={cn(
                                    "text-sm font-black uppercase italic tracking-tight transition-colors",
                                    isSelected ? "text-white" : "text-zinc-400"
                                )}>{tool.name}</h4>
                                <div className="flex items-center gap-1.5">
                                   {tool.pro && (
                                      <span className="px-2 py-0.5 rounded-sm bg-accent-purple/20 text-accent-purple text-[7px] font-black uppercase tracking-widest">Pro</span>
                                   )}
                                   <span className="px-2 py-0.5 rounded-sm bg-white/5 text-zinc-600 text-[7px] font-black uppercase tracking-widest">{category?.name}</span>
                                </div>
                             </div>
                             <p className={cn(
                               "text-[10px] font-medium leading-relaxed mt-1 transition-colors",
                               isSelected ? "text-zinc-400" : "text-zinc-600"
                             )}>
                                {tool.description}
                             </p>
                          </div>
 
                          <div className={cn(
                             "transition-all duration-500 flex items-center gap-2",
                             isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                          )}>
                             <span className="text-[8px] font-black text-accent-purple uppercase tracking-widest">Jump</span>
                             <ArrowRight size={16} className="text-accent-purple" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Status Bar */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 mx-1">
                   <div className="flex items-center gap-4 opacity-40">
                      <div className="flex items-center gap-2 text-[7px] font-black uppercase tracking-widest text-zinc-500">
                         <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/5">↑↓</kbd> Select
                      </div>
                      <div className="flex items-center gap-2 text-[7px] font-black uppercase tracking-widest text-zinc-500">
                         <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/5">↵</kbd> Open
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                       <span className="text-[7px] font-black uppercase tracking-[0.4em] text-accent-cyan/60">Lumora v6.2</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
