"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Palette, 
  RefreshCw, 
  Copy, 
  Lock, 
  Unlock, 
  Download,
  Code2,
  Zap,
  Sparkles,
  Sun,
  Moon,
  Cloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ColorItem {
  hex: string;
  locked: boolean;
}

const PRESETS = [
  { id: "random", label: "Random", icon: RefreshCw },
  { id: "pastel", label: "Soft Pastel", icon: Cloud },
  { id: "vibrant", label: "Vibrant", icon: Sparkles },
  { id: "dark", label: "Dark Mode", icon: Moon },
  { id: "warm", label: "Warm Tones", icon: Sun },
  { id: "cool", label: "Cool Tones", icon: Zap },
];

export function PaletteGenerator() {
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [prompt, setPrompt] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [exportMode, setExportMode] = useState<"css" | "tailwind" | "json" | null>(null);

  const generateHex = (preset = "random") => {
    let h = Math.random() * 360;
    let s = 50 + Math.random() * 40;
    let l = 40 + Math.random() * 20;

    if (preset === "pastel") { s = 30 + Math.random() * 20; l = 80 + Math.random() * 10; }
    if (preset === "vibrant") { s = 80 + Math.random() * 20; l = 50 + Math.random() * 10; }
    if (preset === "dark") { s = 20 + Math.random() * 30; l = 10 + Math.random() * 20; }
    if (preset === "warm") { h = Math.random() > 0.5 ? Math.random() * 50 : 330 + Math.random() * 30; s = 70; l = 50; }
    if (preset === "cool") { h = 180 + Math.random() * 100; s = 60; l = 50; }

    // Convert HSL to Hex (Simple Approximation)
    const hslToHex = (h: number, s: number, l: number) => {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };

    return hslToHex(h, s, l);
  };

  const generatePalette = useCallback((preset = "random") => {
    setColors(prev => {
      if (prev.length === 0) {
        return Array.from({ length: 5 }).map(() => ({ hex: generateHex(preset), locked: false }));
      }
      return prev.map(c => c.locked ? c : { hex: generateHex(preset), locked: false });
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => generatePalette(), 0);
    return () => window.clearTimeout(timer);
  }, [generatePalette]);

  const copyColor = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleLock = (index: number) => {
    setColors(prev => prev.map((c, i) => i === index ? { ...c, locked: !c.locked } : c));
  };

  const getExportString = () => {
    if (exportMode === "css") {
      return colors.map((c, i) => `--color-${i + 1}: ${c.hex};`).join("\n");
    }
    if (exportMode === "tailwind") {
      return `colors: {\n${colors.map((c, i) => `  'primary-${i + 1}': '${c.hex}',`).join("\n")}\n}`;
    }
    if (exportMode === "json") {
      return JSON.stringify(colors.map(c => c.hex), null, 2);
    }
    return "";
  };

  const handlePromptGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const p = prompt.toLowerCase();
    if (p.includes("dark") || p.includes("night")) generatePalette("dark");
    else if (p.includes("pastel") || p.includes("soft")) generatePalette("pastel");
    else if (p.includes("warm") || p.includes("sun") || p.includes("fire")) generatePalette("warm");
    else if (p.includes("cool") || p.includes("ice") || p.includes("ocean")) generatePalette("cool");
    else if (p.includes("vibrant") || p.includes("neon")) generatePalette("vibrant");
    else generatePalette("random");
  };

  const downloadPalettePng = () => {
    if (colors.length === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const context = canvas.getContext("2d");
    if (!context) return;

    const swatchWidth = canvas.width / colors.length;
    colors.forEach((color, index) => {
      context.fillStyle = color.hex;
      context.fillRect(index * swatchWidth, 0, swatchWidth + 1, canvas.height);
      context.fillStyle = "rgba(0, 0, 0, 0.55)";
      context.fillRect(index * swatchWidth + 28, canvas.height - 112, swatchWidth - 56, 68);
      context.fillStyle = "#ffffff";
      context.font = "700 30px Arial, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(color.hex, index * swatchWidth + swatchWidth / 2, canvas.height - 78);
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `lumora-palette-${Date.now()}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    }, "image/png");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-24 sm:space-y-12">
      {/* 1. PALETTE DISPLAY */}
      <div className="group grid min-h-[520px] grid-cols-1 overflow-hidden rounded-[2rem] border-4 border-zinc-900 bg-zinc-900 shadow-4xl sm:h-[400px] sm:min-h-0 sm:grid-cols-5 sm:rounded-[3.5rem] md:h-[500px]">
        {colors.map((color, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group/swatch relative flex min-h-[104px] cursor-pointer flex-col items-center justify-end overflow-hidden pb-4 transition-all duration-500 sm:min-h-0 sm:pb-12"
            style={{ backgroundColor: color.hex }}
            onClick={() => copyColor(color.hex, i)}
          >
             {/* Hover Glow */}
             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/swatch:opacity-100 transition-opacity" />
             
             {/* Copy Feedback */}
             <AnimatePresence>
               {copiedIndex === i && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                   className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-xs z-20"
                 >
                    <span className="px-4 py-2 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-2xl">
                       Copied!
                    </span>
                 </motion.div>
               )}
             </AnimatePresence>

             {/* Swatch Controls */}
             <div className="relative z-10 flex flex-col items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLock(i); }}
                  className={cn(
                    "p-3 rounded-full backdrop-blur-md transition-all",
                    color.locked ? "bg-white text-black scale-110" : "bg-black/20 text-white/50 hover:text-white hover:bg-black/40 opacity-0 group-hover/swatch:opacity-100"
                  )}
                >
                   {color.locked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
                <div className="flex flex-col items-center">
                   <p className="text-xl md:text-2xl font-black tracking-tighter mix-blend-difference filter invert text-white">
                      {color.hex}
                   </p>
                   <Copy size={14} className="opacity-0 group-hover/swatch:opacity-50 mix-blend-difference filter invert text-white mt-1" />
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* 2. GENERATION CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         {/* Prompt Input */}
         <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handlePromptGenerate} className="group relative flex flex-col gap-3 sm:block">
               <div className="absolute left-5 top-5 flex items-center text-zinc-500 transition-colors group-focus-within:text-accent-purple sm:inset-y-0 sm:left-6 sm:top-auto">
                  <Palette size={20} />
               </div>
               <input 
                 type="text"
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="Describe the mood... (e.g., 'Retro Synthwave')"
                 className="glass-dark h-14 w-full rounded-2xl border border-white/5 pl-14 pr-4 text-sm font-bold text-white shadow-xl transition-all placeholder:text-zinc-600 focus:border-accent-purple/50 focus:outline-none sm:h-20 sm:rounded-3xl sm:pl-16 sm:pr-40"
               />
               <button 
                 type="submit"
                 className="premium-gradient flex min-h-12 w-full items-center justify-center rounded-xl px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:brightness-110 active:scale-[0.99] sm:absolute sm:bottom-3 sm:right-3 sm:top-3 sm:w-auto sm:rounded-2xl sm:px-8"
               >
                  Generate Magic
               </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {PRESETS.map((p) => {
                 const Icon = p.icon;
                 return (
                   <button 
                     key={p.id}
                     onClick={() => generatePalette(p.id)}
                     className="p-5 rounded-2xl glass-dark border border-white/5 hover:border-white/20 text-zinc-500 hover:text-white transition-all flex items-center gap-3 group"
                   >
                      <Icon size={16} className="group-hover:text-accent-purple" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                   </button>
                 );
               })}
            </div>
         </div>

         {/* Export & Tools */}
         <div className="glass-dark relative space-y-8 overflow-hidden rounded-[2rem] border border-white/5 p-5 sm:p-8 lg:col-span-5 lg:rounded-[3rem] lg:p-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 blur-3xl rounded-full" />
            
            <div className="space-y-2">
               <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Code2 size={16} className="text-accent-purple" />
                  Code Export
               </h3>
               <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Instant integration for developers</p>
            </div>

            <div className="flex gap-2">
               {(["css", "tailwind", "json"] as const).map((mode) => (
                 <button 
                   key={mode}
                   onClick={() => setExportMode(exportMode === mode ? null : mode)}
                   className={cn(
                     "flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                     exportMode === mode ? "bg-accent-purple text-white border-accent-purple" : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                   )}
                 >
                    {mode}
                 </button>
               ))}
            </div>

            <AnimatePresence>
               {exportMode && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="relative"
                 >
                    <textarea 
                      readOnly
                      value={getExportString()}
                      className="w-full h-32 p-4 rounded-2xl bg-black/40 border border-white/10 text-[10px] font-mono text-zinc-400 focus:outline-none resize-none"
                    />
                    <button 
                      onClick={() => { navigator.clipboard.writeText(getExportString()); }}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                       <Copy size={14} />
                    </button>
                 </motion.div>
               )}
            </AnimatePresence>

            <button
              type="button"
              onClick={downloadPalettePng}
              disabled={colors.length === 0}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
               <Download size={16} />
               Download PNG Palette
            </button>
         </div>
      </div>

      {/* 3. PRO TIP */}
      <div className="flex items-start gap-4 rounded-[1.75rem] border border-indigo-500/10 bg-indigo-500/5 p-5 sm:gap-6 sm:rounded-[2.5rem] sm:p-8">
         <div className="shrink-0 rounded-xl bg-indigo-500/10 p-3 text-indigo-400 sm:rounded-2xl sm:p-4">
            <Zap size={24} />
         </div>
         <div className="space-y-2">
            <h4 className="text-sm font-black text-zinc-100 uppercase tracking-widest">Workflow Mastery</h4>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Use the <strong className="font-bold text-zinc-300">Lock</strong> icon to freeze specific colors while shuffling the rest. This is perfect for building around a brand-defined primary color. The HSL randomizer keeps contrast balanced with every shuffle.
            </p>
         </div>
      </div>
    </div>
  );
}
