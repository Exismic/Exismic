"use client";

import React, { useState } from "react";
import { X, Sparkles, Shield, CheckCircle2, Crown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const CUSTOM_THEMES = [
  {
    id: "cyber-pulse",
    name: "Cyber Pulse",
    description: "High-octane purple & neon cyan nodes with flowing electric currents.",
    previewBg: "bg-[#040209]",
    accentGlow: "rgba(168, 85, 247, 0.45)",
    previewStyle: "bg-gradient-to-tr from-[#a855f7]/30 via-[#0c0818] to-[#06b6d4]/30 border-purple-500/30",
    badgeStyles: "bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20",
    colorDots: ["bg-[#a855f7]", "bg-[#06b6d4]"]
  },
  {
    id: "luxury-void",
    name: "Luxury Void",
    description: "Stark rich black background accompanied by harmonized solid gold sparkles.",
    previewBg: "bg-[#020202]",
    accentGlow: "rgba(245, 158, 11, 0.45)",
    previewStyle: "bg-gradient-to-tr from-[#f59e0b]/20 via-[#0a0a0a] to-[#fbbf24]/10 border-amber-500/30",
    badgeStyles: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
    colorDots: ["bg-[#f59e0b]", "bg-[#fbbf24]"]
  },
  {
    id: "cosmic-nebula",
    name: "Cosmic Nebula",
    description: "A magical stellar dust landscape using deep purple & ultra pink blends.",
    previewBg: "bg-[#04010a]",
    accentGlow: "rgba(217, 70, 239, 0.45)",
    previewStyle: "bg-gradient-to-tr from-[#d946ef]/20 via-[#0c041d] to-[#f43f5e]/20 border-pink-500/30",
    badgeStyles: "bg-[#d946ef]/10 text-[#d946ef] border-[#d946ef]/20",
    colorDots: ["bg-[#d946ef]", "bg-[#f43f5e]"]
  },
  {
    id: "neon-shadow",
    name: "Neon Shadow",
    description: "Dark matrix structure utilizing powerful, glowing chemical greens.",
    previewBg: "bg-[#010402]",
    accentGlow: "rgba(34, 197, 94, 0.45)",
    previewStyle: "bg-gradient-to-tr from-[#22c55e]/20 via-[#040d06] to-[#84cc16]/10 border-emerald-500/30",
    badgeStyles: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
    colorDots: ["bg-[#22c55e]", "bg-[#84cc16]"]
  },
  {
    id: "royal-eclipse",
    name: "Royal Eclipse",
    description: "Luxurious velvet dark reds mixing with deep cosmos violet gradients.",
    previewBg: "bg-[#040103]",
    accentGlow: "rgba(220, 38, 38, 0.45)",
    previewStyle: "bg-gradient-to-tr from-[#dc2626]/20 via-[#0d0309] to-[#701a75]/20 border-red-500/30",
    badgeStyles: "bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20",
    colorDots: ["bg-[#dc2626]", "bg-[#701a75]"]
  },
  {
    id: "minimal-frost",
    name: "Minimal Frost",
    description: "Super clean cool blue currents backed by crisp diamond elements.",
    previewBg: "bg-[#03060c]",
    accentGlow: "rgba(59, 130, 246, 0.45)",
    previewStyle: "bg-gradient-to-tr from-[#3b82f6]/20 via-[#080f1e] to-[#93c5fd]/20 border-blue-500/30",
    badgeStyles: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20",
    colorDots: ["bg-[#3b82f6]", "bg-[#93c5fd]"]
  }
];

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string | null;
  onSelectTheme: (themeId: string | null) => Promise<void>;
  isUpdating: boolean;
}

