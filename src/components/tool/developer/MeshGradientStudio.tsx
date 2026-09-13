"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Palette,
  Sparkles,
  Sliders,
  Layers,
  Download,
  Copy,
  Check,
  RefreshCw,
  Play,
  Pause,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Share2,
  Code2,
  Laptop,
  Smartphone,
  Square,
  PenTool,
  Maximize2,
  TrendingUp,
  User,
  ShieldCheck,
  Search,
  CheckCircle2,
  ChevronRight,
  Sun,
  Flame,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ============================================================================
// COLOR POINT INTERFACE & PRESETS (100% Plain English)
// ============================================================================

export interface ColorPoint {
  id: string;
  x: number; // 3 to 97%
  y: number; // 3 to 97%
  color: string;
  radius: number; // 35 to 85%
}

export interface PresetTheme {
  id: string;
  name: string;
  tag: string;
  bgColor: string;
  points: { x: number; y: number; color: string; radius: number }[];
}

const PRESETS: PresetTheme[] = [
  {
    id: "obsidian-cosmic",
    name: "Obsidian Cosmic",
    tag: "SIGNATURE",
    bgColor: "#080914",
    points: [
      { x: 18, y: 25, color: "#8b5cf6", radius: 60 },
      { x: 82, y: 20, color: "#06b6d4", radius: 55 },
      { x: 75, y: 80, color: "#ec4899", radius: 65 },
      { x: 22, y: 78, color: "#3b82f6", radius: 50 },
    ],
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    tag: "POPULAR",
    bgColor: "#060913",
    points: [
      { x: 20, y: 30, color: "#00f0ff", radius: 55 },
      { x: 80, y: 15, color: "#ff007f", radius: 60 },
      { x: 70, y: 85, color: "#7928ca", radius: 65 },
      { x: 15, y: 70, color: "#10b981", radius: 50 },
    ],
  },
  {
    id: "sunset-blaze",
    name: "Sunset Blaze",
    tag: "WARM",
    bgColor: "#0f0814",
    points: [
      { x: 15, y: 25, color: "#ff5e3a", radius: 60 },
      { x: 85, y: 20, color: "#ff2a6d", radius: 55 },
      { x: 80, y: 80, color: "#9b51e0", radius: 60 },
      { x: 20, y: 80, color: "#ffa600", radius: 50 },
    ],
  },
  {
    id: "emerald-aurora",
    name: "Emerald Aurora",
    tag: "FRESH",
    bgColor: "#061311",
    points: [
      { x: 25, y: 20, color: "#10b981", radius: 60 },
      { x: 75, y: 25, color: "#06b6d4", radius: 55 },
      { x: 80, y: 80, color: "#059669", radius: 65 },
      { x: 20, y: 75, color: "#34d399", radius: 50 },
    ],
  },
  {
    id: "royal-velvet",
    name: "Royal Velvet",
    tag: "LUXURY",
    bgColor: "#090614",
    points: [
      { x: 20, y: 20, color: "#7c3aed", radius: 60 },
      { x: 80, y: 25, color: "#c026d3", radius: 55 },
      { x: 75, y: 80, color: "#4338ca", radius: 65 },
      { x: 25, y: 80, color: "#e11d48", radius: 50 },
    ],
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    tag: "CALM",
    bgColor: "#050b14",
    points: [
      { x: 20, y: 25, color: "#0284c7", radius: 60 },
      { x: 80, y: 20, color: "#06b6d4", radius: 55 },
      { x: 70, y: 80, color: "#2563eb", radius: 65 },
      { x: 30, y: 75, color: "#0ea5e9", radius: 50 },
    ],
  },
  {
    id: "golden-solaris",
    name: "Golden Solaris",
    tag: "GLOW",
    bgColor: "#120a04",
    points: [
      { x: 25, y: 25, color: "#f59e0b", radius: 60 },
      { x: 80, y: 20, color: "#ef4444", radius: 55 },
      { x: 75, y: 80, color: "#d97706", radius: 65 },
      { x: 20, y: 75, color: "#fbbf24", radius: 50 },
    ],
  },
  {
    id: "midnight-frost",
    name: "Midnight Frost",
    tag: "MINIMAL",
    bgColor: "#070b12",
    points: [
      { x: 30, y: 20, color: "#38bdf8", radius: 55 },
      { x: 80, y: 30, color: "#818cf8", radius: 60 },
      { x: 65, y: 80, color: "#60a5fa", radius: 65 },
      { x: 20, y: 70, color: "#94a3b8", radius: 45 },
    ],
  },
];

const VIBRANT_COLORS = [
  "#8b5cf6", "#ec4899", "#06b6d4", "#3b82f6", "#10b981",
  "#f59e0b", "#ef4444", "#a855f7", "#14b8a6", "#6366f1",
  "#f43f5e", "#84cc16", "#d946ef", "#0284c7", "#f97316",
];

export type GlassCardSample = "metric" | "profile" | "search" | "blank";
export type AspectRatio = "16/9" | "9/16" | "1/1" | "3/1";

