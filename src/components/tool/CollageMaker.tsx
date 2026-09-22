"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { 
  X, 
  Plus, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Layout,
  Grid,
  Columns,
  Settings2,
  Loader2, 
  Maximize2, 
  RotateCw, 
  Layers, 
  Square, 
  LayoutGrid,
  Copy,
  Sliders,
  Palette,
  Eye,
  Camera,
  ArrowRight,
  Zap,
  Check,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";
import { consumePipelineItem, pipelineUrlToFile, sendToTool } from "@/lib/pipeline";
import { saveFileHistory } from "@/lib/history";

type CollageLayout = 'duo' | 'classic' | 'grid-4' | 'grid-9' | 'magazine' | 'auto' | 'custom';
type CollageRatio = '1:1' | '4:5' | '9:16' | '16:9' | '3:2' | '2:3';

interface CollageItem {
  id: string;
  preview: string;
  x: number; // Percent 0-100
  y: number; // Percent 0-100
  w: number; // Percent 0-100
  h: number; // Percent 0-100
  rotation: number;
  zIndex: number;
}

interface DemoBlueprint {
  id: "travel" | "editorial" | "story";
  name: string;
  badge: string;
  count: number;
  layout: CollageLayout;
  ratio: CollageRatio;
  description: string;
  highlight: string;
  icon: typeof Camera;
}

const DEMO_BLUEPRINTS: DemoBlueprint[] = [
  {
    id: "travel",
    name: "Travel Photo Moodboard",
    badge: "4 Photos · 2x2",
    count: 4,
    layout: "grid-4",
    ratio: "1:1",
    description: "4 scenic travel photos (Sunset, Ocean, Alpine Forest & Starry Night) in a balanced quad.",
    highlight: "1:1 Square Grid",
    icon: Camera,
  },
  {
    id: "editorial",
    name: "Editorial Magazine Trio",
    badge: "3 Photos · Classic",
    count: 3,
    layout: "classic",
    ratio: "4:5",
    description: "1 hero portrait photo paired with 2 vertical accent shots in editorial magazine framing.",
    highlight: "4:5 Portrait Grid",
    icon: Layout,
  },
  {
    id: "story",
    name: "Mobile Story Duo",
    badge: "2 Photos · Split",
    count: 2,
    layout: "duo",
    ratio: "9:16",
    description: "2 vertical cinematic shots side-by-side formatted for Instagram Stories & TikTok.",
    highlight: "9:16 Vertical Story",
    icon: Columns,
  },
];

