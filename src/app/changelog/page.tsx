"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Palette,
  CheckCircle2,
  ShieldCheck,
  Zap,
  PackagePlus,
  Search,
  X,
  Copy,
  Check,
  Calendar,
  KeyRound,
  UserCheck,
  Play,
  Smartphone,
  Coins,
  LayoutGrid,
  Trophy,
  Layers,
  Cloud,
  Volume2,
  Share2,
  Award,
  FileText,
  Code2,
  Compass,
  ArrowUpRight,
  HelpCircle,
  Clock,
  Sparkles as _ForbiddenSparkles
} from "lucide-react";
import Link from "next/link";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";

type ChangeType = "feature" | "fix" | "ui" | "perf" | "sec";

interface ChangeItem {
  type: ChangeType;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface Release {
  version: string;
  date: string;
  title: string;
  tagline: string;
  isLatest?: boolean;
  changes: ChangeItem[];
}

const CATEGORY_META: Record<
  ChangeType,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badgeClass: string; dotClass: string }
> = {
  feature: {
    label: "Feature",
    icon: PackagePlus,
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    dotClass: "bg-emerald-400"
  },
  ui: {
    label: "Design",
    icon: Palette,
    badgeClass: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25",
    dotClass: "bg-cyan-400"
  },
  fix: {
    label: "Fix",
    icon: CheckCircle2,
    badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/25",
    dotClass: "bg-rose-400"
  },
  sec: {
    label: "Safety",
    icon: ShieldCheck,
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    dotClass: "bg-amber-400"
  },
  perf: {
    label: "Speed",
    icon: Zap,
    badgeClass: "bg-purple-500/10 text-purple-300 border-purple-500/25",
    dotClass: "bg-purple-400"
  }
};

