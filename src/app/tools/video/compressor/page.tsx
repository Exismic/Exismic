"use client";

import React from "react";
import VideoCompressor from "@/components/tool/VideoCompressor";
import { motion } from "framer-motion";
import { FileArchive } from "lucide-react";

export default function VideoCompressorPage() {
  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-6 pt-24 font-sans text-white selection:bg-emerald-500/30 sm:px-6 md:px-12 md:pb-12 md:pt-28" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-16 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="p-5 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl"
            >
              <FileArchive className="w-12 h-12 text-emerald-400" />
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tightest bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent sm:text-5xl md:text-7xl">
                Video Compressor
              </h1>
              <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-gray-400 sm:text-lg md:text-xl">
                Shrink your video files by up to 90% without losing quality. Perfect for Discord, WhatsApp, and email attachments.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                High Fidelity
              </div>
              <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                H.264 / VP9
              </div>
            </div>
          </motion.div>
        </header>

        <main>
          <VideoCompressor />
        </main>
      </div>

      <footer className="mt-20 text-center pb-12">
        <p className="text-gray-600 text-sm font-medium">
          Powered by Exismic Serverless Processing
        </p>
      </footer>
    </div>
  );
}
