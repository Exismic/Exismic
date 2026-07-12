"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, ShieldCheck, Lock, ArrowRight, Shield } from "lucide-react";
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
  const gatewayDescription = gateway === "razorpay"
    ? "Your transaction will be processed securely through Razorpay using UPI, cards, wallets, or net banking. Exismic does not see or store your payment details."
    : "Your transaction will be processed securely through PayPal. Exismic does not see or store your payment details.";

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="payment-terms-modal" className="fixed inset-0 z-[200] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? onClose : undefined}
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            className="glass-dark relative max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-4xl sm:rounded-[2.5rem] sm:p-10"
          >
            {/* Ambient Background Glow */}
            <div
              className={cn(
                "absolute -right-24 -top-24 h-96 w-96 opacity-30 blur-[100px] pointer-events-none transition-colors duration-700",
                type === "pro" ? "bg-accent-purple" : "bg-accent-cyan"
              )}
            />

            <div className="relative z-10 space-y-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-md">
                  <ShieldCheck size={28} className={type === "pro" ? "text-purple-400" : "text-cyan-400"} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white sm:text-3xl mt-4">
                  <GradientText>Secure Checkout</GradientText>
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {type === "pro"
                    ? `Exismic Pro Membership ${price ? `- ${price}` : ""}`
                    : `${packName || "Credit Pack"} ${price ? `- ${price}` : ""}`}
                </p>
              </div>

              {/* Secure Payment Info */}
              <div className="rounded-2xl border border-white/5 bg-black/40 p-5">
                <div className="flex items-start gap-4">
                  <Lock className="mt-1 shrink-0 text-emerald-400" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">Protected by {gatewayName}</h4>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-400">
                      {gatewayDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Important Terms</h4>
                <ul className="space-y-3 text-xs font-medium leading-relaxed text-zinc-300">
                  {type === "pro" ? (
                    <>
                      <li className="flex gap-3">
                        <span className="text-purple-400">•</span>
                        <span>
                          <strong>Automatic Renewal:</strong> Your Pro subscription will automatically renew each month. You can cancel anytime from your account settings.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-purple-400">•</span>
                        <span>
                          <strong>Daily Limits:</strong> You receive daily credits and priority processing. Credits reset every 24 hours.
                        </span>
                      </li>
                    </>
                  ) : (
                    <li className="flex gap-3">
                      <span className="text-cyan-400">•</span>
                      <span>
                        <strong>Permanent Credits:</strong> These credits do not expire and will remain on your account until used.
                      </span>
                    </li>
                  )}
                  <li className="flex gap-3">
                    <span className="text-zinc-400">•</span>
                    <span>
                      <strong>Non-Refundable:</strong> Due to the nature of compute costs, used credits and active subscription periods are strictly non-refundable.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-zinc-400">•</span>
                    <span>
                      <strong>Fair Usage:</strong> Services are subject to fair usage policies to prevent API abuse.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <div className="mt-0.5 text-zinc-400 peer-checked:text-emerald-400">
                  {agreed ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <div className="text-xs font-medium leading-5 text-zinc-300">
                  I have read and agree to the Terms of Service and Privacy Policy, and understand this transaction is processed securely via {gatewayName}.
                </div>
              </label>

              {/* Actions */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-transparent text-[11px] font-black uppercase tracking-widest text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={!agreed || isProcessing}
                  className={cn(
                    "group relative flex h-14 items-center justify-center overflow-hidden rounded-2xl border text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                    agreed
                      ? type === "pro"
                        ? "border-purple-500/50 bg-[linear-gradient(110deg,#a855f7,#3b82f6)] text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:brightness-110"
                        : "border-cyan-500/50 bg-[linear-gradient(110deg,#06b6d4,#3b82f6)] text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] hover:brightness-110"
                      : "cursor-not-allowed border-white/5 bg-white/5 text-zinc-500"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isProcessing ? "Processing..." : `Proceed to ${gatewayName}`}
                    {!isProcessing && (
                      <ArrowRight size={16} className={cn("transition-transform", agreed && "group-hover:translate-x-1")} />
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
