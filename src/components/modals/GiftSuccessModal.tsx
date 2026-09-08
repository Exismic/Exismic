"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, 
  Check, 
  Copy, 
  Share2, 
  Sparkles, 
  Crown, 
  Coins, 
  ExternalLink, 
  MessageCircle, 
  Send, 
  Mail, 
  X,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { Portal } from "@/components/ui/Portal";
import { cn } from "@/lib/utils";

interface GiftSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  giftCode: string;
  giftType: "pro" | "pro_monthly" | "pro_yearly" | "credits";
  giftCredits?: number;
  recipientName?: string;
  recipientMessage?: string;
}

export function GiftSuccessModal({
  isOpen,
  onClose,
  giftCode,
  giftType,
  giftCredits = 0,
  recipientName,
  recipientMessage,
}: GiftSuccessModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isPro = giftType === "pro" || giftType === "pro_monthly" || giftType === "pro_yearly";
  const isYearly = giftType === "pro_yearly";

  const giftTitle = isPro 
    ? (isYearly ? "1-Year Exismic Pro Membership" : "1-Month Exismic Pro Pass")
    : `${giftCredits.toLocaleString()} AI Generation Credits`;

  const redeemUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/redeem?code=${encodeURIComponent(giftCode)}`
    : `https://exismic.com/redeem?code=${encodeURIComponent(giftCode)}`;

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 130,
        spread: 100,
        origin: { y: 0.55 },
        colors: ["#fbbf24", "#f59e0b", "#c084fc", "#e879f9", "#38bdf8"],
      });
    }
  }, [isOpen]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(giftCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {}
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(redeemUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const shareText = `🎁 Here is an Exismic Gift Voucher for ${giftTitle}! Redeem it here: ${redeemUrl}`;

  const shareViaWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareViaTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(redeemUrl)}&text=${encodeURIComponent(`🎁 Here is an Exismic Gift Voucher for ${giftTitle}!`)}`, "_blank");
  };

  const shareViaEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(`🎁 An Exismic Gift Voucher for you: ${giftTitle}`)}&body=${encodeURIComponent(shareText)}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop with Cyber Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-3xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-full max-w-xl rounded-[2.5rem] border-2 border-amber-400/60 bg-[#090912] p-6 sm:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_50px_rgba(245,158,11,0.25)] overflow-hidden z-10 backdrop-blur-3xl text-center"
          >
            {/* Ambient Lighting */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Top Icon */}
            <div className="flex justify-center mb-5">
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400/25 via-purple-500/25 to-yellow-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.35)]">
                <Gift size={38} className="drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-bounce" />
                <Sparkles size={16} className="absolute top-2 right-2 text-yellow-300 animate-pulse" />
              </div>
            </div>

            {/* Header Text */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/35 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Sparkles size={12} /> Gift Voucher Activated
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Your Gift Pass is Ready!
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                A single-use gift voucher code has been generated. Share this code or the instant redemption link with your recipient!
              </p>
            </div>

            {/* Digital Gift Voucher Card Preview */}
            <div className="relative mt-6 p-5 sm:p-6 rounded-3xl border border-amber-400/40 bg-gradient-to-br from-[#1d1206]/95 via-[#130b04]/90 to-[#0c0804]/98 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between gap-2 border-b border-amber-400/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    {isPro ? <Crown size={16} /> : <Coins size={16} />}
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-amber-400/90">
                      Exismic Digital Voucher
                    </span>
                    <span className="block text-sm font-black text-white">
                      {giftTitle}
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  1-TIME USE
                </span>
              </div>

              {recipientName && (
                <div className="mb-3 text-xs text-zinc-300">
                  <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block">For Recipient:</span>
                  <span className="font-extrabold text-amber-200">{recipientName}</span>
                </div>
              )}

              {recipientMessage && (
                <div className="mb-4 text-xs italic text-zinc-400 bg-black/40 p-3 rounded-2xl border border-white/5">
                  &ldquo;{recipientMessage}&rdquo;
                </div>
              )}

              {/* The Code Box */}
              <div className="p-3.5 rounded-2xl bg-black/70 border border-amber-400/30 flex items-center justify-between gap-2">
                <span className="font-mono text-base sm:text-lg font-black tracking-wider text-amber-300 select-all">
                  {giftCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl font-black text-[10.5px] uppercase tracking-wider bg-amber-400 text-amber-950 hover:bg-yellow-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 shrink-0"
                >
                  {copiedCode ? (
                    <>
                      <Check size={13} className="stroke-[3]" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? "Link Copied!" : "Copy Redeem Link"}</span>
                </button>

                <button
                  onClick={shareViaWhatsApp}
                  className="px-4 py-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={shareViaTelegram}
                  className="px-4 py-2.5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send size={14} />
                  <span>Telegram</span>
                </button>

                <button
                  onClick={shareViaEmail}
                  className="px-4 py-2.5 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Mail size={14} />
                  <span>Email</span>
                </button>
              </div>

              <p className="text-[11px] font-medium text-zinc-500">
                You can also retrieve this code anytime from the Shop or Account Settings.
              </p>
            </div>

            {/* Done CTA */}
            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer active:scale-98"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
}
