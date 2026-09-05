"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Scissors, 
  Laugh, 
  Crop, 
  Zap, 
  FileType, 
  ArrowRight, 
  Loader2, 
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendToTool } from "@/lib/pipeline";

export type PipelineActionKey = "eraser" | "meme" | "resizer" | "compressor" | "converter";

interface ActionConfig {
  name: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  badge: string;
  tone: string;
  iconBg: string;
}

const ACTION_CONFIGS: Record<PipelineActionKey, ActionConfig> = {
  eraser: {
    name: "Remove Background",
    hint: "Isolate subject with AI vision cutout",
    href: "/tools/image/eraser",
    icon: Scissors,
    badge: "AI CUTOUT",
    tone: "from-cyan-500/15 via-teal-500/5 to-transparent border-cyan-400/30 hover:border-cyan-300 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    iconBg: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
  },
  meme: {
    name: "Turn into Meme",
    hint: "Add viral captions & reaction text",
    href: "/tools/meme-generator",
    icon: Laugh,
    badge: "VIRAL",
    tone: "from-amber-500/15 via-orange-500/5 to-transparent border-amber-400/30 hover:border-amber-300 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    iconBg: "bg-amber-500/20 text-amber-300 border-amber-400/40",
  },
  resizer: {
    name: "Resize & Crop",
    hint: "Social aspect ratios (IG, YT, X)",
    href: "/tools/image/resizer",
    icon: Crop,
    badge: "FRAMING",
    tone: "from-blue-500/15 via-indigo-500/5 to-transparent border-blue-400/30 hover:border-blue-300 text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    iconBg: "bg-blue-500/20 text-blue-300 border-blue-400/40",
  },
  compressor: {
    name: "Compress File",
    hint: "Reduce file size without quality loss",
    href: "/tools/image/compressor",
    icon: Zap,
    badge: "LOSSLESS",
    tone: "from-emerald-500/15 via-green-500/5 to-transparent border-emerald-400/30 hover:border-emerald-300 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    iconBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
  },
  converter: {
    name: "Convert Format",
    hint: "Export to high-fidelity WebP, PNG, JPG",
    href: "/tools/image/converter",
    icon: FileType,
    badge: "FORMAT",
    tone: "from-purple-500/15 via-fuchsia-500/5 to-transparent border-purple-400/30 hover:border-purple-300 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    iconBg: "bg-purple-500/20 text-purple-300 border-purple-400/40",
  },
};

interface MediaPipelineBarProps {
  imageUrl: string;
  imageName?: string;
  sourceToolId: string;
  sourceToolName?: string;
  actions?: PipelineActionKey[];
  className?: string;
  title?: string;
  subtitle?: string;
}

export function MediaPipelineBar({
  imageUrl,
  imageName = "artwork.png",
  sourceToolId,
  sourceToolName = "Exismic Tool",
  actions = ["eraser", "meme", "resizer", "compressor"],
  className = "",
  title = "Next Action Pipeline",
  subtitle = "Carry this image directly into companion tools with zero re-uploading",
}: MediaPipelineBarProps) {
  const [navigatingTo, setNavigatingTo] = useState<PipelineActionKey | null>(null);

  const handleAction = async (actionKey: PipelineActionKey) => {
    if (navigatingTo) return;
    setNavigatingTo(actionKey);

    const config = ACTION_CONFIGS[actionKey];
    if (!config) return;

    try {
      await sendToTool(config.href, {
        name: imageName,
        url: imageUrl,
        fileType: "image",
        sourceToolId,
        sourceToolName,
      });
    } catch (err) {
      console.error("[MediaPipeline] Failed to send to tool:", err);
      setNavigatingTo(null);
    }
  };

  if (!imageUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#090b14]/90 via-[#07080f]/90 to-[#030306]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
              <Sparkles size={12} className="text-cyan-400" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-cyan-200 via-sky-100 to-indigo-300 bg-clip-text text-transparent">
              {title}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium mt-1">
            {subtitle}
          </p>
        </div>
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 self-start sm:self-center">
          1-Click Handoff
        </span>
      </div>

      {/* Action Cards Grid */}
      <div
        className={cn(
          "grid gap-3",
          actions.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : actions.length === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : actions.length === 4
            ? "grid-cols-2 sm:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        )}
      >
        {actions.map((key) => {
          const config = ACTION_CONFIGS[key];
          if (!config) return null;
          const Icon = config.icon;
          const isLoading = navigatingTo === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleAction(key)}
              disabled={Boolean(navigatingTo)}
              className={cn(
                "group relative flex flex-col justify-between text-left p-4 rounded-2xl border bg-gradient-to-b transition-all duration-300 cursor-pointer overflow-hidden",
                config.tone,
                isLoading
                  ? "scale-[0.98] brightness-125 opacity-90 ring-1 ring-cyan-400/50"
                  : "hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              )}
            >
              {/* Subtle hover beam */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="space-y-2.5 w-full relative z-10">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110",
                      config.iconBg
                    )}
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300">
                    {config.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-white tracking-tight group-hover:text-white transition-colors">
                    {config.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1 leading-snug">
                    {config.hint}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 w-full flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors relative z-10">
                <span>{isLoading ? "Opening..." : "Launch"}</span>
                {isLoading ? (
                  <Loader2 size={11} className="animate-spin text-cyan-300" />
                ) : (
                  <ArrowRight
                    size={11}
                    className="transition-transform group-hover:translate-x-1 text-zinc-400 group-hover:text-white"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
