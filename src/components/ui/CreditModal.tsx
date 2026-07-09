"use client";

import React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Crown,
  Gauge,
  MessageSquareText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";
import { CreditTokenIcon } from "./CreditTokenIcon";

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: "free" | "pro";
  credits: number;
}

const PRO_BENEFITS = [
  {
    icon: Gauge,
    title: "Priority processing",
    detail: "Skip the standard queue",
  },
  {
    icon: MessageSquareText,
    title: "Unlimited AI chat",
    detail: "No daily conversation cap",
  },
  {
    icon: ShieldCheck,
    title: "Commercial rights",
    detail: "Create for client work",
  },
  {
    icon: Sparkles,
    title: "Pro creative suite",
    detail: "Themes, identity, and new tools",
  },
];

export function CreditModal({ isOpen, onClose, plan, credits }: CreditModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isIndia, setIsIndia] = React.useState(false);
  const [timeUntilReset, setTimeUntilReset] = React.useState("00h 00m 00s");
  const isPro = plan === "pro";
  const isOutOfCredits = credits <= 0;
  const proPrice = isIndia
    ? `Rs ${PRICING_CONFIG.PRO_PLAN.INR}`
    : `$${PRICING_CONFIG.PRO_PLAN.USD}`;

  React.useEffect(() => {
    setMounted(true);
    setIsIndia(getIsIndia());
    
    const updateTime = () => {
      const now = new Date();
      const target = new Date();
      target.setUTCHours(6, 30, 0, 0); // 12 PM IST
      
      if (now.getTime() >= target.getTime()) {
        target.setUTCDate(target.getUTCDate() + 1);
      }
      
      const diff = target.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilReset(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const title = isPro
    ? "Your Pro workspace"
    : isOutOfCredits
      ? "Keep creating today"
      : "Make Exismic yours";

  const description = isPro
    ? "Your priority access, expanded credits, and commercial toolkit are active."
    : isOutOfCredits
      ? "Your free balance is finished for today. Pro keeps your creative flow moving."
      : "Move from occasional creation to a workspace built for serious daily output.";

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close Pro details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="pointer-events-auto absolute inset-0 cursor-default bg-black/88 backdrop-blur-xl"
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="credit-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="pointer-events-auto relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[26px] border border-white/[0.11] bg-[#07070b]/96 shadow-[0_38px_110px_rgba(0,0,0,0.82),0_0_80px_rgba(124,58,237,0.08),inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.18),transparent_34%),radial-gradient(circle_at_92%_100%,rgba(34,211,238,0.13),transparent_38%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.17] [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]"
            />
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-purple-400 to-cyan-300" />

            <header className="relative z-10 flex min-h-16 items-center justify-between border-b border-white/[0.07] px-5 sm:px-7">
              <div className="flex items-center gap-3">
                <CreditTokenIcon size="md" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white">
                    Exismic Pro
                  </p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Creative access system
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-zinc-500 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 active:scale-95"
              >
                <X size={16} />
              </button>
            </header>

            <div className="relative z-10 overflow-y-auto">
              <section className="px-5 pb-6 pt-7 sm:px-8 sm:pb-7 sm:pt-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-[430px]">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300/15 bg-purple-300/[0.06] px-3 py-1.5">
                      {isPro ? (
                        <Crown size={11} className="text-purple-300" />
                      ) : (
                        <Zap size={11} className="fill-cyan-300/20 text-cyan-300" />
                      )}
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">
                        {isPro ? "Membership active" : "Built for daily creators"}
                      </span>
                    </div>
                    <h2
                      id="credit-modal-title"
                      className="text-[clamp(2rem,7vw,3.35rem)] font-black leading-[0.94] tracking-[-0.035em] text-white"
                    >
                      {title}
                      <span className="bg-linear-to-r from-purple-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                        .
                      </span>
                    </h2>
                    <p className="mt-4 max-w-[410px] text-sm font-medium leading-6 text-zinc-500">
                      {description}
                    </p>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                      {isPro ? "Current plan" : "One simple plan"}
                    </p>
                    <div className="mt-1 flex items-end gap-1 sm:justify-end">
                      <span className="text-2xl font-black tracking-tight text-white">
                        {isPro ? "PRO" : proPrice}
                      </span>
                      {!isPro && (
                        <span className="pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                          / month
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="border-y border-white/[0.07] bg-white/[0.018] px-5 py-5 sm:px-8">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                      Free capacity
                    </p>
                    <p className="mt-1 text-lg font-black text-zinc-400">50 / day</p>
                  </div>

                  <div className="flex min-w-20 items-center sm:min-w-32">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-700" />
                    <span className="relative h-px flex-1 overflow-hidden bg-white/10">
                      <motion.span
                        className="absolute inset-y-0 w-1/2 bg-linear-to-r from-purple-400 to-cyan-300 shadow-[0_0_9px_rgba(34,211,238,0.7)]"
                        animate={{ x: ["-100%", "210%"] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
                      />
                    </span>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300/70">
                      Pro capacity
                    </p>
                    <p className="mt-1 text-lg font-black text-white">
                      {PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS.toLocaleString()} / day
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">
                    Available now
                  </span>
                  <span className="flex items-center gap-2 text-xs font-black text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                    {credits.toLocaleString()} credits
                  </span>
                </div>
              </section>

              <section className="px-5 py-6 sm:px-8 sm:py-7">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-300">
                    What changes with Pro
                  </p>
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300/70">
                    20x daily capacity
                  </span>
                </div>

                <div className="grid gap-x-7 gap-y-4 sm:grid-cols-2">
                  {PRO_BENEFITS.map(({ icon: Icon, title: benefitTitle, detail }) => (
                    <div
                      key={benefitTitle}
                      className="group/benefit flex min-w-0 items-center gap-3 border-t border-white/[0.07] pt-4"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-zinc-500 transition-all duration-300 group-hover/benefit:border-cyan-300/20 group-hover/benefit:text-cyan-200">
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-xs font-black text-zinc-200">
                          <Check size={11} className="text-cyan-300" strokeWidth={3} />
                          {benefitTitle}
                        </span>
                        <span className="mt-1 block truncate text-[10px] font-medium text-zinc-600">
                          {detail}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <footer className="border-t border-white/[0.07] bg-black/20 px-5 py-5 sm:px-8">
                <Link
                  href="/pro"
                  onClick={onClose}
                  className="group/cta relative flex min-h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 px-5 shadow-[0_0_40px_rgba(168,85,247,0.4),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-300 hover:-translate-y-1 hover:border-white/50 hover:shadow-[0_15px_50px_rgba(34,211,238,0.5),inset_0_1px_0_rgba(255,255,255,0.8)] active:translate-y-0 active:scale-[0.98]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] skew-x-[-25deg] transition-transform duration-1000 group-hover/cta:translate-x-[150%]" />
                  {isPro ? (
                    <RefreshCcw size={18} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  ) : (
                    <Crown size={18} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  )}
                  <span className="relative text-xs font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {isPro ? "Manage Pro membership" : "Unlock Exismic Pro"}
                  </span>
                  <ArrowRight size={18} className="relative text-white transition-transform duration-300 group-hover/cta:translate-x-1.5 group-hover/cta:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                </Link>
                <div className="mt-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.16em]">
                  <span className="flex items-center gap-1.5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                    <RefreshCcw size={12} className="text-cyan-300" />
                    Resets in {timeUntilReset}
                  </span>
                  {!isPro && (
                    <>
                      <span className="text-zinc-700">·</span>
                      <span className="text-zinc-500">Cancel anytime</span>
                    </>
                  )}
                </div>
              </footer>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
