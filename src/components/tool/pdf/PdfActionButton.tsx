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
}

export function PdfActionButton({
  onClick,
  disabled,
  isLoading,
  label,
  subLabel,
  className,
  icon: Icon = ArrowRight,
}: PdfActionButtonProps) {
  const inactive = disabled || isLoading;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={inactive}
      whileHover={inactive ? undefined : { y: -2 }}
      whileTap={inactive ? undefined : { scale: 0.985 }}
      className={cn(
        "group relative flex min-h-16 w-full items-center gap-4 overflow-hidden rounded-lg border px-5 py-4 text-left transition duration-300 sm:px-6",
        inactive
          ? "cursor-not-allowed border-white/8 bg-white/[0.025] text-zinc-600"
          : "border-cyan-300/20 bg-[linear-gradient(120deg,rgba(124,58,237,0.22),rgba(8,10,16,0.94)_42%,rgba(34,211,238,0.16))] text-white shadow-[0_18px_55px_rgba(0,0,0,0.32)] hover:border-cyan-300/35",
        className,
      )}
    >
      {!inactive && (
        <motion.span
          className="pointer-events-none absolute inset-y-0 w-24 bg-linear-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-160%", "650%"] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <span
        className={cn(
          "relative flex size-11 shrink-0 items-center justify-center rounded-lg border",
          inactive
            ? "border-white/5 bg-white/[0.025]"
            : "border-white/10 bg-white/[0.08] text-cyan-100",
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
          <span className="mt-1 block truncate text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            {subLabel}
          </span>
        )}
      </span>
      {!inactive && <ArrowRight className="relative size-5 shrink-0 text-cyan-200 transition-transform group-hover:translate-x-1" />}
    </motion.button>
  );
}
