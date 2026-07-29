"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, ShieldCheck, Lock, ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import GradientText from "@/components/ui/GradientText";
import { cn } from "@/lib/utils";

interface PaymentTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "pro" | "credits";
  price?: string;
  packName?: string;
  gateway?: "paypal" | "razorpay";
  isProcessing?: boolean;
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
}: PaymentTermsModalProps) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAgreed(false);
    }
  }, [isOpen]);

  const gatewayName = gateway === "razorpay" ? "Razorpay" : "PayPal";
  const gatewayDescription =
    gateway === "razorpay"
      ? "Your transaction will be processed securely through Razorpay using UPI, cards, wallets, or net banking. Exismic does not see or store your payment details."
      : "Your transaction will be processed securely through PayPal. Exismic does not see or store your payment details.";

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="payment-terms-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? onClose : undefined}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[26px] border border-white/[0.14] bg-[#07080f]/98 shadow-[0_32px_100px_rgba(0,0,0,0.85),0_0_60px_rgba(34,211,238,0.1)] backdrop-blur-2xl sm:max-w-xl"
          >
            {/* Background Mesh & Radial Ambient Glow */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(34,211,238,0.14),rgba(15,23,42,0))]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              aria-label="Close modal"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-50 active:scale-95"
            >
              <X size={16} />
            </button>

            {/* Header Section (Fixed at top) */}
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
            </div>

            {/* Scrollable Content Body */}
            <div className="relative z-10 flex-1 overflow-y-auto px-6 py-5 space-y-5 sm:px-8 custom-scrollbar">
              {/* Secure Payment Info Box */}
              <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 shadow-[0_0_20px_rgba(52,211,153,0.08)]">
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
              <div className="space-y-3">
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
                  "flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200 select-none",
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
            </div>

            {/* Actions Footer (Fixed at bottom) */}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
