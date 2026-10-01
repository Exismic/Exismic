"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Monitor, 
  Smartphone, 
  Copy, 
  CheckCircle2, 
  Download, 
  Globe, 
  Star, 
  Calendar, 
  Sliders, 
  Layers, 
  Check, 
  AlertCircle,
  ExternalLink,
  Code2,
  Sun,
  Moon,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

export interface SerpBlueprint {
  id: string;
  title: string;
  category: string;
  pageTitle: string;
  metaDesc: string;
  url: string;
  siteName: string;
  rating?: number;
  reviewCount?: number;
  date?: string;
}

export const SERP_BLUEPRINTS: SerpBlueprint[] = [
  {
    id: "saas-suite",
    title: "AI Creative Suite",
    category: "Software",
    pageTitle: "Exismic - All-in-One AI Studio for Audio, Video & Photo Editing",
    metaDesc: "Create, edit, convert, and enhance audio, video, images, PDFs, and documents with studio-grade online utilities. No software installation required.",
    url: "https://exismic.xyz/tools",
    siteName: "Exismic",
    rating: 4.9,
    reviewCount: 1480,
    date: "Sep 28, 2026"
  },
  {
    id: "b2b-software",
    title: "Enterprise Cloud ERP",
    category: "B2B Solutions",
    pageTitle: "Acme Cloud ERP: Scalable Enterprise Management & Accounting Software",
    metaDesc: "Unify supply chain operations, payroll processing, and financial reporting on a single secure cloud dashboard. Schedule a 30-minute custom product tour.",
    url: "https://acmecloud.com/erp-solutions",
    siteName: "Acme Cloud",
    rating: 4.8,
    reviewCount: 420
  },
  {
    id: "product-review",
    title: "Consumer Tech Review",
    category: "Editorial",
    pageTitle: "10 Best Noise Cancelling Headphones (2026 Ranked & Tested)",
    metaDesc: "We tested 35 wireless headphones for active noise cancellation, deep bass response, and comfort. Compare battery life, mic clarity, and price to pick the winner.",
    url: "https://soundcritic.com/reviews/headphones",
    siteName: "Sound Critic",
    rating: 5.0,
    reviewCount: 38,
    date: "Oct 1, 2026"
  },
  {
    id: "local-clinic",
    title: "Local Healthcare Practice",
    category: "Local Business",
    pageTitle: "Downtown Dental Studio: Gentle Cosmetic & Family Dentistry Austin",
    metaDesc: "Award-winning dental care in central Austin. From same-day teeth whitening to routine family cleanings. Modern tech, zero pain. Book online today.",
    url: "https://downtowndental.com/austin",
    siteName: "Downtown Dental Studio",
    rating: 4.9,
    reviewCount: 295
  },
  {
    id: "dev-tutorial",
    title: "Full-Stack Web Guide",
    category: "Developer",
    pageTitle: "Building High-Speed Next.js Apps: Complete Architecture Guide",
    metaDesc: "Master streaming server components, dynamic caching strategies, and database indexing to achieve sub-second page loads across high-traffic web applications.",
    url: "https://fullstackdigest.com/nextjs-architecture",
    siteName: "Fullstack Digest",
    date: "Sep 15, 2026"
  },
  {
    id: "finance-calculator",
    title: "Financial Planning Tool",
    category: "Finance",
    pageTitle: "Free Loan EMI Calculator: Instant Monthly Payment & Interest Table",
    metaDesc: "Calculate accurate home loan, car loan, and personal financing payments with interactive interest breakdown charts and complete repayment schedules.",
    url: "https://financesmart.io/loan-calculator",
    siteName: "Finance Smart",
    rating: 4.7,
    reviewCount: 890
  }
];

