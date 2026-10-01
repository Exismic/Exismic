"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Layers,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Palette,
  Layout,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  SlidersHorizontal,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { ToolLaserDivider } from "@/components/tool/ToolLaserDivider";

interface Slide {
  id: string;
  tag: string;
  title: string;
  body: string;
}

// Preset Topics for Instant AI Generation
const CAROUSEL_BLUEPRINTS = [
  {
    topic: "5 AI Tools for High Output",
    category: "Tech & AI List",
    tagline: "5 curated creator tools",
    slides: [
      { id: "1", tag: "SWIPE LEFT 👉", title: "5 AI Tools Every Creator Needs in 2026", body: "Save 20+ hours a week with these studio-grade utilities built for high-output builders." },
      { id: "2", tag: "TOOL #1", title: "1. Automated Research & Summaries", body: "Extract core actionable insights from 50-page PDFs and YouTube videos in seconds." },
      { id: "3", tag: "TOOL #2", title: "2. Real-Time Thumbnail Auditing", body: "Test color contrast, face focal points, and duration badge overlap before publishing." },
      { id: "4", tag: "TOOL #3", title: "3. Voice & Background Audio Isolation", body: "Clean vocals, separate instruments, and remove fan hiss directly in your browser." },
      { id: "5", tag: "CONCLUSION", title: "Save & Share This Deck", body: "Follow @exismicai for daily creative tools, tech frameworks, and workflow breakdowns!" }
    ]
  },
  {
    topic: "How to Build a $10k Side Project",
    category: "Actionable Guide",
    tagline: "From zero to revenue",
    slides: [
      { id: "1", tag: "BLUEPRINT 💡", title: "How to Build a $10k/mo Side Project", body: "A step-by-step framework to launch while working a 9-to-5 without burning out." },
      { id: "2", tag: "STEP 1", title: "1. Solve One Painful Problem", body: "Focus on a hyper-specific audience willing to pay $100+ for an immediate solution." },
      { id: "3", tag: "STEP 2", title: "2. Build an MVP in 48 Hours", body: "Use no-code tools and AI scripts. Don't over-engineer custom infrastructure." },
      { id: "4", tag: "STEP 3", title: "3. Pre-Sell to 10 Early Customers", body: "Validate real payment intent before writing custom backend production code." },
      { id: "5", tag: "SUMMARY", title: "Execution > Ideas", body: "Bookmark this slide deck for your next weekend build sprint." }
    ]
  },
  {
    topic: "4 Principles of Clean UI Design",
    category: "Design & UX",
    tagline: "Visual hierarchy guide",
    slides: [
      { id: "1", tag: "DESIGN SYSTEM 🎨", title: "4 Principles of Clean UI Design", body: "Transform amateur product layouts into premium, high-converting digital experiences." },
      { id: "2", tag: "PRINCIPLE 1", title: "1. Generous Breathable Whitespace", body: "Give interface elements room to breathe. Clutter destroys visual hierarchy every time." },
      { id: "3", tag: "PRINCIPLE 2", title: "2. Disciplined Color Palette", body: "Use 1 dominant background, 1 neutral surface, and 1 vibrant interactive accent color." },
      { id: "4", tag: "PRINCIPLE 3", title: "3. Strong Typographic Scale", body: "Make headline weights bold and effortlessly readable at a glance on mobile feeds." },
      { id: "5", tag: "FINISH", title: "Level Up Your UI", body: "Repost this guide if you found these design principles actionable!" }
    ]
  },
  {
    topic: "Before & After Conversion Growth",
    category: "Case Study",
    tagline: "1.8% to 8.4% landing page",
    slides: [
      { id: "1", tag: "CASE STUDY 📈", title: "How We Quadrupled Landing Page Conversions", body: "From 1.8% to 8.4% without changing our core product pricing or ad spend." },
      { id: "2", tag: "CHANGE 1", title: "1. Eradicated Technical Jargon", body: "Replaced engineering buzzwords with plain-English benefits everyday users understand." },
      { id: "3", tag: "CHANGE 2", title: "2. Social Proof Above the Fold", body: "Placed verifiable customer metrics and video demos in the immediate hero viewport." },
      { id: "4", tag: "CHANGE 3", title: "3. Single Unambiguous Call to Action", body: "Removed distracting secondary links so visitors had exactly one clear path forward." },
      { id: "5", tag: "TAKEAWAY", title: "Simplicity Converts", body: "Save this deck for your next product launch or website redesign." }
    ]
  }
];

