"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2, ArrowRight, Zap, Sparkles } from "lucide-react";

interface PdfActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  label: string;
  subLabel?: string;
  className?: string;
  icon?: React.ElementType;
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
  return (
    <div className={cn("relative z-20 w-full", className)}>
      <div className="max-w-5xl mx-auto md:max-w-none">
        <motion.button
          onClick={onClick}
          disabled={disabled || isLoading}
          whileHover={!disabled && !isLoading ? { scale: 1.01, y: -2 } : {}}
          whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
          className={cn(
            "relative w-full group overflow-hidden rounded-[2rem] p-[2px] transition-all duration-500 shadow-2xl",
            disabled || isLoading 
              ? "opacity-50 grayscale cursor-not-allowed bg-zinc-800/50" 
              : "bg-linear-to-r from-accent-purple via-accent-cyan to-accent-purple bg-[length:200%_100%] animate-gradient-x hover:shadow-[0_0_50px_rgba(124,58,237,0.3)]"
          )}
        >
          {/* Glow Effect Layer */}
          {!disabled && !isLoading && (
            <div className="absolute inset-0 bg-linear-to-r from-accent-purple to-accent-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl" />
          )}

          {/* Inner Button Content */}
          <div className={cn(
            "relative flex items-center justify-between gap-6 rounded-[calc(2rem-1px)] px-8 py-5 md:px-10 md:py-6 transition-all duration-500",
            disabled || isLoading 
              ? "bg-zinc-900/90 text-zinc-600" 
              : "bg-zinc-950/80 group-hover:bg-transparent text-white"
          )}>
            
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner",
                disabled || isLoading ? "bg-white/5" : "bg-white/10 group-hover:bg-white/20"
              )}>
                {isLoading ? (
                  <Loader2 className="w-6 h-6 md:w-7 md:h-7 animate-spin" />
                ) : (
                  <Icon className={cn("w-6 h-6 md:w-7 md:h-7", !disabled && "group-hover:scale-110 transition-transform")} />
                )}
              </div>
              
              <div className="text-left space-y-0.5">
                <h4 className="text-lg md:text-xl font-black uppercase italic tracking-tighter transition-all group-hover:translate-x-1 duration-500">
                  {label}
                </h4>
                {subLabel && (
                  <p className={cn(
                    "text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] transition-colors",
                    disabled || isLoading ? "text-zinc-700" : "text-zinc-500 group-hover:text-white"
                  )}>
                    {subLabel}
                  </p>
                )}
              </div>
            </div>

            {/* Premium Badge */}
            <div className={cn(
              "hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all duration-500",
              disabled || isLoading 
                ? "bg-white/5 border-white/5 text-zinc-800" 
                : "bg-white/10 border-white/10 group-hover:bg-white group-hover:text-black group-hover:border-white shadow-lg"
            )}>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready to Process</span>
              <Sparkles size={14} className={cn(!disabled && "animate-pulse")} />
            </div>

            {/* Shine Sweep Effect */}
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-[2rem]">
                <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:left-[150%] transition-all duration-1000 ease-in-out" />
            </div>
          </div>
        </motion.button>

        {/* Mobile Helper Message */}
        <AnimatePresence>
          {disabled && !isLoading && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="mt-4 text-center text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] md:hidden"
            >
              Please upload files to proceed
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

