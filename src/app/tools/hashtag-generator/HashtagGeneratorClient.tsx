"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash,
  Copy,
  CheckCircle2,
  Check,
  Camera,
  MessageSquare,
  Play,
  Smartphone,
  Globe,
  Flame,
  Layers,
  Target,
  RotateCcw,
  Info,
  Sliders,
  Eye,
  Share2,
  Bookmark,
  TrendingUp,
  LayoutGrid,
  Heart,
  Send,
  MoreHorizontal,
  Disc3,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  RefreshCw,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = "all" | "instagram" | "tiktok" | "youtube" | "twitter";

interface HashtagGroup {
  category: string;
  icon: React.ReactNode;
  badgeColor: string;
  reachLabel: string;
  tags: string[];
}

interface NicheBlueprint {
  id: string;
  title: string;
  subtitle: string;
  keywords: string;
  platform: Platform;
  icon: React.ReactNode;
}

const NICHE_BLUEPRINTS: NicheBlueprint[] = [
  {
    id: "fitness",
    title: "Fitness & Gym",
    subtitle: "Workouts, bodybuilding & motivation",
    keywords: "fitness motivation gym workout bodybuilding health",
    platform: "instagram",
    icon: <Flame className="w-4 h-4 text-amber-400" />,
  },
  {
    id: "travel",
    title: "Travel & Nomad",
    subtitle: "Wanderlust, vacations & exploring",
    keywords: "travel photography wanderlust adventure explore vacation",
    platform: "instagram",
    icon: <Globe className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: "food",
    title: "Food & Recipes",
    subtitle: "Home cooking, foodie & baking",
    keywords: "foodie recipes homecooking delicious foodtok baking",
    platform: "tiktok",
    icon: <Target className="w-4 h-4 text-rose-400" />,
  },
  {
    id: "tech",
    title: "Tech & Coding",
    subtitle: "Software, startups & AI tools",
    keywords: "technology coding webdevelopment software artificialintelligence developer",
    platform: "twitter",
    icon: <Layers className="w-4 h-4 text-indigo-400" />,
  },
  {
    id: "fashion",
    title: "Fashion & OOTD",
    subtitle: "Streetwear, aesthetic & lookbook",
    keywords: "fashionstyle ootd streetwear aesthetic outfitoftheday vintage",
    platform: "instagram",
    icon: <Camera className="w-4 h-4 text-pink-400" />,
  },
  {
    id: "business",
    title: "Small Business",
    subtitle: "Entrepreneurship & handmade goods",
    keywords: "smallbusiness entrepreneur founderlife ecommerce handmade businessowner",
    platform: "tiktok",
    icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: "gaming",
    title: "Gaming & Clips",
    subtitle: "Streaming, gameplay & esports",
    keywords: "gaming gamer twitchstreamer gamingclips esports gameplay",
    platform: "youtube",
    icon: <Play className="w-4 h-4 text-purple-400" />,
  },
  {
    id: "content",
    title: "Creator Growth",
    subtitle: "Reels tips, video hooks & viral reach",
    keywords: "contentcreator viralvideo videoediting creatortips youtubeshorts socialmediamarketing",
    platform: "all",
    icon: <Hash className="w-4 h-4 text-blue-400" />,
  },
];

const PLATFORM_OPTIONS: { id: Platform; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: "all", label: "All Platforms", icon: <Globe className="w-3.5 h-3.5" />, hint: "Balanced set for cross-posting" },
  { id: "instagram", label: "Instagram", icon: <Camera className="w-3.5 h-3.5" />, hint: "Best for Reels & feed discovery" },
  { id: "tiktok", label: "TikTok", icon: <Smartphone className="w-3.5 h-3.5" />, hint: "High-velocity algorithm tags" },
  { id: "youtube", label: "YouTube Shorts", icon: <Play className="w-3.5 h-3.5" />, hint: "Search rank & Shorts shelf" },
  { id: "twitter", label: "X / Twitter", icon: <MessageSquare className="w-3.5 h-3.5" />, hint: "Trending conversation tags" },
];

