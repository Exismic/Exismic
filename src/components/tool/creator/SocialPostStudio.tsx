"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  Download,
  Share2,
  Layers,
  Sliders,
  Eye,
  Edit3,
  Image as ImageIcon,
  MessageSquare,
  Repeat,
  Heart,
  Bookmark,
  Trash2,
  Clock,
  Send,
  MoreHorizontal,
  AtSign,
  ThumbsUp,
  ThumbsDown,
  ArrowBigUp,
  ArrowBigDown,
  Award,
  Globe,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPipelineBar } from "@/components/tool/MediaPipelineBar";

// ============================================================================
// TYPES & PLATFORMS
// ============================================================================

export type PlatformType =
  | "twitter"
  | "linkedin"
  | "threads"
  | "instagram_post"
  | "instagram" // IG Comment
  | "youtube"
  | "tiktok"
  | "reddit"
  | "bluesky";

export type CardTheme = "obsidian" | "dark" | "dim" | "light";
export type CanvasFormat = "fitted" | "square" | "portrait";

interface AvatarPreset {
  id: string;
  name: string;
  svgDataUri: string;
}

// Crisp inline SVGs for avatars (Zero CORS issues on html-to-image export)
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

// Available platform metadata & official verification badges
interface PlatformConfig {
  id: PlatformType;
  name: string;
  shortName: string;
  category: string;
  defaultBadge: string;
  badges: { id: string; label: string; previewColor: string }[];
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: "twitter",
    name: "Twitter / X",
    shortName: "𝕏 Post",
    category: "Microblog",
    defaultBadge: "twitter_blue",
    badges: [
      { id: "none", label: "None", previewColor: "text-zinc-500" },
      { id: "twitter_blue", label: "Blue Tick", previewColor: "text-[#1d9bf0]" },
      { id: "twitter_gold", label: "Gold Org", previewColor: "text-[#e7a400]" },
      { id: "twitter_grey", label: "Grey Gov", previewColor: "text-[#829aab]" },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn Post",
    shortName: "LinkedIn",
    category: "Professional",
    defaultBadge: "linkedin_verified",
    badges: [
      { id: "none", label: "None", previewColor: "text-zinc-500" },
      { id: "linkedin_verified", label: "Identity Shield", previewColor: "text-[#0a66c2]" },
      { id: "linkedin_premium", label: "Premium 'in'", previewColor: "text-[#ca8a04]" },
      { id: "linkedin_top_voice", label: "Top Voice ⭐", previewColor: "text-[#ca8a04]" },
    ],
  },
  {
    id: "threads",
    name: "Meta Threads",
    shortName: "Threads",
    category: "Meta",
    defaultBadge: "meta_blue",
    badges: [
      { id: "none", label: "None", previewColor: "text-zinc-500" },
      { id: "meta_blue", label: "Meta Verified", previewColor: "text-[#0095f6]" },
    ],
  },
  {
    id: "instagram_post",
    name: "Instagram Feed Post",
    shortName: "IG Post",
    category: "Visual",
    defaultBadge: "meta_blue",
    badges: [
      { id: "none", label: "None", previewColor: "text-zinc-500" },
      { id: "meta_blue", label: "Meta Verified", previewColor: "text-[#0095f6]" },
    ],
  },
  {
    id: "instagram",
    name: "Instagram Comment",
    shortName: "IG Comment",
    category: "Visual",
    defaultBadge: "meta_blue",
    badges: [
      { id: "none", label: "None", previewColor: "text-zinc-500" },
      { id: "meta_blue", label: "Meta Verified", previewColor: "text-[#0095f6]" },
    ],
  },
  {
    id: "youtube",
    name: "YouTube Community",
    shortName: "YouTube",
    category: "Video",
    defaultBadge: "youtube_verified",
    badges: [
      { id: "none", label: "None", previewColor: "text-zinc-500" },
      { id: "youtube_verified", label: "Verified Channel", previewColor: "text-zinc-400" },
      { id: "youtube_artist", label: "Artist Note ♪", previewColor: "text-zinc-300" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok Comment",
    shortName: "TikTok",
    category: "Shortform",
    defaultBadge: "tiktok_verified",
    badges: [
      { id: "none", label: "None", previewColor: "text-zinc-500" },
      { id: "tiktok_verified", label: "Verified Cyan", previewColor: "text-[#20d5ec]" },
    ],
  },
  {
    id: "reddit",
    name: "Reddit Discussion",
    shortName: "Reddit",
    category: "Community",
    defaultBadge: "reddit_op",
    badges: [
      { id: "none", label: "None", previewColor: "text-zinc-500" },
      { id: "reddit_op", label: "OP Author", previewColor: "text-[#0079d3]" },
      { id: "reddit_mod", label: "Mod Shield", previewColor: "text-emerald-400" },
    ],
  },
  {
    id: "bluesky",
    name: "Bluesky Social",
    shortName: "Bluesky",
    category: "Decentralized",
    defaultBadge: "bluesky_verified",
    badges: [
      { id: "none", label: "None", previewColor: "text-zinc-500" },
      { id: "bluesky_verified", label: "Verified Blue", previewColor: "text-[#1185fe]" },
    ],
  },
];

interface QuickPreset {
  id: string;
  label: string;
  platform: PlatformType;
  name: string;
  handle: string;
  headline?: string;
  badge: string;
  text: string;
  views: string;
  reposts: string;
  likes: string;
  bookmarks: string;
  replies: string;
  subreddit?: string;
  postTitle?: string;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: "viral-take",
    label: "🔥 Viral Advice",
    platform: "twitter",
    name: "Alex Rivera",
    handle: "ariverabuilds",
    badge: "twitter_blue",
    text: "Building a company is 10% having a great idea and 90% not giving up when everything is on fire.\n\nMost people quit right before the breakthrough.",
    views: "1.2M",
    reposts: "4,820",
    likes: "38.5K",
    bookmarks: "6,190",
    replies: "842",
  },
  {
    id: "linkedin-growth",
    label: "💼 Career Insight",
    platform: "linkedin",
    name: "Elena Rostova",
    handle: "elena-rostova",
    headline: "Founder @ Exismic | Forbes 30 Under 30 | Bootstrapped to $1M ARR",
    badge: "linkedin_verified",
    text: "We just crossed $1,000,000 in ARR with a team of only 3 people and $0 raised from VC.\n\nHere are 4 rules that made it possible:\n\n1. Obsess over day-one utility, not fancy slide decks.\n2. Build in public: transparency converts faster than ads.\n3. Make your tool 10x faster than traditional software.\n4. Treat early users like co-founders.\n\nWhat is your biggest takeaway this year?",
    views: "420K",
    reposts: "142",
    likes: "3,890",
    bookmarks: "890",
    replies: "284",
  },
  {
    id: "milestone-threads",
    label: "🚀 Milestone",
    platform: "threads",
    name: "Exismic Studio",
    handle: "exismic",
    badge: "meta_blue",
    text: "We just crossed 100,000 active creators with $0 spent on paid advertising.\n\nAll organic love. Thank you to everyone building the future with us!",
    views: "850K",
    reposts: "2,430",
    likes: "21.4K",
    bookmarks: "3,800",
    replies: "512",
  },
  {
    id: "reddit-discussion",
    label: "👾 Tech Thread",
    platform: "reddit",
    name: "Alex Rivera",
    handle: "ariverabuilds",
    subreddit: "r/webdev",
    postTitle: "Why client-side processing will replace 80% of SaaS server architectures",
    badge: "reddit_op",
    text: "Modern browsers running WebAssembly and WebGL have more compute power than server clusters from a decade ago.\n\nBy moving image encoding, audio effects, and canvas rendering 100% to client memory, we eliminated server bills and reduced user latency to zero.",
    views: "180K",
    reposts: "520",
    likes: "4,820",
    bookmarks: "1,200",
    replies: "438",
  },
  {
    id: "youtube-community",
    label: "🎬 Channel Drop",
    platform: "youtube",
    name: "Exismic Creative",
    handle: "exismic",
    badge: "youtube_verified",
    text: "New studio drop! The entire suite of 13 creative engines is now live on the site.\n\nZero paywalls, zero cloud queues, completely free forever. Check it out and let me know your favorite tool in the comments!",
    views: "95K",
    reposts: "110",
    likes: "12.4K",
    bookmarks: "640",
    replies: "920",
  },
  {
    id: "shower-thought",
    label: "💡 Relatable Take",
    platform: "twitter",
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

// ============================================================================
// AUTHENTIC PLATFORM VERIFICATION BADGES (Exact Platform Geometry)
// ============================================================================

function VerifiedBadgeIcon({ type }: { type: string }) {
  if (!type || type === "none") return null;

  // Twitter / X: Official 8-Point Scalloped Rosette (Pixel-Matched to x.com)
  if (type === "twitter_blue") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-[18px] h-[18px] shrink-0 ml-1 inline-flex self-center"
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
        className="w-[18px] h-[18px] shrink-0 ml-1 inline-flex self-center"
        aria-label="Verified Organization"
      >
        <defs>
          <linearGradient
            id="x_gold_outer_grad"
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
            id="x_gold_inner_grad"
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
            fill="url(#x_gold_outer_grad)"
          />
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M13.348 3.772L11 1.5 8.651 3.772l-3.235-.458-.565 3.219-2.886 1.531L3.4 11l-1.435 2.936 2.886 1.531.565 3.219 3.235-.458L11 20.5l2.348-2.272 3.236.458.564-3.219 2.887-1.531L18.6 11l1.435-2.936-2.887-1.531-.564-3.219-3.236.458z"
            fill="url(#x_gold_inner_grad)"
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

  // Twitter / X: Official Grey Government Checkmark
  if (type === "twitter_grey") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-[18px] h-[18px] shrink-0 ml-1 inline-flex self-center"
        aria-label="Official Government"
      >
        <path
          d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.67-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
          fill="#829aab"
        />
        <path
          d="M10.54 16.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // Meta (Threads & Instagram): Official Meta Verified Rosette
  if (type === "meta_blue") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-[18px] h-[18px] shrink-0 ml-1 inline-flex self-center"
        aria-label="Meta Verified"
      >
        <path
          fill="#0095f6"
          d="M12 1.75l2.4 2.1 3.2-.4 1.2 3 3 1.2-.4 3.2 2.1 2.4-2.1 2.4.4 3.2-3 1.2-1.2 3-3.2-.4-2.4 2.1-2.4-2.1-3.2.4-1.2-3-3-1.2.4-3.2-2.1-2.4 2.1-2.4-.4-3.2 3-1.2 1.2-3 3.2.4z"
        />
        <path
          d="M10.54 16.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // LinkedIn: Identity Verified Shield
  if (type === "linkedin_verified") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0a66c2] bg-[#0a66c2]/10 border border-[#0a66c2]/25 px-1.5 py-0.5 rounded-[4px] ml-1 shrink-0 self-center">
        <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current">
          <path d="M8 1L2 3.5v4.75c0 3.75 2.5 6.75 6 7.75 3.5-1 6-4 6-7.75V3.5L8 1zm-1 10.5L3.75 8.25l1.06-1.06L7 9.38l4.19-4.19 1.06 1.06L7 11.5z" />
        </svg>
        <span>Verified</span>
      </span>
    );
  }

  // LinkedIn: Premium Gold "in"
  if (type === "linkedin_premium") {
    return (
      <span className="inline-flex items-center justify-center bg-[#ca8a04] text-black font-black text-[9px] tracking-tight px-1 py-0.5 rounded-[3px] ml-1 shrink-0 leading-none shadow-[0_0_8px_rgba(202,138,4,0.3)] self-center">
        in
      </span>
    );
  }

  // LinkedIn: Top Voice
  if (type === "linkedin_top_voice") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ca8a04] bg-[#ca8a04]/10 border border-[#ca8a04]/30 px-1.5 py-0.5 rounded-[4px] ml-1 shrink-0 self-center">
        <span>⭐</span>
        <span>Top Voice</span>
      </span>
    );
  }

  // YouTube: Official Verified Channel Circle
  if (type === "youtube_verified") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-[17px] h-[17px] shrink-0 ml-1 inline-flex self-center"
        aria-label="Verified Channel"
      >
        <circle cx="12" cy="12" r="9.5" fill="#71767b" fillOpacity="0.4" />
        <path
          d="M10.54 15.6L7.2 12.26l1.41-1.42 1.93 1.93 4.8-5.23 1.47 1.36z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // YouTube: Official Artist Channel Note
  if (type === "youtube_artist") {
    return (
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-700/50 text-zinc-300 font-bold text-[11px] ml-1 shrink-0 self-center"
        title="Official Artist Channel"
      >
        ♪
      </span>
    );
  }

  // TikTok: Official Cyan Verified Circle
  if (type === "tiktok_verified") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-[17px] h-[17px] shrink-0 ml-1 inline-flex self-center"
        aria-label="Verified Account"
      >
        <circle cx="12" cy="12" r="9.5" fill="#20d5ec" />
        <path
          d="M10.54 15.6L7.2 12.26l1.41-1.42 1.93 1.93 4.8-5.23 1.47 1.36z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  // Reddit: OP Badge
  if (type === "reddit_op") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-extrabold tracking-wider uppercase bg-[#0079d3]/20 text-[#0079d3] border border-[#0079d3]/30 ml-1 shrink-0 self-center">
        OP
      </span>
    );
  }

  // Reddit: Moderator Shield
  if (type === "reddit_mod") {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 ml-1 shrink-0 self-center">
        <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-current">
          <path d="M8 1L2 3.5v4.75c0 3.75 2.5 6.75 6 7.75 3.5-1 6-4 6-7.75V3.5L8 1z" />
        </svg>
        MOD
      </span>
    );
  }

  // Bluesky: Verified Circle
  if (type === "bluesky_verified") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-[17px] h-[17px] shrink-0 ml-1 inline-flex self-center"
      >
        <circle cx="12" cy="12" r="9.5" fill="#1185fe" />
        <path
          d="M10.54 15.6L7.2 12.26l1.41-1.42 1.93 1.93 4.8-5.23 1.47 1.36z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  return null;
}

