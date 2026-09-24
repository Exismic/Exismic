"use client";

import React, { useState, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  Camera, 
  MessageSquare, 
  Briefcase, 
  Share2, 
  Image as ImageIcon,
  Smile,
  Globe,
  RotateCcw,
  Flame,
  CheckCircle2,
  Layers,
  Sliders,
  Heart,
  MessageCircle,
  Bookmark,
  Repeat,
  Eye,
  ThumbsUp,
  TrendingUp,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import { BuyCreditsModal } from "@/components/credits/BuyCreditsModal";
import { ToolUploader } from "./ToolUploader";
import { usePipedContent } from "@/lib/tool-piping";
import { PipedBadge } from "@/components/tool/PipedBadge";
import { ToolWorkflowChaining } from "@/components/tool/ToolWorkflowChaining";
import { ToolSuggestions } from "@/components/tool/ToolSuggestions";
import { 
  SOCIAL_CAPTION_BLUEPRINTS, 
  type SocialCaptionBlueprint 
} from "./social-caption-blueprints";

const TOOL_COST = 6;

const PLATFORMS = [
  { 
    id: "instagram", 
    label: "Instagram", 
    charLimit: 2200,
    icon: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
    ), 
  },
  { 
    id: "twitter", 
    label: "Twitter / X", 
    charLimit: 280,
    icon: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    ), 
  },
  { 
    id: "tiktok", 
    label: "TikTok", 
    charLimit: 2200,
    icon: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
    ), 
  },
  { 
    id: "linkedin", 
    label: "LinkedIn", 
    charLimit: 3000,
    icon: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
    ), 
  },
  { 
    id: "youtube", 
    label: "YouTube", 
    charLimit: 5000,
    icon: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 68.4 68.4 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 68.4 68.4 0 0 1-15 0 2 2 0 0 1-2-2Z"/><path d="m10 15 5-3-5-3z"/></svg>
    ), 
  },
  { 
    id: "facebook", 
    label: "Facebook", 
    charLimit: 5000,
    icon: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
    ), 
  },
];

const MOODS = [
  { id: "casual", label: "Casual & Chill", emoji: "☕", desc: "Conversational & friendly" },
  { id: "professional", label: "Professional", emoji: "💼", desc: "Clean & authoritative" },
  { id: "funny", label: "Relatable & Funny", emoji: "😂", desc: "Viral memes & humor" },
  { id: "inspiring", label: "Inspiring", emoji: "✨", desc: "Uplifting & motivational" },
  { id: "launch", label: "Launch & Hype", emoji: "🚀", desc: "Bold announcement" },
  { id: "sales", label: "Sales & Offer", emoji: "💰", desc: "High-converting hook" },
];

const TOPIC_CHIPS = [
  { label: "Coffee & Morning Ritual", topic: "Sunday morning pour-over coffee ritual, slow sunlight, quiet studio vibes" },
  { label: "Product Launch", topic: "Announcing our new web app redesign with faster performance and clean dark mode" },
  { label: "Behind The Scenes", topic: "Sneak peek into how we build digital products remotely across 4 time zones" },
  { label: "Creator Hot Take", topic: "Why working 16 hours a day is ruining your creativity, not helping it" },
  { label: "Weekly Growth Tip", topic: "The 3 daily habits that helped us grow from 0 to 10k engaged community members" },
];

const SURPRISE_TOPICS = [
  "A day in the life building a digital product from a quiet coffee shop",
  "Why simplicity and minimalist design win every single time in 2026",
  "The 3 biggest mistakes creators make when growing on social media",
  "How we saved 15 hours every week using smart workflow automation",
  "Unpopular opinion: Consistency beats perfection on every platform",
  "What nobody tells you about launching your first online store",
];

interface CaptionItem {
  caption: string;
  hashtags: string[];
  hookType?: string;
}