export default function CarouselGenerator() {
  const [slides, setSlides] = useState<Slide[]>(CAROUSEL_BLUEPRINTS[0].slides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>(CAROUSEL_BLUEPRINTS[0].topic);

  // Design Customization State
  const [theme, setTheme] = useState<"indigo" | "violet" | "emerald" | "amber" | "dark" | "light">("indigo");
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

  // Canvas Drawing Engine for High-Resolution Vector Export
  const drawSlideToCanvas = useCallback((
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
    if (theme === "indigo") {
      grad.addColorStop(0, "#070a18");
      grad.addColorStop(0.6, "#0c102b");
      grad.addColorStop(1, "#1e1b4b");
    } else if (theme === "violet") {
      grad.addColorStop(0, "#0f051d");
      grad.addColorStop(0.6, "#1a0933");
      grad.addColorStop(1, "#3b0764");
    } else if (theme === "emerald") {
      grad.addColorStop(0, "#03140e");
      grad.addColorStop(0.6, "#06281c");
      grad.addColorStop(1, "#064e3b");
    } else if (theme === "amber") {
      grad.addColorStop(0, "#170c03");
      grad.addColorStop(0.6, "#2a1705");
      grad.addColorStop(1, "#78350f");
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

    // Decorative Ambient Radial Flare
    const glowGrad = ctx.createRadialGradient(width * 0.85, height * 0.15, 50, width * 0.85, height * 0.15, 450);
    const accentHex =
      theme === "indigo"
        ? "rgba(99, 102, 241, 0.25)"
        : theme === "violet"
        ? "rgba(139, 92, 246, 0.2)"
        : theme === "emerald"
        ? "rgba(16, 185, 129, 0.2)"
        : theme === "amber"
        ? "rgba(245, 158, 11, 0.2)"
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
      theme === "indigo"
        ? "#6366f1"
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
  }, [aspectRatio, theme, brandingText]);

  // Export LinkedIn Multi-Page PDF Document
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
      a.download = `linkedin-carousel-${Date.now()}.pdf`;
      a.click();

      setExportSuccessMsg("Successfully downloaded multi-page LinkedIn Carousel PDF!");
    } catch (err) {
      console.error("PDF export error", err);
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setExportSuccessMsg(null), 4000);
    }
  };

  // Export Instagram Image ZIP Archive
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
    indigo: "from-[#070a18] via-[#0c102b] to-[#1e1b4b] border-indigo-500/40 text-indigo-200",
    violet: "from-[#0f051d] via-[#1a0933] to-[#3b0764] border-violet-500/40 text-violet-200",
    emerald: "from-[#03140e] via-[#06281c] to-[#064e3b] border-emerald-500/40 text-emerald-200",
    amber: "from-[#170c03] via-[#2a1705] to-[#78350f] border-amber-500/40 text-amber-200",
    light: "from-white via-slate-50 to-slate-100 border-slate-300 text-slate-900",
    dark: "from-neutral-900 via-neutral-950 to-neutral-900 border-neutral-800 text-neutral-300"
  };

  return (
    <div className="w-full space-y-7 text-zinc-100">
      {/* 1-Click Carousel Story Blueprints Strip */}
      <div className="rounded-3xl border border-indigo-500/20 bg-[#0a0c16]/90 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(99,102,241,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Carousel Story Blueprints
              </span>
              <p className="text-[11px] text-zinc-400 font-medium">
                1-click proven slide structures for LinkedIn and Instagram swipe decks
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/90 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 self-start sm:self-auto">
            {CAROUSEL_BLUEPRINTS.length} Ready Blueprints
          </span>
        </div>

        {/* Blueprint Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CAROUSEL_BLUEPRINTS.map((bp) => {
            const isSelected = selectedBlueprint === bp.topic;
            return (
              <button
                key={bp.topic}
                type="button"
                onClick={() => {
                  setSlides(bp.slides);
                  setActiveSlideIndex(0);
                  setSelectedBlueprint(bp.topic);
                }}
                className={cn(
                  "flex flex-col items-start justify-between text-left p-3.5 rounded-2xl transition-all duration-200 border cursor-pointer min-h-[92px]",
                  isSelected
                    ? "bg-indigo-600/25 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.25)] text-white"
                    : "bg-[#0c0e18] border-white/10 text-zinc-300 hover:border-indigo-500/40 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <div className="w-full flex items-center justify-between gap-1 mb-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {bp.category}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-300 shrink-0" />}
                </div>
                <span className="text-xs font-bold text-white line-clamp-1">{bp.topic}</span>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                  {bp.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid: Editor vs Live Slide Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Slide Content Editor & Styling Controls */}
        <div className="lg:col-span-6 space-y-5 rounded-3xl border border-indigo-500/20 bg-[#0a0c16]/90 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_25px_rgba(99,102,241,0.06)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                Slide Styling & Content
              </span>
            </div>

            <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
              Slide {activeSlideIndex + 1} of {slides.length}
            </span>
          </div>

          {/* Theme Palette & Aspect Ratio Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/10 pb-5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                Color Theme
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {(["indigo", "violet", "emerald", "amber", "light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-all active:scale-95 cursor-pointer",
                      t === "indigo" && "bg-indigo-600 border-indigo-400",
                      t === "violet" && "bg-purple-600 border-purple-400",
                      t === "emerald" && "bg-emerald-600 border-emerald-400",
                      t === "amber" && "bg-amber-600 border-amber-400",
                      t === "light" && "bg-slate-100 border-slate-300",
                      t === "dark" && "bg-neutral-800 border-neutral-600",
                      theme === t
                        ? "border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] scale-110"
                        : "opacity-80 hover:opacity-100"
                    )}
                    title={`Theme: ${t}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                Aspect Ratio
              </label>
              <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setAspectRatio("4:5")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                    aspectRatio === "4:5" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                  )}
                >
                  4:5 (Portrait)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio("1:1")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                    aspectRatio === "1:1" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                  )}
                >
                  1:1 (Square)
                </button>
              </div>
            </div>
          </div>

          {/* Social Branding Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-white/10 pb-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Social Handle
              </label>
              <input
                type="text"
                value={brandingText}
                onChange={(e) => setBrandingText(e.target.value)}
                placeholder="@yourhandle"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-indigo-500/80 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Exismic AI"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-indigo-500/80 transition-colors"
              />
            </div>
          </div>

          {/* Slide Filmstrip Manager */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                Slide Navigator ({slides.length})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => moveSlide(activeSlideIndex, activeSlideIndex - 1)}
                  disabled={activeSlideIndex === 0}
                  className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-zinc-300 disabled:opacity-30 hover:border-indigo-400 hover:text-white cursor-pointer"
                  title="Move Slide Left"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(activeSlideIndex, activeSlideIndex + 1)}
                  disabled={activeSlideIndex === slides.length - 1}
                  className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-zinc-300 disabled:opacity-30 hover:border-indigo-400 hover:text-white cursor-pointer"
                  title="Move Slide Right"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl border text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer",
                    activeSlideIndex === idx
                      ? "bg-indigo-600/30 border-indigo-400 text-white shadow-md shadow-indigo-600/20"
                      : "bg-black/50 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                  )}
                >
                  <span>Slide {idx + 1}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={addSlide}
                className="px-3 py-2 rounded-xl bg-black/60 hover:bg-white/10 border border-white/10 hover:border-indigo-400 text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                title="Add New Slide"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Active Slide Form Fields */}
          <div className="space-y-4 pt-3 border-t border-white/10">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Top Tag / Category Badge
              </label>
              <input
                type="text"
                value={currentSlide.tag}
                onChange={(e) => updateSlide(activeSlideIndex, "tag", e.target.value)}
                placeholder="e.g. SWIPE LEFT 👉"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-indigo-500/80 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Slide Headline
              </label>
              <input
                type="text"
                value={currentSlide.title}
                onChange={(e) => updateSlide(activeSlideIndex, "title", e.target.value)}
                placeholder="Main takeaway headline..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm font-bold focus:outline-none focus:border-indigo-500/80 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Slide Description & Insights
              </label>
              <textarea
                value={currentSlide.body}
                onChange={(e) => updateSlide(activeSlideIndex, "body", e.target.value)}
                rows={4}
                placeholder="Add 2-3 concise sentences with actionable insights..."
                className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/80 transition-colors resize-none leading-relaxed"
              />
            </div>

            {slides.length > 1 && (
              <button
                type="button"
                onClick={() => removeSlide(activeSlideIndex)}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Slide {activeSlideIndex + 1}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Slide Canvas & Export Center */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div className="rounded-3xl border border-indigo-500/20 bg-[#0a0c16]/90 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_25px_rgba(99,102,241,0.06)] flex-1 flex flex-col justify-between space-y-6">
            {/* Live Canvas Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                    Live Carousel Stage
                  </span>
                  <p className="text-[11px] text-zinc-400 font-medium">Slide {activeSlideIndex + 1} of {slides.length}</p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-zinc-400 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10">
                {aspectRatio === "4:5" ? "1080 x 1350" : "1080 x 1080"}
              </span>
            </div>

            {/* Slide Live Canvas Preview */}
            <div className="w-full max-w-[390px] mx-auto flex items-center justify-center">
              <div
                className={cn(
                  "w-full p-7 sm:p-8 rounded-3xl bg-gradient-to-br border shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden",
                  aspectRatio === "4:5" ? "aspect-[4/5]" : "aspect-square",
                  themeStyles[theme]
                )}
              >
                {/* Decorative radial flare */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Tag & Social Handle */}
                <div className="flex items-center justify-between z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20">
                    {currentSlide.tag || `SLIDE ${activeSlideIndex + 1}`}
                  </span>
                  <span className="text-xs font-bold opacity-75 truncate max-w-[130px]">
                    {brandingText || "@yourhandle"}
                  </span>
                </div>

                {/* Headline & Body */}
                <div className="space-y-3.5 my-auto z-10 py-4">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                    {currentSlide.body}
                  </p>
                </div>

                {/* Footer Tracker */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-[10px] opacity-70 font-mono z-10">
                  <span>SLIDE {activeSlideIndex + 1} OF {slides.length}</span>
                  <span>{activeSlideIndex === slides.length - 1 ? "FINISH 🏁" : "SWIPE 👉"}</span>
                </div>
              </div>
            </div>

            {/* Pagination Dots & Navigation Controls */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                  disabled={activeSlideIndex === 0}
                  className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-white disabled:opacity-30 hover:border-indigo-400 transition-all cursor-pointer"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Clickable Pagination Dots */}
                <div className="flex items-center gap-1.5">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlideIndex(idx)}
                      className={cn(
                        "h-2 rounded-full transition-all cursor-pointer",
                        activeSlideIndex === idx
                          ? "w-6 bg-indigo-500 shadow-sm shadow-indigo-500/40"
                          : "w-2 bg-white/20 hover:bg-white/40"
                      )}
                      title={`Jump to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
                  disabled={activeSlideIndex === slides.length - 1}
                  className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-white disabled:opacity-30 hover:border-indigo-400 transition-all cursor-pointer"
                  title="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Export Actions Hub */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              {exportSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{exportSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={exportAsPdf}
                  disabled={isExportingPdf}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isExportingPdf ? "Generating PDF..." : "Download LinkedIn PDF"}</span>
                </button>

                <button
                  type="button"
                  onClick={exportAsZip}
                  disabled={isExportingZip}
                  className="py-3 px-4 rounded-2xl bg-black/60 hover:bg-white/10 border border-white/10 hover:border-indigo-400 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span>{isExportingZip ? "Zipping Images..." : "Download ZIP Images"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Reactive Laser Horizon Divider */}
      <div className="pt-4 pb-2">
        <ToolLaserDivider primaryHex="#6366f1" />
      </div>
    </div>
  );
}
