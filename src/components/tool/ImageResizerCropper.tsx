"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { 
  Crop as CropIcon, 
  Upload, 
  Download, 
  Maximize2, 
  Check, 
  Loader2, 
  Camera, 
  Video, 
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Lock, 
  Unlock, 
  Sliders,
  Layers,
  Copy,
  Smartphone,
  ImageIcon,
  X,
  RefreshCw,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import Cropper, { Area } from "react-easy-crop";
import { cn } from "@/lib/utils";
import { consumePipelineItem, pipelineUrlToFile } from "@/lib/pipeline";
import { saveFileHistory } from "@/lib/history";

interface Asset {
  id: string;
  src: string;
  file: File;
  name: string;
  size: number;
}

type OutputFormat = "jpg" | "png" | "webp";

interface AspectPreset {
  id: string;
  label: string;
  sublabel: string;
  icon: typeof Camera;
  w: number;
  h: number;
  ratio: number | undefined;
}

const ASPECT_PRESETS: AspectPreset[] = [
  { id: "1-1", label: "1:1 Square", sublabel: "Instagram Feed", icon: Camera, w: 1080, h: 1080, ratio: 1 },
  { id: "16-9", label: "16:9 Landscape", sublabel: "YouTube / Desktop", icon: Video, w: 1920, h: 1080, ratio: 16 / 9 },
  { id: "9-16", label: "9:16 Story", sublabel: "Reels / TikTok", icon: Smartphone, w: 1080, h: 1920, ratio: 9 / 16 },
  { id: "4-5", label: "4:5 Portrait", sublabel: "Social Post", icon: ImageIcon, w: 1080, h: 1350, ratio: 4 / 5 },
  { id: "4-3", label: "4:3 Standard", sublabel: "Classic Photo", icon: Layers, w: 1600, h: 1200, ratio: 4 / 3 },
  { id: "freeform", label: "Freeform", sublabel: "Custom Crop", icon: Maximize2, w: 0, h: 0, ratio: undefined }
];

interface DemoBlueprint {
  id: "instagram" | "youtube" | "story";
  name: string;
  badge: string;
  description: string;
  ratio: number;
  w: number;
  h: number;
  icon: typeof Camera;
}

const DEMO_BLUEPRINTS: DemoBlueprint[] = [
  {
    id: "instagram",
    name: "Instagram Square Feed",
    badge: "1:1 Square (1080×1080)",
    description: "High-contrast square camera photo with sunset mountain silhouettes and water reflections.",
    ratio: 1,
    w: 1080,
    h: 1080,
    icon: Camera,
  },
  {
    id: "youtube",
    name: "YouTube Video Banner",
    badge: "16:9 Frame (1920×1080)",
    description: "Vibrant wide cinematic city skyline with warm ambient bokeh lights and glowing horizon.",
    ratio: 16 / 9,
    w: 1920,
    h: 1080,
    icon: Video,
  },
  {
    id: "story",
    name: "Mobile Story & Reels",
    badge: "9:16 Vertical (1080×1920)",
    description: "High-resolution vertical portrait wallpaper with neon cyber gradients and sleek geometry.",
    ratio: 9 / 16,
    w: 1080,
    h: 1920,
    icon: Smartphone,
  },
];

