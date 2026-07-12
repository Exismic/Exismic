"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

type CaptureState = "checking" | "success" | "failed";

export default function BillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gateway = searchParams.get("gateway");
  const paypalOrderId = searchParams.get("token");
  const paypalSubscriptionId = searchParams.get("subscription_id") || searchParams.get("subscriptionId");
  const purchaseType = searchParams.get("type") === "credits" ? "credits" : "pro";
  const credits = Number(searchParams.get("credits") || 0);
  const needsPayPalCheck = gateway === "paypal" && (purchaseType === "pro" ? Boolean(paypalSubscriptionId) : Boolean(paypalOrderId));
  const [state, setState] = useState<CaptureState>(needsPayPalCheck ? "checking" : "success");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (gateway !== "paypal") return;
    if (purchaseType === "pro" && !paypalSubscriptionId) return;
    if (purchaseType === "credits" && !paypalOrderId) return;

    let active = true;
    async function finishPayPalCheckout() {
      try {
        const endpoint = purchaseType === "pro" ? "/api/paypal/subscription/activate" : "/api/billing/paypal/capture";
        const payload = purchaseType === "pro"
          ? { subscriptionId: paypalSubscriptionId }
          : { paypalOrderId };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => null);
        if (!active) return;

        if (!response.ok || !data?.success) {
          setState("failed");
          setMessage(data?.error || "Payment could not be verified.");
          return;
        }

        setState("success");
      } catch (error) {
        if (!active) return;
        setState("failed");
        setMessage(error instanceof Error ? error.message : "Payment could not be verified.");
      }
    }

    void finishPayPalCheckout();
    return () => {
      active = false;
    };
  }, [gateway, paypalOrderId, paypalSubscriptionId, purchaseType]);

  useEffect(() => {
    if (state === "checking") return;
    const destination = state === "success"
      ? purchaseType === "credits" ? "/shop" : "/dashboard"
      : purchaseType === "credits" ? "/shop" : "/pricing";
    const delay = state === "success" ? 5 : 8;
    const timeout = window.setTimeout(() => router.replace(destination), delay * 1000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [purchaseType, router, state]);

  const copy = useMemo(() => {
    if (state === "checking") {
      return {
        title: "Finishing checkout",
        body: "Just a moment while we finish setting up your purchase.",
        action: "Please wait",
      };
    }

    if (state === "failed") {
      return {
        title: "Payment needs attention",
        body: message || "We could not finish this payment. If you were charged, contact support with your payment ID and we will help quickly.",
        action: "Back to billing",
      };
    }

    return purchaseType === "credits"
      ? {
          title: "Credits added",
          body: credits > 0
            ? `${credits.toLocaleString()} permanent credits have been added to your Exismic account.`
            : "Your permanent credits have been added to your Exismic account.",
          action: "Open shop",
        }
      : {
          title: "Welcome to Pro",
          body: "Your Exismic Pro membership is active. Enjoy priority access, expanded credits, and premium tools.",
          action: "Go to dashboard",
        };
  }, [credits, message, purchaseType, state]);

  const success = state === "success";
  const checking = state === "checking";

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#030306] px-4 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(139,92,246,0.22),transparent_34%),radial-gradient(circle_at_70%_65%,rgba(34,211,238,0.12),transparent_35%)]" />
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/35 shadow-[0_0_45px_rgba(34,211,238,0.12)]">
          {checking ? <Loader2 className="animate-spin text-cyan-200" size={34} /> : success ? <CheckCircle2 className="text-emerald-300" size={38} /> : <ShieldAlert className="text-red-300" size={36} />}
        </div>
        <h1 className="mt-6 text-3xl font-black">{copy.title}</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-zinc-400">{copy.body}</p>
        {!checking && (
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">
            Continuing automatically
          </p>
        )}
        {!checking && (
          <Link
            href={success && purchaseType === "credits" ? "/shop" : success ? "/dashboard" : "/pricing"}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 text-[10px] font-black uppercase tracking-[0.18em] text-black transition hover:-translate-y-0.5"
          >
            {copy.action}
          </Link>
        )}
      </div>
    </main>
  );
}


