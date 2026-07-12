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
    refreshCredits,
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
    priceLabel: isIndia ? `Rs ${pack.priceINR}` : `$${pack.priceUSD}`,
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
      
      // Build suspense! Legendary rewards take longer to open with intense animations
      const suspenseTime = result.rarity === "legendary" ? 3000 : result.rarity === "epic" ? 1800 : 1000;
      await new Promise((resolve) => setTimeout(resolve, suspenseTime));
      
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

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Total balance</p>
                <p className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">{credits.toLocaleString()}</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] text-cyan-100 shadow-[0_0_45px_rgba(34,211,238,0.12)]">
                <Coins size={28} />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                ["Daily", dailyCredits],
                ["Bonus", bonusCredits],
                ["Permanent", purchasedCredits],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-2xl border border-white/[0.07] bg-black/25 p-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-600">{label}</p>
                  <p className="mt-1 text-lg font-black text-white">{Number(value).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(145deg,rgba(124,58,237,0.13),rgba(255,255,255,0.035)_48%,rgba(34,211,238,0.08))] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.5)] sm:p-7"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="relative">
              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/80">Free daily shop reward</p>
                  <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Open today&apos;s reward</h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/[0.08] text-fuchsia-100">
                  <Gift size={26} />
                </div>
              </div>



              <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-[#05050a]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <motion.div
                  aria-hidden="true"
                  animate={claimStage === "opening" ? { opacity: [0.16, 0.42, 0.16], scale: [1, 1.08, 1] } : { opacity: 0.18, scale: 1 }}
                  transition={{ duration: 1.15, repeat: claimStage === "opening" ? Infinity : 0, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.24),transparent_35%),radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.22),transparent_36%)]"
                />
                <div className="relative grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
                  <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
                    <AnimatePresence>
                      {claimStage === "revealed" && claimResult && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={
                            claimResult.rarity === "legendary" && claimResult.type === "permanent" ? { scale: [0.8, 1.5, 1.2], opacity: [0, 1, 1], rotate: 360 } :
                            claimResult.rarity === "legendary" ? { scale: [0.8, 1.3, 1.1], opacity: [0, 1, 1], rotate: 180 } :
                            claimResult.rarity === "epic" ? { scale: [0.8, 1.25, 1.15], opacity: [0, 1, 1] } :
                            { scale: 1.25, opacity: 1 }
                          }
                          transition={
                            claimResult.rarity === "legendary" && claimResult.type === "permanent" ? { duration: 4, repeat: Infinity, ease: "linear" } :
                            claimResult.rarity === "legendary" ? { duration: 6, repeat: Infinity, ease: "linear" } :
                            claimResult.rarity === "epic" ? { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } :
                            { duration: 0.6, ease: "easeOut" }
                          }
                          className={cn(
                            "absolute inset-4 rounded-[2rem] bg-gradient-to-br opacity-90 blur-[35px]",
                            getRewardVisual(claimResult.rarity).aura
                          )}
                        />
                      )}
                    </AnimatePresence>

                    {claimStage === "opening" && (
                      <motion.div
                        animate={
                          claimResult?.rarity === "legendary" 
                            ? { scale: [1, 1.8, 2.5], opacity: [0, 0.9, 0] } 
                            : claimResult?.rarity === "epic" 
                            ? { scale: [1, 1.5, 2], opacity: [0, 0.7, 0] } 
                            : { scale: [1, 1.4, 1.8], opacity: [0, 0.6, 0] }
                        }
                        transition={{ 
                          duration: claimResult?.rarity === "legendary" ? 0.4 : claimResult?.rarity === "epic" ? 0.8 : 1.2, 
                          repeat: Infinity, 
                          ease: "easeOut" 
                        }}
                        className={cn(
                          "absolute inset-4 rounded-full blur-xl",
                          claimResult?.rarity === "legendary" ? "bg-amber-400" : claimResult?.rarity === "epic" ? "bg-purple-400" : "bg-cyan-400"
                        )}
                      />
                    )}
                    <motion.div
                      animate={claimStage === "opening" ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ 
                        duration: claimStage === "opening" && claimResult?.rarity === "legendary" ? 0.5 : claimStage === "opening" ? 3 : 0, 
                        repeat: claimStage === "opening" ? Infinity : 0, 
                        ease: "linear" 
                      }}
                      className={cn(
                        "absolute inset-0 rounded-[2.5rem] opacity-90 blur-lg",
                        claimResult?.rarity === "legendary" && claimStage === "opening" ? "bg-[conic-gradient(from_0deg,transparent,#fcd34d,#f59e0b,#fff,#f59e0b,transparent)]" :
                        "bg-[conic-gradient(from_0deg,transparent,#22d3ee,#a855f7,#fff,#22d3ee,transparent)]"
                      )}
                    />
                    <motion.div
                      animate={
                        claimStage === "opening" && claimResult?.rarity === "legendary" ? { scale: [1, 1.15, 1], rotate: [0, -4, 4, -4, 4, 0] } : 
                        claimStage === "opening" && claimResult?.rarity === "epic" ? { scale: [1, 1.1, 1], rotate: [0, -2, 2, 0] } : 
                        claimStage === "opening" ? { scale: [1, 1.05, 1] } : 
                        claimStage === "revealed" && claimResult?.rarity === "legendary" && claimResult?.type === "permanent" ? { scale: [0.8, 1.15, 1], y: [0, -10, 0], rotate: [0, -2, 2, -2, 2, 0] } :
                        claimStage === "revealed" && claimResult?.rarity === "legendary" ? { scale: [0.8, 1.15, 1], y: [0, -5, 0] } :
                        claimStage === "revealed" ? { scale: [0.8, 1.15, 1] } : { scale: 1 }
                      }
                      transition={
                        claimStage === "opening" && claimResult?.rarity === "legendary" ? { duration: 0.3, repeat: Infinity, ease: "linear" } : 
                        claimStage === "opening" && claimResult?.rarity === "epic" ? { duration: 0.6, repeat: Infinity, ease: "linear" } : 
                        claimStage === "opening" ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : 
                        claimStage === "revealed" && claimResult?.rarity === "legendary" && claimResult?.type === "permanent" ? { duration: 2, repeat: Infinity, repeatType: "reverse" } :
                        claimStage === "revealed" && claimResult?.rarity === "legendary" ? { duration: 3, repeat: Infinity, repeatType: "reverse" } :
                        { duration: 0.5, ease: "easeInOut" }
                      }
                      className={cn(
                        "relative flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-[2rem] border bg-gradient-to-br from-[#12121a] to-[#050508] shadow-[0_0_45px_rgba(0,0,0,0.8)] backdrop-blur-xl",
                        claimResult?.rarity === "legendary" && claimResult?.type === "permanent" ? "border-amber-400/60 shadow-[0_0_60px_rgba(251,191,36,0.3)]" :
                        claimResult?.rarity === "legendary" ? "border-amber-400/40" :
                        claimResult ? "border-white/20" : "border-white/10"
                      )}
                    >
                      {claimStage === "opening" && (
                        <div className={cn(
                          "absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.15),transparent)] bg-[length:100%_200%] pointer-events-none",
                          claimResult?.rarity === "legendary" ? "animate-shine-fast" : "animate-shine"
                        )} />
                      )}
                      
                      {claimStage === "revealed" && claimResult?.rarity === "legendary" && claimResult?.type === "permanent" && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent,#fcd34d,#f59e0b,#fff,#f59e0b,transparent)] opacity-30 blur-md pointer-events-none"
                        />
                      )}
                      {claimStage === "revealed" && claimResult?.rarity === "legendary" && claimResult?.type === "temporary" && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent,#fcd34d,#fff,transparent)] opacity-20 blur-md pointer-events-none"
                        />
                      )}

                      {/* Glass effect layers */}
                      <div className="absolute inset-x-2 top-2 h-1/3 rounded-full bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none blur-[1px]" />
                      <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] pointer-events-none" />

                      <div className={cn(
                        "relative flex h-24 w-24 items-center justify-center rounded-[1.3rem] border bg-black/60 shadow-[inset_0_2px_20px_rgba(255,255,255,0.04)] backdrop-blur-md",
                        claimResult?.rarity === "legendary" ? "border-amber-400/30 shadow-[0_0_25px_rgba(251,191,36,0.15)]" : "border-white/10"
                      )}>
                        {claimStage === "opening" ? (
                          <Loader2 size={36} className={cn(
                            "animate-spin", 
                            claimResult?.rarity === "legendary" ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : 
                            claimResult?.rarity === "epic" ? "text-purple-400" : "text-cyan-100"
                          )} />
                        ) : claimResult ? (
                          <span className={cn(
                            "text-4xl font-black italic tracking-tighter bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent pr-2",
                            claimResult.type === "permanent" 
                              ? "bg-[linear-gradient(110deg,#fff,#fcd34d,#f43f5e,#fff)] drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]" 
                              : "bg-[linear-gradient(110deg,#fff,#93c5fd,#3b82f6,#fff)] drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                          )}>
                            +{claimResult.amount}
                          </span>
                        ) : (
                          <Gift size={38} className="text-white/80 drop-shadow-md" />
                        )}
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {claimStage === "revealed" && claimResult && (
                        <>
                          {claimParticles.map((particle) => (
                            <motion.span
                              key={particle.id}
                              initial={{ x: 0, y: 0, opacity: 0, scale: 0.45 }}
                              animate={{ x: particle.x, y: particle.y, opacity: [0, 1, 0], scale: [0.45, 1, 0.2] }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.9, delay: particle.delay, ease: "easeOut" }}
                              className={cn("absolute left-1/2 top-1/2 h-2 w-2 rounded-full", getRewardVisual(claimResult.rarity).dot)}
                            />
                          ))}
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="text-center md:text-left">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-[0.24em]",
                      claimResult ? getRewardVisual(claimResult.rarity).color : "text-cyan-100/70"
                    )}>
                      {claimStage === "opening" ? "Reward charging" : claimResult ? `${claimResult.rarity} reward unlocked` : "Daily bonus reward"}
                    </p>
                    <h3 className={cn(
                      "mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl",
                      claimResult?.type === "permanent" 
                        ? "bg-[linear-gradient(110deg,#fff,#fcd34d,#f43f5e,#fff)] bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]" 
                        : claimResult
                          ? "bg-[linear-gradient(110deg,#fff,#93c5fd,#3b82f6,#fff)] bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                          : "text-white"
                    )}>
                      {claimStage === "opening" ? "Opening your reward..." : claimResult ? `+${claimResult.amount} ${claimResult.type === "permanent" ? "permanent" : claimResult.type === "temporary" ? "temporary" : ""} credits`.trim() : "Tap once. Reveal your bonus."}
                    </h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-zinc-500">
                      {claimResult
                        ? claimResult.type === "permanent" 
                          ? "Added to your permanent lifetime balance. These credits never expire and will always be available."
                          : claimResult.type === "temporary"
                            ? "Added to your temporary balance. Temporary credits expire when the daily limit resets, so use them today!"
                            : "Claimed and added to your balance. Come back tomorrow for another chance!"
                        : "Daily rewards have a chance to drop temporary credits that expire daily, or extremely rare permanent credits."}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClaimDailyReward}
                disabled={claiming || claimLocked}
                className={cn(
                  "mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.22em] transition-all",
                  claimLocked
                    ? "border border-emerald-300/15 bg-emerald-300/[0.065] text-emerald-100"
                    : "bg-[linear-gradient(135deg,#a855f7,#2563eb_52%,#22d3ee)] text-white shadow-[0_20px_55px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 hover:brightness-110"
                )}
              >
                {claiming ? <Loader2 size={18} className="animate-spin" /> : claimLocked ? <CheckCircle2 size={18} /> : <Gift size={18} />}
                {claiming ? "Opening reward" : claimLocked ? `New reward in ${countdown || "..."}` : "Claim free reward"}
              </button>
            </div>
          </motion.div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">Permanent credits</p>
                <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">Credit packs</h2>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em]",
                  "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-100",
                )}
              >
                <CreditCard size={12} />
                {gatewayName} checkout
              </span>
            </div>

            <div className="grid gap-4">
              {formattedPacks.map((pack, index) => {
                const Icon = pack.style.icon;
                return (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07 }}
                    className={cn(
                      "relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-1 shadow-2xl",
                      pack.style.glow,
                      pack.popular && "border-cyan-300/30"
                    )}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", pack.style.gradient)} />
                    {pack.popular && (
                      <div className="absolute right-5 top-0 rounded-b-xl bg-gradient-to-r from-cyan-300 to-violet-300 px-3 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-black">
                        Best value
                      </div>
                    )}
                    <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-white">
                          <Icon size={28} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">{pack.label}</p>
                          <h3 className={cn("mt-1 text-4xl font-black bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent", pack.style.numberGradient)}>{pack.credits.toLocaleString()} <span className="text-sm font-bold text-zinc-500 drop-shadow-none">credits</span></h3>
                          <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-zinc-500">
                            <ShieldCheck size={13} className="text-emerald-300" />
                            Permanent balance, never expires
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:min-w-[180px]">
                        <button
                          onClick={() => handlePurchaseClick(pack)}
                          disabled={isProcessingId !== null || !paymentsEnabled}
                          className={cn(
                            "group relative flex min-h-12 items-center justify-center overflow-hidden rounded-2xl p-[1.5px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                            paymentsEnabled
                              ? "text-white shadow-[0_0_25px_-5px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_-10px_rgba(34,211,238,0.6)] hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
                              : "text-zinc-500 opacity-60 cursor-not-allowed"
                          )}
                        >
                          {paymentsEnabled && (
                            <span className="absolute inset-0 bg-[linear-gradient(110deg,#06b6d4,#3b82f6,#a855f7,#06b6d4)] bg-[length:300%_auto] animate-gradient-x" />
                          )}
                          <div className={cn(
                            "relative z-10 flex h-full w-full items-center justify-center gap-2 rounded-2xl px-5 transition-all duration-500",
                            paymentsEnabled ? "bg-[#030303] group-hover:bg-transparent" : "bg-white/[0.04] border border-white/10"
                          )}>
                            {paymentsEnabled && (
                              <>
                                <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] bg-[length:200%_100%] animate-shine skew-x-[-25deg] pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                                <span className="absolute -left-full inset-y-0 w-1/2 skew-x-[-25deg] bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.25),transparent)] transition-all duration-1000 group-hover:left-[200%]" />
                              </>
                            )}
                            <div className="relative z-20 flex items-center gap-2 text-[11px] sm:text-[12px]">
                              {isProcessingId === pack.id ? <Loader2 size={16} className="animate-spin text-cyan-400" /> : paymentsEnabled ? (
                                <span className="font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)] group-hover:text-cyan-50">{pack.priceLabel}</span>
                              ) : "Live checkout soon"}
                              {paymentsEnabled && !isProcessingId && <ArrowRight size={14} className="text-cyan-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />}
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-sm font-medium leading-6 text-zinc-500">
              <div className="mb-2 flex items-center gap-2 text-zinc-300">
                <Info size={16} className="text-cyan-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em]">Spend order</span>
              </div>
              Exismic spends daily credits first, then bonus credits, then permanent credits. Your free shop reward never reduces your normal daily allowance.
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
