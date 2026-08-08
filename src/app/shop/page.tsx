"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
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
  ShieldCheck,
  Sparkles,
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

const rarityRows = [
  { name: "Common", amount: "10", chance: "Base", color: "text-zinc-300", dot: "bg-zinc-300", aura: "from-zinc-300/25 to-white/5" },
  { name: "Uncommon", amount: "20", chance: "Often", color: "text-cyan-200", dot: "bg-cyan-300", aura: "from-cyan-300/35 to-blue-400/10" },
  { name: "Rare", amount: "50", chance: "Lucky", color: "text-blue-200", dot: "bg-blue-300", aura: "from-blue-300/35 to-violet-400/12" },
  { name: "Epic", amount: "100", chance: "Very lucky", color: "text-fuchsia-200", dot: "bg-fuchsia-300", aura: "from-fuchsia-300/40 to-purple-500/16" },
  { name: "Legendary", amount: "250", chance: "Ultra rare", color: "text-amber-200", dot: "bg-amber-300", aura: "from-amber-200/45 to-fuchsia-400/18" },
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

const packStyles: Record<string, { icon: typeof Zap; gradient: string; glow: string; numberGradient: string }> = {
  blue: { icon: Coins, gradient: "from-cyan-400/18 via-blue-500/12 to-violet-500/12", glow: "shadow-cyan-500/10", numberGradient: "bg-[linear-gradient(110deg,#fff,#93c5fd,#3b82f6,#fff)] drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]" },
  purple: { icon: Diamond, gradient: "from-violet-400/20 via-fuchsia-500/12 to-cyan-400/10", glow: "shadow-violet-500/10", numberGradient: "bg-[linear-gradient(110deg,#fff,#c084fc,#06b6d4,#fff)] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" },
  gold: { icon: Crown, gradient: "from-amber-300/18 via-fuchsia-500/10 to-violet-500/12", glow: "shadow-amber-500/10", numberGradient: "bg-[linear-gradient(110deg,#fff,#fcd34d,#f43f5e,#fff)] drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]" },
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

  const handlePurchaseConfirm = async () => {
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

      <main className="relative z-10 mx-auto max-w-7xl">
        <section className="mb-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100"
            >
              <Sparkles size={14} />
              Credit shop
            </motion.div>
            <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.86] tracking-tight sm:text-7xl lg:text-8xl">
              Build your{" "}
              <span className="block bg-[linear-gradient(110deg,#fff,#c4b5fd,#22d3ee,#f472b6,#fff)] bg-[length:240%_100%] bg-clip-text text-transparent animate-[gradient-shift_8s_ease-in-out_infinite]">
                credit vault.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-zinc-400 sm:text-lg">
              Daily credits reset for normal usage. Bonus rewards and permanent credits sit on top, ready for heavier Pro tools.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-black/60 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.7),0_0_60px_rgba(124,58,237,0.15)] backdrop-blur-3xl sm:p-8">
            {/* Ambient glows inside card */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                  <Coins size={12} className="animate-pulse text-cyan-300" />
                  <span>Vault Balance</span>
                </div>
                <p className="mt-2 bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-5xl font-black tracking-tight text-transparent drop-shadow-[0_0_35px_rgba(34,211,238,0.25)] sm:text-6xl">
                  {credits.toLocaleString()}
                </p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/20 via-purple-500/15 to-transparent text-cyan-100 shadow-[0_0_50px_rgba(34,211,238,0.25)] backdrop-blur-md">
                <Coins size={34} className="drop-shadow-[0_0_15px_rgba(34,211,238,0.9)]" />
              </div>
            </div>

            <div className="relative z-10 mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "Daily", value: dailyCredits, icon: Zap, color: "text-amber-400 border-amber-400/20 bg-amber-400/5", glow: "shadow-[0_0_20px_rgba(251,191,36,0.1)]" },
                { label: "Bonus", value: bonusCredits, icon: Sparkles, color: "text-purple-400 border-purple-400/20 bg-purple-400/5", glow: "shadow-[0_0_20px_rgba(168,85,247,0.1)]" },
                { label: "Permanent", value: purchasedCredits, icon: Crown, color: "text-cyan-400 border-cyan-400/20 bg-cyan-400/5", glow: "shadow-[0_0_20px_rgba(34,211,238,0.1)]" },
              ].map(({ label, value, icon: Icon, color, glow }) => (
                <div key={label} className={cn("rounded-2xl border p-3.5 backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-white/30", color, glow)}>
                  <div className="flex items-center justify-between">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-90">{label}</p>
                    <Icon size={13} className="opacity-90" />
                  </div>
                  <p className="mt-1.5 text-xl font-black tracking-tight text-white">{Number(value).toLocaleString()}</p>
                </div>
              ))}
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
                      "group relative overflow-hidden rounded-[2.25rem] border bg-gradient-to-r from-[#0d0e1b]/98 via-[#080913]/98 to-[#04050a]/98 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-3xl transition-all duration-300 hover:-translate-y-1",
                      pack.popular 
                        ? "border-2 border-purple-400/80 shadow-[0_0_40px_rgba(168,85,247,0.35)] hover:border-fuchsia-300 hover:shadow-[0_0_60px_rgba(217,70,239,0.5)]"
                        : "border-white/15 hover:border-cyan-400/60 hover:shadow-[0_0_45px_rgba(34,211,238,0.25)]"
                    )}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-300 group-hover:opacity-90", pack.style.gradient)} />
                    
                    {/* Top edge neon beam */}
                    <div className={cn(
                      "absolute inset-x-0 top-0 h-[2px]",
                      pack.popular ? "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 shadow-[0_0_18px_rgba(217,70,239,0.9)]" :
                      pack.color === "gold" ? "bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.7)]" :
                      "bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 opacity-70"
                    )} />

                    <div className="relative z-10 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4.5">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 via-black/40 to-black/80 text-white shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400/40">
                          <Icon size={30} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{pack.label}</p>
                            {pack.bonusCredits > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.2)]">
                                <Sparkles size={10} className="animate-pulse" /> +{pack.bonusCredits.toLocaleString()} Bonus
                              </span>
                            )}
                            {pack.popular && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/50 bg-gradient-to-r from-purple-500/25 via-fuchsia-500/25 to-pink-500/25 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.35)] backdrop-blur-md">
                                <Sparkles size={10} className="text-fuchsia-300 animate-pulse fill-fuchsia-300/30" /> Best Value
                              </span>
                            )}
                          </div>
                          <h3 className={cn("mt-1 text-4xl font-black bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent sm:text-5xl", pack.style.numberGradient)}>
                            {(pack.credits + (pack.bonusCredits || 0)).toLocaleString()}{" "}
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 drop-shadow-none">credits</span>
                          </h3>
                          <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-zinc-400">
                            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                            {pack.bonusCredits > 0 ? `${pack.credits.toLocaleString()} base + ${pack.bonusCredits.toLocaleString()} bonus (never expires)` : "Permanent balance, never expires"}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:min-w-[190px]">
                        <button
                          onClick={() => handlePurchaseClick(pack)}
                          disabled={isProcessingId !== null || !paymentsEnabled}
                          className={cn(
                            "group relative flex min-h-13 items-center justify-center overflow-hidden rounded-2xl p-[1.5px] font-black uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer",
                            paymentsEnabled
                              ? "text-white shadow-[0_0_30px_-5px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_-5px_rgba(34,211,238,0.7)] hover:scale-[1.02] active:scale-95"
                              : "text-zinc-500 opacity-60 cursor-not-allowed"
                          )}
                        >
                          {paymentsEnabled && (
                            <span className="absolute inset-0 bg-[linear-gradient(110deg,#06b6d4,#3b82f6,#a855f7,#06b6d4)] bg-[length:300%_auto] animate-gradient-x" />
                          )}
                          <div className={cn(
                            "relative z-10 flex h-full w-full items-center justify-center gap-2.5 rounded-2xl px-6 transition-all duration-500",
                            paymentsEnabled ? "bg-[#030305] group-hover:bg-transparent" : "bg-white/[0.04] border border-white/10"
                          )}>
                            {paymentsEnabled && (
                              <>
                                <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] bg-[length:200%_100%] animate-shine skew-x-[-25deg] pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                                <span className="absolute -left-full inset-y-0 w-1/2 skew-x-[-25deg] bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.3),transparent)] transition-all duration-1000 group-hover:left-[200%]" />
                              </>
                            )}
                            <div className="relative z-20 flex items-center gap-2.5 text-xs">
                              {isProcessingId === pack.id ? <Loader2 size={16} className="animate-spin text-cyan-400" /> : (
                                <span className="font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300 group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,1)] group-hover:text-cyan-50">{pack.priceLabel}</span>
                              )}
                              {paymentsEnabled && !isProcessingId && <ArrowRight size={15} className="text-cyan-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />}
                            </div>
                          </div>
                        </button>
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
    </div>
  );
}
