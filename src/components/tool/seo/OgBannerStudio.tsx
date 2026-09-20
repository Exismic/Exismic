"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  Download,
  Share2,
  Zap,
  Sliders,
  Palette,
  Eye,
  RefreshCw,
  Upload,
  Globe,
  Rocket,
  Code2,
  Flame,
  ShieldCheck,
  Cpu,
  Layers,
  Layout,
  LayoutTemplate,
  Code,
  Tag,
  Star,
  ExternalLink,
  BookOpen,
  Grid,
  CircleDot,
  Sun,
  Square,
  GitBranch,
  Maximize2,
  Clock,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Repeat,
  Heart,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Terminal,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ============================================================================
// TYPES & THEMES (Obsidian Cyber Design Standard)
// ============================================================================

export type BannerLayout = "saas-launch" | "tech-blog" | "github-repo" | "minimalist" | "split-showcase";
export type BannerTheme = "obsidian" | "cyber" | "sunset" | "emerald" | "carbon" | "twilight" | "solaris" | "light";
export type BannerPattern = "grid" | "dots" | "glow" | "clean";
export type PreviewSimulator = "canvas" | "twitter" | "discord" | "linkedin" | "google";
export type ShowcaseIcon = "rocket" | "zap" | "code" | "flame" | "shield" | "globe" | "cpu";
export type VerifiedBadgeType = "none" | "twitter_blue" | "twitter_gold" | "linkedin_verified" | "meta_blue";

interface AvatarPreset {
  id: string;
  name: string;
  svgDataUri: string;
}

// Crisp, high-end vector SVG avatars (Zero CORS issues on html-to-image export)
const PRESET_AVATARS: AvatarPreset[] = [
  {
    id: "exismic-prism",
    name: "Exismic Hex Core",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="p1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="50%" stop-color="%236366f1"/><stop offset="100%" stop-color="%23a855f7"/></linearGradient><linearGradient id="p2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%2338bdf8"/><stop offset="100%" stop-color="%234f46e5"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%23090b14"/><rect x="3" y="3" width="94" height="94" rx="25" fill="none" stroke="url(%23p1)" stroke-width="2.5"/><polygon points="50,20 80,37 80,71 50,88 20,71 20,37" fill="url(%23p1)" opacity="0.85"/><polygon points="50,28 72,41 72,66 50,79 28,66 28,41" fill="%23090b14"/><polygon points="50,38 64,46 64,60 50,68 36,60 36,46" fill="url(%23p2)"/></svg>`,
  },
  {
    id: "founder-monogram",
    name: "Founder Monogram",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%230f1019"/><circle cx="50" cy="50" r="44" fill="none" stroke="url(%23fg)" stroke-width="3"/><text x="50" y="61" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="-1">EX</text></svg>`,
  },
  {
    id: "neural-cyber",
    name: "Cyber Neural",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%2306b6d4"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%23040e0b"/><circle cx="50" cy="50" r="44" fill="none" stroke="url(%23cg)" stroke-width="2.5"/><circle cx="50" cy="50" r="18" fill="url(%23cg)"/><circle cx="50" cy="24" r="7" fill="%2334d399"/><circle cx="76" cy="50" r="7" fill="%2338bdf8"/><circle cx="50" cy="76" r="7" fill="%2334d399"/><circle cx="24" cy="50" r="7" fill="%2338bdf8"/><line x1="50" y1="31" x2="50" y2="43" stroke="%2334d399" stroke-width="2"/><line x1="57" y1="50" x2="69" y2="50" stroke="%2338bdf8" stroke-width="2"/><line x1="50" y1="57" x2="50" y2="69" stroke="%2334d399" stroke-width="2"/><line x1="31" y1="50" x2="43" y2="50" stroke="%2338bdf8" stroke-width="2"/></svg>`,
  },
  {
    id: "solar-aurora",
    name: "Solar Gold",
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23f43f5e"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="%23140a05"/><circle cx="50" cy="50" r="44" fill="none" stroke="url(%23sg)" stroke-width="2.5"/><polygon points="50,22 59,41 80,41 63,54 70,74 50,61 30,74 37,54 20,41 41,41" fill="url(%23sg)"/></svg>`,
  },
];

interface QuickPreset {
  id: string;
  name: string;
  layout: BannerLayout;
  theme: BannerTheme;
  headline: string;
  subtitle: string;
  tag: string;
  author: string;
  domain: string;
  icon: ShowcaseIcon;
  meta: string;
  badge: VerifiedBadgeType;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: "saas",
    name: "Product Launch",
    layout: "saas-launch",
    theme: "obsidian",
    headline: "Turn Raw Media into Viral Content in Seconds",
    subtitle: "The all-in-one AI creative suite for modern creators, editors, and video teams.",
    tag: "PRODUCT RELEASE",
    author: "Exismic Studio",
    domain: "exismic.xyz",
    icon: "rocket",
    meta: "Free · No Credit Card Required",
    badge: "twitter_blue",
  },
  {
    id: "tech-blog",
    name: "Tech Guide",
    layout: "tech-blog",
    theme: "cyber",
    headline: "Scaling Client-Side Image Latency to 12ms",
    subtitle: "A deep dive into WebAssembly SIMD, GPU blur limits, and zero-server pipelines.",
    tag: "ENGINEERING ARCHITECTURE",
    author: "Alex Rivera",
    domain: "exismic.xyz/blog",
    icon: "cpu",
    meta: "5 min read · Sep 2026",
    badge: "linkedin_verified",
  },
  {
    id: "github",
    name: "Open Source Repo",
    layout: "github-repo",
    theme: "carbon",
    headline: "exismic / media-pipeline-core",
    subtitle: "Blazing fast client-side image processing, compression, and background removal with $0 server cost.",
    tag: "OPEN SOURCE",
    author: "Exismic Org",
    domain: "github.com/exismic",
    icon: "code",
    meta: "4.8k stars · TypeScript",
    badge: "twitter_gold",
  },
  {
    id: "playbook",
    name: "Creator Playbook",
    layout: "minimalist",
    theme: "sunset",
    headline: "10 Non-Obvious Lessons from 100,000 Creators",
    subtitle: "Actionable frameworks for high-retention video hooks and organic viral distribution.",
    tag: "MASTERCLASS",
    author: "Elena Rostova",
    domain: "exismic.xyz",
    icon: "zap",
    meta: "Free Guide & Templates",
    badge: "meta_blue",
  },
];

