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
  Layers,
  RefreshCw,
  Image as ImageIcon,
  Type,
  CheckCircle2,
  Sliders,
  Eye,
  FileArchive,
  ArrowRight,
  Code2,
  Lock,
  ExternalLink,
  Grid,
  Maximize2,
  Terminal,
  Cpu,
  Shield,
  Zap,
  Box,
  Compass,
  Flame,
  Rocket,
  GitBranch,
  Radio,
  Share2,
  CheckCheck,
  Palette,
  Hash,
  Shapes,
  Maximize,
  Minimize2,
  Database,
  Server,
  Command,
  FileCode,
  Hexagon,
  Monitor,
  CheckCircle
} from "lucide-react";
import JSZip from "jszip";
import { cn } from "@/lib/utils";
import { consumePipelineItem } from "@/lib/pipeline";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ============================================================================
// TYPES & DEFINITIONS
// ============================================================================

export type IconMode = "glyph" | "upload" | "geometric" | "monogram";
export type IconShape = "squircle" | "rounded" | "circle" | "square";
export type InsetSize = "tight" | "balanced" | "relaxed";
export type BgStyle =
  | "obsidian"
  | "cyber"
  | "sunset"
  | "emerald"
  | "carbon"
  | "solid-dark"
  | "solid-white"
  | "transparent";

export type GlyphId =
  | "terminal"
  | "code"
  | "cpu"
  | "database"
  | "server"
  | "shield"
  | "zap"
  | "globe"
  | "box"
  | "git"
  | "command"
  | "lock"
  | "layers"
  | "flame"
  | "rocket"
  | "compass";

export type GeometricShapeId =
  | "hexagon"
  | "prism"
  | "orbit"
  | "cube"
  | "infinity"
  | "delta"
  | "nodes"
  | "diamond";

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

      const r = ctx.createRadialGradient(size * 0.3, size * 0.25, 2, size * 0.3, size * 0.25, size * 0.65);
      r.addColorStop(0, "rgba(147, 51, 234, 0.45)");
      r.addColorStop(1, "rgba(147, 51, 234, 0)");
      ctx.fillStyle = r;
      ctx.fillRect(0, 0, size, size);
    },
  },
  {
    id: "cyber",
    name: "Cyber Neon",
    previewClass: "bg-gradient-to-br from-[#040915] via-[#0b1638] to-[#041d33]",
    draw: (ctx, size) => {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, "#040915");
      g.addColorStop(0.5, "#0c1b42");
      g.addColorStop(1, "#042036");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);

      const r = ctx.createRadialGradient(size * 0.3, size * 0.2, 5, size * 0.3, size * 0.2, size * 0.7);
      r.addColorStop(0, "rgba(6, 182, 212, 0.5)");
      r.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = r;
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

      const r = ctx.createRadialGradient(size * 0.3, size * 0.2, 5, size * 0.3, size * 0.2, size * 0.7);
      r.addColorStop(0, "rgba(244, 63, 94, 0.45)");
      r.addColorStop(1, "rgba(244, 63, 94, 0)");
      ctx.fillStyle = r;
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

      const r = ctx.createRadialGradient(size * 0.3, size * 0.2, 5, size * 0.3, size * 0.2, size * 0.7);
      r.addColorStop(0, "rgba(16, 185, 129, 0.45)");
      r.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = r;
      ctx.fillRect(0, 0, size, size);
    },
  },
  {
    id: "carbon",
    name: "Carbon Tech",
    previewClass: "bg-gradient-to-b from-[#18181b] via-[#09090b] to-[#040405]",
    draw: (ctx, size) => {
      const g = ctx.createLinearGradient(0, 0, 0, size);
      g.addColorStop(0, "#222226");
      g.addColorStop(0.5, "#101014");
      g.addColorStop(1, "#060608");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);

      // Tech Grid Pattern
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const step = size / 8;
      for (let x = 0; x <= size; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        ctx.stroke();
      }
      for (let y = 0; y <= size; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
      }
    },
  },
  {
    id: "solid-dark",
    name: "Pure Dark",
    previewClass: "bg-[#090d16] border border-white/10",
    draw: (ctx, size) => {
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, size, size);
    },
  },
  {
    id: "solid-white",
    name: "Pure White",
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

const CURATED_TECH_GLYPHS: { id: GlyphId; label: string; icon: any }[] = [
  { id: "code", label: "Code", icon: Code2 },
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "cpu", label: "Processor", icon: Cpu },
  { id: "database", label: "Database", icon: Database },
  { id: "server", label: "Cloud Server", icon: Server },
  { id: "shield", label: "Security", icon: Shield },
  { id: "zap", label: "Speed / Bolt", icon: Zap },
  { id: "globe", label: "Network", icon: Globe },
  { id: "box", label: "Package", icon: Box },
  { id: "git", label: "Branch", icon: GitBranch },
  { id: "command", label: "Command", icon: Command },
  { id: "lock", label: "Encrypted", icon: Lock },
  { id: "layers", label: "Stack", icon: Layers },
  { id: "flame", label: "Velocity", icon: Flame },
  { id: "rocket", label: "Deployment", icon: Rocket },
  { id: "compass", label: "Explorer", icon: Compass },
];

const GEOMETRIC_SHAPES: { id: GeometricShapeId; label: string }[] = [
  { id: "hexagon", label: "Hexagon Core" },
  { id: "prism", label: "Prism Crystal" },
  { id: "orbit", label: "Quantum Orbit" },
  { id: "cube", label: "Hypercube 3D" },
  { id: "infinity", label: "Infinity Loop" },
  { id: "delta", label: "Delta Apex" },
  { id: "nodes", label: "Neural Nodes" },
  { id: "diamond", label: "Poly Diamond" },
];

// ============================================================================
// HELPER: Generate Multi-Resolution Binary ICO File (Windows / Web Standard)
// ============================================================================

