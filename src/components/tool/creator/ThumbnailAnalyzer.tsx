"use client";

import React, { useState, useRef } from "react";
import {
  ImageIcon,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Monitor,
  Smartphone,
  Sparkles,
  Zap,
  Info,
  RefreshCw,
  Layers,
  Maximize2
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
  tips: string[];
}

export default function ThumbnailAnalyzer() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RealAnalysisResult | null>(null);
  const [previewTab, setPreviewTab] = useState<"desktop" | "mobile">("desktop");
  const [simulatedTitle, setSimulatedTitle] = useState("I Built a $10,000 AI Agent in 24 Hours!");
  const [simulatedChannel, setSimulatedChannel] = useState("TechCreator");

  const imgRef = useRef<HTMLImageElement>(null);

  // Real Image Analysis using HTML5 Canvas Pixel Inspection
  const processImageAnalysis = (imgElement: HTMLImageElement) => {
    try {
      const canvas = document.createElement("canvas");
      const width = imgElement.naturalWidth || imgElement.width || 640;
      const height = imgElement.naturalHeight || imgElement.height || 360;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(imgElement, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // 1. Aspect Ratio
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

      // Sample pixels
      const step = 4;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Luminance
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += luma;
          luminances.push(luma);

          // Saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / 255;
          totalSaturation += sat;

          // Quadrant (0: TL, 1: TR, 2: BL, 3: BR)
          const qIdx = (y < halfH ? 0 : 2) + (x < halfW ? 0 : 1);
          quadCounts[qIdx]++;

          // Simple edge differential with neighbor
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

      // Normalize Metrics
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

      // Dynamic CTR Score Calculation based on Real Canvas Data
      let score = 50;

      // Contrast (+20 / -15)
      if (stdDevLuma >= 45 && stdDevLuma <= 85) score += 20;
      else if (stdDevLuma >= 30) score += 10;
      else score -= 15;

      // Saturation (+15 / -10)
      if (saturationPercent >= 35) score += 15;
      else if (saturationPercent >= 20) score += 10;
      else score -= 10;

      // Resolution & 16:9 (+15 / -15)
      if (is16by9 && width >= 1280) score += 15;
      else if (is16by9 && width >= 640) score += 10;
      else if (!is16by9) score -= 15;

      // YouTube Badge overlay check (+10 / -10)
      if (brBlockedRisk) score -= 10;
      else score += 10;

      // Brightness (+10 / -10)
      if (avgLuma >= 60 && avgLuma <= 200) score += 10;
      else score -= 10;

      score = Math.min(99, Math.max(15, score));

      // Generate Data-Driven Tips
      const tips: string[] = [];

      if (!is16by9) {
        tips.push(`Aspect ratio is ${aspectRatio.toFixed(2)}:1. Standard YouTube thumbnails require a 16:9 ratio (1280x720).`);
      } else {
        tips.push(`Correct 16:9 aspect ratio (${width}x${height}px).`);
      }

      if (stdDevLuma < 35) {
        tips.push(`Low visual contrast detected (${contrastScore}%). Brighten highlights or darken the background so elements pop on dark mode feeds.`);
      } else {
        tips.push(`High visual contrast (${contrastScore}%). Key elements stand out clearly against background.`);
      }

      if (saturationPercent < 25) {
        tips.push(`Low color vibrancy (${saturationPercent}%). Boost saturation or introduce warm accent colors (yellow, orange, red).`);
      } else {
        tips.push(`Good color saturation (${saturationPercent}% vibrancy).`);
      }

      if (brBlockedRisk) {
        tips.push(`⚠️ Warning: High detail detected in Bottom-Right quadrant. YouTube's video duration badge (e.g. 12:45) will obscure this content!`);
      } else {
        tips.push(`Bottom-Right corner is clean. Won't be blocked by YouTube's duration timestamp badge.`);
      }

      if (width < 1280) {
        tips.push(`Image resolution (${width}x${height}px) is below YouTube's recommended 1280x720 HD standard.`);
      }

      tips.push(`Primary visual focal point detected in the ${focalPoint} region.`);

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
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Banner Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/50 via-purple-950/30 to-neutral-950 border border-rose-500/20 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <Eye className="w-3.5 h-3.5" /> Computer Vision Thumbnail Analyzer
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          YouTube Thumbnail CTR & Pixel Contrast Analyzer
        </h1>
        <p className="text-neutral-300 text-sm sm:text-base max-w-2xl leading-relaxed">
          Upload any thumbnail to run real-time HTML5 Canvas pixel analysis measuring visual contrast, color vibrancy, resolution, focal point density, and YouTube duration badge overlap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload & Settings Column */}
        <div className="lg:col-span-6 space-y-4 p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-rose-400" /> Upload 16:9 Thumbnail Image
            </label>
            {imageSrc && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Image Loaded
              </span>
            )}
          </div>

          {/* Upload Drop Area */}
          <div className="relative border-2 border-dashed border-neutral-700 hover:border-rose-500/80 rounded-2xl p-6 transition-all text-center bg-neutral-950 flex flex-col items-center justify-center min-h-[280px] group cursor-pointer overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
            />
            {imageSrc ? (
              <div className="relative w-full group/img">
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Thumbnail preview"
                  className="w-full h-auto max-h-[240px] object-contain rounded-xl shadow-2xl border border-neutral-800"
                />
                {/* YouTube Badge Overlay Indicator */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/90 text-white font-bold text-xs shadow-md border border-neutral-700 flex items-center gap-1 z-10">
                  12:45
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-rose-400 group-hover:scale-110 transition-transform shadow-lg">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Click or drag thumbnail image here</p>
                  <p className="text-xs text-neutral-400 mt-1">Supports PNG, JPG, WEBP (Recommended: 1280x720)</p>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30">
                <RefreshCw className="w-8 h-8 text-rose-400 animate-spin" />
                <p className="text-xs font-bold text-white uppercase tracking-wider">Running Pixel & Luminance Scan...</p>
              </div>
            )}
          </div>

          {/* Test Controls */}
          <div className="space-y-3 pt-3 border-t border-neutral-800/80">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              Simulated YouTube Feed Card Settings
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={simulatedTitle}
                onChange={(e) => setSimulatedTitle(e.target.value)}
                placeholder="Video Title..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-rose-500"
              />
              <input
                type="text"
                value={simulatedChannel}
                onChange={(e) => setSimulatedChannel(e.target.value)}
                placeholder="Channel Name..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Real Analysis Output & Feed Simulator Column */}
        <div className="lg:col-span-6 space-y-4 flex flex-col">
          {analysisResult ? (
            <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl space-y-6 flex-1">
              {/* CTR Score Header */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Calculated Thumbnail Score
                  </span>
                  <div className="text-3xl font-black flex items-center gap-2 mt-1">
                    <span
                      className={cn(
                        analysisResult.score >= 75
                          ? "text-emerald-400"
                          : analysisResult.score >= 50
                          ? "text-amber-400"
                          : "text-rose-400"
                      )}
                    >
                      {analysisResult.score}%
                    </span>
                    <span className="text-xs font-semibold text-neutral-400">
                      {analysisResult.score >= 80
                        ? "Excellent Feed Pop"
                        : analysisResult.score >= 60
                        ? "Average CTR Potential"
                        : "Low Contrast / Needs Tweaks"}
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl border flex items-center justify-center font-black text-xl shadow-lg",
                    analysisResult.score >= 80
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : analysisResult.score >= 60
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  )}
                >
                  {analysisResult.score >= 85 ? "A+" : analysisResult.score >= 70 ? "B" : "C"}
                </div>
              </div>

              {/* Real Measured Pixel Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
                  <span className="text-neutral-500 block">Visual Contrast</span>
                  <span className="text-white font-bold text-sm">{analysisResult.contrastScore}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
                  <span className="text-neutral-500 block">Color Saturation</span>
                  <span className="text-white font-bold text-sm">{analysisResult.saturationPercent}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
                  <span className="text-neutral-500 block">Focal Region</span>
                  <span className="text-rose-400 font-bold text-xs truncate">{analysisResult.focalPoint}</span>
                </div>
              </div>

              {/* Data-Driven Tips List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Empirical Analysis Insights
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {analysisResult.tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80"
                    >
                      {tip.includes("⚠️") || tip.includes("Low") ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-neutral-300 leading-snug">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* YouTube Feed Card Mockup */}
              <div className="pt-3 border-t border-neutral-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    YouTube Dark Feed Mockup
                  </span>
                  <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                    <button
                      onClick={() => setPreviewTab("desktop")}
                      className={cn(
                        "p-1 rounded-lg text-xs transition-all",
                        previewTab === "desktop" ? "bg-neutral-800 text-rose-400" : "text-neutral-500"
                      )}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewTab("mobile")}
                      className={cn(
                        "p-1 rounded-lg text-xs transition-all",
                        previewTab === "mobile" ? "bg-neutral-800 text-rose-400" : "text-neutral-500"
                      )}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* YouTube Feed Item */}
                <div
                  className={cn(
                    "mx-auto rounded-2xl bg-neutral-950 p-3 border border-neutral-800 shadow-xl space-y-3 transition-all",
                    previewTab === "mobile" ? "max-w-xs" : "w-full"
                  )}
                >
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-neutral-900 border border-neutral-800">
                    {imageSrc && (
                      <img src={imageSrc} alt="Feed thumbnail" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/90 text-white font-bold text-[10px]">
                      12:45
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 shrink-0 font-bold text-white text-xs flex items-center justify-center shadow-md">
                      {simulatedChannel.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                        {simulatedTitle}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-1">{simulatedChannel} • 142K views • 2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl flex-1 flex flex-col items-center justify-center text-center text-neutral-500 min-h-[400px] space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-700">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="text-sm font-bold text-neutral-300">No Image Uploaded Yet</h4>
                <p className="text-xs text-neutral-500">
                  Upload any thumbnail on the left. The tool will render it on a hidden HTML5 canvas to measure real visual contrast, color saturation, and YouTube duration badge risks.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