// ============================================================================
// AUTHENTIC OFFICIAL PLATFORM VERIFICATION BADGES
// ============================================================================

export function OfficialVerifiedBadge({ type }: { type: VerifiedBadgeType }) {
  if (!type || type === "none") return null;

  // Twitter / X: Official 8-Point Scalloped Rosette (Pixel-Matched to x.com)
  if (type === "twitter_blue") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 shrink-0 inline-flex self-center"
        aria-label="Verified Account"
      >
        <path
          d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
          fill="#1d9bf0"
        />
        <path
          d="M10.54 16.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // Twitter / X: Official Gold Organization Checkmark (Official Faceted Gold Rosette from x.com)
  if (type === "twitter_gold") {
    return (
      <svg
        viewBox="0 0 22 22"
        className="w-4 h-4 shrink-0 inline-flex self-center"
        aria-label="Verified Organization"
      >
        <defs>
          <linearGradient
            id="og_x_gold_outer_grad"
            x1="4"
            y1="1.5"
            x2="19.5"
            y2="22"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F4E72A" />
            <stop offset="0.539" stopColor="#CD8105" />
            <stop offset="0.68" stopColor="#CB7B00" />
            <stop offset="1" stopColor="#F4EC26" />
          </linearGradient>
          <linearGradient
            id="og_x_gold_inner_grad"
            x1="5"
            y1="2.5"
            x2="17.5"
            y2="19.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F9E87F" />
            <stop offset="0.406" stopColor="#E2B719" />
            <stop offset="0.989" stopColor="#E2B719" />
          </linearGradient>
        </defs>
        <g>
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M13.596 3.011L11 .5 8.404 3.011l-3.576-.506-.624 3.558-3.19 1.692L2.6 11l-1.586 3.245 3.19 1.692.624 3.558 3.576-.506L11 21.5l2.596-2.511 3.576.506.624-3.558 3.19-1.692L19.4 11l1.586-3.245-3.19-1.692-.624-3.558-3.576.506zM6 11.39l3.74 3.74 6.2-6.77L14.47 7l-4.8 5.23-2.26-2.26L6 11.39z"
            fill="url(#og_x_gold_outer_grad)"
          />
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M13.348 3.772L11 1.5 8.651 3.772l-3.235-.458-.565 3.219-2.886 1.531L3.4 11l-1.435 2.936 2.886 1.531.565 3.219 3.235-.458L11 20.5l2.348-2.272 3.236.458.564-3.219 2.887-1.531L18.6 11l1.435-2.936-2.887-1.531-.564-3.219-3.236.458z"
            fill="url(#og_x_gold_inner_grad)"
          />
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M6 11.39l3.74 3.74 6.197-6.767h.003V9.76l-6.2 6.77L6 12.79v-1.4zm0 0z"
            fill="#D18800"
          />
        </g>
      </svg>
    );
  }

  // LinkedIn: Official Identity Shield
  if (type === "linkedin_verified") {
    return (
      <svg
        viewBox="0 0 16 16"
        className="w-3.5 h-3.5 shrink-0 inline-flex self-center"
        aria-label="LinkedIn Verified Identity"
      >
        <path
          d="M8 0.5C3.86 0.5 0.5 3.86 0.5 8C0.5 12.14 3.86 15.5 8 15.5C12.14 15.5 15.5 12.14 15.5 8C15.5 3.86 12.14 0.5 8 0.5ZM12.13 6.27L7.33 11.07C7.19 11.21 7 11.29 6.8 11.29C6.6 11.29 6.41 11.21 6.27 11.07L3.87 8.67C3.58 8.38 3.58 7.9 3.87 7.61C4.16 7.32 4.64 7.32 4.93 7.61L6.8 9.48L11.07 5.21C11.36 4.92 11.84 4.92 12.13 5.21C12.42 5.5 12.42 5.98 12.13 6.27Z"
          fill="#0a66c2"
        />
      </svg>
    );
  }

  // Meta (Threads & Instagram): Official Meta Verified Rosette
  if (type === "meta_blue") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 shrink-0 inline-flex self-center"
        aria-label="Meta Verified"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.7-5.7 1.4 1.4-7.1 7.1z"
          fill="#0095f6"
        />
      </svg>
    );
  }

  return null;
}

// Map showcase icons
function renderShowcaseIcon(icon: ShowcaseIcon, className: string = "w-8 h-8") {
  switch (icon) {
    case "zap":
      return <Zap className={className} />;
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
      return <Rocket className={className} />;
  }
}

// ============================================================================
// MAIN STUDIO COMPONENT
// ============================================================================

