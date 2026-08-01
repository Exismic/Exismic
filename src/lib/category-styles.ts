export type CategoryAnimStyle = {
  aura: string;
  spinIdle: string;
  spinHover: string;
  iconGlow: string;
  buttonGrad: string;
  textGrad: string;
  cardBorder: string;
  badge: string;
};

export const CATEGORY_ANIM_STYLES: Record<string, CategoryAnimStyle> = {
  pdf: {
    aura: "bg-red-500/20 group-hover:bg-red-400/40",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(239,68,68,0.4)_25%,transparent_50%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(239,68,68,0.9)_25%,transparent_50%)]",
    iconGlow: "text-red-300 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] group-hover:text-red-200 group-hover:drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]",
    buttonGrad: "bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 text-white font-black tracking-[0.2em] shadow-[0_0_25px_rgba(239,68,68,0.35)] group-hover:shadow-[0_0_40px_rgba(239,68,68,0.65)] border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
    textGrad: "bg-[linear-gradient(110deg,#fca5a5_0%,#ffffff_45%,#ef4444_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(239,68,68,0.2)]",
    cardBorder: "border-red-500/20 shadow-[inset_0_1px_2px_rgba(239,68,68,0.1),0_0_15px_rgba(239,68,68,0.05)] hover:border-red-400/60 hover:shadow-[0_0_50px_rgba(239,68,68,0.25)]",
    badge: "bg-red-400/10 border-red-400/40 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)] fill-red-200 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]"
  },
  image: {
    aura: "bg-cyan-500/20 group-hover:bg-cyan-400/40",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(6,182,212,0.4)_25%,transparent_50%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(6,182,212,0.9)_25%,transparent_50%)]",
    iconGlow: "text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] group-hover:text-cyan-200 group-hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.9)]",
    buttonGrad: "bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-600 text-white font-black tracking-[0.2em] shadow-[0_0_25px_rgba(6,182,212,0.35)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.65)] border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
    textGrad: "bg-[linear-gradient(110deg,#67e8f9_0%,#ffffff_45%,#06b6d4_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(6,182,212,0.2)]",
    cardBorder: "border-cyan-500/20 shadow-[inset_0_1px_2px_rgba(6,182,212,0.1),0_0_15px_rgba(6,182,212,0.05)] hover:border-cyan-400/60 hover:shadow-[0_0_50px_rgba(6,182,212,0.25)]",
    badge: "bg-cyan-400/10 border-cyan-400/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] fill-cyan-200 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]"
  },
  audio: {
    aura: "bg-pink-500/20 group-hover:bg-pink-400/40",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(236,72,153,0.4)_25%,transparent_50%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(236,72,153,0.9)_25%,transparent_50%)]",
    iconGlow: "text-pink-300 drop-shadow-[0_0_10px_rgba(236,72,153,0.6)] group-hover:text-pink-200 group-hover:drop-shadow-[0_0_20px_rgba(236,72,153,0.9)]",
    buttonGrad: "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-black tracking-[0.2em] shadow-[0_0_25px_rgba(236,72,153,0.35)] group-hover:shadow-[0_0_40px_rgba(236,72,153,0.65)] border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
    textGrad: "bg-[linear-gradient(110deg,#f9a8d4_0%,#ffffff_45%,#ec4899_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(236,72,153,0.2)]",
    cardBorder: "border-pink-500/20 shadow-[inset_0_1px_2px_rgba(236,72,153,0.1),0_0_15px_rgba(236,72,153,0.05)] hover:border-pink-400/60 hover:shadow-[0_0_50px_rgba(236,72,153,0.25)]",
    badge: "bg-pink-400/10 border-pink-400/40 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] fill-pink-200 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]"
  },
  video: {
    aura: "bg-violet-500/20 group-hover:bg-violet-400/40",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(139,92,246,0.4)_25%,transparent_50%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(139,92,246,0.9)_25%,transparent_50%)]",
    iconGlow: "text-violet-300 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)] group-hover:text-violet-200 group-hover:drop-shadow-[0_0_20px_rgba(139,92,246,0.9)]",
    buttonGrad: "bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-white font-black tracking-[0.2em] shadow-[0_0_25px_rgba(139,92,246,0.35)] group-hover:shadow-[0_0_40px_rgba(139,92,246,0.65)] border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
    textGrad: "bg-[linear-gradient(110deg,#c4b5fd_0%,#ffffff_45%,#8b5cf6_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(139,92,246,0.2)]",
    cardBorder: "border-violet-500/20 shadow-[inset_0_1px_2px_rgba(139,92,246,0.1),0_0_15px_rgba(139,92,246,0.05)] hover:border-violet-400/60 hover:shadow-[0_0_50px_rgba(139,92,246,0.25)]",
    badge: "bg-violet-400/10 border-violet-400/40 text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.3)] fill-violet-200 drop-shadow-[0_0_5px_rgba(139,92,246,0.8)]"
  },
  ai: {
    aura: "bg-indigo-500/20 group-hover:bg-indigo-400/40",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(99,102,241,0.4)_25%,transparent_50%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(99,102,241,0.9)_25%,transparent_50%)]",
    iconGlow: "text-indigo-300 drop-shadow-[0_0_10px_rgba(99,102,241,0.6)] group-hover:text-indigo-200 group-hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.9)]",
    buttonGrad: "bg-gradient-to-r from-amber-400 via-indigo-500 to-violet-600 text-white font-black tracking-[0.2em] shadow-[0_0_25px_rgba(99,102,241,0.35)] group-hover:shadow-[0_0_40px_rgba(99,102,241,0.65)] border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
    textGrad: "bg-[linear-gradient(110deg,#a5b4fc_0%,#ffffff_45%,#6366f1_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(99,102,241,0.2)]",
    cardBorder: "border-indigo-500/20 shadow-[inset_0_1px_2px_rgba(99,102,241,0.1),0_0_15px_rgba(99,102,241,0.05)] hover:border-indigo-400/60 hover:shadow-[0_0_50px_rgba(99,102,241,0.25)]",
    badge: "bg-indigo-400/10 border-indigo-400/40 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.3)] fill-indigo-200 drop-shadow-[0_0_5px_rgba(99,102,241,0.8)]"
  },
  productivity: {
    aura: "bg-emerald-500/20 group-hover:bg-emerald-400/40",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(16,185,129,0.4)_25%,transparent_50%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(16,185,129,0.9)_25%,transparent_50%)]",
    iconGlow: "text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)] group-hover:text-emerald-200 group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.9)]",
    buttonGrad: "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white font-black tracking-[0.2em] shadow-[0_0_25px_rgba(16,185,129,0.35)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.65)] border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
    textGrad: "bg-[linear-gradient(110deg,#6ee7b7_0%,#ffffff_45%,#10b981_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(16,185,129,0.2)]",
    cardBorder: "border-emerald-500/20 shadow-[inset_0_1px_2px_rgba(16,185,129,0.1),0_0_15px_rgba(16,185,129,0.05)] hover:border-emerald-400/60 hover:shadow-[0_0_50px_rgba(16,185,129,0.25)]",
    badge: "bg-emerald-400/10 border-emerald-400/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] fill-emerald-200 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]"
  },
  business: {
    aura: "bg-orange-500/25 group-hover:bg-emerald-500/45",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,153,51,0.5)_25%,rgba(16,185,129,0.5)_50%,transparent_75%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,153,51,0.95)_25%,rgba(16,185,129,0.95)_50%,transparent_75%)]",
    iconGlow: "text-orange-300 drop-shadow-[0_0_10px_rgba(255,153,51,0.7)] group-hover:text-emerald-200 group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.95)]",
    buttonGrad: "bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 text-white font-black tracking-[0.2em] shadow-[0_0_25px_rgba(245,158,11,0.35)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.65)] border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
    textGrad: "bg-[linear-gradient(110deg,#ff9933_0%,#ffffff_45%,#138808_65%,#10b981_100%)] drop-shadow-[0_2px_18px_rgba(255,153,51,0.35)]",
    cardBorder: "border-orange-500/25 shadow-[inset_0_1px_2px_rgba(255,153,51,0.12),0_0_15px_rgba(16,185,129,0.08)] hover:border-emerald-400/70 hover:shadow-[0_0_50px_rgba(16,185,129,0.3)]",
    badge: "bg-gradient-to-r from-orange-500/20 to-emerald-500/20 border-emerald-400/40 text-orange-200 shadow-[0_0_15px_rgba(255,153,51,0.3)] fill-orange-200 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]"
  },
  seo: {
    aura: "bg-teal-500/25 group-hover:bg-cyan-500/45",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(0,255,135,0.5)_25%,rgba(96,239,255,0.5)_50%,transparent_75%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(0,255,135,0.95)_25%,rgba(96,239,255,0.95)_50%,transparent_75%)]",
    iconGlow: "text-emerald-300 drop-shadow-[0_0_10px_rgba(0,255,135,0.7)] group-hover:text-cyan-200 group-hover:drop-shadow-[0_0_20px_rgba(96,239,255,0.95)]",
    buttonGrad: "bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-600 text-white font-black tracking-[0.2em] shadow-[0_0_25px_rgba(0,255,135,0.35)] group-hover:shadow-[0_0_40px_rgba(96,239,255,0.65)] border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
    textGrad: "bg-[linear-gradient(110deg,#00ff87_0%,#ffffff_40%,#60efff_70%,#0061ff_100%)] drop-shadow-[0_2px_18px_rgba(0,255,135,0.35)]",
    cardBorder: "border-teal-500/25 shadow-[inset_0_1px_2px_rgba(0,255,135,0.12),0_0_15px_rgba(96,239,255,0.08)] hover:border-cyan-400/70 hover:shadow-[0_0_50px_rgba(96,239,255,0.3)]",
    badge: "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-cyan-400/40 text-emerald-200 shadow-[0_0_15px_rgba(0,255,135,0.3)] fill-emerald-200 drop-shadow-[0_0_5px_rgba(96,239,255,0.8)]"
  },
  developer: {
    aura: "bg-lime-500/25 group-hover:bg-emerald-500/45",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(163,230,53,0.5)_25%,rgba(0,255,135,0.5)_50%,transparent_75%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(163,230,53,0.95)_25%,rgba(0,255,135,0.95)_50%,transparent_75%)]",
    iconGlow: "text-lime-300 drop-shadow-[0_0_10px_rgba(163,230,53,0.7)] group-hover:text-emerald-200 group-hover:drop-shadow-[0_0_20px_rgba(0,255,135,0.95)]",
    buttonGrad: "bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-500 text-white font-black tracking-[0.2em] shadow-[0_0_25px_rgba(163,230,53,0.35)] group-hover:shadow-[0_0_40px_rgba(0,255,135,0.65)] border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
    textGrad: "bg-[linear-gradient(110deg,#a3e635_0%,#ffffff_45%,#00ff87_70%,#059669_100%)] drop-shadow-[0_2px_18px_rgba(163,230,53,0.35)]",
    cardBorder: "border-lime-500/25 shadow-[inset_0_1px_2px_rgba(163,230,53,0.12),0_0_15px_rgba(0,255,135,0.08)] hover:border-emerald-400/70 hover:shadow-[0_0_50px_rgba(0,255,135,0.3)]",
    badge: "bg-gradient-to-r from-lime-500/20 to-emerald-500/20 border-lime-400/40 text-lime-200 shadow-[0_0_15px_rgba(163,230,53,0.3)] fill-lime-200 drop-shadow-[0_0_5px_rgba(0,255,135,0.8)]"
  },
  student: {
    aura: "bg-amber-500/25 group-hover:bg-purple-500/45",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(251,191,36,0.5)_25%,rgba(168,85,247,0.5)_50%,transparent_75%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(251,191,36,0.95)_25%,rgba(168,85,247,0.95)_50%,transparent_75%)]",
    iconGlow: "text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)] group-hover:text-purple-200 group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.95)]",
    buttonGrad: "bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-600 text-white font-black tracking-[0.2em] shadow-[0_0_25px_rgba(251,191,36,0.35)] group-hover:shadow-[0_0_40px_rgba(217,70,239,0.65)] border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
    textGrad: "bg-[linear-gradient(110deg,#fbbf24_0%,#ffffff_45%,#a855f7_70%,#6366f1_100%)] drop-shadow-[0_2px_18px_rgba(251,191,36,0.35)]",
    cardBorder: "border-amber-500/25 shadow-[inset_0_1px_2px_rgba(251,191,36,0.12),0_0_15px_rgba(168,85,247,0.08)] hover:border-purple-400/70 hover:shadow-[0_0_50px_rgba(168,85,247,0.3)]",
    badge: "bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-amber-400/40 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.3)] fill-amber-200 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]"
  },
  creator: {
    aura: "bg-rose-500/25 group-hover:bg-purple-500/45",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(244,63,94,0.5)_25%,rgba(168,85,247,0.5)_50%,transparent_75%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(244,63,94,0.95)_25%,rgba(168,85,247,0.95)_50%,transparent_75%)]",
    iconGlow: "text-rose-300 drop-shadow-[0_0_10px_rgba(244,63,94,0.7)] group-hover:text-purple-200 group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.95)]",
    buttonGrad: "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-black tracking-[0.2em] shadow-[0_0_25px_rgba(244,63,94,0.35)] group-hover:shadow-[0_0_40px_rgba(168,85,247,0.65)] border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]",
    textGrad: "bg-[linear-gradient(110deg,#fb7185_0%,#ffffff_45%,#e879f9_70%,#c084fc_100%)] drop-shadow-[0_2px_18px_rgba(244,63,94,0.35)]",
    cardBorder: "border-rose-500/25 shadow-[inset_0_1px_2px_rgba(244,63,94,0.12),0_0_15px_rgba(168,85,247,0.08)] hover:border-purple-400/70 hover:shadow-[0_0_50px_rgba(168,85,247,0.3)]",
    badge: "bg-gradient-to-r from-rose-500/20 to-purple-500/20 border-rose-400/40 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)] fill-rose-200 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]"
  }
};
