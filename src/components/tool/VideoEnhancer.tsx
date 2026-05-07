"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  Download, 
  Sparkles, 
  Loader2, 
  Zap, 
  Sliders, 
  ArrowRight,
  MousePointer2,
  Video,
  Settings2,
  ShieldCheck,
  Activity,
  Layers
} from "lucide-react";

type EnhancementLevel = "light" | "medium" | "strong";

export default function VideoEnhancer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [level, setLevel] = useState<EnhancementLevel>("medium");
  const [features, setFeatures] = useState({
    sharpen: true,
    noiseReduction: true,
    stabilize: false,
    colorCorrection: true,
    naturalLook: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoBeforeRef = useRef<HTMLVideoElement>(null);
  const videoAfterRef = useRef<HTMLVideoElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File is too large. Max 100MB for AI processing.");
        return;
      }
      setError(null);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setProgress(0);
      setSliderPos(50);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".mov", ".avi", ".webm"] },
    multiple: false,
  });

  // Sync Logic
  useEffect(() => {
    const v1 = videoBeforeRef.current;
    const v2 = videoAfterRef.current;
    if (!v1 || !v2) return;

    const sync = () => {
      if (Math.abs(v1.currentTime - v2.currentTime) > 0.05) {
        v2.currentTime = v1.currentTime;
      }
    };

    v1.addEventListener("play", () => v2.play());
    v1.addEventListener("pause", () => v2.pause());
    v1.addEventListener("seeking", sync);
    v1.addEventListener("timeupdate", sync);

    return () => {
      v1.removeEventListener("play", () => v2.play());
      v1.removeEventListener("pause", () => v2.pause());
      v1.removeEventListener("seeking", sync);
      v1.removeEventListener("timeupdate", sync);
    };
  }, [resultUrl, previewUrl]);

  // Mouse Move Logic
  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percent = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, percent)));
  };

  useEffect(() => {
    const stopDragging = () => setIsDragging(false);
    window.addEventListener("mousemove", handleMove as any);
    window.addEventListener("touchmove", handleMove as any);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchend", stopDragging);
    return () => {
      window.removeEventListener("mousemove", handleMove as any);
      window.removeEventListener("touchmove", handleMove as any);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchend", stopDragging);
    };
  }, [isDragging]);

  const handleEnhance = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(5);
    setStatus("Analyzing...");
    
    const formData = new FormData();
    formData.append("video", file);
    formData.append("level", level);
    formData.append("features", JSON.stringify(features));

    try {
      const response = await fetch("/api/tools/video/enhancer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Enhancement failed");
      }

      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
      setProgress(100);
      setStatus("Enhanced!");
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to enhance video");
      setStatus("Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setError(null);
    setIsProcessing(false);
    setProgress(0);
    setSliderPos(50);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            {...getRootProps()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "h-[500px] rounded-[4rem] border-2 border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-all group overflow-hidden relative",
              isDragActive && "border-purple-500 bg-purple-500/5"
            )}
          >
            <input {...getInputProps()} />
            <div className="p-10 rounded-full bg-white/5 mb-8 border border-white/5 relative z-10">
              <Upload className="w-16 h-16 text-gray-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-white relative z-10 tracking-tightest">Drop Video for AI Enhancement</h3>
            <p className="text-gray-500 text-lg mt-4 max-w-md text-center relative z-10 uppercase tracking-widest font-bold text-[10px]">Professional AI Processing Engine</p>
            
            {error && (
              <div className="absolute bottom-10 px-8 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 rotate-180" />
                {error}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            {/* Main Stage */}
            <div className="xl:col-span-8 space-y-8">
              <div 
                ref={containerRef}
                className="relative aspect-video rounded-[3rem] overflow-hidden bg-black border border-white/10 shadow-2xl group select-none"
              >
                {/* 
                   ABSOLUTE PIXEL ALIGNMENT:
                   Both videos are positioned identically using absolute centering.
                   This ensures that letterboxed videos (videos with black bars) 
                   stay perfectly aligned when swiping.
                */}
                
                {/* Layer 1: Original (Full) */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                  <video
                    ref={videoBeforeRef}
                    src={previewUrl!}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Layer 2: Enhanced (Clipped Right) */}
                {resultUrl && (
                  <div 
                    className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                  >
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                      <video
                        ref={videoAfterRef}
                        src={resultUrl}
                        className="w-full h-full object-contain"
                        muted
                      />
                    </div>
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-8 left-8 z-20 px-6 py-2.5 bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 pointer-events-none">
                   Original
                </div>
                {resultUrl && (
                  <div className="absolute top-8 right-8 z-20 px-6 py-2.5 bg-purple-600/90 backdrop-blur-xl rounded-2xl border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] text-white pointer-events-none shadow-2xl">
                     Enhanced
                  </div>
                )}

                {/* Draggable Slider Engine */}
                {resultUrl && (
                  <div 
                    className="absolute top-0 bottom-0 z-30 w-[2px] bg-white cursor-col-resize shadow-[0_0_20px_rgba(255,255,255,1)]"
                    style={{ left: `${sliderPos}%` }}
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white/10 group-hover:scale-110 transition-transform">
                       <MousePointer2 className="w-5 h-5 text-black rotate-90" />
                    </div>
                  </div>
                )}

                {/* Processing State */}
                {isProcessing && (
                  <div className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center">
                    <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-8" />
                    <h4 className="text-3xl font-black text-white uppercase italic tracking-tightest mb-6">{status}</h4>
                    <div className="w-full max-w-sm h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         className="h-full bg-purple-50"
                         initial={{ width: 0 }}
                         animate={{ width: "100%" }}
                         transition={{ duration: 30 }}
                       />
                    </div>
                  </div>
                )}
              </div>

              {/* Engine Output Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Stability", value: features.stabilize ? "Gimbal Locked" : "Raw Stream", icon: Zap, color: "text-blue-400" },
                  { label: "Signal Purity", value: features.noiseReduction ? "Crystal Clean" : "Standard", icon: Activity, color: "text-emerald-400" },
                  { label: "Enhanced Detail", value: resultUrl ? (level === "strong" ? "+60% Boost" : level === "medium" ? "+35% Refined" : "+15% Natural") : "Analyzing", icon: Layers, color: "text-purple-400" },
                ].map((stat, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn("p-2 rounded-xl bg-black/40", stat.color)}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Configurations */}
            <div className="xl:col-span-4 space-y-8">
              <div className="bg-white/[0.03] border border-white/10 rounded-[3.5rem] p-10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-2xl font-black uppercase tracking-tight italic">Engine Studio</h3>
                   <Settings2 className="w-6 h-6 text-purple-400" />
                </div>

                <div className="space-y-12">
                  {/* Mode Toggles */}
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Processing Mode</label>
                    <button
                      onClick={() => setFeatures(prev => ({ ...prev, naturalLook: !prev.naturalLook }))}
                      disabled={isProcessing || !!resultUrl}
                      className={cn(
                        "w-full flex items-center justify-between p-6 rounded-3xl border transition-all duration-500",
                        features.naturalLook ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/[0.02] border-white/5 text-gray-500"
                      )}
                    >
                       <div className="flex items-center gap-4 text-left">
                          <ShieldCheck className="w-6 h-6" />
                          <div>
                             <p className="text-sm font-black uppercase tracking-widest">Natural Look</p>
                             <p className="text-[10px] font-medium opacity-60 italic">Prevents artifacts</p>
                          </div>
                       </div>
                       <div className={cn("w-2 h-2 rounded-full", features.naturalLook ? "bg-emerald-400 animate-pulse" : "bg-white/10")} />
                    </button>
                  </div>

                  {/* Intensity Selection */}
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Intensity Depth</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["light", "medium", "strong"] as EnhancementLevel[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLevel(l)}
                          disabled={isProcessing || !!resultUrl}
                          className={cn(
                            "py-5 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                            level === l ? "bg-purple-600 border-purple-500 text-white shadow-2xl scale-105" : "bg-white/[0.02] border-white/5 text-gray-500"
                          )}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Modules Grid */}
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">AI Modules</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "sharpen", label: "Sharpen", icon: Sparkles },
                        { id: "noiseReduction", label: "Denoise", icon: Video },
                        { id: "stabilize", label: "Gimbal", icon: Zap },
                        { id: "colorCorrection", label: "Color", icon: Layers },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFeatures(prev => ({ ...prev, [f.id]: !prev[f.id as keyof typeof features] }))}
                          disabled={isProcessing || !!resultUrl}
                          className={cn(
                            "flex flex-col items-center justify-center p-6 rounded-3xl border transition-all gap-3",
                            features[f.id as keyof typeof features] ? "bg-purple-600/10 border-purple-500/30 text-white" : "bg-white/[0.02] border-white/5 text-gray-500"
                          )}
                        >
                           <f.icon className="w-5 h-5" />
                           <span className="text-[9px] font-black uppercase tracking-widest">{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Final Actions */}
                  <div className="pt-6">
                    {!resultUrl ? (
                      <button
                        onClick={handleEnhance}
                        disabled={!file || isProcessing}
                        className="w-full group px-10 py-7 bg-white text-black rounded-[2.5rem] font-black text-lg uppercase tracking-[0.3em] hover:bg-purple-50 transition-all shadow-2xl disabled:opacity-50"
                      >
                        <div className="flex items-center justify-center gap-4">
                           <span>Enhance Video</span>
                           <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </button>
                    ) : (
                      <div className="space-y-6">
                        <a
                          href={resultUrl}
                          download={`enhanced_${file.name}`}
                          className="w-full flex items-center justify-center gap-4 py-7 bg-purple-600 text-white font-black rounded-[2.5rem] hover:bg-purple-500 transition-all shadow-[0_20px_60px_-10px_rgba(168,85,247,0.5)] uppercase tracking-widest"
                        >
                          <Download className="w-6 h-6" />
                          Download HD
                        </a>
                        <button
                          onClick={reset}
                          className="w-full py-4 text-zinc-600 font-black text-[11px] uppercase tracking-[0.4em] hover:text-white transition-colors"
                        >
                          New Session
                        </button>
                      </div>
                    )}

                    {error && (
                      <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 text-xs font-bold flex items-start gap-4">
                        <ShieldCheck className="w-5 h-5 rotate-180 shrink-0" />
                        <div className="space-y-1">
                           <p className="uppercase tracking-widest">Processing Error</p>
                           <p className="font-medium opacity-80 leading-relaxed">{error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
