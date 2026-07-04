"use client";

import React, { useState, useSyncExternalStore } from "react";
import Script from "next/script";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Archive,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Crown,
  Gauge,
  ImageDown,
  Loader2,
  Lock,
  MessageSquareText,
  Palette,
  Plus,
  RefreshCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";
import { ManageSubscriptionModal } from "@/components/tool/ManageSubscriptionModal";
import { PaymentSuccessModal } from "@/components/modals/PaymentSuccessModal";
import { PaymentFailureModal } from "@/components/modals/PaymentFailureModal";
import { LumoraMark } from "@/components/ui/LumoraLogo";
import { CreditTokenIcon } from "@/components/ui/CreditTokenIcon";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";

const subscribeToHydration = () => () => {};

const OUTCOMES = [
  { value: "20x", label: "daily credit capacity", icon: Gauge, tone: "text-fuchsia-300", wash: "from-fuchsia-500/[0.10]" },
  { value: "Fast", label: "priority processing", icon: Cpu, tone: "text-cyan-300", wash: "from-cyan-400/[0.10]" },
  { value: "Batch", label: "multi-file workflows", icon: Archive, tone: "text-blue-300", wash: "from-blue-500/[0.10]" },
  { value: "Clean", label: "commercial exports", icon: ShieldCheck, tone: "text-emerald-300", wash: "from-emerald-400/[0.10]" },
];

const CREATOR_BENEFITS = [
  {
    icon: ImageDown,
    title: "4K-ready exports",
    description: "Keep detail intact when supported tools produce high-resolution output.",
    tone: "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200",
  },
  {
    icon: Palette,
    title: "A workspace that feels yours",
    description: "Exclusive themes, avatar frames, and animated identity styles.",
    tone: "border-fuchsia-300/20 bg-fuchsia-300/[0.06] text-fuchsia-200",
  },
  {
    icon: WandSparkles,
    title: "New tools before everyone else",
    description: "Early access to new creative workflows and AI capabilities.",
    tone: "border-amber-300/20 bg-amber-300/[0.06] text-amber-200",
  },
  {
    icon: MessageSquareText,
    title: "Unlimited AI conversations",
    description: "Think, refine, and build without a daily message ceiling.",
    tone: "border-purple-300/20 bg-purple-300/[0.06] text-purple-200",
  },
  {
    icon: Code2,
    title: "Code and creative power together",
    description: "Use the same membership across Lumora AI, Code Studio, and Pro tools.",
    tone: "border-blue-300/20 bg-blue-300/[0.06] text-blue-200",
  },
  {
    icon: Shield,
    title: "Commercial usage rights",
    description: "Use eligible Pro outputs for brands, client work, and paid projects.",
    tone: "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200",
  },
];

const COMPARISON_ROWS = [
  { label: "Daily creative credits", free: "50", pro: "1,000" },
  { label: "Processing route", free: "Standard queue", pro: "Priority mode" },
  { label: "Supported image jobs", free: "One at a time", pro: "Batch + ZIP" },
  { label: "Generated-image watermark", free: "Standard export", pro: "Removed" },
  { label: "Commercial usage", free: "Personal use", pro: "Included" },
  { label: "Profile customization", free: "Core identity", pro: "Themes + effects" },
];

const FAQS = [
  {
    question: "Do my Pro credits reset every day?",
    answer: `Yes. Pro restores ${PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS.toLocaleString()} daily credits at the daily reset. Permanent credits you purchase separately do not expire.`,
  },
  {
    question: "Can I cancel whenever I want?",
    answer: "Yes. You can cancel from your Lumora account. Your Pro access remains available through the end of the paid billing period.",
  },
  {
    question: "Does Pro work across every Lumora tool?",
    answer: "Your membership is account-wide. Pro gating, priority routing, expanded limits, and premium identity features follow your account across Lumora.",
  },
  {
    question: "What does priority processing mean?",
    answer: "Eligible heavy jobs are routed through Lumora's priority path, reducing time spent waiting behind standard jobs when capacity is busy.",
  },
  {
    question: "I paid but Pro is not showing. What should I do?",
    answer: "Use the Sync purchase option below. Lumora will securely re-check the payment record and refresh your membership status.",
  },
];

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

