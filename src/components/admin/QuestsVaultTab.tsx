"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Flame, 
  Gift, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Sparkles, 
  Trophy, 
  ShieldCheck, 
  Calendar, 
  Zap,
  Award,
  Crown,
  CheckCircle2,
  SlidersHorizontal,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestsVaultTabProps {
  onInspectUser: (userId: string) => void;
}

const RARITY_COLORS: Record<string, { badge: string; text: string; glow: string }> = {
  common: {
    badge: "bg-zinc-500/10 border-zinc-500/30 text-zinc-300",
    text: "text-zinc-300",
    glow: "shadow-[0_0_10px_rgba(161,161,170,0.15)]",
  },
  uncommon: {
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    text: "text-emerald-300",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.2)]",
  },
  rare: {
    badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    text: "text-cyan-300",
    glow: "shadow-[0_0_14px_rgba(6,182,212,0.25)]",
  },
  epic: {
    badge: "bg-purple-500/10 border-purple-500/30 text-purple-300",
    text: "text-purple-300",
    glow: "shadow-[0_0_16px_rgba(168,85,247,0.3)]",
  },
  legendary: {
    badge: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    text: "text-amber-300",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
  },
  mythic: {
    badge: "bg-rose-500/15 border-rose-500/40 text-rose-300",
    text: "text-rose-300",
    glow: "shadow-[0_0_25px_rgba(244,63,94,0.4)]",
  },
};

