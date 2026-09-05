"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Compass, ArrowRight } from "lucide-react";
import { trackWorkflowTransition } from "@/lib/analytics";
import { getSuggestedToolsFor } from "@/data/tool-workflows";
import { ICON_MAP } from "@/data/tools";
import { setPipedContent } from "@/lib/tool-piping";

interface ToolWorkflowChainingProps {
  currentToolId: string;
  categoryId?: string;
  outputContent?: string | null;
  getContent?: () => string | null;
  className?: string;
}

export function ToolWorkflowChaining({
  currentToolId,
  categoryId,
  outputContent,
  getContent,
  className = "",
}: ToolWorkflowChainingProps) {
  const router = useRouter();
  const { headline, subtitle, items } = getSuggestedToolsFor(currentToolId, categoryId);

  if (!items || items.length === 0) return null;

  const handleNavigate = (toolHref: string, targetToolId: string) => {
    trackWorkflowTransition(currentToolId, toolHref);

    // Resolve output content from prop or dynamic callback
    const contentToPipe = (getContent ? getContent() : outputContent) || "";
    if (contentToPipe.trim()) {
      setPipedContent({
        sourceToolId: currentToolId,
        content: contentToPipe,
      });
    }

    router.push(toolHref);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`mt-10 rounded-3xl border border-white/10 bg-[#0c0d14]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300 mb-1">
            <Compass size={14} className="text-cyan-400" />
            <span>Recommended Next Steps</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            {headline || "What would you like to do next?"}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-medium">
            {subtitle || "Keep your momentum going — carry your result directly into companion tools without retyping."}
          </p>
        </div>
        <Link
          href="/tools"
          className="self-start sm:self-center text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>All tools</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className={`grid grid-cols-1 ${items.length === 2 ? 'md:grid-cols-2' : items.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
        {items.map(({ tool, suggestion }, idx) => {
          const IconComponent = ICON_MAP[tool.icon] || Compass;
          const tone = suggestion.tone || "from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-300";

          return (
            <button
              key={tool.id || idx}
              type="button"
              onClick={() => handleNavigate(tool.href, tool.id)}
              className={`group relative flex flex-col justify-between text-left p-5 rounded-2xl border bg-gradient-to-b ${tone} hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg`}
            >
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors shadow-inner">
                    <IconComponent size={18} />
                  </div>
                  {suggestion.badge ? (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white">
                      {suggestion.badge}
                    </span>
                  ) : (
                    <ArrowRight size={15} className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white group-hover:text-white transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
                    {suggestion.reason}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 w-full flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">
                  {suggestion.actionText || "Open tool"}
                </span>
                <ArrowRight size={13} className="text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
