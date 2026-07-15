"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Coins, TrendingUp, Copy, Check, Info, Sparkles, UserPlus, Gift, AlertCircle, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface ReferredFriend {
  id: string;
  name: string;
  avatar?: string | null;
  email: string;
  status: string;
  createdAt: string;
}

export default function ReferralsPage() {
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
          setReferralsList(json.referrals);
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
    if (typeof window !== "undefined") {
      return `${window.location.origin}?ref=${referralCode}`;
    }
    return `https://exismic.com?ref=${referralCode}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getReferralLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-accent-purple/30 pb-32 overflow-hidden" suppressHydrationWarning>
      {/* Cinematic Background Architecture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04)_0%,transparent_70%)]" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-accent-purple/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-32 space-y-16 relative z-10">
        <header className="space-y-6">
          <div className="inline-flex items-center gap-3 text-emerald-400">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl animate-pulse" />
              <Users size={24} className="relative z-10" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Referrals / Share the Flow</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none select-none">
              Refer & <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-emerald-200 to-emerald-500 drop-shadow-[0_2px_15px_rgba(16,185,129,0.4)]">Earn Credits.</span>
            </h1>
            <p className="text-zinc-500 font-medium text-lg max-w-xl leading-relaxed">
              Invite your creative circle. Both of you receive **+50 bonus credits** on signup, and you earn a **10% life commission** on their purchases.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Stats Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stat 1 */}
              <div className="relative group p-6 rounded-3xl bg-[#0b0c12]/60 border border-white/5 overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Friends Invited</p>
                    <h3 className="text-3xl font-black text-white italic tracking-tight">{totalReferred}</h3>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-emerald-400">
                    <UserPlus size={20} />
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="relative group p-6 rounded-3xl bg-[#0b0c12]/60 border border-white/5 overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Credits Earned</p>
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-emerald-500 italic tracking-tight">
                      +{totalEarned}
                    </h3>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-emerald-400">
                    <Coins size={20} />
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="relative group p-6 rounded-3xl bg-[#0b0c12]/60 border border-white/5 overflow-hidden transition-all duration-300 hover:border-emerald-500/30 sm:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Commission Rate</p>
                    <h3 className="text-3xl font-black text-white italic tracking-tight">10%</h3>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-emerald-400">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sharing Interface */}
            <div className="relative group p-8 sm:p-12 rounded-[2.5rem] bg-[#0b0c12]/80 border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] hover:border-emerald-500/20 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
                <div className="lg:col-span-3 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles size={10} /> Viral Referral Link
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Your Affiliate Code</h2>
                  <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                    Copy your link below to send to friends. When they complete signup, both of you are rewarded with bonus permanent credits automatically!
                  </p>
                </div>

                <div className="lg:col-span-2 space-y-4 w-full">
                  {/* Share Link Row */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Copy Referral Link</span>
                    <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 hover:border-white/15 transition-all">
                      <span className="text-xs font-semibold text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] sm:max-w-xs md:max-w-[400px] lg:max-w-[180px] xl:max-w-[260px]">
                        {getReferralLink()}
                      </span>
                      <button
                        onClick={handleCopyLink}
                        className={cn(
                          "ml-auto p-2 rounded-lg transition-all",
                          copiedLink 
                            ? "bg-emerald-500 text-black" 
                            : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95"
                        )}
                      >
                        {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Share Code Row */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Or Share Code</span>
                    <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 hover:border-white/15 transition-all">
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                        {referralCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className={cn(
                          "ml-auto p-2 rounded-lg transition-all",
                          copiedCode 
                            ? "bg-emerald-500 text-black" 
                            : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95"
                        )}
                      >
                        {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral History Table */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Referred Creators</h3>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {referralsList.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-[2.5rem] backdrop-blur-md">
                  <div className="w-16 h-16 rounded-full bg-zinc-950/80 border border-white/5 flex items-center justify-center mx-auto text-zinc-700 mb-5 shadow-inner">
                    <Gift size={26} />
                  </div>
                  <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">No referrals yet</h4>
                  <p className="text-xs font-semibold text-zinc-500 mt-2 max-w-sm mx-auto">
                    Share your custom link with friends to claim your first free referral reward!
                  </p>
                </div>
              ) : (
                <div className="border border-white/5 bg-[#0b0c12]/40 rounded-[2rem] overflow-hidden backdrop-blur-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01]">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Friend</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Email</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Registered</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
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
                                  <img src={ref.avatar} alt={ref.name} className="w-7 h-7 rounded-full border border-white/10" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                                    {ref.name[0]?.toUpperCase()}
                                  </div>
                                )}
                                <span className="text-sm font-bold text-white">{ref.name}</span>
                              </td>
                              <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                                {ref.email || "Explorer"}
                              </td>
                              <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                                {date}
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                  ref.status === "upgraded"
                                    ? "bg-accent-purple/10 border border-accent-purple/20 text-accent-purple"
                                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                )}>
                                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", ref.status === "upgraded" ? "bg-accent-purple" : "bg-emerald-400")} />
                                  {ref.status}
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