// Client-side demo canvas synthesizer ($0 compute, 100% in-browser)
function generateDemoImageFile(type: "instagram" | "youtube" | "story"): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    let width = 1600;
    let height = 1200;

    if (type === "instagram") {
      width = 1400;
      height = 1400;
    } else if (type === "youtube") {
      width = 1920;
      height = 1080;
    } else {
      width = 1080;
      height = 1920;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(new File(["demo"], `sample-${type}.jpg`, { type: "image/jpeg" }));
      return;
    }

    if (type === "instagram") {
      // Sunset Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.7);
      sky.addColorStop(0, "#0f172a");
      sky.addColorStop(0.3, "#312e81");
      sky.addColorStop(0.65, "#be185d");
      sky.addColorStop(0.85, "#f97316");
      sky.addColorStop(1, "#fde047");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height * 0.7);

      // Glowing Sun
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.52, width * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = "#fffbeb";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 60;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Mountain layers
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.moveTo(0, height * 0.62);
      ctx.lineTo(width * 0.25, height * 0.48);
      ctx.lineTo(width * 0.45, height * 0.56);
      ctx.lineTo(width * 0.7, height * 0.45);
      ctx.lineTo(width, height * 0.55);
      ctx.lineTo(width, height * 0.7);
      ctx.lineTo(0, height * 0.7);
      ctx.fill();

      // Lake reflection
      const lake = ctx.createLinearGradient(0, height * 0.7, 0, height);
      lake.addColorStop(0, "#082f49");
      lake.addColorStop(0.5, "#0369a1");
      lake.addColorStop(1, "#082f49");
      ctx.fillStyle = lake;
      ctx.fillRect(0, height * 0.7, width, height * 0.3);

      ctx.fillStyle = "rgba(253, 224, 71, 0.35)";
      for (let y = height * 0.72; y < height * 0.96; y += 16) {
        const spread = (y - height * 0.7) * 1.5;
        ctx.fillRect(width * 0.5 - spread / 2, y, spread, 4);
      }
    } else if (type === "youtube") {
      // Cinematic 16:9 Landscape City
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#030712");
      bg.addColorStop(0.4, "#111827");
      bg.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Light grid lines
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.lineWidth = 1.5;
      for (let x = 100; x < width; x += 140) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x * 0.8 + 120, height);
        ctx.stroke();
      }

      // Bokeh circles
      const bokehColors = ["rgba(236, 72, 153, 0.3)", "rgba(6, 182, 212, 0.3)", "rgba(245, 158, 11, 0.25)"];
      for (let i = 0; i < 22; i++) {
        const bx = (i * 137) % (width - 100) + 50;
        const by = (i * 191) % (height - 100) + 50;
        const br = 30 + (i % 5) * 18;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = bokehColors[i % bokehColors.length];
        ctx.fill();
      }

      // Modern Center Banner Box
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(width * 0.3, height * 0.35, width * 0.4, height * 0.3, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("16:9 YOUTUBE BANNER", width * 0.5, height * 0.5);
    } else {
      // 9:16 Vertical Mobile Story
      const darkBg = ctx.createLinearGradient(0, 0, 0, height);
      darkBg.addColorStop(0, "#020617");
      darkBg.addColorStop(0.5, "#0f172a");
      darkBg.addColorStop(1, "#3b0764");
      ctx.fillStyle = darkBg;
      ctx.fillRect(0, 0, width, height);

      // Neon Rings
      for (let r = 80; r <= 360; r += 60) {
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 + (r / 360) * 0.4})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.45, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 38px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("9:16 STORY SAMPLE", width * 0.5, height * 0.65);

      ctx.fillStyle = "rgba(6, 182, 212, 0.9)";
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("TIKTOK & REELS READY", width * 0.5, height * 0.70);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], `sample-${type}.jpg`, { type: "image/jpeg" }));
      } else {
        resolve(new File(["demo"], `sample-${type}.jpg`, { type: "image/jpeg" }));
      }
    }, "image/jpeg", 0.95);
  });
}

