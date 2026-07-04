"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { readVideoResponse } from "@/lib/video-client";
import { 
  Download, 
  Loader2, 
  Settings2, 
  ArrowRight,
  Image as ImageIcon,
  Zap,
  AlertCircle,
  Scissors
} from "lucide-react";

export default function VideoToGif() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("lumora-animation.gif");
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [width, setWidth] = useState(480);
  const [fps, setFps] = useState(15);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 180 * 1024 * 1024) {
        setError("File is too large. Maximum size is 180 MB.");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".mov", ".avi", ".webm"] },
    multiple: false,
  });

  const handleMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const d = e.currentTarget.duration;
    setDuration(d);
    setEndTime(d > 5 ? 5 : d); // Default to first 5 seconds
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatus("Rendering a palette-optimized GIF...");
    setError(null);

    const gifDuration = endTime - startTime;

    const formData = new FormData();
    formData.append("video", file);
    formData.append("start", startTime.toString());
    formData.append("duration", gifDuration.toString());
    formData.append("fps", fps.toString());
    formData.append("width", width.toString());

    try {
      const response = await fetch("/api/tools/video/to-gif", {
        method: "POST",
        body: formData,
      });
      const artifact = await readVideoResponse(response, "lumora-animation.gif");
      setResultUrl(artifact.url);
      setResultFileName(artifact.fileName);
      setStatus("GIF ready");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create GIF");
      setStatus("Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultFileName("lumora-animation.gif");
    setError(null);
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-12 pb-24">
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
            <div className="p-10 rounded-full bg-white/5 mb-8 border border-white/5">
              <ImageIcon className="w-16 h-16 text-gray-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-white tracking-tightest">Video to GIF Studio</h3>
            <p className="text-gray-500 text-lg mt-4 max-w-md text-center font-medium uppercase tracking-[0.2em] text-[10px]">High-Quality Palette Optimized GIFs</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            {/* Main Stage */}
            <div className="xl:col-span-8 space-y-8">
              <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-xl shadow-2xl relative">
                <div className="p-8 md:p-12">
                  {!resultUrl ? (
                    <div className="space-y-10">
                       <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-white/5 shadow-2xl">
                          <video
                            ref={videoRef}
                            src={previewUrl!}
                            onLoadedMetadata={handleMetadata}
                            controls
                            className="w-full h-full object-contain"
                          />
                       </div>
                       
                       {/* Timeline Selector */}
                       <div className="space-y-6">
                          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-zinc-500">
                             <div className="flex items-center gap-2">
                                <Scissors className="w-3 h-3" />
                                <span>Clip Range</span>
                             </div>
                             <span className="text-white">{(endTime - startTime).toFixed(1)}s Selected</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">Start Time (sec)</label>
                                <input 
                                  type="number" 
                                  value={startTime} 
                                  onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value)))}
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-purple-500 transition-all"
                                  step="0.1"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">End Time (sec)</label>
                                <input 
                                  type="number" 
                                  value={endTime} 
                                  onChange={(e) => setEndTime(Math.min(duration, parseFloat(e.target.value)))}
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-purple-500 transition-all"
                                  step="0.1"
                                />
                             </div>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-10 py-10">
                       <div className="relative group">
                          {/* Blob-backed GIF previews cannot use Next Image optimization. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resultUrl} 
                            alt="Generated GIF" 
                            className="max-w-full rounded-3xl border border-white/10 shadow-2xl"
                          />
                          <div className="absolute top-4 right-4 px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl">
                             Optimized GIF
                          </div>
                       </div>
                       
                       <div className="flex flex-col items-center gap-4">
                          <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Ready for Export</h4>
                          <p className="text-gray-500 text-sm font-medium">Your GIF has been generated with a custom 256-color palette.</p>
                       </div>
                    </div>
                  )}
                </div>

                {/* Processing Overlay */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center"
                    >
                      <Loader2 className="w-16 h-16 text-purple-500 animate-spin mb-8" />
                      <h4 className="text-3xl font-black text-white uppercase italic tracking-tightest mb-6">{status}</h4>
                      <div className="w-full max-w-sm h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <motion.div
                           className="h-full w-2/5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                           animate={{ x: ["-110%", "250%"] }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                         />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="xl:col-span-4 space-y-8">
              <div className="bg-white/[0.03] border border-white/10 rounded-[3.5rem] p-10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-2xl font-black uppercase tracking-tight italic">GIF Export</h3>
                   <Settings2 className="w-6 h-6 text-purple-400" />
                </div>

                <div className="space-y-12">
                  {/* Resolution Selection */}
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Target Resolution</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[320, 480, 640].map((w) => (
                        <button
                          key={w}
                          onClick={() => setWidth(w)}
                          disabled={isProcessing || !!resultUrl}
                          className={cn(
                            "py-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                            width === w ? "bg-purple-600 border-purple-500 text-white shadow-xl" : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"
                          )}
                        >
                          {w}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FPS Slider */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Frame Rate</label>
                       <span className="text-white font-black text-xs">{fps} FPS</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="30" 
                      value={fps} 
                      onChange={(e) => setFps(parseInt(e.target.value))}
                      disabled={isProcessing || !!resultUrl}
                      className="w-full accent-purple-500"
                    />
                    <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest">
                       <span>Slow / Small</span>
                       <span>Smooth / Large</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6">
                    {!resultUrl ? (
                      <button
                        onClick={handleConvert}
                        disabled={!file || isProcessing}
                        className="w-full relative overflow-hidden group px-10 py-7 bg-white text-black rounded-[2.5rem] font-black text-lg uppercase tracking-[0.2em] hover:bg-purple-50 transition-all shadow-2xl disabled:opacity-50"
                      >
                        <div className="relative z-10 flex items-center justify-center gap-4">
                           <span>Create GIF</span>
                           <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </button>
                    ) : (
                      <div className="space-y-6">
                        <a
                          href={resultUrl}
                          download={resultFileName}
                          className="w-full flex items-center justify-center gap-4 py-7 bg-purple-600 text-white font-black rounded-[2.5rem] hover:bg-purple-500 transition-all shadow-2xl shadow-purple-600/30 uppercase tracking-widest"
                        >
                          <Download className="w-6 h-6" />
                          Download GIF
                        </a>
                        <button
                          onClick={reset}
                          className="w-full py-4 text-zinc-600 font-black text-[11px] uppercase tracking-[0.4em] hover:text-white transition-colors"
                        >
                          New Conversion
                        </button>
                      </div>
                    )}

                    {error && (
                      <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 text-xs font-bold flex items-start gap-4">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <div className="space-y-1">
                           <p className="uppercase tracking-widest">Conversion Error</p>
                           <p className="font-medium opacity-80 leading-relaxed">{error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Engine Badge */}
              <div className="p-8 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 flex gap-5 items-center">
                 <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                    <Zap className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Optimized Palette</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Sierra2 Dithering Active</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
