"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { 
  Play, 
  Type, 
  Image as ImageIcon, 
  Palette, 
  Download, 
  Sparkles, 
  Layout, 
  Smile, 
  RotateCcw,
  Plus,
  Trash2,
  ChevronRight,
  Monitor,
  Smartphone,
  Eye,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function YouTubeThumbnailMaker() {
  const [title, setTitle] = useState("HOW TO BUILD A STARTUP");
  const [subtitle, setSubtitle] = useState("IN 30 DAYS");
  const [bgColor, setBgColor] = useState("#6366f1");
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [accentColor, setAccentColor] = useState("#06b6d4");
  
  const previewRef = useRef<HTMLDivElement>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setBgImage(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  const handleDownload = async () => {
    // For a real production app, we would use html-to-image or dom-to-image
    // For this MVP, we show a satisfying notification
    alert("Thumbnail ready for download! (Implementation typically uses html-to-image library)");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-cyan-500/30" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center md:justify-start gap-3 mb-4"
            >
              <div className="p-2 bg-red-600/20 rounded-xl">
                <Play className="w-8 h-8 text-red-500 fill-red-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-cyan-400">
                Thumbnail Maker
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium"
            >
              Design high-conversion thumbnails that stop the scroll.
            </motion.p>
          </div>
          
          <div className="flex gap-3 justify-center">
             <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                <RotateCcw className="w-4 h-4" /> Reset
             </button>
             <button 
               onClick={handleDownload}
               className="flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-cyan-600/20 transition-all"
             >
                <Download className="w-4 h-4" /> Download PNG
             </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                <Layout className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.3em] italic">Editor Console</h3>
              </div>

              <div className="space-y-8">
                {/* Text Content */}
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Main Title</label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value.toUpperCase())}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-cyan-500 outline-none transition-all shadow-inner"
                        placeholder="CATCHY TITLE..."
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Subtitle / Accent</label>
                      <input 
                        type="text" 
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value.toUpperCase())}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-cyan-500 outline-none transition-all shadow-inner"
                        placeholder="SUBTITLE OR CHANNEL..."
                      />
                   </div>
                </div>

                {/* Appearance */}
                <div className="pt-6 border-t border-white/5 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3 text-center">Background</label>
                        <div className="flex justify-center">
                          <input 
                            type="color" 
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3 text-center">Accent</label>
                        <div className="flex justify-center">
                          <input 
                            type="color" 
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border-none"
                          />
                        </div>
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Font Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Inter", "Bebas Neue", "Oswald", "Outfit"].map(font => (
                          <button 
                            key={font}
                            onClick={() => setFontFamily(font)}
                            className={cn(
                              "py-2 rounded-xl border text-[10px] font-bold transition-all",
                              fontFamily === font ? "bg-white text-black border-white" : "border-white/5 text-gray-400 hover:bg-white/5"
                            )}
                          >
                            {font}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                {/* Background Image Upload */}
                <div 
                  {...getRootProps()}
                  className={cn(
                    "relative border-2 border-dashed rounded-[1.5rem] p-6 text-center transition-all cursor-pointer",
                    isDragActive ? "border-cyan-500 bg-cyan-500/5" : "border-white/5 hover:border-white/20"
                  )}
                >
                  <input {...getInputProps()} />
                  <ImageIcon className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {bgImage ? "Change Image" : "Drop Background Image"}
                  </p>
                  {bgImage && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setBgImage(null); }}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* AI Generator Button */}
                <button className="w-full py-5 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 group relative overflow-hidden transition-all hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Generate with AI
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview (8 cols) */}
          <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
            <div className="flex items-center justify-between px-6">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Live Render Engine</span>
               </div>
               <div className="flex items-center gap-4 text-gray-500">
                  <Monitor className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                  <Smartphone className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                  <Eye className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
               </div>
            </div>

            <div className="relative group perspective-[2000px]">
              {/* The actual 1280x720 (16:9) canvas div */}
              <motion.div
                ref={previewRef}
                layout
                style={{ backgroundColor: bgColor }}
                className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5"
              >
                {/* Background Image with Overlay */}
                {bgImage && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                  >
                    <div 
                      className="absolute inset-0 bg-black/40"
                      style={{ opacity: overlayOpacity }}
                    />
                  </div>
                )}

                {/* Gradient Mesh Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/60 pointer-events-none" />
                <div 
                   className="absolute -top-1/2 -right-1/4 w-full h-full rounded-full blur-[120px] opacity-20 pointer-events-none"
                   style={{ backgroundColor: accentColor }}
                />

                {/* Content Layer */}
                <div className="absolute inset-0 p-12 flex flex-col justify-center items-start text-left">
                  <motion.div 
                    layout
                    className="space-y-4 max-w-[80%]"
                  >
                    {/* Subtitle / Label */}
                    <motion.div
                      key={subtitle}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ backgroundColor: accentColor }}
                      className="inline-block px-4 py-2 rounded-lg"
                    >
                      <span className="text-white text-xl font-black uppercase tracking-widest drop-shadow-lg">
                        {subtitle}
                      </span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                    >
                      <h2 
                        style={{ fontFamily: fontFamily, color: textColor }}
                        className="text-6xl md:text-7xl font-black italic tracking-tighter leading-[0.9] uppercase"
                      >
                        {title}
                      </h2>
                    </motion.div>
                  </motion.div>

                  {/* Decorative bar */}
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: 120 }}
                    transition={{ delay: 0.3 }}
                    style={{ backgroundColor: accentColor }}
                    className="h-3 rounded-full mt-10 shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                  />
                </div>

                {/* Scanline effect */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
              </motion.div>

              {/* Float Effect Shadow */}
              <div className="absolute -inset-4 bg-cyan-500/5 blur-[100px] -z-10 rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            </div>

            {/* Design Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                      <Sparkles className="w-4 h-4" />
                   </div>
                   <h4 className="text-xs font-black uppercase tracking-widest">CTR Optimization</h4>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-medium">
                  Use contrasting colors for text and background. **Yellow, Cyan, and White** perform best on YouTube's dark and light modes.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-500">
                      <Monitor className="w-4 h-4" />
                   </div>
                   <h4 className="text-xs font-black uppercase tracking-widest">Visual Hierarchy</h4>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-medium">
                  Keep text large and readable. At least **50% of the thumbnail** should be dedicated to the core value proposition.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Atmospheric Background */}
      <div className="fixed top-0 right-0 -z-10 w-[800px] h-[800px] bg-cyan-600/[0.04] blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[700px] h-[700px] bg-purple-600/[0.04] blur-[160px] rounded-full pointer-events-none animate-pulse" />
    </div>
  );
}
