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
  Upload,
  Trash2,
  Globe,
  Rocket,
  Code2,
  Flame,
  ShieldCheck,
  Cpu,
  Layers,
  Layout,
  Laptop,
  Smartphone,
  CheckCircle2,
  Code,
  Tag,
  Star,
  ExternalLink,
  BookOpen,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ============================================================================
// TYPES & THEMES (100% Plain Everyday English)
// ============================================================================

export type BannerLayout = "saas-launch" | "tech-blog" | "github-repo" | "minimalist" | "split-showcase";
export type BannerTheme = "obsidian" | "cyber" | "sunset" | "emerald" | "carbon" | "twilight" | "solaris" | "light";
export type BannerPattern = "grid" | "dots" | "glow" | "clean";
export type PreviewSimulator = "canvas" | "twitter" | "discord" | "linkedin" | "google";
export type ShowcaseIcon = "sparkles" | "rocket" | "code" | "flame" | "shield" | "globe" | "cpu";

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
];

interface QuickPreset {
  id: string;
  label: string;
  layout: BannerLayout;
  theme: BannerTheme;
  headline: string;
  subtitle: string;
  tag: string;
  author: string;
  domain: string;
  icon: ShowcaseIcon;
  meta: string;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: "saas",
    label: "🚀 Product Launch",
    layout: "saas-launch",
    theme: "obsidian",
    headline: "Turn Raw Media into Viral Content in Seconds",
    subtitle: "The all-in-one AI creative suite for modern creators, editors, and video teams.",
    tag: "PRODUCT RELEASE",
    author: "Exismic Studio",
    domain: "exismic.xyz",
    icon: "rocket",
    meta: "Free · No Credit Card Required",
  },
  {
    id: "tech-blog",
    label: "📘 Tech Guide",
    layout: "tech-blog",
    theme: "cyber",
    headline: "How We Scaled Mobile Latency from 800ms to 12ms",
    subtitle: "A deep dive into edge caching, GPU blur limits, and hardware-accelerated CSS animations.",
    tag: "ENGINEERING",
    author: "Alex Rivera",
    domain: "exismic.xyz/blog",
    icon: "cpu",
    meta: "5 min read · Sep 2026",
  },
  {
    id: "github",
    label: "⭐ Open Source Repo",
    layout: "github-repo",
    theme: "carbon",
    headline: "exismic / media-pipeline-core",
    subtitle: "Blazing fast client-side image processing, compression, and background removal with $0 server cost.",
    tag: "OPEN SOURCE",
    author: "Exismic Org",
    domain: "github.com/exismic",
    icon: "code",
    meta: "⭐ 4.8k stars · TypeScript",
  },
  {
    id: "playbook",
    label: "💡 Creator Playbook",
    layout: "minimalist",
    theme: "sunset",
    headline: "10 Non-Obvious Lessons from 100,000 Creators",
    subtitle: "Actionable frameworks for high-retention video hooks and organic viral growth.",
    tag: "MASTERCLASS",
    author: "Elena Rostova",
    domain: "exismic.xyz",
    icon: "sparkles",
    meta: "Free Guide & Templates",
  },
];

