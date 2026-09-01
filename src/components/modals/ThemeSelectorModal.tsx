"use client";

import React, { useState } from "react";
import { X, Shield, CheckCircle2, Crown, Loader2, Palette } from "lucide-react";
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
  },
  {
    id: "hologram-synth",
    name: "Hologram Synthwave",
    isNew: true,
    description: "Multi-prism holographic spectrum blending pastel cyan, neon pink & lavender.",
    previewBg: "bg-[#05030e]",
    accentGlow: "rgba(56, 189, 248, 0.5)",
    previewStyle: "bg-gradient-to-tr from-[#38bdf8]/25 via-[#0d071e] to-[#f472b6]/25 border-sky-400/30",
    badgeStyles: "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/20",
    colorDots: ["bg-[#38bdf8]", "bg-[#f472b6]", "bg-[#c084fc]"]
  },
  {
    id: "blood-inferno",
    name: "Blood Inferno",
    isNew: true,
    description: "Scorching volcanic crimson glow accompanied by blazing lava orange embers.",
    previewBg: "bg-[#060102]",
    accentGlow: "rgba(220, 38, 38, 0.5)",
    previewStyle: "bg-gradient-to-tr from-[#dc2626]/25 via-[#120204] to-[#f97316]/25 border-red-500/30",
    badgeStyles: "bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20",
    colorDots: ["bg-[#dc2626]", "bg-[#f97316]"]
  },
  {
    id: "tokyo-sakura",
    name: "Tokyo Sakura",
    isNew: true,
    description: "Delicate cyberpunk cherry blossom aura with soft magenta and rose accents.",
    previewBg: "bg-[#070208]",
    accentGlow: "rgba(244, 114, 182, 0.5)",
    previewStyle: "bg-gradient-to-tr from-[#f472b6]/25 via-[#130514] to-[#fda4af]/25 border-pink-400/30",
    badgeStyles: "bg-[#f472b6]/10 text-[#f472b6] border-[#f472b6]/20",
    colorDots: ["bg-[#f472b6]", "bg-[#fda4af]"]
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    isNew: true,
    description: "Radiant solar supernova glow with energized amber and pure gold flares.",
    previewBg: "bg-[#060301]",
    accentGlow: "rgba(245, 158, 11, 0.5)",
    previewStyle: "bg-gradient-to-tr from-[#f59e0b]/25 via-[#120701] to-[#ef4444]/25 border-amber-400/30",
    badgeStyles: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
    colorDots: ["bg-[#f59e0b]", "bg-[#ef4444]"]
  },
  {
    id: "abyssal-singularity",
    name: "Abyssal Singularity",
    isNew: true,
    description: "Deep space cosmic ultraviolet void with glowing celestial indigo waves.",
    previewBg: "bg-[#03010b]",
    accentGlow: "rgba(167, 139, 250, 0.5)",
    previewStyle: "bg-gradient-to-tr from-[#7c3aed]/25 via-[#060214] to-[#38bdf8]/25 border-violet-400/30",
    badgeStyles: "bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20",
    colorDots: ["bg-[#7c3aed]", "bg-[#38bdf8]"]
  },
  {
    id: "cyber-matrix",
    name: "Emerald Cyber Matrix",
    isNew: true,
    description: "Hyper-toxic neon lime and mint streams cutting through obsidian glass.",
    previewBg: "bg-[#010603]",
    accentGlow: "rgba(16, 185, 129, 0.5)",
    previewStyle: "bg-gradient-to-tr from-[#10b981]/25 via-[#021006] to-[#a3e635]/25 border-emerald-400/30",
    badgeStyles: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20",
    colorDots: ["bg-[#10b981]", "bg-[#a3e635]"]
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
  const [selectedPendingTheme, setSelectedPendingTheme] = useState<string | null>(null);

  const handleApply = async (themeId: string | null) => {
    setSelectedPendingTheme(themeId);
    try {
      await onSelectTheme(themeId);
    } finally {
      setSelectedPendingTheme(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-3 sm:p-6 md:p-10"
        >
          <div className="relative w-full max-w-5xl max-h-[92dvh] h-[88dvh] flex flex-col bg-[#070812] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9)]">
            {/* Neon Laser Top Accent */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 shadow-[0_0_20px_rgba(245,158,11,0.8)] z-30" />
            
            {/* Ambient Glows */}
            <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 bg-amber-500/10 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-24 left-0 w-96 h-96 bg-purple-500/10 blur-[120px]" />
            
            {/* Top Header */}
            <div className="p-5 sm:p-7 md:p-8 flex items-center justify-between z-20 border-b border-white/10 bg-[#090a18]/80 backdrop-blur-2xl gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Palette size={22} className="text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">Pro Profile Themes</h2>
                    <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                      {CUSTOM_THEMES.length} Themes
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-400 mt-0.5">Customize your workspace atmosphere & neon lighting</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer shadow-sm"
                aria-label="Close modal"
              >
                <X size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Modal Body (Scrollable Grid) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative z-10 space-y-5">
              
              {/* Default Theme Card Reset */}
              <div 
                onClick={() => !isUpdating && handleApply(null)}
                className={cn(
                  "p-4 sm:p-5 rounded-2xl border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between cursor-pointer transition-all duration-300 group/reset backdrop-blur-xl",
                  !currentTheme 
                    ? "bg-gradient-to-r from-purple-950/40 to-zinc-900/60 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.2)]" 
                    : "bg-[#090a16]/70 border-white/10 hover:border-white/20 hover:bg-[#0f1124]/80"
                )}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/80 text-zinc-400 group-hover/reset:text-white transition-colors">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">Default Midnight Atmosphere</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Original obsidian dark aesthetic with signature Exismic neon accents</p>
                  </div>
                </div>
                {!currentTheme ? (
                  <span className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-xs font-black uppercase text-purple-300 flex items-center gap-2 shadow-lg select-none shrink-0 w-fit">
                    <CheckCircle2 size={14} /> Equipped
                  </span>
                ) : (
                  <button
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 group-hover/reset:bg-white group-hover/reset:text-black group-hover/reset:border-white transition-all shadow-md shrink-0 w-fit cursor-pointer"
                  >
                    Reset to Default
                  </button>
                )}
              </div>

              {/* Custom Themes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {CUSTOM_THEMES.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  const isApplyingThis = isUpdating && selectedPendingTheme === theme.id;
                  return (
                    <motion.div
                      key={theme.id}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !isUpdating && handleApply(theme.id)}
                      className={cn(
                        "p-5 rounded-3xl backdrop-blur-xl border flex flex-col justify-between gap-4 cursor-pointer transition-all duration-300 group/card min-h-[220px] relative overflow-hidden",
                        isSelected 
                          ? "bg-gradient-to-b from-[#18132e]/95 via-[#110d24]/95 to-[#090814]/95 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.3)]" 
                          : "bg-gradient-to-b from-[#0c0d18]/80 to-[#06070e]/80 border-white/10 hover:border-amber-400/40 hover:bg-[#101224]/80 shadow-lg"
                      )}
                    >
                      {/* Ambient hover glow */}
                      <div className="absolute -inset-10 rounded-[2.5rem] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 blur-2xl -z-10 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-cyan-500/10" />

                      {/* NEW Tag */}
                      {(theme as { isNew?: boolean }).isNew && (
                        <div className="absolute top-3 right-3 z-30 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-black text-[8px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse border border-amber-300/60">
                          NEW
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between pr-8">
                          <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white italic">{theme.name}</h4>
                        </div>

                        {/* Visual Swatch Preview Box */}
                        <div className={cn("h-16 w-full rounded-2xl border flex items-center justify-between px-4 overflow-hidden shadow-inner relative select-none transition-all", theme.previewStyle)}>
                          <div className="flex items-center gap-1.5 z-10">
                            {theme.colorDots.map((dot, i) => (
                              <span key={i} className={cn("w-3 h-3 rounded-full border border-white/30 shadow-md", dot)} />
                            ))}
                          </div>
                          <Crown size={16} className="text-white/30 z-10" />
                        </div>

                        <p className="text-xs font-medium text-zinc-400 leading-relaxed text-left">
                          {theme.description}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          disabled={isUpdating}
                          className={cn(
                            "w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center gap-1.5",
                            isSelected 
                              ? "bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] font-black" 
                              : "bg-white/[0.05] border border-white/10 text-zinc-300 group-hover/card:bg-amber-500 group-hover/card:text-black group-hover/card:border-amber-400 group-hover/card:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                          )}
                        >
                          {isApplyingThis ? (
                            <>
                              <Loader2 size={13} className="animate-spin text-white" />
                              <span>Applying...</span>
                            </>
                          ) : isSelected ? (
                            <>
                              <CheckCircle2 size={13} className="text-white" />
                              <span>Equipped</span>
                            </>
                          ) : (
                            <span>Apply Theme</span>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer Toolbar */}
            <div className="p-4 sm:p-5 md:p-6 border-t border-white/10 bg-[#070814]/90 backdrop-blur-2xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between z-20">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                <CheckCircle2 size={15} className="text-amber-400 shrink-0" />
                <span>Select any theme to apply its atmosphere across your workspace</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {currentTheme && (
                  <button 
                    onClick={() => handleApply(null)}
                    disabled={isUpdating}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Reset to Default
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
