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
  ChevronLeft,
  Cpu,
  Gift,
  HelpCircle,
  ImageDown,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PRICING_CONFIG, getIsIndia } from "@/config/pricing";
import { ExismicMark } from "@/components/ui/ExismicLogo";
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
  { icon: null, label: `${PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS.toLocaleString()} daily credits`, detail: "Restored every day", custom: true },
  { icon: Cpu, label: "Priority processing", detail: "Faster eligible jobs" },
  { icon: ImageDown, label: "Clean Pro exports", detail: "No generated watermark" },
  { icon: ShieldCheck, label: "Commercial rights", detail: "For client and brand work" },
];

const CANCELLATION_REASONS = [
  { id: "expensive", label: "Too expensive for me right now", icon: "💰" },
  { id: "unused", label: "Not using it often enough / excess credits", icon: "⚡" },
  { id: "missing_features", label: "Missing specific tools or features I need", icon: "🛠️" },
  { id: "quality", label: "Quality or performance concerns", icon: "🐛" },
  { id: "temporary", label: "Taking a break / temporary pause", icon: "⏸️" },
  { id: "other", label: "Other reason", icon: "❓" },
];

type CancelStep = "overview" | "loss_summary" | "survey" | "save_offer" | "confirm" | "success";

export function ManageSubscriptionModal({
  isOpen,
  onClose,
  user,
  onCancel,
  isCancelling,
}: ManageSubscriptionModalProps) {
  const [step, setStep] = useState<CancelStep>("overview");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountAppliedSuccess, setDiscountAppliedSuccess] = useState(false);
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

  const originalNumericPrice = isIndia
    ? PRICING_CONFIG.PRO_PLAN.INR
    : PRICING_CONFIG.PRO_PLAN.USD;
  const discountedNumericPrice = Math.round(originalNumericPrice * 0.7);

  const planPrice = isIndia
    ? `₹${originalNumericPrice}`
    : `$${originalNumericPrice}`;
  const discountedPrice = isIndia
    ? `₹${discountedNumericPrice}`
    : `$${discountedNumericPrice}`;

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const closeModal = () => {
    setStep("overview");
    setSelectedReason("");
    setFeedbackText("");
    setFeedbackSent(false);
    setDiscountAppliedSuccess(false);
    onClose();
  };

  const sendFeedbackToDiscord = async () => {
    if (!selectedReason || feedbackSent) return;
    const reasonObj = CANCELLATION_REASONS.find((r) => r.id === selectedReason);
    try {
      setFeedbackSent(true);
      await fetch("/api/cancellation-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonId: selectedReason,
          reasonLabel: reasonObj?.label || selectedReason,
          feedback: feedbackText,
          userEmail: user?.email || "Anonymous",
        }),
      });
    } catch (err) {
      console.error("Failed to post cancellation feedback to Discord:", err);
    }
  };

  const handleApplyDiscount = async () => {
    setIsApplyingDiscount(true);
    try {
      const res = await fetch("/api/payments/apply-retention-discount", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setDiscountAppliedSuccess(true);
      } else {
        alert(data.error || "Failed to apply retention offer.");
      }
    } catch (err) {
      console.error("Discount apply error:", err);
      alert("Could not apply retention offer right now.");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await onCancel();
      setLocalCancelled(true);
      setStep("success");
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
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(34,211,238,0.12),rgba(15,23,42,0))]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400" />

            <header className="relative z-10 flex min-h-20 shrink-0 items-center justify-between border-b border-white/[0.07] px-5 sm:px-7">
              <div className="flex min-w-0 items-center gap-3">
                {step !== "overview" && step !== "success" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === "loss_summary") setStep("overview");
                      else if (step === "survey") setStep("loss_summary");
                      else if (step === "save_offer") setStep("survey");
                      else if (step === "confirm") setStep("save_offer");
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                ) : (
                  <ExismicMark size={42} />
                )}
                <div className="min-w-0">
                  <h2 id="membership-modal-title" className="truncate text-sm font-black tracking-[-0.01em] text-white">
                    {step === "overview" && "Exismic Pro"}
                    {step === "loss_summary" && "Before you cancel..."}
                    {step === "survey" && "Help us improve"}
                    {step === "save_offer" && "Special Pro Offer"}
                    {step === "confirm" && "Confirm Cancellation"}
                    {step === "success" && "Cancellation Confirmed"}
                  </h2>
                  <p className="mt-1 text-[8px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    {step === "overview" ? "Membership and billing" : `Step ${step === "loss_summary" ? 1 : step === "survey" ? 2 : step === "save_offer" ? 3 : 4} of 4`}
                  </p>
                </div>
                {step === "overview" && (
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
                )}
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
              <AnimatePresence mode="wait">
                {/* STEP 0: OVERVIEW */}
                {step === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
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
                      {isCancelled ? (
                        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.035] p-4">
                          <div>
                            <p className="text-xs font-black text-zinc-200">Cancellation Scheduled</p>
                            <p className="mt-1 text-[9px] font-medium text-zinc-500">Your plan stays active through {formattedDate}.</p>
                          </div>
                          <ShieldCheck size={19} className="shrink-0 text-amber-200" />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Link
                            href="/pro/benefits"
                            onClick={closeModal}
                            className="group relative flex min-h-12 flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-purple-500/25 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 px-4 text-[9px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.12)] transition-all duration-200 hover:border-purple-400/40 hover:bg-purple-500/20 hover:shadow-[0_0_28px_rgba(168,85,247,0.25)] hover:scale-[1.01] active:scale-[0.98]"
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              View Pro benefits
                              <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                            </span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setStep("loss_summary")}
                            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] active:scale-[0.98]"
                          >
                            Cancel membership
                          </button>
                        </div>
                      )}
                    </section>
                  </motion.div>
                )}

                {/* STEP 1: LOSS SUMMARY */}
                {step === "loss_summary" && (
                  <motion.div
                    key="loss_summary"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="px-5 py-6 sm:px-8 sm:py-8"
                  >
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <AlertTriangle size={24} />
                      </span>
                      <h3 className="mt-3 text-lg font-black text-white">Here's what you will lose on Free</h3>
                      <p className="mt-1 text-xs text-zinc-400">
                        Cancelling your membership revokes all your Pro privileges at the end of this billing period.
                      </p>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
                            <Zap size={16} />
                          </span>
                          <div>
                            <p className="text-xs font-black text-white">Daily Credit Limit</p>
                            <p className="text-[10px] text-zinc-500">Drops by 90% on Free tier</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-400 line-through opacity-70">{PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS.toLocaleString()} / day</span>
                          <span className="ml-2 text-xs font-black text-red-400">50 / day</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                            <Cpu size={16} />
                          </span>
                          <div>
                            <p className="text-xs font-black text-white">Generation Speed</p>
                            <p className="text-[10px] text-zinc-500">No priority GPU allocation</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-red-400">Standard Shared Queue</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300">
                            <ImageDown size={16} />
                          </span>
                          <div>
                            <p className="text-xs font-black text-white">Watermark-Free Exports</p>
                            <p className="text-[10px] text-zinc-500">Clean Pro downloads</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-red-400">Disabled on Free</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                            <ShieldCheck size={16} />
                          </span>
                          <div>
                            <p className="text-xs font-black text-white">Commercial Rights</p>
                            <p className="text-[10px] text-zinc-500">For client and commercial projects</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-red-400">Non-commercial</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="group relative flex min-h-12 flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/80 bg-white px-5 text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_0_30px_rgba(255,255,255,0.3),0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-[1.015] active:scale-[0.98]"
                      >
                        <Sparkles size={15} className="text-cyan-600 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                        <span className="relative z-10">Keep My Pro Benefits</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep("survey")}
                        className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-5 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-300 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] active:scale-[0.98]"
                      >
                        I Still Want to Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: SURVEY */}
                {step === "survey" && (
                  <motion.div
                    key="survey"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="px-5 py-6 sm:px-8 sm:py-8"
                  >
                    <div className="text-center">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                        <HelpCircle size={20} />
                      </span>
                      <h3 className="mt-2 text-base font-black text-white">Why are you cancelling?</h3>
                      <p className="mt-1 text-xs text-zinc-400">
                        Your feedback helps us make Exismic better for everyone.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-2.5">
                      {CANCELLATION_REASONS.map((reason) => (
                        <button
                          key={reason.id}
                          type="button"
                          onClick={() => setSelectedReason(reason.id)}
                          className={cn(
                            "flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all",
                            selectedReason === reason.id
                              ? "border-cyan-400/50 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                              : "border-white/[0.07] bg-white/[0.02] text-zinc-300 hover:border-white/15 hover:bg-white/[0.05]"
                          )}
                        >
                          <span className="text-lg">{reason.icon}</span>
                          <span className="text-xs font-semibold">{reason.label}</span>
                          <div
                            className={cn(
                              "ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                              selectedReason === reason.id
                                ? "border-cyan-400 bg-cyan-400 text-black"
                                : "border-white/20"
                            )}
                          >
                            {selectedReason === reason.id && <Check size={12} strokeWidth={3} />}
                          </div>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {selectedReason && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden space-y-2"
                        >
                          <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-cyan-300">
                            {selectedReason === "missing_features"
                              ? "What tools or features were you hoping to find?"
                              : selectedReason === "quality"
                              ? "What went wrong or didn't meet your expectations?"
                              : selectedReason === "expensive"
                              ? "What price or feature model would suit you better?"
                              : "What could we do better or add to Exismic?"}
                            <span className="ml-1 text-[9px] font-medium text-zinc-500 lowercase">(optional)</span>
                          </label>
                          <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Share your suggestion or feedback directly with our product team..."
                            rows={3}
                            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-400/20"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        disabled={!selectedReason}
                        onClick={() => {
                          sendFeedbackToDiscord();
                          setStep("save_offer");
                        }}
                        className="group relative flex min-h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/80 bg-white px-5 text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-[1.015] active:scale-[0.98] disabled:opacity-35 disabled:pointer-events-none"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Continue
                          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: SAVE OFFER */}
                {step === "save_offer" && (
                  <motion.div
                    key="save_offer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="px-5 py-6 sm:px-8 sm:py-8"
                  >
                    {discountAppliedSuccess ? (
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                          <Check size={28} strokeWidth={3} />
                        </span>
                        <h3 className="mt-4 text-xl font-black text-white">30% Offer Applied!</h3>
                        <p className="mt-2 text-xs font-medium leading-5 text-zinc-300">
                          Your 30% discount has been applied to your next billing cycle. You saved on your next renewal while keeping all {PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS.toLocaleString()} daily credits and Pro tools active!
                        </p>
                        <button
                          type="button"
                          onClick={closeModal}
                          className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/40 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_0_30px_rgba(52,211,153,0.35)] transition-all duration-200 hover:scale-[1.01] hover:brightness-105 active:scale-[0.98]"
                        >
                          Awesome, back to Exismic
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 via-zinc-900/60 to-black/80 p-6 text-center shadow-[0_0_50px_rgba(34,211,238,0.12)]">
                          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-500/15 blur-2xl" />
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200">
                            <Gift size={12} /> Exclusive Retention Offer
                          </span>

                          <h3 className="mt-4 text-2xl font-black text-white">
                            Get 30% OFF your next month
                          </h3>
                          <p className="mt-1.5 text-xs text-zinc-300">
                            We'd love to keep creating together. Stay on Pro today and receive 30% off your upcoming renewal.
                          </p>

                          <div className="my-6 flex items-center justify-center gap-3">
                            <span className="text-xl font-bold text-zinc-500 line-through">
                              {planPrice}
                            </span>
                            <span className="text-4xl font-black text-emerald-400">
                              {discountedPrice}
                            </span>
                            <span className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                              SAVE 30%
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleApplyDiscount}
                            disabled={isApplyingDiscount}
                            className="group relative flex min-h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-emerald-300/40 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_0_35px_rgba(52,211,153,0.35)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_0_45px_rgba(52,211,153,0.5)] active:scale-[0.98] disabled:opacity-60"
                          >
                            {isApplyingDiscount ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <>
                                <Sparkles size={16} className="transition-transform group-hover:rotate-12" /> Claim 30% Off & Stay Pro
                              </>
                            )}
                          </button>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => setStep("confirm")}
                            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-[10px] font-black uppercase tracking-[0.15em] text-zinc-300 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] active:scale-[0.98]"
                          >
                            No thanks, proceed to cancel
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* STEP 4: CONFIRM CANCELLATION */}
                {step === "confirm" && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-5 py-6 sm:px-8 sm:py-8"
                  >
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
                      <div className="flex items-start gap-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-300">
                          <AlertTriangle size={20} />
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-white">Final Step: Confirm Cancellation</h4>
                          <p className="mt-1 text-xs text-zinc-400">
                            Your Pro plan will remain active until <span className="font-bold text-white">{formattedDate}</span>. After this date, your daily credits will return to 50 and watermark removal will be disabled.
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white text-xs font-black uppercase tracking-[0.16em] text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-[1.015] active:scale-[0.98]"
                        >
                          <Sparkles size={14} className="text-cyan-600" /> Keep Pro
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmCancel}
                          disabled={isCancelling}
                          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-gradient-to-b from-red-500/25 to-red-600/35 text-xs font-black uppercase tracking-[0.14em] text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-200 hover:border-red-400 hover:bg-red-500 hover:text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] disabled:opacity-50 active:scale-[0.98]"
                        >
                          {isCancelling ? <Loader2 size={16} className="animate-spin" /> : "Confirm cancellation"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: SUCCESS STATE */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-5 py-8 text-center sm:px-8 sm:py-10"
                  >
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
                      <ShieldCheck size={28} />
                    </span>
                    <h3 className="mt-4 text-xl font-black text-white">Subscription Cancelled</h3>
                    <p className="mt-2 text-xs leading-5 text-zinc-400">
                      Your cancellation is confirmed. You retain full Pro access and {PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS.toLocaleString()} daily credits until <span className="font-bold text-white">{formattedDate}</span>.
                    </p>

                    <div className="mt-8 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex min-h-12 w-full items-center justify-center rounded-xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/15 active:scale-[0.98]"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