// Platform Icon Renderer for Switcher Buttons
function PlatformLogo({ platform }: { platform: PlatformType }) {
  switch (platform) {
    case "twitter":
      return <span className="text-sm font-black">𝕏</span>;
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0a66c2]">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
        </svg>
      );
    case "threads":
      return (
        <span className="text-sm font-bold font-mono text-purple-400">@</span>
      );
    case "instagram_post":
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-pink-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#ff0000]">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-cyan-400">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.02 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.17 1.17 2.14 2.33 2.37 1.05.23 2.19-.04 2.98-.77.63-.56.97-1.39 1-2.23l.05-14.73z" />
        </svg>
      );
    case "reddit":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#ff4500]">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.56 1.25 1.248a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.56 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      );
    case "bluesky":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#1185fe]">
          <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.74-1.326 7.823-5.289 1.083 3.963 2.81 10.479 7.823 5.289 4.557-5.073 1.082-6.498-2.83-7.078-.139-.016-.277-.034-.415-.056.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.479 0-.689-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.748 13.087 8.686 12 10.8z" />
        </svg>
      );
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SocialPostStudio() {
  // Mobile responsive tab navigation state ("editor" vs "preview")
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  // Studio Settings State
  const [platform, setPlatform] = useState<PlatformType>("twitter");
  const [theme, setTheme] = useState<CardTheme>("obsidian");
  const [canvasFormat, setCanvasFormat] = useState<CanvasFormat>("fitted");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("viral-take");

  // Profile & Identity
  const [displayName, setDisplayName] = useState("Alex Rivera");
  const [username, setUsername] = useState("ariverabuilds");
  const [headline, setHeadline] = useState("Founder & Builder @ Exismic");
  const [badge, setBadge] = useState<string>("twitter_blue");
  const [avatarUri, setAvatarUri] = useState<string>(PRESET_AVATARS[0].svgDataUri);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [hasStoryRing, setHasStoryRing] = useState(true);

  // Content
  const [postText, setPostText] = useState(
    "Building a company is 10% having a great idea and 90% not giving up when everything is on fire.\n\nMost people quit right before the breakthrough."
  );
  const [postTitle, setPostTitle] = useState("Why client-side processing will replace 80% of SaaS servers");
  const [subreddit, setSubreddit] = useState("r/webdev");
  const [locationTag, setLocationTag] = useState("San Francisco, California");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // Date & Client App Tag
  const [timeString, setTimeString] = useState("10:42 AM");
  const [dateString, setDateString] = useState("Sep 20, 2026");
  const [sourceApp, setSourceApp] = useState("Twitter for iPhone");
  const [showSource, setShowSource] = useState(true);
  const [commentTimeAgo, setCommentTimeAgo] = useState("2h");
  const [isLikedByAuthor, setIsLikedByAuthor] = useState(true);

  // Metrics
  const [views, setViews] = useState("1.2M");
  const [reposts, setReposts] = useState("4,820");
  const [likes, setLikes] = useState("38.5K");
  const [bookmarks, setBookmarks] = useState("6,190");
  const [replies, setReplies] = useState("842");
  const [showMetrics, setShowMetrics] = useState(true);

  // Processing state
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [pipelineUrl, setPipelineUrl] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // When switching platforms, auto-align verification badge
  const handleSelectPlatform = (newPlatform: PlatformType) => {
    setPlatform(newPlatform);
    const config = PLATFORM_CONFIGS.find((p) => p.id === newPlatform);
    if (config) {
      // Check if current badge is supported by the new platform
      const isSupported = config.badges.some((b) => b.id === badge);
      if (!isSupported) {
        setBadge(config.defaultBadge);
      }
    }
  };

  // Custom avatar upload handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUri(reader.result);
        setCustomAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Attached media photo upload handler
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

  // Apply Blueprint Preset
  const handleApplyPreset = (preset: QuickPreset) => {
    setSelectedPresetId(preset.id);
    handleSelectPlatform(preset.platform);
    setDisplayName(preset.name);
    setUsername(preset.handle);
    setBadge(preset.badge);
    setPostText(preset.text);
    if (preset.headline) setHeadline(preset.headline);
    if (preset.subreddit) setSubreddit(preset.subreddit);
    if (preset.postTitle) setPostTitle(preset.postTitle);
    setViews(preset.views);
    setReposts(preset.reposts);
    setLikes(preset.likes);
    setBookmarks(preset.bookmarks);
    setReplies(preset.replies);
  };

  // Set time to right now
  const handleSetToNow = () => {
    const now = new Date();
    setTimeString(
      now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
    setDateString(
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
    setCommentTimeAgo("1m");
  };

  // Copy to clipboard as image
  const handleCopyPicture = async () => {
    if (!cardRef.current || isCopying) return;
    setIsCopying(true);

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
        await handleDownloadPng();
      }
    } catch {
      await handleDownloadPng();
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
    headline,
    badge,
    postText,
    postTitle,
    subreddit,
    avatarUri,
    attachedImage,
    views,
    reposts,
    likes,
    bookmarks,
    replies,
    showMetrics,
    timeString,
    dateString,
    sourceApp,
    commentTimeAgo,
    isLikedByAuthor,
    canvasFormat,
    updatePipelineImage,
  ]);

  // Current platform config
  const currentConfig =
    PLATFORM_CONFIGS.find((p) => p.id === platform) || PLATFORM_CONFIGS[0];

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
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-5">
      {/* Top Banner / Quick Blueprint Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#0b0f19]/90 border border-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-200">Content Blueprints:</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-rose-500/15 text-rose-300 border border-rose-500/25">
            Presets
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-lg border transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap",
                selectedPresetId === preset.id
                  ? "bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)] font-medium"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.06] text-zinc-300 hover:text-white"
              )}
            >
              <PlatformLogo platform={preset.platform} />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE SEGMENTED CONTROL TABS (Visible only on mobile/tablet screens < lg) */}
      <div className="lg:hidden flex items-center p-1 rounded-xl bg-[#090b14] border border-white/[0.1] shadow-lg">
        <button
          onClick={() => setMobileTab("editor")}
          className={cn(
            "flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all",
            mobileTab === "editor"
              ? "bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-white border border-rose-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Edit3 className="w-3.5 h-3.5 text-rose-400" />
          <span>Editor Controls</span>
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={cn(
            "flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all",
            mobileTab === "preview"
              ? "bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-white border border-rose-500/40 shadow-sm"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live Preview ({currentConfig.shortName})</span>
        </button>
      </div>

      {/* DUAL WORKSPACE LAYOUT (2 Columns on Desktop, Tabbed on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: STUDIO CONTROLS */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-5 space-y-4",
            mobileTab === "editor" ? "block" : "hidden lg:block"
          )}
        >
          {/* STEP 1: SELECT SOCIAL PLATFORM (Expanded with 9 Platforms) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30 shrink-0">
                  1
                </span>
                <span>Select Social Platform</span>
              </label>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                9 Engines
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {PLATFORM_CONFIGS.map((cfg) => {
                const isActive = platform === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    onClick={() => handleSelectPlatform(cfg.id)}
                    className={cn(
                      "py-2.5 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1.5 transition-all active:scale-95 text-center",
                      isActive
                        ? "bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)] ring-1 ring-rose-500/30 font-semibold"
                        : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <PlatformLogo platform={cfg.id} />
                    <span className="truncate w-full text-[11px]">{cfg.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: CANVAS & THEME OPTIONS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30 shrink-0">
                2
              </span>
              <span>Theme & Presentation Frame</span>
            </label>

            {/* Background Theme */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setTheme("obsidian")}
                className={cn(
                  "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all active:scale-95",
                  theme === "obsidian"
                    ? "bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)] ring-1 ring-purple-500/30"
                    : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
                Obsidian
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all active:scale-95",
                  theme === "dark"
                    ? "bg-zinc-800 text-white border-zinc-500 shadow-[0_0_12px_rgba(255,255,255,0.1)] ring-1 ring-zinc-400/30"
                    : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-black border border-white/40 shrink-0" />
                Black
              </button>
              <button
                onClick={() => setTheme("dim")}
                className={cn(
                  "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all active:scale-95",
                  theme === "dim"
                    ? "bg-sky-900/40 text-sky-200 border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)] ring-1 ring-sky-500/30"
                    : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#15202b] border border-sky-400/50 shrink-0" />
                Dim Navy
              </button>
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all active:scale-95",
                  theme === "light"
                    ? "bg-white text-zinc-900 border-white font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-black/30 shrink-0" />
                Clean Light
              </button>
            </div>

            {/* Canvas Aspect Ratio Options */}
            <div className="pt-2 border-t border-white/[0.06]">
              <label className="text-[11px] text-zinc-400 block mb-1.5">Export Framing:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCanvasFormat("fitted")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center",
                    canvasFormat === "fitted"
                      ? "bg-rose-500/20 text-rose-200 border-rose-500/40"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white"
                  )}
                >
                  Snug Card
                </button>
                <button
                  onClick={() => setCanvasFormat("square")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center",
                    canvasFormat === "square"
                      ? "bg-rose-500/20 text-rose-200 border-rose-500/40"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white"
                  )}
                >
                  1:1 Studio Frame
                </button>
                <button
                  onClick={() => setCanvasFormat("portrait")}
                  className={cn(
                    "py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center",
                    canvasFormat === "portrait"
                      ? "bg-rose-500/20 text-rose-200 border-rose-500/40"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white"
                  )}
                >
                  9:16 Story Frame
                </button>
              </div>
            </div>
          </div>

          {/* STEP 3: CREATOR IDENTITY & PLATFORM-AUTHENTIC BADGES */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30 shrink-0">
                3
              </span>
              <AtSign className="w-3.5 h-3.5 text-rose-400" />
              <span>Creator Identity & Badges</span>
            </h3>

            {/* Profile Avatar Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-zinc-400">Profile Picture</label>
                {customAvatar && (
                  <button
                    onClick={() => {
                      setCustomAvatar(null);
                      setAvatarUri(PRESET_AVATARS[0].svgDataUri);
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Reset Preset
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                {customAvatar && (
                  <button
                    onClick={() => setAvatarUri(customAvatar)}
                    className={cn(
                      "relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all active:scale-95",
                      avatarUri === customAvatar
                        ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                        : "border-white/20 hover:border-white/50"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={customAvatar} alt="Custom" className="w-full h-full object-cover" />
                  </button>
                )}

                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => setAvatarUri(av.svgDataUri)}
                    className={cn(
                      "relative w-9 h-9 rounded-full overflow-hidden border-2 transition-all active:scale-95",
                      avatarUri === av.svgDataUri && !customAvatar
                        ? "border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                        : "border-white/10 hover:border-white/40"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={av.svgDataUri} alt={av.name} className="w-full h-full object-cover" />
                  </button>
                ))}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl border border-dashed border-white/20 hover:border-rose-400 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* Display Name & Handle Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  {platform === "reddit" ? "Reddit Username" : "Username Handle"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-zinc-500">
                    {platform === "reddit" ? "u/" : "@"}
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ariverabuilds"
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>
            </div>

            {/* LinkedIn Headline / Reddit Subreddit / IG Location */}
            {platform === "linkedin" && (
              <div>
                <label className="text-xs text-zinc-400 block mb-1">LinkedIn Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Founder @ Exismic | Forbes 30 Under 30"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                />
              </div>
            )}

            {platform === "reddit" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Subreddit</label>
                  <input
                    type="text"
                    value={subreddit}
                    onChange={(e) => setSubreddit(e.target.value)}
                    placeholder="r/technology"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Post Title</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Discussion Title"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>
            )}

            {platform === "instagram_post" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Location Tag</label>
                  <input
                    type="text"
                    value={locationTag}
                    onChange={(e) => setLocationTag(e.target.value)}
                    placeholder="San Francisco, California"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hasStoryRing}
                      onChange={(e) => setHasStoryRing(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-rose-500 focus:ring-rose-400"
                    />
                    <span>Active Story Gradient Ring</span>
                  </label>
                </div>
              </div>
            )}

            {/* DYNAMIC PLATFORM-AUTHENTIC VERIFICATION BADGE SELECTOR */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5 flex items-center justify-between">
                <span>{currentConfig.name} Verification Badges:</span>
                <span className="text-[10px] text-zinc-500">Matches official app</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {currentConfig.badges.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBadge(b.id)}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap",
                      badge === b.id
                        ? "bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/30 font-semibold"
                        : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <VerifiedBadgeIcon type={b.id} />
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 4: POST TEXT & ATTACHMENTS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30 shrink-0">
                  4
                </span>
                <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                <span>Post Text & Media</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">
                {postText.length} {platform === "twitter" ? "/ 280" : "characters"}
              </span>
            </div>

            <textarea
              rows={4}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's happening?"
              className="w-full px-3.5 py-3 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400 leading-relaxed resize-y"
            />

            {/* Quick Token Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-zinc-400">
              <span className="text-[11px] text-zinc-500">Insert:</span>
              <button
                onClick={() => setPostText((prev) => prev + " #tech")}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:text-white transition-colors"
              >
                #hashtag
              </button>
              <button
                onClick={() => setPostText((prev) => prev + " @exismic")}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:text-white transition-colors"
              >
                @mention
              </button>
              <button
                onClick={() => setPostText((prev) => prev + " 🔥")}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:text-white transition-colors"
              >
                🔥
              </button>
              <button
                onClick={() => setPostText((prev) => prev + " 🚀")}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:text-white transition-colors"
              >
                🚀
              </button>
              <button
                onClick={() => setPostText((prev) => prev + " 💡")}
                className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:text-white transition-colors"
              >
                💡
              </button>
            </div>

            {/* Attached Photo */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">Optional Attached Photo or Graphic</label>
              {attachedImage ? (
                <div className="relative rounded-xl overflow-hidden border border-white/[0.1] bg-black/40 p-2 flex items-center justify-between shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={attachedImage}
                      alt="Attached"
                      className="w-12 h-12 rounded-lg object-cover border border-white/10"
                    />
                    <span className="text-xs text-zinc-300">Photo Attached to Post</span>
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
                    className="w-full py-3 rounded-xl border border-dashed border-white/[0.12] hover:border-rose-400/40 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-medium text-zinc-400 hover:text-white flex items-center justify-center gap-2 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                  >
                    <ImageIcon className="w-4 h-4 text-rose-400" />
                    Attach a Photo or Screenshot to Post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* STEP 5: TIMESTAMP & ENGAGEMENT NUMBERS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30 shrink-0">
                  5
                </span>
                <Sliders className="w-3.5 h-3.5 text-rose-400" />
                <span>Timestamp & Metrics</span>
              </h3>
              <button
                onClick={handleSetToNow}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition-all active:scale-95"
              >
                <Clock className="w-3 h-3" />
                Set to Right Now
              </button>
            </div>

            {platform === "twitter" ? (
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
                    placeholder="Sep 20, 2026"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Relative Time Ago</label>
                <input
                  type="text"
                  value={commentTimeAgo}
                  onChange={(e) => setCommentTimeAgo(e.target.value)}
                  placeholder="2h, 1d, or 3 days ago"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-rose-400"
                />
              </div>
            )}

            {/* Metrics Counters */}
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
                  <div>
                    <span className="text-[11px] text-zinc-500 block mb-1">
                      {platform === "reddit" ? "Upvotes" : "Likes / Reactions"}
                    </span>
                    <input
                      type="text"
                      value={likes}
                      onChange={(e) => setLikes(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block mb-1">
                      {platform === "linkedin" ? "Comments" : "Replies"}
                    </span>
                    <input
                      type="text"
                      value={replies}
                      onChange={(e) => setReplies(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none"
                    />
                  </div>
                  {platform !== "instagram" && platform !== "tiktok" && (
                    <div>
                      <span className="text-[11px] text-zinc-500 block mb-1">
                        {platform === "twitter" ? "Reposts" : "Shares / Reposts"}
                      </span>
                      <input
                        type="text"
                        value={reposts}
                        onChange={(e) => setReposts(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none"
                      />
                    </div>
                  )}
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: LIVE REALISTIC PREVIEW CANVAS */}
        {/* ================================================================= */}
        <div
          className={cn(
            "lg:col-span-7 space-y-4",
            mobileTab === "preview" ? "block" : "hidden lg:block"
          )}
        >
          {/* Action Header: 1-Click Copy Picture & Download Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#090b14]/90 border border-white/[0.08] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Live Post Preview
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.06]">
                2.5x High-DPI
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Luxury Frosted Copy Button */}
              <button
                onClick={handleCopyPicture}
                disabled={isCopying}
                className={cn(
                  "relative group overflow-hidden px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
                  copySuccess
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]"
                    : "bg-[#0b0e1b]/90 hover:bg-[#12172d] text-zinc-100 hover:text-white border-white/[0.12] hover:border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Picture!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    <span>{isCopying ? "Copying..." : "Copy Picture"}</span>
                  </>
                )}
              </button>

              {/* Luxury Radiant Download Master CTA */}
              <button
                onClick={handleDownloadPng}
                disabled={isDownloading}
                className={cn(
                  "relative group overflow-hidden px-4 py-2 rounded-xl text-xs font-semibold text-white",
                  "bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-400 hover:via-pink-500 hover:to-purple-500",
                  "border border-white/25 hover:border-white/40",
                  "shadow-[0_0_25px_rgba(244,63,94,0.35),inset_0_1px_0_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.5)]",
                  "flex items-center gap-2 transition-all duration-200 active:scale-95"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.2] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
                <Download className="w-3.5 h-3.5 text-white drop-shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5" />
                <span className="tracking-wide">{isDownloading ? "Rendering PNG..." : "Download Card"}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-black/30 text-white/90 border border-white/15">
                  PNG
                </span>
              </button>
            </div>
          </div>

          {/* REALISTIC STUDIO STAGE VIEWPORT (Mobile Fluid Max-Width) */}
          <div className="relative p-3 sm:p-6 md:p-8 rounded-3xl bg-[#06070d] border border-white/[0.08] flex items-center justify-center min-h-[420px] overflow-x-hidden overflow-y-auto shadow-2xl">
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.07)_0%,transparent_70%)]" />
            {/* Fine Studio Grid Texture */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* ========================================================= */}
            {/* THE RENDERED MOCKUP ELEMENT CAPTURED FOR EXPORT */}
            {/* ========================================================= */}
            <div
              ref={cardRef}
              className={cn(
                "relative z-10 w-full transition-all font-sans select-none shadow-2xl",
                canvasFormat === "square"
                  ? "max-w-[560px] aspect-square p-6 sm:p-10 flex flex-col justify-center rounded-3xl"
                  : canvasFormat === "portrait"
                  ? "max-w-[420px] min-h-[640px] p-6 sm:p-8 flex flex-col justify-center rounded-3xl"
                  : "max-w-[550px] p-4 sm:p-6 rounded-2xl",
                themeStyles.card
              )}
            >
              {/* ======================================================= */}
              {/* 1. TWITTER / X POST */}
              {/* ======================================================= */}
              {platform === "twitter" && (
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUri}
                        alt={displayName}
                        className={cn(
                          "w-11 h-11 object-cover shrink-0 border border-white/10 transition-all",
                          badge === "twitter_gold" ? "rounded-xl" : "rounded-full"
                        )}
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

                    <span className={cn("text-base font-bold select-none", themeStyles.subtext)}>
                      𝕏
                    </span>
                  </div>

                  <div className="text-[15px] leading-relaxed whitespace-pre-line break-words pt-0.5">
                    {renderFormattedText(postText, themeStyles.isLight)}
                  </div>

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
                        <span
                          className={
                            themeStyles.isLight ? "text-zinc-900 font-semibold" : "text-white font-semibold"
                          }
                        >
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

                  {showMetrics && <div className={cn("border-t", themeStyles.border)} />}

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

              {/* ======================================================= */}
              {/* 2. LINKEDIN POST */}
              {/* ======================================================= */}
              {platform === "linkedin" && (
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUri}
                        alt={displayName}
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/10 mt-0.5"
                      />
                      <div>
                        <div className="flex items-center font-bold text-[15px] leading-tight flex-wrap">
                          <span>{displayName}</span>
                          <VerifiedBadgeIcon type={badge} />
                          <span className={cn("text-xs font-normal ml-1.5", themeStyles.subtext)}>
                            • 1st
                          </span>
                        </div>
                        <div className={cn("text-xs font-normal mt-0.5 leading-snug line-clamp-2", themeStyles.subtext)}>
                          {headline}
                        </div>
                        <div className={cn("text-[11px] font-normal mt-0.5 flex items-center gap-1", themeStyles.subtext)}>
                          <span>{commentTimeAgo}</span>
                          <span>•</span>
                          <Globe className="w-3 h-3 inline-block" />
                          <span>• Edited</span>
                        </div>
                      </div>
                    </div>

                    <button className="px-3 py-1 rounded-full text-xs font-semibold text-[#0a66c2] hover:bg-[#0a66c2]/10 border border-[#0a66c2]/30 flex items-center gap-1 transition-colors">
                      <span>+</span>
                      <span>Follow</span>
                    </button>
                  </div>

                  <div className="text-[14px] leading-relaxed whitespace-pre-line break-words pt-1">
                    {renderFormattedText(postText, themeStyles.isLight)}
                  </div>

                  {attachedImage && (
                    <div className="rounded-xl overflow-hidden border border-white/10 max-h-[300px] bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachedImage}
                        alt="LinkedIn Media"
                        className="w-full h-full object-cover max-h-[300px]"
                      />
                    </div>
                  )}

                  {showMetrics && (
                    <div className={cn("flex items-center justify-between text-xs pt-1", themeStyles.subtext)}>
                      <div className="flex items-center gap-1">
                        <span className="inline-flex -space-x-1 items-center">
                          <span className="w-4 h-4 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-[9px] shadow-sm">
                            👍
                          </span>
                          <span className="w-4 h-4 rounded-full bg-[#057642] text-white flex items-center justify-center text-[9px] shadow-sm">
                            👏
                          </span>
                          <span className="w-4 h-4 rounded-full bg-[#e7a400] text-white flex items-center justify-center text-[9px] shadow-sm">
                            💡
                          </span>
                        </span>
                        <span className="ml-1 font-medium">{likes}</span>
                      </div>
                      <div>
                        <span>{replies} comments</span>
                        <span> • </span>
                        <span>{reposts} reposts</span>
                      </div>
                    </div>
                  )}

                  {showMetrics && <div className={cn("border-t", themeStyles.border)} />}

                  {showMetrics && (
                    <div className={cn("flex items-center justify-around text-xs font-semibold pt-1", themeStyles.subtext)}>
                      <button className="flex items-center gap-1.5 py-1 px-2 hover:opacity-80">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Like</span>
                      </button>
                      <button className="flex items-center gap-1.5 py-1 px-2 hover:opacity-80">
                        <MessageSquare className="w-4 h-4" />
                        <span>Comment</span>
                      </button>
                      <button className="flex items-center gap-1.5 py-1 px-2 hover:opacity-80">
                        <Repeat className="w-4 h-4" />
                        <span>Repost</span>
                      </button>
                      <button className="flex items-center gap-1.5 py-1 px-2 hover:opacity-80">
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================= */}
              {/* 3. META THREADS POST */}
              {/* ======================================================= */}
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

                  <div className="text-[15px] leading-relaxed whitespace-pre-line break-words pl-1">
                    {renderFormattedText(postText, themeStyles.isLight)}
                  </div>

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

                  <div className="flex items-center gap-4 pt-1 text-sm">
                    <Heart className="w-5 h-5 opacity-80" />
                    <MessageSquare className="w-5 h-5 opacity-80" />
                    <Repeat className="w-5 h-5 opacity-80" />
                    <Send className="w-5 h-5 opacity-80" />
                  </div>

                  {showMetrics && (
                    <div className={cn("text-xs pt-1", themeStyles.subtext)}>
                      {replies} replies · {likes} likes
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================= */}
              {/* 4. INSTAGRAM FEED POST */}
              {/* ======================================================= */}
              {platform === "instagram_post" && (
                <div className="space-y-3">
                  {/* IG Feed Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "p-0.5 rounded-full",
                          hasStoryRing
                            ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm"
                            : ""
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarUri}
                          alt={username}
                          className="w-8 h-8 rounded-full object-cover border-2 border-black"
                        />
                      </div>
                      <div className="leading-tight">
                        <div className="flex items-center font-bold text-xs">
                          <span>{username}</span>
                          <VerifiedBadgeIcon type={badge} />
                        </div>
                        {locationTag && (
                          <div className={cn("text-[11px] font-normal", themeStyles.subtext)}>
                            {locationTag}
                          </div>
                        )}
                      </div>
                    </div>

                    <MoreHorizontal className="w-4 h-4 opacity-70" />
                  </div>

                  {/* Photo or Graphic Body */}
                  {attachedImage ? (
                    <div className="rounded-xl overflow-hidden border border-white/10 max-h-[340px] bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachedImage}
                        alt="Instagram Media"
                        className="w-full h-full object-cover max-h-[340px]"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl p-5 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-indigo-500/10 border border-white/10 text-center flex items-center justify-center min-h-[160px]">
                      <div className="text-sm font-medium leading-relaxed">
                        {renderFormattedText(postText, themeStyles.isLight)}
                      </div>
                    </div>
                  )}

                  {/* Action Icons Bar */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-3.5 text-base">
                      <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                      <MessageSquare className="w-5 h-5 opacity-80" />
                      <Send className="w-5 h-5 opacity-80" />
                    </div>
                    <Bookmark className="w-5 h-5 opacity-80" />
                  </div>

                  {/* Likes and Caption */}
                  <div className="space-y-1 text-xs">
                    <div className="font-bold">Liked by exismic and {likes} others</div>
                    <div>
                      <span className="font-bold mr-1.5">{username}</span>
                      <span className="leading-snug">{renderFormattedText(postText, themeStyles.isLight)}</span>
                    </div>
                    <div className={cn("text-[11px] cursor-pointer pt-0.5", themeStyles.subtext)}>
                      View all {replies} comments
                    </div>
                    <div className={cn("text-[10px] uppercase tracking-wider pt-0.5 font-mono", themeStyles.subtext)}>
                      {commentTimeAgo} AGO
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* 5. INSTAGRAM VIRAL COMMENT */}
              {/* ======================================================= */}
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

                  {showMetrics && (
                    <div className="flex flex-col items-center justify-center shrink-0 pt-1 text-zinc-400">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      <span className="text-[11px] font-medium mt-0.5">{likes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================= */}
              {/* 6. YOUTUBE COMMUNITY POST */}
              {/* ======================================================= */}
              {platform === "youtube" && (
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUri}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                      />
                      <div className="leading-tight">
                        <div className="flex items-center font-bold text-[14px]">
                          <span>{displayName}</span>
                          <VerifiedBadgeIcon type={badge} />
                        </div>
                        <div className={cn("text-xs font-normal mt-0.5", themeStyles.subtext)}>
                          {commentTimeAgo}
                        </div>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 opacity-70" />
                  </div>

                  <div className="text-[14px] leading-relaxed whitespace-pre-line break-words">
                    {renderFormattedText(postText, themeStyles.isLight)}
                  </div>

                  {attachedImage && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 max-h-[300px] bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachedImage}
                        alt="Community post media"
                        className="w-full h-full object-cover max-h-[300px]"
                      />
                    </div>
                  )}

                  {showMetrics && (
                    <div className={cn("flex items-center gap-5 text-xs pt-1", themeStyles.subtext)}>
                      <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{likes}</span>
                      </button>
                      <button className="flex items-center hover:text-white transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>{replies}</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================= */}
              {/* 7. TIKTOK VIRAL COMMENT */}
              {/* ======================================================= */}
              {platform === "tiktok" && (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUri}
                      alt={displayName}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10 mt-0.5"
                    />
                    <div className="text-sm leading-snug space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-zinc-300">{displayName}</span>
                        <VerifiedBadgeIcon type={badge} />
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Creator
                        </span>
                      </div>
                      <div className="text-sm pt-0.5">{renderFormattedText(postText, themeStyles.isLight)}</div>
                      <div className={cn("text-xs flex items-center gap-3 pt-0.5", themeStyles.subtext)}>
                        <span>{commentTimeAgo}</span>
                        <span className="font-semibold cursor-pointer">Reply</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center shrink-0 pt-1 text-zinc-400">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    <span className="text-[11px] font-medium mt-0.5">{likes}</span>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* 8. REDDIT DISCUSSION POST */}
              {/* ======================================================= */}
              {platform === "reddit" && (
                <div className="space-y-3">
                  {/* Reddit Subreddit Header */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#ff4500] text-white flex items-center justify-center font-bold text-[10px]">
                      r/
                    </span>
                    <span className="font-bold">{subreddit}</span>
                    <span className={themeStyles.subtext}>•</span>
                    <span className={cn("text-[11px]", themeStyles.subtext)}>
                      Posted by u/{username} {commentTimeAgo}
                    </span>
                    <VerifiedBadgeIcon type={badge} />
                  </div>

                  {/* Reddit Title */}
                  <h4 className="font-bold text-base sm:text-lg leading-snug">
                    {postTitle || "Post title discussion"}
                  </h4>

                  {/* Reddit Text Body */}
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words opacity-90">
                    {renderFormattedText(postText, themeStyles.isLight)}
                  </div>

                  {attachedImage && (
                    <div className="rounded-xl overflow-hidden border border-white/10 max-h-[300px] bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachedImage}
                        alt="Reddit attachment"
                        className="w-full h-full object-cover max-h-[300px]"
                      />
                    </div>
                  )}

                  {/* Reddit Vote Pill and Actions Bar */}
                  {showMetrics && (
                    <div className={cn("flex items-center gap-2 text-xs pt-1 flex-wrap", themeStyles.subtext)}>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
                        <ArrowBigUp className="w-4 h-4 text-[#ff4500]" />
                        <span className="font-bold text-white text-xs">{likes}</span>
                        <ArrowBigDown className="w-4 h-4 opacity-60" />
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{replies} Comments</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
                        <Award className="w-3.5 h-3.5" />
                        <span>Award</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================= */}
              {/* 9. BLUESKY SOCIAL POST */}
              {/* ======================================================= */}
              {platform === "bluesky" && (
                <div className="space-y-3.5">
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
                          @{username}.bsky.social
                        </div>
                      </div>
                    </div>

                    <PlatformLogo platform="bluesky" />
                  </div>

                  <div className="text-[15px] leading-relaxed whitespace-pre-line break-words pt-0.5">
                    {renderFormattedText(postText, themeStyles.isLight)}
                  </div>

                  {attachedImage && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 max-h-[300px] bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachedImage}
                        alt="Bluesky media"
                        className="w-full h-full object-cover max-h-[300px]"
                      />
                    </div>
                  )}

                  <div className={cn("text-xs pt-1 flex items-center gap-1.5", themeStyles.subtext)}>
                    <span>{commentTimeAgo}</span>
                    <span>·</span>
                    <span>{dateString}</span>
                  </div>

                  {showMetrics && <div className={cn("border-t", themeStyles.border)} />}

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
                      <div className="flex items-center gap-1.5 opacity-70">
                        <Share2 className="w-4 h-4" />
                      </div>
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

      {/* MOBILE BOTTOM FLOATING ACTION BAR (Fixed on phone screens for seamless 1-tap workflows) */}
      <div className="lg:hidden fixed bottom-4 inset-x-3 z-40 p-2 rounded-2xl bg-[#090b14]/95 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center gap-2">
        {mobileTab === "editor" ? (
          <button
            onClick={() => setMobileTab("preview")}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>View Preview ({currentConfig.shortName})</span>
          </button>
        ) : (
          <button
            onClick={() => setMobileTab("editor")}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Edit3 className="w-4 h-4 text-rose-400" />
            <span>Edit Post Settings</span>
          </button>
        )}

        <button
          onClick={handleDownloadPng}
          disabled={isDownloading}
          className="relative group overflow-hidden px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-400 hover:via-pink-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border border-white/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? "Rendering..." : "Download"}</span>
        </button>
      </div>
    </div>
  );
}