function createIcoBlob(pngImages: { size: number; bytes: Uint8Array }[]): Blob {
  const count = pngImages.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalDirSize = headerSize + dirEntrySize * count;

  let totalFileSize = totalDirSize;
  for (const img of pngImages) {
    totalFileSize += img.bytes.length;
  }

  const buffer = new Uint8Array(totalFileSize);
  const view = new DataView(buffer.buffer);

  // 1. Header (6 bytes)
  view.setUint16(0, 0, true); // Reserved (must be 0)
  view.setUint16(2, 1, true); // Type (1 = ICO)
  view.setUint16(4, count, true); // Number of images

  // 2. Directory Entries (16 bytes each)
  let currentOffset = totalDirSize;
  for (let i = 0; i < count; i++) {
    const entryOffset = headerSize + i * dirEntrySize;
    const img = pngImages[i];
    const sizeByte = img.size >= 256 ? 0 : img.size;

    buffer[entryOffset] = sizeByte; // Width (0 means 256)
    buffer[entryOffset + 1] = sizeByte; // Height (0 means 256)
    buffer[entryOffset + 2] = 0; // Colors (0 = >=8bpp)
    buffer[entryOffset + 3] = 0; // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel
    view.setUint32(entryOffset + 8, img.bytes.length, true); // Image byte size
    view.setUint32(entryOffset + 12, currentOffset, true); // Offset in file

    // Copy raw PNG bytes to file offset
    buffer.set(img.bytes, currentOffset);
    currentOffset += img.bytes.length;
  }

  return new Blob([buffer], { type: "image/x-icon" });
}

