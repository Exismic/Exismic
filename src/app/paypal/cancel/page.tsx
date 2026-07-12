"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Loader2, RotateCcw } from "lucide-react";
import { ExismicMark } from "@/components/ui/ExismicLogo";

export default function PayPalCancelPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    const redirectParams = new URLSearchParams({ payment: "cancelled", source: "paypal" });
    const target = plan === "pro" ? `/pro?${redirectParams}` : `/shop?${redirectParams}`;
    const timer = window.setTimeout(() => {
      window.location.replace(target);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030305] px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(124,58,237,0.18),transparent_36%),radial-gradient(circle_at_75%_80%,rgba(34,211,238,0.10),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:48px_48px] opacity-25" />

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
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">PayPal Payment</p>
                <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">Checkout cancelled</h1>
              </div>
            </div>
          </div>

          <div className="p-6 text-center sm:p-8">
            <div className="mx-auto mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-zinc-200">
              <CreditCard size={30} />
            </div>
            <p className="text-xl font-black text-white">No payment was captured.</p>
            <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-zinc-500">
              You left PayPal before approving checkout. Exismic will bring you back automatically.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/80">
              <Loader2 size={14} className="animate-spin" /> Redirecting
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/shop?payment=cancelled&source=paypal"
                className="flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white/[0.08]"
              >
                <ArrowLeft size={14} /> Credit shop
              </Link>
              <Link
                href="/pro?payment=cancelled&source=paypal"
                className="flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[10px] font-black uppercase tracking-[0.18em] text-black transition-all hover:bg-cyan-50"
              >
                Try again <RotateCcw size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}