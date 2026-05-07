"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  isLoading?: boolean;
  text?: string;
  className?: string;
}

/**
 * Lumora Premium Loader
 * A smooth, modern loading screen with the Lumora "L" logo and glowing effects.
 */
export const Loader = ({ 
  isLoading = true, 
  text = "Preparing your tools...", 
  className 
}: LoaderProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent scrolling when loader is active
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoading]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          suppressHydrationWarning
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030303] overflow-hidden",
            className
          )}
        >
          {/* Background Ambient Glows */}
          <div suppressHydrationWarning className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-purple/10 blur-[120px] rounded-full pointer-events-none" />
          <div suppressHydrationWarning className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-blue/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative flex flex-col items-center">
            {/* Logo Section */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.98, 1.02, 0.98],
                opacity: 1 
              }}
              transition={{
                scale: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                opacity: { duration: 0.8, ease: "easeOut" }
              }}
              className="relative"
            >
              {/* Outer Glow Ring */}
              <motion.div 
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-accent-purple/20 blur-2xl rounded-3xl -z-10"
              />

              <div className="w-24 h-24 rounded-[2rem] premium-gradient flex items-center justify-center p-[3px] shadow-[0_0_60px_rgba(124,58,237,0.25)] relative overflow-hidden group">
                {/* Internal Shimmer */}
                <div className="absolute inset-0 shimmer opacity-30" />
                
                <div className="w-full h-full bg-[#030303] rounded-[1.85rem] flex items-center justify-center relative z-10">
                  <span className="text-white font-black text-5xl font-mono leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">L</span>
                </div>
              </div>
              
              <motion.div 
                suppressHydrationWarning
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-6 border-2 border-transparent border-t-accent-purple/20 border-b-accent-blue/20 rounded-full opacity-60"
              />
              
              <motion.div 
                suppressHydrationWarning
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-10 border border-transparent border-l-accent-cyan/10 border-r-accent-purple/10 rounded-full opacity-40"
              />
            </motion.div>

            {/* Loading Content */}
            <div className="mt-20 flex flex-col items-center space-y-6">
              <div className="space-y-2 text-center">
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-zinc-400 font-medium tracking-[0.2em] uppercase text-xs"
                >
                  {text}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center gap-1"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 bg-accent-purple rounded-full"
                    />
                  ))}
                </motion.div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-64 h-[1px] bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-purple to-transparent opacity-100"
                />
              </div>
              
              {/* Subtle Branding */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1 }}
                className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600"
              >
                Powered by Lumora AI
              </motion.span>
            </div>
          </div>

          {/* Environmental Effects */}
          <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
          <div className="absolute inset-0 grain opacity-[0.03] pointer-events-none" />
          
          {/* Edge Glows */}
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-accent-purple/20 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-accent-blue/20 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
