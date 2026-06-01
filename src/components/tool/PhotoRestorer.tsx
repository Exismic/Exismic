"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Contrast,
  Download,
  Heart,
  ImageDown,
  Loader2,
  Maximize,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RestoredAsset {
  original: string;
  restored: string;
  originalSize: number;
  restoredSize: number;
  width?: number;
  height?: number;
  provider?: string;
}

const progressMessages = [
  "Scanning damage and grain...",
  "Rebuilding facial detail...",
  "Balancing faded color...",
  "Sharpening fine texture...",
  "Preparing high quality export...",
];

export function PhotoRestorer() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<RestoredAsset | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const [strength, setStrength] = useState(72);
  const [enhanceFaces, setEnhanceFaces] = useState(true);
  const [colorCorrect, setColorCorrect] = useState(true);
  const [sharpenDetails, setSharpenDetails] = useState(true);
  const [denoise, setDenoise] = useState(true);
  const [upscale, setUpscale] = useState<1 | 2>(1);

  useEffect(() => {
    if (!isProcessing) return;

    setProgress(8);
    setMessageIndex(0);
    const timer = window.setInterval(() => {
      setProgress((prev) => Math.min(92, prev + Math.max(1, Math.round((96 - prev) * 0.08))));
      setMessageIndex((prev) => Math.min(progressMessages.length - 1, prev + 1));
    }, 1200);

    return () => window.clearInterval(timer);
  }, [isProcessing]);

  const loadFile = (uploadedFile?: File) => {
    if (!uploadedFile) return;
    if (!uploadedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    setFile(uploadedFile);
    setResult(null);
    setError(null);
    setSliderPos(50);

    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.readAsDataURL(uploadedFile);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    loadFile(event.target.files?.[0]);
  };

  const processRestoration = async () => {
    if (!file || !image) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("strength", strength.toString());
      formData.append("faces", enhanceFaces.toString());
      formData.append("color", colorCorrect.toString());
      formData.append("sharpen", sharpenDetails.toString());
      formData.append("denoise", denoise.toString());
      formData.append("upscale", upscale.toString());

      const response = await fetch("/api/tools/image/restorer", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Restoration failed");
      }

      setProgress(100);
      setResult({
        original: image,
        restored: data.result,
        originalSize: file.size,
        restoredSize: data.size,
        width: data.width,
        height: data.height,
        provider: data.provider,
      });
    } catch (err: unknown) {
      console.error("Restoration failed:", err);
      setError(err instanceof Error ? err.message : "Restoration failed. Please try again.");
    } finally {
      window.setTimeout(() => setIsProcessing(false), 300);
    }
  };

  const updateSlider = (clientX: number) => {
    const rect = comparisonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, next)));
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB"];
    const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${Number((bytes / Math.pow(1024, index)).toFixed(2))} ${units[index]}`;
  };

  const resetAll = () => {
    setImage(null);
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setSliderPos(50);
  };

  const downloadUrl = (url: string, name: string) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <section className="xl:col-span-5 space-y-6">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              loadFile(event.dataTransfer.files?.[0]);
            }}
            className="relative min-h-[520px] rounded-[3rem] glass-dark border border-white/10 overflow-hidden shadow-4xl"
          >
            {!image ? (
              <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-white/5 hover:border-accent-purple/30 transition-all">
                <div className="w-24 h-24 rounded-[2rem] bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple shadow-3xl mb-8">
                  <Upload size={40} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Restore A Photo</h3>
                <p className="mt-3 max-w-sm text-sm text-zinc-500 font-medium">
                  Upload old, faded, blurry, or damaged family photos for restoration.
                </p>
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
              </label>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                <img src={image} className="max-w-full max-h-full object-contain" alt="Original photo" />
                <div className="absolute top-5 left-5 px-4 py-2 rounded-full bg-black/70 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Original</span>
                </div>
                <button
                  onClick={resetAll}
                  className="absolute top-5 right-5 p-3 rounded-2xl bg-black/60 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Upload another photo"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="rounded-[2.5rem] glass-dark border border-white/10 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.25em]">Restoration Controls</h3>
                <p className="mt-1 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Face, color, grain, detail</p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-[10px] text-accent-purple font-black">
                {strength}%
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="range"
                min="10"
                max="100"
                value={strength}
                onChange={(event) => setStrength(Number(event.target.value))}
                className="w-full accent-accent-purple h-1 bg-white/5 rounded-full"
              />
              <div className="flex justify-between text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                <span>Gentle</span>
                <span>Maximum</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Face Restore", active: enhanceFaces, set: setEnhanceFaces, icon: Heart, color: "text-accent-purple" },
                { label: "Restore Color", active: colorCorrect, set: setColorCorrect, icon: Contrast, color: "text-accent-cyan" },
                { label: "Sharpen Detail", active: sharpenDetails, set: setSharpenDetails, icon: Maximize, color: "text-emerald-400" },
                { label: "Reduce Grain", active: denoise, set: setDenoise, icon: ShieldCheck, color: "text-amber-300" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.set(!item.active)}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all",
                    item.active ? "bg-white/8 border-white/15 text-white" : "bg-white/[0.02] border-white/5 text-zinc-600"
                  )}
                >
                  <item.icon size={18} className={cn("mb-4", item.active ? item.color : "text-zinc-700")} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] border border-white/5 p-4">
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Upscale Output</p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Use for tiny scanned photos</p>
              </div>
              <div className="flex rounded-xl bg-black/30 border border-white/5 p-1">
                {[1, 2].map((value) => (
                  <button
                    key={value}
                    onClick={() => setUpscale(value as 1 | 2)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black transition-all",
                      upscale === value ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                    )}
                  >
                    {value}x
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-sm font-bold text-red-300">
                {error}
              </div>
            )}

            <button
              disabled={!file || isProcessing}
              onClick={processRestoration}
              className="w-full py-5 rounded-2xl premium-gradient text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-3xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {isProcessing ? "Restoring..." : "Restore Photo"}
            </button>
          </div>
        </section>

        <section className="xl:col-span-7 space-y-6">
          <div className="relative min-h-[720px] rounded-[3rem] glass-dark border border-white/10 overflow-hidden shadow-4xl bg-zinc-950">
            {result ? (
              <div
                ref={comparisonRef}
                className="absolute inset-0 select-none cursor-ew-resize"
                onMouseMove={(event) => event.buttons === 1 && updateSlider(event.clientX)}
                onMouseDown={(event) => updateSlider(event.clientX)}
                onTouchMove={(event) => updateSlider(event.touches[0].clientX)}
              >
                <img src={result.original} className="absolute inset-0 w-full h-full object-contain" alt="Before restoration" />
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                  <img src={result.restored} className="absolute inset-0 w-full h-full object-contain" alt="After restoration" />
                </div>
                <div className="absolute top-5 left-5 px-4 py-2 rounded-full bg-black/70 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Restored</span>
                </div>
                <div className="absolute top-5 right-5 px-4 py-2 rounded-full bg-black/70 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Original</span>
                </div>
                <div className="absolute top-0 bottom-0 w-px bg-white shadow-[0_0_24px_rgba(255,255,255,0.8)]" style={{ left: `${sliderPos}%` }}>
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-3xl">
                    <Wand2 size={22} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-700 mb-8">
                  <Camera size={42} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Before / After Preview</h3>
                <p className="mt-3 max-w-md text-sm text-zinc-500 font-medium">
                  Restore a photo to compare the original and enhanced version with a smooth slider.
                </p>
              </div>
            )}

            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-10"
                >
                  <div className="relative mb-8">
                    <div className="absolute inset-0 rounded-full bg-accent-purple/20 blur-3xl" />
                    <Loader2 className="relative w-24 h-24 text-accent-purple animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
                  </div>
                  <p className="text-sm font-black text-white uppercase tracking-[0.35em] text-center">{progressMessages[messageIndex]}</p>
                  <div className="mt-8 w-full max-w-md h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div className="h-full premium-gradient" animate={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{progress}% complete</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {result && (
            <div className="rounded-[2.5rem] glass-dark border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Provider</p>
                  <p className="mt-1 text-[10px] font-black text-white uppercase">{result.provider || "local"}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Output</p>
                  <p className="mt-1 text-[10px] font-black text-white uppercase">{result.width}x{result.height}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Original</p>
                  <p className="mt-1 text-[10px] font-black text-white uppercase">{formatSize(result.originalSize)}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Restored</p>
                  <p className="mt-1 text-[10px] font-black text-white uppercase">{formatSize(result.restoredSize)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => downloadUrl(result.original, `original-${file?.name || "photo"}`)}
                  className="px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <ImageDown size={16} />
                  Original
                </button>
                <button
                  onClick={() => downloadUrl(result.restored, `restored-${file?.name?.replace(/\.[^.]+$/, "") || "photo"}.png`)}
                  className="px-6 py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2"
                >
                  <Download size={16} />
                  Restored
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 px-6 py-5 flex items-center gap-4 text-emerald-300">
              <Check size={20} />
              <p className="text-xs font-black uppercase tracking-widest">Photo restored and ready to download.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
