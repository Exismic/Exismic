"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { readVideoResponse } from "@/lib/video-client";
import { 
  Download, 
  Loader2, 
  Plus, 
  X, 
  ArrowRight,
  Film,
  Clock,
  Layout,
  Play,
  Zap,
  CheckCircle2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Maximize2
} from "lucide-react";

interface Clip {
  id: string;
  file: File;
  preview: string;
  duration: number;
}

export default function VideoMerger() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState("exismic-merged-video.mp4");
  const [error, setError] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const clipsRef = useRef<Clip[]>([]);

  useEffect(() => {
    clipsRef.current = clips;
  }, [clips]);

  useEffect(() => () => {
    clipsRef.current.forEach((clip) => URL.revokeObjectURL(clip.preview));
  }, []);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const availableSlots = Math.max(0, 8 - clipsRef.current.length);
    const newClips = acceptedFiles.slice(0, availableSlots).map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      duration: 0
    }));
    setClips(prev => [...prev, ...newClips]);
    setResultUrl(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".mov", ".avi", ".webm"] },
    multiple: true,
  });

  const removeClip = (id: string) => {
    setClips(prev => {
      const removed = prev.find((clip) => clip.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter(c => c.id !== id);
    });
    setResultUrl(null);
  };

  const moveClip = (index: number, direction: 'up' | 'down') => {
    const newClips = [...clips];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newClips.length) return;
    [newClips[index], newClips[targetIndex]] = [newClips[targetIndex], newClips[index]];
    setClips(newClips);
  };

  const handleMerge = async () => {
    if (clips.length < 2) return;
    setIsProcessing(true);
    setStatus("Normalizing and joining clips...");
    setError(null);

    const formData = new FormData();
    clips.forEach(clip => {
      formData.append("clips", clip.file);
    });

    try {
      const response = await fetch("/api/tools/video/merger", {
        method: "POST",
        body: formData,
      });
      const artifact = await readVideoResponse(response, "exismic-merged-video.mp4");
      setResultUrl(artifact.url);
      setResultFileName(artifact.fileName);
      setStatus("Merge complete");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to merge videos");
      setStatus("Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalDuration = clips.reduce((acc, curr) => acc + curr.duration, 0);
  const totalSize = clips.reduce((acc, curr) => acc + curr.file.size, 0);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 p-3 pb-24 sm:p-4 md:space-y-12 md:p-8">
      {/* Clip Preview Modal */}
      <AnimatePresence>
        {activePreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-3 backdrop-blur-2xl sm:p-8"
            onClick={() => setActivePreview(null)}
          >
             <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
                <video src={activePreview} controls autoPlay className="w-full h-full object-contain" />
                <button 
                  onClick={() => setActivePreview(null)}
                  aria-label="Close video preview"
                  className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-black/60 text-white transition-all hover:bg-black/80 sm:right-6 sm:top-6"
                >
                   <X className="w-6 h-6" />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {clips.length === 0 ? (
          <motion.div
                {...(getRootProps() as unknown as import("framer-motion").HTMLMotionProps<"div">)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "group relative flex min-h-[360px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-white/10 bg-white/[0.01] px-5 text-center transition-all hover:bg-white/[0.03] sm:h-[500px] sm:rounded-[4rem]",
              isDragActive && "border-purple-500 bg-purple-500/5"
            )}
          >
            <input {...getInputProps()} />
            <div className="mb-6 rounded-full border border-white/5 bg-white/5 p-6 sm:mb-8 sm:p-10">
              <Film className="h-11 w-11 text-gray-500 transition-colors group-hover:text-purple-400 sm:h-16 sm:w-16" />
            </div>
            <h3 className="text-3xl font-black text-white tracking-tightest text-center">Video Merger Studio</h3>
            <p className="text-gray-500 text-lg mt-4 max-w-md text-center font-medium uppercase tracking-[0.2em] text-[10px]">Concatenate multiple clips with seamless transitions</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            {/* Storyboard Area */}
            <div className="xl:col-span-8 space-y-8">
              <div className="relative min-h-[500px] rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-2xl backdrop-blur-xl sm:p-8 md:rounded-[3rem] md:p-12">
                {resultUrl ? (
                   <div className="space-y-10 py-10 flex flex-col items-center">
                      <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-black border border-white/5 w-full max-w-2xl shadow-2xl">
                         <video src={resultUrl} controls className="w-full h-full object-contain" />
                      </div>
                      <div className="text-center space-y-4">
                         <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Production Ready</h4>
                         <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Successfully normalized and joined {clips.length} clips</p>
                      </div>
                   </div>
                ) : (
                  <div className="space-y-8">
                    <div className="mb-6 flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between sm:mb-8">
                       <h3 className="flex items-center gap-3 text-xl font-black uppercase italic tracking-tight sm:text-2xl">
                          <Layout className="w-6 h-6 text-purple-400" />
                          Storyboard
                       </h3>
                       <button 
                         {...getRootProps()}
                         className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                       >
                          <Plus className="w-3 h-3" />
                          Add Clips
                          <input {...getInputProps()} />
                       </button>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                      {clips.map((clip, index) => (
                        <motion.div 
                          key={clip.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="group relative flex flex-wrap items-center gap-3 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:bg-white/[0.04] sm:flex-nowrap sm:gap-6 sm:rounded-3xl sm:p-6"
                        >
                          <div className="flex flex-col gap-1 z-10">
                             <button onClick={() => moveClip(index, 'up')} disabled={index === 0} className="p-1 text-gray-600 hover:text-white disabled:opacity-0 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                             <button onClick={() => moveClip(index, 'down')} disabled={index === clips.length - 1} className="p-1 text-gray-600 hover:text-white disabled:opacity-0 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                          </div>

                          <div 
                            className="group/clip relative aspect-video w-24 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black sm:w-36"
                            onClick={() => setActivePreview(clip.preview)}
                          >
                             <video 
                               src={clip.preview} 
                               onLoadedMetadata={(e) => {
                                  const d = e.currentTarget.duration;
                                  setClips(prev => prev.map(c => c.id === clip.id ? { ...c, duration: d } : c));
                               }}
                               className="w-full h-full object-cover opacity-60 group-hover/clip:opacity-80 transition-all"
                             />
                             <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover/clip:bg-black/20 transition-all">
                                <Play className="w-6 h-6 text-white group-hover/clip:scale-125 transition-transform" />
                             </div>
                             <div className="absolute bottom-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg opacity-0 group-hover/clip:opacity-100 transition-all">
                                <Maximize2 className="w-3 h-3 text-white" />
                             </div>
                          </div>

                          <div className="flex-1 min-w-0 z-10">
                             <h4 className="text-sm font-bold text-white truncate mb-1">{clip.file.name}</h4>
                             <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-purple-400/80"><Clock className="w-3 h-3" /> {clip.duration.toFixed(1)}s</span>
                                <span>{(clip.file.size / 1024 / 1024).toFixed(1)} MB</span>
                             </p>
                          </div>

                          <button 
                            onClick={() => removeClip(clip.id)}
                            aria-label={`Remove ${clip.file.name}`}
                            className="ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500 opacity-100 transition-opacity hover:bg-red-500/20 sm:rounded-2xl sm:opacity-0 sm:group-hover:opacity-100"
                          >
                             <X className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

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
                           className="h-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                           initial={{ width: 0 }}
                           animate={{ width: "100%" }}
                           transition={{ duration: 30 }}
                         />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-6 font-black uppercase tracking-[0.5em]">Scaling to 1080p Master</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="xl:col-span-4 space-y-8">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-8 md:rounded-[3.5rem] md:p-10">
                 <div className="flex items-center justify-between mb-10">
                   <h3 className="text-2xl font-black uppercase tracking-tight italic">Mastering</h3>
                   <CheckCircle2 className="w-6 h-6 text-purple-400" />
                </div>

                <div className="space-y-12">
                   <div className="space-y-6">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">Final Specs</label>
                      <div className="space-y-3">
                         <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Duration</span>
                            <span className="text-sm font-black text-white">{totalDuration.toFixed(1)}s</span>
                         </div>
                         <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payload</span>
                            <span className="text-sm font-black text-white">{(totalSize / 1024 / 1024).toFixed(1)} MB</span>
                         </div>
                         <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Format</span>
                            <span className="text-sm font-black text-purple-400 uppercase tracking-widest underline decoration-purple-500/30">1080p MP4</span>
                         </div>
                      </div>
                   </div>

                   <div className="pt-6">
                    {!resultUrl ? (
                      <button
                        onClick={handleMerge}
                        disabled={clips.length < 2 || isProcessing}
                        className="w-full group px-10 py-7 bg-white text-black rounded-[2.5rem] font-black text-lg uppercase tracking-[0.3em] hover:bg-purple-50 transition-all shadow-2xl disabled:opacity-50"
                      >
                        <div className="flex items-center justify-center gap-4">
                           <span>Merge Videos</span>
                           <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </button>
                    ) : (
                      <div className="space-y-6">
                        <a
                          href={resultUrl}
                          download={resultFileName}
                          className="w-full flex items-center justify-center gap-4 py-7 bg-purple-600 text-white font-black rounded-[2.5rem] hover:bg-purple-500 transition-all shadow-2xl shadow-purple-600/20 uppercase tracking-widest"
                        >
                          <Download className="w-6 h-6" />
                          Download Master
                        </a>
                        <button
                          onClick={() => {
                            clips.forEach((clip) => URL.revokeObjectURL(clip.preview));
                            setClips([]);
                            setResultUrl(null);
                            setResultFileName("exismic-merged-video.mp4");
                          }}
                          className="w-full py-4 text-zinc-600 font-black text-[11px] uppercase tracking-[0.4em] hover:text-white transition-colors"
                        >
                          New Production
                        </button>
                      </div>
                    )}

                    {error && (
                      <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 text-[10px] font-bold flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                           <p className="uppercase tracking-widest">System Error</p>
                           <p className="font-medium opacity-80 leading-relaxed italic">{error}</p>
                        </div>
                      </div>
                    )}
                   </div>
                </div>
              </div>

              {/* Status Engine */}
              <div className="p-8 rounded-[3rem] bg-purple-500/5 border border-purple-500/10 flex gap-5 items-center">
                 <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                    <Zap className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Normalizing Engine</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Smart Scaling Active</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
