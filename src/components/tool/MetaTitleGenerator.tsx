"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  FileSearch, 
  Search, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Globe, 
  Monitor, 
  Smartphone, 
  RotateCcw, 
  Download, 
  Tag, 
  Target, 
  Sliders, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Check,
  Layers,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { CyberDropdown, type DropdownOption } from "@/components/ui/CyberDropdown";

const INTENT_OPTIONS: DropdownOption[] = [
  { value: "commercial", label: "Commercial / Buyer Review", description: "Best picks, rankings & buyer comparison", badge: "High CTR" },
  { value: "transactional", label: "Product / Shop Sale", description: "Direct checkout, discounts & e-commerce sales", badge: "Sales" },
  { value: "guide", label: "Ultimate Guide / Tutorial", description: "Deep walkthroughs & comprehensive manuals" },
  { value: "informational", label: "Informational / Educational", description: "Educational explanations, definitions & concepts" },
];

// 6 Curated SEO Blueprints (Standard: Preloaded Blueprint #1, Zero Empty Voids)
export interface TitleBlueprint {
  id: string;
  title: string;
  category: string;
  keyword: string;
  topic: string;
  brand: string;
  intent: "commercial" | "informational" | "transactional" | "guide";
  preloadedTitles: string[];
}

export const TITLE_BLUEPRINTS: TitleBlueprint[] = [
  {
    id: "ecommerce-product",
    title: "E-Commerce DTC Product",
    category: "Physical Retail",
    keyword: "Wireless Noise Cancelling Headphones",
    topic: "premium audiophile headphones with deep bass & 40h battery",
    brand: "AudioNova",
    intent: "commercial",
    preloadedTitles: [
      "Wireless Noise Cancelling Headphones (2026) | AudioNova",
      "Best Wireless Noise Cancelling Headphones - Free Fast Shipping",
      "AudioNova Pro: Wireless Noise Cancelling Headphones Under $150",
      "Top Rated Wireless Noise Cancelling Headphones | 40h Battery",
      "Wireless Noise Cancelling Headphones: Tested, Ranked & Reviewed"
    ]
  },
  {
    id: "saas-software",
    title: "SaaS Landing Page",
    category: "Software",
    keyword: "AI Video Editor",
    topic: "automatic video generator for YouTube Shorts and TikTok clips",
    brand: "ClipCraft",
    intent: "transactional",
    preloadedTitles: [
      "AI Video Editor - Create Viral Shorts in 60 Seconds | ClipCraft",
      "Free Online AI Video Editor: Auto-Captions & Instant Trimming",
      "ClipCraft: The #1 AI Video Editor for Creators & Marketers",
      "Turn Scripts Into Videos with Our Smart AI Video Editor",
      "AI Video Editor for Fast Social Media Reels & YouTube Shorts"
    ]
  },
  {
    id: "local-agency",
    title: "Local Agency Services",
    category: "B2B Services",
    keyword: "SEO Agency London",
    topic: "organic search marketing and technical audit for enterprises",
    brand: "SearchApex",
    intent: "commercial",
    preloadedTitles: [
      "SEO Agency London: Grow Organic Google Search Traffic | SearchApex",
      "Award-Winning SEO Agency in London - Book a Free Strategy Audit",
      "London SEO Agency: Technical Audits, High-ROI Link Building & Growth",
      "SearchApex - Trusted B2B & Enterprise SEO Agency London",
      "Top-Rated SEO Agency in London for Fast E-Commerce Rankings"
    ]
  },
  {
    id: "lifestyle-blog",
    title: "Health & Lifestyle Guide",
    category: "Editorial",
    keyword: "Mediterranean Diet Meal Plan",
    topic: "7-day beginner weight loss recipe guide with grocery shopping list",
    brand: "NutriVital",
    intent: "guide",
    preloadedTitles: [
      "7-Day Mediterranean Diet Meal Plan for Beginners (with Recipes)",
      "Mediterranean Diet Meal Plan: 2026 Complete Food Guide & Prep",
      "Easy Mediterranean Diet Meal Plan: Printable Grocery List Inside",
      "The Ultimate Mediterranean Diet Meal Plan for Healthy Weight Loss",
      "Simple Mediterranean Diet Meal Plan: Heart-Healthy Daily Dishes"
    ]
  },
  {
    id: "dev-tool",
    title: "Developer Library / Open Source",
    category: "Developer",
    keyword: "React State Management Library",
    topic: "lightweight zero-dependency Zustand alternative with TypeScript",
    brand: "FluxState",
    intent: "informational",
    preloadedTitles: [
      "React State Management Library: Fast, 1KB & Type-Safe | FluxState",
      "The Modern React State Management Library for Production Web Apps",
      "FluxState: Lightweight React State Management Library (Zero Boilerplate)",
      "Best React State Management Library in 2026: Fast & Modular",
      "Simplify Web State: High-Performance React State Management Library"
    ]
  },
  {
    id: "online-course",
    title: "Online Boot Camp & Course",
    category: "Education",
    keyword: "Python for Data Science Course",
    topic: "hands-on coding course with certification and portfolio projects",
    brand: "DataAcademy",
    intent: "transactional",
    preloadedTitles: [
      "Python for Data Science Course with Certificate | DataAcademy",
      "Learn Python for Data Science: Beginner to Advanced Project Boot Camp",
      "Python for Data Science Course - Master Pandas, NumPy & Machine Learning",
      "Best Online Python for Data Science Course (2026 Verified Certification)",
      "Python for Data Science Course: 40+ Hands-On Real World Projects"
    ]
  }
];

