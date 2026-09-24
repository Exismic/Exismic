"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Sliders, 
  Smartphone, 
  CreditCard, 
  Frame, 
  AlertCircle,
  Zap,
  Palette,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Eye,
  RefreshCw,
  HelpCircle,
  ScanLine
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useCredits } from "@/hooks/useCredits";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { 
  QR_BLUEPRINTS, 
  type QrBlueprint 
} from "./qr-generator-blueprints";

type MockupType = "none" | "phone" | "card" | "frame";

const STYLE_CHIPS = [
  { name: "Cyberpunk Neon", prompt: "A futuristic cyberpunk cityscape at night, glowing holographic neon signs, electric cyan circuit paths, wet reflective asphalt, 8k render." },
  { name: "Gold Marble Luxury", prompt: "Luxury geometric obsidian marble mosaic with polished 24k gold leaf inlays, royal art deco pattern, warm specular reflections, 8k." },
  { name: "Steampunk Brass", prompt: "Intricate steampunk clockwork mechanism with golden brass gears, copper steam pipes, antique pocket watch aesthetic, metallic reflections." },
  { name: "Emerald Sanctuary", prompt: "Ancient lush mossy forest shrine with blooming emerald flora, gentle sunbeams through dense canopy, ethereal fantasy landscape." },
  { name: "Japanese Sumi Ink", prompt: "Traditional Japanese ukiyo-e woodblock print with black sumi ink washes, Mount Fuji in misty clouds, dramatic scarlet sun." },
  { name: "Retro Synthwave", prompt: "Retro 80s synthwave horizon with glowing wireframe grid, purple chrome sunset, palm silhouettes, and VHS aesthetic." }
];

const TOOL_COST = 15;

