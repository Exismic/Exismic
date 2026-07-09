"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  CheckCircle2,
  Download,
  Eraser,
  Loader2,
  LocateFixed,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PRESETS: Array<{ label: string; region: Region }> = [
  { label: "Bottom Bar", region: { x: 0.08, y: 0.74, width: 0.84, height: 0.16 } },
  { label: "Center Logo", region: { x: 0.32, y: 0.38, width: 0.36, height: 0.2 } },
  { label: "Top Right", region: { x: 0.62, y: 0.06, width: 0.3, height: 0.14 } },
  { label: "Date Stamp", region: { x: 0.58, y: 0.76, width: 0.34, height: 0.14 } },
];

export function WatermarkRemover() {
  const { isPro } = useCredits();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>(PRESETS[0].region);
  const [strength, setStrength] = useState(74);
  const [sliderPos, setSliderPos] = useState(50);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const loadFile = useCallback((selectedFile?: File) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
    setProgress(0);
    setSliderPos(50);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    loadFile(acceptedFiles[0]);
  }, [loadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".avif"] },
    multiple: false,
  });

  const updateRegionCenter = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = (clientX - rect.left) / rect.width;
    const centerY = (clientY - rect.top) / rect.height;
    setRegion((current) => ({
      ...current,
      x: Math.max(0, Math.min(1 - current.width, centerX - current.width / 2)),
      y: Math.max(0, Math.min(1 - current.height, centerY - current.height / 2)),
    }));
    setResult(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(8);
    setStatusMessage("Preparing selected removal zone...");
    setError(null);

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev > 88) return prev;
        if (prev > 68) setStatusMessage("Blending reconstructed pixels...");
        else if (prev > 38) setStatusMessage("Rebuilding texture around the watermark...");
        return prev + 6;
      });
    }, 350);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("region", JSON.stringify(region));
      formData.append("strength", strength.toString());
      formData.append("priority", String(isPro));

      const response = await fetch("/api/tools/image/watermark-remover", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Watermark removal failed.");
      }

      const blob = await response.blob();
      setResult(URL.createObjectURL(blob));
      setProgress(100);
      setStatusMessage("Clean image ready.");
    } catch (err: unknown) {
      console.error("Processing failed:", err);
      setError(err instanceof Error ? err.message : "Processing failed. Please try again.");
      setStatusMessage("Processing failed.");
    } finally {
      window.clearInterval(interval);
      window.setTimeout(() => setIsProcessing(false), 250);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setProgress(0);
    setStatusMessage("");
    setError(null);
    setRegion(PRESETS[0].region);
  };

  const updateSlider = (clientX: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSliderPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 space-y-8">
      {!preview ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          <div
            {...getRootProps()}
            className={cn(
              "min-h-[500px] rounded-[3.5rem] border-2 border-dashed transition-all duration-700 flex flex-col items-center justify-center p-12 text-center group cursor-pointer glass-dark",
              isDragActive ? "border-accent-purple bg-accent-purple/5 shadow-2xl" : "border-zinc-800 hover:border-white/20"
            )}
          >
            <input {...getInputProps()} />
            <div className="w-28 h-28 rounded-[2.5rem] bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover:text-accent-purple group-hover:scale-110 transition-all duration-700 shadow-3xl border border-white/5 mb-8">
              <Upload size={48} />
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight">Select An Image</h3>
            <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-md mx-auto mt-3">
              Upload your own image and mark the exact logo, date stamp, or watermark area to clean.
            </p>
            <div className="mt-8 px-10 py-4 rounded-2xl premium-gradient text-white font-black text-xs uppercase tracking-widest shadow-2xl group-hover:scale-105 transition-all">
              Upload Photo
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <section className="xl:col-span-8 space-y-6">
            <div
              ref={stageRef}
              className="relative min-h-[620px] rounded-[3rem] glass-dark border border-white/10 overflow-hidden bg-zinc-950 shadow-4xl select-none"
              onClick={(event) => !result && updateRegionCenter(event.clientX, event.clientY)}
              onMouseDown={(event) => result && updateSlider(event.clientX)}
              onMouseMove={(event) => result && event.buttons === 1 && updateSlider(event.clientX)}
              onTouchMove={(event) => result && updateSlider(event.touches[0].clientX)}
            >
              {!result ? (
                <>
                  <img src={preview} alt="Source" className="absolute inset-0 w-full h-full object-contain" />
                  <div
                    className="absolute border-2 border-accent-purple bg-accent-purple/15 shadow-[0_0_30px_rgba(168,85,247,0.4)] rounded-xl pointer-events-none"
                    style={{
                      left: `${region.x * 100}%`,
                      top: `${region.y * 100}%`,
                      width: `${region.width * 100}%`,
                      height: `${region.height * 100}%`,
                    }}
                  >
                    <div className="absolute -top-9 left-0 px-3 py-1.5 rounded-full bg-accent-purple text-white text-[9px] font-black uppercase tracking-widest">
                      Removal zone
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <img src={preview} alt="Before" className="absolute inset-0 w-full h-full object-contain" />
                  <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                    <img src={result} alt="After" className="absolute inset-0 w-full h-full object-contain" />
                  </div>
                  <div className="absolute top-5 left-5 px-4 py-2 rounded-full bg-black/70 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                    Cleaned
                  </div>
                  <div className="absolute top-5 right-5 px-4 py-2 rounded-full bg-black/70 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                    Original
                  </div>
                  <div className="absolute top-0 bottom-0 w-px bg-white shadow-[0_0_24px_rgba(255,255,255,0.8)]" style={{ left: `${sliderPos}%` }}>
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-3xl">
                      <Eraser size={22} />
                    </div>
                  </div>
                </>
              )}

              <AnimatePresence>
                {isProcessing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-12 space-y-8">
                    <Loader2 className="w-20 h-20 text-accent-purple animate-spin" />
                    {isPro && (
                      <div className="px-4 py-2 rounded-full bg-amber-300/10 border border-amber-300/30 text-[10px] font-black uppercase tracking-widest text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.12)]">
                        ⚡ Priority Mode
                      </div>
                    )}
                    <div className="w-full max-w-md h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div className="h-full premium-gradient" animate={{ width: `${progress}%` }} />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-black text-white uppercase tracking-tight">{statusMessage}</p>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{progress}% complete</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-sm font-bold text-red-300">
                {error}
              </div>
            )}
          </section>

          <aside className="xl:col-span-4 space-y-6">
            <div className="rounded-[3rem] glass-dark border border-white/10 p-8 space-y-8">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Removal Studio</h3>
                <p className="mt-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  Click the image to move the removal zone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setRegion(preset.region);
                      setResult(null);
                    }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-accent-purple/30 text-left transition-all"
                  >
                    <LocateFixed size={16} className="text-accent-purple mb-3" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{preset.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Zone Size</p>
                  <p className="text-[10px] font-black text-white">{Math.round(region.width * 100)}%</p>
                </div>
                <input
                  type="range"
                  min="8"
                  max="80"
                  value={Math.round(region.width * 100)}
                  onChange={(event) => {
                    const width = Number(event.target.value) / 100;
                    setRegion((current) => ({ ...current, width, height: Math.max(0.06, width * 0.33) }));
                    setResult(null);
                  }}
                  className="w-full accent-accent-purple h-1 bg-white/5 rounded-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Blend Strength</p>
                  <p className="text-[10px] font-black text-white">{strength}%</p>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={strength}
                  onChange={(event) => setStrength(Number(event.target.value))}
                  className="w-full accent-accent-purple h-1 bg-white/5 rounded-full"
                />
              </div>

              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full px-8 py-5 rounded-2xl premium-gradient text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-3xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {isProcessing ? "Cleaning..." : "Remove Watermark"}
              </button>

              {result && (
                <a
                  href={result}
                  download={`exismic-no-watermark-${Date.now()}.jpg`}
                  className="w-full px-8 py-5 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.25em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"
                >
                  <Download size={20} />
                  Download Result
                </a>
              )}

              <button
                onClick={reset}
                className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-zinc-400 font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/[0.06] transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw size={16} />
                New Image
              </button>
            </div>

            <div className="rounded-[2.5rem] bg-accent-cyan/5 border border-accent-cyan/10 p-6 grid grid-cols-2 gap-4 text-zinc-400">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-accent-cyan" />
                <span className="text-[9px] font-black uppercase tracking-widest">Private</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-accent-purple" />
                <span className="text-[9px] font-black uppercase tracking-widest">Region Based</span>
              </div>
              {result && (
                <div className="col-span-2 flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Clean image ready</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
