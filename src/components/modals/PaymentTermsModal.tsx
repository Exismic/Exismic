"use client";

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
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            className="glass-dark relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d14]/95 shadow-2xl backdrop-blur-xl sm:max-w-xl"
          >
            {/* Ambient Background Glow */}
            <div
              className={cn(
                "pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-25 blur-[90px] transition-colors duration-700",
                type === "pro" ? "bg-purple-600" : "bg-cyan-500"
              )}
            />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header Section (Fixed at top) */}
            <div className="relative z-10 shrink-0 border-b border-white/5 p-5 pb-4 text-center sm:p-7 sm:pb-5">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-md">
                <ShieldCheck size={24} className={type === "pro" ? "text-purple-400" : "text-cyan-400"} />
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tight text-white sm:text-2xl">
                <GradientText>Secure Checkout</GradientText>
              </h2>
              <p className="mt-1 text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                {type === "pro"
                  ? `Exismic Pro Membership ${price ? `— ${price}` : ""}`
                  : `${packName || "Credit Pack"} ${price ? `— ${price}` : ""}`}
              </p>
            </div>

            {/* Scrollable Content Body */}
            <div className="relative z-10 flex-1 overflow-y-auto p-5 space-y-5 sm:p-7 sm:space-y-5 custom-scrollbar">
              {/* Secure Payment Info Box */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 shrink-0 text-emerald-400" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300">Protected by {gatewayName}</h4>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-zinc-300">
                      {gatewayDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Important Terms</h4>
                <ul className="space-y-2.5 text-xs font-medium leading-relaxed text-zinc-300">
                  {type === "pro" ? (
                    <>
                      <li className="flex gap-2.5">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>
                          <strong className="text-white">Automatic Renewal:</strong> Your Pro subscription automatically renews monthly. Cancel anytime in account settings.
                        </span>
                      </li>
                      <li className="flex gap-2.5">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>
                          <strong className="text-white">Daily Limits:</strong> Priority processing with daily credits that reset every 24 hours.
                        </span>
                      </li>
                    </>
                  ) : (
                    <li className="flex gap-2.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        <strong className="text-white">Permanent Credits:</strong> Credits do not expire and remain active on your account.
                      </span>
                    </li>
                  )}
                  <li className="flex gap-2.5">
                    <span className="text-zinc-400 font-bold">•</span>
                    <span>
                      <strong className="text-white">Non-Refundable:</strong> Due to compute infrastructure costs, active subscriptions and used credits are non-refundable.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-zinc-400 font-bold">•</span>
                    <span>
                      <strong className="text-white">Fair Usage:</strong> Subject to standard fair usage policies to prevent automated API abuse.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors hover:bg-white/[0.06]">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <div className="mt-0.5 shrink-0 text-zinc-400 peer-checked:text-emerald-400">
                  {agreed ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div className="text-[11px] font-medium leading-snug text-zinc-300">
                  I have read and agree to the Terms of Service & Privacy Policy, and confirm secure processing via {gatewayName}.
                </div>
              </label>
            </div>

            {/* Actions Footer (Fixed at bottom) */}
            <div className="relative z-10 shrink-0 border-t border-white/10 bg-black/40 p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[11px] font-black uppercase tracking-widest text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={!agreed || isProcessing}
                  className={cn(
                    "group relative flex h-12 items-center justify-center overflow-hidden rounded-xl border text-[11px] font-black uppercase tracking-[0.16em] transition-all duration-300",
                    agreed
                      ? type === "pro"
                        ? "border-purple-500/50 bg-[linear-gradient(110deg,#a855f7,#3b82f6)] text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:brightness-110"
                        : "border-cyan-500/50 bg-[linear-gradient(110deg,#06b6d4,#3b82f6)] text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110"
                      : "cursor-not-allowed border-white/5 bg-white/5 text-zinc-600"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isProcessing ? "Processing..." : `Proceed to ${gatewayName}`}
                    {!isProcessing && (
                      <ArrowRight size={15} className={cn("transition-transform", agreed && "group-hover:translate-x-1")} />
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
