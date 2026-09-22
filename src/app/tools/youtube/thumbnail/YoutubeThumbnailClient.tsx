"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Type,
  X,
  Zap,
  Copy,
  Check,
  Layers,
  Move,
  Sliders,
  Flame,
  Target,
  ArrowRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { saveFileHistory } from "@/lib/history";
import { consumePipelineItem, sendToTool } from "@/lib/pipeline";

function YoutubeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

type TemplateId = "impact" | "neon" | "studio";

interface TemplateConfig {
  label: string;
  bg: string;
  accent: string;
  text: string;
  subtitle: string;
  title: string;
  badge: string;
}

const templates: Record<TemplateId, TemplateConfig> = {
  impact: {
    label: "Impact",
    bg: "#16060b",
    accent: "#ff2d55",
    text: "#ffffff",
    subtitle: "#ffea00",
    title: "I BUILT THIS IN 24 HOURS",
    badge: "FULL BUILD",
  },
  neon: {
    label: "Neon",
    bg: "#070b19",
    accent: "#00f0ff",
    text: "#ffffff",
    subtitle: "#a78bfa",
    title: "AI TOOLS THAT FEEL ILLEGAL",
    badge: "2026 GUIDE",
  },
  studio: {
    label: "Studio",
    bg: "#07150d",
    accent: "#10b981",
    text: "#f8fafc",
    subtitle: "#fbbf24",
    title: "MAKE THUMBNAILS THAT GET CLICKS",
    badge: "CREATOR MODE",
  },
};

interface BlueprintPreset {
  id: string;
  name: string;
  badgeText: string;
  headline: string;
  sub: string;
  template: TemplateId;
  bgColor: string;
  accentColor: string;
  textColor: string;
  subtitleColor: string;
  titleSize: number;
  overlayOpacity: number;
  highlightTag: string;
}

const BLUEPRINTS: BlueprintPreset[] = [
  {
    id: "tech-ai",
    name: "Tech & AI Viral",
    badgeText: "VIRAL GUIDE",
    headline: "AI TOOLS THAT FEEL ILLEGAL",
    sub: "2026 EDITION",
    template: "neon",
    bgColor: "#070b19",
    accentColor: "#00f0ff",
    textColor: "#ffffff",
    subtitleColor: "#a78bfa",
    titleSize: 92,
    overlayOpacity: 0.35,
    highlightTag: "Cyber Neon",
  },
  {
    id: "gaming-challenge",
    name: "Gaming & Challenge",
    badgeText: "IMPOSSIBLE",
    headline: "I SURVIVED 100 DAYS",
    sub: "HARDCORE WORLD",
    template: "impact",
    bgColor: "#16060b",
    accentColor: "#ff2d55",
    textColor: "#ffffff",
    subtitleColor: "#ffea00",
    titleSize: 96,
    overlayOpacity: 0.40,
    highlightTag: "Crimson Ember",
  },
  {
    id: "finance-growth",
    name: "Finance & Case Study",
    badgeText: "CASE STUDY",
    headline: "HOW I MADE $10,000",
    sub: "IN 30 DAYS STEP-BY-STEP",
    template: "studio",
    bgColor: "#07150d",
    accentColor: "#10b981",
    textColor: "#f8fafc",
    subtitleColor: "#fbbf24",
    titleSize: 88,
    overlayOpacity: 0.35,
    highlightTag: "Emerald Wealth",
  },
];

const COLOR_PRESETS = [
  { name: "Cyber Cyan", bg: "#070b19", accent: "#00f0ff", text: "#ffffff", sub: "#a78bfa" },
  { name: "Crimson Heat", bg: "#16060b", accent: "#ff2d55", text: "#ffffff", sub: "#ffea00" },
  { name: "Emerald Wealth", bg: "#07150d", accent: "#10b981", text: "#f8fafc", sub: "#fbbf24" },
  { name: "Electric Purple", bg: "#0f0819", accent: "#a855f7", text: "#ffffff", sub: "#38bdf8" },
  { name: "Sunset Amber", bg: "#190e06", accent: "#f97316", text: "#ffffff", sub: "#fde047" },
];

const QUICK_SIZES = [72, 84, 92, 108];

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
    image.onerror = () => reject(new Error("Could not load the image."));
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

