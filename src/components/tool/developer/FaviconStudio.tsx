"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Copy,
  Check,
  Globe,
  Smartphone,
  Search,
  Sparkles,
  Layers,
  RefreshCw,
  Image as ImageIcon,
  Smile,
  Type,
  CheckCircle2,
  Sliders,
  Eye,
  FileArchive,
  ArrowRight,
  Code2
} from "lucide-react";
import JSZip from "jszip";
import { cn } from "@/lib/utils";
import { consumePipelineItem } from "@/lib/pipeline";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ============================================================================
// TYPES & DEFINITIONS (100% Plain English)
// ============================================================================

export type IconMode = "image" | "emoji" | "monogram";
export type IconShape = "squircle" | "rounded" | "circle" | "square";
export type InsetSize = "tight" | "balanced" | "relaxed";
export type BgStyle =
  | "transparent"
  | "obsidian"
  | "cyber"
  | "sunset"
  | "emerald"
  | "carbon"
  | "solid-dark"
  | "solid-white";

interface BgPreset {
  id: BgStyle;
  name: string;
  previewClass: string;
  draw: (ctx: CanvasRenderingContext2D, size: number) => void;
}

const BG_PRESETS: BgPreset[] = [
  {
    id: "obsidian",
    name: "Obsidian Glow",
    previewClass: "bg-gradient-to-br from-[#0c0f1d] via-[#1a1438] to-[#080b18]",
    draw: (ctx, size) => {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, "#0c0f1d");
      g.addColorStop(0.5, "#1c143d");
      g.addColorStop(1, "#070a16");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);

      // Ambient neon highlight
      const r = ctx.createRadialGradient(size * 0.25, size * 0.2, 5, size * 0.25, size * 0.2, size * 0.7);
      r.addColorStop(0, "rgba(139, 92, 246, 0.45)");
      r.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx.fillStyle = r;
      ctx.fillRect(0, 0, size, size);
    },
  },
  {
    id: "cyber",
    name: "Cyber Neon",
    previewClass: "bg-gradient-to-br from-[#1b082c] via-[#0b1638] to-[#041d33]",
    draw: (ctx, size) => {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, "#210938");
      g.addColorStop(0.5, "#0c1b42");
      g.addColorStop(1, "#042036");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    },
  },
  {
    id: "sunset",
    name: "Sunset Blaze",
    previewClass: "bg-gradient-to-br from-[#330e26] via-[#24133b] to-[#0d0920]",
    draw: (ctx, size) => {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, "#3d0e2c");
      g.addColorStop(0.5, "#281242");
      g.addColorStop(1, "#0d0920");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    },
  },
  {
    id: "emerald",
    name: "Mint Aurora",
    previewClass: "bg-gradient-to-br from-[#051f19] via-[#0a3326] to-[#031410]",
    draw: (ctx, size) => {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, "#05221b");
      g.addColorStop(0.5, "#0b3d2d");
      g.addColorStop(1, "#031712");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    },
  },
  {
    id: "carbon",
    name: "Dark Carbon",
    previewClass: "bg-gradient-to-br from-[#12131a] via-[#171924] to-[#0a0b10]",
    draw: (ctx, size) => {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, "#12141c");
      g.addColorStop(0.5, "#181b26");
      g.addColorStop(1, "#0a0b10");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    },
  },
  {
    id: "solid-dark",
    name: "Solid Black",
    previewClass: "bg-[#09090b]",
    draw: (ctx, size) => {
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, size, size);
    },
  },
  {
    id: "solid-white",
    name: "Solid White",
    previewClass: "bg-white",
    draw: (ctx, size) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
    },
  },
  {
    id: "transparent",
    name: "Transparent",
    previewClass: "bg-zinc-950 border border-dashed border-zinc-700",
    draw: (ctx, size) => {
      ctx.clearRect(0, 0, size, size);
    },
  },
];

