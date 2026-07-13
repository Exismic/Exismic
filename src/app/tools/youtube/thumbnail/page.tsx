"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Download,
  Eye,
  Image as ImageIcon,
  Layout,
  Monitor,
  Palette,
  Play,
  RotateCcw,
  Sparkles,
  Type,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TemplateId = "impact" | "neon" | "studio";

const templates: Record<
  TemplateId,
  {
    label: string;
    bg: string;
    accent: string;
    text: string;
    subtitle: string;
    title: string;
    badge: string;
  }
> = {
  impact: {
    label: "Impact",
    bg: "#15151c",
    accent: "#ff2d55",
    text: "#ffffff",
    subtitle: "#ffea00",
    title: "I BUILT THIS IN 24 HOURS",
    badge: "FULL BUILD",
  },
  neon: {
    label: "Neon",
    bg: "#0b1020",
    accent: "#22d3ee",
    text: "#ffffff",
    subtitle: "#a78bfa",
    title: "AI TOOLS THAT FEEL ILLEGAL",
    badge: "2026 GUIDE",
  },
  studio: {
    label: "Studio",
    bg: "#101014",
    accent: "#8b5cf6",
    text: "#f8fafc",
    subtitle: "#34d399",
    title: "MAKE THUMBNAILS THAT GET CLICKS",
    badge: "CREATOR MODE",
  },
};

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

function hexToRgba(hex: string, alpha: number) {
  const cleaned = hex.replace("#", "");
  const bigint = Number.parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the background image."));
    image.src = src;
  });
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  const scale = Math.max(CANVAS_WIDTH / image.width, CANVAS_HEIGHT / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (CANVAS_WIDTH - width) / 2;
  const y = (CANVAS_HEIGHT - height) / 2;
  ctx.drawImage(image, x, y, width, height);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !current) {
      current = test;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 4);
}