export default function MeshGradientStudio() {
  // --------------------------------------------------------------------------
  // STATE: Canvas Background & Points
  // --------------------------------------------------------------------------
  const [bgColor, setBgColor] = useState<string>(PRESETS[0].bgColor);
  const [points, setPoints] = useState<ColorPoint[]>(
    PRESETS[0].points.map((p, idx) => ({ ...p, id: `pt-${idx + 1}` }))
  );
  const [selectedPointId, setSelectedPointId] = useState<string>("pt-1");
  const [isAnimated, setIsAnimated] = useState<boolean>(false);
  const [showHandles, setShowHandles] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16/9");
  const [activePreset, setActivePreset] = useState<string>("obsidian-cosmic");

  // --------------------------------------------------------------------------
  // STATE: Glass Card Overlay
  // --------------------------------------------------------------------------
  const [showGlassCard, setShowGlassCard] = useState<boolean>(true);
  const [glassBlur, setGlassBlur] = useState<number>(20); // 0 to 40 px
  const [glassOpacity, setGlassOpacity] = useState<number>(14); // 5 to 70%
  const [glassBorderShine, setGlassBorderShine] = useState<number>(25); // 0 to 60%
  const [glassCardSample, setGlassCardSample] = useState<GlassCardSample>("metric");
  const [glassShadow, setGlassShadow] = useState<"soft" | "glow" | "none">("glow");
  const [glassCornerRadius, setGlassCornerRadius] = useState<number>(24);

  // --------------------------------------------------------------------------
  // STATE: UI & Exports
  // --------------------------------------------------------------------------
  const [activeMobileTab, setActiveMobileTab] = useState<"preview" | "colors" | "glass" | "code">("preview");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isCopyingImage, setIsCopyingImage] = useState<boolean>(false);
  const [includeGlassInExport, setIncludeGlassInExport] = useState<boolean>(true);

  // Pipeline handoff image
  const [pipelineUrl, setPipelineUrl] = useState<string | null>(null);

  // Dragging state on canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
  const basePointsRef = useRef<ColorPoint[]>([]);

  // --------------------------------------------------------------------------
  // SMOOTH ORGANIC MESH GRADIENT MOTION (Harmonic Orbital Wave Drift)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isAnimated) {
      if (basePointsRef.current.length > 0) {
        setPoints(basePointsRef.current);
        basePointsRef.current = [];
      }
      return;
    }

    // Save initial coordinates as baseline anchors
    if (basePointsRef.current.length === 0) {
      basePointsRef.current = points.map((p) => ({ ...p }));
    }

    let animFrameId: number;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      // Pause updates while user is actively dragging a handle
      if (!draggingPointId) {
        const elapsed = (currentTime - startTime) / 1000;

        setPoints((prev) => {
          const bases = basePointsRef.current;
          if (bases.length === 0) return prev;

          return prev.map((pt, i) => {
            const base = bases[i] || pt;
            // Harmonic wave speeds and golden ratio phase offsets
            const speedX = 0.4 + (i * 0.12);
            const speedY = 0.32 + (i * 0.14);
            const phase = i * 1.618;

            // Amplitude scaled so it never pokes past canvas edges
            const ampX = Math.min(10, Math.min(base.x - 5, 95 - base.x));
            const ampY = Math.min(10, Math.min(base.y - 5, 95 - base.y));

            const dx = Math.sin(elapsed * speedX + phase) * Math.max(3, ampX);
            const dy = Math.cos(elapsed * speedY + phase * 1.25) * Math.max(3, ampY);
            const dr = Math.sin(elapsed * 0.5 + phase) * 3;

            return {
              ...pt,
              x: Math.round(Math.min(96, Math.max(4, base.x + dx)) * 10) / 10,
              y: Math.round(Math.min(96, Math.max(4, base.y + dy)) * 10) / 10,
              radius: Math.round(Math.min(90, Math.max(30, base.radius + dr))),
            };
          });
        });
      }

      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameId);
  }, [isAnimated, draggingPointId]);

  // --------------------------------------------------------------------------
  // GENERATE GRADIENT CSS STRING
  // --------------------------------------------------------------------------
  const generateGradientCss = useCallback(() => {
    const radialLayers = points
      .map((p) => `radial-gradient(at ${Math.round(p.x)}% ${Math.round(p.y)}%, ${p.color} 0px, transparent ${Math.round(p.radius)}%)`)
      .join(",\n  ");

    return `background-color: ${bgColor};\nbackground-image:\n  ${radialLayers};\nbackground-repeat: no-repeat;\nbackground-size: 100% 100%;`;
  }, [bgColor, points]);

  const generateGlassCss = useCallback(() => {
    const shadowValue =
      glassShadow === "glow"
        ? "0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 0 35px rgba(255, 255, 255, 0.08)"
        : glassShadow === "soft"
        ? "0 20px 40px rgba(0, 0, 0, 0.45)"
        : "none";

    return `/* Frosted Glass Card */\nbackground: rgba(255, 255, 255, ${(glassOpacity / 100).toFixed(2)});\nbackdrop-filter: blur(${glassBlur}px);\n-webkit-backdrop-filter: blur(${glassBlur}px);\nborder: 1px solid rgba(255, 255, 255, ${(glassBorderShine / 100).toFixed(2)});\nborder-radius: ${glassCornerRadius}px;\nbox-shadow: ${shadowValue};\nbox-shadow: ${shadowValue}, inset 0 1px 1px 0 rgba(255, 255, 255, ${(glassBorderShine / 70).toFixed(2)});`;
  }, [glassBlur, glassOpacity, glassBorderShine, glassShadow, glassCornerRadius]);

  const generateTailwindCode = useCallback(() => {
    return `<!-- Frosted Glass Card in Tailwind -->\n<div class="backdrop-blur-[${glassBlur}px] bg-white/[${(glassOpacity / 100).toFixed(2)}] border border-white/[${(glassBorderShine / 100).toFixed(2)}] rounded-[${glassCornerRadius}px] shadow-2xl p-6">\n  <h3 class="text-white font-semibold">Your Glass Card</h3>\n  <p class="text-zinc-200 text-sm mt-1">Stunning modern interface.</p>\n</div>`;
  }, [glassBlur, glassOpacity, glassBorderShine, glassCornerRadius]);

  // --------------------------------------------------------------------------
  // DRAG INTERACTION (CANVAS WITH SAFE CLAMPING)
  // --------------------------------------------------------------------------
  const handlePointerDown = (pointId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setDraggingPointId(pointId);
    setSelectedPointId(pointId);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingPointId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    // Clamp points safely so circles NEVER get cut off by canvas edges
    const x = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100));

    setPoints((prev) =>
      prev.map((pt) => (pt.id === draggingPointId ? { ...pt, x, y } : pt))
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingPointId) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
      basePointsRef.current = points.map((p) => ({ ...p }));
      setDraggingPointId(null);
    }
  };

  // --------------------------------------------------------------------------
  // ACTIONS: PRESET, SHUFFLE, ADD/REMOVE POINT
  // --------------------------------------------------------------------------
  const handleApplyPreset = (preset: PresetTheme) => {
    setActivePreset(preset.id);
    setBgColor(preset.bgColor);
    const newPoints = preset.points.map((p, idx) => ({ ...p, id: `pt-${idx + 1}` }));
    setPoints(newPoints);
    basePointsRef.current = newPoints.map((p) => ({ ...p }));
    setSelectedPointId("pt-1");
  };

  const handleShuffleColors = () => {
    setActivePreset("custom");
    const shuffled = [...VIBRANT_COLORS].sort(() => 0.5 - Math.random());
    const newPoints = points.map((pt, idx) => ({
      ...pt,
      color: shuffled[idx % shuffled.length],
      x: Math.floor(15 + Math.random() * 70),
      y: Math.floor(15 + Math.random() * 70),
      radius: Math.floor(45 + Math.random() * 25),
    }));
    setPoints(newPoints);
    basePointsRef.current = newPoints.map((p) => ({ ...p }));
  };

  const handleAddPoint = () => {
    if (points.length >= 6) return;
    const newId = `pt-${Date.now()}`;
    const randomColor = VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
    const newPoint: ColorPoint = {
      id: newId,
      x: Math.floor(20 + Math.random() * 60),
      y: Math.floor(20 + Math.random() * 60),
      color: randomColor,
      radius: 55,
    };
    setPoints((prev) => [...prev, newPoint]);
    setSelectedPointId(newId);
  };

  const handleRemovePoint = (pointId: string) => {
    if (points.length <= 2) return;
    setPoints((prev) => prev.filter((p) => p.id !== pointId));
    if (selectedPointId === pointId) {
      const remaining = points.filter((p) => p.id !== pointId);
      setSelectedPointId(remaining[0]?.id || "");
    }
  };

  const selectedPoint = points.find((p) => p.id === selectedPointId) || points[0];

  // --------------------------------------------------------------------------
  // COPY HELPERS
  // --------------------------------------------------------------------------
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // --------------------------------------------------------------------------
  // RENDER CANVAS TO OFFSCREEN IMAGE (PNG / COPY)
  // --------------------------------------------------------------------------
  const renderCanvasToBlob = useCallback(
    async (width: number = 2560, height: number = 1440): Promise<Blob | null> => {
      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return null;

      // Draw background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Draw radial gradients
      points.forEach((pt) => {
        const cx = (pt.x / 100) * width;
        const cy = (pt.y / 100) * height;
        const r = (pt.radius / 100) * Math.max(width, height) * 0.75;

        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        radGrad.addColorStop(0, pt.color);
        radGrad.addColorStop(1, "transparent");

        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);
      });

      // Draw Frosted Glass Card on exported image if enabled
      if (showGlassCard && includeGlassInExport) {
        const cardW = Math.min(width * 0.52, width < 1200 ? width * 0.85 : 900);
        const cardH = Math.min(height * 0.44, height < 800 ? height * 0.75 : 500);
        const cardX = (width - cardW) / 2;
        const cardY = (height - cardH) / 2;
        const radius = Math.max(14, Math.round((glassCornerRadius / 28) * (cardW / 24)));

        ctx.save();
        // Soft drop shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
        ctx.shadowBlur = Math.round(width * 0.025);
        ctx.shadowOffsetY = Math.round(height * 0.018);

        // Glass background gradient fill
        const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
        cardGrad.addColorStop(0, `rgba(255, 255, 255, ${glassOpacity / 100})`);
        cardGrad.addColorStop(1, `rgba(255, 255, 255, ${Math.max(0.02, glassOpacity / 250)})`);
        ctx.fillStyle = cardGrad;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, radius);
        ctx.fill();
        ctx.restore();

        // Border shine
        ctx.save();
        const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
        borderGrad.addColorStop(0, `rgba(255, 255, 255, ${glassBorderShine / 100})`);
        borderGrad.addColorStop(1, `rgba(255, 255, 255, ${Math.max(0.04, glassBorderShine / 200)})`);
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = Math.max(2, Math.round(width / 900));
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, radius);
        ctx.stroke();
        ctx.restore();

        // Card sample contents
        const scale = cardW / 650;
        ctx.save();
        ctx.textBaseline = "middle";

        if (glassCardSample === "metric") {
          const iconX = cardX + 35 * scale;
          const iconY = cardY + 35 * scale;
          const iconSize = 50 * scale;
          ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(iconX, iconY, iconSize, iconSize, 14 * scale);
          ctx.fill();
          ctx.stroke();

          // Arrow icon
          ctx.strokeStyle = "#67e8f9";
          ctx.lineWidth = 3 * scale;
          ctx.beginPath();
          ctx.moveTo(iconX + 14 * scale, iconY + 34 * scale);
          ctx.lineTo(iconX + 26 * scale, iconY + 22 * scale);
          ctx.lineTo(iconX + 33 * scale, iconY + 29 * scale);
          ctx.lineTo(iconX + 40 * scale, iconY + 18 * scale);
          ctx.stroke();

          // Title & Value
          ctx.fillStyle = "#e4e4e7";
          ctx.font = `bold ${Math.round(13 * scale)}px system-ui, sans-serif`;
          ctx.fillText("GROWTH INDEX", iconX + iconSize + 16 * scale, iconY + 12 * scale);

          ctx.fillStyle = "#ffffff";
          ctx.font = `900 ${Math.round(30 * scale)}px system-ui, sans-serif`;
          ctx.fillText("+142.8%", iconX + iconSize + 16 * scale, iconY + 36 * scale);

          // Active pill
          const pillW = 75 * scale;
          const pillH = 26 * scale;
          const pillX = cardX + cardW - pillW - 35 * scale;
          const pillY = iconY + 8 * scale;
          ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
          ctx.strokeStyle = "rgba(16, 185, 129, 0.45)";
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#6ee7b7";
          ctx.font = `bold ${Math.round(11 * scale)}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText("Active", pillX + pillW / 2, pillY + pillH / 2);
          ctx.textAlign = "start";

          // Text description
          ctx.fillStyle = "#f4f4f5";
          ctx.font = `${Math.round(15 * scale)}px system-ui, sans-serif`;
          ctx.fillText("Frosted glass cards allow vibrant colors to radiate through while", cardX + 35 * scale, cardY + 140 * scale);
          ctx.fillText("maintaining clean readability.", cardX + 35 * scale, cardY + 168 * scale);

          // Divider
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.beginPath();
          ctx.moveTo(cardX + 35 * scale, cardY + 205 * scale);
          ctx.lineTo(cardX + cardW - 35 * scale, cardY + 205 * scale);
          ctx.stroke();

          // Footer
          ctx.fillStyle = "#a1a1aa";
          ctx.font = `${Math.round(13 * scale)}px system-ui, sans-serif`;
          ctx.fillText("Updated Just Now", cardX + 35 * scale, cardY + 238 * scale);
          ctx.fillStyle = "#67e8f9";
          ctx.font = `bold ${Math.round(14 * scale)}px system-ui, sans-serif`;
          ctx.textAlign = "end";
          ctx.fillText("View Report →", cardX + cardW - 35 * scale, cardY + 238 * scale);
        } else if (glassCardSample === "profile") {
          const avX = cardX + 35 * scale;
          const avY = cardY + 35 * scale;
          const avSize = 56 * scale;
          ctx.fillStyle = "#0c0e1b";
          ctx.strokeStyle = "#06b6d4";
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.roundRect(avX, avY, avSize, avSize, 18 * scale);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#67e8f9";
          ctx.beginPath();
          ctx.arc(avX + avSize / 2, avY + 22 * scale, 10 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(avX + avSize / 2, avY + 48 * scale, 15 * scale, Math.PI, 0);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.round(20 * scale)}px system-ui, sans-serif`;
          ctx.fillText("Alex Thorne", avX + avSize + 18 * scale, avY + 16 * scale);
          ctx.fillStyle = "#d4d4d8";
          ctx.font = `${Math.round(13 * scale)}px system-ui, sans-serif`;
          ctx.fillText("Product Designer & Creator", avX + avSize + 18 * scale, avY + 40 * scale);

          ctx.fillStyle = "#f4f4f5";
          ctx.font = `${Math.round(15 * scale)}px system-ui, sans-serif`;
          ctx.fillText("Crafting immersive digital experiences with modern visual depth.", cardX + 35 * scale, cardY + 130 * scale);

          const btnW = cardW - 70 * scale;
          const btnH = 44 * scale;
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.beginPath();
          ctx.roundRect(cardX + 35 * scale, cardY + 170 * scale, btnW, btnH, 12 * scale);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.round(14 * scale)}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText("Connect Profile", cardX + cardW / 2, cardY + 170 * scale + btnH / 2);
        } else if (glassCardSample === "search") {
          ctx.fillStyle = "#e4e4e7";
          ctx.font = `bold ${Math.round(13 * scale)}px system-ui, sans-serif`;
          ctx.fillText("INSTANT FINDER", cardX + 35 * scale, cardY + 45 * scale);

          const barW = cardW - 70 * scale;
          const barH = 46 * scale;
          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
          ctx.beginPath();
          ctx.roundRect(cardX + 35 * scale, cardY + 70 * scale, barW, barH, 12 * scale);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#a1a1aa";
          ctx.font = `${Math.round(14 * scale)}px system-ui, sans-serif`;
          ctx.fillText("🔍  Search templates & components...", cardX + 50 * scale, cardY + 70 * scale + barH / 2);

          const tags = ["Gradients", "Glass Cards", "Tailwind"];
          let curX = cardX + 35 * scale;
          tags.forEach((tag) => {
            const tagW = (tag.length * 9 + 25) * scale;
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.beginPath();
            ctx.roundRect(curX, cardY + 140 * scale, tagW, 26 * scale, 6 * scale);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.font = `500 ${Math.round(11 * scale)}px system-ui, sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(tag, curX + tagW / 2, cardY + 140 * scale + 13 * scale);
            ctx.textAlign = "start";
            curX += tagW + 10 * scale;
          });
        } else if (glassCardSample === "blank") {
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.round(20 * scale)}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText("Pure Frosted Canvas", cardX + cardW / 2, cardY + 90 * scale);
          ctx.fillStyle = "#d4d4d8";
          ctx.font = `${Math.round(14 * scale)}px system-ui, sans-serif`;
          ctx.fillText("Ready for any popup, hero banner, or navigation bar.", cardX + cardW / 2, cardY + 125 * scale);
        }

        ctx.restore();
      }

      return new Promise((resolve) => {
        offscreen.toBlob((blob) => resolve(blob), "image/png");
      });
    },
    [bgColor, points, showGlassCard, includeGlassInExport, glassOpacity, glassBlur, glassBorderShine, glassCornerRadius, glassCardSample]
  );

  // Update pipeline image URL whenever points change (debounced)
  useEffect(() => {
    let currentUrl: string | null = null;
    const timer = setTimeout(async () => {
      const blob = await renderCanvasToBlob(1280, 720);
      if (blob) {
        currentUrl = URL.createObjectURL(blob);
        setPipelineUrl(currentUrl);
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [renderCanvasToBlob]);

  // Download high-resolution PNG
  const handleDownloadPng = async () => {
    setIsDownloading(true);
    try {
      let width = 3840;
      let height = 2160;
      if (aspectRatio === "9/16") {
        width = 2160;
        height = 3840;
      } else if (aspectRatio === "1/1") {
        width = 3000;
        height = 3000;
      } else if (aspectRatio === "3/1") {
        width = 3840;
        height = 1280;
      }

      const blob = await renderCanvasToBlob(width, height);
      if (!blob) throw new Error("Could not create image");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exismic-mesh-gradient-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Download scalable vector SVG
  const handleDownloadSvg = () => {
    let width = 1920;
    let height = 1080;
    if (aspectRatio === "9/16") {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === "1/1") {
      width = 1440;
      height = 1440;
    } else if (aspectRatio === "3/1") {
      width = 2100;
      height = 700;
    }

    const defs = points
      .map((pt, idx) => {
        const cx = Math.round(pt.x);
        const cy = Math.round(pt.y);
        const r = Math.round(pt.radius);
        return `
    <radialGradient id="grad-${idx}" cx="${cx}%" cy="${cy}%" r="${r}%" fx="${cx}%" fy="${cy}%">
      <stop offset="0%" stop-color="${pt.color}" stop-opacity="1" />
      <stop offset="100%" stop-color="${pt.color}" stop-opacity="0" />
    </radialGradient>`;
      })
      .join("");

    const rects = points
      .map((_, idx) => `  <rect width="100%" height="100%" fill="url(#grad-${idx})" />`)
      .join("\n");

    let glassCardSvg = "";
    if (showGlassCard && includeGlassInExport) {
      const cardW = Math.min(width * 0.52, width < 1200 ? width * 0.85 : 820);
      const cardH = Math.min(height * 0.44, height < 800 ? height * 0.75 : 440);
      const cardX = (width - cardW) / 2;
      const cardY = (height - cardH) / 2;
      const cardRadius = Math.max(16, Math.round((glassCornerRadius / 28) * (cardW / 26)));

      let cardInnerSvg = "";
      if (glassCardSample === "metric") {
        cardInnerSvg = `
    <!-- Icon Container -->
    <rect x="${cardX + 40}" y="${cardY + 38}" width="54" height="54" rx="16" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
    <path d="M ${cardX + 53} ${cardY + 70} L ${cardX + 64} ${cardY + 59} L ${cardX + 72} ${cardY + 67} L ${cardX + 82} ${cardY + 55}" fill="none" stroke="#67e8f9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <polyline points="${cardX + 74},${cardY + 55} ${cardX + 82},${cardY + 55} ${cardX + 82},${cardY + 63}" fill="none" stroke="#67e8f9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Metric Title & Value -->
    <text x="${cardX + 112}" y="${cardY + 56}" fill="#e4e4e7" font-size="14" font-family="system-ui, -apple-system, sans-serif" font-weight="700" letter-spacing="1">GROWTH INDEX</text>
    <text x="${cardX + 112}" y="${cardY + 93}" fill="#ffffff" font-size="34" font-family="system-ui, -apple-system, sans-serif" font-weight="900" letter-spacing="-0.5">+142.8%</text>

    <!-- Status Badge -->
    <rect x="${cardX + cardW - 120}" y="${cardY + 42}" width="80" height="28" rx="14" fill="rgba(16,185,129,0.25)" stroke="rgba(16,185,129,0.45)" stroke-width="1.5" />
    <text x="${cardX + cardW - 80}" y="${cardY + 61}" text-anchor="middle" fill="#6ee7b7" font-size="13" font-family="system-ui, -apple-system, sans-serif" font-weight="800">Active</text>

    <!-- Description -->
    <text x="${cardX + 40}" y="${cardY + 160}" fill="#f4f4f5" font-size="17" font-family="system-ui, -apple-system, sans-serif">Frosted glass cards allow vibrant colors to radiate through while</text>
    <text x="${cardX + 40}" y="${cardY + 190}" fill="#f4f4f5" font-size="17" font-family="system-ui, -apple-system, sans-serif">maintaining clean readability.</text>

    <!-- Divider -->
    <line x1="${cardX + 40}" y1="${cardY + 235}" x2="${cardX + cardW - 40}" y2="${cardY + 235}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />

    <!-- Footer -->
    <text x="${cardX + 40}" y="${cardY + 275}" fill="#a1a1aa" font-size="14" font-family="system-ui, -apple-system, sans-serif">Updated Just Now</text>
    <text x="${cardX + cardW - 40}" y="${cardY + 275}" text-anchor="end" fill="#67e8f9" font-size="15" font-family="system-ui, -apple-system, sans-serif" font-weight="700">View Report →</text>`;
      } else if (glassCardSample === "profile") {
        cardInnerSvg = `
    <!-- Avatar -->
    <rect x="${cardX + 40}" y="${cardY + 40}" width="58" height="58" rx="18" fill="#0c0e1b" stroke="#06b6d4" stroke-width="2" />
    <circle cx="${cardX + 69}" cy="${cardY + 62}" r="11" fill="#67e8f9" />
    <path d="M ${cardX + 54} ${cardY + 88} A 15 15 0 0 1 ${cardX + 84} ${cardY + 88}" fill="#67e8f9" />

    <!-- Name & Badge -->
    <text x="${cardX + 118}" y="${cardY + 65}" fill="#ffffff" font-size="22" font-family="system-ui, -apple-system, sans-serif" font-weight="800">Alex Thorne</text>
    <text x="${cardX + 118}" y="${cardY + 90}" fill="#d4d4d8" font-size="14" font-family="system-ui, -apple-system, sans-serif">Product Designer &amp; Creator</text>

    <!-- Bio -->
    <text x="${cardX + 40}" y="${cardY + 160}" fill="#f4f4f5" font-size="17" font-family="system-ui, -apple-system, sans-serif">Crafting immersive digital experiences with modern visual depth.</text>

    <!-- Button -->
    <rect x="${cardX + 40}" y="${cardY + 205}" width="${cardW - 80}" height="48" rx="14" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
    <text x="${cardX + cardW / 2}" y="${cardY + 235}" text-anchor="middle" fill="#ffffff" font-size="15" font-family="system-ui, -apple-system, sans-serif" font-weight="700">Connect Profile</text>`;
      } else if (glassCardSample === "search") {
        cardInnerSvg = `
    <text x="${cardX + 40}" y="${cardY + 58}" fill="#e4e4e7" font-size="14" font-family="system-ui, -apple-system, sans-serif" font-weight="800" letter-spacing="1">INSTANT FINDER</text>
    <rect x="${cardX + 40}" y="${cardY + 80}" width="${cardW - 80}" height="52" rx="14" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
    <circle cx="${cardX + 66}" cy="${cardY + 106}" r="7" fill="none" stroke="#67e8f9" stroke-width="2" />
    <line x1="${cardX + 71}" y1="${cardY + 111}" x2="${cardX + 78}" y2="${cardY + 118}" stroke="#67e8f9" stroke-width="2" stroke-linecap="round" />
    <text x="${cardX + 92}" y="${cardY + 112}" fill="#a1a1aa" font-size="15" font-family="system-ui, -apple-system, sans-serif">Search templates &amp; components...</text>

    <!-- Tags -->
    <rect x="${cardX + 40}" y="${cardY + 155}" width="95" height="32" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" />
    <text x="${cardX + 87}" y="${cardY + 176}" text-anchor="middle" fill="#ffffff" font-size="13" font-family="system-ui, -apple-system, sans-serif" font-weight="600">Gradients</text>

    <rect x="${cardX + 150}" y="${cardY + 155}" width="115" height="32" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" />
    <text x="${cardX + 207}" y="${cardY + 176}" text-anchor="middle" fill="#ffffff" font-size="13" font-family="system-ui, -apple-system, sans-serif" font-weight="600">Glass Cards</text>

    <rect x="${cardX + 280}" y="${cardY + 155}" width="95" height="32" rx="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" />
    <text x="${cardX + 327}" y="${cardY + 176}" text-anchor="middle" fill="#ffffff" font-size="13" font-family="system-ui, -apple-system, sans-serif" font-weight="600">Tailwind</text>`;
      } else if (glassCardSample === "blank") {
        cardInnerSvg = `
    <circle cx="${cardX + cardW / 2}" cy="${cardY + 90}" r="26" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
    <text x="${cardX + cardW / 2}" y="${cardY + 98}" text-anchor="middle" fill="#67e8f9" font-size="22">✦</text>
    <text x="${cardX + cardW / 2}" y="${cardY + 155}" text-anchor="middle" fill="#ffffff" font-size="22" font-family="system-ui, -apple-system, sans-serif" font-weight="800">Pure Frosted Canvas</text>
    <text x="${cardX + cardW / 2}" y="${cardY + 195}" text-anchor="middle" fill="#d4d4d8" font-size="15" font-family="system-ui, -apple-system, sans-serif">Ready for any popup, hero banner, or navigation bar.</text>`;
      }

      glassCardSvg = `
  <!-- Glass Card Overlay -->
  <g id="glass-card" filter="url(#card-shadow-filter)">
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${cardRadius}" fill="url(#glass-surface)" stroke="url(#glass-border-shine)" stroke-width="1.5" />
    ${cardInnerSvg}
  </g>`;
    }

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>${defs}
    <!-- Frosted Glass Shaders -->
    <linearGradient id="glass-surface" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${(glassOpacity / 100).toFixed(2)}" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="${Math.max(0.02, glassOpacity / 250).toFixed(2)}" />
    </linearGradient>
    <linearGradient id="glass-border-shine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="${(glassBorderShine / 100).toFixed(2)}" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="${Math.max(0.04, glassBorderShine / 200).toFixed(2)}" />
    </linearGradient>
    <filter id="card-shadow-filter" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="25" stdDeviation="30" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="${bgColor}" />
${rects}
${glassCardSvg}
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exismic-mesh-gradient-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy image directly to clipboard
  const handleCopyImage = async () => {
    setIsCopyingImage(true);
    try {
      const blob = await renderCanvasToBlob(1920, 1080);
      if (!blob) throw new Error("Could not create image");
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopiedType("image");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      alert("Your browser could not copy the image directly. Use the Download button instead.");
    } finally {
      setIsCopyingImage(false);
    }
  };

  // Aspect ratio helper class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "9/16":
        return "aspect-[9/16] max-h-[560px]";
      case "1/1":
        return "aspect-square max-h-[500px]";
      case "3/1":
        return "aspect-[3/1] min-h-[220px]";
      case "16/9":
      default:
        return "aspect-[16/10] sm:aspect-[16/9]";
    }
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER & QUICK TOOLBAR                                        */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-[#090b17]/90 border border-white/[0.1] p-4 sm:p-5 backdrop-blur-2xl shadow-xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/30 before:to-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-white/15 flex items-center justify-center text-cyan-300 shadow-inner">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  CSS Mesh Gradient & Glass Studio
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                  Zero Cost
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Design glowing mesh wallpapers and frosted glass cards with real-time website code.
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleShuffleColors}
              className="relative group overflow-hidden flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-zinc-200 hover:text-white bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-white/[0.14] hover:to-white/[0.05] border border-white/[0.14] hover:border-cyan-400/50 rounded-xl transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] active:scale-95 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
              <span>Shuffle Colors</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAnimated(!isAnimated)}
              className={cn(
                "relative group overflow-hidden flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-300 shadow-md active:scale-95 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:to-transparent",
                isAnimated
                  ? "bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-cyan-500/25 text-cyan-300 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.35)] before:via-cyan-300"
                  : "bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-white/[0.14] hover:to-white/[0.05] text-zinc-300 hover:text-white border-white/[0.14] hover:border-white/30 before:via-white/30"
              )}
            >
              {isAnimated ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Motion Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                  <span>Smooth Motion</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MOBILE RESPONSIVE TABS                                            */}
      {/* ==================================================================== */}
      <div className="flex sm:hidden items-center justify-between bg-[#090b17] p-1.5 rounded-xl border border-white/[0.1] shadow-lg">
        {[
          { id: "preview", label: "Preview", icon: Eye },
          { id: "colors", label: "Colors", icon: Palette },
          { id: "glass", label: "Glass Card", icon: Layers },
          { id: "code", label: "Get Code", icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMobileTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMobileTab(tab.id as any)}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* 3. MAIN WORKSPACE: DUAL COLUMN LAYOUT                                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================================== */}
        {/* LEFT / CENTER: Interactive Canvas Preview Stage (7 Columns)       */}
        {/* ================================================================== */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Stage Frame */}
          <div
            className={cn(
              "relative rounded-3xl border border-white/[0.12] bg-[#070914] p-3 sm:p-4 shadow-2xl overflow-hidden group before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
              activeMobileTab !== "preview" && "hidden sm:block"
            )}
          >
            {/* Top Stage Control Header */}
            <div className="flex items-center justify-between px-1 pb-3 text-xs text-zinc-400 border-b border-white/[0.08] mb-3">
              <div className="flex items-center gap-3">
                {/* Traffic lights */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <span className="text-[11px] font-bold text-zinc-300 tracking-wide">
                  Live Stage
                </span>
              </div>

              {/* Aspect Ratio & Point Visibility Tools */}
              <div className="flex items-center gap-2">
                {/* Aspect Ratio Pill Selector */}
                <div className="flex items-center bg-[#0a0d1d]/90 p-1 rounded-xl border border-white/10 shadow-inner gap-1">
                  {[
                    { id: "16/9", label: "Desktop", icon: Laptop },
                    { id: "9/16", label: "Phone", icon: Smartphone },
                    { id: "1/1", label: "Square", icon: Square },
                    { id: "3/1", label: "Banner", icon: Maximize2 },
                  ].map((ar) => {
                    const Icon = ar.icon;
                    const isSelected = aspectRatio === ar.id;
                    return (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => setAspectRatio(ar.id as AspectRatio)}
                        className={cn(
                          "px-2.5 py-1.5 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all duration-200 active:scale-95",
                          isSelected
                            ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                        )}
                        title={`Switch to ${ar.label} ratio`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{ar.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Hide / Show Drag Handles */}
                <button
                  type="button"
                  onClick={() => setShowHandles(!showHandles)}
                  className={cn(
                    "relative group overflow-hidden px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition-all duration-200 shadow-sm active:scale-95 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:to-transparent",
                    showHandles
                      ? "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 border-white/15 hover:border-white/30 before:via-white/20"
                      : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.25)] before:via-purple-300"
                  )}
                  title={showHandles ? "Hide handles for clean view" : "Show handles to adjust"}
                >
                  {showHandles ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="hidden sm:inline">Clean View</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-purple-300" />
                      <span className="hidden sm:inline">Edit Points</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Canvas Stage Surface: Isolated, Vignetted, No Repeating Edge Bleed */}
            <div
              ref={canvasRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={cn(
                "relative w-full rounded-2xl overflow-hidden select-none touch-none cursor-crosshair mx-auto isolate transform-gpu ring-1 ring-inset ring-white/15",
                getAspectRatioClass()
              )}
              style={{
                backgroundColor: bgColor,
                backgroundImage: points
                  .map(
                    (p) =>
                      `radial-gradient(at ${p.x}% ${p.y}%, ${p.color} 0px, transparent ${p.radius}%)`
                  )
                  .join(", "),
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% 100%",
                backgroundClip: "padding-box",
                boxShadow:
                  "inset 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 0 45px rgba(0, 0, 0, 0.55)",
              }}
            >
              {/* Draggable Color Anchors (Clamped, Elegant, No Edge Slicing) */}
              {showHandles &&
                points.map((point) => {
                  const isSelected = selectedPointId === point.id;
                  const isDragging = draggingPointId === point.id;

                  return (
                    <div
                      key={point.id}
                      onPointerDown={(e) => handlePointerDown(point.id, e)}
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-grab active:cursor-grabbing transition-transform flex items-center justify-center z-20 touch-none",
                        isSelected
                          ? "scale-125 ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.9)]"
                          : "scale-100 hover:scale-115 ring-1 ring-white/60 shadow-md",
                        isDragging && "scale-130 ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(6,182,212,1)]"
                      )}
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        width: "28px",
                        height: "28px",
                        backgroundColor: "rgba(10, 14, 28, 0.8)",
                        backdropFilter: "blur(8px)",
                        border: `2px solid ${point.color}`,
                      }}
                      title="Drag to position color"
                    >
                      {/* Inner Glowing Diamond / Circle Core */}
                      <span
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: point.color }}
                      />
                    </div>
                  );
                })}

              {/* Frosted Glass Card Overlay (High Contrast & Luxury Bevel) */}
              {showGlassCard && (
                <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6 pointer-events-none z-10">
                  <div
                    className="w-full max-w-[280px] sm:max-w-sm md:max-w-md p-4 sm:p-6 text-white transition-all duration-300 pointer-events-auto transform-gpu"
                    style={{
                      background: `linear-gradient(135deg, rgba(255, 255, 255, ${glassOpacity / 100}) 0%, rgba(255, 255, 255, ${(glassOpacity / 250).toFixed(2)}) 100%)`,
                      backdropFilter: `blur(${glassBlur}px)`,
                      WebkitBackdropFilter: `blur(${glassBlur}px)`,
                      border: `1px solid rgba(255, 255, 255, ${glassBorderShine / 100})`,
                      borderRadius: `${glassCornerRadius}px`,
                      boxShadow:
                        glassShadow === "glow"
                          ? `0 25px 50px -12px rgba(0, 0, 0, 0.65), 0 0 35px rgba(255, 255, 255, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, ${glassBorderShine / 70})`
                          : glassShadow === "soft"
                          ? `0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, ${glassBorderShine / 70})`
                          : `inset 0 1px 1px 0 rgba(255, 255, 255, ${glassBorderShine / 70})`,
                    }}
                  >
                    {/* Sample 1: Growth Metric */}
                    {glassCardSample === "metric" && (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-cyan-300 shadow-sm">
                              <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider drop-shadow-sm">
                                Growth Index
                              </p>
                              <h4 className="text-lg sm:text-xl font-extrabold tracking-tight text-white drop-shadow">
                                +142.8%
                              </h4>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 text-[10px] font-extrabold text-emerald-300 bg-emerald-500/25 border border-emerald-500/40 rounded-full shadow-sm">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-zinc-100 leading-relaxed drop-shadow-sm">
                          Frosted glass cards allow vibrant colors to radiate through while maintaining clean readability.
                        </p>
                        <div className="pt-2.5 border-t border-white/15 flex items-center justify-between text-xs text-zinc-200">
                          <span className="text-[11px] opacity-80">Updated Just Now</span>
                          <span className="text-cyan-300 font-bold hover:underline cursor-pointer">
                            View Report →
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Sample 2: Creator Profile */}
                    {glassCardSample === "profile" && (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-500 p-0.5 shadow-md">
                            <div className="w-full h-full rounded-[14px] bg-[#0c0e1b] flex items-center justify-center text-cyan-300">
                              <User className="w-5 h-5" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm sm:text-base font-bold text-white drop-shadow">
                                Alex Thorne
                              </h4>
                              <ShieldCheck className="w-4 h-4 text-cyan-300" />
                            </div>
                            <p className="text-xs text-zinc-200">
                              Product Designer & Creator
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-100 leading-relaxed drop-shadow-sm">
                          Crafting immersive digital experiences with modern visual depth.
                        </p>
                        <button
                          type="button"
                          className="w-full py-2 px-3 text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition-all shadow-sm"
                        >
                          Connect Profile
                        </button>
                      </div>
                    )}

                    {/* Sample 3: Quick Search */}
                    {glassCardSample === "search" && (
                      <div className="space-y-2.5 sm:space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-200 drop-shadow-sm">
                          Instant Finder
                        </p>
                        <div className="flex items-center gap-2.5 px-3 py-2 bg-black/30 border border-white/20 rounded-xl text-zinc-200">
                          <Search className="w-4 h-4 text-cyan-300" />
                          <span className="text-xs text-zinc-300 truncate">
                            Search templates & components...
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 text-white font-medium border border-white/20">
                            Gradients
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 text-white font-medium border border-white/20">
                            Glass Cards
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/15 text-white font-medium border border-white/20">
                            Tailwind
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Sample 4: Clean Blank Slate */}
                    {glassCardSample === "blank" && (
                      <div className="py-4 text-center space-y-1.5">
                        <div className="w-9 h-9 mx-auto rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-cyan-300">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white drop-shadow">
                          Pure Frosted Canvas
                        </h4>
                        <p className="text-xs text-zinc-200 max-w-xs mx-auto">
                          Ready for any popup, hero banner, or navigation bar.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stage Footer Bar: Glass Card Overlay Controls */}
            <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-zinc-200 hover:text-white transition-colors group">
                <input
                  type="checkbox"
                  checked={showGlassCard}
                  onChange={(e) => setShowGlassCard(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer transition-colors group-hover:border-cyan-400"
                />
                <span className="text-xs font-bold tracking-wide">Glass Card Overlay</span>
              </label>

              {showGlassCard && (
                <div className="flex items-center gap-1 bg-[#0a0d1d]/90 p-1 rounded-xl border border-white/10 shadow-inner">
                  {[
                    { id: "metric", label: "Metric" },
                    { id: "profile", label: "Profile" },
                    { id: "search", label: "Search" },
                    { id: "blank", label: "Blank" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setGlassCardSample(s.id as GlassCardSample)}
                      className={cn(
                        "px-3 py-1 text-[11px] font-bold rounded-lg transition-all duration-200 active:scale-95",
                        glassCardSample === s.id
                          ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Luxury Floating Quick Actions Bar */}
          <div
            className={cn(
              "relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-[#090b17]/90 border border-white/[0.12] backdrop-blur-xl shadow-2xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent",
              activeMobileTab !== "preview" && "hidden sm:block"
            )}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xs font-black text-white tracking-wider uppercase">
                    Studio Production Exports
                  </h3>
                  {showGlassCard && (
                    <button
                      type="button"
                      onClick={() => setIncludeGlassInExport(!includeGlassInExport)}
                      title="Click to toggle frosted glass card in export files"
                      className={cn(
                        "whitespace-nowrap px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all inline-flex items-center gap-1.5 active:scale-95",
                        includeGlassInExport
                          ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                          : "bg-white/5 text-zinc-400 border-white/10 hover:text-zinc-200"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", includeGlassInExport ? "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" : "bg-zinc-500")} />
                      <span>Glass Card: {includeGlassInExport ? "Included" : "Excluded"}</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Lossless vector SVG, production 4K raster PNG, or direct clipboard copy.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Copy Image Button */}
                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={isCopyingImage}
                  className="relative group overflow-hidden flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-zinc-200 hover:text-white bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-white/[0.14] hover:to-white/[0.05] border border-white/[0.15] hover:border-white/30 rounded-xl transition-all shadow-md active:scale-95 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent"
                >
                  {copiedType === "image" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span>Copy Image</span>
                    </>
                  )}
                </button>

                {/* Download 4K PNG Jewel Button */}
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isDownloading}
                  className="relative group overflow-hidden flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:from-cyan-300 hover:to-teal-200 rounded-xl transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] hover:scale-[1.02] active:scale-[0.98] border border-cyan-200/50"
                >
                  <Download className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
                  <span>Download 4K PNG</span>
                </button>

                {/* Download Vector SVG Jewel Button */}
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="relative group overflow-hidden flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs font-bold text-purple-200 hover:text-white bg-gradient-to-r from-purple-500/20 via-pink-500/15 to-purple-500/20 hover:from-purple-500/30 hover:to-pink-500/25 border border-purple-400/40 hover:border-purple-300/70 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_30px_rgba(168,85,247,0.45)] hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-purple-300/40 before:to-transparent"
                >
                  <PenTool className="w-3.5 h-3.5 text-purple-300 group-hover:scale-110 transition-transform" />
                  <span>Vector SVG</span>
                </button>
              </div>
            </div>
          </div>

          {/* Website Code Export Cards (Plain CSS & Tailwind) */}
          <div
            className={cn(
              "relative overflow-hidden p-5 rounded-2xl bg-[#090b17]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-4 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/20 before:to-transparent",
              activeMobileTab !== "code" && "hidden sm:block"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Copy Website Code
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400">
                Ready to Paste
              </span>
            </div>

            {/* Plain CSS Box */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">
                  Plain Website Code (CSS)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `${generateGradientCss()}\n\n${generateGlassCss()}`,
                      "css"
                    )
                  }
                  className="relative group overflow-hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 rounded-xl transition-all shadow-sm active:scale-95 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-300/40 before:to-transparent"
                >
                  {copiedType === "css" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copy CSS</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto p-2.5 bg-black/40 rounded-lg max-h-32 scrollbar-none border border-white/5">
                {`${generateGradientCss()}\n\n${generateGlassCss()}`}
              </pre>
            </div>

            {/* Tailwind Classes Box */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">
                  Tailwind CSS Glass Card
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generateTailwindCode(), "tailwind")}
                  className="relative group overflow-hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 rounded-xl transition-all shadow-sm active:scale-95 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-300/40 before:to-transparent"
                >
                  {copiedType === "tailwind" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copy Tailwind</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto p-2.5 bg-black/40 rounded-lg max-h-24 scrollbar-none border border-white/5">
                {generateTailwindCode()}
              </pre>
            </div>
          </div>

          {/* Media Pipeline Bar: 1-Click Handoff into Other Tools */}
          {pipelineUrl && (
            <div className={cn(
              "pt-1",
              activeMobileTab !== "preview" && "hidden sm:block"
            )}>
              <MediaPipelineBar
                imageUrl={pipelineUrl}
                imageName="mesh-gradient.png"
                sourceToolId="mesh-gradient"
                sourceToolName="Mesh Gradient & Glass Studio"
                actions={["compressor", "converter", "resizer", "meme"]}
              />
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* RIGHT: Customization Controls (5 Columns)                         */}
        {/* ================================================================== */}
        <div className="lg:col-span-5 space-y-5">
          {/* TAB 1: CURATED COLOR PRESETS */}
          <div
            className={cn(
              "relative overflow-hidden p-5 rounded-2xl bg-[#090b17]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-4 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/20 before:to-transparent",
              activeMobileTab !== "colors" && "hidden sm:block"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Color Presets
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400">
                8 Curated Themes
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all relative overflow-hidden group active:scale-95 duration-200",
                      isSelected
                        ? "bg-white/[0.08] border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50"
                        : "bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]"
                    )}
                  >
                    {/* Mini gradient bar */}
                    <div className="h-4 w-full rounded-lg mb-2.5 overflow-hidden border border-white/15 flex shadow-inner">
                      {preset.points.map((pt, i) => (
                        <div
                          key={i}
                          className="flex-1 h-full"
                          style={{ backgroundColor: pt.color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs font-bold transition-colors",
                        isSelected ? "text-cyan-300" : "text-white group-hover:text-cyan-300"
                      )}>
                        {preset.name}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider",
                        isSelected ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-white/10 text-zinc-300"
                      )}>
                        {preset.tag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 2: EDIT COLOR BUBBLES */}
          <div
            className={cn(
              "relative overflow-hidden p-5 rounded-2xl bg-[#090b17]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-4 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-purple-400/20 before:to-transparent",
              activeMobileTab !== "colors" && "hidden sm:block"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Color Bubbles
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddPoint}
                disabled={points.length >= 6}
                className="relative group overflow-hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-300/40 before:to-transparent"
              >
                <Plus className="w-3 h-3" />
                <span>Add Bubble</span>
              </button>
            </div>

            {/* Bubble Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {points.map((pt, idx) => {
                const isSelected = selectedPointId === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setSelectedPointId(pt.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap active:scale-95 duration-200",
                      isSelected
                        ? "bg-white/15 border-white/40 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)] ring-1 ring-white/30"
                        : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                      style={{
                        backgroundColor: pt.color,
                        boxShadow: `0 0 10px ${pt.color}80`,
                      }}
                    />
                    <span>Bubble {idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Bubble Sliders */}
            {selectedPoint && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
                {/* Color Picker Row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">
                    Bubble Color
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedPoint.color}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        setPoints((prev) =>
                          prev.map((p) =>
                            p.id === selectedPoint.id ? { ...p, color: newColor } : p
                          )
                        );
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 p-0.5"
                    />
                    <span className="text-xs font-mono uppercase text-zinc-200 font-bold">
                      {selectedPoint.color}
                    </span>
                  </div>
                </div>

                {/* Glow Spread Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">Glow Spread</span>
                    <span className="text-cyan-300 font-mono font-bold">
                      {Math.round(selectedPoint.radius)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="85"
                    value={selectedPoint.radius}
                    onChange={(e) => {
                      const newRadius = Number(e.target.value);
                      setPoints((prev) =>
                        prev.map((p) =>
                          p.id === selectedPoint.id ? { ...p, radius: newRadius } : p
                        )
                      );
                    }}
                    className="w-full accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
                  />
                </div>

                {/* Remove Bubble Option */}
                {points.length > 2 && (
                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(selectedPoint.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-all active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Bubble</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TAB 3: FROSTED GLASS CARD CONTROLS */}
          <div
            className={cn(
              "relative overflow-hidden p-5 rounded-2xl bg-[#090b17]/90 border border-white/[0.1] backdrop-blur-xl shadow-xl space-y-4 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-400/20 before:to-transparent",
              activeMobileTab !== "glass" && "hidden sm:block"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Glass Card Settings
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400">
                Frosted Styling
              </span>
            </div>

            {/* Slider 1: Blur Strength */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">Blur Strength</span>
                <span className="text-cyan-300 font-mono font-bold">{glassBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={glassBlur}
                onChange={(e) => setGlassBlur(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Clear Glass</span>
                <span>Heavy Frost</span>
              </div>
            </div>

            {/* Slider 2: Transparency */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">Glass Transparency</span>
                <span className="text-cyan-300 font-mono font-bold">{glassOpacity}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={glassOpacity}
                onChange={(e) => setGlassOpacity(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>See-Through</span>
                <span>Solid Frost</span>
              </div>
            </div>

            {/* Slider 3: Edge Border Shine */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">Edge Border Shine</span>
                <span className="text-cyan-300 font-mono font-bold">{glassBorderShine}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={glassBorderShine}
                onChange={(e) => setGlassBorderShine(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Slider 4: Corner Rounding */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium">Corner Rounding</span>
                <span className="text-cyan-300 font-mono font-bold">{glassCornerRadius}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="40"
                value={glassCornerRadius}
                onChange={(e) => setGlassCornerRadius(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Card Shadow Toggle */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">
                Drop Shadow
              </span>
              <div className="flex items-center gap-1 bg-[#0a0d1d]/90 p-1 rounded-xl border border-white/10 shadow-inner">
                {[
                  { id: "glow", label: "Neon Glow" },
                  { id: "soft", label: "Soft" },
                  { id: "none", label: "None" },
                ].map((sh) => (
                  <button
                    key={sh.id}
                    type="button"
                    onClick={() => setGlassShadow(sh.id as any)}
                    className={cn(
                      "px-3 py-1 text-[11px] font-bold rounded-lg transition-all duration-200 active:scale-95",
                      glassShadow === sh.id
                        ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Include Card in SVG & PNG Exports Toggle */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  Export With Glass Card
                </span>
                <span className="text-[10px] text-zinc-400">
                  Render card in 4K PNG &amp; SVG downloads
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIncludeGlassInExport(!includeGlassInExport)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  includeGlassInExport ? "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]" : "bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out",
                    includeGlassInExport ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
