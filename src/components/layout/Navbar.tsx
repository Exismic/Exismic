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
  CreditCard
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";
import { useCredits } from "@/hooks/useCredits";
import { ManageSubscriptionModal } from "../tool/ManageSubscriptionModal";
import { CreditModal } from "../ui/CreditModal";
import { ProBadge } from "../ui/ProBadge";
import { UserProfile } from "../ui/UserProfile";
import { AvatarWithFrame } from "../ui/AvatarWithFrame";
import { CreditTokenIcon } from "../ui/CreditTokenIcon";
import { PremiumName } from "../ui/PremiumName";
import { NotificationsDropdown } from "./NotificationsDropdown";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileUserDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  const { isPro, isLoading: isProLoading, user: dbUser, refresh: refreshPro } = usePro();
  const { credits, showUpsell, setShowUpsell } = useCredits();
  const supabase = createClient();

  const [localFrameId, setLocalFrameId] = useState<string | null>(null);
  const [localGradientId, setLocalGradientId] = useState<string | null>(null);

  useEffect(() => {
    const frame = session?.user?.user_metadata?.avatar_frame ?? dbUser?.avatar_frame ?? null;
    const gradient = session?.user?.user_metadata?.name_gradient ?? dbUser?.name_gradient ?? null;
    setLocalFrameId(frame);
    setLocalGradientId(gradient);
  }, [session, dbUser]);

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
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
  }, [pathname]);

  const handleSearchClick = () => {
    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(event);
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch('/api/razorpay/cancel', {
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

  const loggedInLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Tools", href: "#", isDropdown: true },
    { name: "AI Chat", href: "/tools/ai/chat" },
    { name: "Code Studio", href: "/tools/ai/code" },
    { name: "Explore", href: "/tools" },
  ];

  const loggedOutLinks = [
    { name: "Tools", href: "/tools" },
    { name: "Pricing", href: "/pro" },
    { name: "Blog", href: "/blog" },
  ];

  const navLinks = session ? loggedInLinks : loggedOutLinks;
  const fullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Explorer";
  const avatarUrl = dbUser?.custom_avatar_url || session?.user?.user_metadata?.avatar_url;

  const usageCount = dbUser?.aiGenerationsUsed ?? 0;
  const totalLimit = dbUser?.aiGenerationsLimit ?? 50;
  const progressPercent = Math.min((usageCount / totalLimit) * 100, 100);

  const getNavIcon = (name: string) => {
    switch (name) {
      case "Dashboard":
        return LayoutDashboard;
      case "Tools":
        return FolderOpen;
      case "AI Chat":
        return MessageSquare;
      case "Code Studio":
        return Code2;
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

  const isNavLinkActive = (link: (typeof loggedInLinks)[number] | (typeof loggedOutLinks)[number]) => {
    if (link.name === "Tools" && link.isDropdown) {
      const isSpecializedWorkspace =
        pathname.startsWith("/tools/ai/chat") ||
        pathname.startsWith("/tools/ai/code") ||
        pathname.startsWith("/chat");

      return toolsDropdownOpen ||
        pathname.startsWith("/category/") ||
        (pathname.startsWith("/tools/") && !isSpecializedWorkspace);
    }

    if (link.name === "AI Chat") {
      return pathname.startsWith("/chat") || pathname.startsWith("/tools/ai/chat");
    }

    if (link.name === "Code Studio") {
      return pathname.startsWith("/tools/ai/code");
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
          session 
            ? "sticky top-0 z-[100] bg-[#030303]/60 backdrop-blur-2xl border-b border-white/5 w-full h-20 transition-all duration-500"
            : cn(
                "fixed top-0 inset-x-0 h-20 z-[100] transition-all duration-500 border-b",
                scrolled 
                  ? "bg-[#030303]/80 backdrop-blur-2xl border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.8)]" 
                  : "bg-transparent border-transparent"
              )
        )}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between relative">
          
          {/* Desktop search and notifications */}
          <div className="relative z-50 hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={handleSearchClick}
              className="group/search relative flex h-12 w-[clamp(260px,31vw,430px)] items-center gap-3 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#08080d]/84 px-3.5 text-left shadow-[0_16px_45px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-2xl transition-all duration-300 hover:border-cyan-300/20 hover:bg-[#0a0a11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 active:scale-[0.99]"
              title="Global AI Search & Commands (Ctrl+K)"
              aria-label="Open global search"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(168,85,247,0.12),transparent_37%),radial-gradient(circle_at_92%_100%,rgba(34,211,238,0.08),transparent_36%)] opacity-80"
              />
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-400 transition-all duration-300 group-hover/search:border-cyan-300/20 group-hover/search:text-cyan-200 group-hover/search:shadow-[0_0_18px_rgba(34,211,238,0.1)]">
                <Search size={15} strokeWidth={2.2} />
              </span>
              <span className="relative min-w-0 flex-1 truncate text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500 transition-colors group-hover/search:text-zinc-300">
                Search tools, commands, and creations
              </span>
              <kbd className="relative hidden h-7 shrink-0 items-center gap-1 rounded-lg border border-white/[0.08] bg-black/35 px-2 text-[8px] font-black uppercase tracking-[0.12em] text-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] group-hover/search:text-zinc-400 lg:flex">
                Ctrl <span className="text-zinc-700">+</span> K
              </kbd>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 bottom-0 h-px origin-center scale-x-0 bg-linear-to-r from-transparent via-purple-400 to-cyan-300 opacity-0 transition-all duration-500 group-hover/search:scale-x-100 group-hover/search:opacity-80"
              />
            </button>

            <NotificationsDropdown />
          </div>

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
                                <Link href="/tools/ai/code" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group">
                                  <div className="w-9 h-9 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan group-hover:bg-accent-cyan group-hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                                    <Code2 size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-white italic">Code Studio</div>
                                    <div className="text-[10px] text-zinc-500 line-clamp-1">Full stack AI coding terminal</div>
                                  </div>
                                </Link>
                                <Link href="/tools/ai/chat" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group">
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
            {/* Search lives on the left side of the desktop header. */}
            <div 
              onClick={handleSearchClick}
              className="hidden"
              title="Global AI Search & Commands (Ctrl+K)"
            >
              <Search size={14} className="text-zinc-500 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 truncate">
                Search tools, commands...
              </span>
              <div className="ml-auto flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-zinc-950/80 border border-white/5 text-[8px] font-black tracking-widest text-zinc-500 uppercase">
                <span className="font-mono">⌘</span>
                <span className="font-mono pl-0.5">K</span>
              </div>
            </div>

            {/* Search lives on the left side of the desktop header. */}
            <button 
              onClick={handleSearchClick}
              className="hidden"
              title="Global AI Search (Ctrl+K)"
            >
              <Search size={16} className="transition-transform duration-300 group-hover:scale-110" />
            </button>

            {session ? (
              <div className="flex items-center gap-3">
                {/* 1. Credits Pill */}
                <div 
                  onClick={() => setShowUpsell(true)}
                  className="group/vault relative flex h-10 cursor-pointer items-center gap-2.5 overflow-hidden rounded-full border border-white/10 bg-[#07070c]/80 pl-2.5 pr-4 shadow-[0_12px_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-[#0a0a12] hover:shadow-[0_15px_40px_rgba(34,211,238,0.14)] active:scale-95"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(124,58,237,0.22),transparent_34%),radial-gradient(circle_at_80%_50%,rgba(34,211,238,0.15),transparent_30%)] opacity-70" />
                  <div className="pointer-events-none absolute inset-y-0 -left-10 w-10 skew-x-[-18deg] bg-white/10 blur-sm transition-transform duration-1000 group-hover/vault:translate-x-44" />
                  <CreditTokenIcon />
                  <span className="relative z-10 flex items-center gap-1.5 text-xs font-black tracking-tight text-white uppercase">
                    <span suppressHydrationWarning className="animate-gradient-x bg-linear-to-r from-cyan-200 via-white to-purple-300 bg-[length:220%_100%] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.15)]">{credits.toLocaleString()}</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500/80">Credits</span>
                  </span>
                </div>

                {/* 2. Pro Badge */}
                {isPro && (
                  <ProBadge size="md" />
                )}

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
                      frameId={localFrameId}
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
                        className="absolute right-0 mt-4 w-[320px] bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] z-50 overflow-hidden p-6 space-y-6"
                      >
                        {/* Profile Header */}
                        <UserProfile 
                          fullName={fullName} 
                          email={session?.user?.email} 
                          avatarUrl={avatarUrl} 
                          isPro={isPro} 
                          frameId={localFrameId}
                          gradientId={localGradientId}
                          variant="menu-header" 
                        />

                        {/* Usage Progress Tracker */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
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
                          <Link href="/account/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wider">
                            <Settings size={14} />
                            <span>Account Settings</span>
                          </Link>
                          {isPro ? (
                            <button 
                              onClick={() => setIsManageModalOpen(true)}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wider text-left"
                            >
                              <CreditCard size={14} />
                              <span>Manage Subscription</span>
                            </button>
                          ) : (
                            <Link href="/pro" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-accent-purple hover:text-white hover:bg-accent-purple/10 transition-all text-xs font-black uppercase tracking-wider">
                              <Crown size={14} />
                              <span>Upgrade to Pro</span>
                            </Link>
                          )}
                        </div>

                        <div className="h-px bg-white/5" />

                        {/* Log Out */}
                        <button 
                          onClick={async () => {
                            await supabase.auth.signOut();
                            setUserDropdownOpen(false);
                            router.push('/');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-xs font-bold uppercase tracking-wider text-left"
                        >
                          <LogOut size={14} />
                          <span>Log Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors px-4 py-2">
                  Login
                </Link>
                <Link href="/auth/login?signup=true">
                  <button className="group relative px-6 py-2.5 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 bg-linear-to-r from-accent-purple to-accent-cyan overflow-hidden text-xs uppercase tracking-widest font-black">
                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out -skew-x-12 -translate-x-full" />
                    <span className="relative flex items-center gap-1.5">
                      Sign Up <LogIn size={12} />
                    </span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile command bar. The sidebar owns navigation on small screens. */}
          <div className="relative z-50 flex w-full min-w-0 items-center gap-2 pl-14 md:hidden">
            <button
              type="button"
              onClick={handleSearchClick}
              aria-label="Open global search"
              className="group/mobile-search relative flex h-12 min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#08080d]/88 px-3 text-left text-zinc-400 shadow-[0_14px_34px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-2xl transition-all active:scale-[0.98]"
            >
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(168,85,247,0.16),transparent_42%),radial-gradient(circle_at_92%_100%,rgba(34,211,238,0.1),transparent_38%)]" />
              <Search size={16} strokeWidth={2.2} className="relative shrink-0 text-cyan-200" />
              <span className="relative min-w-0 flex-1 truncate text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 group-active/mobile-search:text-white">
                Search Lumora
              </span>
              <span className="relative hidden h-6 shrink-0 items-center rounded-lg border border-white/[0.08] bg-black/30 px-2 text-[8px] font-black text-zinc-600 sm:flex">
                Ctrl K
              </span>
            </button>

            <div className="shrink-0">
              <NotificationsDropdown />
            </div>

            {session ? (
              <div className="relative shrink-0" ref={mobileUserDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="Open profile menu"
                  aria-expanded={userDropdownOpen}
                  className={cn(
                    "group/mobile-profile relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-[#08080d]/88 shadow-[0_14px_34px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-2xl transition-all active:scale-95",
                    userDropdownOpen
                      ? "border-purple-300/35 shadow-[0_0_30px_rgba(168,85,247,0.16)]"
                      : "border-white/[0.09]",
                  )}
                >
                  <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_15%,rgba(168,85,247,0.18),transparent_48%),radial-gradient(circle_at_82%_82%,rgba(34,211,238,0.12),transparent_42%)]" />
                  <AvatarWithFrame
                    avatarUrl={avatarUrl}
                    displayName={fullName}
                    isPro={isPro}
                    frameId={localFrameId || undefined}
                    size="sm"
                    className="relative z-10 scale-[0.88]"
                  />
                  <span className="absolute bottom-1.5 right-1.5 z-20 h-2.5 w-2.5 rounded-full border-2 border-[#08080d] bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.8)]" />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <>
                      <motion.button
                        type="button"
                        aria-label="Close profile menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setUserDropdownOpen(false)}
                        className="fixed inset-0 top-20 z-[150] cursor-default bg-black/70 backdrop-blur-[3px]"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="fixed inset-x-3 top-[4.75rem] isolate z-[160] max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-[1.75rem] border border-white/[0.12] bg-[#07070c] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.07)]"
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
                            {session.user.email}
                          </p>
                          <div className="mt-2">
                            {isPro ? (
                              <ProBadge size="sm" />
                            ) : (
                              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-500">
                                Lumora Explorer
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="relative grid grid-cols-2 gap-2 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setShowUpsell(true);
                          }}
                          className="flex min-h-16 items-center gap-3 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.035] px-3 text-left transition-colors active:bg-cyan-300/[0.08]"
                        >
                          <CreditTokenIcon />
                          <span className="min-w-0">
                            <span className="block text-[8px] font-black uppercase tracking-[0.14em] text-zinc-600">Credits</span>
                            <span className="mt-1 block truncate text-xs font-black text-white">{credits.toLocaleString()}</span>
                          </span>
                        </button>
                        <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-purple-300/10 bg-purple-300/[0.035] px-3">
                          <Crown size={17} className={isPro ? "text-purple-300" : "text-zinc-600"} />
                          <span className="min-w-0">
                            <span className="block text-[8px] font-black uppercase tracking-[0.14em] text-zinc-600">Membership</span>
                            <span className="mt-1 block truncate text-xs font-black text-white">{isPro ? "Lumora Pro" : "Free"}</span>
                          </span>
                        </div>
                      </div>

                      <div className="relative grid gap-1.5">
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
            ) : (
              <Link
                href="/auth/login"
                aria-label="Sign in"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.09] bg-[#08080d]/88 text-zinc-300 shadow-[0_14px_34px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
              >
                <LogIn size={17} />
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* Subscription/Billing Management Modal */}
      {session && (
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
    </>
  );
}
