"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  Users, 
  Coins, 
  TrendingUp, 
  Copy, 
  Check, 
  Link2, 
  UserPlus, 
  Gift, 
  ArrowRight, 
  ArrowLeft,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Crown,
  Layers
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { getClientSiteUrl } from "@/lib/site-url";

interface ReferredFriend {
  id: string;
  name: string;
  avatar?: string | null;
  email: string;
  status: string;
  createdAt: string;
}

export default function ReferralsPage() {
  const prefersReducedMotion = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [totalReferred, setTotalReferred] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [referralsList, setReferralsList] = useState<ReferredFriend[]>([]);
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    async function loadReferralStats() {
      try {
        const res = await fetch("/api/user/referrals");
        const json = await res.json();
        if (res.ok && json.success) {
          setReferralCode(json.referralCode);
          setTotalReferred(json.totalReferred);
          setTotalEarned(json.totalEarned);
          setReferralsList(json.referrals || []);
        }
      } catch (error) {
        console.error("Failed to load referral statistics:", error);
      } finally {
        setLoading(false);
      }
    }
    loadReferralStats();
  }, []);

  const getReferralLink = () => {
    if (typeof window !== "undefined" && referralCode) {
      return `${window.location.origin}?ref=${referralCode}`;
    }
    return referralCode ? `${getClientSiteUrl()}?ref=${referralCode}` : "";
  };

  const handleCopyLink = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(getReferralLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareText = "Create with AI on Exismic Studio. Use my personal link to receive 50 bonus credits on signup:";

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getReferralLink())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + getReferralLink())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(getReferralLink())}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#030308] text-white selection:bg-emerald-500/30 pb-36 overflow-hidden relative" suppressHydrationWarning>
      {/* 🌌 High-End Ambient Lighting Architecture */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] right-[-10%] w-[1000px] h-[1000px] bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-transparent blur-[160px] rounded-full animate-pulse" />
        <div className="absolute top-[35%] -left-[15%] w-[900px] h-[900px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-transparent blur-[150px] rounded-full" />
        <div className="absolute -bottom-[20%] right-[10%] w-[800px] h-[800px] bg-gradient-to-tl from-purple-600/10 via-emerald-900/10 to-transparent blur-[140px] rounded-full" />
        
        {/* Subtle Luxury Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 relative z-10 space-y-12">
        {/* Navigation & Header */}
        <div className="space-y-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-zinc-400 hover:text-white transition-all duration-300 group shadow-lg backdrop-blur-md"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Return to Studio</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Users size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                  Exismic Partner Program
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] text-white">
                Share & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                  Earn Credits.
                </span>
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base font-medium leading-relaxed">
                Invite your fellow creators, designers, and builders. Both of you receive <span className="text-emerald-300 font-bold">+50 bonus credits</span> on signup, plus you earn an ongoing <span className="text-cyan-300 font-bold">10% lifetime commission</span> on all their studio purchases.
              </p>
            </div>

            {/* Quick Summary Pill Card */}
            <div className="flex items-center gap-3 self-start lg:self-end">
              <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <Gift size={14} className="text-emerald-400" />
                <span>+50 Per Signup</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <TrendingUp size={14} className="text-cyan-400" />
                <span>10% Lifetime Rev-Share</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Skeletons vs Real Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-[#0a0a14]/80 border-2 border-white/[0.08] rounded-[2rem] p-7 space-y-4">
                <Skeleton className="h-4 w-28 bg-white/5" />
                <Skeleton className="h-10 w-20 bg-white/5" />
                <Skeleton className="h-4 w-36 bg-white/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* 3 Luxury Obsidian Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1: Friends Invited */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.02 }}
                className="group relative overflow-hidden rounded-[2rem] border-2 border-white/[0.08] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 p-7 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-emerald-400/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.2)] transition-all duration-500 flex flex-col justify-between"
              >
                {/* Ambient Glow */}
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full blur-[80px] bg-emerald-500/25 opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none" />
                <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.06),transparent)] skew-x-[-30deg] transition-transform duration-1000 group-hover:translate-x-full pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                  {/* Top Row: Rotating Aura Orb & Tag */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden bg-[#090a14] border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,rgba(16,185,129,0.6)_25%,transparent_50%)]" />
                      <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#090a14] z-0" />
                      <UserPlus size={24} className="relative z-10 text-emerald-400 transition-all duration-500 group-hover:scale-110" />
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm border-emerald-400/40 bg-emerald-500/10 text-emerald-300">
                      COMMUNITY
                    </span>
                  </div>

                  {/* Value */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                      Friends Invited
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white group-hover:text-emerald-200 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                      {totalReferred}
                    </h3>
                    <p className="text-xs font-medium text-zinc-400 pt-1">
                      {totalReferred > 0 ? "Collaborators joined with your link" : "Invite your first creator to start earning"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Stat 2: Credits Earned */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.02 }}
                className="group relative overflow-hidden rounded-[2rem] border-2 border-white/[0.08] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 p-7 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-amber-400/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.2)] transition-all duration-500 flex flex-col justify-between"
              >
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full blur-[80px] bg-amber-500/25 opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none" />
                <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.06),transparent)] skew-x-[-30deg] transition-transform duration-1000 group-hover:translate-x-full pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden bg-[#090a14] border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,rgba(245,158,11,0.6)_25%,transparent_50%)]" />
                      <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#090a14] z-0" />
                      <Coins size={24} className="relative z-10 text-amber-400 transition-all duration-500 group-hover:scale-110" />
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm border-amber-400/40 bg-amber-500/10 text-amber-300">
                      PERMANENT CREDITS
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                      Credits Earned
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white group-hover:text-amber-200 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                      +{totalEarned.toLocaleString()}
                    </h3>
                    <p className="text-xs font-medium text-zinc-400 pt-1">
                      Permanent reserve credits that never expire
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Stat 3: Commission Rate */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.02 }}
                className="group relative overflow-hidden rounded-[2rem] border-2 border-white/[0.08] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 p-7 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-cyan-400/50 hover:shadow-[0_0_35px_rgba(6,182,212,0.2)] transition-all duration-500 flex flex-col justify-between"
              >
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full blur-[80px] bg-cyan-500/25 opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none" />
                <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.06),transparent)] skew-x-[-30deg] transition-transform duration-1000 group-hover:translate-x-full pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden bg-[#090a14] border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,rgba(6,182,212,0.6)_25%,transparent_50%)]" />
                      <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#090a14] z-0" />
                      <TrendingUp size={24} className="relative z-10 text-cyan-400 transition-all duration-500 group-hover:scale-110" />
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm border-cyan-400/40 bg-cyan-500/10 text-cyan-300">
                      LIFETIME SHARE
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                      Commission Rate
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white group-hover:text-cyan-200 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                      10%
                    </h3>
                    <p className="text-xs font-medium text-emerald-400 pt-1 flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>Active on all referrals</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sharing Interface Console */}
            <div className="relative group p-8 sm:p-12 rounded-[2.5rem] border-2 border-white/[0.08] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.7)] hover:border-emerald-500/30 transition-all duration-500 overflow-hidden">
              <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-emerald-500/15 blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Description Column */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <Link2 size={12} className="text-emerald-400" />
                    <span>Your Dedicated Referral Link</span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                      Invite Friends. <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                        Earn In Real Time.
                      </span>
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                      Send your link to friends, creators, and team members. They receive 50 bonus credits instantly upon signup, and you earn bonus credits plus a 10% commission on every credit pack or Pro plan they purchase.
                    </p>
                  </div>

                  {/* 3 Value Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-2xl border border-white/[0.06] bg-[#090a14]/60 backdrop-blur-md">
                      <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">They Receive</span>
                      <span className="text-xs font-black text-emerald-300">+50 Credits</span>
                    </div>
                    <div className="p-3 rounded-2xl border border-white/[0.06] bg-[#090a14]/60 backdrop-blur-md">
                      <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">You Receive</span>
                      <span className="text-xs font-black text-amber-300">+50 Credits</span>
                    </div>
                    <div className="p-3 rounded-2xl border border-white/[0.06] bg-[#090a14]/60 backdrop-blur-md">
                      <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">Every Purchase</span>
                      <span className="text-xs font-black text-cyan-300">10% Rev-Share</span>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Link Column */}
                <div className="lg:col-span-6 space-y-6 w-full">
                  {/* Share Link Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Your Unique Referral URL
                      </label>
                      <span className="text-[10px] font-bold text-emerald-400/80">1-Click Auto-Copy</span>
                    </div>

                    <div className="relative flex items-center bg-[#07080f] border-2 border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-2 sm:p-2.5 transition-all shadow-inner group/box">
                      <div className="flex-1 px-3 py-1 overflow-hidden">
                        <span className="text-xs sm:text-sm font-mono font-bold text-zinc-300 block truncate">
                          {referralCode ? getReferralLink() : "Generating referral URL..."}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyLink}
                        disabled={!referralCode}
                        className={cn(
                          "px-5 py-2.5 rounded-xl font-black uppercase tracking-wider text-xs flex items-center gap-2 transition-all duration-300 cursor-pointer shrink-0 shadow-lg active:scale-95",
                          copiedLink 
                            ? "bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                            : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        )}
                      >
                        {copiedLink ? (
                          <>
                            <Check size={14} className="stroke-[3]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Share Code Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Referral Code
                      </label>
                      <span className="text-[10px] text-zinc-500">For signup promo box</span>
                    </div>

                    <div className="relative flex items-center bg-[#07080f] border-2 border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-2 sm:p-2.5 transition-all shadow-inner">
                      <div className="flex-1 px-3 py-1">
                        <span className="text-sm font-mono font-black tracking-widest text-emerald-400">
                          {referralCode || "------"}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        disabled={!referralCode}
                        className={cn(
                          "px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 transition-all duration-300 cursor-pointer shrink-0 border",
                          copiedCode 
                            ? "bg-emerald-400 text-black border-emerald-400" 
                            : "bg-white/[0.05] border-white/10 hover:border-white/20 text-zinc-300 hover:text-white"
                        )}
                      >
                        {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Social Quick Share Buttons */}
                  <div className="pt-2 space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block">
                      Quick Share to Socials
                    </span>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        onClick={handleShareTwitter}
                        disabled={!referralCode}
                        className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer hover:border-cyan-400/40"
                      >
                        <Share2 size={13} className="text-cyan-400" />
                        <span>Post on X (Twitter)</span>
                      </button>
                      <button
                        onClick={handleShareWhatsApp}
                        disabled={!referralCode}
                        className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer hover:border-emerald-400/40"
                      >
                        <Share2 size={13} className="text-emerald-400" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={handleShareTelegram}
                        disabled={!referralCode}
                        className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer hover:border-blue-400/40"
                      >
                        <Share2 size={13} className="text-blue-400" />
                        <span>Telegram</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works - 3 Step Guide */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Step-by-step</span>
                <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 via-white/5 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    step: "01",
                    title: "Share Your Link",
                    desc: "Send your custom referral link or promo code to your fellow designers, developers, or creators.",
                    tag: "INVITE",
                    color: "border-emerald-400/30 text-emerald-400 bg-emerald-500/10",
                    glow: "bg-emerald-500/20"
                  },
                  {
                    step: "02",
                    title: "They Join & Get +50",
                    desc: "When they sign up with your link, they immediately receive 50 bonus credits to start creating.",
                    tag: "SIGNUP BONUS",
                    color: "border-cyan-400/30 text-cyan-400 bg-cyan-500/10",
                    glow: "bg-cyan-500/20"
                  },
                  {
                    step: "03",
                    title: "Earn Lifetime Rewards",
                    desc: "You get +50 permanent credits right away, plus a 10% commission on every credit pack or Pro membership they ever buy.",
                    tag: "LIFETIME REVENUE",
                    color: "border-amber-400/30 text-amber-400 bg-amber-500/10",
                    glow: "bg-amber-500/20"
                  }
                ].map((s) => (
                  <div 
                    key={s.step}
                    className="relative overflow-hidden rounded-[2rem] border-2 border-white/[0.08] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 p-7 backdrop-blur-2xl shadow-lg hover:border-white/20 transition-all duration-300"
                  >
                    <div className={cn("absolute -right-12 -top-12 h-32 w-32 rounded-full blur-[70px] opacity-30 pointer-events-none", s.glow)} />
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black italic tracking-tighter text-white/20 font-mono">
                          {s.step}
                        </span>
                        <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border", s.color)}>
                          {s.tag}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-base font-black uppercase tracking-tight text-white">
                          {s.title}
                        </h4>
                        <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category-Reactive Laser Horizon Divider */}
            <div className="relative my-8 py-4">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent shadow-[0_0_25px_rgba(16,185,129,0.8)]" />
            </div>

            {/* Referral History Table Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
                    <span>Referred Creators</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {referralsList.length}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Live record of all friends registered through your invitation link
                  </p>
                </div>
              </div>

              {referralsList.length === 0 ? (
                <div className="text-center py-20 px-6 rounded-[2.5rem] border-2 border-white/[0.08] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 backdrop-blur-2xl shadow-xl space-y-5">
                  <div className="relative h-16 w-16 rounded-2xl flex items-center justify-center overflow-hidden bg-[#090a14] border border-white/10 shadow-xl mx-auto">
                    <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] opacity-60 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,rgba(16,185,129,0.6)_25%,transparent_50%)]" />
                    <div className="absolute inset-[1.5px] rounded-[calc(1rem-1.5px)] bg-[#090a14] z-0" />
                    <Gift size={28} className="relative z-10 text-emerald-400" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h4 className="text-base font-black uppercase tracking-tight text-white">
                      No referrals recorded yet
                    </h4>
                    <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                      Copy your personal link above and send it to fellow builders. As soon as your first creator signs up, their record will appear here.
                    </p>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    disabled={!referralCode}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black uppercase tracking-wider text-xs shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>{copiedLink ? "Link Copied!" : "Copy Referral Link Now"}</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[2rem] border-2 border-white/[0.08] bg-gradient-to-b from-[#0f111e]/90 via-[#0a0a14]/85 to-[#06060c]/90 backdrop-blur-2xl shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Friend</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Email</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Joined Date</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Membership Tier</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {referralsList.map((ref) => {
                          const date = new Date(ref.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });
                          return (
                            <tr key={ref.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                {ref.avatar ? (
                                  <img src={ref.avatar} alt={ref.name} className="w-8 h-8 rounded-full border border-white/10" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                                    {ref.name[0]?.toUpperCase()}
                                  </div>
                                )}
                                <span className="text-sm font-bold text-white">{ref.name}</span>
                              </td>
                              <td className="px-6 py-4 text-xs text-zinc-400 font-mono">
                                {ref.email || "Explorer"}
                              </td>
                              <td className="px-6 py-4 text-xs text-zinc-400 font-medium">
                                {date}
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border",
                                  ref.status === "upgraded"
                                    ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                )}>
                                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", ref.status === "upgraded" ? "bg-purple-400" : "bg-emerald-400")} />
                                  {ref.status === "upgraded" ? "Pro Member" : "Active Member"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