export function QuestsVaultTab({ onInspectUser }: QuestsVaultTabProps) {
  const [subSection, setSubSection] = useState<"quests" | "vault" | "leaderboard">("quests");

  // Quests State
  const [questsLoading, setQuestsLoading] = useState(true);
  const [questStats, setQuestStats] = useState<{
    totalQuestsClaimed: number;
    totalSparksAwarded: number;
    dailyQuestsCompleted: number;
    weeklyQuestsCompleted: number;
  }>({
    totalQuestsClaimed: 0,
    totalSparksAwarded: 0,
    dailyQuestsCompleted: 0,
    weeklyQuestsCompleted: 0,
  });
  const [questTransactions, setQuestTransactions] = useState<any[]>([]);
  const [questSearch, setQuestSearch] = useState("");
  const [questTypeFilter, setQuestTypeFilter] = useState("all");
  const [questPage, setQuestPage] = useState(1);
  const [questTotalPages, setQuestTotalPages] = useState(1);

  // Vault State
  const [vaultLoading, setVaultLoading] = useState(true);
  const [vaultStats, setVaultStats] = useState<{
    totalVaultClaims: number;
    totalCreditsGranted: number;
    claimsToday: number;
    avgCreditsPerDrop: number;
    activeStreakers: number;
    maxStreak: number;
  }>({
    totalVaultClaims: 0,
    totalCreditsGranted: 0,
    claimsToday: 0,
    avgCreditsPerDrop: 0,
    activeStreakers: 0,
    maxStreak: 0,
  });
  const [vaultClaims, setVaultClaims] = useState<any[]>([]);
  const [topStreakers, setTopStreakers] = useState<any[]>([]);
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultRarityFilter, setVaultRarityFilter] = useState("all");
  const [vaultPage, setVaultPage] = useState(1);
  const [vaultTotalPages, setVaultTotalPages] = useState(1);

  // Fetch Quests
  const fetchQuests = useCallback(async () => {
    setQuestsLoading(true);
    try {
      const params = new URLSearchParams({
        page: questPage.toString(),
        limit: "15",
        type: questTypeFilter,
        search: questSearch,
      });
      const res = await fetch(`/api/admin/quests?${params}`);
      const data = await res.json();
      if (data.success) {
        setQuestStats(data.stats);
        setQuestTransactions(data.transactions);
        setQuestTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("[ADMIN_QUESTS_FETCH_ERROR]", err);
    } finally {
      setQuestsLoading(false);
    }
  }, [questPage, questTypeFilter, questSearch]);

  // Fetch Vault
  const fetchVault = useCallback(async () => {
    setVaultLoading(true);
    try {
      const params = new URLSearchParams({
        page: vaultPage.toString(),
        limit: "15",
        rarity: vaultRarityFilter,
        search: vaultSearch,
      });
      const res = await fetch(`/api/admin/vault?${params}`);
      const data = await res.json();
      if (data.success) {
        setVaultStats(data.stats);
        setVaultClaims(data.claims);
        setTopStreakers(data.topStreakers || []);
        setVaultTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("[ADMIN_VAULT_FETCH_ERROR]", err);
    } finally {
      setVaultLoading(false);
    }
  }, [vaultPage, vaultRarityFilter, vaultSearch]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  return (
    <div className="space-y-8">
      {/* Top Engagement Telemetry HUD */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Quests Completed</span>
            <Trophy size={16} className="text-amber-400" />
          </div>
          <h3 className="text-3xl font-black text-white italic tracking-tight">{questStats.totalQuestsClaimed.toLocaleString()}</h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">
            Daily: <span className="text-amber-300 font-bold">{questStats.dailyQuestsCompleted}</span> · Weekly: <span className="text-purple-300 font-bold">{questStats.weeklyQuestsCompleted}</span>
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Sparks Awarded</span>
            <Zap size={16} className="text-cyan-400" />
          </div>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-blue-400 to-purple-400 italic tracking-tight">
            ⚡ {questStats.totalSparksAwarded.toLocaleString()}
          </h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">Earned directly via quest masteries</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Vault Drops Unboxed</span>
            <Gift size={16} className="text-purple-400" />
          </div>
          <h3 className="text-3xl font-black text-white italic tracking-tight">{vaultStats.totalVaultClaims.toLocaleString()}</h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">
            <span className="text-emerald-400 font-bold">+{vaultStats.claimsToday}</span> today · <span className="text-purple-300 font-bold">{vaultStats.totalCreditsGranted.toLocaleString()}</span> cr won
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Peak Streak Leader</span>
            <Flame size={16} className="text-orange-400" />
          </div>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-300 italic tracking-tight">
            🔥 {vaultStats.maxStreak} Days
          </h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">
            <span className="text-orange-300 font-bold">{vaultStats.activeStreakers}</span> creators with active streaks
          </p>
        </div>
      </section>

      {/* Sub-Section Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.02] border border-white/5">
          <button
            onClick={() => setSubSection("quests")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              subSection === "quests"
                ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
            )}
          >
            <Trophy size={13} />
            Quests Activity Feed ({questStats.totalQuestsClaimed})
          </button>

          <button
            onClick={() => setSubSection("vault")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              subSection === "vault"
                ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
            )}
          >
            <Gift size={13} />
            Daily Vault Unboxings ({vaultStats.totalVaultClaims})
          </button>

          <button
            onClick={() => setSubSection("leaderboard")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              subSection === "leaderboard"
                ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
            )}
          >
            <Flame size={13} />
            Streak Hall of Fame ({vaultStats.activeStreakers})
          </button>
        </div>

        <button
          onClick={() => {
            fetchQuests();
            fetchVault();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <RotateCw size={13} className={cn((questsLoading || vaultLoading) && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* VIEW 1: QUESTS ACTIVITY STREAM */}
      {subSection === "quests" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Trophy size={17} className="text-amber-400" />
                Live Quest Claims Stream
              </h3>
              <p className="text-xs text-zinc-500">Real-time audit of daily directives and weekly masteries completed by creators.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter creator..."
                  value={questSearch}
                  onChange={(e) => {
                    setQuestSearch(e.target.value);
                    setQuestPage(1);
                  }}
                  className="bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-amber-400/40 text-xs rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-500 outline-hidden w-[200px]"
                />
              </div>

              <select
                value={questTypeFilter}
                onChange={(e) => {
                  setQuestTypeFilter(e.target.value);
                  setQuestPage(1);
                }}
                className="bg-[#0b0c12] border border-white/5 hover:border-white/10 text-xs rounded-xl px-3 py-2.5 text-zinc-300 outline-hidden"
              >
                <option value="all">All Quests</option>
                <option value="daily">Daily Directives</option>
                <option value="weekly">Weekly Masteries</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0b0c12]/40 overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Creator</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Quest Directive</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Cycle</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Sparks Awarded</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Balance After</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Completed</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {questsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-xs text-zinc-500">
                        Loading quest completions...
                      </td>
                    </tr>
                  ) : questTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-xs text-zinc-500">
                        No quest completions recorded matching filters.
                      </td>
                    </tr>
                  ) : (
                    questTransactions.map((tx) => {
                      const isWeekly = tx.description?.toLowerCase().includes("weekly") || tx.metadata?.questType === "weekly";
                      return (
                        <tr key={tx.id} className="hover:bg-white/[0.015] transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            {tx.user?.image ? (
                              <img src={tx.user.image} alt={tx.user.name || ""} className="w-7 h-7 rounded-full border border-white/10" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center text-[10px] font-black">
                                {tx.user?.name ? tx.user.name[0]?.toUpperCase() : "C"}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white leading-tight">
                                {tx.user?.name || "Creator"}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-semibold">{tx.user?.email}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-zinc-200">
                              {tx.description || "Completed quest mastery"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                isWeekly
                                  ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                              )}
                            >
                              {isWeekly ? "Weekly" : "Daily"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-xs font-black text-cyan-300">
                              <Zap size={12} className="text-cyan-400 fill-cyan-400" />
                              +{tx.amount} ⚡
                            </span>
                          </td>

                          <td className="px-6 py-4 text-xs font-bold text-zinc-400">
                            ⚡ {tx.balanceAfter}
                          </td>

                          <td className="px-6 py-4 text-[11px] text-zinc-500 font-medium">
                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => onInspectUser(tx.userId)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-amber-400/40 hover:bg-amber-400/10 text-zinc-400 hover:text-amber-300 text-xs font-bold transition-all"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {questTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/[0.01]">
                <span className="text-[10px] font-bold text-zinc-500">
                  Page {questPage} of {questTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuestPage((p) => Math.max(p - 1, 1))}
                    disabled={questPage === 1}
                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setQuestPage((p) => Math.min(p + 1, questTotalPages))}
                    disabled={questPage === questTotalPages}
                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: DAILY VAULT UNBOXINGS */}
      {subSection === "vault" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Gift size={17} className="text-purple-400" />
                Daily Vault Drop Ledger
              </h3>
              <p className="text-xs text-zinc-500">Live unboxings, credits granted, and active streak days per creator.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter creator..."
                  value={vaultSearch}
                  onChange={(e) => {
                    setVaultSearch(e.target.value);
                    setVaultPage(1);
                  }}
                  className="bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-purple-400/40 text-xs rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-500 outline-hidden w-[200px]"
                />
              </div>

              <select
                value={vaultRarityFilter}
                onChange={(e) => {
                  setVaultRarityFilter(e.target.value);
                  setVaultPage(1);
                }}
                className="bg-[#0b0c12] border border-white/5 hover:border-white/10 text-xs rounded-xl px-3 py-2.5 text-zinc-300 outline-hidden"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
                <option value="mythic">Mythic</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0b0c12]/40 overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Creator</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Active Streak</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Shields</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Drop Rarity</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Credits Won</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Unboxed At</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vaultLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-xs text-zinc-500">
                        Loading daily vault drops...
                      </td>
                    </tr>
                  ) : vaultClaims.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-xs text-zinc-500">
                        No vault drops unboxed matching filters.
                      </td>
                    </tr>
                  ) : (
                    vaultClaims.map((claim) => {
                      const rarityStyle = RARITY_COLORS[claim.rarity?.toLowerCase()] || RARITY_COLORS.common;
                      return (
                        <tr key={claim.id} className="hover:bg-white/[0.015] transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            {claim.user?.image ? (
                              <img src={claim.user.image} alt={claim.user.name || ""} className="w-7 h-7 rounded-full border border-white/10" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-black">
                                {claim.user?.name ? claim.user.name[0]?.toUpperCase() : "C"}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white leading-tight">
                                {claim.user?.name || "Creator"}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-semibold">{claim.user?.email}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-[10px] font-black uppercase tracking-wider">
                              <Flame size={11} className="text-orange-400 fill-orange-400" />
                              {claim.user?.dailyStreak || 0}d Streak
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-300">
                              <ShieldCheck size={13} className={cn((claim.user?.streakShields || 0) > 0 ? "text-cyan-400" : "text-zinc-600")} />
                              {claim.user?.streakShields || 0}/3
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                rarityStyle.badge,
                                rarityStyle.glow
                              )}
                            >
                              {claim.rarity}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-xs font-black text-purple-300">
                              <Coins size={12} className="text-purple-400" />
                              +{claim.amount} cr
                            </span>
                          </td>

                          <td className="px-6 py-4 text-[11px] text-zinc-500 font-medium">
                            {new Date(claim.createdAt).toLocaleDateString()} {new Date(claim.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => onInspectUser(claim.userId)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-purple-400/40 hover:bg-purple-400/10 text-zinc-400 hover:text-purple-300 text-xs font-bold transition-all"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {vaultTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/[0.01]">
                <span className="text-[10px] font-bold text-zinc-500">
                  Page {vaultPage} of {vaultTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVaultPage((p) => Math.max(p - 1, 1))}
                    disabled={vaultPage === 1}
                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setVaultPage((p) => Math.min(p + 1, vaultTotalPages))}
                    disabled={vaultPage === vaultTotalPages}
                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: STREAK HALL OF FAME */}
      {subSection === "leaderboard" && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Flame size={17} className="text-orange-400" />
              Streak Hall of Fame (Top 20 Creators)
            </h3>
            <p className="text-xs text-zinc-500">Platform creators ranked by consecutive login streak, equipped shields, and vault drops.</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0b0c12]/40 overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Rank</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Creator</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Streak Record</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Active Shields</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Sparks Balance</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Total Unboxings</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Last Claim Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {topStreakers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-xs text-zinc-500">
                        No creators with active streaks yet.
                      </td>
                    </tr>
                  ) : (
                    topStreakers.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-white/[0.015] transition-colors">
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex w-6 h-6 items-center justify-center rounded-full text-[10px] font-black",
                            idx === 0 && "bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]",
                            idx === 1 && "bg-zinc-300 text-black",
                            idx === 2 && "bg-amber-700 text-white",
                            idx > 2 && "text-zinc-500"
                          )}>
                            #{idx + 1}
                          </span>
                        </td>

                        <td className="px-6 py-4 flex items-center gap-3">
                          {user.image ? (
                            <img src={user.image} alt={user.name || ""} className="w-7 h-7 rounded-full border border-white/10" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] font-black">
                              {user.name ? user.name[0]?.toUpperCase() : "C"}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white leading-tight">
                              {user.name || "Creator"}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-semibold">{user.email}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/15 text-orange-300 text-xs font-black">
                            <Flame size={13} className="text-orange-400 fill-orange-400" />
                            {user.dailyStreak} Days
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-300">
                            <ShieldCheck size={14} className={cn(user.streakShields > 0 ? "text-cyan-400" : "text-zinc-600")} />
                            {user.streakShields}/3
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs font-bold text-cyan-300">
                          ⚡ {user.sparks ?? 0}
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-zinc-400">
                          🎁 {user._count?.creditShopClaims ?? 0} drops
                        </td>

                        <td className="px-6 py-4 text-[11px] text-zinc-500 font-medium">
                          {user.lastClaimDate ? new Date(user.lastClaimDate).toLocaleDateString() : "Never"}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => onInspectUser(user.id)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-orange-400/40 hover:bg-orange-400/10 text-zinc-400 hover:text-orange-300 text-xs font-bold transition-all"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
