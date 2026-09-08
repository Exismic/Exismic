"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Premium Pro Avatar Frames Definition (8 Elite Frames with animated unique titles)
export const PRO_FRAMES = [
  {
    id: "neon-glow",
    name: "Neon Cyber Glow",
    borderStyles: "bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 animate-[spin_6s_linear_infinite] shadow-[0_0_20px_rgba(168,85,247,0.6)]",
    glowStyles: "from-purple-600/75 via-pink-500/65 to-cyan-400/75",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    titleColor: "bg-gradient-to-r from-purple-400 via-pink-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold Status",
    borderStyles: "bg-[linear-gradient(110deg,#d97706,#fde047,#ca8a04,#fde047)] bg-[length:200%_200%] animate-[gradient-x_3s_ease_infinite] shadow-[0_0_20px_rgba(245,158,11,0.6)]",
    glowStyles: "from-amber-600/65 via-yellow-400/55 to-yellow-600/65",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    titleColor: "bg-gradient-to-r from-amber-400 via-yellow-300 via-amber-200 to-amber-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "cosmic-nebula",
    name: "Cosmic Nebula Dust",
    borderStyles: "bg-gradient-to-br from-indigo-600 via-fuchsia-500 to-rose-400 animate-[pulse_2.5s_ease-in-out_infinite] shadow-[0_0_20px_rgba(99,102,241,0.6)]",
    glowStyles: "from-indigo-600/75 via-fuchsia-500/65 to-rose-400/75",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    titleColor: "bg-gradient-to-r from-indigo-400 via-fuchsia-400 via-rose-300 to-indigo-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "purple-energy",
    name: "Void Purple Spark",
    borderStyles: "bg-gradient-to-tr from-purple-950 via-purple-500 to-indigo-600 animate-[spin_10s_linear_infinite] shadow-[0_0_20px_rgba(147,51,234,0.65)]",
    glowStyles: "from-purple-800/75 via-purple-500/65 to-indigo-600/75",
    badgeColor: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    titleColor: "bg-gradient-to-r from-purple-400 via-violet-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "cyberpunk-vibe",
    name: "Cyber Grid Circuit",
    borderStyles: "bg-gradient-to-tr from-red-600 via-orange-500 to-yellow-400 animate-[spin_8s_linear_infinite] shadow-[0_0_20px_rgba(239,68,68,0.6)]",
    glowStyles: "from-red-600/65 via-orange-500/55 to-yellow-400/65",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    titleColor: "bg-gradient-to-r from-red-400 via-orange-400 via-yellow-300 to-red-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "cyan-beast",
    name: "Liquid Cyan Glow",
    borderStyles: "bg-[linear-gradient(110deg,#06b6d4,#3b82f6,#10b981,#06b6d4)] bg-[length:200%_200%] animate-[gradient-x_3s_ease_infinite] shadow-[0_0_20px_rgba(6,182,212,0.6)]",
    glowStyles: "from-cyan-400/75 via-blue-600/65 to-emerald-400/75",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    titleColor: "bg-gradient-to-r from-cyan-400 via-blue-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "royal-purple",
    name: "Royal Purple Glow",
    borderStyles: "bg-gradient-to-tr from-violet-600 via-purple-500 to-indigo-700 animate-[spin_7s_linear_infinite] shadow-[0_0_25px_rgba(124,58,237,0.7)]",
    glowStyles: "from-violet-600/75 via-purple-500/65 to-indigo-700/75",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    titleColor: "bg-gradient-to-r from-violet-400 via-purple-300 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "futuristic-hex",
    name: "Futuristic Hex Grid",
    borderStyles: "bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 animate-[spin_8s_linear_infinite] shadow-[0_0_25px_rgba(6,182,212,0.7)]",
    glowStyles: "from-cyan-500/75 via-indigo-500/65 to-purple-600/75",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    titleColor: "bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "emerald-viper",
    name: "Emerald Toxic Matrix",
    borderStyles: "bg-gradient-to-br from-emerald-500 via-lime-400 to-teal-600 animate-[spin_6s_linear_infinite] shadow-[0_0_25px_rgba(16,185,129,0.7)]",
    glowStyles: "from-emerald-500/75 via-lime-400/65 to-teal-600/75",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    titleColor: "bg-gradient-to-r from-emerald-400 via-lime-300 to-teal-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "diamond-ice",
    name: "Glacier Diamond Frost",
    borderStyles: "bg-gradient-to-tr from-sky-300 via-cyan-200 via-blue-400 to-white animate-[spin_7s_linear_infinite] shadow-[0_0_25px_rgba(56,189,248,0.7)]",
    glowStyles: "from-sky-300/80 via-cyan-200/70 to-blue-400/80",
    badgeColor: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    titleColor: "bg-gradient-to-r from-sky-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "solar-flare",
    name: "Solar Flare Supernova",
    borderStyles: "bg-[linear-gradient(110deg,#f59e0b,#ef4444,#eab308,#f59e0b)] bg-[length:200%_200%] animate-[gradient-x_2.5s_ease_infinite] shadow-[0_0_25px_rgba(245,158,11,0.75)]",
    glowStyles: "from-amber-500/80 via-orange-500/70 to-red-600/80",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    titleColor: "bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "hyper-violet",
    name: "Hyper Violet Singularity",
    borderStyles: "bg-gradient-to-br from-purple-700 via-fuchsia-600 to-indigo-800 animate-[spin_5s_linear_infinite] shadow-[0_0_25px_rgba(168,85,247,0.75)]",
    glowStyles: "from-purple-700/80 via-fuchsia-600/70 to-indigo-800/80",
    badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    titleColor: "bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "aurora-borealis",
    name: "Aurora Northern Lights",
    borderStyles: "bg-[linear-gradient(110deg,#10b981,#14b8a6,#06b6d4,#a855f7,#10b981)] bg-[length:300%_300%] animate-[gradient-x_4s_ease_infinite] shadow-[0_0_25px_rgba(45,212,191,0.75)]",
    glowStyles: "from-emerald-400/80 via-teal-400/70 to-purple-500/80",
    badgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/20",
    titleColor: "bg-gradient-to-r from-emerald-300 via-teal-200 to-purple-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "obsidian-onyx",
    name: "Obsidian Stealth Onyx",
    borderStyles: "bg-[linear-gradient(110deg,#3f3f46,#fafafa,#18181b,#fafafa)] bg-[length:200%_200%] animate-[gradient-x_3.5s_ease_infinite] shadow-[0_0_25px_rgba(255,255,255,0.4)]",
    glowStyles: "from-zinc-500/60 via-zinc-300/40 to-zinc-800/60",
    badgeColor: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
    titleColor: "bg-gradient-to-r from-zinc-200 via-white to-zinc-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "hologram-prism",
    name: "Holographic Prism Matrix",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#38bdf8,#f472b6,#c084fc,#34d399,#38bdf8)] bg-[length:300%_300%] animate-[gradient-x_3s_ease_infinite] shadow-[0_0_30px_rgba(56,189,248,0.85)]",
    glowStyles: "from-sky-400/80 via-pink-400/70 to-teal-400/80",
    badgeColor: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    titleColor: "bg-gradient-to-r from-sky-300 via-pink-300 to-teal-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "crimson-inferno",
    name: "Crimson Blood Inferno",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#dc2626,#991b1b,#ef4444,#7f1d1d,#dc2626)] bg-[length:250%_250%] animate-[gradient-x_2.5s_ease_infinite] shadow-[0_0_30px_rgba(220,38,38,0.85)]",
    glowStyles: "from-red-600/85 via-rose-600/75 to-red-950/85",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    titleColor: "bg-gradient-to-r from-red-400 via-rose-300 to-red-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "quantum-flux",
    name: "Quantum Flux Reactor",
    isNew: true,
    borderStyles: "bg-gradient-to-tr from-cyan-400 via-indigo-600 via-emerald-400 to-blue-500 animate-[spin_4s_linear_infinite] shadow-[0_0_30px_rgba(34,211,238,0.85)]",
    glowStyles: "from-cyan-400/85 via-indigo-500/75 to-emerald-400/85",
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    titleColor: "bg-gradient-to-r from-cyan-300 via-indigo-300 to-emerald-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "celestial-platinum",
    name: "Celestial Royal Platinum",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#e2e8f0,#ffffff,#94a3b8,#cbd5e1,#ffffff)] bg-[length:200%_200%] animate-[gradient-x_3s_ease_infinite] shadow-[0_0_30px_rgba(255,255,255,0.75)]",
    glowStyles: "from-slate-200/80 via-white/70 to-slate-400/80",
    badgeColor: "bg-slate-300/10 text-slate-200 border-slate-300/20",
    titleColor: "bg-gradient-to-r from-slate-100 via-white to-slate-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "plasma-storm",
    name: "Electric Plasma Storm",
    isNew: true,
    borderStyles: "bg-gradient-to-br from-yellow-300 via-amber-500 via-cyan-400 to-indigo-600 animate-[spin_5s_linear_infinite] shadow-[0_0_30px_rgba(234,179,8,0.85)]",
    glowStyles: "from-yellow-400/80 via-cyan-400/70 to-indigo-600/80",
    badgeColor: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    titleColor: "bg-gradient-to-r from-yellow-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "sakura-blossom",
    name: "Sakura Cyber Blossom",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#f472b6,#fda4af,#ec4899,#fbcfe8,#f472b6)] bg-[length:200%_200%] animate-[gradient-x_3.5s_ease_infinite] shadow-[0_0_25px_rgba(244,114,182,0.8)]",
    glowStyles: "from-pink-400/80 via-rose-300/70 to-pink-600/80",
    badgeColor: "bg-pink-500/10 text-pink-300 border-pink-500/20",
    titleColor: "bg-gradient-to-r from-pink-300 via-rose-200 to-pink-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "golden-pharaoh",
    name: "Mythic Sun Pharaoh",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#b45309,#fbbf24,#78350f,#fde68a,#b45309)] bg-[length:220%_220%] animate-[gradient-x_2.8s_ease_infinite] shadow-[0_0_30px_rgba(251,191,36,0.85)]",
    glowStyles: "from-amber-600/85 via-yellow-300/75 to-amber-800/85",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    titleColor: "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "dark-matter",
    name: "Abyssal Dark Matter",
    isNew: true,
    borderStyles: "bg-gradient-to-tr from-slate-900 via-purple-950 via-cyan-900 to-slate-900 animate-[spin_8s_linear_infinite] border border-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,0.5)]",
    glowStyles: "from-purple-950/90 via-cyan-900/80 to-slate-900/90",
    badgeColor: "bg-cyan-950/40 text-cyan-300 border-cyan-500/30",
    titleColor: "bg-gradient-to-r from-purple-300 via-cyan-200 to-slate-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "astral-void",
    name: "Astral Void Singularity",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#4c1d95,#06b6d4,#1e1b4b,#06b6d4,#4c1d95)] bg-[length:300%_300%] animate-[gradient-x_3s_ease_infinite] shadow-[0_0_30px_rgba(6,182,212,0.85)]",
    glowStyles: "from-indigo-600/85 via-cyan-400/75 to-purple-800/85",
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    titleColor: "bg-gradient-to-r from-violet-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "molten-dragon",
    name: "Molten Dragon Core",
    isNew: true,
    borderStyles: "bg-gradient-to-tr from-amber-600 via-red-600 via-yellow-400 to-amber-700 animate-[spin_6s_linear_infinite] shadow-[0_0_30px_rgba(239,68,68,0.85)]",
    glowStyles: "from-red-600/85 via-amber-500/75 to-yellow-500/85",
    badgeColor: "bg-red-500/10 text-red-300 border-red-500/20",
    titleColor: "bg-gradient-to-r from-red-400 via-amber-300 to-yellow-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "cyber-glitch",
    name: "Cyber Matrix Glitch",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#10b981,#ec4899,#047857,#f43f5e,#10b981)] bg-[length:300%_300%] animate-[gradient-x_2.5s_ease_infinite] shadow-[0_0_30px_rgba(16,185,129,0.85)]",
    glowStyles: "from-emerald-500/85 via-pink-500/75 to-teal-400/85",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    titleColor: "bg-gradient-to-r from-emerald-400 via-pink-400 to-cyan-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "frostfire-eclipse",
    name: "Frostfire Celestial",
    isNew: true,
    borderStyles: "bg-gradient-to-r from-sky-400 via-indigo-500 via-orange-500 to-amber-400 animate-[spin_5s_linear_infinite] shadow-[0_0_30px_rgba(56,189,248,0.85)]",
    glowStyles: "from-sky-400/85 via-orange-500/75 to-blue-600/85",
    badgeColor: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    titleColor: "bg-gradient-to-r from-sky-300 via-orange-300 to-amber-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "chrono-warp",
    name: "Chrono Temporal Flux",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#d97706,#0284c7,#b45309,#38bdf8,#d97706)] bg-[length:250%_250%] animate-[gradient-x_3.5s_ease_infinite] shadow-[0_0_30px_rgba(217,119,6,0.85)]",
    glowStyles: "from-amber-500/85 via-sky-400/75 to-yellow-600/85",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    titleColor: "bg-gradient-to-r from-amber-300 via-sky-300 to-yellow-200 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "void-walker",
    name: "Voidwalker Eclipse",
    isNew: true,
    borderStyles: "bg-gradient-to-br from-violet-950 via-purple-700 via-black to-violet-900 animate-[pulse_3s_ease-in-out_infinite] shadow-[0_0_30px_rgba(147,51,234,0.85)]",
    glowStyles: "from-violet-900/90 via-purple-600/80 to-black/90",
    badgeColor: "bg-purple-900/30 text-purple-300 border-purple-500/30",
    titleColor: "bg-gradient-to-r from-purple-400 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "synthwave-80s",
    name: "Retro Synthwave Grid",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#f43f5e,#fb923c,#8b5cf6,#f43f5e)] bg-[length:300%_300%] animate-[gradient-x_3s_ease_infinite] shadow-[0_0_30px_rgba(244,63,94,0.85)]",
    glowStyles: "from-rose-500/85 via-orange-400/75 to-purple-600/85",
    badgeColor: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    titleColor: "bg-gradient-to-r from-rose-400 via-orange-300 to-fuchsia-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "jade-dynasty",
    name: "Imperial Jade Sovereign",
    isNew: true,
    borderStyles: "bg-gradient-to-tr from-emerald-600 via-yellow-300 via-teal-500 to-emerald-700 animate-[spin_7s_linear_infinite] shadow-[0_0_30px_rgba(16,185,129,0.85)]",
    glowStyles: "from-emerald-500/85 via-yellow-300/75 to-teal-600/85",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    titleColor: "bg-gradient-to-r from-emerald-300 via-yellow-200 to-teal-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "blood-moon",
    name: "Blood Moon Eclipse",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#991b1b,#ef4444,#450a0a,#b91c1c,#991b1b)] bg-[length:250%_250%] animate-[gradient-x_2.8s_ease_infinite] shadow-[0_0_30px_rgba(239,68,68,0.85)]",
    glowStyles: "from-red-700/90 via-rose-600/80 to-red-950/90",
    badgeColor: "bg-red-900/30 text-red-300 border-red-500/30",
    titleColor: "bg-gradient-to-r from-red-500 via-rose-400 to-red-700 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "quantum-maglev",
    name: "Quantum Superconductor",
    isNew: true,
    borderStyles: "bg-gradient-to-br from-blue-600 via-cyan-300 to-indigo-700 animate-[spin_4.5s_linear_infinite] shadow-[0_0_30px_rgba(37,99,235,0.85)]",
    glowStyles: "from-blue-500/85 via-cyan-300/75 to-indigo-600/85",
    badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    titleColor: "bg-gradient-to-r from-blue-400 via-cyan-200 to-indigo-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "starlight-valkyrie",
    name: "Starlight Valkyrie",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#f8fafc,#f472b6,#fde047,#cbd5e1,#f8fafc)] bg-[length:250%_250%] animate-[gradient-x_3.2s_ease_infinite] shadow-[0_0_30px_rgba(244,114,182,0.85)]",
    glowStyles: "from-slate-100/90 via-pink-400/75 to-amber-200/85",
    badgeColor: "bg-pink-500/10 text-pink-200 border-pink-500/20",
    titleColor: "bg-gradient-to-r from-white via-pink-200 to-yellow-100 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "toxic-biohazard",
    name: "Biohazard Radioactive",
    isNew: true,
    borderStyles: "bg-gradient-to-tr from-lime-400 via-amber-400 via-emerald-600 to-lime-500 animate-[spin_5s_linear_infinite] shadow-[0_0_30px_rgba(163,230,53,0.85)]",
    glowStyles: "from-lime-400/85 via-amber-400/75 to-emerald-500/85",
    badgeColor: "bg-lime-500/10 text-lime-300 border-lime-500/20",
    titleColor: "bg-gradient-to-r from-lime-300 via-yellow-300 to-emerald-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "phantom-wraith",
    name: "Ethereal Phantom Mist",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#a78bfa,#2dd4bf,#6366f1,#c4b5fd,#a78bfa)] bg-[length:300%_300%] animate-[gradient-x_4s_ease_infinite] shadow-[0_0_30px_rgba(167,139,250,0.85)]",
    glowStyles: "from-violet-400/85 via-teal-300/75 to-indigo-400/85",
    badgeColor: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    titleColor: "bg-gradient-to-r from-violet-300 via-teal-200 to-indigo-200 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "solaris-apex",
    name: "Solaris Apex Corona",
    isNew: true,
    borderStyles: "bg-gradient-to-tr from-yellow-300 via-amber-500 via-red-500 to-yellow-200 animate-[spin_4s_linear_infinite] shadow-[0_0_35px_rgba(251,191,36,0.9)]",
    glowStyles: "from-yellow-300/90 via-amber-500/80 to-red-500/85",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    titleColor: "bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  },
  {
    id: "abyssal-kraken",
    name: "Abyssal Trench Biolume",
    isNew: true,
    borderStyles: "bg-[linear-gradient(110deg,#0f172a,#06b6d4,#1e293b,#14b8a6,#0f172a)] bg-[length:300%_300%] animate-[gradient-x_3.5s_ease_infinite] shadow-[0_0_30px_rgba(6,182,212,0.85)]",
    glowStyles: "from-slate-900/90 via-cyan-400/75 to-teal-400/85",
    badgeColor: "bg-cyan-900/30 text-cyan-300 border-cyan-500/30",
    titleColor: "bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 bg-clip-text text-transparent bg-[length:300%_auto] animate-[text-gradient_4s_linear_infinite]"
  }
];

interface AvatarWithFrameProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  fallbackName?: string | null;
  isPro?: boolean;
  frameId?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
}

