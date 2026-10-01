"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  AlignLeft, 
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
  Check, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  SearchCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

// 6 Curated SEO Blueprints (Standard: Preloaded Blueprint #1, Zero Empty Voids)
export interface DescriptionBlueprint {
  id: string;
  title: string;
  category: string;
  keyword: string;
  valueProp: string;
  cta: string;
  preloadedDescriptions: string[];
}

export const DESCRIPTION_BLUEPRINTS: DescriptionBlueprint[] = [
  {
    id: "ecommerce-product",
    title: "E-Commerce DTC Product",
    category: "Physical Retail",
    keyword: "Wireless Noise Cancelling Headphones",
    valueProp: "40-hour battery life, immersive acoustic bass, and ultra-plush comfort",
    cta: "Shop the top-rated 2026 collection with free express shipping today!",
    preloadedDescriptions: [
      "Discover the best wireless noise cancelling headphones with 40h battery and deep acoustic sound. Shop the 2026 collection with free shipping today!",
      "Upgrade your daily listening with premium wireless noise cancelling headphones. Experience crystal-clear calls and all-day comfort. Order yours now!",
      "Looking for top-tier wireless noise cancelling headphones? Enjoy studio-grade audio and effortless Bluetooth pairing. Claim your exclusive discount today!",
      "Immerse yourself in pure music with high-performance wireless noise cancelling headphones. Compare verified reviews and enjoy a 30-day money-back trial."
    ]
  },
  {
    id: "saas-software",
    title: "SaaS Landing Page",
    category: "Software",
    keyword: "AI Video Editor",
    valueProp: "automatic subtitles, 60-second viral short clips, and clean studio audio",
    cta: "Try it 100% free with no watermark!",
    preloadedDescriptions: [
      "Turn raw footage into viral clips in seconds with our smart AI video editor. Generate auto-subtitles and punchy cuts fast. Try it 100% free today!",
      "Create high-converting social media reels with the #1 AI video editor. Automatic captions, smart zooms, and zero watermarks. Start creating for free now!",
      "Supercharge your content workflow with an intuitive AI video editor built for creators. Edit 10x faster and publish everywhere. Get started in one click!",
      "Effortlessly generate viral TikToks and YouTube Shorts with our browser AI video editor. No editing experience required. Sign up and export free!"
    ]
  },
  {
    id: "local-agency",
    title: "Local Agency Services",
    category: "B2B Services",
    keyword: "SEO Agency London",
    valueProp: "data-driven technical audits, enterprise link building, and organic search growth",
    cta: "Book your free 30-minute organic search audit now!",
    preloadedDescriptions: [
      "Partner with a leading SEO agency in London to dominate Google search results. Data-backed strategies and technical audits. Book your free consultation!",
      "Looking for a proven SEO agency in London? We help high-growth brands scale organic rankings and revenue. Explore case studies and get in touch today!",
      "Drive sustainable enterprise search traffic with an award-winning London SEO agency. Transparent reporting and verified ROI. Request your free audit now!",
      "London's trusted SEO agency for high-ROI search marketing. From in-depth keyword analysis to authoritative link acquisition, scale your brand with us."
    ]
  },
  {
    id: "lifestyle-blog",
    title: "Health & Lifestyle Guide",
    category: "Editorial",
    keyword: "Mediterranean Diet Meal Plan",
    valueProp: "7-day delicious heart-healthy recipes, nutrition macros, and grocery list",
    cta: "Download your free printable meal plan today!",
    preloadedDescriptions: [
      "Kickstart healthy living with our 7-day Mediterranean diet meal plan. Easy recipes, balanced nutrition, and a grocery list. Download your free plan today!",
      "Discover the ultimate Mediterranean diet meal plan for sustainable wellness. Fresh ingredients, simple daily prep, and quick recipes. Read the full guide!",
      "Eat well and feel energized with our beginner Mediterranean diet meal plan. Heart-healthy meals backed by clinical nutritionists. Get your copy now!",
      "Looking for a simple Mediterranean diet meal plan? Enjoy delicious daily breakfasts, lunches, and dinners that nourish your body. Start your week right!"
    ]
  },
  {
    id: "dev-tool",
    title: "Developer Library / Open Source",
    category: "Developer",
    keyword: "React State Management Library",
    valueProp: "1KB zero-dependency bundle, lightning-fast rendering, and full TypeScript support",
    cta: "Get started in 60 seconds on GitHub!",
    preloadedDescriptions: [
      "Manage app state with zero boilerplate using our 1KB React state management library. Full TypeScript support and modular stores. Get started on GitHub!",
      "The lightweight React state management library built for high-performance web applications. Zero dependencies and instant setup. Install in 60 seconds!",
      "Say goodbye to complex reducers. This modern React state management library provides clean atomic updates and predictable reactive store logic. Try now!",
      "Build blazing-fast interfaces with an ultra-lean React state management library. Clean API, strict type safety, and minimal re-renders. Read the docs!"
    ]
  },
  {
    id: "online-course",
    title: "Online Boot Camp & Course",
    category: "Education",
    keyword: "Python for Data Science Course",
    valueProp: "40+ real-world projects, mentor code reviews, and verified job-ready certificate",
    cta: "Enroll today and launch your data career!",
    preloadedDescriptions: [
      "Master Python for data science with 40+ hands-on projects, mentor code reviews, and a verified certificate. Enroll today and accelerate your career!",
      "Launch your career with our top-rated Python for data science course. Learn Pandas, NumPy, and Machine Learning from industry experts. Start learning free!",
      "Become a job-ready data scientist with our comprehensive Python course. Hands-on coding exercises, real datasets, and career support. Register now!",
      "The practical Python for data science course designed for ambitious learners. Master data analysis and visualization with ease. Claim your student discount!"
    ]
  }
];