export default function YouTubeThumbnailMaker() {
  const [template, setTemplate] = useState<TemplateId>("impact");
  const [title, setTitle] = useState(templates.impact.title);
  const [subtitle, setSubtitle] = useState("IN 30 DAYS");
  const [badge, setBadge] = useState(templates.impact.badge);
  const [bgColor, setBgColor] = useState(templates.impact.bg);
  const [textColor, setTextColor] = useState(templates.impact.text);
  const [subtitleColor, setSubtitleColor] = useState(templates.impact.subtitle);
  const [accentColor, setAccentColor] = useState(templates.impact.accent);
  const [overlayOpacity, setOverlayOpacity] = useState(0.44);
  const [titleSize, setTitleSize] = useState(92);
  
  // Background Image State
  const [bgImage, setBgImage] = useState<string | null>(null);
  
  // Foreground Overlay / Cutout State
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [overlayPos, setOverlayPos] = useState({ x: 0.6, y: 0.2 });
  const [overlaySize, setOverlaySize] = useState(35); // size in % of canvas width

  // Draggable Text Block State
  const [textPos, setTextPos] = useState({ x: 0.08, y: 0.22 });

  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const objectUrlRef = useRef<string | null>(null);
  const overlayUrlRef = useRef<string | null>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (overlayUrlRef.current) URL.revokeObjectURL(overlayUrlRef.current);
    };
  }, []);

  const applyTemplate = (id: TemplateId) => {
    const next = templates[id];
    setTemplate(id);
    setTitle(next.title);
    setBadge(next.badge);
    setBgColor(next.bg);
    setTextColor(next.text);
    setSubtitleColor(next.subtitle);
    setAccentColor(next.accent);
    setError("");
  };

  const clearImage = () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setBgImage(null);
  };

  const clearOverlay = () => {
    if (overlayUrlRef.current) URL.revokeObjectURL(overlayUrlRef.current);
    overlayUrlRef.current = null;
    setOverlayImage(null);
  };

  const resetDesign = () => {
    clearImage();
    clearOverlay();
    applyTemplate("impact");
    setSubtitle("IN 30 DAYS");
    setOverlayOpacity(0.44);
    setTitleSize(92);
    setTextPos({ x: 0.08, y: 0.22 });
    setOverlayPos({ x: 0.6, y: 0.2 });
    setOverlaySize(35);
  };

  const onBgDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    clearImage();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setBgImage(url);
    setError("");
  }, []);

  const onOverlayDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    clearOverlay();
    const url = URL.createObjectURL(file);
    overlayUrlRef.current = url;
    setOverlayImage(url);
    setError("");
  }, []);

  const { getRootProps: getBgRootProps, getInputProps: getBgInputProps, isDragActive: isBgDragActive } = useDropzone({
    onDrop: onBgDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const { getRootProps: getOverlayRootProps, getInputProps: getOverlayInputProps, isDragActive: isOverlayDragActive } = useDropzone({
    onDrop: onOverlayDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  // Calculate relative drag offsets on drag end to store in state
  const handleDragEnd = (elementRef: React.RefObject<HTMLDivElement | null>, setter: (pos: { x: number; y: number }) => void) => {
    const container = previewContainerRef.current?.getBoundingClientRect();
    const el = elementRef.current?.getBoundingClientRect();
    if (!container || !el) return;

    // Calculate percentage offset relative to top-left of preview card
    const relativeX = (el.left - container.left) / container.width;
    const relativeY = (el.top - container.top) / container.height;

    setter({ x: relativeX, y: relativeY });
  };

  const renderThumbnail = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas export is not available in this browser.");

    if ("fonts" in document) {
      await document.fonts.ready;
    }

    // 1. Draw Background Solid Color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Draw Background Image
    if (bgImage) {
      const image = await loadImage(bgImage);
      drawCoverImage(ctx, image);
    }

    // 3. Draw Background Overlay Gradients
    const baseGradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    baseGradient.addColorStop(0, hexToRgba(bgColor, bgImage ? overlayOpacity : 0.95));
    baseGradient.addColorStop(0.55, hexToRgba("#000000", bgImage ? Math.max(overlayOpacity - 0.08, 0.15) : 0.22));
    baseGradient.addColorStop(1, hexToRgba("#000000", 0.8));
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const glow = ctx.createRadialGradient(1040, 120, 20, 1040, 120, 620);
    glow.addColorStop(0, hexToRgba(accentColor, 0.58));
    glow.addColorStop(1, hexToRgba(accentColor, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const lowerGlow = ctx.createRadialGradient(220, 640, 20, 220, 640, 520);
    lowerGlow.addColorStop(0, hexToRgba(subtitleColor, 0.28));
    lowerGlow.addColorStop(1, hexToRgba(subtitleColor, 0));
    ctx.fillStyle = lowerGlow;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 4. Draw Grid Pattern
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    for (let x = 0; x < CANVAS_WIDTH; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 210, CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.restore();

    // 5. Draw Canvas Border Card
    ctx.fillStyle = hexToRgba("#000000", 0.28);
    roundedRect(ctx, 64, 58, 1152, 604, 46);
    ctx.fill();
    ctx.strokeStyle = hexToRgba("#ffffff", 0.18);
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. Draw Draggable Foreground Cutout Overlay
    if (overlayImage) {
      const overlayImg = await loadImage(overlayImage);
      const ow = (overlaySize / 100) * CANVAS_WIDTH;
      const oh = (ow / overlayImg.width) * overlayImg.height; // scale height proportionally
      const ox = overlayPos.x * CANVAS_WIDTH;
      const oy = overlayPos.y * CANVAS_HEIGHT;
      ctx.drawImage(overlayImg, ox, oy, ow, oh);
    }

    // 7. Draw Draggable Text Elements
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.lineJoin = "round";

    // Text anchor points
    const textX = textPos.x * CANVAS_WIDTH;
    const textY = textPos.y * CANVAS_HEIGHT;

    // Draw Badge
    const badgeText = badge.trim().toUpperCase() || "NEW VIDEO";
    ctx.font = "900 30px Arial, Helvetica, sans-serif";
    const badgeWidth = Math.min(ctx.measureText(badgeText).width + 54, 460);
    roundedRect(ctx, textX, textY, badgeWidth, 58, 20);
    ctx.fillStyle = accentColor;
    ctx.shadowColor = hexToRgba(accentColor, 0.45);
    ctx.shadowBlur = 28;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(badgeText, textX + 27, textY + 14);

    // Wrap Title
    ctx.font = `900 ${titleSize}px Arial Black, Impact, Arial, sans-serif`;
    const titleLines = wrapText(ctx, title.toUpperCase() || "YOUR TITLE HERE", 930);
    const lineHeight = titleSize * 0.92;
    let currentY = textY + 84; // Start title under badge

    for (const line of titleLines) {
      ctx.strokeStyle = hexToRgba("#000000", 0.58);
      ctx.lineWidth = 18;
      ctx.strokeText(line, textX, currentY);
      ctx.fillStyle = textColor;
      ctx.shadowColor = hexToRgba("#000000", 0.42);
      ctx.shadowBlur = 18;
      ctx.fillText(line, textX, currentY);
      ctx.shadowBlur = 0;
      currentY += lineHeight;
    }

    // Draw Subtitle
    const sub = subtitle.trim().toUpperCase();
    if (sub) {
      ctx.font = "900 48px Arial Black, Impact, Arial, sans-serif";
      ctx.strokeStyle = hexToRgba("#000000", 0.62);
      ctx.lineWidth = 10;
      ctx.strokeText(sub, textX, currentY + 12);
      ctx.fillStyle = subtitleColor;
      ctx.fillText(sub, textX, currentY + 12);
      currentY += 60;
    }

    // Draw decorative bottom bars relative to text block
    ctx.fillStyle = accentColor;
    roundedRect(ctx, textX, currentY + 20, 190, 14, 7);
    ctx.fill();
    ctx.fillStyle = subtitleColor;
    roundedRect(ctx, textX + 206, currentY + 20, 92, 14, 7);
    ctx.fill();

    // Resolution label
    ctx.font = "900 24px Arial, Helvetica, sans-serif";
    ctx.fillStyle = hexToRgba("#ffffff", 0.9);
    ctx.textAlign = "right";
    ctx.fillText("1280 x 720", 1168, 620);

    return canvas;
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      setError("");
      const canvas = await renderThumbnail();
      const link = document.createElement("a");
      link.download = `exismic-youtube-thumbnail-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not export the thumbnail.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-4 pt-24 font-sans text-white selection:bg-cyan-500/30 md:px-8 md:pb-8 md:pt-28 xl:px-12 xl:pb-12" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-3"
            >
              <div className="p-2.5 bg-red-600/15 border border-red-400/20 rounded-2xl shadow-[0_0_32px_rgba(239,68,68,0.16)]">
                <Play className="w-8 h-8 text-red-500 fill-red-500" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-cyan-300">
                YouTube Thumbnail Maker
              </h1>
            </motion.div>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl font-medium">
              Create highly engaging, conversion-optimized thumbnails. Drag elements around freely!
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={resetDesign}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-2xl text-xs font-black uppercase tracking-[0.18em] shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              <Download className="w-4 h-4" /> {isExporting ? "Exporting..." : "Download PNG"}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-100">
            {error}
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-5 order-2 lg:order-1">
            <section className="bg-white/[0.055] border border-white/10 rounded-[2rem] p-6 backdrop-blur-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/10">
                <Layout className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xs font-black uppercase tracking-[0.28em]">Editor</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">Template</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(templates) as TemplateId[]).map((id) => (
                      <button
                        key={id}
                        onClick={() => applyTemplate(id)}
                        className={cn(
                          "rounded-2xl border px-3 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                          template === id
                            ? "border-cyan-300/60 bg-cyan-400/15 text-white shadow-[0_0_28px_rgba(34,211,238,0.16)]"
                            : "border-white/10 bg-black/20 text-gray-400 hover:bg-white/5"
                        )}
                      >
                        {templates[id].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Main Title</label>
                    <textarea
                      value={title}
                      onChange={(e) => setTitle(e.target.value.toUpperCase())}
                      className="min-h-24 w-full resize-none bg-black/50 border border-white/10 rounded-2xl p-4 text-sm font-black leading-relaxed focus:border-cyan-400 outline-none transition-all"
                      placeholder="CATCHY TITLE"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Subtitle</label>
                      <input
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value.toUpperCase())}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-cyan-400 outline-none transition-all"
                        placeholder="IN 30 DAYS"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Badge</label>
                      <input
                        value={badge}
                        onChange={(e) => setBadge(e.target.value.toUpperCase())}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-bold focus:border-cyan-400 outline-none transition-all"
                        placeholder="NEW VIDEO"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-5 border-t border-white/10">
                  {[
                    ["Background", bgColor, setBgColor],
                    ["Accent", accentColor, setAccentColor],
                    ["Title", textColor, setTextColor],
                    ["Subtitle", subtitleColor, setSubtitleColor],
                  ].map(([label, value, setter]) => (
                    <label key={label as string} className="rounded-2xl bg-black/25 border border-white/10 p-3">
                      <span className="mb-3 flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <Palette className="h-3.5 w-3.5" /> {label as string}
                      </span>
                      <input
                        type="color"
                        value={value as string}
                        onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                        className="h-10 w-full cursor-pointer rounded-xl border-0 bg-transparent"
                      />
                    </label>
                  ))}
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-3 flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Type className="h-3.5 w-3.5" /> Title Size</span>
                      <span className="text-white">{titleSize}px</span>
                    </span>
                    <input
                      type="range"
                      min="64"
                      max="118"
                      value={titleSize}
                      onChange={(e) => setTitleSize(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-3 flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <span>Image Overlay</span>
                      <span className="text-white">{Math.round(overlayOpacity * 100)}%</span>
                    </span>
                    <input
                      type="range"
                      min="0.12"
                      max="0.72"
                      step="0.01"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                      className="w-full accent-violet-400"
                    />
                  </label>
                </div>

                {/* Upload Background Image */}
                <div
                  {...getBgRootProps()}
                  className={cn(
                    "relative border-2 border-dashed rounded-[1.5rem] p-6 text-center transition-all cursor-pointer bg-black/20",
                    isBgDragActive ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 hover:border-white/25"
                  )}
                >
                  <input {...getBgInputProps()} />
                  <ImageIcon className="w-7 h-7 text-gray-500 mx-auto mb-3" />
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    {bgImage ? "Change Background Image" : "Upload Background Image"}
                  </p>
                  <p className="mt-2 text-[11px] text-gray-600">JPG, PNG, or WebP</p>
                  {bgImage && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        clearImage();
                      }}
                      className="absolute top-3 right-3 p-2 bg-black/60 border border-white/10 rounded-full hover:text-red-300 transition-colors"
                      aria-label="Remove background image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Upload Custom Cutout Overlay */}
                <div className="space-y-4 pt-5 border-t border-white/10">
                  <div
                    {...getOverlayRootProps()}
                    className={cn(
                      "relative border-2 border-dashed rounded-[1.5rem] p-6 text-center transition-all cursor-pointer bg-black/20",
                      isOverlayDragActive ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 hover:border-white/25"
                    )}
                  >
                    <input {...getOverlayInputProps()} />
                    <Sparkles className="w-7 h-7 text-gray-500 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      {overlayImage ? "Change Cutout Overlay" : "Upload Cutout / Overlay"}
                    </p>
                    <p className="mt-2 text-[11px] text-gray-600">Upload transparent PNG (face, product, logo)</p>
                    {overlayImage && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearOverlay();
                        }}
                        className="absolute top-3 right-3 p-2 bg-black/60 border border-white/10 rounded-full hover:text-red-300 transition-colors"
                        aria-label="Remove overlay image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {overlayImage && (
                    <label className="block pt-2">
                      <span className="mb-3 flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <span>Overlay Size</span>
                        <span className="text-white">{overlaySize}%</span>
                      </span>
                      <input
                        type="range"
                        min="15"
                        max="80"
                        value={overlaySize}
                        onChange={(e) => setOverlaySize(Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </label>
                  )}
                </div>
              </div>
            </section>
          </aside>

          <section className="lg:col-span-8 order-1 lg:order-2 space-y-5">
            <div className="flex items-center justify-between px-2 md:px-5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">Live 16:9 Preview (Drag to position)</span>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <Monitor className="w-4 h-4" />
                <Eye className="w-4 h-4" />
                <Play className="w-4 h-4 text-red-500" />
              </div>
            </div>

            <div className="relative group">
              <motion.div
                ref={previewContainerRef}
                layout
                style={{ backgroundColor: bgColor }}
                className="relative aspect-video w-full overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.75)]"
              >
                {/* 1. Background Image */}
                {bgImage && (
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
                    <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
                  </div>
                )}
                
                {/* 2. Decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/80" />
                <div className="absolute -top-1/3 -right-1/4 h-full w-full rounded-full blur-[90px] opacity-40" style={{ backgroundColor: accentColor }} />
                <div className="absolute -bottom-1/3 -left-1/4 h-2/3 w-2/3 rounded-full blur-[90px] opacity-25" style={{ backgroundColor: subtitleColor }} />
                <div className="absolute inset-[5%] rounded-[2rem] border border-white/15 bg-black/20 pointer-events-none" />

                {/* 3. Draggable Custom Foreground Overlay */}
                {overlayImage && (
                  <motion.div
                    ref={overlayRef}
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    dragConstraints={previewContainerRef}
                    onDragEnd={() => handleDragEnd(overlayRef, setOverlayPos)}
                    className="absolute cursor-move select-none z-10 active:scale-[1.02]"
                    style={{
                      left: `${overlayPos.x * 100}%`,
                      top: `${overlayPos.y * 100}%`,
                      width: `${overlaySize}%`,
                    }}
                  >
                    <img src={overlayImage} alt="Cutout" className="w-full h-auto object-contain pointer-events-none" />
                  </motion.div>
                )}

                {/* 4. Draggable Text Container */}
                <motion.div
                  ref={textRef}
                  drag
                  dragMomentum={false}
                  dragElastic={0}
                  dragConstraints={previewContainerRef}
                  onDragEnd={() => handleDragEnd(textRef, setTextPos)}
                  className="absolute cursor-move select-none p-4 rounded-[2rem] hover:bg-white/[0.02] active:bg-white/[0.04] z-20"
                  style={{
                    left: `${textPos.x * 100}%`,
                    top: `${textPos.y * 100}%`,
                    maxWidth: "75%",
                  }}
                >
                  <div
                    className="mb-4 inline-flex max-w-full rounded-xl px-4 py-2 text-[clamp(0.55rem,1.6vw,1.3rem)] font-black uppercase tracking-[0.14em] text-white shadow-[0_0_34px_rgba(0,0,0,0.35)]"
                    style={{ backgroundColor: accentColor }}
                  >
                    <span>{badge || "NEW VIDEO"}</span>
                  </div>
                  
                  <h2
                    className="max-w-full break-words font-black uppercase leading-[0.88] tracking-normal drop-shadow-[0_12px_16px_rgba(0,0,0,0.5)]"
                    style={{
                      color: textColor,
                      fontSize: `clamp(2.2rem, ${titleSize / 13}vw, ${titleSize}px)`,
                      fontFamily: "Arial Black, Impact, Arial, sans-serif",
                      WebkitTextStroke: "0.03em rgba(0,0,0,0.36)",
                    }}
                  >
                    {title || "YOUR TITLE HERE"}
                  </h2>
                  
                  {subtitle && (
                    <p
                      className="mt-3 font-black uppercase leading-none tracking-normal drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)]"
                      style={{
                        color: subtitleColor,
                        fontSize: "clamp(1.1rem, 3.3vw, 3rem)",
                        fontFamily: "Arial Black, Impact, Arial, sans-serif",
                        WebkitTextStroke: "0.04em rgba(0,0,0,0.35)",
                      }}
                    >
                      {subtitle}
                    </p>
                  )}
                  
                  <div className="mt-5 flex items-center gap-3">
                    <span className="h-2.5 w-28 rounded-full" style={{ backgroundColor: accentColor }} />
                    <span className="h-2.5 w-14 rounded-full" style={{ backgroundColor: subtitleColor }} />
                  </div>
                </motion.div>

                <div className="absolute bottom-[7%] right-[7%] text-xs md:text-sm font-black text-white/80 pointer-events-none">1280 x 720</div>
              </motion.div>
              <div className="absolute -inset-4 bg-cyan-500/5 blur-[90px] -z-10 rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <Sparkles className="mb-3 h-5 w-5 text-yellow-300" />
                <h3 className="text-xs font-black uppercase tracking-widest">Interactive Drags</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">Drag the title block and foreground cutout anywhere inside the preview bounds.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <Zap className="mb-3 h-5 w-5 text-cyan-300" />
                <h3 className="text-xs font-black uppercase tracking-widest">Transparent Overlay</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">Upload custom PNG cutouts (e.g. face reaction, gaming character) on top of the background.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <Palette className="mb-3 h-5 w-5 text-violet-300" />
                <h3 className="text-xs font-black uppercase tracking-widest">16:9 Canvas Sync</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">The high-res export engine automatically reads element coordinates for perfect pixel-perfect PNG downloads.</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <div className="fixed top-0 right-0 -z-10 w-[760px] h-[760px] bg-cyan-600/[0.05] blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[680px] h-[680px] bg-purple-600/[0.05] blur-[150px] rounded-full pointer-events-none" />
    </div>
  );
}
