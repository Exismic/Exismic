"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  Cpu,
  ImageDown,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";
import { LumoraMark } from "@/components/ui/LumoraLogo";
import { CreditTokenIcon } from "@/components/ui/CreditTokenIcon";

const subscribeToHydration = () => () => {};

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    email?: string | null;
    plan?: string | null;
    subscriptionStatus?: string | null;
    subscription_status?: string | null;
    planExpiresAt?: string | Date | null;
    plan_expires_at?: string | Date | null;
  } | null;
  onCancel: () => Promise<void>;
  isCancelling: boolean;
}

const INCLUDED_BENEFITS = [
  { icon: null, label: "1,000 daily credits", detail: "Restored every day", custom: true },
  { icon: Cpu, label: "Priority processing", detail: "Faster eligible jobs" },
  { icon: ImageDown, label: "Clean Pro exports", detail: "No generated watermark" },
  { icon: ShieldCheck, label: "Commercial rights", detail: "For client and brand work" },
];

export function ManageSubscriptionModal({
  isOpen,
  onClose,
  user,
  onCancel,
  isCancelling,
}: ManageSubscriptionModalProps) {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localCancelled, setLocalCancelled] = useState(false);
  const [fallbackBillingDate] = useState(
    () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);

  const subscriptionStatus = String(
    user?.subscription_status || user?.subscriptionStatus || ""
  ).toLowerCase();
  const isCancelled = localCancelled || subscriptionStatus === "cancelled";
  const rawExpiry = user?.plan_expires_at || user?.planExpiresAt;
  const expiryDate = rawExpiry ? new Date(rawExpiry) : null;
  const billingDate =
    expiryDate && !Number.isNaN(expiryDate.getTime())
      ? expiryDate
      : fallbackBillingDate;
  const formattedDate = billingDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const isIndia = isHydrated && getIsIndia();
  const planPrice = isIndia
    ? `Rs ${PRICING_CONFIG.PRO_PLAN.INR}`
    : `$${PRICING_CONFIG.PRO_PLAN.USD}`;

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowConfirmCancel(false);
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const closeModal = () => {
    setShowConfirmCancel(false);
    setIsSuccess(false);
    onClose();
  };

  const handleCancel = async () => {
    try {
      await onCancel();
      setLocalCancelled(true);
      setIsSuccess(true);
      setShowConfirmCancel(false);
    } catch (error) {
      console.error("Cancellation modal error:", error);
    }
  };

  if (!isHydrated) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close membership details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="pointer-events-auto absolute inset-0 cursor-default bg-black/88 backdrop-blur-xl"
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="membership-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="pointer-events-auto relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[26px] border border-white/[0.11] bg-[#07070b]/98 shadow-[0_42px_120px_rgba(0,0,0,0.86),0_0_80px_rgba(124,58,237,0.08)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_68%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[linear-gradient(120deg,rgba(124,58,237,0.15),transparent_44%,rgba(34,211,238,0.08),transparent)]" />
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-purple-400 via-fuchsia-300 to-cyan-300" />

            <header className="relative z-10 flex min-h-20 shrink-0 items-center justify-between border-b border-white/[0.07] px-5 sm:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <LumoraMark size={42} />
                <div className="min-w-0">
                  <h2 id="membership-modal-title" className="truncate text-sm font-black tracking-[-0.01em] text-white">
                    Lumora Pro
                  </h2>
                  <p className="mt-1 text-[8px] font-black uppercase tracking-[0.22em] text-zinc-600">
                    Membership and billing
                  </p>
                </div>
                <span
                  className={cn(
                    "ml-1 hidden min-h-6 items-center gap-1.5 rounded-full border px-2.5 text-[8px] font-black uppercase tracking-[0.14em] sm:flex",
                    isCancelled
                      ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-200"
                      : "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isCancelled ? "bg-amber-300" : "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]"
                    )}
                  />
                  {isCancelled ? "Ends soon" : "Active"}
                </span>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-zinc-500 transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 active:scale-95"
              >
                <X size={16} />
              </button>
            </header>

            <div className="relative z-10 overflow-y-auto">
              <section className="px-5 py-6 sm:px-8 sm:py-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div
                      className={cn(
                        "mb-3 inline-flex min-h-7 items-center gap-2 rounded-full border px-3 text-[8px] font-black uppercase tracking-[0.2em]",
                        isCancelled
                          ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-200"
                          : "border-purple-300/20 bg-purple-300/[0.07] text-purple-200"
                      )}
                    >
                      {isCancelled ? <AlertTriangle size={11} /> : <Check size={11} strokeWidth={3} />}
                      {isCancelled ? "Cancellation scheduled" : "Full Pro access"}
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="bg-[linear-gradient(100deg,#fff_0%,#e9d5ff_55%,#a5f3fc_100%)] bg-clip-text text-5xl font-black tracking-[-0.05em] text-transparent sm:text-6xl">
                        {planPrice}
                      </span>
                      <span className="pb-2 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600">
                        / month
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">
                      {isCancelled ? "Access available until" : "Next renewal"}
                    </p>
                    <p className="mt-1.5 text-sm font-black text-white">{formattedDate}</p>
                  </div>
                </div>

                {isCancelled && (
                  <p className="mt-5 border-t border-white/[0.07] pt-5 text-xs font-medium leading-6 text-zinc-500">
                    Your Pro tools remain available through {formattedDate}. No further renewal will be charged.
                  </p>
                )}
              </section>

              <section className="border-y border-white/[0.07] bg-white/[0.016] px-5 py-5 sm:px-8">
                <p className="mb-4 text-[8px] font-black uppercase tracking-[0.22em] text-zinc-600">
                  Included with your membership
                </p>
                <div className="grid gap-x-7 gap-y-4 sm:grid-cols-2">
                  {INCLUDED_BENEFITS.map(({ icon: Icon, label, detail, custom }) => (
                    <div key={label} className="flex items-center gap-3 border-t border-white/[0.07] pt-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-cyan-200">
                        {custom ? <CreditTokenIcon /> : Icon ? <Icon size={15} /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-black text-zinc-200">{label}</span>
                        <span className="mt-1 block truncate text-[9px] font-medium text-zinc-600">{detail}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid border-b border-white/[0.07] sm:grid-cols-2">
                <div className="flex min-h-20 items-center gap-3 border-b border-white/[0.07] px-5 sm:border-b-0 sm:border-r sm:px-8">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-purple-200">
                    <Calendar size={15} />
                  </span>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-600">
                      {isCancelled ? "Plan ends" : "Billing cycle"}
                    </p>
                    <p className="mt-1 text-xs font-black text-zinc-200">
                      {isCancelled ? formattedDate : "Monthly"}
                    </p>
                  </div>
                </div>
                <div className="flex min-h-20 items-center gap-3 px-5 sm:px-8">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-cyan-200">
                    <Lock size={15} />
                  </span>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-zinc-600">
                      Payment security
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-xs font-black text-zinc-200">
                      Secure billing
                      <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-2 py-0.5 text-[7px] uppercase tracking-[0.13em] text-emerald-200">
                        Verified
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              <section className="px-5 py-5 sm:px-8 sm:py-6">
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-start gap-3 rounded-xl border border-emerald-300/18 bg-emerald-300/[0.045] p-4"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-200">
                        <Check size={16} strokeWidth={3} />
                      </span>
                      <div>
                        <p className="text-xs font-black text-white">Cancellation confirmed</p>
                        <p className="mt-1 text-[10px] font-medium leading-5 text-zinc-500">
                          Your Pro access continues through {formattedDate}.
                        </p>
                      </div>
                    </motion.div>
                  ) : isCancelled ? (
                    <motion.div
                      key="cancelled"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between gap-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.035] p-4"
                    >
                      <div>
                        <p className="text-xs font-black text-zinc-200">No further action needed</p>
                        <p className="mt-1 text-[9px] font-medium text-zinc-600">Your cancellation is already scheduled.</p>
                      </div>
                      <ShieldCheck size={19} className="shrink-0 text-amber-200" />
                    </motion.div>
                  ) : showConfirmCancel ? (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl border border-red-300/18 bg-red-300/[0.035] p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-300/10 text-red-300">
                            <AlertTriangle size={16} />
                          </span>
                          <div>
                            <p className="text-xs font-black text-white">Cancel Lumora Pro?</p>
                            <p className="mt-1.5 text-[10px] font-medium leading-5 text-zinc-500">
                              You keep all Pro features until {formattedDate}. After that, daily credits return to 50.
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => setShowConfirmCancel(false)}
                            className="min-h-11 rounded-xl border border-white/[0.1] bg-white text-[9px] font-black uppercase tracking-[0.16em] text-black transition-all hover:bg-zinc-100 active:scale-[0.99]"
                          >
                            Keep Pro
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-300/[0.07] text-[9px] font-black uppercase tracking-[0.16em] text-red-200 transition-all hover:bg-red-400 hover:text-white disabled:cursor-wait disabled:opacity-60 active:scale-[0.99]"
                          >
                            {isCancelling ? <Loader2 size={14} className="animate-spin" /> : "Confirm cancellation"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col gap-3 sm:flex-row"
                    >
                      <Link
                        href="/pro/benefits"
                        onClick={closeModal}
                        className="group flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.035] text-[9px] font-black uppercase tracking-[0.16em] text-zinc-300 transition-all hover:border-cyan-300/20 hover:bg-cyan-300/[0.045] hover:text-white"
                      >
                        View Pro benefits
                        <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setShowConfirmCancel(true)}
                        className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600 transition-colors hover:bg-red-300/[0.035] hover:text-red-300"
                      >
                        Cancel membership
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <div className="flex items-center justify-between border-t border-white/[0.07] bg-black/20 px-5 py-3.5 sm:px-8">
                <span className="text-[8px] font-black uppercase tracking-[0.17em] text-zinc-700">
                  Membership status
                </span>
                <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.17em] text-zinc-500">
                  <RefreshCw size={10} />
                  Synced with your account
                </span>
              </div>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
