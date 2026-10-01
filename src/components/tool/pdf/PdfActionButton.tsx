"use client";

import type { ElementType } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  label: string;
  subLabel?: string;
  className?: string;
  icon?: ElementType;
  themeColor?: "red" | "cyan" | "emerald" | "purple";
}

const THEME_STYLES = {
  red: {
    activeBg: "border-red-500/35 bg-[linear-gradient(120deg,rgba(239,68,68,0.22),rgba(18,10,12,0.95)_42%,rgba(244,63,94,0.18))] text-white shadow-[0_18px_55px_rgba(239,68,68,0.18)] hover:border-red-400/50 hover:shadow-[0_20px_60px_rgba(239,68,68,0.28)]",
    iconBox: "border-red-500/30 bg-red-500/15 text-red-200",
    arrow: "text-red-300",
  },
  cyan: {
    activeBg: "border-cyan-300/20 bg-[linear-gradient(120deg,rgba(124,58,237,0.22),rgba(8,10,16,0.94)_42%,rgba(34,211,238,0.16))] text-white shadow-[0_18px_55px_rgba(0,0,0,0.32)] hover:border-cyan-300/35",
    iconBox: "border-white/10 bg-white/[0.08] text-cyan-100",
    arrow: "text-cyan-200",
  },
  emerald: {
    activeBg: "border-emerald-500/30 bg-[linear-gradient(120deg,rgba(16,185,129,0.22),rgba(8,16,12,0.94)_42%,rgba(5,150,105,0.16))] text-white shadow-[0_18px_55px_rgba(16,185,129,0.18)] hover:border-emerald-400/50",
    iconBox: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    arrow: "text-emerald-300",
  },
  purple: {
    activeBg: "border-purple-500/30 bg-[linear-gradient(120deg,rgba(168,85,247,0.22),rgba(14,8,18,0.94)_42%,rgba(147,51,234,0.16))] text-white shadow-[0_18px_55px_rgba(168,85,247,0.18)] hover:border-purple-400/50",
    iconBox: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    arrow: "text-purple-300",
  },
};

export function PdfActionButton({
  onClick,
  disabled,
  isLoading,
  label,
  subLabel,
  className,
  icon: Icon = ArrowRight,
  themeColor = "red",
}: PdfActionButtonProps) {
  const inactive = disabled || isLoading;
  const currentTheme = THEME_STYLES[themeColor] || THEME_STYLES.red;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={inactive}
      whileHover={inactive ? undefined : { y: -2 }}
      whileTap={inactive ? undefined : { scale: 0.985 }}
      className={cn(
        "group relative flex min-h-16 w-full items-center gap-4 overflow-hidden rounded-2xl border px-5 py-4 text-left transition duration-300 sm:px-6 cursor-pointer",
        inactive
          ? "cursor-not-allowed border-white/8 bg-white/[0.025] text-zinc-600"
          : currentTheme.activeBg,
        className,
      )}
    >
      {!inactive && (
        <motion.span
          className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-160%", "650%"] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <span
        className={cn(
          "relative flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
          inactive
            ? "border-white/5 bg-white/[0.025]"
            : currentTheme.iconBox,
        )}
      >
        {isLoading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Icon className="size-5" />
        )}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block text-sm font-black uppercase tracking-[0.08em] sm:text-base">
          {isLoading ? "Processing document" : label}
        </span>
        {subLabel && (
          <span className="mt-1 block truncate text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
            {subLabel}
          </span>
        )}
      </span>
      {!inactive && <ArrowRight className={cn("relative size-5 shrink-0 transition-transform group-hover:translate-x-1", currentTheme.arrow)} />}
    </motion.button>
  );
}
