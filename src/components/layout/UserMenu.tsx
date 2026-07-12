"use client";

import { User, LogOut, LogIn, Sparkles, CreditCard, Settings, ShieldCheck, ChevronRight, Crown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GradientText from "../ui/GradientText";
import PremiumButton from "../ui/PremiumButton";
import { usePro } from "@/hooks/usePro";
import { useCredits } from "@/hooks/useCredits";
import { ManageSubscriptionModal } from "../tool/ManageSubscriptionModal";
import { CreditModal } from "../ui/CreditModal";
import { Zap } from "lucide-react";
import { UserProfile } from "../ui/UserProfile";
import { VerifiedTick } from "../ui/VerifiedTick";

export function UserMenu() {
  const { isPro, user: dbUser, isLoading: isProLoading, refresh } = usePro();
  const { credits, showUpsell, setShowUpsell, loading: isCreditsLoading } = useCredits();
  const [session, setSession] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();
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

  const isLoading = isProLoading || isCreditsLoading;

  useEffect(() => {
    setIsMounted(true);
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
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch('/api/payments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (result.success) {
        // We no longer close immediately so the modal can show its success state
        await refresh();
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

  if (isLoading) {
    return <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse border border-white/10" />;
  }

  if (!session) {
    return (
      <button 
        onClick={() => router.push('/auth/login')}
        className="flex items-center gap-3 px-6 py-2.5 rounded-2xl premium-gradient text-white shadow-lg hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
      >
        <LogIn size={14} />
        Sign In
      </button>
    );
  }

  const user = session.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Explorer";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const frameId = localFrameId;
  const gradientId = localGradientId;
  
  const usageCount = dbUser?.aiGenerationsUsed ?? 0;
  const totalLimit = dbUser?.aiGenerationsLimit ?? 50;
  const currentPlan = dbUser?.plan || dbUser?.planType || "free";
  const plan = currentPlan.toLowerCase();
  
  const nextReset = (isMounted && dbUser?.nextResetDate) 
    ? new Date(dbUser.nextResetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
    : "May 1st, 2026";

  const progressPercent = Math.min((usageCount / totalLimit) * 100, 100);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-1.5 p-1 rounded-full border transition-all duration-500 group relative",
            "bg-zinc-950/40 backdrop-blur-3xl border-white/5 hover:border-white/20 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]",
            isOpen && "bg-white/10 border-accent-purple/40 shadow-[0_0_40px_rgba(168,85,247,0.2)]",
            isPro && "shadow-[0_0_25px_rgba(168,85,247,0.08)]"
          )}
        >
          {/* 1. CREDITS SECTION */}
          <div 
            onClick={(e) => {
              if (!isOpen) {
                e.stopPropagation();
                setShowUpsell(true);
              }
            }}
            className="flex items-center gap-3 pl-2 pr-2 py-1.5 rounded-full hover:bg-white/5 transition-all cursor-pointer group/credits"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg",
              isPro ? "bg-accent-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "bg-zinc-800 text-zinc-400"
            )}>
              <Zap size={14} fill="currentColor" className={isPro ? "animate-pulse" : ""} />
            </div>
            <span suppressHydrationWarning className="text-sm font-black tracking-tight text-white pr-2">
              {credits.toLocaleString()}
            </span>
          </div>

          <div className="h-8 w-px bg-white/10 mx-1" />

          {/* 2. USER & PRO SECTION */}
          <UserProfile 
            fullName={fullName} 
            isPro={isPro} 
            avatarUrl={avatarUrl} 
            frameId={frameId || undefined}
            gradientId={gradientId}
            variant="menu-trigger" 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.96, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 15, scale: 0.96, filter: "blur(12px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="absolute right-0 mt-4 w-[340px] bg-zinc-950/85 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.05)] z-50 overflow-hidden"
            >
              {/* Animated Cinematic Background Glow Orbs */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-[30%] -left-[30%] w-[160%] h-[160%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06)_0%,transparent_60%)] animate-pulse duration-[8000ms]" />
                <div className="absolute top-[20%] right-[-40%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_60%)] animate-pulse duration-[6000ms]" />
              </div>

              {/* Profile Header */}
              <UserProfile 
                fullName={fullName} 
                email={user?.email} 
                avatarUrl={avatarUrl} 
                isPro={isPro} 
                frameId={frameId || undefined}
                gradientId={gradientId}
                variant="menu-header" 
              />

              {/* Stats Block */}
              <div className="px-6 py-6 border-t border-white/[0.05] bg-white/[0.01] space-y-5 relative z-10">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                       <div className="w-6 h-6 rounded-lg bg-accent-purple/10 flex items-center justify-center border border-accent-purple/20">
                          <Zap size={11} className="text-accent-purple animate-pulse" />
                       </div>
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Credits Available</span>
                    </div>
                    <span className="text-xs font-black text-white italic tracking-tight bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-md shadow-inner">{credits.toLocaleString()}</span>
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/5">
                             <RefreshCw size={11} className="text-zinc-500" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">AI Generations</span>
                       </div>
                       <div className="text-[10px] font-bold text-white">
                         {usageCount}
                         <span className="text-zinc-600 font-bold ml-1">/ {totalLimit}</span>
                       </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-900/50 rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-accent-purple via-pink-500 to-accent-cyan shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                       />
                    </div>
                 </div>
              </div>

              {/* Menu Actions */}
              <div className="p-3 space-y-1.5 bg-[#050508]/40 border-t border-white/[0.05] relative z-10">
                 <button 
                    onClick={() => {
                      setIsOpen(false);
                      if (isPro) setIsManageModalOpen(true);
                      else router.push('/pro');
                    }}
                    className="w-full group flex items-center gap-3.5 px-5 py-4 text-[9.5px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] rounded-[1.25rem] transition-all duration-300 relative overflow-hidden"
                 >
                    <div className="absolute left-0 w-[3px] h-4 rounded-r-full bg-accent-purple opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
                    <CreditCard size={15} className="text-zinc-500 group-hover:text-accent-purple group-hover:scale-110 transition-all duration-300" />
                    {isPro ? "Manage Subscription" : "Upgrade to Pro"}
                    <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-zinc-400" />
                 </button>
                 
                 <Link 
                    href="/account/settings"
                    onClick={() => setIsOpen(false)}
                    className="w-full group flex items-center gap-3.5 px-5 py-4 text-[9.5px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04] rounded-[1.25rem] transition-all duration-300 relative overflow-hidden"
                 >
                    <div className="absolute left-0 w-[3px] h-4 rounded-r-full bg-accent-cyan opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
                    <Settings size={15} className="text-zinc-500 group-hover:text-accent-cyan group-hover:rotate-45 transition-all duration-500" />
                    Settings & Security
                    <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-zinc-400" />
                 </Link>

                 <div className="h-px bg-white/[0.04] my-2 mx-4" />

                 <button 
                   onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = "/";
                   }}
                   className="w-full group flex items-center gap-3.5 px-5 py-4 text-[9.5px] font-black uppercase tracking-[0.2em] text-red-500/60 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-[1.25rem] transition-all duration-300 relative overflow-hidden"
                 >
                    <div className="absolute left-0 w-[3px] h-4 rounded-r-full bg-red-500 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
                    <LogOut size={15} className="text-red-500/40 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all duration-300" />
                    Sign Out
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ManageSubscriptionModal 
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        user={dbUser}
        onCancel={handleCancelSubscription}
        isCancelling={isCancelling}
      />

      <CreditModal 
        isOpen={showUpsell} 
        onClose={() => setShowUpsell(false)} 
        plan={plan as 'free' | 'pro'} 
        credits={credits}
      />
    </>
  );
}
