"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Laptop, 
  Smartphone, 
  Globe, 
  Tablet, 
  Layers, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Sliders, 
  Palette, 
  Maximize2, 
  Sun, 
  Grid, 
  Lock,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { consumePipelineItem } from "@/lib/pipeline";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ==========================================
// PRESET TYPES & OPTIONS
// ==========================================

export type DeviceType = "iphone-16-pro" | "macbook-pro" | "browser-glass" | "ipad-pro" | "dual-combo";
export type AspectRatio = "16:9" | "1:1" | "4:3" | "9:16";
export type BgTheme = "cosmic" | "cyber" | "spotlight" | "grid" | "transparent" | "custom";
export type AnglePreset = "flat" | "isometric" | "floating" | "custom";
export type ShadowDepth = "subtle" | "balanced" | "dramatic" | "none";

interface DeviceOption {
  id: DeviceType;
  name: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const DEVICE_OPTIONS: DeviceOption[] = [
  { id: "iphone-16-pro", name: "iPhone 16 Pro", badge: "MOBILE", icon: Smartphone, description: "Titanium Chassis · Dynamic Island" },
  { id: "macbook-pro", name: "MacBook Pro", badge: "LAPTOP", icon: Laptop, description: "Space Black M3/M4 · Display Notch" },
  { id: "browser-glass", name: "Glass Browser", badge: "WEB", icon: Globe, description: "Frosted macOS Window · Traffic Lights" },
  { id: "ipad-pro", name: "iPad Pro", badge: "TABLET", icon: Tablet, description: "Slim Bezel · Rounded Corners" },
  { id: "dual-combo", name: "Dual Showcase", badge: "COMBO", icon: Layers, description: "MacBook Pro + Angled iPhone" },
];

const ASPECT_RATIOS: { id: AspectRatio; label: string; desc: string; ratioStyle: string }[] = [
  { id: "16:9", label: "16:9", desc: "X / Twitter & Slides", ratioStyle: "aspect-[16/9]" },
  { id: "1:1", label: "1:1", desc: "Instagram & Square", ratioStyle: "aspect-square" },
  { id: "4:3", label: "4:3", desc: "Dribbble & Portfolio", ratioStyle: "aspect-[4/3]" },
  { id: "9:16", label: "9:16", desc: "Stories & TikTok", ratioStyle: "aspect-[9/16]" },
];

const BG_THEMES: { id: BgTheme; name: string; previewClass: string }[] = [
  { id: "cosmic", name: "Obsidian Cosmic", previewClass: "bg-gradient-to-br from-[#060814] via-[#0d1326] to-[#04060d]" },
  { id: "cyber", name: "Cyber Neon", previewClass: "bg-gradient-to-br from-[#1c0b33] via-[#0c132e] to-[#041a33]" },
  { id: "spotlight", name: "Studio Spotlight", previewClass: "bg-radial from-[#1e293b] via-[#0f172a] to-[#020617]" },
  { id: "grid", name: "Dark Grid", previewClass: "bg-[#090d16] bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px]" },
  { id: "transparent", name: "Transparent", previewClass: "bg-zinc-900 border border-dashed border-zinc-600" },
  { id: "custom", name: "Custom Color", previewClass: "bg-gradient-to-r from-cyan-500 to-indigo-600" },
];

// ==========================================
// BUILT-IN SAMPLE TEMPLATES (Zero-Load SVGs)
// ==========================================

const SAMPLE_TEMPLATES = [
  {
    id: "saas-dashboard",
    name: "SaaS Analytics",
    type: "desktop",
    color: "bg-cyan-500",
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" fill="%230a0d18">
      <rect width="1600" height="1000" fill="%23080b14"/>
      <rect x="0" y="0" width="1600" height="70" fill="%230f1322" stroke="%231e2640" stroke-width="1"/>
      <circle cx="45" cy="35" r="14" fill="%236366f1"/>
      <rect x="75" y="27" width="120" height="16" rx="8" fill="%23ffffff" fill-opacity="0.9"/>
      <rect x="230" y="22" width="280" height="26" rx="13" fill="%23181f33"/>
      <rect x="0" y="70" width="220" height="930" fill="%230c101c" stroke="%231a2238" stroke-width="1"/>
      <rect x="25" y="105" width="170" height="32" rx="8" fill="%236366f1" fill-opacity="0.2"/>
      <rect x="25" y="150" width="170" height="32" rx="8" fill="%23161d30"/>
      <rect x="25" y="195" width="170" height="32" rx="8" fill="%23161d30"/>
      <rect x="260" y="110" width="400" height="150" rx="16" fill="%23101626" stroke="%23222d4a" stroke-width="1.5"/>
      <text x="290" y="155" fill="%2394a3b8" font-family="sans-serif" font-size="16" font-weight="600">MONTHLY RECURRING REVENUE</text>
      <text x="290" y="215" fill="%23ffffff" font-family="sans-serif" font-size="42" font-weight="bold">$48,290.00</text>
      <rect x="690" y="110" width="400" height="150" rx="16" fill="%23101626" stroke="%23222d4a" stroke-width="1.5"/>
      <text x="720" y="155" fill="%2394a3b8" font-family="sans-serif" font-size="16" font-weight="600">ACTIVE SUBSCRIBERS</text>
      <text x="720" y="215" fill="%23ffffff" font-family="sans-serif" font-size="42" font-weight="bold">128,450</text>
      <rect x="1120" y="110" width="430" height="150" rx="16" fill="%23101626" stroke="%23222d4a" stroke-width="1.5"/>
      <text x="1150" y="155" fill="%2394a3b8" font-family="sans-serif" font-size="16" font-weight="600">CONVERSION RATE</text>
      <text x="1150" y="215" fill="%2306b6d4" font-family="sans-serif" font-size="42" font-weight="bold">5.84%</text>
      <rect x="260" y="295" width="1290" height="660" rx="20" fill="%23101626" stroke="%23222d4a" stroke-width="1.5"/>
      <text x="300" y="345" fill="%23ffffff" font-family="sans-serif" font-size="20" font-weight="bold">Revenue Trajectory</text>
      <path d="M 300 850 C 500 760, 650 820, 850 620 C 1050 420, 1250 540, 1500 390 L 1500 900 L 300 900 Z" fill="url(%23chartGrad)" fill-opacity="0.3"/>
      <path d="M 300 850 C 500 760, 650 820, 850 620 C 1050 420, 1250 540, 1500 390" fill="none" stroke="%2306b6d4" stroke-width="4"/>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%2306b6d4"/>
          <stop offset="100%" stop-color="%23080b14"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    id: "mobile-wallet",
    name: "Mobile Wallet",
    type: "mobile",
    color: "bg-fuchsia-500",
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1950" viewBox="0 0 900 1950" fill="%23070814">
      <rect width="900" height="1950" fill="%23080914"/>
      <text x="70" y="90" fill="%23ffffff" font-family="sans-serif" font-size="32" font-weight="bold">9:41</text>
      <circle cx="810" cy="80" r="14" fill="%23ffffff" fill-opacity="0.8"/>
      <circle cx="95" cy="200" r="45" fill="%238b5cf6"/>
      <text x="165" y="195" fill="%2394a3b8" font-family="sans-serif" font-size="28">Welcome back,</text>
      <text x="165" y="235" fill="%23ffffff" font-family="sans-serif" font-size="36" font-weight="bold">Alex Vance</text>
      <rect x="50" y="300" width="800" height="420" rx="36" fill="url(%23cardGrad)" stroke="%23a855f7" stroke-opacity="0.4" stroke-width="2"/>
      <text x="95" y="375" fill="%23cbd5e1" font-family="sans-serif" font-size="26">Total Portfolio Balance</text>
      <text x="95" y="475" fill="%23ffffff" font-family="sans-serif" font-size="74" font-weight="900">$34,920.50</text>
      <rect x="95" y="530" width="160" height="46" rx="23" fill="%2310b981" fill-opacity="0.25"/>
      <text x="120" y="562" fill="%2334d399" font-family="sans-serif" font-size="24" font-weight="bold">+14.2% today</text>
      <circle cx="170" cy="830" r="50" fill="%23181f33"/>
      <circle cx="355" cy="830" r="50" fill="%23181f33"/>
      <circle cx="545" cy="830" r="50" fill="%23181f33"/>
      <circle cx="730" cy="830" r="50" fill="%23181f33"/>
      <text x="60" y="980" fill="%23ffffff" font-family="sans-serif" font-size="36" font-weight="bold">Recent Transactions</text>
      <rect x="50" y="1030" width="800" height="150" rx="28" fill="%23111626" stroke="%231e263d" stroke-width="1.5"/>
      <circle cx="120" cy="1105" r="35" fill="%2310b981" fill-opacity="0.2"/>
      <text x="180" y="1095" fill="%23ffffff" font-family="sans-serif" font-size="32" font-weight="bold">Stripe Payout</text>
      <text x="180" y="1135" fill="%2394a3b8" font-family="sans-serif" font-size="24">Completed</text>
      <text x="650" y="1115" fill="%2334d399" font-family="sans-serif" font-size="34" font-weight="bold">+$1,450.00</text>
      <defs>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="%236366f1"/>
          <stop offset="100%" stop-color="%23ec4899"/>
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    id: "clean-landing",
    name: "Modern Landing",
    type: "desktop",
    color: "bg-emerald-500",
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" fill="%2306070b">
      <rect width="1600" height="1000" fill="%2306070b"/>
      <rect x="0" y="0" width="1600" height="90" fill="%230b0d14"/>
      <circle cx="100" cy="45" r="16" fill="%2310b981"/>
      <text x="135" y="52" fill="%23ffffff" font-family="sans-serif" font-size="22" font-weight="bold">VORTEX.AI</text>
      <rect x="620" y="200" width="360" height="42" rx="21" fill="%2310b981" fill-opacity="0.15" stroke="%2310b981" stroke-opacity="0.4"/>
      <text x="655" y="228" fill="%2334d399" font-family="sans-serif" font-size="16" font-weight="bold">NEW: VERSION 3.0 RELEASED</text>
      <text x="800" y="340" fill="%23ffffff" font-family="sans-serif" font-size="64" font-weight="900" text-anchor="middle">Ship Intelligent Apps Faster.</text>
      <text x="800" y="420" fill="%2394a3b8" font-family="sans-serif" font-size="24" text-anchor="middle">The all-in-one developer workspace designed for state of the art performance.</text>
      <rect x="640" y="480" width="200" height="60" rx="30" fill="%2310b981"/>
      <text x="685" y="518" fill="%23000000" font-family="sans-serif" font-size="18" font-weight="bold">Get Started</text>
      <rect x="860" y="480" width="200" height="60" rx="30" fill="%23171b26" stroke="%232e384d" stroke-width="1.5"/>
      <text x="910" y="518" fill="%23ffffff" font-family="sans-serif" font-size="18" font-weight="bold">Documentation</text>
    </svg>`,
  },
];

export default function DeviceMockupStudio() {
  // Main State
  const [image, setImage] = useState<string>(SAMPLE_TEMPLATES[0].url);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("iphone-16-pro");
  const [deviceColor, setDeviceColor] = useState<"dark" | "silver" | "natural">("dark");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [backgroundTheme, setBackgroundTheme] = useState<BgTheme>("cosmic");
  const [customBgColor, setCustomBgColor] = useState<string>("#0f172a");
  
  // 3D Angle & Perspective Controls
  const [anglePreset, setAnglePreset] = useState<AnglePreset>("isometric");
  const [tiltX, setTiltX] = useState<number>(10);
  const [tiltY, setTiltY] = useState<number>(-12);
  const [tiltZ, setTiltZ] = useState<number>(4);
  const [shadowDepth, setShadowDepth] = useState<ShadowDepth>("balanced");
  const [deviceScale, setDeviceScale] = useState<number>(0.92);
  const [showBadge, setShowBadge] = useState<boolean>(false);

  // Mobile Navigation Tabs
  const [mobileTab, setMobileTab] = useState<"stage" | "device" | "backdrop" | "angles">("stage");

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 2200);
  };

  // Status
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for pipeline imports
  useEffect(() => {
    const item = consumePipelineItem();
    if (item && item.url) {
      setImage(item.url);
      triggerToast("Imported image from pipeline");
    }
  }, []);

  // Update angles when preset changes
  const applyAnglePreset = (preset: AnglePreset) => {
    setAnglePreset(preset);
    if (preset === "flat") {
      setTiltX(0);
      setTiltY(0);
      setTiltZ(0);
    } else if (preset === "isometric") {
      setTiltX(12);
      setTiltY(-14);
      setTiltZ(4);
    } else if (preset === "floating") {
      setTiltX(8);
      setTiltY(0);
      setTiltZ(0);
    }
  };

  // Reset to default
  const handleReset = () => {
    setImage(SAMPLE_TEMPLATES[0].url);
    setSelectedDevice("iphone-16-pro");
    setDeviceColor("dark");
    setAspectRatio("16:9");
    setBackgroundTheme("cosmic");
    applyAnglePreset("isometric");
    setShadowDepth("balanced");
    setDeviceScale(0.92);
    setShowBadge(false);
    triggerToast("Studio stage reset to default");
  };

  // Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setImage(event.target.result);
          triggerToast("Screenshot loaded onto device");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag & drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setImage(event.target.result);
          triggerToast("Dropped screenshot loaded");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // HIGH-RESOLUTION CANVAS EXPORTER
  // ==========================================
  const renderOffscreenCanvas = useCallback(async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      let width = 2560;
      let height = 1440;
      if (aspectRatio === "1:1") {
        width = 2048;
        height = 2048;
      } else if (aspectRatio === "4:3") {
        width = 2400;
        height = 1800;
      } else if (aspectRatio === "9:16") {
        width = 1440;
        height = 2560;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));

      // 1. Draw Background
      if (backgroundTheme === "cosmic") {
        ctx.fillStyle = "#060814";
        ctx.fillRect(0, 0, width, height);
        const g1 = ctx.createRadialGradient(width * 0.15, height * 0.85, 10, width * 0.15, height * 0.85, width * 0.7);
        g1.addColorStop(0, "rgba(6, 182, 212, 0.22)");
        g1.addColorStop(1, "rgba(6, 182, 212, 0)");
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, width, height);
        const g2 = ctx.createRadialGradient(width * 0.85, height * 0.15, 10, width * 0.85, height * 0.15, width * 0.7);
        g2.addColorStop(0, "rgba(99, 102, 241, 0.28)");
        g2.addColorStop(1, "rgba(99, 102, 241, 0)");
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, width, height);
      } else if (backgroundTheme === "cyber") {
        const g = ctx.createLinearGradient(0, 0, width, height);
        g.addColorStop(0, "#180828");
        g.addColorStop(0.5, "#0b1126");
        g.addColorStop(1, "#031726");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      } else if (backgroundTheme === "spotlight") {
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, width, height);
        const g = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.55);
        g.addColorStop(0, "#1e293b");
        g.addColorStop(1, "#020617");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      } else if (backgroundTheme === "grid") {
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1.5;
        const step = 48;
        for (let x = 0; x < width; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      } else if (backgroundTheme === "custom") {
        ctx.fillStyle = customBgColor;
        ctx.fillRect(0, 0, width, height);
      } else if (backgroundTheme === "transparent") {
        ctx.clearRect(0, 0, width, height);
      }

      // 2. Load and Draw Screenshot Inside Device
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const cx = width / 2;
        const cy = height / 2;

        ctx.save();
        ctx.translate(cx, cy);

        const s = deviceScale;

        // Draw Shadows
        if (shadowDepth !== "none") {
          ctx.save();
          const blurAmount = shadowDepth === "dramatic" ? 140 : shadowDepth === "balanced" ? 85 : 45;
          ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
          ctx.shadowBlur = blurAmount;
          ctx.shadowOffsetY = shadowDepth === "dramatic" ? 65 : 35;
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          
          if (selectedDevice === "iphone-16-pro") {
            const dw = 580 * s;
            const dh = 1180 * s;
            ctx.beginPath();
            ctx.roundRect(-dw / 2, -dh / 2, dw, dh, 68 * s);
            ctx.fill();
          } else if (selectedDevice === "macbook-pro") {
            const dw = 1450 * s;
            const dh = 900 * s;
            ctx.beginPath();
            ctx.roundRect(-dw / 2, -dh / 2, dw, dh, 36 * s);
            ctx.fill();
          } else if (selectedDevice === "browser-glass") {
            const dw = 1400 * s;
            const dh = 860 * s;
            ctx.beginPath();
            ctx.roundRect(-dw / 2, -dh / 2, dw, dh, 28 * s);
            ctx.fill();
          } else if (selectedDevice === "ipad-pro") {
            const dw = 920 * s;
            const dh = 1240 * s;
            ctx.beginPath();
            ctx.roundRect(-dw / 2, -dh / 2, dw, dh, 48 * s);
            ctx.fill();
          } else if (selectedDevice === "dual-combo") {
            const dw = 1350 * s;
            const dh = 840 * s;
            ctx.beginPath();
            ctx.roundRect(-dw / 2, -dh / 2, dw, dh, 36 * s);
            ctx.fill();
          }
          ctx.restore();
        }

        // Draw Selected Device
        if (selectedDevice === "iphone-16-pro") {
          const dw = 580 * s;
          const dh = 1180 * s;
          const r = 68 * s;
          const bezel = 18 * s;

          ctx.fillStyle = deviceColor === "silver" ? "#d1d5db" : deviceColor === "natural" ? "#78716c" : "#18191f";
          ctx.beginPath();
          ctx.roundRect(-dw / 2, -dh / 2, dw, dh, r);
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          const sw = dw - bezel * 2;
          const sh = dh - bezel * 2;
          const sr = r - bezel / 2;

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(-sw / 2, -sh / 2, sw, sh, sr);
          ctx.clip();

          drawImageCover(ctx, img, -sw / 2, -sh / 2, sw, sh);

          const piw = 175 * s;
          const pih = 44 * s;
          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.roundRect(-piw / 2, -sh / 2 + 18 * s, piw, pih, pih / 2);
          ctx.fill();
          ctx.fillStyle = "#1e293b";
          ctx.beginPath();
          ctx.arc(piw / 2 - 28 * s, -sh / 2 + 18 * s + pih / 2, 7 * s, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        } else if (selectedDevice === "macbook-pro") {
          const dw = 1450 * s;
          const dh = 900 * s;
          const r = 32 * s;
          const bezel = 18 * s;

          ctx.fillStyle = "#121316";
          ctx.beginPath();
          ctx.roundRect(-dw / 2, -dh / 2, dw, dh, r);
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 2;
          ctx.stroke();

          const sw = dw - bezel * 2;
          const sh = dh - bezel * 2 - 40 * s;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(-sw / 2, -dh / 2 + bezel, sw, sh, 14 * s);
          ctx.clip();
          drawImageCover(ctx, img, -sw / 2, -dh / 2 + bezel, sw, sh);

          const nw = 120 * s;
          const nh = 26 * s;
          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.roundRect(-nw / 2, -dh / 2 + bezel, nw, nh, [0, 0, 10 * s, 10 * s]);
          ctx.fill();
          ctx.restore();

          const bw = dw + 90 * s;
          const bh = 36 * s;
          ctx.fillStyle = "#1c1d22";
          ctx.beginPath();
          ctx.roundRect(-bw / 2, dh / 2 - 20 * s, bw, bh, [4 * s, 4 * s, 18 * s, 18 * s]);
          ctx.fill();

          ctx.fillStyle = "#0a0a0c";
          ctx.beginPath();
          ctx.roundRect(-75 * s, dh / 2 - 20 * s, 150 * s, 8 * s, [0, 0, 8 * s, 8 * s]);
          ctx.fill();
        } else if (selectedDevice === "browser-glass") {
          const dw = 1400 * s;
          const dh = 860 * s;
          const r = 24 * s;
          const headerH = 58 * s;

          ctx.fillStyle = "#0c0e17";
          ctx.beginPath();
          ctx.roundRect(-dw / 2, -dh / 2, dw, dh, r);
          ctx.fill();

          ctx.fillStyle = "#121624";
          ctx.beginPath();
          ctx.roundRect(-dw / 2, -dh / 2, dw, headerH, [r, r, 0, 0]);
          ctx.fill();

          const tr = 8 * s;
          ctx.fillStyle = "#ff5f56";
          ctx.beginPath();
          ctx.arc(-dw / 2 + 30 * s, -dh / 2 + headerH / 2, tr, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffbd2e";
          ctx.beginPath();
          ctx.arc(-dw / 2 + 56 * s, -dh / 2 + headerH / 2, tr, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#27c93f";
          ctx.beginPath();
          ctx.arc(-dw / 2 + 82 * s, -dh / 2 + headerH / 2, tr, 0, Math.PI * 2);
          ctx.fill();

          const abW = 420 * s;
          const abH = 32 * s;
          ctx.fillStyle = "#1a2138";
          ctx.beginPath();
          ctx.roundRect(-abW / 2, -dh / 2 + (headerH - abH) / 2, abW, abH, 16 * s);
          ctx.fill();

          ctx.fillStyle = "#94a3b8";
          ctx.font = `bold ${14 * s}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("exismic.xyz/preview", 0, -dh / 2 + headerH / 2);

          const sw = dw;
          const sh = dh - headerH;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(-sw / 2, -dh / 2 + headerH, sw, sh, [0, 0, r, r]);
          ctx.clip();
          drawImageCover(ctx, img, -sw / 2, -dh / 2 + headerH, sw, sh);
          ctx.restore();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-dw / 2, -dh / 2, dw, dh, r);
          ctx.stroke();
        } else if (selectedDevice === "ipad-pro") {
          const dw = 920 * s;
          const dh = 1240 * s;
          const r = 44 * s;
          const bezel = 24 * s;

          ctx.fillStyle = "#15161b";
          ctx.beginPath();
          ctx.roundRect(-dw / 2, -dh / 2, dw, dh, r);
          ctx.fill();

          const sw = dw - bezel * 2;
          const sh = dh - bezel * 2;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(-sw / 2, -sh / 2, sw, sh, r - 12 * s);
          ctx.clip();
          drawImageCover(ctx, img, -sw / 2, -sh / 2, sw, sh);
          ctx.restore();

          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.arc(0, -dh / 2 + bezel / 2, 5 * s, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-dw / 2, -dh / 2, dw, dh, r);
          ctx.stroke();
        } else if (selectedDevice === "dual-combo") {
          const mw = 1200 * s;
          const mh = 750 * s;
          const mx = -140 * s;
          const my = -60 * s;

          ctx.fillStyle = "#121316";
          ctx.beginPath();
          ctx.roundRect(mx - mw / 2, my - mh / 2, mw, mh, 28 * s);
          ctx.fill();

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(mx - mw / 2 + 16 * s, my - mh / 2 + 16 * s, mw - 32 * s, mh - 58 * s, 12 * s);
          ctx.clip();
          drawImageCover(ctx, img, mx - mw / 2 + 16 * s, my - mh / 2 + 16 * s, mw - 32 * s, mh - 58 * s);
          ctx.restore();

          ctx.fillStyle = "#1c1d22";
          ctx.beginPath();
          ctx.roundRect(mx - (mw + 60 * s) / 2, my + mh / 2 - 20 * s, mw + 60 * s, 32 * s, [4 * s, 4 * s, 16 * s, 16 * s]);
          ctx.fill();

          const pw = 420 * s;
          const ph = 860 * s;
          const px = 380 * s;
          const py = 120 * s;

          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.75)";
          ctx.shadowBlur = 60 * s;
          ctx.shadowOffsetY = 25 * s;
          ctx.fillStyle = "#18191f";
          ctx.beginPath();
          ctx.roundRect(px - pw / 2, py - ph / 2, pw, ph, 52 * s);
          ctx.fill();
          ctx.restore();

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(px - pw / 2 + 14 * s, py - ph / 2 + 14 * s, pw - 28 * s, ph - 28 * s, 42 * s);
          ctx.clip();
          drawImageCover(ctx, img, px - pw / 2 + 14 * s, py - ph / 2 + 14 * s, pw - 28 * s, ph - 28 * s);

          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.roundRect(px - 65 * s, py - ph / 2 + 22 * s, 130 * s, 32 * s, 16 * s);
          ctx.fill();
          ctx.restore();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(px - pw / 2, py - ph / 2, pw, ph, 52 * s);
          ctx.stroke();
        }

        // Watermark badge
        if (showBadge) {
          const bw = 240 * s;
          const bh = 44 * s;
          const bx = width / 2 - bw - 40;
          const by = height / 2 - bh - 35;
          ctx.fillStyle = "rgba(10, 14, 26, 0.85)";
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 22 * s);
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "#e2e8f0";
          ctx.font = `600 ${16 * s}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Made with Exismic", bx + bw / 2, by + bh / 2);
        }

        ctx.restore();

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to generate image blob"));
        }, "image/png");
      };

      img.onerror = () => reject(new Error("Failed to load image for mockup canvas"));
      img.src = image;
    });
  }, [image, selectedDevice, deviceColor, aspectRatio, backgroundTheme, customBgColor, shadowDepth, deviceScale, showBadge]);

  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;

    if (imgRatio > boxRatio) {
      sw = img.height * boxRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / boxRatio;
      sy = 0;
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  };

  // Export & Download
  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const blob = await renderOffscreenCanvas();
      const url = URL.createObjectURL(blob);
      setExportedUrl(url);

      const a = document.createElement("a");
      a.href = url;
      a.download = `exismic-mockup-${selectedDevice}-${aspectRatio.replace(":", "x")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      triggerToast("High-resolution PNG exported!");
    } catch (err) {
      console.error("Export failed:", err);
      triggerToast("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to Clipboard
  const handleCopy = async () => {
    try {
      setIsExporting(true);
      const blob = await renderOffscreenCanvas();
      if (typeof ClipboardItem !== "undefined") {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setIsCopied(true);
        triggerToast("Mockup image copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2400);
      }
    } catch (err) {
      console.error("Copy failed:", err);
      triggerToast("Failed to copy image to clipboard.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-8 pb-24 lg:pb-8">
      {/* Toast Notification (Safely below navbar) */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0a0f1d]/95 border border-cyan-500/40 text-cyan-200 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{toastMessage}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* =========================================================
          TOP ACTION TOOLBAR: UPLOAD + INSTANT DEMOS + QUICK ACTIONS
      ========================================================== */}
      <div className="rounded-2xl border border-white/[0.1] bg-[#090d1c]/90 backdrop-blur-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Upload Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload size={14} />
            <span>Upload Screenshot</span>
          </button>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">or drag & drop anywhere onto canvas</span>
        </div>

        {/* Center: Instant Demo Loaders */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Try Demo:</span>
          {SAMPLE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setImage(tpl.url);
                if (tpl.type === "mobile") setSelectedDevice("iphone-16-pro");
                else setSelectedDevice("macbook-pro");
                triggerToast(`Loaded demo: ${tpl.name}`);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-400/40 text-zinc-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <div className={cn("w-2 h-2 rounded-full", tpl.color)} />
              <span>{tpl.name}</span>
            </button>
          ))}
        </div>

        {/* Right: Reset Button */}
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
          title="Reset to Default"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* MOBILE SEGMENTED TABS (Strict 320px - 430px Friendly) */}
      <div className="flex lg:hidden items-center p-1 rounded-xl bg-[#090c17] border border-white/[0.08]">
        <button
          onClick={() => setMobileTab("stage")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "stage"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Stage</span>
        </button>
        <button
          onClick={() => setMobileTab("device")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "device"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Device</span>
        </button>
        <button
          onClick={() => setMobileTab("backdrop")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "backdrop"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Backdrop</span>
        </button>
        <button
          onClick={() => setMobileTab("angles")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
            mobileTab === "angles"
              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>3D Angles</span>
        </button>
      </div>

      {/* =========================================================
          MAIN CENTERPIECE: 3D VIEWPORT STAGE WITH QUICK BAR
      ========================================================== */}
      <div
        className={cn(
          "relative rounded-3xl border border-white/[0.12] bg-[#05060d] shadow-2xl overflow-hidden flex flex-col",
          mobileTab !== "stage" && "hidden lg:flex"
        )}
      >
        {/* Stage Header Controls */}
        <div className="relative z-20 px-5 py-3.5 border-b border-white/[0.08] bg-[#080b18]/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">Canvas:</span>
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => setAspectRatio(ratio.id)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  aspectRatio === ratio.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    : "bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]"
                )}
              >
                {ratio.label}
              </button>
            ))}
          </div>

          {/* Quick Angle Preset Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">Angle:</span>
            {[
              { id: "flat", label: "Flat 2D" },
              { id: "isometric", label: "3D Isometric" },
              { id: "floating", label: "Floating" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyAnglePreset(p.id as AnglePreset)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  anglePreset === p.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    : "bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive 3D Stage Viewport */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "relative w-full flex items-center justify-center p-6 sm:p-12 min-h-[500px] sm:min-h-[580px] transition-all",
            isDragOver && "ring-4 ring-cyan-400 ring-inset bg-cyan-500/10"
          )}
        >
          {/* Backdrop Atmosphere */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 pointer-events-none",
              backgroundTheme === "cosmic" && "bg-gradient-to-br from-[#060814] via-[#090d1f] to-[#030408]",
              backgroundTheme === "cyber" && "bg-gradient-to-br from-[#180828] via-[#0b1126] to-[#031726]",
              backgroundTheme === "spotlight" && "bg-radial from-[#1e293b] via-[#0f172a] to-[#020617]",
              backgroundTheme === "grid" && "bg-[#090d16] bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]",
              backgroundTheme === "transparent" && "bg-[linear-gradient(45deg,#131317_25%,transparent_25%),linear-gradient(-45deg,#131317_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#131317_75%),linear-gradient(-45deg,transparent_75%,#131317_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]"
            )}
            style={backgroundTheme === "custom" ? { backgroundColor: customBgColor } : undefined}
          >
            {backgroundTheme === "cosmic" && (
              <>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
              </>
            )}
          </div>

          {/* 3D Scene Wrapper */}
          <div
            className={cn(
              "relative z-10 w-full flex items-center justify-center transition-transform duration-200",
              ASPECT_RATIOS.find((r) => r.id === aspectRatio)?.ratioStyle
            )}
            style={{ perspective: "1200px" }}
          >
            <motion.div
              animate={{
                rotateX: tiltX,
                rotateY: tiltY,
                rotateZ: tiltZ,
                scale: deviceScale,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className={cn(
                "relative transform-gpu flex items-center justify-center select-none",
                shadowDepth === "dramatic" && "drop-shadow-[0_50px_60px_rgba(0,0,0,0.85)]",
                shadowDepth === "balanced" && "drop-shadow-[0_35px_45px_rgba(0,0,0,0.65)]",
                shadowDepth === "subtle" && "drop-shadow-[0_15px_25px_rgba(0,0,0,0.45)]"
              )}
            >
              {/* 1. IPHONE 16 PRO */}
              {selectedDevice === "iphone-16-pro" && (
                <div
                  className={cn(
                    "relative w-[280px] sm:w-[320px] aspect-[9/19.5] rounded-[48px] p-3 border-2 shadow-2xl transition-colors",
                    deviceColor === "silver"
                      ? "bg-[#d1d5db] border-white/60"
                      : deviceColor === "natural"
                      ? "bg-[#78716c] border-[#a8a29e]/50"
                      : "bg-[#18191f] border-white/[0.18]"
                  )}
                >
                  <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-black flex flex-col">
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-black z-30 flex items-center justify-between px-2 shadow-md">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0a0f1d] border border-white/10" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]/40" />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt="Mobile Mockup Preview"
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />
                  </div>
                </div>
              )}

              {/* 2. MACBOOK PRO */}
              {selectedDevice === "macbook-pro" && (
                <div className="relative flex flex-col items-center w-[360px] sm:w-[540px] md:w-[620px]">
                  <div className="relative w-full aspect-[16/10] rounded-2xl p-2.5 bg-[#121316] border border-white/[0.15] shadow-2xl">
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 rounded-b-xl bg-black z-30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#1e293b]" />
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt="MacBook Mockup Preview"
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
                    </div>
                  </div>
                  <div className="relative -mt-1 w-[108%] h-3.5 sm:h-5 rounded-b-2xl bg-[#1c1d22] border-t border-white/[0.1] shadow-lg flex justify-center">
                    <div className="w-16 h-1.5 rounded-b-md bg-[#0a0a0c]" />
                  </div>
                </div>
              )}

              {/* 3. GLASS BROWSER */}
              {selectedDevice === "browser-glass" && (
                <div className="relative w-[360px] sm:w-[520px] md:w-[600px] aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.16] bg-[#0c0e17] shadow-2xl flex flex-col">
                  <div className="h-10 px-4 bg-[#121624] border-b border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="px-6 py-1 rounded-full bg-[#1a2138] text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 border border-white/[0.06]">
                      <Lock size={10} className="text-emerald-400" />
                      <span>exismic.xyz/preview</span>
                    </div>
                    <div className="w-12" />
                  </div>
                  <div className="relative flex-1 bg-black overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt="Browser Mockup Preview"
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  </div>
                </div>
              )}

              {/* 4. IPAD PRO */}
              {selectedDevice === "ipad-pro" && (
                <div className="relative w-[320px] sm:w-[440px] aspect-[3/4] rounded-[36px] p-3.5 bg-[#15161b] border-2 border-white/[0.15] shadow-2xl">
                  <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-black flex flex-col">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black z-30" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt="iPad Mockup Preview"
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  </div>
                </div>
              )}

              {/* 5. DUAL SHOWCASE */}
              {selectedDevice === "dual-combo" && (
                <div className="relative flex items-center justify-center w-[360px] sm:w-[580px]">
                  <div className="relative w-[85%] aspect-[16/10] rounded-2xl p-2 bg-[#121316] border border-white/[0.15] shadow-2xl opacity-95">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt="MacBook Preview"
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    </div>
                    <div className="relative -mt-0.5 -mx-3 h-3 rounded-b-xl bg-[#1c1d22] flex justify-center">
                      <div className="w-12 h-1 rounded-b bg-[#0a0a0c]" />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-2 sm:-right-4 w-[140px] sm:w-[190px] aspect-[9/19.5] rounded-[32px] p-2 bg-[#18191f] border-2 border-white/[0.22] shadow-[0_25px_35px_rgba(0,0,0,0.9)] z-40 transform translate-y-2">
                    <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-black">
                      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-3.5 rounded-full bg-black z-30" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt="iPhone Preview"
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MASTER CUSTOMIZER DECK: 3 CRISP OBSIDIAN CARDS
      ========================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: DEVICE SELECTION */}
        <div className={cn("rounded-2xl border border-white/[0.1] bg-[#080b18]/90 backdrop-blur-2xl p-5 shadow-xl space-y-4", mobileTab !== "device" && "hidden lg:block")}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Laptop size={14} />
              <span>1. Choose Device</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {DEVICE_OPTIONS.find((d) => d.id === selectedDevice)?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {DEVICE_OPTIONS.map((dev) => {
              const Icon = dev.icon;
              const isSelected = selectedDevice === dev.id;
              return (
                <button
                  key={dev.id}
                  onClick={() => setSelectedDevice(dev.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group cursor-pointer",
                    isSelected
                      ? "bg-cyan-500/15 border-cyan-400/80 text-white shadow-[0_0_18px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/50"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.15] text-zinc-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      isSelected ? "bg-cyan-500/25 text-cyan-300 shadow-inner" : "bg-white/[0.05] text-zinc-400 group-hover:text-zinc-200"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">{dev.name}</div>
                      <div className="text-[10px] text-zinc-400">{dev.description}</div>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                    isSelected ? "bg-cyan-500/25 text-cyan-200" : "bg-white/[0.05] text-zinc-400"
                  )}>
                    {dev.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bezel finish selector for iPhone */}
          {selectedDevice === "iphone-16-pro" && (
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-300">Titanium Finish:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: "dark", label: "Black", color: "bg-[#18191f]" },
                  { id: "natural", label: "Natural", color: "bg-[#78716c]" },
                  { id: "silver", label: "Silver", color: "bg-[#d1d5db]" },
                ].map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setDeviceColor(color.id as "dark" | "silver" | "natural")}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer",
                      deviceColor === color.id
                        ? "border-cyan-400 text-white bg-cyan-500/20"
                        : "border-white/[0.08] text-zinc-400 hover:text-zinc-200 bg-white/[0.02]"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", color.color)} />
                    <span>{color.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CARD 2: STUDIO LIGHTING & BACKDROPS */}
        <div className={cn("rounded-2xl border border-white/[0.1] bg-[#080b18]/90 backdrop-blur-2xl p-5 shadow-xl space-y-4", mobileTab !== "backdrop" && "hidden lg:block")}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Palette size={14} />
              <span>2. Studio Backdrop</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {BG_THEMES.find((t) => t.id === backgroundTheme)?.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {BG_THEMES.map((theme) => {
              const isSelected = backgroundTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setBackgroundTheme(theme.id)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all flex flex-col gap-2 group cursor-pointer",
                    isSelected
                      ? "border-cyan-400/80 bg-cyan-500/15 text-white ring-1 ring-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.18)]"
                      : "border-white/[0.06] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.05] text-zinc-300"
                  )}
                >
                  <div className={cn("w-full h-10 rounded-lg border border-white/10 shadow-inner", theme.previewClass)} />
                  <span className="text-[11px] font-bold leading-tight group-hover:text-cyan-200 transition-colors">{theme.name}</span>
                </button>
              );
            })}
          </div>

          {backgroundTheme === "custom" && (
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-zinc-300">Pick Custom Color:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-zinc-300 font-bold">{customBgColor}</span>
              </div>
            </div>
          )}
        </div>

        {/* CARD 3: 3D ANGLE & PERSPECTIVE */}
        <div className={cn("rounded-2xl border border-white/[0.1] bg-[#080b18]/90 backdrop-blur-2xl p-5 shadow-xl space-y-4", mobileTab !== "angles" && "hidden lg:block")}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Sliders size={14} />
              <span>3. 3D Angle & Lighting</span>
            </span>
            <button
              onClick={() => applyAnglePreset("flat")}
              className="text-[11px] font-semibold text-zinc-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          </div>

          {/* Tactile Sliders */}
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-zinc-300 mb-1.5">
                <span>Vertical Tilt (X):</span>
                <span className="text-cyan-400 font-mono font-bold">{tiltX}°</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={tiltX}
                onChange={(e) => {
                  setTiltX(Number(e.target.value));
                  setAnglePreset("custom");
                }}
                className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-zinc-300 mb-1.5">
                <span>Horizontal Rotation (Y):</span>
                <span className="text-cyan-400 font-mono font-bold">{tiltY}°</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={tiltY}
                onChange={(e) => {
                  setTiltY(Number(e.target.value));
                  setAnglePreset("custom");
                }}
                className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-zinc-300 mb-1.5">
                <span>Device Zoom / Scale:</span>
                <span className="text-cyan-400 font-mono font-bold">{Math.round(deviceScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="115"
                value={Math.round(deviceScale * 100)}
                onChange={(e) => setDeviceScale(Number(e.target.value) / 100)}
                className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Shadow Depth Selector */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-300">Shadow Depth:</span>
            <div className="flex items-center gap-1">
              {(["subtle", "balanced", "dramatic", "none"] as ShadowDepth[]).map((depth) => (
                <button
                  key={depth}
                  onClick={() => setShadowDepth(depth)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer",
                    shadowDepth === depth
                      ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 bg-white/[0.02]"
                  )}
                >
                  {depth}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          PRIMARY EXPORT HUB (HIGH-RES PNG & CLIPBOARD)
      ========================================================== */}
      <div className="rounded-2xl border border-white/[0.12] bg-gradient-to-r from-[#080c1d] via-[#0b1226] to-[#080c1d] p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Main Download Button */}
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 sm:flex-initial px-8 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_45px_rgba(6,182,212,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isExporting ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Rendering 4K Studio Image...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Download High-Res PNG</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={isExporting}
            className="px-5 py-4 rounded-2xl font-bold text-sm bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white hover:text-cyan-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            title="Copy Image to Clipboard"
          >
            {isCopied ? (
              <>
                <Check size={18} className="text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={18} />
                <span>Copy Image</span>
              </>
            )}
          </button>
        </div>

        {/* Watermark Tactile Toggle Card */}
        <button
          type="button"
          onClick={() => setShowBadge(!showBadge)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer select-none",
            showBadge
              ? "bg-cyan-500/15 border-cyan-400/60 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
          )}
        >
          <div
            className={cn(
              "w-4 h-4 rounded flex items-center justify-center border transition-all",
              showBadge
                ? "bg-cyan-500 border-cyan-400 text-black shadow-sm"
                : "border-white/30 bg-black/40"
            )}
          >
            {showBadge && <Check size={11} className="stroke-[3]" />}
          </div>
          <span className="text-xs font-semibold">
            Include &quot;Made with Exismic&quot; badge
          </span>
        </button>
      </div>

      {/* MOBILE FLOATING ACTION HUD (Fixed 1-Tap Export on Mobile) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-50 flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#080b18]/95 border border-white/[0.15] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold text-zinc-200 truncate max-w-[110px]">
            {DEVICE_OPTIONS.find((d) => d.id === selectedDevice)?.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            disabled={isExporting}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.12] text-white flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{isCopied ? "Copied" : "Copy"}</span>
          </button>
          
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-indigo-600 text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            {isExporting ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            <span>{isExporting ? "Rendering..." : "Download"}</span>
          </button>
        </div>
      </div>

      {/* Media Pipeline Bar */}
      {image && (
        <div className="pt-2">
          <MediaPipelineBar
            imageUrl={exportedUrl || image}
            imageName="mockup-design.png"
            sourceToolId="device-mockup"
            sourceToolName="3D Mockup Studio"
            actions={["compressor", "converter", "resizer", "eraser"]}
          />
        </div>
      )}
    </div>
  );
}
