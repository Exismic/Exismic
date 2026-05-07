"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  FileArchive, 
  Upload, 
  X, 
  Play, 
  Download, 
  Zap, 
  CheckCircle2,
  ChevronRight,
  Loader2,
  Settings2,
  BarChart3,
  Monitor,
  AlertCircle,
  TrendingDown,
  Info
} from "lucide-react";

type Quality = "low" | "medium" | "high" | "ultra";

export default function VideoCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<Quality>("medium");
  const [format, setFormat] = useState<"mp4" | "webm">("mp4");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 200 * 1024 * 1024) {
        setError("File is too large. Maximum size is 200MB.");
        return;
      }
      setError(null);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setCompressedSize(null);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
    },
    multiple: false,
  });

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(10);
    setStatus("Analyzing bitrate...");
    setError(null);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("quality", quality);
    formData.append("format", format);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 1000);

      const response = await fetch("/api/tools/video/compressor", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Compression failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setResultUrl(url);
      setCompressedSize(blob.size);
      setProgress(100);
      setStatus("Compression Complete!");
    } catch (error: any) {
      console.error("Compression error:", error);
      setError(error.message || "Failed to compress video. Try a different quality setting.");
      setStatus("Error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setCompressedSize(null);
    setIsProcessing(false);
    setProgress(0);
    setStatus("");
    setError(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            {...getRootProps()}
            className={cn(
              "relative group cursor-pointer border-2 border-dashed rounded-[2.5rem] p-12 h-[450px]",
              "flex flex-col items-center justify-center transition-all duration-500",
              "bg-white/[0.02] border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]",
              isDragActive && "border-emerald-500 bg-emerald-500/5 scale-[0.99]"
            )}
          >
            <input {...getInputProps()} />
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full group-hover:w-[400px] transition-all duration-700" />

            <div className="relative mb-8">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-500">
                <Upload className="w-16 h-16 text-gray-400 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>

            <h3 className="text-3xl font-bold mb-4 tracking-tight">Drop video to compress</h3>
            <p className="text-gray-400 text-lg mb-8 max-w-md text-center">
              Shrink file size for faster sharing and storage. All formats supported.
            </p>
            
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                Smart Encoding
              </div>
              <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                Max 200MB
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-xl border border-red-400/20"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left: Preview & Results */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl relative">
                <div className="p-8">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-8 border border-white/5">
                    <video 
                      src={resultUrl || previewUrl!} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={cn(
                        "px-4 py-2 rounded-full backdrop-blur-md border text-xs font-bold uppercase tracking-widest",
                        resultUrl ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-black/60 border-white/10 text-white/60"
                      )}>
                        {resultUrl ? "Compressed Result" : "Original Preview"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 relative group">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Original Size</p>
                      <p className="text-3xl font-black text-white">{formatSize(file.size)}</p>
                      <TrendingDown className="absolute top-6 right-6 w-5 h-5 text-gray-600 group-hover:text-emerald-500/50 transition-colors" />
                    </div>
                    
                    <div className={cn(
                      "p-6 rounded-3xl border transition-all duration-500",
                      compressedSize 
                        ? "bg-emerald-500/10 border-emerald-500/30" 
                        : "bg-white/[0.02] border-white/5"
                    )}>
                      <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mb-2">Target Size</p>
                      <p className="text-3xl font-black text-white">
                        {compressedSize ? formatSize(compressedSize) : "---"}
                      </p>
                      {compressedSize && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="mt-2 flex items-center gap-1.5 text-emerald-400 text-xs font-bold"
                        >
                          <TrendingDown className="w-3 h-3" />
                          Reduced by {Math.round(((file.size - compressedSize) / file.size) * 100)}%
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Processing Overlay */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-12 z-50"
                    >
                      <div className="w-full max-w-sm text-center space-y-6">
                        <div className="relative inline-block">
                          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                          <div className="absolute inset-0 blur-xl bg-emerald-500/30 animate-pulse rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-bold tracking-tight">{status}</h4>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-emerald-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-1">
                            <span>Processing</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Right: Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-400" />
                  Compression Setup
                </h3>

                <div className="space-y-10">
                  {/* Quality Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Quality Profile</label>
                      <div className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-bold text-gray-400">H.264 VBR</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(["low", "medium", "high", "ultra"] as Quality[]).map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          disabled={isProcessing || !!resultUrl}
                          className={cn(
                            "py-4 rounded-2xl border font-bold text-xs transition-all uppercase tracking-widest",
                            quality === q 
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                              : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                          )}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-3">
                      <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {quality === "low" && "Prioritizes file size. Great for fast sharing on WhatsApp or Discord."}
                        {quality === "medium" && "The 'Sweet Spot'. Hard to notice difference from original."}
                        {quality === "high" && "Preserves fine details. Ideal for YouTube or social media uploads."}
                        {quality === "ultra" && "Maximum fidelity. Only recommended for pro archival use."}
                      </p>
                    </div>
                  </div>

                  {/* Format Selection */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Target Format</label>
                    <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5">
                      {(["mp4", "webm"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFormat(f)}
                          disabled={isProcessing || !!resultUrl}
                          className={cn(
                            "flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                            format === f ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Action */}
                  <div className="pt-4">
                    {!resultUrl ? (
                      <button
                        onClick={handleCompress}
                        disabled={!file || isProcessing}
                        className={cn(
                          "w-full relative overflow-hidden group px-8 py-5 rounded-[1.5rem] font-bold text-lg transition-all",
                          "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-500/20",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                          <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                          <span>Compress Now</span>
                        </div>
                      </button>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        <a
                          href={resultUrl}
                          download={`compressed_${file.name.split('.')[0]}.${format}`}
                          className="w-full flex items-center justify-center gap-3 py-5 bg-white text-black font-bold rounded-[1.5rem] hover:bg-emerald-50 transition-all shadow-xl"
                        >
                          <Download className="w-5 h-5" />
                          Download Result
                        </a>
                        <button
                          onClick={reset}
                          className="w-full py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold text-gray-500"
                        >
                          Compress Another
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 flex gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 shrink-0">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Smart VBR Engine</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed uppercase tracking-tight font-medium">
                    We use multi-pass encoding to ensure the highest possible quality for your target file size.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