export default function SerpSimulator() {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("saas-suite");
  const [pageTitle, setPageTitle] = useState("Exismic - All-in-One AI Studio for Audio, Video & Photo Editing");
  const [metaDesc, setMetaDesc] = useState("Create, edit, convert, and enhance audio, video, images, PDFs, and documents with studio-grade online utilities. No software installation required.");
  const [url, setUrl] = useState("https://exismic.xyz/tools");
  const [siteName, setSiteName] = useState("Exismic");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [googleTheme, setGoogleTheme] = useState<"dark" | "light">("dark");
  const [showRating, setShowRating] = useState(true);
  const [rating, setRating] = useState<number>(4.9);
  const [reviewCount, setReviewCount] = useState<number>(1480);
  const [showDate, setShowDate] = useState(true);
  const [dateStr, setDateStr] = useState("Sep 28, 2026");
  const [copied, setCopied] = useState(false);

  const handleSelectBlueprint = (bp: SerpBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setPageTitle(bp.pageTitle);
    setMetaDesc(bp.metaDesc);
    setUrl(bp.url);
    setSiteName(bp.siteName);
    if (bp.rating) {
      setShowRating(true);
      setRating(bp.rating);
      setReviewCount(bp.reviewCount || 100);
    } else {
      setShowRating(false);
    }
    if (bp.date) {
      setShowDate(true);
      setDateStr(bp.date);
    } else {
      setShowDate(false);
    }
  };

  const domain = useMemo(() => {
    try {
      return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace("www.", "");
    } catch {
      return "example.com";
    }
  }, [url]);

  const breadcrumbs = useMemo(() => {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      const segments = parsed.pathname.split("/").filter(Boolean);
      if (segments.length === 0) return "";
      return " › " + segments.map(s => s.replace(/[-_]/g, " ")).join(" › ");
    } catch {
      return "";
    }
  }, [url]);

  const titleLength = pageTitle.length;
  // Estimated pixel width calculation (~9.2px average in standard Google Arial 20px)
  const titlePx = Math.round(titleLength * 9.2);
  const isTitleOver = titlePx > 580;
  const descLength = metaDesc.length;
  const isDescOver = descLength > 160;

  const outputCode = useMemo(() => {
    return `<title>${pageTitle}</title>\n<meta name="description" content="${metaDesc}" />`;
  }, [pageTitle, metaDesc]);

  const handleCopyMeta = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputCode], { type: "text/html;charset=utf-8" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "google-serp-meta-tags.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top 6 Curated SEO Blueprints */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400">
              Instant Google Search Blueprints
            </h2>
          </div>
          <span className="text-[11px] font-medium text-zinc-400">
            Click any blueprint to inspect live Google SERP snippet previews
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SERP_BLUEPRINTS.map((bp) => {
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
                    {bp.siteName}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {bp.title}
                  </p>
                  <p className="text-xs text-zinc-400 line-clamp-1">
                    {bp.pageTitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Inputs & Controls): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-4">
            {/* Title Tag Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Google Search Title Tag *
                </label>
                <span className={cn(
                  "text-[11px] font-mono font-bold px-2 py-0.5 rounded",
                  isTitleOver ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                )}>
                  {titleLength} / 60 chars ({titlePx}px / 580px max)
                </span>
              </div>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => {
                  setPageTitle(e.target.value);
                  setSelectedBlueprintId("");
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none transition-all placeholder:text-zinc-600"
              />
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
                <div
                  style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
                  className={cn(
                    "h-full transition-all duration-300",
                    isTitleOver ? "bg-amber-400" : "bg-cyan-400"
                  )}
                />
              </div>
            </div>

            {/* Target URL & Site Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Page Destination Link
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs font-mono font-medium text-white focus:border-cyan-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Website Brand Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => {
                    setSiteName(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-medium text-white focus:border-cyan-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Meta Description Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Search Result Snippet (Meta Description) *
                </label>
                <span className={cn(
                  "text-[11px] font-mono font-bold px-2 py-0.5 rounded",
                  isDescOver ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                )}>
                  {descLength} / 160 chars
                </span>
              </div>
              <textarea
                value={metaDesc}
                onChange={(e) => {
                  setMetaDesc(e.target.value);
                  setSelectedBlueprintId("");
                }}
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-medium text-white focus:border-cyan-500 focus:outline-none transition-all resize-none placeholder:text-zinc-600"
              />
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
                <div
                  style={{ width: `${Math.min(100, (descLength / 160) * 100)}%` }}
                  className={cn(
                    "h-full transition-all duration-300",
                    isDescOver ? "bg-amber-400" : "bg-cyan-400"
                  )}
                />
              </div>
            </div>

            {/* Rich Snippet Add-Ons */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 block">
                Rich Search Enhancements (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Star Ratings Toggle */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showRating}
                        onChange={(e) => setShowRating(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span>Star Rating Snippet</span>
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono">★ {rating}</span>
                  </div>
                  {showRating && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={rating}
                        onChange={(e) => setRating(parseFloat(e.target.value) || 5)}
                        className="w-20 p-1.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs text-center"
                      />
                      <input
                        type="number"
                        value={reviewCount}
                        onChange={(e) => setReviewCount(parseInt(e.target.value) || 100)}
                        placeholder="Reviews"
                        className="flex-1 p-1.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs text-center"
                      />
                    </div>
                  )}
                </div>

                {/* Published Date Toggle */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showDate}
                        onChange={(e) => setShowDate(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span>Publication Date</span>
                    </label>
                  </div>
                  {showDate && (
                    <input
                      type="text"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      placeholder="e.g. Sep 28, 2026"
                      className="w-full p-1.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs text-center"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyMeta}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                <span>{copied ? "Copied HTML Meta Code!" : "Copy HTML Meta Code"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={15} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (SERP Mockup): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-5">
            {/* SERP Simulator Header Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Search size={14} className="text-cyan-400" />
                <span>Google Search Result Simulator</span>
              </span>

              <div className="flex items-center gap-2">
                {/* Dark vs Light Google Search Toggle */}
                <button
                  type="button"
                  onClick={() => setGoogleTheme(googleTheme === "dark" ? "light" : "dark")}
                  className="p-1.5 rounded-xl bg-black/60 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Toggle Google Dark / Light Theme"
                >
                  {googleTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                </button>

                {/* Device Selector */}
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setDevice("desktop")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                      device === "desktop"
                        ? "bg-cyan-500 text-black font-black shadow-md shadow-cyan-500/20"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Monitor size={12} />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice("mobile")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer",
                      device === "mobile"
                        ? "bg-cyan-500 text-black font-black shadow-md shadow-cyan-500/20"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <Smartphone size={12} />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pixel-Accurate Google Result Card Mockup */}
            <div className="flex items-center justify-center min-h-[300px] py-4">
              <div
                className={cn(
                  "p-5 rounded-2xl transition-all shadow-2xl border",
                  device === "mobile" ? "max-w-[380px] w-full" : "w-full",
                  googleTheme === "dark"
                    ? "bg-[#202124] text-white border-[#3c4043]"
                    : "bg-[#ffffff] text-black border-[#dadce0]"
                )}
              >
                {/* Google Favicon & Breadcrumb Header */}
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                    googleTheme === "dark" ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-800"
                  )}>
                    {siteName ? siteName.charAt(0).toUpperCase() : "G"}
                  </div>
                  <div className="text-[12px] leading-tight overflow-hidden">
                    <p className={cn("font-medium truncate", googleTheme === "dark" ? "text-white" : "text-[#202124]")}>
                      {siteName || "Example Website"}
                    </p>
                    <p className={cn("text-[11px] truncate font-sans", googleTheme === "dark" ? "text-[#bdc1c6]" : "text-[#4d5156]")}>
                      https://{domain}{breadcrumbs}
                    </p>
                  </div>
                </div>

                {/* Clickable Blue Google Search Title */}
                <h3 className={cn(
                  "text-[18px] sm:text-[20px] leading-snug font-normal hover:underline cursor-pointer break-words pt-1 font-sans",
                  googleTheme === "dark" ? "text-[#8ab4f8]" : "text-[#1a0dab]"
                )}>
                  {pageTitle}
                </h3>

                {/* Rating Snippet Stars */}
                {showRating && (
                  <div className="flex items-center gap-1.5 pt-1 text-[12px] font-sans">
                    <span className="text-[#fbbc04] font-bold">★ {rating.toFixed(1)}</span>
                    <span className={googleTheme === "dark" ? "text-[#bdc1c6]" : "text-[#70757a]"}>
                      ({reviewCount.toLocaleString()} reviews)
                    </span>
                  </div>
                )}

                {/* Meta Description Text */}
                <p className={cn(
                  "text-[14px] leading-relaxed pt-1.5 font-sans",
                  googleTheme === "dark" ? "text-[#bdc1c6]" : "text-[#4d5156]",
                  device === "mobile" ? "line-clamp-3" : "line-clamp-2"
                )}>
                  {showDate && (
                    <span className={cn("font-medium mr-1.5", googleTheme === "dark" ? "text-[#9aa0a6]" : "text-[#70757a]")}>
                      {dateStr} —
                    </span>
                  )}
                  {metaDesc}
                </p>
              </div>
            </div>

            {/* Google SERP Health Diagnostics */}
            <div className="rounded-2xl border border-white/5 bg-black/40 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Title Tag Truncation Status:</span>
                <span className={cn("font-mono font-bold", isTitleOver ? "text-amber-400" : "text-cyan-400")}>
                  {isTitleOver ? "⚠️ Over 580px (Will show ...)" : "✓ Optimal (Under 60 chars / 580px)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Description Snippet Status:</span>
                <span className={cn("font-mono font-bold", isDescOver ? "text-amber-400" : "text-cyan-400")}>
                  {isDescOver ? "⚠️ Over 160 chars (May truncate)" : "✓ Optimal (Under 160 chars)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Retention Bar */}
      <ResultRetentionBar
        toolType="serp-simulator"
        toolName="Google SERP Snippet Simulator"
        title={`Google SERP Preview for ${siteName}`}
        content={outputCode}
        downloadLabel="Download HTML Meta Code (.html)"
        downloadAction={handleDownload}
        onCopy={handleCopyMeta}
      />

      {/* Chained Companion Tools in SEO */}
      <ToolWorkflowChaining
        currentToolId="serp-simulator"
        categoryId="seo"
        outputContent={`Google Title: "${pageTitle}", Meta: "${metaDesc}"`}
      />

      {/* Suggested Tools */}
      <ToolSuggestions
        currentToolId="serp-simulator"
        categoryId="seo"
        outputContent={`Google Title: "${pageTitle}", Meta: "${metaDesc}"`}
      />
    </div>
  );
}