const RELEASES: Release[] = [
  {
    version: "v1.7",
    date: "October 2026",
    title: "Brand New Homepage, Fresh Sign-In & Complete Tool Refresh",
    tagline: "A major update featuring a completely redesigned homepage, a cleaner sign-in experience, polished interfaces across every tool, a limited 20% launch celebration, and much more.",
    isLatest: true,
    changes: [
      {
        type: "ui",
        title: "Redesigned Homepage",
        description: "Rebuilt the entire homepage from the ground up to be cleaner, more responsive, and easier to browse, with live interactive tool previews right on the page.",
        icon: LayoutGrid
      },
      {
        type: "ui",
        title: "Fresh Sign-In Experience",
        description: "A simple, distraction-free sign-in and account creation page with quick Google and GitHub options and smooth screen switching.",
        icon: KeyRound
      },
      {
        type: "ui",
        title: "Updated Look for All Tools",
        description: "Refreshed every single tool with a modern dark layout, generous room to work, clearer buttons, and a more comfortable workflow.",
        icon: Palette
      },
      {
        type: "feature",
        title: "Ready-to-Use Starters",
        description: "Tools now open with pre-loaded examples and starter presets, so you can test ideas immediately without staring at an empty screen.",
        icon: PackagePlus
      },
      {
        type: "feature",
        title: "Dozens of New Creative Tools",
        description: "Added new creative tools including audio stem splitters, document converters, noise removers, code snippet formatters, and resume builders.",
        icon: Layers
      },
      {
        type: "feature",
        title: "20% Off Launch Celebration",
        description: "Enjoy 20% off Exismic Pro monthly subscriptions and credit packs for a limited time to celebrate the 1.7 release.",
        icon: Coins
      },
      {
        type: "perf",
        title: "Speed & Reliability Improvements",
        description: "Faster page loading, smoother navigation transitions, and improved touch responsiveness across phones and laptops.",
        icon: Zap
      },
      {
        type: "feature",
        title: "And Much More",
        description: "Countless small refinements, polish, and handy tweaks added across the entire studio to make your daily workflow feel better than ever.",
        icon: PackagePlus
      }
    ]
  },
  {
    version: "v1.6.5",
    date: "September 2026",
    title: "Cleaner Design & Sign-In Refresh",
    tagline: "A simpler look for signing in and creating an account, clearer icons across the platform, instant tool testing, and smoother mobile navigation.",
    isLatest: false,
    changes: [
      {
        type: "ui",
        title: "Fresh Sign-In & Sign-Up",
        description: "Upgraded the login and account creation screen with a modern frosted look, glowing focus borders, and clean, clear field labels.",
        icon: KeyRound
      },
      {
        type: "ui",
        title: "Easy Age Confirmation",
        description: "Replaced the old browser checkbox with a comfortable, easy-to-tap confirmation card featuring a smooth checkmark and shield badge.",
        icon: ShieldCheck
      },
      {
        type: "ui",
        title: "Clearer Action Icons",
        description: "Replaced confusing decorative stars with clear, purposeful icons so every tool and button is easy to recognize at a glance.",
        icon: Palette
      },
      {
        type: "feature",
        title: "Homepage Tool Previews",
        description: "Test photo background removal, image creation, and voice separation right from the home page with zero waiting time.",
        icon: Play
      },
      {
        type: "fix",
        title: "Better Phone Display",
        description: "Aligned buttons and text so everything looks neat, organized, and easily readable on smartphones.",
        icon: Smartphone
      },
      {
        type: "sec",
        title: "Simple Password Reset",
        description: "Streamlined password resets and account confirmation screens with clearer guidance and quick copy helpers.",
        icon: KeyRound
      },
      {
        type: "sec",
        title: "Account Safety & 7-Day Recovery",
        description: "Added instant email alerts and an automatic 7-day safety period to easily restore your account if you change your mind.",
        icon: UserCheck
      }
    ]
  },
  {
    version: "v1.6",
    date: "September 2026",
    title: "Sparks Rewards & Studio Dashboard",
    tagline: "Exismic Sparks rewards, personalized Studio home dashboard, streak safety shields, streamlined tool headers, and bug fixes.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        title: "Exismic Sparks Rewards",
        description: "Complete fun daily and weekly creative quests to earn Sparks. Use your Sparks in the shop to unlock glowing avatar frames, username colors, badges, and streak shields.",
        icon: Coins
      },
      {
        type: "ui",
        title: "Personal Studio Dashboard",
        description: "A refreshed home dashboard featuring your favorite tools, daily streaks, quick-start shortcuts, and smart recommendations.",
        icon: LayoutGrid
      },
      {
        type: "feature",
        title: "Streak Shields & Milestone Rewards",
        description: "Equip streak shields to protect your daily streak if you miss a day, and claim extra credits when you hit major activity milestones.",
        icon: Trophy
      },
      {
        type: "ui",
        title: "Cleaner Tool Headers",
        description: "Gave all 117+ tools clean, easy-to-read headers, modern dark glass panels, and clear icons.",
        icon: Layers
      },
      {
        type: "feature",
        title: "Save & Send Tools",
        description: "Save your creations directly to your cloud storage and transfer images straight into background removers or meme makers with one click.",
        icon: Cloud
      },
      {
        type: "fix",
        title: "Gentle Sounds & Exact Balances",
        description: "Replaced loud alerts with smooth chime sounds, and ensured credit balances and daily streaks update instantly.",
        icon: Volume2
      },
      {
        type: "perf",
        title: "100% Watermark-Free & Faster Loading",
        description: "Download your creations without any logos or watermarks, plus enjoy faster page loading across all tools.",
        icon: Zap
      }
    ]
  },
  {
    version: "v1.5",
    date: "September 2026",
    title: "Quests, App Connections & Pro Memberships",
    tagline: "Daily creative quests to earn credits, connect Exismic tools to your apps, annual Pro savings, and gifts for friends.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        title: "Daily & Weekly Quests",
        description: "A brand new way to earn free credits by trying out tools, exploring new features, and keeping your daily activity streak going.",
        icon: Trophy
      },
      {
        type: "feature",
        title: "Connect to External Apps",
        description: "Easily link Exismic creative tools directly into your own websites and applications.",
        icon: Share2
      },
      {
        type: "feature",
        title: "Yearly Pro Memberships",
        description: "Subscribe to Exismic Pro on an annual plan for uninterrupted creative power and big yearly savings.",
        icon: Award
      },
      {
        type: "feature",
        title: "Gift Credits & Memberships",
        description: "Easily send credits and Pro memberships directly to your friends, teammates, and collaborators.",
        icon: PackagePlus
      },
      {
        type: "ui",
        title: "Sleek Dark Glass Polish",
        description: "Enhanced the entire site with smooth dark glass styling, crisper buttons, and cleaner typography.",
        icon: Palette
      },
      {
        type: "fix",
        title: "Smoother Tool Experience",
        description: "Fixed small quirks and glitches across tools so your creative work never gets interrupted.",
        icon: CheckCircle2
      },
      {
        type: "perf",
        title: "Instant Page Transitions",
        description: "Pages open faster with smoother screen transitions and real-time credit updates.",
        icon: Zap
      }
    ]
  },
  {
    version: "v1.2",
    date: "August 2026",
    title: "Flexible Payments & Expanded Creative Suite",
    tagline: "More ways to pay for memberships, new creative tools, cleaner menus, and speed improvements.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        title: "Flexible Payment Options",
        description: "Pay for memberships and credit packs using popular store gift cards with live status updates.",
        icon: Coins
      },
      {
        type: "feature",
        title: "Expanded Creative Suite",
        description: "Unlocked new tools for writing, image editing, quick calculations, and creative work.",
        icon: LayoutGrid
      },
      {
        type: "ui",
        title: "Polished Menus & Popups",
        description: "Upgraded popup windows with soft ambient backdrops and smoother full-screen navigation.",
        icon: Layers
      },
      {
        type: "fix",
        title: "Clear Confirmation Receipts",
        description: "Upgraded confirmation emails for Pro activations with full benefit summaries and receipt details.",
        icon: FileText
      },
      {
        type: "fix",
        title: "Clean Mobile Alignment",
        description: "Fixed navigation alignment on smartphones and tablets for a seamless viewing experience.",
        icon: Smartphone
      },
      {
        type: "perf",
        title: "Faster Tool Speed",
        description: "Made tools open quicker and ensured your credit counter stays up to date in real time.",
        icon: Zap
      }
    ]
  },
  {
    version: "v1.1",
    date: "July 2026",
    title: "Studio Expansion & 25+ New Tools",
    tagline: "25+ new creative tools added, cleaner mobile layouts, bug fixes, and enhanced account protection.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        title: "25+ New Tools Added",
        description: "Expanded the studio catalog with over 25 new helpers for photos, audio, documents, and writing.",
        icon: PackagePlus
      },
      {
        type: "ui",
        title: "Consistent Dark Theme",
        description: "Polished layout spacing, button sizing, and dark mode contrast across all screen sizes.",
        icon: Palette
      },
      {
        type: "fix",
        title: "Fixed Interface Glitches",
        description: "Resolved layout alignment issues and popup window buttons so everything works without sticking.",
        icon: CheckCircle2
      },
      {
        type: "sec",
        title: "Stronger Account Protection",
        description: "Added tighter safety measures and protected user data from unauthorized access.",
        icon: ShieldCheck
      }
    ]
  },
  {
    version: "v1.0.5",
    date: "July 2026",
    title: "Interactive Previews & Visual Upgrades",
    tagline: "Live tool previews, code formatters, ambient glass cards, and faster loading speeds.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        title: "Instant Tool Playground",
        description: "Test creative tools live right in your browser without waiting.",
        icon: Play
      },
      {
        type: "feature",
        title: "Code & Data Formatter",
        description: "Clean up and convert code formats in one click with clear visual previews.",
        icon: Code2
      },
      {
        type: "ui",
        title: "Ambient Glass Cards",
        description: "Redesigned tool cards with soft glowing borders and modern glass effects.",
        icon: Palette
      },
      {
        type: "ui",
        title: "Crisper Header Navigation",
        description: "Polished the top navigation bar with improved contrast and easier-to-read text.",
        icon: Layers
      },
      {
        type: "fix",
        title: "Accurate Credit Counter",
        description: "Fixed credit tracking so balances update right away when running multiple tools.",
        icon: CheckCircle2
      },
      {
        type: "fix",
        title: "Smooth Mobile Navigation",
        description: "Fixed mobile sidebar menus so they open and close reliably.",
        icon: Smartphone
      },
      {
        type: "perf",
        title: "24% Faster Page Speeds",
        description: "Reduced page weight so tools and workspaces load almost instantly.",
        icon: Zap
      }
    ]
  },
  {
    version: "v1.0.0",
    date: "July 2026",
    title: "Exismic Creative Studio Launch",
    tagline: "The foundation of the Exismic creative ecosystem.",
    isLatest: false,
    changes: [
      {
        type: "feature",
        title: "Official Launch of Exismic",
        description: "The first public release of our all-in-one creative studio for creators, students, and teams.",
        icon: Compass
      },
      {
        type: "ui",
        title: "Signature Dark Studio Design",
        description: "Established our sleek obsidian glass visual style across all core tools.",
        icon: Palette
      },
      {
        type: "feature",
        title: "Core Tool Collection & Pro Plans",
        description: "Released our initial set of creative tools and membership options.",
        icon: PackagePlus
      },
      {
        type: "fix",
        title: "Screen Sizing & Mobile Fit",
        description: "Made sure the workspace fits comfortably on every screen size from phone to ultra-wide.",
        icon: Smartphone
      }
    ]
  }
];

