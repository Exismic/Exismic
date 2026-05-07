"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { 
  Crop as CropIcon, 
  Upload, 
  Download, 
  Maximize2, 
  Minimize2, 
  Zap,
  Check,
  Loader2,
  Camera,
  Video,
  Share2,
  Monitor,
  RefreshCw,
  Lock,
  Unlock,
  Move
} from "lucide-react";
import Cropper, { Area } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  src: string;
  file: File;
  name: string;
  size: number;
}

const PRESETS = [
  { id: "ig", label: "Instagram", icon: Camera, w: 1080, h: 1080, ratio: 1/1 },
  { id: "yt", label: "YouTube", icon: Video, w: 1920, h: 1080, ratio: 16/9 },
  { id: "fb", label: "Facebook", icon: Share2, w: 1200, h: 630, ratio: 1.91/1 },
  { id: "full", label: "Desktop", icon: Monitor, w: 1920, h: 1080, ratio: 16/9 },
  { id: "custom", label: "Custom", icon: Move, w: 0, h: 0, ratio: undefined }
];

export function ImageResizerCropper() {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [result, setResult] = useState<{ url: string, size: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Cropper State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Settings
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [format, setFormat] = useState<"jpg" | "png" | "webp">("jpg");
  const [quality, setQuality] = useState(90);
  const [lockRatio, setLockRatio] = useState(true);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAsset({
          id: Math.random().toString(36),
          src: ev.target?.result as string,
          file,
          name: file.name,
          size: file.size
        });
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Live Preview Logic
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!asset || !croppedAreaPixels || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = asset.src;
    img.onload = () => {
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
    };
  }, [asset, croppedAreaPixels]);

  // Sync dimensions when lock is on
  const handleWidthChange = (val: number) => {
    const safeVal = isNaN(val) ? 0 : val;
    setWidth(safeVal);
    if (lockRatio && aspect) {
      setHeight(Math.round(safeVal / aspect));
    } else if (safeVal > 0 && height > 0) {
      // In custom/unlocked mode, update the crop box to reflecttyped dimensions
      setAspect(safeVal / height);
    }
  };

  const handleHeightChange = (val: number) => {
    const safeVal = isNaN(val) ? 0 : val;
    setHeight(safeVal);
    if (lockRatio && aspect) {
      setWidth(Math.round(safeVal * aspect));
    } else if (safeVal > 0 && width > 0) {
      // In custom/unlocked mode, update the crop box to reflect typed dimensions
      setAspect(width / safeVal);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    if (preset.id === "custom") {
      setAspect(undefined);
      setLockRatio(false);
    } else {
      setAspect(preset.ratio);
      setLockRatio(true);
      if (preset.w > 0) {
        setWidth(preset.w);
        setHeight(preset.h);
      }
    }
  };

  const processImage = async () => {
    if (!asset || !croppedAreaPixels) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", asset.file);
      formData.append("crop", JSON.stringify(croppedAreaPixels));
      // Use the latest state values
      formData.append("width", width.toString());
      formData.append("height", height.toString());
      formData.append("format", format);
      formData.append("quality", quality.toString());

      const response = await fetch("/api/tools/image/resizer", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setResult({ url: data.result, size: data.size });
      }
    } catch (err) {
      console.error("Resize failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT: WORKSPACE */}
        <div className="lg:col-span-8 flex flex-col gap-8">
           <div className={cn(
             "relative rounded-[3.5rem] glass-dark border-2 border-white/5 overflow-hidden transition-all duration-500 min-h-[500px] group flex items-center justify-center",
             !asset && "border-dashed hover:border-accent-purple/30 group-hover:scale-[1.01]"
           )}>
              {!asset ? (
                <label className="cursor-pointer flex flex-col items-center gap-6 p-20 text-center">
                   <div className="w-24 h-24 rounded-full bg-accent-purple/10 flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform shadow-3xl">
                      <Upload size={40} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-widest">Master Canvas</h3>
                      <p className="text-zinc-500 text-sm font-medium">Drop high-res base image here</p>
                   </div>
                   <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
              ) : (
                <div className="absolute inset-0">
                   <Cropper
                     image={asset.src}
                     crop={crop}
                     zoom={zoom}
                     aspect={aspect}
                     onCropChange={setCrop}
                     onCropComplete={onCropComplete}
                     onZoomChange={setZoom}
                     classes={{ containerClassName: "bg-zinc-950" }}
                   />
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                   <Loader2 className="w-16 h-16 text-accent-purple animate-spin" />
                   <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Recalculating Dimensions...</p>
                </div>
              )}
           </div>

           {/* CONTROLS HUD */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2.5rem] glass-dark border border-white/5 space-y-8">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                       <Maximize2 size={14} className="text-accent-purple" />
                       Output Scale
                    </h4>
                    <button 
                      onClick={() => setLockRatio(!lockRatio)}
                      className={cn("p-2 rounded-lg transition-all", lockRatio ? "bg-accent-purple/10 text-accent-purple" : "text-zinc-600")}
                    >
                       {lockRatio ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-bold text-zinc-600 uppercase ml-2">Width</label>
                       <input 
                         type="number" value={width} onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                         className="w-full h-14 bg-white/5 border border-white/5 rounded-xl px-4 text-white font-bold focus:outline-none focus:border-accent-purple/50"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-bold text-zinc-600 uppercase ml-2">Height</label>
                       <input 
                         type="number" value={height} onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                         className="w-full h-14 bg-white/5 border border-white/5 rounded-xl px-4 text-white font-bold focus:outline-none focus:border-accent-purple/50"
                       />
                    </div>
                 </div>
              </div>

              <div className="p-8 rounded-[2.5rem] glass-dark border border-white/5 space-y-6">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} className="text-accent-cyan" />
                    Encoder Settings
                 </h4>
                 <div className="flex gap-2">
                    {(["jpg", "png", "webp"] as const).map(fmt => (
                      <button 
                        key={fmt} onClick={() => setFormat(fmt)}
                        className={cn(
                          "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          format === fmt ? "bg-accent-cyan text-black" : "bg-white/5 text-zinc-500 hover:text-white"
                        )}
                      >
                         {fmt}
                      </button>
                    ))}
                 </div>
                 <div className="space-y-2 pt-2">
                   <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                      <span>Quality</span>
                      <span>{quality}%</span>
                   </div>
                   <input 
                     type="range" min="10" max="100" value={quality}
                     onChange={(e) => setQuality(parseInt(e.target.value))}
                     className="w-full accent-accent-cyan h-1 bg-white/5 rounded-full"
                   />
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT: PRESETS & ACTIONS */}
        <div className="lg:col-span-4 space-y-8">
           <div className="p-10 rounded-[3rem] glass-dark border border-white/5 space-y-10">
              <div className="space-y-2">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Platform Presets</h3>
                 <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Optimized for social graphs</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 {PRESETS.map((p) => {
                   const Icon = p.icon;
                   const Active = aspect === p.ratio && (p.id !== "custom");
                   return (
                     <button 
                       key={p.id} onClick={() => applyPreset(p)}
                       className={cn(
                         "p-5 rounded-2xl flex items-center justify-between transition-all group border",
                         Active ? "bg-accent-purple border-accent-purple text-white shadow-3xl" : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/10"
                       )}
                     >
                        <div className="flex items-center gap-4">
                           <Icon size={20} className={Active ? "text-white" : "group-hover:text-accent-purple"} />
                           <div className="text-left">
                              <p className="text-[10px] font-black uppercase tracking-widest">{p.label}</p>
                              {p.w > 0 && <p className="text-[9px] font-bold opacity-60">{p.w} × {p.h}</p>}
                           </div>
                        </div>
                        {Active && <Check size={16} />}
                     </button>
                   );
                 })}
              </div>

              <div className="space-y-4 pt-6">
                 <button 
                   disabled={!asset || isProcessing}
                   onClick={processImage}
                   className="w-full py-6 rounded-3xl premium-gradient text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-3xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4"
                 >
                    <CropIcon size={24} />
                    Crop & Process
                 </button>
                 {result && (
                   <button 
                     onClick={() => {
                       const a = document.createElement("a");
                       a.href = result.url;
                       a.download = `toolverse_${asset?.name || "image"}.${format}`;
                       a.click();
                     }}
                     className="w-full py-6 rounded-3xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] shadow-3xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-4"
                   >
                      <Download size={24} />
                      Export {formatSize(result.size)}
                   </button>
                 )}
                 {/* LIVE PREVIEW / RESULT DISPLAY */}
                 <div className="relative rounded-[2.5rem] glass-dark border border-white/10 overflow-hidden min-h-[350px] group">
                    <div className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">
                         {result ? "Export Optimized" : "Live Monitor"}
                       </span>
                    </div>

                    <div className="h-full flex flex-col items-center justify-center p-4">
                       {result ? (
                         <img src={result.url} className="w-full h-auto rounded-3xl" alt="Result" />
                       ) : asset ? (
                         <div className="w-full h-full flex items-center justify-center">
                            <canvas ref={previewCanvasRef} className="max-w-full max-h-[400px] rounded-2xl shadow-4xl object-contain bg-zinc-950" />
                         </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center p-12 text-center">
                          <CropIcon size={48} className="text-zinc-800 mb-6" />
                          <p className="text-zinc-700 text-xs font-bold uppercase tracking-widest leading-loose">
                             Active Monitor Offline.<br/>Upload to start cropping.
                          </p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           {result && asset && (
             <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                   <Zap size={24} />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Storage Efficiency</p>
                   <p className="text-2xl font-black text-emerald-400">-{Math.round((1 - result.size / asset.size) * 100)}%</p>
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
