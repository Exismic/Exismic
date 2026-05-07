"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  variant?: "upgrade" | "gopro";
  showArrow?: boolean;
  size?: "sm" | "md" | "lg";
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  onClick,
  children,
  className,
  variant = "upgrade",
  showArrow = true,
  size = "md",
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isGoPro = variant === "gopro";
  const text = children || (isGoPro ? "GO PRO" : "UPGRADE NOW");

  // Pre-generate particle values to avoid hydration mismatch
  const particles = useMemo(() => {
    const count = size === "sm" ? 4 : 8;
    return [...Array(count)].map((_, i) => ({
      top: `${(i * 13) % 100}%`,
      left: `${(i * 19) % 100}%`,
      x: (i * 25) - 100,
      y: (i * 15) - 60,
      delay: i * 0.25
    }));
  }, [size]);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: size === "sm" ? 1.03 : 1.05, y: -3 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative group overflow-hidden transition-all duration-700 cursor-pointer",
        "bg-linear-to-r from-[#A855F7] via-[#22D3EE] to-[#8B5CF6]",
        "hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.6),0_10px_30px_-10px_rgba(34,211,238,0.4)]",
        size === "sm" ? "px-6 py-3 rounded-2xl" : "px-12 py-6 rounded-full",
        className
      )}
    >
      {/* 🔮 Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] opacity-50 group-hover:opacity-20 transition-opacity duration-500" />
      
      {/* ✨ Moving Shine Sweep */}
      <div className="absolute inset-0 w-[250%] h-full bg-[linear-gradient(110deg,transparent_40%,rgba(255,255,255,0.5)_50%,transparent_60%)] bg-[length:40%_100%] animate-shine pointer-events-none" />
      
      {/* 🌈 Inner Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* 🖼️ Glowing Border Frame */}
      <div className={cn(
        "absolute inset-0 border-[1.5px] border-white/0 group-hover:border-white/40 transition-all duration-700",
        size === "sm" ? "rounded-2xl" : "rounded-full"
      )} />
      
      {/* 🌊 Bottom Edge Highlight */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-white/30 to-transparent" />

      {/* 📝 Content Layer */}
      <div className={cn(
        "relative z-10 flex items-center justify-center gap-3",
        size === "sm" ? "gap-2" : "gap-4"
      )}>
        <motion.div
          animate={{ rotate: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={size === "sm" ? 16 : 20} className="text-white fill-white/20 animate-pulse shrink-0" />
        </motion.div>
        
        <span className={cn(
          "font-black text-white uppercase tracking-[0.15em] leading-none drop-shadow-sm",
          size === "sm" ? "text-[11px]" : "text-sm md:text-base"
        )}>
          {text}
        </span>

        {showArrow && !isGoPro && (
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight size={size === "sm" ? 16 : 20} className="text-white" />
          </motion.div>
        )}
      </div>

      {/* 🎆 Premium Particles */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileHover={{ 
                opacity: [0, 0.8, 0], 
                scale: [0, 1.5, 0],
                x: p.x,
                y: p.y,
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                delay: p.delay,
                ease: "circOut" 
              }}
              className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-0 blur-[1px]"
              style={{ 
                top: p.top, 
                left: p.left 
              }}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
};

export default PremiumButton;
