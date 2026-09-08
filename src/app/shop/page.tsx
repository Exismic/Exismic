"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Coins,
  CreditCard,
  Crown,
  Diamond,
  ExternalLink,
  Flame,
  Gift,
  Info,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";
import { cn } from "@/lib/utils";
import { PaymentTermsModal } from "@/components/modals/PaymentTermsModal";
import { PaymentSuccessModal } from "@/components/modals/PaymentSuccessModal";
import { PaymentFailureModal } from "@/components/modals/PaymentFailureModal";
import { createCheckoutSignal, loadRazorpayCheckout } from "@/lib/payments/loadRazorpayCheckout";
import { reportPaymentFailure } from "@/lib/payments/reportPaymentFailure";
import { DailyRewardLootBox } from "@/components/reward/DailyRewardLootBox";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { RedeemPromoModal } from "@/components/modals/RedeemPromoModal";
import { GiftPurchaseModal } from "@/components/modals/GiftPurchaseModal";
import { GiftSuccessModal } from "@/components/modals/GiftSuccessModal";

const rarityRows = [
  { name: "Common", amount: "10", chance: "Base", color: "text-zinc-300", dot: "bg-zinc-300", aura: "from-zinc-300/25 to-white/5" },
  { name: "Uncommon", amount: "20", chance: "Often", color: "text-cyan-200", dot: "bg-cyan-300", aura: "from-cyan-300/35 to-blue-400/10" },
  { name: "Rare", amount: "50", chance: "Lucky", color: "text-blue-200", dot: "bg-blue-300", aura: "from-blue-300/35 to-violet-400/12" },
  { name: "Epic", amount: "100", chance: "Very lucky", color: "text-fuchsia-200", dot: "bg-fuchsia-300", aura: "from-fuchsia-300/40 to-purple-500/16" },
  { name: "Legendary", amount: "500", chance: "Jackpot", color: "text-amber-200", dot: "bg-amber-300", aura: "from-amber-300/45 to-orange-500/20" },
];

const claimParticles = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  x: Math.cos((index / 16) * Math.PI * 2) * (72 + (index % 4) * 18),
  y: Math.sin((index / 16) * Math.PI * 2) * (54 + (index % 3) * 18),
  delay: index * 0.025,
}));

function getRewardVisual(rarity?: string) {
  const normalized = (rarity || "common").toLowerCase();
  return rarityRows.find((row) => row.name.toLowerCase() === normalized) || rarityRows[0];
}