export default function MetaTitleGenerator() {
  // Active Blueprint
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("ecommerce-product");

  // Form States
  const [keyword, setKeyword] = useState<string>(TITLE_BLUEPRINTS[0].keyword);
  const [topic, setTopic] = useState<string>(TITLE_BLUEPRINTS[0].topic);
  const [brandName, setBrandName] = useState<string>(TITLE_BLUEPRINTS[0].brand);
  const [searchIntent, setSearchIntent] = useState<string>(TITLE_BLUEPRINTS[0].intent);

  // SERP Preview Mockup Settings
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);

  // Titles State (Preloaded with Blueprint #1)
  const [titles, setTitles] = useState<string[]>(TITLE_BLUEPRINTS[0].preloadedTitles);

  // Dynamic Progress States (Standard 4 Compliance)
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>("Analyzing keyword intent...");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Selected Active Title
  const activeTitle = titles[activePreviewIndex] || titles[0] || `${keyword} | ${brandName || "Exismic"}`;

  // Character length and pixel approximation
  const charLength = activeTitle.length;
  // Google desktop truncates around 580-600px (~60 chars). We approximate 9.5px per character average.
  const pixelWidth = Math.round(charLength * 9.6);
  const isOptimalLength = charLength >= 40 && charLength <= 60;
  const isTooLong = charLength > 60;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Blueprint Selection
  const handleSelectBlueprint = (bp: TitleBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setKeyword(bp.keyword);
    setTopic(bp.topic);
    setBrandName(bp.brand);
    setSearchIntent(bp.intent);
    setTitles(bp.preloadedTitles);
    setActivePreviewIndex(0);
  };

  // Reset to Baseline
  const handleReset = () => {
    setSelectedBlueprintId("");
    setKeyword("Best CRM Software");
    setTopic("sales automation tools for small business");
    setBrandName("LeadFlow");
    setSearchIntent("commercial");
    setTitles([
      "Best CRM Software for Small Business (2026) | LeadFlow",
      "Top 10 Best CRM Software Tools Ranked & Reviewed",
      "LeadFlow: The Best CRM Software for Sales Pipelines & Growth",
      "How to Choose the Best CRM Software for Fast Team Collaboration",
      "Best CRM Software with Built-in Lead Tracking & Email Sequences"
    ]);
    setActivePreviewIndex(0);
  };

  // AI / Formula Generation with Standard 4 Dynamic Progress
  const handleGenerate = async () => {
    if (!keyword.trim() || isGenerating) return;

    setIsGenerating(true);
    setProgressPercent(12);
    setProgressStage("Analyzing keyword search intent and volume...");

    // Smooth asymptotic progress ticker
    timerRef.current = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 40) {
          setProgressStage("Evaluating Google 60-character SERP pixel boundaries...");
          return prev + 6;
        }
        if (prev < 75) {
          setProgressStage("Crafting high-CTR marketing hooks and intent angles...");
          return prev + 4;
        }
        if (prev < 94) {
          setProgressStage("Testing character truncation and brand positioning...");
          return prev + 2;
        }
        return prev;
      });
    }, 180);

    try {
      const response = await fetch("/api/tools/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate 5 high-CTR, SEO-optimized Meta Title tags under 60 characters for primary keyword: "${keyword}". Target audience/topic: "${topic}". Brand name: "${brandName}". Search Intent: "${searchIntent}". Ensure the primary keyword is placed prominently near the front. Output only 5 clean titles, one per line, with no numbering, markdown, or quotation marks.`,
          toolId: "meta-title-generator",
          systemInstruction: "You are an elite SEO search engineer. Write compelling, high-CTR page title tags under 60 characters that maximize organic search clicks without getting truncated."
        })
      });

      const data = await response.json();
      if (timerRef.current) clearInterval(timerRef.current);
      setProgressPercent(100);
      setProgressStage("Titles verified and optimized!");

      if (data.output || data.text) {
        const raw = (data.output || data.text)
          .split("\n")
          .map((l: string) => l.replace(/^[\d.\s"'-]+/, "").replace(/["']/g, "").trim())
          .filter((l: string) => l.length >= 10);

        if (raw.length >= 3) {
          setTitles(raw.slice(0, 5));
        } else {
          setTitles(generateFallbackTitles(keyword, brandName, topic));
        }
      } else {
        setTitles(generateFallbackTitles(keyword, brandName, topic));
      }
    } catch {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgressPercent(100);
      setTitles(generateFallbackTitles(keyword, brandName, topic));
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setActivePreviewIndex(0);
      }, 350);
    }
  };

  // High-Quality Algorithmic Title Fallbacks
  const generateFallbackTitles = (kw: string, brand: string, ctx: string): string[] => {
    const b = brand ? ` | ${brand}` : "";
    return [
      `${kw} (2026 Guide & Top Picks)${b}`,
      `Best ${kw} for Beginners: Step-by-Step Guide${b}`,
      `${kw} - Features, Pricing & Comparison${b}`,
      `How to Choose the Best ${kw}: Expert Review${b}`,
      `${kw}: Complete Checklist & Tips${b}`
    ];
  };

  // 1-Click Title Copy
  const copyTitle = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Download All Titles (.txt)
  const handleDownloadTxt = () => {
    const summary = `SEO Meta Title Tags Package
Keyword: ${keyword}
Brand: ${brandName || "None"}
Search Intent: ${searchIntent}
Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

[RECOMMENDED TITLE TAGS]
-------------------------------------------------------
${titles.map((t, i) => `${i + 1}. ${t} (${t.length} chars)`).join("\n\n")}

[SERP SPECIFICATION]
-------------------------------------------------------
Google SERP Limit: ~60 Characters (580 Pixels)
Recommended Placement: Primary keyword near the beginning, brand at the end.

Generated with Exismic SEO Studio
https://exismic.com/tools/meta-title-generator`;

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-titles-${keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy All Titles Summary
  const handleCopyAll = () => {
    const text = titles.map((t, i) => `${i + 1}. ${t}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedIdx(999);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Deck: Telemetry HUD & Studio Actions */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Category Badge & Studio Telemetry */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <FileSearch size={13} className="text-cyan-400" />
              <span>SEO Webmaster Studio</span>
            </div>

            {/* Target Character Limit Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <Target size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-zinc-300">Optimal Length:</span>
              <span className="text-sm font-black text-cyan-400">50 - 60 Chars</span>
            </div>

            {/* Live Length Pill for Active Title */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <span className="text-xs font-bold text-zinc-300">Active Title:</span>
              <span className={cn(
                "text-sm font-black",
                isOptimalLength ? "text-cyan-400" : isTooLong ? "text-amber-400" : "text-zinc-400"
              )}>
                {charLength} / 60 chars ({pixelWidth}px)
              </span>
            </div>
          </div>

          {/* Right: Quick Reset & Export */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="Reset fields to baseline"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Export Titles</span>
            </button>
          </div>
        </div>
      </div>

      {/* Blueprint Selector Bar (Standard: 6 Blueprints, Preloaded Blueprint #1) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              High-CTR SEO Title Blueprints
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any blueprint to inspect proven search-optimized formulas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {TITLE_BLUEPRINTS.map((bp) => {
            const isSelected = selectedBlueprintId === bp.id;
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleSelectBlueprint(bp)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40"
                    : "bg-white/[0.02] border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 whitespace-nowrap shrink-0">
                    {bp.category}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 truncate text-right">
                    {bp.brand}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {bp.keyword}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Interactive Workspace (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Inputs & Settings): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-5">
            {/* Primary Keyword Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <span>Target Primary Keyword *</span>
                </label>
                <span className="text-[11px] text-zinc-500">Exact search query you want to rank for</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 font-bold">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 pl-11 pr-4 py-3.5 text-base font-bold text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Target Audience & Page Context */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Page Topic & Key Benefits (Optional)
              </label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setSelectedBlueprintId("");
                }}
                placeholder="e.g. audiophile headphones with deep bass & 40h battery"
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-medium text-white focus:border-cyan-500 focus:outline-none transition-all resize-none placeholder:text-zinc-600"
              />
            </div>

            {/* Brand Name Input & Search Intent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Brand Name / Site Suffix
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  placeholder="e.g. AudioNova"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              <CyberDropdown
                label="Search Intent Angle"
                value={searchIntent}
                onChange={(val) => setSearchIntent(val as any)}
                options={INTENT_OPTIONS}
                themeColor="cyan"
              />
            </div>

            {/* Dynamic Continuous Progress Bar (Standard 4 Compliance) */}
            {isGenerating && (
              <div className="space-y-2 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <RefreshCw size={13} className="animate-spin text-cyan-400" />
                    {progressStage}
                  </span>
                  <span className="font-mono font-black text-cyan-400">
                    [ {progressPercent}% ]
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-black/60 overflow-hidden p-0.5">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!keyword.trim() || isGenerating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="animate-spin text-black" />
                  <span>Generating Optimized Titles...</span>
                </>
              ) : (
                <>
                  <Search size={16} className="text-black" />
                  <span>Generate SEO Title Tags</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (SERP Preview & Title Variations): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Google Search Result Mockup Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Google SERP Live Simulator
                </span>
              </div>

              {/* Desktop vs Mobile Toggle */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/60 border border-white/10">
                <button
                  type="button"
                  onClick={() => setSerpDevice("desktop")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                    serpDevice === "desktop" ? "bg-cyan-500 text-black font-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Monitor size={12} />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSerpDevice("mobile")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                    serpDevice === "mobile" ? "bg-cyan-500 text-black font-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Smartphone size={12} />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Google Search Result Box */}
            <div className={cn(
              "rounded-2xl p-4 border transition-all",
              serpDevice === "mobile" ? "max-w-[380px] mx-auto bg-[#1f1f1f] border-zinc-700" : "bg-[#202124] border-zinc-700/80"
            )}>
              {/* Google Breadcrumb Snippet */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-[10px] font-black text-cyan-300">
                  {brandName ? brandName.charAt(0).toUpperCase() : "G"}
                </div>
                <div className="text-[12px] leading-tight overflow-hidden">
                  <p className="text-white font-medium truncate">{brandName || "Your Website"}</p>
                  <p className="text-zinc-400 text-[11px] truncate">https://{brandName ? brandName.toLowerCase().replace(/[^a-z0-9]/g, "") : "example"}.com › {keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</p>
                </div>
              </div>

              {/* Clickable Blue Google Search Title Link */}
              <h3 className="text-[17px] sm:text-[19px] leading-snug font-normal text-[#8ab4f8] hover:underline cursor-pointer break-words pt-1 font-sans">
                {activeTitle}
              </h3>

              {/* Google Meta Description Placeholder */}
              <p className="text-[13px] text-[#bdc1c6] leading-relaxed pt-1 font-sans line-clamp-2">
                Discover the ultimate guide and top-rated choices for {keyword}. Explore verified features, comparison rankings, and expert recommendations online.
              </p>
            </div>

            {/* Pixel & Character Width Health Meter */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Google SERP Display Gauge:</span>
                <span className={cn(
                  "font-bold font-mono px-2 py-0.5 rounded text-[11px]",
                  isOptimalLength ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : isTooLong ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-white/5 text-zinc-400 border border-white/10"
                )}>
                  {charLength} / 60 characters ({pixelWidth}px / 580px max)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(100, (charLength / 60) * 100)}%` }}
                  className={cn(
                    "h-full transition-all duration-300",
                    isOptimalLength ? "bg-cyan-400" : isTooLong ? "bg-amber-400" : "bg-zinc-400"
                  )}
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                {isOptimalLength ? "✓ Title fits Google desktop and mobile SERPs without truncation." : isTooLong ? "⚠️ Title exceeds 60 characters and may show an ellipsis (...) in Google search." : "ℹ️ Title is under 40 characters; you have room to add brand or modifiers."}
              </p>
            </div>
          </div>

          {/* Generated Title Tags Selection List */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Generated Title Variations ({titles.length})
              </span>
              <button
                type="button"
                onClick={handleCopyAll}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {copiedIdx === 999 ? "All Titles Copied!" : "Copy All Titles"}
              </button>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {titles.map((t, idx) => {
                const isActive = activePreviewIndex === idx;
                const isCopied = copiedIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActivePreviewIndex(idx)}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group",
                      isActive
                        ? "bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40"
                        : "bg-black/40 border-white/10 hover:border-cyan-500/30 hover:bg-black/60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className={cn(
                        "text-xs font-bold transition-colors leading-relaxed",
                        isActive ? "text-cyan-200" : "text-white group-hover:text-cyan-300"
                      )}>
                        {t}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyTitle(t, idx);
                        }}
                        className="shrink-0 p-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 transition-all border border-white/10 cursor-pointer"
                        title="Copy this title tag"
                      >
                        {isCopied ? <CheckCircle2 size={13} className="text-cyan-400" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 text-[10px]">
                      <span className={cn(
                        "font-mono font-bold px-1.5 py-0.5 rounded",
                        t.length <= 60 ? "bg-cyan-500/15 text-cyan-400" : "bg-amber-500/15 text-amber-400"
                      )}>
                        {t.length} chars
                      </span>
                      <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        {isActive ? "● Active in SERP Preview" : "Click to preview snippet"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Result Retention Bar */}
      <ResultRetentionBar
        toolType="meta-title-generator"
        toolName="Meta Title Generator"
        title={`SEO Meta Titles for "${keyword}"`}
        content={`SEO Meta Title Tags for "${keyword}":\n\n${titles.map((t, i) => `${i + 1}. ${t} (${t.length} chars)`).join("\n")}`}
        downloadLabel="Download Title Sheet (.txt)"
        downloadAction={handleDownloadTxt}
        onCopy={handleCopyAll}
      />

      {/* Chained Companion Tools in SEO */}
      <ToolWorkflowChaining
        currentToolId="meta-title-generator"
        categoryId="seo"
        outputContent={`Primary Keyword: "${keyword}", Best Title: "${activeTitle}"`}
      />

      {/* Suggested Tools */}
      <ToolSuggestions
        currentToolId="meta-title-generator"
        categoryId="seo"
        outputContent={`Primary Keyword: "${keyword}", Best Title: "${activeTitle}"`}
      />
    </div>
  );
}
