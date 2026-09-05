"use client";

import React from "react";
import { CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PipedBadgeProps {
  sourceName: string;
  onClear?: () => void;
  className?: string;
}

export function PipedBadge({ sourceName, onClear, className = "" }: PipedBadgeProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-200 text-xs font-medium shadow-sm backdrop-blur-md ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
          <span className="truncate">
            Imported from <span className="font-bold text-white">{sourceName}</span>
          </span>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-cyan-300/70 hover:text-white transition-colors shrink-0 ml-2"
            title="Clear imported text"
          >
            <span>Clear</span>
            <X size={12} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
