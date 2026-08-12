"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  X, 
  FileImage, 
  Maximize, 
  Download, 
  Sliders, 
  ChevronDown, 
  AlertCircle,
  RefreshCw,
  Palette,
  Eye,
  Settings,
  Check
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import axios from "axios";
import { detectVectorizerCapabilities, processVectorizeLocally } from "@/lib/client-vectorizer";

const TURN_POLICIES = [
  { value: "minority", label: "Minority", desc: "Smoothest lines & soft curves" },
  { value: "majority", label: "Majority", desc: "Standard curves & balanced corners" },
  { value: "black", label: "Black", desc: "Tight outline corners & sharp darks" },
  { value: "white", label: "White", desc: "Open outline curves & light emphasis" },
  { value: "right", label: "Right-hand", desc: "Right-turn geometry priority" },
  { value: "left", label: "Left-hand", desc: "Left-turn geometry priority" },
];

const TRACE_STEPS = [
  { title: "Upload Image", desc: "Drop your logo, drawing, or raster graphic (PNG, JPG, or WEBP)." },
  { title: "Tune Details", desc: "Adjust the threshold slider to catch clean lines and suppress noise." },
  { title: "Choose Colors", desc: "Select a custom color for vector paths, or set a solid background." },
  { title: "Download SVG", desc: "Export your infinite-resolution vector file directly to your desktop." }
];

