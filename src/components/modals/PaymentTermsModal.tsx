"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { PRICING_CONFIG, isExismic17PromoActive } from "@/config/pricing";
import { getPlanPrice, type BillingPlanId } from "@/lib/billing/plans";
import { loadPayPalSdk, type PayPalHostedFieldsInstance } from "@/lib/payments/loadPayPalSdk";

interface PaymentTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (couponCode?: string) => void;
  type: "pro" | "credits";
  price?: string;
  regularPrice?: string;
  packName?: string;
  gateway?: "paypal" | "razorpay";
  isProcessing?: boolean;
  planId?: string;
  isGift?: boolean;
  recipientName?: string;
  recipientMessage?: string;
  error?: string;
}

type Coupon = {
  code: string;
  displayFinal: string;
  displayOriginal?: string;
  discountLabel: string;
  note?: string;
};

export function PaymentTermsModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  price,
  regularPrice,
  packName,
  gateway = "paypal",
  isProcessing = false,
  planId = "starter",
  isGift = false,
  recipientName,
  error,
}: PaymentTermsModalProps) {
  const normalizedId = ({ tier_1: "starter", tier_2: "creator", tier_3: "ultimate" }[planId] || planId) as BillingPlanId;
  const selectedPrice = getPlanPrice(
    normalizedId in { starter: 1, creator: 1, ultimate: 1, pro: 1, pro_yearly: 1 } ? normalizedId : type === "pro" ? "pro" : "starter",
    gateway === "razorpay" ? "IN" : "GLOBAL"
  );
  const automaticDiscount = isExismic17PromoActive() && selectedPrice.isDiscounted;
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validating, setValidating] = useState(false);
  const [hostedFieldsReady, setHostedFieldsReady] = useState(false);
  const [payPalSubmitting, setPayPalSubmitting] = useState(false);
  const [payPalInitError, setPayPalInitError] = useState("");

  const hostedFieldsRef = useRef<PayPalHostedFieldsInstance | null>(null);
  const activeOrderIdRef = useRef<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const busy = isProcessing || validating || payPalSubmitting;

  const total = coupon?.displayFinal || (automaticDiscount ? selectedPrice.display : price?.replace(/\/(mo|yr)$/, "")) || selectedPrice.display;
  const standard = regularPrice?.replace(/\/(mo|yr)$/, "") || selectedPrice.regularDisplay;
  const pack = PRICING_CONFIG.CREDIT_PACKAGES.find((p) => p.billingPlanId === normalizedId);
  const credits = pack ? pack.credits + pack.bonusCredits : selectedPrice.plan.credits;
  const yearly = normalizedId === "pro_yearly";

  const parseAmount = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
  const regularNum = parseAmount(standard);
  const totalNum = parseAmount(total);
  const savingsNum = Math.max(0, regularNum - totalNum);
  const currencySymbol = standard.match(/^[^\d\s]+/)?.[0] || "₹";
  const hasSavings = (automaticDiscount || regularNum > totalNum) && savingsNum > 0;

  useEffect(() => {
    if (!isOpen) return;
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
    setShowPromoInput(false);
    setPayPalInitError("");
    setHostedFieldsReady(false);
    activeOrderIdRef.current = null;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
      if (hostedFieldsRef.current) {
        hostedFieldsRef.current.teardown().catch(() => {});
        hostedFieldsRef.current = null;
      }
    };
  }, [isOpen, normalizedId, gateway]);

  // Initialize PayPal Hosted Fields and Smart Buttons for International Checkout
  useEffect(() => {
    if (!isOpen || gateway !== "paypal") return;

    let isMounted = true;

    async function initPayPal() {
      try {
        const tokenRes = await fetch("/api/billing/paypal/client-token");
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData?.clientId) {
          throw new Error(tokenData?.error || "PayPal client configuration unavailable.");
        }

        const paypal = await loadPayPalSdk({
          clientId: tokenData.clientId,
          clientToken: tokenData.clientToken,
          currency: "USD",
        });

        if (!isMounted) return;

        // 1. Mount Hosted Fields if eligible (On-site Card Number, Expiration, CVV)
        if (paypal.HostedFields?.isEligible()) {
          const cardContainer = document.getElementById("paypal-card-number");
          if (cardContainer && !hostedFieldsRef.current) {
            try {
              const instance = await paypal.HostedFields.render({
                createOrder: async () => {
                  const res = await fetch("/api/billing/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      planId: normalizedId,
                      marketOverride: "GLOBAL",
                      couponCode: coupon?.code,
                    }),
                  });
                  const order = await res.json();
                  if (!res.ok || !order.success) {
                    throw new Error(order.error || "Could not prepare order.");
                  }
                  activeOrderIdRef.current = order.orderId;
                  return order.paypalOrderId;
                },
                styles: {
                  input: {
                    "font-size": "13px",
                    "font-family": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                    color: "#ffffff",
                    "font-weight": "500",
                  },
                  ":focus": {
                    color: "#22d3ee",
                  },
                  ".invalid": {
                    color: "#f87171",
                  },
                  "::placeholder": {
                    color: "#71717a",
                  },
                },
                fields: {
                  number: {
                    selector: "#paypal-card-number",
                    placeholder: "•••• •••• •••• ••••",
                  },
                  expirationDate: {
                    selector: "#paypal-expiration-date",
                    placeholder: "MM / YY",
                  },
                  cvv: {
                    selector: "#paypal-cvv",
                    placeholder: "CVV",
                  },
                },
              });

              if (isMounted) {
                hostedFieldsRef.current = instance;
                setHostedFieldsReady(true);
              } else {
                instance.teardown().catch(() => {});
              }
            } catch (fieldErr) {
              console.warn("[PayPal] Hosted Fields render error:", fieldErr);
            }
          }
        }

        // 2. Mount PayPal Smart Button container (for PayPal balance / wallet payments)
        const btnContainer = document.getElementById("paypal-button-container");
        if (btnContainer && paypal.Buttons && !btnContainer.hasChildNodes()) {
          paypal.Buttons({
            style: {
              layout: "horizontal",
              color: "gold",
              shape: "rect",
              label: "paypal",
              height: 42,
              tagline: false,
            },
            createOrder: async () => {
              const res = await fetch("/api/billing/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  planId: normalizedId,
                  marketOverride: "GLOBAL",
                  couponCode: coupon?.code,
                }),
              });
              const order = await res.json();
              if (!res.ok || !order.success) {
                throw new Error(order.error || "Could not start PayPal payment.");
              }
              activeOrderIdRef.current = order.orderId;
              return order.paypalOrderId;
            },
            onApprove: async (data: { orderID: string }) => {
              try {
                setPayPalSubmitting(true);
                const capRes = await fetch("/api/billing/paypal/capture", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paypalOrderId: data.orderID }),
                });
                const capData = await capRes.json();
                if (!capRes.ok || !capData.success) {
                  throw new Error(capData.error || "Verification failed.");
                }
                window.location.assign(`/billing/success?order=${encodeURIComponent(capData.orderId || activeOrderIdRef.current || "")}`);
              } catch (capErr) {
                setPayPalInitError(capErr instanceof Error ? capErr.message : "Payment capture failed.");
                setPayPalSubmitting(false);
              }
            },
            onError: (btnErr: unknown) => {
              console.error("[PayPal Buttons] Error:", btnErr);
              setPayPalInitError("PayPal encountered an error. Please try again.");
            },
          }).render("#paypal-button-container").catch((err: unknown) => {
            console.warn("[PayPal Buttons] Render warning:", err);
          });
        }
      } catch (err) {
        console.warn("[PayPal] Init error:", err);
        if (isMounted) {
          setPayPalInitError("PayPal payments are temporarily in standard mode.");
        }
      }
    }

    const timer = window.setTimeout(initPayPal, 100);
    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [isOpen, gateway, normalizedId, coupon]);

  async function handlePrimaryAction() {
    // If PayPal Hosted Fields is active, submit the card directly on-page
    if (gateway === "paypal" && hostedFieldsReady && hostedFieldsRef.current) {
      setPayPalSubmitting(true);
      setPayPalInitError("");
      try {
        const payload = await hostedFieldsRef.current.submit();
        if (!payload?.orderId) {
          throw new Error("Card submission did not return an order.");
        }

        const capRes = await fetch("/api/billing/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paypalOrderId: payload.orderId }),
        });
        const capData = await capRes.json();
        if (!capRes.ok || !capData.success) {
          throw new Error(capData.error || "Card payment verification failed.");
        }

        window.location.assign(`/billing/success?order=${encodeURIComponent(capData.orderId || activeOrderIdRef.current || "")}`);
        return;
      } catch (err) {
        console.error("[PayPal Hosted Fields] Payment error:", err);
        setPayPalInitError(err instanceof Error ? err.message : "Card payment failed. Please check your card details.");
        setPayPalSubmitting(false);
        return;
      }
    }

    // Default flow (Razorpay popup or standard confirmation)
    onConfirm(coupon?.code || (automaticDiscount ? PRICING_CONFIG.V17_LAUNCH_PROMO.CODE : undefined));
  }

  async function applyCoupon(event: React.FormEvent) {
    event.preventDefault();
    if (!couponInput.trim() || busy) return;
    setValidating(true);
    setCouponError("");
    setCoupon(null);
    try {
      const response = await fetch("/api/billing/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          planId: normalizedId,
          marketOverride: gateway === "razorpay" ? "IN" : "GLOBAL",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.valid) throw new Error(data.error || "This promo code is invalid.");
      setCoupon(data);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Unable to apply code. Please try again.");
    } finally {
      setValidating(false);
    }
  }

  function handleKeyboard(event: React.KeyboardEvent) {
    if (event.key === "Escape" && !busy) onClose();
    if (event.key !== "Tab") return;
    const nodes = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled])");
    if (!nodes?.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const productName =
    type === "credits"
      ? packName || `${credits.toLocaleString()} Credits Pack`
      : `Exismic Pro ${yearly ? "Annual" : "Monthly"}${isGift ? " Gift Pass" : ""}`;


  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
            <div
              className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
              onClick={() => !busy && onClose()}
            />

            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="checkout-title"
              onKeyDown={handleKeyboard}
              className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/[0.12] bg-[#07090e] text-white shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(6,182,212,0.12)]"
              style={{
                background:
                  "radial-gradient(circle at 50% -12%, rgba(34, 211, 238, 0.16), transparent 55%), radial-gradient(circle at 85% 25%, rgba(168, 85, 247, 0.08), transparent 50%), #07090e",
              }}
            >
              {/* Header */}
              <header className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4.5">
                <div>
                  <h2 id="checkout-title" className="text-base font-bold text-white tracking-tight">
                    Review Order
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Confirm your details to proceed</p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close"
                  disabled={busy}
                  onClick={onClose}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-zinc-400 transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                >
                  <X size={17} />
                </button>
              </header>

              {/* Main Body */}
              <div className="space-y-4 overflow-y-auto px-6 py-5 text-sm">
                {error && (
                  <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
                    {error}
                  </p>
                )}

                {/* Item Hero Card */}
                <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#0e1320]/80 via-[#0a0d16]/80 to-[#06080e]/90 p-4.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_20px_rgba(0,0,0,0.4)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                        {type === "credits" ? `${credits.toLocaleString()} Credits` : productName}
                      </div>
                      <p className="mt-1 text-xs text-zinc-400 font-medium">
                        {type === "credits"
                          ? "One-time payment • Never expires"
                          : yearly
                          ? "Billed annually • Cancel anytime"
                          : "Billed monthly • Cancel anytime"}
                      </p>
                      {isGift && recipientName && (
                        <p className="mt-1.5 text-xs font-medium text-cyan-300">Gift for: {recipientName}</p>
                      )}
                    </div>
                    {hasSavings && (
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                        Save {currencySymbol}{savingsNum}
                      </span>
                    )}
                  </div>
                </div>

                {/* Itemized Price Breakdown */}
                <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0b0e17]/80 to-[#070910]/90 p-4.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold uppercase tracking-wider text-zinc-300">{productName}</span>
                      <span className={hasSavings ? "text-zinc-500 line-through font-mono" : "text-zinc-100 font-bold font-mono"}>
                        {hasSavings ? standard : total}
                      </span>
                    </div>

                    {hasSavings && (
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                        <span>Launch discount</span>
                        <span className="font-mono">-{currencySymbol}{savingsNum}</span>
                      </div>
                    )}

                    {coupon && (
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                          Promo ({coupon.code})
                          <button
                            type="button"
                            onClick={() => setCoupon(null)}
                            className="text-[11px] text-zinc-400 hover:text-white underline ml-1 font-normal"
                          >
                            Remove
                          </button>
                        </span>
                        <span className="font-mono">{coupon.discountLabel}</span>
                      </div>
                    )}

                    <div className="border-t border-white/[0.08] pt-3 flex items-baseline justify-between">
                      <div>
                        <span className="text-sm font-bold text-zinc-200">Total</span>
                        <p className="text-[11px] text-zinc-400 mt-0.5">All taxes included • No extra fees</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
                          {total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promo Code Input Toggle */}
                {!automaticDiscount && !isExismic17PromoActive() && (
                  <div className="pt-0.5">
                    {!showPromoInput && !coupon ? (
                      <button
                        type="button"
                        onClick={() => setShowPromoInput(true)}
                        className="text-xs text-cyan-300/90 hover:text-cyan-200 underline font-medium transition-colors"
                      >
                        Have a promo code?
                      </button>
                    ) : (
                      <form onSubmit={applyCoupon} className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            placeholder="Enter promo code"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            disabled={busy}
                            className="min-w-0 flex-1 rounded-xl border border-white/[0.12] bg-black/60 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none transition-all"
                          />
                          <button
                            type="submit"
                            disabled={busy || !couponInput.trim()}
                            className="rounded-xl border border-white/[0.15] bg-white/[0.08] px-4 py-2 text-xs font-bold text-white transition hover:bg-white/[0.15] active:scale-[0.98] disabled:opacity-40"
                          >
                            {validating ? "Checking…" : "Apply"}
                          </button>
                        </div>
                        {couponError && (
                          <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300">
                            {couponError}
                          </p>
                        )}
                      </form>
                    )}
                  </div>
                )}

                {/* Payment Methods / Gateway Details */}
                {gateway === "paypal" ? (
                  <div className="space-y-3">
                    {/* On-Site Card Input Fields */}
                    <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0c101c]/80 to-[#070912]/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                          Card Details
                        </span>
                        <span className="text-[11px] font-medium text-zinc-400">
                          Visa, Mastercard, Amex
                        </span>
                      </div>

                      {/* Card Number Field Container */}
                      <div>
                        <label htmlFor="paypal-card-number" className="block text-[11px] font-medium text-zinc-400 mb-1">
                          Card number
                        </label>
                        <div
                          id="paypal-card-number"
                          className="h-11 w-full rounded-xl border border-white/[0.12] bg-black/60 px-3.5 flex items-center transition-all focus-within:border-cyan-400/60 focus-within:ring-1 focus-within:ring-cyan-400/30"
                        />
                      </div>

                      {/* Expiration Date & CVV Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="paypal-expiration-date" className="block text-[11px] font-medium text-zinc-400 mb-1">
                            Expires
                          </label>
                          <div
                            id="paypal-expiration-date"
                            className="h-11 w-full rounded-xl border border-white/[0.12] bg-black/60 px-3.5 flex items-center transition-all focus-within:border-cyan-400/60 focus-within:ring-1 focus-within:ring-cyan-400/30"
                          />
                        </div>

                        <div>
                          <label htmlFor="paypal-cvv" className="block text-[11px] font-medium text-zinc-400 mb-1">
                            CVV
                          </label>
                          <div
                            id="paypal-cvv"
                            className="h-11 w-full rounded-xl border border-white/[0.12] bg-black/60 px-3.5 flex items-center transition-all focus-within:border-cyan-400/60 focus-within:ring-1 focus-within:ring-cyan-400/30"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PayPal Button Alternative Container */}
                    <div className="space-y-2">
                      <div className="relative flex py-1 items-center justify-center">
                        <div className="flex-grow border-t border-white/[0.08]" />
                        <span className="flex-shrink mx-3 text-[10.5px] font-semibold text-zinc-400 uppercase tracking-widest">
                          or pay with PayPal
                        </span>
                        <div className="flex-grow border-t border-white/[0.08]" />
                      </div>

                      <div id="paypal-button-container" className="min-h-[42px] overflow-hidden rounded-xl" />
                    </div>

                    {payPalInitError && (
                      <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
                        {payPalInitError}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Razorpay Info Bar for India */
                  <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/25 via-slate-900/30 to-cyan-950/15 px-4 py-3 text-xs leading-relaxed text-zinc-300">
                    <span className="font-semibold text-cyan-300">Payment via Razorpay: </span>
                    <span>
                      <strong className="text-zinc-100 font-medium">UPI</strong> (Google Pay, PhonePe, Paytm),{" "}
                      <strong className="text-zinc-100 font-medium">Cards</strong>, and{" "}
                      <strong className="text-zinc-100 font-medium">NetBanking</strong>.
                    </span>
                  </div>
                )}
              </div>

              {/* Footer CTA & Terms */}
              <footer className="border-t border-white/[0.08] p-5 sm:p-6 bg-[#06080d]/80">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handlePrimaryAction}
                  className="flex h-12.5 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 px-4 text-sm font-black uppercase tracking-wider text-[#031525] shadow-[0_0_30px_rgba(6,182,212,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.7)] transition-all duration-300 hover:shadow-[0_0_45px_rgba(6,182,212,0.55),inset_0_1px_1.5px_rgba(255,255,255,0.9)] hover:brightness-105 active:scale-[0.985] disabled:opacity-50"
                >
                  {busy ? <Loader2 size={18} className="animate-spin text-[#031525]" /> : null}
                  Pay {total}
                </button>

                <p className="mt-3.5 text-center text-[11px] leading-relaxed text-zinc-400">
                  By continuing, you agree to our{" "}
                  <Link href="/terms-of-service" target="_blank" className="text-zinc-300 underline underline-offset-4 decoration-white/20 hover:text-white hover:decoration-white/50 transition-colors">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/refund-policy" target="_blank" className="text-zinc-300 underline underline-offset-4 decoration-white/20 hover:text-white hover:decoration-white/50 transition-colors">
                    Refund Policy
                  </Link>
                  .
                </p>

                <div className="mt-2 text-center text-[10.5px] text-zinc-500">
                  Questions? Contact{" "}
                  <a href="mailto:billing@exismic.xyz" className="text-zinc-400 hover:text-cyan-300 transition-colors underline underline-offset-2">
                    billing@exismic.xyz
                  </a>
                </div>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

