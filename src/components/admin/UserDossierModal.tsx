"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Flame, 
  Gift, 
  Zap, 
  WalletCards, 
  Trophy, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Calendar, 
  Clock, 
  Crown, 
  CheckCircle2, 
  Layers, 
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarWithFrame } from "@/components/ui/AvatarWithFrame";
import { PremiumName } from "@/components/ui/PremiumName";

interface UserDossierModalProps {
  userId: string | null;
  onClose: () => void;
}

export function UserDossierModal({ userId, onClose }: UserDossierModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"quests" | "vault" | "sparks" | "orders">("quests");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/admin/users/${userId}/dossier`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json);
        }
      })
      .catch((err) => console.error("[USER_DOSSIER_FETCH_ERROR]", err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  const copyId = () => {
    if (!data?.user?.id) return;
    navigator.clipboard.writeText(data.user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const user = data?.user;
  const summary = data?.summary;
  const history = data?.history;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[2.5rem] border border-white/10 bg-[#070814] shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_50px_rgba(168,85,247,0.2)] overflow-hidden">
        {/* Modal Top Beam */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

        {/* Header with Close Button */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 sm:px-8 py-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">
              Creator Intelligence Dossier
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono text-zinc-400">
              {userId}
            </span>
            <button
              onClick={copyId}
              title="Copy User ID"
              className="p-1 rounded-md hover:bg-white/10 text-zinc-500 hover:text-white transition-all"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Loading creator telemetry...
              </span>
            </div>
          </div>
        ) : !user ? (
          <div className="flex-1 p-12 text-center text-zinc-400">
            User details not found.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none">
            {/* Identity Showcase Card */}
            <div className="p-6 rounded-3xl bg-[#0b0c16] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <AvatarWithFrame
                  avatarUrl={user.customAvatarUrl || user.image}
                  frameId={user.avatarFrame}
                  displayName={user.name || "Creator"}
                  isPro={user.plan === "pro"}
                  size={64}
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <PremiumName
                      name={user.name || "Creator"}
                      gradientId={user.nameGradient}
                      insigniaId={user.insignia}
                      isPro={user.plan === "pro"}
                      className="text-lg font-black tracking-tight"
                    />
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                        user.plan === "pro"
                          ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                          : "bg-white/5 border-white/10 text-zinc-400"
                      )}
                    >
                      {user.plan}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 font-medium">{user.email}</p>
                  <p className="text-[10px] text-zinc-500">
                    Joined: {new Date(user.createdAt).toLocaleDateString()} · Status: <span className="text-emerald-400 font-bold uppercase">{user.status || "active"}</span>
                  </p>
                </div>
              </div>

              {/* Vitals Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3.5 py-2 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                  <Coins size={14} className="text-purple-400" />
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Credits</p>
                    <p className="text-xs font-bold text-white">{(user.dailyCredits || 0) + (user.bonusCredits || 0)} cr</p>
                  </div>
                </div>

                <div className="px-3.5 py-2 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                  <Zap size={14} className="text-cyan-400" />
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Sparks</p>
                    <p className="text-xs font-bold text-cyan-300">⚡ {user.sparks || 0}</p>
                  </div>
                </div>

                <div className="px-3.5 py-2 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                  <Flame size={14} className="text-orange-400" />
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Streak</p>
                    <p className="text-xs font-bold text-orange-300">{user.dailyStreak || 0}d ({user.streakShields || 0} 🛡️)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Tabs Switcher */}
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.02] border border-white/5">
              <button
                onClick={() => setActiveTab("quests")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  activeTab === "quests"
                    ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Trophy size={13} />
                Quests ({summary?.totalQuestsCompleted || 0})
              </button>

              <button
                onClick={() => setActiveTab("vault")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  activeTab === "vault"
                    ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Gift size={13} />
                Daily Vault ({summary?.totalVaultClaims || 0})
              </button>

              <button
                onClick={() => setActiveTab("sparks")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  activeTab === "sparks"
                    ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Zap size={13} />
                Sparks Shop ({history?.sparksRedemptions?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  activeTab === "orders"
                    ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <WalletCards size={13} />
                Orders ({summary?.totalOrdersCount || 0})
              </button>
            </div>

            {/* TAB CONTENT: QUESTS */}
            {activeTab === "quests" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                  <span>Total Sparks from Quests: <strong className="text-cyan-300">⚡ {summary?.totalQuestSparksEarned || 0}</strong></span>
                  <span>{history?.questCompletions?.length || 0} Recent Completions</span>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#0b0c12]/60 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Quest Directive</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Cycle</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Sparks</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {history?.questCompletions?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-zinc-500">
                            No quest completions recorded for this user.
                          </td>
                        </tr>
                      ) : (
                        history?.questCompletions?.map((q: any) => (
                          <tr key={q.id} className="hover:bg-white/[0.015]">
                            <td className="px-5 py-3.5 font-medium text-white">{q.description}</td>
                            <td className="px-5 py-3.5 text-zinc-400 capitalize">{q.metadata?.questType || "Daily"}</td>
                            <td className="px-5 py-3.5 font-bold text-cyan-300">+{q.amount} ⚡</td>
                            <td className="px-5 py-3.5 text-right text-zinc-500">
                              {new Date(q.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DAILY VAULT */}
            {activeTab === "vault" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                  <span>Total Credits Won: <strong className="text-purple-300">{summary?.totalVaultCreditsWon || 0} cr</strong></span>
                  <span>{history?.vaultClaims?.length || 0} Recent Unboxings</span>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#0b0c12]/60 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Drop Rarity</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Credits Granted</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Claim Date</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {history?.vaultClaims?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-zinc-500">
                            No daily vault claims recorded for this user.
                          </td>
                        </tr>
                      ) : (
                        history?.vaultClaims?.map((claim: any) => (
                          <tr key={claim.id} className="hover:bg-white/[0.015]">
                            <td className="px-5 py-3.5 font-bold uppercase tracking-wider text-zinc-200">{claim.rarity}</td>
                            <td className="px-5 py-3.5 font-bold text-purple-300">+{claim.amount} cr</td>
                            <td className="px-5 py-3.5 text-zinc-400">{new Date(claim.claimDate).toLocaleDateString()}</td>
                            <td className="px-5 py-3.5 text-right text-zinc-500">
                              {new Date(claim.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SPARKS SHOP */}
            {activeTab === "sparks" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                  <span>Total Sparks Spent: <strong className="text-rose-400">{summary?.totalSparksSpent || 0} ⚡</strong></span>
                  <span>{history?.sparksRedemptions?.length || 0} Store Transactions</span>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#0b0c12]/60 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Item</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Sparks</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Balance After</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Purchased At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {history?.sparksRedemptions?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-zinc-500">
                            No Sparks store purchases recorded for this user.
                          </td>
                        </tr>
                      ) : (
                        history?.sparksRedemptions?.map((s: any) => (
                          <tr key={s.id} className="hover:bg-white/[0.015]">
                            <td className="px-5 py-3.5 font-medium text-white">{s.description}</td>
                            <td className={cn("px-5 py-3.5 font-bold", s.amount < 0 ? "text-rose-400" : "text-emerald-400")}>
                              {s.amount < 0 ? `${s.amount} ⚡` : `+${s.amount} ⚡`}
                            </td>
                            <td className="px-5 py-3.5 text-zinc-400">⚡ {s.balanceAfter}</td>
                            <td className="px-5 py-3.5 text-right text-zinc-500">
                              {new Date(s.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ORDERS */}
            {activeTab === "orders" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                  <span>Total Real-Money Orders: <strong className="text-emerald-300">{summary?.totalOrdersCount || 0}</strong></span>
                  <span>{history?.promoRedemptions?.length || 0} Promo Codes Claimed</span>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#0b0c12]/60 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Product</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Provider</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">Amount Paid</th>
                        <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {history?.paymentTransactions?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-zinc-500">
                            No real-money transactions recorded for this user.
                          </td>
                        </tr>
                      ) : (
                        history?.paymentTransactions?.map((order: any) => (
                          <tr key={order.id} className="hover:bg-white/[0.015]">
                            <td className="px-5 py-3.5 font-medium text-white">{order.kind}</td>
                            <td className="px-5 py-3.5 text-zinc-400 capitalize">{order.provider}</td>
                            <td className="px-5 py-3.5 font-bold text-emerald-300">
                              {order.currency === "INR" ? `₹${(order.amount / 100).toLocaleString()}` : `$${(order.amount / 100).toFixed(2)}`}
                            </td>
                            <td className="px-5 py-3.5 text-right text-zinc-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
