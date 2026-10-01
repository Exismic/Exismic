"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Monitor,
  Smartphone,
  ScanEye,
  Grid3X3,
  Contrast,
  RefreshCw,
  Palette,
  ShieldAlert,
  Flame,
  Check,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RealAnalysisResult {
  score: number;
  width: number;
  height: number;
  is16by9: boolean;
  contrastScore: number;
  saturationPercent: number;
  brightnessPercent: number;
  focalPoint: string;
  brBlockedRisk: boolean;
  tips: { type: "success" | "warning" | "error" | "info"; title: string; text: string }[];
}

type SamplePresetKey = "tech" | "story" | "low_contrast";

interface SamplePreset {
  id: SamplePresetKey;
  label: string;
  category: string;
  description: string;
}

const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "tech",
    label: "High-Contrast Tech",
    category: "Optimal",
    description: "Crisp white & yellow text on deep obsidian with safe timestamp zone."
  },
  {
    id: "story",
    label: "Vibrant Story",
    category: "High CTR",
    description: "Warm gradient background with bold emotional headline."
  },
  {
    id: "low_contrast",
    label: "Low-Contrast Mistake",
    category: "Needs Fix",
    description: "Subtle dark colors and text blocked by YouTube duration badge."
  }
];

export default function ThumbnailAnalyzer() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RealAnalysisResult | null>(null);
  const [previewTab, setPreviewTab] = useState<"desktop" | "mobile">("desktop");
  const [simulatedTitle, setSimulatedTitle] = useState("I Built a $10,000 AI Agent in 24 Hours!");
  const [simulatedChannel, setSimulatedChannel] = useState("TechCreator");
  const [selectedPreset, setSelectedPreset] = useState<SamplePresetKey | null>("tech");

  // Visual Inspection Overlays
  const [showTimestampZone, setShowTimestampZone] = useState(true);
  const [showRuleOfThirds, setShowRuleOfThirds] = useState(false);
  const [isGrayscaleTest, setIsGrayscaleTest] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real Image Analysis using HTML5 Canvas Pixel Inspection
  const processImageAnalysis = useCallback((imgElement: HTMLImageElement) => {
    try {
      const canvas = document.createElement("canvas");
      const width = imgElement.naturalWidth || imgElement.width || 1280;
      const height = imgElement.naturalHeight || imgElement.height || 720;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(imgElement, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // 1. Aspect Ratio check
      const aspectRatio = width / height;
      const is16by9 = Math.abs(aspectRatio - 16 / 9) < 0.15;

      // 2. Pixel Luminance, Saturation, Quadrants
      let totalLuminance = 0;
      let totalSaturation = 0;
      const luminances: number[] = [];

      const quadCounts = [0, 0, 0, 0];
      const quadEdge = [0, 0, 0, 0];

      const halfW = width / 2;
      const halfH = height / 2;

      // Fast adaptive pixel sampling
      const step = 4;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Perceived Luminance (standard Rec. 601)
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += luma;
          luminances.push(luma);

          // Color Saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / 255;
          totalSaturation += sat;

          // Quadrant calculation (0: TL, 1: TR, 2: BL, 3: BR)
          const qIdx = (y < halfH ? 0 : 2) + (x < halfW ? 0 : 1);
          quadCounts[qIdx]++;

          // Local edge differential
          if (x + step < width) {
            const r2 = data[idx + step * 4];
            const g2 = data[idx + step * 4 + 1];
            const b2 = data[idx + step * 4 + 2];
            const luma2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;
            quadEdge[qIdx] += Math.abs(luma - luma2);
          }
        }
      }

      const sampleCount = luminances.length || 1;
      const avgLuma = totalLuminance / sampleCount;
      const avgSat = totalSaturation / sampleCount;

      // Standard deviation of luminance = Real visual contrast
      let sumSqDiff = 0;
      for (let i = 0; i < sampleCount; i++) {
        sumSqDiff += Math.pow(luminances[i] - avgLuma, 2);
      }
      const stdDevLuma = Math.sqrt(sumSqDiff / sampleCount);

      // Normalized Metrics
      const contrastScore = Math.min(100, Math.round((stdDevLuma / 75) * 100));
      const saturationPercent = Math.min(100, Math.round(avgSat * 100));
      const brightnessPercent = Math.min(100, Math.round((avgLuma / 255) * 100));

      // Bottom Right YouTube Duration Badge Risk Check
      const brEdgeDensity = quadCounts[3] > 0 ? quadEdge[3] / quadCounts[3] : 0;
      const brBlockedRisk = brEdgeDensity > 24;

      // Focal point estimation
      const maxEdgeQuad = quadEdge.indexOf(Math.max(...quadEdge));
      const quadNames = ["Top-Left", "Top-Right", "Bottom-Left", "Bottom-Right"];
      const focalPoint = quadNames[maxEdgeQuad];

      // Dynamic Click Potential Score
      let score = 50;

      // Visual Contrast Evaluation (+25 / -15)
      if (stdDevLuma >= 45 && stdDevLuma <= 85) score += 25;
      else if (stdDevLuma >= 30) score += 12;
      else score -= 15;

      // Color Vibrancy (+18 / -10)
      if (saturationPercent >= 35) score += 18;
      else if (saturationPercent >= 20) score += 10;
      else score -= 10;

      // 16:9 Standard Resolution (+15 / -15)
      if (is16by9 && width >= 1280) score += 15;
      else if (is16by9 && width >= 640) score += 10;
      else if (!is16by9) score -= 15;

      // Timestamp Safe Zone Check (+12 / -12)
      if (brBlockedRisk) score -= 12;
      else score += 12;

      // Exposure Balance (+10 / -10)
      if (avgLuma >= 60 && avgLuma <= 200) score += 10;
      else score -= 10;

      score = Math.min(98, Math.max(25, score));

      // Friendly, Plain-English Recommendations
      const tips: { type: "success" | "warning" | "error" | "info"; title: string; text: string }[] = [];

      // Aspect Ratio Feedback
      if (!is16by9) {
        tips.push({
          type: "warning",
          title: "Non-Standard Aspect Ratio",
          text: `Aspect ratio is ${aspectRatio.toFixed(2)}:1. Standard YouTube thumbnails display best in 16:9 widescreen (1280x720).`
        });
      } else {
        tips.push({
          type: "success",
          title: "Standard 16:9 Format",
          text: `Matches YouTube standard widescreen (${width}x${height}px). No black bars will appear in feeds.`
        });
      }

      // Contrast & Readability Feedback
      if (stdDevLuma < 35) {
        tips.push({
          type: "error",
          title: "Low Visual Contrast",
          text: `Contrast score is low (${contrastScore}%). Brighten highlights or darken the background so text pops on mobile screens.`
        });
      } else {
        tips.push({
          type: "success",
          title: "Strong Visual Contrast",
          text: `High contrast (${contrastScore}%). Key text and focal elements pop cleanly against dark and light YouTube feeds.`
        });
      }

      // Color Vibrancy Feedback
      if (saturationPercent < 22) {
        tips.push({
          type: "warning",
          title: "Muted Colors",
          text: `Color vibrancy is low (${saturationPercent}%). Add saturated accent colors (yellow, cyan, orange) to catch scrollers' eyes.`
        });
      } else {
        tips.push({
          type: "success",
          title: "Eye-Catching Colors",
          text: `Vibrant color saturation (${saturationPercent}%). Colors look rich without feeling blown out.`
        });
      }

      // Timestamp Safe Zone Feedback
      if (brBlockedRisk) {
        tips.push({
          type: "error",
          title: "Timestamp Danger Zone",
          text: "Important details or text in the bottom-right corner will be covered by YouTube's video duration badge (e.g. 12:45)!"
        });
      } else {
        tips.push({
          type: "success",
          title: "Safe Timestamp Zone",
          text: "Bottom-right corner is clear. YouTube's duration badge will not obscure key faces or titles."
        });
      }

      // Focal Region Tip
      tips.push({
        type: "info",
        title: `Main Focus: ${focalPoint}`,
        text: `The viewer's eye is naturally drawn toward the ${focalPoint} section of your thumbnail.`
      });

      setAnalysisResult({
        score,
        width,
        height,
        is16by9,
        contrastScore,
        saturationPercent,
        brightnessPercent,
        focalPoint,
        brBlockedRisk,
        tips
      });
    } catch (err) {
      console.error("Canvas analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Generate Sample Preset Thumbnails dynamically on canvas
  const loadPresetThumbnail = useCallback((presetKey: SamplePresetKey) => {
    setSelectedPreset(presetKey);
    setIsAnalyzing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (presetKey === "tech") {
        setSimulatedTitle("I Built a $10,000 AI Agent in 24 Hours!");
        setSimulatedChannel("TechCreator");

        // Deep cyber obsidian gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 1280, 720);
        bgGrad.addColorStop(0, "#070814");
        bgGrad.addColorStop(0.5, "#131535");
        bgGrad.addColorStop(1, "#282566");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1280, 720);

        // Ambient radial glow behind main focal point
        const radGrad = ctx.createRadialGradient(920, 360, 40, 920, 360, 480);
        radGrad.addColorStop(0, "rgba(99, 102, 241, 0.55)");
        radGrad.addColorStop(0.7, "rgba(6, 182, 212, 0.2)");
        radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(920, 360, 480, 0, Math.PI * 2);
        ctx.fill();

        // High contrast text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 78px sans-serif";
        ctx.fillText("I BUILT A $10,000", 80, 260);

        ctx.fillStyle = "#818cf8";
        ctx.font = "900 94px sans-serif";
        ctx.fillText("AI AGENT", 80, 375);

        ctx.fillStyle = "#facc15";
        ctx.font = "bold 68px sans-serif";
        ctx.fillText("IN 24 HOURS!", 80, 480);
      } else if (presetKey === "story") {
        setSimulatedTitle("Why I Quit My $250k Google Job at 28");
        setSimulatedChannel("CreatorDiary");

        // Rich sunset violet to crimson gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 1280, 720);
        bgGrad.addColorStop(0, "#2e0854");
        bgGrad.addColorStop(0.5, "#701a75");
        bgGrad.addColorStop(1, "#991b1b");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1280, 720);

        // Circular glow
        const glow = ctx.createRadialGradient(400, 360, 30, 400, 360, 500);
        glow.addColorStop(0, "rgba(250, 204, 21, 0.35)");
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 1280, 720);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 84px sans-serif";
        ctx.fillText("WHY I QUIT MY", 80, 250);

        ctx.fillStyle = "#facc15";
        ctx.font = "900 102px sans-serif";
        ctx.fillText("$250,000", 80, 370);

        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 72px sans-serif";
        ctx.fillText("TECH CAREER", 80, 475);
      } else {
        // Low contrast mistake
        setSimulatedTitle("Episode 4: Talking About Modern Software Frameworks");
        setSimulatedChannel("RandomShow");

        // Dull gray on gray
        ctx.fillStyle = "#1e2026";
        ctx.fillRect(0, 0, 1280, 720);

        ctx.fillStyle = "#2d313b";
        ctx.fillRect(50, 50, 1180, 620);

        ctx.fillStyle = "#4b5563";
        ctx.font = "bold 56px sans-serif";
        ctx.fillText("Episode 4:", 100, 260);
        ctx.fillText("Software Frameworks", 100, 350);

        // Clutter in bottom right that gets blocked by timestamp!
        ctx.fillStyle = "#ef4444";
        ctx.font = "900 68px sans-serif";
        ctx.fillText("MUST WATCH!!", 780, 660);
      }

      const demoUrl = canvas.toDataURL("image/png");
      setImageSrc(demoUrl);

      const img = new Image();
      img.src = demoUrl;
      img.onload = () => {
        processImageAnalysis(img);
      };
    } catch {
      setIsAnalyzing(false);
    }
  }, [processImageAnalysis]);

  // Load initial tech preset on mount
  useEffect(() => {
    loadPresetThumbnail("tech");
  }, [loadPresetThumbnail]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedPreset(null);
    setIsAnalyzing(true);
    const url = URL.createObjectURL(file);
    setImageSrc(url);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      processImageAnalysis(img);
    };
  };

  // Grade calculator
  const getGrade = (score: number) => {
    if (score >= 88) return "A+";
    if (score >= 76) return "A";
    if (score >= 60) return "B";
    if (score >= 45) return "C";
    return "D";
  };

  const grade = analysisResult ? getGrade(analysisResult.score) : "N/A";

  return (
    <div className="w-full space-y-7 text-zinc-100">
      {/* 1-Click Sample Thumbnails Strip */}
      <div className="rounded-3xl border border-indigo-500/20 bg-[#0a0c16]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(99,102,241,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Test Thumbnail Presets
              </span>
              <p className="text-[11px] text-zinc-400 font-medium">
                Try 1-click sample thumbnails or upload your own to test real CTR metrics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Your Image</span>
          </button>
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPresetThumbnail(preset.id)}
                className={cn(
                  "flex flex-col items-start justify-between text-left p-3.5 rounded-2xl transition-all duration-200 border cursor-pointer",
                  isSelected
                    ? "bg-indigo-600/25 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)] text-white"
                    : "bg-[#0c0e18] border-white/10 text-zinc-300 hover:border-indigo-500/40 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <div className="w-full flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                      preset.id === "tech" && "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
                      preset.id === "story" && "bg-amber-500/15 text-amber-300 border border-amber-500/30",
                      preset.id === "low_contrast" && "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    )}
                  >
                    {preset.category}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-indigo-300 shrink-0" />}
                </div>
                <span className="text-xs font-bold text-white">{preset.label}</span>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid: Canvas Workspace vs Analytics & Feed Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Thumbnail Canvas & Inspection Tools */}
        <div className="lg:col-span-7 space-y-5 rounded-3xl border border-indigo-500/20 bg-[#0a0c16]/90 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_25px_rgba(99,102,241,0.06)]">
          {/* Header & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                <ScanEye className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                Thumbnail Canvas & Inspector
              </span>
            </div>

            <div className="flex items-center gap-2">
              {imageSrc && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready for Feed</span>
                </span>
              )}
            </div>
          </div>

          {/* Interactive Inspection Canvas Display */}
          <div className="relative rounded-2xl bg-black/70 border border-white/10 p-3 sm:p-4 overflow-hidden group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {imageSrc ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-white/10 shadow-2xl flex items-center justify-center">
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Thumbnail inspect preview"
                  className={cn(
                    "w-full h-full object-cover transition-all duration-300",
                    isGrayscaleTest && "grayscale contrast-125"
                  )}
                />

                {/* Rule of Thirds Composition Grid Overlay */}
                {showRuleOfThirds && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-20">
                    <div className="border-r border-b border-cyan-400/40" />
                    <div className="border-r border-b border-cyan-400/40" />
                    <div className="border-b border-cyan-400/40" />
                    <div className="border-r border-b border-cyan-400/40" />
                    <div className="border-r border-b border-cyan-400/40" />
                    <div className="border-b border-cyan-400/40" />
                    <div className="border-r border-cyan-400/40" />
                    <div className="border-r border-cyan-400/40" />
                    <div />
                  </div>
                )}

                {/* YouTube Video Duration Badge Danger Zone Overlay */}
                {showTimestampZone && (
                  <div className="absolute bottom-2 right-2 z-30 flex flex-col items-end">
                    <div
                      className={cn(
                        "px-2 py-0.5 rounded text-[11px] font-black shadow-lg border flex items-center gap-1",
                        analysisResult?.brBlockedRisk
                          ? "bg-rose-600 text-white border-rose-400 animate-pulse"
                          : "bg-black/90 text-white border-white/20"
                      )}
                    >
                      <span>12:45</span>
                    </div>
                    {analysisResult?.brBlockedRisk && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-300 bg-rose-950/90 px-1.5 py-0.5 rounded mt-1 border border-rose-500/40 shadow-md">
                        Danger Zone Blocked
                      </span>
                    )}
                  </div>
                )}

                {/* Focal Point Indicator Crosshair */}
                {analysisResult && (
                  <div
                    className={cn(
                      "absolute pointer-events-none z-20 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/80 text-cyan-300 border border-cyan-500/40 backdrop-blur-sm shadow-lg",
                      analysisResult.focalPoint === "Top-Left" && "top-3 left-3",
                      analysisResult.focalPoint === "Top-Right" && "top-3 right-3",
                      analysisResult.focalPoint === "Bottom-Left" && "bottom-3 left-3",
                      analysisResult.focalPoint === "Bottom-Right" && "bottom-12 right-3"
                    )}
                  >
                    Focus Point: {analysisResult.focalPoint}
                  </div>
                )}

                {/* Analyzing Overlay Spinner */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-40">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Measuring Pixel Luminance & Contrast...
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-400 flex flex-col items-center justify-center gap-3 p-6 text-center cursor-pointer transition-all bg-black/40"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Click to upload your 16:9 thumbnail</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Supports PNG, JPG, and WEBP (1280x720 recommended)</p>
                </div>
              </div>
            )}

            {/* Quick Inspection Mode Toolbar Directly Under Canvas */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 mt-3 text-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                Visual Inspection Overlays
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowTimestampZone(!showTimestampZone)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    showTimestampZone
                      ? "bg-indigo-600/30 border-indigo-400 text-white"
                      : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  )}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Duration Badge</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRuleOfThirds(!showRuleOfThirds)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    showRuleOfThirds
                      ? "bg-cyan-600/30 border-cyan-400 text-white"
                      : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  )}
                >
                  <Grid3X3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Rule of Thirds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGrayscaleTest(!isGrayscaleTest)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    isGrayscaleTest
                      ? "bg-amber-600/30 border-amber-400 text-white"
                      : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  )}
                  title="Squint test: checks if thumbnail has high contrast even without color"
                >
                  <Contrast className="w-3.5 h-3.5 text-amber-400" />
                  <span>B&W Contrast Test</span>
                </button>
              </div>
            </div>
          </div>

          {/* Video Preview Details Inputs */}
          <div className="space-y-3 pt-2">
            <span className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">
              Video Preview Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Video Title</label>
                <input
                  type="text"
                  value={simulatedTitle}
                  onChange={(e) => setSimulatedTitle(e.target.value)}
                  placeholder="Enter video title..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500/80 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold block mb-1">Channel Name</label>
                <input
                  type="text"
                  value={simulatedChannel}
                  onChange={(e) => setSimulatedChannel(e.target.value)}
                  placeholder="Enter channel name..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500/80 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Click Potential Score & Realistic YouTube Feed Card */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          {/* Click Potential Score Card */}
          <div className="rounded-3xl border border-indigo-500/20 bg-[#0a0c16]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_25px_rgba(99,102,241,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                    Estimated Click Score
                  </span>
                  <p className="text-[11px] text-zinc-400 font-medium">Predicted browse feed pop</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider border",
                    analysisResult && analysisResult.score >= 85
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                      : analysisResult && analysisResult.score >= 70
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                      : analysisResult && analysisResult.score >= 50
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  )}
                >
                  Grade {grade}
                </span>
                <span
                  className={cn(
                    "text-2xl font-black tracking-tight",
                    analysisResult && analysisResult.score >= 75
                      ? "text-emerald-400"
                      : analysisResult && analysisResult.score >= 50
                      ? "text-amber-400"
                      : "text-rose-400"
                  )}
                >
                  {analysisResult?.score ?? 0}
                  <span className="text-xs text-zinc-500 font-normal"> / 100</span>
                </span>
              </div>
            </div>

            {/* Score Progress Meter */}
            <div className="space-y-1.5">
              <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    analysisResult && analysisResult.score >= 85
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      : analysisResult && analysisResult.score >= 60
                      ? "bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      : analysisResult && analysisResult.score >= 40
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                      : "bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                  )}
                  style={{ width: `${Math.max(5, analysisResult?.score ?? 0)}%` }}
                />
              </div>
            </div>

            {/* Metric Chips Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-xs">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Contrast</span>
                <span className="text-white font-bold text-sm">{analysisResult?.contrastScore ?? 0}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-xs">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Vibrancy</span>
                <span className="text-white font-bold text-sm">{analysisResult?.saturationPercent ?? 0}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-xs">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Focus Point</span>
                <span className="text-indigo-300 font-bold text-xs truncate block">{analysisResult?.focalPoint ?? "Center"}</span>
              </div>
            </div>

            {/* Actionable Feedback Recommendations List */}
            <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
              {analysisResult?.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-black/50 border border-white/10"
                >
                  {tip.type === "success" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {tip.type === "warning" && (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  {tip.type === "error" && (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  {tip.type === "info" && (
                    <ScanEye className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{tip.title}</span>
                    <span className="text-zinc-300 leading-snug">{tip.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* YouTube Feed Live Simulator Card */}
          <div className="rounded-3xl border border-indigo-500/20 bg-[#0a0c16]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_25px_rgba(99,102,241,0.06)] flex-1 flex flex-col justify-between space-y-4">
            {/* Header & Device Switcher */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                    YouTube Feed Preview
                  </span>
                  <p className="text-[11px] text-zinc-400 font-medium">How viewers see your video</p>
                </div>
              </div>

              {/* Desktop vs Mobile Toggle */}
              <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewTab("desktop")}
                  className={cn(
                    "p-1.5 rounded-lg text-xs transition-all cursor-pointer",
                    previewTab === "desktop"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                  title="Desktop Feed View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("mobile")}
                  className={cn(
                    "p-1.5 rounded-lg text-xs transition-all cursor-pointer",
                    previewTab === "mobile"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                  title="Mobile App Feed View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Authentic YouTube Feed Video Card */}
            <div
              className={cn(
                "mx-auto w-full transition-all duration-300 bg-[#0e111a] border border-white/10 rounded-2xl p-3.5 shadow-2xl space-y-3",
                previewTab === "mobile" ? "max-w-xs" : "w-full"
              )}
            >
              <div className="relative rounded-xl overflow-hidden aspect-video bg-neutral-900 border border-white/10 shadow-md">
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt="Feed thumbnail"
                    className={cn(
                      "w-full h-full object-cover",
                      isGrayscaleTest && "grayscale contrast-125"
                    )}
                  />
                )}
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/90 text-white font-bold text-[10px] shadow">
                  12:45
                </div>
              </div>

              <div className="flex gap-3 items-start pt-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 shrink-0 font-black text-white text-xs flex items-center justify-center shadow-md border border-indigo-400/40">
                  {simulatedChannel.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {simulatedTitle}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                    <span>{simulatedChannel}</span>
                    <span>•</span>
                    <span>142K views</span>
                    <span>•</span>
                    <span>2 days ago</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
