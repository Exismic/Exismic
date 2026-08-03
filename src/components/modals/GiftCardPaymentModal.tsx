"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Ticket, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ShieldAlert, 
  Sparkles 
} from "lucide-react";
import { Portal } from "@/components/ui/Portal";

export const GIFT_CARD_TYPES = [
  { id: "minecoins", name: "Minecraft Minecoins Code", format: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" },
  { id: "gplay", name: "Google Play Gift Code", format: "XXXX-XXXX-XXXX-XXXX-XXXX" },
  { id: "xbox", name: "Xbox Live / Microsoft Code", format: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" },
  { id: "amazon", name: "Amazon Gift Card Code", format: "XXXX-XXXXXX-XXXX" },
  { id: "custom", name: "Other Brand Voucher", format: "Any valid claim code" },
];

interface GiftCardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  priceDisplay: string;
}

export function GiftCardPaymentModal({
  isOpen,
  onClose,
  planId,
  planName,
  priceDisplay,
}: GiftCardPaymentModalProps) {
  const [selectedType, setSelectedType] = useState<string>("minecoins");
  const [code, setCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<{ id: string; code: string; type: string } | null>(null);

  const activeType = GIFT_CARD_TYPES.find((t) => t.id === selectedType);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code.trim()) {
      setErrorMessage("Please enter a valid gift card code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/checkout/gift-card/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          giftCardType: selectedType,
          giftCardCode: code.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to submit gift code for verification.");
      }

      setSubmittedOrder({
        id: data.orderId,
        code: code.trim(),
        type: activeType?.name || selectedType,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedOrder(null);
    setCode("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto text-left"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-b from-amber-500/10 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Pay with Gift Card</h3>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Purchasing <span className="text-amber-300 font-medium">{planName}</span> ({priceDisplay})
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {submittedOrder ? (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-3 text-amber-400">
                    <Clock className="w-6 h-6 animate-pulse" />
                    <div>
                      <h4 className="font-semibold text-base text-white">Code Submitted Successfully!</h4>
                      <p className="text-xs text-amber-300/80">Pending Manual Verification</p>
                    </div>
                  </div>

                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800 space-y-1">
                    <div className="text-[11px] text-neutral-400">Submitted Gift Code:</div>
                    <div className="font-mono text-sm tracking-wider text-amber-300 select-all font-semibold">
                      {submittedOrder.code}
                    </div>
                    <div className="text-[11px] text-neutral-500 pt-1">
                      Order Ref: #{submittedOrder.id.slice(-8)}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-neutral-900/60 p-3 rounded-xl text-xs text-neutral-300 leading-relaxed">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Our team will verify and redeem your code (typically processed within 10-30 minutes). Your account will be credited automatically!
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
                  >
                    Done & Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Manual Verification Notice */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      Gift card submissions require manual verification by our team (usually 10-30 minutes). Credits or Pro status will be credited automatically upon approval.
                    </p>
                  </div>

                  {/* Gift Card Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">Select Gift Card Brand</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {GIFT_CARD_TYPES.map((type) => (
                        <button
                          type="button"
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                            selectedType === type.id
                              ? "bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                              : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                          }`}
                        >
                          <Ticket className={`w-4 h-4 ${selectedType === type.id ? "text-amber-400" : "text-neutral-500"}`} />
                          <div className="truncate text-xs font-medium">{type.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Code Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300">
                      Enter {activeType?.name || "Code"}
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder={activeType?.format || "Enter claim code..."}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono tracking-wider placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      required
                    />
                    <p className="text-[11px] text-neutral-500">
                      Enter the exact digital claim code without typos.
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !code.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Code for Verification</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}
