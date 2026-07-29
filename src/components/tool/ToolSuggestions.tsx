"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import { ICON_MAP } from "@/data/tools";
import { getSuggestedToolsFor } from "@/data/tool-workflows";
import { cn } from "@/lib/utils";

interface ToolSuggestionsProps {
  currentToolId: string;
  categoryId: string;
  className?: string;
}

export function ToolSuggestions({ currentToolId, categoryId, className }: ToolSuggestionsProps) {
  const { headline, subtitle, items } = getSuggestedToolsFor(currentToolId, categoryId);

  if (!items || items.length === 0) return null;

  return (
    <div className={cn("mt-12 sm:mt-16 space-y-6 pt-10 border-t border-white/10", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
              Smart Workflow Recommendations
            </h3>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {headline}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium max-w-2xl">
            {subtitle}
          </p>
        </div>

        <Link
          href={`/category/${categoryId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white transition-colors shrink-0 group self-start sm:self-auto"
        >
          <Compass size={14} className="group-hover:rotate-45 transition-transform" />
          View all category tools
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(({ tool, suggestion }, idx) => {
          const IconComponent = ICON_MAP[tool.icon] || Sparkles;

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c0d14]/90 p-5 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/40 hover:bg-[#12131f] hover:shadow-[0_0_35px_rgba(251,191,36,0.12)]"
            >
              {/* Top Accent Glow */}
              <div className="absolute top-0 right-0 left-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="space-y-4">
                {/* Header row: Icon & Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-amber-400/40 group-hover:bg-amber-400/10 transition-colors shadow-inner">
                    <IconComponent size={22} className="text-zinc-300 group-hover:text-amber-300 transition-colors drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                  </div>

                  {suggestion.badge && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.2)]">
                      {suggestion.badge}
                    </span>
                  )}
                </div>

                {/* Title & Reason */}
                <div className="space-y-1.5">
                  <h4 className="text-base font-black tracking-tight text-white group-hover:text-amber-200 transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                    {suggestion.reason}
                  </p>
                </div>
              </div>

              {/* Action Button - Ultra Premium Neon Glow */}
              <div className="pt-5 mt-4 border-t border-white/5">
                <Link
                  href={tool.href}
                  className="relative overflow-hidden isolate transform-gpu flex items-center justify-between w-full rounded-full bg-gradient-to-r from-amber-500 via-fuchsia-500 to-indigo-600 hover:from-amber-400 hover:via-fuchsia-400 hover:to-indigo-500 border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_0_20px_rgba(251,191,36,0.25)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_0_35px_rgba(217,70,239,0.5)] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10">{suggestion.actionText || "Launch Tool"}</span>
                  <ArrowRight size={14} className="relative z-10 transition-transform group-hover:translate-x-1.5" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