export default function MetaDescriptionGenerator() {
  // Active Blueprint
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("ecommerce-product");

  // Form States
  const [keyword, setKeyword] = useState<string>(DESCRIPTION_BLUEPRINTS[0].keyword);
  const [valueProp, setValueProp] = useState<string>(DESCRIPTION_BLUEPRINTS[0].valueProp);
  const [cta, setCta] = useState<string>(DESCRIPTION_BLUEPRINTS[0].cta);

  // SERP Preview Mockup Settings
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);

  // Descriptions State (Preloaded with Blueprint #1)
  const [descriptions, setDescriptions] = useState<string[]>(DESCRIPTION_BLUEPRINTS[0].preloadedDescriptions);

  // Dynamic Progress States (Standard 4 Compliance)
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>("Analyzing search query...");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Selected Active Description
  const activeDesc = descriptions[activePreviewIndex] || descriptions[0] || `Discover ${keyword}. Explore verified features and expert recommendations.`;

  // Length calculation
  const charLength = activeDesc.length;
  const isOptimalLength = charLength >= 120 && charLength <= 158;
  const isTooLong = charLength > 160;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Blueprint Selection
  const handleSelectBlueprint = (bp: DescriptionBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setKeyword(bp.keyword);
    setValueProp(bp.valueProp);
    setCta(bp.cta);
    setDescriptions(bp.preloadedDescriptions);
    setActivePreviewIndex(0);
  };

  // Reset to Baseline
  const handleReset = () => {
    setSelectedBlueprintId("");
    setKeyword("Best CRM Software");
    setValueProp("automated sales pipelines, email tracking, and contact management");
    setCta("Sign up for a free 14-day trial today!");
    setDescriptions([
      "Find the best CRM software for small businesses. Streamline sales pipelines, automate follow-ups, and close more deals. Start your free 14-day trial!",
      "Compare top-rated CRM software solutions for 2026. Powerful contact management, team collaboration, and real-time reporting. Try it risk-free today!",
      "Supercharge your sales team with intuitive CRM software. Simple pipeline tracking and seamless email integrations. Sign up for free access now!",
      "Looking for flexible CRM software that grows with your business? Explore verified features, customer reviews, and transparent pricing plans online."
    ]);
    setActivePreviewIndex(0);
  };

  // AI / Formula Generation with Standard 4 Dynamic Progress
  const handleGenerate = async () => {
    if (!keyword.trim() || isGenerating) return;

    setIsGenerating(true);
    setProgressPercent(14);
    setProgressStage("Analyzing searcher intent and value proposition...");

    timerRef.current = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 42) {
          setProgressStage("Evaluating Google 155-character mobile snippet limits...");
          return prev + 6;
        }
        if (prev < 78) {
          setProgressStage("Injecting keyword positioning and action-driven CTA...");
          return prev + 4;
        }
        if (prev < 94) {
          setProgressStage("Balancing readability score and click-through incentive...");
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
          prompt: `Generate 4 compelling, search-optimized Meta Descriptions strictly between 135 and 155 characters for primary keyword: "${keyword}". Core Value Proposition: "${valueProp}". Call to action: "${cta}". Ensure the primary keyword is mentioned naturally near the beginning and end with a strong CTA. Output exactly 4 descriptions, one per line, with no quotation marks or numbering.`,
          toolId: "meta-description-generator",
          systemInstruction: "You are an elite conversion-rate optimization and search marketer. Write punchy, click-worthy meta descriptions strictly under 158 characters."
        })
      });

      const data = await response.json();
      if (timerRef.current) clearInterval(timerRef.current);
      setProgressPercent(100);
      setProgressStage("Descriptions generated and formatted!");

      if (data.output || data.text) {
        const raw = (data.output || data.text)
          .split("\n")
          .map((l: string) => l.replace(/^[\d.\s"'-]+/, "").replace(/["']/g, "").trim())
          .filter((l: string) => l.length >= 25);

        if (raw.length >= 2) {
          setDescriptions(raw.slice(0, 4));
        } else {
          setDescriptions(generateFallbackDescriptions(keyword, valueProp, cta));
        }
      } else {
        setDescriptions(generateFallbackDescriptions(keyword, valueProp, cta));
      }
    } catch {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgressPercent(100);
      setDescriptions(generateFallbackDescriptions(keyword, valueProp, cta));
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setActivePreviewIndex(0);
      }, 350);
    }
  };

  const generateFallbackDescriptions = (kw: string, val: string, call: string): string[] => {
    return [
      `Discover the best ${kw} with ${val || "expert features"}. ${call || "Learn more and get started today!"}`,
      `Looking for high-performance ${kw}? Enjoy proven quality, top ratings, and fast results. ${call || "Try for free today!"}`,
      `Upgrade your workflow with verified ${kw}. Simple setup, flexible tools, and full support. ${call || "Order now!"}`,
      `The definitive 2026 guide to ${kw}. Read unbiased comparisons, expert tips, and feature breakdowns. ${call || "Read more now!"}`
    ];
  };

  // 1-Click Copy
  const copyDesc = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Download All (.txt)
  const handleDownloadTxt = () => {
    const summary = `SEO Meta Descriptions Package
Keyword: ${keyword}
Value Proposition: ${valueProp || "None"}
Call To Action: ${cta || "None"}
Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

[RECOMMENDED META DESCRIPTIONS]
-------------------------------------------------------
${descriptions.map((d, i) => `${i + 1}. ${d} (${d.length} chars)`).join("\n\n")}

[SERP SPECIFICATION]
-------------------------------------------------------
Optimal Length: 135 - 158 Characters
Google Snippet Cutoff: ~160 Characters on Desktop, ~120 Characters on Mobile

Generated with Exismic SEO Studio
https://exismic.com/tools/meta-description-generator`;

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-descriptions-${keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy All
  const handleCopyAll = () => {
    const text = descriptions.map((d, i) => `${i + 1}. ${d}`).join("\n\n");
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
              <AlignLeft size={13} className="text-cyan-400" />
              <span>SEO Webmaster Studio</span>
            </div>

            {/* Target Character Limit Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <Target size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-zinc-300">Optimal Range:</span>
              <span className="text-sm font-black text-cyan-400">140 - 158 Chars</span>
            </div>

            {/* Live Length Pill for Active Description */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-white/10">
              <span className="text-xs font-bold text-zinc-300">Active Snippet:</span>
              <span className={cn(
                "text-sm font-black",
                isOptimalLength ? "text-cyan-400" : isTooLong ? "text-amber-400" : "text-zinc-400"
              )}>
                {charLength} / 160 chars
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
              <span className="hidden sm:inline">Export Snippets</span>
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
              High-CTR Meta Description Blueprints
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-500">
            Click any blueprint to inspect conversion-focused snippet formulas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {DESCRIPTION_BLUEPRINTS.map((bp) => {
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
                    {bp.keyword}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {bp.valueProp}
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
                <span className="text-[11px] text-zinc-500">Query users type into search</span>
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

            {/* Core Value Offer */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Core Value Proposition & Differentiator
              </label>
              <textarea
                rows={2}
                value={valueProp}
                onChange={(e) => {
                  setValueProp(e.target.value);
                  setSelectedBlueprintId("");
                }}
                placeholder="e.g. 40-hour battery life, immersive acoustic bass, and ultra-plush comfort"
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-medium text-white focus:border-cyan-500 focus:outline-none transition-all resize-none placeholder:text-zinc-600"
              />
            </div>

            {/* Call to Action (CTA) with Quick Chips */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Call to Action (CTA)
              </label>
              <input
                type="text"
                value={cta}
                onChange={(e) => {
                  setCta(e.target.value);
                  setSelectedBlueprintId("");
                }}
                placeholder="e.g. Shop the 2026 collection with free shipping today!"
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none placeholder:text-zinc-600"
              />

              {/* Quick CTA Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  "Try for free today!",
                  "Shop now with free delivery!",
                  "Read the full 2026 guide!",
                  "Claim your exclusive discount!",
                  "Book your free consultation!"
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setCta(chip);
                      setSelectedBlueprintId("");
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/30 border border-white/10 text-xs font-bold text-zinc-300 hover:text-cyan-300 transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
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
                  <span>Drafting Meta Descriptions...</span>
                </>
              ) : (
                <>
                  <SearchCheck size={16} className="text-black" />
                  <span>Generate Meta Descriptions</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (SERP Preview & Descriptions List): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Google Search Result Mockup Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Google SERP Snippet Preview
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
              {/* Google Breadcrumb */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-[10px] font-black text-cyan-300">
                  G
                </div>
                <div className="text-[12px] leading-tight overflow-hidden">
                  <p className="text-white font-medium truncate">Example Brand</p>
                  <p className="text-zinc-400 text-[11px] truncate">https://example.com › {keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</p>
                </div>
              </div>

              {/* Blue Google Title */}
              <h3 className="text-[17px] sm:text-[19px] leading-snug font-normal text-[#8ab4f8] hover:underline cursor-pointer truncate font-sans">
                {keyword} (2026 Guide & Verified Picks)
              </h3>

              {/* Highlighted Meta Description */}
              <p className="text-[13px] text-white/95 leading-relaxed pt-1.5 font-sans break-words">
                {activeDesc}
              </p>
            </div>

            {/* Character Length & Cutoff Gauge */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Google Snippet Length Gauge:</span>
                <span className={cn(
                  "font-bold font-mono px-2 py-0.5 rounded text-[11px]",
                  isOptimalLength ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : isTooLong ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-white/5 text-zinc-400 border border-white/10"
                )}>
                  {charLength} / 160 characters
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(100, (charLength / 160) * 100)}%` }}
                  className={cn(
                    "h-full transition-all duration-300",
                    isOptimalLength ? "bg-cyan-400" : isTooLong ? "bg-amber-400" : "bg-zinc-400"
                  )}
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                {isOptimalLength ? "✓ Snippet fits Google desktop (158 chars) and mobile (120 chars) cleanly." : isTooLong ? "⚠️ Snippet exceeds 160 characters and will be clipped with an ellipsis in search." : "ℹ️ Snippet is under 120 characters; consider expanding with extra benefits."}
              </p>
            </div>
          </div>

          {/* Generated Descriptions List */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Generated Snippets ({descriptions.length})
              </span>
              <button
                type="button"
                onClick={handleCopyAll}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {copiedIdx === 999 ? "All Snippets Copied!" : "Copy All Snippets"}
              </button>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {descriptions.map((d, idx) => {
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
                        "text-xs leading-relaxed transition-colors",
                        isActive ? "text-cyan-100 font-medium" : "text-zinc-300 group-hover:text-white"
                      )}>
                        {d}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyDesc(d, idx);
                        }}
                        className="shrink-0 p-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 transition-all border border-white/10 cursor-pointer"
                        title="Copy this meta description"
                      >
                        {isCopied ? <CheckCircle2 size={13} className="text-cyan-400" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 text-[10px]">
                      <span className={cn(
                        "font-mono font-bold px-1.5 py-0.5 rounded",
                        d.length <= 160 ? "bg-cyan-500/15 text-cyan-400" : "bg-amber-500/15 text-amber-400"
                      )}>
                        {d.length} chars
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
        toolType="meta-description-generator"
        toolName="Meta Description Generator"
        title={`SEO Meta Descriptions for "${keyword}"`}
        content={`SEO Meta Descriptions for "${keyword}":\n\n${descriptions.map((d, i) => `${i + 1}. ${d} (${d.length} chars)`).join("\n\n")}`}
        downloadLabel="Download Snippets (.txt)"
        downloadAction={handleDownloadTxt}
        onCopy={handleCopyAll}
      />

      {/* Chained Companion Tools in SEO */}
      <ToolWorkflowChaining
        currentToolId="meta-description-generator"
        categoryId="seo"
        outputContent={`Primary Keyword: "${keyword}", Best Snippet: "${activeDesc}"`}
      />

      {/* Suggested Tools */}
      <ToolSuggestions
        currentToolId="meta-description-generator"
        categoryId="seo"
        outputContent={`Primary Keyword: "${keyword}", Best Snippet: "${activeDesc}"`}
      />
    </div>
  );
}