// Convert base64 dataURL to Uint8Array
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FaviconStudio() {
  // Mode & Content States (Default to "glyph" with "code" icon for immediate high-end preview)
  const [mode, setMode] = useState<IconMode>("glyph");
  const [selectedGlyph, setSelectedGlyph] = useState<GlyphId>("code");
  const [glyphColor, setGlyphColor] = useState<string>("#38bdf8");
  const [selectedGeometric, setSelectedGeometric] = useState<GeometricShapeId>("hexagon");
  const [monogramText, setMonogramText] = useState<string>("EX");
  const [monogramColor, setMonogramColor] = useState<string>("#ffffff");
  const [monogramFont, setMonogramFont] = useState<"sans" | "serif" | "mono">("sans");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState<number>(100);

  // App & Website Branding Details
  const [appName, setAppName] = useState<string>("Exismic Studio");
  const [siteUrl, setSiteUrl] = useState<string>("https://exismic.xyz");

  // Styling States
  const [shape, setShape] = useState<IconShape>("squircle");
  const [bgStyle, setBgStyle] = useState<BgStyle>("obsidian");
  const [inset, setInset] = useState<InsetSize>("balanced");

  // UI & Export States
  const [mobileTab, setMobileTab] = useState<"design" | "preview" | "sizes" | "code">("preview");
  const [previewTab, setPreviewTab] = useState<"browser" | "iphone" | "android" | "google" | "sizes">("browser");
  const [codeSnippetTab, setCodeSnippetTab] = useState<"html" | "nextjs" | "manifest">("html");
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [exportProgressText, setExportProgressText] = useState<string>("");
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [mainIconUrl, setMainIconUrl] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Consume incoming image pipeline if transferred from Image Gen or Bg Remover
  useEffect(() => {
    async function checkPipeline() {
      const item = await consumePipelineItem();
      if (item && item.url) {
        setUploadedImageUrl(item.url);
        setMode("upload");
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
          ctx.roundRect(0, 0, size, size, size * 0.18);
        } else if (shape === "squircle") {
          ctx.roundRect(0, 0, size, size, size * 0.225);
        } else {
          ctx.rect(0, 0, size, size);
        }
        ctx.clip();

        // 2. Draw Background
        const currentBg = BG_PRESETS.find((b) => b.id === bgStyle) || BG_PRESETS[0];
        currentBg.draw(ctx, size);

        // 3. Draw Content
        const scale = getScaleFactor();
        const contentSize = size * scale;
        const center = size / 2;

        if (mode === "upload") {
          if (uploadedImageUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            let resolved = false;
            const done = () => {
              if (!resolved) {
                resolved = true;
                ctx.restore();
                resolve();
              }
            };
            img.onload = () => {
              try {
                const aspect = img.width / img.height;
                const userZoom = imageScale / 100;
                let drawW = contentSize * userZoom;
                let drawH = contentSize * userZoom;
                if (aspect > 1) {
                  drawH = (contentSize / aspect) * userZoom;
                } else {
                  drawW = contentSize * aspect * userZoom;
                }
                ctx.drawImage(img, center - drawW / 2, center - drawH / 2, drawW, drawH);
              } catch (e) {
                console.error(e);
              }
              done();
            };
            img.onerror = done;
            setTimeout(done, 1500);
            img.src = uploadedImageUrl;
          } else {
            // Sleek placeholder badge when on Upload tab before file is chosen
            ctx.strokeStyle = glyphColor;
            ctx.lineWidth = Math.max(2, size * 0.04);
            ctx.strokeRect(center - contentSize * 0.4, center - contentSize * 0.4, contentSize * 0.8, contentSize * 0.8);
            ctx.fillStyle = glyphColor;
            ctx.font = `bold ${Math.round(contentSize * 0.35)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("+", center, center);
            ctx.restore();
            resolve();
          }
        } else if (mode === "glyph") {
          // Render Clean Vector Tech Glyph using Blob URL
          const glyphSvg = getGlyphSvg(selectedGlyph, glyphColor);
          const svgBlob = new Blob([glyphSvg], { type: "image/svg+xml;charset=utf-8" });
          const objectUrl = URL.createObjectURL(svgBlob);
          const img = new Image();

          let resolved = false;
          const done = () => {
            if (!resolved) {
              resolved = true;
              URL.revokeObjectURL(objectUrl);
              ctx.restore();
              resolve();
            }
          };

          img.onload = () => {
            try {
              ctx.drawImage(img, center - contentSize / 2, center - contentSize / 2, contentSize, contentSize);
            } catch (e) {
              console.error(e);
            }
            done();
          };
          img.onerror = done;
          setTimeout(done, 1200);
          img.src = objectUrl;
        } else if (mode === "geometric") {
          // Render Precision Geometric Shape using Blob URL
          const geomSvg = getGeometricSvg(selectedGeometric, glyphColor);
          const svgBlob = new Blob([geomSvg], { type: "image/svg+xml;charset=utf-8" });
          const objectUrl = URL.createObjectURL(svgBlob);
          const img = new Image();

          let resolved = false;
          const done = () => {
            if (!resolved) {
              resolved = true;
              URL.revokeObjectURL(objectUrl);
              ctx.restore();
              resolve();
            }
          };

          img.onload = () => {
            try {
              ctx.drawImage(img, center - contentSize / 2, center - contentSize / 2, contentSize, contentSize);
            } catch (e) {
              console.error(e);
            }
            done();
          };
          img.onerror = done;
          setTimeout(done, 1200);
          img.src = objectUrl;
        } else {
          // Monogram Typographic Initials
          const fontChoice =
            monogramFont === "serif"
              ? "Georgia, serif"
              : monogramFont === "mono"
              ? '"JetBrains Mono", monospace'
              : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

          const fontSize = Math.round(contentSize * (monogramText.length > 1 ? 0.65 : 0.85));
          ctx.font = `900 ${fontSize}px ${fontChoice}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = monogramColor;
          ctx.fillText(monogramText.slice(0, 2), center, center + size * 0.02);
          ctx.restore();
          resolve();
        }
      });
    },
    [
      mode,
      selectedGlyph,
      selectedGeometric,
      glyphColor,
      monogramText,
      monogramColor,
      monogramFont,
      uploadedImageUrl,
      imageScale,
      shape,
      bgStyle,
      getScaleFactor,
    ]
  );

  // SVG strings for curated tech glyphs (Lucide paths scaled to 240x240 viewBox)
  function getGlyphSvg(glyph: GlyphId, color: string): string {
    const paths: Record<GlyphId, string> = {
      code: '<polyline points="16 18 22 12 16 6" stroke-width="2.5" fill="none"/><polyline points="8 6 2 12 8 18" stroke-width="2.5" fill="none"/>',
      terminal: '<polyline points="4 17 10 11 4 5" stroke-width="2.5" fill="none"/><line x1="12" y1="19" x2="20" y2="19" stroke-width="2.5"/>',
      cpu: `<rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2" fill="none"/><rect x="9" y="9" width="6" height="6" fill="${color}"/><line x1="9" y1="1" x2="9" y2="4" stroke-width="2"/><line x1="15" y1="1" x2="15" y2="4" stroke-width="2"/><line x1="9" y1="20" x2="9" y2="23" stroke-width="2"/><line x1="15" y1="20" x2="15" y2="23" stroke-width="2"/><line x1="20" y1="9" x2="23" y2="9" stroke-width="2"/><line x1="20" y1="15" x2="23" y2="15" stroke-width="2"/><line x1="1" y1="9" x2="4" y2="9" stroke-width="2"/><line x1="1" y1="15" x2="4" y2="15" stroke-width="2"/>`,
      database: '<ellipse cx="12" cy="5" rx="9" ry="3" stroke-width="2" fill="none"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke-width="2" fill="none"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke-width="2" fill="none"/>',
      server: '<rect x="2" y="2" width="20" height="8" rx="2" ry="2" stroke-width="2" fill="none"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2" stroke-width="2" fill="none"/><line x1="6" y1="6" x2="6.01" y2="6" stroke-width="2"/><line x1="6" y1="18" x2="6.01" y2="18" stroke-width="2"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2" fill="none"/><polyline points="9 12 11 14 15 10" stroke-width="2" fill="none"/>',
      zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="${color}"/>`,
      globe: '<circle cx="12" cy="12" r="10" stroke-width="2" fill="none"/><line x1="2" y1="12" x2="22" y2="12" stroke-width="2"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke-width="2" fill="none"/>',
      box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke-width="2" fill="none"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke-width="2"/><line x1="12" y1="22.08" x2="12" y2="12" stroke-width="2"/>',
      git: '<circle cx="6" cy="18" r="3" stroke-width="2" fill="none"/><circle cx="6" cy="6" r="3" stroke-width="2" fill="none"/><circle cx="18" cy="9" r="3" stroke-width="2" fill="none"/><line x1="6" y1="9" x2="6" y2="15" stroke-width="2"/><path d="M18 12a9 9 0 0 1-9 9" stroke-width="2" fill="none"/>',
      command: '<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" stroke-width="2" fill="none"/>',
      lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2" fill="none"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2" fill="none"/>',
      layers: '<polygon points="12 2 2 7 12 12 22 7 12 2" stroke-width="2" fill="none"/><polyline points="2 17 12 22 22 17" stroke-width="2" fill="none"/><polyline points="2 12 12 17 22 12" stroke-width="2" fill="none"/>',
      flame: `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="${color}"/>`,
      rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke-width="2" fill="none"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke-width="2" fill="none"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" stroke-width="2" fill="none"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke-width="2" fill="none"/>',
      compass: `<circle cx="12" cy="12" r="10" stroke-width="2" fill="none"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="${color}"/>`,
    };
    return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 24 24" stroke="${color}" fill="none" stroke-linecap="round" stroke-linejoin="round">${paths[glyph]}</svg>`;
  }

  // Precision Geometric Shapes
  function getGeometricSvg(shapeId: GeometricShapeId, color: string): string {
    const geometries: Record<GeometricShapeId, string> = {
      hexagon: `<polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" stroke="${color}" stroke-width="7" fill="none" stroke-linejoin="round"/><polygon points="50,25 72,37.5 72,62.5 50,75 28,62.5 28,37.5" fill="${color}" opacity="0.6"/>`,
      prism: `<polygon points="50,10 90,85 10,85" stroke="${color}" stroke-width="7" fill="none" stroke-linejoin="round"/><line x1="50" y1="10" x2="50" y2="85" stroke="${color}" stroke-width="5" opacity="0.7"/><polygon points="50,45 75,85 25,85" fill="${color}" opacity="0.4"/>`,
      orbit: `<circle cx="50" cy="50" r="16" fill="${color}"/><ellipse cx="50" cy="50" rx="42" ry="18" stroke="${color}" stroke-width="5" fill="none" transform="rotate(-30 50 50)"/><ellipse cx="50" cy="50" rx="42" ry="18" stroke="${color}" stroke-width="5" fill="none" stroke-dasharray="8 6" transform="rotate(30 50 50)" opacity="0.5"/>`,
      cube: `<polygon points="50,10 88,32 50,54 12,32" stroke="${color}" stroke-width="6" fill="${color}" fill-opacity="0.3"/><polygon points="12,32 50,54 50,90 12,68" stroke="${color}" stroke-width="6" fill="${color}" fill-opacity="0.6"/><polygon points="88,32 50,54 50,90 88,68" stroke="${color}" stroke-width="6" fill="${color}" fill-opacity="0.85"/>`,
      infinity: `<path d="M30 65c-15 0-22-15-22-15s7-15 22-15 22 30 40 30 22-15 22-15-7-15-22-15-22 30-40 30z" stroke="${color}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      delta: `<path d="M50 12 L88 88 L50 72 L12 88 Z" stroke="${color}" stroke-width="6" fill="${color}" fill-opacity="0.65" stroke-linejoin="round"/>`,
      nodes: `<line x1="20" y1="50" x2="50" y2="20" stroke="${color}" stroke-width="5"/><line x1="50" y1="20" x2="80" y2="50" stroke="${color}" stroke-width="5"/><line x1="80" y1="50" x2="50" y2="80" stroke="${color}" stroke-width="5"/><line x1="50" y1="80" x2="20" y2="50" stroke="${color}" stroke-width="5"/><circle cx="50" cy="20" r="10" fill="${color}"/><circle cx="80" cy="50" r="10" fill="${color}"/><circle cx="50" cy="80" r="10" fill="${color}"/><circle cx="20" cy="50" r="10" fill="${color}"/><circle cx="50" cy="50" r="8" fill="#ffffff"/>`,
      diamond: `<polygon points="50,8 92,50 50,92 8,50" stroke="${color}" stroke-width="7" fill="none" stroke-linejoin="round"/><line x1="8" y1="50" x2="92" y2="50" stroke="${color}" stroke-width="5" opacity="0.6"/><line x1="50" y1="8" x2="50" y2="92" stroke="${color}" stroke-width="5" opacity="0.6"/>`,
    };
    return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 100 100">${geometries[shapeId]}</svg>`;
  }

  // Re-render master icon whenever any design property changes
  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current || document.createElement("canvas");
    renderIconToCanvas(canvas, 256).then(() => {
      if (isMounted) {
        setMainIconUrl(canvas.toDataURL("image/png"));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [renderIconToCanvas]);

  // Handle Brand Logo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImageUrl(event.target.result as string);
          setMode("upload");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Export Single Resolution Image
  const handleDownloadSingle = async (size: number, filename: string) => {
    const offscreen = document.createElement("canvas");
    await renderIconToCanvas(offscreen, size);
    const link = document.createElement("a");
    link.download = filename;
    link.href = offscreen.toDataURL("image/png");
    link.click();
  };

  // Build Modern SVG Favicon string with dark/light scheme support
  const generateSvgFavicon = (): string => {
    const bg = bgStyle === "transparent" ? "none" : "#090d16";
    const rx = shape === "circle" ? "50" : shape === "squircle" ? "22" : shape === "rounded" ? "18" : "0";
    let innerContent = "";

    if (mode === "glyph") {
      innerContent = `<g transform="translate(20, 20) scale(2.5)">${getGlyphSvg(selectedGlyph, glyphColor).replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "")}</g>`;
    } else if (mode === "geometric") {
      innerContent = `<g transform="translate(15, 15) scale(0.7)">${getGeometricSvg(selectedGeometric, glyphColor).replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "")}</g>`;
    } else if (mode === "monogram") {
      innerContent = `<text x="50" y="55" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" fill="${monogramColor}" text-anchor="middle" dominant-baseline="middle">${monogramText.slice(0, 2)}</text>`;
    } else if (mode === "upload" && uploadedImageUrl) {
      innerContent = `<image href="${uploadedImageUrl}" x="15" y="15" width="70" height="70" preserveAspectRatio="xMidYMid meet"/>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="${rx}" fill="${bg}"/>
  ${innerContent}
</svg>`;
  };

  // Export Complete Production ZIP Package
  const handleDownloadZip = async () => {
    if (isExportingZip) return;
    setIsExportingZip(true);
    setExportProgressText("Initializing kit builder...");

    try {
      const zip = new JSZip();
      const requiredResolutions = [
        { size: 16, filename: "favicon-16x16.png" },
        { size: 32, filename: "favicon-32x32.png" },
        { size: 48, filename: "favicon-48x48.png" },
        { size: 96, filename: "favicon-96x96.png" },
        { size: 180, filename: "apple-touch-icon.png" },
        { size: 192, filename: "android-chrome-192x192.png" },
        { size: 512, filename: "android-chrome-512x512.png" },
      ];

      const icoFrames: { size: number; bytes: Uint8Array }[] = [];

      // 1. Render all standard PNG formats with live progress
      for (let i = 0; i < requiredResolutions.length; i++) {
        const res = requiredResolutions[i];
        setExportProgressText(`Rendering ${res.size}×${res.size} frame...`);
        const offscreen = document.createElement("canvas");
        await renderIconToCanvas(offscreen, res.size);
        const dataUrl = offscreen.toDataURL("image/png");
        const bytes = dataUrlToUint8Array(dataUrl);

        zip.file(res.filename, bytes);

        // Collect 16, 32, 48 frames for the Windows multi-res ICO binary
        if (res.size === 16 || res.size === 32 || res.size === 48) {
          icoFrames.push({ size: res.size, bytes });
        }
      }

      // 2. Generate Real Multi-Resolution favicon.ico
      setExportProgressText("Generating multi-resolution ICO...");
      const icoBlob = createIcoBlob(icoFrames);
      const icoArrayBuffer = await icoBlob.arrayBuffer();
      zip.file("favicon.ico", icoArrayBuffer);

      // 3. Generate Modern Vector SVG Favicon
      setExportProgressText("Generating vector SVG favicon...");
      zip.file("favicon.svg", generateSvgFavicon());

      // 4. Add Valid Web App Manifest (PWA)
      const manifestContent = {
        name: appName || "My Application",
        short_name: appName ? appName.slice(0, 12) : "App",
        icons: [
          { src: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
          { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
        theme_color: "#060813",
        background_color: "#060813",
        display: "standalone",
        start_url: "/",
      };
      zip.file("site.webmanifest", JSON.stringify(manifestContent, null, 2));

      // 5. Add Production-Ready HTML Head Snippet
      const htmlSnippet = `<!-- Favicon & App Icon Head Tags -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#060813">`;
      zip.file("head-tags.html", htmlSnippet);

      // 6. Add Next.js App Router Instructions
      const nextjsGuide = `// Next.js App Router (src/app/layout.tsx)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${appName}',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};`;
      zip.file("nextjs-metadata.ts", nextjsGuide);

      // 7. Add Quick Setup Documentation
      const readmeGuide = `# Favicon & App Icon Kit
Generated by Exismic Favicon Studio (https://exismic.xyz)

## 📁 Included Assets
- favicon.ico — Multi-resolution binary (16, 32, 48) for web browsers and Windows
- favicon.svg — Scalable vector favicon for high-DPI modern browsers
- favicon-16x16.png & favicon-32x32.png — Standard web favicons
- favicon-48x48.png & favicon-96x96.png — High-DPI Windows desktop & Google SERP
- apple-touch-icon.png — iOS Safari Home Screen icon (180x180)
- android-chrome-192x192.png — Android & PWA home screen icon (192x192)
- android-chrome-512x512.png — Android & PWA splash screen icon (512x512)
- site.webmanifest — PWA Web App Manifest JSON
- head-tags.html — Copy-paste HTML <head> snippet
- nextjs-metadata.ts — Next.js App Router metadata configuration

## 🚀 Quick Setup Instructions

### Next.js (App Router):
1. Place favicon.ico, favicon.svg, and all PNGs into your \`public/\` folder.
2. Place site.webmanifest in your \`public/\` folder.
3. In \`src/app/layout.tsx\`, paste the configuration from \`nextjs-metadata.ts\`.

### HTML / Vite / Astro:
1. Place all icon files in the root or \`public/\` directory of your project.
2. Paste the contents of \`head-tags.html\` into your \`<head>\` section.
`;
      zip.file("README.md", readmeGuide);

      // 8. Generate and trigger download
      setExportProgressText("Zipping package...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(zipBlob);
      const safeSlug = (appName || "app").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "favicon-kit";
      downloadLink.download = `${safeSlug}-icon-pack.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setIsExportingZip(false);
      setExportProgressText("");
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      setIsExportingZip(false);
      setExportProgressText("");
      alert("Failed to build icon kit. Please try again.");
    }
  };

  // Get active code snippet text
  const getActiveCode = (): string => {
    if (codeSnippetTab === "html") {
      return `<!-- Favicon & App Icon Head Tags -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#060813">`;
    }
    if (codeSnippetTab === "nextjs") {
      return `// Next.js App Router: app/layout.tsx
export const metadata = {
  title: '${appName}',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
};`;
    }
    return JSON.stringify(
      {
        name: appName || "My Application",
        short_name: appName ? appName.slice(0, 12) : "App",
        icons: [
          { src: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
          { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
        theme_color: "#060813",
        background_color: "#060813",
        display: "standalone",
        start_url: "/",
      },
      null,
      2
    );
  };

  // 1-Click Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 pb-24 lg:pb-0">
      {/* Hidden file input for uploading icons */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Banner: Tool Specifications & Direct Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#0b0f19]/85 border border-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Production Icon Engine</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                Multi-Res ICO + SVG
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Full Web, iOS, Android, and PWA icon suites with 100% client-side privacy</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyCode}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer",
              copiedCode
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/[0.08]"
            )}
          >
            {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Code2 size={13} className="text-cyan-400" />}
            <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isExportingZip}
            className={cn(
              "relative group overflow-hidden px-4 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer",
              downloadSuccess
                ? "bg-emerald-500 text-white border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border-white/20"
            )}
          >
            {isExportingZip ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : downloadSuccess ? (
              <Check size={13} className="text-white" />
            ) : (
              <FileArchive size={13} />
            )}
            <span>
              {isExportingZip
                ? exportProgressText || "Packing..."
                : downloadSuccess
                ? "Downloaded!"
                : "Download ZIP Kit"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Segmented Navigation Tabs */}
      <div className="lg:hidden grid grid-cols-4 p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1 shadow-lg">
        <button
          onClick={() => setMobileTab("preview")}
          className={cn(
            "py-2 px-1 text-[11px] font-semibold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
            mobileTab === "preview"
              ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-white border border-cyan-500/40 font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Eye size={13} className="text-cyan-400" />
          <span className="truncate">Previews</span>
        </button>
        <button
          onClick={() => setMobileTab("design")}
          className={cn(
            "py-2 px-1 text-[11px] font-semibold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
            mobileTab === "design"
              ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-white border border-cyan-500/40 font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sliders size={13} className="text-cyan-400" />
          <span className="truncate">Controls</span>
        </button>
        <button
          onClick={() => setMobileTab("sizes")}
          className={cn(
            "py-2 px-1 text-[11px] font-semibold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
            mobileTab === "sizes"
              ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-white border border-cyan-500/40 font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Grid size={13} className="text-cyan-400" />
          <span className="truncate">Sizes</span>
        </button>
        <button
          onClick={() => setMobileTab("code")}
          className={cn(
            "py-2 px-1 text-[11px] font-semibold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
            mobileTab === "code"
              ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-white border border-cyan-500/40 font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Code2 size={13} className="text-cyan-400" />
          <span className="truncate">Code</span>
        </button>
      </div>

      {/* Main Studio Grid: Controls on Left (5 cols), Live Preview Hub on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: DESIGN & SOURCE ASSET CONTROLS */}
        {/* ================================================================= */}
        <div className={cn("lg:col-span-5 space-y-5", mobileTab === "design" ? "block" : "hidden lg:block")}>
          {/* Section 1: Creation Mode Selector */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Icon Source Asset</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Select Mode</span>
            </label>

            {/* Mode Switcher: 4 Professional Developer Creation Modes */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-black/60 border border-white/10">
              {[
                { id: "glyph", label: "Vector", icon: Terminal },
                { id: "upload", label: "Upload", icon: Upload },
                { id: "geometric", label: "Shapes", icon: Shapes },
                { id: "monogram", label: "Letters", icon: Type },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as IconMode)}
                    className={cn(
                      "py-2 px-1 rounded-lg text-xs font-medium transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center",
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm font-semibold"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Icon size={13} className="shrink-0" />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* MODE 1: Curated Tech Vector Glyphs */}
            {mode === "glyph" && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs pb-0.5">
                  <span className="font-semibold text-zinc-300">Choose Tech Glyph:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    {(() => {
                      const ActiveIcon = CURATED_TECH_GLYPHS.find((g) => g.id === selectedGlyph)?.icon || Code2;
                      return <ActiveIcon size={12} className="text-cyan-400 shrink-0" />;
                    })()}
                    <span>{CURATED_TECH_GLYPHS.find((g) => g.id === selectedGlyph)?.label}</span>
                  </span>
                </div>

                {/* Compact 8-Column Icon Matrix: 16 Icons in Exactly 2 Clean Rows, Zero Scrollbars */}
                <div className="grid grid-cols-8 gap-1.5">
                  {CURATED_TECH_GLYPHS.map((g) => {
                    const Icon = g.icon;
                    const isSelected = selectedGlyph === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGlyph(g.id)}
                        className={cn(
                          "aspect-square rounded-xl border flex items-center justify-center transition-all cursor-pointer group relative",
                          isSelected
                            ? "bg-gradient-to-b from-cyan-500/25 to-cyan-500/10 border-cyan-400/80 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-cyan-400/40 scale-105 z-10"
                            : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white"
                        )}
                        title={g.label}
                      >
                        <Icon size={17} className="transition-transform group-hover:scale-110" />
                      </button>
                    );
                  })}
                </div>

                {/* Glyph Color Palette */}
                <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Glyph Accent:</span>
                  <div className="flex items-center gap-1.5">
                    {["#38bdf8", "#818cf8", "#34d399", "#facc15", "#f43f5e", "#ffffff"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setGlyphColor(color)}
                        className={cn(
                          "w-6 h-6 rounded-full border border-white/20 transition-all cursor-pointer relative",
                          glyphColor === color && "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#090b14] scale-110 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: Upload Brand Asset / Logo */}
            {mode === "upload" && (
              <div className="space-y-3 pt-1">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-400/50 bg-black/40 hover:bg-black/60 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Upload size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-200 block">Click or Drop Logo / PNG / SVG</span>
                    <span className="text-[10px] text-zinc-500">Supports transparent PNG, SVG, JPG, WebP</span>
                  </div>
                </div>

                {uploadedImageUrl ? (
                  <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Logo Scale / Zoom:</span>
                      <span className="font-mono text-cyan-300 font-bold">{imageScale}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={180}
                      value={imageScale}
                      onChange={(e) => setImageScale(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-zinc-800"
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-500 text-center italic">
                    Drop a company logo or app icon above, or select Vector Glyphs / Shapes
                  </p>
                )}
              </div>
            )}

            {/* MODE 3: Modern Geometric Shapes */}
            {mode === "geometric" && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs pb-0.5">
                  <span className="font-semibold text-zinc-300">Brand Geometry:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <span>{GEOMETRIC_SHAPES.find((s) => s.id === selectedGeometric)?.label}</span>
                  </span>
                </div>

                {/* Compact 8-Column Matrix for Geometric Shapes */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {GEOMETRIC_SHAPES.map((s) => {
                    const isSelected = selectedGeometric === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedGeometric(s.id)}
                        className={cn(
                          "aspect-square rounded-xl border flex items-center justify-center transition-all cursor-pointer group relative",
                          isSelected
                            ? "bg-gradient-to-b from-cyan-500/25 to-cyan-500/10 border-cyan-400/80 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-cyan-400/40 scale-105 z-10"
                            : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white"
                        )}
                        title={s.label}
                      >
                        <div
                          className="w-5 h-5 transition-transform group-hover:scale-110 flex items-center justify-center"
                          dangerouslySetInnerHTML={{
                            __html: getGeometricSvg(s.id, isSelected ? glyphColor : "#94a3b8"),
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Shape Color Palette */}
                <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">Geometry Color:</span>
                  <div className="flex items-center gap-1.5">
                    {["#38bdf8", "#818cf8", "#34d399", "#facc15", "#f43f5e", "#ffffff"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setGlyphColor(color)}
                        className={cn(
                          "w-6 h-6 rounded-full border border-white/20 transition-all cursor-pointer relative",
                          glyphColor === color && "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#090b14] scale-110 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 4: Monogram Initials */}
            {mode === "monogram" && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Initials (1-2 chars)</label>
                    <input
                      type="text"
                      value={monogramText}
                      onChange={(e) => setMonogramText(e.target.value.toUpperCase().slice(0, 2))}
                      maxLength={2}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-center font-bold text-sm tracking-wider focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Text Color</label>
                    <div className="flex items-center gap-1.5 pt-1.5">
                      {["#ffffff", "#38bdf8", "#c084fc", "#34d399", "#facc15", "#f87171"].map((color) => (
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
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Typography Style</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: "sans", label: "Modern Sans" },
                        { id: "serif", label: "Editorial Serif" },
                        { id: "mono", label: "JetBrains Mono" },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setMonogramFont(f.id)}
                        className={cn(
                          "py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                          monogramFont === f.id
                            ? "bg-purple-500/25 text-purple-300 border border-purple-400/50 shadow-sm"
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

          {/* Section 2: Shape, Background & Inset Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>2. Icon Geometry & Background</span>
            </label>

            {/* Shape Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Icon Shape</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "squircle", label: "iOS Squircle" },
                  { id: "rounded", label: "Smooth" },
                  { id: "circle", label: "Circle" },
                  { id: "square", label: "Square" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setShape(s.id as IconShape)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-center",
                      shape === s.id
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-semibold shadow-sm"
                        : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Style Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">Background Finish</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {BG_PRESETS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setBgStyle(bg.id)}
                    className={cn(
                      "p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer",
                      bgStyle === bg.id
                        ? "bg-purple-500/20 border-purple-400/50 shadow-sm"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                    )}
                  >
                    <div className={cn("w-3.5 h-3.5 rounded-md border border-white/20 shrink-0", bg.previewClass)} />
                    <span className="text-xs font-medium text-zinc-200 truncate">{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inset Scale */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Inner Spacing / Padding:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "tight", label: "Tight" },
                  { id: "balanced", label: "Balanced" },
                  { id: "relaxed", label: "Relaxed" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setInset(p.id as InsetSize)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                      inset === p.id
                        ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 font-semibold"
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

        {/* ================================================================= */}
        {/* RIGHT COLUMN: REALISTIC DEVICE PREVIEWS & EXPORT HUB */}
        {/* ================================================================= */}
        <div className={cn("lg:col-span-7 space-y-5", mobileTab === "design" ? "hidden lg:block" : "block")}>
          {/* Main Visual Preview Area */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Eye size={14} className="text-cyan-400" />
                <span>Device Context Simulation</span>
              </span>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 overflow-x-auto max-w-full">
                {[
                  { id: "browser", label: "Browser Tab", icon: Globe },
                  { id: "iphone", label: "iPhone", icon: Smartphone },
                  { id: "android", label: "Android", icon: Radio },
                  { id: "google", label: "Google SERP", icon: Search },
                  { id: "sizes", label: "Resolutions", icon: Grid },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = previewTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setPreviewTab(t.id as any)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
                        isSelected
                          ? "bg-white/[0.12] text-white font-semibold border border-white/20 shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <Icon size={12} className="shrink-0" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PREVIEW CONTAINER 1: Desktop Browser Tab Mockup */}
            {previewTab === "browser" && (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c1020] overflow-hidden shadow-2xl font-sans">
                {/* macOS Window Titlebar with Traffic Lights */}
                <div className="px-4 py-2.5 bg-[#080b18] border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 truncate max-w-xs">{appName}</span>
                  <div className="w-8" />
                </div>

                {/* Tab Strip with Active Browser Tab */}
                <div className="px-3 pt-2 bg-[#0a0e1c] flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-t-xl bg-[#161d36] border-t border-x border-white/10 shadow-sm max-w-[220px] shrink-0">
                    <div className="w-4 h-4 rounded shrink-0 overflow-hidden flex items-center justify-center">
                      {mainIconUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mainIconUrl} alt="Favicon" className="w-full h-full object-contain" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-white truncate">{appName}</span>
                    <span className="text-xs text-zinc-400 hover:text-white cursor-pointer ml-auto">&times;</span>
                  </div>
                  <div className="text-xs text-zinc-500 font-bold px-2 cursor-pointer hover:text-zinc-300">+</div>
                </div>

                {/* URL Address Bar with SSL Padlock Vector */}
                <div className="p-3 bg-[#0c1020] flex items-center gap-2">
                  <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080b18] border border-white/10 text-xs text-zinc-400 font-mono">
                    <Lock size={12} className="text-emerald-400 shrink-0" />
                    <span className="text-zinc-300 font-semibold truncate">{siteUrl.replace(/^https?:\/\//, "")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW CONTAINER 2: Photorealistic iPhone Home Screen */}
            {previewTab === "iphone" && (
              <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#11162e] via-[#090e24] to-[#040610] p-4 sm:p-7 shadow-2xl relative overflow-hidden font-sans">
                {/* iOS Status Bar */}
                <div className="flex items-center justify-between text-xs text-white/80 font-semibold px-2 mb-6">
                  <span>9:41</span>
                  <div className="w-20 h-4 bg-black rounded-full border border-white/10" />
                  <span className="font-mono text-[11px]">5G 100%</span>
                </div>

                {/* App Grid with Real Companion Icons */}
                <div className="grid grid-cols-4 gap-2 sm:gap-6 max-w-sm mx-auto text-center">
                  {/* Your Custom App Icon in the Hero Spot */}
                  <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[14px] sm:rounded-[18px] shadow-[0_8px_25px_rgba(0,0,0,0.6)] overflow-hidden border border-white/20 bg-black/40 relative group-hover:scale-105 transition-transform">
                      {mainIconUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mainIconUrl} alt="App Icon" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-white tracking-tight truncate max-w-[64px] sm:max-w-[70px]">
                      {appName}
                    </span>
                  </div>

                  {/* Companion iOS App: Camera */}
                  <div className="flex flex-col items-center gap-1.5 opacity-60">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[14px] sm:rounded-[18px] bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-zinc-400 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-400" />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400">Camera</span>
                  </div>

                  {/* Companion iOS App: Settings */}
                  <div className="flex flex-col items-center gap-1.5 opacity-60">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[14px] sm:rounded-[18px] bg-zinc-700 border border-white/10 flex items-center justify-center text-zinc-300">
                      <Sliders size={20} className="text-zinc-300" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400">Settings</span>
                  </div>

                  {/* Companion iOS App: Terminal */}
                  <div className="flex flex-col items-center gap-1.5 opacity-60">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[14px] sm:rounded-[18px] bg-black border border-white/10 flex items-center justify-center text-emerald-400">
                      <Terminal size={18} />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400">Terminal</span>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW CONTAINER 3: Android Adaptive Icon Simulation */}
            {previewTab === "android" && (
              <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#141d2d] via-[#0d1522] to-[#080d16] p-4 sm:p-7 shadow-2xl relative overflow-hidden font-sans">
                <div className="text-center space-y-4 max-w-xs mx-auto">
                  <span className="text-xs font-semibold text-zinc-400 block">Android Adaptive Circular Mask (PWA 192px)</span>
                  <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden shadow-2xl border-2 border-white/20 bg-black/60 flex items-center justify-center">
                    {mainIconUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mainIconUrl} alt="Android App" className="w-full h-full object-cover" />
                    )}
                    {/* Safe Area Circular Ring Overlay Guide */}
                    <div className="absolute inset-2.5 rounded-full border border-dashed border-cyan-400/40 pointer-events-none" />
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{appName}</div>
                  <p className="text-[11px] text-zinc-400">Dotted ring indicates Android OS safe-area boundary</p>
                </div>
              </div>
            )}

            {/* PREVIEW CONTAINER 4: Google Search (SERP) Card */}
            {previewTab === "google" && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#202124] border border-white/[0.08] space-y-1.5 font-sans shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                    {mainIconUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mainIconUrl} alt="Search Icon" className="w-4 h-4 object-contain" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-[#bdc1c6] font-semibold truncate">{appName}</span>
                    <span className="text-[11px] text-[#9aa0a6] font-mono truncate">{siteUrl}</span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-[#8ab4f8] hover:underline cursor-pointer truncate">
                  {appName} — Official Creative & Developer Platform
                </h4>
                <p className="text-xs text-[#bdc1c6] line-clamp-2 leading-relaxed">
                  Fast, client-side web application suite built for developers, designers, and video teams with $0 server cost.
                </p>
              </div>
            )}

            {/* PREVIEW CONTAINER 5: Resolution Grid & Direct Single Downloads */}
            {previewTab === "sizes" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { size: 16, label: "16 × 16", desc: "Browser Tab", name: "favicon-16x16.png" },
                  { size: 32, label: "32 × 32", desc: "Retina Tab", name: "favicon-32x32.png" },
                  { size: 48, label: "48 × 48", desc: "Windows Shortcut", name: "favicon-48x48.png" },
                  { size: 96, label: "96 × 96", desc: "Google SERP HD", name: "favicon-96x96.png" },
                  { size: 180, label: "180 × 180", desc: "Apple Touch", name: "apple-touch-icon.png" },
                  { size: 192, label: "192 × 192", desc: "Android PWA", name: "android-chrome-192x192.png" },
                  { size: 512, label: "512 × 512", desc: "Splash / Store", name: "android-chrome-512x512.png" },
                ].map((item) => (
                  <div
                    key={item.size}
                    className="p-3 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        style={{ width: Math.min(item.size, 32), height: Math.min(item.size, 32) }}
                        className="rounded shrink-0 overflow-hidden bg-black/60 border border-white/15 flex items-center justify-center"
                      >
                        {mainIconUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={mainIconUrl} alt={item.label} className="w-full h-full object-contain" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white font-mono">{item.label}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{item.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadSingle(item.size, item.name)}
                      className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 text-xs transition-colors shrink-0 cursor-pointer"
                      title={`Download ${item.name}`}
                    >
                      <Download size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* App / Site Name Customizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">App / Site Title</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. My Website"
                  className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Production Domain URL</label>
                <input
                  type="text"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://mysite.com"
                  className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Code Snippets & Metadata Integration Hub */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode size={14} className="text-purple-400" />
                <span>Production Head Tags & Next.js Snippets</span>
              </span>

              {/* Code Snippet Switcher */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/60 border border-white/10">
                {(
                  [
                    { id: "html", label: "HTML <head>" },
                    { id: "nextjs", label: "Next.js App" },
                    { id: "manifest", label: "Manifest" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCodeSnippetTab(tab.id)}
                    className={cn(
                      "px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                      codeSnippetTab === tab.id ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-zinc-300 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-40">
                {getActiveCode()}
              </pre>
              <button
                onClick={handleCopyCode}
                className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white text-[11px] font-semibold flex items-center gap-1 border border-white/15 transition-all cursor-pointer"
              >
                {copiedCode ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Primary Export Card (1-Click ZIP + HTML Tags) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#080d1e] via-[#0c1329] to-[#080d1e] border border-white/[0.12] shadow-2xl space-y-3.5">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={handleDownloadZip}
                disabled={isExportingZip}
                className={cn(
                  "w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-xs border active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl",
                  downloadSuccess
                    ? "bg-emerald-500 text-white border-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                    : "bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border-white/20"
                )}
              >
                {isExportingZip ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : downloadSuccess ? (
                  <CheckCircle size={15} className="text-white" />
                ) : (
                  <FileArchive size={15} />
                )}
                <span>
                  {isExportingZip
                    ? exportProgressText || "Packing Complete Kit..."
                    : downloadSuccess
                    ? "Icon Kit Downloaded! (13 Files)"
                    : "Download Complete Icon Pack (ZIP)"}
                </span>
              </button>

              <button
                onClick={handleCopyCode}
                className="w-full sm:w-auto py-3 px-4 rounded-xl font-bold text-xs bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
              >
                {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Code2 size={14} className="text-cyan-400" />}
                <span>{copiedCode ? "Code Copied!" : "Copy Code"}</span>
              </button>
            </div>

            {/* Complete Production Package Manifest Inventory */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] font-mono text-zinc-400 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-sans font-bold text-zinc-200 mb-1 border-b border-white/[0.06] pb-1">
                <span>Production Package Manifest (13 Files)</span>
                <span className="text-[10px] text-emerald-400 font-mono">100% Client-Side Verified</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div>• <span className="text-cyan-300 font-semibold">favicon.ico</span> (Multi-res 16/32/48 binary)</div>
                <div>• <span className="text-teal-300 font-semibold">favicon.svg</span> (Scalable vector favicon)</div>
                <div>• <span className="text-purple-300 font-semibold">apple-touch-icon.png</span> (iOS 180×180)</div>
                <div>• <span className="text-cyan-300 font-semibold">favicon-16/32/48.png</span> (Standard web)</div>
                <div>• <span className="text-cyan-300 font-semibold">favicon-96x96.png</span> (Google SERP HD)</div>
                <div>• <span className="text-emerald-300 font-semibold">android-chrome-192.png</span> (PWA icon)</div>
                <div>• <span className="text-emerald-300 font-semibold">android-chrome-512.png</span> (Splash icon)</div>
                <div>• <span className="text-amber-300 font-semibold">site.webmanifest</span> (PWA JSON)</div>
                <div>• <span className="text-zinc-200 font-semibold">head-tags.html</span> (HTML & Next.js)</div>
                <div>• <span className="text-indigo-300 font-semibold">nextjs-metadata.ts</span> (App Router TS)</div>
                <div className="sm:col-span-2">• <span className="text-zinc-300 font-semibold">README.md</span> (1-Minute setup instructions)</div>
              </div>
            </div>
          </div>

          {/* Media Pipeline Bar Integration */}
          {mainIconUrl && (
            <MediaPipelineBar
              imageUrl={mainIconUrl}
              imageName="favicon-preview.png"
              sourceToolId="favicon-studio"
              sourceToolName="Favicon & App Icon Studio"
              actions={["compressor", "converter", "resizer"]}
            />
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM FLOATING ACTION BAR */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 p-2 rounded-2xl bg-[#090b14]/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center gap-2">
        {mobileTab === "preview" || mobileTab === "sizes" || mobileTab === "code" ? (
          <button
            onClick={() => setMobileTab("design")}
            className="flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all truncate"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Edit Icon Design</span>
          </button>
        ) : (
          <button
            onClick={() => setMobileTab("preview")}
            className="flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all truncate"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">View Device Previews</span>
          </button>
        )}

        <button
          onClick={handleCopyCode}
          className={cn(
            "py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0 cursor-pointer",
            copiedCode
              ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              : "bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 border-white/10"
          )}
          title="Copy head tags or Next.js metadata"
        >
          {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Code2 className="w-3.5 h-3.5" />}
          <span>{copiedCode ? "Copied" : "Code"}</span>
        </button>

        <button
          onClick={handleDownloadZip}
          disabled={isExportingZip}
          className={cn(
            "relative group overflow-hidden px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0 cursor-pointer",
            downloadSuccess
              ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              : "bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border-white/20"
          )}
        >
          {isExportingZip ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : downloadSuccess ? (
            <Check className="w-3.5 h-3.5 text-white" />
          ) : (
            <FileArchive className="w-3.5 h-3.5" />
          )}
          <span>{isExportingZip ? "..." : downloadSuccess ? "Done" : "ZIP Kit"}</span>
        </button>
      </div>

      {/* Hidden 256px canvas used for real-time rendering */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
