"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { 
  Upload, 
  Download, 
  RefreshCw, 
  Loader2, 
  Sparkles, 
  Check, 
  X, 
  Layers, 
  Zap, 
  ShieldCheck, 
  History,
  Minus,
  Plus,
  Undo2,
  Redo2,
  LayoutGrid,
  Archive,
  LockKeyhole,
  Crown,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { saveFileHistory } from "@/lib/history";
import { useCredits } from "@/hooks/useCredits";
import Link from "next/link";
import { OutputTier } from "@/lib/tool-quality-policy";
import { detectDeviceCapabilities } from "@/lib/device-capability";
import { preloadLocalModel, processBackgroundLocally } from "@/lib/client-bg-remover";

type Mode = "bg-remove" | "object-erase";

interface HistoryState {
  mask: string;
}

interface BatchResult {
  name: string;
  url: string;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function BackgroundRemover() {
  const { isPro, credits, refreshCredits } = useCredits();
  const [mode, setMode] = useState<Mode>("bg-remove");
  const [outputTier, setOutputTier] = useState<OutputTier>("standard");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [fileName, setFileName] = useState<string>("image.png");
  const [result, setResult] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonValue, setComparisonValue] = useState(50);
  const [showComparison, setShowComparison] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; size: string } | null>(null);
  const [previewBg, setPreviewBg] = useState<"checker-dark" | "checker-light" | "solid-dark" | "solid-white">("checker-dark");
  const [isEnginePreloading, setIsEnginePreloading] = useState(false);

  // Preload local AI engine silently if device capability check passes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const capable = detectDeviceCapabilities();
      if (capable) {
        setIsEnginePreloading(true);
        preloadLocalModel().finally(() => {
          setIsEnginePreloading(false);
        });
      }
    }
  }, []);

  const getPreviewBgStyle = () => {
    switch (previewBg) {
      case "checker-light":
        return "bg-[conic-gradient(#e4e4e7_90deg,#ffffff_90deg_180deg,#e4e4e7_180deg_270deg,#ffffff_270deg)] bg-[length:24px_24px]";
      case "solid-dark":
        return "bg-zinc-950";
      case "solid-white":
        return "bg-white";
      case "checker-dark":
      default:
        return "bg-[conic-gradient(#3f3f46_90deg,#18181b_90deg_180deg,#3f3f46_180deg_270deg,#18181b_270deg)] bg-[length:24px_24px]";
    }
  };

  // Object Erase specific state
  const [brushSize, setBrushSize] = useState(40);
  const brushHardness = 80;
  const [isDrawing, setIsDrawing] = useState(false);
  const [maskHistory, setMaskHistory] = useState<HistoryState[]>([]);
  const [maskHistoryIndex, setMaskHistoryIndex] = useState(-1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cookieName = "exismic_output_tier_image-eraser";

  // Sync output tier with cookies
  useEffect(() => {
    const syncTier = () => {
      if (typeof document !== "undefined") {
        const stored = document.cookie
          .split("; ")
          .find((entry) => entry.startsWith(`${cookieName}=`))
          ?.split("=")[1];
        setOutputTier(stored === "hd" ? "hd" : "standard");
      }
    };
    syncTier();
    const interval = setInterval(syncTier, 500);
    window.addEventListener("click", syncTier);
    return () => {
      clearInterval(interval);
      window.removeEventListener("click", syncTier);
    };
  }, []);

  const changeOutputTier = (tier: OutputTier) => {
    setOutputTier(tier);
    if (typeof document !== "undefined") {
      document.cookie = `${cookieName}=${tier}; path=/; max-age=31536000; samesite=lax`;
    }
  };

  // Initialize Canvas for Object Erase
  const initCanvas = useCallback((imgSrc: string) => {
    if (mode !== "object-erase") return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!canvas || !maskCanvas) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx || !maskCtx) return;

      const parent = canvas.parentElement;
      if (!parent) return;
      
      const maxWidth = parent.clientWidth;
      const maxHeight = 600;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const initialState = maskCanvas.toDataURL();
      setMaskHistory([{ mask: initialState }]);
      setMaskHistoryIndex(0);
    };
  }, [mode]);

  useEffect(() => {
    if (image && mode === "object-erase") {
      setTimeout(() => initCanvas(image), 100);
    }
  }, [mode, image, initCanvas]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []).filter(file => file.type.startsWith("image/"));
    if (selectedFiles.length > 1 && !isPro) {
      setErrorMessage("Batch uploads are exclusive to Pro members.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    const files = isPro && mode === "bg-remove" ? selectedFiles.slice(0, 10) : selectedFiles.slice(0, 1);
    const file = files[0];
    if (file) {
      setBatchFiles(files);
      setBatchResults([]);
      setBatchProgress(0);
      setImageFile(file);
      setFileName(files.length > 1 ? `${files.length} images` : file.name);

      // Meta info
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setImage(src);
        setResult(null);
        setShowComparison(true);

        const tempImg = new Image();
        tempImg.onload = () => {
          setImageMeta({
            width: tempImg.width,
            height: tempImg.height,
            size: `${sizeMb} MB`
          });
        };
        tempImg.src = src;
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentOutputTier = (): OutputTier => {
    if (typeof document === "undefined") return "standard";
    const stored = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${cookieName}=`))
      ?.split("=")[1];
    return stored === "hd" ? "hd" : "standard";
  };

  const processAction = async () => {
    if (mode === "bg-remove") await processBgRemoval();
    else await processObjectEraser();
  };

  const processBgRemoval = async () => {
    if (!imageFile) return;

    const activeTier = getCurrentOutputTier();
    if (activeTier === "hd" && credits < 4) {
      setErrorMessage("Insufficient credits for HD quality. Please switch to Free Standard mode or top up credits.");
      setTimeout(() => setErrorMessage(null), 6000);
      return;
    }

    setIsProcessing(true);
    setBatchResults([]);
    setBatchProgress(0);

    try {
      const filesToProcess = isPro && batchFiles.length > 1 ? batchFiles : [imageFile];
      const completed: BatchResult[] = [];
      const isCapable = detectDeviceCapabilities();

      for (let index = 0; index < filesToProcess.length; index += 1) {
        const currentFile = filesToProcess[index];
        let cutoutUrl: string | null = null;

        // Attempt fast client-side worker processing if device capabilities pass
        if (isCapable) {
          try {
            console.log("[BG Remove] Device capability verified. Executing client worker AI...");
            cutoutUrl = await processBackgroundLocally(currentFile, 15000);
          } catch (clientErr) {
            console.warn("[BG Remove] Client-side processing failed/timed out. Falling back to server API:", clientErr);
            cutoutUrl = null;
          }
        }

        // Server API fallback if device is weak or client processing timed out / failed
        if (!cutoutUrl) {
          console.log("[BG Remove] Processing via server API fallback...");
          const formData = new FormData();
          formData.append("file", currentFile);
          formData.append("outputTier", activeTier);
          formData.append("priority", String(isPro));
          formData.append("batch", String(filesToProcess.length > 1));

          const response = await fetch("/api/tools/image/bg-remove", {
            method: "POST",
            body: formData
          });

          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error || "Processing failed");
          }
          cutoutUrl = data.result;
        }

        if (cutoutUrl) {
          completed.push({ name: currentFile.name, url: cutoutUrl });
          setBatchResults([...completed]);
          setBatchProgress(Math.round(((index + 1) / filesToProcess.length) * 100));

          if (index === 0) {
            setResult(cutoutUrl);
            setShowComparison(true);
          }
        }
      }

      if (activeTier === "hd") {
        refreshCredits();
        setSuccessMessage(filesToProcess.length > 1 
          ? `${filesToProcess.length} backgrounds removed! (4 credits charged for HD)` 
          : "HD cutout generated! (4 credits deducted)"
        );
      } else {
        setSuccessMessage(filesToProcess.length > 1 
          ? `${filesToProcess.length} backgrounds removed!` 
          : "Background removed successfully!"
        );
      }

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error: unknown) {
      console.error("Background removal failed:", error);
      setErrorMessage(getErrorMessage(error));
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const processObjectEraser = async () => {
    if (!image) return;
    const activeTier = getCurrentOutputTier();
    setIsProcessing(true);

    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = maskCanvas.width;
    tempCanvas.height = maskCanvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.fillStyle = "black";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    const maskData = maskCanvas.getContext("2d")?.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    if (maskData) {
      for (let i = 0; i < maskData.data.length; i += 4) {
        if (maskData.data[i + 3] > 0) {
          maskData.data[i] = 255;
          maskData.data[i + 1] = 255;
          maskData.data[i + 2] = 255;
          maskData.data[i + 3] = 255;
        }
      }
      tempCtx.putImageData(maskData, 0, 0);
    }

    try {
      const response = await fetch("/api/tools/image/eraser", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-exismic-output-tier": activeTier
        },
        body: JSON.stringify({ image, mask: tempCanvas.toDataURL("image/png"), outputTier: activeTier })
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.result);
        setShowComparison(true);
        if (activeTier === "hd") {
          refreshCredits();
          setSuccessMessage("Object erased with HD precision! (4 credits deducted)");
        } else {
          setSuccessMessage("Object removed successfully!");
        }
        setTimeout(() => setSuccessMessage(null), 4000);
        
        await saveFileHistory({
          toolType: "image-eraser",
          originalName: fileName,
          resultUrl: data.result,
          fileType: "image",
          status: "completed",
        });
      } else {
        throw new Error(data.error || "Erasure failed");
      }
    } catch (error: unknown) {
      console.error("Eraser failed:", error);
      setErrorMessage(getErrorMessage(error));
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Touch & Mouse Drawing Logic for Object Erase
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isProcessing) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = maskCanvasRef.current;
      if (canvas) {
        const newState = canvas.toDataURL();
        const newHistory = maskHistory.slice(0, maskHistoryIndex + 1);
        newHistory.push({ mask: newState });
        setMaskHistory(newHistory);
        setMaskHistoryIndex(newHistory.length - 1);
      }
    }
    setIsDrawing(false);
    maskCanvasRef.current?.getContext("2d")?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (("touches" in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = (("touches" in e) ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    const blur = (1 - brushHardness / 100) * brushSize / 2;
    ctx.shadowBlur = blur;
    ctx.shadowColor = "rgba(168, 85, 247, 0.85)";
    ctx.strokeStyle = "rgba(168, 85, 247, 0.85)";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const undo = () => {
    if (maskHistoryIndex > 0) {
      const newIndex = maskHistoryIndex - 1;
      setMaskHistoryIndex(newIndex);
      loadHistoryState(newIndex);
    }
  };

  const redo = () => {
    if (maskHistoryIndex < maskHistory.length - 1) {
      const newIndex = maskHistoryIndex + 1;
      setMaskHistoryIndex(newIndex);
      loadHistoryState(newIndex);
    }
  };

  const loadHistoryState = (index: number) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = maskHistory[index].mask;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const resetAll = () => {
    setImage(null);
    setImageFile(null);
    setBatchFiles([]);
    setBatchResults([]);
    setBatchProgress(0);
    setResult(null);
    setMaskHistory([]);
    setMaskHistoryIndex(-1);
    setShowComparison(true);
    setImageMeta(null);
  };

  const downloadBatchZip = async () => {
    if (batchResults.length === 0) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    await Promise.all(batchResults.map(async (item, index) => {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const baseName = item.name.replace(/\.[^.]+$/, "") || `image-${index + 1}`;
      zip.file(`${baseName}-cutout.png`, blob);
    }));

    const content = await zip.generateAsync({ type: "blob" });
    const blobUrl = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `exismic-${outputTier}-background-cutouts.zip`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* ERROR FLOATING MESSAGE */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center gap-3 rounded-xl border border-red-500/40 bg-zinc-950/95 px-5 py-4 text-xs sm:text-sm font-semibold text-red-200 shadow-2xl backdrop-blur-xl"
          >
             <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                <X size={18} />
             </div>
             <div className="flex-1">{errorMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER CONTROLS: MODE SWITCH & SPEED STATUS */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950/80 p-3 sm:p-4 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        
        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-black/60 p-1.5 min-w-[260px]">
           <button 
             type="button"
             onClick={() => { setMode("bg-remove"); setResult(null); }}
             className={cn(
               "flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-xs font-black uppercase tracking-wider transition-all",
               mode === "bg-remove" 
                 ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-white border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]" 
                 : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
             )}
           >
              <LayoutGrid size={15} className={mode === "bg-remove" ? "text-cyan-400" : ""} /> 
              <span>Background</span>
           </button>
           <button 
             type="button"
             onClick={() => { setMode("object-erase"); setResult(null); }}
             className={cn(
               "flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-xs font-black uppercase tracking-wider transition-all",
               mode === "object-erase" 
                 ? "bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 text-white border border-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]" 
                 : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
             )}
           >
              <Sparkles size={15} className={mode === "object-erase" ? "text-purple-400" : ""} /> 
              <span>Objects</span>
           </button>
        </div>

        {/* Priority Speed Badge & Preload Indicator */}
        <div className="flex items-center justify-between md:justify-end gap-3">
           {isEnginePreloading && (
             <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3.5 py-2 text-[10px] font-bold text-cyan-300">
                <Loader2 size={13} className="animate-spin text-cyan-400" />
                <span>Preparing AI engine...</span>
             </div>
           )}
           <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
              <Zap size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
              <span>{isPro ? "10x Priority Speed Active" : "Standard Speed Queue"}</span>
           </div>
        </div>

      </div>

      {/* WORKSPACE CONTENT GRID */}
      <div className="grid min-h-[560px] grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* LEFT PANEL: INPUT / CANVAS WORKSPACE */}
        <div className="group/workspace relative flex min-h-[500px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/75 shadow-2xl backdrop-blur-xl">
           
           {/* Structured Left Header */}
           <div className="flex items-center justify-between border-b border-white/10 bg-black/60 px-4 py-3">
              <div className="flex items-center gap-2">
                 <div className="size-2 rounded-full bg-cyan-400 animate-ping" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">
                   {mode === "bg-remove" ? "Original Image" : "Object Eraser Canvas"}
                 </span>
              </div>
              {imageMeta && (
                <span className="text-[9px] font-bold text-zinc-400">
                  {imageMeta.width}x{imageMeta.height} • {imageMeta.size}
                </span>
              )}
           </div>

           {/* Main Display Box */}
           <div className="flex flex-1 items-center justify-center bg-black/40 p-4 sm:p-6 overflow-hidden">
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-full min-h-[420px] w-full cursor-pointer flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-white/15 px-6 text-center transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-400/[0.04]"
                >
                   <div className="flex size-20 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.15)] group-hover/workspace:scale-110 transition-transform duration-300">
                      <Upload size={34} />
                   </div>
                   <div className="text-center space-y-2 max-w-sm">
                      <h3 className="text-xl font-black tracking-tight text-white">Upload Your Photo</h3>
                      <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                        {isPro && mode === "bg-remove" 
                          ? "Drag & drop single or batch up to 10 photos for Pro parallel processing." 
                          : "Drag & drop your photo or click to browse. Supports PNG, JPG, WebP."}
                      </p>
                      <div className="pt-2 flex flex-wrap justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        <span className="rounded-md border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5">Auto AI Edge Detection</span>
                        {outputTier === "hd" ? (
                          <span className="rounded-md border border-purple-400/30 bg-purple-400/10 px-3 py-1.5 text-purple-300">Lossless Full HD Quality</span>
                        ) : (
                          <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-400">Fast Standard Export</span>
                        )}
                      </div>
                   </div>
                   <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple={isPro && mode === "bg-remove"} onChange={handleUpload} />
                </div>
              ) : (
                <div className="relative max-w-full max-h-[520px] flex items-center justify-center">
                   {mode === "bg-remove" ? (
                      <img src={image} className="rounded-xl shadow-2xl max-w-full max-h-[500px] object-contain block" alt="Source" />
                   ) : (
                      <div className="relative">
                        <canvas ref={canvasRef} className="rounded-xl shadow-2xl max-w-full block" />
                        <canvas 
                          ref={maskCanvasRef} 
                          className={cn(
                             "absolute top-0 left-0 cursor-crosshair max-w-full block touch-none",
                             isProcessing && "pointer-events-none opacity-50"
                          )}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                      </div>
                   )}
                </div>
              )}
           </div>

           {/* WORKSPACE BOTTOM CONTROL TOOLBAR */}
           {image && (
             <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/60 p-4">
                {mode === "object-erase" && (
                   <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/90 px-2 py-1 shadow-inner">
                         <button 
                           type="button"
                           onClick={() => setBrushSize(Math.max(5, brushSize - 5))} 
                           className="flex size-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
                         >
                            <Minus size={14}/>
                         </button>
                         <div className="flex flex-col items-center min-w-[50px]">
                            <span className="text-xs font-black text-white">{brushSize}px</span>
                            <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Brush</span>
                         </div>
                         <button 
                           type="button"
                           onClick={() => setBrushSize(Math.min(150, brushSize + 5))} 
                           className="flex size-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
                         >
                            <Plus size={14}/>
                         </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                         <button 
                           type="button"
                           onClick={undo} 
                           disabled={maskHistoryIndex <= 0} 
                           className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30"
                           title="Undo"
                         >
                            <Undo2 size={16} />
                         </button>
                         <button 
                           type="button"
                           onClick={redo} 
                           disabled={maskHistoryIndex >= maskHistory.length - 1} 
                           className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30"
                           title="Redo"
                         >
                            <Redo2 size={16} />
                         </button>
                      </div>
                   </div>
                )}
                
                <div className="flex items-center gap-2 ml-auto">
                   <button 
                     type="button"
                     onClick={resetAll}
                     className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
                   >
                      <RefreshCw size={15} />
                      <span className="hidden sm:inline">Change Image</span>
                   </button>
                   <button 
                      type="button"
                      onClick={processAction} 
                      disabled={isProcessing} 
                      className={cn(
                        "flex min-h-11 items-center justify-center gap-2 rounded-xl px-6 text-xs font-black uppercase tracking-wider text-white shadow-xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50",
                        mode === "bg-remove" 
                          ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 shadow-cyan-500/20" 
                          : "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-600 shadow-purple-500/20"
                      )}
                   >
                      {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      <span>{mode === "bg-remove" ? "Remove Background" : "Erase Object"}</span>
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* RIGHT PANEL: RESULT PREVIEW & BEFORE/AFTER */}
        <div className="group/result relative flex min-h-[500px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/75 shadow-2xl backdrop-blur-xl">
           
           {/* Structured Right Header */}
           <div className="flex items-center justify-between border-b border-white/10 bg-black/60 px-4 py-3">
              <div className="flex items-center gap-2">
                 <div className="size-2 rounded-full bg-emerald-400" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">
                   {outputTier === "hd" ? "HD Lossless Cutout" : "Standard Cutout"}
                 </span>
              </div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                {mode === "bg-remove" ? "AI Background Removal" : "Object Erasure"}
              </span>
           </div>

           <div className={cn("relative flex flex-1 items-center justify-center p-4 sm:p-6 transition-all duration-300", getPreviewBgStyle())}>
              {isProcessing ? (
                <div className="flex flex-col items-center gap-6 text-center max-w-sm px-4">
                   <div className="relative size-24">
                      <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-purple-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Sparkles className="size-8 text-cyan-300 animate-pulse" />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="mx-auto w-fit px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-300/30 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                         <Zap size={13} className="fill-amber-300" />
                         {isPro ? "10x Priority Mode Active" : "Standard Speed Queue"}
                      </div>
                      
                      <h3 className="text-xl font-black text-white uppercase tracking-wider animate-pulse">
                        {batchFiles.length > 1 && isPro
                          ? `Processing ${batchResults.length + 1}/${batchFiles.length}`
                          : isPro ? "Lightning AI Cutout..." : "Processing Cutout..."}
                      </h3>
                      
                      <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                        {isPro 
                          ? "Executing on high-priority GPU serverless nodes..." 
                          : "Free tier queue. Upgrade to Pro for 10x faster instant execution."}
                      </p>
                   </div>
                </div>
              ) : result ? (
                 <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <AnimatePresence>
                       {successMessage && (
                          <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[11px] font-black uppercase tracking-wider shadow-2xl flex items-center gap-2"
                          >
                             <Check size={15} /> {successMessage}
                          </motion.div>
                       )}
                    </AnimatePresence>

                    {showComparison ? (
                       <div className="relative w-full max-h-[480px] aspect-auto rounded-xl overflow-hidden shadow-2xl border border-white/10 cursor-ew-resize">
                          <img src={image || ""} className="w-full h-full object-contain block bg-zinc-950" alt="Before" />
                          <div 
                            className="absolute inset-0 overflow-hidden" 
                            style={{ clipPath: `inset(0 0 0 ${comparisonValue}%)` }}
                          >
                             <div className={cn("w-full h-full", getPreviewBgStyle())}>
                                <img src={result} className="w-full h-full object-contain block" alt="After" />
                             </div>
                          </div>
                          
                          {/* Slider Divider Bar */}
                          <div 
                            className="absolute inset-y-0 w-1 bg-white z-20 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                            style={{ left: `${comparisonValue}%` }}
                          >
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-9 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-cyan-400/40">
                                <div className="flex gap-1">
                                   <div className="w-0.5 h-3 bg-zinc-900 rounded-full" />
                                   <div className="w-0.5 h-3 bg-zinc-900 rounded-full" />
                                </div>
                             </div>
                          </div>

                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={comparisonValue} 
                            onChange={(e) => setComparisonValue(parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                          />

                          <div className="absolute bottom-3 left-4 px-3 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-black text-zinc-300 uppercase tracking-widest pointer-events-none z-20">Before</div>
                          <div className="absolute bottom-3 right-4 px-3 py-1 rounded-md bg-cyan-500/90 backdrop-blur-md border border-cyan-400/30 text-[9px] font-black text-white uppercase tracking-widest pointer-events-none z-20">After</div>
                       </div>
                    ) : (
                       <div className={cn("w-full max-h-[480px] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center p-2", getPreviewBgStyle())}>
                          <img src={result} className="max-w-full max-h-[460px] object-contain block" alt="Final" />
                       </div>
                    )}

                    {/* PREVIEW BACKGROUND TOGGLE CONTROLS */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                       <button 
                         type="button"
                         onClick={() => setShowComparison(!showComparison)}
                         className={cn(
                            "px-4 py-2 rounded-xl border transition-all font-black text-[10px] uppercase tracking-wider flex items-center gap-2",
                            showComparison 
                              ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-200" 
                              : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                         )}
                       >
                          <Layers size={14} /> {showComparison ? "Hide Slider" : "Show Slider"}
                       </button>

                       <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/60 p-1">
                          <button
                            type="button"
                            onClick={() => setPreviewBg("checker-dark")}
                            className={cn("px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all", previewBg === "checker-dark" ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white")}
                            title="Dark Checkerboard Grid"
                          >
                            Grid Dark
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewBg("checker-light")}
                            className={cn("px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all", previewBg === "checker-light" ? "bg-white text-black shadow-sm font-black" : "text-zinc-400 hover:text-white")}
                            title="Light Checkerboard Grid"
                          >
                            Grid Light
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewBg("solid-dark")}
                            className={cn("px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all", previewBg === "solid-dark" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white")}
                            title="Solid Black Background"
                          >
                            Black
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewBg("solid-white")}
                            className={cn("px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all", previewBg === "solid-white" ? "bg-white text-black shadow-sm font-black" : "text-zinc-400 hover:text-white")}
                            title="Solid White Background"
                          >
                            White
                          </button>
                       </div>
                    </div>

                 </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center opacity-30">
                   <LayoutGrid size={56} className="text-zinc-500" />
                   <div className="space-y-1 max-w-xs">
                      <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">Ready to Process</p>
                      <p className="text-zinc-500 text-[11px] font-medium leading-relaxed">
                        {mode === "bg-remove" ? "Click 'Remove Background' to isolate the subject." : "Paint objects to remove them seamlessly."}
                      </p>
                   </div>
                </div>
              )}
           </div>

           {/* RESULT ACTIONS FOOTER */}
           {result && !isProcessing && (
              <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 border-t border-white/10 bg-black/60 p-4">
                 <button 
                   type="button"
                   onClick={() => {
                     const triggerDirectDownload = (fileUrl: string) => {
                       if (!fileUrl) return;
                       const rawBase = fileName.replace(/\.[^.]+$/, "");
                       const cleanBase = rawBase.startsWith("bg-removed-") ? rawBase : `bg-removed-${rawBase}`;
                       const downloadName = `${cleanBase}.png`;
                       const downloadProxyUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(downloadName)}`;
                       
                       const a = document.createElement("a");
                       a.href = downloadProxyUrl;
                       a.download = downloadName;
                       document.body.appendChild(a);
                       a.click();
                       document.body.removeChild(a);
                     };

                     batchResults.length > 1 ? downloadBatchZip() : triggerDirectDownload(result);
                   }}
                   className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 px-6 text-xs font-black uppercase tracking-wider text-white shadow-xl transition-all hover:brightness-110 active:scale-[0.98]"
                 >
                    {batchResults.length > 1 ? <Archive size={18} /> : <Download size={18} />}
                    <span>{batchResults.length > 1 ? `Download ${batchResults.length} as ZIP` : `Download Cutout`}</span>
                 </button>
                 <button 
                   type="button"
                   onClick={resetAll}
                   className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-xs font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
                 >
                    <RefreshCw size={18} /> New Image
                 </button>
              </div>
           )}
        </div>

      </div>

      {/* FEATURE INFO FOOTER */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
         {[
           { icon: Zap, label: "Processing Speed", value: isPro ? "10x Priority Mode Active" : "Standard Speed (5s queue)", color: isPro ? "text-amber-400" : "text-zinc-400" },
           { icon: ShieldCheck, label: "Export Quality", value: outputTier === "hd" ? "Full HD Original Lossless PNG" : "Web Standard (1000px max edge)", color: outputTier === "hd" ? "text-purple-400" : "text-cyan-400" },
           { icon: History, label: "Credit Deductions", value: outputTier === "hd" ? "4 Credits / Success" : "Free (0 Credits)", color: "text-emerald-400" }
         ].map((stat, i) => (
           <div key={i} className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-zinc-950/60 p-4 backdrop-blur-xl">
              <div className={cn("flex size-11 items-center justify-center rounded-xl bg-white/5 shrink-0", stat.color)}>
                 <stat.icon size={20} />
              </div>
              <div className="text-left min-w-0">
                 <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">{stat.label}</div>
                 <div className="text-xs text-white font-bold truncate">{stat.value}</div>
              </div>
           </div>
         ))}
      </div>

    </div>
  );
}
