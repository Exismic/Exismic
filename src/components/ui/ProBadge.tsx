"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  type?: "default" | "studio";
  size?: "sm" | "md" | "lg";
  className?: string;
  glow?: boolean;
}

export function ProBadge({
  type = "default",
  size = "md",
  className,
  glow = true,
}: ProBadgeProps) {
  const visual = {
    default: {
      letter: "P",
      label: "Pro",
      edge: "bg-[conic-gradient(from_20deg,#22d3ee,#7c3aed_30%,#e879f9_58%,#38bdf8_82%,#22d3ee)]",
      text: "bg-[linear-gradient(90deg,#c4b5fd,#f0abfc,#67e8f9,#c4b5fd)]",
      iconBody: "bg-[linear-gradient(145deg,rgba(139,92,246,0.9),rgba(8,9,20,0.96)_52%,rgba(34,211,238,0.76))]",
      dot: "bg-cyan-200 shadow-[0_0_7px_rgba(103,232,249,0.95)]",
    },
    studio: {
      letter: "S",
      label: "Studio",
      edge: "bg-[conic-gradient(from_20deg,#f472b6,#7c3aed_32%,#fb7185_62%,#f59e0b_84%,#f472b6)]",
      text: "bg-[linear-gradient(90deg,#d8b4fe,#f9a8d4,#fda4af,#d8b4fe)]",
      iconBody: "bg-[linear-gradient(145deg,rgba(217,70,239,0.84),rgba(12,8,19,0.96)_52%,rgba(251,113,133,0.72))]",
      dot: "bg-pink-200 shadow-[0_0_7px_rgba(249,168,212,0.95)]",
    },
  }[type];

  const dimensions = {
    sm: {
      shell: "h-6 rounded-lg",
      body: "gap-1.5 rounded-[7px] pl-1 pr-2",
      mark: "h-4 w-4 text-[6px]",
      text: "text-[7px] tracking-[0.16em]",
    },
    md: {
      shell: "h-9 rounded-xl",
      body: "gap-2 rounded-[11px] pl-1.5 pr-3",
      mark: "h-6 w-6 text-[8px]",
      text: "text-[9px] tracking-[0.17em]",
    },
    lg: {
      shell: "h-11 rounded-[14px]",
      body: "gap-2.5 rounded-[13px] pl-2 pr-4",
      mark: "h-7 w-7 text-[10px]",
      text: "text-[11px] tracking-[0.18em]",
    },
  }[size];

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.025 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`${visual.label} membership`}
      className={cn(
        "group/pro relative isolate inline-flex overflow-hidden p-px font-outfit font-black uppercase select-none",
        dimensions.shell,
        glow && "shadow-[0_10px_28px_rgba(0,0,0,0.35),0_0_20px_rgba(124,58,237,0.12)]",
        className
      )}
    >
      <motion.span
        aria-hidden="true"
        className={cn("absolute -inset-[120%]", visual.edge)}
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />

      <span className={cn("relative flex h-full items-center border border-white/[0.075] bg-[#08080d]/96 backdrop-blur-2xl", dimensions.body)}>
        <span className={cn("relative isolate flex shrink-0 items-center justify-center", dimensions.mark)}>
          <span className="absolute inset-0 overflow-hidden [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]">
            <motion.span
              className={cn("absolute -inset-1/2", visual.edge)}
              animate={{ rotate: -360 }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            />
          </span>
          <span className="absolute inset-[1px] [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)] bg-[#05060b]" />
          <span className={cn("absolute inset-[2px] [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]", visual.iconBody)} />
          <span className="relative z-10 font-black leading-none text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.65)]">
            {visual.letter}
          </span>
          <span className={cn("absolute right-0 top-[18%] z-20 h-1 w-1 rounded-full", visual.dot)} />
        </span>

        <motion.span
          className={cn("relative bg-clip-text font-black text-transparent", dimensions.text, visual.text)}
          style={{ backgroundSize: "220% 100%" }}
          animate={{ backgroundPosition: ["0% center", "-220% center"] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
        >
          {visual.label}
        </motion.span>

        <span className={cn("h-1 w-1 rounded-full opacity-70", visual.dot)} />

        <span className="pointer-events-none absolute inset-y-0 -left-12 w-7 skew-x-[-18deg] bg-white/16 blur-sm transition-transform duration-1000 group-hover/pro:translate-x-40" />
      </span>
    </motion.div>
  );
}

interface GradientProTextProps {
  children: React.ReactNode;
  type?: "default" | "studio";
  className?: string;
  speed?: number;
}

export function GradientProText({
  children,
  type = "default",
  className,
  speed = 3,
}: GradientProTextProps) {
  const gradient = {
    default: "linear-gradient(to right, #A855F7, #EC4899, #06B6D4, #A855F7)",
    studio: "linear-gradient(to right, #A855F7, #EF4444, #F97316, #A855F7)"
  }[type];

  return (
    <span className={cn("relative inline-flex items-center font-outfit font-black tracking-tighter", className)}>
      <motion.span
        className="bg-clip-text text-transparent relative z-10"
        style={{
          backgroundImage: gradient,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
        }}
        animate={{
          backgroundPosition: ["0% center", "-200% center"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
