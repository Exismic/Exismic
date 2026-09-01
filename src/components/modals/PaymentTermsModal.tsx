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
import { Portal } from "@/components/ui/Portal";

/* Custom crisp SVG Brand Icons */
function MinecoinsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1.5"/>
      <path d="M7 6.5H9V17.5H7V6.5ZM15 6.5H17V17.5H15V6.5ZM9 8.5H11V14.5H9V8.5ZM13 8.5H15V14.5H13V8.5ZM11 10.5H13V16.5H11V10.5Z" fill="#fbbf24"/>
    </svg>
  );
}

function GooglePlayIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 3.2A1.8 1.8 0 0 0 3.5 4.5v15a1.8 1.8 0 0 0 .5 1.3l8.8-9L4 3.2z" fill="#00E676" />
      <path d="M16 8.9 12.8 12l3.2 3.1 3.7-2.1c1-.6 1-1.6 0-2.2L16 8.9z" fill="#FFD600" />
      <path d="M4 3.2 12.8 12l3.2-3.1L6.5 3.5c-.8-.4-1.7-.4-2.5-.3z" fill="#00B0FF" />
      <path d="m4 20.8 12-6.8L12.8 12 4 20.8z" fill="#FF3D00" />
    </svg>
  );
}

function XboxIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="1.5"/>
      <path d="M7.2 6.5C8.5 5.5 10.2 4.8 12 4.8c1.8 0 3.5.7 4.8 1.7-1.4 1.7-3.2 4.1-4.8 6.5-1.6-2.4-3.4-4.8-4.8-6.5zm-1.7 2c-.5 1.1-.7 2.3-.7 3.5 0 2.2.8 4.2 2.1 5.7-.3-1.6-.2-3.8.8-6.1.7-1.5 1.6-2.8 2.6-4.1-1.9.1-3.6.5-4.8 1zm13 0c-1.2-.5-2.9-.9-4.8-1 1 1.3 1.9 2.6 2.6 4.1 1 2.3 1.1 4.5.8 6.1 1.3-1.5 2.1-3.5 2.1-5.7 0-1.2-.2-2.4-.7-3.5zm-8.8 8.7c.7.4 1.5.6 2.3.6s1.6-.2 2.3-.6c-.6-1.5-1.5-3.3-2.3-4.8-.8 1.5-1.7 3.3-2.3 4.8z" fill="#34d399"/>
    </svg>
  );
}

function AmazonIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#f97316" fillOpacity="0.2" stroke="#f97316" strokeWidth="1.5"/>
      <path d="M12.5 11.5c-1.3 0-2.3.5-2.3 1.5 0 .8.6 1.3 1.8 1.3 1 0 1.8-.6 2.2-1.2v-1.6h-1.7zm3.6 3.8h-1.5v-.8c-.5.6-1.4.9-2.4.9-1.8 0-3.1-1-3.1-2.7 0-2 1.7-2.8 3.9-2.8h1.5v-.4c0-.8-.5-1.3-1.5-1.3-.8 0-1.6.3-2.2.6l-.5-1.2c.8-.4 1.9-.7 3-.7 2.1 0 3.1 1 3.1 2.9v4.6h-.8z" fill="#ffffff"/>
      <path d="M6.5 17.5c4 2.2 8.5 2 11.2.2" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export const GIFT_CARD_BRANDS = [
  { 
    id: "minecoins", 
    name: "Minecoins", 
    tag: "25-CHAR",
    expectedLength: 25, 
    format: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
    description: "Minecraft claim code",
    maxRawLength: 29,
    theme: "amber",
    icon: MinecoinsIcon,
  },
  { 
    id: "gplay", 
    name: "Google Play", 
    tag: "16-CHAR",
    expectedLength: 16, 
    format: "XXXX-XXXX-XXXX-XXXX",
    description: "Play store gift code",
    maxRawLength: 19,
    theme: "cyan",
    icon: GooglePlayIcon,
  },
  { 
    id: "xbox", 
    name: "Xbox / Live", 
    tag: "25-CHAR",
    expectedLength: 25, 
    format: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
    description: "Microsoft digital code",
    maxRawLength: 29,
    theme: "emerald",
    icon: XboxIcon,
  },
  { 
    id: "amazon", 
    name: "Amazon Card", 
    tag: "14-15 CHARS",
    expectedLength: 14, 
    format: "XXXX-XXXXXX-XXXX",
    description: "Amazon voucher code",
    maxRawLength: 16,
    theme: "orange",
    icon: AmazonIcon,
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
  return false;
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
  isGift?: boolean;
  recipientName?: string;
  recipientMessage?: string;
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
  isGift = false,
  recipientName,
  recipientMessage,
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
          isGift: Boolean(isGift),
          recipientName: recipientName?.trim() || undefined,
          recipientMessage: recipientMessage?.trim() || undefined,
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
    <Portal>
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
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(34,211,238,0.18),rgba(15,23,42,0))]" />
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing || isSubmittingGift}
              aria-label="Close modal"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white disabled:opacity-50 active:scale-95 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <X size={16} />
            </button>

            {/* Header Section */}
            <div className="relative z-10 shrink-0 border-b border-white/[0.08] px-6 pt-7 pb-6 text-center sm:px-8 bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-b from-cyan-400/25 via-blue-900/30 to-black/80 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md">
                <div className="absolute -inset-1 rounded-2xl bg-cyan-400/20 blur-md -z-10 animate-pulse" />
                <ShieldCheck size={28} className="drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent sm:text-3xl">
                Secure Checkout
              </h2>
              <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-400/[0.08] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.15)] backdrop-blur-md">
                <span className="text-white font-black">{type === "pro" ? (planId === "pro_yearly" ? "Exismic Pro Yearly" : "Exismic Pro Monthly") : packName || "Credit Pack"}</span>
                {price && (
                  <>
                    <span className="text-cyan-400/50">•</span>
                    <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent font-extrabold">{price}</span>
                  </>
                )}
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="mt-5 grid grid-cols-3 gap-1.5 p-1.5 bg-[#05060d]/90 border border-white/[0.08] rounded-2xl text-xs font-black uppercase tracking-wider shadow-inner backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("gateway")}
                  className={cn(
                    "py-2.5 px-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 truncate cursor-pointer",
                    paymentMethod === "gateway"
                      ? "bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-cyan-500/25 border border-cyan-400/50 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] font-black"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <CreditCard size={14} className={paymentMethod === "gateway" ? "text-cyan-300" : "text-zinc-500"} />
                  <span className="truncate">{gatewayName}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("giftcard")}
                  className={cn(
                    "py-2.5 px-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 truncate cursor-pointer",
                    paymentMethod === "giftcard"
                      ? "bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 border border-amber-400/50 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] font-black"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <Ticket size={14} className={paymentMethod === "giftcard" ? "text-amber-300" : "text-zinc-500"} />
                  <span className="truncate">Gift Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("history")}
                  className={cn(
                    "py-2.5 px-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 truncate cursor-pointer",
                    paymentMethod === "history"
                      ? "bg-gradient-to-r from-purple-500/25 via-fuchsia-500/20 to-purple-500/25 border border-purple-400/50 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] font-black"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <History size={14} className={paymentMethod === "history" ? "text-purple-300" : "text-zinc-500"} />
                  <span className="truncate">History</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 py-5 space-y-5 sm:px-8 custom-scrollbar">
              {paymentMethod === "gateway" && (
                <>
                  {/* Secure Payment Info Box */}
                  <div className="relative overflow-hidden rounded-2xl border border-emerald-400/35 bg-gradient-to-r from-emerald-500/12 via-teal-500/8 to-black/60 p-4 shadow-[0_0_25px_rgba(52,211,153,0.12),inset_0_1px_0_rgba(255,255,255,0.1)] text-left backdrop-blur-md">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/40 bg-gradient-to-b from-emerald-400/25 to-teal-500/10 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.35)]">
                        <Lock size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                            Protected by {gatewayName}
                          </h4>
                          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,1)]" />
                        </div>
                        <p className="mt-1 text-[11px] font-medium leading-relaxed text-zinc-300">
                          {gatewayDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms Section */}
                  <div className="space-y-3 text-left">
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-400">Important Terms</p>
                    <div className="space-y-2.5">
                      {type === "pro" ? (
                        <>
                          <div className="flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-3.5 text-xs text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all hover:border-white/15">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-gradient-to-b from-cyan-400/20 to-blue-500/10 text-[10px] font-black text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]">1</span>
                            <span className="leading-relaxed">
                              <strong className="text-white font-black">Automatic Renewal:</strong> Your Pro subscription automatically renews {planId === "pro_yearly" ? "annually (yearly)" : "monthly"}. Cancel anytime in account settings.
                            </span>
                          </div>

                          <div className="flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-3.5 text-xs text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all hover:border-white/15">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-gradient-to-b from-cyan-400/20 to-blue-500/10 text-[10px] font-black text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]">2</span>
                            <span className="leading-relaxed">
                              <strong className="text-white font-black">Daily Limits:</strong> Priority GPU processing with daily credits that restore every 24 hours.
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-3.5 text-xs text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all hover:border-white/15">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-gradient-to-b from-cyan-400/20 to-blue-500/10 text-[10px] font-black text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]">1</span>
                          <span className="leading-relaxed">
                            <strong className="text-white font-black">Permanent Credits:</strong> Credits do not expire and remain active on your account indefinitely.
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-3.5 text-xs text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all hover:border-white/15">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-gradient-to-b from-cyan-400/20 to-blue-500/10 text-[10px] font-black text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                          {type === "pro" ? 3 : 2}
                        </span>
                        <span className="leading-relaxed">
                          <strong className="text-white font-black">Non-Refundable:</strong> Due to compute infrastructure costs, active subscriptions and used credits are non-refundable.
                        </span>
                      </div>

                      <div className="flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] p-3.5 text-xs text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all hover:border-white/15">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-gradient-to-b from-cyan-400/20 to-blue-500/10 text-[10px] font-black text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                          {type === "pro" ? 4 : 3}
                        </span>
                        <span className="leading-relaxed">
                          <strong className="text-white font-black">Fair Usage:</strong> Subject to standard fair usage policies to prevent automated API abuse.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <label
                    className={cn(
                      "relative overflow-hidden flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-300 select-none text-left",
                      agreed
                        ? "border-emerald-400/60 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent text-white shadow-[0_0_25px_rgba(52,211,153,0.2),inset_0_1px_0_rgba(255,255,255,0.15)]"
                        : "border-white/[0.1] bg-white/[0.02] text-zinc-300 hover:border-white/20 hover:bg-white/[0.04]"
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
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 shadow-sm",
                        agreed
                          ? "border-emerald-300 bg-gradient-to-br from-emerald-400 to-teal-500 text-black shadow-[0_0_12px_rgba(52,211,153,0.8)] scale-105"
                          : "border-white/30 bg-black/40 text-transparent hover:border-white/50"
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
                        className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all hover:bg-amber-500/30 cursor-pointer"
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

                      {/* Brand Selector (2x2 Luxury Grid with Dedicated Brand SVGs) */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-zinc-300 uppercase tracking-wider flex items-center justify-between px-0.5">
                          <span>Select Gift Card Brand</span>
                          <span className="text-[10px] text-zinc-500 font-medium lowercase">click brand to switch</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {GIFT_CARD_BRANDS.map((brand) => {
                            const BrandIconComponent = brand.icon;
                            const isSelected = selectedBrand === brand.id;
                            
                            const activeBorder = brand.theme === "amber"
                              ? "border-amber-400/90 bg-gradient-to-br from-amber-500/20 via-[#170e06] to-black shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/60"
                              : brand.theme === "cyan"
                              ? "border-cyan-400/90 bg-gradient-to-br from-cyan-500/20 via-[#06101c] to-black shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/60"
                              : brand.theme === "emerald"
                              ? "border-emerald-400/90 bg-gradient-to-br from-emerald-500/20 via-[#06180f] to-black shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/60"
                              : "border-orange-400/90 bg-gradient-to-br from-orange-500/20 via-[#190c04] to-black shadow-[0_0_20px_rgba(249,115,22,0.25)] ring-1 ring-orange-400/60";

                            return (
                              <button
                                type="button"
                                key={brand.id}
                                onClick={() => handleBrandChange(brand.id)}
                                className={cn(
                                  "p-3 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 cursor-pointer select-none relative overflow-hidden",
                                  isSelected
                                    ? activeBorder
                                    : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/25 hover:bg-white/[0.05] hover:text-white"
                                )}
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-1 bg-white/[0.03] border border-white/10">
                                  <BrandIconComponent className="w-full h-full drop-shadow-md" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-black text-white whitespace-nowrap tracking-tight">{brand.name}</span>
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border shrink-0",
                                      isSelected
                                        ? "bg-white/15 text-white border-white/25 shadow-sm"
                                        : "bg-white/[0.04] text-zinc-400 border-white/10"
                                    )}>
                                      {brand.tag}
                                    </span>
                                  </div>
                                  <div className="text-[10.5px] text-zinc-400 font-medium whitespace-nowrap mt-0.5">{brand.description}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Code Input with Restricted Length */}
                      <div className="space-y-2 pt-1">
                        <label className="text-[11px] font-black text-zinc-300 uppercase tracking-wider flex justify-between px-0.5">
                          <span>Enter {activeBrand.name}</span>
                          <span className="font-mono text-cyan-300 text-[11px] font-bold">
                            {sanitizedLength} / {activeBrand.expectedLength} chars
                          </span>
                        </label>
                        <input
                          type="text"
                          value={giftCode}
                          onChange={handleCodeChange}
                          maxLength={activeBrand.maxRawLength}
                          placeholder={activeBrand.format}
                          className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm font-mono tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 shadow-inner"
                          required
                        />
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5 px-0.5">
                          <span>Format: {activeBrand.format}</span>
                          {isExactLength ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Ready to Submit
                            </span>
                          ) : (
                            <span className="text-amber-400/90 font-medium">
                              Requires {activeBrand.expectedLength - sanitizedLength} more characters
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmittingGift || !isExactLength}
                        className={cn(
                          "w-full py-4 px-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer",
                          isExactLength && !isSubmittingGift
                            ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-neutral-950 shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-[0.98]"
                            : "bg-white/[0.04] border border-white/[0.08] text-zinc-500 opacity-40 cursor-not-allowed grayscale pointer-events-none"
                        )}
                      >
                        {isSubmittingGift ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
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
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
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
              <div className="relative z-10 shrink-0 border-t border-white/[0.08] bg-gradient-to-b from-[#06070e]/90 to-[#030408]/98 p-5 sm:p-6 backdrop-blur-2xl">
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex min-h-[50px] items-center justify-center rounded-xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-[11px] font-black uppercase tracking-[0.18em] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={!agreed || isProcessing}
                    className={cn(
                      "group relative flex min-h-[50px] items-center justify-center overflow-hidden rounded-xl text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-300 cursor-pointer select-none",
                      agreed
                        ? "border border-cyan-300/60 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-400 text-black shadow-[0_0_30px_rgba(34,211,238,0.5),inset_0_1px_0_rgba(255,255,255,0.5)] hover:shadow-[0_0_40px_rgba(34,211,238,0.75)] hover:scale-[1.02] active:scale-[0.98]"
                        : "cursor-not-allowed border border-white/[0.06] bg-white/[0.03] text-zinc-600 opacity-40 shadow-none"
                    )}
                  >
                    {/* Shimmer sweep on active */}
                    {agreed && (
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-22deg] transition-transform duration-1000 group-hover:translate-x-full" />
                    )}
                    <span className="relative z-10 flex items-center gap-2 font-black">
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-black" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to {gatewayName}</span>
                          <ArrowRight size={15} strokeWidth={2.5} className="transition-transform duration-200 group-hover:translate-x-1" />
                        </>
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
  </Portal>
  );
}