const packStyles: Record<string, {
  icon: typeof Zap;
  iconColor: string;
  iconBg: string;
  cardBorder: string;
  ambientGradient: string;
  topBeam: string;
  numberGradient: string;
  conicGradient: string;
  markTheme: "blue" | "purple" | "gold";
  subtitle: string;
  subtitleColor: string;
  arrowBoxHover: string;
  arrowIconHover: string;
}> = {
  blue: {
    icon: Coins,
    iconColor: "text-cyan-300",
    iconBg: "border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 via-blue-900/30 to-black/85 shadow-[0_0_20px_rgba(34,211,238,0.3)]",
    cardBorder: "border-2 border-cyan-400/80 bg-gradient-to-r from-[#0a0d1c]/98 via-[#060813]/98 to-[#030408]/98 hover:border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.3),0_20px_60px_rgba(0,0,0,0.85)] hover:shadow-[0_0_45px_rgba(34,211,238,0.55),0_25px_70px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-cyan-500/18 via-blue-600/10 to-transparent",
    topBeam: "",
    numberGradient: "bg-[linear-gradient(110deg,#ffffff,#cffafe,#38bdf8,#ffffff)] drop-shadow-[0_0_18px_rgba(56,189,248,0.4)]",
    conicGradient: "bg-[conic-gradient(from_0deg,rgba(6,182,212,1)_0%,rgba(59,130,246,1)_33%,rgba(103,232,249,1)_66%,rgba(6,182,212,1)_100%)]",
    markTheme: "blue",
    subtitle: "Instant Refuel",
    subtitleColor: "text-zinc-400 group-hover/launch:text-cyan-200/90",
    arrowBoxHover: "group-hover/launch:border-cyan-300/60 group-hover/launch:bg-cyan-300/[0.2] group-hover/launch:text-cyan-50 group-hover/launch:shadow-[0_0_30px_rgba(34,211,238,0.6),inset_0_1px_5px_rgba(255,255,255,0.3)]",
    arrowIconHover: "group-hover/launch:text-cyan-100",
  },
  purple: {
    icon: Diamond,
    iconColor: "text-purple-300",
    iconBg: "border-purple-400/45 bg-gradient-to-br from-purple-500/30 via-fuchsia-950/40 to-black/85 shadow-[0_0_25px_rgba(168,85,247,0.4)]",
    cardBorder: "border-2 border-purple-400/85 bg-gradient-to-r from-[#120c22]/98 via-[#0b0817]/98 to-[#04030a]/98 shadow-[0_0_30px_rgba(168,85,247,0.35),0_24px_70px_rgba(0,0,0,0.85)] hover:border-fuchsia-300 hover:shadow-[0_0_55px_rgba(217,70,239,0.55),0_30px_80px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-purple-600/22 via-fuchsia-600/14 to-cyan-500/10",
    topBeam: "",
    numberGradient: "bg-[linear-gradient(110deg,#ffffff,#f0abfc,#38bdf8,#ffffff)] drop-shadow-[0_0_20px_rgba(240,171,252,0.5)]",
    conicGradient: "bg-[conic-gradient(from_0deg,rgba(168,85,247,1)_0%,rgba(236,72,153,1)_33%,rgba(192,132,252,1)_66%,rgba(168,85,247,1)_100%)]",
    markTheme: "purple",
    subtitle: "Best Value Pack",
    subtitleColor: "text-zinc-400 group-hover/launch:text-fuchsia-200/90",
    arrowBoxHover: "group-hover/launch:border-fuchsia-300/60 group-hover/launch:bg-fuchsia-300/[0.2] group-hover/launch:text-fuchsia-50 group-hover/launch:shadow-[0_0_30px_rgba(217,70,239,0.6),inset_0_1px_5px_rgba(255,255,255,0.3)]",
    arrowIconHover: "group-hover/launch:text-fuchsia-100",
  },
  gold: {
    icon: Crown,
    iconColor: "text-amber-300",
    iconBg: "border-amber-400/45 bg-gradient-to-br from-amber-500/30 via-rose-950/40 to-black/85 shadow-[0_0_25px_rgba(245,158,11,0.35)]",
    cardBorder: "border-2 border-amber-400/80 bg-gradient-to-r from-[#170e08]/98 via-[#0f0a07]/98 to-[#050302]/98 hover:border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.3),0_20px_60px_rgba(0,0,0,0.85)] hover:shadow-[0_0_45px_rgba(245,158,11,0.55),0_25px_70px_rgba(0,0,0,0.9)]",
    ambientGradient: "from-amber-500/20 via-rose-600/12 to-transparent",
    topBeam: "",
    numberGradient: "bg-[linear-gradient(110deg,#ffffff,#fde047,#fb7185,#ffffff)] drop-shadow-[0_0_20px_rgba(251,113,133,0.45)]",
    conicGradient: "bg-[conic-gradient(from_0deg,rgba(245,158,11,1)_0%,rgba(239,68,68,1)_33%,rgba(252,211,77,1)_66%,rgba(245,158,11,1)_100%)]",
    markTheme: "gold",
    subtitle: "Studio Power",
    subtitleColor: "text-zinc-400 group-hover/launch:text-amber-200/90",
    arrowBoxHover: "group-hover/launch:border-amber-300/60 group-hover/launch:bg-amber-300/[0.2] group-hover/launch:text-amber-50 group-hover/launch:shadow-[0_0_30px_rgba(245,158,11,0.6),inset_0_1px_5px_rgba(255,255,255,0.3)]",
    arrowIconHover: "group-hover/launch:text-amber-100",
  },
};

type CreditPack = (typeof PRICING_CONFIG.CREDIT_PACKAGES)[number] & {
  priceLabel: string;
  style: (typeof packStyles)[keyof typeof packStyles];
};

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature: string;
};