export default function OgBannerStudio() {
  // Banner State
  const [layout, setLayout] = useState<BannerLayout>("saas-launch");
  const [theme, setTheme] = useState<BannerTheme>("obsidian");
  const [pattern, setPattern] = useState<BannerPattern>("grid");
  const [showcaseIcon, setShowcaseIcon] = useState<ShowcaseIcon>("rocket");
  const [badgeType, setBadgeType] = useState<VerifiedBadgeType>("twitter_blue");

  const [headline, setHeadline] = useState("Turn Raw Media into Viral Content in Seconds");
  const [subtitle, setSubtitle] = useState(
    "The all-in-one AI creative suite for modern creators, editors, and video teams."
  );
  const [categoryTag, setCategoryTag] = useState("PRODUCT RELEASE");
  const [authorName, setAuthorName] = useState("Exismic Studio");
  const [domainName, setDomainName] = useState("exismic.xyz");
  const [metaInfo, setMetaInfo] = useState("Free · No Credit Card Required");
  const [avatarUri, setAvatarUri] = useState<string>(PRESET_AVATARS[0].svgDataUri);
  const [ctaText, setCtaText] = useState("Get Started");
  const [ctaStyle, setCtaStyle] = useState<"white" | "theme">("white");

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
    setBadgeType(preset.badge);
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
    }, 600);
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
    badgeType,
    ctaText,
    ctaStyle,
    updatePipelineImage,
  ]);

  // Theme styling definitions with pure, velvety ambient glow and cohesive gradients
  const themeConfig = {
    obsidian: {
      name: "Obsidian Cosmic",
      swatch: "from-purple-500 to-indigo-500",
      bgClass: "bg-[#060813]",
      bgColor: "#060813",
      orb1: "radial-gradient(circle, rgba(147, 51, 234, 0.45) 0%, transparent 70%)",
      orb2: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)",
      border: "border-purple-500/30",
      accent: "from-purple-600 via-purple-500 to-indigo-600",
      pill: "bg-purple-500/15 border-purple-500/30 text-purple-200",
      accentText: "from-purple-300 via-indigo-200 to-white",
      dot: "bg-purple-400",
      buttonBg: "from-purple-600 to-indigo-600 text-white",
    },
    cyber: {
      name: "Cyber Neon",
      swatch: "from-cyan-400 to-blue-500",
      bgClass: "bg-[#040915]",
      bgColor: "#040915",
      orb1: "radial-gradient(circle, rgba(6, 182, 212, 0.5) 0%, transparent 70%)",
      orb2: "radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, transparent 70%)",
      border: "border-cyan-500/30",
      accent: "from-cyan-500 to-blue-600",
      pill: "bg-cyan-500/15 border-cyan-500/30 text-cyan-200",
      accentText: "from-cyan-300 via-teal-200 to-white",
      dot: "bg-cyan-400",
      buttonBg: "from-cyan-500 to-blue-600 text-white",
    },
    sunset: {
      name: "Sunset Blaze",
      swatch: "from-rose-500 to-amber-400",
      bgClass: "bg-[#11060c]",
      bgColor: "#11060c",
      orb1: "radial-gradient(circle, rgba(244, 63, 94, 0.45) 0%, transparent 70%)",
      orb2: "radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%)",
      border: "border-rose-500/30",
      accent: "from-rose-500 via-rose-600 to-amber-500",
      pill: "bg-rose-500/15 border-rose-500/30 text-rose-200",
      accentText: "from-rose-300 via-amber-200 to-white",
      dot: "bg-amber-400",
      buttonBg: "from-rose-500 to-amber-500 text-white",
    },
    emerald: {
      name: "Emerald Aurora",
      swatch: "from-emerald-400 to-teal-500",
      bgClass: "bg-[#040e0b]",
      bgColor: "#040e0b",
      orb1: "radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, transparent 70%)",
      orb2: "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)",
      border: "border-emerald-500/30",
      accent: "from-emerald-500 to-teal-600",
      pill: "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
      accentText: "from-emerald-300 via-teal-200 to-white",
      dot: "bg-emerald-400",
      buttonBg: "from-emerald-500 to-teal-600 text-white",
    },
    carbon: {
      name: "Midnight Carbon",
      swatch: "from-zinc-400 to-zinc-700",
      bgClass: "bg-[#090b0e]",
      bgColor: "#090b0e",
      orb1: "radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)",
      orb2: "radial-gradient(circle, rgba(113, 113, 122, 0.25) 0%, transparent 70%)",
      border: "border-white/15",
      accent: "from-zinc-200 to-zinc-400",
      pill: "bg-white/10 border-white/20 text-zinc-200",
      accentText: "from-zinc-100 via-zinc-300 to-white",
      dot: "bg-zinc-300",
      buttonBg: "from-zinc-100 to-zinc-300 text-black",
    },
    twilight: {
      name: "Tokyo Twilight",
      swatch: "from-fuchsia-400 to-indigo-500",
      bgClass: "bg-[#0b0614]",
      bgColor: "#0b0614",
      orb1: "radial-gradient(circle, rgba(217, 70, 239, 0.45) 0%, transparent 70%)",
      orb2: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)",
      border: "border-fuchsia-500/30",
      accent: "from-fuchsia-600 to-indigo-600",
      pill: "bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-200",
      accentText: "from-fuchsia-300 via-purple-200 to-white",
      dot: "bg-fuchsia-400",
      buttonBg: "from-fuchsia-600 to-indigo-600 text-white",
    },
    solaris: {
      name: "Solar Gold",
      swatch: "from-amber-400 to-orange-500",
      bgClass: "bg-[#0e0a04]",
      bgColor: "#0e0a04",
      orb1: "radial-gradient(circle, rgba(234, 179, 8, 0.45) 0%, transparent 70%)",
      orb2: "radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, transparent 70%)",
      border: "border-amber-500/30",
      accent: "from-amber-400 to-orange-500",
      pill: "bg-amber-500/15 border-amber-500/30 text-amber-200",
      accentText: "from-amber-300 via-orange-200 to-white",
      dot: "bg-amber-400",
      buttonBg: "from-amber-400 to-orange-500 text-black",
    },
    light: {
      name: "Clean Studio",
      swatch: "from-slate-200 to-slate-400",
      bgClass: "bg-[#0f1117]",
      bgColor: "#0f1117",
      orb1: "radial-gradient(circle, rgba(226, 232, 240, 0.2) 0%, transparent 70%)",
      orb2: "radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, transparent 70%)",
      border: "border-white/20",
      accent: "from-white to-slate-200",
      pill: "bg-white/10 border-white/20 text-white",
      accentText: "from-white via-slate-200 to-zinc-300",
      dot: "bg-white",
      buttonBg: "from-white to-slate-200 text-black",
    },
  }[theme];

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 pb-24 lg:pb-0">
      {/* Top Banner: Quick Blueprints (Zero generic emojis) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-[#0b0f19]/80 border border-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-2 shrink-0">
          <LayoutTemplate className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Presets:</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wide uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
            4 Blueprints
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 no-scrollbar">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-xl border transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                layout === preset.layout && theme === preset.theme
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-zinc-300 hover:text-white"
              )}
            >
              {preset.id === "saas" && <Rocket size={13} className="text-cyan-400" />}
              {preset.id === "tech-blog" && <BookOpen size={13} className="text-blue-400" />}
              {preset.id === "github" && <GitBranch size={13} className="text-purple-400" />}
              {preset.id === "playbook" && <Zap size={13} className="text-amber-400" />}
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Segmented Navigation Tabs */}
      <div className="lg:hidden flex items-center p-1 rounded-xl bg-[#090b14] border border-white/[0.08] gap-1 shadow-lg">
        <button
          onClick={() => setActiveTab("preview")}
          className={cn(
            "flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 min-w-0 cursor-pointer",
            activeTab === "preview"
              ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-white border border-cyan-500/40 shadow-sm font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">Preview</span>
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={cn(
            "flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 min-w-0 cursor-pointer",
            activeTab === "content"
              ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-white border border-cyan-500/40 shadow-sm font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Tag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">Content</span>
        </button>
        <button
          onClick={() => setActiveTab("look")}
          className={cn(
            "flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 min-w-0 cursor-pointer",
            activeTab === "look"
              ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-white border border-cyan-500/40 shadow-sm font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Palette className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">Theme</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("simulators");
            if (simulator === "canvas") setSimulator("twitter");
          }}
          className={cn(
            "flex-1 py-2 px-1 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 min-w-0 cursor-pointer",
            activeTab === "simulators"
              ? "bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-white border border-cyan-500/40 shadow-sm font-bold"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">Simulate</span>
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
            activeTab === "preview" || activeTab === "simulators" ? "hidden lg:block" : "block"
          )}
        >
          {/* Section 1: Layout & Visual Atmosphere */}
          <div className={cn("p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4", activeTab === "content" ? "hidden lg:block" : "block")}>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-2.5 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Choose Banner Layout</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "saas-launch", label: "Product Launch", icon: Rocket, color: "text-cyan-400" },
                  { id: "tech-blog", label: "Blog Article", icon: BookOpen, color: "text-blue-400" },
                  { id: "github-repo", label: "GitHub Repo", icon: GitBranch, color: "text-purple-400" },
                  { id: "minimalist", label: "Minimal Studio", icon: Layers, color: "text-emerald-400" },
                  { id: "split-showcase", label: "Split Spotlight", icon: Maximize2, color: "text-amber-400" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = layout === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setLayout(item.id as BannerLayout)}
                      className={cn(
                        "py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all text-center cursor-pointer",
                        isSelected
                          ? "bg-cyan-500/20 text-white border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-semibold"
                          : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.07] hover:text-white"
                      )}
                    >
                      <Icon size={14} className={item.color} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-2.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>2. Color Atmosphere Theme</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "obsidian", name: "Obsidian", swatch: "from-purple-500 to-cyan-400" },
                  { id: "cyber", name: "Cyber", swatch: "from-cyan-400 to-blue-500" },
                  { id: "sunset", name: "Sunset", swatch: "from-rose-500 to-amber-400" },
                  { id: "emerald", name: "Emerald", swatch: "from-emerald-400 to-teal-500" },
                  { id: "carbon", name: "Carbon", swatch: "from-zinc-400 to-zinc-700" },
                  { id: "twilight", name: "Twilight", swatch: "from-fuchsia-400 to-indigo-500" },
                  { id: "solaris", name: "Solar Gold", swatch: "from-amber-400 to-orange-500" },
                  { id: "light", name: "Clean Light", swatch: "from-slate-200 to-slate-400" },
                ].map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as BannerTheme)}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer",
                        isSelected
                          ? "bg-purple-500/20 text-white border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.25)] font-semibold"
                          : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      <span className={cn("w-3.5 h-3.5 rounded-full shrink-0 border border-white/30 bg-gradient-to-tr shadow-sm", t.swatch)} />
                      <span className="text-xs truncate">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-2.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span>3. Texture Pattern</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "grid", label: "Tech Grid", icon: Grid },
                  { id: "dots", label: "Dot Matrix", icon: CircleDot },
                  { id: "glow", label: "Smooth Aura", icon: Sun },
                  { id: "clean", label: "Solid Glass", icon: Square },
                ].map((p) => {
                  const Icon = p.icon;
                  const isSelected = pattern === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPattern(p.id as BannerPattern)}
                      className={cn(
                        "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer",
                        isSelected
                          ? "bg-white/[0.12] text-white border-white/40 shadow-sm font-semibold"
                          : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      <Icon size={13} className="text-cyan-400" />
                      <span className="truncate">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Banner Text & Headlines */}
          <div className={cn("p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4", activeTab === "look" ? "hidden lg:block" : "block")}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Headline & Copy
            </h3>

            {/* Headline */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-zinc-400">Main Headline Title</label>
                <span className={cn("text-[11px] font-mono", headline.length > 60 ? "text-amber-400" : "text-zinc-500")}>
                  {headline.length} / 60 chars (Optimal OG)
                </span>
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
                <span className={cn("text-[11px] font-mono", subtitle.length > 120 ? "text-amber-400" : "text-zinc-500")}>
                  {subtitle.length} / 120 chars
                </span>
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

            {/* Action Button Label & Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/[0.06]">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Action Button Text</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. Get Started"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Button Finish Style</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCtaStyle("white")}
                    className={cn(
                      "py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center",
                      ctaStyle === "white"
                        ? "bg-white text-black border-white shadow-sm"
                        : "bg-white/[0.04] text-zinc-400 border-white/[0.06] hover:text-white"
                    )}
                  >
                    Crisp White
                  </button>
                  <button
                    type="button"
                    onClick={() => setCtaStyle("theme")}
                    className={cn(
                      "py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center",
                      ctaStyle === "theme"
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm"
                        : "bg-white/[0.04] text-zinc-400 border-white/[0.06] hover:text-white"
                    )}
                  >
                    Theme Glow
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Branding, Author, Badges & Icon */}
          <div className={cn("p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4", activeTab === "look" ? "hidden lg:block" : "block")}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Branding & Author
            </h3>

            {/* Domain & Author Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Website Domain</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="e.g. exismic.xyz"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono"
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

            {/* Verified Badge Selector (Exact Official Badges) */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5 flex items-center justify-between">
                <span>Platform Verification Badge:</span>
                <span className="text-[10px] text-zinc-500 font-mono">Pixel-accurate vector</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "none", label: "No Badge" },
                  { id: "twitter_blue", label: "X Blue Tick" },
                  { id: "twitter_gold", label: "X Gold Org" },
                  { id: "linkedin_verified", label: "LinkedIn Shield" },
                  { id: "meta_blue", label: "Meta Verified" },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBadgeType(b.id as VerifiedBadgeType)}
                    className={cn(
                      "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer",
                      badgeType === b.id
                        ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold"
                        : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <OfficialVerifiedBadge type={b.id as VerifiedBadgeType} />
                    <span className="truncate">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Author Avatar Selector */}
            <div>
              <label className="text-xs text-zinc-400 block mb-2">Author Avatar / Brand Emblem</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setAvatarUri(p.svgDataUri)}
                    className={cn(
                      "w-9 h-9 rounded-full overflow-hidden border-2 transition-all active:scale-95 cursor-pointer",
                      avatarUri === p.svgDataUri
                        ? "border-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                    title={p.name}
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
                  className="h-9 px-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                </button>
              </div>
            </div>

            {/* Showcase Center Icon */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">Feature Showcase Emblem</label>
              <div className="flex items-center gap-2 flex-wrap">
                {(["rocket", "zap", "code", "flame", "shield", "globe", "cpu"] as ShowcaseIcon[]).map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setShowcaseIcon(ic)}
                    className={cn(
                      "p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer",
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse ring-4 ring-cyan-400/20" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">1200 × 630 Canvas</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <button
                onClick={handleCopyMetaTags}
                className={cn(
                  "px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer flex-1 sm:flex-initial justify-center",
                  metaCopied
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/[0.08]"
                )}
              >
                {metaCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{metaCopied ? "Tags Copied!" : "Meta Tags"}</span>
              </button>

              <button
                onClick={handleCopyPicture}
                disabled={isCopying}
                className={cn(
                  "px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer flex-1 sm:flex-initial justify-center",
                  copySuccess
                    ? "bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.14] shadow-sm"
                )}
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-300" />
                    <span>{isCopying ? "Copying..." : "Copy Picture"}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadPng}
                disabled={isDownloading}
                className="relative group overflow-hidden px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border border-white/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer w-full sm:w-auto shrink-0"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{isDownloading ? "Rendering..." : "Download 1200×630 PNG"}</span>
              </button>
            </div>
          </div>

          {/* Social Simulator Mode Tabs with Official Vector SVG Icons (Full-Width Edge-to-Edge) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090b14] border border-white/[0.08] overflow-x-auto no-scrollbar w-full shadow-inner">
            <button
              onClick={() => setSimulator("canvas")}
              className={cn(
                "flex-1 min-w-[130px] sm:min-w-0 py-2 px-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer text-center",
                simulator === "canvas"
                  ? "bg-white/[0.12] text-white font-semibold border border-white/20 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <Maximize2 size={13} className="text-cyan-400 shrink-0" />
              <span>Full Canvas View</span>
            </button>
            <button
              onClick={() => setSimulator("twitter")}
              className={cn(
                "flex-1 min-w-[130px] sm:min-w-0 py-2 px-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer text-center",
                simulator === "twitter"
                  ? "bg-white/[0.12] text-white font-semibold border border-white/20 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <svg className="w-3.5 h-3.5 fill-current text-zinc-200 shrink-0" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>X Twitter Card</span>
            </button>
            <button
              onClick={() => setSimulator("discord")}
              className={cn(
                "flex-1 min-w-[130px] sm:min-w-0 py-2 px-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer text-center",
                simulator === "discord"
                  ? "bg-white/[0.12] text-white font-semibold border border-white/20 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <svg className="w-3.5 h-3.5 fill-current text-[#5865f2] shrink-0" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Discord Embed</span>
            </button>
            <button
              onClick={() => setSimulator("linkedin")}
              className={cn(
                "flex-1 min-w-[130px] sm:min-w-0 py-2 px-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer text-center",
                simulator === "linkedin"
                  ? "bg-white/[0.12] text-white font-semibold border border-white/20 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <svg className="w-3.5 h-3.5 fill-current text-[#0a66c2] shrink-0" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              <span>LinkedIn Post</span>
            </button>
            <button
              onClick={() => setSimulator("google")}
              className={cn(
                "flex-1 min-w-[130px] sm:min-w-0 py-2 px-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer text-center",
                simulator === "google"
                  ? "bg-white/[0.12] text-white font-semibold border border-white/20 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <Globe size={13} className="text-blue-400 shrink-0" />
              <span>Google Result</span>
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
                  backgroundColor: themeConfig.bgColor,
                }}
                className={cn(
                  "w-full aspect-[1200/630] rounded-2xl p-5 sm:p-7 md:p-8 flex flex-col justify-between relative overflow-hidden font-sans border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] transition-all select-none",
                  themeConfig.bgClass,
                  themeConfig.border
                )}
              >
                {/* Ambient Glowing Orb 1 (Top-Right) */}
                <div
                  className="absolute -top-20 -right-20 w-80 sm:w-[420px] h-80 sm:h-[420px] rounded-full blur-[90px] sm:blur-[110px] pointer-events-none opacity-85"
                  style={{ background: themeConfig.orb1 }}
                />

                {/* Ambient Glowing Orb 2 (Bottom-Left) */}
                <div
                  className="absolute -bottom-20 -left-20 w-80 sm:w-[420px] h-80 sm:h-[420px] rounded-full blur-[90px] sm:blur-[110px] pointer-events-none opacity-85"
                  style={{ background: themeConfig.orb2 }}
                />

                {/* Isolated Texture Pattern with Smooth Radial Mask (Zero tiling artifacts) */}
                {pattern === "grid" && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgba(255, 255, 255, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 1px, transparent 1px)",
                      backgroundSize: "36px 36px",
                      maskImage: "radial-gradient(circle at center, black 40%, transparent 85%)",
                      WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 85%)",
                    }}
                  />
                )}
                {pattern === "dots" && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-25"
                    style={{
                      backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                      maskImage: "radial-gradient(circle at center, black 40%, transparent 85%)",
                      WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 85%)",
                    }}
                  />
                )}
                {pattern === "glow" && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                      background: "radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.25), transparent 70%)",
                    }}
                  />
                )}

                {/* Top Rim Specular Hairline */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                {/* ========================================================= */}
                {/* CASE 1: MODERN SAAS PRODUCT LAUNCH */}
                {/* ========================================================= */}
                {layout === "saas-launch" && (
                  <>
                    <div className="relative z-10 space-y-2 sm:space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className={cn("px-3 py-1 rounded-full text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-widest border shadow-inner flex items-center gap-1.5 backdrop-blur-md", themeConfig.pill)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse ring-4 ring-cyan-400/20", themeConfig.dot)} />
                          <span>{categoryTag}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[10px] sm:text-xs font-mono font-semibold text-zinc-300 backdrop-blur-md">
                          {renderShowcaseIcon(showcaseIcon, "w-3.5 h-3.5 text-cyan-400")}
                          <span className="truncate max-w-[120px] sm:max-w-none">{domainName}</span>
                        </div>
                      </div>

                      <h1 className="text-base sm:text-2xl md:text-[28px] font-extrabold tracking-tight leading-[1.15] text-white drop-shadow-md line-clamp-2">
                        {headline}
                      </h1>

                      <p className="text-[10px] sm:text-xs md:text-[13px] line-clamp-2 text-zinc-300 leading-relaxed font-normal max-w-[95%]">
                        {subtitle}
                      </p>
                    </div>

                    {/* Bottom Row */}
                    <div className="relative z-10 flex items-center justify-between pt-2.5 sm:pt-3.5 border-t border-white/10">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatarUri} alt={authorName} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-white/20 shadow-md" />
                        <div>
                          <div className="text-[10px] sm:text-xs font-bold text-white leading-tight flex items-center gap-1 truncate max-w-[140px] sm:max-w-none">
                            <span>{authorName}</span>
                            <OfficialVerifiedBadge type={badgeType} />
                          </div>
                          <div className="text-[8px] sm:text-[10px] text-zinc-400 leading-tight truncate max-w-[140px] sm:max-w-none font-mono mt-0.5">{metaInfo}</div>
                        </div>
                      </div>

                      {ctaStyle === "white" ? (
                        <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-extrabold text-black bg-white shadow-[0_0_20px_rgba(255,255,255,0.35)] border border-white/90 shrink-0 flex items-center gap-1.5 transition-transform overflow-hidden select-none">
                          <span>{ctaText || "Get Started"}</span>
                          <ChevronRight size={13} className="text-black" />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold shadow-[0_0_20px_rgba(0,0,0,0.4)] border border-white/20 bg-gradient-to-r bg-no-repeat bg-clip-padding shrink-0 flex items-center gap-1.5 transition-transform overflow-hidden",
                            themeConfig.buttonBg || themeConfig.accent
                          )}
                        >
                          <span>{ctaText || "Get Started"}</span>
                          <ChevronRight size={13} />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ========================================================= */}
                {/* CASE 2: TECH BLOG ARTICLE */}
                {/* ========================================================= */}
                {layout === "tech-blog" && (
                  <>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className={cn("px-3 py-1 rounded-full text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-widest border shadow-inner flex items-center gap-1.5 backdrop-blur-md", themeConfig.pill)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", themeConfig.dot)} />
                        <span>{categoryTag}</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-zinc-300 font-mono font-medium px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 flex items-center gap-1.5">
                        <Clock size={12} className="text-cyan-400" />
                        <span>{metaInfo}</span>
                      </div>
                    </div>

                    <div className="relative z-10 my-auto space-y-1.5 sm:space-y-2.5">
                      <h1 className="text-lg sm:text-3xl md:text-[32px] font-extrabold tracking-tight leading-[1.18] text-white drop-shadow-md line-clamp-2">
                        {headline}
                      </h1>
                      <p className="text-[10px] sm:text-xs md:text-[13px] line-clamp-2 text-zinc-300 leading-relaxed font-normal max-w-[95%]">
                        {subtitle}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between pt-2.5 sm:pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatarUri} alt={authorName} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-white/20 shadow-md" />
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] sm:text-xs font-bold text-white truncate max-w-[140px] sm:max-w-none">{authorName}</span>
                          <OfficialVerifiedBadge type={badgeType} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-semibold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/25">
                        <span>{domainName}</span>
                        <ArrowUpRight size={12} />
                      </div>
                    </div>
                  </>
                )}

                {/* ========================================================= */}
                {/* CASE 3: GITHUB REPO CARD */}
                {/* ========================================================= */}
                {layout === "github-repo" && (
                  <>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/50 border border-white/15">
                        {/* Official GitHub Octocat SVG */}
                        <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-200 truncate max-w-[140px] sm:max-w-none">
                          {authorName} /
                        </span>
                        <OfficialVerifiedBadge type={badgeType} />
                      </div>
                      <div className={cn("px-2.5 py-1 rounded-full text-[9px] sm:text-[11px] font-mono border flex items-center gap-1.5 shadow-sm font-bold", themeConfig.pill)}>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>4.8k stars</span>
                      </div>
                    </div>

                    <div className="relative z-10 my-auto space-y-1.5 sm:space-y-2">
                      <h1 className="text-base sm:text-2xl md:text-[26px] font-bold font-mono tracking-tight text-white line-clamp-1">
                        {headline}
                      </h1>
                      <p className="text-[10px] sm:text-xs md:text-[13px] line-clamp-2 text-zinc-300 leading-relaxed font-mono max-w-[95%]">
                        {subtitle}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between pt-2.5 sm:pt-3 border-t border-white/10 text-[9px] sm:text-xs font-mono">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.08] text-zinc-200 border border-white/10">
                          <span className="w-2 h-2 rounded-full bg-[#3178c6]" />
                          TypeScript
                        </span>
                        <span className="text-zinc-400 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">MIT License</span>
                      </div>
                      <div className="text-zinc-400 font-medium truncate max-w-[130px] sm:max-w-none">{domainName}</div>
                    </div>
                  </>
                )}

                {/* ========================================================= */}
                {/* CASE 4: MINIMALIST STUDIO */}
                {/* ========================================================= */}
                {layout === "minimalist" && (
                  <div className="relative z-10 h-full flex flex-col justify-between items-center text-center py-1 sm:py-2">
                    {/* Architectural Corner Crosshair Accents */}
                    <div className="absolute top-0 left-0 font-mono text-white/30 text-xs select-none">+</div>
                    <div className="absolute top-0 right-0 font-mono text-white/30 text-xs select-none">+</div>
                    <div className="absolute bottom-0 left-0 font-mono text-white/30 text-xs select-none">+</div>
                    <div className="absolute bottom-0 right-0 font-mono text-white/30 text-xs select-none">+</div>

                    <div className={cn("px-3.5 py-1 rounded-full text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-widest border shadow-inner flex items-center gap-1.5 backdrop-blur-md", themeConfig.pill)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", themeConfig.dot)} />
                      <span>{categoryTag}</span>
                    </div>

                    <div className="my-auto space-y-2 max-w-[92%]">
                      <h1 className="text-lg sm:text-3xl md:text-[32px] font-extrabold tracking-tight leading-[1.18] text-white drop-shadow-md line-clamp-2">
                        {headline}
                      </h1>
                      <p className="text-[10px] sm:text-xs md:text-[13px] line-clamp-2 text-zinc-300 leading-relaxed font-normal">
                        {subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-zinc-300 px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                      <span className="text-white font-bold">{authorName}</span>
                      <OfficialVerifiedBadge type={badgeType} />
                      <span>·</span>
                      <span className="text-cyan-400 font-mono truncate max-w-[140px] sm:max-w-none">{domainName}</span>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* CASE 5: SPLIT SPOTLIGHT */}
                {/* ========================================================= */}
                {layout === "split-showcase" && (
                  <div className="relative z-10 h-full grid grid-cols-12 gap-3 sm:gap-4 items-center">
                    <div className="col-span-8 flex flex-col justify-between h-full py-0.5 sm:py-1">
                      <div className={cn("w-fit px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest border shadow-inner flex items-center gap-1.5 backdrop-blur-md", themeConfig.pill)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", themeConfig.dot)} />
                        <span>{categoryTag}</span>
                      </div>

                      <div className="my-auto space-y-1.5 sm:space-y-2">
                        <h1 className="text-base sm:text-2xl md:text-[26px] font-extrabold tracking-tight leading-[1.18] text-white drop-shadow-md line-clamp-2">
                          {headline}
                        </h1>
                        <p className="text-[10px] sm:text-xs md:text-[13px] line-clamp-2 text-zinc-300 leading-relaxed font-normal">
                          {subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-400">
                        <span className="text-white font-bold truncate max-w-[100px] sm:max-w-none">{authorName}</span>
                        <OfficialVerifiedBadge type={badgeType} />
                        <span>·</span>
                        <span className="text-cyan-400 font-mono font-semibold truncate max-w-[120px] sm:max-w-none">{domainName}</span>
                      </div>
                    </div>

                    {/* Right side floating glass reactor medallion */}
                    <div className="col-span-4 flex items-center justify-center">
                      <div className="w-18 h-18 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/[0.08] border border-white/25 backdrop-blur-2xl flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] relative group">
                        <div className={cn("w-12 h-12 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-br bg-no-repeat bg-clip-padding text-white shadow-xl border border-white/30 overflow-hidden", themeConfig.accent)}>
                          {renderShowcaseIcon(showcaseIcon, "w-6 h-6 sm:w-9 sm:h-9")}
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
            <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14] border border-white/[0.08] space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                <span className="flex items-center gap-2">
                  <Eye size={13} className="text-cyan-400" />
                  <span>
                    {simulator === "twitter" && "X (Twitter) Large Summary Card"}
                    {simulator === "discord" && "Discord Rich Embed Card"}
                    {simulator === "linkedin" && "LinkedIn Social Card"}
                    {simulator === "google" && "Google Search SERP Result"}
                  </span>
                </span>
                <span className="text-zinc-500 font-mono text-[11px]">Platform-Accurate Mockup</span>
              </div>

              {/* Twitter Large Card Simulation */}
              {simulator === "twitter" && (
                <div className="rounded-2xl border border-[#2f3336] bg-black p-3.5 text-white max-w-[500px] mx-auto space-y-2.5 font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={avatarUri} alt="Author" className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold leading-tight flex items-center gap-1">
                          <span>{authorName}</span>
                          <OfficialVerifiedBadge type={badgeType} />
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono">@{domainName.replace(/\..+$/, "")} · 2h</div>
                      </div>
                    </div>
                    <MoreHorizontal size={15} className="text-zinc-500" />
                  </div>

                  <div className="text-xs text-zinc-200">
                    Just announced our newest release on <span className="text-[#1d9bf0]">#{categoryTag.toLowerCase().replace(/\s+/g, "")}</span>. Check it out below:
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-[#2f3336] bg-[#16181c]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {pipelineUrl ? (
                      <img src={pipelineUrl} alt="Preview" className="w-full aspect-[1200/630] object-cover" />
                    ) : (
                      <div className="w-full aspect-[1200/630] bg-zinc-900 flex items-center justify-center text-xs text-zinc-500 animate-pulse">
                        Rendering live X card...
                      </div>
                    )}
                    <div className="p-3">
                      <div className="text-[11px] text-zinc-500 font-mono">{domainName}</div>
                      <div className="text-xs font-bold line-clamp-1 text-white">{headline}</div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1">{subtitle}</div>
                    </div>
                  </div>

                  {/* X Action Bar with realistic engagement counts */}
                  <div className="flex items-center justify-between pt-1 text-zinc-500 text-xs px-2">
                    <span className="flex items-center gap-1.5 hover:text-[#1d9bf0] cursor-pointer">
                      <MessageSquare size={13} /> 24
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-[#00ba7c] cursor-pointer">
                      <Repeat size={13} /> 182
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-[#f91880] cursor-pointer">
                      <Heart size={13} /> 1.4K
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-[#1d9bf0] cursor-pointer">
                      <Bookmark size={13} /> 320
                    </span>
                    <Share2 size={13} className="hover:text-[#1d9bf0] cursor-pointer" />
                  </div>
                </div>
              )}

              {/* Discord Rich Embed Simulation */}
              {simulator === "discord" && (
                <div className="rounded-xl border border-[#202225] bg-[#313338] p-3.5 text-[#dbdee1] max-w-[520px] mx-auto space-y-2 font-sans">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUri} alt="Author" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-xs font-bold text-white">{authorName}</span>
                    <span className="text-[10px] bg-[#5865f2] text-white px-1 py-0.5 rounded font-bold font-mono">APP</span>
                    <span className="text-[10px] text-[#949ba4]">Today at 12:30 PM</span>
                  </div>
                  <div className="border-l-4 border-cyan-400 bg-[#2b2d31] rounded-r p-3 space-y-2">
                    <div className="text-[11px] text-[#949ba4] font-mono">{domainName}</div>
                    <div className="text-xs font-bold text-[#00a8fc] hover:underline cursor-pointer">{headline}</div>
                    <div className="text-xs text-[#949ba4] line-clamp-2 leading-relaxed">{subtitle}</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {pipelineUrl ? (
                      <img src={pipelineUrl} alt="Embed" className="w-full aspect-[1200/630] rounded object-cover" />
                    ) : (
                      <div className="w-full aspect-[1200/630] bg-[#1e1f22] rounded flex items-center justify-center text-xs text-zinc-500 animate-pulse">
                        Rendering live Discord embed...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LinkedIn Post Simulation */}
              {simulator === "linkedin" && (
                <div className="rounded-xl border border-zinc-800 bg-[#1b1f23] p-3.5 text-white max-w-[500px] mx-auto space-y-2.5 font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={avatarUri} alt="Author" className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1">
                          <span>{authorName}</span>
                          <OfficialVerifiedBadge type={badgeType} />
                        </div>
                        <div className="text-[10px] text-zinc-400">42,890 followers · 2h • Edited</div>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-[#70b5f9] hover:text-[#9bcbfb]">
                      + Follow
                    </button>
                  </div>

                  <div className="text-xs text-zinc-200">
                    Thrilled to share our latest architecture update. Building with speed, scale, and 100% client-side execution:
                  </div>

                  <div className="rounded border border-zinc-700 overflow-hidden bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {pipelineUrl ? (
                      <img src={pipelineUrl} alt="LinkedIn" className="w-full aspect-[1200/630] object-cover" />
                    ) : (
                      <div className="w-full aspect-[1200/630] bg-zinc-950 flex items-center justify-center text-xs text-zinc-500 animate-pulse">
                        Rendering live LinkedIn card...
                      </div>
                    )}
                    <div className="p-2.5">
                      <div className="text-xs font-bold line-clamp-1">{headline}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{domainName} · 3 min read</div>
                    </div>
                  </div>

                  {/* LinkedIn Action Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-zinc-400 text-xs px-2">
                    <span className="flex items-center gap-1.5 hover:text-white cursor-pointer py-1">
                      <ThumbsUp size={13} /> Like
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-white cursor-pointer py-1">
                      <MessageSquare size={13} /> Comment
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-white cursor-pointer py-1">
                      <Repeat size={13} /> Repost
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-white cursor-pointer py-1">
                      <Share2 size={13} /> Send
                    </span>
                  </div>
                </div>
              )}

              {/* Google Search Result Simulation */}
              {simulator === "google" && (
                <div className="rounded-xl border border-zinc-800 bg-[#202124] p-4 text-white max-w-[540px] mx-auto space-y-1.5 font-sans">
                  <div className="flex items-center gap-2 text-xs text-[#bdc1c6]">
                    <Globe size={13} className="text-zinc-400" />
                    <span className="font-mono text-[11px]">https://{domainName} › tools › og-banner</span>
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

      {/* MOBILE BOTTOM FLOATING ACTION BAR */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 p-2 rounded-2xl bg-[#090b14]/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center gap-2">
        {activeTab === "preview" || activeTab === "simulators" ? (
          <button
            onClick={() => setActiveTab("content")}
            className="flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all truncate"
          >
            <Tag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Edit Content / Look</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab("preview")}
            className="flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all truncate"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">View Preview</span>
          </button>
        )}

        <button
          onClick={handleCopyPicture}
          disabled={isCopying}
          className={cn(
            "py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0 cursor-pointer",
            copySuccess
              ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              : "bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 border-white/10"
          )}
          title="Copy Image to clipboard"
        >
          {copySuccess ? <Check className="w-3.5 h-3.5 text-white" /> : isCopying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copySuccess ? "Copied" : "Copy"}</span>
        </button>

        <button
          onClick={handleDownloadPng}
          disabled={isDownloading}
          className="relative group overflow-hidden px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border border-white/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          {isDownloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span>{isDownloading ? "..." : "PNG"}</span>
        </button>
      </div>
    </div>
  );
}
