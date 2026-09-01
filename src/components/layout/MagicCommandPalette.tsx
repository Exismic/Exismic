"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Sparkles, 
  X, 
  CornerDownLeft, 
  Loader2,
  Crown, 
  Zap, 
  Bot,
  Command,
  FileText,
  Mic2,
  Video,
  Code2,
  ImageIcon,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TOOLS, ICON_MAP } from "@/data/tools";

// Custom natural language search aliases
const TOOL_ALIASES: Record<string, string[]> = {
  "image-eraser": ["bg", "remove bg", "background remover", "eraser", "cutout", "transparent", "erase"],
  "ai-img-gen": ["image generator", "text to image", "generate photo", "art creator", "illustration", "art", "photo"],
  "audio-vocal-remover": ["vocal remover", "stem splitter", "karaoke", "separate music", "voice isolation", "split audio", "vocals", "instrumentals", "music"],
  "resume-builder": ["cv", "resume builder", "job application", "portfolio", "curriculum vitae", "career"],
  "ai-writer": ["writer", "copywriter", "scripts", "blog post", "social caption", "ai writing", "content"],
  "video-trimmer": ["video", "cut video", "trimmer", "clip", "video editor", "slice video"],
  "pdf-ocr": ["ocr", "pdf", "scan text", "document", "extract text", "scanner", "invoice"],
  "ai-code": ["code", "ide", "editor", "coding assistant", "terminal", "programmer", "software"]
};

// Category filter tabs
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "image", label: "Image" },
  { id: "audio", label: "Audio" },
  { id: "ai", label: "AI Writing" },
  { id: "video", label: "Video" },
  { id: "pdf", label: "PDF" }
];