const POPULAR_EMOJIS = ["🚀", "⚡", "💎", "🔥", "👑", "🎯", "🎨", "🌟", "💻", "🛡️", "🪐", "✨", "🤖", "🔮", "💡", "🎮"];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FaviconStudio() {
  // Mode & Content States
  const [mode, setMode] = useState<IconMode>("emoji");
  const [selectedEmoji, setSelectedEmoji] = useState<string>("🚀");
  const [monogramText, setMonogramText] = useState<string>("EX");
  const [monogramColor, setMonogramColor] = useState<string>("#38bdf8");
  const [monogramFont, setMonogramFont] = useState<"sans" | "serif" | "mono">("sans");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // App & Website Branding Details
  const [appName, setAppName] = useState<string>("Exismic Studio");
  const [siteUrl, setSiteUrl] = useState<string>("https://exismic.xyz");

  // Styling States
  const [shape, setShape] = useState<IconShape>("squircle");
  const [bgStyle, setBgStyle] = useState<BgStyle>("obsidian");
  const [inset, setInset] = useState<InsetSize>("balanced");

  // UI & Export States
  const [mobileTab, setMobileTab] = useState<"preview" | "design" | "export">("preview");
  const [previewTab, setPreviewTab] = useState<"browser" | "iphone" | "android" | "google">("browser");
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [mainIconUrl, setMainIconUrl] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Consume incoming image pipeline if transferred from Image Gen or Bg Remover
  useEffect(() => {
    async function checkPipeline() {
      const item = await consumePipelineItem();
      if (item && item.url) {
        setUploadedImageUrl(item.url);
        setMode("image");
      }
    }
    checkPipeline();
  }, []);

  // Calculate inner content scale based on inset preset
  const getScaleFactor = useCallback(() => {
    switch (inset) {
      case "tight":
        return 0.82;
      case "balanced":
        return 0.68;
      case "relaxed":
        return 0.54;
    }
  }, [inset]);

  // ============================================================================
  // CORE RENDER FUNCTION: Draws Icon onto any Canvas at requested resolution
  // ============================================================================
  const renderIconToCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement, size: number): Promise<void> => {
      return new Promise((resolve) => {
        targetCanvas.width = size;
        targetCanvas.height = size;
        const ctx = targetCanvas.getContext("2d")!;
        ctx.clearRect(0, 0, size, size);

        // 1. Clip path according to selected shape
        ctx.save();
        ctx.beginPath();
        if (shape === "circle") {
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        } else if (shape === "rounded") {
          ctx.roundRect(0, 0, size, size, size * 0.22);
        } else if (shape === "squircle") {
          ctx.roundRect(0, 0, size, size, size * 0.28);
        } else {
          ctx.rect(0, 0, size, size);
        }
        ctx.clip();

        // 2. Draw Background
        const currentBg = BG_PRESETS.find((b) => b.id === bgStyle) || BG_PRESETS[0];
        currentBg.draw(ctx, size);

        // 3. Draw Content (Image / Emoji / Monogram)
        const scale = getScaleFactor();
        const contentSize = size * scale;
        const center = size / 2;

        if (mode === "image" && uploadedImageUrl) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const aspect = img.width / img.height;
            let drawW = contentSize;
            let drawH = contentSize;
            if (aspect > 1) {
              drawH = contentSize / aspect;
            } else {
              drawW = contentSize * aspect;
            }
            ctx.drawImage(img, center - drawW / 2, center - drawH / 2, drawW, drawH);
            ctx.restore();
            resolve();
          };
          img.onerror = () => {
            ctx.restore();
            resolve();
          };
          img.src = uploadedImageUrl;
        } else if (mode === "emoji") {
          ctx.font = `${Math.round(contentSize * 0.88)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(selectedEmoji, center, center + size * 0.04);
          ctx.restore();
          resolve();
        } else {
          // Monogram
          const fontChoice =
            monogramFont === "serif"
              ? "Georgia, serif"
              : monogramFont === "mono"
              ? '"JetBrains Mono", monospace'
              : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

          const fontSize = Math.round(contentSize * (monogramText.length > 1 ? 0.65 : 0.85));
          ctx.font = `bold ${fontSize}px ${fontChoice}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = monogramColor;
          ctx.fillText(monogramText.slice(0, 2), center, center + size * 0.02);
          ctx.restore();
          resolve();
        }
      });
    },
    [mode, selectedEmoji, monogramText, monogramColor, monogramFont, uploadedImageUrl, shape, bgStyle, getScaleFactor]
  );

  // Update preview canvas in real time
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderIconToCanvas(canvas, 256).then(() => {
      setMainIconUrl(canvas.toDataURL("image/png"));
    });
  }, [renderIconToCanvas]);

  // Handle local image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
      setMode("image");
    }
  };

  // ============================================================================
  // 1-CLICK ZIP EXPORT BUILDER (All standard Web, iOS, and Android icons)
  // ============================================================================
  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();

      // List of all required resolutions
      const targets = [
        { name: "favicon-16x16.png", size: 16 },
        { name: "favicon-32x32.png", size: 32 },
        { name: "apple-touch-icon.png", size: 180 },
        { name: "android-chrome-192x192.png", size: 192 },
        { name: "android-chrome-512x512.png", size: 512 },
      ];

      // Render all PNGs in parallel
      for (const target of targets) {
        const offscreenCanvas = document.createElement("canvas");
        await renderIconToCanvas(offscreenCanvas, target.size);
        const dataUrl = offscreenCanvas.toDataURL("image/png");
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        zip.file(target.name, base64Data, { base64: true });
      }

      // Add web manifest
      const manifestContent = {
        name: appName || "My App",
        short_name: appName || "App",
        icons: [
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        theme_color: "#090d16",
        background_color: "#090d16",
        display: "standalone",
      };
      zip.file("site.webmanifest", JSON.stringify(manifestContent, null, 2));

      // Add ready-to-paste HTML snippet
      const htmlSnippet = `<!-- Place in the <head> of your website -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#090d16">`;
      zip.file("head-tags.html", htmlSnippet);

      // Generate & Download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = "favicon-app-icons.zip";
      downloadLink.click();

      setIsExportingZip(false);
    } catch {
      setIsExportingZip(false);
    }
  };

  // Copy HTML Snippet
  const handleCopyHtml = () => {
    const htmlCode = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
    navigator.clipboard.writeText(htmlCode);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  return (
    <div className="w-full space-y-8">
      {/* Hidden file input for uploading icons */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* =========================================================
          MOBILE VIEW SELECTOR (Visible on mobile/tablet)
      ========================================================== */}
      <div className="lg:hidden flex items-center p-1 rounded-2xl bg-[#080c18] border border-white/[0.08] gap-1">
        <button
          onClick={() => setMobileTab("preview")}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            mobileTab === "preview"
              ? "bg-cyan-500 text-white shadow-md"
              : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Eye size={14} />
          <span>Preview</span>
        </button>
        <button
          onClick={() => setMobileTab("design")}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            mobileTab === "design"
              ? "bg-cyan-500 text-white shadow-md"
              : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Sliders size={14} />
          <span>Design</span>
        </button>
        <button
          onClick={() => setMobileTab("export")}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            mobileTab === "export"
              ? "bg-cyan-500 text-white shadow-md"
              : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Download size={14} />
          <span>Export</span>
        </button>
      </div>

      {/* =========================================================
          MAIN STUDIO GRID: CONTROLS & REALISTIC LIVE PREVIEWS
      ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: DESIGN CONTROLS (5 COLS) */}
        <div className={cn("lg:col-span-5 space-y-5", mobileTab === "preview" ? "hidden lg:block" : "block")}>
          {/* 1. Content Mode Picker */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#080b16]/90 border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-4">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={15} className="text-cyan-400" />
              <span>Create Icon From</span>
            </label>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10">
              {(
                [
                  { id: "emoji", label: "Emoji", icon: Smile },
                  { id: "image", label: "Image", icon: ImageIcon },
                  { id: "monogram", label: "Letter", icon: Type },
                ] as { id: IconMode; label: string; icon: any }[]
              ).map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      mode === m.id
                        ? "bg-cyan-500 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    <Icon size={14} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mode 1: Emoji Picker */}
            {mode === "emoji" && (
              <div className="space-y-3 pt-1">
                <label className="block text-[11px] font-semibold text-zinc-400">Choose an Emoji</label>
                <div className="grid grid-cols-8 gap-2">
                  {POPULAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={cn(
                        "w-full aspect-square rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer",
                        selectedEmoji === emoji
                          ? "bg-cyan-500/25 border border-cyan-400/60 scale-110 shadow-sm"
                          : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08]"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="pt-2">
                  <input
                    type="text"
                    value={selectedEmoji}
                    onChange={(e) => setSelectedEmoji(e.target.value.slice(0, 2))}
                    placeholder="Or type any emoji..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 text-center"
                  />
                </div>
              </div>
            )}

            {/* Mode 2: Image Upload */}
            {mode === "image" && (
              <div className="space-y-3 pt-1">
                <label className="block text-[11px] font-semibold text-zinc-400">Upload Image or Logo</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-400/50 bg-black/40 hover:bg-black/60 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center group"
                >
                  <Upload size={22} className="text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-xs font-semibold text-zinc-300">Click to upload photo or PNG</span>
                  <span className="text-[10px] text-zinc-500">Supports transparent PNG, SVG, JPG</span>
                </div>
              </div>
            )}

            {/* Mode 3: Monogram */}
            {mode === "monogram" && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Letters (1-2)</label>
                    <input
                      type="text"
                      value={monogramText}
                      onChange={(e) => setMonogramText(e.target.value.toUpperCase().slice(0, 2))}
                      maxLength={2}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-center font-bold text-sm tracking-wider focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Text Color</label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {["#38bdf8", "#c084fc", "#34d399", "#facc15", "#ffffff", "#f87171"].map((color) => (
                        <button
                          key={color}
                          onClick={() => setMonogramColor(color)}
                          className={cn(
                            "w-6 h-6 rounded-full border border-white/20 transition-all cursor-pointer",
                            monogramColor === color && "ring-2 ring-cyan-400 scale-110"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Font Style</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: "sans", label: "Modern" },
                        { id: "serif", label: "Serif" },
                        { id: "mono", label: "Mono" },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setMonogramFont(f.id)}
                        className={cn(
                          "py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                          monogramFont === f.id
                            ? "bg-purple-500/25 text-purple-300 border border-purple-400/50"
                            : "bg-white/[0.03] text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Shape, Background & Inset Styling */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#080b16]/90 border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-4">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={15} className="text-purple-400" />
              <span>Shape & Background</span>
            </label>

            {/* Icon Shape */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Icon Shape</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: "squircle", label: "iOS" },
                    { id: "rounded", label: "Rounded" },
                    { id: "circle", label: "Circle" },
                    { id: "square", label: "Square" },
                  ] as { id: IconShape; label: string }[]
                ).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    className={cn(
                      "py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                      shape === s.id
                        ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50"
                        : "bg-white/[0.03] text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Background</label>
              <div className="grid grid-cols-2 gap-2">
                {BG_PRESETS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setBgStyle(bg.id)}
                    className={cn(
                      "p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer",
                      bgStyle === bg.id
                        ? "bg-purple-500/15 border-purple-400/60 shadow-sm"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                    )}
                  >
                    <div className={cn("w-3.5 h-3.5 rounded-md border border-white/20 shrink-0", bg.previewClass)} />
                    <span className="text-xs font-medium text-zinc-200 truncate">{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inset / Padding Size */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Inner Spacing:</span>
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: "tight", label: "Tight" },
                    { id: "balanced", label: "Balanced" },
                    { id: "relaxed", label: "Relaxed" },
                  ] as { id: InsetSize; label: string }[]
                ).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setInset(p.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                      inset === p.id
                        ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50"
                        : "text-zinc-400 hover:text-zinc-200 bg-white/[0.03]"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REALISTIC PREVIEWS & EXPORT HUB (7 COLS) */}
        <div className={cn("lg:col-span-7 space-y-5", mobileTab !== "preview" && mobileTab !== "export" ? "hidden lg:block" : "block")}>
          {/* 1. Realistic Live Previews Card */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#060812]/95 border border-white/[0.08] backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                <Eye size={15} className="text-cyan-400" />
                <span>Live Realistic Previews</span>
              </span>

              {/* Preview Selector Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/50 border border-white/10">
                {(
                  [
                    { id: "browser", label: "Browser Tab", icon: Globe },
                    { id: "iphone", label: "iPhone", icon: Smartphone },
                    { id: "google", label: "Google Search", icon: Search },
                  ] as const
                ).map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setPreviewTab(t.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                        previewTab === t.id
                          ? "bg-cyan-500 text-white shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      <Icon size={13} />
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PREVIEW CONTAINER 1: Browser Tab Mockup */}
            {previewTab === "browser" && (
              <div className="p-4 sm:p-6 rounded-2xl bg-[#0c1020] border border-white/[0.08] space-y-4">
                {/* Browser Tab Strip */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-t-xl bg-[#161d36] border-t border-x border-white/10 shadow-sm max-w-xs">
                    {/* Rendered Favicon Icon */}
                    <div className="w-4 h-4 rounded shrink-0 overflow-hidden flex items-center justify-center">
                      {mainIconUrl && <img src={mainIconUrl} alt="Favicon" className="w-full h-full object-contain" />}
                    </div>
                    <span className="text-xs font-medium text-white truncate">{appName}</span>
                    <span className="text-xs text-zinc-400 hover:text-white cursor-pointer ml-auto">&times;</span>
                  </div>
                  <div className="text-xs text-zinc-500 font-bold px-2">+</div>
                </div>

                {/* Fake Address Bar */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080b18] border border-white/10 text-xs text-zinc-400">
                  <span className="text-emerald-400">🔒</span>
                  <span className="truncate">{siteUrl}</span>
                </div>
              </div>
            )}

            {/* PREVIEW CONTAINER 2: iPhone Home Screen Mockup */}
            {previewTab === "iphone" && (
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#11162e] to-[#080b16] border border-white/[0.08] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  {/* High-Res Apple Touch Icon */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-[22px] shadow-2xl overflow-hidden border border-white/15 bg-black/40">
                    {mainIconUrl && <img src={mainIconUrl} alt="App Icon" className="w-full h-full object-cover" />}
                  </div>
                  <span className="text-xs font-medium text-white tracking-wide truncate max-w-[90px] text-center">
                    {appName}
                  </span>
                </div>
              </div>
            )}

            {/* PREVIEW CONTAINER 3: Google Search Result Mockup */}
            {previewTab === "google" && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#181a1b] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full overflow-hidden bg-black/60 shrink-0">
                    {mainIconUrl && <img src={mainIconUrl} alt="Search Icon" className="w-full h-full object-contain" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-300 font-semibold">{appName}</span>
                    <span className="text-[11px] text-zinc-500 truncate">{siteUrl}</span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-[#8ab4f8] hover:underline cursor-pointer">
                  {appName} — Official Creative & AI Suite
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  Fast, high-performance creative tools built for developers, creators, and students.
                </p>
              </div>
            )}

            {/* App & Site Name Customizer */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">App / Site Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. My Website"
                  className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Site URL</label>
                <input
                  type="text"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://mysite.com"
                  className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* 2. PRIMARY EXPORT CONTROLS (1-CLICK ZIP PACK & HTML TAGS) */}
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#080d1e] via-[#0c1329] to-[#080d1e] border border-white/[0.12] shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Main Download ZIP Button */}
              <button
                onClick={handleDownloadZip}
                disabled={isExportingZip}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_45px_rgba(6,182,212,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {isExportingZip ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Packing Complete Icon Kit...</span>
                  </>
                ) : (
                  <>
                    <FileArchive size={18} />
                    <span>Download Icon Pack (ZIP)</span>
                  </>
                )}
              </button>

              {/* Copy HTML Button */}
              <button
                onClick={handleCopyHtml}
                className="w-full sm:w-auto py-4 px-5 rounded-2xl font-bold text-sm bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white hover:text-cyan-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {copiedHtml ? <Check size={18} className="text-emerald-400" /> : <Code2 size={18} />}
                <span>{copiedHtml ? "Copied!" : "Copy HTML Tags"}</span>
              </button>
            </div>

            {/* Breakdown of what is included in the ZIP */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] text-zinc-400 space-y-1">
              <span className="font-semibold text-zinc-300">Included in your ZIP download:</span>
              <p>
                • <code className="text-cyan-300">favicon-16x16.png</code> & <code className="text-cyan-300">favicon-32x32.png</code> (Web Browser Tabs)
              </p>
              <p>
                • <code className="text-purple-300">apple-touch-icon.png</code> (180x180 iPhone & iPad)
              </p>
              <p>
                • <code className="text-emerald-300">android-chrome-192x192.png</code> & <code className="text-emerald-300">512x512.png</code> (Android & PWA)
              </p>
              <p>
                • <code className="text-amber-300">site.webmanifest</code> & <code className="text-zinc-300">head-tags.html</code> (Ready to paste)
              </p>
            </div>
          </div>

          {/* Media Pipeline Bar Integration */}
          {mainIconUrl && (
            <div className="pt-2">
              <MediaPipelineBar
                imageUrl={mainIconUrl}
                imageName="favicon-preview.png"
                sourceToolId="favicon-studio"
                sourceToolName="Favicon Studio"
                actions={["compressor", "converter", "resizer"]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Hidden 256px canvas used for real-time rendering */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
