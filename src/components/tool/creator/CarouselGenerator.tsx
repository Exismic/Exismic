"use client";

import React, { useState, useRef } from "react";
import {
  Layers,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
  FileText,
  Palette,
  Layout,
  ArrowUp,
  ArrowDown,
  Wand2,
  Check,
  Share2,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

interface Slide {
  id: string;
  tag: string;
  title: string;
  body: string;
}

// Preset Topics for Instant AI Generation
const AI_PRESETS = [
  {
    topic: "5 AI Tools for High Output",
    slides: [
      { id: "1", tag: "SWIPE LEFT 👉", title: "5 AI Tools Every Creator Needs in 2026", body: "Save 20+ hours a week with these studio-grade utilities." },
      { id: "2", tag: "TOOL #1", title: "1. Automated Research & Briefs", body: "Extract insights from 50-page PDFs and YouTube transcripts in seconds." },
      { id: "3", tag: "TOOL #2", title: "2. Real-Time Vision Auditing", body: "Analyze thumbnail contrast & hook strength before publishing." },
      { id: "4", tag: "TOOL #3", title: "3. Smart Voice & SFX Isolation", body: "Separate vocals and ambient noise directly in your browser." },
      { id: "5", tag: "CONCLUSION", title: "Save & Share This Deck", body: "Follow @exismicai for daily tech & AI productivity breakdowns!" }
    ]
  },
  {
    topic: "How to Build a $10k Side Business",
    slides: [
      { id: "1", tag: "BLUEPRINT 💡", title: "How to Build a $10k/mo Side Business", body: "Without quitting your 9-to-5 or burning out." },
      { id: "2", tag: "STEP 1", title: "1. Solve One Painful Problem", body: "Focus on a hyper-specific audience willing to pay $100+ for a solution." },
      { id: "3", tag: "STEP 2", title: "2. Build an MVP in 48 Hours", body: "Use no-code tools and AI scripts. Don't over-engineer." },
      { id: "4", tag: "STEP 3", title: "3. Pre-Sell to 10 Early Customers", body: "Validate demand before writing custom backend infrastructure." },
      { id: "5", tag: "SUMMARY", title: "Execution > Ideas", body: "Bookmark this slide for your next weekend build sprint." }
    ]
  },
  {
    topic: "4 Principles of Clean UI Design",
    slides: [
      { id: "1", tag: "DESIGN SYSTEM 🎨", title: "4 Principles of Clean UI Design", body: "Transform amateur layouts into premium user experiences." },
      { id: "2", tag: "PRINCIPLE 1", title: "1. Generous Whitespace", body: "Give elements room to breathe. Clutter destroys visual hierarchy." },
      { id: "3", tag: "PRINCIPLE 2", title: "2. Limited Color Palette", body: "Use 1 dominant background, 1 neutral, and 1 vibrant accent color." },
      { id: "4", tag: "PRINCIPLE 3", title: "3. Strong Typographic Hierarchy", body: "Make titles bold and readable at a glance on mobile screens." },
      { id: "5", tag: "FINISH", title: "Level Up Your UI", body: "Repost this guide if you found it helpful!" }
    ]
  }
];

export default function CarouselGenerator() {
  const [slides, setSlides] = useState<Slide[]>(AI_PRESETS[0].slides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Design Customization State
  const [theme, setTheme] = useState<"rose" | "violet" | "emerald" | "amber" | "dark" | "light">("rose");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5">("4:5");
  const [brandingText, setBrandingText] = useState("@exismicai");
  const [authorName, setAuthorName] = useState("Exismic AI");

  // Export State
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      tag: `SLIDE #${slides.length + 1}`,
      title: `Key Takeaway #${slides.length}`,
      body: "Add your high-impact insights and actionable points here."
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    if (activeSlideIndex >= updated.length) setActiveSlideIndex(updated.length - 1);
  };

  const updateSlide = (index: number, field: keyof Slide, val: string) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: val };
    setSlides(updated);
  };

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= slides.length) return;
    const updated = [...slides];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setSlides(updated);
    setActiveSlideIndex(to);
  };

  // Canvas Drawing Engine for High-DPI Image Generation
  const drawSlideToCanvas = (
    slide: Slide,
    index: number,
    total: number
  ): HTMLCanvasElement => {
    const isPortrait = aspectRatio === "4:5";
    const width = 1080;
    const height = isPortrait ? 1350 : 1080;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // 1. Background Theme Gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (theme === "rose") {
      grad.addColorStop(0, "#1a0612");
      grad.addColorStop(0.6, "#0d0d12");
      grad.addColorStop(1, "#150520");
    } else if (theme === "violet") {
      grad.addColorStop(0, "#100624");
      grad.addColorStop(0.6, "#0d0d12");
      grad.addColorStop(1, "#180833");
    } else if (theme === "emerald") {
      grad.addColorStop(0, "#041a12");
      grad.addColorStop(0.6, "#080d0a");
      grad.addColorStop(1, "#07241a");
    } else if (theme === "amber") {
      grad.addColorStop(0, "#241404");
      grad.addColorStop(0.6, "#0d0b08");
      grad.addColorStop(1, "#1f1003");
    } else if (theme === "light") {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, "#f1f5f9");
    } else {
      // Dark
      grad.addColorStop(0, "#141417");
      grad.addColorStop(1, "#09090b");
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Accent Glow Circle
    const glowGrad = ctx.createRadialGradient(width * 0.85, height * 0.15, 50, width * 0.85, height * 0.15, 450);
    const accentHex =
      theme === "rose"
        ? "rgba(244, 63, 94, 0.15)"
        : theme === "violet"
        ? "rgba(139, 92, 246, 0.15)"
        : theme === "emerald"
        ? "rgba(16, 185, 129, 0.15)"
        : theme === "amber"
        ? "rgba(245, 158, 11, 0.15)"
        : theme === "light"
        ? "rgba(59, 130, 246, 0.08)"
        : "rgba(255, 255, 255, 0.08)";
    glowGrad.addColorStop(0, accentHex);
    glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    const isLight = theme === "light";
    const textColor = isLight ? "#0f172a" : "#ffffff";
    const bodyColor = isLight ? "#475569" : "#cbd5e1";
    const borderAccent =
      theme === "rose"
        ? "#f43f5e"
        : theme === "violet"
        ? "#8b5cf6"
        : theme === "emerald"
        ? "#10b981"
        : theme === "amber"
        ? "#f59e0b"
        : isLight
        ? "#2563eb"
        : "#a1a1aa";

    // 2. Header Tag & Author Info
    const pad = 90;

    // Tag Pill
    ctx.fillStyle = accentHex;
    ctx.strokeStyle = borderAccent;
    ctx.lineWidth = 3;
    const tagText = (slide.tag || `SLIDE ${index + 1}`).toUpperCase();
    ctx.font = "bold 28px sans-serif";
    const tagWidth = ctx.measureText(tagText).width + 48;
    const tagHeight = 56;

    // Round rect for Tag
    ctx.beginPath();
    ctx.roundRect(pad, pad, tagWidth, tagHeight, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = borderAccent;
    ctx.fillText(tagText, pad + 24, pad + 38);

    // Branding / Author Handle Right
    ctx.fillStyle = isLight ? "#64748b" : "#94a3b8";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(brandingText || "@yourhandle", width - pad, pad + 38);
    ctx.textAlign = "left";

    // 3. Title Text (Wrapped)
    ctx.fillStyle = textColor;
    ctx.font = "900 64px sans-serif";
    const maxTextWidth = width - pad * 2;

    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(" ");
      let line = "";
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + " ";
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
    };

    const titleStartY = height * 0.36;
    const bodyStartY = wrapText(slide.title, pad, titleStartY, maxTextWidth, 78);

    // 4. Body Text (Wrapped)
    ctx.fillStyle = bodyColor;
    ctx.font = "500 38px sans-serif";
    wrapText(slide.body, pad, bodyStartY + 20, maxTextWidth, 54);

    // 5. Footer Line & Slide Counter
    const footerY = height - pad;
    ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, footerY - 50);
    ctx.lineTo(width - pad, footerY - 50);
    ctx.stroke();

    ctx.font = "bold 26px monospace";
    ctx.fillStyle = isLight ? "#64748b" : "#71717a";
    ctx.fillText(`SLIDE ${index + 1} OF ${total}`, pad, footerY);

    ctx.textAlign = "right";
    ctx.fillText(index === total - 1 ? "FINISH 🏁" : "SWIPE 👉", width - pad, footerY);
    ctx.textAlign = "left";

    return canvas;
  };

  // Export LinkedIn PDF Document
  const exportAsPdf = async () => {
    setIsExportingPdf(true);
    setExportSuccessMsg(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < slides.length; i++) {
        const canvas = drawSlideToCanvas(slides[i], i, slides.length);
        const dataUrl = canvas.toDataURL("image/png");
        const pngImage = await pdfDoc.embedPng(dataUrl);

        const page = pdfDoc.addPage([canvas.width, canvas.height]);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `carousel-deck-${Date.now()}.pdf`;
      a.click();

      setExportSuccessMsg("Successfully downloaded multi-page LinkedIn Carousel PDF!");
    } catch (err) {
      console.error("PDF export error", err);
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setExportSuccessMsg(null), 4000);
    }
  };

  // Export Instagram PNG Zip Archive
  const exportAsZip = async () => {
    setIsExportingZip(true);
    setExportSuccessMsg(null);

    try {
      const zip = new JSZip();

      for (let i = 0; i < slides.length; i++) {
        const canvas = drawSlideToCanvas(slides[i], i, slides.length);
        const dataUrl = canvas.toDataURL("image/png");
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        zip.file(`slide-${i + 1}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);

      const a = document.createElement("a");
      a.href = url;
      a.download = `instagram-carousel-${Date.now()}.zip`;
      a.click();

      setExportSuccessMsg("Successfully downloaded Instagram carousel PNG images (.ZIP)!");
    } catch (err) {
      console.error("ZIP export error", err);
    } finally {
      setIsExportingZip(false);
      setTimeout(() => setExportSuccessMsg(null), 4000);
    }
  };

  const currentSlide = slides[activeSlideIndex] || slides[0];

  const themeStyles = {
    rose: "from-rose-950/90 via-neutral-900 to-purple-950/90 border-rose-500/30 text-rose-300",
    violet: "from-violet-950/90 via-neutral-900 to-indigo-950/90 border-violet-500/30 text-violet-300",
    emerald: "from-emerald-950/90 via-neutral-900 to-teal-950/90 border-emerald-500/30 text-emerald-300",
    amber: "from-amber-950/90 via-neutral-900 to-yellow-950/90 border-amber-500/30 text-amber-300",
    light: "from-white via-slate-50 to-slate-100 border-slate-300 text-slate-900",
    dark: "from-neutral-900 via-neutral-950 to-neutral-900 border-neutral-800 text-neutral-300"
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/60 via-purple-950/40 to-neutral-950 border border-rose-500/20 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" /> High-DPI Carousel Builder
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Social Carousel & Slide Deck Generator
            </h1>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Design multi-slide PDF carousels for LinkedIn and Instagram. Customize theme colors, aspect ratios, handles, and export 1080p high-resolution decks instantly.
            </p>
          </div>

          {/* Quick AI Presets */}
          <div className="shrink-0 space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-rose-400" /> AI Deck Outlines
            </label>
            <div className="flex flex-col gap-1.5">
              {AI_PRESETS.map((preset) => (
                <button
                  key={preset.topic}
                  onClick={() => {
                    setSlides(preset.slides);
                    setActiveSlideIndex(0);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-semibold text-left transition-all truncate max-w-xs"
                >
                  ✨ {preset.topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Options Column */}
        <div className="lg:col-span-6 space-y-5 p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl">
          {/* Design Themes & Aspect Ratio */}
          <div className="grid grid-cols-2 gap-4 border-b border-neutral-800 pb-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Color Theme
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {(["rose", "violet", "emerald", "amber", "light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 capitalize transition-all active:scale-95",
                      t === "rose" && "bg-rose-500 border-rose-300",
                      t === "violet" && "bg-violet-500 border-violet-300",
                      t === "emerald" && "bg-emerald-500 border-emerald-300",
                      t === "amber" && "bg-amber-500 border-amber-300",
                      t === "light" && "bg-slate-100 border-slate-400",
                      t === "dark" && "bg-neutral-800 border-neutral-500",
                      theme === t && "ring-2 ring-white scale-110 shadow-lg"
                    )}
                    title={`Theme ${t}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Aspect Ratio
              </label>
              <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                <button
                  onClick={() => setAspectRatio("4:5")}
                  className={cn(
                    "flex-1 py-1 text-xs font-bold rounded-lg transition-all",
                    aspectRatio === "4:5" ? "bg-rose-600 text-white" : "text-neutral-400"
                  )}
                >
                  4:5 (Portrait)
                </button>
                <button
                  onClick={() => setAspectRatio("1:1")}
                  className={cn(
                    "flex-1 py-1 text-xs font-bold rounded-lg transition-all",
                    aspectRatio === "1:1" ? "bg-rose-600 text-white" : "text-neutral-400"
                  )}
                >
                  1:1 (Square)
                </button>
              </div>
            </div>
          </div>

          {/* Branding Handles */}
          <div className="grid grid-cols-2 gap-3 border-b border-neutral-800 pb-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                Handle / Watermark
              </label>
              <input
                type="text"
                value={brandingText}
                onChange={(e) => setBrandingText(e.target.value)}
                placeholder="@yourhandle"
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Exismic AI"
                className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Slide Tab Selector & Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Slides ({slides.length})
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSlide(activeSlideIndex, activeSlideIndex - 1)}
                  disabled={activeSlideIndex === 0}
                  className="p-1 rounded bg-neutral-800 text-neutral-300 disabled:opacity-30 hover:bg-neutral-700"
                  title="Move Left"
                >
                  <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                </button>
                <button
                  onClick={() => moveSlide(activeSlideIndex, activeSlideIndex + 1)}
                  disabled={activeSlideIndex === slides.length - 1}
                  className="p-1 rounded bg-neutral-800 text-neutral-300 disabled:opacity-30 hover:bg-neutral-700"
                  title="Move Right"
                >
                  <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-all flex items-center gap-1.5",
                    activeSlideIndex === idx
                      ? "bg-rose-500/20 border-rose-500 text-white shadow-lg"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  )}
                >
                  Slide {idx + 1}
                </button>
              ))}
              <button
                onClick={addSlide}
                className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Slide Form Editor */}
          <div className="space-y-4 pt-3 border-t border-neutral-800">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                Slide Tag / Subtitle
              </label>
              <input
                type="text"
                value={currentSlide.tag}
                onChange={(e) => updateSlide(activeSlideIndex, "tag", e.target.value)}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={currentSlide.title}
                onChange={(e) => updateSlide(activeSlideIndex, "title", e.target.value)}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm font-bold focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                Body Takeaway Content
              </label>
              <textarea
                value={currentSlide.body}
                onChange={(e) => updateSlide(activeSlideIndex, "body", e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
              />
            </div>

            {slides.length > 1 && (
              <button
                onClick={() => removeSlide(activeSlideIndex)}
                className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Slide {activeSlideIndex + 1}
              </button>
            )}
          </div>
        </div>

        {/* Right Preview & Export Column */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl shadow-xl flex-1 flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Live Canvas (Slide {activeSlideIndex + 1} of {slides.length})
              </span>
              <span className="text-xs text-neutral-500 font-mono">1080p Render</span>
            </div>

            {/* Slide Live Canvas Preview */}
            <div className="w-full max-w-[380px] mx-auto flex items-center justify-center">
              <div
                className={cn(
                  "w-full p-8 rounded-3xl bg-gradient-to-br border shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden",
                  aspectRatio === "4:5" ? "aspect-[4/5]" : "aspect-square",
                  themeStyles[theme]
                )}
              >
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                {/* Header Tag & Branding */}
                <div className="flex items-center justify-between z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20">
                    {currentSlide.tag || `SLIDE ${activeSlideIndex + 1}`}
                  </span>
                  <span className="text-xs font-bold opacity-70 truncate max-w-[120px]">
                    {brandingText || "@yourhandle"}
                  </span>
                </div>

                {/* Main Headline & Body */}
                <div className="space-y-3 my-auto z-10">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                    {currentSlide.body}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-[10px] opacity-60 font-mono z-10">
                  <span>SLIDE {activeSlideIndex + 1}/{slides.length}</span>
                  <span>{activeSlideIndex === slides.length - 1 ? "FINISH 🏁" : "SWIPE 👉"}</span>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                disabled={activeSlideIndex === 0}
                className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-white disabled:opacity-30 hover:border-rose-500 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-neutral-400">
                {activeSlideIndex + 1} / {slides.length}
              </span>
              <button
                onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
                disabled={activeSlideIndex === slides.length - 1}
                className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-white disabled:opacity-30 hover:border-rose-500 transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Export Buttons */}
            <div className="space-y-3 pt-4 border-t border-neutral-800/80">
              {exportSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{exportSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={exportAsPdf}
                  disabled={isExportingPdf}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExportingPdf ? "Generating PDF..." : "Export LinkedIn PDF"}
                </button>

                <button
                  onClick={exportAsZip}
                  disabled={isExportingZip}
                  className="py-3 px-4 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4 text-rose-400" />
                  {isExportingZip ? "Zipping Images..." : "Export Instagram PNGs"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
