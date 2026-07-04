"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  src: string;
  file: File;
  name: string;
  size: number;
}

type OutputFormat = "jpg" | "png" | "webp";

const PRESETS = [
  { id: "ig", label: "Instagram", icon: Camera, w: 1080, h: 1080, ratio: 1/1 },
  { id: "yt", label: "YouTube", icon: Video, w: 1920, h: 1080, ratio: 16/9 },
  { id: "fb", label: "Facebook", icon: Share2, w: 1200, h: 630, ratio: 1.91/1 },
  { id: "full", label: "Desktop", icon: Monitor, w: 1920, h: 1080, ratio: 16/9 },
  { id: "custom", label: "Custom", icon: Move, w: 0, h: 0, ratio: undefined }
];

export function ImageResizerCropper() {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [result, setResult] = useState<{ url: string, size: number, width: number, height: number, format: OutputFormat } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cropper State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Settings
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [format, setFormat] = useState<OutputFormat>("jpg");
  const [quality, setQuality] = useState(90);
  const [lockRatio, setLockRatio] = useState(true);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const loadFile = (file?: File) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }
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
        setError(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadFile(e.target.files?.[0]);
  };

  useEffect(() => {
    setResult(null);
  }, [crop, zoom, croppedAreaPixels, width, height, format, quality]);

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
      setHeight(Math.max(1, Math.round(safeVal / aspect)));
    } else if (safeVal > 0 && height > 0) {
      // In custom/unlocked mode, update the crop box to reflecttyped dimensions
      setAspect(safeVal / height);
    }
  };

  const handleHeightChange = (val: number) => {
    const safeVal = isNaN(val) ? 0 : val;
    setHeight(safeVal);
    if (lockRatio && aspect) {
      setWidth(Math.max(1, Math.round(safeVal * aspect)));
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
    if (width < 1 || height < 1) {
      setError("Width and height must be at least 1px.");
      return;
    }
    setIsProcessing(true);
    setError(null);

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
        setResult({ url: data.result, size: data.size, width: data.width, height: data.height, format: data.format });
      } else {
        throw new Error(data.error || "Resize failed");
      }
    } catch (err: unknown) {
      console.error("Resize failed:", err);
      setError(err instanceof Error ? err.message : "Resize failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-10">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        
        {/* LEFT: WORKSPACE */}
        <div className="flex flex-col gap-5 lg:col-span-8">
           <div
             onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => {
               e.preventDefault();
               loadFile(e.dataTransfer.files?.[0]);
             }}
             className={cn(
             "group relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-zinc-950/65 shadow-xl transition-all duration-300 sm:min-h-[500px]",
             !asset && "border-dashed border-white/15 hover:border-cyan-300/40 hover:bg-cyan-300/[0.03]"
           )}>
              {!asset ? (
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-5 p-6 text-center">
                   <div className="flex size-16 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] text-cyan-200 shadow-lg transition-all group-hover:border-cyan-300/30">
                      <Upload size={28} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white">Choose an image to resize</h3>
                      <p className="text-sm font-medium text-zinc-500">Drop an image here or browse from your device.</p>
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

              {asset && (
                <button
                  onClick={() => {
                    setAsset(null);
                    setResult(null);
                    setCroppedAreaPixels(null);
                    setError(null);
                  }}
                  className="absolute right-4 top-4 z-40 flex size-11 items-center justify-center rounded-md border border-white/10 bg-black/70 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
                  title="Start over"
                >
                  <RefreshCw size={16} />
                </button>
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
              <div className="space-y-6 rounded-lg border border-white/10 bg-zinc-950/65 p-5 shadow-xl sm:p-6">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                       <Maximize2 size={14} className="text-accent-purple" />
                       Output Scale
                    </h4>
                    <button 
                      onClick={() => setLockRatio(!lockRatio)}
                      className={cn("flex size-11 items-center justify-center rounded-md transition-all", lockRatio ? "bg-cyan-300/10 text-cyan-200" : "text-zinc-600 hover:bg-white/5 hover:text-white")}
                      title={lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                    >
                       {lockRatio ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-bold text-zinc-600 uppercase ml-2">Width</label>
                       <input 
                         type="number" value={width} onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                         min={1}
                         max={8000}
                         className="h-12 w-full rounded-md border border-white/10 bg-white/5 px-4 font-bold text-white focus:border-cyan-300/50 focus:outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-bold text-zinc-600 uppercase ml-2">Height</label>
                       <input 
                         type="number" value={height} onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                         min={1}
                         max={8000}
                         className="h-12 w-full rounded-md border border-white/10 bg-white/5 px-4 font-bold text-white focus:border-cyan-300/50 focus:outline-none"
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-5 rounded-lg border border-white/10 bg-zinc-950/65 p-5 shadow-xl sm:p-6">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} className="text-accent-cyan" />
                    Encoder Settings
                 </h4>
                 <div className="flex gap-2">
                    {(["jpg", "png", "webp"] as const).map(fmt => (
                      <button 
                        key={fmt} onClick={() => setFormat(fmt)}
                        className={cn(
                          "h-12 flex-1 rounded-md border text-[10px] font-bold uppercase tracking-wider transition-all",
                          format === fmt ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-white"
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
                 <div className="space-y-2 pt-2">
                   <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                      <span className="flex items-center gap-2"><Minimize2 size={12} /> Zoom</span>
                      <span>{zoom.toFixed(1)}x</span>
                   </div>
                   <input
                     type="range"
                     min="1"
                     max="3"
                     step="0.1"
                     value={zoom}
                     onChange={(e) => setZoom(Number(e.target.value))}
                     className="w-full accent-accent-cyan h-1 bg-white/5 rounded-full"
                   />
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT: PRESETS & ACTIONS */}
        <div className="space-y-4 lg:col-span-4">
           <div className="space-y-7 rounded-lg border border-white/10 bg-zinc-950/65 p-5 shadow-xl sm:p-6">
              <div className="space-y-2">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Size presets</h3>
                 <p className="text-xs font-medium text-zinc-500">Common dimensions for social and web images.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 {PRESETS.map((p) => {
                   const Icon = p.icon;
                   const Active = aspect === p.ratio && (p.id !== "custom");
                   return (
                     <button 
                       key={p.id} onClick={() => applyPreset(p)}
                       className={cn(
                         "group flex min-h-14 items-center justify-between rounded-md border p-4 transition-all",
                         Active ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100 shadow-sm" : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-white"
                       )}
                     >
                        <div className="flex items-center gap-4">
                         <Icon size={20} className={Active ? "text-cyan-100" : "group-hover:text-cyan-200"} />
                           <div className="text-left">
                              <p className="text-[10px] font-black uppercase tracking-widest">{p.label}</p>
                              {p.w > 0 && <p className="text-[9px] font-bold opacity-60">{p.w} x {p.h}</p>}
                           </div>
                        </div>
                        {Active && <Check size={16} />}
                     </button>
                   );
                 })}
              </div>

              <div className="space-y-4 pt-6">
                 {error && (
                   <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold leading-relaxed">
                     {error}
                   </div>
                 )}
                 <button 
                   disabled={!asset || isProcessing}
                   onClick={processImage}
                   className="premium-gradient flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-5 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                 >
                    <CropIcon size={24} />
                    Crop & Process
                 </button>
                 {result && (
                   <button 
                     onClick={() => {
                       const a = document.createElement("a");
                       a.href = result.url;
                       a.download = `toolverse_${asset?.name?.replace(/\.[^.]+$/, "") || "image"}.${result.format}`;
                       a.click();
                     }}
                     className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-white px-5 text-xs font-bold text-black shadow-lg transition-all hover:bg-zinc-200"
                   >
                      <Download size={24} />
                      Export {result.width}x{result.height} {result.format.toUpperCase()} / {formatSize(result.size)}
                   </button>
                 )}
                 {/* LIVE PREVIEW / RESULT DISPLAY */}
                 <div className="group relative min-h-[320px] overflow-hidden rounded-lg border border-white/10 bg-black/25">
                    <div className="absolute left-3 top-3 z-10 rounded-md border border-white/10 bg-black/70 px-3 py-2 backdrop-blur-md">
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">
                         {result ? "Export Optimized" : "Live Monitor"}
                       </span>
                    </div>

                    <div className="h-full flex flex-col items-center justify-center p-4">
                       {result ? (
                         <img src={result.url} className="h-auto w-full rounded-md" alt="Result" />
                       ) : asset ? (
                         <div className="w-full h-full flex items-center justify-center">
                            <canvas ref={previewCanvasRef} className="max-w-full max-h-[400px] rounded-2xl shadow-4xl object-contain bg-zinc-950" />
                         </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center p-12 text-center">
                          <CropIcon size={48} className="text-zinc-800 mb-6" />
                          <p className="text-zinc-700 text-xs font-bold uppercase tracking-widest leading-loose">
                             Upload an image to preview the crop.
                          </p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           {result && asset && (
             <div className="flex items-center gap-4 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.04] p-4">
                <div className="flex size-11 items-center justify-center rounded-md bg-emerald-400/10 text-emerald-300">
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
