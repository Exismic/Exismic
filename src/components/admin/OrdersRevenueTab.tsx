"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  WalletCards, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Crown, 
  Coins, 
  CheckCircle2, 
  Copy, 
  Check, 
  CreditCard,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrdersRevenueTabProps {
  onInspectUser: (userId: string) => void;
}

export function OrdersRevenueTab({ onInspectUser }: OrdersRevenueTabProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalOrders: number;
    subscriptionsCount: number;
    creditPacksCount: number;
    activeProUsers: number;
    totalRevenueINR: number;
    totalRevenueUSD: number;
  }>({
    totalOrders: 0,
    subscriptionsCount: 0,
    creditPacksCount: 0,
    activeProUsers: 0,
    totalRevenueINR: 0,
    totalRevenueUSD: 0,
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all"); // all | subscription | credits
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        gateway: gatewayFilter,
        kind: kindFilter,
        search,
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("[ADMIN_ORDERS_FETCH_ERROR]", err);
    } finally {
      setLoading(false);
    }
  }, [page, gatewayFilter, kindFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getProviderBadge = (provider: string) => {
    const p = (provider || "razorpay").toLowerCase();
    if (p.includes("razorpay")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-blue-500/30 bg-blue-500/10 text-blue-300">
          Razorpay
        </span>
      );
    }
    if (p.includes("paypal")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-sky-400/30 bg-sky-400/10 text-sky-300">
          PayPal
        </span>
      );
    }
    if (p.includes("stripe")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
          Stripe
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-zinc-500/30 bg-zinc-500/10 text-zinc-300">
        {provider}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Monetization HUD */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Gross Revenue</span>
            <WalletCards size={16} className="text-emerald-400" />
          </div>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-300 via-teal-300 to-cyan-300 italic tracking-tight">
            ₹{stats.totalRevenueINR.toLocaleString()}
          </h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">
            + ${stats.totalRevenueUSD.toLocaleString()} USD captured
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Active Pro Members</span>
            <Crown size={16} className="text-purple-400" />
          </div>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-purple-500 italic tracking-tight">
            {stats.activeProUsers} Creators
          </h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">
            {stats.subscriptionsCount} total recurring subscriptions
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Credit Packs Sold</span>
            <Coins size={16} className="text-cyan-400" />
          </div>
          <h3 className="text-3xl font-black text-white italic tracking-tight">
            {stats.creditPacksCount.toLocaleString()}
          </h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">Starter, Creator & Studio packs</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0b0c12]/70 border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Total Paid Orders</span>
            <CreditCard size={16} className="text-blue-400" />
          </div>
          <h3 className="text-3xl font-black text-white italic tracking-tight">
            {stats.totalOrders.toLocaleString()}
          </h3>
          <p className="mt-2 text-[11px] text-zinc-400 font-medium">All-time successful transactions</p>
        </div>
      </section>

      {/* Orders Ledger Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <WalletCards size={17} className="text-emerald-400" />
              Real-Money Orders & Subscriptions Ledger
            </h3>
            <p className="text-xs text-zinc-500">Audit who purchased credits or Pro memberships across Razorpay, Stripe, and PayPal.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search user, order ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-emerald-400/40 text-xs rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-zinc-500 outline-hidden w-[220px]"
              />
            </div>

            <select
              value={kindFilter}
              onChange={(e) => {
                setKindFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#0b0c12] border border-white/5 hover:border-white/10 text-xs rounded-xl px-3 py-2.5 text-zinc-300 outline-hidden"
            >
              <option value="all">All Products</option>
              <option value="subscription">Pro Subscriptions</option>
              <option value="credits">Credit Packs</option>
            </select>

            <select
              value={gatewayFilter}
              onChange={(e) => {
                setGatewayFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#0b0c12] border border-white/5 hover:border-white/10 text-xs rounded-xl px-3 py-2.5 text-zinc-300 outline-hidden"
            >
              <option value="all">All Gateways</option>
              <option value="razorpay">Razorpay</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
            </select>

            <button
              onClick={fetchOrders}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <RotateCw size={13} className={cn(loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl border border-white/5 bg-[#0b0c12]/40 overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Purchased Item</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Gateway</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Amount Paid</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Order / Payment ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500">Purchased At</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-500 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-zinc-500">
                      Loading orders & subscriptions...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-zinc-500">
                      No real-money orders recorded matching filters.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const isSub = (order.kind || "").toLowerCase().includes("subscription");
                    const formattedAmount =
                      order.currency === "INR"
                        ? `₹${(order.amount / 100).toLocaleString()}`
                        : `$${(order.amount / 100).toFixed(2)}`;
                    const displayRef =
                      order.providerPaymentId || order.providerOrderId || order.transactionReference || order.id;

                    return (
                      <tr key={order.id} className="hover:bg-white/[0.015] transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          {order.user?.image ? (
                            <img src={order.user.image} alt={order.user.name || ""} className="w-7 h-7 rounded-full border border-white/10" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">
                              {order.user?.name ? order.user.name[0]?.toUpperCase() : "C"}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white leading-tight">
                              {order.user?.name || "Customer"}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-semibold">{order.user?.email}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isSub ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-purple-500/30 bg-purple-500/10 text-purple-300">
                                <Crown size={10} />
                                Pro Subscription
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                                <Coins size={10} />
                                {order.metadata?.packName || "Credit Pack"}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {getProviderBadge(order.provider)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-emerald-300">
                            {formattedAmount}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[160px]">
                              {displayRef}
                            </span>
                            <button
                              onClick={() => copyToClipboard(displayRef, order.id)}
                              title="Copy transaction ID"
                              className="p-1 rounded-md hover:bg-white/10 text-zinc-500 hover:text-white transition-all"
                            >
                              {copiedId === order.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-[11px] text-zinc-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => onInspectUser(order.userId)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-emerald-400/40 hover:bg-emerald-400/10 text-zinc-400 hover:text-emerald-300 text-xs font-bold transition-all"
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
