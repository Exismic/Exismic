"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  Sliders,
  Palette,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  MessageSquare,
  Repeat,
  Heart,
  Bookmark,
  Upload,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Flame,
  Send,
  MoreHorizontal,
  AtSign,
  Hash,
  Smile,
  Zap,
  Laptop,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ============================================================================
// TYPES & THEMES (100% Plain Everyday English)
// ============================================================================

export type PlatformType = "twitter" | "threads" | "instagram";
export type VerificationBadge = "none" | "blue" | "gold";
export type CardTheme = "obsidian" | "dark" | "dim" | "light";

interface AvatarPreset {
  id: string;
  name: string;
  svgDataUri: string;
}

// Crisp inline SVGs so there are never CORS issues when copying/exporting images
const PRESET_AVATARS: AvatarPreset[] = [
  {
    id: "founder",
    name: "Founder",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%236366f1"/><stop offset="100%" stop-color="%23a855f7"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g)"/><circle cx="50" cy="38" r="18" fill="%23ffffff"/><path d="M22 86 C22 62, 78 62, 78 86 Z" fill="%23ffffff"/></svg>`,
  },
  {
    id: "cyber",
    name: "Cyber",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g)"/><circle cx="50" cy="38" r="18" fill="%23ffffff"/><path d="M22 86 C22 62, 78 62, 78 86 Z" fill="%23ffffff"/></svg>`,
  },
  {
    id: "sunset",
    name: "Sunset",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f43f5e"/><stop offset="100%" stop-color="%23f59e0b"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g)"/><circle cx="50" cy="38" r="18" fill="%23ffffff"/><path d="M22 86 C22 62, 78 62, 78 86 Z" fill="%23ffffff"/></svg>`,
  },
  {
    id: "emerald",
    name: "Emerald",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%2314b8a6"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g)"/><circle cx="50" cy="38" r="18" fill="%23ffffff"/><path d="M22 86 C22 62, 78 62, 78 86 Z" fill="%23ffffff"/></svg>`,
  },
  {
    id: "carbon",
    name: "Carbon",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23334155"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g)"/><circle cx="50" cy="38" r="18" fill="%23ffffff"/><path d="M22 86 C22 62, 78 62, 78 86 Z" fill="%23ffffff"/></svg>`,
  },
];

interface QuickPreset {
  id: string;
  label: string;
  name: string;
  handle: string;
  badge: VerificationBadge;
  text: string;
  views: string;
  reposts: string;
  likes: string;
  bookmarks: string;
  replies: string;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: "viral-take",
    label: "🔥 Viral Advice",
    name: "Alex Rivera",
    handle: "ariverabuilds",
    badge: "blue",
    text: "Building a company is 10% having a great idea and 90% not giving up when everything is on fire.\n\nMost people quit right before the breakthrough.",
    views: "1.2M",
    reposts: "4,820",
    likes: "38.5K",
    bookmarks: "6,190",
    replies: "842",
  },
  {
    id: "milestone",
    label: "🚀 Milestone",
    name: "Exismic Studio",
    handle: "exismic",
    badge: "gold",
    text: "We just crossed 100,000 active creators with $0 spent on paid advertising.\n\nAll organic love. Thank you to everyone building the future with us!",
    views: "850K",
    reposts: "2,430",
    likes: "21.4K",
    bookmarks: "3,800",
    replies: "512",
  },
  {
    id: "shower-thought",
    label: "💡 Relatable Take",
    name: "Sam Chen",
    handle: "samchendev",
    badge: "none",
    text: "Why do people say 'slept like a baby' when babies literally wake up crying every 2 hours?\n\nI want to sleep like a cat that pays zero rent.",
    views: "2.4M",
    reposts: "18.6K",
    likes: "142K",
    bookmarks: "12.4K",
    replies: "2,190",
  },
  {
    id: "quote-wisdom",
    label: "✨ Creator Wisdom",
    name: "Elena Rostova",
    handle: "elena_creates",
    badge: "blue",
    text: "Stop waiting for inspiration. Write the first draft badly. Design the first logo poorly. Record the first podcast awkwardly.\n\nAction creates clarity, not waiting.",
    views: "490K",
    reposts: "3,110",
    likes: "27.8K",
    bookmarks: "9,420",
    replies: "390",
  },
];

// Helper to format text with colored hashtags & mentions
function renderFormattedText(text: string, isLight: boolean) {
  const parts = text.split(/(\s+)/);
  return parts.map((part, i) => {
    if (part.startsWith("#") && part.length > 1) {
      return (
        <span key={i} className={isLight ? "text-sky-600 font-medium" : "text-sky-400 font-medium"}>
          {part}
        </span>
      );
    }
    if (part.startsWith("@") && part.length > 1) {
      return (
        <span key={i} className={isLight ? "text-sky-600 font-medium" : "text-sky-400 font-medium"}>
          {part}
        </span>
      );
    }
    return part;
  });
}

// Verified Checkmark Badges
function VerifiedBadgeIcon({ type }: { type: VerificationBadge }) {
  if (type === "none") return null;

  if (type === "gold") {
    return (
      <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-[#e2b714] text-black rounded-[4px] shrink-0 ml-1">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" strokeWidth="3">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </span>
    );
  }

  // Blue Checkmark
  return (
    <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-[#1d9bf0] text-white rounded-full shrink-0 ml-1">
      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" strokeWidth="3">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SocialPostStudio() {
  // Studio State
  const [platform, setPlatform] = useState<PlatformType>("twitter");
  const [theme, setTheme] = useState<CardTheme>("obsidian");
  const [displayName, setDisplayName] = useState("Alex Rivera");
  const [username, setUsername] = useState("ariverabuilds");
  const [badge, setBadge] = useState<VerificationBadge>("blue");
  const [postText, setPostText] = useState(
    "Building a company is 10% having a great idea and 90% not giving up when everything is on fire.\n\nMost people quit right before the breakthrough."
  );
  const [avatarUri, setAvatarUri] = useState<string>(PRESET_AVATARS[0].svgDataUri);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // Time & Source
  const [timeString, setTimeString] = useState("10:42 AM");
  const [dateString, setDateString] = useState("Sep 13, 2026");
  const [sourceApp, setSourceApp] = useState("Twitter for iPhone");
  const [showSource, setShowSource] = useState(true);

  // Metrics
  const [views, setViews] = useState("1.2M");
  const [reposts, setReposts] = useState("4,820");
  const [likes, setLikes] = useState("38.5K");
  const [bookmarks, setBookmarks] = useState("6,190");
  const [replies, setReplies] = useState("842");
  const [showMetrics, setShowMetrics] = useState(true);

  // Instagram Comment specifics
  const [commentTimeAgo, setCommentTimeAgo] = useState("2h");
  const [isLikedByAuthor, setIsLikedByAuthor] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState<"preview" | "content" | "metrics" | "look">("preview");
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [pipelineUrl, setPipelineUrl] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Handle custom avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUri(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle attached photo upload
  const handleAttachedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAttachedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Apply Quick Preset
  const handleApplyPreset = (preset: QuickPreset) => {
    setDisplayName(preset.name);
    setUsername(preset.handle);
    setBadge(preset.badge);
    setPostText(preset.text);
    setViews(preset.views);
    setReposts(preset.reposts);
    setLikes(preset.likes);
    setBookmarks(preset.bookmarks);
    setReplies(preset.replies);
  };

  // Set time to right now
  const handleSetToNow = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedDate = now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    setTimeString(formattedTime);
    setDateString(formattedDate);
    setCommentTimeAgo("just now");
  };

  // 1-Click Copy Picture to Clipboard
  const handleCopyPicture = async () => {
    if (!cardRef.current || isCopying) return;
    setIsCopying(true);
    setCopySuccess(false);

    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
      });

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      } else {
        throw new Error("Clipboard write not supported");
      }
    } catch {
      // Fallback: trigger download if clipboard API is blocked by browser permissions
      handleDownloadPng();
    } finally {
      setIsCopying(false);
    }
  };

  // 1-Click Download High-Res PNG
  const handleDownloadPng = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `exismic-${platform}-post-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Update Media Pipeline URL for handoffs (debounced)
  const updatePipelineImage = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 1.5,
        cacheBust: true,
      });
      setPipelineUrl(dataUrl);
    } catch {
      // Ignore preview update errors
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePipelineImage();
    }, 800);
    return () => clearTimeout(timer);
  }, [
    platform,
    theme,
    displayName,
    username,
    badge,
    postText,
    avatarUri,
    attachedImage,
    views,
    reposts,
    likes,
    bookmarks,
    replies,
    timeString,
    dateString,
    showMetrics,
    updatePipelineImage,
  ]);

  // Styling maps for themes
  const themeStyles = {
    obsidian: {
      card: "bg-[#080914] text-white border border-purple-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.15)]",
      subtext: "text-zinc-400",
      border: "border-white/[0.08]",
      accent: "text-purple-400",
      btnHover: "hover:bg-white/[0.06]",
      isLight: false,
    },
    dark: {
      card: "bg-black text-white border border-[#2f3336] shadow-2xl",
      subtext: "text-[#71767b]",
      border: "border-[#2f3336]",
      accent: "text-[#1d9bf0]",
      btnHover: "hover:bg-white/[0.06]",
      isLight: false,
    },
    dim: {
      card: "bg-[#15202b] text-white border border-[#38444d] shadow-2xl",
      subtext: "text-[#8b98a5]",
      border: "border-[#38444d]",
      accent: "text-[#1d9bf0]",
      btnHover: "hover:bg-white/[0.06]",
      isLight: false,
    },
    light: {
      card: "bg-white text-[#0f1419] border border-[#eff3f4] shadow-[0_15px_40px_rgba(0,0,0,0.08)]",
      subtext: "text-[#536471]",
      border: "border-[#eff3f4]",
      accent: "text-[#1d9bf0]",
      btnHover: "hover:bg-black/[0.04]",
      isLight: true,
    },
  }[theme];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Top Banner / Quick Preset Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0b0f19]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">Quick Inspiration:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 hover:text-white transition-all active:scale-95"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Segmented Navigation Tabs */}
      <div className="lg:hidden flex items-center p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1">
        <button
          onClick={() => setActiveTab("preview")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "preview"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "content"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Post Text
        </button>
        <button
          onClick={() => setActiveTab("metrics")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "metrics"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          Numbers
        </button>
        <button
          onClick={() => setActiveTab("look")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "look"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Palette className="w-3.5 h-3.5" />
          Card Look
        </button>
      </div>

      {/* Main Studio Grid: Controls on Left, Live Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: CONTROLS PANEL */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-5 space-y-5",
            activeTab === "preview" ? "hidden lg:block" : "block"
          )}
        >
          {/* Section 1: Platform & Visual Theme */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                1. Select Social Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPlatform("twitter")}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all active:scale-95",
                    platform === "twitter"
                      ? "bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <span className="text-base font-bold">𝕏</span>
                  <span>Twitter / X</span>
                </button>
                <button
                  onClick={() => setPlatform("threads")}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all active:scale-95",
                    platform === "threads"
                      ? "bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <span className="text-base font-bold">@</span>
                  <span>Threads</span>
                </button>
                <button
                  onClick={() => setPlatform("instagram")}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition-all active:scale-95",
                    platform === "instagram"
                      ? "bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <span className="text-base">💬</span>
                  <span>IG Comment</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                2. Card Background Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setTheme("obsidian")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all",
                    theme === "obsidian"
                      ? "bg-purple-500/20 text-purple-200 border-purple-500/40"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  Obsidian
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all",
                    theme === "dark"
                      ? "bg-zinc-800 text-white border-zinc-500"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-white/30 shrink-0" />
                  Black
                </button>
                <button
                  onClick={() => setTheme("dim")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all",
                    theme === "dim"
                      ? "bg-sky-900/40 text-sky-200 border-sky-500/40"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#15202b] border border-sky-400/40 shrink-0" />
                  Dim Navy
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all",
                    theme === "light"
                      ? "bg-white text-zinc-900 border-white font-semibold"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-black/20 shrink-0" />
                  Clean Light
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Account Identity */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <AtSign className="w-3.5 h-3.5 text-rose-400" />
              Creator Profile & Avatar
            </h3>

            {/* Avatar Selector */}
            <div>
              <label className="text-xs text-zinc-400 block mb-2">Profile Picture</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setAvatarUri(p.svgDataUri)}
                    className={cn(
                      "w-10 h-10 rounded-full overflow-hidden border-2 transition-all active:scale-95",
                      avatarUri === p.svgDataUri
                        ? "border-rose-400 scale-105 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.svgDataUri} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}

                {/* Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 px-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                </button>
              </div>
            </div>

            {/* Name & Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Username Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
                    placeholder="handle"
                    className="w-full pl-7 pr-3 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">Verification Badge</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setBadge("none")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-medium border transition-all",
                    badge === "none"
                      ? "bg-white/[0.1] text-white border-white/30"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.05]"
                  )}
                >
                  None
                </button>
                <button
                  onClick={() => setBadge("blue")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all",
                    badge === "blue"
                      ? "bg-sky-500/20 text-sky-200 border-sky-500/40"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.05]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  Blue Badge
                </button>
                <button
                  onClick={() => setBadge("gold")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-all",
                    badge === "gold"
                      ? "bg-amber-500/20 text-amber-200 border-amber-500/40"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.05]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-amber-400" />
                  Gold Org
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Post Content */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                Post Text & Media
              </h3>
              <span className="text-[11px] text-zinc-500">{postText.length} characters</span>
            </div>

            <div>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={4}
                placeholder="Type your viral message here... (use #hashtags and @mentions)"
                className="w-full p-3 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Attached Media */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">Optional Attached Photo</label>
              {attachedImage ? (
                <div className="relative rounded-xl overflow-hidden border border-white/[0.1] bg-black/40 p-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={attachedImage}
                      alt="Attached"
                      className="w-12 h-12 rounded-lg object-cover border border-white/10"
                    />
                    <span className="text-xs text-zinc-300">Photo Attached</span>
                  </div>
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    ref={mediaInputRef}
                    onChange={handleAttachedImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => mediaInputRef.current?.click()}
                    className="w-full py-3 rounded-xl border border-dashed border-white/[0.12] hover:border-rose-400/40 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-medium text-zinc-400 hover:text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <ImageIcon className="w-4 h-4 text-rose-400" />
                    Attach a Photo or Screenshot to Post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Date, Time & Engagement Numbers */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-rose-400" />
                Date, Time & Stats
              </h3>
              <button
                onClick={handleSetToNow}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                Set to Now
              </button>
            </div>

            {platform !== "instagram" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Time</label>
                    <input
                      type="text"
                      value={timeString}
                      onChange={(e) => setTimeString(e.target.value)}
                      placeholder="10:42 AM"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Date</label>
                    <input
                      type="text"
                      value={dateString}
                      onChange={(e) => setDateString(e.target.value)}
                      placeholder="Sep 13, 2026"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                {platform === "twitter" && (
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Client Tag</label>
                    <input
                      type="text"
                      value={sourceApp}
                      onChange={(e) => setSourceApp(e.target.value)}
                      placeholder="Twitter for iPhone"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Relative Time Ago</label>
                <input
                  type="text"
                  value={commentTimeAgo}
                  onChange={(e) => setCommentTimeAgo(e.target.value)}
                  placeholder="2h or 1d"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                />
              </div>
            )}

            {/* Metrics Inputs */}
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Engagement Counters</span>
                <button
                  onClick={() => setShowMetrics(!showMetrics)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  {showMetrics ? "Hide Numbers" : "Show Numbers"}
                </button>
              </div>

              {showMetrics && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {platform === "twitter" && (
                    <div>
                      <span className="text-[11px] text-zinc-500 block mb-1">Views</span>
                      <input
                        type="text"
                        value={views}
                        onChange={(e) => setViews(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] text-zinc-500 block mb-1">
                      {platform === "instagram" ? "Comment Likes" : "Likes"}
                    </span>
                    <input
                      type="text"
                      value={likes}
                      onChange={(e) => setLikes(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none"
                    />
                  </div>
                  {platform !== "instagram" && (
                    <>
                      <div>
                        <span className="text-[11px] text-zinc-500 block mb-1">Reposts</span>
                        <input
                          type="text"
                          value={reposts}
                          onChange={(e) => setReposts(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-500 block mb-1">Replies</span>
                        <input
                          type="text"
                          value={replies}
                          onChange={(e) => setReplies(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-500 block mb-1">Bookmarks</span>
                        <input
                          type="text"
                          value={bookmarks}
                          onChange={(e) => setBookmarks(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none"
                        />
                      </div>
                    </>
                  )}
                  {platform === "instagram" && (
                    <div className="col-span-2 flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="likedByAuthor"
                        checked={isLikedByAuthor}
                        onChange={(e) => setIsLikedByAuthor(e.target.checked)}
                        className="rounded accent-rose-500"
                      />
                      <label htmlFor="likedByAuthor" className="text-xs text-zinc-300">
                        Show &quot;Liked by creator&quot; badge
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: LIVE PREVIEW & EXPORT ACTIONS */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-7 space-y-5",
            activeTab !== "preview" ? "hidden lg:block" : "block"
          )}
        >
          {/* Action Header: 1-Click Copy & Download */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-200">Live Post Preview</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPicture}
                disabled={isCopying}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all active:scale-95",
                  copySuccess
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.12]"
                )}
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied Picture!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-300" />
                    {isCopying ? "Copying..." : "Copy Picture"}
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadPng}
                disabled={isDownloading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                {isDownloading ? "Generating..." : "Download Card"}
              </button>
            </div>
          </div>

          {/* Realistic Card Preview Stage */}
          <div className="p-4 sm:p-8 rounded-3xl bg-[#070811] border border-white/[0.06] flex items-center justify-center min-h-[380px] overflow-hidden">
            {/* The Actual Mockup Element captured by html-to-image */}
            <div
              ref={cardRef}
              className={cn(
                "w-full max-w-[550px] rounded-2xl p-5 transition-all font-sans select-none",
                themeStyles.card
              )}
            >
              {/* ========================================================= */}
              {/* CASE 1: TWITTER / X POST */}
              {/* ========================================================= */}
              {platform === "twitter" && (
                <div className="space-y-3.5">
                  {/* Header: Avatar, Name, Handle, Logo */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUri}
                        alt={displayName}
                        className="w-11 h-11 rounded-full object-cover shrink-0 border border-white/10"
                      />
                      <div className="leading-tight">
                        <div className="flex items-center font-bold text-[15px]">
                          <span>{displayName}</span>
                          <VerifiedBadgeIcon type={badge} />
                        </div>
                        <div className={cn("text-xs font-normal mt-0.5", themeStyles.subtext)}>
                          @{username}
                        </div>
                      </div>
                    </div>

                    {/* X Logo */}
                    <div className={cn("text-base font-bold select-none", themeStyles.subtext)}>
                      𝕏
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="text-[15px] leading-relaxed whitespace-pre-line break-words pt-0.5">
                    {renderFormattedText(postText, themeStyles.isLight)}
                  </div>

                  {/* Optional Attached Media */}
                  {attachedImage && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 max-h-[320px] bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachedImage}
                        alt="Post media"
                        className="w-full h-full object-cover max-h-[320px]"
                      />
                    </div>
                  )}

                  {/* Timestamp & Views */}
                  <div
                    className={cn(
                      "text-xs pt-1 flex items-center gap-1.5 flex-wrap",
                      themeStyles.subtext
                    )}
                  >
                    <span>{timeString}</span>
                    <span>·</span>
                    <span>{dateString}</span>
                    {views && (
                      <>
                        <span>·</span>
                        <span className={themeStyles.isLight ? "text-zinc-900 font-semibold" : "text-white font-semibold"}>
                          {views}
                        </span>
                        <span>Views</span>
                      </>
                    )}
                    {showSource && sourceApp && (
                      <>
                        <span>·</span>
                        <span className={themeStyles.accent}>{sourceApp}</span>
                      </>
                    )}
                  </div>

                  {/* Horizontal Divider */}
                  {showMetrics && <div className={cn("border-t", themeStyles.border)} />}

                  {/* Engagement Metrics Row */}
                  {showMetrics && (
                    <div className="flex items-center justify-between text-xs pt-1 px-1">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 opacity-70" />
                        <span>{replies}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Repeat className="w-4 h-4 opacity-70" />
                        <span>{reposts}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 opacity-70 text-rose-500" fill="currentColor" />
                        <span>{likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bookmark className="w-4 h-4 opacity-70" />
                        <span>{bookmarks}</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-70">
                        <Share2 className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* CASE 2: META THREADS POST */}
              {/* ========================================================= */}
              {platform === "threads" && (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUri}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                      />
                      <div className="leading-tight">
                        <div className="flex items-center font-bold text-[15px]">
                          <span>{username}</span>
                          <VerifiedBadgeIcon type={badge} />
                        </div>
                        <div className={cn("text-xs font-normal mt-0.5", themeStyles.subtext)}>
                          {displayName}
                        </div>
                      </div>
                    </div>

                    <div className={cn("text-sm font-semibold flex items-center gap-2", themeStyles.subtext)}>
                      <span>{commentTimeAgo}</span>
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Threads Body */}
                  <div className="text-[15px] leading-relaxed whitespace-pre-line break-words pl-1">
                    {renderFormattedText(postText, themeStyles.isLight)}
                  </div>

                  {/* Attached Media */}
                  {attachedImage && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 max-h-[300px] bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachedImage}
                        alt="Thread attachment"
                        className="w-full h-full object-cover max-h-[300px]"
                      />
                    </div>
                  )}

                  {/* Threads Action Icons */}
                  <div className="flex items-center gap-4 pt-1 text-sm">
                    <Heart className="w-5 h-5 opacity-80" />
                    <MessageSquare className="w-5 h-5 opacity-80" />
                    <Repeat className="w-5 h-5 opacity-80" />
                    <Send className="w-5 h-5 opacity-80" />
                  </div>

                  {/* Threads Follower Stats Summary */}
                  {showMetrics && (
                    <div className={cn("text-xs pt-1", themeStyles.subtext)}>
                      {replies} replies · {likes} likes
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* CASE 3: INSTAGRAM COMMENT */}
              {/* ========================================================= */}
              {platform === "instagram" && (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUri}
                      alt={username}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10 mt-0.5"
                    />
                    <div className="text-sm leading-snug space-y-1">
                      <div>
                        <span className="font-bold mr-1.5 inline-flex items-center">
                          {username}
                          <VerifiedBadgeIcon type={badge} />
                        </span>
                        <span className="whitespace-pre-line">
                          {renderFormattedText(postText, themeStyles.isLight)}
                        </span>
                      </div>

                      {/* Comment Sub-row: Time ago, Reply, Liked by creator */}
                      <div className={cn("text-xs flex items-center gap-3 pt-0.5", themeStyles.subtext)}>
                        <span>{commentTimeAgo}</span>
                        <span className="font-semibold cursor-pointer">Reply</span>
                        {isLikedByAuthor && (
                          <span className="flex items-center gap-1 font-medium text-rose-500">
                            <Heart className="w-3 h-3 fill-current" />
                            Liked by author
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Instagram Heart & Likes Count on Right */}
                  {showMetrics && (
                    <div className="flex flex-col items-center justify-center shrink-0 pt-1 text-zinc-400">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      <span className="text-[11px] font-medium mt-0.5">{likes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Exismic Next Action Pipeline Integration */}
          {pipelineUrl && (
            <MediaPipelineBar
              imageUrl={pipelineUrl}
              imageName="social-post-mockup.png"
              sourceToolId="post-mockup"
              sourceToolName="Fake Social Post & Tweet Studio"
              actions={["eraser", "meme", "resizer", "compressor"]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