export default function HashtagGenerator() {
  const [keywords, setKeywords] = useState("");
  const [platform, setPlatform] = useState<Platform>("all");
  const [count, setCount] = useState(15);
  const [mixTrending, setMixTrending] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<HashtagGroup[] | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isCaptionCopied, setIsCaptionCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<"instagram" | "tiktok" | "youtube">("instagram");
  const [customCaption, setCustomCaption] = useState<string>("");
  const [isLiked, setIsLiked] = useState(false);
  const [isInstagramDots, setIsInstagramDots] = useState(true);
  const [isExpandedMore, setIsExpandedMore] = useState(false);

  const [strategyTip, setStrategyTip] = useState<string | null>(null);
  const [generationSource, setGenerationSource] = useState<"ai" | "semantic_engine" | null>(null);

  // Generate dynamic, real AI categorized hashtags
  const generateHashtags = async (customKeywords?: string, customPlatform?: Platform) => {
    const text = customKeywords !== undefined ? customKeywords : keywords;
    const activePlatform = customPlatform !== undefined ? customPlatform : platform;

    if (!text.trim()) return;

    setIsGenerating(true);
    setResults(null);

    try {
      const response = await fetch("/api/tools/creator/hashtag-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: text.trim(),
          platform: activePlatform,
          mixTrending,
          count,
        }),
      });

      const data = await response.json();

      if (data && (data.broadReach || data.nicheCommunity || data.specificLongTail)) {
        const unique = (tags: string[]) => Array.from(new Set(tags)).filter(Boolean);

        const groups: HashtagGroup[] = [
          ...(mixTrending && Array.isArray(data.broadReach) && data.broadReach.length > 0
            ? [
                {
                  category: "Broad Viral Reach",
                  icon: <Flame className="w-4 h-4 text-amber-400" />,
                  badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-300",
                  reachLabel: "High Volume (500k+ posts)",
                  tags: unique(data.broadReach as string[]),
                },
              ]
            : []),
          ...(Array.isArray(data.nicheCommunity) && data.nicheCommunity.length > 0
            ? [
                {
                  category: "Targeted Community",
                  icon: <Target className="w-4 h-4 text-indigo-400" />,
                  badgeColor: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
                  reachLabel: "Medium Volume (50k–500k posts)",
                  tags: unique(data.nicheCommunity as string[]),
                },
              ]
            : []),
          ...(Array.isArray(data.specificLongTail) && data.specificLongTail.length > 0
            ? [
                {
                  category: "Specific Long-Tail",
                  icon: <Layers className="w-4 h-4 text-emerald-400" />,
                  badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                  reachLabel: "High Conversion (Top Search Rank)",
                  tags: unique(data.specificLongTail as string[]),
                },
              ]
            : []),
        ].filter((g) => g.tags.length > 0);

        setResults(groups);
        setGenerationSource(data.source === "ai" ? "ai" : "semantic_engine");
        if (data.strategyTip) setStrategyTip(data.strategyTip);
        if (data.caption) setCustomCaption(data.caption);
        setIsExpandedMore(true);
      } else {
        throw new Error(data.error || "Failed to generate hashtags");
      }
    } catch (err) {
      console.error("Failed to generate AI hashtags:", err);
      // Fallback in case of network issue
      const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
      const root = words[0] || "content";
      const fallbackGroups: HashtagGroup[] = [
        ...(mixTrending ? [{
          category: "Broad Viral Reach",
          icon: <Flame className="w-4 h-4 text-amber-400" />,
          badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-300",
          reachLabel: "High Volume (500k+ posts)",
          tags: [`${root}of${activePlatform === "instagram" ? "instagram" : "tiktok"}`, `${root}world`, "explorepage", "creators"],
        }] : []),
        {
          category: "Targeted Community",
          icon: <Target className="w-4 h-4 text-indigo-400" />,
          badgeColor: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
          reachLabel: "Medium Volume (50k–500k posts)",
          tags: [`${root}vibes`, `allthings${root}`, `${root}culture`, `${root}enthusiast`],
        },
        {
          category: "Specific Long-Tail",
          icon: <Layers className="w-4 h-4 text-emerald-400" />,
          badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
          reachLabel: "High Conversion (Top Search Rank)",
          tags: [`my${root}journey`, `${root}aesthetic`, `best${root}ideas`],
        }
      ];
      setResults(fallbackGroups);
      setGenerationSource("semantic_engine");
      setCustomCaption(`Everything you need to know about ${root}. Save this post for later! 👇`);
      setIsExpandedMore(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // 1-Click Apply Blueprint
  const applyBlueprint = (bp: NicheBlueprint) => {
    setKeywords(bp.keywords);
    setPlatform(bp.platform);
    if (bp.platform === "tiktok") setPreviewTab("tiktok");
    else if (bp.platform === "youtube") setPreviewTab("youtube");
    else setPreviewTab("instagram");
    generateHashtags(bp.keywords, bp.platform);
  };

  // Copy single tag
  const copyToClipboard = (tag: string) => {
    navigator.clipboard.writeText(`#${tag}`);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1800);
  };

  // Copy All in different formats
  const copyAllFormatted = (format: "inline" | "dots" | "commas") => {
    if (!results) return;
    const allTags = results.flatMap((g) => g.tags).map((t) => `#${t}`);

    let text = "";
    if (format === "inline") {
      text = allTags.join(" ");
    } else if (format === "dots") {
      text = `.\n.\n.\n${allTags.join(" ")}`;
    } else if (format === "commas") {
      text = results.flatMap((g) => g.tags).join(", ");
    }

    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Copy Full Post Caption + Formatted Hashtags
  const copyFullPostCaption = () => {
    if (!results) return;
    const allTags = results.flatMap((g) => g.tags).map((t) => `#${t}`);
    const captionBase = customCaption.trim() || "Check this out! Save for later 👇";

    let fullPost = "";
    if (previewTab === "instagram") {
      fullPost = isInstagramDots
        ? `${captionBase}\n.\n.\n.\n${allTags.join(" ")}`
        : `${captionBase}\n\n${allTags.join(" ")}`;
    } else if (previewTab === "tiktok") {
      fullPost = `${captionBase} ${allTags.slice(0, 10).join(" ")}`;
    } else {
      fullPost = `${allTags.slice(0, 3).join(" ")}\n\n${captionBase}\n\nTags:\n${allTags.join(" ")}`;
    }

    navigator.clipboard.writeText(fullPost);
    setIsCaptionCopied(true);
    setTimeout(() => setIsCaptionCopied(false), 2200);
  };

  const allTagsList = results ? results.flatMap((g) => g.tags).map((t) => `#${t}`) : [];

  return (
    <div className="w-full space-y-8" suppressHydrationWarning>
      {/* ==================================================================== */}
      {/* 1. TOP CREATOR NICHE BLUEPRINTS GALLERY (Zero Dead Void Space)      */}
      {/* ==================================================================== */}
      <div className="rounded-3xl border border-indigo-500/20 bg-[#090b14]/90 p-5 sm:p-7 shadow-[0_0_40px_rgba(99,102,241,0.08)] backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
              <LayoutGrid className="w-4 h-4 text-indigo-400" />
              <span>Instant Niche Blueprints</span>
            </h3>
            <p className="text-xs font-medium text-zinc-400">
              One-click tested hashtag formulas tuned for popular creator niches. Click any card to load instantly.
            </p>
          </div>
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-300">
            0s Wait • 1-Click
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {NICHE_BLUEPRINTS.map((bp) => (
            <button
              key={bp.id}
              type="button"
              onClick={() => applyBlueprint(bp)}
              className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 text-left transition-all hover:-translate-y-1 hover:border-indigo-500/40 hover:bg-indigo-500/[0.08] hover:shadow-lg active:translate-y-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/40 shadow-inner group-hover:scale-110 transition-transform">
                  {bp.icon}
                </div>
                <span className="text-[9px] font-bold uppercase text-zinc-500 group-hover:text-indigo-300">
                  {bp.platform}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xs font-black text-zinc-200 group-hover:text-indigo-300 transition-colors truncate">
                  {bp.title}
                </p>
                <p className="text-[9px] font-medium text-zinc-500 truncate mt-0.5">{bp.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MAIN CREATOR WORKSPACE: CONTROLS & LIVE RESULTS STAGE             */}
      {/* ==================================================================== */}
      <main className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column: Generator Controls */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-indigo-500/20 bg-[#090b14]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Sliders size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Hashtag Settings</h3>
                  <p className="text-[10px] text-zinc-400">Customize keywords and target reach</p>
                </div>
              </div>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[9px] font-bold uppercase text-zinc-400">
                v2.0
              </span>
            </div>

            <div className="space-y-6">
              {/* Keywords Input */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-300">
                  <span>Content Keywords or Niche</span>
                  <span className="text-[10px] font-normal text-zinc-500">Separate with spaces</span>
                </label>
                <textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. fitness motivation gym workout"
                  className="h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/60 p-4 text-xs font-bold text-white placeholder-zinc-500 shadow-inner outline-none transition-all focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                />

                {/* Quick Topic Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "Fitness & Gym",
                    "Cute Cats",
                    "Travel Vlog",
                    "Coding Tips",
                    "Food Recipes",
                    "Street Fashion",
                    "AI Tools",
                  ].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        const words = topic.toLowerCase().replace("&", "");
                        setKeywords(words);
                        generateHashtags(words, platform);
                      }}
                      className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-zinc-400 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300"
                    >
                      +{topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Platform Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Target Platform
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PLATFORM_OPTIONS.map((p) => {
                    const isSelected = platform === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPlatform(p.id);
                          if (p.id === "tiktok") setPreviewTab("tiktok");
                          else if (p.id === "youtube") setPreviewTab("youtube");
                          else if (p.id === "instagram") setPreviewTab("instagram");
                        }}
                        className={cn(
                          "flex min-h-12 items-center gap-2 rounded-xl border p-2.5 text-left text-[11px] font-bold transition-all",
                          isSelected
                            ? "border-indigo-400/60 bg-indigo-500/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/40"
                            : "border-white/5 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        )}
                      >
                        <span className={isSelected ? "text-indigo-300" : "text-zinc-500"}>
                          {p.icon}
                        </span>
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hashtag Count Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-300">
                  <span>Hashtag Count</span>
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 font-mono text-indigo-300">
                    {count} Tags
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                  <span>5 (Minimal)</span>
                  <span>15 (Standard)</span>
                  <span>30 (Maximum)</span>
                </div>
              </div>

              {/* Trending Reach Mix Toggle */}
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-zinc-200">Include High-Reach Viral Tags</p>
                  <p className="text-[10px] text-zinc-500">
                    Mix high-volume discovery tags with focused community tags
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMixTrending(!mixTrending)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    mixTrending ? "bg-indigo-600" : "bg-zinc-800"
                  )}
                >
                  <motion.div
                    className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-md"
                    animate={{ x: mixTrending ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Generate Button (Strictly ZERO SPARKLES) */}
              <button
                type="button"
                onClick={() => generateHashtags()}
                disabled={isGenerating || !keywords.trim()}
                className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 py-4 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <RotateCcw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Hash className="w-4 h-4 text-white" />
                )}
                <span>{isGenerating ? "Analyzing Niches & Algorithms..." : "Generate Hashtag Set"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Interactive Live Social Preview */}
        <div className="space-y-6 lg:col-span-7">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[460px] flex-col items-center justify-center rounded-3xl border border-indigo-500/20 bg-[#090b14]/90 p-12 text-center shadow-xl"
              >
                <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <Hash className="h-8 w-8 text-indigo-400 animate-pulse" />
                </div>
                <h4 className="text-xl font-bold text-white">Synthesizing Creator Hashtags</h4>
                <p className="mt-1 text-xs text-zinc-400">
                  Balancing high-reach discovery with community engagement for {platform}...
                </p>
              </motion.div>
            ) : results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Results Header with Copy All Formats */}
                <div className="rounded-3xl border border-indigo-500/20 bg-[#090b14]/90 p-5 sm:p-6 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black uppercase tracking-wider text-white">
                            Hashtag Set Ready ({allTagsList.length} Tags)
                          </h4>
                          {generationSource === "ai" && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                              <Bot size={10} />
                              <span>Groq 120B AI</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          Click any individual tag to copy, or export the full set below
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => generateHashtags()}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={isGenerating ? "animate-spin" : ""} />
                        <span>Regenerate AI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setResults(null)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-white transition-colors"
                      >
                        <RotateCcw size={12} />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Creator Strategy Tip */}
                  {strategyTip && (
                    <div className="mt-3.5 flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-xs text-amber-200">
                      <Lightbulb size={15} className="text-amber-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold text-amber-300 mr-1.5">Creator Strategy Tip:</span>
                        <span className="text-zinc-300">{strategyTip}</span>
                      </div>
                    </div>
                  )}

                  {/* 1-Click Copy Format Pills */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Copy All:
                    </span>
                    <button
                      type="button"
                      onClick={() => copyAllFormatted("inline")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                        copiedFormat === "inline"
                          ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      )}
                    >
                      {copiedFormat === "inline" ? <Check size={13} /> : <Copy size={13} />}
                      <span>One-Line (#tag #tag)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyAllFormatted("dots")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                        copiedFormat === "dots"
                          ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      )}
                    >
                      {copiedFormat === "dots" ? <Check size={13} /> : <Copy size={13} />}
                      <span>Instagram Clean Dots (. . .)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyAllFormatted("commas")}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                        copiedFormat === "commas"
                          ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      )}
                    >
                      {copiedFormat === "commas" ? <Check size={13} /> : <Copy size={13} />}
                      <span>YouTube Tags (Commas)</span>
                    </button>
                  </div>
                </div>

                {/* 3 Tiered Strategy Buckets */}
                <div className="space-y-4">
                  {results.map((group, idx) => (
                    <motion.div
                      key={group.category}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="rounded-3xl border border-white/10 bg-[#090b14]/90 p-5 sm:p-6 shadow-lg"
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                            {group.icon}
                          </div>
                          <div>
                            <h5 className="text-xs font-black uppercase tracking-wider text-white">
                              {group.category}
                            </h5>
                            <p className="text-[10px] text-zinc-400">{group.reachLabel}</p>
                          </div>
                        </div>

                        <span className={cn("rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider", group.badgeColor)}>
                          {group.tags.length} Tags
                        </span>
                      </div>

                      {/* Tag Chips */}
                      <div className="flex flex-wrap gap-2">
                        {group.tags.map((tag) => {
                          const isCopied = copiedTag === tag;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => copyToClipboard(tag)}
                              className={cn(
                                "group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs font-bold transition-all active:scale-95",
                                isCopied
                                  ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
                                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white"
                              )}
                              title="Click to copy single hashtag"
                            >
                              <span>#{tag}</span>
                              {isCopied ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={11} className="opacity-40 group-hover:opacity-100" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* ========================================================== */}
                {/* INTERACTIVE WORKING LIVE SOCIAL CAPTION PREVIEW            */}
                {/* ========================================================== */}
                <div className="rounded-3xl border border-indigo-500/20 bg-[#090b14]/90 p-6 shadow-xl">
                  {/* Top Bar with Platform Switcher */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div className="space-y-0.5">
                      <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                        <Eye size={14} className="text-indigo-400" />
                        <span>Live Caption Preview</span>
                      </h4>
                      <p className="text-[10px] text-zinc-400">
                        Interactive feed simulation formatted for {previewTab.toUpperCase()}
                      </p>
                    </div>

                    <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                      <button
                        type="button"
                        onClick={() => setPreviewTab("instagram")}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                          previewTab === "instagram"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <Camera size={12} />
                        <span>Instagram</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewTab("tiktok")}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                          previewTab === "tiktok"
                            ? "bg-black border border-white/20 text-cyan-300 shadow-md"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <Smartphone size={12} />
                        <span>TikTok</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewTab("youtube")}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                          previewTab === "youtube"
                            ? "bg-red-600 text-white shadow-md"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <Play size={12} />
                        <span>YouTube</span>
                      </button>
                    </div>
                  </div>

                  {/* Caption Text Input (User can customize!) */}
                  <div className="mb-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <span>Post Caption Text</span>
                      <span className="text-indigo-300">Editable preview</span>
                    </div>
                    <input
                      type="text"
                      value={customCaption}
                      onChange={(e) => setCustomCaption(e.target.value)}
                      placeholder="Type your post caption here..."
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-xs font-medium text-white placeholder-zinc-500 outline-none focus:border-indigo-400"
                    />
                  </div>

                  {/* PLATFORM PREVIEW STAGE */}
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-5">
                    {/* 1. INSTAGRAM VIEW */}
                    {previewTab === "instagram" && (
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[2px]">
                              <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-[10px] font-black text-white">
                                EX
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-xs text-white">creator_studio</span>
                                <span className="h-3 w-3 rounded-full bg-blue-500 flex items-center justify-center text-[7px] text-white">✓</span>
                                <span className="text-zinc-500">•</span>
                                <span className="text-[11px] font-bold text-blue-400">Follow</span>
                              </div>
                              <span className="text-[10px] text-zinc-400">🎵 Original audio • Trending</span>
                            </div>
                          </div>
                          <MoreHorizontal size={16} className="text-zinc-400" />
                        </div>

                        {/* Caption Area */}
                        <div className="text-xs text-zinc-200 leading-relaxed font-sans space-y-2">
                          <p>
                            <span className="font-bold text-white mr-2">creator_studio</span>
                            {customCaption || "Check out this update! Save for later 👇"}
                          </p>

                          {/* Instagram Hashtags Display */}
                          <div className="pt-2 border-t border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                Hashtag Block ({allTagsList.length} tags)
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsInstagramDots(!isInstagramDots)}
                                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                {isInstagramDots ? "Format: Clean Dots (. . .)" : "Format: Inline"}
                              </button>
                            </div>

                            {isInstagramDots ? (
                              <div className="font-mono text-indigo-400 text-[11px] leading-relaxed bg-black/40 rounded-xl p-2.5 border border-white/5">
                                <p className="text-zinc-600">.</p>
                                <p className="text-zinc-600">.</p>
                                <p className="text-zinc-600">.</p>
                                <p className="text-indigo-300 font-medium pt-1">{allTagsList.join(" ")}</p>
                              </div>
                            ) : (
                              <p className="font-mono text-indigo-300 text-[11px] leading-relaxed bg-black/40 rounded-xl p-2.5 border border-white/5">
                                {allTagsList.join(" ")}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                          <div className="flex items-center gap-4 text-zinc-300">
                            <button
                              type="button"
                              onClick={() => setIsLiked(!isLiked)}
                              className="flex items-center gap-1.5 transition-transform hover:scale-110"
                            >
                              <Heart
                                size={18}
                                className={isLiked ? "fill-red-500 text-red-500" : "text-zinc-300"}
                              />
                              <span className="text-[11px] font-bold">{isLiked ? "14.3k" : "14.2k"}</span>
                            </button>
                            <div className="flex items-center gap-1.5">
                              <MessageSquare size={18} />
                              <span className="text-[11px] font-bold">284</span>
                            </div>
                            <Send size={17} />
                          </div>
                          <Bookmark size={18} className="text-zinc-300" />
                        </div>
                      </div>
                    )}

                    {/* 2. TIKTOK VIEW */}
                    {previewTab === "tiktok" && (
                      <div className="relative rounded-2xl bg-gradient-to-b from-zinc-900/50 via-zinc-950 to-black p-5 border border-white/10 min-h-[260px] flex justify-between">
                        {/* Left Content Overlay */}
                        <div className="flex-1 flex flex-col justify-end space-y-2.5 max-w-[80%] pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">@creator_studio</span>
                            <span className="rounded-md bg-red-600 px-2 py-0.5 text-[9px] font-black text-white">
                              Follow
                            </span>
                          </div>

                          <p className="text-xs text-zinc-100 font-medium leading-relaxed line-clamp-3">
                            {customCaption || "Check this out! Drop a comment if this helped you 👇"}
                          </p>

                          <div className="flex flex-wrap gap-1 text-[11px] font-bold text-cyan-300">
                            {allTagsList.slice(0, 8).map((t) => (
                              <span key={t} className="hover:underline">{t}</span>
                            ))}
                          </div>

                          {/* Sound bar with animated vinyl */}
                          <div className="flex items-center gap-2 text-[10px] text-zinc-300 font-mono pt-1">
                            <Disc3 size={13} className="text-cyan-400 animate-spin" />
                            <span className="truncate">original sound - creator_studio • Viral Audio</span>
                          </div>
                        </div>

                        {/* Right Vertical Action Stack */}
                        <div className="flex flex-col items-center justify-end space-y-4 text-center">
                          {/* Avatar with plus */}
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center font-black text-xs text-white">
                              EX
                            </div>
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                              +
                            </span>
                          </div>

                          {/* Heart */}
                          <button
                            type="button"
                            onClick={() => setIsLiked(!isLiked)}
                            className="flex flex-col items-center gap-0.5 text-zinc-300"
                          >
                            <Heart size={20} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                            <span className="text-[9px] font-bold">{isLiked ? "84.6K" : "84.5K"}</span>
                          </button>

                          {/* Comments */}
                          <div className="flex flex-col items-center gap-0.5 text-zinc-300">
                            <MessageSquare size={20} />
                            <span className="text-[9px] font-bold">1,420</span>
                          </div>

                          {/* Bookmark */}
                          <div className="flex flex-col items-center gap-0.5 text-zinc-300">
                            <Bookmark size={20} />
                            <span className="text-[9px] font-bold">6,890</span>
                          </div>

                          {/* Share */}
                          <div className="flex flex-col items-center gap-0.5 text-zinc-300">
                            <Share2 size={20} />
                            <span className="text-[9px] font-bold">940</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. YOUTUBE SHORTS VIEW */}
                    {previewTab === "youtube" && (
                      <div className="space-y-4">
                        {/* Top 3 Blue Hashtags */}
                        <div className="flex gap-2 text-[11px] font-bold text-blue-400 font-mono">
                          {allTagsList.slice(0, 3).map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>

                        {/* Title */}
                        <h5 className="text-sm font-black text-white leading-snug">
                          {keywords ? `${keywords.toUpperCase()} - Complete Creator Guide` : "Everything You Need To Know (Shorts)"}
                        </h5>

                        {/* Channel Row */}
                        <div className="flex items-center justify-between border-y border-white/5 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center font-black text-white text-xs">
                              YT
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">Creator Hub</p>
                              <p className="text-[9px] text-zinc-400">124K subscribers</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-black uppercase tracking-wider hover:bg-zinc-200"
                          >
                            Subscribe
                          </button>
                        </div>

                        {/* Description Box Preview */}
                        <div className="rounded-xl bg-white/[0.03] p-3 text-[11px] text-zinc-300 space-y-1.5 font-sans">
                          <p className="font-medium">{customCaption || "Check out this breakdown!"}</p>
                          <p className="text-blue-400 font-mono text-[10px] pt-1">
                            {allTagsList.slice(3, 15).join(" ")}
                          </p>
                        </div>

                        {/* Bottom Shorts Controls */}
                        <div className="flex items-center justify-around border-t border-white/5 pt-3 text-zinc-300 text-xs">
                          <div className="flex items-center gap-1.5 font-bold">
                            <ThumbsUp size={16} />
                            <span>56K</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold">
                            <ThumbsDown size={16} />
                            <span>Dislike</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold">
                            <MessageSquare size={16} />
                            <span>2.4K</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold">
                            <Share2 size={16} />
                            <span>Share</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 1-Click Copy Full Post Button */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                    {previewTab === "instagram" && (
                      <button
                        type="button"
                        onClick={() => setIsInstagramDots(!isInstagramDots)}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {isInstagramDots ? "✓ Using clean caption line breaks" : "Enable clean caption line breaks"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={copyFullPostCaption}
                      className={cn(
                        "ml-auto flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95",
                        isCaptionCopied
                          ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                          : "border-indigo-500/30 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 hover:text-white"
                      )}
                    >
                      {isCaptionCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{isCaptionCopied ? "Caption & Tags Copied!" : `Copy Full ${previewTab.toUpperCase()} Post`}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* High-Value Standby Stage (Zero Dead Void!) */
              <div className="flex min-h-[460px] flex-col justify-between rounded-3xl border border-indigo-500/20 bg-[#090b14]/90 p-8 shadow-xl backdrop-blur-xl">
                <div>
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                      <Hash size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-white">
                        Algorithm Discovery Insights
                      </h4>
                      <p className="text-xs text-zinc-400">
                        How modern social recommendation engines use hashtags
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                        <Camera size={14} />
                        <span>Instagram Reels</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Instagram recommends 3–5 hyper-relevant niche tags in your main caption. Avoid dumping 30 unrelated tags as it confuses the AI topic classifier.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-pink-300 font-bold text-xs">
                        <Smartphone size={14} />
                        <span>TikTok FYP</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Combine 2 broad tags (like #fyp or #tiktokviral) with 3–4 ultra-specific keyword tags that describe the exact action happening on screen.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                        <Play size={14} />
                        <span>YouTube Shorts</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Include 3 core hashtags in your Shorts title or description. YouTube uses these to categorize your video on dedicated hashtag shelf pages.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
                        <MessageSquare size={14} />
                        <span>X / Twitter</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Posts with 1–2 focused hashtags receive higher engagement and retweets than tweets with 5+ tags, which often get flagged as spammy by search.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Callout */}
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <Info size={16} className="text-indigo-400 shrink-0" />
                    <p className="text-xs text-zinc-300">
                      Select a blueprint above or type your keywords on the left to generate your optimized set.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
