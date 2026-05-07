"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Type, 
  Upload, 
  X, 
  Play, 
  Download, 
  Sparkles, 
  CheckCircle2,
  ChevronRight,
  Loader2,
  Globe,
  Palette,
  FileText,
  Video,
  AlertCircle,
  FileDown,
  Layers,
  Layout,
  Code2
} from "lucide-react";

type Tab = "preview" | "srt";

export default function SubtitleGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState("auto");
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultSrt, setResultSrt] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 150 * 1024 * 1024) {
        setError("File is too large. Maximum size for AI transcription is 150MB.");
        return;
      }
      setError(null);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultSrt(null);
      setResultVideoUrl(null);
      setProgress(0);
      setActiveTab("preview");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
    },
    multiple: false,
  });

  const handleGenerate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(5);
    setStatus("Uploading video...");
    setError(null);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("language", language);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 20) return prev + 1;
          if (prev < 60) {
            setStatus("AI Transcribing (Whisper)...");
            return prev + 0.5;
          }
          if (prev < 90) {
            setStatus("Burning subtitles into video...");
            return prev + 0.3;
          }
          return prev;
        });
      }, 1000);

      const response = await fetch("/api/tools/video/subtitles", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Subtitle generation failed");
      }

      const data = await response.json();
      
      setResultSrt(data.srt);
      if (data.videoUrl) {
        setResultVideoUrl(data.videoUrl);
      }
      setProgress(100);
      setStatus("Subtitles Ready!");
    } catch (error: any) {
      console.error("Subtitle error:", error);
      setError(error.message || "Failed to generate subtitles. Try a shorter video.");
      setStatus("Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSrt = () => {
    if (!resultSrt) return;
    const blob = new Blob([resultSrt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name.split('.')[0] || 'subtitles'}.srt`;
    a.click();
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultSrt(null);
    setResultVideoUrl(null);
    setIsProcessing(false);
    setProgress(0);
    setStatus("");
    setError(null);
    setActiveTab("preview");
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
              "bg-white/[0.02] border-white/10 hover:border-purple-500/50 hover:bg-purple-500/[0.02]",
              isDragActive && "border-purple-500 bg-purple-500/5 scale-[0.99]"
            )}
          >
            <input {...getInputProps()} />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full group-hover:w-[400px] transition-all duration-700" />

            <div className="relative mb-8">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition-all duration-500">
                <Upload className="w-16 h-16 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>

            <h3 className="text-3xl font-bold mb-4 tracking-tight text-center">Drop video for AI Subtitles</h3>
            <p className="text-gray-400 text-lg mb-8 max-w-md text-center">
              Transcribe speech and burn subtitles permanently into your video in one click.
            </p>
            
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 uppercase tracking-widest font-bold">
                Auto-Burn HD
              </div>
              <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 uppercase tracking-widest font-bold">
                Whisper AI
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
            {/* Left: Preview & Editor */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl relative">
                {/* Tabs */}
                {resultSrt && (
                  <div className="flex p-2 bg-black/40 border-b border-white/5">
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
                        activeTab === "preview" ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-white"
                      )}
                    >
                      <Layout className="w-4 h-4" />
                      Preview with Subtitles
                    </button>
                    <button
                      onClick={() => setActiveTab("srt")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
                        activeTab === "srt" ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-white"
                      )}
                    >
                      <Code2 className="w-4 h-4" />
                      Raw SRT Script
                    </button>
                  </div>
                )}

                <div className="p-8">
                  <AnimatePresence mode="wait">
                    {activeTab === "preview" ? (
                      <motion.div
                        key="video-preview"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/5 group/player">
                          <video 
                            src={resultVideoUrl || previewUrl!} 
                            controls 
                            className="w-full h-full object-contain"
                          />
                          
                          {/* Mode Indicator */}
                          <div className="absolute top-4 left-4">
                            <div className={cn(
                              "px-4 py-2 rounded-full backdrop-blur-md border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
                              resultVideoUrl ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : "bg-black/60 border-white/10 text-white/60"
                            )}>
                              {resultVideoUrl ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Subtitles Burned Successfully
                                </>
                              ) : (
                                "Original Preview"
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="srt-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                         <div className="p-8 rounded-3xl bg-black/40 border border-white/10 min-h-[400px]">
                            <div className="flex items-center justify-between mb-6">
                              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-3 h-3" />
                                AI Generated SRT
                              </h4>
                              <span className="text-[10px] px-2 py-1 rounded bg-purple-500/10 text-purple-400 font-bold uppercase">Editable Preview</span>
                            </div>
                            <div className="max-h-[350px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                               <pre className="text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                                  {resultSrt}
                               </pre>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Processing Overlay */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-12 z-50"
                    >
                      <div className="w-full max-w-sm text-center space-y-10">
                        <div className="relative inline-block">
                           <div className="w-32 h-32 rounded-full border-2 border-purple-500/10 flex items-center justify-center">
                              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                           </div>
                           <div className="absolute inset-0 blur-3xl bg-purple-500/30 animate-pulse rounded-full" />
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h4 className="text-3xl font-black tracking-tight text-white">{status}</h4>
                            <p className="text-gray-500 text-sm font-medium">This may take a minute for longer videos.</p>
                          </div>
                          <div className="space-y-3">
                             <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                               <motion.div 
                                 className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                                 initial={{ width: 0 }}
                                 animate={{ width: `${progress}%` }}
                               />
                             </div>
                             <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                               <span className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                  Whisper AI Engine
                               </span>
                               <span className="text-white">{Math.round(progress)}%</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Sidebar Controls */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  Configurations
                </h3>

                <div className="space-y-10">
                  {/* Language Selection */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Target Language</label>
                    <div className="relative group">
                       <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 z-10" />
                       <select 
                         value={language}
                         onChange={(e) => setLanguage(e.target.value)}
                         disabled={isProcessing || !!resultSrt}
                         className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer"
                       >
                         <option value="auto">Auto Detect Language</option>
                         <option value="en">English (Global)</option>
                         <option value="hi">Hindi (हिन्दी)</option>
                         <option value="ar">Arabic (العربية)</option>
                         <option value="es">Spanish (Español)</option>
                         <option value="fr">French (Français)</option>
                         <option value="de">German (Deutsch)</option>
                         <option value="ja">Japanese (日本語)</option>
                       </select>
                    </div>
                  </div>

                  {/* Main Action or Results */}
                  <div className="pt-4">
                    {!resultSrt ? (
                      <button
                        onClick={handleGenerate}
                        disabled={!file || isProcessing}
                        className={cn(
                          "w-full relative overflow-hidden group px-8 py-5 rounded-[1.5rem] font-bold text-lg transition-all",
                          "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/20",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                          <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform" />
                          <span>Generate & Burn</span>
                        </div>
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-1.5 bg-black/20 rounded-2xl border border-white/5 mb-6">
                           <a
                             href={resultVideoUrl!}
                             download={`subtitled_${file.name}`}
                             className="w-full flex items-center justify-center gap-3 py-5 bg-white text-black font-black rounded-xl hover:bg-gray-100 transition-all shadow-xl"
                           >
                             <Download className="w-5 h-5" />
                             Download Subtitled Video
                           </a>
                        </div>
                        
                        <button
                          onClick={downloadSrt}
                          className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
                        >
                          <FileDown className="w-4 h-4" />
                          Download .SRT Only
                        </button>

                        <button
                          onClick={reset}
                          className="w-full py-4 rounded-xl text-xs font-bold text-gray-500 hover:text-white transition-all"
                        >
                          New Video
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status/Capabilities Card */}
              <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                       <Layers className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">Auto-Burn Engine</h4>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                       <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                       High-Fidelity Transcription
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                       <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                       Smart Timestamp Alignment
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                       <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                       H.264 Hard-Sub Encoding
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
