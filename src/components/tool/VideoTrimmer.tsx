"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Scissors, 
  Upload, 
  X, 
  Play, 
  Pause, 
  Download, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  Loader2,
  Timer,
  AlertCircle,
  FileVideo,
  Settings2,
  History
} from "lucide-react";

interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  duration: number;
  width: number;
  height: number;
}

export default function VideoTrimmer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultMetadata, setResultMetadata] = useState<{ duration: number; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File is too large. Maximum size is 100MB.");
        return;
      }
      
      setError(null);
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setResultUrl(null);
      setResultMetadata(null);
      setStartTime(0);
      setEndTime(0);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/webm": [".webm"],
      "video/x-msvideo": [".avi"],
    },
    multiple: false,
  });

  const handleMetadataLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const dur = video.duration;
    setMetadata({
      name: file?.name || "unknown",
      size: file?.size || 0,
      type: file?.type || "video/mp4",
      duration: dur,
      width: video.videoWidth,
      height: video.videoHeight
    });
    setEndTime(dur);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // Loop within the selection
      if (time >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      if (time < startTime) {
        videoRef.current.currentTime = startTime;
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrim = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(10); // Initial progress
    setError(null);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("start", startTime.toFixed(2));
    formData.append("end", endTime.toFixed(2));

    try {
      // Simulate progress since fetch doesn't give upload progress easily without XHR
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const response = await fetch("/api/tools/video/trimmer", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Trim failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultMetadata({
        duration: endTime - startTime,
        size: blob.size
      });
      setProgress(100);
    } catch (error: any) {
      console.error("Trim error:", error);
      setError(error.message || "Failed to trim video. Please try a different file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultMetadata(null);
    setStartTime(0);
    setEndTime(0);
    setMetadata(null);
    setError(null);
    setProgress(0);
  };

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
              "bg-white/[0.02] border-white/10 hover:border-blue-500/50 hover:bg-blue-500/[0.02]",
              isDragActive && "border-blue-500 bg-blue-500/5 scale-[0.99]"
            )}
          >
            <input {...getInputProps()} />
            
            {/* Animated Background Rings */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.5rem]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full group-hover:w-[400px] transition-all duration-700" />
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all duration-500 rotate-0 group-hover:rotate-6">
                <Upload className="w-16 h-16 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-blue-600 text-white shadow-xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                <FileVideo className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-3xl font-bold mb-4 tracking-tight">Drop your video here</h3>
            <p className="text-gray-400 text-lg mb-8 max-w-md text-center">
              MP4, MOV, or WebM. We'll handle the trimming with high precision.
            </p>
            
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                Max 100MB
              </div>
              <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
                Fast Processing
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
            {/* Main Editor */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
                {/* Video Container */}
                <div className="relative aspect-video bg-black group/video">
                  <video
                    ref={videoRef}
                    src={previewUrl!}
                    onLoadedMetadata={handleMetadataLoaded}
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Video Overlay Controls */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 bg-black/40">
                    <button
                      onClick={togglePlay}
                      className="p-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 transition-transform"
                    >
                      {isPlaying ? (
                        <Pause className="w-12 h-12 text-white fill-current" />
                      ) : (
                        <Play className="w-12 h-12 text-white fill-current ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Top Bar Info */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                    <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-mono text-gray-300">{formatTime(currentTime)}</span>
                    </div>
                    {metadata && (
                      <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-gray-300 font-medium">
                        {metadata.width}x{metadata.height} • {formatFileSize(metadata.size)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline and Trimming Controls */}
                <div className="p-8 space-y-8">
                  {/* Precision Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Start Point</label>
                      <div className="relative group/input">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <input
                          type="number"
                          step="0.1"
                          value={startTime.toFixed(2)}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(Number(e.target.value), endTime - 0.1));
                            setStartTime(val);
                            if (videoRef.current) videoRef.current.currentTime = val;
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">End Point</label>
                      <div className="relative group/input">
                        <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                        <input
                          type="number"
                          step="0.1"
                          value={endTime.toFixed(2)}
                          onChange={(e) => {
                            const val = Math.min(metadata?.duration || 0, Math.max(Number(e.target.value), startTime + 0.1));
                            setEndTime(val);
                            if (videoRef.current) videoRef.current.currentTime = val;
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visual Timeline */}
                  <div className="relative pt-6 pb-2">
                    <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-2 px-1">
                      <span>00:00.00</span>
                      <span>{metadata ? formatTime(metadata.duration) : "00:00.00"}</span>
                    </div>
                    
                    <div 
                      ref={timelineRef}
                      className="relative h-16 bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden group/timeline"
                    >
                      {/* Placeholder for Thumbnails (would need a library or canvas extraction) */}
                      <div className="absolute inset-0 flex items-center justify-around opacity-20 pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="w-px h-8 bg-white/20" />
                        ))}
                      </div>

                      {/* Selection Range Mask */}
                      <div className="absolute inset-0 flex">
                        <div 
                          className="h-full bg-black/60 border-r border-white/10" 
                          style={{ width: `${(startTime / (metadata?.duration || 1)) * 100}%` }}
                        />
                        <div 
                          className="h-full flex-1 relative group/range"
                        >
                          {/* Highlight for selected range */}
                          <div className="absolute inset-0 bg-blue-500/10 border-x-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]" />
                          
                          {/* Scrubber Line */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-white z-20 shadow-[0_0_10px_white]"
                            style={{ left: `${((currentTime - startTime) / (metadata?.duration || 1)) * 100}%` }}
                          />
                        </div>
                        <div 
                          className="h-full bg-black/60 border-l border-white/10" 
                          style={{ width: `${(1 - (endTime / (metadata?.duration || 1))) * 100}%` }}
                        />
                      </div>

                      {/* Native Range Inputs (Overlaid) */}
                      <input
                        type="range"
                        min="0"
                        max={metadata?.duration || 0}
                        step="0.01"
                        value={startTime}
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value), endTime - 0.1);
                          setStartTime(val);
                          if (videoRef.current) videoRef.current.currentTime = val;
                        }}
                        className={cn(
                          "absolute inset-0 w-full h-full opacity-0 cursor-pointer accent-blue-500",
                          startTime > (metadata?.duration || 0) / 2 ? "z-40" : "z-30"
                        )}
                        style={{ pointerEvents: isPlaying ? 'none' : 'auto' }}
                      />
                      <input
                        type="range"
                        min="0"
                        max={metadata?.duration || 0}
                        step="0.01"
                        value={endTime}
                        onChange={(e) => {
                          const val = Math.max(Number(e.target.value), startTime + 0.1);
                          setEndTime(val);
                          if (videoRef.current) videoRef.current.currentTime = val;
                        }}
                        className={cn(
                          "absolute inset-0 w-full h-full opacity-0 cursor-pointer accent-purple-500",
                          endTime < (metadata?.duration || 0) / 2 ? "z-40" : "z-30"
                        )}
                        style={{ pointerEvents: isPlaying ? 'none' : 'auto' }}
                      />

                      {/* Visual Handles */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-blue-500 z-20 pointer-events-none rounded-full"
                        style={{ left: `${(startTime / (metadata?.duration || 1)) * 100}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-8 bg-blue-500 rounded-lg shadow-lg flex items-center justify-center">
                          <div className="w-0.5 h-3 bg-white/50 rounded-full" />
                        </div>
                      </div>
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-purple-500 z-20 pointer-events-none rounded-full"
                        style={{ left: `${(endTime / (metadata?.duration || 1)) * 100}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-8 bg-purple-500 rounded-lg shadow-lg flex items-center justify-center">
                          <div className="w-0.5 h-3 bg-white/50 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center mt-6">
                      <div className="inline-flex items-center gap-6 px-6 py-3 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-md">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-gray-400 font-bold uppercase">Duration:</span>
                          <span className="text-sm font-mono text-white">{formatTime(endTime - startTime)}</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                          <History className="w-4 h-4 text-purple-400" />
                          <span className="text-xs text-gray-400 font-bold uppercase">Total:</span>
                          <span className="text-sm font-mono text-white">{metadata ? formatTime(metadata.duration) : "00:00"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={reset}
                      className="px-8 py-5 rounded-[1.5rem] border border-white/10 hover:bg-white/5 transition-all text-gray-300 font-bold flex items-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Discard
                    </button>
                    <button
                      onClick={handleTrim}
                      disabled={isProcessing}
                      className={cn(
                        "flex-1 relative overflow-hidden group px-8 py-5 rounded-[1.5rem] font-bold text-lg transition-all",
                        "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/20",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-3">
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Processing... {progress}%</span>
                          </>
                        ) : (
                          <>
                            <Scissors className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span>Trim & Save Video</span>
                          </>
                        )}
                      </div>
                      
                      {/* Animated Progress Background */}
                      {isProcessing && (
                        <motion.div 
                          className="absolute bottom-0 left-0 h-1 bg-white/30 z-20"
                          initial={{ width: "0%" }}
                          animate={{ width: `${progress}%` }}
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </div>

            {/* Sidebar: Details / Results */}
            <div className="lg:col-span-4 space-y-6">
              <AnimatePresence>
                {resultUrl ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-green-500/20">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      </div>
                      <h3 className="text-xl font-bold">Trim Complete!</h3>
                    </div>

                    <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-white/5">
                      <video src={resultUrl} controls className="w-full h-full object-contain" />
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">New Size</p>
                          <p className="text-sm font-mono text-white">{resultMetadata ? formatFileSize(resultMetadata.size) : "--"}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Duration</p>
                          <p className="text-sm font-mono text-white">{resultMetadata ? formatTime(resultMetadata.duration) : "--"}</p>
                        </div>
                      </div>

                      <a
                        href={resultUrl}
                        download={`trimmed_${file.name}`}
                        className="w-full flex items-center justify-center gap-3 py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-lg"
                      >
                        <Download className="w-5 h-5" />
                        Download Trimmed Video
                      </a>
                      
                      <button
                        onClick={() => setResultUrl(null)}
                        className="w-full py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium text-gray-400"
                      >
                        Adjust & Re-trim
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-blue-500/20">
                        <Settings2 className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold">Trimmer Guide</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 text-sm font-bold">1</div>
                        <div>
                          <p className="font-semibold text-white text-sm mb-1">Select Range</p>
                          <p className="text-gray-400 text-xs leading-relaxed">Drag the blue (start) and purple (end) handles to choose your segment.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 text-sm font-bold">2</div>
                        <div>
                          <p className="font-semibold text-white text-sm mb-1">Live Preview</p>
                          <p className="text-gray-400 text-xs leading-relaxed">The player will automatically loop within your selected range.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 text-sm font-bold">3</div>
                        <div>
                          <p className="font-semibold text-white text-sm mb-1">Export</p>
                          <p className="text-gray-400 text-xs leading-relaxed">Click Trim & Save. We'll re-encode your video for perfect quality.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-3 h-3 text-yellow-500" />
                          <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-tighter">Pro Tip</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          For frame-accurate trimming, use the number inputs to specify exact seconds.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