type RazorpayConstructor = new (options: RazorpayOptions) => { open: () => void };

export function ProClient() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { user, authUser, isPro, isLoading: isProLoading, refresh } = usePro();
  const [loading, setLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const paymentsEnabled = PRICING_CONFIG.PAYMENTS_ENABLED;

  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const isIndia = isHydrated && getIsIndia();
  const currencySymbol = isIndia ? "Rs " : "$";
  const priceDisplay = isIndia
    ? PRICING_CONFIG.PRO_PLAN.INR.toString()
    : PRICING_CONFIG.PRO_PLAN.USD.toString();
  const currencyCode = isIndia ? "INR" : "USD";
  const subscriptionStatus = String(user?.subscriptionStatus || user?.subscription_status || "").toLowerCase();
  const isSubscriptionCancelled = subscriptionStatus === "cancelled";
  const proAccessUntil = user?.planExpiresAt || user?.plan_expires_at;
  const proAccessUntilLabel = proAccessUntil
    ? new Date(proAccessUntil).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleUpgrade = async () => {
    if (!paymentsEnabled) {
      setToast({ message: PRICING_CONFIG.PAYMENT_UNAVAILABLE_MESSAGE, type: "info" });
      return;
    }
    if (!user && !authUser) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "pro",
          currency: currencyCode,
        }),
      });

      const order = await res.json();
      if (!res.ok || order.error) throw new Error(order.error || "Could not start checkout.");

      const options: RazorpayOptions = {
        key: order.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: order.amount,
        currency: order.currency,
        name: "Lumora Pro",
        description: "Lumora Pro monthly membership",
        order_id: order.id,
        handler: async (response: RazorpayResponse) => {
          setLoading(true);
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                plan: "pro",
                isINR: isIndia,
              }),
            });

            const result = await verifyRes
              .json()
              .catch(() => ({ error: "Payment verification returned an invalid response." }));

            if (verifyRes.ok && result.success) {
              if (typeof window !== "undefined" && (user?.email || authUser?.email)) {
                localStorage.removeItem(`cancelled_${user?.email || authUser?.email}`);
              }
              await refresh();
              setShowSuccess(true);
              router.refresh();
            } else {
              setToast({
                message:
                  result.error ||
                  result.message ||
                  "Payment succeeded, but activation needs support review. Keep your payment ID.",
                type: "error",
              });
              setShowFailure(true);
            }
          } catch (verifyError) {
            console.error("[Razorpay] Verification request failed:", verifyError);
            setToast({
              message: "Payment succeeded, but Lumora could not verify it. Keep your payment ID and contact support.",
              type: "error",
            });
            setShowFailure(true);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.full_name || user?.name || authUser?.user_metadata?.full_name || "",
          email: user?.email || authUser?.email || "",
        },
        theme: { color: "#7c3aed" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const checkoutWindow = window as Window & { Razorpay?: RazorpayConstructor };
      if (!checkoutWindow.Razorpay) {
        throw new Error("Payment checkout failed to load. Please refresh and try again.");
      }

      new checkoutWindow.Razorpay(options).open();
    } catch (error: unknown) {
      console.error("[Razorpay] Checkout failed:", error);
      setToast({
        message: error instanceof Error ? error.message : "Checkout could not start. Please try again.",
        type: "error",
      });
      setShowFailure(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPurchase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/sync", { method: "POST" });
      const result = await res.json();
      if (res.ok && result.success) {
        await refresh();
        setToast({ message: "Purchase restored. Your membership is up to date.", type: "success" });
        router.refresh();
      } else {
        setToast({ message: result.error || "No verified payment was found.", type: "error" });
      }
    } catch {
      setToast({ message: "Lumora could not sync your purchase right now.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/razorpay/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setToast({
          message: "Subscription cancelled. Pro remains active through the current billing period.",
          type: "info",
        });
        setIsModalOpen(false);
        await refresh();
        router.refresh();
      } else {
        setToast({ message: result.error || "Subscription could not be cancelled.", type: "error" });
      }
    } catch (error) {
      console.error("Cancel failed:", error);
      setToast({ message: "Lumora could not cancel the subscription right now.", type: "error" });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isProLoading) {
    return <ProPageSkeleton />;
  }

  return (
    <div className="min-h-screen scroll-smooth overflow-x-hidden bg-[#030306] text-zinc-100 selection:bg-purple-500/35">
      {paymentsEnabled && <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />}

      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent_62%)]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[820px] bg-[radial-gradient(ellipse_at_82%_18%,rgba(34,211,238,0.14),transparent_42%),radial-gradient(ellipse_at_30%_2%,rgba(124,58,237,0.24),transparent_46%),radial-gradient(ellipse_at_58%_24%,rgba(217,70,239,0.08),transparent_34%)]"
        animate={prefersReducedMotion ? undefined : { opacity: [0.72, 1, 0.78], scale: [1, 1.025, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <main className="relative z-10">
        <section className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden border-b border-white/[0.07] px-4 py-14 sm:px-6 md:py-20">
          <div className="pointer-events-none absolute -right-[12%] top-[8%] h-[72%] w-[58%] -rotate-12 bg-[linear-gradient(135deg,transparent_4%,rgba(124,58,237,0.12)_28%,rgba(217,70,239,0.10)_48%,rgba(34,211,238,0.13)_70%,transparent_92%)] blur-3xl" />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#8b5cf6,#ec4899,#22d3ee,transparent)]"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute right-[-80px] top-1/2 hidden -translate-y-1/2 opacity-20 md:block lg:right-[3vw] lg:opacity-30"
            animate={prefersReducedMotion ? undefined : { y: ["-50%", "-53%", "-50%"], rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <LumoraMark size={430} className="scale-[1.08]" />
          </motion.div>
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[54%] bg-linear-to-l from-cyan-400/[0.035] to-transparent lg:block" />

          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="max-w-[790px]"
            >
              <div className="mb-6 inline-flex min-h-9 items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/[0.07] px-3.5">
                <Crown size={13} className="fill-purple-300/15 text-purple-200" />
                <span className="text-[9px] font-black uppercase tracking-[0.24em] text-zinc-300">
                  The complete Lumora experience
                </span>
              </div>

              <h1 className="max-w-[760px] text-[clamp(3.5rem,9.5vw,7.7rem)] font-black leading-[0.83] tracking-[-0.055em] text-white">
                Lumora
                <span className="animate-gradient-x block bg-[linear-gradient(90deg,#a78bfa_0%,#e879f9_24%,#fb7185_46%,#22d3ee_72%,#818cf8_100%)] bg-[length:230%_100%] bg-clip-text text-transparent drop-shadow-[0_0_32px_rgba(217,70,239,0.18)]">
                  Pro.
                </span>
              </h1>

              <p className="mt-7 max-w-[650px] text-base font-medium leading-7 text-zinc-400 sm:text-lg sm:leading-8">
                Stop rationing ideas. Get the speed, capacity, clean exports, and creative ownership
                to turn more of your work into finished results.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                {isPro ? (
                  <button
                    type="button"
                    onClick={() => (isSubscriptionCancelled ? router.push("/tools") : setIsModalOpen(true))}
                    className="group relative flex min-h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-white px-6 text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_45px_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-100 active:translate-y-0"
                  >
                    <CheckCircle2 size={17} />
                    {isSubscriptionCancelled ? "Continue with Pro" : "Manage membership"}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={loading || !paymentsEnabled}
                    className="group relative flex min-h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(105deg,#7c3aed,#a855f7_36%,#2563eb_68%,#06b6d4)] px-6 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_55px_rgba(79,70,229,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_65px_rgba(34,211,238,0.2),0_0_30px_rgba(168,85,247,0.14)] disabled:cursor-wait disabled:opacity-70 active:translate-y-0"
                  >
                    <span className="absolute -left-24 inset-y-0 w-14 skew-x-[-20deg] bg-white/30 blur-sm transition-transform duration-1000 group-hover:translate-x-[720px]" />
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Crown size={17} />}
                    <span className="relative">{paymentsEnabled ? "Unlock Pro" : "Currently unavailable"}</span>
                    {!loading && paymentsEnabled && <ArrowRight size={16} className="relative transition-transform group-hover:translate-x-1" />}
                  </button>
                )}

                <div className="flex items-baseline gap-2 px-1">
                  <span className="text-3xl font-black tracking-tight text-white">
                    {currencySymbol}
                    {priceDisplay}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">
                    per month
                  </span>
                </div>
              </div>

              {paymentsEnabled ? (
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-600">
                  <span className="flex items-center gap-2">
                    <Lock size={11} /> Secure checkout
                  </span>
                  <span className="flex items-center gap-2">
                    <RefreshCcw size={11} /> Cancel anytime
                  </span>
                  <span>{isIndia ? "Billed in INR" : "Billed in USD"}</span>
                </div>
              ) : (
                <div className="mt-5 flex max-w-xl items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.055] px-4 py-3 text-amber-100">
                  <Lock size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em]">Pro purchases unavailable</p>
                    <p className="mt-1 text-xs font-medium leading-5 text-zinc-400">
                      New Pro memberships are paused right now. Please check back soon.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.55 }}
              className="mt-12 grid max-w-[900px] grid-cols-2 border-y border-white/[0.08] sm:grid-cols-4"
            >
              {OUTCOMES.map(({ value, label, icon: Icon, tone, wash }, index) => (
                <motion.div
                  key={label}
                  whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                  transition={{ type: "spring", stiffness: 360, damping: 24 }}
                  className={cn(
                    "group/outcome relative min-w-0 overflow-hidden px-3 py-4 sm:px-5",
                    index % 2 !== 0 && "border-l border-white/[0.07]",
                    index > 1 && "border-t border-white/[0.07] sm:border-t-0",
                    index > 0 && "sm:border-l sm:border-white/[0.07]"
                  )}
                >
                  <span className={cn("pointer-events-none absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover/outcome:opacity-100", wash)} />
                  <div className="flex items-center gap-2">
                    <Icon size={13} className={cn("relative", tone)} />
                    <span className="text-base font-black text-white sm:text-lg">{value}</span>
                  </div>
                  <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                    {label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-20 sm:px-6 md:py-28">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[48%] bg-[linear-gradient(125deg,transparent,rgba(34,211,238,0.035),rgba(99,102,241,0.05),transparent)]" />
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="The real upgrade"
              title="Less waiting. More finished work."
              description="Pro changes the workflow, not just the badge beside your name."
            />

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-10 grid overflow-hidden rounded-lg border border-white/[0.1] bg-[#08080d]/88 shadow-[0_30px_90px_rgba(0,0,0,0.36),0_0_60px_rgba(99,102,241,0.05)] lg:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-purple-400 via-fuchsia-300 to-cyan-300" />
              <div className="relative border-b border-white/[0.08] bg-[linear-gradient(140deg,rgba(124,58,237,0.09),transparent_48%)] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-300/20 bg-purple-300/[0.07] text-purple-200">
                    <Cpu size={18} />
                  </span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-300/70">
                      Priority mode
                    </p>
                    <h3 className="mt-1 text-xl font-black text-white">Your work moves first.</h3>
                  </div>
                </div>
                <p className="mt-6 max-w-[480px] text-sm font-medium leading-7 text-zinc-500">
                  Eligible heavy jobs use Lumora&apos;s priority route when demand is high, so the
                  moments you are ready to create are spent creating.
                </p>
                <div className="mt-8 space-y-3">
                  <BenefitLine text="Priority badge appears during eligible jobs" />
                  <BenefitLine text="Faster routing for demanding AI workflows" />
                  <BenefitLine text="Account-wide access across supported tools" />
                </div>
              </div>

              <div className="relative min-h-[360px] overflow-hidden bg-[linear-gradient(145deg,rgba(34,211,238,0.035),transparent_38%,rgba(59,130,246,0.055))] p-6 sm:p-8 lg:p-10">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:100%_56px]" />
                <div className="relative flex h-full flex-col justify-center">
                  <QueueRow label="Standard queue" value="Shared capacity" progress="w-[42%]" muted />
                  <div className="my-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-white/[0.07]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700">
                      Lumora routing
                    </span>
                    <span className="h-px flex-1 bg-white/[0.07]" />
                  </div>
                  <QueueRow label="Pro priority" value="Accelerated path" progress="w-[88%]" />
                  <div className="mt-7 grid grid-cols-3 border-t border-white/[0.08] pt-5">
                    {[
                      ["Route", "Priority"],
                      ["Status", "Ready"],
                      ["Access", "Pro"],
                    ].map(([label, value]) => (
                      <div key={label} className="border-l border-white/[0.07] px-3 first:border-l-0 first:pl-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-700">{label}</p>
                        <p className="mt-1 text-xs font-black text-zinc-300">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-white/[0.07] bg-white/[0.012] px-4 py-20 sm:px-6 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(124,58,237,0.055),transparent_36%,rgba(34,211,238,0.045)_74%,transparent)]" />
          <div className="mx-auto max-w-7xl">
            <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div className="lg:sticky lg:top-28">
                <SectionHeading
                  eyebrow="Free versus Pro"
                  title="See exactly what changes."
                  description="No vague premium promise. This is the practical difference your membership makes."
                  align="left"
                />
                <div className="mt-7 flex items-center gap-3">
                  <CreditTokenIcon size="md" />
                  <div>
                    <p className="text-2xl font-black text-white">
                      {PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">
                      credits restored daily
                    </p>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-lg border border-white/[0.1] bg-[#08080d]/88 shadow-[0_28px_80px_rgba(0,0,0,0.32)]"
              >
                <div className="absolute bottom-0 right-0 top-0 w-[31%] bg-[linear-gradient(180deg,rgba(34,211,238,0.055),rgba(124,58,237,0.045))]" />
                <div className="absolute right-0 top-0 h-px w-[31%] bg-linear-to-r from-purple-400 to-cyan-300" />
                <div className="grid grid-cols-[1.25fr_0.8fr_0.8fr] border-b border-white/[0.08] bg-white/[0.025] px-4 py-4 sm:px-6">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Capability</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Free</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">Pro</span>
                </div>
                {COMPARISON_ROWS.map((row) => (
                  <ComparisonRow key={row.label} {...row} />
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-20 sm:px-6 md:py-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[linear-gradient(120deg,transparent_10%,rgba(217,70,239,0.028)_40%,rgba(34,211,238,0.035)_72%,transparent_92%)]" />
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="The Pro workspace"
              title="Power without the clutter."
              description="Every advantage has a job: help you create faster, deliver cleaner, or make Lumora feel personal."
            />

            <div className="mt-12 grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
              {CREATOR_BENEFITS.map(({ icon: Icon, title, description, tone }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: (index % 3) * 0.06 }}
                  whileHover={prefersReducedMotion ? undefined : { y: -5 }}
                  className="group border-t border-white/[0.08] py-7"
                >
                  <div className="flex items-start gap-4">
                    <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(124,58,237,0.10)]", tone)}>
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-white">{title}</h3>
                      <p className="mt-2 text-xs font-medium leading-6 text-zinc-600 transition-colors group-hover:text-zinc-500">
                        {description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-white/[0.07] px-4 py-20 sm:px-6 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(124,58,237,0.075),transparent_34%,rgba(6,182,212,0.055)_76%,transparent)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.78fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow={isPro ? "Your membership" : "One plan. Everything included."}
                title={isPro ? "You already have the full experience." : "Ready when your ideas are."}
                description={
                  isPro
                    ? "Manage billing or keep creating with every Pro advantage active across your account."
                    : "A focused monthly membership for creators who want more output and less friction."
                }
                align="left"
              />

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "1,000 daily credits",
                  "Priority AI processing",
                  "Batch workflows + ZIP",
                  "No generated-image watermarks",
                  "Commercial usage rights",
                  "Exclusive themes and identity",
                ].map((item) => (
                  <div key={item} className="flex min-h-11 items-center gap-3 border-b border-white/[0.07] text-xs font-bold text-zinc-400">
                    <Check size={13} className="shrink-0 text-cyan-300" strokeWidth={3} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 22 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              whileHover={prefersReducedMotion ? undefined : { y: -5 }}
              className="relative overflow-hidden rounded-lg border border-purple-300/20 bg-[#08080d] p-6 shadow-[0_32px_90px_rgba(0,0,0,0.46),0_0_70px_rgba(124,58,237,0.10)] sm:p-8"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-purple-400 via-fuchsia-300 to-cyan-300" />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-1/2 top-0 h-44 bg-[linear-gradient(110deg,transparent,rgba(124,58,237,0.12),rgba(217,70,239,0.10),rgba(34,211,238,0.12),transparent)] blur-3xl"
                animate={{ x: ["-16%", "16%", "-16%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-purple-300/80">
                      Lumora Pro
                    </p>
                    <p className="mt-3 text-5xl font-black tracking-[-0.045em] text-white">
                      {isPro ? "Active" : `${currencySymbol}${priceDisplay}`}
                    </p>
                    <p className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">
                      {isPro ? "Full platform access" : `${currencyCode} · billed monthly`}
                    </p>
                  </div>
                  <LumoraMark size={54} />
                </div>

                <div className="my-7 h-px bg-white/[0.08]" />

                {isPro ? (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-black text-emerald-300">
                      <CheckCircle2 size={17} />
                      Pro is active on this account
                    </div>
                    {isSubscriptionCancelled && (
                      <p className="mt-3 text-xs font-medium leading-6 text-amber-200/70">
                        Your subscription is cancelled. Access remains active
                        {proAccessUntilLabel ? ` until ${proAccessUntilLabel}` : " through the paid period"}.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => (isSubscriptionCancelled ? router.push("/tools") : setIsModalOpen(true))}
                      className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white text-xs font-black uppercase tracking-[0.16em] text-black transition-all hover:bg-zinc-100 active:scale-[0.99]"
                    >
                      {isSubscriptionCancelled ? <Sparkles size={16} /> : <RefreshCcw size={16} />}
                      {isSubscriptionCancelled ? "Keep creating" : "Manage membership"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      disabled={loading || !paymentsEnabled}
                      className="group relative flex min-h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(105deg,#7c3aed,#a855f7_36%,#2563eb_68%,#06b6d4)] px-5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_50px_rgba(79,70,229,0.28)] transition-all hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 active:translate-y-0"
                    >
                      <span className="absolute -left-24 inset-y-0 w-14 skew-x-[-20deg] bg-white/30 blur-sm transition-transform duration-1000 group-hover:translate-x-[620px]" />
                      {loading ? <Loader2 size={17} className="animate-spin" /> : <Crown size={17} />}
                      <span className="relative">{paymentsEnabled ? "Start Pro" : "Currently unavailable"}</span>
                      {!loading && paymentsEnabled && <ArrowRight size={16} className="relative transition-transform group-hover:translate-x-1" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleSyncPurchase}
                      disabled={loading}
                      className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600 transition-colors hover:bg-white/[0.03] hover:text-zinc-300 disabled:opacity-50"
                    >
                      <RefreshCcw size={12} />
                      Already paid? Sync purchase
                    </button>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-5 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-600">
                  <span className="flex items-center gap-2">
                    <Lock size={11} /> Secure checkout
                  </span>
                  <span className="flex items-center justify-end gap-2">
                    <RefreshCcw size={11} /> Cancel anytime
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-20 sm:px-6 md:py-28">
          <div className="pointer-events-none absolute inset-x-[16%] top-0 h-px bg-linear-to-r from-transparent via-fuchsia-400/40 to-transparent" />
          <div className="mx-auto max-w-4xl">
            <SectionHeading
              eyebrow="Questions, answered"
              title="Know what you are getting."
              description="The details that matter before you upgrade."
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 border-t border-white/[0.09]"
            >
              {FAQS.map(({ question, answer }, index) => (
                <FaqItem
                  key={question}
                  question={question}
                  answer={answer}
                  isOpen={openFaq === index}
                  onToggle={() => setOpenFaq((current) => (current === index ? null : index))}
                />
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%_-_2rem)] max-w-[430px] -translate-x-1/2"
          >
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl",
                toast.type === "success" && "border-emerald-400/25 bg-[#07130f]/95 text-emerald-300",
                toast.type === "error" && "border-red-400/25 bg-[#16090b]/95 text-red-300",
                toast.type === "info" && "border-cyan-400/25 bg-[#071217]/95 text-cyan-200"
              )}
            >
              {toast.type === "success" ? <CheckCircle2 size={18} /> : <Shield size={18} />}
              <p className="text-[10px] font-black uppercase leading-5 tracking-[0.12em]">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ManageSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onCancel={handleCancelSubscription}
        isCancelling={isCancelling}
      />
      <PaymentSuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} type="pro" />
      <PaymentFailureModal
        isOpen={showFailure}
        onClose={() => setShowFailure(false)}
        onRetry={() => {
          setShowFailure(false);
          void handleUpgrade();
        }}
      />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.26em] text-cyan-300/80">{eyebrow}</p>
      <h2 className="mt-4 bg-[linear-gradient(100deg,#ffffff_0%,#f5f3ff_38%,#d8b4fe_68%,#a5f3fc_100%)] bg-clip-text text-[clamp(2.1rem,5vw,4.3rem)] font-black leading-[0.95] tracking-[-0.04em] text-transparent drop-shadow-[0_0_28px_rgba(139,92,246,0.06)]">
        {title}
      </h2>
      <p className="mt-5 text-sm font-medium leading-7 text-zinc-500 sm:text-base">{description}</p>
    </motion.div>
  );
}

function BenefitLine({ text }: { text: string }) {
  return (
    <div className="flex min-h-10 items-center gap-3 border-b border-white/[0.07] text-xs font-bold text-zinc-400">
      <Check size={13} className="shrink-0 text-cyan-300" strokeWidth={3} />
      {text}
    </div>
  );
}

function QueueRow({
  label,
  value,
  progress,
  muted = false,
}: {
  label: string;
  value: string;
  progress: string;
  muted?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border p-4 sm:p-5", muted ? "border-white/[0.07] bg-white/[0.018]" : "border-cyan-300/18 bg-cyan-300/[0.035]")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn("h-2 w-2 rounded-full", muted ? "bg-zinc-700" : "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]")} />
          <span className={cn("text-[10px] font-black uppercase tracking-[0.16em]", muted ? "text-zinc-600" : "text-zinc-200")}>
            {label}
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-600">{value}</span>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: muted ? 0.8 : 1.1, ease: "easeOut" }}
          className={cn("h-full origin-left", progress)}
        >
          <div className={cn("h-full w-full", muted ? "bg-zinc-700" : "bg-linear-to-r from-purple-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.65)]")} />
        </motion.div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, free, pro }: { label: string; free: string; pro: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.55 }}
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.025)" }}
      transition={{ duration: 0.35 }}
      className="grid min-h-16 grid-cols-[1.25fr_0.8fr_0.8fr] items-center border-b border-white/[0.07] px-4 py-3 last:border-b-0 sm:px-6"
    >
      <span className="pr-3 text-[11px] font-bold leading-5 text-zinc-400 sm:text-xs">{label}</span>
      <span className="pr-2 text-[10px] font-bold leading-5 text-zinc-600 sm:text-xs">{free}</span>
      <span className="relative flex items-center gap-1.5 bg-linear-to-r from-purple-200 to-cyan-200 bg-clip-text text-[10px] font-black leading-5 text-transparent sm:text-xs">
        <Check size={11} className="hidden text-cyan-300 sm:block" strokeWidth={3} />
        {pro}
      </span>
    </motion.div>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/[0.09]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex min-h-16 w-full items-center justify-between gap-5 py-4 text-left text-sm font-black text-zinc-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/30"
      >
        {question}
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 24 }}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-[linear-gradient(135deg,rgba(124,58,237,0.10),rgba(34,211,238,0.06))] transition-colors duration-300",
            isOpen
              ? "border-cyan-300/25 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
              : "border-purple-300/15 text-purple-200 group-hover:border-purple-300/25"
          )}
        >
          <Plus size={14} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.22 } }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -6 }}
              className="max-w-3xl pb-6 pr-12 text-sm font-medium leading-7 text-zinc-500"
            >
              {answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#030306] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-9 w-60 rounded-full bg-white/[0.05]" />
        <div className="mt-8 h-40 max-w-3xl rounded-lg bg-white/[0.045]" />
        <div className="mt-8 h-14 w-72 rounded-2xl bg-white/[0.05]" />
        <div className="mt-16 grid grid-cols-2 gap-px border-y border-white/[0.05] sm:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-20 bg-white/[0.025]" />
          ))}
        </div>
      </div>
    </div>
  );
}
