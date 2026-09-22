"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Laugh,
  Download,
  Layout,
  Palette,
  RotateCcw,
  RefreshCw,
  Image as ImageIcon,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Copy,
  Check,
  Shuffle,
  Flame,
  ArrowRight,
  Sliders,
  Move,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { consumePipelineItem, pipelineUrlToFile, clearPipelineItem } from "@/lib/pipeline";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";
import { saveFileHistory } from "@/lib/history";

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
}

const MEME_TEMPLATES: MemeTemplate[] = [
  { id: "drake", name: "Drake Hotline Bling", url: "https://i.imgflip.com/30b1gx.jpg" },
  { id: "distracted", name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg" },
  { id: "change-mind", name: "Change My Mind", url: "https://i.imgflip.com/24y43o.jpg" },
  { id: "two-buttons", name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" },
  { id: "batman", name: "Batman Slapping Robin", url: "https://i.imgflip.com/9ehk.jpg" },
  { id: "spongebob", name: "Mocking Spongebob", url: "https://i.imgflip.com/1otk96.jpg" },
  { id: "harold", name: "Hide the Pain Harold", url: "https://i.imgflip.com/gk5el.jpg" },
  { id: "grumpy", name: "Grumpy Cat", url: "https://i.imgflip.com/8p0a.jpg" },
  { id: "woman-yelling-cat", name: "Woman Yelling at Cat", url: "https://i.imgflip.com/345v97.jpg" },
  { id: "bern-sanders", name: "Bernie Sanders I Am Once Again", url: "https://i.imgflip.com/3oevdk.jpg" },
  { id: "doge", name: "Buff Doge vs Cheems", url: "https://i.imgflip.com/43a45p.png" },
  { id: "gigachad", name: "Gigachad", url: "https://i.imgflip.com/51s92s.jpg" },
  { id: "disaster-girl", name: "Disaster Girl", url: "https://i.imgflip.com/23ls.jpg" },
  { id: "always-has-been", name: "Always Has Been", url: "https://i.imgflip.com/46e43q.png" },
  { id: "waiting-skeleton", name: "Waiting Skeleton", url: "https://i.imgflip.com/2fm6x.jpg" },
  { id: "panik-kalm", name: "Panik Kalm Panik", url: "https://i.imgflip.com/3qqcim.png" },
  { id: "leo-dicaprio", name: "Leonardo DiCaprio Laughing", url: "https://i.imgflip.com/39t1o.jpg" },
  { id: "think-mark", name: "Think Mark Think", url: "https://i.imgflip.com/58jiim.png" },
  { id: "trade-offer", name: "Trade Offer", url: "https://i.imgflip.com/54hjww.jpg" },
];

const FONTS = [
  { id: "Impact", name: "Impact (Classic)" },
  { id: "Arial Black", name: "Arial Black (Bold)" },
  { id: "Comic Sans MS", name: "Comic Sans (Humor)" },
  { id: "Courier New", name: "Courier New (Retro)" },
  { id: "Trebuchet MS", name: "Trebuchet (Clean)" },
  { id: "Georgia", name: "Georgia (Serif)" },
];

interface MemeBlueprint {
  id: string;
  name: string;
  badge: string;
  templateId: string;
  top: string;
  bottom: string;
  font: string;
  fontSize: number;
  highlight: string;
  accent: string;
  topPos?: { x: number; y: number };
  bottomPos?: { x: number; y: number };
}

const MEME_BLUEPRINTS: MemeBlueprint[] = [
  {
    id: "drake",
    name: "Drake Approval",
    badge: "Classic 2-Panel",
    templateId: "drake",
    top: "WRITING CODE WITH BUGS",
    bottom: "CALLING IT AN UNDOCUMENTED FEATURE",
    font: "Impact",
    fontSize: 34,
    highlight: "Dev Humor",
    accent: "#a855f7",
    topPos: { x: 0.72, y: 0.25 },
    bottomPos: { x: 0.72, y: 0.75 },
  },
  {
    id: "distracted",
    name: "Distracted Focus",
    badge: "Trending Trio",
    templateId: "distracted",
    top: "NEW JAVASCRIPT FRAMEWORK",
    bottom: "MY UNFINISHED SIDE PROJECT",
    font: "Impact",
    fontSize: 32,
    highlight: "Viral Relatable",
    accent: "#ec4899",
    topPos: { x: 0.32, y: 0.65 },
    bottomPos: { x: 0.75, y: 0.68 },
  },
  {
    id: "two-buttons",
    name: "Hard Dilemma",
    badge: "Two Choices",
    templateId: "two-buttons",
    top: "FIX THE CRITICAL BUG",
    bottom: "PUSH TO PRODUCTION ON FRIDAY",
    font: "Impact",
    fontSize: 30,
    highlight: "Decision Panic",
    accent: "#06b6d4",
    topPos: { x: 0.36, y: 0.24 },
    bottomPos: { x: 0.64, y: 0.18 },
  },
];

const QUICK_FONT_SIZES = [32, 40, 48, 60];

export default function MemeGenerator() {
  const [topText, setTopText] = useState("WHEN THE CODE");
  const [bottomText, setBottomText] = useState("FINALLY WORKS");
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(MEME_TEMPLATES[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(null);

  // Draggable Text Position State (Normalized 0..1 coordinates)
  const [topPos, setTopPos] = useState({ x: 0.5, y: 0.12 });
  const [bottomPos, setBottomPos] = useState({ x: 0.5, y: 0.88 });
  const [selectedText, setSelectedText] = useState<"top" | "bottom">("top");
  const [hoveredText, setHoveredText] = useState<"top" | "bottom" | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Typography state
  const [fontFamily, setFontFamily] = useState("Impact");
  const [fontSize, setFontSize] = useState(44);
  const [textColor, setTextColor] = useState("#ffffff");
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [outlineWidth, setOutlineWidth] = useState(6);
  const [isUppercase, setIsUppercase] = useState(true);
  const [textAlign, setTextAlign] = useState<"center" | "left" | "right">("center");

  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [renderedMemeUrl, setRenderedMemeUrl] = useState<string>("");
  const [mobileTab, setMobileTab] = useState<"canvas" | "controls">("canvas");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const customUrlRef = useRef<string | null>(null);

  // Drag tracking refs for fluid 60fps interaction
  const activeDragRef = useRef<"top" | "bottom" | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const topDimensionsRef = useRef<{ width: number; height: number }>({ width: 260, height: 50 });
  const bottomDimensionsRef = useRef<{ width: number; height: number }>({ width: 260, height: 50 });

  // Consume incoming pipeline asset (e.g. from AI Image Generator or Background Remover)
  useEffect(() => {
    const item = consumePipelineItem();
    if (item && item.url && item.fileType === "image") {
      pipelineUrlToFile(item.url, item.name || "meme-template.png")
        .then((file) => {
          if (customUrlRef.current) URL.revokeObjectURL(customUrlRef.current);
          const url = URL.createObjectURL(file);
          customUrlRef.current = url;
          setCustomImage(url);
          clearPipelineItem();
        })
        .catch((err) => console.warn("Failed to load pipeline asset into meme generator:", err));
    }

    // Parse incoming replay parameters from history
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTop = params.get("topText");
      const urlBottom = params.get("bottomText");
      const urlTemplate = params.get("templateId");

      if (urlTop) setTopText(urlTop);
      if (urlBottom) setBottomText(urlBottom);
      if (urlTemplate) {
        const matched = MEME_TEMPLATES.find((t) => t.id === urlTemplate);
        if (matched) setSelectedTemplate(matched);
      }
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
            if (customUrlRef.current) URL.revokeObjectURL(customUrlRef.current);
            const url = URL.createObjectURL(file);
            customUrlRef.current = url;
            setCustomImage(url);
            setActiveBlueprintId(null);
            setError("");
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  useEffect(() => {
    return () => {
      if (customUrlRef.current) URL.revokeObjectURL(customUrlRef.current);
    };
  }, []);

  // Canvas Drawing Routine (100% Watermark-Free)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    const targetUrl = customImage || selectedTemplate.url;
    img.src = targetUrl.startsWith("http")
      ? `/api/proxy?url=${encodeURIComponent(targetUrl)}`
      : targetUrl;

    img.onload = () => {
      const aspectRatio = img.width / img.height;
      canvas.width = 600;
      canvas.height = 600 / aspectRatio;

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Apply typography styles
      ctx.fillStyle = textColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineWidth;
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;

      // Load selected font
      ctx.font = `900 ${fontSize}px "${fontFamily}", Impact, sans-serif`;

      const lineHeight = fontSize * 1.15;

      // 1. Draw Headline (Top Text) - Freely Draggable
      if (topText.trim()) {
        ctx.textBaseline = "middle";
        ctx.textAlign = textAlign;
        const rawTop = isUppercase ? topText.toUpperCase() : topText;
        const topLines = rawTop.split("\n");

        let maxTopW = 0;
        topLines.forEach((line) => {
          const w = ctx.measureText(line).width;
          if (w > maxTopW) maxTopW = w;
        });
        const totalTopH = Math.max(topLines.length * lineHeight, fontSize);
        topDimensionsRef.current = { width: maxTopW, height: totalTopH };

        const centerX = topPos.x * canvas.width;
        const centerY = topPos.y * canvas.height;
        const startY = centerY - ((topLines.length - 1) * lineHeight) / 2;

        topLines.forEach((line, i) => {
          let lineX = centerX;
          if (textAlign === "left") lineX = centerX - maxTopW / 2;
          if (textAlign === "right") lineX = centerX + maxTopW / 2;
          const lineY = startY + i * lineHeight;

          if (outlineWidth > 0) {
            ctx.strokeText(line, lineX, lineY);
          }
          ctx.fillText(line, lineX, lineY);
        });
      } else {
        topDimensionsRef.current = { width: 140, height: 40 };
      }

      // 2. Draw Punchline (Bottom Text) - Freely Draggable
      if (bottomText.trim()) {
        ctx.textBaseline = "middle";
        ctx.textAlign = textAlign;
        const rawBottom = isUppercase ? bottomText.toUpperCase() : bottomText;
        const bottomLines = rawBottom.split("\n");

        let maxBottomW = 0;
        bottomLines.forEach((line) => {
          const w = ctx.measureText(line).width;
          if (w > maxBottomW) maxBottomW = w;
        });
        const totalBottomH = Math.max(bottomLines.length * lineHeight, fontSize);
        bottomDimensionsRef.current = { width: maxBottomW, height: totalBottomH };

        const centerX = bottomPos.x * canvas.width;
        const centerY = bottomPos.y * canvas.height;
        const startY = centerY - ((bottomLines.length - 1) * lineHeight) / 2;

        bottomLines.forEach((line, i) => {
          let lineX = centerX;
          if (textAlign === "left") lineX = centerX - maxBottomW / 2;
          if (textAlign === "right") lineX = centerX + maxBottomW / 2;
          const lineY = startY + i * lineHeight;

          if (outlineWidth > 0) {
            ctx.strokeText(line, lineX, lineY);
          }
          ctx.fillText(line, lineX, lineY);
        });
      } else {
        bottomDimensionsRef.current = { width: 140, height: 40 };
      }

      // NOTE: Watermark badge removed completely per specification. 100% clean memes!

      setError("");
      try {
        setRenderedMemeUrl(canvas.toDataURL("image/png"));
      } catch (e) {
        console.warn("Could not capture meme canvas data URL:", e);
      }
    };

    img.onerror = () => {
      canvas.width = 600;
      canvas.height = 600;
      ctx.fillStyle = "#15151c";
      ctx.fillRect(0, 0, 600, 600);
      ctx.fillStyle = "#a855f7";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Meme Template Loading...", 300, 280);
      setError("Template image could not be loaded. Try selecting another template or upload a custom image.");
    };
  }, [
    topText,
    bottomText,
    selectedTemplate,
    customImage,
    fontSize,
    textColor,
    fontFamily,
    outlineColor,
    outlineWidth,
    isUppercase,
    textAlign,
    topPos,
    bottomPos,
  ]);

  // Pointer event helpers for fluid drag-and-drop
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { normX: 0, normY: 0 };
    const rect = canvas.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { normX, normY };
  };

  const isOverBox = (
    normX: number,
    normY: number,
    pos: { x: number; y: number },
    dims: { width: number; height: number },
    canvas: HTMLCanvasElement
  ) => {
    const normW = Math.max(0.18, (dims.width + 36) / canvas.width);
    const normH = Math.max(0.08, (dims.height + 28) / canvas.height);
    return (
      Math.abs(normX - pos.x) <= normW / 2 &&
      Math.abs(normY - pos.y) <= normH / 2
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { normX, normY } = getCanvasCoords(e);

    const overTop = topText.trim()
      ? isOverBox(normX, normY, topPos, topDimensionsRef.current, canvas)
      : false;
    const overBottom = bottomText.trim()
      ? isOverBox(normX, normY, bottomPos, bottomDimensionsRef.current, canvas)
      : false;

    let target: "top" | "bottom" | null = null;
    if (overTop && overBottom) {
      const distTop = Math.hypot(normX - topPos.x, normY - topPos.y);
      const distBottom = Math.hypot(normX - bottomPos.x, normY - bottomPos.y);
      target = distTop <= distBottom ? "top" : "bottom";
    } else if (overTop) {
      target = "top";
    } else if (overBottom) {
      target = "bottom";
    }

    if (target) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      activeDragRef.current = target;
      const targetPos = target === "top" ? topPos : bottomPos;
      dragOffsetRef.current = {
        x: normX - targetPos.x,
        y: normY - targetPos.y,
      };
      setSelectedText(target);
      setIsDragging(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { normX, normY } = getCanvasCoords(e);

    if (activeDragRef.current) {
      const target = activeDragRef.current;
      const offset = dragOffsetRef.current;
      const clampedX = Math.max(0.04, Math.min(0.96, normX - offset.x));
      const clampedY = Math.max(0.04, Math.min(0.96, normY - offset.y));

      if (target === "top") {
        setTopPos({ x: clampedX, y: clampedY });
      } else {
        setBottomPos({ x: clampedX, y: clampedY });
      }
    } else {
      const overTop = topText.trim()
        ? isOverBox(normX, normY, topPos, topDimensionsRef.current, canvas)
        : false;
      const overBottom = bottomText.trim()
        ? isOverBox(normX, normY, bottomPos, bottomDimensionsRef.current, canvas)
        : false;

      if (overTop) setHoveredText("top");
      else if (overBottom) setHoveredText("bottom");
      else setHoveredText(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeDragRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      activeDragRef.current = null;
      setIsDragging(false);
    }
  };

  const handlePointerLeave = () => {
    if (!activeDragRef.current) {
      setHoveredText(null);
    }
  };

  const canvasCursor = activeDragRef.current || isDragging
    ? "grabbing"
    : hoveredText
    ? "grab"
    : "default";

  const onCustomDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, or WebP).");
      return;
    }

    if (customUrlRef.current) URL.revokeObjectURL(customUrlRef.current);
    const url = URL.createObjectURL(file);
    customUrlRef.current = url;
    setCustomImage(url);
    setActiveBlueprintId(null);
    setError("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onCustomDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    const filename = `exismic-meme-${selectedTemplate.id}-${Date.now()}.png`;
    a.href = url;
    a.download = filename;
    a.click();

    saveFileHistory({
      toolType: "meme-generator",
      originalName: topText || bottomText ? `Meme: "${topText || bottomText}"` : "Custom Meme",
      resultUrl: url,
      fileType: "image",
      status: "completed",
      metadata: {
        prompt: topText || bottomText ? `"${topText} / ${bottomText}"` : "Custom Meme Creation",
        topText,
        bottomText,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        targetHref: "/tools/meme-generator",
        toolName: "Meme Studio",
      },
    }).catch(() => {});
  };

  const handleCopyImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      if (typeof navigator !== "undefined" && navigator.clipboard && typeof window.ClipboardItem !== "undefined") {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2200);
        } catch (err) {
          console.warn("Clipboard copy error:", err);
          handleDownload();
        }
      } else {
        handleDownload();
      }
    }, "image/png");
  };

  const handleRandom = () => {
    setCustomImage(null);
    setActiveBlueprintId(null);
    const randomIndex = Math.floor(Math.random() * MEME_TEMPLATES.length);
    setSelectedTemplate(MEME_TEMPLATES[randomIndex]);
  };

  const applyBlueprint = (bp: MemeBlueprint) => {
    setActiveBlueprintId(bp.id);
    setCustomImage(null);
    const found = MEME_TEMPLATES.find((t) => t.id === bp.templateId);
    if (found) setSelectedTemplate(found);
    setTopText(bp.top);
    setBottomText(bp.bottom);
    setFontFamily(bp.font);
    setFontSize(bp.fontSize);
    setIsUppercase(true);
    if (bp.topPos) setTopPos(bp.topPos);
    else setTopPos({ x: 0.5, y: 0.12 });
    if (bp.bottomPos) setBottomPos(bp.bottomPos);
    else setBottomPos({ x: 0.5, y: 0.88 });
    setError("");
  };

  const reset = () => {
    setTopText("");
    setBottomText("");
    setCustomImage(null);
    setActiveBlueprintId(null);
    setFontSize(44);
    setFontFamily("Impact");
    setTextColor("#ffffff");
    setOutlineColor("#000000");
    setOutlineWidth(6);
    setIsUppercase(true);
    setTextAlign("center");
    setTopPos({ x: 0.5, y: 0.12 });
    setBottomPos({ x: 0.5, y: 0.88 });
    setError("");
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Top Live Stats & Quick Info Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 p-5 md:p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/10">
              <Laugh className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Meme Studio
                </h1>
                <span className="rounded-md bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-300">
                  Watermark Free
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Design viral memes with freely draggable captions, classic templates, or your own photos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300">
              <span className="font-bold text-white">{MEME_TEMPLATES.length}</span> Templates
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300 flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-cyan-400" />
              <span>Draggable Text</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>No Watermark</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Workspace Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden items-center bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setMobileTab("canvas")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              mobileTab === "canvas" ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white"
            )}
          >
            Meme Canvas
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("controls")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              mobileTab === "controls" ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white"
            )}
          >
            Captions & Placement
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-zinc-300">
            <Layout className="w-3.5 h-3.5 text-purple-400" /> Interactive Studio
          </span>
          <span className="text-zinc-600">·</span>
          <span>Click and drag any caption directly on the preview to position it anywhere</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRandom}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title="Pick a random popular template"
          >
            <Shuffle className="w-3.5 h-3.5 text-purple-400" /> Random Template
          </button>

          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title="Clear text and reset positions"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" /> Reset
          </button>

          <button
            type="button"
            onClick={handleCopyImage}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/15 rounded-xl text-xs font-bold text-white hover:bg-white/10 hover:border-purple-400/40 transition-all cursor-pointer shadow-sm"
            title="Copy meme directly to clipboard"
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
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export PNG
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
        {/* LEFT COLUMN: Meme Canvas Stage, Blueprints & Next Action Pipeline */}
        <section
          className={cn(
            "lg:col-span-7 space-y-6 order-1",
            mobileTab === "controls" ? "hidden lg:block" : "block"
          )}
        >
          {/* Obsidian macOS Meme Canvas Container */}
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
                  600px Live Meme Canvas Stage
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5 text-cyan-400 font-medium bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
                  <Move className="w-3 h-3" /> Draggable Captions
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-purple-300 font-medium">
                  <Type className="w-3 h-3" /> Live Canvas
                </span>
              </div>
            </div>

            {/* Canvas Stage Surface */}
            <div className="p-4 sm:p-8 flex items-center justify-center min-h-[420px] bg-gradient-to-b from-white/[0.02] to-transparent">
              <div
                ref={canvasContainerRef}
                className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black max-w-full select-none"
              >
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onPointerLeave={handlePointerLeave}
                  style={{ touchAction: "none", cursor: canvasCursor }}
                  className="max-w-full h-auto block rounded-xl select-none"
                />

                {/* Draggable Bounding Box Visuals (Shows when hovered, selected, or actively dragging) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                  {/* Top Text Bounding Box */}
                  {topText.trim() && (hoveredText === "top" || selectedText === "top" || activeDragRef.current === "top") && (
                    <div
                      className="absolute border-2 border-dashed border-purple-400 rounded-xl transition-all duration-75 shadow-[0_0_24px_rgba(168,85,247,0.35)]"
                      style={{
                        left: `${topPos.x * 100}%`,
                        top: `${topPos.y * 100}%`,
                        width: `${canvasRef.current ? Math.min(98, Math.max(18, ((topDimensionsRef.current.width + 32) / canvasRef.current.width) * 100)) : 50}%`,
                        height: `${canvasRef.current ? Math.min(98, Math.max(8, ((topDimensionsRef.current.height + 20) / canvasRef.current.height) * 100)) : 14}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <span className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-purple-400 border-2 border-black shadow" />
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-purple-400 border-2 border-black shadow" />
                      <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-purple-400 border-2 border-black shadow" />
                      <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-purple-400 border-2 border-black shadow" />

                      <div
                        className={cn(
                          "absolute left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-purple-600/95 text-[9px] font-black uppercase text-white shadow-lg tracking-wider whitespace-nowrap flex items-center gap-1",
                          topPos.y < 0.14 ? "-bottom-6" : "-top-6"
                        )}
                      >
                        <Move className="w-2.5 h-2.5" /> Headline (Drag)
                      </div>
                    </div>
                  )}

                  {/* Bottom Text Bounding Box */}
                  {bottomText.trim() && (hoveredText === "bottom" || selectedText === "bottom" || activeDragRef.current === "bottom") && (
                    <div
                      className="absolute border-2 border-dashed border-cyan-400 rounded-xl transition-all duration-75 shadow-[0_0_24px_rgba(6,182,212,0.35)]"
                      style={{
                        left: `${bottomPos.x * 100}%`,
                        top: `${bottomPos.y * 100}%`,
                        width: `${canvasRef.current ? Math.min(98, Math.max(18, ((bottomDimensionsRef.current.width + 32) / canvasRef.current.width) * 100)) : 50}%`,
                        height: `${canvasRef.current ? Math.min(98, Math.max(8, ((bottomDimensionsRef.current.height + 20) / canvasRef.current.height) * 100)) : 14}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <span className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-black shadow" />
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-black shadow" />
                      <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-black shadow" />
                      <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-cyan-400 border-2 border-black shadow" />

                      <div
                        className={cn(
                          "absolute left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-cyan-600/95 text-[9px] font-black uppercase text-white shadow-lg tracking-wider whitespace-nowrap flex items-center gap-1",
                          bottomPos.y > 0.86 ? "-top-6" : "-bottom-6"
                        )}
                      >
                        <Move className="w-2.5 h-2.5" /> Punchline (Drag)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ambient Glow Aura */}
              <div className="absolute -top-1/4 -right-1/4 w-full h-full rounded-full blur-[140px] bg-purple-600/10 pointer-events-none -z-10" />
            </div>
          </div>

          {/* 3 Instant 1-Click Viral Meme Blueprints */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  1-Click Viral Meme Blueprints
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Click to load instantly</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MEME_BLUEPRINTS.map((bp) => {
                const isActive = activeBlueprintId === bp.id;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => applyBlueprint(bp)}
                    className={cn(
                      "group relative rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
                      isActive
                        ? "border-purple-400/60 bg-purple-500/15 shadow-[0_0_24px_rgba(168,85,247,0.18)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white"
                        style={{ backgroundColor: bp.accent }}
                      >
                        {bp.badge}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                        {bp.highlight}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                      {bp.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      "{bp.top} / {bp.bottom}"
                    </p>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                      <span className="text-zinc-500 font-mono">{bp.font} · {bp.fontSize}px</span>
                      <span className="text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
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
                <Move className="h-4 w-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white">Freely Draggable Captions</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Click and drag any headline or punchline anywhere across multi-panel templates like Drake or Distracted Boyfriend.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <ImageIcon className="h-4 w-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white">Custom Photo Uploads</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Upload your own photos or paste screenshots directly with Ctrl+V to make personal reaction memes.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Check className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">Watermark-Free Exports</h4>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Export 100% clean, crisp memes without any brand watermarks, ready for Discord, Slack, and Twitter.
              </p>
            </div>
          </div>

          {/* Next Action Pipeline Bar */}
          {renderedMemeUrl && (
            <MediaPipelineBar
              imageUrl={renderedMemeUrl}
              imageName="exismic-meme.png"
              sourceToolId="meme-generator"
              sourceToolName="Meme Studio"
              actions={["compressor", "converter", "resizer", "eraser"]}
              title="Next Action Pipeline"
              subtitle="Compress this meme, convert formats, or adjust frame dimensions"
            />
          )}
        </section>

        {/* RIGHT COLUMN: Meme Controls Console */}
        <aside
          className={cn(
            "lg:col-span-5 space-y-5 order-2",
            mobileTab === "canvas" ? "hidden lg:block" : "block"
          )}
        >
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 sm:p-6 backdrop-blur-3xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  Meme Controls
                </h3>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Styling Console
              </span>
            </div>

            {/* Template Selector Grid */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                  Choose Template
                </label>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {MEME_TEMPLATES.length} classic templates
                </span>
              </div>

              <div className="h-40 overflow-y-auto pr-1.5 custom-scrollbar mb-3 rounded-xl border border-white/10 bg-black/30 p-2">
                <div className="grid grid-cols-5 gap-1.5">
                  {MEME_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setCustomImage(null);
                        setSelectedTemplate(t);
                        setActiveBlueprintId(null);
                      }}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                        !customImage && selectedTemplate.id === t.id
                          ? "border-purple-400 scale-95 shadow-md shadow-purple-500/25"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      title={t.name}
                    >
                      <img
                        src={t.url.startsWith("http") ? `/api/proxy?url=${encodeURIComponent(t.url)}` : t.url}
                        className="w-full h-full object-cover"
                        alt={t.name}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Photo Upload Dropzone */}
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all bg-black/25",
                  isDragActive
                    ? "border-purple-400 bg-purple-500/10"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex items-center justify-center gap-2">
                  <ImageIcon className="w-4 h-4 text-zinc-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
                    {customImage ? "Replace Uploaded Photo" : "Upload Custom Photo"}
                  </span>
                </div>
                {customImage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomImage(null);
                    }}
                    className="mt-1.5 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300"
                  >
                    Clear Custom Photo
                  </button>
                )}
              </div>
            </div>

            {/* Captions & Alignment */}
            <div className="space-y-3.5 pt-4 border-t border-white/10">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Headline (Top Text)
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTextAlign("left")}
                      className={cn("p-1 rounded cursor-pointer", textAlign === "left" ? "text-purple-400 bg-white/10" : "text-zinc-500 hover:text-white")}
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextAlign("center")}
                      className={cn("p-1 rounded cursor-pointer", textAlign === "center" ? "text-purple-400 bg-white/10" : "text-zinc-500 hover:text-white")}
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextAlign("right")}
                      className={cn("p-1 rounded cursor-pointer", textAlign === "right" ? "text-purple-400 bg-white/10" : "text-zinc-500 hover:text-white")}
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  onFocus={() => setSelectedText("top")}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-purple-400 outline-none transition-all resize-none h-16 placeholder-zinc-600"
                  placeholder="TOP CAPTION (PRESS ENTER FOR MULTI-LINE)..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                  Punchline (Bottom Text)
                </label>
                <textarea
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  onFocus={() => setSelectedText("bottom")}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-purple-400 outline-none transition-all resize-none h-16 placeholder-zinc-600"
                  placeholder="BOTTOM PUNCHLINE..."
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-black/30 border border-white/10 rounded-xl">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                  Force Uppercase Letters
                </span>
                <button
                  type="button"
                  onClick={() => setIsUppercase(!isUppercase)}
                  className={cn(
                    "w-10 h-5 rounded-full p-0.5 transition-all cursor-pointer",
                    isUppercase ? "bg-purple-600 flex justify-end" : "bg-zinc-800 flex justify-start"
                  )}
                >
                  <span className="w-4 h-4 rounded-full bg-white block" />
                </button>
              </div>
            </div>

            {/* Typography Selectors */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                    Font Style
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white outline-none focus:border-purple-400 cursor-pointer"
                  >
                    {FONTS.map((f) => (
                      <option key={f.id} value={f.id} className="bg-[#15151c] text-white">
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Font Size
                    </label>
                    <span className="text-[10px] font-mono text-purple-300 font-bold">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={92}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                  <div className="mt-1.5 flex items-center gap-1">
                    {QUICK_FONT_SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFontSize(s)}
                        className={cn(
                          "flex-1 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer",
                          fontSize === s
                            ? "bg-purple-500/20 border-purple-400/40 text-purple-300"
                            : "bg-black/20 border-white/5 text-zinc-400 hover:text-white"
                        )}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Color & Outline Stroke */}
              <div className="grid grid-cols-2 gap-3">
                <label className="rounded-xl bg-black/30 border border-white/10 p-2.5 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
                      Font Color
                    </span>
                    <span className="font-mono text-[10px] text-zinc-300 uppercase">
                      {textColor}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                </label>

                <label className="rounded-xl bg-black/30 border border-white/10 p-2.5 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
                      Outline Color
                    </span>
                    <span className="font-mono text-[10px] text-zinc-300 uppercase">
                      {outlineColor}
                    </span>
                  </div>
                  <input
                    type="color"
                    value={outlineColor}
                    onChange={(e) => setOutlineColor(e.target.value)}
                    className="h-7 w-7 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                </label>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Outline Thickness
                  </label>
                  <span className="text-[10px] font-mono text-purple-300 font-bold">{outlineWidth}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={14}
                  value={outlineWidth}
                  onChange={(e) => setOutlineWidth(parseInt(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Caption Placement & Position Presets */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                  Caption Placement
                </label>
                <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                  <Move className="w-3 h-3 text-cyan-400" /> Drag on canvas
                </span>
              </div>

              {/* Active Caption Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedText("top")}
                  className={cn(
                    "py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    selectedText === "top"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-300" />
                  Headline (Top)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedText("bottom")}
                  className={cn(
                    "py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    selectedText === "bottom"
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-300" />
                  Punchline (Bottom)
                </button>
              </div>

              {/* Fine-tune X & Y Sliders for Selected Caption */}
              <div className="grid grid-cols-2 gap-3 bg-black/25 p-3 rounded-xl border border-white/5">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Horizontal (X)
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 font-bold">
                      {Math.round((selectedText === "top" ? topPos.x : bottomPos.x) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={96}
                    value={Math.round((selectedText === "top" ? topPos.x : bottomPos.x) * 100)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) / 100;
                      if (selectedText === "top") setTopPos((p) => ({ ...p, x: val }));
                      else setBottomPos((p) => ({ ...p, x: val }));
                    }}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Vertical (Y)
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 font-bold">
                      {Math.round((selectedText === "top" ? topPos.y : bottomPos.y) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={96}
                    value={Math.round((selectedText === "top" ? topPos.y : bottomPos.y) * 100)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) / 100;
                      if (selectedText === "top") setTopPos((p) => ({ ...p, y: val }));
                      else setBottomPos((p) => ({ ...p, y: val }));
                    }}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Position Presets */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block">
                  Quick Position Presets
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTopPos({ x: 0.5, y: 0.12 });
                      setBottomPos({ x: 0.5, y: 0.88 });
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-zinc-300 hover:text-white transition-all text-center cursor-pointer"
                  >
                    Classic Top / Bottom
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTopPos({ x: 0.72, y: 0.25 });
                      setBottomPos({ x: 0.72, y: 0.75 });
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-zinc-300 hover:text-white transition-all text-center cursor-pointer"
                  >
                    Right Side (Drake)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTopPos({ x: 0.28, y: 0.25 });
                      setBottomPos({ x: 0.28, y: 0.75 });
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-zinc-300 hover:text-white transition-all text-center cursor-pointer"
                  >
                    Left Side
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTopPos({ x: 0.5, y: 0.42 });
                      setBottomPos({ x: 0.5, y: 0.58 });
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-zinc-300 hover:text-white transition-all text-center cursor-pointer"
                  >
                    Centered Stack
                  </button>
                </div>
              </div>
            </div>

            {/* Pro Tip Box */}
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-[11px] text-purple-200/80 leading-relaxed flex items-center gap-2">
              <span className="text-xs">💡</span>
              <span>
                <strong>Pro Tip:</strong> Click and drag captions anywhere directly on the preview, or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">Ctrl+V</kbd> to paste an image directly from your clipboard.
              </span>
            </div>
          </div>
        </aside>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.25);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.45);
        }
      `}</style>
    </div>
  );
}
