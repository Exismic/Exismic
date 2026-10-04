"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Crown, Loader2, X } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { billingAmount } from "@/lib/billing/receipt-data";

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email?: string | null; plan?: string | null; subscriptionStatus?: string | null; subscription_status?: string | null; planExpiresAt?: string | Date | null; plan_expires_at?: string | Date | null } | null;
  onCancel: () => Promise<void>;
  isCancelling: boolean;
}
type Membership = { interval: "month" | "year" | null; recurring: boolean; status: string; periodEnd: string | null; amountMinor: number | null; currency: string | null };

export function ManageSubscriptionModal({ isOpen, onClose, user, onCancel, isCancelling }: ManageSubscriptionModalProps) {
  const [details, setDetails] = useState<Membership | null>(null);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [checking, setChecking] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const busy = isCancelling || checking;
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setDetails(null); setError(""); setConfirm(false);
    fetch("/api/billing/membership", { cache: "no-store" }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Billing details could not be loaded.");
      if (active) setDetails(data);
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : "Billing details could not be loaded."); });
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => close.current?.focus(), 0);
    return () => { active = false; window.clearTimeout(timer); document.body.style.overflow = overflow; previousFocus?.focus(); };
  }, [isOpen]);
  async function cancel() {
    setChecking(true); setError("");
    try {
      await onCancel();
      // Some callers catch their own errors. Check the account before claiming success.
      const response = await fetch("/api/billing/membership", { cache: "no-store" });
      const updated = await response.json();
      if (!response.ok || updated.status !== "cancelled") throw new Error("Cancellation has not been confirmed. Try again or contact billing support.");
      setDetails(updated); setConfirm(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Cancellation could not be confirmed."); }
    finally { setChecking(false); }
  }
  if (!isOpen) return null;
  const rawExpiry = details?.periodEnd || user?.plan_expires_at || user?.planExpiresAt;
  const expiry = rawExpiry ? new Date(rawExpiry) : null;
  const until = expiry && !Number.isNaN(expiry.getTime()) ? expiry.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not available";
  const cancelled = details?.status === "cancelled";
  return <Portal><div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-3 backdrop-blur-xl sm:p-6">
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="membership-title" className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-[#08070c] p-5 text-white sm:p-8" onKeyDown={event => {
      if (event.key === "Escape" && !busy) onClose();
      if (event.key === "Tab") {
        const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');
        const first = controls?.[0], last = controls?.[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }}>
      <div className="flex items-center justify-between gap-3"><h2 id="membership-title" className="flex items-center gap-2 text-xl font-bold"><Crown className="text-purple-300" size={22} /> Your Pro membership</h2><button ref={close} aria-label="Close membership details" onClick={onClose} disabled={busy} className="min-h-11 min-w-11 rounded-xl border border-white/15 p-3"><X size={18} /></button></div>
      <div className="mt-5 space-y-3 rounded-xl border border-white/10 p-4 text-sm">
        <p>500 daily credits. Unused daily credits reset each day.</p>
        <p>Purchased permanent credits stay in your account.</p>
        <p>Access available until: <strong>{until}</strong></p>
        {details ? <><p>{details.recurring ? details.interval === "year" ? "Annual subscription" : details.interval === "month" ? "Monthly subscription" : "Recurring subscription" : "Prepaid access · no automatic renewal"}</p>{details.recurring && !cancelled && details.amountMinor !== null && details.currency && <p>Renewal price: <strong>{billingAmount(details.amountMinor, details.currency)}{details.interval === "year" ? "/year" : details.interval === "month" ? "/month" : ""}</strong></p>}</> : !error && <p role="status" className="flex items-center gap-2 text-zinc-400"><Loader2 className="animate-spin" size={16} /> Checking billing details…</p>}
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-amber-200">{error}</p>}
      <Link href="/shop#purchases" className="mt-4 inline-flex min-h-11 items-center text-sm text-cyan-200 underline">Purchases & downloadable receipts</Link>
      {cancelled && <p role="status" className="mt-4 text-sm text-emerald-200">Future renewals are cancelled. Your paid Pro access remains available until {until}.</p>}
      {details?.recurring && !cancelled && <div className="mt-5 border-t border-white/10 pt-5">
        {confirm ? <><p className="text-sm text-zinc-300">Cancel future renewals? Your paid access stays available until {until}.</p><div className="mt-4 flex flex-wrap gap-3"><button disabled={busy} onClick={() => void cancel()} className="min-h-11 rounded-xl bg-red-400 px-4 font-semibold text-black disabled:opacity-60">{busy ? "Confirming cancellation…" : "Confirm cancellation"}</button><button disabled={busy} onClick={() => setConfirm(false)} className="min-h-11 rounded-xl border border-white/20 px-4">Keep subscription</button></div></> : <button onClick={() => setConfirm(true)} disabled={busy} className="min-h-11 rounded-xl border border-red-300/40 px-4 text-sm text-red-200">Cancel future renewals</button>}
      </div>}
      <a href="mailto:billing@exismic.xyz" className="mt-4 block text-sm text-cyan-200 underline">Get billing help</a>
    </div>
  </div></Portal>;
}
