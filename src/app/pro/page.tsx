"use client";

import React, { useState } from 'react';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  Crown, 
  Infinity, 
  Cpu, 
  Headset, 
  Lock,
  RefreshCcw,
  Star,
  CheckCircle2,
  Clock,
  Shield,
  CreditCard,
  ZapIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePro } from '@/hooks/usePro';
import GradientText from '@/components/ui/GradientText';
import { ManageSubscriptionModal } from '@/components/tool/ManageSubscriptionModal';
import { PaymentSuccessModal } from '@/components/modals/PaymentSuccessModal';
import { PaymentFailureModal } from '@/components/modals/PaymentFailureModal';

const PRO_FEATURES = [
  { 
    title: "Unlimited Generations & Messages", 
    desc: "Experience total creative freedom with zero limits on AI generations and message volume.", 
    icon: Infinity, 
    color: "text-purple-400",
    glow: "rgba(168, 85, 247, 0.12)"
  },
  { 
    title: "1500 Daily Credits + Permanent Credits", 
    desc: "A massive daily allowance plus a vault for non-expiring credits that stay with you.", 
    icon: Zap, 
    color: "text-cyan-400",
    glow: "rgba(34, 211, 238, 0.12)"
  },
  { 
    title: "Priority 20x Faster Processing", 
    desc: "Skip the queue entirely. Your tasks are handled by our most powerful dedicated neural nodes.", 
    icon: Cpu, 
    color: "text-indigo-400",
    glow: "rgba(99, 102, 241, 0.12)"
  },
  { 
    title: "4K Exports with No Watermarks", 
    desc: "Download your creations in stunning ultra-high resolution, perfectly clean for any use.", 
    icon: Sparkles, 
    color: "text-blue-400",
    glow: "rgba(59, 130, 246, 0.12)"
  },
  { 
    title: "Commercial Rights", 
    desc: "Full legal ownership of everything you create. Perfect for professional and agency work.", 
    icon: ShieldCheck, 
    color: "text-emerald-400",
    glow: "rgba(16, 185, 129, 0.12)"
  },
  { 
    title: "Early Access + VIP Support", 
    desc: "Test new models before anyone else and enjoy 24/7 priority assistance from our team.", 
    icon: Headset, 
    color: "text-rose-400",
    glow: "rgba(244, 63, 94, 0.12)"
  }
];

export default function ProPricingPage() {
  const router = useRouter();
  const { user, isPro, isLoading: isProLoading } = usePro();
  const [loading, setLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      
      const order = await res.json();
      if (order.error) throw new Error(order.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'Lumora Pro',
        description: 'Elite Membership Subscription',
        order_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              plan: 'pro'
            }),
          });
          
          const result = await verifyRes.json();
          if (result.success) {
            setShowSuccess(true);
            router.refresh();
          } else {
            setShowFailure(true);
          }
        },
        prefill: {
          name: user?.full_name || user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: () => setLoading(false)
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error(error);
      setShowFailure(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch('/api/razorpay/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert(result.error || 'Failed to cancel subscription.');
      }
    } catch (error) {
      console.error('Cancel failed:', error);
      alert('An error occurred during cancellation.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isProLoading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 selection:bg-purple-500/30 overflow-x-hidden font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/[0.02] blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 mb-6"
          >
            <Crown size={12} className="text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Premium Subscription</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-center"
          >
            <span className="text-white">LUMORA </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">PRO</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-zinc-500 text-sm md:text-base font-medium"
          >
            Elevate your creative workflow with elite-grade AI tools.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Side: Features (7 Columns) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRO_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative p-6 rounded-3xl bg-white/[0.01] border border-white/[0.04] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.02] hover:border-white/[0.08]"
              >
                {/* Subtle Hover Glow */}
                <div 
                  className="absolute inset-0 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                  style={{ background: `radial-gradient(circle at center, ${feature.glow} 0%, transparent 70%)` }}
                />
                
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center mb-5 bg-white/[0.02] border border-white/[0.04] transition-transform group-hover:scale-110",
                  feature.color
                )}>
                  <feature.icon size={20} />
                </div>
                
                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right Side: Pricing Card (5 Columns) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative p-10 md:p-12 rounded-[2.5rem] bg-[#050505] border border-white/[0.06] shadow-2xl overflow-hidden"
            >
              {/* Internal Accent Glows */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 blur-[60px] rounded-full -ml-16 -mb-16" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Pro Plan</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mt-1">Full Platform Access</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <Star size={18} className="text-purple-400" />
                  </div>
                </div>

                <div className="mb-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black tracking-tighter text-white">$9.99</span>
                    <span className="text-zinc-500 font-bold text-sm tracking-wide">/ month</span>
                  </div>
                  <p className="mt-4 text-sm text-zinc-500 font-medium leading-relaxed">
                    Designed for creators, professionals, and agencies who demand the best performance.
                  </p>
                </div>

                <div className="space-y-8">
                  {isPro ? (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] transition-all flex items-center justify-center gap-3 group"
                    >
                       <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">Manage Membership</span>
                       <RefreshCcw size={16} className="text-purple-400 group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                  ) : (
                    <div className="space-y-6">
                      <button
                        onClick={handleUpgrade}
                        disabled={loading}
                        className="w-full py-5 rounded-2xl relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-[0_20px_40px_-10px_rgba(124,58,237,0.2)]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 transition-all duration-500" />
                        
                        {/* Elegant Shine Effect */}
                        <div className="absolute inset-0 w-[200%] h-full bg-[linear-gradient(110deg,transparent_40%,rgba(255,255,255,0.25)_50%,transparent_60%)] bg-[length:40%_100%] animate-none group-hover:animate-shine pointer-events-none" />
                        
                        <div className="relative flex items-center justify-center gap-2">
                          {loading ? (
                            <Loader2 size={20} className="animate-spin text-white" />
                          ) : (
                            <>
                              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">UPGRADE TO PRO →</span>
                            </>
                          )}
                        </div>
                      </button>
                      
                      <div className="flex items-center justify-center gap-4 py-2">
                        <div className="h-px flex-1 bg-white/[0.03]" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-700">Elite Tier Access</span>
                        <div className="h-px flex-1 bg-white/[0.03]" />
                      </div>
                    </div>
                  )}

                  {/* Trust Signals */}
                  <div className="pt-6 space-y-4 border-t border-white/[0.04]">
                     <TrustItem icon={<Lock size={12} className="text-zinc-500" />} text="Secure 256-bit SSL Checkout" />
                     <TrustItem icon={<RefreshCcw size={12} className="text-zinc-500" />} text="Cancel anytime, no questions asked" />
                     <TrustItem icon={<Shield size={12} className="text-zinc-500" />} text="30-Day Happiness Guarantee" />
                  </div>
                </div>
              </div>
            </motion.div>
            
            <p className="mt-6 text-center text-[10px] text-zinc-700 font-medium px-8">
              Subscription renews automatically unless cancelled. By upgrading, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>

      <ManageSubscriptionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onCancel={handleCancelSubscription}
        isCancelling={isCancelling}
      />

      <PaymentSuccessModal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)}
        type="pro"
      />

      <PaymentFailureModal 
        isOpen={showFailure} 
        onClose={() => setShowFailure(false)}
        onRetry={() => {
          setShowFailure(false);
          handleUpgrade();
        }}
      />

      <style jsx global>{`
        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">
      <div className="w-5 h-5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="opacity-80">{text}</span>
    </div>
  );
}
