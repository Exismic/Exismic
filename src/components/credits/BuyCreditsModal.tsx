"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crown, 
  Coins, 
  Sparkles, 
  Loader2, 
  X, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Diamond, 
  Flame, 
  Award,
  Palette,
  CheckCircle2,
  Clock,
  RefreshCw
} from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { cn } from "@/lib/utils";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";
import { ExismicMark } from "@/components/ui/ExismicLogo";
import { PaymentTermsModal } from "@/components/modals/PaymentTermsModal";
import { PaymentSuccessModal } from "@/components/modals/PaymentSuccessModal";
import { PaymentFailureModal } from "@/components/modals/PaymentFailureModal";
import { useCredits } from "@/hooks/useCredits";

interface CreditPackOption {
  id: string;
  label: string;
  displayCredits: string;
  subtitle: string;
  bonusCredits?: number;
  popular?: boolean;
  style: {
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
  };
  credits: number;
  inrPrice: number;
  usdPrice: number;
}

const CREDIT_PACK_OPTIONS: CreditPackOption[] = [
  {
    id: "starter",
    label: "STARTER PACK",
    displayCredits: "500",
    subtitle: "Permanent balance, never expires",
    bonusCredits: 0,
    style: {
      icon: Coins,
      iconColor: "text-cyan-300",
      iconBg: "border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 via-blue-900/30 to-black/85 shadow-[0_0_20px_rgba(34,211,238,0.3)]",
      cardBorder: "border-2 border-cyan-400/80 bg-gradient-to-r from-[#0a0d1c]/98 via-[#060813]/98 to-[#030408]/98 hover:border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.3),0_20px_60px_rgba(0,0,0,0.85)]",
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
    credits: 500,
    inrPrice: 299,
    usdPrice: 3.99,
  },
  {
    id: "creator",
    label: "CREATOR CHOICE",
    displayCredits: "2,000",
    subtitle: "1,500 base + 500 bonus (never expires)",
    bonusCredits: 500,
    popular: true,
    style: {
      icon: Diamond,
      iconColor: "text-purple-300",
      iconBg: "border-purple-400/45 bg-gradient-to-br from-purple-500/30 via-fuchsia-950/40 to-black/85 shadow-[0_0_25px_rgba(168,85,247,0.4)]",
      cardBorder: "border-2 border-purple-400/85 bg-gradient-to-r from-[#120c22]/98 via-[#0b0817]/98 to-[#04030a]/98 shadow-[0_0_30px_rgba(168,85,247,0.35),0_24px_70px_rgba(0,0,0,0.85)] hover:border-fuchsia-300",
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
    credits: 2000,
    inrPrice: 699,
    usdPrice: 8.99,
  },
  {
    id: "ultimate",
    label: "STUDIO POWER",
    displayCredits: "6,000",
    subtitle: "5,000 base + 1,000 bonus (never expires)",
    bonusCredits: 1000,
    style: {
      icon: Crown,
      iconColor: "text-amber-300",
      iconBg: "border-amber-400/45 bg-gradient-to-br from-amber-500/30 via-rose-950/40 to-black/85 shadow-[0_0_25px_rgba(245,158,11,0.35)]",
      cardBorder: "border-2 border-amber-400/80 bg-gradient-to-r from-[#170e08]/98 via-[#0f0a07]/98 to-[#050302]/98 hover:border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.3),0_20px_60px_rgba(0,0,0,0.85)]",
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
    credits: 6000,
    inrPrice: 1499,
    usdPrice: 19.99,
  },
];

export interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: "pro" | "credits";
  initialPlanId?: string;
}

export function BuyCreditsModal({
  isOpen,
  onClose,
  initialCategory = "credits",
  initialPlanId,
}: BuyCreditsModalProps) {
  const [activeCategory, setActiveCategory] = useState<"pro" | "credits">(initialCategory);
  const [isIndia, setIsIndia] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState("00h 00m 00s");

  // Post-purchase modals
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<"pro" | "credits">("credits");
  const [successCredits, setSuccessCredits] = useState(0);
  const [showFailure, setShowFailure] = useState(false);
  const [failureReason, setFailureReason] = useState<string | undefined>();

  // Payment Terms / Alternative Checkout
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsPlan, setTermsPlan] = useState<{
    id: string;
    title: string;
    credits: number;
    priceDisplay: string;
    category: "pro" | "credits";
  } | null>(null);

  const { credits, refreshCredits } = useCredits();

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    let active = true;
    fetch("/api/billing/market", { cache: "no-store" })
      .then((res) => res.json())
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

  // 24h Reset Timer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istOffsetMs = 5.5 * 60 * 60 * 1000;
      const nowInIst = new Date(now.getTime() + istOffsetMs);
      const nextMidnightIstUtc =
        Date.UTC(
          nowInIst.getUTCFullYear(),
          nowInIst.getUTCMonth(),
          nowInIst.getUTCDate() + 1
        ) - istOffsetMs;

      const diff = Math.max(0, nextMidnightIstUtc - now.getTime());
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilReset(
        `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenCheckoutOptions = (
    planId: string, 
    planTitle: string, 
    creditsNum: number, 
    inrPrice: number, 
    usdPrice: number, 
    category: "pro" | "credits"
  ) => {
    const priceDisplay = isIndia ? `₹${inrPrice}` : `$${usdPrice}`;
    setTermsPlan({
      id: planId,
      title: planTitle,
      credits: creditsNum,
      priceDisplay,
      category,
    });
    setIsTermsOpen(true);
  };

  const handleCheckoutPlan = async (
    planId: string, 
    planTitle: string, 
    planCredits: number, 
    category: "pro" | "credits",
    couponCode?: string
  ) => {
    setErrorMessage(null);
    setLoadingId(planId);

    try {
      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          isGift: false,
          marketOverride: isIndia ? "IN" : "GLOBAL",
          couponCode: couponCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Checkout initiation failed. Please try again.");
      }

      if (data.gateway === "mock" && data.approvalUrl) {
        window.location.href = data.approvalUrl;
        return;
      }

      if (data.gateway === "razorpay") {
        if (typeof window === "undefined" || !window.Razorpay) {
          throw new Error("Payment gateway is loading. Please try again in a moment.");
        }

        const razorpay = new window.Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Exismic",
          description: planTitle,
          order_id: data.razorpayOrderId || data.providerOrderId,
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch("/api/billing/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                await refreshCredits();
                setSuccessType(category);
                setSuccessCredits(planCredits);
                setShowSuccess(true);
                onClose();
              } else {
                setFailureReason(verifyData.error || "Payment verification could not be completed.");
                setShowFailure(true);
              }
            } catch (err: any) {
              setFailureReason(err.message || "Failed to verify payment.");
              setShowFailure(true);
            } finally {
              setLoadingId(null);
            }
          },
          prefill: {},
          theme: { color: "#8b5cf6" },
        });

        razorpay.on("payment.failed", (resp: any) => {
          setFailureReason(resp?.error?.description || "Payment was not completed.");
          setShowFailure(true);
          setLoadingId(null);
        });

        razorpay.open();
        return;
      }

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
        return;
      }

      throw new Error("Payment gateway did not return checkout parameters.");
    } catch (err: any) {
      setFailureReason(err.message || "Checkout failed. Please try again.");
      setShowFailure(true);
      setLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Portal>
        <AnimatePresence>
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/90 backdrop-blur-3xl"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="relative w-full max-w-5xl rounded-[2rem] sm:rounded-[2.5rem] border-2 border-amber-400/40 bg-[#05050a]/95 p-4 sm:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_50px_rgba(245,158,11,0.2)] overflow-hidden z-10 backdrop-blur-3xl flex flex-col max-h-[92vh]"
            >
              <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-purple-600/15 blur-3xl" />

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between pb-4 sm:pb-5 border-b border-white/[0.08] shrink-0 gap-2">
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                  <div className="relative flex h-11 w-11 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-400/25 via-yellow-500/15 to-purple-600/20 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                    <Coins size={22} className="drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse sm:w-[26px] sm:h-[26px]" />
                    <Sparkles size={13} className="absolute -top-1 -right-1 text-yellow-300 animate-spin" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white">
                        Refill Credits & Unlock Pro
                      </h2>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider text-emerald-300 shrink-0">
                        INSTANT ACTIVATION
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-400 font-medium mt-0.5 leading-snug">
                      Never wait for daily limits. Choose a permanent credit refill or upgrade to Pro for 10x capacity.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  aria-label="Close modal"
                  className="relative z-50 flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/15 hover:border-white/30 transition-all cursor-pointer shadow-md ml-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto pt-4 sm:pt-5 pb-2 space-y-4 sm:space-y-5 custom-scrollbar pr-1">
                
                {/* Live Balance & Reset Pill */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-inner">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <Zap size={15} className="text-amber-400 fill-amber-400/30 shrink-0" />
                    <span className="text-xs text-zinc-300 font-semibold">Your Balance:</span>
                    <span className="text-xs font-black text-amber-300 tracking-wide bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                      {credits.toLocaleString()} Credits
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                    <Clock size={14} className="text-cyan-400 shrink-0" />
                    <span>Free 50 credits replenish in:</span>
                    <span className="font-mono font-bold text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                      {timeUntilReset}
                    </span>
                  </div>
                </div>

                {/* Category Tab Switcher */}
                <div className="flex rounded-2xl border border-white/10 bg-black/50 p-1.5 gap-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("credits")}
                    className={cn(
                      "flex-1 py-2.5 sm:py-3 px-2 rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center",
                      activeCategory === "credits"
                        ? "bg-gradient-to-r from-purple-500/25 via-fuchsia-500/25 to-pink-500/25 border border-purple-400/70 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.3)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                    )}
                  >
                    <Coins size={14} className={cn("shrink-0", activeCategory === "credits" ? "text-purple-300" : "text-zinc-500")} />
                    <span>Credit Packs <span className="hidden sm:inline">(Never Expire)</span></span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory("pro")}
                    className={cn(
                      "flex-1 py-2.5 sm:py-3 px-2 rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-center",
                      activeCategory === "pro"
                        ? "bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-cyan-500/25 border border-cyan-400/70 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.3)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                    )}
                  >
                    <Crown size={14} className={cn("shrink-0", activeCategory === "pro" ? "text-cyan-300" : "text-zinc-500")} />
                    <span>Exismic Pro <span className="hidden sm:inline">(10x Allowance)</span></span>
                  </button>
                </div>

                {/* TAB 1: CREDIT PACKS */}
                {activeCategory === "credits" && (
                  <div className="space-y-4">
                    {CREDIT_PACK_OPTIONS.map((pack) => {
                      const Icon = pack.style.icon;
                      const priceLabel = isIndia ? `₹${pack.inrPrice}` : `$${pack.usdPrice}`;

                      return (
                        <motion.div
                          key={pack.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "group relative overflow-hidden rounded-[2.25rem] p-1.5 backdrop-blur-3xl transition-all duration-300 hover:-translate-y-0.5",
                            pack.style.cardBorder
                          )}
                        >
                          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-300 group-hover:opacity-90", pack.style.ambientGradient)} />

                          <div className="relative z-10 flex flex-col gap-4 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between">
                            
                            <div className="flex items-center gap-4.5 min-w-0">
                              <div className={cn(
                                "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-white shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-105",
                                pack.style.iconBg
                              )}>
                                <Icon size={28} className={cn("transition-transform duration-300 group-hover:scale-110", pack.style.iconColor)} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">{pack.label}</p>
                                  {pack.bonusCredits !== undefined && pack.bonusCredits > 0 && (
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

                                <h3 className={cn("mt-1 text-3xl sm:text-4xl font-black bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent tracking-tight", pack.style.numberGradient)}>
                                  {pack.displayCredits}{" "}
                                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 drop-shadow-none">
                                    credits
                                  </span>
                                </h3>

                                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                                  <span>{pack.subtitle}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center justify-end sm:min-w-[260px]">
                              <motion.button
                                type="button"
                                onClick={() => handleOpenCheckoutOptions(pack.id, pack.label, pack.credits, pack.inrPrice, pack.usdPrice, "credits")}
                                disabled={loadingId !== null}
                                whileHover={{ y: -2, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group/launch relative flex min-h-[58px] w-full items-center justify-center overflow-hidden rounded-[20px] p-[2.5px] isolate transition-all duration-500 cursor-pointer select-none shadow-[0_0_30px_rgba(0,0,0,0.85)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]"
                              >
                                <motion.span
                                  aria-hidden="true"
                                  className={cn("absolute -inset-[150%] opacity-100 mix-blend-screen", pack.style.conicGradient)}
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                />
                                <span className="relative flex h-full w-full items-center justify-between gap-3 rounded-[17px] border border-white/10 bg-gradient-to-br from-[#0e081c]/98 via-[#090514]/98 to-[#030107]/98 px-4.5 py-2.5 backdrop-blur-2xl transition-colors duration-500 group-hover/launch:from-[#170e2e]/98 group-hover/launch:to-[#090514]/98">
                                  <div className="flex items-center gap-3">
                                    <ExismicMark size={36} letter="C" theme={pack.style.markTheme} animated={true} />
                                    <div className="text-left">
                                      <span className="block text-xs font-black uppercase tracking-[0.16em] text-white">
                                        GET {pack.displayCredits} • {priceLabel}
                                      </span>
                                      <span className={cn("block text-[9px] font-bold uppercase tracking-[0.14em]", pack.style.subtitleColor)}>
                                        Card, UPI & Instant Checkout
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowRight size={16} className="text-white transition-transform group-hover/launch:translate-x-1" />
                                </span>
                              </motion.button>
                            </div>

                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 2: PRO PASSES */}
                {activeCategory === "pro" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Monthly Pro Pass */}
                    <div className="group relative overflow-hidden rounded-[2.35rem] p-[2.5px] backdrop-blur-3xl transition-all duration-300 shadow-[0_25px_80px_rgba(0,0,0,0.85)] hover:shadow-[0_30px_100px_rgba(6,182,212,0.3)] bg-gradient-to-br from-cyan-400/80 via-sky-500/50 to-indigo-500/60 flex flex-col justify-between">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl opacity-60 group-hover:opacity-100" />

                      <div className="relative z-10 flex flex-col justify-between flex-1 rounded-[2.25rem] bg-gradient-to-br from-[#061224]/98 via-[#060e1c]/98 to-[#03070f]/98 p-6 sm:p-7">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                                <Crown size={20} className="text-cyan-300 fill-cyan-400/30" />
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-white tracking-tight">1-Month Pro Pass</h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">Monthly Unlimited</p>
                              </div>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-zinc-300">
                              Flexible
                            </span>
                          </div>

                          <div className="mt-5">
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl sm:text-5xl font-black bg-[linear-gradient(110deg,#fff_15%,#a5f3fc_50%,#38bdf8_85%,#fff_100%)] bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">
                                {isIndia ? "₹499" : "$6.99"}
                              </span>
                              <span className="text-xs font-black uppercase tracking-widest text-cyan-300/80">/month</span>
                            </div>
                            <p className="mt-1.5 text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                              <span>500 Daily Compute Credits (15,000/mo)</span>
                            </p>
                          </div>

                          <div className="mt-5 space-y-2 sm:space-y-2.5">
                            {[
                              { icon: Coins, text: "500 Daily Compute Credits", sub: "Restores automatically every 24h", chip: "15,000 / mo", color: "text-cyan-300" },
                              { icon: Zap, text: "Priority GPU Render Queue", sub: "Instant AI compute on all tools", chip: "Fast Queue", color: "text-sky-300" },
                              { icon: Palette, text: "All 50+ Studio AI Tools", sub: "4K ultra-res & no watermarks", chip: "All Tools", color: "text-indigo-300" },
                              { icon: ShieldCheck, text: "Commercial License", sub: "Full ownership for client work", chip: "Commercial", color: "text-emerald-300" },
                            ].map((item, idx) => {
                              const ItemIcon = item.icon;
                              return (
                                <div key={idx} className="flex items-center justify-between gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 sm:px-3.5 sm:py-2.5">
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <ItemIcon size={16} className={cn("shrink-0", item.color)} />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-white leading-tight break-words">{item.text}</p>
                                      <p className="text-[10px] text-zinc-400 leading-snug break-words mt-0.5">{item.sub}</p>
                                    </div>
                                  </div>
                                  <span className="text-[8px] sm:text-[8.5px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-400/25 px-2 py-0.5 rounded-full shrink-0 ml-1">
                                    {item.chip}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-6">
                          <motion.button
                            type="button"
                            onClick={() => handleOpenCheckoutOptions("pro", "1-Month Pro Pass", 15000, PRICING_CONFIG.PRO_PLAN.INR, PRICING_CONFIG.PRO_PLAN.USD, "pro")}
                            disabled={loadingId !== null}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group/launch relative flex min-h-[56px] w-full items-center justify-center overflow-hidden rounded-[20px] p-[2.5px] isolate transition-all duration-500 cursor-pointer select-none shadow-[0_0_30px_rgba(0,0,0,0.85)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
                          >
                            <motion.span
                              aria-hidden="true"
                              className="absolute -inset-[150%] opacity-100 mix-blend-screen bg-[conic-gradient(from_0deg,#06b6d4,#38bdf8_25%,#3b82f6_50%,#67e8f9_75%,#06b6d4_100%)]"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="relative flex h-full w-full items-center justify-between gap-2.5 rounded-[17px] border border-cyan-400/30 bg-gradient-to-br from-[#061224]/98 via-[#07101e]/98 to-[#04060d]/98 px-3.5 sm:px-4.5 py-2.5 backdrop-blur-2xl transition-colors duration-500 group-hover/launch:from-[#091a33]/98 group-hover/launch:to-[#060a14]/98">
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <ExismicMark size={32} letter="P" theme="blue" animated={true} />
                                <div className="text-left min-w-0">
                                  <span className="block text-[11px] sm:text-xs font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-white truncate">
                                    UPGRADE 1-MONTH • {isIndia ? "₹499" : "$6.99"}
                                  </span>
                                  <span className="block text-[9px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-cyan-300/90 truncate">
                                    Card, UPI & Instant Activation
                                  </span>
                                </div>
                              </div>
                              <ArrowRight size={16} className="text-cyan-300 transition-transform group-hover/launch:translate-x-1 shrink-0" />
                            </span>
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Annual VIP Pro Pass */}
                    <div className="group relative overflow-hidden rounded-[2.35rem] p-[2.5px] backdrop-blur-3xl transition-all duration-300 shadow-[0_32px_100px_rgba(168,85,247,0.4),0_0_50px_rgba(217,70,239,0.25)] hover:shadow-[0_40px_130px_rgba(168,85,247,0.6),0_0_70px_rgba(217,70,239,0.4)] bg-gradient-to-br from-purple-400 via-fuchsia-500 to-indigo-500 flex flex-col justify-between">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl opacity-80 group-hover:opacity-100" />

                      <div className="relative z-10 flex flex-col justify-between flex-1 rounded-[2.25rem] bg-gradient-to-br from-[#120822]/98 via-[#0c0618]/98 to-[#05030c]/98 p-6 sm:p-7">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-400/40 bg-purple-500/15 shadow-[0_0_25px_rgba(168,85,247,0.35)]">
                                <Sparkles size={20} className="text-purple-300 fill-purple-400/20" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-black text-white tracking-tight">1-Year VIP Pro</h3>
                                  <span className="rounded-full bg-gradient-to-r from-purple-400 to-fuchsia-400 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-white">
                                    Best Value
                                  </span>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300">12 Months Full Access</p>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-gradient-to-r from-amber-400/25 via-orange-500/25 to-pink-500/25 px-3 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.45)]">
                              <Flame size={11} className="text-amber-300 fill-amber-400/40" /> Save 28%
                            </span>
                          </div>

                          <div className="mt-5">
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl sm:text-5xl font-black bg-[linear-gradient(110deg,#fff_10%,#e9d5ff_40%,#d946ef_70%,#c084fc_90%,#fff_100%)] bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_35px_rgba(168,85,247,0.45)]">
                                {isIndia ? "₹4,499" : "$59.99"}
                              </span>
                              <span className="text-xs font-black uppercase tracking-widest text-purple-300">/year</span>
                            </div>
                            <p className="mt-1.5 text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                              <span>182,500 Total Compute Credits (500/day for 365d)</span>
                            </p>
                          </div>

                          <div className="mt-5 space-y-2 sm:space-y-2.5">
                            {[
                              { icon: Coins, text: "182,500 Total Creative Credits", sub: "500 daily allowance for 365 days", chip: "365 Days", color: "text-purple-300" },
                              { icon: Flame, text: "VIP Immediate Compute Queue", sub: "Top-priority rendering capacity", chip: "VIP Queue", color: "text-fuchsia-300" },
                              { icon: Palette, text: "Full Studio Suite & 4K Exports", sub: "Maximum resolution & priority models", chip: "Full Suite", color: "text-pink-300" },
                              { icon: ShieldCheck, text: "1-Year Commercial License", sub: "Full client & commercial revenue rights", chip: "Save 28%", color: "text-emerald-300" },
                            ].map((item, idx) => {
                              const ItemIcon = item.icon;
                              return (
                                <div key={idx} className="flex items-center justify-between gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 sm:px-3.5 sm:py-2.5">
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <ItemIcon size={16} className={cn("shrink-0", item.color)} />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-white leading-tight break-words">{item.text}</p>
                                      <p className="text-[10px] text-zinc-400 leading-snug break-words mt-0.5">{item.sub}</p>
                                    </div>
                                  </div>
                                  <span className="text-[8.5px] font-black uppercase tracking-wider text-purple-200 bg-purple-500/15 border border-purple-400/30 px-2 py-0.5 rounded-full shrink-0 ml-1">
                                    {item.chip}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-6">
                          <motion.button
                            type="button"
                            onClick={() => handleOpenCheckoutOptions("pro_yearly", "1-Year VIP Pro Pass", 182500, PRICING_CONFIG.PRO_YEARLY_PLAN.INR, PRICING_CONFIG.PRO_YEARLY_PLAN.USD, "pro")}
                            disabled={loadingId !== null}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group/launch relative flex min-h-[56px] w-full items-center justify-center overflow-hidden rounded-[20px] p-[2.5px] isolate transition-all duration-500 cursor-pointer select-none shadow-[0_0_30px_rgba(0,0,0,0.85)] hover:shadow-[0_0_45px_rgba(168,85,247,0.6)]"
                          >
                            <motion.span
                              aria-hidden="true"
                              className="absolute -inset-[150%] opacity-100 mix-blend-screen bg-[conic-gradient(from_0deg,#a855f7,#d946ef_25%,#ec4899_50%,#c084fc_75%,#a855f7_100%)]"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="relative flex h-full w-full items-center justify-between gap-2.5 rounded-[17px] border border-purple-400/40 bg-gradient-to-br from-[#120822]/98 via-[#0c0618]/98 to-[#05030c]/98 px-3.5 sm:px-4.5 py-2.5 backdrop-blur-2xl transition-colors duration-500 group-hover/launch:from-[#1b0d33]/98 group-hover/launch:to-[#0a0514]/98">
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <ExismicMark size={32} letter="P" theme="purple" animated={true} />
                                <div className="text-left min-w-0">
                                  <span className="block text-[11px] sm:text-xs font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-white truncate">
                                    UPGRADE 1-YEAR • {isIndia ? "₹4,499" : "$59.99"}
                                  </span>
                                  <span className="block text-[9px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-purple-300 truncate">
                                    Card, UPI & Instant Activation
                                  </span>
                                </div>
                              </div>
                              <ArrowRight size={16} className="text-purple-300 transition-transform group-hover/launch:translate-x-1 shrink-0" />
                            </span>
                          </motion.button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Secure Checkout Guarantee Footer */}
              <div className="pt-3.5 sm:pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px] sm:text-[11px] text-zinc-400 font-medium shrink-0 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span>100% Secure Checkout • Instant Delivery • Cancel Anytime</span>
                </div>
                <span className="text-[9.5px] sm:text-[10px] text-zinc-400 font-black uppercase tracking-wider shrink-0">
                  256-BIT ENCRYPTED
                </span>
              </div>

            </motion.div>
          </div>
        </AnimatePresence>
      </Portal>

      {/* Payment Terms & Alternative Checkout Modal */}
      {isTermsOpen && termsPlan && (
        <PaymentTermsModal
          isOpen={isTermsOpen}
          onClose={() => setIsTermsOpen(false)}
          onConfirm={(couponCode) => {
            setIsTermsOpen(false);
            handleCheckoutPlan(termsPlan.id, termsPlan.title, termsPlan.credits, termsPlan.category, couponCode);
          }}
          type={termsPlan.category}
          planId={termsPlan.id}
          packName={termsPlan.title}
          price={termsPlan.priceDisplay}
          gateway={isIndia ? "razorpay" : "paypal"}
        />
      )}

      {/* Post-Purchase Success Confirmation */}
      <PaymentSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        type={successType}
        amount={successCredits}
      />

      {/* Payment Failure Modal */}
      <PaymentFailureModal
        isOpen={showFailure}
        onClose={() => setShowFailure(false)}
        onRetry={() => {
          setShowFailure(false);
        }}
        reason={failureReason}
      />
    </>
  );
}
