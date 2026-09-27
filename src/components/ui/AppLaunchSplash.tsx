"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { ExismicMark } from "@/components/ui/ExismicLogo";

interface AppLaunchSplashProps {
  onDismiss?: () => void;
}

/**
 * Exismic App Launch Splash
 * Instagram / Threads / Apple style initial bootup screen.
 * Displays only on the user's first visit per session, then never interrupts page navigation.
 */
export function AppLaunchSplash({ onDismiss }: AppLaunchSplashProps) {
  useEffect(() => {
    // Lock scroll during the brief launch reveal
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#030303] select-none cursor-default overflow-hidden pointer-events-auto"
      onClick={onDismiss}
    >
      {/* Background Soft Breathing Ambient Lights */}
      <motion.div
        animate={{
          scale: [0.95, 1.15, 0.95],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/15 to-cyan-500/20 blur-[130px] rounded-full pointer-events-none"
      />

      {/* Center Brand Hero */}
      <div className="relative flex flex-col items-center justify-center z-10 space-y-5">
        {/* Pulsing Aura Behind Emblem */}
        <div className="relative flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.95, 1.1, 0.95],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl"
          />

          <motion.div
            initial={{ scale: 0.86, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <ExismicMark size={84} animated={true} />
          </motion.div>
        </div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col items-center text-center space-y-1"
        >
          <span className="text-xl md:text-2xl font-black italic uppercase tracking-[0.32em] text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)] pl-[0.32em]">
            EXISMIC
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500 pl-[0.35em]">
            Digital Studio
          </span>
        </motion.div>

        {/* Shimmering Micro Horizon Line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 120, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent relative overflow-hidden"
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
          />
        </motion.div>
      </div>

      {/* Instagram-Style Bottom Brand Footer ("from Exismic Studio") */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="absolute bottom-10 inset-x-0 flex flex-col items-center justify-center text-center pointer-events-none"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-zinc-600 mb-1 pl-[0.35em]">
          from
        </span>
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)] pl-[0.3em]">
          Exismic Studio
        </span>
      </motion.div>

      {/* Ambient Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]" />
    </motion.div>
  );
}
