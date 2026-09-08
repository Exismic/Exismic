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
  AlertCircle,
  Zap,
  Sparkles,
  RotateCcw
} from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { cn } from "@/lib/utils";

interface RedeemPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  onSuccess?: (details: any) => void;
}

interface ConfirmationData {
  code: string;
  rewardType: "credits" | "pro" | "badge";
  rewardTitle: string;
  rewardDescription: string;
  rewardValue: number;
  expiresAt?: string | null;
}

export function RedeemPromoModal({
  isOpen,
  onClose,
  initialCode = "",
  onSuccess,
}: RedeemPromoModalProps) {
  const [code, setCode] = useState(initialCode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    rewardType: "credits" | "pro" | "badge";
    rewardTitle: string;
    rewardValue: number;
    code: string;
  } | null>(null);

  // Step 1: Verify code validity and preview reward
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a promo code or voucher.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/user/promos/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), verifyOnly: true }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid or expired code. Please verify spelling.");
        return;
      }

      setConfirmationData({
        code: data.code || code.trim().toUpperCase(),
        rewardType: data.rewardType || "credits",
        rewardTitle: data.rewardTitle || `+${data.rewardValue || 0} Credits`,
        rewardDescription: data.rewardDescription || "Bonus generation credits added to your Vault.",
        rewardValue: data.rewardValue || 0,
        expiresAt: data.expiresAt,
      });
    } catch {
      setError("Network error while verifying code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2: Confirm and claim the reward
  const handleConfirmClaim = async () => {
    if (!confirmationData) return;

    setIsClaiming(true);
    setError(null);

    try {
      const res = await fetch("/api/user/promos/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: confirmationData.code, verifyOnly: false }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to claim reward. Please try again.");
        return;
      }

      setSuccessResult({
        message: data.message || `Successfully claimed ${confirmationData.rewardTitle}!`,
        rewardType: confirmationData.rewardType,
        rewardTitle: confirmationData.rewardTitle,
        rewardValue: confirmationData.rewardValue,
        code: confirmationData.code,
      });

      try {
        confetti({
          particleCount: 140,
          spread: 85,
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
      setError("Network error while claiming reward. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClose = () => {
    setCode("");
    setError(null);
    setConfirmationData(null);
    setSuccessResult(null);
    onClose();
  };

  const handleBackToInput = () => {
    setConfirmationData(null);
    setError(null);
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
            className="relative w-full max-w-md rounded-[2.25rem] border-2 border-cyan-400/50 bg-gradient-to-b from-[#0e1222] via-[#080a14] to-[#030408] p-6 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_40px_rgba(6,182,212,0.25)] overflow-hidden z-10 backdrop-blur-3xl text-white"
          >
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

            {/* STAGE 1: Code Input & Verification */}
            {!confirmationData && !successResult && (
              <div className="relative z-10 space-y-5">
                {/* Header Icon + Titles */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-blue-900/30 to-black/85 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                    <Ticket size={24} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black uppercase tracking-tight text-white">
                        Redeem Code
                      </h3>
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-cyan-300">
                        INSTANT
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                      Enter your promo code, gift pass, or credit voucher
                    </p>
                  </div>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5 px-0.5">
                      <span>Voucher / Promo Code</span>
                      <span className="text-zinc-500 font-medium lowercase">single-use</span>
                    </label>
                    
                    <div className="relative">
                      <KeyRound size={15} className="absolute left-3.5 top-3.5 text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. SPARK-500, GIFT-PRO365..."
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

                  {/* Launch Verify Button */}
                  <motion.button
                    type="submit"
                    disabled={isVerifying || !code.trim()}
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
                      {isVerifying ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-cyan-400" />
                          <span>Checking Code...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} className="text-cyan-400 transition-transform group-hover/btn:scale-110" />
                          <span>Verify Code</span>
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
            )}

            {/* STAGE 2: Confirmation Preview (Valid Code Detected) */}
            {confirmationData && !successResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 space-y-5"
              >
                {/* Header */}
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    "flex h-13 w-13 items-center justify-center rounded-2xl border shadow-[0_0_20px_rgba(16,185,129,0.25)]",
                    confirmationData.rewardType === "pro"
                      ? "border-amber-400/50 bg-gradient-to-br from-amber-500/20 via-purple-900/30 to-black/85 text-amber-300"
                      : "border-emerald-400/50 bg-gradient-to-br from-emerald-500/20 via-cyan-900/30 to-black/85 text-emerald-300"
                  )}>
                    {confirmationData.rewardType === "pro" ? (
                      <Crown size={24} className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    ) : confirmationData.rewardType === "badge" ? (
                      <Sparkles size={24} className="text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    ) : (
                      <Coins size={24} className="text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black uppercase tracking-tight text-white">
                        Confirm Reward
                      </h3>
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-emerald-300">
                        CODE VALID
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                      Review what you will receive before activating
                    </p>
                  </div>
                </div>

                {/* Reward Preview Card */}
                <div className={cn(
                  "relative rounded-2xl border p-4.5 overflow-hidden",
                  confirmationData.rewardType === "pro"
                    ? "border-amber-400/40 bg-gradient-to-b from-amber-500/10 via-[#0d0f1a] to-black/90 shadow-[0_0_30px_rgba(245,158,11,0.12)]"
                    : "border-cyan-400/40 bg-gradient-to-b from-cyan-500/10 via-[#09101f] to-black/90 shadow-[0_0_30px_rgba(6,182,212,0.14)]"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border",
                      confirmationData.rewardType === "pro"
                        ? "bg-amber-400/15 border-amber-400/30 text-amber-300"
                        : confirmationData.rewardType === "badge"
                        ? "bg-purple-400/15 border-purple-400/30 text-purple-300"
                        : "bg-cyan-400/15 border-cyan-400/30 text-cyan-300"
                    )}>
                      {confirmationData.rewardType === "pro"
                        ? "👑 Pro Membership"
                        : confirmationData.rewardType === "badge"
                        ? "✨ Special Badge"
                        : "⚡ Generation Credits"}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold">
                      Ready to Claim
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-white tracking-tight">
                    {confirmationData.rewardTitle}
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {confirmationData.rewardDescription}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Code:
                      </span>
                      <span className="font-mono text-xs font-black text-cyan-300 tracking-wider bg-black/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                        {confirmationData.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 size={13} />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs font-semibold text-red-300"
                  >
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Confirm Action Button */}
                <motion.button
                  type="button"
                  onClick={handleConfirmClaim}
                  disabled={isClaiming}
                  whileHover={!isClaiming ? { y: -1, scale: 1.01 } : undefined}
                  whileTap={!isClaiming ? { scale: 0.98 } : undefined}
                  className="group/btn relative flex min-h-[52px] w-full items-center justify-center overflow-hidden rounded-2xl p-[2px] isolate transition-all duration-300 cursor-pointer select-none shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)]"
                >
                  {/* Rotating Conic Border */}
                  <span
                    aria-hidden="true"
                    className="absolute -inset-[150%] opacity-90 mix-blend-screen bg-[conic-gradient(from_0deg,#10b981_0%,#06b6d4_33%,#3b82f6_66%,#10b981_100%)] animate-spin [animation-duration:3.5s]"
                  />

                  <span className="relative flex h-full w-full items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-gradient-to-r from-[#06140f] via-[#030a08] to-[#06140f] px-5 py-3 text-xs font-black uppercase tracking-wider text-emerald-200 transition-colors group-hover/btn:text-white">
                    {isClaiming ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-emerald-400" />
                        <span>Activating Reward...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} className="text-emerald-400 fill-emerald-400 transition-transform group-hover/btn:scale-110" />
                        <span>Confirm & Claim Now</span>
                        <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1 text-emerald-400" />
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Change Code Button */}
                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={handleBackToInput}
                    disabled={isClaiming}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw size={12} />
                    <span>Enter a different code</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 3: Victory Screen */}
            {successResult && (
              <div className="relative z-10 text-center py-2 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={32} />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    Reward Claimed!
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