export function SocialCaptionGenerator() {
  const { credits, deductCredits } = useCredits();
  const [showUpsell, setShowUpsell] = useState(false);

  // Active inputs
  const [topic, setTopic] = useState(SOCIAL_CAPTION_BLUEPRINTS[0].topic);
  const [mood, setMood] = useState(SOCIAL_CAPTION_BLUEPRINTS[0].mood);
  const [platform, setPlatform] = useState<string>(SOCIAL_CAPTION_BLUEPRINTS[0].platform);
  const [screenshot, setScreenshot] = useState<string | null>(SOCIAL_CAPTION_BLUEPRINTS[0].previewImageUrl || null);
  
  // Selected blueprint tracking
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>(SOCIAL_CAPTION_BLUEPRINTS[0].id);

  // Generation state & Progress
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Setting up your topic & platform...");
  const [error, setError] = useState<string | null>(null);

  // Captions list & active preview selection
  const [captions, setCaptions] = useState<CaptionItem[]>(SOCIAL_CAPTION_BLUEPRINTS[0].captions);
  const [activeCaptionIndex, setActiveCaptionIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedHashtagsId, setCopiedHashtagsId] = useState<number | null>(null);

  // Mockup view switcher (allows testing same caption in IG, X, TikTok, or LinkedIn)
  const [mockupTab, setMockupTab] = useState<"instagram" | "twitter" | "tiktok" | "linkedin">("instagram");

  const lastFileRef = useRef<File | null>(null);

  const { pipedPayload, isPiped, clearPiped } = usePipedContent((payload) => {
    if (payload.content) {
      setTopic(payload.content.slice(0, 500));
      setSelectedBlueprintId("custom");
    }
  });

  const activeCaption = captions[activeCaptionIndex] || captions[0] || {
    caption: "Write a topic and click Generate Captions to see your post live here.",
    hashtags: ["#socialmedia", "#creator", "#exismic"],
  };

  const currentPlatformConfig = PLATFORMS.find((p) => p.id === platform) || PLATFORMS[0];

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    lastFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshot(e.target?.result as string);
      setSelectedBlueprintId("custom");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectBlueprint = (bp: SocialCaptionBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setTopic(bp.topic);
    setPlatform(bp.platform);
    setMood(bp.mood);
    setScreenshot(bp.previewImageUrl || null);
    lastFileRef.current = null;
    setCaptions(bp.captions);
    setActiveCaptionIndex(0);
    setError(null);

    // Sync mockup tab if supported
    if (["instagram", "twitter", "tiktok", "linkedin"].includes(bp.platform)) {
      setMockupTab(bp.platform as any);
    }
  };

  const handleSurpriseMe = () => {
    const randomTopic = SURPRISE_TOPICS[Math.floor(Math.random() * SURPRISE_TOPICS.length)];
    setTopic(randomTopic);
    setSelectedBlueprintId("custom");
    setError(null);
  };

  const simulateProgress = () => {
    setProgress(10);
    setStatusMessage("Setting up your topic & platform...");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        if (prev > 75) {
          setStatusMessage("Selecting trending hashtags & emojis...");
          return prev + 1;
        }
        if (prev > 45) {
          setStatusMessage("Writing engaging captions & hooks...");
          return prev + 2;
        }
        if (prev > 20) {
          setStatusMessage(`Analyzing viral hooks for ${platform}...`);
          return prev + 4;
        }
        return prev + 5;
      });
    }, 350);

    return interval;
  };

  const generateCaptions = async () => {
    if (!topic.trim() && !lastFileRef.current) return;

    if (credits < TOOL_COST) {
      setShowUpsell(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    const progressInterval = simulateProgress();

    const formData = new FormData();
    formData.append("topic", topic.trim());
    formData.append("mood", mood);
    formData.append("platform", platform);
    if (lastFileRef.current) {
      formData.append("file", lastFileRef.current);
    }

    try {
      const response = await fetch("/api/tools/ai/social-caption", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate captions");
      }

      const data = await response.json();
      const rawResult = data.result || data.resultUrl;
      const finalResult = typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;

      if (!Array.isArray(finalResult) || finalResult.length === 0) {
        throw new Error("No captions returned. Please try rephrasing your topic.");
      }

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage("Your captions are ready!");

      setCaptions(finalResult);
      setActiveCaptionIndex(0);
      setSelectedBlueprintId("custom");

      // Auto sync mockup tab with generated platform
      if (["instagram", "twitter", "tiktok", "linkedin"].includes(platform)) {
        setMockupTab(platform as any);
      }

      if (deductCredits) {
        deductCredits(TOOL_COST);
      }
    } catch (err: unknown) {
      clearInterval(progressInterval);
      console.error("[SocialCaption Error]:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyFullCaption = (text: string, hashtags: string[], id: number) => {
    const fullText = hashtags.length > 0 ? `${text}\n\n${hashtags.join(" ")}` : text;
    navigator.clipboard.writeText(fullText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyOnlyHashtags = (hashtags: string[], id: number) => {
    navigator.clipboard.writeText(hashtags.join(" "));
    setCopiedHashtagsId(id);
    setTimeout(() => setCopiedHashtagsId(null), 2000);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto space-y-12">
      {/* Symmetrical Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Pane: Social Media Studio Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0d14]/90 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-rose-500/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Studio Header Badge */}
            <div className="flex items-center justify-between border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-inner">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Caption Studio
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Create viral hooks, engaging copy & curated tags
                  </p>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready to Post</span>
              </div>
            </div>

            {/* Target Social Platform Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Target Social Platform
                </label>
                <span className="text-[10px] font-bold text-zinc-500">
                  Limit: {currentPlatformConfig.charLimit.toLocaleString()} chars
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map((p) => {
                  const isSelected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPlatform(p.id);
                        if (["instagram", "twitter", "tiktok", "linkedin"].includes(p.id)) {
                          setMockupTab(p.id as any);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm",
                        isSelected
                          ? "bg-rose-500/20 border-rose-500/60 text-white shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                          : "bg-white/[0.03] border-white/5 text-zinc-400 hover:border-white/20 hover:text-white hover:bg-white/[0.06]"
                      )}
                    >
                      <p.icon />
                      <span className="truncate">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic Input with Inspiration Chips */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  What is your post about?
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSurpriseMe}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    🎲 Surprise Me
                  </button>
                  {topic && (
                    <button
                      onClick={() => setTopic("")}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 font-medium transition cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {isPiped && pipedPayload && (
                <PipedBadge
                  sourceName={pipedPayload.sourceToolName}
                  onClear={() => {
                    setTopic("");
                    clearPiped();
                  }}
                  className="mb-1"
                />
              )}

              <div className="relative">
                <textarea
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setSelectedBlueprintId("custom");
                    setError(null);
                  }}
                  rows={3}
                  placeholder="Describe your photo, video idea, product launch, or life update..."
                  className="w-full bg-black/60 border border-white/10 focus:border-rose-500/50 rounded-2xl p-4 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-rose-500/10 transition-all resize-none font-medium leading-relaxed custom-scrollbar shadow-inner"
                />
                <div className="absolute bottom-3 right-3 text-[9px] font-bold text-zinc-500">
                  {topic.length} / 500
                </div>
              </div>

              {/* Quick Topic Inspiration Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {TOPIC_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => {
                      setTopic(chip.topic);
                      setSelectedBlueprintId("custom");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-medium text-zinc-400 hover:text-white hover:border-rose-500/30 hover:bg-rose-500/5 transition cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Context / Photo Upload (Optional) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-rose-400" />
                  Visual Context / Photo (Optional)
                </label>
                {screenshot && (
                  <button
                    onClick={() => {
                      setScreenshot(null);
                      lastFileRef.current = null;
                      setSelectedBlueprintId("custom");
                    }}
                    className="text-[10px] text-zinc-500 hover:text-red-400 transition cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {!screenshot ? (
                <ToolUploader 
                  onUpload={handleUpload}
                  acceptedTypes={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                  maxSize={5}
                />
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 group h-28 bg-black">
                  <img 
                    src={screenshot} 
                    alt="Visual Preview" 
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                    <span className="text-[10px] font-bold text-zinc-300">Photo context attached</span>
                    <button
                      onClick={() => {
                        setScreenshot(null);
                        lastFileRef.current = null;
                      }}
                      className="px-2 py-1 rounded-lg bg-red-500/30 border border-red-500/40 text-red-200 text-[9px] font-bold hover:bg-red-500/50 transition cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tone & Audience Style */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-rose-400" />
                Tone of Voice
              </label>

              <div className="grid grid-cols-3 gap-2">
                {MOODS.map((m) => {
                  const isSelected = mood === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMood(m.id);
                        setSelectedBlueprintId("custom");
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer",
                        isSelected
                          ? "bg-rose-500/20 border-rose-500/60 text-white shadow-md"
                          : "bg-white/[0.03] border-white/5 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                      )}
                    >
                      <span className="text-lg mb-0.5">{m.emoji}</span>
                      <span className="text-[10px] font-bold tracking-tight truncate w-full">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4 Instant Demonstration Blueprints ($0 Previews) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-rose-400" />
                  Instant Demonstration Blueprints ($0 Free Previews)
                </span>
                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">
                  Click to test
                </span>
              </div>

              <div className="space-y-2">
                {SOCIAL_CAPTION_BLUEPRINTS.map((bp) => {
                  const isSelected = selectedBlueprintId === bp.id;
                  return (
                    <button
                      key={bp.id}
                      onClick={() => handleSelectBlueprint(bp)}
                      className={cn(
                        "w-full p-3 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative group flex items-center justify-between gap-3",
                        isSelected
                          ? "bg-rose-500/10 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)] text-white"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs sm:text-sm font-bold text-white truncate">
                            {bp.name}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/5 shrink-0">
                            {bp.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate leading-relaxed">
                          {bp.tagline}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" /> Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 group-hover:text-rose-300 group-hover:border-rose-500/30 text-[10px] font-bold uppercase tracking-wider transition">
                            Preview $0
                          </span>
                        )}
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
                  onClick={generateCaptions}
                  disabled={isGenerating || (!topic.trim() && !screenshot)}
                  className={cn(
                    "w-full flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-2xl",
                    "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:brightness-110 text-white shadow-rose-500/30 active:scale-[0.98]",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4 text-white shrink-0" />
                  <span>
                    {isGenerating ? "Writing your captions..." : "Generate Viral Captions"}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/25 text-white text-[10px] font-black border border-white/10">
                    {TOOL_COST} Credits
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setShowUpsell(true)}
                  className="w-full flex min-h-14 items-center justify-center gap-3 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-xl bg-gradient-to-r from-rose-500/20 via-pink-500/30 to-rose-500/20 border-2 border-rose-500/70 hover:border-rose-400 hover:bg-rose-500/35 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.2)] active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" />
                  <span className="text-rose-200 font-black">
                    Refill Credits (Need {TOOL_COST})
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-rose-400/25 border border-rose-400/40 text-rose-200 text-[10px] font-black">
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
                    className="text-rose-400 hover:text-rose-300 font-bold text-[10px] uppercase tracking-wider cursor-pointer transition underline underline-offset-2"
                  >
                    Get More Credits
                  </button>
                ) : (
                  <span className="text-zinc-500 text-[10px]">Instant 1-Click Copy & Export</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Pane: Live Mockup Showcase & Output Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#0c0d14]/90 border border-white/10 rounded-[2.5rem] p-5 sm:p-7 backdrop-blur-3xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Top Toolbar: Mockup Platform Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Live Post Simulator
                </span>
              </div>

              {/* Mockup Tabs */}
              <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/10 rounded-xl">
                {[
                  { id: "instagram", label: "Instagram" },
                  { id: "twitter", label: "Twitter / X" },
                  { id: "tiktok", label: "TikTok" },
                  { id: "linkedin", label: "LinkedIn" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMockupTab(tab.id as any)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                      mockupTab === tab.id
                        ? "bg-rose-500 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Live Post Mockup Display */}
            <div className="p-4 sm:p-6 rounded-3xl bg-black/70 border border-white/10 shadow-inner">
              
              {/* Instagram Post Mockup */}
              {mockupTab === "instagram" && (
                <div className="max-w-md mx-auto bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-3">
                  {/* IG Header */}
                  <div className="flex items-center justify-between p-3 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] font-black text-white">
                          EX
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          exismic.studio
                          <span className="w-3 h-3 rounded-full bg-blue-500 inline-flex items-center justify-center text-[7px] text-white">✓</span>
                        </div>
                        <div className="text-[10px] text-zinc-400">Featured Post</div>
                      </div>
                    </div>
                    <span className="text-zinc-500 font-bold">•••</span>
                  </div>

                  {/* IG Photo Display */}
                  <div className="aspect-square bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center relative overflow-hidden">
                    {screenshot ? (
                      <img src={screenshot} alt="Post Media" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6 space-y-2">
                        <ImageIcon className="w-10 h-10 text-zinc-700 mx-auto" />
                        <p className="text-xs font-semibold text-zinc-500">Visual post media</p>
                      </div>
                    )}
                  </div>

                  {/* IG Action Bar */}
                  <div className="px-3.5 space-y-2 pb-3.5">
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3 text-white">
                        <Heart className="w-5 h-5 hover:text-rose-500 transition cursor-pointer" />
                        <MessageCircle className="w-5 h-5 hover:text-zinc-300 transition cursor-pointer" />
                        <Share2 className="w-5 h-5 hover:text-zinc-300 transition cursor-pointer" />
                      </div>
                      <Bookmark className="w-5 h-5 text-white hover:text-zinc-300 transition cursor-pointer" />
                    </div>

                    <div className="text-xs font-bold text-white">
                      Liked by <span className="font-normal text-zinc-300">creators</span> and <span className="text-white">1,842 others</span>
                    </div>

                    {/* IG Caption Body */}
                    <div className="text-xs text-zinc-200 leading-relaxed font-normal whitespace-pre-line">
                      <span className="font-bold text-white mr-1.5">exismic.studio</span>
                      {activeCaption.caption}
                    </div>

                    {/* IG Hashtags */}
                    {activeCaption.hashtags && activeCaption.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {activeCaption.hashtags.map((h, i) => (
                          <span key={i} className="text-[11px] font-semibold text-rose-400 hover:underline cursor-pointer">
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Twitter / X Mockup */}
              {mockupTab === "twitter" && (
                <div className="max-w-md mx-auto bg-black border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-white border border-white/10">
                        EX
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          Exismic Studio
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 inline-flex items-center justify-center text-[8px] text-white">✓</span>
                        </div>
                        <div className="text-[10px] text-zinc-500">@exismictools · 2m</div>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>

                  <p className="text-sm text-zinc-100 leading-relaxed whitespace-pre-line font-normal">
                    {activeCaption.caption}
                  </p>

                  {activeCaption.hashtags && activeCaption.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeCaption.hashtags.map((h, i) => (
                        <span key={i} className="text-xs font-medium text-blue-400">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}

                  {screenshot && (
                    <div className="rounded-xl overflow-hidden border border-white/10 h-44 mt-2">
                      <img src={screenshot} alt="Media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1.5 hover:text-blue-400 transition cursor-pointer">
                      <MessageCircle className="w-4 h-4" /> 48
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-emerald-400 transition cursor-pointer">
                      <Repeat className="w-4 h-4" /> 192
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-rose-400 transition cursor-pointer">
                      <Heart className="w-4 h-4" /> 1.4K
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-zinc-300 transition cursor-pointer">
                      <Eye className="w-4 h-4" /> 32.8K
                    </span>
                  </div>
                </div>
              )}

              {/* TikTok Screen Mockup */}
              {mockupTab === "tiktok" && (
                <div className="max-w-xs mx-auto aspect-[9/16] bg-zinc-950 border border-white/15 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between p-4">
                  {screenshot ? (
                    <img src={screenshot} alt="TikTok Media" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-black to-zinc-950" />
                  )}

                  {/* Top Bar */}
                  <div className="relative z-10 flex items-center justify-center text-xs font-bold text-white/80">
                    <span>Following</span>
                    <span className="mx-2 text-white/30">|</span>
                    <span className="text-white border-b-2 border-white pb-0.5">For You</span>
                  </div>

                  {/* Right Floating Actions */}
                  <div className="absolute right-3 bottom-16 z-10 flex flex-col items-center gap-4 text-white text-[10px] font-bold">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-rose-500">
                        <Heart className="w-5 h-5 fill-rose-500" />
                      </div>
                      <span>28.4K</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <span>1,240</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                        <Bookmark className="w-5 h-5" />
                      </div>
                      <span>4,812</span>
                    </div>
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="relative z-10 space-y-1.5 text-left pr-12 pb-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      @exismic.creator
                    </div>
                    <p className="text-[11px] text-zinc-100 line-clamp-3 leading-relaxed drop-shadow-md">
                      {activeCaption.caption}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {activeCaption.hashtags?.slice(0, 3).map((h, i) => (
                        <span key={i} className="text-[10px] font-bold text-white/90">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Mockup */}
              {mockupTab === "linkedin" && (
                <div className="max-w-md mx-auto bg-black border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-xs font-black text-blue-200">
                        EX
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Exismic Team • <span className="font-normal text-zinc-400">1st</span>
                        </div>
                        <div className="text-[10px] text-zinc-400">Product Studio & Engineering</div>
                        <div className="text-[9px] text-zinc-500">1h • 🌐</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-400 hover:underline cursor-pointer">+ Follow</span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line font-normal">
                    {activeCaption.caption}
                  </p>

                  {activeCaption.hashtags && activeCaption.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeCaption.hashtags.map((h, i) => (
                        <span key={i} className="text-xs font-semibold text-blue-400">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1 text-zinc-400">
                      👍 💡 ❤️ 684 reactions
                    </span>
                    <span>42 comments</span>
                  </div>
                </div>
              )}

            </div>

            {/* Generated Variations List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Generated Variations ({captions.length})
                </span>
                <span className="text-[10px] text-zinc-500">
                  Click any variation to load into preview
                </span>
              </div>

              <div className="space-y-3">
                {captions.map((cap, idx) => {
                  const isCurrent = activeCaptionIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-4 sm:p-5 rounded-2xl border transition-all text-left relative overflow-hidden",
                        isCurrent
                          ? "bg-rose-500/10 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                          : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-rose-300 border border-rose-500/20">
                            {cap.hookType || `Variation #${idx + 1}`}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Live in Preview
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-zinc-500 font-mono">
                          {cap.caption.length} chars
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal whitespace-pre-line mb-3">
                        {cap.caption}
                      </p>

                      {cap.hashtags && cap.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {cap.hashtags.map((h, i) => (
                            <span key={i} className="text-[10px] font-medium text-rose-400/90">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5">
                        <button
                          onClick={() => setActiveCaptionIndex(idx)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer",
                            isCurrent
                              ? "bg-rose-500 text-white"
                              : "bg-white/5 hover:bg-white/10 text-zinc-300"
                          )}
                        >
                          {isCurrent ? "Active in Preview" : "Preview in Mockup"}
                        </button>

                        <div className="flex items-center gap-2">
                          {cap.hashtags?.length > 0 && (
                            <button
                              onClick={() => copyOnlyHashtags(cap.hashtags, idx)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                            >
                              {copiedHashtagsId === idx ? "Tags Copied!" : "Copy Tags Only"}
                            </button>
                          )}

                          <button
                            onClick={() => copyFullCaption(cap.caption, cap.hashtags || [], idx)}
                            className={cn(
                              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-sm",
                              copiedId === idx
                                ? "bg-emerald-500 text-zinc-950 font-bold"
                                : "bg-white text-zinc-950 hover:bg-zinc-200"
                            )}
                          >
                            {copiedId === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === idx ? "Copied!" : "Copy Post"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Recommended Next Steps & Tool Workflows */}
      <ToolWorkflowChaining
        currentToolId="social-caption-generator"
        categoryId="creator"
        outputContent={activeCaption.caption}
      />

      {/* Category Companion Suggestions */}
      <ToolSuggestions
        currentToolId="social-caption-generator"
        categoryId="creator"
        outputContent={activeCaption.caption}
      />

      {/* In-Flight Processing Modal Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050608]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 border-2 border-rose-500/20 border-t-rose-400 rounded-full animate-spin" />
              <Share2 className="absolute inset-0 m-auto w-8 h-8 text-rose-400 animate-pulse" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3 max-w-md">
              {statusMessage}
            </h4>
            <div className="w-full max-w-sm h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_25px_rgba(244,63,94,0.6)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-zinc-400 font-medium tracking-normal">
              Crafting high-engagement social media captions tailored for your audience
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Native In-Place Credit Refill Modal */}
      {showUpsell && (
        <BuyCreditsModal
          isOpen={showUpsell}
          onClose={() => setShowUpsell(false)}
        />
      )}
    </div>
  );
}
