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
  Archive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { saveFileHistory } from "@/lib/history";
import { useCredits } from "@/hooks/useCredits";

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
  const { isPro } = useCredits();
  const [mode, setMode] = useState<Mode>("bg-remove");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [fileName, setFileName] = useState<string>("image.png");
  const [result, setResult] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonValue, setComparisonValue] = useState(50);
  const [showComparison, setShowComparison] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Object Erase specific state
  const [brushSize, setBrushSize] = useState(40);
  const brushHardness = 80;
  const [isDrawing, setIsDrawing] = useState(false);
  const [maskHistory, setMaskHistory] = useState<HistoryState[]>([]);
  const [maskHistoryIndex, setMaskHistoryIndex] = useState(-1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      // Reset history
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
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setImage(src);
        setResult(null);
        setShowComparison(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const processAction = async () => {
    if (mode === "bg-remove") await processBgRemoval();
    else await processObjectEraser();
  };

  const processBgRemoval = async () => {
    if (!imageFile) return;
    setIsProcessing(true);
    setBatchResults([]);
    setBatchProgress(0);

    try {
      const filesToProcess = isPro && batchFiles.length > 1 ? batchFiles : [imageFile];
      const completed: BatchResult[] = [];

      for (let index = 0; index < filesToProcess.length; index += 1) {
        const currentFile = filesToProcess[index];
        const formData = new FormData();
        formData.append("file", currentFile);
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

        completed.push({ name: currentFile.name, url: data.result });
        setBatchResults([...completed]);
        setBatchProgress(Math.round(((index + 1) / filesToProcess.length) * 100));

        if (index === 0) {
          setResult(data.result);
          setShowComparison(true);
        }

      }

      setSuccessMessage(filesToProcess.length > 1 ? `${filesToProcess.length} backgrounds removed!` : "Background removed successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
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
    setIsProcessing(true);

    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    // Create a black and white mask for the API
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mask: tempCanvas.toDataURL("image/png") })
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(data.result);
        setShowComparison(true);
        setSuccessMessage("Object removed with high precision!");
        setTimeout(() => setSuccessMessage(null), 3000);
        
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

  // Drawing Logic
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
    ctx.shadowColor = "rgba(168, 85, 247, 0.8)";
    ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";

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
    setShowComparison(false);
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
    a.download = "exismic-pro-background-cutouts.zip";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-500">
      
      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed left-1/2 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center gap-3 rounded-lg border border-red-400/40 bg-red-950/95 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-md"
          >
             <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-red-400/15">
                <X size={16} />
             </div>
             {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODE AND DOCUMENT ACTIONS */}
      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-zinc-950/65 p-3 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-1 rounded-md border border-white/10 bg-black/40 p-1">
           <button 
             onClick={() => { setMode("bg-remove"); setResult(null); }}
             className={cn(
               "flex min-h-11 items-center justify-center gap-2 rounded px-4 text-xs font-bold transition-all",
               mode === "bg-remove" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
             )}
           >
              <LayoutGrid size={14} /> Background
           </button>
           <button 
             onClick={() => { setMode("object-erase"); setResult(null); }}
             className={cn(
               "flex min-h-11 items-center justify-center gap-2 rounded px-4 text-xs font-bold transition-all",
               mode === "object-erase" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
             )}
           >
              <Sparkles size={14} /> Objects
           </button>
        </div>

        <div className="flex items-center justify-end gap-2">
           {image && (
             <button 
               onClick={resetAll}
               className="group flex min-h-11 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 text-xs font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
             >
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
                New
             </button>
           )}
           {result && (
              <button 
                onClick={batchResults.length > 1 ? downloadBatchZip : () => {
                  const a = document.createElement("a");
                  a.href = result;
                  a.download = `${mode === 'bg-remove' ? 'cutout' : 'retouched'}-${fileName}`;
                  a.click();
                }}
                className="premium-gradient flex min-h-11 items-center gap-2 rounded-md px-5 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
              >
                 {batchResults.length > 1 ? <Archive size={18} /> : <Download size={18} />}
                 {batchResults.length > 1 ? "Download ZIP" : "Download Result"}
              </button>
           )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid min-h-[540px] grid-cols-1 gap-5 lg:grid-cols-2">
        
        {/* LEFT SIDE: SOURCE / UPLOAD */}
        <div className="group/workspace relative flex min-h-[480px] flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-950/70 shadow-xl">
           <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-md border border-white/10 bg-black/70 px-3 py-2 backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">
                {mode === "bg-remove" ? "Image Source" : "Workspace"}
              </span>
           </div>

           <div className="flex flex-1 items-center justify-center bg-black/20 p-4 sm:p-6">
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-full min-h-[390px] w-full cursor-pointer flex-col items-center justify-center gap-6 rounded-md border border-dashed border-white/15 px-5 text-center transition-all duration-300 hover:border-cyan-300/40 hover:bg-cyan-300/[0.03]"
                >
                   <div className="flex size-16 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200 shadow-[0_12px_35px_rgba(34,211,238,0.08)]">
                      <Upload size={28} />
                   </div>
                   <div className="text-center space-y-2">
                      <h3 className="text-lg font-bold text-white">Choose an image</h3>
                      <p className="text-zinc-500 text-sm font-medium">
                        {isPro && mode === "bg-remove" ? "Upload up to 10 images for Pro batch cutouts" : "Drag & drop or click to browse"}
                      </p>
                      {mode === "bg-remove" && (
                        <div className="mx-auto mt-3 w-fit rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                          Pro batch processing available
                        </div>
                      )}
                   </div>
                   <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple={isPro && mode === "bg-remove"} onChange={handleUpload} />
                </div>
              ) : (
                <div className="relative max-w-full">
                   {mode === "bg-remove" ? (
                      <img src={image} className="rounded-2xl shadow-2xl max-w-full block" alt="Source" />
                   ) : (
                      <>
                        <canvas ref={canvasRef} className="rounded-2xl shadow-2xl max-w-full block" />
                        <canvas 
                          ref={maskCanvasRef} 
                          className={cn(
                             "absolute top-0 left-0 cursor-crosshair max-w-full block",
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
                      </>
                   )}
                </div>
              )}
           </div>

           {/* WORKSPACE TOOLBAR */}
           {image && !result && (
             <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/40 p-3 sm:p-4">
                {mode === "object-erase" && (
                   <div className="flex flex-wrap items-center gap-3 md:gap-6">
                      <div className="flex items-center gap-2 rounded-md border border-white/10 bg-zinc-900/80 p-1 shadow-inner">
                         <button onClick={() => setBrushSize(Math.max(5, brushSize - 5))} className="flex size-10 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"><Minus size={14}/></button>
                         <div className="flex flex-col items-center min-w-[45px]">
                            <span className="text-[10px] font-black text-white">{brushSize}px</span>
                            <span className="text-[8px] text-zinc-600 font-bold uppercase">Size</span>
                         </div>
                         <button onClick={() => setBrushSize(Math.min(150, brushSize + 5))} className="flex size-10 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"><Plus size={14}/></button>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <button onClick={undo} disabled={maskHistoryIndex <= 0} className="flex size-11 items-center justify-center rounded-md border border-white/10 bg-white/5 text-zinc-400 transition-all hover:text-white disabled:opacity-20"><Undo2 size={16} /></button>
                         <button onClick={redo} disabled={maskHistoryIndex >= maskHistory.length - 1} className="flex size-11 items-center justify-center rounded-md border border-white/10 bg-white/5 text-zinc-400 transition-all hover:text-white disabled:opacity-20"><Redo2 size={16} /></button>
                      </div>
                   </div>
                )}
                
                <button 
                   onClick={processAction} 
                   disabled={isProcessing} 
                   className={cn(
                     "premium-gradient flex min-h-11 items-center gap-2 whitespace-nowrap rounded-md px-5 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50",
                     mode === "bg-remove" && "mx-auto"
                   )}
                >
                   {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                   <span>{mode === "bg-remove" ? "Remove Background" : "Erase Selected"}</span>
                </button>
             </div>
           )}
        </div>

        {/* RIGHT SIDE: RESULT / BEFORE-AFTER */}
        <div className="group/result relative flex min-h-[480px] flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-950/70 shadow-xl">
           <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-md border border-white/10 bg-black/70 px-3 py-2 backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Result</span>
           </div>

           <div className="relative flex flex-1 items-center justify-center bg-[linear-gradient(45deg,rgba(255,255,255,.025)_25%,transparent_25%,transparent_75%,rgba(255,255,255,.025)_75%),linear-gradient(45deg,rgba(255,255,255,.025)_25%,transparent_25%,transparent_75%,rgba(255,255,255,.025)_75%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] p-4 sm:p-6">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-8 text-center">
                   <div className="relative w-24 h-24">
                      <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-accent-purple animate-spin" />
                   </div>
                   <div className="space-y-2">
                      {isPro && (
                        <div className="mx-auto mb-4 w-fit px-4 py-2 rounded-full bg-amber-400/10 border border-amber-300/30 shadow-[0_0_24px_rgba(251,191,36,0.12)] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-200">
                         <Zap size={13} className="fill-amber-200" />
                          Priority Mode
                        </div>
                      )}
                      <h3 className="text-xl font-black text-white uppercase tracking-widest animate-pulse">
                        {batchFiles.length > 1 && isPro
                          ? `Processing batch ${batchResults.length + 1}/${batchFiles.length}`
                          : isPro ? "Processing with Priority..." : mode === "bg-remove" ? "Removing background..." : "Erasing object..."}
                      </h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        {batchFiles.length > 1 && isPro ? `${batchProgress}% complete - ZIP export ready after processing` : mode === "bg-remove" ? "Generating high-quality cutout" : "Synthesizing realistic background"}
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
                            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2"
                          >
                             <Check size={14} /> {successMessage}
                          </motion.div>
                       )}
                    </AnimatePresence>
                    {showComparison ? (
                       <div className="relative w-full aspect-auto rounded-2xl overflow-hidden shadow-4xl border border-white/10 cursor-ew-resize">
                          <img src={image || ""} className="w-full h-auto block" alt="Before" />
                          <div 
                            className="absolute inset-0 overflow-hidden" 
                            style={{ clipPath: `inset(0 0 0 ${comparisonValue}%)` }}
                          >
                             <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                                <img src={result} className="w-full h-auto block" alt="After" />
                             </div>
                          </div>
                          
                          <div 
                            className="absolute inset-y-0 w-1 bg-white z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                            style={{ left: `${comparisonValue}%` }}
                          >
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-accent-purple/20">
                                <div className="flex gap-1">
                                   <div className="w-0.5 h-3 bg-accent-purple rounded-full" />
                                   <div className="w-0.5 h-3 bg-accent-purple rounded-full" />
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

                          <div className="absolute top-4 left-1/4 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black text-white uppercase tracking-widest pointer-events-none">Original</div>
                          <div className="absolute top-4 right-1/4 translate-x-1/2 px-4 py-1.5 rounded-full bg-accent-purple/60 backdrop-blur-md border border-accent-purple/20 text-[8px] font-black text-white uppercase tracking-widest pointer-events-none">Result</div>
                       </div>
                    ) : (
                       <img src={result} className="w-full h-auto rounded-2xl shadow-4xl" alt="Final" />
                    )}

                    <div className="mt-8 flex items-center gap-4">
                       <button 
                         onClick={() => setShowComparison(!showComparison)}
                         className={cn(
                            "px-6 py-3 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2",
                            showComparison ? "bg-accent-purple border-accent-purple/30 text-white" : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                         )}
                       >
                          <Layers size={14} /> {showComparison ? "Hide Comparison" : "Show Comparison"}
                       </button>
                    </div>
                 </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-center opacity-20">
                   <LayoutGrid size={64} className="text-zinc-600" />
                   <div className="space-y-1">
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Ready for action</p>
                      <p className="text-zinc-600 text-[8px] font-bold uppercase tracking-widest leading-loose">
                        {mode === "bg-remove" ? "Upload an image to remove its background" : "Paint over objects to erase them naturally"}
                      </p>
                   </div>
                </div>
              )}
           </div>

           {/* RESULT ACTIONS */}
           {result && !isProcessing && (
              <div className="flex flex-col items-stretch justify-center gap-2 border-t border-white/10 bg-black/20 p-3 sm:flex-row sm:p-4">
                 <button 
                   onClick={batchResults.length > 1 ? downloadBatchZip : () => {
                     const a = document.createElement("a");
                     a.href = result;
                     a.download = `${mode === 'bg-remove' ? 'cutout' : 'retouched'}-${fileName}`;
                     a.click();
                   }}
                   className="premium-gradient flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md px-5 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
                 >
                    {batchResults.length > 1 ? <Archive size={20} /> : <Download size={20} />}
                    {batchResults.length > 1 ? `Download ${batchResults.length} as ZIP` : "Download Result"}
                 </button>
                 <button 
                   onClick={resetAll}
                   className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-5 text-xs font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
                 >
                    <RefreshCw size={20} /> New
                 </button>
              </div>
           )}
        </div>

      </div>

      {/* BOTTOM INFO PANEL */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
         {[
           { icon: Zap, label: "AI Precision", value: mode === 'bg-remove' ? "Bria-AI RMBG" : "Flux Inpainting", color: "text-amber-500" },
           { icon: ShieldCheck, label: "Quality", value: "Lossless export", color: "text-emerald-500" },
           { icon: History, label: "Cloud Sync", value: "History enabled", color: "text-accent-blue" }
         ].map((stat, i) => (
           <div key={i} className="group flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-950/55 p-4 transition-all hover:border-white/20">
              <div className={cn("flex size-11 items-center justify-center rounded-md bg-white/5", stat.color)}>
                 <stat.icon size={20} />
              </div>
              <div className="text-left">
                 <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                 <div className="text-xs text-white font-bold">{stat.value}</div>
              </div>
           </div>
         ))}
      </div>

    </div>
  );
}
