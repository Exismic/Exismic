"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Sparkles, Image as ImageIcon, FileText, Code2, 
  Wand2, X, Clock, ArrowRight, CornerDownLeft, Settings, Loader2,
  Crown, Zap, Mic2, Music, Palette, Check, SearchIcon, Terminal
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TOOLS, Tool, ICON_MAP, CATEGORIES } from "@/data/tools";

// Custom natural language aliases mapping for smart search matching
const TOOL_ALIASES: Record<string, string[]> = {
  "image-eraser": ["bg", "remove bg", "background remover", "eraser", "cutout", "object remover", "transparent", "erase bg"],
  "ai-img-gen": ["image generator", "text to image", "generate photo", "stable diffusion", "midjourney", "art creator", "illustration", "painting", "sdxl"],
  "audio-vocal-remover": ["vocal remover", "stem splitter", "karaoke", "separate music", "voice isolation", "split audio", "vocals", "instrumentals"],
  "resume-builder": ["cv", "resume builder", "job application", "ats", "portfolio", "curriculum vitae", "career"],
  "social-caption-generator": ["caption maker", "instagram post", "copywriting", "hashtag helper", "social media", "writing", "facebook", "linkedin"],
  "screenshot-to-code": ["ui to code", "figma to code", "export code", "frontend gen", "design converter", "wireframe"],
  "ai-code": ["ide", "editor", "monaco", "coding assistant", "agentic coding", "programmer", "software development", "vs code"]
};

// AI Smart Commands configuration
const AI_COMMANDS = [
  { 
    id: "cmd-img-upscale", 
    label: "Upscale image to 4K resolution", 
    description: "AI-driven clarity and pixel restoration", 
    route: "/tools/ai/img-gen?action=upscale",
    category: "AI Commands",
    icon: <Sparkles size={16} className="text-accent-purple" />
  },
  { 
    id: "cmd-bg-isolate", 
    label: "Isolate main subject instantly", 
    description: "Remove background with semantic subject parsing", 
    route: "/tools/image/eraser?auto=true",
    category: "AI Commands",
    icon: <Wand2 size={16} className="text-accent-cyan" />
  },
  { 
    id: "cmd-caption-marketing", 
    label: "Generate viral copywriter caption", 
    description: "Vision-based post caption creator", 
    route: "/tools/social-caption-generator?auto=true",
    category: "AI Commands",
    icon: <FileText size={16} className="text-amber-500" />
  },
  { 
    id: "cmd-resume-software", 
    label: "Draft elite Software Engineer resume", 
    description: "ATS-optimized templates and copy", 
    route: "/tools/resume-builder?template=software-engineer",
    category: "Quick Actions",
    icon: <FileText size={16} className="text-emerald-500" />
  },
  { 
    id: "cmd-code-fresh", 
    label: "Initialize Next.js project template", 
    description: "Autonomous file setup in Exismic IDE", 
    route: "/tools/ai/code?new=true",
    category: "Quick Actions",
    icon: <Code2 size={16} className="text-accent-purple" />
  }
];