export function ThemeSelectorModal({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  isUpdating
}: ThemeSelectorModalProps) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  // Apply visual preview triggers temporarily on body for a cinematic live layout look
  const triggerLivePreview = (themeId: string | null) => {
    if (typeof document === "undefined") return;
    setHoveredTheme(themeId);
    
    const themes = CUSTOM_THEMES.map(t => `theme-${t.id}`);
    document.documentElement.classList.remove(...themes);
    document.body.classList.remove(...themes);

    const activeTheme = themeId || currentTheme;
    if (activeTheme) {
      document.documentElement.classList.add(`theme-${activeTheme}`);
      document.body.classList.add(`theme-${activeTheme}`);
    }
  };

  const handleClose = () => {
    // Reset back to saved state on close
    triggerLivePreview(null);
    onClose();
  };

  const handleApply = async (themeId: string | null) => {
    await onSelectTheme(themeId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4">
          
          {/* Backdrop Glass Panel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Luxury Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 25 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="relative w-full max-w-4xl bg-zinc-950/90 backdrop-blur-3xl border border-white/[0.08] rounded-[2rem] md:rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.04)] overflow-hidden z-10 flex flex-col max-h-[calc(100dvh-1.5rem)]"
          >
            {/* Ambient atmospheres inside modal */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <div className="absolute top-[-30%] left-[-20%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_60%)] animate-pulse duration-[8000ms]" />
              <div className="absolute bottom-[-30%] right-[-20%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.04)_0%,transparent_60%)] animate-pulse duration-[6000ms]" />
            </div>

            {/* Header */}
            <div className="p-4 sm:p-6 md:p-8 md:pb-4 border-b border-white/5 relative z-10 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-lg">
                  <Crown size={18} className="fill-purple-400/10" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-white flex flex-wrap items-center gap-2">
                    Profile Themes 
                    <span className="px-2 py-0.5 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-[7px] font-black tracking-widest text-white uppercase shadow-[0_0_10px_rgba(168,85,247,0.3)] animate-pulse">PRO ELITE</span>
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Customize your Lumora background, layout accents, and glows</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer active:scale-95"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body (Scrollable Grid) */}
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto no-scrollbar flex-1 relative z-10 space-y-5 sm:space-y-6">
              
              {/* Default Theme Card Reset */}
              <div 
                onMouseEnter={() => triggerLivePreview(null)}
                onMouseLeave={() => triggerLivePreview(null)}
                onClick={() => !isUpdating && handleApply(null)}
                className={cn(
                  "p-4 sm:p-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer transition-all duration-300 group/reset",
                  !currentTheme && "bg-white/[0.03] border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                )}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover/reset:text-white transition-colors">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Default Midnight Vibe</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Standard dark luxury theme with purple layout indicators</p>
                  </div>
                </div>
                {!currentTheme ? (
                  <span className="px-3.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[9px] font-black uppercase text-purple-400 flex items-center gap-1.5 shadow-lg select-none">
                    <CheckCircle2 size={12} /> Equipped
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-lg bg-white/5 text-[9px] font-black uppercase text-zinc-500 group-hover/reset:text-white group-hover/reset:bg-white group-hover/reset:text-black transition-all shadow-md">
                    Select
                  </span>
                )}
              </div>

              {/* Custom Themes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {CUSTOM_THEMES.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  return (
                    <motion.div
                      key={theme.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      onMouseEnter={() => triggerLivePreview(theme.id)}
                      onMouseLeave={() => triggerLivePreview(null)}
                      onClick={() => !isUpdating && handleApply(theme.id)}
                      className={cn(
                        "p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] bg-[#0b0b11]/30 backdrop-blur-xl border border-white/5 flex flex-col justify-between cursor-pointer transition-all duration-300 group/card min-h-[220px] relative overflow-hidden",
                        isSelected && "bg-[#0b0b11]/70 border-purple-500/80 shadow-[0_0_30px_rgba(168,85,247,0.25)] border-2 scale-105 hover:scale-105"
                      )}
                    >
                      {/* Subtle Ambient Hover Glow */}
                      <div 
                        className={cn(
                          "absolute -inset-10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 blur-2xl -z-10 bg-gradient-to-tr",
                          theme.id === "cyber-pulse" && "from-[#a855f7]/10 to-[#06b6d4]/10",
                          theme.id === "luxury-void" && "from-[#f59e0b]/10 to-[#fbbf24]/5",
                          theme.id === "cosmic-nebula" && "from-[#d946ef]/10 to-[#f43f5e]/10",
                          theme.id === "neon-shadow" && "from-[#22c55e]/10 to-[#84cc16]/5",
                          theme.id === "royal-eclipse" && "from-[#dc2626]/10 to-[#701a75]/10",
                          theme.id === "minimal-frost" && "from-[#3b82f6]/10 to-[#93c5fd]/10"
                        )} 
                      />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black uppercase tracking-wider text-white italic">{theme.name}</h4>
                          <div className="flex items-center gap-1">
                            {theme.colorDots.map((dot, i) => (
                              <div key={i} className={cn("w-2.5 h-2.5 rounded-full border border-white/10 shadow-sm", dot)} />
                            ))}
                          </div>
                        </div>

                        {/* Visual Swatch Preview Box */}
                        <div className={cn("h-16 w-full rounded-2xl border flex items-center justify-center overflow-hidden shadow-inner relative select-none", theme.previewStyle)}>
                          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
                          <Crown size={16} className="text-white/20" />
                        </div>

                        <p className="text-[10px] font-semibold text-zinc-500 leading-relaxed group-hover/card:text-zinc-400 transition-colors text-left">
                          {theme.description}
                        </p>
                      </div>

                      <div className="mt-6">
                        {isUpdating && hoveredTheme === theme.id ? (
                          <button className="w-full py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md">
                            <Loader2 size={12} className="animate-spin text-purple-400" /> Applying...
                          </button>
                        ) : isSelected ? (
                          <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.35)] cursor-default">
                            <CheckCircle2 size={12} /> Equipped
                          </button>
                        ) : (
                          <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-500 group-hover/card:bg-white group-hover/card:text-black group-hover/card:border-white group-hover/card:shadow-[0_0_15px_rgba(255,255,255,0.15)] text-[9px] font-black uppercase tracking-widest transition-all">
                            Select
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-zinc-950/60 backdrop-blur-md flex items-center justify-between relative z-10">
              <span className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500 italic flex items-center gap-1.5">
                <Sparkles size={11} className="text-purple-400 animate-pulse" /> Hover over any theme card to preview it live in-browser!
              </span>
              <button 
                onClick={handleClose}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Close
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
