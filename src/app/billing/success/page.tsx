"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  History,
  Loader2,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { ReceiptDownload } from "@/components/billing/ReceiptDownload";
import { billingAmount, receiptUrl, type BillingReceipt } from "@/lib/billing/receipt-data";

function BillingSuccessContent() {
  const params = useSearchParams();
  const gateway = params.get("gateway");
  const orderId = params.get("order");
  const paypalOrderId = params.get("token");
  const subscriptionId = params.get("subscription_id") || params.get("subscriptionId");

  const [receipt, setReceipt] = useState<BillingReceipt | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    let active = true;

    async function confirm() {
      setChecking(true);
      setError("");
      setReceipt(null);

      try {
        let confirmedOrderId = orderId;

        if (gateway === "paypal" && (subscriptionId || paypalOrderId)) {
          const response = await fetch(
            subscriptionId ? "/api/paypal/subscription/activate" : "/api/billing/paypal/capture",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(subscriptionId ? { subscriptionId } : { paypalOrderId }),
            }
          );
          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.error || "Payment confirmation is still pending.");
          }
          confirmedOrderId = data.orderId || confirmedOrderId;
        }

        if (!confirmedOrderId) {
          throw new Error("No confirmed purchase reference supplied. Check your purchase history to view your payment.");
        }

        const response = await fetch(
          `/api/billing/receipt?orderId=${encodeURIComponent(confirmedOrderId)}&format=json`,
          { cache: "no-store" }
        );
        const data = await response.json();
        if (!response.ok || !data.receipt) {
          throw new Error(data.error || "Your payment confirmation is still in progress.");
        }

        if (active) {
          setReceipt(data.receipt);

          // If payment was completed inside a secure popup, inform parent window and close popup
          if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage(
                {
                  type: "EXISMIC_PAYMENT_SUCCESS",
                  orderId: confirmedOrderId,
                },
                "*"
              );
              setTimeout(() => {
                if (typeof window !== "undefined" && window.opener) {
                  window.close();
                }
              }, 1200);
            } catch {
              // Ignore cross-origin issues
            }
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Payment could not be confirmed automatically. If charged, contact billing@exismic.xyz."
          );
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    void confirm();
    return () => {
      active = false;
    };
  }, [gateway, orderId, paypalOrderId, subscriptionId, attempt]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const typeParam = params.get("type");
  const planParam = params.get("plan");
  const isPro =
    typeParam === "pro" ||
    (planParam ? planParam.includes("pro") : false) ||
    Boolean(subscriptionId);
  const isCredits =
    typeParam === "credits" ||
    (planParam ? !planParam.includes("pro") : false);

  return (
    <main className="relative min-h-screen bg-[#04060a] text-white selection:bg-purple-500/30 selection:text-purple-200 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Ambient glowing atmospheric lighting (Deep Purple / Violet / Fuchsia) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[450px] rounded-full bg-purple-600/[0.15] blur-[160px]" />
        <div className="absolute top-[25%] left-[-120px] w-[500px] h-[500px] rounded-full bg-violet-600/[0.14] blur-[170px]" />
        <div className="absolute bottom-[15%] right-[-120px] w-[500px] h-[500px] rounded-full bg-fuchsia-600/[0.1] blur-[170px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:20px_20px] opacity-75" />
      </div>

      {/* Signature Exismic laser horizon divider at top */}
      <div className="fixed top-0 inset-x-0 z-30 h-[1px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />

      {/* Master Executive Glass Console */}
      <div className="relative z-10 w-full max-w-xl rounded-[32px] border border-white/[0.12] bg-[#070b16]/95 backdrop-blur-3xl shadow-[0_25px_90px_rgba(147,51,234,0.18),0_40px_100px_rgba(0,0,0,0.85)] p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Top radiant laser accent rim */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-90" />

        {/* 1. STATE: CHECKING / CONFIRMING */}
        {checking && (
          <div className="flex flex-col items-center text-center py-8 space-y-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-500/15 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <Loader2 className="animate-spin text-purple-400" size={32} />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                {isPro ? "Activating Pro Access" : "Verifying Transaction"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Confirming your payment
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md pt-1">
                {isPro
                  ? "Checking your record with the payment provider and activating your Exismic Pro membership…"
                  : isCredits
                  ? "Checking your record with the payment provider and provisioning your credits…"
                  : "Checking your record with the payment provider and activating your purchase…"}
              </p>
            </div>
          </div>
        )}

        {/* 2. STATE: SUCCESS */}
        {!checking && receipt && (
          <div className="space-y-6">
            {/* Header Badge & Title */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <CheckCircle2 size={34} strokeWidth={2.3} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Transaction Verified
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-purple-200 bg-clip-text text-transparent">
                  Payment confirmed!
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 pt-1">
                  Your purchase was successful and your account is ready.
                </p>
              </div>
            </div>

            {/* Order Summary Glass Card */}
            <div className="rounded-2xl border border-white/[0.09] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 sm:p-5 space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                    <Zap size={13} className="text-purple-400" />
                    <span>Active Purchase</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {receipt.item}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {receipt.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                    Amount Paid
                  </span>
                  <span className="text-lg sm:text-xl font-black text-white font-mono">
                    {billingAmount(receipt.amountMinor, receipt.currency)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-1.5 text-zinc-400">
                <span>
                  Reference: <span className="font-mono text-zinc-300">{receipt.reference}</span>
                </span>
                <span>
                  Provider:{" "}
                  <span className="text-purple-300 font-medium capitalize">
                    {receipt.provider === "razorpay" ? "Razorpay" : "PayPal"}
                  </span>
                </span>
              </div>
            </div>

            {/* Gift Voucher Box (if applicable) */}
            {receipt.isGift && receipt.giftCode && (
              <div className="rounded-2xl border border-purple-400/40 bg-purple-500/10 p-4 sm:p-5 space-y-3 shadow-[0_0_25px_rgba(168,85,247,0.18)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Single-Use Gift Pass
                  </span>
                  <span className="text-[11px] text-zinc-400">Share with recipient</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-black/60 border border-white/10">
                  <span className="font-mono font-bold text-sm sm:text-base text-purple-200 tracking-wider">
                    {receipt.giftCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(receipt.giftCode!)}
                    className="flex items-center gap-1.5 rounded-lg border border-purple-400/30 bg-purple-500/20 px-3 py-1.5 text-xs font-bold text-purple-200 hover:bg-purple-500/30 transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <Link
                    href={`/redeem?code=${encodeURIComponent(receipt.giftCode)}`}
                    className="inline-flex items-center gap-1.5 text-purple-300 hover:text-white underline underline-offset-2 font-medium"
                  >
                    <span>Open redemption link</span>
                    <ExternalLink size={12} />
                  </Link>
                  <span className="text-zinc-500 text-[11px]">Valid until redeemed</span>
                </div>
              </div>
            )}

            {/* 1-Click PDF Receipt Download */}
            <div className="space-y-2">
              <ReceiptDownload
                url={receiptUrl(receipt.transactionId)}
                className="w-full h-12"
              />
              <p className="text-[11px] text-center text-zinc-400">
                A copy of your receipt has also been sent to your email.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                href="/tools"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white hover:bg-zinc-100 text-black font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.985] shadow-[0_4px_20px_rgba(255,255,255,0.18)]"
              >
                <span>Start Creating</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/shop#purchases"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] hover:border-purple-400/40 text-zinc-300 hover:text-white font-semibold text-sm transition-all active:scale-[0.985]"
              >
                <History size={16} className="text-purple-400" />
                <span>Purchase History</span>
              </Link>
            </div>
          </div>
        )}

        {/* 3. STATE: ERROR / ATTENTION NEEDED */}
        {!checking && error && (
          <div className="space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                <ShieldAlert size={34} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Verification Pending
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Payment needs attention
                </h1>
                <p className="mt-1 text-xs text-zinc-400">
                  Check your purchase status or refresh before paying again.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs sm:text-sm text-amber-200 space-y-2">
              <p>{error}</p>
              <p className="text-zinc-400 text-xs">
                If your card or bank shows a debit, please do not worry. Your payment is safe. We will verify and update your account balance shortly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAttempt((n) => n + 1)}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-purple-400/40 bg-purple-600/25 hover:bg-purple-600/35 text-purple-200 font-bold text-sm transition-all cursor-pointer"
              >
                <span>Check again</span>
              </button>
              <Link
                href="/shop#purchases"
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.04] text-zinc-300 hover:text-white font-semibold text-sm transition-all"
              >
                <span>Open Purchases</span>
              </Link>
            </div>
          </div>
        )}

        {/* Footer Support Link */}
        <div className="pt-3 border-t border-white/[0.08] text-center text-xs text-zinc-500">
          <span>Need assistance? </span>
          <a
            href="mailto:billing@exismic.xyz"
            className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
          >
            Contact Billing Support
          </a>
        </div>
      </div>
    </main>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#04060a] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Loading Confirmation…
            </span>
          </div>
        </div>
      }
    >
      <BillingSuccessContent />
    </Suspense>
  );
}
