"use client";

import React from "react";
import VideoTrimmer from "@/components/tool/VideoTrimmer";
import { motion } from "framer-motion";
import { Scissors } from "lucide-react";

export default function VideoTrimmerPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-16 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="p-5 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl"
            >
              <Scissors className="w-12 h-12 text-blue-400" />
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tightest bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                Video Trimmer
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                Professional-grade video cutting tool. Trim your videos with frame-accurate precision directly in your browser.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                No Watermark
              </div>
              <div className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                HD Quality
              </div>
            </div>
          </motion.div>
        </header>

        <main>
          <VideoTrimmer />
        </main>
      </div>

      {/* Footer / Status */}
      <footer className="mt-20 text-center pb-12">
        <p className="text-gray-600 text-sm font-medium">
          Powered by Lumora High-Performance Engine
        </p>
      </footer>
    </div>
  );
}
