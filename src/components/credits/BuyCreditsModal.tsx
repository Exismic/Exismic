"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Coins,
  Diamond,
  Crown,
  Flame,
  Award,
  Zap, 
  X, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  CreditCard,
  ExternalLink,
  Ticket
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useCredits } from "@/hooks/useCredits";
import GradientText from "@/components/ui/GradientText";
import { Portal } from "@/components/ui/Portal";
import { cn } from "@/lib/utils";
import { PaymentSuccessModal } from "@/components/modals/PaymentSuccessModal";
import { PaymentFailureModal } from "@/components/modals/PaymentFailureModal";
import { GiftCardPaymentModal } from "@/components/modals/GiftCardPaymentModal";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";
import { createCheckoutSignal, loadRazorpayCheckout } from "@/lib/payments/loadRazorpayCheckout";
import { reportPaymentFailure } from "@/lib/payments/reportPaymentFailure";
import { ExismicMark } from "@/components/ui/ExismicLogo";

const CREDIT_TIERS = PRICING_CONFIG.CREDIT_PACKAGES;

interface RazorpayResponse {
  razorpay_order_id?: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  'Zap': Coins,
  'Sparkles': Diamond,
  'Crown': Crown,
  'Coins': Coins,
  'Diamond': Diamond,
};

export function BuyCreditsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const paymentsEnabled = PRICING_CONFIG.PAYMENTS_ENABLED;
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
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
  const activeTierObj = CREDIT_TIERS.find((t) => t.id === selectedTier);

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
    <Portal>
      <AnimatePresence>
        {isOpen && (
        <div key="buy-credits-modal" className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 md:p-8 pt-16 sm:pt-20">
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
            className="glass-dark relative max-h-[calc(100vh-5rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 p-5 shadow-4xl sm:rounded-[3rem] sm:p-8 md:p-12 my-auto"
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
                           <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-300/40 flex items-center gap-1">
                              <Award size={10} className="text-fuchsia-100 fill-fuchsia-200/40" />
                              <span>Best Value</span>
                           </div>
                         )}

                         <div className="space-y-8">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border shadow-lg",
                              tier.color === 'blue' ? "bg-cyan-500/15 border-cyan-400/30 text-cyan-300 shadow-cyan-500/10" :
                              tier.color === 'purple' ? "bg-purple-500/15 border-purple-400/30 text-purple-300 shadow-purple-500/10" :
                              "bg-amber-500/15 border-amber-400/30 text-amber-300 shadow-amber-500/10"
                            )}>
                               {(() => {
                                  const Icon = ICON_MAP[tier.icon as string] || Coins;
                                  return <Icon size={26} />;
                                })()}
                            </div>

                            <div className="space-y-1">
                               <div className="flex items-center justify-between">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{tier.label}</h4>
                                 {tier.bonusCredits > 0 && (
                                   <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                                     <Flame size={9} className="text-emerald-300 fill-emerald-400/30" /> +{tier.bonusCredits} Bonus
                                   </span>
                                 )}
                               </div>
                               <div className="flex items-baseline gap-2">
                                  <span className={cn(
                                    "bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent text-5xl font-black italic",
                                    tier.color === 'blue' ? "bg-[linear-gradient(110deg,#fff,#93c5fd,#3b82f6,#fff)] drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]" :
                                    tier.color === 'purple' ? "bg-[linear-gradient(110deg,#fff,#c084fc,#06b6d4,#fff)] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" :
                                    "bg-[linear-gradient(110deg,#fff,#fcd34d,#f43f5e,#fff)] drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                                  )}>{tier.credits + (tier.bonusCredits || 0)}</span>
                                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">PERM</span>
                               </div>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="space-y-3">
                               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                                  <Check size={14} className="text-cyan-400" />
                                  <span>Instant Delivery</span>
                               </div>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                                  <Check size={14} className="text-cyan-400" />
                                  <span>No Expiry</span>
                               </div>
                            </div>

                            <div className="text-center pt-4">
                               <div className="flex flex-col items-center">
                                 <span className="text-xl font-black text-white">
                                   {isIndia ? `₹${tier.priceINR}` : `$${tier.priceUSD}`}
                                 </span>
                                 <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{gatewayName} checkout</span>
                               </div>
                            </div>
                         </div>

                         {selectedTier === tier.id && (
                            <div className="absolute inset-0 border-2 border-cyan-400/80 rounded-[2.5rem] shadow-[0_0_30px_rgba(34,211,238,0.25)] pointer-events-none" />
                         )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-6 pt-6">
                     <motion.button 
                       type="button"
                       onClick={handlePurchase}
                       disabled={!selectedTier || isProcessing || !paymentsEnabled}
                       whileHover={selectedTier && paymentsEnabled ? { y: -3, scale: 1.02 } : undefined}
                       whileTap={selectedTier && paymentsEnabled ? { scale: 0.97 } : undefined}
                       className={cn(
                         "group/launch relative flex min-h-[60px] w-full max-w-sm items-center justify-center overflow-hidden rounded-[22px] p-[2.5px] sm:p-[3px] isolate transition-all duration-500 cursor-pointer select-none",
                         selectedTier && paymentsEnabled
                           ? "shadow-[0_0_35px_rgba(0,0,0,0.85)] hover:shadow-[0_0_45px_rgba(0,0,0,0.95)]"
                           : "bg-zinc-800/80 text-zinc-500 opacity-60 cursor-not-allowed"
                       )}
                     >
                       {selectedTier && paymentsEnabled && (
                         <>
                           {/* Continuous Seamless Rotating Neon Border (Sharp) */}
                           <motion.span
                             aria-hidden="true"
                             className={cn(
                               "absolute -inset-[150%] opacity-100 mix-blend-screen transition-opacity duration-500 group-hover/launch:opacity-100",
                               activeTierObj?.id === "tier-1" || activeTierObj?.credits === 500
                                 ? "bg-[conic-gradient(from_0deg,rgba(6,182,212,1)_0%,rgba(59,130,246,1)_33%,rgba(103,232,249,1)_66%,rgba(6,182,212,1)_100%)]"
                                 : activeTierObj?.id === "tier-3" || activeTierObj?.credits === 6000
                                   ? "bg-[conic-gradient(from_0deg,rgba(245,158,11,1)_0%,rgba(239,68,68,1)_33%,rgba(252,211,77,1)_66%,rgba(245,158,11,1)_100%)]"
                                   : "bg-[conic-gradient(from_0deg,rgba(168,85,247,1)_0%,rgba(236,72,153,1)_33%,rgba(192,132,252,1)_66%,rgba(168,85,247,1)_100%)]"
                             )}
                             animate={{ rotate: 360 }}
                             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                           />

                           {/* Outer Diffusion Glow Halo */}
                           <motion.span
                             aria-hidden="true"
                             className={cn(
                               "absolute -inset-[100%] blur-md opacity-60 mix-blend-screen transition-opacity duration-500 group-hover/launch:opacity-90",
                               activeTierObj?.id === "tier-1" || activeTierObj?.credits === 500
                                 ? "bg-[conic-gradient(from_0deg,rgba(6,182,212,1)_0%,rgba(59,130,246,1)_33%,rgba(103,232,249,1)_66%,rgba(6,182,212,1)_100%)]"
                                 : activeTierObj?.id === "tier-3" || activeTierObj?.credits === 6000
                                   ? "bg-[conic-gradient(from_0deg,rgba(245,158,11,1)_0%,rgba(239,68,68,1)_33%,rgba(252,211,77,1)_66%,rgba(245,158,11,1)_100%)]"
                                   : "bg-[conic-gradient(from_0deg,rgba(168,85,247,1)_0%,rgba(236,72,153,1)_33%,rgba(192,132,252,1)_66%,rgba(168,85,247,1)_100%)]"
                             )}
                             animate={{ rotate: 360 }}
                             transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                           />
                         </>
                       )}

                       <span className="relative flex h-full w-full items-center gap-3.5 rounded-[19px] border border-white/10 bg-gradient-to-br from-[#08080d]/98 to-[#040406]/98 px-4 py-2.5 backdrop-blur-2xl transition-colors duration-500 group-hover/launch:from-[#0d0d16]/98 group-hover/launch:to-[#06060a]/98">
                         {/* Idle Shimmer Sweep */}
                         {selectedTier && paymentsEnabled && (
                           <motion.div
                             animate={{ x: ["-250%", "250%"] }}
                             transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1.5 }}
                             className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
                           />
                         )}

                         {isProcessing ? (
                           <div className="relative z-10 flex h-full w-full items-center justify-center gap-2 py-2 text-white">
                             <Loader2 size={16} className="animate-spin text-cyan-400" />
                             <span className="text-xs font-black uppercase tracking-widest">Processing...</span>
                           </div>
                         ) : selectedTier && paymentsEnabled ? (
                           <>
                             <ExismicMark
                               size={36}
                               letter="C"
                               theme={
                                 activeTierObj?.id === "tier-1" || activeTierObj?.credits === 500
                                   ? "blue"
                                   : activeTierObj?.id === "tier-3" || activeTierObj?.credits === 6000
                                     ? "gold"
                                     : "purple"
                               }
                               className="transition-all duration-500 group-hover/launch:scale-110 group-hover/launch:rotate-3"
                             />

                             <span className="min-w-0 flex-1 text-left relative z-10">
                               <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-white/90 drop-shadow-sm transition-all duration-500 group-hover/launch:text-white group-hover/launch:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                                 BUY • {activeTierObj ? (isIndia ? `₹${activeTierObj.priceINR}` : `$${activeTierObj.priceUSD}`) : ""}
                               </span>
                               <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-400 transition-colors duration-500 group-hover/launch:text-cyan-200/90">
                                 {activeTierObj ? `${(activeTierObj.credits + (activeTierObj.bonusCredits || 0)).toLocaleString()} Credits` : "Instant Delivery"}
                               </span>
                             </span>

                             <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.04] bg-white/[0.02] text-zinc-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-500 group-hover/launch:border-cyan-300/60 group-hover/launch:bg-cyan-300/[0.2] group-hover/launch:text-cyan-50 group-hover/launch:shadow-[0_0_30px_rgba(34,211,238,0.6),inset_0_1px_5px_rgba(255,255,255,0.3)]">
                               <motion.div
                                 animate={{ x: [0, 4, 0] }}
                                 transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                 className="text-zinc-300 group-hover/launch:text-cyan-100 transition-colors"
                               >
                                 <ArrowRight size={15} />
                               </motion.div>
                             </span>
                           </>
                         ) : (
                           <div className="relative z-10 flex h-full w-full items-center justify-center py-2">
                             <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Select a credit pack</span>
                           </div>
                         )}
                       </span>
                     </motion.button>

                     {/* Gift Card Option */}
                     {paymentsEnabled && selectedTier && (
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           setShowGiftModal(true);
                         }}
                         className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all shadow-md shadow-amber-500/5 cursor-pointer relative z-20"
                       >
                         <Ticket className="w-4 h-4 text-amber-400" />
                         <span>Pay with Gift Card (Minecoins, Play, Xbox)</span>
                       </button>
                     )}

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

      {showGiftModal && selectedTier && (
        <GiftCardPaymentModal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          planId={selectedTier}
          planName={CREDIT_TIERS.find(t => t.id === selectedTier)?.label || "Credit Pack"}
          priceDisplay={
            isIndia 
              ? `₹${CREDIT_TIERS.find(t => t.id === selectedTier)?.priceINR}`
              : `$${CREDIT_TIERS.find(t => t.id === selectedTier)?.priceUSD}`
          }
        />
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
  </Portal>
  );
}

