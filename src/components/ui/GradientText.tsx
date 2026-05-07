"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  glow?: boolean;
  speed?: number;
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  animate = true,
  glow = true,
  speed = 4,
}) => {
  return (
    <span className={cn(
      "relative inline-block font-bold tracking-tight pb-2 pt-1", // Added padding to prevent clipping
      className
    )}>
      <motion.span
        className={cn(
          "bg-clip-text text-transparent relative z-10",
          glow && "drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]"
        )}
        style={{
          backgroundImage: "linear-gradient(to right, #A855F7, #22D3EE, #8B5CF6, #A855F7)",
          backgroundSize: "200% auto",
        }}
        animate={
          animate
            ? {
                backgroundPosition: ["0% center", "-200% center"],
              }
            : {}
        }
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {children}
      </motion.span>
      
      {/* Refined Metallic Shine Sweep */}
      {animate && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <motion.div
            className="absolute inset-y-0 w-24 opacity-0"
            initial={{ x: "-100%" }}
            animate={{ 
              x: ["-100%", "200%"],
              opacity: [0, 0.2, 0] // Much lower opacity for a subtle 'shimmer'
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              skewX: "-20deg" // Angled shine for a premium feel
            }}
          />
        </div>
      )}
    </span>
  );
};

export default GradientText;