// Client-side canvas generator for instant stylized background presets ($0 compute, 100% in-browser)
function generateBlueprintBackground(type: "neon" | "impact" | "studio"): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve("");
      return;
    }

    if (type === "neon") {
      const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      grad.addColorStop(0, "#080e1e");
      grad.addColorStop(0.5, "#0b162c");
      grad.addColorStop(1, "#03060f");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const g1 = ctx.createRadialGradient(950, 220, 10, 950, 220, 480);
      g1.addColorStop(0, "rgba(34, 211, 238, 0.45)");
      g1.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const g2 = ctx.createRadialGradient(250, 520, 10, 250, 520, 420);
      g2.addColorStop(0, "rgba(168, 85, 247, 0.35)");
      g2.addColorStop(1, "rgba(168, 85, 247, 0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = "rgba(34, 211, 238, 0.15)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= CANVAS_WIDTH; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 120, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    } else if (type === "impact") {
      const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      grad.addColorStop(0, "#24060d");
      grad.addColorStop(0.5, "#150408");
      grad.addColorStop(1, "#0a0204");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const g1 = ctx.createRadialGradient(1020, 280, 20, 1020, 280, 540);
      g1.addColorStop(0, "rgba(255, 45, 85, 0.55)");
      g1.addColorStop(0.7, "rgba(255, 120, 40, 0.2)");
      g1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.strokeStyle = "rgba(255, 234, 0, 0.2)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(680, 0);
      ctx.lineTo(1120, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 45, 85, 0.28)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(580, 0);
      ctx.lineTo(1020, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.restore();
    } else {
      const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      grad.addColorStop(0, "#081810");
      grad.addColorStop(0.5, "#0b2016");
      grad.addColorStop(1, "#030a06");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const g1 = ctx.createRadialGradient(920, 260, 20, 920, 260, 500);
      g1.addColorStop(0, "rgba(16, 185, 129, 0.45)");
      g1.addColorStop(0.7, "rgba(245, 158, 11, 0.15)");
      g1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = "rgba(16, 185, 129, 0.12)";
      ctx.lineWidth = 1;
      for (let i = -CANVAS_HEIGHT; i <= CANVAS_WIDTH; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + CANVAS_HEIGHT, CANVAS_HEIGHT);
        ctx.stroke();
      }
    }

    resolve(canvas.toDataURL("image/jpeg", 0.9));
  });
}