export function ImageResizerCropper() {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [result, setResult] = useState<{ url: string, size: number, width: number, height: number, format: OutputFormat } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"cropper" | "controls">("cropper");
  
  // Cropper & Transform State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [activePresetId, setActivePresetId] = useState<string>("1-1");
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

  const loadFile = useCallback((file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, WebP, or AVIF).");
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
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadFile(e.target.files?.[0]);
  };

  // Global Clipboard Paste Listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const pastedFile = items[i].getAsFile();
          if (pastedFile) {
            loadFile(pastedFile);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loadFile]);

  // Consume incoming pipeline asset (e.g. from Background Remover or other image tools)
  useEffect(() => {
    const item = consumePipelineItem();
    if (item && item.url && item.fileType === "image") {
      pipelineUrlToFile(item.url, item.name || "pipeline-image.png")
        .then((file) => {
          loadFile(file);
        })
        .catch((err) => {
          console.warn("Failed to load pipeline asset into resizer:", err);
        });
    }
  }, [loadFile]);

  useEffect(() => {
    setResult(null);
  }, [crop, zoom, rotation, flipH, flipV, croppedAreaPixels, width, height, format, quality]);

  // Sync dimensions when lock is on
  const handleWidthChange = (val: number) => {
    const safeVal = isNaN(val) ? 0 : val;
    setWidth(safeVal);
    if (lockRatio && aspect) {
      setHeight(Math.max(1, Math.round(safeVal / aspect)));
    } else if (safeVal > 0 && height > 0) {
      setAspect(safeVal / height);
    }
  };

  const handleHeightChange = (val: number) => {
    const safeVal = isNaN(val) ? 0 : val;
    setHeight(safeVal);
    if (lockRatio && aspect) {
      setWidth(Math.max(1, Math.round(safeVal * aspect)));
    } else if (safeVal > 0 && width > 0) {
      setAspect(width / safeVal);
    }
  };

  const applyPreset = (preset: AspectPreset) => {
    setActivePresetId(preset.id);
    if (preset.id === "freeform") {
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

  const handleSelectDemo = async (demo: DemoBlueprint) => {
    try {
      const demoFile = await generateDemoImageFile(demo.id);
      loadFile(demoFile);
      setAspect(demo.ratio);
      setWidth(demo.w);
      setHeight(demo.h);
      setActivePresetId(demo.id === "instagram" ? "1-1" : demo.id === "youtube" ? "16-9" : "9-16");
    } catch (err) {
      console.error("Failed to load demo photo:", err);
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
      formData.append("width", width.toString());
      formData.append("height", height.toString());
      formData.append("format", format);
      formData.append("quality", quality.toString());
      formData.append("rotation", rotation.toString());
      formData.append("flipH", flipH ? "true" : "false");
      formData.append("flipV", flipV ? "true" : "false");

      const response = await fetch("/api/tools/image/resizer", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setResult({ url: data.result, size: data.size, width: data.width, height: data.height, format: data.format });
        saveFileHistory({
          toolType: "image-resizer",
          originalName: asset.name,
          resultUrl: data.result,
          fileType: "image",
          status: "completed",
          metadata: {
            prompt: `Resized (${data.width}×${data.height}): ${asset.name}`,
            width: data.width,
            height: data.height,
            format: data.format,
            targetHref: "/tools/image/resizer",
            settings: {
              dimensions: `${data.width}×${data.height}`,
              format: (data.format || "PNG").toUpperCase(),
            },
          }
        }).catch((e) => console.warn("Failed to save resize to history:", e));
      } else {
        throw new Error(data.error || "Crop and resize failed.");
      }
    } catch (err: unknown) {
      console.error("Resize failed:", err);
      setError(err instanceof Error ? err.message : "Crop and resize failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPicture = async () => {
    if (!result?.url) return;
    try {
      const res = await fetch(result.url);
      const blob = await res.blob();
      const pngBlob = blob.type === "image/png" ? blob : await new Promise<Blob>((resolve) => {
        const img = new Image();
        img.src = result.url;
        img.onload = () => {
          const cvs = document.createElement("canvas");
          cvs.width = img.width;
          cvs.height = img.height;
          const ctx = cvs.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          cvs.toBlob((b) => resolve(b || blob), "image/png");
        };
      });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard copy is not supported in this browser.");
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
    <div className="mx-auto w-full max-w-7xl space-y-5 animate-in fade-in duration-500 pb-8">
      
      {/* MOBILE VIEW SWITCHER */}
      <div className="lg:hidden grid grid-cols-2 p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1 shadow-lg mb-2">
        <button
          type="button"
          onClick={() => setActiveMobileTab("cropper")}
          className={cn(
            "py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeMobileTab === "cropper"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <CropIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cropper & Presets</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("controls")}
          className={cn(
            "py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeMobileTab === "controls"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Dimensions & Export</span>
        </button>
      </div>

      {/* DUAL COLUMN MAIN STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: CROPPER STAGE, ASPECT PRESETS & TEST BLUEPRINTS */}
        {/* ================================================================= */}
        <div className={cn("space-y-4 lg:col-span-7", activeMobileTab !== "cropper" ? "hidden lg:block" : "block")}>
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4">
            
            {/* Window Titlebar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-zinc-400 truncate max-w-[140px] sm:max-w-xs">
                  {asset ? asset.name : "photo_resizer.studio"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {asset && (
                  <>
                    {/* Zoom HUD in Titlebar — completely off the image */}
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-xl bg-black/50 border border-white/[0.1]">
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(1, Number((z - 0.2).toFixed(1))))}
                        title="Zoom Out"
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <ZoomOut size={13} />
                      </button>
                      <span className="text-[11px] font-mono font-semibold text-zinc-300 px-1 min-w-[34px] text-center select-none">
                        {zoom.toFixed(1)}x
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(3, Number((z + 0.2).toFixed(1))))}
                        title="Zoom In"
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <ZoomIn size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom(1)}
                        title="Reset Zoom"
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAsset(null);
                        setResult(null);
                        setCroppedAreaPixels(null);
                        setError(null);
                      }}
                      className="size-7 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                      title="Clear and choose another image"
                    >
                      <X size={13} />
                    </button>
                  </>
                )}

                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border",
                  result
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                )}>
                  {result ? "Cropped Photo Ready" : asset ? "Position Crop" : "Drop Photo"}
                </span>
              </div>
            </div>

            {/* Cropper Enclosure / Dropzone */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                loadFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "relative min-h-[380px] sm:min-h-[460px] max-h-[560px] w-full rounded-2xl bg-[#04060d] border border-white/[0.08] overflow-hidden flex items-center justify-center shadow-inner select-none",
                !asset && "border-dashed border-white/15 hover:border-cyan-400/50 hover:bg-cyan-500/[0.03] cursor-pointer"
              )}
            >
              {!asset ? (
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center select-none">
                  <div className="flex size-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-transform duration-300 group-hover:scale-110">
                    <Upload size={28} />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base sm:text-lg font-black text-white tracking-tight">
                      Upload Photo to Crop & Resize
                    </h4>
                    <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-sm">
                      Drop a picture here, click to browse, or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] border border-white/15">Ctrl + V</kbd> to paste from clipboard
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500 pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">PNG • JPG • WebP • AVIF</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">Up to 25MB</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">Lossless Resizing</span>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
              ) : (
                <div className={cn(
                  "absolute inset-0 transition-transform duration-200",
                  flipH && flipV ? "-scale-100" : flipH ? "-scale-x-100" : flipV ? "-scale-y-100" : ""
                )}>
                  <Cropper
                    image={asset.src}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    classes={{ containerClassName: "bg-[#04060d]" }}
                  />
                </div>
              )}

              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                  <p className="text-xs font-bold text-white tracking-wider animate-pulse">
                    Cropping & Resizing Image...
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Clean Aspect Ratio Presets Bar (Directly below Cropper stage) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center gap-2">
                <CropIcon className="w-3.5 h-3.5 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Clean Aspect Presets
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">1-click framing</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ASPECT_PRESETS.map((p) => {
                const Icon = p.icon;
                const isSelected = activePresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={cn(
                      "p-2.5 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between gap-2 group",
                      isSelected
                        ? "bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-transparent border-cyan-400/50 shadow-xs text-white"
                        : "bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
                        isSelected ? "bg-cyan-500/20 text-cyan-300" : "bg-white/[0.04] text-zinc-400 group-hover:text-zinc-200"
                      )}>
                        <Icon size={13} />
                      </div>
                      {isSelected && <Check size={12} className="text-cyan-400" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold tracking-tight block text-zinc-200 group-hover:text-white">
                        {p.label}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 block truncate">
                        {p.sublabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Instant 1-Click Demonstration Blueprints (Void Eliminator) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Instant Test Examples (1-Click Try)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Try without uploading files</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_BLUEPRINTS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-400/40 text-left transition-all group flex flex-col justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
                        <Icon size={16} />
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {demo.badge}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {demo.name}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">
                        {demo.description}
                      </p>
                    </div>

                    <div className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Load Frame</span>
                      <span>→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: RESIZE, TRANSFORM & EXPORT CONSOLE */}
        {/* ================================================================= */}
        <div className={cn("space-y-4 lg:col-span-5", activeMobileTab !== "controls" ? "hidden lg:block" : "block")}>
          <div className="p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Resize & Export Console
                </h3>
              </div>
              <button 
                type="button"
                title="Reset crop and rotation" 
                onClick={() => { 
                  setZoom(1); 
                  setRotation(0); 
                  setFlipH(false); 
                  setFlipV(false);
                  applyPreset(ASPECT_PRESETS[0]);
                }} 
                className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            {/* Target Dimensions (Width × Height) */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-200">Target Dimensions (Pixels)</label>
                <button 
                  type="button"
                  onClick={() => setLockRatio(!lockRatio)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border",
                    lockRatio 
                      ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" 
                      : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                  )}
                  title={lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                >
                  {lockRatio ? <Lock size={10} /> : <Unlock size={10} />}
                  <span>{lockRatio ? "Locked Ratio" : "Unlocked"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Width (px)</label>
                  <input 
                    type="number" 
                    value={width} 
                    onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                    min={1}
                    max={8000}
                    className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Height (px)</label>
                  <input 
                    type="number" 
                    value={height} 
                    onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                    min={1}
                    max={8000}
                    className="w-full rounded-xl border border-white/[0.08] bg-black/50 px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 pt-1">
                {[
                  { label: "1920×1080", w: 1920, h: 1080, r: 16/9 },
                  { label: "1080×1080", w: 1080, h: 1080, r: 1 },
                  { label: "1080×1920", w: 1080, h: 1920, r: 9/16 },
                  { label: "1200×630", w: 1200, h: 630, r: 1.91 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setWidth(item.w);
                      setHeight(item.h);
                      setAspect(item.r);
                    }}
                    className={cn(
                      "py-1 px-1 text-[9px] font-mono rounded-lg border text-center transition-all cursor-pointer",
                      width === item.w && height === item.h
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold"
                        : "bg-white/[0.02] text-zinc-400 border-white/[0.05] hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transform Bar (Rotate & Flip) */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <label className="text-xs font-semibold text-zinc-200 block">Rotate & Flip</label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="py-2 px-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 hover:text-white text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Rotate 90 degrees counter-clockwise"
                >
                  <RotateCcw size={14} className="text-cyan-400" />
                  <span className="text-[9px]">Rotate -90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="py-2 px-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 hover:text-white text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Rotate 90 degrees clockwise"
                >
                  <RotateCw size={14} className="text-cyan-400" />
                  <span className="text-[9px]">Rotate +90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH(!flipH)}
                  className={cn(
                    "py-2 px-1 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
                    flipH 
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50" 
                      : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.06] text-zinc-300 hover:text-white"
                  )}
                  title="Flip horizontally"
                >
                  <FlipHorizontal size={14} />
                  <span className="text-[9px]">Flip Horiz</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV(!flipV)}
                  className={cn(
                    "py-2 px-1 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
                    flipV 
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50" 
                      : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.06] text-zinc-300 hover:text-white"
                  )}
                  title="Flip vertically"
                >
                  <FlipVertical size={14} />
                  <span className="text-[9px]">Flip Vert</span>
                </button>
              </div>
            </div>

            {/* Output Format & Image Quality */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div>
                <label className="text-xs font-semibold text-zinc-200 block mb-1.5">Output Format</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["jpg", "png", "webp"] as const).map(fmt => (
                    <button 
                      key={fmt} 
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={cn(
                        "py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center",
                        format === fmt 
                          ? "border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 to-indigo-500/10 text-white shadow-xs" 
                          : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white"
                      )}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-200">Image Quality</span>
                  <span className="font-mono font-bold text-cyan-400">{quality}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[
                    { label: "70% Web", val: 70 },
                    { label: "85% High", val: 85 },
                    { label: "95% Max", val: 95 },
                    { label: "100% Best", val: 100 },
                  ].map((q) => (
                    <button
                      key={q.val}
                      type="button"
                      onClick={() => setQuality(q.val)}
                      className={cn(
                        "py-0.5 text-[9px] font-mono rounded-lg border text-center transition-all cursor-pointer",
                        quality === q.val
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold"
                          : "bg-white/[0.02] text-zinc-400 border-white/[0.05] hover:text-white"
                      )}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Action Button (Crop & Resize - Strictly Zero Sparkles) */}
            <button
              type="button"
              disabled={!asset || isProcessing}
              onClick={processImage}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(6,182,212,0.35)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Resizing & Cropping...</span>
                </>
              ) : (
                <>
                  <CropIcon size={16} />
                  <span>Crop & Resize Photo</span>
                </>
              )}
            </button>

            {/* Result Display & Export Actions */}
            {result && (
              <div className="space-y-3 pt-2 border-t border-white/[0.08] animate-in fade-in duration-300">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Clean Output Ready</span>
                    <span className="text-xs font-bold text-white font-mono">{result.width} × {result.height} px</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-300">{formatSize(result.size)}</span>
                </div>

                <div className="space-y-2">
                  <a
                    href={result.url}
                    download={`exismic_${asset?.name?.replace(/\.[^.]+$/, "") || "cropped_photo"}.${result.format}`}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
                  >
                    <Download size={15} />
                    <span>Download Cropped Photo ({result.width}×{result.height})</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyPicture}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? "Copied to Clipboard!" : "Copy Picture to Clipboard"}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      {asset && (
        <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 p-3 rounded-2xl bg-[#090b14]/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center justify-between gap-3">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              {width} × {height} px
            </span>
            <span className="text-xs font-black font-mono text-cyan-400">
              {format.toUpperCase()} • {quality}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            {result && (
              <a
                href={result.url}
                download={`exismic_${asset?.name?.replace(/\.[^.]+$/, "") || "cropped_photo"}.${result.format}`}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Download size={14} />
                <span>Save</span>
              </a>
            )}
            <button
              type="button"
              disabled={isProcessing}
              onClick={processImage}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <CropIcon size={14} />}
              <span>{isProcessing ? "Processing..." : "Crop & Save"}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default ImageResizerCropper;
