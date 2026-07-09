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
    buttonGrad: "bg-gradient-to-r from-red-500 via-red-400 to-orange-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] border-red-400/50",
    textGrad: "bg-[linear-gradient(110deg,#fca5a5_0%,#ffffff_45%,#ef4444_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(239,68,68,0.2)]",
    cardBorder: "border-red-500/20 shadow-[inset_0_1px_2px_rgba(239,68,68,0.1),0_0_15px_rgba(239,68,68,0.05)] hover:border-red-400/60 hover:shadow-[0_0_50px_rgba(239,68,68,0.25)]",
    badge: "bg-red-400/10 border-red-400/40 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)] fill-red-200 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]"
  },
  image: {
    aura: "bg-cyan-500/20 group-hover:bg-cyan-400/40",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(6,182,212,0.4)_25%,transparent_50%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(6,182,212,0.9)_25%,transparent_50%)]",
    iconGlow: "text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] group-hover:text-cyan-200 group-hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.9)]",
    buttonGrad: "bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] border-cyan-400/50",
    textGrad: "bg-[linear-gradient(110deg,#67e8f9_0%,#ffffff_45%,#06b6d4_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(6,182,212,0.2)]",
    cardBorder: "border-cyan-500/20 shadow-[inset_0_1px_2px_rgba(6,182,212,0.1),0_0_15px_rgba(6,182,212,0.05)] hover:border-cyan-400/60 hover:shadow-[0_0_50px_rgba(6,182,212,0.25)]",
    badge: "bg-cyan-400/10 border-cyan-400/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] fill-cyan-200 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]"
  },
  audio: {
    aura: "bg-pink-500/20 group-hover:bg-pink-400/40",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(236,72,153,0.4)_25%,transparent_50%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(236,72,153,0.9)_25%,transparent_50%)]",
    iconGlow: "text-pink-300 drop-shadow-[0_0_10px_rgba(236,72,153,0.6)] group-hover:text-pink-200 group-hover:drop-shadow-[0_0_20px_rgba(236,72,153,0.9)]",
    buttonGrad: "bg-gradient-to-r from-pink-500 via-pink-400 to-fuchsia-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] border-pink-400/50",
    textGrad: "bg-[linear-gradient(110deg,#f9a8d4_0%,#ffffff_45%,#ec4899_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(236,72,153,0.2)]",
    cardBorder: "border-pink-500/20 shadow-[inset_0_1px_2px_rgba(236,72,153,0.1),0_0_15px_rgba(236,72,153,0.05)] hover:border-pink-400/60 hover:shadow-[0_0_50px_rgba(236,72,153,0.25)]",
    badge: "bg-pink-400/10 border-pink-400/40 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] fill-pink-200 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]"
  },
  video: {
    aura: "bg-violet-500/20 group-hover:bg-violet-400/40",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(139,92,246,0.4)_25%,transparent_50%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(139,92,246,0.9)_25%,transparent_50%)]",
    iconGlow: "text-violet-300 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)] group-hover:text-violet-200 group-hover:drop-shadow-[0_0_20px_rgba(139,92,246,0.9)]",
    buttonGrad: "bg-gradient-to-r from-violet-500 via-violet-400 to-purple-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] border-violet-400/50",
    textGrad: "bg-[linear-gradient(110deg,#c4b5fd_0%,#ffffff_45%,#8b5cf6_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(139,92,246,0.2)]",
    cardBorder: "border-violet-500/20 shadow-[inset_0_1px_2px_rgba(139,92,246,0.1),0_0_15px_rgba(139,92,246,0.05)] hover:border-violet-400/60 hover:shadow-[0_0_50px_rgba(139,92,246,0.25)]",
    badge: "bg-violet-400/10 border-violet-400/40 text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.3)] fill-violet-200 drop-shadow-[0_0_5px_rgba(139,92,246,0.8)]"
  },
  ai: {
    aura: "bg-indigo-500/20 group-hover:bg-indigo-400/40",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(99,102,241,0.4)_25%,transparent_50%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(99,102,241,0.9)_25%,transparent_50%)]",
    iconGlow: "text-indigo-300 drop-shadow-[0_0_10px_rgba(99,102,241,0.6)] group-hover:text-indigo-200 group-hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.9)]",
    buttonGrad: "bg-gradient-to-r from-indigo-500 via-indigo-400 to-blue-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] border-indigo-400/50",
    textGrad: "bg-[linear-gradient(110deg,#a5b4fc_0%,#ffffff_45%,#6366f1_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(99,102,241,0.2)]",
    cardBorder: "border-indigo-500/20 shadow-[inset_0_1px_2px_rgba(99,102,241,0.1),0_0_15px_rgba(99,102,241,0.05)] hover:border-indigo-400/60 hover:shadow-[0_0_50px_rgba(99,102,241,0.25)]",
    badge: "bg-indigo-400/10 border-indigo-400/40 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.3)] fill-indigo-200 drop-shadow-[0_0_5px_rgba(99,102,241,0.8)]"
  },
  productivity: {
    aura: "bg-emerald-500/20 group-hover:bg-emerald-400/40",
    spinIdle: "bg-[conic-gradient(from_0deg,transparent_0%,rgba(16,185,129,0.4)_25%,transparent_50%)]",
    spinHover: "group-hover:bg-[conic-gradient(from_0deg,transparent_0%,rgba(16,185,129,0.9)_25%,transparent_50%)]",
    iconGlow: "text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)] group-hover:text-emerald-200 group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.9)]",
    buttonGrad: "bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-600 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] border-emerald-400/50",
    textGrad: "bg-[linear-gradient(110deg,#6ee7b7_0%,#ffffff_45%,#10b981_55%,#ffffff_100%)] drop-shadow-[0_2px_15px_rgba(16,185,129,0.2)]",
    cardBorder: "border-emerald-500/20 shadow-[inset_0_1px_2px_rgba(16,185,129,0.1),0_0_15px_rgba(16,185,129,0.05)] hover:border-emerald-400/60 hover:shadow-[0_0_50px_rgba(16,185,129,0.25)]",
    badge: "bg-emerald-400/10 border-emerald-400/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] fill-emerald-200 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]"
  }
};
