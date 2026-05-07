"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onCancel: () => Promise<void>;
  isCancelling: boolean;
}

export function ManageSubscriptionModal({ 
  isOpen, 
  onClose, 
  user, 
  onCancel,
  isCancelling 
}: ManageSubscriptionModalProps) {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Simulated billing data
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);
  const formattedDate = nextBillingDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Subscription</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Manage your elite plan</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Plan Card */}
              <div className="p-6 rounded-3xl bg-linear-to-br from-accent-purple/10 to-transparent border border-accent-purple/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles size={64} className="text-accent-purple" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-accent-purple text-white text-[8px] font-black uppercase tracking-widest">Active</span>
                    <span className="text-xs font-black italic uppercase text-accent-purple tracking-widest">Elite Pro Plan</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic text-white tracking-tighter">$9.99</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">/ Month</span>
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Next Billing</span>
                  </div>
                  <span className="text-xs font-black text-white italic">{formattedDate}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Payment Method</span>
                  </div>
                  <span className="text-xs font-black text-white italic">Razorpay Secure</span>
                </div>
              </div>

              {/* Warning Area */}
              <AnimatePresence mode="wait">
                {!showConfirmCancel ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowConfirmCancel(true)}
                    className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                  >
                    Cancel Subscription
                    <ChevronRight size={12} />
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20 space-y-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-red-500/20 text-red-500 mt-1">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white uppercase tracking-tight">Are you absolutely sure?</p>
                        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                          You'll immediately lose access to 4K exports, unlimited AI generations, and priority support.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowConfirmCancel(false)}
                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-white transition-all"
                      >
                        Keep Pro
                      </button>
                      <button 
                        onClick={onCancel}
                        disabled={isCancelling}
                        className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                      >
                        {isCancelling ? <Loader2 size={12} className="animate-spin" /> : "Confirm Cancel"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
