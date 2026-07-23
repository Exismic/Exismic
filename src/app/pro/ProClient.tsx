"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Archive,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  CreditCard,
  Cpu,
  Crown,
  ExternalLink,
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
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePro } from "@/hooks/usePro";
import { ManageSubscriptionModal } from "@/components/tool/ManageSubscriptionModal";
import { PaymentSuccessModal } from "@/components/modals/PaymentSuccessModal";
import { PaymentFailureModal } from "@/components/modals/PaymentFailureModal";
import { PaymentTermsModal } from "@/components/modals/PaymentTermsModal";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { CreditTokenIcon } from "@/components/ui/CreditTokenIcon";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";

const OUTCOMES = [
  { value: "10x", label: "daily credit capacity", icon: Gauge, tone: "text-fuchsia-300", wash: "from-fuchsia-500/[0.10]" },
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
    glow: "bg-cyan-500/30",
  },
  {
    icon: Palette,
    title: "A workspace that feels yours",
    description: "Exclusive themes, avatar frames, and animated identity styles.",
    tone: "border-fuchsia-300/20 bg-fuchsia-300/[0.06] text-fuchsia-200",
    glow: "bg-fuchsia-500/30",
  },
  {
    icon: WandSparkles,
    title: "New tools before everyone else",
    description: "Early access to new creative workflows and AI capabilities.",
    tone: "border-amber-300/20 bg-amber-300/[0.06] text-amber-200",
    glow: "bg-amber-500/30",
  },
  {
    icon: MessageSquareText,
    title: "Unlimited AI conversations",
    description: "Think, refine, and build without a daily message ceiling.",
    tone: "border-purple-300/20 bg-purple-300/[0.06] text-purple-200",
    glow: "bg-purple-500/30",
  },
  {
    icon: Code2,
    title: "Code and creative power together",
    description: "Use the same membership across Exismic Ai, Code Studio, and Pro tools.",
    tone: "border-blue-300/20 bg-blue-300/[0.06] text-blue-200",
    glow: "bg-blue-500/30",
  },
  {
    icon: Shield,
    title: "Commercial usage rights",
    description: "Use eligible Pro outputs for brands, client work, and paid projects.",
    tone: "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200",
    glow: "bg-emerald-500/30",
  },
];

const COMPARISON_ROWS = [
  { label: "Daily creative credits", free: "50", pro: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS.toLocaleString() },
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
    answer: "Yes. You can cancel from your Exismic account. Your Pro access remains available through the end of the paid billing period.",
  },
  {
    question: "Does Pro work across every Exismic tool?",
    answer: "Your membership is account-wide. Pro gating, priority routing, expanded limits, and premium identity features follow your account across Exismic.",
  },
  {
    question: "What does priority processing mean?",
    answer: "Eligible heavy jobs are routed through Exismic's priority path, reducing time spent waiting behind standard jobs when capacity is busy.",
  },
  {
    question: "I paid but Pro is not showing. What should I do?",
    answer: "Use the Sync purchase option below. Exismic will securely re-check the payment record and refresh your membership status.",
  },
];

