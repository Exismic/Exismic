"use client";

import React, { useState, useMemo } from "react";
import { 
  Share2, 
  Copy, 
  CheckCircle2, 
  Download, 
  Globe, 
  ImageIcon, 
  Check, 
  AlertCircle,
  ExternalLink,
  Code2,
  RefreshCw,
  Eye,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  MoreHorizontal,
  Repeat
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";

export interface OgBlueprint {
  id: string;
  title: string;
  category: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  ogUrl: string;
  siteName: string;
  twitterHandle: string;
}

export const OG_BLUEPRINTS: OgBlueprint[] = [
  {
    id: "saas-launch",
    title: "AI SaaS Studio Launch",
    category: "Software",
    ogTitle: "Exismic - All-in-One Studio for Audio, Video & Image Creation",
    ogDesc: "Create, edit, convert, and enhance audio, video, images, PDFs, and documents with studio-grade online utilities.",
    ogImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop&q=80",
    ogUrl: "https://exismic.xyz",
    siteName: "Exismic",
    twitterHandle: "@exismic_app"
  },
  {
    id: "dev-tool",
    title: "Developer Open Source Tool",
    category: "Dev Utility",
    ogTitle: "GitTrace: Interactive Git History & Commit Visualizer",
    ogDesc: "Explore branch relationships, debug merge conflicts, and inspect code timelines in your browser with zero setup.",
    ogImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop&q=80",
    ogUrl: "https://gittrace.dev",
    siteName: "GitTrace",
    twitterHandle: "@gittrace_dev"
  },
  {
    id: "dtc-product",
    title: "E-Commerce Luxury Drop",
    category: "Retail",
    ogTitle: "AeroGlide Pro - The Ultra-Lightweight Marathon Running Shoe",
    ogDesc: "Engineered with carbon-fiber responsive propulsion and breathable mesh for peak race day performance.",
    ogImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=630&fit=crop&q=80",
    ogUrl: "https://aeroglide.shop/products/pro",
    siteName: "AeroGlide",
    twitterHandle: "@aeroglide_hq"
  },
  {
    id: "design-agency",
    title: "Creative Design Agency",
    category: "B2B Agency",
    ogTitle: "Studio Minimal: Brand Strategy & Digital Product Design",
    ogDesc: "We partner with visionary founders to build category-defining web experiences, identity systems, and mobile apps.",
    ogImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=630&fit=crop&q=80",
    ogUrl: "https://studiominimal.design",
    siteName: "Studio Minimal",
    twitterHandle: "@studio_minimal"
  },
  {
    id: "tech-guide",
    title: "Technical In-Depth Tutorial",
    category: "Editorial",
    ogTitle: "The Complete Guide to Next.js Streaming & Server Architecture",
    ogDesc: "Learn how to optimize Time to First Byte (TTFB), leverage Suspense boundaries, and scale dynamic routes smoothly.",
    ogImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&fit=crop&q=80",
    ogUrl: "https://fullstackdigest.com/nextjs-streaming",
    siteName: "Fullstack Digest",
    twitterHandle: "@fullstackdigest"
  },
  {
    id: "podcast-series",
    title: "Creator Video Podcast",
    category: "Creator",
    ogTitle: "Bootstrapping to $50k MRR with Zero VC Funding (Ep. 42)",
    ogDesc: "How two indie developers turned a weekend hackathon project into a profitable SaaS business while working full-time.",
    ogImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&h=630&fit=crop&q=80",
    ogUrl: "https://indiepulse.fm/episodes/42",
    siteName: "IndiePulse FM",
    twitterHandle: "@indiepulse_fm"
  }
];

export default function OgPreviewer() {
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>("saas-launch");
  const [ogTitle, setOgTitle] = useState("Exismic - All-in-One Studio for Audio, Video & Image Creation");
  const [ogDesc, setOgDesc] = useState("Create, edit, convert, and enhance audio, video, images, PDFs, and documents with studio-grade online utilities.");
  const [ogImage, setOgImage] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop&q=80");
  const [ogUrl, setOgUrl] = useState("https://exismic.xyz");
  const [siteName, setSiteName] = useState("Exismic");
  const [twitterHandle, setTwitterHandle] = useState("@exismic_app");
  const [platform, setPlatform] = useState<"twitter" | "linkedin" | "facebook" | "discord">("twitter");
  const [copied, setCopied] = useState(false);

  const handleSelectBlueprint = (bp: OgBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setOgTitle(bp.ogTitle);
    setOgDesc(bp.ogDesc);
    setOgImage(bp.ogImage);
    setOgUrl(bp.ogUrl);
    setSiteName(bp.siteName);
    setTwitterHandle(bp.twitterHandle);
  };

  const domain = useMemo(() => {
    try {
      return new URL(ogUrl.startsWith("http") ? ogUrl : `https://${ogUrl}`).hostname.replace("www.", "");
    } catch {
      return "example.com";
    }
  }, [ogUrl]);

  // Clean Generated Meta Code
  const outputCode = useMemo(() => {
    return `<!-- Open Graph / Facebook / LinkedIn / Discord -->\n` +
      `<meta property="og:type" content="website" />\n` +
      `<meta property="og:site_name" content="${siteName}" />\n` +
      `<meta property="og:url" content="${ogUrl}" />\n` +
      `<meta property="og:title" content="${ogTitle}" />\n` +
      `<meta property="og:description" content="${ogDesc}" />\n` +
      `<meta property="og:image" content="${ogImage}" />\n` +
      `<meta property="og:image:width" content="1200" />\n` +
      `<meta property="og:image:height" content="630" />\n\n` +
      `<!-- Twitter / X Cards -->\n` +
      `<meta name="twitter:card" content="summary_large_image" />\n` +
      `<meta name="twitter:site" content="${twitterHandle}" />\n` +
      `<meta name="twitter:creator" content="${twitterHandle}" />\n` +
      `<meta name="twitter:url" content="${ogUrl}" />\n` +
      `<meta name="twitter:title" content="${ogTitle}" />\n` +
      `<meta name="twitter:description" content="${ogDesc}" />\n` +
      `<meta name="twitter:image" content="${ogImage}" />`;
  }, [ogTitle, ogDesc, ogImage, ogUrl, siteName, twitterHandle]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputCode], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "social-meta-tags.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const titleLength = ogTitle.length;
  const descLength = ogDesc.length;

  return (
    <div className="w-full space-y-8">
      {/* Top 6 Curated SEO Blueprints */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400">
              Instant Social Share Blueprints
            </h2>
          </div>
          <span className="text-[11px] font-medium text-zinc-400">
            Click any blueprint to inspect real-world social card previews
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {OG_BLUEPRINTS.map((bp) => {
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
                    {bp.ogTitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Metadata Inputs): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl space-y-4">
            {/* OG Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Card Headline (og:title) *
                </label>
                <span className={cn(
                  "text-[11px] font-mono font-bold",
                  titleLength > 60 ? "text-amber-400" : "text-cyan-400"
                )}>
                  {titleLength} / 60 chars
                </span>
              </div>
              <input
                type="text"
                value={ogTitle}
                onChange={(e) => {
                  setOgTitle(e.target.value);
                  setSelectedBlueprintId("");
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none transition-all placeholder:text-zinc-600"
              />
            </div>

            {/* OG Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Summary Snippet (og:description) *
                </label>
                <span className={cn(
                  "text-[11px] font-mono font-bold",
                  descLength > 160 ? "text-amber-400" : "text-cyan-400"
                )}>
                  {descLength} / 160 chars
                </span>
              </div>
              <textarea
                value={ogDesc}
                onChange={(e) => {
                  setOgDesc(e.target.value);
                  setSelectedBlueprintId("");
                }}
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-medium text-white focus:border-cyan-500 focus:outline-none transition-all resize-none placeholder:text-zinc-600"
              />
            </div>

            {/* OG Image URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-cyan-400" />
                  <span>Banner Image Link (og:image) *</span>
                </label>
                <span className="text-[11px] text-zinc-500">Ideal 1200 x 630 px</span>
              </div>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => {
                  setOgImage(e.target.value);
                  setSelectedBlueprintId("");
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs font-mono font-medium text-white focus:border-cyan-500 focus:outline-none transition-all"
              />
            </div>

            {/* OG URL and Site Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Target Page Link (og:url)
                </label>
                <input
                  type="text"
                  value={ogUrl}
                  onChange={(e) => {
                    setOgUrl(e.target.value);
                    setSelectedBlueprintId("");
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs font-mono font-medium text-white focus:border-cyan-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Website / Brand Name
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

            {/* Twitter Handle */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Twitter / X Creator Handle
              </label>
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => {
                  setTwitterHandle(e.target.value);
                  setSelectedBlueprintId("");
                }}
                placeholder="@username"
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-xs font-mono font-medium text-white focus:border-cyan-500 focus:outline-none transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                <span>{copied ? "Copied All Tags!" : "Copy HTML Meta Tags"}</span>
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

        {/* Right Column (Platform Simulator): 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-5">
            {/* Platform Selector Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Eye size={14} className="text-cyan-400" />
                <span>Live Social Preview</span>
              </span>
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-white/10">
                {(["twitter", "linkedin", "facebook", "discord"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer",
                      platform === p
                        ? "bg-cyan-500 text-black font-black shadow-md shadow-cyan-500/20"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {p === "twitter" ? "X / Twitter" : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Social Card Canvas */}
            <div className="flex items-center justify-center min-h-[340px] py-2">
              {/* Twitter / X Large Summary Card */}
              {platform === "twitter" && (
                <div className="w-full max-w-[460px] rounded-3xl bg-[#000000] border border-[#2f3336] overflow-hidden shadow-2xl transition-all">
                  <div className="aspect-[1.91/1] w-full bg-zinc-900 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ogImage}
                      alt={ogTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-medium text-white">
                      {domain}
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <p className="text-xs text-[#71767b] font-medium">From {domain}</p>
                    <p className="text-sm font-bold text-white line-clamp-1 leading-snug">
                      {ogTitle}
                    </p>
                    <p className="text-xs text-[#71767b] line-clamp-2 leading-relaxed">
                      {ogDesc}
                    </p>
                  </div>
                </div>
              )}

              {/* LinkedIn Post Card */}
              {platform === "linkedin" && (
                <div className="w-full max-w-[460px] rounded-2xl bg-[#1b1f23] border border-[#38434f] overflow-hidden shadow-2xl transition-all">
                  <div className="aspect-[1.91/1] w-full bg-zinc-900 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ogImage}
                      alt={ogTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="p-3.5 space-y-1 bg-[#1b1f23]">
                    <p className="text-sm font-bold text-white line-clamp-1 leading-snug">
                      {ogTitle}
                    </p>
                    <p className="text-xs text-zinc-400 font-medium">
                      {domain} • {Math.ceil(descLength / 25)} min read
                    </p>
                  </div>
                </div>
              )}

              {/* Facebook Feed Card */}
              {platform === "facebook" && (
                <div className="w-full max-w-[460px] rounded-xl bg-[#242526] border border-[#393a3b] overflow-hidden shadow-2xl transition-all">
                  <div className="aspect-[1.91/1] w-full bg-zinc-900 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ogImage}
                      alt={ogTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="p-3 space-y-1 bg-[#242526]">
                    <span className="text-[10px] uppercase font-bold text-[#b0b3b8] tracking-wider">
                      {domain}
                    </span>
                    <p className="text-sm font-bold text-white line-clamp-1">
                      {ogTitle}
                    </p>
                    <p className="text-xs text-[#b0b3b8] line-clamp-1">
                      {ogDesc}
                    </p>
                  </div>
                </div>
              )}

              {/* Discord Rich Embed */}
              {platform === "discord" && (
                <div className="w-full max-w-[460px] rounded-xl bg-[#2b2d31] p-4 border-l-4 border-cyan-400 shadow-2xl space-y-2 transition-all">
                  <span className="text-[11px] font-bold text-zinc-400 block">
                    {siteName}
                  </span>
                  <a href={ogUrl} className="text-sm font-bold text-[#00a8fc] hover:underline block line-clamp-1">
                    {ogTitle}
                  </a>
                  <p className="text-xs text-[#dbdee1] leading-relaxed line-clamp-2">
                    {ogDesc}
                  </p>
                  <div className="rounded-lg overflow-hidden aspect-[1.91/1] w-full bg-zinc-900 mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ogImage}
                      alt={ogTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quality Checklist */}
            <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Image Resolution:</span>
                <span className="text-cyan-300 font-mono font-bold">1200 x 630 px (1.91:1 standard)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Card Format:</span>
                <span className="text-cyan-300 font-mono font-bold">summary_large_image</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Retention Bar */}
      <ResultRetentionBar
        toolType="og-previewer"
        toolName="Open Graph Social Link Previewer"
        title={`Social Meta Tags for ${domain}`}
        content={outputCode}
        downloadLabel="Download HTML Meta Tags (.html)"
        downloadAction={handleDownload}
        onCopy={handleCopyCode}
      />

      {/* Chained Companion Tools in SEO */}
      <ToolWorkflowChaining
        currentToolId="og-previewer"
        categoryId="seo"
        outputContent={`OG Title: "${ogTitle}", Target: ${ogUrl}`}
      />

      {/* Suggested Tools */}
      <ToolSuggestions
        currentToolId="og-previewer"
        categoryId="seo"
        outputContent={`OG Title: "${ogTitle}", Target: ${ogUrl}`}
      />
    </div>
  );
}