export default function SvgVectorizer() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [svgOutput, setSvgOutput] = useState<string | null>(null);
  
  // Customization controls
  const [threshold, setThreshold] = useState(128);
  const [color, setColor] = useState("#000000");
  const [background, setBackground] = useState("transparent");
  const [turnPolicy, setTurnPolicy] = useState("minority");
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean URLs on unmount
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploaded = acceptedFiles[0];
    if (!uploaded) return;
    
    setError(null);
    setSvgOutput(null);
    setFile(uploaded);
    
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(URL.createObjectURL(uploaded));
  }, [originalUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false
  });

  const handleVectorize = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    const isCapable = detectVectorizerCapabilities(file);
    let resultSvg: string | null = null;

    // 1. Attempt instant client-side vectorization if device & image capabilities pass
    if (isCapable) {
      try {
        console.log("[Vectorizer Tool] Device & image capability verified. Tracing SVG locally...");
        resultSvg = await processVectorizeLocally(
          file,
          { threshold, color, background, turnPolicy },
          10000
        );
      } catch (clientErr) {
        console.warn("[Vectorizer Tool] Client-side vectorization failed/timed out. Falling back to server API:", clientErr);
        resultSvg = null;
      }
    }

    // 2. Server API fallback if device is weak, image is large, or client execution failed/timed out
    if (!resultSvg) {
      try {
        console.log("[Vectorizer Tool] Processing vector trace via cloud API fallback...");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("threshold", threshold.toString());
        formData.append("color", color);
        formData.append("background", background);
        formData.append("turnPolicy", turnPolicy);

        const response = await axios.post("/api/tools/image/vectorizer", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        resultSvg = response.data;
      } catch (err: any) {
        console.error("[Vectorizer Tool] Cloud API fallback error:", err);
        const errMsg = err.response?.data?.error || err.message || "Failed to trace image contours.";
        setError(errMsg);
      }
    }

    if (resultSvg) {
      setSvgOutput(resultSvg);
    }

    setIsProcessing(false);
  };

  // Run automatically when sliders change and a file is active
  useEffect(() => {
    if (file) {
      const timer = setTimeout(() => {
        handleVectorize();
      }, 400); // debounce API calls
      return () => clearTimeout(timer);
    }
  }, [file, threshold, color, background, turnPolicy]);

  const handleDownload = () => {
    if (!svgOutput || !file) return;
    const blob = new Blob([svgOutput], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}_vectorized.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Main Work Area */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Upload Dropzone */}
          {!file ? (
            <motion.div
              key="empty"
              {...(getRootProps() as unknown as import("framer-motion").HTMLMotionProps<"div">)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className={cn(
                "relative min-h-[420px] rounded-3xl border-2 border-dashed bg-zinc-950/80 p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group overflow-hidden shadow-2xl backdrop-blur-xl",
                isDragActive ? "border-cyan-400/60 bg-cyan-400/5 scale-[0.99] shadow-[0_0_50px_rgba(34,211,238,0.15)]" : "border-white/15 hover:border-cyan-400/40 hover:bg-cyan-400/[0.02]"
              )}
            >
              <input {...getInputProps()} />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="relative size-24 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shadow-2xl text-cyan-300 group-hover:scale-110 transition-transform duration-500">
                  <FileImage className={cn("w-10 h-10 transition-colors duration-300", isDragActive ? "text-cyan-300" : "text-cyan-400 group-hover:text-white")} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase italic py-1 leading-normal">
                    Choose Raster <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-extrabold pb-1 inline-block">Graphic</span>
                  </h3>
                  <p className="text-zinc-400 font-medium text-xs">Drag & drop logo, sketch, or raster photo (PNG, JPG, WEBP up to 10MB)</p>
                </div>
                
                <div className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-xl group-hover:scale-105 transition-transform duration-300">
                  Select Image File
                </div>
              </div>
            </motion.div>
          ) : (
            
            /* Image active preview workspace */
            <motion.div 
              key="workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-zinc-950/80 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden">
                
                {/* File info header */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/50 border border-white/10">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 shrink-0">
                      <FileImage size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white truncate uppercase tracking-wider">{file.name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB · Bitmap Input
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dual side-by-side comparison screen */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Original */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <Eye size={13} className="text-zinc-500" /> Original Bitmap
                    </span>
                    <div className="h-72 w-full bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] bg-black/60 border border-white/10 rounded-2xl flex items-center justify-center p-6 overflow-hidden relative">
                      {originalUrl && (
                        <img 
                          src={originalUrl} 
                          alt="Original Raster" 
                          className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                        />
                      )}
                    </div>
                  </div>

                  {/* Right: SVG Vector Traced */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest px-1 flex items-center gap-2">
                      <RefreshCw size={13} className={cn("text-cyan-400", isProcessing && "animate-spin")} /> 
                      Traced Vector SVG
                    </span>
                    <div className="h-72 w-full bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] bg-black/60 border border-cyan-400/30 rounded-2xl flex items-center justify-center p-6 overflow-hidden relative shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                      {svgOutput ? (
                        <div 
                          className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto"
                          dangerouslySetInnerHTML={{ __html: svgOutput }}
                        />
                      ) : (
                        <div className="text-zinc-400 text-xs font-bold flex flex-col items-center gap-3">
                          {isProcessing ? (
                            <>
                              <RefreshCw className="animate-spin text-cyan-400" size={24} />
                              <span className="uppercase tracking-wider">Tracing vector paths...</span>
                            </>
                          ) : (
                            <span className="uppercase tracking-wider">Adjust controls to generate trace</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom controls panel */}
                <div className="border border-white/10 rounded-2xl bg-black/40">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="w-full flex items-center justify-between p-5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Settings size={18} className="text-cyan-400" />
                      <span className="text-xs font-black uppercase tracking-widest">Trace Tuning Controls</span>
                    </div>
                    <ChevronDown size={18} className={cn("transition-transform duration-300 text-zinc-400", isSettingsOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isSettingsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-visible"
                      >
                        <div className="p-5 pt-0 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 relative z-20">
                          
                          {/* Threshold Slider & Presets */}
                          <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-950/60 p-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              <span>Brightness Threshold</span>
                              <span className="text-cyan-300 font-mono text-sm">{threshold}</span>
                            </div>
                            <input 
                              type="range"
                              min="0"
                              max="255"
                              value={threshold}
                              onChange={(e) => setThreshold(Number(e.target.value))}
                              className="w-full accent-cyan-400 h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                            />
                            
                            <div className="flex items-center justify-between gap-1.5 pt-1">
                              {[
                                { label: "Light (64)", val: 64 },
                                { label: "Balanced (128)", val: 128 },
                                { label: "Dark (192)", val: 192 },
                              ].map((p) => (
                                <button
                                  key={p.val}
                                  type="button"
                                  onClick={() => setThreshold(p.val)}
                                  className={cn(
                                    "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer",
                                    threshold === p.val
                                      ? "bg-cyan-400/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                                      : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                                  )}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Corner Geometry Policy Grid Selector */}
                          <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-950/60 p-4 col-span-1 md:col-span-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              <span>Corner Geometry Policy</span>
                              <span className="text-cyan-300 font-bold uppercase">
                                {TURN_POLICIES.find(p => p.value === turnPolicy)?.label}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {TURN_POLICIES.map((p) => (
                                <button
                                  key={p.value}
                                  type="button"
                                  onClick={() => setTurnPolicy(p.value)}
                                  className={cn(
                                    "flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer",
                                    turnPolicy === p.value
                                      ? "bg-cyan-400/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="text-[10px] font-black uppercase tracking-wider">{p.label}</span>
                                    {turnPolicy === p.value && <Check size={12} className="text-cyan-300 shrink-0" />}
                                  </div>
                                  <span className="text-[8px] text-zinc-400 font-bold mt-1 line-clamp-1">{p.desc}</span>
                                </button>
                              ))}
                            </div>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase block pt-0.5">Determines path corner smoothing strategy for vector outlines</span>
                          </div>

                          {/* Color Selector */}
                          <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-950/60 p-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              <span>Vector Path Color</span>
                              <span className="text-cyan-300 font-mono font-bold uppercase">{color}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <input 
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="size-9 rounded-lg bg-transparent border border-white/20 cursor-pointer overflow-hidden outline-none shrink-0"
                              />
                              <div className="flex flex-wrap gap-1.5">
                                {["#000000", "#ffffff", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#a855f7"].map((c) => (
                                  <button 
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={cn(
                                      "size-6 rounded-full border border-white/20 transition-transform active:scale-90 cursor-pointer",
                                      color === c && "ring-2 ring-cyan-400 scale-110"
                                    )}
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Background Selection */}
                          <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-950/60 p-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">SVG Canvas Background</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { id: "transparent", label: "Transparent" },
                                { id: "#ffffff", label: "White" },
                                { id: "#000000", label: "Black" }
                              ].map((bg) => (
                                <button
                                  key={bg.id}
                                  type="button"
                                  onClick={() => setBackground(bg.id)}
                                  className={cn(
                                    "flex-1 min-w-[90px] py-2 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center whitespace-nowrap",
                                    background === bg.id 
                                      ? "bg-cyan-400/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                                  )}
                                >
                                  {bg.label}
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit / Download Actions */}
                <div className="pt-2 flex justify-end gap-4 relative z-10">
                  <button
                    onClick={handleDownload}
                    disabled={!svgOutput || isProcessing}
                    className={cn(
                      "w-full md:w-auto flex min-h-12 items-center justify-center gap-3 rounded-xl px-8 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition hover:brightness-110 active:scale-98 cursor-pointer",
                      "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-cyan-500/20",
                      "disabled:opacity-30 disabled:cursor-not-allowed"
                    )}
                  >
                    <Download size={18} />
                    Download Vector SVG
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar Info Pane */}
        <div className="xl:col-span-4 space-y-8">
          <PdfSidebar 
            accentColor="text-cyan-400"
            steps={TRACE_STEPS}
            stats={file ? [
              { label: "File Format", value: file.type.split("/")[1]?.toUpperCase() || "Raster" },
              { label: "Traced Output", value: "Scalable Vector" },
              { label: "Engine", value: "Exismic Potrace" }
            ] : []}
          />

          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-[10px] font-bold flex items-start gap-4 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-1">
                <p className="uppercase tracking-[0.2em]">Trace Error</p>
                <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

