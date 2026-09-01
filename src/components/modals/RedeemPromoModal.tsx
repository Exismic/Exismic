"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Gift, 
  CheckCircle2, 
  Loader2, 
  Ticket, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Crown, 
  Coins, 
  KeyRound,
  AlertCircle
} from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { cn } from "@/lib/utils";

interface RedeemPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  onSuccess?: (details: any) => void;
}

export function RedeemPromoModal({
  isOpen,
  onClose,
  initialCode = "",
  onSuccess,
}: RedeemPromoModalProps) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    rewardType: "credits" | "pro" | "badge";
    rewardValue: number;
    code: string;
  } | null>(null);

  const handleRedeem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a valid promo or voucher code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/promos/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to redeem code. Please check code spelling and try again.");
        return;
      }

      setSuccessResult({
        message: data.message || `Claimed +${data.bonusCredits || 0} credits!`,
        rewardType: data.rewardType || "credits",
        rewardValue: data.rewardValue || data.bonusCredits || 0,
        code: data.code || code,
      });

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#38bdf8", "#a855f7", "#10b981", "#fbbf24"],
        });
      } catch {}

      if (typeof window !== "undefined" && (window as any).refreshExismicCredits) {
        (window as any).refreshExismicCredits();
      }

      if (onSuccess) {
        onSuccess(data);
      }
    } catch {
      setError("Network error while redeeming voucher code.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode("");
    setError(null);
    setSuccessResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Cyber Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-3xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="relative w-full max-w-md rounded-[2.25rem] border border-cyan-400/35 bg-gradient-to-b from-[#0e1222] via-[#080a14] to-[#030408] p-6 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_60px_rgba(6,182,212,0.18)] overflow-hidden z-10 backdrop-blur-3xl text-white"
          >
            {/* Top Beam */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 via-blue-400 to-transparent shadow-[0_0_16px_rgba(34,211,238,0.85)]" />
            <div className="pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-purple-600/15 blur-3xl" />

            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              aria-label="Close modal"
              className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/15 hover:border-white/30 transition-all cursor-pointer shadow-md"
            >
              <X size={18} />
            </button>

            {!successResult ? (
              <div className="relative z-10 space-y-5">
                {/* Header Icon + Titles */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-blue-900/30 to-black/85 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                    <Ticket size={24} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black uppercase tracking-tight text-white">
                        Redeem Pass
                      </h3>
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-cyan-300">
                        INSTANT
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                      Enter your gift pass code or creator promo voucher
                    </p>
                  </div>
                </div>

                <form onSubmit={handleRedeem} className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5 px-0.5">
                      <span>Voucher Code</span>
                      <span className="text-zinc-500 font-medium lowercase">single-use</span>
                    </label>
                    
                    <div className="relative">
                      <KeyRound size={15} className="absolute left-3.5 top-3.5 text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="GIFT-PRO365-XXXX-YYYY"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value.toUpperCase());
                          setError(null);
                        }}
                        autoFocus
                        maxLength={40}
                        className="w-full uppercase font-mono rounded-xl border border-cyan-500/30 bg-black/60 pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-cyan-200 placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 shadow-inner transition-all"
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2.5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs font-semibold text-red-300"
                      >
                        <AlertCircle size={14} className="text-red-400 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Launch Action Button */}
                  <motion.button
                    type="submit"
                    disabled={loading || !code.trim()}
                    whileHover={code.trim() ? { y: -1, scale: 1.01 } : undefined}
                    whileTap={code.trim() ? { scale: 0.98 } : undefined}
                    className={cn(
                      "group/btn relative flex min-h-[52px] w-full items-center justify-center overflow-hidden rounded-2xl p-[2px] isolate transition-all duration-300 cursor-pointer select-none",
                      code.trim()
                        ? "shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]"
                        : "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {/* Rotating Conic Border */}
                    <span
                      aria-hidden="true"
                      className="absolute -inset-[150%] opacity-90 mix-blend-screen bg-[conic-gradient(from_0deg,#06b6d4_0%,#3b82f6_33%,#a855f7_66%,#06b6d4_100%)] animate-spin [animation-duration:4s]"
                    />

                    <span className="relative flex h-full w-full items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-gradient-to-r from-[#080d1a] via-[#040810] to-[#080d1a] px-5 py-3 text-xs font-black uppercase tracking-wider text-cyan-200 transition-colors group-hover/btn:text-white">
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-cyan-400" />
                          <span>Verifying & Claiming...</span>
                        </>
                      ) : (
                        <>
                          <Ticket size={16} className="text-cyan-400 transition-transform group-hover/btn:scale-110 group-hover/btn:-rotate-6" />
                          <span>Redeem Voucher Pass</span>
                          <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1 text-cyan-400" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </form>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" /> Instant Account Activation
                  </span>
                  <span>100% Secure</span>
                </div>
              </div>
            ) : (
              <div className="relative z-10 text-center py-2 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={32} />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    Voucher Claimed!
                  </h3>
                  <p className="mt-1 text-xs text-emerald-300 font-semibold">
                    {successResult.message}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-center">
                  <div className="font-mono text-sm font-black text-cyan-300 tracking-wider">
                    {successResult.code}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">
                    {successResult.rewardType === "pro" ? "👑 Pro Membership Activated" : "⚡ Balance Updated"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-teal-500 text-emerald-950 hover:brightness-110 shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                >
                  Start Creating Now &rarr;
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}
