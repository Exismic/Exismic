"use client";

import { useState, useRef, useEffect } from "react";
import { 
  History, 
  Upload, 
  Download, 
  Sparkles, 
  Check, 
  Loader2, 
  Camera, 
  Heart,
  Undo2,
  Maximize,
  Contrast,
  Zap,
  MousePointer2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RestoredAsset {
  original: string;
  restored: string;
  originalSize: number;
  restoredSize: number;
}

export function PhotoRestorer() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<RestoredAsset | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);

  // Settings
  const [strength, setStrength] = useState(70);
  const [enhanceFaces, setEnhanceFaces] = useState(true);
  const [colorCorrect, setColorCorrect] = useState(true);
  const [sharpenDetails, setSharpenDetails] = useState(true);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const processRestoration = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("strength", strength.toString());
      formData.append("faces", enhanceFaces.toString());
      formData.append("color", colorCorrect.toString());
      formData.append("sharpen", sharpenDetails.toString());

      const response = await fetch("/api/tools/image/restorer", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setResult({
          original: image!,
          restored: data.result,
          originalSize: file.size,
          restoredSize: data.size
        });
      }
    } catch (err) {
      console.error("Restoration failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
        
        {/* LEFT: WORKSPACE */}
        <div className="lg:col-span-8 space-y-8">
           <div className={cn(
             "relative rounded-[3.5rem] glass-dark border-2 border-white/5 overflow-hidden transition-all duration-700 min-h-[500px] group flex items-center justify-center bg-zinc-950 shadow-4xl",
             !image && "border-dashed hover:border-accent-purple/30 cursor-pointer"
           )}>
              {!image ? (
                <label className="cursor-pointer flex flex-col items-center gap-6 p-20 text-center w-full">
                   <div className="w-24 h-24 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform shadow-3xl">
                      <Camera size={40} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Sacred Memory</h3>
                      <p className="text-zinc-500 text-sm font-medium">Upload old portrait or family photo</p>
                   </div>
                   <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
              ) : result ? (
                <div 
                  className="absolute inset-0 select-none cursor-ew-resize overflow-hidden"
                  onMouseMove={(e) => isDragging.current && handleSliderMove(e)}
                  onMouseDown={() => (isDragging.current = true)}
                  onMouseUp={() => (isDragging.current = false)}
                  onMouseLeave={() => (isDragging.current = false)}
                  onTouchMove={(e) => handleSliderMove(e)}
                >
                   {/* Restored Layer */}
                   <img src={result.restored} className="absolute inset-0 w-full h-full object-contain" alt="Restored" />
                   
                   {/* Original Layer (clipped by slider) */}
                   <div 
                     className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white/50"
                     style={{ width: `${sliderPos}%` }}
                   >
                     <img src={result.original} className="absolute inset-0 w-full h-full object-contain scale-[1.001]" alt="Original" style={{ width: `${100 / (sliderPos/100)}%` }} />
                     
                     <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Ages Ago</span>
                     </div>
                   </div>

                   {/* Slider Handle */}
                   <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none">
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-4xl border-4 border-black/20"
                        style={{ left: `${sliderPos}%` }}
                      >
                         <div className="flex gap-1">
                            <div className="w-1 h-4 bg-zinc-300 rounded-full" />
                            <div className="w-1 h-4 bg-zinc-300 rounded-full" />
                         </div>
                      </div>
                   </div>

                   <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-accent-purple/80 backdrop-blur-md border border-white/10">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Restore</span>
                   </div>
                </div>
              ) : (
                <img src={image} className="w-full h-full object-contain opacity-40 blur-sm" alt="Base" />
              )}

              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
                >
                   <div className="relative">
                      <Loader2 className="w-24 h-24 text-accent-purple animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-8 h-8 animate-pulse" />
                   </div>
                   <div className="text-center space-y-3">
                      <p className="text-[12px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Reconstructing Features...</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Polishing the grains of time</p>
                   </div>
                </motion.div>
              )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2.5rem] glass-dark border border-white/5 space-y-6">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 text-left">
                       <Zap size={14} className="text-accent-purple" />
                       Neural Pulse
                    </h4>
                    <span className="text-[10px] font-black text-accent-purple uppercase">{strength}%</span>
                 </div>
                 <input 
                   type="range" min="10" max="100" value={strength}
                   onChange={(e) => setStrength(parseInt(e.target.value))}
                   className="w-full accent-accent-purple h-1 bg-white/5 rounded-full"
                 />
                 <div className="flex justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                    <span>Soft Focus</span>
                    <span>High Fidelity</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setEnhanceFaces(!enhanceFaces)}
                   className={cn(
                     "p-6 rounded-[2rem] border transition-all flex flex-col gap-4 text-left",
                     enhanceFaces ? "bg-accent-purple/10 border-accent-purple text-white" : "glass-dark border-white/5 text-zinc-600"
                   )}
                 >
                    <Heart size={18} className={enhanceFaces ? "text-accent-purple" : "text-zinc-800"} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Enhance Faces</span>
                 </button>
                 <button 
                   onClick={() => setColorCorrect(!colorCorrect)}
                   className={cn(
                     "p-6 rounded-[2rem] border transition-all flex flex-col gap-4 text-left",
                     colorCorrect ? "bg-accent-cyan/10 border-accent-cyan text-white" : "glass-dark border-white/5 text-zinc-600"
                   )}
                 >
                    <Contrast size={18} className={colorCorrect ? "text-accent-cyan" : "text-zinc-800"} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Restore Color</span>
                 </button>
              </div>
           </div>
        </div>

        {/* RIGHT: ACTIONS & PRESETS */}
        <div className="lg:col-span-4 space-y-8">
           <div className="p-10 rounded-[3rem] glass-dark border border-white/5 space-y-10">
              <div className="space-y-2">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Restoration Hub</h3>
                 <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Powered by GFPGAN + Sharp</p>
              </div>

              <div className="space-y-4">
                 <div className="p-6 rounded-2xl glass-dark border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <Maximize size={20} className="text-zinc-500 group-hover:text-accent-purple" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Auto Sharpen</span>
                    </div>
                    <div onClick={() => setSharpenDetails(!sharpenDetails)} className={cn("w-10 h-5 rounded-full transition-all relative", sharpenDetails ? "bg-accent-purple" : "bg-zinc-800")}>
                       <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", sharpenDetails ? "left-6" : "left-1")} />
                    </div>
                 </div>
              </div>

              <div className="space-y-4 pt-6 text-center">
                 <button 
                   disabled={!image || isProcessing}
                   onClick={processRestoration}
                   className="w-full py-6 rounded-3xl premium-gradient text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-3xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4"
                 >
                    <Sparkles size={24} />
                    {isProcessing ? "Restoring Memory..." : "Restore Photo"}
                 </button>
                 
                 {result && (
                   <button 
                     onClick={() => {
                        const a = document.createElement("a");
                        a.href = result.restored;
                        a.download = "restored-memory.png";
                        a.click();
                     }}
                     className="w-full py-6 rounded-3xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-3xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-4"
                   >
                      <Download size={24} />
                      Download Masterpiece
                   </button>
                 )}

                 {image && (
                    <button onClick={() => { setImage(null); setResult(null); }} className="text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2 mx-auto pt-4 transition-colors">
                       <Undo2 size={12} />
                       Discard & Upload New
                    </button>
                 )}
              </div>
           </div>

           {result && (
              <div className="p-8 rounded-[2.5rem] glass-dark border border-white/5 flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center">
                    <History size={24} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Time Corrected</p>
                    <p className="text-xl font-black text-accent-purple">Legacy Preserved</p>
                 </div>
              </div>
           )}
        </div>

      </div>
    </div>
  );
}
