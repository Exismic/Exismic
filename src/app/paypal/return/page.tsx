"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { ExismicMark } from "@/components/ui/ExismicLogo";

type CaptureState =
  | { status: "loading"; message: string }
  | { status: "success"; message: string; plan: string }
  | { status: "error"; message: string };

export default function PayPalReturnPage() {
  const [state, setState] = useState<CaptureState>({
    status: "loading",
    message: "Verifying your PayPal payment...",
  });

  const targetHref = useMemo(() => {
    if (state.status !== "success") return "/shop";
    return state.plan === "pro" ? "/pro" : "/shop";
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    async function capturePayment() {
      const params = new URLSearchParams(window.location.search);
      const returnedPlan = params.get("plan");
      const subscriptionId = params.get("subscription_id") || params.get("subscriptionId");
      const token = params.get("token");

      if (returnedPlan === "pro" && !subscriptionId) {
        const message = "PayPal did not return a subscription id.";
        setState({ status: "error", message });
        const failedParams = new URLSearchParams({ payment: "failed", source: "paypal", reason: message });
        window.setTimeout(() => window.location.replace(`/pro?${failedParams}`), 2200);
        return;
      }

      if (returnedPlan !== "pro" && !token) {
        const message = "PayPal did not return an order token.";
        setState({ status: "error", message });
        const failedParams = new URLSearchParams({ payment: "failed", source: "paypal", reason: message });
        window.setTimeout(() => window.location.replace(`/shop?${failedParams}`), 2200);
        return;
      }

      try {
        const response = await fetch(returnedPlan === "pro" ? "/api/paypal/subscription/activate" : "/api/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(returnedPlan === "pro" ? { subscriptionId } : { orderId: token }),
        });
        const data = await response.json().catch(() => null);

        if (cancelled) return;

        if (!response.ok || !data?.success) {
          const message = data?.error || "Exismic could not verify this PayPal payment.";
          setState({ status: "error", message });
          const failedParams = new URLSearchParams({ payment: "failed", source: "paypal", reason: message });
          window.setTimeout(() => {
            window.location.replace(returnedPlan === "pro" ? `/pro?${failedParams}` : `/shop?${failedParams}`);
          }, 2200);
          return;
        }

        const successPlan = String(data.plan || "credits");
        setState({
          status: "success",
          plan: successPlan,
          message:
            successPlan === "pro"
              ? "PayPal approved. Preparing your Pro welcome..."
              : "PayPal approved. Preparing your credit confirmation...",
        });

        const redirectParams = new URLSearchParams({ payment: "success", source: "paypal" });
        if (successPlan === "credits" && data.creditsAdded) {
          redirectParams.set("credits", String(data.creditsAdded));
        }
        window.setTimeout(() => {
          window.location.replace(successPlan === "pro" ? `/pro?${redirectParams}` : `/shop?${redirectParams}`);
        }, 1400);
      } catch (error) {
        if (cancelled) return;
        console.error("[PayPal] Return capture failed:", error);
        const message = "PayPal verification failed. Please try again.";
        setState({ status: "error", message });
        const failedParams = new URLSearchParams({ payment: "failed", source: "paypal", reason: message });
        window.setTimeout(() => {
          window.location.replace(returnedPlan === "pro" ? `/pro?${failedParams}` : `/shop?${failedParams}`);
        }, 2200);
      }
    }

    void capturePayment();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030305] px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.24),transparent_38%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-xl items-center">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="border-b border-white/10 p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-4">
              <ExismicMark size={54} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/75">PayPal Payment</p>
                <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">Payment verification</h1>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {state.status === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-100 shadow-[0_0_50px_rgba(34,211,238,0.14)]">
                      <Loader2 size={30} className="animate-spin" />
                    </div>
                    <p className="text-lg font-black text-white">{state.message}</p>
                    <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-zinc-500">
                      One moment. Exismic will bring you back automatically.
                    </p>
                  </motion.div>
                )}

                {state.status === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200 shadow-[0_0_50px_rgba(16,185,129,0.14)]">
                      <CheckCircle2 size={34} />
                    </div>
                    <p className="text-xl font-black text-white">{state.message}</p>
                    <p className="mt-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
                      <ShieldCheck size={14} /> Verified
                    </p>
                  </motion.div>
                )}

                {state.status === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-red-300/20 bg-red-300/[0.08] text-red-200 shadow-[0_0_50px_rgba(248,113,113,0.12)]">
                      <TriangleAlert size={32} />
                    </div>
                    <p className="text-xl font-black text-white">{state.message}</p>
                    <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-zinc-500">
                      No account changes were made unless PayPal was successfully captured.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href={targetHref}
              className="mt-4 flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-white px-5 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:-translate-y-0.5 hover:bg-cyan-50"
            >
              {state.status === "loading" ? "Verifying" : state.status === "success" ? "Redirecting" : "Return to Exismic"} <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