interface RazorpayResponse {
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  subscription_id?: string;
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
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const { user, authUser, isPro, isLoading: isProLoading, refresh } = usePro();
  const [loading, setLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [market, setMarket] = useState<"IN" | "GLOBAL">("GLOBAL");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const paymentsEnabled = PRICING_CONFIG.PAYMENTS_ENABLED;

  useEffect(() => {
    let active = true;
    fetch("/api/billing/market", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (active && (data?.market === "IN" || data?.market === "GLOBAL")) {
          setMarket(data.countryCode === "UNKNOWN" && getIsIndia() ? "IN" : data.market);
        }
      })
      .catch(() => {
        if (active) setMarket(getIsIndia() ? "IN" : "GLOBAL");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const paymentStatus = searchParams.get("payment");
  const paymentReason = searchParams.get("reason");

  useEffect(() => {
    if (!paymentStatus) return;

    if (paymentStatus === "success") {
      setShowSuccess(true);
      setToast({ message: "Welcome to Exismic Pro. Your membership is active.", type: "success" });
      void refresh();
    } else if (paymentStatus === "failed") {
      setShowFailure(true);
      setToast({ message: paymentReason || "Payment could not be verified.", type: "error" });
    } else if (paymentStatus === "cancelled") {
      setToast({ message: "Checkout cancelled. No payment was captured.", type: "info" });
    }

    router.replace("/pro", { scroll: false });
    // Run once per payment return URL. refresh can change identity after account sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus, paymentReason, router]);

  const isIndia = market === "IN";
  const currencySymbol = isIndia ? "Rs " : "$";
  const priceDisplay = isIndia
    ? PRICING_CONFIG.PRO_PLAN.INR.toString()
    : PRICING_CONFIG.PRO_PLAN.USD.toString();
  const currencyCode = isIndia ? "INR" : "USD";
  const gatewayName = isIndia ? "Razorpay" : "PayPal";
  const profileName = String((user as { fullName?: string; name?: string } | null)?.fullName || (user as { fullName?: string; name?: string } | null)?.name || authUser?.user_metadata?.full_name || "Exismic user");
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

  const handleUpgradeClick = () => {
    if (!paymentsEnabled) {
      setToast({ message: PRICING_CONFIG.PAYMENT_UNAVAILABLE_MESSAGE, type: "info" });
      return;
    }
    if (!user && !authUser) {
      router.push("/auth/login");
      return;
    }
    setIsTermsModalOpen(true);
  };

  const handleUpgradeConfirm = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "pro", marketOverride: market }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setToast({
          message: data?.error || `Could not start ${gatewayName} checkout.`,
          type: "error",
        });
        setLoading(false);
        return;
      }

      if (data.gateway === "razorpay") {
        const Razorpay = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
        if (!Razorpay) throw new Error("Razorpay checkout is still loading. Please try again.");

        const razorpayOptions: RazorpayOptions = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Exismic",
          description: data.plan?.name || "Exismic Pro",
          prefill: {
            name: profileName,
            email: user?.email || authUser?.email || "",
          },
          theme: { color: "#8b5cf6" },
          modal: {
            ondismiss: () => setLoading(false),
          },
          handler: async (paymentResponse) => {
            const verifyResponse = await fetch("/api/billing/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentResponse),
            });
            const verifyData = await verifyResponse.json().catch(() => null);
            if (!verifyResponse.ok || !verifyData?.success) {
              setToast({ message: verifyData?.error || "Payment verification failed.", type: "error" });
              setLoading(false);
              return;
            }
            window.location.href = "/billing/success?type=pro";
          },
        };

        if (data.razorpaySubscriptionId) {
          razorpayOptions.subscription_id = data.razorpaySubscriptionId;
        } else {
          razorpayOptions.order_id = data.razorpayOrderId;
        }

        const razorpay = new Razorpay(razorpayOptions);
        razorpay.open();
        return;
      }

      if (!data?.approvalUrl) throw new Error("PayPal did not return an approval link.");
      window.location.href = data.approvalUrl;
    } catch (error) {
      console.warn(`[${gatewayName}] Pro checkout unavailable:`, error instanceof Error ? error.message : error);
      setToast({
        message: error instanceof Error ? error.message : `${gatewayName} checkout could not start.`,
        type: "error",
      });
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
      setToast({ message: "Exismic could not sync your purchase right now.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/payments/cancel", {
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
      setToast({ message: "Exismic could not cancel the subscription right now.", type: "error" });
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
        <section className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden border-b border-white/[0.07] px-4 py-14 sm:px-6 md:py-20 bg-[#020202]">
          {/* Premium Ambient Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-[10%] w-[600px] h-[600px] bg-accent-purple/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-[10%] w-[600px] h-[600px] bg-accent-blue/15 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
            {/* Animated Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
          </div>

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.8),rgba(6,182,212,0.8),transparent)] shadow-[0_0_20px_rgba(168,85,247,0.6)]"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating Logo with Aura (Perfectly Bounded) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[50vw] h-[100vh] pointer-events-none hidden md:flex justify-end items-center z-0 pr-10 xl:pr-24 overflow-visible">
             <div className="relative flex items-center justify-center">
               {/* Glowing Aura behind logo */}
               <motion.div 
                 className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-accent-purple via-accent-cyan to-accent-blue rounded-full blur-[120px] opacity-30"
                 animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180] }}
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               />
               <motion.div
                 animate={prefersReducedMotion ? undefined : { y: ["-3%", "3%", "-3%"], rotate: [-1.5, 1.5, -1.5] }}
                 transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                 className="relative z-10"
               >
                 <ExismicMark size={450} className="drop-shadow-[0_0_40px_rgba(255,255,255,0.1)] opacity-30" />
               </motion.div>
             </div>
          </div>

          <div className="mx-auto w-full max-w-7xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="max-w-[790px]"
            >
              {/* Premium Glowing Badge */}
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-4 py-2 shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-md transition-colors hover:bg-accent-cyan/20 hover:border-accent-cyan/50 cursor-default">
                <Crown size={14} className="fill-accent-cyan/30 text-accent-cyan animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-accent-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                  The complete Exismic experience
                </span>
              </div>

              <h1 className="max-w-[800px] text-[clamp(4.5rem,11vw,9.5rem)] font-black leading-[0.82] tracking-[-0.05em] text-white">
                Exismic
                <br />
                <span className="relative inline-block mt-2">
                  <span className="absolute inset-0 bg-[linear-gradient(90deg,#a855f7,#06b6d4,#3b82f6,#a855f7)] bg-[length:200%_auto] animate-gradient-x blur-2xl opacity-50" />
                  <span className="relative bg-[linear-gradient(90deg,#e9d5ff,#a5f3fc,#93c5fd,#e9d5ff)] bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent">
                    Pro.
                  </span>
                </span>
              </h1>

              <p className="mt-10 max-w-[620px] text-lg font-medium leading-relaxed text-zinc-400 sm:text-xl sm:leading-loose">
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
                  <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleUpgradeClick}
                      disabled={loading || !paymentsEnabled}
                      className="group relative flex h-14 w-full sm:w-auto items-center justify-center overflow-hidden rounded-full p-[1.5px] font-black uppercase tracking-[0.25em] text-white shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] transition-all duration-500 hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.8)] hover:-translate-y-1 hover:scale-[1.02] active:scale-95 disabled:cursor-wait disabled:opacity-50"
                    >
                      {/* Animated gradient border */}
                      <span className="absolute inset-0 bg-[linear-gradient(110deg,#a855f7,#3b82f6,#a855f7,#06b6d4)] bg-[length:300%_auto] animate-gradient-x" />
                      
                      {/* Core button background */}
                      <div className="relative z-10 flex h-full w-full items-center justify-center gap-3 rounded-full bg-[#030303] px-8 transition-all duration-500 group-hover:bg-transparent">
                        
                        {/* Continuous Idle Shine */}
                        <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] bg-[length:200%_100%] animate-shine skew-x-[-25deg] pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300" />

                        {/* Sweeping shine effect on hover */}
                        <span className="absolute -left-full inset-y-0 w-1/2 skew-x-[-25deg] bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.25),transparent)] transition-all duration-1000 group-hover:left-[200%]" />
                        
                        {/* Button content */}
                        <div className="relative z-20 flex items-center gap-3 text-[11px]">
                          {loading ? <Loader2 size={18} className="animate-spin text-purple-400" /> : <Crown size={18} className="text-purple-400 group-hover:text-white transition-colors duration-300 animate-pulse" />}
                          <span className="bg-[linear-gradient(110deg,#fff,#e9d5ff,#fff)] bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Unlock Pro</span>
                          {!loading && paymentsEnabled && <ArrowRight size={16} className="text-purple-400 group-hover:translate-x-1 group-hover:text-white transition-all duration-300" />}
                        </div>
                      </div>
                    </button>

                  </div>
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
                  <span>{isIndia ? "Billed through Razorpay" : "Billed in USD through PayPal"}</span>
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
              className="relative mt-12 grid overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#040406] shadow-[0_30px_100px_rgba(0,0,0,0.5),0_0_80px_rgba(168,85,247,0.06)] lg:grid-cols-[0.9fr_1.1fr]"
            >
              {/* Top Neon Border */}
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(168,85,247,0.8),rgba(6,182,212,0.8),transparent)] shadow-[0_0_15px_rgba(168,85,247,0.8)] z-20" />

              {/* Left Side */}
              <div className="relative border-b border-white/[0.08] bg-[linear-gradient(140deg,rgba(168,85,247,0.08),transparent_48%)] p-8 sm:p-12 lg:border-b-0 lg:border-r z-10 flex flex-col justify-center">
                <div className="flex items-center gap-5">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-[1rem] border border-purple-400/30 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <div className="absolute inset-0 bg-purple-400/20 blur-xl rounded-full" />
                    <Cpu size={24} className="text-purple-300 relative z-10 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                      Priority Mode
                    </p>
                    <h3 className="mt-1 text-2xl font-black text-white tracking-tight">Your work moves first.</h3>
                  </div>
                </div>
                <p className="mt-8 max-w-[480px] text-[15px] font-medium leading-relaxed text-zinc-400">
                  Eligible heavy jobs use Exismic&apos;s priority route when demand is high, so the
                  moments you are ready to create are spent creating.
                </p>
                <div className="mt-10 space-y-4">
                  <BenefitLine text="Priority badge appears during eligible jobs" />
                  <BenefitLine text="Faster routing for demanding AI workflows" />
                  <BenefitLine text="Account-wide access across supported tools" />
                </div>
              </div>

              {/* Right Side */}
              <div className="relative min-h-[420px] overflow-hidden bg-[linear-gradient(145deg,rgba(6,182,212,0.06),transparent_40%,rgba(168,85,247,0.08))] p-8 sm:p-12 z-10 flex flex-col justify-center group/right">
                {/* Animated Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />

                {/* Animated Light Beam behind right side */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative z-10 w-full max-w-[500px] mx-auto space-y-8">
                  {/* Standard Queue Mockup */}
                  <div className="w-full rounded-2xl border border-white/[0.05] bg-[#0a0a0f] p-5 opacity-60 mix-blend-luminosity transition-all duration-500 group-hover/right:opacity-40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Standard Queue</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-600">Shared Capacity</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div className="h-full w-[35%] bg-zinc-600 rounded-full" />
                    </div>
                  </div>

                  {/* Pro Priority Mockup */}
                  <div className="w-full rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden group hover:border-cyan-400/50 transition-colors duration-500 hover:shadow-[0_0_60px_rgba(6,182,212,0.25)] hover:scale-[1.02]">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 translate-x-[-150%] bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.15),transparent)] transition-transform duration-[1.5s] group-hover:translate-x-[150%] pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-5 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">Pro Priority</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-cyan-200 opacity-80">Accelerated Path</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-black/60 relative z-10 border border-white/5 shadow-inner">
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,182,212,0.1),transparent)] pointer-events-none" />
                      <motion.div 
                        className="h-full w-[88%] rounded-full bg-[linear-gradient(90deg,#3b82f6,#06b6d4,#a855f7)] shadow-[0_0_20px_rgba(6,182,212,0.8)] relative overflow-hidden"
                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: "200% 100%" }}
                      >
                         <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -skew-x-12 animate-[shine_1.5s_linear_infinite]" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-3 border-t border-white/[0.08] pt-7 relative z-10">
                    {[
                      ["Route", "Priority", "text-purple-400"],
                      ["Status", "Ready", "text-cyan-400"],
                      ["Access", "Pro", "text-white"],
                    ].map(([label, value, colorClass]) => (
                      <div key={label} className="border-l border-white/[0.07] px-5 first:border-l-0 first:pl-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
                        <p className={cn("mt-2 text-[15px] font-black tracking-wide drop-shadow-lg", colorClass)}>{value}</p>
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
                className="group relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#050508]/80 shadow-[0_40px_100px_rgba(0,0,0,0.6),0_0_80px_rgba(168,85,247,0.08)] backdrop-blur-xl"
              >
                <div className="absolute bottom-0 right-0 top-0 w-[31%] bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(168,85,247,0.08),transparent)] border-l border-white/[0.04]" />
                <div className="absolute right-0 top-0 h-px w-[31%] bg-gradient-to-r from-transparent via-cyan-400 to-purple-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.04),transparent)] -translate-x-[150%] skew-x-[-25deg] transition-transform duration-[1.5s] group-hover:translate-x-[150%] pointer-events-none" />

                <div className="relative z-10 grid grid-cols-[1.25fr_0.8fr_0.8fr] border-b border-white/[0.08] bg-white/[0.02] px-4 py-5 sm:px-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Capability</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Free</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">Pro</span>
                    <Crown size={12} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  </div>
                </div>
                <div className="relative z-10">
                  {COMPARISON_ROWS.map((row) => (
                    <ComparisonRow key={row.label} {...row} />
                  ))}
                </div>
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
              description="Every advantage has a job: help you create faster, deliver cleaner, or make Exismic feel personal."
            />

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CREATOR_BENEFITS.map(({ icon: Icon, title, description, tone, glow }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                  whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-[24px] border border-white/[0.05] bg-white/[0.015] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.03] hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
                >
                  <div className={cn("absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[80px] transition-all duration-500 group-hover:opacity-100 opacity-0", glow)} />
                  <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.04),transparent)] skew-x-[-30deg] transition-transform duration-1000 group-hover:translate-x-full pointer-events-none" />

                  <div className="relative z-10 flex flex-col gap-6">
                    <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]", tone)}>
                      <Icon size={24} className="opacity-90 transition-opacity group-hover:opacity-100" />
                    </span>
                    <div>
                      <h3 className="text-[15px] font-black tracking-wide text-white transition-colors group-hover:text-cyan-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">{title}</h3>
                      <p className="mt-3 text-[13px] font-medium leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-300">
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
                  `${PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS.toLocaleString()} daily credits`,
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
                      Exismic Pro
                    </p>
                    <p className="mt-3 text-5xl font-black tracking-[-0.045em] text-white">
                      {isPro ? "Active" : `${currencySymbol}${priceDisplay}`}
                    </p>
                    <p className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">
                      {isPro ? "Full platform access" : `${currencyCode} · ${gatewayName} monthly`}
                    </p>
                  </div>
                  <ExismicMark size={54} />
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
                      onClick={handleUpgradeClick}
                      disabled={loading || !paymentsEnabled}
                      className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-full p-[1.5px] font-black uppercase tracking-[0.25em] text-white shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] transition-all duration-500 hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.8)] hover:-translate-y-1 hover:scale-[1.02] active:scale-95 disabled:cursor-wait disabled:opacity-50"
                    >
                      <span className="absolute inset-0 bg-[linear-gradient(110deg,#a855f7,#3b82f6,#a855f7,#06b6d4)] bg-[length:300%_auto] animate-gradient-x" />
                      <div className="relative z-10 flex h-full w-full items-center justify-center gap-3 rounded-full bg-[#030303] px-8 transition-all duration-500 group-hover:bg-transparent">
                        <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] bg-[length:200%_100%] animate-shine skew-x-[-25deg] pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                        <span className="absolute -left-full inset-y-0 w-1/2 skew-x-[-25deg] bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.25),transparent)] transition-all duration-1000 group-hover:left-[200%]" />
                        <div className="relative z-20 flex items-center gap-3 text-[11px]">
                          {loading ? <Loader2 size={18} className="animate-spin text-purple-400" /> : <Crown size={18} className="text-purple-400 group-hover:text-white transition-colors duration-300 animate-pulse" />}
                          <span className="bg-[linear-gradient(110deg,#fff,#e9d5ff,#fff)] bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Start Pro</span>
                          {!loading && paymentsEnabled && <ArrowRight size={16} className="text-purple-400 group-hover:translate-x-1 group-hover:text-white transition-all duration-300" />}
                        </div>
                      </div>
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
            <div className="mt-12 flex flex-col gap-4">
              {FAQS.map(({ question, answer }, index) => (
                <motion.div
                  key={question}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <FaqItem
                    question={question}
                    answer={answer}
                    isOpen={openFaq === index}
                    onToggle={() => setOpenFaq((current) => (current === index ? null : index))}
                  />
                </motion.div>
              ))}
            </div>
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
          setIsTermsModalOpen(true);
        }}
      />
      <PaymentTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onConfirm={handleUpgradeConfirm}
        type="pro"
        price={`${currencySymbol}${priceDisplay}/mo`}
        gateway={isIndia ? "razorpay" : "paypal"}
        isProcessing={loading}
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
      whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
      transition={{ duration: 0.3 }}
      className="group/row relative grid min-h-[72px] grid-cols-[1.25fr_0.8fr_0.8fr] items-center border-b border-white/[0.05] px-4 py-3 last:border-b-0 sm:px-8 transition-colors"
    >
      <div className="absolute right-0 top-0 bottom-0 w-[31%] opacity-0 group-hover/row:opacity-100 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.15),transparent_70%)] transition-opacity duration-300 pointer-events-none" />
      <span className="pr-3 text-[12px] font-black tracking-wide text-zinc-400 sm:text-sm group-hover/row:text-white transition-colors">{label}</span>
      <span className="pr-2 text-[11px] font-medium leading-5 text-zinc-600 sm:text-xs">{free}</span>
      <span className="relative flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.08em] text-white sm:text-xs drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
        <Check size={14} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" strokeWidth={3} />
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
    <div 
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-500",
        isOpen 
          ? "border-cyan-400/30 bg-[linear-gradient(145deg,rgba(34,211,238,0.08),rgba(168,85,247,0.05),transparent)] shadow-[0_15px_40px_rgba(34,211,238,0.12)]" 
          : "border-white/[0.06] bg-[#050508]/60 hover:border-white/[0.12] hover:bg-[#0a0a0f]/80"
      )}
    >
      <div 
        className={cn(
          "absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.15),transparent_70%)] opacity-0 transition-opacity duration-700 pointer-events-none",
          isOpen && "opacity-100"
        )} 
      />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="relative z-10 flex min-h-16 w-full items-center justify-between gap-5 px-6 py-5 text-left focus-visible:outline-none"
      >
        <span 
          className={cn(
            "text-[15px] font-black tracking-wide transition-colors duration-300",
            isOpen ? "text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-zinc-300 group-hover:text-white"
          )}
        >
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-500",
            isOpen
              ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-110"
              : "border-white/[0.08] bg-white/[0.02] text-zinc-400 group-hover:border-white/20 group-hover:text-white"
          )}
        >
          <Plus size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.3 } }}
            className="overflow-hidden"
          >
            <p className="relative z-10 max-w-3xl px-6 pb-6 pr-16 text-[14px] font-medium leading-relaxed text-cyan-50/70">
              {answer}
            </p>
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