export function AvatarWithFrame({
  avatarUrl,
  displayName,
  fallbackName,
  isPro = false,
  frameId,
  size = "md",
  className
}: AvatarWithFrameProps) {
  const activeFrame = frameId ? PRO_FRAMES.find(f => f.id === frameId) || null : null;
  const nameStr = (displayName || fallbackName || "User").trim();
  const initial = nameStr.charAt(0).toUpperCase() || "E";

  const isNumericSize = typeof size === "number";
  const sizeKey = (isNumericSize ? (size <= 40 ? "sm" : size <= 56 ? "md" : size <= 80 ? "lg" : "xl") : size) as "sm" | "md" | "lg" | "xl";

  const sizeStyles = {
    sm: { 
      container: "w-[38px] h-[38px]", 
      padding: "2.5px", 
      outerRounded: "rounded-[12px]", 
      innerRounded: "rounded-[9px]", 
      initialText: "text-[10px]" 
    },
    md: { 
      container: "w-[48px] h-[48px]", 
      padding: "3.5px", 
      outerRounded: "rounded-[16px]", 
      innerRounded: "rounded-[13px]", 
      initialText: "text-xs" 
    },
    lg: { 
      container: "w-[72px] h-[72px]", 
      padding: "4.5px", 
      outerRounded: "rounded-[24px]", 
      innerRounded: "rounded-[20px]", 
      initialText: "text-lg" 
    },
    xl: { 
      container: "w-[104px] h-[104px]", 
      padding: "5.5px", 
      outerRounded: "rounded-[32px]", 
      innerRounded: "rounded-[27px]", 
      initialText: "text-3xl" 
    }
  }[sizeKey] || {
    container: "w-[48px] h-[48px]",
    padding: "3.5px",
    outerRounded: "rounded-[16px]",
    innerRounded: "rounded-[13px]",
    initialText: "text-xs"
  };

  return (
    <div className={cn("relative shrink-0 select-none group/avatar-frame", className)}>
      
      {/* 1. Double Layer High-Fidelity Volumetric Backdrop Glow Rings */}
      {activeFrame && (
        <>
          {/* Soft atmospheric glow */}
          <div className={cn(
            "absolute -inset-3 blur-xl opacity-40 pointer-events-none transition-all duration-500 z-0 bg-gradient-to-tr group-hover/avatar-frame:opacity-60",
            sizeStyles.outerRounded,
            activeFrame.glowStyles
          )} />
          {/* Refined outer halo */}
          <div className={cn(
            "absolute -inset-2 blur-lg opacity-45 pointer-events-none transition-all duration-500 z-0 bg-gradient-to-tr group-hover/avatar-frame:opacity-65",
            sizeStyles.outerRounded,
            activeFrame.glowStyles
          )} />
          {/* Crisp edge light */}
          <div className={cn(
            "absolute -inset-1 blur-sm opacity-70 pointer-events-none transition-all duration-500 z-0 bg-gradient-to-tr group-hover/avatar-frame:opacity-85",
            sizeStyles.outerRounded,
            activeFrame.glowStyles
          )} />
        </>
      )}

      {/* 2. Main Outer Frame Ring Container with thick absolute padding layout */}
      <div
        className={cn(
          "transition-all duration-500 relative z-10 flex items-center justify-center overflow-hidden shadow-2xl",
          sizeStyles.container,
          sizeStyles.outerRounded,
          activeFrame ? "" : (isPro ? "bg-gradient-to-tr from-purple-500 via-cyan-400 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-white/10")
        )}
        style={{ padding: activeFrame ? sizeStyles.padding : (isPro ? "2.5px" : "1px") }}
      >
        {/* Animated Gradient border loop */}
        {activeFrame ? (
          <div className={cn("absolute inset-0 z-0", activeFrame.borderStyles)} />
        ) : isPro ? (
          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-purple-500 via-cyan-400 to-pink-500" />
        ) : null}

        {/* 3. Inner Avatar picture wrapper */}
        <div
          className={cn(
            "w-full h-full bg-[#0b0b11] overflow-hidden flex items-center justify-center transition-all duration-500 shadow-inner relative z-10",
            sizeStyles.innerRounded
          )}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName || "Avatar"} className="w-full h-full object-cover relative z-10" />
          ) : (
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName || "User")}&backgroundColor=0b0b14`}
              alt={displayName || "Avatar"}
              className="w-full h-full object-cover relative z-10"
            />
          )}
          
          {/* 4. Luxury Inner Glow Ring Overlay - Bleeds frame color onto image edges */}
          {activeFrame && (
            <div className={cn(
              "absolute inset-0 z-20 pointer-events-none opacity-25 mix-blend-screen rounded-inherit border-[1.5px] border-transparent bg-gradient-to-tr [mask-image:linear-gradient(#fff_0_0)_border-box,_linear-gradient(#fff_0_0)] [mask-clip:padding-box,_border-box] [mask-composite:intersect]",
              activeFrame.glowStyles
            )} />
          )}
        </div>
      </div>
    </div>
  );
}
