"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Session } from "@supabase/supabase-js";
import { 
  Sparkles, 
  Search, 
  Crown, 
  LogIn, 
  LayoutDashboard,
  MessageSquare,
  Code2,
  FolderOpen,
  Settings,
  LogOut,
  ChevronDown,
  BookOpen,
  CreditCard,
  Coins,
  Trophy,
  Gift,
  Check,
  Zap,
  Star,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  HelpCircle,
  LayoutGrid,
  Rocket,
  Flame,
  ShieldCheck
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";
import { useCredits } from "@/hooks/useCredits";
import { useQuests } from "@/hooks/useQuests";
import { isAdminEmail } from "@/lib/admin";
import dynamic from "next/dynamic";

const ManageSubscriptionModal = dynamic(
  () => import("../tool/ManageSubscriptionModal").then((mod) => mod.ManageSubscriptionModal),
  { ssr: false }
);

const CreditModal = dynamic(
  () => import("../ui/CreditModal").then((mod) => mod.CreditModal),
  { ssr: false }
);

const DailyQuestsModal = dynamic(
  () => import("../reward/DailyQuestsModal").then((mod) => mod.DailyQuestsModal),
  { ssr: false }
);

const DailyRewardModal = dynamic(
  () => import("../reward/DailyRewardModal").then((mod) => mod.DailyRewardModal),
  { ssr: false }
);

const RedeemPromoModal = dynamic(
  () => import("../modals/RedeemPromoModal").then((mod) => mod.RedeemPromoModal),
  { ssr: false }
);
import { ProBadge } from "../ui/ProBadge";
import { UserProfile } from "../ui/UserProfile";
import { AvatarWithFrame } from "../ui/AvatarWithFrame";
import { CreditTokenIcon } from "../ui/CreditTokenIcon";
import { PremiumName } from "../ui/PremiumName";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ExismicLogo } from "../ui/ExismicLogo";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isQuestsModalOpen, setIsQuestsModalOpen] = useState(false);
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hoveredNavTab, setHoveredNavTab] = useState<string | null>(null);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileUserDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  const { isPro, isLoading: isProLoading, user: dbUser, authUser, refresh: refreshPro } = usePro();
  const { credits, showUpsell, setShowUpsell, dailyStreak, todayClaim, countdown } = useCredits();
  const { unclaimedCount, completedCount, totalAvailable } = useQuests();
  const isAdmin = dbUser?.role === 'admin' || isAdminEmail(authUser?.email) || isAdminEmail(dbUser?.email);

  const [localFrameId, setLocalFrameId] = useState<string | null>(null);
  const [localGradientId, setLocalGradientId] = useState<string | null>(null);

  useEffect(() => {
    const frame = authUser?.user_metadata?.avatar_frame ?? dbUser?.avatar_frame ?? null;
    const gradient = authUser?.user_metadata?.name_gradient ?? dbUser?.name_gradient ?? null;
    setLocalFrameId(frame);
    setLocalGradientId(gradient);
  }, [authUser, dbUser]);

  useEffect(() => {
    const handleFrameUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setLocalFrameId(customEvent.detail);
    };
    const handleGradientUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setLocalGradientId(customEvent.detail);
    };
    window.addEventListener('avatar-frame-updated', handleFrameUpdate);
    window.addEventListener('name-gradient-updated', handleGradientUpdate);
    return () => {
      window.removeEventListener('avatar-frame-updated', handleFrameUpdate);
      window.removeEventListener('name-gradient-updated', handleGradientUpdate);
    };
  }, []);

  useEffect(() => {
    const handleScroll = (e?: Event) => {
      const el = document.getElementById("app-main-content");
      const targetScroll = (e?.target as HTMLElement)?.scrollTop;
      const scrollY = typeof targetScroll === "number" ? targetScroll : (el?.scrollTop || window.scrollY || 0);
      setScrolled(scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedDesktopProfile = userDropdownRef.current?.contains(target);
      const clickedMobileProfile = mobileUserDropdownRef.current?.contains(target);

      if (!clickedDesktopProfile && !clickedMobileProfile) {
        setUserDropdownOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on path change
  useEffect(() => {
    setToolsDropdownOpen(false);
    setUserDropdownOpen(false);
    setMobileNavOpen(false);
  }, [pathname]);

  const handleScrollTo = (sectionId: string) => {
    if (pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  const handleSearchClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch('/api/payments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (result.success) {
        await refreshPro();
        router.refresh();
      } else {
        alert(result.error || 'Failed to cancel subscription.');
      }
    } catch (error) {
      console.error('Cancel failed:', error);
      alert('An error occurred during cancellation.');
    } finally {
      setIsCancelling(false);
    }
  };

  type NavLink = { name: string; href: string; isDropdown?: boolean };

  const loggedInLinks: NavLink[] = [
    { name: "Dashboard", href: "/" },
    { name: "Tools", href: "#", isDropdown: true },
    { name: "AI Chat", href: "/chat" },
    { name: "Shop", href: "/shop" },
    { name: "Explore", href: "/tools" },
  ];

  const loggedOutLinks: NavLink[] = [
    { name: "Tools", href: "/tools" },
    { name: "Shop", href: "/shop" },
    { name: "Pricing", href: "/pro" },
    { name: "Blog", href: "/blog" },
  ];

  const navLinks = authUser ? loggedInLinks : loggedOutLinks;
  const fullName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || "Explorer";
  const avatarUrl = dbUser?.custom_avatar_url || authUser?.user_metadata?.avatar_url;

  const usageCount = dbUser?.aiGenerationsUsed ?? 0;
  const totalLimit = dbUser?.aiGenerationsLimit ?? 50;
  const progressPercent = Math.min((usageCount / totalLimit) * 100, 100);

  const getNavIcon = (name: string) => {
    switch (name) {
      case "Dashboard":
        return LayoutDashboard;
      case "Tools":
        return FolderOpen;
      case "Rewards":
        return Star;
      case "AI Chat":
        return MessageSquare;
      case "Shop":
        return Coins;
      case "Explore":
        return Sparkles;
      case "Pricing":
        return CreditCard;
      case "Blog":
        return BookOpen;
      default:
        return Sparkles;
    }
  };

  const isNavLinkActive = (link: NavLink) => {
    if (link.isDropdown) {
      const isSpecializedWorkspace =
        pathname.startsWith("/tools/ai/chat") ||
        pathname.startsWith("/chat");

      return toolsDropdownOpen ||
        pathname.startsWith("/category/") ||
        (pathname.startsWith("/tools/") && !isSpecializedWorkspace);
    }

    if (link.name === "AI Chat") {
      return pathname.startsWith("/chat") || pathname.startsWith("/tools/ai/chat");
    }

    if (link.name === "Explore") {
      return pathname === "/tools";
    }

    return pathname === link.href ||
      (link.href !== "/" && link.href !== "#" && pathname.startsWith(link.href));
  };

  return (
    <>
      <header 
        className={cn(
          "relative w-full z-40 transition-all duration-500 border-b",
          scrolled 
            ? "bg-[#030308]/85 backdrop-blur-2xl border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.7)] h-16" 
            : "bg-transparent border-transparent h-16 sm:h-20"
        )}
      >
        {/* Subtle Ambient Overhead Glow on Landing / Public pages */}
        <div 
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-6 h-20 bg-gradient-to-b from-purple-600/10 via-cyan-500/5 to-transparent blur-2xl"
        />

        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
          
          {/* Desktop Left: Exismic Brand Logo for visitors VS Search Bar & Notification for logged-in users */}
          {!authUser ? (
            <div className="relative z-50 hidden md:flex items-center gap-3 shrink-0">
              <ExismicLogo size={34} showText={true} logoLink={true} />
            </div>
          ) : (
            <div className="relative z-50 hidden md:flex items-center gap-3 shrink-0">
              {/* Tool Search Bar on Left */}
              <button
                type="button"
                onClick={handleSearchClick}
                className="group/search relative flex h-10 w-[clamp(300px,26vw,420px)] cursor-pointer items-center rounded-2xl p-[1px] select-none isolate transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-[0_8px_25px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.12)] hover:shadow-[0_12px_32px_rgba(6,182,212,0.25),0_0_25px_rgba(139,92,246,0.2)] notranslate text-left"
                title="Search tools, commands, AI models... (Ctrl + K)"
                aria-label="Open tool search and command palette"
                translate="no"
              >
                {/* Radiant Ambient Aura */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500/30 via-purple-500/25 to-indigo-500/30 opacity-50 blur-[6px] transition-all duration-300 group-hover/search:opacity-100 group-hover/search:blur-[10px]"
                />

                {/* Metallic Prismatic Border Rim */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-cyan-400/40 via-purple-500/30 to-indigo-400/40 group-hover/search:from-cyan-300 group-hover/search:via-purple-400 group-hover/search:to-cyan-400 transition-all duration-300"
                />

                {/* Glassmorphic Obsidian Core */}
                <div className="relative flex h-full w-full items-center gap-2.5 overflow-hidden rounded-2xl px-3 bg-gradient-to-r from-[#060814]/98 via-[#0a0d22]/95 to-[#070918]/98 border border-white/[0.08] group-hover/search:border-cyan-400/40 backdrop-blur-2xl transition-all duration-300">
                  {/* Top Ambient Prismatic Hairline */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent"
                  />

                  {/* Left Icon Pill */}
                  <div className="relative flex items-center justify-center shrink-0">
                    <div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/15 to-purple-500/20 border border-cyan-400/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)] group-hover/search:border-cyan-300 group-hover/search:shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover/search:scale-105 transition-all duration-300">
                      <Search size={13} className="text-cyan-200 drop-shadow-[0_0_5px_rgba(34,211,238,1)] transition-all duration-300" />
                    </div>
                  </div>

                  {/* Placeholder Label */}
                  <span className="relative z-10 min-w-0 flex-1 text-[12.5px] font-medium text-zinc-400 group-hover/search:text-zinc-200 transition-colors tracking-normal whitespace-nowrap overflow-hidden text-ellipsis">
                    Search tools, commands...
                  </span>

                  {/* Keyboard Shortcut Badge */}
                  <kbd className="relative hidden h-6 shrink-0 items-center gap-1 rounded-lg border border-white/[0.1] bg-[#0c0e1e]/90 px-2 text-[10px] font-mono font-bold text-zinc-400 group-hover/search:border-cyan-400/40 group-hover/search:text-cyan-200 group-hover/search:bg-cyan-500/[0.08] lg:flex shadow-xs notranslate transition-colors" translate="no">
                    Ctrl K
                  </kbd>
                </div>
              </button>

              {/* Notification Icon on Left */}
              <NotificationsDropdown />
            </div>
          )}

          {/* Desktop Center: Floating Obsidian Glass Capsule for landing page visitors */}
          {!authUser ? (
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center z-50">
              <div className="relative group/navisland">
                {/* Subtle Ambient Backlight Glow */}
                <div 
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600/15 via-cyan-500/15 to-purple-600/15 opacity-0 group-hover/navisland:opacity-100 blur-xl transition-opacity duration-500"
                />

                {/* Main Glassmorphic Capsule */}
                <nav 
                  className="relative flex items-center gap-1 p-1 rounded-full border border-white/[0.08] bg-[#080914]/85 hover:border-white/15 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 select-none"
                  onMouseLeave={() => setHoveredNavTab(null)}
                >
                  {/* Subtle Top Hairline Highlight */}
                  <div 
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  />

                  {/* 1. Tools */}
                  <Link 
                    href="/tools" 
                    onMouseEnter={() => setHoveredNavTab("tools")}
                    className={cn(
                      "group/item relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 select-none z-10",
                      pathname === "/tools" ? "text-white" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {(hoveredNavTab === "tools" || (pathname === "/tools" && !hoveredNavTab)) && (
                      <motion.div
                        layoutId="navPillHighlight"
                        className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <LayoutGrid size={14} className={cn(
                      "transition-colors duration-200",
                      pathname === "/tools" || hoveredNavTab === "tools" ? "text-purple-300" : "text-zinc-400 group-hover/item:text-purple-300"
                    )} />
                    <span className="relative z-10">Tools</span>
                  </Link>

                  {/* 2. Featured */}
                  <button 
                    type="button"
                    onClick={() => handleScrollTo("explore")}
                    onMouseEnter={() => setHoveredNavTab("featured")}
                    className="group/item relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-zinc-400 hover:text-white transition-all duration-200 select-none z-10 cursor-pointer"
                  >
                    {hoveredNavTab === "featured" && (
                      <motion.div
                        layoutId="navPillHighlight"
                        className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Zap size={14} className={cn(
                      "transition-colors duration-200",
                      hoveredNavTab === "featured" ? "text-cyan-300" : "text-zinc-400 group-hover/item:text-cyan-300"
                    )} />
                    <span className="relative z-10">Featured</span>
                  </button>

                  {/* 3. Pro */}
                  <Link 
                    href="/pro" 
                    onMouseEnter={() => setHoveredNavTab("pro")}
                    className={cn(
                      "group/pro relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 select-none z-10",
                      pathname === "/pro" ? "text-amber-200" : "text-zinc-400 hover:text-amber-200"
                    )}
                  >
                    {(hoveredNavTab === "pro" || (pathname === "/pro" && !hoveredNavTab)) && (
                      <motion.div
                        layoutId="navPillHighlight"
                        className="absolute inset-0 rounded-full bg-amber-400/[0.08] border border-amber-400/20 shadow-[0_2px_12px_rgba(245,158,11,0.15)]"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Crown size={14} className={cn(
                      "transition-colors duration-200",
                      pathname === "/pro" || hoveredNavTab === "pro" ? "text-amber-300" : "text-zinc-400 group-hover/pro:text-amber-300"
                    )} />
                    <span className="relative z-10">Pro</span>
                    <span className="relative z-10 px-1.5 py-0.2 rounded-md bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold text-[9px] tracking-wider">
                      10X
                    </span>
                  </Link>

                  {/* 4. FAQ */}
                  <button 
                    type="button"
                    onClick={() => handleScrollTo("faq")}
                    onMouseEnter={() => setHoveredNavTab("faq")}
                    className="group/item relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-zinc-400 hover:text-white transition-all duration-200 select-none z-10 cursor-pointer"
                  >
                    {hoveredNavTab === "faq" && (
                      <motion.div
                        layoutId="navPillHighlight"
                        className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <HelpCircle size={14} className={cn(
                      "transition-colors duration-200",
                      hoveredNavTab === "faq" ? "text-zinc-200" : "text-zinc-400 group-hover/item:text-zinc-200"
                    )} />
                    <span className="relative z-10">FAQ</span>
                  </button>
                </nav>
              </div>
            </div>
          ) : null}

          {/* Navigation remains available in the mobile drawer. */}
          <div className="hidden">
            <nav className="group/nav relative hidden h-14 items-center gap-1 overflow-visible rounded-[18px] border border-white/[0.09] bg-[#07070c]/88 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-2xl md:flex">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_18%_-35%,rgba(168,85,247,0.18),transparent_43%),radial-gradient(circle_at_82%_135%,rgba(34,211,238,0.11),transparent_42%)]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-0 h-px overflow-hidden"
              >
                <motion.span
                  className="absolute inset-y-0 w-20 bg-linear-to-r from-transparent via-fuchsia-400 to-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.72)]"
                  animate={{ x: ["-120%", "560%"] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.4 }}
                />
              </span>

              {navLinks.map((link) => {
                const isActive = isNavLinkActive(link);
                const NavIcon = getNavIcon(link.name);
                
                if (link.isDropdown) {
                  return (
                    <div key={link.name} className="relative" ref={toolsDropdownRef}>
                      <button 
                        onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                        aria-expanded={toolsDropdownOpen}
                        aria-haspopup="menu"
                        className={cn(
                          "group/item relative flex h-11 min-w-11 items-center justify-center gap-2 overflow-hidden rounded-xl px-3 text-[10px] font-black uppercase tracking-[0.13em] transition-all duration-300 xl:px-4",
                          isActive ? "text-white" : "text-zinc-400 hover:bg-white/[0.045] hover:text-white"
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="activeNavIndicator"
                            className="absolute inset-0 rounded-xl border border-white/[0.13] bg-[linear-gradient(135deg,rgba(168,85,247,0.17),rgba(10,10,16,0.88)_54%,rgba(34,211,238,0.12))] shadow-[0_7px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className={cn(
                          "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-300",
                          isActive
                            ? "border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.12)]"
                            : "border-white/[0.07] bg-white/[0.025] text-zinc-500 group-hover/item:border-purple-400/20 group-hover/item:text-purple-200"
                        )}>
                          <NavIcon size={14} strokeWidth={2.2} />
                        </span>
                        <span className="relative z-10 whitespace-nowrap">{link.name}</span>
                        <ChevronDown
                          size={12}
                          className={cn("relative z-10 text-zinc-600 transition-all duration-300 group-hover/item:text-zinc-300", toolsDropdownOpen && "rotate-180 text-cyan-200")}
                        />
                      </button>

                      {/* Tools Dropdown Menu */}
                      <AnimatePresence>
                        {toolsDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className="absolute left-1/2 -translate-x-1/2 mt-4 w-[560px] bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] z-50 p-6 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-350"
                          >
                            <div className="space-y-4">
                              <div className="text-[10px] font-black tracking-widest text-accent-purple uppercase pl-2">Creative AI Suite</div>
                              <div className="space-y-1">
                                <Link href="/tools/ai/img-gen" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group">
                                  <div className="w-9 h-9 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple group-hover:bg-accent-purple group-hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                                    <Sparkles size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-white italic">AI Image Generator</div>
                                    <div className="text-[10px] text-zinc-500 line-clamp-1">Create stunning 4K AI art</div>
                                  </div>
                                </Link>
                                <Link href="/tools/image/eraser" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group">
                                  <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan group-hover:bg-accent-cyan group-hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                    <FolderOpen size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-white italic">Background Remover</div>
                                    <div className="text-[10px] text-zinc-500 line-clamp-1">Remove backgrounds in one click</div>
                                  </div>
                                </Link>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="text-[10px] font-black tracking-widest text-accent-cyan uppercase pl-2">Developer Tools</div>
                              <div className="space-y-1">
                                <Link href="/tools/developer/json-to-types" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group">
                                  <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan group-hover:bg-accent-cyan group-hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                    <Code2 size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-white italic">JSON to Types</div>
                                    <div className="text-[10px] text-zinc-500 line-clamp-1">TypeScript & interface generator</div>
                                  </div>
                                </Link>
                                <Link href="/chat" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group">
                                  <div className="w-9 h-9 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple group-hover:bg-accent-purple group-hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                                    <MessageSquare size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-white italic">AI Assistant Chat</div>
                                    <div className="text-[10px] text-zinc-500 line-clamp-1">Multi-model interactive chat</div>
                                  </div>
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={cn(
                      "group/item relative flex h-11 min-w-11 items-center justify-center gap-2 overflow-hidden rounded-xl px-3 text-[10px] font-black uppercase tracking-[0.13em] transition-all duration-300 xl:px-4",
                      isActive ? "text-white" : "text-zinc-400 hover:bg-white/[0.045] hover:text-white"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 rounded-xl border border-white/[0.13] bg-[linear-gradient(135deg,rgba(168,85,247,0.17),rgba(10,10,16,0.88)_54%,rgba(34,211,238,0.12))] shadow-[0_7px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className={cn(
                      "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-300",
                      isActive
                        ? "border-purple-300/25 bg-purple-300/[0.08] text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.13)]"
                        : "border-white/[0.07] bg-white/[0.025] text-zinc-500 group-hover/item:border-cyan-300/20 group-hover/item:text-cyan-200"
                    )}>
                      <NavIcon size={14} strokeWidth={2.2} />
                    </span>
                    <span className="relative z-10 whitespace-nowrap">{link.name}</span>
                    {isActive && (
                      <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_9px_rgba(103,232,249,0.9)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Search, Credits, Pro Badge, Profile */}
          <div className="hidden md:flex items-center gap-4 relative z-50">
            {authUser ? (
              <div className="flex items-center gap-3">
                {/* 1. Ultra Luxury Cyber Credit Vault Pill */}
                <Link
                  href="/shop"
                  title="Open Credit Shop Vault & Claim Daily Bonus"
                  className={cn(
                    "group/vault relative flex h-10 cursor-pointer items-center rounded-full p-[1px] select-none isolate transition-all duration-500 hover:scale-[1.03] active:scale-95 touch-manipulation notranslate",
                    "shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.18)] hover:shadow-[0_15px_45px_rgba(6,182,212,0.45),0_0_30px_rgba(99,102,241,0.35)]"
                  )}
                  translate="no"
                >
                  {/* Radiant Cyber-Cyan/Indigo Outer Halo Glow */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/40 via-sky-400/50 to-indigo-600/40 opacity-70 blur-[3px] group-hover/vault:opacity-100 group-hover/vault:blur-[6px] transition-all duration-500 pointer-events-none"
                  />

                  {/* Substantial Metallic Outer Border Rim with Revolving Laser Beam */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full p-[1.5px] overflow-hidden pointer-events-none transition-all duration-300"
                  >
                    {/* Rich Solid Metallic Gradient Base */}
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/60 via-sky-300/80 to-indigo-400/60 group-hover/vault:from-cyan-300 group-hover/vault:via-white group-hover/vault:to-indigo-300 transition-all duration-300" />

                    {/* Revolving Orbiting Laser Comet (AFK / Idle) */}
                    <span className="absolute inset-[-140px] m-auto h-[280px] w-[280px] aspect-square animate-border-orbit opacity-100 mix-blend-screen bg-[conic-gradient(from_0deg,transparent_0_270deg,rgba(6,182,212,0.5)_300deg,#38bdf8_330deg,#ffffff_355deg,transparent_360deg)]" />
                    <span className="absolute inset-[-140px] m-auto h-[280px] w-[280px] aspect-square animate-border-orbit blur-[3px] opacity-90 mix-blend-screen bg-[conic-gradient(from_0deg,transparent_0_260deg,#06b6d4_300deg,#67e8f9_335deg,#ffffff_355deg,transparent_360deg)]" />
                  </span>

                  {/* Glassmorphic Cyber-Obsidian Core */}
                  <div className="relative z-10 flex h-full items-center gap-2.5 overflow-hidden rounded-full pl-2 pr-3.5 bg-gradient-to-r from-[#060814]/95 via-[#0b1026]/95 to-[#080718]/95 border border-cyan-400/30 group-hover/vault:border-cyan-300/60 backdrop-blur-2xl transition-all duration-300">
                    {/* Ambient Radial Lighting & Sheen Reflection */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_20%_50%,rgba(6,182,212,0.25),transparent_48%),radial-gradient(circle_at_85%_50%,rgba(99,102,241,0.18),transparent_42%)]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-12 w-12 skew-x-[-22deg] bg-gradient-to-r from-transparent via-cyan-100/30 to-transparent blur-[1px] transition-transform duration-1000 group-hover/vault:translate-x-56"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 inset-x-3 h-[1px] bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent"
                    />

                    {/* Exismic Credit Token Emblem */}
                    <CreditTokenIcon size="sm" />

                    {/* Bold Radiant Numbers */}
                    <span
                      suppressHydrationWarning
                      className="relative z-10 font-sans text-[13px] font-black tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-200 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] group-hover/vault:drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] transition-all notranslate"
                      translate="no"
                    >
                      {credits.toLocaleString()}
                    </span>

                    {/* Luxury Embossed Typography */}
                    <span className="relative z-10 font-sans text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] group-hover/vault:from-white group-hover/vault:via-cyan-100 group-hover/vault:to-sky-200 transition-all">
                      VAULT
                    </span>

                    {/* Dynamic Interactive Arrow */}
                    <ChevronRight
                      size={13}
                      className="relative z-10 text-cyan-400/60 transition-transform duration-200 group-hover/vault:translate-x-0.5 group-hover/vault:text-cyan-200 group-hover/vault:drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                    />
                  </div>
                </Link>

                {/* 1.5. Daily Mystery Vault & Streak Pill */}
                <button
                  type="button"
                  onClick={() => setIsDailyRewardOpen(true)}
                  title={
                    !todayClaim
                      ? `Daily Mystery Vault READY! ${dailyStreak || 0}d streak · Click to unlock free drop`
                      : `Daily Streak: ${dailyStreak || 0}d · Next drop resets in ${countdown || "12:00:00"}`
                  }
                  className={cn(
                    "group/daily relative flex h-10 cursor-pointer items-center rounded-full p-[1px] select-none isolate transition-all duration-500 hover:scale-[1.03] active:scale-95 touch-manipulation notranslate",
                    !todayClaim
                      ? "shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_22px_rgba(249,115,22,0.45)] hover:shadow-[0_15px_45px_rgba(249,115,22,0.7),0_0_30px_rgba(234,88,12,0.5)]"
                      : "shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_16px_rgba(245,158,11,0.18)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.35)]"
                  )}
                  translate="no"
                >
                  {/* Radiant Flame/Amber Outer Halo Glow */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-0 rounded-full transition-all duration-500 pointer-events-none",
                      !todayClaim
                        ? "bg-gradient-to-r from-orange-500/70 via-amber-400/80 to-red-500/70 opacity-90 blur-[4px] animate-pulse"
                        : "bg-gradient-to-r from-orange-500/40 via-amber-400/45 to-yellow-500/40 opacity-70 blur-[3px] group-hover/daily:opacity-95 group-hover/daily:blur-[5px]"
                    )}
                  />

                  {/* Substantial Metallic Outer Border Rim with Revolving Laser Beam */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full p-[1.5px] overflow-hidden pointer-events-none transition-all duration-300"
                  >
                    {/* Rich Solid Metallic Gradient Base */}
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full transition-all duration-300",
                        !todayClaim
                          ? "bg-gradient-to-r from-orange-400 via-amber-200 to-orange-400"
                          : "bg-gradient-to-r from-orange-500/60 via-amber-400/70 to-yellow-600/60 group-hover/daily:from-orange-400 group-hover/daily:via-amber-300 group-hover/daily:to-orange-500"
                      )}
                    />

                    {/* Revolving Orbiting Laser Comet (AFK / Idle) */}
                    <span
                      className={cn(
                        "absolute inset-[-140px] m-auto h-[280px] w-[280px] aspect-square opacity-100 mix-blend-screen bg-[conic-gradient(from_0deg,transparent_0_270deg,rgba(234,88,12,0.5)_300deg,#f59e0b_330deg,#ffffff_355deg,transparent_360deg)]",
                        !todayClaim ? "animate-border-orbit-fast" : "animate-border-orbit"
                      )}
                    />
                    <span
                      className={cn(
                        "absolute inset-[-140px] m-auto h-[280px] w-[280px] aspect-square blur-[3px] opacity-90 mix-blend-screen bg-[conic-gradient(from_0deg,transparent_0_260deg,#ea580c_300deg,#fbbf24_335deg,#ffffff_355deg,transparent_360deg)]",
                        !todayClaim ? "animate-border-orbit-fast" : "animate-border-orbit"
                      )}
                    />
                  </span>

                  {/* Glassmorphic Cyber-Obsidian Core */}
                  <div
                    className={cn(
                      "relative z-10 flex h-full items-center gap-2 overflow-hidden rounded-full pl-2 pr-3.5 backdrop-blur-2xl border transition-all duration-300",
                      !todayClaim
                        ? "bg-gradient-to-r from-[#180b03]/95 via-[#1a0e05]/95 to-[#120703]/95 border-orange-400/50 group-hover/daily:border-orange-300/80"
                        : "bg-gradient-to-r from-[#0c0704]/95 via-[#100b07]/95 to-[#0b0705]/95 border-orange-500/30 group-hover/daily:border-orange-400/60 group-hover/daily:bg-[#140c06]/95"
                    )}
                  >
                    {/* Ambient Radial Lighting & Sheen Reflection */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_20%_50%,rgba(249,115,22,0.25),transparent_48%),radial-gradient(circle_at_85%_50%,rgba(234,88,12,0.18),transparent_42%)]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-12 w-12 skew-x-[-22deg] bg-gradient-to-r from-transparent via-amber-100/30 to-transparent blur-[1px] transition-transform duration-1000 group-hover/daily:translate-x-56"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 inset-x-3 h-[1px] bg-gradient-to-r from-transparent via-amber-200/40 to-transparent"
                    />

                    {/* Flame Emblem */}
                    <div className="relative flex items-center justify-center shrink-0">
                      <div
                        className={cn(
                          "relative flex items-center justify-center h-6 w-6 rounded-lg transition-all duration-300 group-hover/daily:scale-110",
                          !todayClaim
                            ? "bg-gradient-to-b from-orange-500/40 via-amber-500/30 to-red-600/30 border border-orange-400/80 shadow-[0_0_12px_rgba(249,115,22,0.7),inset_0_1px_2px_rgba(255,255,255,0.6)]"
                            : "bg-gradient-to-b from-orange-500/25 via-amber-500/15 to-stone-900/30 border border-orange-400/40 shadow-[0_0_8px_rgba(249,115,22,0.3)]"
                        )}
                      >
                        <Flame
                          size={13}
                          className={cn(
                            "transition-all duration-300",
                            !todayClaim
                              ? "text-orange-200 fill-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,1)] animate-bounce"
                              : "text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]"
                          )}
                        />
                      </div>

                      {/* Floating Ping Beacon if unclaimed */}
                      {!todayClaim && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-90"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300 shadow-[0_0_6px_rgba(249,115,22,1)]"></span>
                        </span>
                      )}
                    </div>

                    {/* Streak Number */}
                    <span
                      suppressHydrationWarning
                      className="relative z-10 font-sans text-[12.5px] font-black tracking-tight bg-gradient-to-b from-white via-amber-100 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] notranslate"
                      translate="no"
                    >
                      {dailyStreak ?? 0}d
                    </span>

                    {/* Luxury Embossed Typography */}
                    <span className="relative z-10 font-sans text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-orange-200 via-amber-100 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] transition-all">
                      STREAK
                    </span>

                    {/* Dynamic Status / Call to Action */}
                    {!todayClaim ? (
                      <span className="relative z-10 flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 text-black font-black text-[8.5px] tracking-wider shadow-[0_0_12px_rgba(249,115,22,0.9)] animate-pulse shrink-0">
                        <Gift size={9} className="shrink-0 text-black fill-black/20" />
                        CLAIM
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-400/25 text-[8.5px] font-bold tabular-nums text-orange-200/85 shrink-0 group-hover/daily:text-orange-100 transition-all font-mono">
                        {countdown || "ACTIVE"}
                      </span>
                    )}
                  </div>
                </button>

                {/* 2. Ultra Premium Quests & Challenges Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsQuestsModalOpen(true)}
                  title={
                    unclaimedCount > 0
                      ? `${unclaimedCount} quest reward${unclaimedCount > 1 ? "s" : ""} ready to claim!`
                      : "Quests & Rewards (Daily & Weekly)"
                  }
                  className={cn(
                    "group/quests relative flex h-10 cursor-pointer items-center rounded-full p-[1px] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.15)] transition-all duration-500 hover:scale-[1.03] active:scale-95 touch-manipulation notranslate",
                    unclaimedCount > 0
                      ? "hover:shadow-[0_15px_45px_rgba(245,158,11,0.45),0_0_30px_rgba(251,191,36,0.35)]"
                      : "hover:shadow-[0_15px_40px_rgba(245,158,11,0.3),0_0_25px_rgba(251,191,36,0.2)]"
                  )}
                  translate="no"
                >
                  {/* Glowing Radiant Amber/Gold Halo */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-0 rounded-full transition-all duration-500 pointer-events-none",
                      unclaimedCount > 0
                        ? "bg-gradient-to-r from-amber-500/70 via-yellow-400/80 to-amber-600/70 opacity-90 blur-[4px] animate-pulse"
                        : "bg-gradient-to-r from-amber-500/40 via-yellow-400/45 to-orange-500/40 opacity-70 blur-[3px] group-hover/quests:opacity-95 group-hover/quests:blur-[5px]"
                    )}
                  />

                  {/* Substantial Metallic Outer Border Rim with Revolving Laser Beam */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full p-[1.5px] overflow-hidden pointer-events-none transition-all duration-300"
                  >
                    {/* Rich Solid Metallic Gradient Base */}
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full transition-all duration-300",
                        unclaimedCount > 0
                          ? "bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400"
                          : "bg-gradient-to-r from-amber-500/60 via-yellow-400/70 to-amber-600/60 group-hover/quests:from-amber-400 group-hover/quests:via-yellow-300 group-hover/quests:to-amber-500"
                      )}
                    />

                    {/* Revolving Orbiting Laser Comet (AFK / Idle) */}
                    <span
                      className={cn(
                        "absolute inset-[-140px] m-auto h-[280px] w-[280px] aspect-square opacity-100 mix-blend-screen bg-[conic-gradient(from_0deg,transparent_0_270deg,rgba(217,119,6,0.5)_300deg,#facc15_330deg,#ffffff_355deg,transparent_360deg)]",
                        unclaimedCount > 0 ? "animate-border-orbit-fast" : "animate-border-orbit-slow"
                      )}
                    />
                    <span
                      className={cn(
                        "absolute inset-[-140px] m-auto h-[280px] w-[280px] aspect-square blur-[3px] opacity-90 mix-blend-screen bg-[conic-gradient(from_0deg,transparent_0_260deg,#d97706_300deg,#fde047_335deg,#ffffff_355deg,transparent_360deg)]",
                        unclaimedCount > 0 ? "animate-border-orbit-fast" : "animate-border-orbit-slow"
                      )}
                    />
                  </span>

                  {/* Glassmorphic Luxury Obsidian Core */}
                  <div
                    className={cn(
                      "relative z-10 flex h-full items-center gap-2 overflow-hidden rounded-full pl-2 pr-3.5 backdrop-blur-2xl border transition-all duration-300",
                      unclaimedCount > 0
                        ? "bg-gradient-to-r from-[#170e05]/95 via-[#1a1106]/95 to-[#120917]/95 border-amber-400/50 group-hover/quests:border-amber-300/80"
                        : "bg-gradient-to-r from-[#09070f]/95 via-[#0e0a14]/95 to-[#0b0810]/95 border-amber-400/30 group-hover/quests:border-amber-300/60 group-hover/quests:bg-[#120e1a]/95"
                    )}
                  >
                    {/* Ambient Radial Lighting & Sheen Reflection */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_20%_50%,rgba(245,158,11,0.22),transparent_45%),radial-gradient(circle_at_85%_50%,rgba(251,191,36,0.15),transparent_40%)]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-12 w-12 skew-x-[-22deg] bg-gradient-to-r from-transparent via-amber-100/30 to-transparent blur-[1px] transition-transform duration-1000 group-hover/quests:translate-x-56"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 inset-x-3 h-[1px] bg-gradient-to-r from-transparent via-amber-200/40 to-transparent"
                    />

                    {/* Golden Trophy Jewel Emblem */}
                    <div className="relative flex items-center justify-center shrink-0">
                      <div
                        className={cn(
                          "relative flex items-center justify-center h-6 w-6 rounded-lg transition-all duration-300 group-hover/quests:scale-110",
                          unclaimedCount > 0
                            ? "bg-gradient-to-b from-amber-400/40 via-yellow-500/30 to-amber-600/30 border border-amber-300/80 shadow-[0_0_12px_rgba(251,191,36,0.7),inset_0_1px_2px_rgba(255,255,255,0.6)]"
                            : "bg-gradient-to-b from-amber-400/25 via-amber-500/15 to-amber-900/30 border border-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] group-hover/quests:border-amber-300/70 group-hover/quests:shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                        )}
                      >
                        <Trophy
                          size={13}
                          className={cn(
                            "transition-all duration-300",
                            unclaimedCount > 0
                              ? "text-yellow-200 drop-shadow-[0_0_6px_rgba(251,191,36,1)] animate-bounce"
                              : "text-amber-300 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)] group-hover/quests:text-yellow-200 group-hover/quests:drop-shadow-[0_0_8px_rgba(251,191,36,1)]"
                          )}
                        />
                      </div>

                      {/* Floating Radiant Ping Beacon */}
                      {unclaimedCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-90"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-300 shadow-[0_0_6px_rgba(251,191,36,1)]"></span>
                        </span>
                      )}
                    </div>

                    {/* Luxury Embossed Typography */}
                    <span className="relative z-10 font-sans text-[10.5px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] group-hover/quests:from-white group-hover/quests:via-yellow-100 group-hover/quests:to-amber-200 transition-all">
                      QUESTS
                    </span>

                    {/* Dynamic Status / Rewards Badge */}
                    {unclaimedCount > 0 ? (
                      <span className="relative z-10 flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-[8.5px] tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse shrink-0">
                        <Gift size={9.5} className="shrink-0 text-amber-950" />
                        +{unclaimedCount}
                      </span>
                    ) : completedCount === totalAvailable && totalAvailable > 0 ? (
                      <span className="relative z-10 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[8.5px] font-black tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.3)] shrink-0">
                        <Check size={9} strokeWidth={3} />
                        ALL
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center px-1.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-[8.5px] font-bold tabular-nums text-amber-200/85 shrink-0 group-hover/quests:text-amber-100 group-hover/quests:border-amber-400/40 group-hover/quests:bg-amber-400/15 transition-all">
                        {completedCount}/{totalAvailable}
                      </span>
                    )}
                  </div>
                </button>

                {/* 3. User Avatar and Custom Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={cn(
                      "relative rounded-full transition-all duration-500 flex items-center justify-center active:scale-95",
                      userDropdownOpen ? "scale-105" : "hover:scale-105"
                    )}
                  >
                    <AvatarWithFrame 
                      avatarUrl={avatarUrl}
                      displayName={fullName}
                      isPro={isPro}
                      frameId={localFrameId || undefined}
                      size="sm"
                    />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="absolute right-0 mt-2 w-[340px] max-h-[calc(100vh-5.5rem)] bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-[2.25rem] shadow-[0_40px_80px_rgba(0,0,0,0.85)] z-50 overflow-hidden flex flex-col"
                      >
                        {/* Scrollable Main Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
                          {/* Profile Header */}
                          <UserProfile 
                            fullName={fullName} 
                            email={authUser?.email} 
                            avatarUrl={avatarUrl} 
                            isPro={isPro} 
                            frameId={localFrameId || undefined}
                            gradientId={localGradientId}
                            variant="menu-header" 
                          />

                          <div className="px-5 pb-4 space-y-4">
                            {/* Usage Progress Tracker */}
                            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-zinc-500">
                                <span>AI Generations</span>
                                <span className="text-white">{usageCount} / {totalLimit}</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-linear-to-r from-accent-purple to-accent-cyan rounded-full"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Navigation Actions */}
                            <div className="space-y-1">
                              <button
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  setIsDailyRewardOpen(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-orange-200 hover:text-white bg-gradient-to-r from-orange-500/[0.08] to-transparent hover:from-orange-500/20 hover:to-orange-500/5 border border-orange-400/20 hover:border-orange-400/40 transition-all text-xs font-black uppercase tracking-wider text-left group/dropvault shadow-[0_0_15px_rgba(249,115,22,0.06)] hover:shadow-[0_0_25px_rgba(249,115,22,0.2)]"
                              >
                                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-400/40 text-orange-300 group-hover/dropvault:scale-110 transition-transform shrink-0">
                                  <Flame size={13} className="text-orange-300 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
                                </div>
                                <span className="font-sans font-black tracking-wider bg-gradient-to-r from-orange-100 to-amber-300 bg-clip-text text-transparent">Daily Mystery Vault</span>
                                {!todayClaim ? (
                                  <span className="ml-auto text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-300 text-black shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse font-mono flex items-center gap-1">
                                    <Gift size={9} className="shrink-0 text-black fill-black/20" />
                                    CLAIM DROP
                                  </span>
                                ) : (
                                  <span className="ml-auto text-[8.5px] font-black uppercase px-2 py-0.5 rounded bg-orange-400/15 text-orange-300 border border-orange-400/25">
                                    {dailyStreak}D STREAK
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  setIsQuestsModalOpen(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-amber-200 hover:text-white bg-gradient-to-r from-amber-500/[0.08] to-transparent hover:from-amber-500/20 hover:to-amber-500/5 border border-amber-400/20 hover:border-amber-400/40 transition-all text-xs font-black uppercase tracking-wider text-left group/dropquest shadow-[0_0_15px_rgba(245,158,11,0.06)] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]"
                              >
                                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 group-hover/dropquest:scale-110 transition-transform shrink-0">
                                  <Trophy size={13} className="text-amber-300 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
                                </div>
                                <span className="font-sans font-black tracking-wider bg-gradient-to-r from-amber-100 to-amber-300 bg-clip-text text-transparent">Daily Quests</span>
                                {unclaimedCount > 0 ? (
                                  <span className="ml-auto text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-pulse font-mono flex items-center gap-1">
                                    <Trophy size={9} className="shrink-0 text-amber-950" />
                                    +{unclaimedCount} CLAIM
                                  </span>
                                ) : completedCount === totalAvailable && totalAvailable > 0 ? (
                                  <span className="ml-auto text-[8.5px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    COMPLETED
                                  </span>
                                ) : (
                                  <span className="ml-auto text-[8.5px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/25">
                                    {completedCount}/{totalAvailable}
                                  </span>
                                )}
                              </button>
                              <Link href="/shop" onClick={() => setUserDropdownOpen(false)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-amber-300 hover:text-white hover:bg-amber-400/10 transition-all text-xs font-black uppercase tracking-wider">
                                <Coins size={14} className="text-amber-400" />
                                <span>Credit Shop Vault</span>
                                <span className="ml-auto text-[8px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">SHOP</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  setIsRedeemModalOpen(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-amber-300 hover:text-white hover:bg-amber-400/10 transition-all text-xs font-black uppercase tracking-wider text-left"
                              >
                                <Gift size={14} className="text-amber-400" />
                                <span>Redeem Code / Voucher</span>
                                <span className="ml-auto text-[8px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">REDEEM</span>
                              </button>
                              <Link href="/account/settings" onClick={() => setUserDropdownOpen(false)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wider">
                                <Settings size={14} />
                                <span>Account Settings</span>
                              </Link>
                              {isAdmin && (
                                <Link 
                                  href="/admin" 
                                  onClick={() => setUserDropdownOpen(false)} 
                                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-300 hover:text-white bg-gradient-to-r from-rose-500/[0.08] to-transparent hover:from-rose-500/20 hover:to-rose-500/5 border border-rose-500/20 hover:border-rose-400/40 transition-all text-xs font-black uppercase tracking-wider text-left group/admin shadow-[0_0_15px_rgba(244,63,94,0.06)] hover:shadow-[0_0_25px_rgba(244,63,94,0.2)]"
                                >
                                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-300 group-hover/admin:scale-110 transition-transform shrink-0">
                                    <ShieldCheck size={13} className="text-rose-300 drop-shadow-[0_0_5px_rgba(244,63,94,0.8)]" />
                                  </div>
                                  <span className="font-sans font-black tracking-wider bg-gradient-to-r from-rose-100 to-rose-300 bg-clip-text text-transparent">Admin Panel</span>
                                  <span className="ml-auto text-[8px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 font-mono tracking-wider">
                                    ADMIN
                                  </span>
                                </Link>
                              )}
                              {isPro ? (
                                <button 
                                  onClick={() => setIsManageModalOpen(true)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wider text-left"
                                >
                                  <CreditCard size={14} />
                                  <span>Manage Subscription</span>
                                </button>
                              ) : (
                                <Link href="/pro" onClick={() => setUserDropdownOpen(false)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-accent-purple hover:text-white hover:bg-accent-purple/10 transition-all text-xs font-black uppercase tracking-wider">
                                  <Crown size={14} />
                                  <span>Upgrade to Pro</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Pinned Log Out Footer */}
                        <div className="shrink-0 p-3 bg-black/60 border-t border-white/[0.08] backdrop-blur-xl">
                          <button 
                            type="button"
                            onClick={async () => {
                              const supabase = createClient();
                              await supabase.auth.signOut();
                              setUserDropdownOpen(false);
                              router.push('/');
                            }}
                            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-red-500/25 bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all text-xs font-black uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.12)] active:scale-[0.98]"
                          >
                            <LogOut size={14} className="text-red-400" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 select-none">
                {/* Clean, Refined Log In Link */}
                <Link 
                  href="/auth/login" 
                  className="px-3.5 py-2 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all tracking-wide cursor-pointer"
                >
                  Log in
                </Link>

                {/* Jewel CTA: Try for Free */}
                <Link href="/tools" className="group/tryfree relative select-none">
                  {/* Soft Ambient Halo */}
                  <div className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 opacity-35 blur-[10px] group-hover/tryfree:opacity-75 group-hover/tryfree:blur-[14px] transition-all duration-300" />
                  
                  {/* Outer Shimmer Border */}
                  <div className="relative p-[1px] rounded-full bg-gradient-to-r from-purple-400/50 via-indigo-300/50 to-cyan-400/50 group-hover/tryfree:from-purple-300 group-hover/tryfree:via-white/70 group-hover/tryfree:to-cyan-300 transition-all duration-300">
                    <button className="h-9 px-4.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.4)] transition-all relative overflow-hidden active:scale-95">
                      {/* Smooth Light Sweep */}
                      <div className="pointer-events-none absolute inset-y-0 -left-12 w-8 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent blur-[1px] group-hover/tryfree:translate-x-44 transition-transform duration-700 ease-out" />
                      
                      <span className="tracking-wide">Try for Free</span>
                      <ArrowRight size={13} className="group-hover/tryfree:translate-x-0.5 transition-transform duration-200" />
                    </button>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Header: Consistent, clean layout across all pages */}
          <div className="relative z-50 flex w-full min-w-0 items-center justify-between gap-2 md:hidden">
            <ExismicLogo size={28} showText={true} logoLink={true} />

            {authUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  aria-label="Search tools"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-[#08080d]/88 text-zinc-300 hover:text-white shadow-[0_14px_34px_rgba(0,0,0,0.38)] backdrop-blur-2xl transition-all active:scale-95 cursor-pointer"
                >
                  <Search size={16} className="text-cyan-300" />
                </button>
                <NotificationsDropdown />
                <div className="relative shrink-0" ref={mobileUserDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-label="Open profile menu"
                    aria-expanded={userDropdownOpen}
                    className={cn(
                      "group/mobile-profile relative flex h-10 w-10 items-center justify-center rounded-xl border bg-[#08080d]/88 shadow-[0_14px_34px_rgba(0,0,0,0.38)] backdrop-blur-2xl transition-all active:scale-95",
                      userDropdownOpen && "border-purple-500/40 bg-purple-500/10"
                    )}
                  >
                    <AvatarWithFrame
                      avatarUrl={avatarUrl}
                      displayName={fullName}
                      isPro={isPro}
                      frameId={localFrameId || undefined}
                      size="sm"
                      className="relative z-10 scale-[0.85]"
                    />
                    <span className="absolute bottom-1 right-1 z-20 h-2 w-2 rounded-full border-2 border-[#08080d] bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.8)]" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/tools">
                  <button className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer active:scale-95 transition-all flex items-center gap-1.5">
                    <Rocket size={12} className="text-cyan-200" />
                    <span>Try Free</span>
                  </button>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileNavOpen(!mobileNavOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#080914] border border-white/[0.12] text-zinc-200 hover:text-white transition-colors active:scale-95"
                  aria-label="Toggle navigation menu"
                >
                  {mobileNavOpen ? <X size={17} /> : <Menu size={17} />}
                </button>
              </div>
            )}
          </div>

          {/* Shared Mobile Navigation Drawer for Logged Out Visitors */}
          <AnimatePresence>
            {mobileNavOpen && !authUser && (
              <>
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileNavOpen(false)}
                  className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs md:hidden"
                />

                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="fixed inset-x-3 top-[4.5rem] isolate z-[160] max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-[2rem] border border-white/[0.12] bg-[#070814]/95 p-4 shadow-[0_32px_90px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-3xl md:hidden space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/tools"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex flex-col p-3 rounded-2xl bg-purple-500/[0.08] border border-purple-500/20 active:bg-purple-500/20 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                          <LayoutGrid size={16} />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-purple-300">50+ TOOLS</span>
                      </div>
                      <span className="text-xs font-bold text-white">All AI Tools</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5">Explore creative suite</span>
                    </Link>

                    <Link
                      href="/pro"
                      onClick={() => setMobileNavOpen(false)}
                      className="flex flex-col p-3 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 active:bg-amber-500/20 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                          <Crown size={16} />
                        </div>
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-black text-[8px]">10X</span>
                      </div>
                      <span className="text-xs font-bold text-white">Pro Plan</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5">Unlock max power</span>
                    </Link>
                  </div>

                  <div className="space-y-1 bg-white/[0.02] p-2 rounded-2xl border border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileNavOpen(false);
                        handleScrollTo("explore");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] text-left text-xs font-semibold text-zinc-300 transition-colors"
                    >
                      <Zap size={16} className="text-cyan-400" />
                      <span>Featured Showcase</span>
                    </button>

                    <Link
                      href="/shop"
                      onClick={() => setMobileNavOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] text-left text-xs font-semibold text-zinc-300 transition-colors"
                    >
                      <Coins size={16} className="text-cyan-300" />
                      <span>Credit Shop Vault</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileNavOpen(false);
                        handleScrollTo("faq");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] text-left text-xs font-semibold text-zinc-300 transition-colors"
                    >
                      <HelpCircle size={16} className="text-zinc-400" />
                      <span>Frequently Asked Questions</span>
                    </button>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileNavOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-center text-xs font-bold text-white transition-all"
                    >
                      Log in to your account
                    </Link>
                    <Link
                      href="/tools"
                      onClick={() => setMobileNavOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-center text-xs font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2"
                    >
                      <Rocket size={14} className="text-cyan-200" />
                      <span>Get Started for Free</span>
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

            {/* Shared Mobile User Dropdown Drawer */}
            <AnimatePresence>
              {userDropdownOpen && (
                <>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setUserDropdownOpen(false)}
                    className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-xs md:hidden"
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="fixed inset-x-3 top-[4.75rem] isolate z-[160] max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-[1.75rem] border border-white/[0.12] bg-[#07070c] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.07)] md:hidden"
                  >
                    <span className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(circle_at_12%_0%,rgba(168,85,247,0.16),transparent_40%),radial-gradient(circle_at_90%_22%,rgba(34,211,238,0.1),transparent_38%)]" />

                    <div className="relative flex items-center gap-4 border-b border-white/[0.06] px-2 pb-4 pt-2">
                      <AvatarWithFrame
                        avatarUrl={avatarUrl}
                        displayName={fullName}
                        isPro={isPro}
                        frameId={localFrameId || undefined}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <PremiumName
                          name={fullName.toUpperCase()}
                          isPro={isPro}
                          gradientId={localGradientId}
                          className="block truncate text-sm font-black"
                        />
                        <p className="mt-1 truncate text-[10px] font-semibold text-zinc-500">
                          {authUser?.email}
                        </p>
                        <div className="mt-2">
                          {isPro ? (
                            <ProBadge size="sm" />
                          ) : (
                            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500">
                              Exismic Explorer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="relative grid grid-cols-2 gap-2 py-3">
                      <Link
                        href="/shop"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex min-h-16 items-center gap-3 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.035] px-3 text-left transition-colors active:bg-cyan-300/[0.08]"
                      >
                        <CreditTokenIcon />
                        <span className="min-w-0">
                          <span className="block text-[8px] font-black uppercase tracking-[0.14em] text-zinc-600">Credits</span>
                          <span className="mt-1 block truncate text-xs font-black text-white">{credits.toLocaleString()}</span>
                        </span>
                      </Link>
                      <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-purple-300/10 bg-purple-300/[0.035] px-3">
                        <Crown size={17} className={isPro ? "text-purple-300" : "text-zinc-600"} />
                        <span className="min-w-0">
                          <span className="block text-[8px] font-black uppercase tracking-[0.14em] text-zinc-600">Membership</span>
                          <span className="mt-1 block truncate text-xs font-black text-white">{isPro ? "Exismic Pro" : "Free"}</span>
                        </span>
                      </div>
                    </div>

                    <div className="relative grid gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsDailyRewardOpen(true);
                        }}
                        className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[10.5px] font-black uppercase tracking-[0.13em] text-orange-200 bg-gradient-to-r from-orange-500/[0.12] to-amber-500/[0.04] active:bg-orange-400/20 border border-orange-400/30 transition-all text-left shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-400 shrink-0">
                          <Flame size={15} className="text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
                        </div>
                        <span className="bg-gradient-to-r from-orange-100 to-amber-200 bg-clip-text text-transparent font-black">Daily Mystery Vault</span>
                        {!todayClaim ? (
                          <span className="ml-auto text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-black animate-pulse font-mono shadow-[0_0_10px_rgba(249,115,22,0.8)] flex items-center gap-1">
                            <Gift size={9} className="shrink-0 text-black fill-black/20" />
                            CLAIM DROP
                          </span>
                        ) : (
                          <span className="ml-auto text-[8.5px] font-black uppercase px-2 py-0.5 rounded bg-orange-400/15 text-orange-300 border border-orange-400/25">
                            {dailyStreak}D STREAK
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsQuestsModalOpen(true);
                        }}
                        className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[10.5px] font-black uppercase tracking-[0.13em] text-amber-200 bg-gradient-to-r from-amber-500/[0.08] to-transparent active:bg-amber-400/20 border border-amber-400/20 transition-all text-left shadow-[0_0_15px_rgba(245,158,11,0.06)]"
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 shrink-0">
                          <Trophy size={15} className="text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                        </div>
                        <span className="bg-gradient-to-r from-amber-100 to-amber-300 bg-clip-text text-transparent font-black">Quests & Rewards</span>
                        {unclaimedCount > 0 ? (
                          <span className="ml-auto text-[8.5px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 animate-pulse font-mono shadow-[0_0_10px_rgba(245,158,11,0.8)] flex items-center gap-1">
                            <Gift size={9} className="shrink-0 text-amber-950" />
                            +{unclaimedCount} READY
                          </span>
                        ) : completedCount === totalAvailable && totalAvailable > 0 ? (
                          <span className="ml-auto text-[8.5px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            COMPLETED
                          </span>
                        ) : (
                          <span className="ml-auto text-[8.5px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/25">
                            {completedCount}/{totalAvailable}
                          </span>
                        )}
                      </button>
                      <Link
                        href="/shop"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[10px] font-black uppercase tracking-[0.13em] text-amber-300 transition-colors active:bg-amber-400/10"
                      >
                        <Coins size={16} className="text-amber-400" />
                        Credit Shop Vault
                        <span className="ml-auto text-[8px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">SHOP</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsRedeemModalOpen(true);
                        }}
                        className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[10px] font-black uppercase tracking-[0.13em] text-amber-300 transition-colors active:bg-amber-400/10 text-left"
                      >
                        <Gift size={16} className="text-amber-400" />
                        Redeem Code / Voucher
                        <span className="ml-auto text-[8px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">REDEEM</span>
                      </button>
                      <Link
                        href="/"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-300 transition-colors active:bg-white/[0.06]"
                      >
                        <LayoutDashboard size={16} className="text-cyan-300" />
                        Dashboard
                        <ChevronDown size={14} className="ml-auto -rotate-90 text-zinc-700" />
                      </Link>
                      <Link
                        href="/account/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-300 transition-colors active:bg-white/[0.06]"
                      >
                        <Settings size={16} className="text-purple-300" />
                        Settings & Security
                        <ChevronDown size={14} className="ml-auto -rotate-90 text-zinc-700" />
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[10px] font-black uppercase tracking-[0.13em] text-rose-300 bg-rose-500/10 border border-rose-500/20 transition-colors active:bg-rose-500/20"
                        >
                          <ShieldCheck size={16} className="text-rose-400" />
                          Admin Panel
                          <span className="ml-auto text-[8px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 font-mono">
                            ADMIN
                          </span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (isPro) setIsManageModalOpen(true);
                          else router.push("/pro");
                        }}
                        className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-left text-[10px] font-black uppercase tracking-[0.13em] text-zinc-300 transition-colors active:bg-white/[0.06]"
                      >
                        <CreditCard size={16} className="text-fuchsia-300" />
                        {isPro ? "Manage Membership" : "Explore Pro"}
                        <ChevronDown size={14} className="ml-auto -rotate-90 text-zinc-700" />
                      </button>
                      <div className="mx-3 h-px bg-white/[0.06]" />
                      <button
                        type="button"
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          const supabase = createClient();
                          await supabase.auth.signOut();
                          router.push("/");
                        }}
                        className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-left text-[10px] font-black uppercase tracking-[0.13em] text-red-400/80 transition-colors active:bg-red-500/[0.08]"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
        </div>
      </header>

      {/* Subscription/Billing Management Modal */}
      {authUser && (
        <ManageSubscriptionModal 
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          user={dbUser}
          isCancelling={isCancelling}
          onCancel={handleCancelSubscription}
        />
      )}

      {/* Credit Upsell Checkout Modal */}
      <CreditModal 
        isOpen={showUpsell && !isProLoading}
        onClose={() => setShowUpsell(false)}
        plan={isPro ? 'pro' : 'free'}
        credits={credits}
      />

      {/* Daily Quests Modal */}
      <DailyQuestsModal
        isOpen={isQuestsModalOpen}
        onClose={() => setIsQuestsModalOpen(false)}
      />

      {/* Daily Mystery Vault / LootBox Modal */}
      <DailyRewardModal
        isOpen={isDailyRewardOpen}
        onClose={() => setIsDailyRewardOpen(false)}
      />

      {/* Gift / Promo Code Redemption Modal */}
      <RedeemPromoModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
      />
    </>
  );
}
