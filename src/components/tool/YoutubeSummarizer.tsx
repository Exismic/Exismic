"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  PlayCircle,
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  FileText, 
  ListChecks, 
  Share2, 
  Clock, 
  AlertCircle,
  Play,
  ArrowRight,
  Zap,
  Video,
  Search,
  Sparkles as SparklesProhibited,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useCredits } from "@/hooks/useCredits";
import { ResultRetentionBar } from "@/components/tool/ResultRetentionBar";
import { 
  YOUTUBE_BLUEPRINTS, 
  type YoutubeBlueprint 
} from "./youtube-summarizer-blueprints";

const YoutubeIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107c.502-1.89.502-5.837.502-5.837s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

type OutputFormat = "summary" | "blog" | "thread" | "transcript";

const FORMAT_OPTIONS: Array<{
  id: OutputFormat;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}> = [
  { id: "summary", name: "Study Notes", icon: ListChecks, desc: "Key takeaways & structured outline" },
  { id: "blog", name: "Blog Article", icon: FileText, desc: "SEO-ready comprehensive article" },
  { id: "thread", name: "Social Thread", icon: Share2, desc: "Viral numbered post cards" },
  { id: "transcript", name: "Timed Transcript", icon: Clock, desc: "Full timestamped caption logs" }
];

const TOOL_COST = 10;