// Map showcase icons
function renderShowcaseIcon(icon: ShowcaseIcon, className: string = "w-8 h-8") {
  switch (icon) {
    case "sparkles":
      return <Sparkles className={className} />;
    case "rocket":
      return <Rocket className={className} />;
    case "code":
      return <Code2 className={className} />;
    case "flame":
      return <Flame className={className} />;
    case "shield":
      return <ShieldCheck className={className} />;
    case "globe":
      return <Globe className={className} />;
    case "cpu":
      return <Cpu className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OgBannerStudio() {
  // Banner State
  const [layout, setLayout] = useState<BannerLayout>("saas-launch");
  const [theme, setTheme] = useState<BannerTheme>("obsidian");
  const [pattern, setPattern] = useState<BannerPattern>("grid");
  const [showcaseIcon, setShowcaseIcon] = useState<ShowcaseIcon>("rocket");

  const [headline, setHeadline] = useState("Turn Raw Media into Viral Content in Seconds");
  const [subtitle, setSubtitle] = useState(
    "The all-in-one AI creative suite for modern creators, editors, and video teams."
  );
  const [categoryTag, setCategoryTag] = useState("PRODUCT RELEASE");
  const [authorName, setAuthorName] = useState("Exismic Studio");
  const [domainName, setDomainName] = useState("exismic.xyz");
  const [metaInfo, setMetaInfo] = useState("Free · No Credit Card Required");
  const [avatarUri, setAvatarUri] = useState<string>(PRESET_AVATARS[0].svgDataUri);

  // Simulator Mode
  const [simulator, setSimulator] = useState<PreviewSimulator>("canvas");

  // UI state
  const [activeTab, setActiveTab] = useState<"preview" | "content" | "look" | "simulators">("preview");
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [metaCopied, setMetaCopied] = useState(false);
  const [pipelineUrl, setPipelineUrl] = useState<string | null>(null);

  const bannerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Apply Quick Preset
  const handleApplyPreset = (preset: QuickPreset) => {
    setLayout(preset.layout);
    setTheme(preset.theme);
    setHeadline(preset.headline);
    setSubtitle(preset.subtitle);
    setCategoryTag(preset.tag);
    setAuthorName(preset.author);
    setDomainName(preset.domain);
    setShowcaseIcon(preset.icon);
    setMetaInfo(preset.meta);
  };

  // 1-Click Copy Picture to Clipboard
  const handleCopyPicture = async () => {
    if (!bannerRef.current || isCopying) return;
    setIsCopying(true);
    setCopySuccess(false);

    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(bannerRef.current, {
        pixelRatio: 2,
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
      handleDownloadPng();
    } finally {
      setIsCopying(false);
    }
  };

  // 1-Click Download High-Res PNG (1200x630)
  const handleDownloadPng = async () => {
    if (!bannerRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(bannerRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `og-banner-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Failed to download banner. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // 1-Click Copy Ready-to-Paste HTML Meta Tags
  const handleCopyMetaTags = () => {
    const metaTags = `<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://${domainName}/" />
<meta property="og:title" content="${headline}" />
<meta property="og:description" content="${subtitle}" />
<meta property="og:image" content="https://${domainName}/og-image.png" />

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="https://${domainName}/" />
<meta name="twitter:title" content="${headline}" />
<meta name="twitter:description" content="${subtitle}" />
<meta name="twitter:image" content="https://${domainName}/og-image.png" />`;

    navigator.clipboard.writeText(metaTags);
    setMetaCopied(true);
    setTimeout(() => setMetaCopied(false), 2500);
  };

  // Update Media Pipeline URL for handoffs (debounced)
  const updatePipelineImage = useCallback(async () => {
    if (!bannerRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(bannerRef.current, {
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
    layout,
    theme,
    pattern,
    headline,
    subtitle,
    categoryTag,
    authorName,
    domainName,
    metaInfo,
    showcaseIcon,
    avatarUri,
    updatePipelineImage,
  ]);

  // Theme styling definitions
  const themeConfig = {
    obsidian: {
      bg: "bg-[#080914]",
      radial: "radial-gradient(circle at 80% 20%, rgba(168,85,247,0.35), transparent 45%), radial-gradient(circle at 20% 80%, rgba(6,182,212,0.3), transparent 45%)",
      border: "border-purple-500/30",
      accent: "from-purple-400 to-cyan-400",
      pill: "bg-purple-500/15 border-purple-500/30 text-purple-300",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      isLight: false,
    },
    cyber: {
      bg: "bg-[#060b19]",
      radial: "radial-gradient(circle at 85% 15%, rgba(6,182,212,0.4), transparent 50%), radial-gradient(circle at 15% 85%, rgba(59,130,246,0.3), transparent 45%)",
      border: "border-cyan-500/30",
      accent: "from-cyan-400 to-blue-400",
      pill: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      isLight: false,
    },
    sunset: {
      bg: "bg-[#14080e]",
      radial: "radial-gradient(circle at 80% 20%, rgba(244,63,94,0.35), transparent 45%), radial-gradient(circle at 15% 85%, rgba(245,158,11,0.3), transparent 45%)",
      border: "border-rose-500/30",
      accent: "from-rose-400 to-amber-400",
      pill: "bg-rose-500/15 border-rose-500/30 text-rose-300",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      isLight: false,
    },
    emerald: {
      bg: "bg-[#07130e]",
      radial: "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.35), transparent 45%), radial-gradient(circle at 15% 85%, rgba(20,184,166,0.3), transparent 45%)",
      border: "border-emerald-500/30",
      accent: "from-emerald-400 to-teal-400",
      pill: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      isLight: false,
    },
    carbon: {
      bg: "bg-[#0d1117]",
      radial: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05), transparent 60%)",
      border: "border-white/10",
      accent: "from-zinc-100 to-zinc-400",
      pill: "bg-white/10 border-white/20 text-zinc-200",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      isLight: false,
    },
    twilight: {
      bg: "bg-[#0f0919]",
      radial: "radial-gradient(circle at 85% 15%, rgba(217,70,239,0.35), transparent 45%), radial-gradient(circle at 15% 85%, rgba(99,102,241,0.3), transparent 45%)",
      border: "border-fuchsia-500/30",
      accent: "from-fuchsia-400 to-indigo-400",
      pill: "bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-300",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      isLight: false,
    },
    solaris: {
      bg: "bg-[#120e06]",
      radial: "radial-gradient(circle at 80% 20%, rgba(234,179,8,0.35), transparent 45%), radial-gradient(circle at 15% 85%, rgba(249,115,22,0.3), transparent 45%)",
      border: "border-amber-500/30",
      accent: "from-amber-300 to-orange-400",
      pill: "bg-amber-500/15 border-amber-500/30 text-amber-300",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      isLight: false,
    },
    light: {
      bg: "bg-white",
      radial: "radial-gradient(circle at 80% 20%, rgba(236,72,153,0.1), transparent 45%), radial-gradient(circle at 15% 85%, rgba(59,130,246,0.1), transparent 45%)",
      border: "border-zinc-200",
      accent: "from-purple-600 to-blue-600",
      pill: "bg-purple-50 border-purple-200 text-purple-700",
      textPrimary: "text-zinc-900",
      textSecondary: "text-zinc-600",
      isLight: true,
    },
  }[theme];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Top Banner / Quick Inspiration Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0b0f19]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-300">Quick Templates:</span>
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
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
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
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Tag className="w-3.5 h-3.5" />
          Content
        </button>
        <button
          onClick={() => setActiveTab("look")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "look"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Palette className="w-3.5 h-3.5" />
          Look
        </button>
        <button
          onClick={() => setActiveTab("simulators")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === "simulators"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Share2 className="w-3.5 h-3.5" />
          Simulators
        </button>
      </div>

      {/* Main Studio Grid: Controls on Left, Canvas Preview on Right */}
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
          {/* Section 1: Layout & Visual Theme */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                1. Choose Banner Layout
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setLayout("saas-launch")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all text-center",
                    layout === "saas-launch"
                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-semibold"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  🚀 Product Launch
                </button>
                <button
                  onClick={() => setLayout("tech-blog")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all text-center",
                    layout === "tech-blog"
                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-semibold"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  📘 Blog Article
                </button>
                <button
                  onClick={() => setLayout("github-repo")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all text-center",
                    layout === "github-repo"
                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-semibold"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  ⭐ GitHub Repo
                </button>
                <button
                  onClick={() => setLayout("minimalist")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all text-center",
                    layout === "minimalist"
                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-semibold"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  ✨ Minimal Studio
                </button>
                <button
                  onClick={() => setLayout("split-showcase")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all text-center col-span-2 sm:col-span-1",
                    layout === "split-showcase"
                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-semibold"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  ⚡ Split Spotlight
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                2. Color Atmosphere Theme
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
                  onClick={() => setTheme("cyber")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all",
                    theme === "cyber"
                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/40"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                  Cyber
                </button>
                <button
                  onClick={() => setTheme("sunset")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all",
                    theme === "sunset"
                      ? "bg-rose-500/20 text-rose-200 border-rose-500/40"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  Sunset
                </button>
                <button
                  onClick={() => setTheme("emerald")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all",
                    theme === "emerald"
                      ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  Emerald
                </button>
                <button
                  onClick={() => setTheme("carbon")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all",
                    theme === "carbon"
                      ? "bg-zinc-800 text-white border-zinc-500"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 shrink-0" />
                  Carbon
                </button>
                <button
                  onClick={() => setTheme("twilight")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all",
                    theme === "twilight"
                      ? "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/40"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 shrink-0" />
                  Twilight
                </button>
                <button
                  onClick={() => setTheme("solaris")}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all",
                    theme === "solaris"
                      ? "bg-amber-500/20 text-amber-200 border-amber-500/40"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  Solar Gold
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

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                3. Texture Pattern
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setPattern("grid")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center",
                    pattern === "grid"
                      ? "bg-white/[0.1] text-white border-white/30"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.05]"
                  )}
                >
                  Tech Grid
                </button>
                <button
                  onClick={() => setPattern("dots")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center",
                    pattern === "dots"
                      ? "bg-white/[0.1] text-white border-white/30"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.05]"
                  )}
                >
                  Dot Matrix
                </button>
                <button
                  onClick={() => setPattern("glow")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center",
                    pattern === "glow"
                      ? "bg-white/[0.1] text-white border-white/30"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.05]"
                  )}
                >
                  Smooth Aura
                </button>
                <button
                  onClick={() => setPattern("clean")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center",
                    pattern === "clean"
                      ? "bg-white/[0.1] text-white border-white/30"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.05]"
                  )}
                >
                  Solid Glass
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Banner Text & Headlines */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Headline & Copy
            </h3>

            {/* Headline */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-zinc-400">Main Headline Title</label>
                <span className="text-[11px] text-zinc-500">{headline.length} chars</span>
              </div>
              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                rows={2}
                placeholder="Type your bold headline..."
                className="w-full p-3 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none leading-snug font-semibold"
              />
            </div>

            {/* Subtitle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-zinc-400">Subtitle Description</label>
                <span className="text-[11px] text-zinc-500">{subtitle.length} chars</span>
              </div>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={2}
                placeholder="Add a brief supporting description..."
                className="w-full p-3 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Tag & Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Category Badge Pill</label>
                <input
                  type="text"
                  value={categoryTag}
                  onChange={(e) => setCategoryTag(e.target.value.toUpperCase())}
                  placeholder="e.g. PRODUCT RELEASE"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 uppercase font-semibold"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Meta Note / Reading Time</label>
                <input
                  type="text"
                  value={metaInfo}
                  onChange={(e) => setMetaInfo(e.target.value)}
                  placeholder="e.g. 5 min read · Free"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Branding, Author & Icon */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Branding & Author
            </h3>

            {/* Domain & Author Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Website Domain</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 text-xs">🌐</span>
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="e.g. exismic.xyz"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Author / Brand Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Exismic Studio"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Author Avatar Selector */}
            <div>
              <label className="text-xs text-zinc-400 block mb-2">Author Avatar / Logo</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setAvatarUri(p.svgDataUri)}
                    className={cn(
                      "w-9 h-9 rounded-full overflow-hidden border-2 transition-all active:scale-95",
                      avatarUri === p.svgDataUri
                        ? "border-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
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
                  className="h-9 px-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                </button>
              </div>
            </div>

            {/* Showcase Center Icon */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">Center Showcase Emblem</label>
              <div className="flex items-center gap-2 flex-wrap">
                {(["rocket", "sparkles", "code", "flame", "shield", "globe", "cpu"] as ShowcaseIcon[]).map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setShowcaseIcon(ic)}
                    className={cn(
                      "p-2 rounded-xl border transition-all active:scale-95",
                      showcaseIcon === ic
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                        : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    {renderShowcaseIcon(ic, "w-4 h-4")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: LIVE CANVAS & SIMULATOR VIEW */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-7 space-y-5",
            activeTab !== "preview" && activeTab !== "simulators" ? "hidden lg:block" : "block"
          )}
        >
          {/* Action Header: 1-Click Copy, Download & Meta Tags */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-200">1200 × 630 Canvas</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopyMetaTags}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all active:scale-95",
                  metaCopied
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/[0.08]"
                )}
              >
                {metaCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
                {metaCopied ? "Tags Copied!" : "Copy Meta Tags"}
              </button>

              <button
                onClick={handleCopyPicture}
                disabled={isCopying}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all active:scale-95",
                  copySuccess
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.12]"
                )}
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
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
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                {isDownloading ? "Saving..." : "Download 1200x630 PNG"}
              </button>
            </div>
          </div>

          {/* Social Simulator Mode Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090b14] border border-white/[0.08] overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSimulator("canvas")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                simulator === "canvas" ? "bg-white/[0.1] text-white font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              🎨 Full Canvas View
            </button>
            <button
              onClick={() => setSimulator("twitter")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                simulator === "twitter" ? "bg-white/[0.1] text-white font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              𝕏 Twitter Large Card
            </button>
            <button
              onClick={() => setSimulator("discord")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                simulator === "discord" ? "bg-white/[0.1] text-white font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              💬 Discord Embed
            </button>
            <button
              onClick={() => setSimulator("linkedin")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                simulator === "linkedin" ? "bg-white/[0.1] text-white font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              💼 LinkedIn Post
            </button>
            <button
              onClick={() => setSimulator("google")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                simulator === "google" ? "bg-white/[0.1] text-white font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              🔍 Google Result
            </button>
          </div>

          {/* =============================================================== */}
          {/* STAGE CONTAINER WITH THE REAL 1200x630 BANNER ELEMENT */}
          {/* =============================================================== */}
          <div className="p-3 sm:p-6 rounded-3xl bg-[#070811] border border-white/[0.06] flex items-center justify-center overflow-hidden">
            {/* The Actual Banner Element (Scaled smoothly via CSS aspect ratio) */}
            <div className="w-full max-w-[620px]">
              <div
                ref={bannerRef}
                style={{
                  backgroundImage:
                    pattern === "grid"
                      ? `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px), ${themeConfig.radial}`
                      : pattern === "dots"
                      ? `radial-gradient(rgba(255, 255, 255, 0.1) 1.5px, transparent 1.5px), ${themeConfig.radial}`
                      : themeConfig.radial,
                  backgroundSize:
                    pattern === "grid" ? "32px 32px, 32px 32px, auto" : pattern === "dots" ? "24px 24px, auto" : "auto",
                }}
                className={cn(
                  "w-full aspect-[1200/630] rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden font-sans border shadow-2xl transition-all select-none",
                  themeConfig.bg,
                  themeConfig.border
                )}
              >
                {/* Top Rim Specular Highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                {/* ========================================================= */}
                {/* CASE 1: MODERN SAAS PRODUCT LAUNCH */}
                {/* ========================================================= */}
                {layout === "saas-launch" && (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={cn("px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border", themeConfig.pill)}>
                          {categoryTag}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                          {renderShowcaseIcon(showcaseIcon, "w-4 h-4 text-cyan-400")}
                          <span>{domainName}</span>
                        </div>
                      </div>

                      <h1 className={cn("text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight line-clamp-2", themeConfig.textPrimary)}>
                        {headline}
                      </h1>

                      <p className={cn("text-xs sm:text-sm line-clamp-2 max-w-[90%] leading-relaxed", themeConfig.textSecondary)}>
                        {subtitle}
                      </p>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatarUri} alt={authorName} className="w-7 h-7 rounded-full object-cover border border-white/20" />
                        <div>
                          <div className={cn("text-xs font-bold leading-tight", themeConfig.textPrimary)}>{authorName}</div>
                          <div className={cn("text-[10px] leading-tight", themeConfig.textSecondary)}>{metaInfo}</div>
                        </div>
                      </div>

                      <div className={cn("px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r text-white shadow-lg", themeConfig.accent)}>
                        Get Started →
                      </div>
                    </div>
                  </>
                )}

                {/* ========================================================= */}
                {/* CASE 2: TECH BLOG ARTICLE */}
                {/* ========================================================= */}
                {layout === "tech-blog" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className={cn("px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border", themeConfig.pill)}>
                        {categoryTag}
                      </div>
                      <div className="text-xs text-zinc-400 font-medium">
                        {metaInfo}
                      </div>
                    </div>

                    <div className="my-auto space-y-2">
                      <h1 className={cn("text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug line-clamp-2", themeConfig.textPrimary)}>
                        {headline}
                      </h1>
                      <p className={cn("text-xs sm:text-sm line-clamp-2 leading-relaxed max-w-[92%]", themeConfig.textSecondary)}>
                        {subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatarUri} alt={authorName} className="w-7 h-7 rounded-full object-cover border border-white/20" />
                        <span className={cn("text-xs font-semibold", themeConfig.textPrimary)}>{authorName}</span>
                      </div>
                      <div className={cn("text-xs font-mono font-medium", themeConfig.textSecondary)}>
                        {domainName}
                      </div>
                    </div>
                  </>
                )}

                {/* ========================================================= */}
                {/* CASE 3: GITHUB REPO CARD */}
                {/* ========================================================= */}
                {layout === "github-repo" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-zinc-400" />
                        <span className={cn("text-xs font-mono font-semibold", themeConfig.textSecondary)}>
                          {authorName} /
                        </span>
                      </div>
                      <div className={cn("px-2.5 py-1 rounded-full text-[11px] font-mono border flex items-center gap-1", themeConfig.pill)}>
                        <Star className="w-3 h-3 fill-current" />
                        <span>4.8k stars</span>
                      </div>
                    </div>

                    <div className="my-auto space-y-2">
                      <h1 className={cn("text-xl sm:text-2xl md:text-3xl font-bold font-mono tracking-tight line-clamp-1", themeConfig.textPrimary)}>
                        {headline}
                      </h1>
                      <p className={cn("text-xs sm:text-sm line-clamp-2 leading-relaxed max-w-[90%]", themeConfig.textSecondary)}>
                        {subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                          TypeScript
                        </span>
                        <span className="text-zinc-500">MIT License</span>
                      </div>
                      <div className={themeConfig.textSecondary}>{domainName}</div>
                    </div>
                  </>
                )}

                {/* ========================================================= */}
                {/* CASE 4: MINIMALIST STUDIO */}
                {/* ========================================================= */}
                {layout === "minimalist" && (
                  <div className="h-full flex flex-col justify-between items-center text-center py-2">
                    <div className={cn("px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border", themeConfig.pill)}>
                      {categoryTag}
                    </div>

                    <div className="my-auto space-y-3 max-w-[90%]">
                      <h1 className={cn("text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight", themeConfig.textPrimary)}>
                        {headline}
                      </h1>
                      <p className={cn("text-xs sm:text-sm line-clamp-2 leading-relaxed", themeConfig.textSecondary)}>
                        {subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                      <span>{authorName}</span>
                      <span>·</span>
                      <span className="text-cyan-400">{domainName}</span>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* CASE 5: SPLIT SHOWCASE */}
                {/* ========================================================= */}
                {layout === "split-showcase" && (
                  <div className="h-full grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-8 flex flex-col justify-between h-full py-1">
                      <div className={cn("w-fit px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border", themeConfig.pill)}>
                        {categoryTag}
                      </div>

                      <div className="my-auto space-y-2">
                        <h1 className={cn("text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight line-clamp-2", themeConfig.textPrimary)}>
                          {headline}
                        </h1>
                        <p className={cn("text-xs sm:text-sm line-clamp-2 leading-relaxed", themeConfig.textSecondary)}>
                          {subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span>{authorName}</span>
                        <span>·</span>
                        <span className="text-cyan-400 font-semibold">{domainName}</span>
                      </div>
                    </div>

                    {/* Right side floating medallion */}
                    <div className="col-span-4 flex items-center justify-center">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-white/[0.05] border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl relative">
                        <div className={cn("w-14 h-14 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg", themeConfig.accent)}>
                          {renderShowcaseIcon(showcaseIcon, "w-8 h-8 sm:w-10 sm:h-10")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* SIMULATOR PREVIEW OVERLAYS (TWITTER / DISCORD / LINKEDIN) */}
          {/* =============================================================== */}
          {simulator !== "canvas" && (
            <div className="p-4 rounded-2xl bg-[#090b14] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span>
                  {simulator === "twitter" && "𝕏 Twitter Large Card Simulation"}
                  {simulator === "discord" && "💬 Discord Rich Embed Simulation"}
                  {simulator === "linkedin" && "💼 LinkedIn Feed Card Simulation"}
                  {simulator === "google" && "🔍 Google Search Snippet Simulation"}
                </span>
                <span className="text-zinc-500 font-normal">Real platform preview</span>
              </div>

              {/* Twitter Large Card Simulation */}
              {simulator === "twitter" && (
                <div className="rounded-2xl border border-[#2f3336] bg-black p-3 text-white max-w-[500px] mx-auto space-y-2.5">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUri} alt="Author" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold leading-tight">{authorName}</div>
                      <div className="text-[11px] text-zinc-500">@{domainName.replace(/\..+$/, "")}</div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-200">Just published our latest announcement. Check it out:</div>
                  <div className="rounded-xl overflow-hidden border border-[#2f3336] bg-[#16181c]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {pipelineUrl && <img src={pipelineUrl} alt="Preview" className="w-full aspect-[1200/630] object-cover" />}
                    <div className="p-2.5">
                      <div className="text-[11px] text-zinc-500 uppercase">{domainName}</div>
                      <div className="text-xs font-bold line-clamp-1">{headline}</div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1">{subtitle}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Discord Rich Embed Simulation */}
              {simulator === "discord" && (
                <div className="rounded-xl border border-[#202225] bg-[#313338] p-3 text-[#dbdee1] max-w-[520px] mx-auto space-y-2">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUri} alt="Author" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-xs font-bold text-white">{authorName}</span>
                    <span className="text-[10px] bg-[#5865f2] text-white px-1 rounded font-semibold">BOT</span>
                  </div>
                  <div className="border-l-4 border-cyan-400 bg-[#2b2d31] rounded p-3 space-y-2">
                    <div className="text-xs font-bold text-white hover:underline cursor-pointer">{headline}</div>
                    <div className="text-xs text-[#949ba4] line-clamp-2">{subtitle}</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {pipelineUrl && <img src={pipelineUrl} alt="Embed" className="w-full aspect-[1200/630] rounded object-cover" />}
                  </div>
                </div>
              )}

              {/* LinkedIn Post Simulation */}
              {simulator === "linkedin" && (
                <div className="rounded-xl border border-zinc-800 bg-[#1b1f23] p-3 text-white max-w-[500px] mx-auto space-y-2">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUri} alt="Author" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold">{authorName}</div>
                      <div className="text-[10px] text-zinc-400">Published an update · 1h</div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-300">Excited to share our latest release with everyone!</div>
                  <div className="rounded border border-zinc-700 overflow-hidden bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {pipelineUrl && <img src={pipelineUrl} alt="LinkedIn" className="w-full aspect-[1200/630] object-cover" />}
                    <div className="p-2">
                      <div className="text-xs font-bold line-clamp-1">{headline}</div>
                      <div className="text-[11px] text-zinc-400">{domainName} · 2 min read</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Search Result Simulation */}
              {simulator === "google" && (
                <div className="rounded-xl border border-zinc-800 bg-[#202124] p-3.5 text-white max-w-[540px] mx-auto space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-[#bdc1c6]">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">🌐</span>
                    <span>https://{domainName}</span>
                  </div>
                  <div className="text-sm font-semibold text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1">
                    {headline}
                  </div>
                  <div className="text-xs text-[#bdc1c6] line-clamp-2 leading-relaxed">
                    {subtitle}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Exismic Next Action Pipeline Integration */}
          {pipelineUrl && (
            <MediaPipelineBar
              imageUrl={pipelineUrl}
              imageName="social-og-banner.png"
              sourceToolId="og-banner"
              sourceToolName="Social Share Banner Studio (OG Maker)"
              actions={["compressor", "converter", "meme", "resizer"]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
