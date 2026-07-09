"use client";

import React from "react";
import VideoEnhancer from "@/components/tool/VideoEnhancer";
import { motion } from "framer-motion";
import { Maximize } from "lucide-react";

export default function VideoEnhancerPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-16 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="p-5 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl"
            >
              <Maximize className="w-12 h-12 text-purple-400" />
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tightest bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                Video Enhancer
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                Restore clarity, eliminate noise, and stabilize shaky footage with professional FFmpeg neural filters.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                Multi-Pass Processing
              </div>
              <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Smart Stabilization
              </div>
            </div>
          </motion.div>
        </header>

        <main>
          <VideoEnhancer />
        </main>
      </div>

      <footer className="mt-20 text-center pb-12">
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
          Powered by Exismic Neural Processing Units
        </p>
      </footer>
    </div>
  );
}
