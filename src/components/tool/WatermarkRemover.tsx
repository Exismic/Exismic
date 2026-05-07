"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  X, 
  Sparkles, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Image as ImageIcon,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import axios from "axios";

export function WatermarkRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setStatusMessage("Analyzing watermark...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          if (prev > 70) setStatusMessage("Removing watermark artifacts...");
          else if (prev > 40) setStatusMessage("Neural inpainting in progress...");
          return prev + 5;
        });
      }, 300);

      const response = await axios.post("/api/tools/image/watermark-remover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob"
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage("Perfectly cleaned!");

      const resultUrl = URL.createObjectURL(response.data);
      setResult(resultUrl);
    } catch (error) {
      console.error("Processing failed:", error);
      setStatusMessage("Processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setProgress(0);
    setStatusMessage("");
  };

  return (
    <div className="space-y-12">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <div
              {...getRootProps()}
              className={cn(
                "min-h-[400px] rounded-[3.5rem] border-2 border-dashed transition-all duration-700 flex flex-col items-center justify-center p-12 text-center group cursor-pointer",
                isDragActive ? "border-accent-purple bg-accent-purple/5 shadow-2xl" : "border-zinc-800 glass-dark hover:border-white/20"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-28 h-28 rounded-[2.5rem] bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover:text-accent-purple group-hover:scale-110 transition-all duration-700 shadow-3xl border border-white/5 mb-8">
                <Upload size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-white tracking-tight">Drop your image here</h3>
                <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-md mx-auto">
                  Upload photos with watermarks, logos, or dates you want to vanish.
                </p>
              </div>
              <div className="mt-8 px-10 py-4 rounded-2xl premium-gradient text-white font-black text-xs uppercase tracking-widest shadow-2xl group-hover:scale-105 transition-all">
                Select Photo
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Before */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Original (With Watermark)</span>
                     <button onClick={reset} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors flex items-center gap-2">
                        <X size={12} /> Remove
                     </button>
                  </div>
                  <div className="rounded-[2.5rem] overflow-hidden border border-white/5 glass-dark shadow-2xl aspect-video relative group">
                     <img src={preview} alt="Original" className="w-full h-full object-contain" />
                     <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white">Before</div>
                  </div>
               </div>

               {/* After */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Result (Cleaned)</span>
                     {result && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5"><CheckCircle2 size={12}/> Ready to Download</span>}
                  </div>
                  <div className={cn(
                    "rounded-[2.5rem] overflow-hidden border border-white/5 glass-dark shadow-2xl aspect-video relative flex items-center justify-center",
                    !result && "bg-zinc-900/50"
                  )}>
                     {result ? (
                        <>
                          <img src={result} alt="Result" className="w-full h-full object-contain" />
                          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-accent-purple/60 backdrop-blur-md border border-accent-purple/20 text-[9px] font-black uppercase tracking-widest text-white">After</div>
                        </>
                     ) : (
                        <div className="text-center space-y-6">
                           <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-700 mx-auto">
                              <ImageIcon size={32} />
                           </div>
                           <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest">Awaiting Neural Processing</p>
                        </div>
                     )}

                     {/* Progress Overlay */}
                     <AnimatePresence>
                        {isProcessing && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-12 space-y-8"
                          >
                             <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                   <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                                   <motion.circle 
                                      cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-accent-purple"
                                      style={{ strokeDasharray: 377, strokeDashoffset: 377 - (377 * progress) / 100 }}
                                   />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                   <span className="text-2xl font-black text-white">{progress}%</span>
                                </div>
                             </div>
                             <div className="space-y-2 text-center">
                                <div className="flex items-center justify-center gap-2 text-accent-purple">
                                   <Loader2 size={16} className="animate-spin" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Processing...</span>
                                </div>
                                <p className="text-lg font-black text-white italic uppercase tracking-tight">{statusMessage}</p>
                             </div>
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
               {!result ? (
                  <button 
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full md:w-auto px-16 py-6 rounded-2xl premium-gradient text-white font-black text-sm uppercase tracking-widest shadow-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:scale-100"
                  >
                    <Sparkles size={20} />
                    {isProcessing ? "Neural Engine Active..." : "Remove Watermark"}
                  </button>
               ) : (
                  <>
                    <a 
                      href={result} 
                      download={`toolverse-no-watermark-${Date.now()}.jpg`}
                      className="w-full md:w-auto px-16 py-6 rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase tracking-widest shadow-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                      <Download size={20} /> Download Result
                    </a>
                    <button 
                      onClick={reset}
                      className="w-full md:w-auto px-10 py-6 rounded-2xl glass-dark border border-white/10 text-zinc-400 font-black text-sm uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <RefreshCw size={18} /> Process Another
                    </button>
                  </>
               )}
            </div>

            {/* Info Footer */}
            {!isProcessing && !result && (
              <div className="flex items-center justify-center gap-10 py-8 border-t border-white/5 opacity-40">
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Private Processing</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Zap size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Ultra Precision</span>
                 </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
