"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  X, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight,
  Sparkles,
  Crown,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCredits } from "@/hooks/useCredits";
import GradientText from "@/components/ui/GradientText";
import { cn } from "@/lib/utils";
import { PaymentSuccessModal } from "@/components/modals/PaymentSuccessModal";
import { PaymentFailureModal } from "@/components/modals/PaymentFailureModal";

const CREDIT_TIERS = [
  { id: 'tier_1', credits: 500, price: 4.99, label: 'Starter Pack', icon: Zap, color: 'blue' },
  { id: 'tier_2', credits: 1500, price: 9.99, label: 'Creator Choice', icon: Sparkles, color: 'purple', popular: true },
  { id: 'tier_3', credits: 5000, price: 24.99, label: 'Studio Power', icon: Crown, color: 'gold' },
];

export function BuyCreditsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [lastCreditsAdded, setLastCreditsAdded] = useState(0);
  
  const { addCredits, isPro } = useCredits();

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePurchase = async () => {
    if (!selectedTier) return;
    const tier = CREDIT_TIERS.find(t => t.id === selectedTier);
    if (!tier) return;

    setIsProcessing(true);

    try {
      // In a real app, you'd create an order on your server first
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyHere",
        amount: Math.round(tier.price * 100 * 80), // Convert to INR paisa (example)
        currency: "INR",
        name: "Lumora Credits",
        description: `Purchase of ${tier.credits} AI Credits`,
        image: "/logo.png",
        handler: async function (response: any) {
          if (response.razorpay_payment_id) {
            const success = await addCredits(tier.credits);
            if (success) {
               setLastCreditsAdded(tier.credits);
               setShowSuccess(true);
               // Modal will stay open until success modal closes or user clicks
            } else {
               setShowFailure(true);
            }
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = (window as any).Razorpay(options);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
            className="relative w-full max-w-4xl glass-dark border border-white/5 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-4xl"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-purple/10 blur-[120px] pointer-events-none" />
            
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-all z-20"
            >
              <X size={20} />
            </button>

            <div className="space-y-12 relative z-10">
              <div className="text-center space-y-4">
                 <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-2">
                    <Zap size={14} className="text-accent-purple" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-purple">Power Reserve</span>
                 </div>
                 <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
                    Refuel your <GradientText>Permanent Reserve.</GradientText>
                 </h2>
                 <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                    Purchase credits that <span className="text-white">never expire.</span> Permanent credits are used before your daily allowance.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {CREDIT_TIERS.map((tier) => (
                   <motion.div
                     key={tier.id}
                     whileHover={{ y: -10 }}
                     onClick={() => setSelectedTier(tier.id)}
                     className={cn(
                       "relative p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer group",
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
                            <tier.icon size={28} />
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
                               <span>Instant Deployment</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                               <Check size={14} className="text-accent-purple" />
                               <span>No Expiry</span>
                            </div>
                         </div>

                         <div className="text-center pt-4">
                            <span className="text-xl font-black text-white italic">${tier.price}</span>
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
                    <span className="text-[8px] font-black uppercase tracking-widest italic">SECURED BY RAZORPAY TERMINAL • 256-BIT ENCRYPTION</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <PaymentSuccessModal 
        isOpen={showSuccess} 
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
        type="credits"
        amount={lastCreditsAdded}
      />

      <PaymentFailureModal 
        isOpen={showFailure} 
        onClose={() => setShowFailure(false)}
        onRetry={() => {
          setShowFailure(false);
          handlePurchase();
        }}
      />
    </AnimatePresence>
  );
}
