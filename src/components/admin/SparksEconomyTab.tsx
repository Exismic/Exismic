"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Zap, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Sparkles, 
  ShoppingBag, 
  ShieldCheck, 
  Ticket, 
  Gift, 
  Palette,
  Coins,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SparksEconomyTabProps {
  onInspectUser: (userId: string) => void;
}

export function SparksEconomyTab({ onInspectUser }: SparksEconomyTabProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalSparksInCirculation: number;
    totalSparksSpent: number;
    totalRedemptionsCount: number;
    freeGiftClaimsCount: number;
  }>({
    totalSparksInCirculation: 0,
    totalSparksSpent: 0,
    totalRedemptionsCount: 0,
    freeGiftClaimsCount: 0,
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all"); // all | cosmetics | shields | vouchers | free_gift
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSparks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        category: categoryFilter,
        search,
      });
      const res = await fetch(`/api/admin/sparks?${params}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setTransactions(data.transactions);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("[ADMIN_SPARKS_FETCH_ERROR]", err);
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, search]);

  useEffect(() => {
    fetchSparks();
  }, [fetchSparks]);

  const getItemCategoryPill = (meta: any, desc: string, amount: number) => {
    const itemType = meta?.itemType || "";
    const lowerDesc = (desc || "").toLowerCase();

    if (lowerDesc.includes("free gift") || itemType === "free_sparks" || amount > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          <Gift size={10} />
          Community Gift
        </span>
      );
    }
    if (itemType === "streak_shield" || lowerDesc.includes("shield")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
          <ShieldCheck size={10} />
          Streak Shield
        </span>
      );
    }
    if (itemType === "shop_voucher" || lowerDesc.includes("voucher") || lowerDesc.includes("off")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-300">
          <Ticket size={10} />
          Discount Voucher
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-purple-500/30 bg-purple-500/10 text-purple-300">
        <Palette size={10} />
        Cosmetic
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Sparks Economy HUD */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Circulating Sparks</span>
            <Zap size={16} className="text-cyan-400" />
          </div>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-blue-400 to-purple-400 italic tracking-tight">
            ⚡ {stats.totalSparksInCirculation.toLocaleString()}
          </h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">Currently held across creator wallets</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Total Sparks Spent</span>
            <ShoppingBag size={16} className="text-purple-400" />
          </div>
          <h3 className="text-3xl font-black text-white italic tracking-tight">
            ⚡ {stats.totalSparksSpent.toLocaleString()}
          </h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">Burned via cosmetics, shields & vouchers</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Store Redemptions</span>
            <Ticket size={16} className="text-amber-400" />
          </div>
          <h3 className="text-3xl font-black text-white italic tracking-tight">
            {stats.totalRedemptionsCount.toLocaleString()}
          </h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">All-time Sparks store purchases</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">100 Sparks Gifts Claimed</span>
            <Gift size={16} className="text-emerald-400" />
          </div>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-teal-400 italic tracking-tight">
            {stats.freeGiftClaimsCount.toLocaleString()}
          </h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">7-day community celebration drops</p>
        </div>
      </section>

      {/* Main Ledger Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <ShoppingBag size={17} className="text-purple-400" />
              Sparks Redemptions & Purchases Feed
            </h3>
            <p className="text-xs text-zinc-500">Complete audit log of who purchased what item using Exismic Sparks.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search creator..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-purple-400/40 text-xs rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-500 outline-hidden w-[200px]"
              />
            </div>

            <div className="flex items-center gap-1 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
              {[
                { id: "all", label: "All" },
                { id: "cosmetics", label: "Cosmetics" },
                { id: "shields", label: "Shields" },
                { id: "vouchers", label: "Vouchers" },
                { id: "free_gift", label: "Free Gifts" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryFilter(cat.id);
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    categoryFilter === cat.id
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchSparks}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <RotateCw size={13} className={cn(loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-2xl border border-white/5 bg-[#0b0c12]/40 overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Creator</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Item Redeemed</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Sparks Change</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Balance After</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Purchased At</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-zinc-500">
                      Loading Sparks redemptions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-zinc-500">
                      No Sparks store purchases recorded matching filters.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        {tx.user?.image ? (
                          <img src={tx.user.image} alt={tx.user.name || ""} className="w-7 h-7 rounded-full border border-white/10" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-black">
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
                          {tx.description?.replace("Redeemed: ", "") || "Sparks Store Purchase"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {getItemCategoryPill(tx.metadata, tx.description, tx.amount)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-xs font-black",
                            tx.amount < 0 ? "text-rose-400" : "text-emerald-400"
                          )}
                        >
                          {tx.amount < 0 ? `${tx.amount} ⚡` : `+${tx.amount} ⚡`}
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
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-purple-400/40 hover:bg-purple-400/10 text-zinc-400 hover:text-purple-300 text-xs font-bold transition-all"
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/[0.01]">
              <span className="text-[10px] font-bold text-zinc-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