export default function QrGenerator() {
  const { credits, deductCredits, setShowUpsell } = useCredits();

  // Active blueprint: default to Blueprint 0 so stage is never empty
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(
    QR_BLUEPRINTS[0].id
  );
  const [url, setUrl] = useState<string>(QR_BLUEPRINTS[0].url);
  const [prompt, setPrompt] = useState<string>(QR_BLUEPRINTS[0].prompt);
  const [scannability, setScannability] = useState<number>(QR_BLUEPRINTS[0].scannability);
  const [activeMockup, setActiveMockup] = useState<MockupType>("none");

  // Custom generated image result
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [activeSeed, setActiveSeed] = useState<number | null>(null);

  // In-flight generation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // Current active image to display in mockups
  const activeImage = customImage || (
    QR_BLUEPRINTS.find((b) => b.id === selectedBlueprintId)?.previewUrl || QR_BLUEPRINTS[0].previewUrl
  );

  const handleSelectBlueprint = (blueprint: QrBlueprint) => {
    setSelectedBlueprintId(blueprint.id);
    setUrl(blueprint.url);
    setPrompt(blueprint.prompt);
    setScannability(blueprint.scannability);
    setCustomImage(null);
    setError(null);
  };

  const handleStyleChipClick = (chipPrompt: string) => {
    setPrompt(chipPrompt);
    setError(null);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setError(null);
      }
    } catch {
      // Fallback
    }
  };

  const simulateProgress = () => {
    setProgress(10);
    setStatusMessage("Setting up your link...");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        if (prev > 75) {
          setStatusMessage("Checking camera readability...");
          return prev + 1;
        }
        if (prev > 45) {
          setStatusMessage("Blending artwork into your QR code...");
          return prev + 2;
        }
        if (prev > 20) {
          setStatusMessage("Drawing your custom art style...");
          return prev + 4;
        }
        return prev + 5;
      });
    }, 450);

    return interval;
  };

  const handleGenerate = async () => {
    if (!url.trim() || !prompt.trim()) return;

    if (credits < TOOL_COST) {
      setShowUpsell(true);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    const progressInterval = simulateProgress();

    try {
      const response = await axios.post("/api/tools/ai/qr-generator", {
        url: url.trim(),
        prompt: prompt.trim(),
        conditioningScale: scannability,
        strength: 0.9,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage("Your QR code is ready!");

      setCustomImage(response.data.image);
      setActiveSeed(response.data.seed);
      setSelectedBlueprintId("custom");

      if (deductCredits) {
        deductCredits(TOOL_COST);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("[QrGenerator Error]:", err);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Could not generate your QR code. Please try again in a moment.";
      setError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!activeImage) return;
    try {
      const res = await fetch(activeImage);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy text
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!activeImage) return;
    const link = document.createElement("a");
    link.href = activeImage;
    link.download = `artistic-qrcode-${selectedBlueprintId}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-12">
      {/* Symmetrical Dual-Pane Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Pane: Link & Art Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0d14]/90 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Studio Header Badge */}
            <div className="flex items-center justify-between border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Artistic QR Studio
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Transform links into stunning, camera-scannable artwork
                  </p>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready to Create</span>
              </div>
            </div>

            {/* Target Link Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Target Link or Text to Open
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePasteClipboard}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Paste Link
                  </button>
                  {url && (
                    <button
                      onClick={() => setUrl("")}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 font-medium transition cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="relative flex items-center">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://yourwebsite.com"
                  className="w-full h-14 bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-2xl px-4 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/10 transition-all font-medium shadow-inner"
                />
              </div>
            </div>

            {/* Visual Art Prompt Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Artistic Style Description
                </label>
                {prompt && (
                  <button
                    onClick={() => setPrompt("")}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-medium transition cursor-pointer"
                  >
                    Clear Text
                  </button>
                )}
              </div>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setError(null);
                  }}
                  rows={3}
                  placeholder="Describe your art style (e.g. 'Cyberpunk Tokyo street with neon signs' or 'Steampunk brass clockwork gears')..."
                  className="w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-2xl p-4 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/10 transition-all resize-none font-medium leading-relaxed custom-scrollbar shadow-inner"
                />
              </div>
            </div>

            {/* Quick Style Chips */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                Popular Art Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_CHIPS.map((chip) => (
                  <button
                    key={chip.name}
                    onClick={() => handleStyleChipClick(chip.prompt)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-semibold text-zinc-400 hover:text-white hover:border-amber-500/30 hover:bg-amber-500/5 transition cursor-pointer"
                  >
                    {chip.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Instant Demonstration Blueprints ($0 Previews) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Instant Demonstration Blueprints ($0 Free Previews)
                </span>
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                  Click to preview
                </span>
              </div>

              <div className="space-y-2.5">
                {QR_BLUEPRINTS.map((bp) => {
                  const isSelected = selectedBlueprintId === bp.id;
                  return (
                    <button
                      key={bp.id}
                      onClick={() => handleSelectBlueprint(bp)}
                      className={cn(
                        "w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative group flex items-center justify-between gap-3",
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.15)] text-white"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200 hover:bg-white/[0.04]"
                      )}
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black border border-white/10 shadow-sm p-1 flex items-center justify-center">
                          <img
                            src={bp.previewUrl}
                            alt={bp.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-300"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs sm:text-sm font-bold text-white truncate">
                              {bp.name}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0",
                                isSelected
                                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                  : "bg-white/5 text-zinc-400 border border-white/5"
                              )}
                            >
                              {bp.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate leading-relaxed">
                            {bp.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Right: Active Badge */}
                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" /> Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 group-hover:text-amber-300 group-hover:border-amber-500/30 text-[10px] font-bold uppercase tracking-wider transition">
                            Preview $0
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scannability vs Art Slider */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Scannability vs Art Balance
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {scannability >= 1.25 ? "High Scannability" : scannability >= 1.1 ? "Balanced Blend" : "Maximum Art"}
                </span>
              </div>

              <input
                type="range"
                min="0.85"
                max="1.45"
                step="0.05"
                value={scannability}
                onChange={(e) => setScannability(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <div className="flex items-center justify-between text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">
                <span>More Artistic Blend</span>
                <span>Easier Camera Scan</span>
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="space-y-0.5">
                  <div className="font-bold uppercase tracking-wider text-[10px]">Notice</div>
                  <div className="text-[11px] leading-relaxed text-zinc-300">{error}</div>
                </div>
              </div>
            )}

            {/* Generate Action Button */}
            <div className="pt-2 space-y-3">
              {credits >= TOOL_COST ? (
                <button
                  onClick={handleGenerate}
                  disabled={!url.trim() || !prompt.trim() || isProcessing}
                  className={cn(
                    "w-full flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-2xl",
                    "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-zinc-950 shadow-amber-500/30 active:scale-[0.98]",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  <QrCode className="w-4 h-4 text-zinc-950 fill-zinc-950/20 shrink-0" />
                  <span>
                    {isProcessing ? "Creating your QR code..." : "Generate Artistic QR Code"}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/25 text-zinc-950 text-[10px] font-black border border-black/10">
                    {TOOL_COST} Credits
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setShowUpsell(true)}
                  className="w-full flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-xl bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border-2 border-amber-500/70 hover:border-amber-400 hover:bg-amber-500/35 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.2)] active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="text-amber-200 font-black">
                    Refill Credits (Need {TOOL_COST})
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400/25 border border-amber-400/40 text-amber-200 text-[10px] font-black">
                    Costs {TOOL_COST} Credits
                  </span>
                </button>
              )}

              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-medium">
                <span>
                  Your balance: <strong className="text-white">{credits} Credits</strong>
                </span>
                {credits < TOOL_COST ? (
                  <button
                    onClick={() => setShowUpsell(true)}
                    className="text-amber-400 hover:text-amber-300 font-bold text-[10px] uppercase tracking-wider cursor-pointer transition underline underline-offset-2"
                  >
                    Get More Credits
                  </button>
                ) : (
                  <span className="text-zinc-500 text-[10px]">Instant High-Res PNG & SVG</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Pane: Live Mockup Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0c0d14]/90 border border-white/10 rounded-[2.5rem] p-5 sm:p-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-5">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Mockup Toolbar Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/5 pb-4">
              {/* Mockup Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-black/50 border border-white/10 p-1 rounded-xl w-full sm:w-auto">
                {[
                  { id: "none", name: "Standard Code", icon: QrCode },
                  { id: "phone", name: "Phone Screen", icon: Smartphone },
                  { id: "card", name: "Business Card", icon: CreditCard },
                  { id: "frame", name: "Wall Frame", icon: Frame }
                ].map((m) => {
                  const Icon = m.icon;
                  const isCurrent = activeMockup === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setActiveMockup(m.id as MockupType)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer",
                        isCurrent
                          ? "bg-amber-500/10 border border-amber-500/40 text-amber-300 shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy Image"}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Download className="w-3 h-3" />
                  Download PNG
                </button>
              </div>
            </div>

            {/* Mockup Display Canvas Stage */}
            <div className="min-h-[520px] rounded-2xl bg-black/80 border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden">
              
              {/* Scan Helper Tooltip Bar */}
              <div className="absolute top-4 inset-x-6 flex items-center justify-between text-[10px] text-zinc-500 z-10 pointer-events-none">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Camera Scannable Verified
                </span>
                <span className="font-mono text-zinc-500">
                  Target: {url.replace(/^https?:\/\//, "").slice(0, 24)}...
                </span>
              </div>

              {/* Mockup 1: Standard High-Res Artwork View */}
              {activeMockup === "none" && (
                <motion.div
                  key="standard"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="relative flex flex-col items-center justify-center p-6 my-auto"
                >
                  <div className="relative w-72 sm:w-80 h-72 sm:h-80 rounded-3xl overflow-hidden border-2 border-white/15 shadow-[0_0_50px_rgba(245,158,11,0.15)] bg-black p-3 group">
                    <img
                      src={activeImage}
                      alt="Artistic AI QR Code"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    {/* Corner Scanner Reticles */}
                    <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-amber-400/80 rounded-tl-lg pointer-events-none" />
                    <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-amber-400/80 rounded-tr-lg pointer-events-none" />
                    <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-amber-400/80 rounded-bl-lg pointer-events-none" />
                    <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-amber-400/80 rounded-br-lg pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium mt-4 text-center">
                    Point your smartphone camera to scan & verify live link
                  </p>
                </motion.div>
              )}

              {/* Mockup 2: Smartphone Screen View */}
              {activeMockup === "phone" && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-64 max-w-full h-[470px] bg-zinc-950 rounded-[2.6rem] border-4 border-zinc-800 shadow-2xl p-4 flex flex-col justify-between items-center text-center my-auto overflow-hidden"
                >
                  {/* Dynamic Island / Notch */}
                  <div className="w-20 h-4 bg-zinc-900 rounded-full mt-1 border border-white/5" />

                  {/* Detected Notification Pill */}
                  <div className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-white/10 text-left shadow-lg mt-2">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                      <ScanLine className="w-3 h-3" />
                      QR Code Link Detected
                    </div>
                    <div className="text-[10px] text-zinc-200 font-mono truncate mt-0.5">
                      {url}
                    </div>
                  </div>

                  {/* Centered QR Display */}
                  <div className="w-40 h-40 rounded-2xl overflow-hidden border border-white/15 shadow-xl my-auto p-1.5 bg-black">
                    <img src={activeImage} alt="QR Code on phone" className="w-full h-full object-cover rounded-xl" />
                  </div>

                  {/* Visit Action Button */}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 hover:brightness-110 transition"
                  >
                    <span>Open In Browser</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Home Indicator */}
                  <div className="w-24 h-1 bg-zinc-700 rounded-full mt-2" />
                </motion.div>
              )}

              {/* Mockup 3: Luxury Executive Business Card View */}
              {activeMockup === "card" && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#12141c] to-[#08090d] border border-amber-500/30 shadow-2xl p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden my-auto"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/[0.04] blur-2xl pointer-events-none" />

                  <div className="space-y-4 text-center sm:text-left">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em]">Exismic Executive</span>
                      <h4 className="text-base font-black uppercase tracking-wider text-white">Alexander Vance</h4>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Founder & Creative Lead</p>
                    </div>

                    <div className="space-y-1 text-[10px] text-zinc-400 font-medium">
                      <p>alexander@exismic.com</p>
                      <p className="font-mono text-zinc-500 truncate max-w-[200px]">{url}</p>
                    </div>
                  </div>

                  <div className="w-28 h-28 rounded-xl overflow-hidden border border-amber-500/30 shadow-xl shrink-0 bg-black p-1.5">
                    <img src={activeImage} alt="QR Code on business card" className="w-full h-full object-cover rounded-lg" />
                  </div>
                </motion.div>
              )}

              {/* Mockup 4: Framed Gallery Exhibition View */}
              {activeMockup === "frame" && (
                <motion.div
                  key="frame"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-72 sm:w-80 h-[420px] bg-zinc-950 rounded-xl shadow-2xl p-6 flex flex-col justify-between items-center border border-zinc-800 my-auto"
                >
                  {/* Spotlight shadow */}
                  <div className="w-full h-64 bg-zinc-900 p-4 border-8 border-zinc-900 shadow-2xl rounded-sm flex items-center justify-center">
                    <div className="w-full h-full rounded shadow-inner overflow-hidden bg-black p-2">
                      <img src={activeImage} alt="QR Code in frame" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Brass Plaque */}
                  <div className="text-center space-y-1 mt-4 p-2 bg-zinc-900 border border-amber-500/20 rounded-md w-full">
                    <h6 className="text-[9px] font-black uppercase tracking-widest text-amber-300">
                      Exismic Generative Gallery
                    </h6>
                    <p className="text-[8px] font-mono text-zinc-500 truncate">
                      {prompt.slice(0, 35)}...
                    </p>
                  </div>
                </motion.div>
              )}

            </div>

          </div>
        </div>

      </div>

      {/* Cloud Drive & Email Retention Bar */}
      <ResultRetentionBar
        toolType="qr-generator"
        toolName="Artistic AI QR Code"
        title="Artistic QR Code"
        fileUrl={activeImage}
        metadata={{ url, prompt, scannability }}
        downloadAction={handleDownload}
        downloadLabel="Download PNG"
        onCopy={handleCopy}
      />

      {/* Companion Creative Tools Pipeline */}
      <div className="bg-[#0c0d14]/70 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
              Creative Pipeline
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-white">
              Showcase Your QR Code With Companion Tools
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Render your QR art into 3D devices, social preview banners, and web packages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/tools/creator/device-mockup"
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.04] transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition flex items-center justify-between">
              <span>3D Device Mockup Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Place your artistic QR code into photorealistic iPhone 16 and MacBook 3D scenes.
            </p>
          </Link>

          <Link
            href="/tools/seo/og-banner"
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.04] transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition flex items-center justify-between">
              <span>OG Share Banner Maker</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create matching 1200x630 social preview banners for Twitter and LinkedIn.
            </p>
          </Link>

          <Link
            href="/tools/developer/favicon-studio"
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.04] transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
              <Palette className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition flex items-center justify-between">
              <span>Favicon Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generate matching multi-resolution browser favicons and Apple touch icons.
            </p>
          </Link>
        </div>
      </div>

      {/* In-Flight Processing Modal Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050608]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
              <QrCode className="absolute inset-0 m-auto w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3 max-w-md">
              {statusMessage}
            </h4>
            <div className="w-full max-w-sm h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-zinc-400 font-medium tracking-normal">
              Making your QR code beautiful and easy for phones to scan
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
