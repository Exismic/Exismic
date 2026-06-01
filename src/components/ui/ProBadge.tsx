"use client";

import React from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
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
  // Select gradient colors
  const gradientStyles = {
    default: {
      gradient: "linear-gradient(135deg, #A855F7, #EC4899, #06B6D4, #A855F7)",
      border: "border-accent-purple/20 bg-accent-purple/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
      glowBg: "rgba(168,85,247,0.2)",
      textClass: "text-accent-purple"
    },
    studio: {
      gradient: "linear-gradient(135deg, #A855F7, #EF4444, #F97316, #A855F7)",
      border: "border-red-500/20 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
      glowBg: "rgba(239,68,68,0.25)",
      textClass: "text-red-500"
    }
  }[type];

  // Size details
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[8px] rounded-lg gap-1",
    md: "px-3 py-1 text-[9px] rounded-full gap-1.5",
    lg: "px-4 py-2 text-xs rounded-full gap-2"
  }[size];

  const iconSize = {
    sm: 8,
    md: 10,
    lg: 12
  }[size];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        "relative inline-flex items-center font-outfit font-black tracking-widest uppercase border backdrop-blur-md select-none",
        gradientStyles.border,
        sizeClasses,
        className
      )}
    >
      {/* Dynamic Background Animated Glow */}
      {glow && (
        <div 
          className="absolute inset-0 -z-10 rounded-inherit opacity-20 blur-sm transition-opacity duration-300"
          style={{ backgroundColor: gradientStyles.glowBg }}
        />
      )}

      {/* Styled Icon */}
      {type === "studio" ? (
        <Sparkles size={iconSize} className={gradientStyles.textClass} />
      ) : (
        <Crown size={iconSize} className={cn(gradientStyles.textClass, "fill-current/20")} />
      )}

      {/* Animated Shine Gradient Text */}
      <motion.span
        className="bg-clip-text text-transparent relative z-10 font-black"
        style={{
          backgroundImage: gradientStyles.gradient,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
        }}
        animate={{
          backgroundPosition: ["0% center", "-200% center"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {type === "studio" ? "Studio" : "Pro"}
      </motion.span>

      {/* Sweeping Reflective Shine Sweep */}
      <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit select-none z-20">
        <motion.span
          className="absolute inset-y-0 w-full opacity-0"
          initial={{ x: "-100%" }}
          animate={{ 
            x: ["-100%", "200%"],
            opacity: [0, 0.3, 0] 
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            skewX: "-20deg",
            display: "block",
            height: "100%"
          }}
        />
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
