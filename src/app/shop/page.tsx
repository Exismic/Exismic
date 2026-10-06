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
import { PRICING_CONFIG, getIsIndia, isExismic17PromoActive } from "@/config/pricing";
import { cn } from "@/lib/utils";
import { PaymentTermsModal } from "@/components/modals/PaymentTermsModal";
import { PaymentFailureModal } from "@/components/modals/PaymentFailureModal";
import { createCheckoutSignal, loadRazorpayCheckout } from "@/lib/payments/loadRazorpayCheckout";
import { reportPaymentFailure } from "@/lib/payments/reportPaymentFailure";
import { DailyRewardLootBox } from "@/components/reward/DailyRewardLootBox";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb";
import { RedeemPromoModal } from "@/components/modals/RedeemPromoModal";
import { GiftPurchaseModal } from "@/components/modals/GiftPurchaseModal";
import { GiftSuccessModal } from "@/components/modals/GiftSuccessModal";
import { FallingIconsBackground } from "@/components/ui/FallingIconsBackground";

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
    subtitle: "For Regular Creators",
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
  regularPriceLabel?: string;
  promoActive?: boolean;
  style: (typeof packStyles)[keyof typeof packStyles];
};

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature: string;
};

function formatStatNumber(val: number): string {
  if (val >= 100_000_000) {
    return (val / 1_000_000).toFixed(0) + "M";
  }
  if (val >= 10_000_000) {
    return (val / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  return val.toLocaleString();
}

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
  const [showPaymentFailure, setShowPaymentFailure] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftSuccessDetails, setGiftSuccessDetails] = useState<{
    giftCode: string;
    giftType: "pro" | "pro_monthly" | "pro_yearly" | "credits";
    giftCredits?: number;
    recipientName?: string;
    recipientMessage?: string;
    orderId?: string;
  } | null>(null);
  const [failureReason, setFailureReason] = useState<string | undefined>();

  useEffect(() => {
    if (getIsIndia()) {
      setIsIndia(true);
    }
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
      const order = searchParams.get("order");
      router.replace(order ? `/billing/success?order=${encodeURIComponent(order)}` : "/shop");
      return;
    } else if (paymentStatus === "failed") {
      const reason = paymentReason || "Payment could not be verified.";
      setFailureReason(reason);
      setShowPaymentFailure(true);
      toast(reason, "warning");
    } else if (paymentStatus === "cancelled") {
      toast("Checkout cancelled. If charged, check your balance before trying again.", "info");
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

  const formattedPacks = useMemo<CreditPack[]>(() => {
    const promoActive = isExismic17PromoActive();
    return PRICING_CONFIG.CREDIT_PACKAGES.map((pack) => {
      let effectiveInr = pack.priceINR;
      let effectiveUsd = pack.priceUSD;
      if (promoActive) {
        if (pack.id === "tier_1" || pack.billingPlanId === "starter") {
          effectiveInr = PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS.starter.INR;
          effectiveUsd = PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS.starter.USD;
        } else if (pack.id === "tier_2" || pack.billingPlanId === "creator") {
          effectiveInr = PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS.creator.INR;
          effectiveUsd = PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS.creator.USD;
        } else if (pack.id === "tier_3" || pack.billingPlanId === "ultimate") {
          effectiveInr = PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS.ultimate.INR;
          effectiveUsd = PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS.ultimate.USD;
        }
      }
      return {
        ...pack,
        priceINR: effectiveInr,
        priceUSD: effectiveUsd,
        regularPriceLabel: isIndia ? `₹${pack.priceINR}` : `$${pack.priceUSD}`,
        priceLabel: isIndia ? `₹${effectiveInr}` : `$${effectiveUsd}`,
        promoActive,
        style: packStyles[pack.color as keyof typeof packStyles] || packStyles.blue,
      };
    });
  }, [isIndia]);

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
    router.push(`/checkout?plan=${pack.billingPlanId || pack.id}${isIndia ? "&market=IN" : "&market=GLOBAL"}`);
    return;
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
            try {
              const verifyResponse = await fetch("/api/billing/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentResponse),
              });
              const verifyData = await verifyResponse.json().catch(() => null);
              if (!verifyResponse.ok || !verifyData?.success) {
                window.location.assign(`/billing/success?order=${encodeURIComponent(data.orderId)}`);
                return;
              }
              window.location.href = `/billing/success?order=${encodeURIComponent(verifyData.orderId)}`;
            } catch {
              window.location.assign(`/billing/success?order=${encodeURIComponent(data.orderId)}`);
            } finally {
              setIsProcessingId(null);
            }
          },
        });

        razorpay.on("payment.failed", (failure: unknown) => {
          reportPaymentFailure(data.orderId, failure);
          const reason = "The payment provider reported this payment as unsuccessful.";
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
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] px-4 pb-20 pt-6 text-white selection:bg-purple-500/30 sm:px-6 sm:pt-8 lg:px-8 lg:pt-24">
      {/* Dynamic Falling Icons Background */}
      <FallingIconsBackground variant="credits" />

      <main className="relative z-10 mx-auto max-w-7xl space-y-8">
        <PageBreadcrumb items={[{ label: "Credit Shop" }]} />

        {/* SECTION 1: HERO & BALANCE CONSOLE */}
        <section className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100"
              >
                <Coins size={14} className="text-cyan-300" />
                Credit shop
              </motion.div>
              <h1 className="max-w-2xl text-4xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
                Exismic{" "}
                <span className="block bg-[linear-gradient(110deg,#fff,#c4b5fd,#22d3ee,#f472b6,#fff)] bg-[length:240%_100%] bg-clip-text text-transparent animate-[gradient-shift_8s_ease-in-out_infinite]">
                  Credit Shop.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-zinc-400 sm:text-base">
                Daily credits refill every 24 hours for routine usage. Permanent reserve credits sit on top, never expire, and are ready for heavy workloads.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/rewards/guide"
                className="inline-flex min-h-11 items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-xs font-bold text-cyan-300 hover:border-cyan-300 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
              >
                <span>Credit Rules & Non-Refund Policy</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 min-w-0 relative overflow-clip rounded-[2.5rem] border-2 border-cyan-400/40 bg-gradient-to-br from-[#0c0e1a]/95 via-[#070810]/98 to-[#030408]/98 p-5 shadow-[0_32px_100px_rgba(0,0,0,0.85),0_0_40px_rgba(34,211,238,0.2)] backdrop-blur-3xl sm:p-7 flex flex-col justify-between">
            {/* Ambient glows inside card */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="relative z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
              <div className="contents">
                <div className="inline-flex max-w-full justify-self-start items-center gap-2 whitespace-nowrap rounded-full border border-cyan-400/35 bg-cyan-400/10 px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.14em] sm:tracking-[0.22em] text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                  <span className="sm:hidden">Available balance</span>
                  <span className="hidden sm:inline">Total Available Balance</span>
                </div>
                <p className="col-span-2 mt-2 bg-gradient-to-r from-white via-cyan-100 to-indigo-100 bg-clip-text text-3xl sm:text-5xl font-black tracking-tight text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.35)]">
                  {credits.toLocaleString()}
                </p>
                <p className="col-span-2 mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  Ready for compute & tools
                </p>
                <div className="col-span-2 mt-3.5 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsPromoModalOpen(true)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-yellow-500/10 px-3.5 py-1.5 text-xs font-black text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:bg-amber-400 hover:text-black transition-all active:scale-95 cursor-pointer"
                  >
                    <Gift size={13} /> Redeem Voucher / Code
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/checkout?plan=pro&gift=true${isIndia ? "&market=IN" : ""}`)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-purple-400/40 bg-gradient-to-r from-purple-500/15 to-fuchsia-500/10 px-3.5 py-1.5 text-xs font-black text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:border-purple-400 hover:bg-purple-500 hover:text-white transition-all active:scale-95 cursor-pointer"
                  >
                    <Gift size={13} className="text-purple-300" /> Send Gift Pass
                  </button>
                </div>
              </div>

              {/* 3D Cyber Emblem */}
              <div className="col-start-2 row-start-1 relative group/vault-emblem shrink-0">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-fuchsia-500/20 blur-xl transition-all duration-500 group-hover/vault-emblem:opacity-100 opacity-60" />
                <div className="relative flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center rounded-3xl border border-cyan-300/35 bg-gradient-to-br from-[#0c1022]/90 via-[#070914]/95 to-[#04050a]/98 shadow-[0_12px_35px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.25),0_0_30px_rgba(34,211,238,0.25)] backdrop-blur-xl transition-transform duration-500 group-hover/vault-emblem:scale-105">
                  <ExismicMark size={42} letter="C" theme="blue" animated={true} />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
              {/* Daily */}
              <div className="group/stat relative overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-500/10 via-amber-950/15 to-black/60 p-3 sm:p-3.5 shadow-[0_0_20px_rgba(245,158,11,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-amber-400/50">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300/90">Daily</p>
                  <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    <Zap size={11} className="animate-pulse" />
                  </div>
                </div>
                <p
                  title={Number(dailyCredits).toLocaleString()}
                  className="mt-1.5 text-base sm:text-lg lg:text-xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(245,158,11,0.2)] truncate"
                >
                  {formatStatNumber(Number(dailyCredits))}
                </p>
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-amber-300/60">Resets 24h</p>
              </div>

              {/* Bonus */}
              <div className="group/stat relative overflow-hidden rounded-2xl border border-purple-400/25 bg-gradient-to-b from-purple-500/10 via-fuchsia-950/15 to-black/60 p-3 sm:p-3.5 shadow-[0_0_20px_rgba(168,85,247,0.06),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/50">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-300/90">Bonus</p>
                  <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg border border-purple-400/30 bg-purple-400/15 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    <Gift size={11} />
                  </div>
                </div>
                <p
                  title={Number(bonusCredits).toLocaleString()}
                  className="mt-1.5 text-base sm:text-lg lg:text-xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.2)] truncate"
                >
                  {formatStatNumber(Number(bonusCredits))}
                </p>
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-purple-300/60">Rewards</p>
              </div>

              {/* Permanent */}
              <div className="col-span-2 sm:col-span-1 group/stat relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-cyan-500/12 via-blue-950/15 to-black/60 p-3 sm:p-3.5 shadow-[0_0_20px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/60">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300/90">Permanent</p>
                  <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/15 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    <Crown size={11} />
                  </div>
                </div>
                <p
                  title={Number(purchasedCredits).toLocaleString()}
                  className="mt-1.5 text-base sm:text-lg lg:text-xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.25)] truncate"
                >
                  {formatStatNumber(Number(purchasedCredits))}
                </p>
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-cyan-300/60">Never expires</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: CREDIT PACKS 3-COLUMN SHOWCASE (COMPACT & CENTERED) */}
        <section className="space-y-5 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/[0.08] pb-3.5">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-400">
                <Coins size={13} className="text-cyan-400" />
                Permanent Reserve
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Credit Packs
              </h2>
              <p className="mt-0.5 text-xs text-zinc-400">
                One-time purchase • Credits never expire • Usable across all AI tools and models
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/15 to-purple-500/10 px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur-md">
                <ShieldCheck size={13} className="text-cyan-300 animate-pulse" />
                <span suppressHydrationWarning>{gatewayName} Secure Checkout</span>
              </span>
            </div>
          </div>

          {/* Centered, sleek 3-column card grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch max-w-5xl mx-auto">
            {formattedPacks.map((pack, index) => {
              const Icon = pack.style.icon;
              return (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={cn(
                    "group relative flex flex-col justify-between overflow-hidden rounded-3xl p-5 sm:p-5.5 backdrop-blur-3xl transition-all duration-300 hover:-translate-y-1 text-center",
                    pack.style.cardBorder,
                    pack.popular && "ring-1 ring-purple-400/50 shadow-[0_0_35px_rgba(168,85,247,0.3)] md:-translate-y-1"
                  )}
                >
                  {/* Ambient Glow */}
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity duration-300 group-hover:opacity-85 pointer-events-none", pack.style.ambientGradient)} />

                  <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
                    {/* Top Tier Header (Centered) */}
                    <div className="flex flex-col items-center">
                      {/* Fixed height badge container to ensure perfect baseline alignment */}
                      <div className="flex items-center justify-center gap-1.5 min-h-[22px] mb-2.5">
                        {pack.popular && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/60 bg-gradient-to-r from-purple-500/30 via-fuchsia-500/30 to-pink-500/30 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.4)] backdrop-blur-md">
                            <Award size={10} className="text-fuchsia-200 fill-fuchsia-400/40" /> Most Popular
                          </span>
                        )}
                        {pack.promoActive && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-400/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                            20% OFF
                          </span>
                        )}
                        {pack.bonusCredits > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.25)]">
                            <Flame size={10} className="text-emerald-300 fill-emerald-400/30" /> +{pack.bonusCredits.toLocaleString()} Bonus
                          </span>
                        )}
                      </div>

                      {/* Centered Icon Container */}
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl border text-white shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-105",
                        pack.style.iconBg
                      )}>
                        <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", pack.style.iconColor)} />
                      </div>

                      {/* Tier Label */}
                      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">
                        {pack.label}
                      </p>

                      {/* Credits Amount */}
                      <div className="mt-1 flex items-baseline justify-center gap-1.5">
                        <h3 className={cn("text-3xl sm:text-4xl font-black bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent", pack.style.numberGradient)}>
                          {(pack.credits + (pack.bonusCredits || 0)).toLocaleString()}
                        </h3>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">credits</span>
                      </div>

                      {/* Features / Details */}
                      <div className="mt-2.5 space-y-1 text-center">
                        <p className="flex items-center justify-center gap-1 text-[11px] font-semibold text-zinc-300">
                          <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                          <span>{pack.bonusCredits > 0 ? `${pack.credits.toLocaleString()} base + ${pack.bonusCredits.toLocaleString()} bonus` : "Permanent balance, never expires"}</span>
                        </p>
                        <p className="text-[10px] text-zinc-400" suppressHydrationWarning>
                          {isIndia ? "₹" : "$"}{((isIndia ? pack.priceINR : pack.priceUSD) / (pack.credits + pack.bonusCredits) * 100).toFixed(2)} per 100 credits · one-time
                        </p>
                      </div>
                    </div>

                    {/* Centered CTA Button */}
                    <div className="pt-3 border-t border-white/[0.08]">
                      <motion.button
                        type="button"
                        onClick={() => handlePurchaseClick(pack)}
                        disabled={isProcessingId !== null || !paymentsEnabled}
                        whileHover={paymentsEnabled ? { y: -2, scale: 1.01 } : undefined}
                        whileTap={paymentsEnabled ? { scale: 0.98 } : undefined}
                        className={cn(
                          "group/launch relative flex min-h-[48px] w-full items-center justify-center overflow-hidden rounded-xl p-[2px] isolate transition-all duration-500 cursor-pointer select-none",
                          paymentsEnabled
                            ? "shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:shadow-[0_0_35px_rgba(0,0,0,0.95)]"
                            : "bg-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed"
                        )}
                      >
                        {paymentsEnabled && (
                          <>
                            {/* Rotating Neon Border */}
                            <motion.span
                              aria-hidden="true"
                              className={cn(
                                "absolute -inset-[150%] opacity-100 mix-blend-screen transition-opacity duration-500 group-hover/launch:opacity-100",
                                pack.style.conicGradient
                              )}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                            {/* Glow Halo */}
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

                        <span className="relative flex h-full w-full items-center justify-center gap-2.5 rounded-[10px] border border-white/10 bg-gradient-to-br from-[#08080d]/98 to-[#040406]/98 px-3 py-2 backdrop-blur-2xl transition-colors duration-500 group-hover/launch:from-[#0d0d16]/98 group-hover/launch:to-[#06060a]/98">
                          {paymentsEnabled && (
                            <motion.div
                              animate={{ x: ["-250%", "250%"] }}
                              transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1.5 }}
                              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                            />
                          )}

                          {isProcessingId === pack.id ? (
                            <div className="relative z-10 flex h-full w-full items-center justify-center gap-2 text-white">
                              <Loader2 size={15} className="animate-spin text-cyan-400" />
                              <span className="text-[11px] font-black uppercase tracking-wider">Processing...</span>
                            </div>
                          ) : (
                            <>
                              <ExismicMark
                                size={24}
                                letter="C"
                                theme={pack.style.markTheme}
                                className="transition-all duration-500 group-hover/launch:scale-110 shrink-0"
                              />

                              <div className="text-center min-w-0">
                                <div className="flex items-center justify-center gap-1.5">
                                  {pack.promoActive && (
                                    <span className="text-[9px] text-zinc-400 line-through" suppressHydrationWarning>
                                      {pack.regularPriceLabel}
                                    </span>
                                  )}
                                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide" suppressHydrationWarning>
                                    BUY • {pack.priceLabel}
                                  </span>
                                </div>
                                <span className={cn(
                                  "text-[10px] font-medium transition-colors duration-500 block",
                                  pack.style.subtitleColor
                                )}>
                                  {pack.style.subtitle}
                                </span>
                              </div>

                              <ArrowRight size={13} className={cn("text-zinc-400 group-hover/launch:translate-x-0.5 transition-transform shrink-0", pack.style.arrowIconHover)} />
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
        </section>

        {/* Laser Horizon Bridge (AGENTS.md guideline) */}
        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        {/* SECTION 3: DAILY REWARD & SPEND HIERARCHY */}
        <section className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Daily Reward Loot Box (7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 space-y-3"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-400">Daily Free Refuel</p>
              <h3 className="mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Daily Reward & Streak</h3>
              <p className="mt-0.5 text-xs text-zinc-400">
                Claim free credits every 24 hours to keep your streak alive and boost bonus multipliers.
              </p>
            </div>

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

          {/* Spend Hierarchy & Guidance (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-400">System Overview</p>
              <h3 className="mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Credit Hierarchy</h3>
              <p className="mt-0.5 text-xs text-zinc-400">
                Clear deduction priority so your permanent reserves are always protected.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-[#0c0e1a]/95 via-[#070810]/98 to-[#030408]/98 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <Info size={16} className="text-cyan-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.18em]">Deduction Order</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 font-bold text-xs">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">Daily Allowance</p>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Deducted first. Resets automatically every 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl border border-purple-400/20 bg-purple-400/[0.04]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-400/20 text-purple-300 font-bold text-xs">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">Bonus Rewards</p>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Deducted second. Earned from daily claims and promo rewards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-300 font-bold text-xs">
                    3
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">Permanent Reserve</p>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Deducted last. Never expires and stays ready for heavy workloads.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-zinc-400">Have questions about credits?</span>
                <Link
                  href="/rewards/guide"
                  className="inline-flex items-center gap-1.5 font-bold text-cyan-300 hover:text-white transition-colors"
                >
                  <span>Credit Guide</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
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
        regularPrice={selectedPack?.regularPriceLabel}
        gateway={isIndia ? "razorpay" : "paypal"}
        isProcessing={isProcessingId !== null}
        planId={selectedPack?.billingPlanId || selectedPack?.id || "starter"}
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
          orderId={giftSuccessDetails.orderId}
        />
      )}
    </div>
  );
}
