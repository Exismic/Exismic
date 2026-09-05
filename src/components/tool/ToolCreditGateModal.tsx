"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Coins, Crown, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { BuyCreditsModal } from "@/components/credits/BuyCreditsModal";

interface ToolCreditGateProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits?: number;
  availableCredits?: number;
}

export function ToolCreditGateModal({
  isOpen,
  onClose,
}: ToolCreditGateProps) {
  return (
    <BuyCreditsModal
      isOpen={isOpen}
      onClose={onClose}
      initialCategory="credits"
    />
  );
}

export function ToolCreditGateCard({
  requiredCredits = 10,
  availableCredits = 0,
}: {
  requiredCredits?: number;
  availableCredits?: number;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.25rem] border border-amber-500/30 bg-gradient-to-b from-[#100c05] to-black p-6 sm:p-8 text-center text-white shadow-2xl backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <Coins size={24} />
        </div>

        <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 mb-2">
          Insufficient Credits
        </span>

        <h4 className="text-xl font-black uppercase tracking-tight text-white mb-2">
          Need {requiredCredits} Credits (Available: {availableCredits})
        </h4>

        <p className="mx-auto max-w-md text-xs font-medium leading-relaxed text-zinc-400 mb-6">
          Your free 50 credits replenish every day at midnight IST. You can also refill instantly or upgrade to Pro for 10x capacity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex h-12 w-full sm:w-auto px-7 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 font-extrabold uppercase tracking-wider text-xs text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
          >
            <Zap size={15} />
            <span>Refill Credits & Unlock Pro</span>
            <ArrowRight size={13} />
          </button>
          <Link
            href="/rewards"
            className="flex h-12 w-full sm:w-auto px-5 items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-bold uppercase tracking-wider text-xs text-zinc-300 hover:text-white transition-all"
          >
            <span>Earn Free via Quests</span>
          </Link>
        </div>
      </motion.div>

      <BuyCreditsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCategory="credits"
      />
    </>
  );
}
