"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  DollarSign
} from "lucide-react";
import confetti from "canvas-confetti";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "input" | "processing" | "success" | "failure";

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleTestPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    
    if (isNaN(val)) {
        setError("Please enter a valid number");
        return;
    }

    setStep("processing");
    setError("");

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (val >= 4) {
        // Success Logic
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) {
                throw new Error("You must be logged in to upgrade.");
            }

            console.log("Attempting to upgrade user:", session.user.email);

            // Use upsert to ensure the user record exists and update it to Pro
            const { error: upsertError } = await supabase
                .from('User')
                .upsert({ 
                    id: session.user.id,
                    email: session.user.email,
                    plan: 'pro',
                    planType: 'PRO', // Legacy fallback
                    aiGenerationsLimit: 1000
                }, {
                    onConflict: 'email'
                });

            if (upsertError) {
                console.error("Database upgrade error:", upsertError);
                throw upsertError;
            }

            // Trigger Confetti
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#A855F7', '#22D3EE', '#EC4899', '#ffffff'],
                ticks: 300
            });

            setStep("success");
        } catch (err: any) {
            console.error("Full Upgrade error:", err);
            setError(err.message || "Connection failed. Please try again.");
            setStep("input");
        }
    } else {
        // Failure Logic
        setError("Minimum amount for Lumora Pro is $4.00");
        setStep("failure");
    }
  };

  const reset = () => {
    setAmount("");
    setStep("input");
    setError("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#030303]/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[3rem] p-10 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-purple/20 blur-[100px] rounded-full" />
            
            <button 
                onClick={onClose}
                className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
                <X size={20} />
            </button>

            {step === "input" && (
                <div className="space-y-8 relative">
                    <div className="space-y-3">
                        <div className="w-16 h-16 rounded-3xl bg-accent-purple/10 flex items-center justify-center text-accent-purple mb-6 border border-accent-purple/20 shadow-4xl">
                            <DollarSign size={32} />
                        </div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Test Payment</h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Enter amount to simulate a Lumora Pro purchase</p>
                    </div>

                    <form onSubmit={handleTestPayment} className="space-y-6">
                        <div className="relative group/input">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-700">$</span>
                            <input 
                                type="text"
                                autoFocus
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="4.00"
                                className="w-full bg-white/[0.03] border border-white/5 rounded-3xl py-6 pl-12 pr-8 text-2xl font-black italic text-white outline-none focus:ring-2 focus:ring-accent-purple/30 focus:border-accent-purple/50 transition-all placeholder:text-zinc-800"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest pl-2">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                <span>Plan</span>
                                <span className="text-white">Pro Monthly</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                <span>Required</span>
                                <span className="text-accent-purple">$4.00 or more</span>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-6 rounded-3xl premium-gradient text-white font-black uppercase tracking-[0.3em] text-xs shadow-4xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            Simulate Payment <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            )}

            {step === "processing" && (
                <div className="py-20 text-center space-y-8 flex flex-col items-center">
                    <Loader2 className="w-16 h-16 text-accent-purple animate-spin" />
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Verifying Payment</h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Contacting Banking API...</p>
                    </div>
                </div>
            )}

            {step === "success" && (
                <div className="text-center space-y-10 py-4 relative">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto border-2 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                    >
                        <CheckCircle2 size={48} />
                    </motion.div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter premium-text-gradient">Welcome To Pro</h2>
                        <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[11px] max-w-[300px] mx-auto leading-relaxed">Your payment of ${amount} was successful. Enjoy your new powers!</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-[2rem] bg-accent-purple/5 border border-accent-purple/10 flex flex-col items-center gap-3">
                            <Zap size={24} className="text-accent-purple" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Unlimited Usage</span>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-accent-blue/5 border border-accent-blue/10 flex flex-col items-center gap-3">
                            <Sparkles size={24} className="text-accent-blue" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">4K High Definition</span>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center gap-3 text-center">
                            <ShieldCheck size={24} className="text-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">VIP Support</span>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5 flex flex-col items-center gap-3">
                            <Zap size={24} className="text-zinc-600" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Ad-Free</span>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full py-6 rounded-3xl bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:scale-105 transition-all"
                    >
                        Start Using Pro Tools
                    </button>
                </div>
            )}

            {step === "failure" && (
                <div className="text-center space-y-8 py-10 relative">
                    <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-500 mx-auto border border-red-500/20 shadow-4xl mb-6">
                        <AlertCircle size={40} />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Payment Failed</h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[11px] max-w-[280px] mx-auto leading-relaxed italic">
                            "${amount}" is not enough to unlock Pro. Please try again with $4.00 or more.
                        </p>
                    </div>

                    <div className="w-full p-1 bg-white/[0.03] rounded-3xl" />

                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={reset}
                            className="w-full py-6 rounded-3xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.3em] text-[11px] hover:bg-white/10 transition-all"
                        >
                            Try Another Amount
                        </button>
                        <button 
                            onClick={onClose}
                            className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-zinc-400 transition-colors"
                        >
                            Cancel Transaction
                        </button>
                    </div>
                </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