// Quick Navigation items
const QUICK_COMMANDS = [
  { 
    id: "nav-tools", 
    label: "Explore All 50+ Tools", 
    description: "Browse the complete collection of creative utilities", 
    route: "/tools",
    category: "Explore",
    icon: <Sparkles size={16} className="text-purple-400" />
  },
  { 
    id: "nav-pro", 
    label: "Exismic Pro Plan", 
    description: "500 daily credits, 4K downloads, and priority speed", 
    route: "/pro",
    category: "Membership",
    icon: <Crown size={16} className="text-amber-400" />
  },
  { 
    id: "nav-assistant", 
    label: "Ask Exismic AI Assistant", 
    description: "Launch smart tool concierge", 
    route: "#",
    category: "AI",
    icon: <Bot size={16} className="text-cyan-400" />
  },
  { 
    id: "nav-shop", 
    label: "Credit Shop Vault", 
    description: "Claim daily bonus or purchase credit bundles", 
    route: "/shop",
    category: "Store",
    icon: <Zap size={16} className="text-cyan-400" />
  }
];

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  
  const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="text-cyan-300 font-bold bg-cyan-500/20 px-1 py-0.5 rounded">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function MagicCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen to keyboard activation triggers: '/' key or 'Ctrl/Cmd + K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName);
      
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (e.key === "/" && !isInput && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    
    const handleOpenCustom = () => setIsOpen(true);
    const handleToggleCustom = () => setIsOpen((prev) => !prev);
    window.addEventListener("open-command-palette", handleOpenCustom);
    window.addEventListener("toggle-command-palette", handleToggleCustom);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("open-command-palette", handleOpenCustom);
      window.removeEventListener("toggle-command-palette", handleToggleCustom);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery("");
      setSelectedCategory("all");
      setSelectedIndex(0);
      setIsExecuting(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Compute matched items dynamically
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    
    // Filter tools by category if selected
    let sourceTools = TOOLS;
    if (selectedCategory !== "all") {
      sourceTools = TOOLS.filter(t => t.category === selectedCategory);
    }

    // 1. Default State (No text typed)
    if (!trimmed) {
      if (selectedCategory !== "all") {
        return [
          {
            group: `${selectedCategory.toUpperCase()} TOOLS`,
            items: sourceTools.map(t => ({
              id: t.id,
              label: t.name,
              description: t.description,
              category: t.category,
              route: t.href,
              icon: ICON_MAP[t.icon] ? (() => { const Icon = ICON_MAP[t.icon]; return <Icon size={16} className="text-purple-400" />; })() : <Sparkles size={16} className="text-purple-400" />,
              pro: t.pro
            }))
          }
        ];
      }

      const popularTools = TOOLS.filter(t => [
        "image-eraser", 
        "ai-img-gen", 
        "audio-vocal-remover", 
        "ai-writer",
        "video-trimmer", 
        "pdf-ocr"
      ].includes(t.id));
      
      return [
        {
          group: "Featured Tools",
          items: popularTools.map(t => ({
            id: t.id,
            label: t.name,
            description: t.description,
            category: t.category,
            route: t.href,
            icon: ICON_MAP[t.icon] ? (() => { const Icon = ICON_MAP[t.icon]; return <Icon size={16} className="text-purple-400" />; })() : <Sparkles size={16} className="text-purple-400" />,
            pro: t.pro
          }))
        },
        {
          group: "Quick Navigation",
          items: QUICK_COMMANDS.map(c => ({
            id: c.id,
            label: c.label,
            description: c.description,
            category: "Navigation",
            route: c.route,
            icon: c.icon,
            pro: false
          }))
        }
      ];
    }

    // 2. Active Search Query State
    const matchedTools: any[] = [];
    const matchedCommands: any[] = [];

    sourceTools.forEach(tool => {
      let score = 0;
      const name = tool.name.toLowerCase();
      const desc = tool.description.toLowerCase();
      const cat = tool.category.toLowerCase();

      if (name.includes(trimmed)) score += 10;
      if (desc.includes(trimmed)) score += 4;
      if (cat.includes(trimmed)) score += 2;

      const synonyms = TOOL_ALIASES[tool.id] || [];
      if (synonyms.some(s => s.includes(trimmed) || trimmed.includes(s))) {
        score += 15;
      }

      if (score > 0) {
        matchedTools.push({
          id: tool.id,
          label: tool.name,
          description: tool.description,
          category: tool.category,
          route: tool.href,
          score,
          pro: tool.pro,
          icon: ICON_MAP[tool.icon] ? (() => { const Icon = ICON_MAP[tool.icon]; return <Icon size={16} className="text-cyan-400" />; })() : <Zap size={16} className="text-cyan-400" />
        });
      }
    });

    if (selectedCategory === "all") {
      QUICK_COMMANDS.forEach(cmd => {
        const label = cmd.label.toLowerCase();
        const desc = cmd.description.toLowerCase();
        
        if (label.includes(trimmed) || desc.includes(trimmed)) {
          matchedCommands.push({
            id: cmd.id,
            label: cmd.label,
            description: cmd.description,
            category: "Navigation",
            route: cmd.route,
            icon: cmd.icon,
            pro: false
          });
        }
      });
    }

    matchedTools.sort((a, b) => b.score - a.score);

    const groups = [];
    if (matchedTools.length > 0) {
      groups.push({ group: "Matching Tools", items: matchedTools });
    }
    if (matchedCommands.length > 0) {
      groups.push({ group: "Navigation", items: matchedCommands });
    }

    return groups;
  }, [query, selectedCategory]);

  const flattenedItems = useMemo(() => {
    return searchResults.flatMap(g => g.items);
  }, [searchResults]);

  const handleExecute = (item: any) => {
    if (isExecuting) return;
    setIsExecuting(item.id);

    if (item.id === "nav-assistant" || item.route === "#") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("exismic_restore_ai_assistant"));
      }
      setTimeout(() => {
        setIsOpen(false);
        setIsExecuting(null);
      }, 100);
      return;
    }

    setTimeout(() => {
      setIsOpen(false);
      setIsExecuting(null);
      router.push(item.route);
    }, 180);
  };

  // Keyboard navigation controller
  useEffect(() => {
    const handleKeyboardNavigation = (e: KeyboardEvent) => {
      if (!isOpen || isExecuting) return;
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (flattenedItems.length || 1));
      }
      
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (flattenedItems.length || 1)) % (flattenedItems.length || 1));
      }
      
      if (e.key === "Enter" && flattenedItems.length > 0) {
        e.preventDefault();
        handleExecute(flattenedItems[selectedIndex]);
      }
    };
    
    window.addEventListener("keydown", handleKeyboardNavigation);
    return () => window.removeEventListener("keydown", handleKeyboardNavigation);
  }, [isOpen, flattenedItems, selectedIndex, isExecuting]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-4 sm:pt-[12vh] px-3 sm:px-4 font-sans select-none">
          
          {/* Backdrop Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isExecuting && setIsOpen(false)}
            className="absolute inset-0 bg-[#020206]/85 backdrop-blur-2xl"
          />

          {/* Luxury Obsidian Search Dialog */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e1022]/95 via-[#080914]/98 to-[#05060d]/98 border border-white/10 rounded-2xl sm:rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_60px_rgba(168,85,247,0.18)] overflow-hidden flex flex-col backdrop-blur-3xl max-h-[88vh] sm:max-h-[75vh]"
          >
            {/* Top Multi-Spectrum Glow Rim */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/70 via-cyan-400/70 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Input Header Area */}
            <div className="relative flex items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-white/[0.08] gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
                <Search size={16} />
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isExecuting !== null}
                placeholder="Search tools, actions, or features..."
                className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder-zinc-500 font-medium tracking-normal leading-none disabled:opacity-50"
              />

              {/* Clear Query Button */}
              {query && (
                <button 
                  onClick={() => setQuery("")}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}

              {/* Universal Close Button (Dedicated for Mobile & Desktop) */}
              <button
                onClick={() => !isExecuting && setIsOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-zinc-300 hover:text-white transition-all text-xs font-bold cursor-pointer shrink-0 active:scale-95 shadow-sm"
                aria-label="Close search modal"
              >
                <span>Close</span>
                <span className="hidden sm:inline text-[9px] font-mono font-bold text-zinc-500 bg-black/40 px-1 py-0.5 rounded border border-white/10">ESC</span>
                <X size={13} className="sm:hidden" />
              </button>
            </div>

            {/* Category Filter Pills Bar */}
            <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-white/[0.05] bg-white/[0.01] overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap border shrink-0",
                    selectedCategory === cat.id
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/15"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Matched Lists Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 sm:p-3.5 space-y-4 relative min-h-[220px]">
              {isExecuting && (
                <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[1px] rounded-b-2xl flex items-center justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-purple-500/40 text-purple-300 text-xs font-bold shadow-2xl">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Opening tool...</span>
                  </div>
                </div>
              )}

              {flattenedItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-500">
                    <Search size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-200">No tools found for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-zinc-500 mt-1">Try searching for background remover, vocal separator, or PDF.</p>
                  </div>
                </div>
              ) : (
                searchResults.map((group, groupIndex) => {
                  let previousItemsCount = 0;
                  for (let i = 0; i < groupIndex; i++) {
                    previousItemsCount += searchResults[i].items.length;
                  }

                  return (
                    <div key={group.group} className="space-y-1.5">
                      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                        <span>{group.group}</span>
                        <div className="h-px bg-white/[0.05] flex-1" />
                      </div>

                      <div className="space-y-1">
                        {group.items.map((item, itemIndex) => {
                          const globalIdx = previousItemsCount + itemIndex;
                          const isSelected = globalIdx === selectedIndex;
                          const executingThis = isExecuting === item.id;

                          return (
                            <button
                              key={item.id}
                              onMouseEnter={() => !isExecuting && setSelectedIndex(globalIdx)}
                              onClick={() => !isExecuting && handleExecute(item)}
                              disabled={isExecuting !== null}
                              className={cn(
                                "w-full flex items-center gap-3.5 px-3.5 sm:px-4 py-3 rounded-xl sm:rounded-2xl text-left transition-all duration-150 group relative border cursor-pointer",
                                isSelected && !isExecuting 
                                  ? "bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent border-purple-500/35 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)] -translate-y-0.5" 
                                  : "bg-zinc-950/40 border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08]"
                              )}
                            >
                              {/* Left Accent Selection Bar */}
                              {isSelected && (
                                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-gradient-to-b from-purple-400 to-cyan-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                              )}

                              {/* Icon container */}
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 border shadow-sm",
                                isSelected 
                                  ? "bg-purple-500/20 text-purple-200 border-purple-500/40 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                                  : "bg-white/[0.03] border-white/[0.06] text-zinc-400 group-hover:text-zinc-200"
                              )}>
                                {item.icon}
                              </div>

                              {/* Title / Description */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={cn(
                                    "text-xs sm:text-sm font-bold transition-colors",
                                    isSelected ? "text-white" : "text-zinc-200"
                                  )}>
                                    <HighlightedText text={item.label} query={query} />
                                  </span>

                                  {item.category && item.category !== "Navigation" && (
                                    <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-black uppercase bg-white/[0.04] text-zinc-400 border border-white/10">
                                      {item.category}
                                    </span>
                                  )}

                                  {item.pro && (
                                    <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[8px] font-mono font-black uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                                      <Crown size={9} /> Pro
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] sm:text-xs text-zinc-400 font-medium truncate mt-0.5">
                                  <HighlightedText text={item.description} query={query} />
                                </p>
                              </div>

                              {/* Selection Cue / Arrow */}
                              {executingThis ? (
                                <div className="shrink-0 text-purple-400 flex items-center pr-1">
                                  <Loader2 size={14} className="animate-spin" />
                                </div>
                              ) : isSelected ? (
                                <div className="flex shrink-0 items-center gap-1.5 pr-1 text-purple-300 font-bold text-xs">
                                  <span className="hidden sm:inline text-[10px] font-medium text-zinc-400">Open</span>
                                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-200 shadow-sm">
                                    <CornerDownLeft size={11} />
                                  </div>
                                </div>
                              ) : (
                                <div className="hidden sm:flex shrink-0 items-center text-zinc-600 group-hover:text-zinc-400 transition-colors">
                                  <ChevronRight size={14} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Clean Responsive Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-white/[0.07] bg-white/[0.01] flex items-center justify-between text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-3 sm:gap-4 text-[11px]">
                <span className="hidden sm:flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400">↑↓</kbd> 
                  <span>Navigate</span>
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400">↵</kbd> 
                  <span>Select</span>
                </span>
                <span className="sm:hidden text-zinc-400 text-[11px]">
                  Tap any tool to open
                </span>
              </div>

              <button
                onClick={() => !isExecuting && setIsOpen(false)}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300">ESC</kbd> 
                <span>to close</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
