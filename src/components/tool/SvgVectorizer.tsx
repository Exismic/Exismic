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
  Settings
} from "lucide-react";
import { PdfSidebar } from "./pdf/PdfSidebar";
import axios from "axios";

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("threshold", threshold.toString());
    formData.append("color", color);
    formData.append("background", background);
    formData.append("turnPolicy", turnPolicy);

    try {
      const response = await axios.post("/api/tools/image/vectorizer", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setSvgOutput(response.data);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || "Failed to trace image contours.";
      setError(errMsg);
    } finally {
      setIsProcessing(false);
    }
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
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Main Work Area */}
        <div className="xl:col-span-8 space-y-10">
          
          {/* Upload Dropzone */}
          {!file ? (
            <motion.div
              key="empty"
              {...(getRootProps() as unknown as import("framer-motion").HTMLMotionProps<"div">)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className={cn(
                "relative h-[480px] rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-md flex flex-col items-center justify-center cursor-pointer transition-all duration-700 group overflow-hidden shadow-3xl",
                isDragActive ? "border-accent-blue/50 bg-accent-blue/[0.02] scale-[0.99] shadow-[0_0_50px_rgba(59,130,246,0.15)]" : "hover:bg-white/[0.02] hover:border-white/10 hover:shadow-[0_0_50px_rgba(255,255,255,0.01)]"
              )}
            >
              <input {...getInputProps()} />
              
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.04)_0%,transparent_60%)] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute -inset-px bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[3.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <div className="relative w-28 h-28 rounded-[2.2rem] bg-zinc-950/80 border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:-rotate-3 group-hover:border-accent-blue/30 transition-all duration-700 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <FileImage className={cn("w-10 h-10 transition-all duration-500", isDragActive ? "text-accent-blue" : "text-zinc-500 group-hover:text-white group-hover:scale-110")} />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic transition-all duration-500 group-hover:tracking-normal">
                    Image <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 font-extrabold">Vectorizer</span>
                  </h3>
                  <p className="text-zinc-500 font-medium text-xs uppercase tracking-widest text-[9px]">Select or drop your PNG / JPG / WEBP image</p>
                </div>
                
                <div className="px-10 py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl group-hover:scale-105 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-500">
                  Select Image
                </div>
              </div>
            </motion.div>
          ) : (
            
            // Image active preview workspace
            <motion.div 
              key="workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-white/[0.01] border border-white/10 rounded-[3.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-3xl space-y-10 relative overflow-hidden group">
                
                {/* Header controls */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic flex items-center gap-4">
                      <div className="p-2 bg-accent-blue/10 rounded-xl"><Maximize className="w-5 h-5 text-accent-blue" /></div>
                      Vectorizer Workspace
                    </h3>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-14">Live trace preview comparison</p>
                  </div>
                  <button 
                    onClick={() => { setFile(null); setSvgOutput(null); setOriginalUrl(null); setError(null); }}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:text-white hover:rotate-90 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8 relative z-10">
                  {/* File preview */}
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-zinc-950/40 border border-white/5 hover:border-white/10 transition-all duration-300">
                    <div className="flex items-center gap-4 min-w-0">
                      <FileImage className="w-8 h-8 text-accent-blue shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                          {(file.size / 1024).toFixed(1)} KB · BITMAP IMAGE
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dual side-by-side comparison screen */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Original */}
                    <div className="space-y-3">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        <Eye size={12} /> Original Bitmap
                      </span>
                      <div className="h-72 w-full bg-zinc-950/60 border border-white/5 rounded-3xl flex items-center justify-center p-6 overflow-hidden relative">
                        {originalUrl && (
                          <img 
                            src={originalUrl} 
                            alt="Original Raster" 
                            className="max-h-full max-w-full object-contain rounded-lg"
                          />
                        )}
                      </div>
                    </div>

                    {/* Right: SVG Vector Traced */}
                    <div className="space-y-3">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        <RefreshCw size={12} className={cn(isProcessing && "animate-spin")} /> 
                        Vector SVG Trace
                      </span>
                      <div className="h-72 w-full bg-zinc-950/60 border border-white/5 rounded-3xl flex items-center justify-center p-6 overflow-hidden relative">
                        {svgOutput ? (
                          <div 
                            className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto text-current"
                            dangerouslySetInnerHTML={{ __html: svgOutput }}
                          />
                        ) : (
                          <div className="text-zinc-600 text-xs font-semibold flex flex-col items-center gap-3">
                            {isProcessing ? (
                              <>
                                <RefreshCw className="animate-spin text-accent-blue" size={24} />
                                <span>Tracing image contours...</span>
                              </>
                            ) : (
                              <span>Adjust settings to start trace</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Custom controls panel */}
                  <div className="border border-white/5 rounded-[2rem] bg-zinc-950/30 overflow-hidden">
                    <button
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                      className="w-full flex items-center justify-between p-6 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Settings size={16} className="text-accent-blue animate-spin-slow" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Trace Tuning Controls</span>
                      </div>
                      <ChevronDown size={16} className={cn("transition-transform duration-300", isSettingsOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isSettingsOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-0 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            
                            {/* Threshold Slider */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                <span>Brightness Threshold</span>
                                <span className="text-accent-blue font-bold">{threshold}</span>
                              </div>
                              <input 
                                type="range"
                                min="0"
                                max="255"
                                value={threshold}
                                onChange={(e) => setThreshold(Number(e.target.value))}
                                className="w-full accent-accent-blue h-1 bg-white/10 rounded-full appearance-none cursor-pointer focus:outline-none"
                              />
                              <span className="text-[8px] font-semibold text-zinc-600 uppercase block">Lower values trace lighter colors · Higher traces darks only</span>
                            </div>

                            {/* Turn Policy Dropdown */}
                            <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Corner Policy (Geometry)</label>
                              <select
                                value={turnPolicy}
                                onChange={(e) => setTurnPolicy(e.target.value)}
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-zinc-400 font-bold focus:border-accent-blue/30 outline-none transition-all cursor-pointer"
                              >
                                <option value="minority">Minority (Smoothest lines)</option>
                                <option value="majority">Majority (Standard curves)</option>
                                <option value="black">Black (Tight outline corners)</option>
                                <option value="white">White (Open outline curves)</option>
                                <option value="right">Right-hand turns</option>
                                <option value="left">Left-hand turns</option>
                              </select>
                            </div>

                            {/* Color Selector */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                <span>Vector Path Color</span>
                                <span className="text-accent-blue font-bold uppercase">{color}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="color"
                                  value={color}
                                  onChange={(e) => setColor(e.target.value)}
                                  className="w-10 h-10 rounded-xl bg-transparent border border-white/10 cursor-pointer overflow-hidden outline-none"
                                />
                                <div className="flex gap-1.5">
                                  {["#000000", "#ffffff", "#3b82f6", "#ef4444", "#10b981", "#f59e0b"].map((c) => (
                                    <button 
                                      key={c}
                                      onClick={() => setColor(c)}
                                      className={cn(
                                        "w-5 h-5 rounded-full border border-white/10 transition-transform active:scale-90 cursor-pointer",
                                        color === c && "ring-2 ring-accent-blue"
                                      )}
                                      style={{ backgroundColor: c }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Background Selection */}
                            <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">SVG Canvas Background</label>
                              <div className="flex gap-3">
                                {["transparent", "#ffffff", "#000000"].map((bg) => (
                                  <button
                                    key={bg}
                                    onClick={() => setBackground(bg)}
                                    className={cn(
                                      "px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                                      background === bg 
                                        ? "bg-accent-blue/10 border-accent-blue/30 text-accent-blue"
                                        : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                                    )}
                                  >
                                    {bg === "transparent" ? "Transparent" : bg === "#ffffff" ? "White" : "Black"}
                                  </button>
                                ))}
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Submit / Download Actions */}
                <div className="pt-4 flex justify-end gap-4 relative z-10">
                  <button
                    onClick={handleDownload}
                    disabled={!svgOutput || isProcessing}
                    className={cn(
                      "w-full md:w-auto flex min-h-14 items-center justify-center gap-3 rounded-2xl px-10 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition hover:brightness-110 active:scale-98 cursor-pointer",
                      "bg-gradient-to-r from-blue-600 to-indigo-600",
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
            accentColor="text-accent-blue"
            steps={TRACE_STEPS}
            stats={file ? [
              { label: "File Format", value: file.type.split("/")[1]?.toUpperCase() || "Raster" },
              { label: "Traced Output", value: "Scalable Vector" },
              { label: "Engine", value: "Exismic Potrace" }
            ] : []}
          />

          {error && (
            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 text-[10px] font-bold flex items-start gap-4 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
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
