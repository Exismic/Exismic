"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { billingAmount } from "@/lib/billing/receipt-data";
import { ReceiptDownload } from "./ReceiptDownload";

type Purchase = { id: string; name: string; status: string; amount: number; currency: string; date: string; gateway: string; reference: string; receiptUrl: string | null; giftUrl?: string | null };
const statusLabel = (status: string) => ({ paid: "Paid", failed: "Failed", REJECTED: "Rejected", PENDING_VERIFICATION: "Awaiting manual review", created: "Not completed", cancelled: "Cancelled" }[status] || "Awaiting confirmation");

export function PurchaseHistory() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const load = useCallback(async (before?: string) => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/billing/purchases${before ? `?before=${encodeURIComponent(before)}` : ""}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Purchase history could not be loaded.");
      setPurchases(previous => before ? [...previous, ...data.purchases].filter((p, i, all) => all.findIndex(x => x.id === p.id) === i) : data.purchases);
      setCursor(data.nextCursor || null);
    } catch (err) { setError(err instanceof Error ? err.message : "Purchase history could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <section aria-label="Purchase history" className="space-y-4 text-left">
    <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold text-white">Purchases & receipts</h3><button type="button" aria-label="Refresh purchase history" onClick={() => void load()} disabled={loading} className="min-h-11 rounded-lg border border-white/15 p-3 text-cyan-200"><RefreshCw size={16} /></button></div>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {!loading && !error && !purchases.length && <p className="text-sm text-zinc-400">No purchases yet. Receipts appear after payment is confirmed.</p>}
    {purchases.map(p => <article key={p.id} className="space-y-2 rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex flex-wrap justify-between gap-2"><h4 className="font-semibold text-white">{p.name}</h4><span className={p.status === "paid" ? "text-sm text-emerald-300" : "text-sm text-amber-200"}>{statusLabel(p.status)}</span></div>
      <p className="text-sm text-zinc-300">{billingAmount(p.amount, p.currency)} · {p.gateway === "gift_card" ? "Legacy gift-card submission" : p.gateway} · {new Date(p.date).toLocaleDateString()}</p>
      <p className="break-all text-xs text-zinc-400">Reference: {p.reference}</p>
      {p.receiptUrl && <ReceiptDownload url={p.receiptUrl} />}
      {p.giftUrl && <a href={p.giftUrl} className="inline-flex min-h-11 items-center px-3 text-sm text-cyan-200 underline">View gift voucher</a>}
    </article>)}
    {loading && <p role="status" className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="animate-spin" size={16} /> Loading purchases…</p>}
    {cursor && !loading && <button type="button" onClick={() => void load(cursor)} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm text-white">Load older purchases</button>}
    <a href="mailto:billing@exismic.xyz" className="block text-sm text-cyan-200 underline">Need help with a payment? Contact billing@exismic.xyz</a>
  </section>;
}