// Rich text matching highlighting
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  
  const escapedQuery = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="text-accent-cyan font-black bg-accent-cyan/10 px-1 py-0.5 rounded transition-all duration-300">
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
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
      setIsExecuting(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Compute matched items dynamically based on the search query
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    
    // 1. Default State: No search query entered (Smart categorized suggestions)
    if (!trimmed) {
      const creativeSuite = TOOLS.filter(t => ["ai-img-gen", "image-eraser", "audio-vocal-remover", "resume-builder"].includes(t.id));
      const developerSuite = TOOLS.filter(t => ["ai-code", "screenshot-to-code"].includes(t.id));
      
      return [
        {
          group: "Creative AI Suite",
          items: creativeSuite.map(t => ({
            id: t.id,
            label: t.name,
            description: t.description,
            route: t.href,
            icon: ICON_MAP[t.icon] ? <span className="text-accent-purple">{(() => { const Icon = ICON_MAP[t.icon]; return <Icon size={16} />; })()}</span> : <Sparkles size={16} />,
            pro: t.pro
          }))
        },
        {
          group: "Developer Tools",
          items: developerSuite.map(t => ({
            id: t.id,
            label: t.name,
            description: t.description,
            route: t.href,
            icon: ICON_MAP[t.icon] ? <span className="text-accent-cyan">{(() => { const Icon = ICON_MAP[t.icon]; return <Icon size={16} />; })()}</span> : <Code2 size={16} />,
            pro: t.pro
          }))
        },
        {
          group: "Quick Actions",
          items: AI_COMMANDS.map(c => ({
            id: c.id,
            label: c.label,
            description: c.description,
            route: c.route,
            icon: c.icon,
            pro: true
          }))
        }
      ];
    }

    // 2. Active Search State: Dynamic score-based filtering
    const matchedTools: any[] = [];
    const matchedCommands: any[] = [];

    // Filter tools using natural language substring matching & synonyms
    TOOLS.forEach(tool => {
      let score = 0;
      const name = tool.name.toLowerCase();
      const desc = tool.description.toLowerCase();
      const cat = tool.category.toLowerCase();

      if (name.includes(trimmed)) score += 10;
      if (desc.includes(trimmed)) score += 4;
      if (cat.includes(trimmed)) score += 2;

      // Synonym mapping scores
      const synonyms = TOOL_ALIASES[tool.id] || [];
      if (synonyms.some(s => s.includes(trimmed) || trimmed.includes(s))) {
        score += 15; // Give synonyms heavy priority
      }

      if (score > 0) {
        matchedTools.push({
          id: tool.id,
          label: tool.name,
          description: tool.description,
          route: tool.href,
          score,
          pro: tool.pro,
          icon: ICON_MAP[tool.icon] ? (() => { const Icon = ICON_MAP[tool.icon]; return <Icon size={16} />; })() : <Zap size={16} />
        });
      }
    });

    // Filter AI Commands
    AI_COMMANDS.forEach(cmd => {
      const label = cmd.label.toLowerCase();
      const desc = cmd.description.toLowerCase();
      
      if (label.includes(trimmed) || desc.includes(trimmed)) {
        matchedCommands.push({
          id: cmd.id,
          label: cmd.label,
          description: cmd.description,
          route: cmd.route,
          icon: cmd.icon,
          pro: true
        });
      }
    });

    // Sort tools by match relevance score
    matchedTools.sort((a, b) => b.score - a.score);

    const groups = [];
    if (matchedTools.length > 0) {
      groups.push({ group: "Tools", items: matchedTools });
    }
    if (matchedCommands.length > 0) {
      groups.push({ group: "AI Commands", items: matchedCommands });
    }

    return groups;
  }, [query]);

  // Flattened results for keyboard cursor index positioning
  const flattenedItems = useMemo(() => {
    return searchResults.flatMap(g => g.items);
  }, [searchResults]);

  const handleExecute = (item: any) => {
    if (isExecuting) return;
    setIsExecuting(item.id);
    setTimeout(() => {
      setIsOpen(false);
      setIsExecuting(null);
      router.push(item.route);
    }, 450);
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

  // Reset selected cursor index whenever matches rebuild
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4 font-sans select-none">
          {/* Transparent Backdrop Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isExecuting && setIsOpen(false)}
            className="absolute inset-0 bg-[#030303]/85 backdrop-blur-2xl"
          />

          {/* Immersive Floating Command Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="relative w-full max-w-2xl bg-zinc-950/95 border border-white/10 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9),0_0_50px_rgba(168,85,247,0.1)] overflow-hidden flex flex-col"
          >
            {/* Ambient Background Lights */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-purple/40 to-transparent z-20" />
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent-purple/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-cyan/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Input Header Area */}
            <div className="relative flex items-center px-6 py-5 border-b border-white/5">
              <Search size={18} className="text-zinc-500 shrink-0 mr-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isExecuting !== null}
                placeholder={isExecuting ? "Opening secure workspace..." : "Search tools, actions or commands..."}
                className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder-zinc-500 font-bold tracking-tight uppercase italic leading-none disabled:opacity-50"
              />
              <button 
                onClick={() => !isExecuting && setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-zinc-500 hover:text-white transition-all hover:scale-105 active:scale-95 ml-4"
              >
                <X size={14} />
              </button>
            </div>

            {/* Dynamic Matched Lists Body */}
            <div className="max-h-[50vh] overflow-y-auto no-scrollbar p-3 space-y-4 relative min-h-[200px]">
              {isExecuting && (
                <div className="absolute inset-0 z-50 bg-black/10 backdrop-blur-[1px] rounded-b-[2rem]" />
              )}

              {flattenedItems.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto text-zinc-600">
                    <Terminal size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider text-white italic">No matches found</p>
                    <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest mt-1">Try typing another keyword</p>
                  </div>
                </div>
              ) : (
                searchResults.map((group, groupIndex) => {
                  // Compute baseline offset index of this group relative to flattened array
                  let previousItemsCount = 0;
                  for (let i = 0; i < groupIndex; i++) {
                    previousItemsCount += searchResults[i].items.length;
                  }

                  return (
                    <div key={group.group} className="space-y-1.5">
                      <div className="px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
                        <span>{group.group}</span>
                        <div className="h-px bg-white/5 flex-1" />
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
                                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all duration-300 group relative border",
                                isSelected && !isExecuting 
                                  ? "bg-white/[0.05] border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] scale-[1.005] -translate-y-0.5" 
                                  : "bg-transparent border-transparent hover:bg-white/[0.02]"
                              )}
                            >
                              {/* Item icon border container */}
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500",
                                isSelected 
                                  ? "bg-white/10 text-white border border-white/15 scale-110 shadow-md" 
                                  : "bg-zinc-900 border border-white/5 text-zinc-500 group-hover:text-zinc-300"
                              )}>
                                {item.icon}
                              </div>

                              {/* Title / Description */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <p className={cn(
                                    "text-xs font-black uppercase italic tracking-wider transition-colors",
                                    isSelected ? "text-white" : "text-zinc-300"
                                  )}>
                                    <HighlightedText text={item.label} query={query} />
                                  </p>
                                  {item.pro && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-[8px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                                      <Crown size={8} fill="currentColor" /> Pro
                                    </div>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-500 font-bold truncate mt-0.5 uppercase tracking-tight">
                                  <HighlightedText text={item.description} query={query} />
                                </p>
                              </div>

                              {/* Executing Spinner / Selection Cue */}
                              {executingThis ? (
                                <div className="shrink-0 text-accent-cyan flex items-center pr-1">
                                  <Loader2 size={14} className="animate-spin" />
                                </div>
                              ) : isSelected ? (
                                <div className="shrink-0 flex items-center gap-2 pr-1 opacity-100 transition-opacity">
                                  <span className="text-[8px] font-black text-zinc-500 tracking-[0.2em] italic uppercase">ACTIVATE</span>
                                  <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 text-[10px]">
                                    <CornerDownLeft size={10} />
                                  </div>
                                </div>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Premium Status Footer Bar */}
            <div className="px-6 py-4 border-t border-white/5 bg-zinc-950/60 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[9px] font-black tracking-widest uppercase text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 text-[9px]">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 text-[9px]">↵</kbd> select
                </span>
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest text-accent-purple animate-pulse flex items-center gap-1.5">
                <Sparkles size={11} /> Magic Commands Palette
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