// Client-side canvas generator for instant test photos ($0 compute, 100% in-browser)
function generateSamplePhoto(theme: string, index: number): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(new File(["demo"], `sample-${theme}-${index}.jpg`, { type: "image/jpeg" }));
      return;
    }

    if (theme === "travel") {
      if (index === 0) {
        // Golden Sunset
        const sky = ctx.createLinearGradient(0, 0, 0, 900);
        sky.addColorStop(0, "#1e1b4b");
        sky.addColorStop(0.35, "#be185d");
        sky.addColorStop(0.7, "#f97316");
        sky.addColorStop(1, "#fde047");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 1200, 900);

        ctx.beginPath();
        ctx.arc(600, 650, 110, 0, Math.PI * 2);
        ctx.fillStyle = "#fffbeb";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 80;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.moveTo(0, 750);
        ctx.lineTo(350, 600);
        ctx.lineTo(700, 720);
        ctx.lineTo(1200, 580);
        ctx.lineTo(1200, 1200);
        ctx.lineTo(0, 1200);
        ctx.fill();
      } else if (index === 1) {
        // Turquoise Ocean Wave
        const ocean = ctx.createLinearGradient(0, 0, 1200, 1200);
        ocean.addColorStop(0, "#082f49");
        ocean.addColorStop(0.5, "#0284c7");
        ocean.addColorStop(1, "#38bdf8");
        ctx.fillStyle = ocean;
        ctx.fillRect(0, 0, 1200, 1200);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 12;
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          ctx.arc(600, 1400 - i * 160, 500 + i * 80, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        }
      } else if (index === 2) {
        // Alpine Forest
        const forest = ctx.createLinearGradient(0, 0, 0, 1200);
        forest.addColorStop(0, "#064e3b");
        forest.addColorStop(0.6, "#047857");
        forest.addColorStop(1, "#022c22");
        ctx.fillStyle = forest;
        ctx.fillRect(0, 0, 1200, 1200);

        // Pine trees
        ctx.fillStyle = "#062319";
        for (let t = 0; t < 9; t++) {
          const bx = t * 140 + 40;
          ctx.beginPath();
          ctx.moveTo(bx, 600);
          ctx.lineTo(bx - 60, 850);
          ctx.lineTo(bx + 60, 850);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(bx, 750);
          ctx.lineTo(bx - 80, 1050);
          ctx.lineTo(bx + 80, 1050);
          ctx.fill();
        }
      } else {
        // Starry Desert Night
        const night = ctx.createLinearGradient(0, 0, 0, 1200);
        night.addColorStop(0, "#020617");
        night.addColorStop(0.6, "#0f172a");
        night.addColorStop(1, "#7c2d12");
        ctx.fillStyle = night;
        ctx.fillRect(0, 0, 1200, 1200);

        // Stars
        ctx.fillStyle = "#ffffff";
        for (let s = 0; s < 45; s++) {
          const sx = (s * 197) % 1160 + 20;
          const sy = (s * 131) % 700 + 20;
          ctx.fillRect(sx, sy, 3, 3);
        }

        // Sand dune
        ctx.fillStyle = "#431407";
        ctx.beginPath();
        ctx.moveTo(0, 950);
        ctx.quadraticCurveTo(500, 800, 1200, 980);
        ctx.lineTo(1200, 1200);
        ctx.lineTo(0, 1200);
        ctx.fill();
      }
    } else if (theme === "editorial") {
      if (index === 0) {
        // Minimalist Architecture
        const bg = ctx.createLinearGradient(0, 0, 1200, 1200);
        bg.addColorStop(0, "#18181b");
        bg.addColorStop(1, "#27272a");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1200, 1200);

        ctx.fillStyle = "#3f3f46";
        ctx.beginPath();
        ctx.moveTo(300, 0);
        ctx.lineTo(900, 0);
        ctx.lineTo(1200, 1200);
        ctx.lineTo(600, 1200);
        ctx.fill();

        ctx.fillStyle = "#06b6d4";
        ctx.fillRect(500, 450, 200, 300);
      } else if (index === 1) {
        // Studio Portrait Glow
        const bg = ctx.createRadialGradient(600, 600, 100, 600, 600, 700);
        bg.addColorStop(0, "#3b0764");
        bg.addColorStop(0.7, "#09090b");
        bg.addColorStop(1, "#000000");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1200, 1200);

        ctx.beginPath();
        ctx.arc(600, 600, 220, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168, 85, 247, 0.35)";
        ctx.fill();
      } else {
        // Modern Terracotta & Botanicals
        ctx.fillStyle = "#7c2d12";
        ctx.fillRect(0, 0, 1200, 1200);

        ctx.beginPath();
        ctx.arc(600, 700, 350, 0, Math.PI * 2);
        ctx.fillStyle = "#9a3412";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(600, 500, 180, 0, Math.PI * 2);
        ctx.fillStyle = "#ea580c";
        ctx.fill();
      }
    } else {
      // Social Story Duo
      if (index === 0) {
        const sky = ctx.createLinearGradient(0, 0, 0, 1200);
        sky.addColorStop(0, "#0c0a09");
        sky.addColorStop(0.5, "#4c0519");
        sky.addColorStop(1, "#fb7185");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, 1200, 1200);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 44px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CITY VIBES", 600, 600);
      } else {
        const bg = ctx.createLinearGradient(0, 0, 1200, 1200);
        bg.addColorStop(0, "#020617");
        bg.addColorStop(0.5, "#083344");
        bg.addColorStop(1, "#06b6d4");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1200, 1200);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 44px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("NEON NIGHTS", 600, 600);
      }
    }

    canvas.toBlob((blob) => {
      resolve(new File([blob || "demo"], `sample-${theme}-${index + 1}.jpg`, { type: "image/jpeg" }));
    }, "image/jpeg", 0.95);
  });
}

