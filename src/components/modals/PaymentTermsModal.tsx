"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckSquare, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  X, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  CreditCard,
  History,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

export const GIFT_CARD_BRANDS = [
  { 
    id: "minecoins", 
    name: "Minecraft Minecoins", 
    expectedLength: 25, 
    format: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
    description: "25-character digital claim code",
    maxRawLength: 29
  },
  { 
    id: "gplay", 
    name: "Google Play Gift Code", 
    expectedLength: 16, 
    format: "XXXX-XXXX-XXXX-XXXX",
    description: "16-character digital gift code",
    maxRawLength: 19
  },
  { 
    id: "xbox", 
    name: "Xbox / Microsoft Code", 
    expectedLength: 25, 
    format: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
    description: "25-character digital gift code",
    maxRawLength: 29
  },
  { 
    id: "amazon", 
    name: "Amazon Claim Code", 
    expectedLength: 14, 
    format: "XXXX-XXXXXX-XXXX",
    description: "14 to 15-character claim code",
    maxRawLength: 16
  },
  { 
    id: "custom", 
    name: "Custom Voucher / Promo", 
    expectedLength: 6, 
    format: "Any valid promo code",
    description: "Min 6 characters",
    maxRawLength: 30
  },
];

export function autoFormatGiftCode(brandId: string, value: string): string {
  const raw = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  if (brandId === "minecoins" || brandId === "xbox") {
    const trimmed = raw.slice(0, 25);
    const parts = trimmed.match(/.{1,5}/g);
    return parts ? parts.join("-") : trimmed;
  }

  if (brandId === "gplay") {
    const trimmed = raw.slice(0, 16);
    const parts = trimmed.match(/.{1,4}/g);
    return parts ? parts.join("-") : trimmed;
  }

  if (brandId === "amazon") {
    const trimmed = raw.slice(0, 15);
    if (trimmed.length <= 4) return trimmed;
    if (trimmed.length <= 10) return `${trimmed.slice(0, 4)}-${trimmed.slice(4)}`;
    return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 10)}-${trimmed.slice(10)}`;
  }

  return raw.slice(0, 30);
}

export function isCodeLengthValid(brandId: string, rawCode: string): boolean {
  const sanitized = rawCode.replace(/[^A-Za-z0-9]/g, "");

  if (brandId === "minecoins" || brandId === "xbox") {
    return sanitized.length === 25;
  }
  if (brandId === "gplay") {
    return sanitized.length === 16;
  }
  if (brandId === "amazon") {
    return sanitized.length === 14 || sanitized.length === 15;
  }
  return sanitized.length >= 6;
}

interface UserPastOrder {
  id: string;
  planName: string;
  gateway: string;
  status: string;
  createdAt: string;
  maskedCode?: string | null;
  rejectionReason?: string | null;
  giftCardType?: string | null;
}

interface PaymentTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "pro" | "credits";
  price?: string;
  packName?: string;
  gateway?: "paypal" | "razorpay";
  isProcessing?: boolean;
  planId?: string;
}

export function PaymentTermsModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  price,
  packName,
  gateway = "paypal",
  isProcessing = false,
  planId = "starter",
}: PaymentTermsModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"gateway" | "giftcard" | "history">("gateway");
  const [agreed, setAgreed] = useState(false);

  // Gift Card Form State
  const [selectedBrand, setSelectedBrand] = useState<string>("minecoins");
  const [giftCode, setGiftCode] = useState<string>("");
  const [isSubmittingGift, setIsSubmittingGift] = useState<boolean>(false);
  const [giftError, setGiftError] = useState<string | null>(null);
  const [submittedGift, setSubmittedGift] = useState<{ id: string; code: string; brandName: string } | null>(null);

  // User History State
  const [historyOrders, setHistoryOrders] = useState<UserPastOrder[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const activeBrand = useMemo(
    () => GIFT_CARD_BRANDS.find((b) => b.id === selectedBrand) || GIFT_CARD_BRANDS[0],
    [selectedBrand]
  );

  const sanitizedLength = useMemo(
    () => giftCode.replace(/[^A-Za-z0-9]/g, "").length,
    [giftCode]
  );

  const isExactLength = useMemo(
    () => isCodeLengthValid(selectedBrand, giftCode),
    [selectedBrand, giftCode]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setAgreed(false);
      setPaymentMethod("gateway");
      setGiftCode("");
      setGiftError(null);
      setSubmittedGift(null);
      setIsSubmittingGift(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const loadUserHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/checkout/gift-card/my-orders");
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setHistoryOrders(data.orders || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (paymentMethod === "history" && isOpen) {
      loadUserHistory();
    }
  }, [paymentMethod, isOpen]);

  const gatewayName = gateway === "razorpay" ? "Razorpay" : "PayPal";
  const gatewayDescription =
    gateway === "razorpay"
      ? "Your transaction will be processed securely through Razorpay using UPI, cards, wallets, or net banking. Exismic does not see or store your payment details."
      : "Your transaction will be processed securely through PayPal. Exismic does not see or store your payment details.";

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setGiftCode("");
    setGiftError(null);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = autoFormatGiftCode(selectedBrand, e.target.value);
    setGiftCode(formatted);
    if (giftError) setGiftError(null);
  };

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGiftError(null);

    if (!isExactLength) {
      setGiftError(`Please enter a valid ${activeBrand.name} code matching the required length (${activeBrand.expectedLength} characters).`);
      return;
    }

    setIsSubmittingGift(true);

    try {
      const res = await fetch("/api/checkout/gift-card/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planId || (type === "pro" ? "pro" : "starter"),
          giftCardType: selectedBrand,
          giftCardCode: giftCode,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to submit gift code for verification.");
      }

      setSubmittedGift({
        id: data.orderId,
        code: giftCode,
        brandName: activeBrand.name,
      });
      void loadUserHistory();
    } catch (err) {
      setGiftError(err instanceof Error ? err.message : "Gift code submission failed.");
    } finally {
      setIsSubmittingGift(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="payment-terms-modal" className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 pt-16 sm:pt-20 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing && !isSubmittingGift ? onClose : undefined}
            className="fixed inset-0 bg-black/95 backdrop-blur-3xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[26px] border border-white/[0.14] bg-[#07080f]/98 shadow-[0_32px_100px_rgba(0,0,0,0.85),0_0_60px_rgba(34,211,238,0.1)] backdrop-blur-2xl sm:max-w-xl z-10 my-auto"
          >
            {/* Background Mesh & Radial Ambient Glow */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(34,211,238,0.14),rgba(15,23,42,0))]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing || isSubmittingGift}
              aria-label="Close modal"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-50 active:scale-95"
            >
              <X size={16} />
            </button>

            {/* Header Section */}
            <div className="relative z-10 shrink-0 border-b border-white/[0.08] px-6 py-6 text-center sm:px-8">
              <div className="mx-auto mb-3 flex h-13 w-13 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-cyan-400/20 to-cyan-500/5 text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
                <ShieldCheck size={26} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-[-0.02em] text-white sm:text-2xl">
                Secure Checkout
              </h2>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200 shadow-sm">
                <span>{type === "pro" ? "Exismic Pro Membership" : packName || "Credit Pack"}</span>
                {price && (
                  <>
                    <span className="text-cyan-400/50">•</span>
                    <span className="text-white font-extrabold">{price}</span>
                  </>
                )}
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="mt-5 grid grid-cols-3 gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("gateway")}
                  className={cn(
                    "py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 truncate",
                    paymentMethod === "gateway"
                      ? "bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <CreditCard size={13} />
                  <span className="truncate">{gatewayName}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("giftcard")}
                  className={cn(
                    "py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 truncate",
                    paymentMethod === "giftcard"
                      ? "bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <Ticket size={13} />
                  <span className="truncate">Gift Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("history")}
                  className={cn(
                    "py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 truncate",
                    paymentMethod === "history"
                      ? "bg-purple-500/20 border border-purple-400/40 text-purple-300 shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <History size={13} />
                  <span className="truncate">History</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 py-5 space-y-5 sm:px-8 custom-scrollbar">
              {paymentMethod === "gateway" && (
                <>
                  {/* Secure Payment Info Box */}
                  <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 shadow-[0_0_20px_rgba(52,211,153,0.08)] text-left">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                        <Lock size={17} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-emerald-300">
                          Protected by {gatewayName}
                        </h4>
                        <p className="mt-1 text-[11px] font-medium leading-relaxed text-zinc-300">
                          {gatewayDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms Section */}
                  <div className="space-y-3 text-left">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Important Terms</p>
                    <div className="space-y-2.5">
                      {type === "pro" ? (
                        <>
                          <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-xs text-zinc-300">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-[9px] font-bold text-cyan-300">1</span>
                            <span>
                              <strong className="text-white font-bold">Automatic Renewal:</strong> Your Pro subscription automatically renews monthly. Cancel anytime in account settings.
                            </span>
                          </div>
                          <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-xs text-zinc-300">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-[9px] font-bold text-cyan-300">2</span>
                            <span>
                              <strong className="text-white font-bold">Daily Limits:</strong> Priority GPU processing with daily credits that restore every 24 hours.
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-xs text-zinc-300">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-[9px] font-bold text-cyan-300">1</span>
                          <span>
                            <strong className="text-white font-bold">Permanent Credits:</strong> Credits do not expire and remain active on your account indefinitely.
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-xs text-zinc-300">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-[9px] font-bold text-cyan-300">
                          {type === "pro" ? 3 : 2}
                        </span>
                        <span>
                          <strong className="text-white font-bold">Non-Refundable:</strong> Due to compute infrastructure costs, active subscriptions and used credits are non-refundable.
                        </span>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-xs text-zinc-300">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-[9px] font-bold text-cyan-300">
                          {type === "pro" ? 4 : 3}
                        </span>
                        <span>
                          <strong className="text-white font-bold">Fair Usage:</strong> Subject to standard fair usage policies to prevent automated API abuse.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200 select-none text-left",
                      agreed
                        ? "border-emerald-400/50 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                        : "border-white/[0.1] bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <div
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        agreed
                          ? "border-emerald-400 bg-emerald-400 text-black"
                          : "border-white/30 text-transparent"
                      )}
                    >
                      <CheckSquare size={13} strokeWidth={3} className={agreed ? "opacity-100" : "opacity-0"} />
                    </div>
                    <div className="text-[11px] font-medium leading-relaxed text-zinc-200">
                      I have read and agree to the{" "}
                      <Link
                        href="/terms-of-service"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-white underline decoration-white/30 underline-offset-2 transition-colors hover:text-cyan-300 hover:decoration-cyan-300"
                      >
                        Terms of Service
                      </Link>{" "}
                      &{" "}
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-white underline decoration-white/30 underline-offset-2 transition-colors hover:text-cyan-300 hover:decoration-cyan-300"
                      >
                        Privacy Policy
                      </Link>
                      , and confirm secure processing via {gatewayName}.
                    </div>
                  </label>
                </>
              )}

              {paymentMethod === "giftcard" && (
                <div className="space-y-4 text-left">
                  {submittedGift ? (
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-3 text-amber-400">
                        <Clock className="w-6 h-6 animate-pulse" />
                        <div>
                          <h4 className="font-bold text-base text-white">Code Submitted!</h4>
                          <p className="text-xs text-amber-300/80">Pending Manual Verification</p>
                        </div>
                      </div>

                      <div className="bg-black/60 p-3 rounded-xl border border-white/10 space-y-1">
                        <div className="text-[11px] text-zinc-400">Submitted Gift Code:</div>
                        <div className="font-mono text-sm tracking-wider text-amber-300 font-bold select-all">
                          {submittedGift.code}
                        </div>
                        <div className="text-[10px] text-zinc-500 pt-1">
                          Ref: #{submittedGift.id.slice(-8)}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300 leading-relaxed">
                        Our team will verify your {submittedGift.brandName} code (10-30 minutes). Once verified, you will receive an email confirmation and your account will be upgraded automatically!
                      </div>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("history")}
                        className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all hover:bg-amber-500/30"
                      >
                        View Submission Status in History
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleGiftSubmit} className="space-y-4">
                      {/* Notice Banner */}
                      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
                        <Clock size={18} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-200 leading-relaxed">
                          Gift card code submissions require manual verification (usually 10-30 mins). Once approved, you will receive an email and your purchase will unlock automatically!
                        </p>
                      </div>

                      {giftError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                          <AlertCircle size={16} className="shrink-0" />
                          <span>{giftError}</span>
                        </div>
                      )}

                      {/* Brand Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                          Select Gift Card Brand
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {GIFT_CARD_BRANDS.map((brand) => (
                            <button
                              type="button"
                              key={brand.id}
                              onClick={() => handleBrandChange(brand.id)}
                              className={cn(
                                "p-3 rounded-xl border text-left transition-all flex items-center gap-2.5",
                                selectedBrand === brand.id
                                  ? "bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10"
                                  : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/20 hover:text-white"
                              )}
                            >
                              <Ticket className={cn("w-4 h-4", selectedBrand === brand.id ? "text-amber-400" : "text-zinc-500")} />
                              <div>
                                <div className="text-xs font-bold">{brand.name}</div>
                                <div className="text-[10px] text-zinc-500">{brand.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Code Input with Restricted Length */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex justify-between">
                          <span>Enter {activeBrand.name}</span>
                          <span className="font-mono text-amber-300 text-[11px] normal-case">
                            {sanitizedLength} / {activeBrand.expectedLength} chars
                          </span>
                        </label>
                        <input
                          type="text"
                          value={giftCode}
                          onChange={handleCodeChange}
                          maxLength={activeBrand.maxRawLength}
                          placeholder={activeBrand.format}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          required
                        />
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                          <span>Format: {activeBrand.format}</span>
                          {isExactLength ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Length Verified
                            </span>
                          ) : (
                            <span className="text-amber-400/80">
                              Requires {activeBrand.expectedLength - sanitizedLength} more chars
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Submit Button - Faded & Disabled Until Length is Exactly Reached */}
                      <button
                        type="submit"
                        disabled={isSubmittingGift || !isExactLength}
                        className={cn(
                          "w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                          isExactLength && !isSubmittingGift
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                            : "bg-amber-500/10 border border-amber-500/20 text-amber-300/40 opacity-40 cursor-not-allowed grayscale pointer-events-none"
                        )}
                      >
                        {isSubmittingGift ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Validating & Submitting...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {isExactLength ? "Submit Code for Verification" : `Enter All ${activeBrand.expectedLength} Characters`}
                            </span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {paymentMethod === "history" && (
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                      <History size={15} className="text-purple-400" />
                      <span>Past Submissions & Purchases</span>
                    </h4>
                    <button
                      type="button"
                      onClick={loadUserHistory}
                      disabled={loadingHistory}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <RefreshCw size={12} className={loadingHistory ? "animate-spin" : ""} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {loadingHistory ? (
                    <div className="py-10 text-center space-y-2">
                      <Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                      <p className="text-xs text-zinc-400">Loading purchase history...</p>
                    </div>
                  ) : historyOrders.length === 0 ? (
                    <div className="py-10 text-center space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                      <Ticket size={24} className="text-zinc-600 mx-auto" />
                      <p className="text-xs text-zinc-400 font-medium">No previous gift card submissions found.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {historyOrders.map((ord) => {
                        const isPending = ord.status === "PENDING_VERIFICATION";
                        const isPaid = ord.status === "paid" || ord.status === "COMPLETED";
                        const isRejected = ord.status === "REJECTED" || ord.status === "failed";

                        return (
                          <div
                            key={ord.id}
                            className="p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-2 hover:border-white/15 transition-all"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-white">{ord.planName}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {new Date(ord.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {ord.maskedCode && (
                              <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                                <span>Code: {ord.maskedCode}</span>
                                <span className="uppercase text-[10px] text-zinc-500 font-sans">
                                  {ord.giftCardType || ord.gateway}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                              <span className="text-[10px] text-zinc-500 font-mono">#{ord.id.slice(-8)}</span>

                              {isPending && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                                  <Clock size={11} className="animate-pulse" />
                                  <span>Pending (10-30m)</span>
                                </span>
                              )}

                              {isPaid && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                                  <CheckCircle2 size={11} />
                                  <span>Approved & Unlocked</span>
                                </span>
                              )}

                              {isRejected && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-bold">
                                  <XCircle size={11} />
                                  <span>Declined</span>
                                </span>
                              )}
                            </div>

                            {isRejected && ord.rejectionReason && (
                              <p className="text-[11px] text-red-400/90 pt-1 leading-normal">
                                Reason: {ord.rejectionReason}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            {paymentMethod === "gateway" && (
              <div className="relative z-10 shrink-0 border-t border-white/[0.08] bg-black/50 p-5 sm:p-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex min-h-12 items-center justify-center rounded-xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-[10px] font-black uppercase tracking-[0.16em] text-zinc-300 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-[0.98] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={!agreed || isProcessing}
                    className={cn(
                      "group relative flex min-h-12 items-center justify-center overflow-hidden rounded-xl text-[10px] font-black uppercase tracking-[0.16em] transition-all duration-200",
                      agreed
                        ? "border border-white/80 bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-zinc-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-[1.015] active:scale-[0.98]"
                        : "cursor-not-allowed border border-white/5 bg-white/5 text-zinc-600 opacity-40"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isProcessing ? "Processing..." : `Proceed to ${gatewayName}`}
                      {!isProcessing && (
                        <ArrowRight size={14} className={cn("transition-transform duration-200", agreed && "group-hover:translate-x-1")} />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
