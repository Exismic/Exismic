"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { Sparkles } from "lucide-react";

interface LoaderProps {
  isLoading?: boolean;
  text?: string;
  className?: string;
}

// Deterministic ambient particles for zero hydration mismatch
const PARTICLES = [
  { id: 1, size: 4, left: "12%", top: "25%", duration: 6, delay: 0 },
  { id: 2, size: 2, left: "82%", top: "18%", duration: 7, delay: 1 },
  { id: 3, size: 5, left: "75%", top: "70%", duration: 5, delay: 0.5 },
  { id: 4, size: 3, left: "20%", top: "78%", duration: 8, delay: 1.5 },
  { id: 5, size: 2, left: "48%", top: "12%", duration: 6, delay: 2 },
  { id: 6, size: 4, left: "88%", top: "45%", duration: 7, delay: 0.8 },
  { id: 7, size: 3, left: "15%", top: "52%", duration: 5, delay: 1.2 },
  { id: 8, size: 2, left: "62%", top: "85%", duration: 6, delay: 2.2 },
];

const ELEGANT_PHRASES = [
  "Preparing your workspace...",
  "Refining every detail...",
  "Harmonizing your environment...",
  "Almost ready for you...",
];

/**
 * Exismic Ultra-Premium Loader
 * A luxury loading experience featuring ambient aura lighting, glassmorphic card depth,
 * orbital particle halos, fluid progress animation, and non-technical human copy.
 */
export const Loader = ({ 
  isLoading = true, 
  text, 
  className 
}: LoaderProps) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    // Lock page scroll while loader is active
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoading]);

  useEffect(() => {
    if (!text && isLoading) {
      const interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % ELEGANT_PHRASES.length);
      }, 2400);
      return () => clearInterval(interval);
    }
  }, [text, isLoading]);

  const activeText = text || ELEGANT_PHRASES[phraseIndex];

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          suppressHydrationWarning
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "fixed inset-0 z-[99999] flex items-center justify-center bg-[#030408] overflow-hidden select-none",
            className
          )}
        >
          {/* Ambient Multi-Layer Radial Glows */}
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.35, 0.55, 0.35]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-purple-900/20 via-indigo-800/15 to-cyan-700/20 blur-[140px] rounded-full pointer-events-none" 
          />
          
          <motion.div 
            animate={{ 
              scale: [1.1, 0.95, 1.1],
              opacity: [0.25, 0.45, 0.25]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-bl from-fuchsia-800/20 via-violet-900/20 to-blue-900/20 blur-[110px] rounded-full pointer-events-none" 
          />

          {/* Floating Subtle Ambient Star Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {PARTICLES.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 0.2, y: 0 }}
                animate={{ 
                  opacity: [0.2, 0.8, 0.2],
                  y: [-10, 10, -10],
                  scale: [1, 1.25, 1]
                }}
                transition={{ 
                  duration: particle.duration, 
                  repeat: Infinity, 
                  delay: particle.delay,
                  ease: "easeInOut" 
                }}
                className="absolute rounded-full bg-cyan-300/40 shadow-[0_0_8px_rgba(103,232,249,0.8)]"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: particle.left,
                  top: particle.top,
                }}
              />
            ))}
          </div>

          {/* Subtle Glassmorphic Card Container */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center p-10 md:p-14 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-sm w-full mx-4"
          >
            {/* Soft Edge Highlight Line */}
            <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
            <div className="absolute bottom-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

            {/* Emblem Section with Orbital Rings */}
            <div className="relative flex items-center justify-center my-4">
              {/* Outer Pulsing Glow behind Logo */}
              <motion.div 
                animate={{ 
                  scale: [0.95, 1.15, 0.95],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-28 h-28 bg-purple-500/20 rounded-full blur-xl -z-10"
              />

              {/* Orbital Outer Rotating Ring 1 */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-6 rounded-full border border-dashed border-cyan-400/25 pointer-events-none"
              />

              {/* Orbital Inner Rotating Ring 2 */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-10 rounded-full border border-transparent border-t-purple-400/30 border-b-fuchsia-400/20 pointer-events-none"
              />

              {/* Exismic Logo Mark */}
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <ExismicMark size={72} />
              </motion.div>
            </div>

            {/* Status & Phrase Text */}
            <div className="mt-8 flex flex-col items-center text-center space-y-4 w-full">
              <div className="h-6 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeText}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-zinc-200 font-medium tracking-[0.18em] uppercase text-xs flex items-center justify-center gap-2 drop-shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 opacity-80 animate-pulse" />
                    <span>{activeText}</span>
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Luxury Fluid Progress Indicator */}
              <div className="w-full max-w-[220px] h-[3px] bg-white/10 rounded-full overflow-hidden relative shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-purple-500 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                />
              </div>

              {/* Minimalist Subtitle Branding */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-2 flex items-center gap-2"
              >
                <span className="h-[1px] w-5 bg-gradient-to-r from-transparent to-zinc-700" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-zinc-500">
                  Exismic
                </span>
                <span className="h-[1px] w-5 bg-gradient-to-l from-transparent to-zinc-700" />
              </motion.div>
            </div>
          </motion.div>

          {/* Vignette Subtle Edge Shadow */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.7)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