export default function YoutubeSummarizer() {
  const { credits, deductCredits, setShowUpsell } = useCredits();

  // Active blueprint: default to Blueprint 0 (3Blue1Brown) so the preview stage is never empty
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(
    YOUTUBE_BLUEPRINTS[0].id
  );
  const [url, setUrl] = useState<string>(YOUTUBE_BLUEPRINTS[0].url);
  const [format, setFormat] = useState<OutputFormat>("summary");
  const [activeTab, setActiveTab] = useState<OutputFormat>("summary");

  // Video & Result Data
  const [videoTitle, setVideoTitle] = useState<string>(YOUTUBE_BLUEPRINTS[0].title);
  const [videoId, setVideoId] = useState<string>(YOUTUBE_BLUEPRINTS[0].videoId);
  const [channelName, setChannelName] = useState<string>(YOUTUBE_BLUEPRINTS[0].channel);
  const [duration, setDuration] = useState<string>(YOUTUBE_BLUEPRINTS[0].duration);
  const [segments, setSegments] = useState<Array<{ timeLabel: string; text: string }>>(
    YOUTUBE_BLUEPRINTS[0].segments
  );
  
  // Cache blueprint contents locally to enable instant format switching
  const [blueprintData, setBlueprintData] = useState<YoutubeBlueprint | null>(
    YOUTUBE_BLUEPRINTS[0]
  );
  const [customResult, setCustomResult] = useState<string | null>(null);

  // Search filter for transcript
  const [transcriptSearch, setTranscriptSearch] = useState("");

  // In-flight processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedTweetIndex, setCopiedTweetIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // Determine current active content
  const currentContent = customResult || (
    blueprintData
      ? activeTab === "summary"
        ? blueprintData.summary
        : activeTab === "blog"
        ? blueprintData.blog
        : activeTab === "thread"
        ? blueprintData.thread
        : blueprintData.segments.map((s) => `[${s.timeLabel}] ${s.text}`).join("\n")
      : ""
  );

  const wordCount = currentContent ? currentContent.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const handleSelectBlueprint = (blueprint: YoutubeBlueprint) => {
    setSelectedBlueprintId(blueprint.id);
    setUrl(blueprint.url);
    setVideoTitle(blueprint.title);
    setVideoId(blueprint.videoId);
    setChannelName(blueprint.channel);
    setDuration(blueprint.duration);
    setSegments(blueprint.segments);
    setBlueprintData(blueprint);
    setCustomResult(null);
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
    setStatusMessage("Loading YouTube video...");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        if (prev > 75) {
          setStatusMessage("Writing your summary...");
          return prev + 1;
        }
        if (prev > 45) {
          setStatusMessage("Finding the main points and key takeaways...");
          return prev + 2;
        }
        if (prev > 20) {
          setStatusMessage("Reading the video transcript...");
          return prev + 4;
        }
        return prev + 5;
      });
    }, 380);

    return interval;
  };

  const handleGenerate = async (targetFormat: OutputFormat = format) => {
    if (!url.trim()) return;

    if (credits < TOOL_COST) {
      setShowUpsell(true);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    const progressInterval = simulateProgress();

    try {
      const response = await axios.post("/api/tools/ai/youtube-summarizer", {
        url: url.trim(),
        format: targetFormat
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage("Summary generated successfully!");

      setCustomResult(response.data.result);
      setVideoTitle(response.data.title || "YouTube Video");
      setVideoId(response.data.videoId || "");
      setChannelName("YouTube Channel");
      setDuration("Video");
      setSegments(response.data.segments || []);
      setActiveTab(targetFormat);
      setSelectedBlueprintId("custom");
      setBlueprintData(null);

      if (deductCredits) {
        deductCredits(TOOL_COST);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("[YoutubeSummarizer Error]:", err);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        "Could not summarize this YouTube video. Please verify the link.";
      setError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabChange = async (tab: OutputFormat) => {
    setActiveTab(tab);
    if (selectedBlueprintId !== "custom" && blueprintData) {
      // Switching instantly between cached blueprint outputs
      return;
    }
    // If it's a custom summarized video and switching format, trigger generation
    await handleGenerate(tab);
  };

  const handleCopy = () => {
    if (!currentContent) return;
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTweet = (tweetText: string, index: number) => {
    navigator.clipboard.writeText(tweetText.trim());
    setCopiedTweetIndex(index);
    setTimeout(() => setCopiedTweetIndex(null), 2000);
  };

  const handleDownload = () => {
    if (!currentContent) return;
    const blob = new Blob([currentContent], { type: "text/markdown" });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileUrl;
    const cleanTitle = videoTitle.slice(0, 24).toLowerCase().replace(/[^a-z0-9]/g, "-") || "youtube-summary";
    link.download = `${cleanTitle}-${activeTab}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(fileUrl);
  };

  const getThumbnailUrl = (id: string) => {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  };

  // Filtered segments for transcript
  const filteredSegments = segments.filter((seg) =>
    transcriptSearch ? seg.text.toLowerCase().includes(transcriptSearch.toLowerCase()) : true
  );

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-12">
      {/* Symmetrical Dual-Pane Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Pane: URL & Blueprint Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0d14]/90 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Studio Header Badge */}
            <div className="flex items-center justify-between border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-inner">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Video Notes Studio
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Convert YouTube videos into detailed study notes & threads
                  </p>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready to Summarize</span>
              </div>
            </div>

            {/* YouTube URL Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  YouTube Video Link
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
                <div className="absolute left-4 p-1.5 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                  <YoutubeIcon size={16} />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
                  className="w-full h-14 bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-2xl pl-12 pr-4 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-amber-500/10 transition-all font-medium shadow-inner"
                />
              </div>
            </div>

            {/* 4 Instant Demonstration Blueprints ($0 Previews) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Instant Demonstration Blueprints ($0 Free Previews)
                </span>
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                  Click to preview
                </span>
              </div>

              <div className="space-y-2.5">
                {YOUTUBE_BLUEPRINTS.map((bp) => {
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
                      {/* Left: Thumbnail with Play Badge */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-black border border-white/10 shadow-sm">
                          <img
                            src={getThumbnailUrl(bp.videoId)}
                            alt={bp.title}
                            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play size={12} className="text-white fill-white" />
                          </div>
                          <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] font-mono font-bold px-1 rounded text-zinc-300">
                            {bp.duration}
                          </span>
                        </div>

                        {/* Title & Channel */}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate mb-0.5">
                            {bp.title}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                            <span className="truncate text-zinc-300">{bp.channel}</span>
                            <span>•</span>
                            <span className="text-amber-400/90 font-medium">{bp.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Badge */}
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

            {/* Output Format Selector */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                Choose Output Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FORMAT_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = format === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setFormat(item.id);
                        if (selectedBlueprintId !== "custom") {
                          setActiveTab(item.id);
                        }
                      }}
                      className={cn(
                        "p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5",
                        isCurrent
                          ? "bg-amber-500/10 border-amber-500/50 text-white shadow-sm"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", isCurrent ? "text-amber-400" : "text-zinc-500")} />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold truncate">{item.name}</div>
                        <div className="text-[9px] text-zinc-500 leading-tight mt-0.5 line-clamp-1">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
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
                  onClick={() => handleGenerate(format)}
                  disabled={!url.trim() || isProcessing}
                  className={cn(
                    "w-full flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-2xl",
                    "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 text-zinc-950 shadow-amber-500/30 active:scale-[0.98]",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  <Video className="w-4 h-4 text-zinc-950 fill-zinc-950/20 shrink-0" />
                  <span>
                    {isProcessing ? "Transcribing & Summarizing..." : "Summarize Video"}
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
                  <span className="text-zinc-500 text-[10px]">Instant Markdown & Text Delivery</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Pane: Live Video & Study Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0c0d14]/90 border border-white/10 rounded-[2.5rem] p-5 sm:p-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-5">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Video Player Card Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
              <div className="flex items-center gap-4 min-w-0">
                {videoId ? (
                  <div className="relative w-28 sm:w-36 h-18 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-black border border-white/10 shadow-md group">
                    <img
                      src={getThumbnailUrl(videoId)}
                      alt={videoTitle}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play size={16} className="text-white fill-white drop-shadow" />
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                    <YoutubeIcon size={24} />
                  </div>
                )}

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/25 text-red-400 text-[9px] font-black uppercase tracking-wider">
                      YouTube Video
                    </span>
                    {duration && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        {duration}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                    {videoTitle}
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {channelName || "Active Video Workspace"}
                  </p>
                </div>
              </div>

              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition shrink-0"
                >
                  <span>Watch</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              )}
            </div>

            {/* View Switcher & Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/5 pb-4">
              {/* Format Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-black/50 border border-white/10 p-1 rounded-xl w-full sm:w-auto">
                {FORMAT_OPTIONS.map((tab) => {
                  const Icon = tab.icon;
                  const isCurrent = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer",
                        isCurrent
                          ? "bg-amber-500/10 border border-amber-500/40 text-amber-300 shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons & Word Count */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-400 mr-1">
                  ~{wordCount} words • {readTimeMin}m read
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy Notes"}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>

            {/* Reading / Output Stage */}
            <div className="min-h-[520px] rounded-2xl bg-black/80 border border-white/10 p-5 sm:p-6 overflow-hidden relative">
              {activeTab === "thread" ? (
                /* Numbered Tweet Thread Cards */
                <div className="space-y-4 max-h-[520px] overflow-y-auto custom-scrollbar pr-2">
                  {currentContent
                    .split(/---\n?|\n\n\n?/)
                    .filter(Boolean)
                    .map((post, idx) => {
                      const isCopied = copiedTweetIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-amber-500/30 transition space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-white/5 pb-2">
                            <span className="text-amber-400 font-bold">Post {idx + 1}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-zinc-500">{post.trim().length} Chars</span>
                              <button
                                onClick={() => handleCopyTweet(post, idx)}
                                className="text-zinc-400 hover:text-white transition cursor-pointer"
                                title="Copy this post"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-medium">
                            {post.trim()}
                          </p>
                        </div>
                      );
                    })}
                </div>
              ) : activeTab === "transcript" ? (
                /* Timestamped Transcript with Search */
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={transcriptSearch}
                      onChange={(e) => setTranscriptSearch(e.target.value)}
                      placeholder="Search transcript lines..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-amber-500/40 transition"
                    />
                  </div>
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredSegments.length > 0 ? (
                      filteredSegments.map((seg, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition group border border-transparent hover:border-white/5"
                        >
                          <button
                            onClick={() => navigator.clipboard.writeText(seg.text)}
                            title="Copy transcript line"
                            className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-amber-400 group-hover:bg-amber-400 group-hover:text-zinc-950 font-bold transition shrink-0 cursor-pointer"
                          >
                            {seg.timeLabel}
                          </button>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {seg.text}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 text-center py-12">
                        No transcript lines match "{transcriptSearch}".
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Standard Rich Markdown Reading Mode (Study Notes or Blog) */
                <div className="max-h-[520px] overflow-y-auto custom-scrollbar pr-2 space-y-4 text-left">
                  <div className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap selection:bg-amber-500/20">
                    {currentContent}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Cloud Drive & Email Retention Bar */}
      <ResultRetentionBar
        toolType="youtube-summarizer"
        toolName="YouTube AI Summarizer"
        title={videoTitle ? `${videoTitle} - Summary` : "YouTube Video Summary"}
        content={currentContent}
        metadata={{ videoId, format: activeTab }}
        downloadAction={handleDownload}
        downloadLabel="Download Markdown"
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
              Repurpose Your Notes With Companion Tools
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Turn video takeaways into full essays, social posts, or clean screenshots
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/tools/ai/writer"
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.04] transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition flex items-center justify-between">
              <span>AI Writer Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Expand study takeaways into detailed newsletters, articles, or scripts.
            </p>
          </Link>

          <Link
            href="/tools/ai/humanizer"
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.04] transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
              <SparklesProhibited className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition flex items-center justify-between">
              <span>AI Humanizer</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Refine your draft into 100% natural, human-written conversational prose.
            </p>
          </Link>

          <Link
            href="/tools/developer/code-snippet"
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.04] transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition flex items-center justify-between">
              <span>Code Snippet Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Capture code blocks mentioned in technical videos into glowing cards.
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
              <Video className="absolute inset-0 m-auto w-8 h-8 text-amber-400 animate-pulse" />
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
              Pulling the most important moments and key takeaways
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