export default function YouTubeThumbnailMaker() {
  const [template, setTemplate] = useState<TemplateId>("impact");
  const [title, setTitle] = useState(templates.impact.title);
  const [subtitle, setSubtitle] = useState("IN 24 HOURS");
  const [badge, setBadge] = useState(templates.impact.badge);
  const [bgColor, setBgColor] = useState(templates.impact.bg);
  const [textColor, setTextColor] = useState(templates.impact.text);
  const [subtitleColor, setSubtitleColor] = useState(templates.impact.subtitle);
  const [accentColor, setAccentColor] = useState(templates.impact.accent);
  const [overlayOpacity, setOverlayOpacity] = useState(0.44);
  const [titleSize, setTitleSize] = useState(92);
  const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(null);

  // Background Image State
  const [bgImage, setBgImage] = useState<string | null>(null);

  // Foreground Overlay / Cutout State
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [overlayPos, setOverlayPos] = useState({ x: 0.6, y: 0.2 });
  const [overlaySize, setOverlaySize] = useState(38); // size in % of canvas width

  // Draggable Text Block State
  const [textPos, setTextPos] = useState({ x: 0.08, y: 0.22 });

  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<"preview" | "controls">("preview");

  const objectUrlRef = useRef<string | null>(null);
  const overlayUrlRef = useRef<string | null>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (overlayUrlRef.current) URL.revokeObjectURL(overlayUrlRef.current);
    };
  }, []);

  // Listen for pipeline incoming items (e.g. from background remover or converter)
  useEffect(() => {
    const pending = consumePipelineItem();
    if (pending && pending.url) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      setBgImage(pending.url);
    }
  }, []);

  // Global Ctrl+V Clipboard Paste Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            const url = URL.createObjectURL(file);
            if (!bgImage) {
              if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
              objectUrlRef.current = url;
              setBgImage(url);
            } else {
              if (overlayUrlRef.current) URL.revokeObjectURL(overlayUrlRef.current);
              overlayUrlRef.current = url;
              setOverlayImage(url);
            }
            setError("");
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [bgImage]);

  const applyTemplate = (id: TemplateId) => {
    const next = templates[id];
    setTemplate(id);
    setTitle(next.title);
    setBadge(next.badge);
    setBgColor(next.bg);
    setTextColor(next.text);
    setSubtitleColor(next.subtitle);
    setAccentColor(next.accent);
    setActiveBlueprintId(null);
    setError("");
  };

  const applyBlueprint = async (bp: BlueprintPreset) => {
    setActiveBlueprintId(bp.id);
    setTemplate(bp.template);
    setTitle(bp.headline);
    setSubtitle(bp.sub);
    setBadge(bp.badgeText);
    setBgColor(bp.bgColor);
    setAccentColor(bp.accentColor);
    setTextColor(bp.textColor);
    setSubtitleColor(bp.subtitleColor);
    setTitleSize(bp.titleSize);
    setOverlayOpacity(bp.overlayOpacity);

    // Synthesize instant client-side backdrop
    const sampleBg = await generateBlueprintBackground(bp.template);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setBgImage(sampleBg);
    setError("");
  };

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setBgColor(preset.bg);
    setAccentColor(preset.accent);
    setTextColor(preset.text);
    setSubtitleColor(preset.sub);
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
    setSubtitle("IN 24 HOURS");
    setOverlayOpacity(0.44);
    setTitleSize(92);
    setTextPos({ x: 0.08, y: 0.22 });
    setOverlayPos({ x: 0.6, y: 0.2 });
    setOverlaySize(38);
    setActiveBlueprintId(null);
    setError("");
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
    setActiveBlueprintId(null);
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

    const relativeX = (el.left - container.left) / container.width;
    const relativeY = (el.top - container.top) / container.height;

    setter({
      x: Math.max(0.01, Math.min(0.85, relativeX)),
      y: Math.max(0.01, Math.min(0.85, relativeY)),
    });
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

    // 4. Draw Subtle Grid Pattern
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    for (let x = 0; x < CANVAS_WIDTH; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 210, CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.restore();

    // 5. Draw Canvas Border Card
    ctx.fillStyle = hexToRgba("#000000", 0.28);
    roundedRect(ctx, 56, 50, 1168, 620, 42);
    ctx.fill();
    ctx.strokeStyle = hexToRgba("#ffffff", 0.16);
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. Draw Draggable Foreground Cutout Overlay
    if (overlayImage) {
      const overlayImg = await loadImage(overlayImage);
      const ow = (overlaySize / 100) * CANVAS_WIDTH;
      const oh = (ow / overlayImg.width) * overlayImg.height;
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
    roundedRect(ctx, textX, textY, badgeWidth, 58, 18);
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
    let currentY = textY + 84;

    for (const line of titleLines) {
      ctx.strokeStyle = hexToRgba("#000000", 0.65);
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

    // Draw decorative bottom accent bars
    ctx.fillStyle = accentColor;
    roundedRect(ctx, textX, currentY + 20, 190, 14, 7);
    ctx.fill();
    ctx.fillStyle = subtitleColor;
    roundedRect(ctx, textX + 206, currentY + 20, 92, 14, 7);
    ctx.fill();

    // Resolution stamp
    ctx.font = "900 24px Arial, Helvetica, sans-serif";
    ctx.fillStyle = hexToRgba("#ffffff", 0.85);
    ctx.textAlign = "right";
    ctx.fillText("1280 × 720", 1180, 630);

    return canvas;
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      setError("");
      const canvas = await renderThumbnail();
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Could not generate image file.");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const filename = `youtube-thumbnail-1280x720-${Date.now()}.png`;
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        saveFileHistory({
          toolType: "youtube-thumbnail",
          originalName: filename,
          resultUrl: url,
          fileType: "image",
          status: "completed",
          metadata: {
            toolName: "YouTube Thumbnail Maker",
            resolution: "1280x720",
          },
        });
      }, "image/png");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not export the thumbnail.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      setIsExporting(true);
      setError("");
      const canvas = await renderThumbnail();
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Could not prepare image for copying.");
        if (typeof navigator !== "undefined" && navigator.clipboard && typeof window.ClipboardItem !== "undefined") {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2200);
        } else {
          // Fallback to direct download
          const link = document.createElement("a");
          link.download = `youtube-thumbnail-1280x720-${Date.now()}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      }, "image/png");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not copy image to clipboard.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Top Live Stats & Quick Info Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 p-5 md:p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-600/10 border border-red-500/30 text-red-500 shadow-lg shadow-red-500/10">
              <YoutubeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  YouTube Thumbnail Studio
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> Live 16:9
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Design high-converting, click-worthy 16:9 thumbnails with drag-and-drop titles and subject cutouts.
              </p>
            </div>
          </div>

          {/* Live Stats Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Canvas</span>
              <span className="font-mono font-bold text-cyan-300">1280 × 720</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Format</span>
              <span className="font-semibold text-emerald-300">High-Res PNG</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Style</span>
              <span className="font-semibold text-white capitalize">{template}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Action Controls & Mobile Segmented Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Mobile View Toggle */}
        <div className="flex lg:hidden items-center p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              mobileTab === "preview" ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white"
            )}
          >
            Canvas Preview
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("controls")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              mobileTab === "controls" ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white"
            )}
          >
            Text & Styling
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-zinc-300">
            <Layout className="w-3.5 h-3.5 text-red-400" /> Interactive Canvas
          </span>
          <span className="text-zinc-600">·</span>
          <span>Click and drag titles or cutouts to reposition</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={resetDesign}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title="Reset all fields to default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" /> Reset
          </button>

          <button
            type="button"
            onClick={handleCopyImage}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/15 rounded-xl text-xs font-bold text-white hover:bg-white/10 hover:border-cyan-400/40 transition-all cursor-pointer shadow-sm"
            title="Copy 1280x720 PNG directly to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-300" />
                <span>Copy Picture</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/20 text-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Rendering..." : "Download PNG"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-100 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Main Workspace Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 16:9 Interactive Canvas Stage & Blueprints */}
        <section
          className={cn(
            "lg:col-span-7 space-y-6 order-1",
            mobileTab === "controls" ? "hidden lg:block" : "block"
          )}
        >
          {/* Obsidian macOS Canvas Stage Container */}
          <div className="relative group overflow-hidden rounded-[2rem] border border-white/15 bg-black/60 shadow-[0_40px_100px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
            {/* macOS Window Titlebar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 font-mono text-[11px] text-zinc-400 hidden sm:inline">
                  1280 × 720 (16:9 Live Canvas)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 text-cyan-400 font-medium">
                  <Move className="w-3 h-3" /> Draggable Elements
                </span>
                <span className="hidden md:flex items-center gap-1 text-zinc-500">
                  <Monitor className="w-3 h-3" /> YouTube Ratio
                </span>
              </div>
            </div>

            {/* Interactive Preview Canvas */}
            <div className="p-3 sm:p-5">
              <div
                ref={previewContainerRef}
                style={{ backgroundColor: bgColor }}
                className="relative aspect-video w-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] select-none"
              >
                {/* 1. Background Image Layer */}
                {bgImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                  >
                    <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
                  </div>
                )}

                {/* 2. Ambient Lighting Gradients & Grid Lines */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/15 to-black/85" />
                <div
                  className="absolute -top-1/3 -right-1/4 h-full w-full rounded-full blur-[90px] opacity-45 pointer-events-none"
                  style={{ backgroundColor: accentColor }}
                />
                <div
                  className="absolute -bottom-1/3 -left-1/4 h-2/3 w-2/3 rounded-full blur-[90px] opacity-30 pointer-events-none"
                  style={{ backgroundColor: subtitleColor }}
                />
                <div className="absolute inset-[4%] rounded-[1.5rem] border border-white/15 bg-black/15 pointer-events-none" />

                {/* 3. Draggable Subject Cutout Layer */}
                {overlayImage && (
                  <motion.div
                    key={`overlay-${overlayPos.x.toFixed(3)}-${overlayPos.y.toFixed(3)}`}
                    ref={overlayRef}
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    dragConstraints={previewContainerRef}
                    onDragEnd={() => handleDragEnd(overlayRef, setOverlayPos)}
                    className="absolute cursor-move select-none z-10 active:scale-[1.02] transition-shadow"
                    style={{
                      left: `${overlayPos.x * 100}%`,
                      top: `${overlayPos.y * 100}%`,
                      width: `${overlaySize}%`,
                    }}
                  >
                    <img
                      src={overlayImage}
                      alt="Cutout"
                      className="w-full h-auto object-contain pointer-events-none drop-shadow-[0_16px_28px_rgba(0,0,0,0.6)]"
                    />
                  </motion.div>
                )}

                {/* 4. Draggable Text Container */}
                <motion.div
                  key={`text-${textPos.x.toFixed(3)}-${textPos.y.toFixed(3)}`}
                  ref={textRef}
                  drag
                  dragMomentum={false}
                  dragElastic={0}
                  dragConstraints={previewContainerRef}
                  onDragEnd={() => handleDragEnd(textRef, setTextPos)}
                  className="absolute cursor-move select-none p-3.5 sm:p-5 rounded-[1.8rem] hover:bg-white/[0.03] active:bg-white/[0.06] z-20 transition-colors"
                  style={{
                    left: `${textPos.x * 100}%`,
                    top: `${textPos.y * 100}%`,
                    maxWidth: "75%",
                  }}
                >
                  {/* Category Badge Tag */}
                  <div
                    className="mb-2.5 inline-flex max-w-full rounded-xl px-3.5 py-1.5 text-[clamp(0.55rem,1.5vw,1.1rem)] font-black uppercase tracking-[0.14em] text-white shadow-[0_0_28px_rgba(0,0,0,0.35)]"
                    style={{ backgroundColor: accentColor }}
                  >
                    <span>{badge || "NEW VIDEO"}</span>
                  </div>

                  {/* Main Headline Title */}
                  <h2
                    className="max-w-full break-words font-black uppercase leading-[0.88] tracking-normal drop-shadow-[0_12px_20px_rgba(0,0,0,0.7)]"
                    style={{
                      color: textColor,
                      fontSize: `clamp(1.6rem, ${titleSize / 13.5}vw, ${titleSize}px)`,
                      fontFamily: "Arial Black, Impact, Arial, sans-serif",
                      WebkitTextStroke: "0.03em rgba(0,0,0,0.45)",
                    }}
                  >
                    {title || "YOUR TITLE HERE"}
                  </h2>

                  {/* Subtitle Callout */}
                  {subtitle && (
                    <p
                      className="mt-2.5 font-black uppercase leading-none tracking-normal drop-shadow-[0_8px_14px_rgba(0,0,0,0.6)]"
                      style={{
                        color: subtitleColor,
                        fontSize: "clamp(0.95rem, 2.8vw, 2.6rem)",
                        fontFamily: "Arial Black, Impact, Arial, sans-serif",
                        WebkitTextStroke: "0.04em rgba(0,0,0,0.4)",
                      }}
                    >
                      {subtitle}
                    </p>
                  )}

                  {/* Decorative Bottom Bars */}
                  <div className="mt-3.5 flex items-center gap-2.5">
                    <span className="h-2 w-20 sm:w-28 rounded-full" style={{ backgroundColor: accentColor }} />
                    <span className="h-2 w-10 sm:w-14 rounded-full" style={{ backgroundColor: subtitleColor }} />
                  </div>
                </motion.div>

                {/* Resolution stamp watermark */}
                <div className="absolute bottom-[6%] right-[6%] text-[10px] sm:text-xs font-black text-white/70 pointer-events-none">
                  1280 × 720
                </div>
              </div>
            </div>
          </div>

          {/* 3 Instant 1-Click Viral Creator Blueprints (Directly Below Preview — No Voids!) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  1-Click Creator Blueprints
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Instant $0 compute demo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {BLUEPRINTS.map((bp) => {
                const isActive = activeBlueprintId === bp.id;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => applyBlueprint(bp)}
                    className={cn(
                      "group relative rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
                      isActive
                        ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.15)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    )}
                  >
                    {/* Card header with badge & tag */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white"
                        style={{ backgroundColor: bp.accentColor }}
                      >
                        {bp.badgeText}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                        {bp.highlightTag}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                      {bp.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {bp.headline}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                      <span className="text-zinc-500 font-mono">{bp.sub}</span>
                      <span className="text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        Apply <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Creator Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Move className="h-4 w-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">Drag & Reposition</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Freely drag both the headline title block and subject cutouts anywhere within the 16:9 canvas frame.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Layers className="h-4 w-4 text-violet-400" />
                <h4 className="text-xs font-bold text-white">Subject Cutouts</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Overlay transparent PNG cutouts (reaction faces, product shots, game characters) seamlessly on top of photos.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">High-CTR Contrast</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                High-impact outlines, deep drop shadows, and glowing accent flares engineered to maximize click-through rates.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Creator Styling Console */}
        <aside
          className={cn(
            "lg:col-span-5 space-y-5 order-2",
            mobileTab === "preview" ? "hidden lg:block" : "block"
          )}
        >
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 sm:p-6 backdrop-blur-3xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  Thumbnail Controls
                </h3>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Creator Studio
              </span>
            </div>

            {/* Template Selector */}
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2.5">
                Style Template
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(templates) as TemplateId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyTemplate(id)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                      template === id && activeBlueprintId === null
                        ? "border-cyan-400/60 bg-cyan-400/15 text-white shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                        : "border-white/10 bg-black/20 text-zinc-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {templates[id].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline Text Fields */}
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Main Headline Title
                </label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value.toUpperCase())}
                  className="min-h-20 w-full resize-none bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs font-black leading-relaxed focus:border-cyan-400 outline-none transition-all text-white placeholder-zinc-600"
                  placeholder="CATCHY HEADLINE HERE"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                    Subtitle Callout
                  </label>
                  <input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value.toUpperCase())}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-cyan-400 outline-none transition-all text-white placeholder-zinc-600"
                    placeholder="IN 24 HOURS"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                    Badge Tag
                  </label>
                  <input
                    value={badge}
                    onChange={(e) => setBadge(e.target.value.toUpperCase())}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-cyan-400 outline-none transition-all text-white placeholder-zinc-600"
                    placeholder="FULL BUILD"
                  />
                </div>
              </div>

              {/* Title Size Slider & Quick Chips */}
              <div>
                <div className="mb-2 flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5 text-cyan-400" /> Title Size
                  </span>
                  <span className="text-white font-mono">{titleSize}px</span>
                </div>
                <input
                  type="range"
                  min="64"
                  max="118"
                  value={titleSize}
                  onChange={(e) => setTitleSize(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="mt-2 flex items-center gap-1.5">
                  {QUICK_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTitleSize(size)}
                      className={cn(
                        "flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer",
                        titleSize === size
                          ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                          : "bg-black/20 border-white/5 text-zinc-400 hover:text-white"
                      )}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Color Vibes Bar */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-violet-400" /> Quick Color Vibes
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyColorPreset(preset)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/10 bg-black/30 hover:border-white/20 transition-all text-left cursor-pointer"
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: preset.accent }}
                    />
                    <span className="text-[10px] font-bold text-zinc-300 truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Color Pickers */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Background", value: bgColor, setter: setBgColor },
                { label: "Accent Glow", value: accentColor, setter: setAccentColor },
                { label: "Title Text", value: textColor, setter: setTextColor },
                { label: "Subtitle Text", value: subtitleColor, setter: setSubtitleColor },
              ].map(({ label, value, setter }) => (
                <label key={label} className="rounded-xl bg-black/30 border border-white/10 p-2.5 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
                      {label}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-300 uppercase">
                      {value}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                </label>
              ))}
            </div>

            {/* Photos & Subject Cutouts */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              {/* Background Photo Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <span>Background Photo</span>
                  {bgImage && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div
                  {...getBgRootProps()}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer bg-black/25",
                    isBgDragActive ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 hover:border-white/20"
                  )}
                >
                  <input {...getBgInputProps()} />
                  <ImageIcon className="w-5 h-5 text-zinc-400 mx-auto mb-1.5" />
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-wider">
                    {bgImage ? "Replace Background Photo" : "Upload Background Photo"}
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-500">JPG, PNG, or WebP</p>
                </div>

                {bgImage && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                      <span>Darkness Overlay</span>
                      <span className="text-white font-mono">{Math.round(overlayOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.80"
                      step="0.02"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                      className="w-full accent-violet-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Subject / Reaction Cutout Upload */}
              <div className="space-y-2 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <span>Subject / Reaction Cutout</span>
                  {overlayImage && (
                    <button
                      type="button"
                      onClick={clearOverlay}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div
                  {...getOverlayRootProps()}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer bg-black/25",
                    isOverlayDragActive ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 hover:border-white/20"
                  )}
                >
                  <input {...getOverlayInputProps()} />
                  <Layers className="w-5 h-5 text-zinc-400 mx-auto mb-1.5" />
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-wider">
                    {overlayImage ? "Replace Subject Cutout" : "Upload Transparent PNG Cutout"}
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-500">Face reaction, product shot, or game avatar</p>
                </div>

                {overlayImage && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                      <span>Cutout Scale</span>
                      <span className="text-white font-mono">{overlaySize}%</span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="75"
                      value={overlaySize}
                      onChange={(e) => setOverlaySize(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Helpful Pro Tip */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-[11px] text-cyan-200/80 leading-relaxed flex items-center gap-2">
                <span className="text-xs">💡</span>
                <span>
                  <strong>Pro Tip:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">Ctrl+V</kbd> anywhere on this page to paste an image directly from your clipboard.
                </span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