export function CollageMaker() {
  const { isPro } = usePro();
  const [items, setItems] = useState<CollageItem[]>([]);
  const [activeLayout, setActiveLayout] = useState<CollageLayout>('auto');
  const [collageRatio, setCollageRatio] = useState<CollageRatio>('1:1');
  const [spacing, setSpacing] = useState(12);
  const [borderRadius, setBorderRadius] = useState(16);
  const [bgColor, setBgColor] = useState('#0a0a0a');
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState('#ffffff');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultFormat, setResultFormat] = useState<"jpg" | "png">("jpg");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"stage" | "settings">("stage");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<CollageItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.preview && !item.preview.startsWith("data:")) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  // Global Clipboard Paste Listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < clipboardItems.length; i++) {
        if (clipboardItems[i].type.startsWith("image/")) {
          const file = clipboardItems[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        handleUpload(imageFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [items.length, activeLayout]);

  // Consume pipeline asset if sent from another tool
  useEffect(() => {
    const item = consumePipelineItem();
    if (item && item.url) {
      pipelineUrlToFile(item.url, item.name || "input-photo.png")
        .then((file) => handleUpload([file]))
        .catch((err) => console.warn("Failed to load pipeline image:", err));
    }
  }, []);

  const applyLayoutPresets = useCallback((currentItems: CollageItem[], layout: CollageLayout): CollageItem[] => {
    const count = currentItems.length;
    if (count === 0) return [];
    
    const updated = currentItems.map((item) => ({ ...item }));

    if (layout === 'duo' && count >= 2) {
      updated[0] = { ...updated[0], x: 0, y: 0, w: 50, h: 100 };
      updated[1] = { ...updated[1], x: 50, y: 0, w: 50, h: 100 };
    } else if (layout === 'classic' && count >= 3) {
      updated[0] = { ...updated[0], x: 0, y: 0, w: 60, h: 100 };
      updated[1] = { ...updated[1], x: 60, y: 0, w: 40, h: 50 };
      updated[2] = { ...updated[2], x: 60, y: 50, w: 40, h: 50 };
    } else if (layout === 'grid-4' && count >= 4) {
      updated[0] = { ...updated[0], x: 0, y: 0, w: 50, h: 50 };
      updated[1] = { ...updated[1], x: 50, y: 0, w: 50, h: 50 };
      updated[2] = { ...updated[2], x: 0, y: 50, w: 50, h: 50 };
      updated[3] = { ...updated[3], x: 50, y: 50, w: 50, h: 50 };
    } else if (layout === 'grid-9' && count >= 1) {
      const cols = 3;
      const rows = 3;
      const unitW = 100 / cols;
      const unitH = 100 / rows;
      updated.forEach((item, i) => {
        if (i < 9) {
          item.x = (i % cols) * unitW;
          item.y = Math.floor(i / cols) * unitH;
          item.w = unitW;
          item.h = unitH;
        }
      });
    } else if (layout === 'magazine') {
      const colHeights = [0, 0];
      updated.forEach((item, i) => {
        const col = colHeights[0] <= colHeights[1] ? 0 : 1;
        const itemHeight = i % 3 === 0 ? 48 : 34;
        item.x = col * 50;
        item.y = Math.min(100 - itemHeight, colHeights[col]);
        item.w = 50;
        item.h = itemHeight;
        colHeights[col] += itemHeight;
      });
    } else if (layout === 'auto') {
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      const unitW = 100 / cols;
      const unitH = 100 / rows;
      updated.forEach((item, i) => {
        item.x = (i % cols) * unitW;
        item.y = Math.floor(i / cols) * unitH;
        item.w = unitW;
        item.h = unitH;
      });
    }

    return updated;
  }, []);

  const handleUpload = useCallback((uploadedFiles: File[]) => {
    const imageFiles = uploadedFiles.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      setError("Please choose image files only (PNG, JPG, WebP).");
      return;
    }

    const newItems = imageFiles.map((file, index) => ({
      id: Math.random().toString(36).substring(2, 9),
      preview: URL.createObjectURL(file),
      x: 0,
      y: 0,
      w: 50,
      h: 50,
      rotation: 0,
      zIndex: items.length + index
    }));
    
    setItems(prev => {
      const updated = [...prev, ...newItems].slice(0, 9);
      return applyLayoutPresets(updated, activeLayout);
    });
    setResult(null);
    setError(null);
  }, [items.length, activeLayout, applyLayoutPresets]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleUpload(acceptedFiles);
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const handleSelectDemo = async (demo: DemoBlueprint) => {
    try {
      setError(null);
      setResult(null);
      // Clean previous items
      items.forEach(it => {
        if (it.preview && !it.preview.startsWith("data:")) URL.revokeObjectURL(it.preview);
      });

      const files: File[] = [];
      for (let i = 0; i < demo.count; i++) {
        const file = await generateSamplePhoto(demo.id, i);
        files.push(file);
      }

      setCollageRatio(demo.ratio);
      setActiveLayout(demo.layout);

      const newItems = files.map((file, index) => ({
        id: Math.random().toString(36).substring(2, 9),
        preview: URL.createObjectURL(file),
        x: 0,
        y: 0,
        w: 50,
        h: 50,
        rotation: 0,
        zIndex: index
      }));

      setItems(applyLayoutPresets(newItems, demo.layout));
    } catch (err) {
      console.error("Failed to load demo collage:", err);
    }
  };

  const handleLayoutChange = (l: CollageLayout) => {
    setActiveLayout(l);
    if (l !== 'custom') {
      setItems(prev => applyLayoutPresets(prev, l));
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const found = prev.find(item => item.id === id);
      if (found && found.preview && !found.preview.startsWith("data:")) {
        URL.revokeObjectURL(found.preview);
      }
      const updated = prev.filter(item => item.id !== id);
      return activeLayout !== 'custom' ? applyLayoutPresets(updated, activeLayout) : updated;
    });
    setResult(null);
  };

  const handleClearAll = () => {
    items.forEach(it => {
      if (it.preview && !it.preview.startsWith("data:")) URL.revokeObjectURL(it.preview);
    });
    setItems([]);
    setResult(null);
    setError(null);
  };

  const updateItem = (id: string, updates: Partial<CollageItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, ...updates };
      next.w = Math.max(8, Math.min(100, next.w));
      next.h = Math.max(8, Math.min(100, next.h));
      next.x = Math.max(0, Math.min(100 - next.w, next.x));
      next.y = Math.max(0, Math.min(100 - next.h, next.y));
      return next;
    }));
    setActiveLayout('custom');
    setResult(null);
  };

  const generateCollage = async () => {
    if (items.length === 0) return;
    setIsGenerating(true);
    setError(null);

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGenerating(false);
      setError("Could not create export canvas.");
      return;
    }

    const getDimensions = () => {
      const base = 2000;
      switch(collageRatio) {
        case '4:5': return { w: base, h: Math.round(base * 1.25) };
        case '9:16': return { w: base, h: Math.round(base * (16/9)) };
        case '16:9': return { w: Math.round(base * (16/9)), h: base };
        case '3:2': return { w: Math.round(base * 1.5), h: base };
        case '2:3': return { w: base, h: Math.round(base * 1.5) };
        default: return { w: base, h: base };
      }
    };

    const { w: width, h: height } = getDimensions();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      setError("Could not create export context.");
      return;
    }

    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    try {
      for (const item of [...items].sort((a,b) => a.zIndex - b.zIndex)) {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.save();
            
            const drawX = (item.x / 100) * width + spacing;
            const drawY = (item.y / 100) * height + spacing;
            const drawW = Math.max(1, (item.w / 100) * width - (spacing * 2));
            const drawH = Math.max(1, (item.h / 100) * height - (spacing * 2));

            if (borderRadius > 0) {
              const br = (borderRadius / 100) * Math.min(drawW, drawH);
              ctx.beginPath();
              ctx.moveTo(drawX + br, drawY);
              ctx.lineTo(drawX + drawW - br, drawY);
              ctx.quadraticCurveTo(drawX + drawW, drawY, drawX + drawW, drawY + br);
              ctx.lineTo(drawX + drawW, drawY + drawH - br);
              ctx.quadraticCurveTo(drawX + drawW, drawY + drawH, drawX + drawW - br, drawY + drawH);
              ctx.lineTo(drawX + br, drawY + drawH);
              ctx.quadraticCurveTo(drawX, drawY + drawH, drawX, drawY + drawH - br);
              ctx.lineTo(drawX, drawY + br);
              ctx.quadraticCurveTo(drawX, drawY, drawX + br, drawY);
              ctx.closePath();
              ctx.clip();
            }

            if (item.rotation !== 0) {
              ctx.translate(drawX + drawW/2, drawY + drawH/2);
              ctx.rotate((item.rotation * Math.PI) / 180);
              ctx.translate(-(drawX + drawW/2), -(drawY + drawH/2));
            }

            // Aspect correction
            const imgAspect = img.width / img.height;
            const targetAspect = drawW / drawH;
            let sW, sH, sX, sY;
            if (imgAspect > targetAspect) {
              sH = img.height;
              sW = img.height * targetAspect;
              sX = (img.width - sW) / 2;
              sY = 0;
            } else {
              sW = img.width;
              sH = img.width / targetAspect;
              sX = 0;
              sY = (img.height - sH) / 2;
            }

            ctx.drawImage(img, sX, sY, sW, sH, drawX, drawY, drawW, drawH);
            
            if (borderWidth > 0) {
              ctx.strokeStyle = borderColor;
              ctx.lineWidth = (borderWidth / 100) * width;
              ctx.stroke();
            }

            ctx.restore();
            resolve();
          };
          img.onerror = () => reject(new Error("Could not load one of the collage photos."));
          img.src = item.preview;
        });
      }

      const exportFormat = bgColor === 'transparent' ? 'png' : 'jpg';
      const outputDataUrl = exportFormat === 'png' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.95);
      
      setResultFormat(exportFormat);
      setResult(outputDataUrl);

      // Auto-save to creation history
      saveFileHistory({
        originalName: `exismic-collage-${Date.now()}.${exportFormat}`,
        toolType: "image-collage",
        fileType: "image",
        resultUrl: outputDataUrl,
        metadata: {
          prompt: `Photo Collage (${items.length} photos · ${collageRatio})`,
          targetFormat: exportFormat.toUpperCase(),
          targetHref: "/tools/image/collage",
          settings: { ratio: collageRatio, layout: activeLayout, count: items.length }
        }
      }).catch((histErr) => console.warn("Collage history save note:", histErr));

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create collage.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPicture = async () => {
    if (!result) return;
    try {
      const res = await fetch(result);
      const blob = await res.blob();
      const pngBlob = await new Promise<Blob>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = URL.createObjectURL(blob);
        img.onload = () => {
          const cvs = document.createElement("canvas");
          cvs.width = img.naturalWidth || img.width;
          cvs.height = img.naturalHeight || img.height;
          const ctx = cvs.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          cvs.toBlob((b) => resolve(b || blob), "image/png");
        };
        img.onerror = () => resolve(blob);
      });

      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy picture:", err);
    }
  };

  const activeLayoutName = useMemo(() => {
    switch (activeLayout) {
      case 'duo': return "Duo (2 Photos)";
      case 'classic': return "Classic Trio";
      case 'grid-4': return "Quad Grid (2x2)";
      case 'grid-9': return "9-Photo Grid";
      case 'magazine': return "Magazine Columns";
      case 'custom': return "Custom Freeform";
      default: return "Auto Fit";
    }
  }, [activeLayout]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 animate-in fade-in duration-500 pb-10">
      
      {/* 1. HEADER LIVE STATS BANNER (Plain English, Zero Tech Jargon) */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.1] bg-[#090c16]/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.25)]">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Photo</span>
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Collage Maker</span>
            </h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Combine your favorite photos into beautiful grids and moodboards with custom borders and spacing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 px-3.5 py-2 text-left min-w-[95px]">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Photos</p>
            <p className="mt-0.5 text-base font-black text-white font-mono">{items.length} / 9</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-left min-w-[110px]">
            <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Layout</p>
            <p className="mt-0.5 text-xs font-bold text-white truncate">{activeLayoutName}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 px-3.5 py-2 text-left min-w-[105px]">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Aspect Ratio</p>
            <p className="mt-0.5 text-base font-black text-cyan-300 font-mono">{collageRatio}</p>
          </div>
        </div>
      </div>

      {/* 2. MOBILE VIEW SWITCHER */}
      <div className="lg:hidden grid grid-cols-2 p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveMobileTab("stage")}
          className={cn(
            "py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeMobileTab === "stage"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Collage Stage</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("settings")}
          className={cn(
            "py-2.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeMobileTab === "settings"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-cyan-500/40 shadow-xs font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Layout & Styles</span>
        </button>
      </div>

      {/* 3. DUAL COLUMN LUXURY STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: COLLAGE CANVAS & 3 INSTANT DEMONSTRATION BLUEPRINTS */}
        {/* ================================================================= */}
        <div className={cn("space-y-4 xl:col-span-7", activeMobileTab !== "stage" ? "hidden lg:block" : "block")}>
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4">
            
            {/* macOS Window Titlebar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500/70" />
                  <span className="size-2.5 rounded-full bg-amber-500/70" />
                  <span className="size-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="ml-2 text-xs font-bold text-zinc-400 tracking-wider">
                  COLLAGE WORKSPACE
                </span>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  {items.length} {items.length === 1 ? "Photo" : "Photos"}
                </span>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Main Stage: Dropzone or Interactive Collage Canvas */}
            {items.length === 0 ? (
              <div 
                {...(getRootProps() as unknown as React.HTMLAttributes<HTMLDivElement>)}
                className={cn(
                  "group relative flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition-all cursor-pointer",
                  isDragActive 
                    ? "border-cyan-400/60 bg-cyan-500/[0.08] shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                    : "border-white/15 bg-black/40 hover:border-cyan-400/40 hover:bg-cyan-500/[0.02]"
                )}
              >
                <input {...getInputProps()} />

                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-transform duration-300 group-hover:scale-110">
                  <LayoutGrid size={28} />
                </div>
                
                <h4 className="text-base font-bold text-white tracking-tight">
                  Create Your Photo Collage
                </h4>
                
                <p className="mt-1.5 text-xs text-zinc-400 max-w-sm leading-relaxed">
                  Drop multiple photos here, browse from your computer, or paste with <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] text-cyan-200 font-mono">Ctrl + V</kbd>.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">Up to 9 Photos</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">Ultra-HD Export</span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">Custom Ratios</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Interactive Drag & Drop Stage */}
                <div 
                  ref={containerRef}
                  className="relative rounded-2xl border border-white/10 bg-black/60 shadow-inner overflow-hidden group p-2 min-h-[440px] flex items-center justify-center"
                  style={{ 
                    background: bgColor === 'transparent' ? 'repeating-conic-gradient(#151824 0% 25%, #0a0c13 0% 50%) 50% / 20px 20px' : bgColor,
                    aspectRatio: collageRatio.replace(':', '/')
                  }}
                >
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      drag
                      dragMomentum={false}
                      onDrag={(_, info) => {
                        const container = containerRef.current;
                        if (!container) return;
                        const rect = container.getBoundingClientRect();
                        const newX = ((info.point.x - rect.left) / rect.width) * 100 - item.w / 2;
                        const newY = ((info.point.y - rect.top) / rect.height) * 100 - item.h / 2;
                        updateItem(item.id, { x: newX, y: newY });
                      }}
                      style={{
                        position: 'absolute',
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        width: `${item.w}%`,
                        height: `${item.h}%`,
                        padding: `${spacing}px`,
                        zIndex: item.zIndex,
                        rotate: item.rotation,
                        cursor: 'move'
                      }}
                      className="group/item"
                    >
                      <div 
                        className="w-full h-full relative shadow-2xl transition-all"
                        style={{ 
                          borderRadius: `${borderRadius}px`, 
                          overflow: 'hidden',
                          border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none'
                        }}
                      >
                        <img 
                          src={item.preview} 
                          className="w-full h-full object-cover select-none pointer-events-none" 
                          alt="Collage piece" 
                        />
                        
                        {/* Hover Overlay Controls */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity bg-black/70 rounded-lg p-1 border border-white/15 backdrop-blur-md">
                          <button 
                            type="button"
                            className="size-6 rounded flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              updateItem(item.id, { rotation: item.rotation + 15 });
                            }}
                            title="Rotate 15°"
                          >
                            <RotateCw size={12} />
                          </button>
                          <button 
                            type="button"
                            className="size-6 rounded flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              updateItem(item.id, { w: Math.min(100, item.w + 10), h: Math.min(100, item.h + 10) });
                            }}
                            title="Grow"
                          >
                            <Maximize2 size={12} />
                          </button>
                          <button 
                            type="button"
                            className="size-6 rounded flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                            title="Remove"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3 INSTANT 1-CLICK DEMONSTRATION BLUEPRINTS ($0 COMPUTE CLIENT CANVAS) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  <LayoutGrid size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Instant Collage Templates
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Try curated multi-photo styles in 1-click ($0 server compute)
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                100% In-Browser
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_BLUEPRINTS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-black/40 p-3 text-left transition-all hover:border-cyan-400/40 hover:bg-cyan-500/[0.04] cursor-pointer"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-zinc-300 transition-colors group-hover:bg-cyan-500/20 group-hover:text-cyan-300">
                          <Icon size={14} />
                        </div>
                        <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300">
                          {demo.badge}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                        {demo.name}
                      </h5>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {demo.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px]">
                      <span className="font-semibold text-cyan-300">{demo.highlight}</span>
                      <span className="text-zinc-500 group-hover:text-white transition-colors">Load &rarr;</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: COLLAGE STYLING & COMPOSITION CONSOLE */}
        {/* ================================================================= */}
        <div className={cn("space-y-4 xl:col-span-5", activeMobileTab !== "settings" ? "hidden lg:block" : "block")}>
          
          {/* Active Photos Shelf */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  <Layers size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Collage Photos
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Add or rearrange your pictures ({items.length}/9 photos)
                  </p>
                </div>
              </div>

              <input 
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleUpload(Array.from(e.target.files));
                }}
              />

              {items.length < 9 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <Plus size={13} className="text-cyan-400" />
                  <span>Add Photos</span>
                </button>
              )}
            </div>

            {items.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {items.map((item) => (
                  <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-zinc-900 shadow-md">
                    <img src={item.preview} className="size-full object-cover" alt="Thumb" />
                    <button 
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                      title="Remove photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic text-center py-2">
                No photos loaded yet. Drop pictures or pick a template above.
              </p>
            )}
          </div>

          {/* Layout Presets */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <LayoutGrid size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Collage Layout
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Arrangement pattern for your pictures
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'duo', name: 'Duo', icon: Columns },
                { id: 'classic', name: 'Classic', icon: Layout },
                { id: 'grid-4', name: 'Grid 2x2', icon: Grid },
                { id: 'grid-9', name: 'Grid 3x3', icon: LayoutGrid },
                { id: 'magazine', name: 'Columns', icon: LayoutGrid },
                { id: 'auto', name: 'Auto Fit', icon: RotateCw },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => handleLayoutChange(l.id as CollageLayout)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer text-center",
                    activeLayout === l.id 
                      ? "bg-cyan-500/15 border-cyan-400/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.18)]" 
                      : "border-white/[0.08] bg-black/40 text-zinc-400 hover:border-white/20 hover:text-white"
                  )}
                >
                  <l.icon size={16} className={activeLayout === l.id ? "text-cyan-300" : "text-zinc-400"} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio & Composition */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  <Sliders size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Borders & Spacing
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Adjust canvas proportions and spacing
                  </p>
                </div>
              </div>
            </div>

            {/* Ratio Chips */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <span>Output Aspect Ratio</span>
                <span className="text-cyan-300 font-mono">{collageRatio}</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {['1:1', '4:5', '9:16', '16:9', '3:2', '2:3'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setCollageRatio(r as CollageRatio)}
                    className={cn(
                      "py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center",
                      collageRatio === r 
                        ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-xs" 
                        : "border-white/[0.08] bg-black/40 text-zinc-400 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <span>Internal Spacing</span>
                <span className="font-mono text-cyan-300">{spacing}px</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={40} 
                value={spacing} 
                onChange={(e) => setSpacing(parseInt(e.target.value))} 
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400 transition-all focus:outline-none"
              />
            </div>

            {/* Corner Rounding Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <span>Corner Rounding</span>
                <span className="font-mono text-cyan-300">{borderRadius}px</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={60} 
                value={borderRadius} 
                onChange={(e) => setBorderRadius(parseInt(e.target.value))} 
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-400 transition-all focus:outline-none"
              />
            </div>

            {/* Canvas Background Color */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Canvas Background
              </span>
              <div className="flex gap-2">
                {['#0a0a0a', '#ffffff', 'transparent', '#8b5cf6', '#06b6d4', '#ec4899'].map(c => (
                  <button 
                    key={c}
                    type="button"
                    onClick={() => setBgColor(c)}
                    className={cn(
                      "size-8 rounded-xl border-2 transition-all cursor-pointer hover:scale-105",
                      bgColor === c ? "border-cyan-400 scale-110 shadow-lg" : "border-white/10"
                    )}
                    style={{ 
                      background: c === 'transparent' 
                        ? 'repeating-conic-gradient(#222 0% 25%, #111 0% 50%) 50% / 8px 8px' 
                        : c 
                    }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#090c16]/90 border border-white/[0.1] backdrop-blur-xl shadow-2xl space-y-2.5">
            <button 
              type="button"
              onClick={generateCollage}
              disabled={isGenerating || items.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:opacity-95 hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] active:scale-[0.99] disabled:opacity-40 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Building High-Res Collage...</span>
                </>
              ) : (
                <>
                  <LayoutGrid size={16} />
                  <span>Create High-Res Collage</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE FLOATING ACTION HUD (< lg viewports) */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-50 rounded-2xl border border-white/15 bg-black/90 p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            {items.length} {items.length === 1 ? "Photo" : "Photos"} &bull; {collageRatio}
          </p>
          <p className="text-xs font-bold text-white truncate">
            {activeLayoutName}
          </p>
        </div>

        <button
          type="button"
          onClick={items.length === 0 ? () => fileInputRef.current?.click() : generateCollage}
          disabled={isGenerating}
          className="flex items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-black text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)] disabled:opacity-40"
        >
          {isGenerating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <LayoutGrid size={14} />
          )}
          <span>{items.length === 0 ? "Add Photos" : "Create"}</span>
        </button>
      </div>

      {/* 5. RESULT MODAL (High-Res Export & Copy) */}
      <AnimatePresence>
        {result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-white/15 bg-[#090c16] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-black/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      Your Collage is Ready
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      Ultra-HD {resultFormat.toUpperCase()} &bull; {collageRatio} Ratio
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPicture}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? "Copied!" : "Copy Picture"}</span>
                  </button>
                  <a
                    href={result}
                    download={`exismic-collage-${Date.now()}.${resultFormat}`}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-cyan-300"
                  >
                    <Download size={13} />
                    <span>Download {resultFormat.toUpperCase()}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white ml-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Image Display */}
              <div className="relative flex-1 min-h-[300px] sm:min-h-[460px] overflow-auto flex items-center justify-center p-4 bg-black/60">
                <img 
                  src={result} 
                  alt="Generated Collage" 
                  className="max-h-[65vh] max-w-full rounded-lg shadow-2xl object-contain"
                />
              </div>

              {/* Modal Footer with Pipeline Links */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3 bg-black/40 text-xs">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>Send to:</span>
                  <button
                    type="button"
                    onClick={() => {
                      sendToTool("/tools/image/compressor", {
                        name: `collage-${Date.now()}.${resultFormat}`,
                        url: result,
                        fileType: "image",
                        sourceToolId: "image-collage"
                      });
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline"
                  >
                    <Zap size={12} />
                    <span>Compressor</span>
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={() => {
                      sendToTool("/tools/image/converter", {
                        name: `collage-${Date.now()}.${resultFormat}`,
                        url: result,
                        fileType: "image",
                        sourceToolId: "image-collage"
                      });
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline"
                  >
                    <span>Format Converter</span>
                  </button>
                </div>

                {!isPro && (
                  <span className="text-[10px] text-zinc-500">
                    Commercial Ultra-HD export &bull; Free on Exismic
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