export default function ChangelogPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedVersion, setCopiedVersion] = useState<string | null>(null);

  // Compute counts for each category
  const counts = useMemo<{
    all: number;
    feature: number;
    ui: number;
    fix: number;
    sec: number;
    perf: number;
  }>(() => {
    let total = 0;
    const catCounts = {
      feature: 0,
      ui: 0,
      fix: 0,
      sec: 0,
      perf: 0
    };

    RELEASES.forEach((rel) => {
      rel.changes.forEach((c) => {
        total++;
        if (c.type in catCounts) {
          catCounts[c.type]++;
        }
      });
    });

    return { all: total, ...catCounts };
  }, []);

  const filterOptions = [
    { id: "all", label: "All", icon: History, count: counts.all },
    { id: "feature", label: "Features", icon: PackagePlus, count: counts.feature },
    { id: "ui", label: "Design", icon: Palette, count: counts.ui },
    { id: "fix", label: "Fixes", icon: CheckCircle2, count: counts.fix },
    { id: "sec", label: "Safety", icon: ShieldCheck, count: counts.sec },
    { id: "perf", label: "Speed", icon: Zap, count: counts.perf }
  ];

  const handleCopyLink = (version: string) => {
    const url = `${window.location.origin}/changelog#${version.replace(".", "-")}`;
    navigator.clipboard.writeText(url);
    setCopiedVersion(version);
    setTimeout(() => {
      setCopiedVersion(null);
    }, 2000);
  };

  const scrollToVersion = (version: string) => {
    const id = `release-${version.replace(".", "-")}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Filter releases and changes
  const filteredReleases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return RELEASES.map((rel) => {
      const matchingChanges = rel.changes.filter((c) => {
        const matchesCategory = activeFilter === "all" || c.type === activeFilter;
        if (!matchesCategory) return false;

        if (!q) return true;
        return (
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          rel.title.toLowerCase().includes(q) ||
          rel.version.toLowerCase().includes(q)
        );
      });

      return {
        ...rel,
        matchingChanges
      };
    }).filter((rel) => rel.matchingChanges.length > 0);
  }, [activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 pb-28">
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[340px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.12)_0%,rgba(6,182,212,0.05)_45%,transparent_70%)] pointer-events-none" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 relative z-10">
        {/* Breadcrumb */}
        <PageBreadcrumb items={[{ label: "Product Changelog" }]} />

        {/* Hero Header: Compact & Direct */}
        <header className="space-y-2 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-[11px] font-semibold text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Changelog</span>
            <span className="text-zinc-600">•</span>
            <span className="text-cyan-400 font-bold">Latest: {RELEASES[0]?.version || "v1.7"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit tracking-tight text-white leading-tight">
            What&apos;s{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
              New
            </span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
            Tracking every new feature, design improvement, and bug fix across Exismic.
          </p>
        </header>

        {/* Controls Bar: Search & Quick Jump */}
        <section className="space-y-3.5 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search updates (e.g. sign-in, mobile, speed)..."
                className="w-full bg-[#0a0d16] border border-white/10 focus:border-cyan-500/50 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Version Jump Chips */}
            <div className="flex flex-wrap items-center gap-1.5 py-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 shrink-0 mr-1 hidden sm:inline">
                Jump to:
              </span>
              {RELEASES.map((rel) => (
                <button
                  key={rel.version}
                  onClick={() => scrollToVersion(rel.version)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold font-outfit bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border border-white/5 transition-all shrink-0 cursor-pointer"
                >
                  {rel.version}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills with wrap to prevent clipping */}
          <div className="flex flex-wrap items-center gap-2 pb-2.5 border-b border-white/[0.06]">
            {filterOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = activeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setActiveFilter(opt.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                    isActive
                      ? "bg-purple-500/20 text-white border-purple-500/50 shadow-[0_0_16px_rgba(168,85,247,0.25)]"
                      : "bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-200"
                  }`}
                >
                  <Icon
                    size={13}
                    className={isActive ? "text-purple-300" : "text-zinc-500"}
                  />
                  <span>{opt.label}</span>
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold font-outfit ${
                      isActive
                        ? "bg-purple-500/30 text-purple-200"
                        : "bg-white/5 text-zinc-500"
                    }`}
                  >
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Timeline & Release Cards */}
        <section className="space-y-8 pt-2">
          {filteredReleases.length > 0 ? (
            filteredReleases.map((release, i) => {
              const anchorId = `release-${release.version.replace(".", "-")}`;
              const isCopied = copiedVersion === release.version;

              // Count types for summary
              const changeCount = release.matchingChanges.length;

              return (
                <motion.article
                  key={release.version}
                  id={anchorId}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.3) }}
                  className="relative group scroll-mt-24"
                >
                  {/* Outer subtle glow on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/15 via-cyan-500/10 to-purple-500/15 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Main Obsidian Card */}
                  <div className="relative rounded-2xl bg-[#090c16]/90 border border-white/[0.08] group-hover:border-white/[0.14] transition-all duration-300 backdrop-blur-xl p-5 sm:p-7 shadow-xl overflow-hidden">
                    {/* Corner accent glow */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/5 blur-[80px] pointer-events-none rounded-full" />

                    {/* Card Top Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2.5">
                        {/* Version Pill */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold font-outfit text-xs tracking-wide shadow-[0_0_12px_rgba(168,85,247,0.18)]">
                          <span>{release.version}</span>
                        </div>

                        {/* Latest Badge */}
                        {release.isLatest && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Latest Release
                          </span>
                        )}

                        {/* Release Date */}
                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                          <Calendar size={12} className="text-zinc-500" />
                          <span>{release.date}</span>
                        </span>
                      </div>

                      {/* Right Side Actions */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-zinc-500 hidden sm:inline">
                          {changeCount} {changeCount === 1 ? "update" : "updates"}
                        </span>

                        {/* Copy Link Button */}
                        <button
                          onClick={() => handleCopyLink(release.version)}
                          title="Copy link to this release"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-all cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Share</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Release Title & Summary */}
                    <div className="pt-4 pb-4 space-y-2">
                      <h2 className="text-xl sm:text-2xl font-bold font-outfit text-white tracking-tight">
                        {release.title}
                      </h2>
                      {release.tagline && (
                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal bg-white/[0.02] border border-white/[0.04] rounded-xl px-3.5 py-2.5">
                          {release.tagline}
                        </p>
                      )}
                    </div>

                    {/* Change Items List */}
                    <div className="space-y-2.5 pt-1">
                      <AnimatePresence mode="popLayout">
                        {release.matchingChanges.map((change, j) => {
                          const meta =
                            CATEGORY_META[change.type] || CATEGORY_META.feature;
                          const CategoryIcon = meta.icon;
                          const SpecificIcon = change.icon;

                          return (
                            <motion.div
                              key={`${change.title}-${j}`}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 8 }}
                              transition={{ delay: j * 0.03 }}
                              className="group/item flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-3.5 p-3 sm:p-3.5 rounded-xl bg-white/[0.015] hover:bg-white/[0.035] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-200"
                            >
                              {/* Left Meta Chips */}
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Category Badge */}
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${meta.badgeClass}`}
                                >
                                  <CategoryIcon size={11} />
                                  <span>{meta.label}</span>
                                </span>

                                {/* Context Specific Icon */}
                                <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-400 group-hover/item:text-cyan-300 transition-colors shrink-0">
                                  <SpecificIcon size={13} />
                                </div>
                              </div>

                              {/* Text Details */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xs sm:text-sm font-semibold text-white group-hover/item:text-cyan-200 transition-colors inline">
                                  {change.title}:
                                </h3>{" "}
                                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed inline font-normal">
                                  {change.description}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.article>
              );
            })
          ) : (
            /* Friendly Empty State */
            <div className="text-center py-16 px-6 rounded-2xl bg-[#090c16]/60 border border-white/[0.06] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-500">
                <Search size={20} />
              </div>
              <h3 className="text-base font-bold text-white">No updates found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No release notes match your search term &quot;{searchQuery}&quot; under the selected filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* Category-Reactive Cyber Laser Horizon Divider */}
        <div className="relative w-full max-w-3xl mx-auto my-12 pointer-events-none">
          {/* Laser Ambient Bloom */}
          <div className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent blur-sm" />
          {/* Laser Hairline */}
          <div className="relative h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
          {/* Specular Center Jewel */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#00ffff]" />
        </div>

        {/* Community Feedback Card: Zero Tech Jargon */}
        <section className="rounded-2xl bg-[#080b14]/90 border border-white/[0.08] p-5 sm:p-7 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <HelpCircle size={14} />
              <span>Community Ideas & Feedback</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Have an idea for our next release?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
              We release updates every week based on creator requests. Let us know what tools or improvements you want to see!
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.05] hover:bg-white/[0.09] text-zinc-300 hover:text-white border border-white/[0.08] transition-all"
            >
              Explore 117+ Tools
            </Link>
            <Link
              href="/feedback"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
            >
              <span>Share Feedback</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