export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth(null);
  const {
    credits,
    dailyCredits,
    bonusCredits,
    purchasedCredits,
    isPro,
    countdown,
    todayClaim,
    dailyStreak,
    refreshCredits,
    updateState,
    toast,
  } = useCredits();
  const paymentsEnabled = PRICING_CONFIG.PAYMENTS_ENABLED;

  const [isIndia, setIsIndia] = useState(false);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{ amount: number; rarity: string; type?: "temporary" | "permanent" } | null>(null);
  const [claimStage, setClaimStage] = useState<"idle" | "opening" | "revealed">("idle");
  const [claimLocked, setClaimLocked] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentFailure, setShowPaymentFailure] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftSuccessDetails, setGiftSuccessDetails] = useState<{
    giftCode: string;
    giftType: "pro" | "pro_monthly" | "pro_yearly" | "credits";
    giftCredits?: number;
    recipientName?: string;
    recipientMessage?: string;
  } | null>(null);
  const [successCredits, setSuccessCredits] = useState(0);
  const [failureReason, setFailureReason] = useState<string | undefined>();

  useEffect(() => {
    let active = true;
    fetch("/api/billing/market", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (active && (data?.market === "IN" || data?.market === "GLOBAL")) {
          setIsIndia(data.countryCode === "UNKNOWN" ? getIsIndia() : data.market === "IN");
        }
      })
      .catch(() => {
        if (active) setIsIndia(getIsIndia());
      });
    return () => {
      active = false;
    };
  }, []);

  const marketOverride = isIndia ? "IN" : "GLOBAL";
  const gatewayName = isIndia ? "Razorpay" : "PayPal";

  const paymentStatus = searchParams.get("payment");
  const paymentCredits = searchParams.get("credits");
  const paymentReason = searchParams.get("reason");

  useEffect(() => {
    if (!paymentStatus) return;

    if (paymentStatus === "success") {
      const parsedCredits = Number(paymentCredits || 0);
      setSuccessCredits(Number.isFinite(parsedCredits) ? parsedCredits : 0);
      setShowPaymentSuccess(true);
      void refreshCredits();
      toast("Credits added to your account.", "success");
    } else if (paymentStatus === "failed") {
      const reason = paymentReason || "Payment could not be verified.";
      setFailureReason(reason);
      setShowPaymentFailure(true);
      toast(reason, "warning");
    } else if (paymentStatus === "cancelled") {
      toast("Checkout cancelled. No payment was captured.", "info");
    }

    router.replace("/shop", { scroll: false });
    // Run once per payment return URL. refreshCredits/toast can change identity after state updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus, paymentCredits, paymentReason, router]);

  useEffect(() => {
    if (todayClaim && claimStage === "idle") {
      setClaimResult(todayClaim);
      setClaimStage("revealed");
      setClaimLocked(true);
    }
  }, [todayClaim, claimStage]);

  const dailyLimit = isPro ? PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS : 50;
  const dailyPercent = Math.min(100, Math.round((dailyCredits / dailyLimit) * 100));

  const formattedPacks = useMemo<CreditPack[]>(() => PRICING_CONFIG.CREDIT_PACKAGES.map((pack) => ({
    ...pack,
    priceLabel: isIndia ? `₹${pack.priceINR}` : `$${pack.priceUSD}`,
    style: packStyles[pack.color as keyof typeof packStyles] || packStyles.blue,
  })), [isIndia]);

  async function handleClaimDailyReward() {
    if (!user) {
      toast("Please login to claim your daily shop reward", "warning");
      return;
    }

    setClaiming(true);
    setClaimResult(null);
    setClaimStage("opening");

    try {
      const response = await fetch("/api/credits/daily-claim", { method: "POST" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setClaimLocked(Boolean(data.alreadyClaimed));
        setClaimStage(data.alreadyClaimed ? "revealed" : "idle");
        if (data.alreadyClaimed && data.amount && data.rarity) {
          setClaimResult({ amount: Number(data.amount), rarity: String(data.rarity), type: data.type });
        }
        toast(data.error || "Daily reward unavailable", data.alreadyClaimed ? "info" : "warning");
        return;
      }

      const result = { amount: Number(data.amount || 0), rarity: String(data.rarity || "common"), type: data.type as "temporary" | "permanent" };
      
      // Set result early so the opening animation knows what's coming
      setClaimResult(result);
      
      // INSTANT OPTIMISTIC UPDATE: Update credits state immediately in UI without waiting for network re-fetch
      if (data.credits) {
        updateState({
          dailyCredits: data.credits.dailyCredits,
          bonusCredits: data.credits.bonusCredits,
          lifetimeCredits: data.credits.lifetimeCredits,
          todayClaim: result,
        });
      } else {
        updateState({
          bonusCredits: bonusCredits + result.amount,
          todayClaim: result,
        });
      }

      // Snappy reveal animation (150ms instead of 1000-3000ms delay)
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      setClaimStage("revealed");
      setClaimLocked(true);
      refreshCredits();
      confetti({
        particleCount: result.rarity === "legendary" ? 150 : result.rarity === "epic" ? 90 : 45,
        spread: 70,
        origin: { y: 0.58 },
        colors: ["#22d3ee", "#8b5cf6", "#f472b6", "#facc15", "#ffffff"],
      });
    } catch (error) {
      console.error(error);
      toast("Could not claim today's reward", "warning");
    } finally {
      setClaiming(false);
    }
  }

  const handlePurchaseClick = (pack: typeof formattedPacks[number]) => {
    if (!paymentsEnabled) {
      toast("Credit packs will be available soon.", "info");
      return;
    }
    if (!user) {
      toast("Please login to purchase credits", "warning");
      return;
    }
    setSelectedPack(pack);
    setIsTermsModalOpen(true);
  };

  const handlePurchaseConfirm = async (couponCode?: string) => {
    if (!selectedPack) return;
    setIsProcessingId(selectedPack.id);
    setIsTermsModalOpen(false);

    try {
      const checkoutRequest = createCheckoutSignal();
      const response = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: checkoutRequest.signal,
        body: JSON.stringify({
          planId: selectedPack.billingPlanId || selectedPack.id,
          marketOverride,
          couponCode: couponCode || undefined,
        }),
      }).finally(checkoutRequest.clear);
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        const reason = data?.error || `Could not start ${gatewayName} checkout.`;
        setFailureReason(reason);
        setShowPaymentFailure(true);
        toast(reason, "warning");
        setIsProcessingId(null);
        return;
      }

      if (data.gateway === "razorpay") {
        const Razorpay = await loadRazorpayCheckout();
        if (!data.razorpayOrderId) throw new Error("Credit checkout could not start. Please refresh and try again.");

        const razorpay = new Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Exismic",
          description: data.plan?.name || `${selectedPack.credits.toLocaleString()} credits`,
          order_id: data.razorpayOrderId,
          prefill: {
            name: user?.user_metadata?.full_name || "Exismic user",
            email: user?.email || "",
          },
          theme: { color: "#8b5cf6" },
          modal: {
            ondismiss: () => setIsProcessingId(null),
          },
          handler: async (paymentResponse: RazorpayPaymentResponse) => {
            const verifyResponse = await fetch("/api/billing/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentResponse),
            });
            const verifyData = await verifyResponse.json().catch(() => null);
            if (!verifyResponse.ok || !verifyData?.success) {
              const reason = verifyData?.error || "Payment verification failed.";
              setFailureReason(reason);
              setShowPaymentFailure(true);
              toast(reason, "warning");
              setIsProcessingId(null);
              return;
            }
            window.location.href = `/billing/success?type=credits&credits=${selectedPack.credits}`;
          },
        });

        razorpay.on("payment.failed", (failure: unknown) => {
          reportPaymentFailure(data.orderId, failure);
          const reason = "Payment was not completed. No charge was added to your account.";
          setFailureReason(reason);
          setShowPaymentFailure(true);
          toast(reason, "warning");
          setIsProcessingId(null);
        });
        razorpay.open();
        return;
      }

      if (!data?.approvalUrl) throw new Error("PayPal did not return an approval link.");
      window.location.href = data.approvalUrl;
    } catch (error) {
      console.warn(`[${gatewayName}] Credit checkout unavailable:`, error instanceof Error ? error.message : error);
      const reason = error instanceof Error ? error.message : `${gatewayName} checkout failed`;
      setFailureReason(reason);
      setShowPaymentFailure(true);
      toast(reason, "warning");
      setIsProcessingId(null);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] px-4 pb-20 pt-24 text-white selection:bg-purple-500/30 sm:px-6 lg:px-8">

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-0 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.2),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[680px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.12),transparent_66%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:42px_42px] opacity-35" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl space-y-6">
        <PageBreadcrumb items={[{ label: "Credit Shop Vault" }]} />
        <section className="mb-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100"
            >
              <Coins size={14} className="text-cyan-300" />
              Credit shop
            </motion.div>
            <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.86] tracking-tight sm:text-7xl lg:text-8xl">
              Build your{" "}
              <span className="block bg-[linear-gradient(110deg,#fff,#c4b5fd,#22d3ee,#f472b6,#fff)] bg-[length:240%_100%] bg-clip-text text-transparent animate-[gradient-shift_8s_ease-in-out_infinite]">
                credit vault.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-zinc-400 sm:text-lg">
              Daily credits refill every 24 hours for routine usage. Permanent reserve credits sit on top, never expire, and are ready for heavy workloads.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href="/rewards/guide"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-xs font-bold text-cyan-300 hover:border-cyan-300 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
              >
                <span>Credit Rules & Non-Refund Policy</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-cyan-400/40 bg-gradient-to-br from-[#0c0e1a]/95 via-[#070810]/98 to-[#030408]/98 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.85),0_0_40px_rgba(34,211,238,0.2)] backdrop-blur-3xl sm:p-8">
            {/* Ambient glows inside card */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-400/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                  <span>Vault Balance</span>
                </div>
                <p className="mt-2 bg-gradient-to-r from-white via-cyan-100 to-indigo-100 bg-clip-text text-5xl font-black tracking-tight text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.35)] sm:text-6xl">
                  {credits.toLocaleString()}
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  Ready for compute & tools
                </p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsPromoModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-yellow-500/10 px-3.5 py-1.5 text-xs font-black text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:bg-amber-400 hover:text-black transition-all active:scale-95 cursor-pointer"
                  >
                    <Gift size={13} /> Redeem Voucher / Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGiftModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-purple-400/40 bg-gradient-to-r from-purple-500/15 to-fuchsia-500/10 px-3.5 py-1.5 text-xs font-black text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:border-purple-400 hover:bg-purple-500 hover:text-white transition-all active:scale-95 cursor-pointer"
                  >
                    <Gift size={13} className="text-purple-300" /> Send Gift Pass
                  </button>
                </div>
              </div>

              {/* 3D Cyber Emblem */}
              <div className="relative group/vault-emblem shrink-0">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-fuchsia-500/20 blur-xl transition-all duration-500 group-hover/vault-emblem:opacity-100 opacity-60" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/35 bg-gradient-to-br from-[#0c1022]/90 via-[#070914]/95 to-[#04050a]/98 shadow-[0_12px_35px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.25),0_0_30px_rgba(34,211,238,0.25)] backdrop-blur-xl transition-transform duration-500 group-hover/vault-emblem:scale-105">
                  <ExismicMark size={46} letter="C" theme="blue" animated={true} />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-7 grid grid-cols-3 gap-3 sm:gap-4">
              {/* Daily */}
              <div className="group/stat relative overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-500/10 via-amber-950/15 to-black/60 p-4 shadow-[0_0_20px_rgba(245,158,11,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300/90">Daily</p>
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    <Zap size={12} className="animate-pulse" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(245,158,11,0.2)] sm:text-3xl">
                  {Number(dailyCredits).toLocaleString()}
                </p>
                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-amber-300/60">Resets 24h</p>
              </div>

              {/* Bonus */}
              <div className="group/stat relative overflow-hidden rounded-2xl border border-purple-400/25 bg-gradient-to-b from-purple-500/10 via-fuchsia-950/15 to-black/60 p-4 shadow-[0_0_20px_rgba(168,85,247,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-purple-400/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-300/90">Bonus</p>
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-purple-400/30 bg-purple-400/15 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    <Gift size={12} />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.2)] sm:text-3xl">
                  {Number(bonusCredits).toLocaleString()}
                </p>
                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-purple-300/60">Rewards</p>
              </div>

              {/* Permanent */}
              <div className="group/stat relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-cyan-500/12 via-blue-950/15 to-black/60 p-4 shadow-[0_0_20px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300/90">Permanent</p>
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/15 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    <Crown size={12} />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.25)] sm:text-3xl">
                  {Number(purchasedCredits).toLocaleString()}
                </p>
                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-cyan-300/60">Never expires</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <DailyRewardLootBox
              user={user}
              claiming={claiming}
              claimLocked={claimLocked}
              dailyStreak={dailyStreak}
              countdown={countdown}
              claimResult={claimResult}
              onClaim={handleClaimDailyReward}
            />
          </motion.div>

          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-400">Permanent reserve</p>
                <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">Credit packs</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/15 to-purple-500/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur-md">
                <ShieldCheck size={14} className="text-cyan-300 animate-pulse" />
                <span>{gatewayName} Checkout</span>
              </span>
            </div>

            <div className="grid gap-5">
              {formattedPacks.map((pack, index) => {
                const Icon = pack.style.icon;
                return (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07 }}
                    className={cn(
                      "group relative overflow-hidden rounded-[2.25rem] p-1.5 backdrop-blur-3xl transition-all duration-300 hover:-translate-y-1",
                      pack.style.cardBorder
                    )}
                  >
                    {/* Ambient Glow */}
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-300 group-hover:opacity-90", pack.style.ambientGradient)} />

                    <div className="relative z-10 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4.5">
                        <div className={cn(
                          "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-white shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-105",
                          pack.style.iconBg
                        )}>
                          <Icon size={28} className={cn("transition-transform duration-300 group-hover:scale-110", pack.style.iconColor)} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{pack.label}</p>
                            {pack.bonusCredits > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                                <Flame size={11} className="text-emerald-300 fill-emerald-400/30" /> +{pack.bonusCredits.toLocaleString()} Bonus
                              </span>
                            )}
                            {pack.popular && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/60 bg-gradient-to-r from-purple-500/30 via-fuchsia-500/30 to-pink-500/30 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.4)] backdrop-blur-md">
                                <Award size={11} className="text-fuchsia-200 fill-fuchsia-400/40" /> Best Value
                              </span>
                            )}
                          </div>
                          <h3 className={cn("mt-1 text-4xl font-black bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent sm:text-5xl", pack.style.numberGradient)}>
                            {(pack.credits + (pack.bonusCredits || 0)).toLocaleString()}{" "}
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 drop-shadow-none">credits</span>
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                            {pack.bonusCredits > 0 ? `${pack.credits.toLocaleString()} base + ${pack.bonusCredits.toLocaleString()} bonus (never expires)` : "Permanent balance, never expires"}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-end sm:min-w-[260px]">
                        <motion.button
                          type="button"
                          onClick={() => handlePurchaseClick(pack)}
                          disabled={isProcessingId !== null || !paymentsEnabled}
                          whileHover={paymentsEnabled ? { y: -3, scale: 1.02 } : undefined}
                          whileTap={paymentsEnabled ? { scale: 0.97 } : undefined}
                          className={cn(
                            "group/launch relative flex min-h-[60px] w-full sm:w-[265px] items-center justify-center overflow-hidden rounded-[22px] p-[2.5px] sm:p-[3px] isolate transition-all duration-500 cursor-pointer select-none",
                            paymentsEnabled
                              ? "shadow-[0_0_35px_rgba(0,0,0,0.85)] hover:shadow-[0_0_45px_rgba(0,0,0,0.95)]"
                              : "bg-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed"
                          )}
                        >
                          {paymentsEnabled && (
                            <>
                              {/* Continuous Seamless Rotating Neon Border (Sharp) */}
                              <motion.span
                                aria-hidden="true"
                                className={cn(
                                  "absolute -inset-[150%] opacity-100 mix-blend-screen transition-opacity duration-500 group-hover/launch:opacity-100",
                                  pack.style.conicGradient
                                )}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              />

                              {/* Outer Diffusion Glow Halo */}
                              <motion.span
                                aria-hidden="true"
                                className={cn(
                                  "absolute -inset-[100%] blur-md opacity-60 mix-blend-screen transition-opacity duration-500 group-hover/launch:opacity-90",
                                  pack.style.conicGradient
                                )}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              />
                            </>
                          )}

                          <span className="relative flex h-full w-full items-center gap-3.5 rounded-[19px] border border-white/10 bg-gradient-to-br from-[#08080d]/98 to-[#040406]/98 px-4 py-2.5 backdrop-blur-2xl transition-colors duration-500 group-hover/launch:from-[#0d0d16]/98 group-hover/launch:to-[#06060a]/98">
                            {/* Idle Shimmer Sweep */}
                            {paymentsEnabled && (
                              <motion.div
                                animate={{ x: ["-250%", "250%"] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1.5 }}
                                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                              />
                            )}

                            {isProcessingId === pack.id ? (
                              <div className="relative z-10 flex h-full w-full items-center justify-center gap-2 py-2 text-white">
                                <Loader2 size={16} className="animate-spin text-cyan-400" />
                                <span className="text-xs font-black uppercase tracking-widest">Processing...</span>
                              </div>
                            ) : (
                              <>
                                <ExismicMark
                                  size={36}
                                  letter="C"
                                  theme={pack.style.markTheme}
                                  className="transition-all duration-500 group-hover/launch:scale-110 group-hover/launch:rotate-3"
                                />

                                <span className="min-w-0 flex-1 text-left relative z-10">
                                  <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-white/90 drop-shadow-sm transition-all duration-500 group-hover/launch:text-white group-hover/launch:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                                    BUY • {pack.priceLabel}
                                  </span>
                                  <span className={cn(
                                    "mt-0.5 block text-[8px] font-bold uppercase tracking-[0.16em] transition-colors duration-500",
                                    pack.style.subtitleColor
                                  )}>
                                    {pack.style.subtitle}
                                  </span>
                                </span>

                                {paymentsEnabled && (
                                  <span className={cn(
                                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.04] bg-white/[0.02] text-zinc-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-500",
                                    pack.style.arrowBoxHover
                                  )}>
                                    <motion.div
                                      animate={{ x: [0, 4, 0] }}
                                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                      className={cn("text-zinc-300 transition-colors", pack.style.arrowIconHover)}
                                    >
                                      <ArrowRight size={15} />
                                    </motion.div>
                                  </span>
                                )}
                              </>
                            )}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-black/50 to-purple-950/20 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="mb-2 flex items-center gap-2.5 text-cyan-300">
                <Info size={18} className="text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Spend order hierarchy</span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-zinc-300">
                Exismic spends daily credits first, then bonus credits, then permanent credits. Your free daily shop reward never reduces your normal allowance.
              </p>
            </div>
          </div>
        </section>
      </main>
      <PaymentTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onConfirm={handlePurchaseConfirm}
        type="credits"
        packName={selectedPack?.label}
        price={selectedPack?.priceLabel}
        gateway={isIndia ? "razorpay" : "paypal"}
        isProcessing={isProcessingId !== null}
        planId={selectedPack?.billingPlanId || selectedPack?.id || "starter"}
      />
      <PaymentSuccessModal
        isOpen={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        type="credits"
        amount={successCredits}
      />
      <PaymentFailureModal
        isOpen={showPaymentFailure}
        onClose={() => setShowPaymentFailure(false)}
        onRetry={() => setShowPaymentFailure(false)}
        reason={failureReason}
      />
      <RedeemPromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
      />
      <GiftPurchaseModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        onSuccess={(details) => {
          setGiftSuccessDetails(details);
        }}
      />
      {giftSuccessDetails && (
        <GiftSuccessModal
          isOpen={Boolean(giftSuccessDetails)}
          onClose={() => setGiftSuccessDetails(null)}
          giftCode={giftSuccessDetails.giftCode}
          giftType={giftSuccessDetails.giftType}
          giftCredits={giftSuccessDetails.giftCredits}
          recipientName={giftSuccessDetails.recipientName}
          recipientMessage={giftSuccessDetails.recipientMessage}
        />
      )}
    </div>
  );
}
