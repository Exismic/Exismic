"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Gift, 
  Sparkles, 
  Crown, 
  Coins, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  Wand2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Flame,
  Layers,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import { usePro } from "@/hooks/usePro";

export function RedeemClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshCredits } = useCredits();
  const { refresh: refreshPro, isPro } = usePro();

  const urlCode = searchParams.get("code") || "";
  const [code, setCode] = useState(urlCode.toUpperCase());
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    rewardType: "credits" | "pro" | "badge";
    rewardValue: number;
    code: string;
  } | null>(null);

  useEffect(() => {
    if (urlCode) {
      setCode(urlCode.toUpperCase());
    }
  }, [urlCode]);

  const handleRedeem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setErrorMessage("Please enter a valid gift voucher or promo code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/user/promos/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid or already claimed voucher code. Please verify.");
        return;
      }

      setSuccessData({
        message: data.message || "Voucher successfully claimed!",
        rewardType: data.rewardType || "credits",
        rewardValue: data.rewardValue || 0,
        code: data.code || code.trim().toUpperCase(),
      });

      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.55 },
          colors: ["#fbbf24", "#f59e0b", "#c084fc", "#e879f9", "#38bdf8"],
        });
      } catch {}

      refreshCredits();
      void refreshPro();
    } catch (err: any) {
      setErrorMessage("Network error while redeeming. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030308] text-white relative selection:bg-amber-400/30 overflow-x-hidden pt-28 pb-32">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.14),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header Hero */}
        <div className="text-center space-y-3.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Gift size={14} className="animate-bounce text-amber-400" />
            <span>Exismic Gift & Voucher Vault</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.1)]">
            Redeem Your <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">Gift Pass</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Enter your 1-time gift voucher code, Pro pass, or reward code below to instantly activate generation credits or Pro status.
          </p>
        </div>

        {/* Main Redemption Console Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[2.5rem] border border-amber-400/35 bg-[#090912]/90 p-6 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_50px_rgba(245,158,11,0.15)] backdrop-blur-3xl overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {!successData ? (
            <form onSubmit={handleRedeem} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-2">
                  Enter Voucher / Gift Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. GIFT-PRO30-7X9K-2M4Q"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setErrorMessage(null);
                    }}
                    autoFocus
                    className="w-full uppercase font-mono tracking-wider text-base sm:text-lg font-black rounded-2xl border border-white/15 bg-black/60 px-5 py-4 text-amber-300 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]"
                  />
                  {code.trim() && (
                    <button
                      type="button"
                      onClick={() => setCode("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs font-bold px-2 py-1"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2"
                  >
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 hover:brightness-110 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-45 active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-amber-950" />
                    <span>Verifying and Unlocking Reward...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="fill-amber-950" />
                    <span>Redeem Code & Activate Pass</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Instant Activation
                </span>
                <Link href="/shop" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>Want to buy a gift pass?</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-300 mx-auto border border-emerald-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={40} className="drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REDEEMED SUCCESSFULLY
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  {successData.message}
                </h2>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Your rewards have been credited and are live across all Exismic AI studios immediately.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-black/50 font-mono text-sm font-bold text-amber-300">
                {successData.code}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link
                  href="/tools"
                  className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-accent-purple to-accent-cyan text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Wand2 size={14} />
                  <span>Launch AI Studio</span>
                </Link>

                <button
                  onClick={() => {
                    setSuccessData(null);
                    setCode("");
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                >
                  Redeem Another Code
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Feature Highlights Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
            <Crown size={18} className="text-purple-400 mx-auto mb-2" />
            <h4 className="font-extrabold text-xs text-white">Exismic Pro Passes</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Unlock 500 daily credits, 4K exports & priority compute.</p>
          </div>

          <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
            <Coins size={18} className="text-amber-400 mx-auto mb-2" />
            <h4 className="font-extrabold text-xs text-white">Permanent Credits</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Voucher credits never expire and roll over indefinitely.</p>
          </div>

          <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
            <ShieldCheck size={18} className="text-cyan-400 mx-auto mb-2" />
            <h4 className="font-extrabold text-xs text-white">100% Safe & Instant</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Secure redemption with cryptographic verification.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
