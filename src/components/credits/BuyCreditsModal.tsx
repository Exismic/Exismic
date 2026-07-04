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
  Loader2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useCredits } from "@/hooks/useCredits";
import GradientText from "@/components/ui/GradientText";
import { cn } from "@/lib/utils";
import { PaymentSuccessModal } from "@/components/modals/PaymentSuccessModal";
import { PaymentFailureModal } from "@/components/modals/PaymentFailureModal";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";

const CREDIT_TIERS = PRICING_CONFIG.CREDIT_PACKAGES;

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };

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
  const [isIndia, setIsIndia] = useState(false);

  useEffect(() => {
    setIsIndia(getIsIndia());
  }, []);
  
  const { refreshCredits } = useCredits();

  // Load Razorpay Script
  useEffect(() => {
    if (!paymentsEnabled) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [paymentsEnabled]);

  const handlePurchase = async () => {
    if (!paymentsEnabled) return;
    if (!selectedTier) return;
    const tier = CREDIT_TIERS.find(t => t.id === selectedTier);
    if (!tier) return;

    setIsProcessing(true);

    try {
      // 1. Create order on server
      const currency = isIndia ? "INR" : "USD";

      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: 'credits',
          currency,
          tierId: tier.id
        }),
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const order = await orderRes.json();

      // 2. Initialize Razorpay Checkout
      const options = {
        key: order.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere",
        amount: order.amount,
        currency: order.currency,
        name: "Lumora Credits",
        description: `Purchase of ${tier.credits} AI Credits`,
        image: "/logo.png",
        order_id: order.id,
        handler: async function (response: RazorpayResponse) {
          try {
            // 3. Verify on server
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: 'credits',
                tierId: tier.id,
                isINR: isIndia
              }),
            });

            const verifyData = await verifyRes.json().catch(() => ({ error: "Payment verification returned an invalid response." }));

            if (verifyRes.ok && verifyData.success) {
               setLastCreditsAdded(tier.credits);
               setShowSuccess(true);
               refreshCredits(); // Refresh the local credit state
            } else {
               console.error("Credit payment verification failed:", verifyData);
               setShowFailure(true);
            }
          } catch (verifyErr) {
            console.error("Verification failed:", verifyErr);
            setShowFailure(true);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const checkoutWindow = window as Window & { Razorpay?: RazorpayConstructor };
      if (!checkoutWindow.Razorpay) {
        throw new Error("Payment checkout failed to load. Please refresh and try again.");
      }
      const rzp = new checkoutWindow.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
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
                    Purchase credits that <span className="text-white">never expire.</span> Permanent credits are used before your daily allowance.
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
                                  <span className="text-4xl font-black text-white italic">{tier.credits}</span>
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
                                 <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{isIndia ? "INR checkout" : "USD checkout"}</span>
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
                       disabled={!selectedTier || isProcessing}
                       className={cn(
                         "w-full max-w-sm h-16 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] italic transition-all flex items-center justify-center gap-4",
                         selectedTier && !isProcessing
                           ? "premium-gradient text-white shadow-4xl hover:scale-[1.02] active:scale-98"
                           : "bg-white/5 text-zinc-700 cursor-not-allowed"
                       )}
                     >
                        {isProcessing ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <>Initialize Purchase <ArrowRight size={18} /></>
                        )}
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
            handlePurchase();
          }}
        />
      )}
    </AnimatePresence>
  );
}
