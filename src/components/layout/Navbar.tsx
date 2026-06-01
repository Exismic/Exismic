"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Search, 
  Menu, 
  X, 
  Crown, 
  LogIn, 
  Zap,
  LayoutDashboard,
  MessageSquare,
  Code2,
  FolderOpen,
  Settings,
  LogOut,
  ChevronDown,
  BookOpen,
  Star,
  Activity,
  History,
  CreditCard
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import GradientText from "../ui/GradientText";
import { usePro } from "@/hooks/usePro";
import { useCredits } from "@/hooks/useCredits";
import { ManageSubscriptionModal } from "../tool/ManageSubscriptionModal";
import { CreditModal } from "../ui/CreditModal";
import { VerifiedTick } from "../ui/VerifiedTick";
import { ProBadge, GradientProText } from "../ui/ProBadge";
import { UserProfile } from "../ui/UserProfile";
import { AvatarWithFrame } from "../ui/AvatarWithFrame";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  const { isPro, user: dbUser, refresh: refreshPro } = usePro();
  const { credits, showUpsell, setShowUpsell, refreshCredits } = useCredits();
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
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
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
    setMobileMenuOpen(false);
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
  const avatarUrl = session?.user?.user_metadata?.avatar_url;

  const usageCount = dbUser?.aiGenerationsUsed ?? 0;
  const totalLimit = dbUser?.aiGenerationsLimit ?? 50;
  const progressPercent = Math.min((usageCount / totalLimit) * 100, 100);

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
          
          {/* Left Side: Desktop Navigation Links (Logo removed completely) */}
          <div className="flex items-center gap-6 relative z-50">
            <nav className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md relative">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && link.href !== "#" && pathname.startsWith(link.href));
                
                if (link.isDropdown) {
                  return (
                    <div key={link.name} className="relative" ref={toolsDropdownRef}>
                      <button 
                        onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                        className={cn(
                          "relative px-5 py-2 text-xs font-black uppercase tracking-wider transition-all duration-300 rounded-full flex items-center gap-1 hover:text-white",
                          toolsDropdownOpen ? "text-white" : "text-zinc-400"
                        )}
                      >
                        <span>{link.name}</span>
                        <ChevronDown size={12} className={cn("transition-transform duration-300", toolsDropdownOpen && "rotate-180")} />
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
                      "relative px-5 py-2 text-xs font-black uppercase tracking-wider transition-all duration-300 rounded-full",
                      isActive ? "text-white" : "text-zinc-400 hover:text-zinc-100"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 bg-white/[0.04] backdrop-blur-md rounded-full border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Search, Credits, Pro Badge, Profile */}
          <div className="hidden md:flex items-center gap-4 relative z-50">
            {/* Prominent Search Bar (Desktop) */}
            <div 
              onClick={handleSearchClick}
              className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/12 rounded-2xl text-zinc-500 hover:text-zinc-400 cursor-pointer transition-all duration-300 w-[240px] shadow-sm select-none active:scale-[0.98]"
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

            {/* Tiny Search Button (Mobile/Tablet/Medium screens) */}
            <button 
              onClick={handleSearchClick}
              className="flex lg:hidden w-10 h-10 rounded-full bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 hover:border-white/15 items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 relative group active:scale-95 shadow-md"
              title="Global AI Search (Ctrl+K)"
            >
              <Search size={16} className="transition-transform duration-300 group-hover:scale-110" />
            </button>

            {session ? (
              <div className="flex items-center gap-3">
                {/* 1. Credits Pill */}
                <div 
                  onClick={() => setShowUpsell(true)}
                  className="h-10 pl-3.5 pr-4 rounded-full bg-zinc-950/40 hover:bg-zinc-950/80 border border-white/5 hover:border-accent-purple/30 flex items-center gap-2.5 transition-all duration-300 cursor-pointer shadow-md group active:scale-95"
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500",
                    isPro ? "bg-accent-purple text-white shadow-[0_0_10px_rgba(168,85,247,0.4)] animate-pulse" : "bg-zinc-800 text-zinc-400"
                  )}>
                    <Zap size={10} fill="currentColor" />
                  </div>
                  <span className="text-xs font-black tracking-tight text-white flex items-center gap-1">
                    <span className="bg-linear-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">{credits.toLocaleString()}</span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest pl-0.5">Credits</span>
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

          {/* Mobile Hamburguer Menu Trigger */}
          <div className="flex md:hidden items-center gap-3 relative z-50">
            <button 
              onClick={handleSearchClick}
              className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              <Search size={16} />
            </button>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white transition-all"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>

        {/* Mobile Drawer Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 top-20 bg-black/60 backdrop-blur-md z-40 md:hidden"
              />
              
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                className="fixed inset-x-0 top-20 max-h-[calc(100dvh-5rem)] overflow-y-auto bg-[#030303]/95 backdrop-blur-3xl border-b border-white/[0.06] shadow-2xl p-4 sm:p-6 z-40 md:hidden flex flex-col gap-5"
              >
                <div className="flex flex-col gap-1.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2 px-3">Navigation</p>
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    if (link.isDropdown) return null; // Avoid rendering full columns on small screens
                    
                    return (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        className={cn(
                          "flex min-h-11 items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all",
                          isActive 
                            ? "bg-white/[0.03] text-white border border-white/5" 
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="h-px bg-white/5" />

                {session ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center px-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Credits available</span>
                      <span className="text-xs text-white font-bold">{credits.toLocaleString()} Credits</span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowUpsell(true);
                      }}
                      className="w-full h-11 rounded-xl bg-linear-to-r from-accent-purple to-accent-cyan text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Zap size={14} fill="currentColor" /> Buy Credits
                    </button>
                    
                    <button 
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setMobileMenuOpen(false);
                        router.push('/');
                      }}
                      className="w-full h-11 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/auth/login" className="w-full">
                      <button className="w-full h-11 rounded-xl bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest">
                        Login
                      </button>
                    </Link>
                    <Link href="/auth/login?signup=true" className="w-full">
                      <button className="w-full h-11 rounded-xl bg-linear-to-r from-accent-purple to-accent-cyan text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
                        Sign Up <LogIn size={14} />
                      </button>
                    </Link>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        plan={isPro ? 'pro' : 'free'}
        credits={credits}
      />
    </>
  );
}
