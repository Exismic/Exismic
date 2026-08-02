"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import GradientText from "@/components/ui/GradientText";
import { Portal } from "@/components/ui/Portal";

interface PaymentFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  reason?: string;
}

export function PaymentFailureModal({ isOpen, onClose, onRetry, reason }: PaymentFailureModalProps) {
  return (
    <Portal>
      <AnimatePresence>
      {isOpen && (
        <div key="payment-failure-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            role="alertdialog"
            aria-modal="true"
            aria-label="Payment failed"
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[26px] border border-red-500/20 bg-[#08070c]/98 p-6 text-center shadow-[0_32px_100px_rgba(0,0,0,0.9),0_0_60px_rgba(239,68,68,0.12)] backdrop-blur-2xl sm:p-8 sm:max-w-md"
          >
            {/* Background Grid & Ambient Red Glow */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(239,68,68,0.16),rgba(15,23,42,0))]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-red-500 via-orange-400 to-amber-400" />

            <div className="relative z-10 space-y-6">
              {/* Icon Badge */}
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-500/20 to-red-600/5 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                  <AlertCircle size={32} />
                </div>
              </div>

              {/* Title & Headline */}
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-[-0.02em] text-white sm:text-3xl">
                  Payment <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">Failed</span>
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Transaction Unsuccessful
                </p>
              </div>

              {/* Error Reason Box */}
              <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 text-center text-xs font-medium leading-relaxed text-zinc-300 shadow-inner">
                {reason || "Payment gateway authentication failed or transaction was cancelled. No charges were completed."}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={onRetry}
                  className="group relative flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/80 bg-white px-5 text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-[1.015] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Try Again
                    <RefreshCcw size={15} className="transition-transform duration-300 group-hover:rotate-180" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-[10px] font-black uppercase tracking-[0.16em] text-zinc-300 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-[0.98]"
                >
                  <ArrowLeft size={15} /> Go Back
                </button>
              </div>

              {/* Security Guarantee Note */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  <span>✓</span> No charge was completed
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </Portal>
  );
}

