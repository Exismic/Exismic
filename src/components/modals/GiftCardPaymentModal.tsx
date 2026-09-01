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
import { cn } from "@/lib/utils";

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
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#f97316" fillOpacity="0.25" stroke="#f97316" strokeWidth="1.5"/>
      <path d="M12.5 11.5c-1.3 0-2.3.5-2.3 1.5 0 .8.6 1.3 1.8 1.3 1 0 1.8-.6 2.2-1.2v-1.6h-1.7zm3.6 3.8h-1.5v-.8c-.5.6-1.4.9-2.4.9-1.8 0-3.1-1-3.1-2.7 0-2 1.7-2.8 3.9-2.8h1.5v-.4c0-.8-.5-1.3-1.5-1.3-.8 0-1.6.3-2.2.6l-.5-1.2c.8-.4 1.9-.7 3-.7 2.1 0 3.1 1 3.1 2.9v4.6h-.8z" fill="#ffffff"/>
      <path d="M6.5 17.5c4 2.2 8.5 2 11.2.2" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export const GIFT_CARD_TYPES = [
  { id: "minecoins", name: "Minecraft Minecoins", tag: "25-CHAR", format: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX", icon: MinecoinsIcon },
  { id: "gplay", name: "Google Play Gift Code", tag: "16-CHAR", format: "XXXX-XXXX-XXXX-XXXX", icon: GooglePlayIcon },
  { id: "xbox", name: "Xbox / Microsoft Code", tag: "25-CHAR", format: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX", icon: XboxIcon },
  { id: "amazon", name: "Amazon Gift Card Code", tag: "14-15 CHARS", format: "XXXX-XXXXXX-XXXX", icon: AmazonIcon },
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

  const activeType = GIFT_CARD_TYPES.find((t) => t.id === selectedType) || GIFT_CARD_TYPES[0];

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-[#080a12] p-6 sm:p-8 text-white shadow-2xl shadow-black/90 overflow-hidden z-10"
          >
            <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={handleReset}
              className="absolute top-5 right-5 h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {!submittedOrder ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    <Ticket size={12} /> Pay with Gift Card
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {planName} ({priceDisplay})
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Submit your digital gift code for manual admin verification (usually 10-30 minutes).
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Select Brand
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {GIFT_CARD_TYPES.map((type) => {
                      const BrandIcon = type.icon;
                      const isSelected = selectedType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedType(type.id)}
                          className={cn(
                            "p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer",
                            isSelected
                              ? "bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/15"
                              : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/20 hover:text-white"
                          )}
                        >
                          <div className="h-8 w-8 shrink-0 flex items-center justify-center p-0.5">
                            <BrandIcon className="w-full h-full" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{type.name}</div>
                            <div className="text-[9.5px] text-zinc-500">{type.tag}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex justify-between">
                    <span>Enter {activeType.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{activeType.format}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder={`e.g. ${activeType.format}`}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200">
                  <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Your code will be queued for rapid review. You will receive an email once approved and your credits / Pro pass will unlock automatically.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !code.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-neutral-950" />
                      <span>Submitting for Verification...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Submit Code for Verification</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="py-2 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                  <Clock size={32} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Gift Code Submitted!</h4>
                  <p className="text-xs text-amber-300/90 mt-1">
                    Your {submittedOrder.type} code is in queue for manual verification (10-30 mins).
                  </p>
                </div>

                <div className="bg-black/60 p-4 rounded-xl border border-white/10 text-left font-mono space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Claim Code:</div>
                  <div className="text-sm font-bold text-amber-300 tracking-wider select-all">
                    {submittedOrder.code}
                  </div>
                  <div className="text-[10px] text-zinc-500 pt-1">
                    Order Ref: #{submittedOrder.id.slice(-8)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Close & Return
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}
