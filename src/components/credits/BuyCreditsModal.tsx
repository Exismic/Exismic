"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  X, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Crown,
  Loader2,
  CreditCard,
  ExternalLink
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useCredits } from "@/hooks/useCredits";
import GradientText from "@/components/ui/GradientText";
import { cn } from "@/lib/utils";
import { PaymentSuccessModal } from "@/components/modals/PaymentSuccessModal";
import { PaymentFailureModal } from "@/components/modals/PaymentFailureModal";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";
import { createCheckoutSignal, loadRazorpayCheckout } from "@/lib/payments/loadRazorpayCheckout";
import { reportPaymentFailure } from "@/lib/payments/reportPaymentFailure";

const CREDIT_TIERS = PRICING_CONFIG.CREDIT_PACKAGES;

interface RazorpayResponse {
  razorpay_order_id?: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  'Zap': Zap,
  'Sparkles': Sparkles,
  'Crown': Crown
};

export function BuyCreditsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const paymentsEnabled = PRICING_CONFIG.PAYMENTS_ENABLED;
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [lastCreditsAdded, setLastCreditsAdded] = useState(0);
  const [failureReason, setFailureReason] = useState<string | undefined>();
  const [isIndia, setIsIndia] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/billing/market", { cache: "no-store" })
      .then((response) => response.json())
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

  const marketOverride = isIndia ? "IN" : "GLOBAL";
  const gatewayName = isIndia ? "Razorpay" : "PayPal";
  
  const { refreshCredits } = useCredits();

  const handlePurchase = async () => {
    if (!paymentsEnabled) return;
    if (!selectedTier) return;
    const tier = CREDIT_TIERS.find(t => t.id === selectedTier);
    if (!tier) return;

    setIsProcessing(true);

    try {
      const checkoutRequest = createCheckoutSignal();
      const orderRes = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: checkoutRequest.signal,
        body: JSON.stringify({
          planId: tier.billingPlanId || tier.id,
          marketOverride,
        }),
      }).finally(checkoutRequest.clear);

      const data = await orderRes.json().catch(() => null);
      if (!orderRes.ok || !data?.success) {
        console.warn(`[${gatewayName}] Credit modal checkout unavailable:`, data?.error || `Could not start ${gatewayName} checkout.`);
        setShowFailure(true);
        setIsProcessing(false);
        return;
      }

      if (data.gateway === "razorpay") {
        const Razorpay = await loadRazorpayCheckout();
        if (!data.razorpayOrderId) throw new Error("Credit checkout could not start. Please refresh and try again.");

        const razorpay = new Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Exismic",
          description: data.plan?.name || `${tier.credits.toLocaleString()} credits`,
          order_id: data.razorpayOrderId,
          theme: { color: "#8b5cf6" },
          modal: {
            ondismiss: () => setIsProcessing(false),
          },
          handler: async (paymentResponse: RazorpayResponse) => {
            const verifyResponse = await fetch("/api/billing/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentResponse),
            });
            const verifyData = await verifyResponse.json().catch(() => null);
            if (!verifyResponse.ok || !verifyData?.success) {
              const reason = verifyData?.error || "Payment verification failed.";
              console.warn("Credit payment verification failed:", reason);
              setFailureReason(reason);
              setShowFailure(true);
              setIsProcessing(false);
              return;
            }
            setLastCreditsAdded(tier.credits);
            await refreshCredits();
            setShowSuccess(true);
            setIsProcessing(false);
          },
        });
        razorpay.on("payment.failed", (failure: unknown) => {
          reportPaymentFailure(data.orderId, failure);
          setFailureReason("Payment was not completed. No charge was added to your account.");
          setShowFailure(true);
          setIsProcessing(false);
        });
        razorpay.open();
        return;
      }

      if (!data?.approvalUrl) throw new Error("PayPal did not return an approval link.");
      window.location.href = data.approvalUrl;
    } catch (err) {
      const reason = err instanceof Error ? err.message : `${gatewayName} checkout failed`;
      console.warn(`${gatewayName} checkout unavailable:`, reason);
      setFailureReason(reason);
      setShowFailure(true);
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="buy-credits-modal" className="fixed inset-0 z-[150] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-label="Buy credits"
            className="glass-dark relative max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/5 p-4 shadow-4xl sm:rounded-[3rem] sm:p-8 md:p-12"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-purple/10 blur-[120px] pointer-events-none" />
            
            <button 
              onClick={onClose}
              aria-label="Close credit purchase"
              className="sticky top-0 z-20 ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-zinc-900/90 text-zinc-500 transition-all hover:bg-zinc-800 hover:text-white sm:absolute sm:right-8 sm:top-8"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 space-y-8 sm:space-y-12">
              <div className="text-center space-y-4">
                 <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-2">
                    <Zap size={14} className="text-accent-purple" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-purple">Power Reserve</span>
                 </div>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white sm:text-5xl md:text-6xl">
                    Refuel your <GradientText>Permanent Reserve.</GradientText>
                 </h2>
                 <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                    Purchase credits that <span className="text-white">never expire.</span> Daily and bonus credits are used first, then permanent reserve.
                 </p>
              </div>

              {!paymentsEnabled ? (
                <div className="flex flex-col items-center space-y-6 py-7 sm:space-y-8 sm:py-12">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-amber-300/20 bg-amber-300/[0.06] text-amber-200 shadow-[0_0_40px_rgba(251,191,36,0.08)]">
                    <ShieldCheck size={32} />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">Credit purchases unavailable</h3>
                    <p className="mx-auto max-w-md text-sm font-medium leading-6 text-zinc-400">
                      New credit purchases are paused right now. Please check back soon.
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/70">Currently unavailable</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="min-h-12 rounded-xl border border-white/10 bg-white/[0.03] px-8 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-all hover:bg-white/[0.06]"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CREDIT_TIERS.map((tier) => (
                      <motion.div
                        key={tier.id}
                        whileHover={{ y: -10 }}
                        onClick={() => setSelectedTier(tier.id)}
                        className={cn(
                          "group relative cursor-pointer rounded-[1.75rem] border p-5 transition-all duration-500 sm:rounded-[2.5rem] sm:p-8",
                          selectedTier === tier.id 
                            ? "bg-white/[0.05] border-accent-purple shadow-[0_20px_40px_rgba(124,58,237,0.15)]" 
                            : "bg-white/[0.02] border-white/5 hover:border-white/20"
                        )}
                      >
                         {tier.popular && (
                           <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent-purple text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                              Studio Choice
                           </div>
                         )}

                         <div className="space-y-8">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                              tier.color === 'blue' ? "bg-blue-500/10 text-blue-400" :
                              tier.color === 'purple' ? "bg-purple-500/10 text-purple-400" :
                              "bg-amber-500/10 text-amber-400"
                            )}>
                               {(() => {
                                  const Icon = ICON_MAP[tier.icon as string] || Zap;
                                  return <Icon size={28} />;
                                })()}
                            </div>

                            <div className="space-y-1">
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">{tier.label}</h4>
                               <div className="flex items-baseline gap-2">
                                  <span className={cn(
                                    "bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent text-5xl font-black italic",
                                    tier.color === 'blue' ? "bg-[linear-gradient(110deg,#fff,#93c5fd,#3b82f6,#fff)] drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]" :
                                    tier.color === 'purple' ? "bg-[linear-gradient(110deg,#fff,#c084fc,#06b6d4,#fff)] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" :
                                    "bg-[linear-gradient(110deg,#fff,#fcd34d,#f43f5e,#fff)] drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                                  )}>{tier.credits}</span>
                                  <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">PERM</span>
                               </div>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="space-y-3">
                               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                                  <Check size={14} className="text-accent-purple" />
                                  <span>Instant Delivery</span>
                               </div>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                                  <Check size={14} className="text-accent-purple" />
                                  <span>No Expiry</span>
                               </div>
                            </div>

                            <div className="text-center pt-4">
                               <div className="flex flex-col items-center">
                                 <span className="text-xl font-black text-white italic">
                                   {isIndia ? `Rs ${tier.priceINR}` : `$${tier.priceUSD}`}
                                 </span>
                                 <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{gatewayName} checkout</span>
                               </div>
                            </div>
                         </div>

                         {selectedTier === tier.id && (
                            <div className="absolute inset-0 border-2 border-accent-purple/50 rounded-[2.5rem] animate-pulse pointer-events-none" />
                         )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-6 pt-6">
                     <button 
                       onClick={handlePurchase}
                       disabled={!selectedTier || isProcessing || !paymentsEnabled}
                       className={cn(
                         "group relative flex h-16 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl p-[1.5px] font-black uppercase tracking-[0.4em] text-[10px] italic transition-all duration-500",
                         selectedTier && paymentsEnabled
                           ? "text-white shadow-[0_0_30px_-5px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_-10px_rgba(34,211,238,0.6)] hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
                           : "text-zinc-600 bg-white/5 cursor-not-allowed"
                       )}
                     >
                        {selectedTier && paymentsEnabled && (
                          <span className="absolute inset-0 bg-[linear-gradient(110deg,#06b6d4,#3b82f6,#a855f7,#06b6d4)] bg-[length:300%_auto] animate-gradient-x" />
                        )}
                        <div className={cn(
                          "relative z-10 flex h-full w-full items-center justify-center gap-4 rounded-2xl px-5 transition-all duration-500",
                          selectedTier && paymentsEnabled ? "bg-[#030303] group-hover:bg-transparent" : "bg-transparent"
                        )}>
                          {selectedTier && paymentsEnabled && (
                            <>
                              <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] bg-[length:200%_100%] animate-shine skew-x-[-25deg] pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                              <span className="absolute -left-full inset-y-0 w-1/2 skew-x-[-25deg] bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.25),transparent)] transition-all duration-1000 group-hover:left-[200%]" />
                            </>
                          )}
                          <div className="relative z-20 flex items-center gap-4 text-[11px] sm:text-[12px]">
                            {isProcessing ? (
                               <><Loader2 size={18} className="animate-spin text-cyan-400" /> <span className="font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">Processing...</span></>
                            ) : selectedTier && paymentsEnabled ? (
                               <><Zap size={16} className="text-cyan-400 group-hover:text-white transition-colors duration-300 animate-pulse" /> <span className="font-black text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)] group-hover:text-cyan-50">Complete checkout</span> <ArrowRight size={16} className="text-cyan-400 group-hover:translate-x-1 group-hover:text-white transition-all duration-300" /></>
                            ) : (
                               <span className="font-black text-zinc-400 tracking-widest">Select a credit pack</span>
                            )}
                          </div>
                        </div>
                     </button>
                     <div className="flex items-center gap-4 text-zinc-700">
                        <ShieldCheck size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest italic">Secure checkout</span>
                     </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {showSuccess && (
        <PaymentSuccessModal 
          key="success-modal"
          isOpen={showSuccess} 
          onClose={() => {
            setShowSuccess(false);
            onClose();
          }}
          type="credits"
          amount={lastCreditsAdded}
        />
      )}

      {showFailure && (
        <PaymentFailureModal 
          key="failure-modal"
          isOpen={showFailure} 
          onClose={() => setShowFailure(false)}
          onRetry={() => {
            setShowFailure(false);
            setFailureReason(undefined);
            handlePurchase();
          }}
          reason={failureReason}
        />
      )}
    </AnimatePresence>
  );
}

