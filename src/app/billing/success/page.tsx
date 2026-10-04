"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { ReceiptDownload } from "@/components/billing/ReceiptDownload";
import { billingAmount, receiptUrl, type BillingReceipt } from "@/lib/billing/receipt-data";

export default function BillingSuccessPage() {
  const params = useSearchParams();
  const gateway = params.get("gateway");
  const orderId = params.get("order");
  const paypalOrderId = params.get("token");
  const subscriptionId = params.get("subscription_id") || params.get("subscriptionId");
  const [receipt, setReceipt] = useState<BillingReceipt | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    async function confirm() {
      setChecking(true); setError(""); setReceipt(null);
      try {
        let confirmedOrderId = orderId;
        if (gateway === "paypal" && (subscriptionId || paypalOrderId)) {
          const response = await fetch(subscriptionId ? "/api/paypal/subscription/activate" : "/api/billing/paypal/capture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscriptionId ? { subscriptionId } : { paypalOrderId }) });
          const data = await response.json();
          if (!response.ok || !data.success) throw new Error(data.error || "Payment confirmation is still pending.");
          confirmedOrderId = data.orderId || confirmedOrderId;
        }
        if (!confirmedOrderId) throw new Error("No confirmed purchase was supplied. Open purchase history to find your payment.");
        const response = await fetch(`/api/billing/receipt?orderId=${encodeURIComponent(confirmedOrderId)}&format=json`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok || !data.receipt) throw new Error(data.error || "Your payment has not been confirmed yet.");
        if (active) setReceipt(data.receipt);
      } catch (err) { if (active) setError(err instanceof Error ? err.message : "Payment could not be confirmed. If charged, contact billing@exismic.xyz."); }
      finally { if (active) setChecking(false); }
    }
    void confirm();
    return () => { active = false; };
  }, [gateway, orderId, paypalOrderId, subscriptionId, attempt]);
  return <main className="flex min-h-screen items-center justify-center bg-[#030306] px-4 py-12 text-white">
    <div className="w-full max-w-lg space-y-5 rounded-2xl border border-white/15 bg-white/[0.035] p-6 sm:p-8">
      {checking ? <Loader2 className="animate-spin text-cyan-200" size={38} /> : receipt ? <CheckCircle2 className="text-emerald-300" size={38} /> : <ShieldAlert className="text-amber-300" size={38} />}
      <h1 className="text-3xl font-bold">{checking ? "Confirming your payment" : receipt ? "Payment confirmed" : "Payment needs attention"}</h1>
      {checking && <p className="text-zinc-300">Checking your payment record before showing a receipt.</p>}
      {receipt && <>
        <div className="space-y-2 rounded-xl border border-white/10 p-4"><p className="font-semibold">{receipt.item}</p><p className="text-zinc-300">{receipt.description}</p><p className="text-xl font-bold">Paid: {billingAmount(receipt.amountMinor, receipt.currency)}</p><p className="break-all text-xs text-zinc-400">Receipt: {receipt.reference}</p></div>
        {receipt.isGift && (receipt.giftCode ? <div className="space-y-2 rounded-xl border border-amber-300/25 p-4"><p className="font-semibold">Your single-use gift voucher</p><p className="break-all font-mono text-amber-200">{receipt.giftCode}</p><Link href={`/redeem?code=${encodeURIComponent(receipt.giftCode)}`} className="inline-flex min-h-11 items-center text-cyan-200 underline">Open redemption link</Link><p className="text-sm text-zinc-400">Share the code with your recipient. Keep it private until redeemed.</p></div> : <p className="text-sm text-zinc-300">Your payment is confirmed. If your gift voucher is missing from the purchase email, contact billing support with the receipt reference.</p>)}
        <ReceiptDownload url={receiptUrl(receipt.transactionId)} className="w-full" />
        <p className="text-sm text-zinc-400">Your PDF receipt is also sent by email. You can download it again from purchase history.</p>
      </>}
      {error && <><p role="alert" className="text-sm text-amber-200">{error}</p><p className="text-sm text-zinc-300">If your bank shows a charge, check again or contact billing support before paying again.</p><button onClick={() => setAttempt(n => n + 1)} type="button" className="min-h-11 rounded-xl border border-white/20 px-4">Check again</button></>}
      {!checking && <Link className="inline-flex min-h-11 items-center rounded-xl bg-white px-5 font-semibold text-black" href="/shop#purchases">Open purchases & receipts</Link>}
      <a href="mailto:billing@exismic.xyz" className="block text-sm text-cyan-200 underline">Get billing help</a>
    </div>
  </main>;
}
