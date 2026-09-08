"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ArrowRight, 
  BadgePercent, 
  Coins, 
  Zap, 
  Layers, 
  ShieldCheck, 
  Flame,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Portal } from "@/components/ui/Portal";
import { usePro } from "@/hooks/usePro";
import { cn } from "@/lib/utils";
import { getIsIndia } from "@/config/pricing";

const DISMISS_KEY = "exismic_launch_promo_dismissed_until";
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export function LaunchOfferModal() {
  const router = useRouter();
  const pathname = usePathname();
  const { isPro, isLoading: isProLoading } = usePro();

  const [isOpen, setIsOpen] = useState(false);
  const [isIndia, setIsIndia] = useState(false);
  const [promoPrices, setPromoPrices] = useState<{
    inr: number;
    usd: number;
    regularInr: number;
    regularUsd: number;
  }>({
    inr: 299,
    usd: 3.99,
    regularInr: 499,
    regularUsd: 6.99,
  });

  useEffect(() => {
    // 1. Never show to existing Pro users or on checkout/auth routes
    if (isProLoading || isPro) return;
    if (pathname.startsWith("/pro") || pathname.startsWith("/auth") || pathname.startsWith("/maintenance")) {
      return;
    }

    // 2. Check 2-day snooze in localStorage
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_KEY);
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        return;
      }
    } catch {
      // Ignore localStorage read errors
    }

    let active = true;

    // 3. Check launch discount eligibility & fetch regional pricing
    const initCheck = async () => {
      try {
        const [eligibilityRes, marketRes] = await Promise.all([
          fetch("/api/billing/launch-discount-status", { cache: "no-store" }),
          fetch("/api/billing/market", { cache: "no-store" }).catch(() => null),
        ]);

        if (!eligibilityRes.ok) return;
        const eligibility = await eligibilityRes.json();

        // If user already claimed or promo has ended, do not display
        if (!active || !eligibility?.eligible) return;

        if (eligibility.prices) {
          setPromoPrices({
            inr: eligibility.prices.INR ?? 299,
            usd: eligibility.prices.USD ?? 3.99,
            regularInr: eligibility.prices.regularINR ?? 499,
            regularUsd: eligibility.prices.regularUSD ?? 6.99,
          });
        }

        if (marketRes && marketRes.ok) {
          const marketData = await marketRes.json();
          if (active) {
            setIsIndia(marketData.market === "IN" || (marketData.countryCode === "UNKNOWN" && getIsIndia()));
          }
        } else if (active) {
          setIsIndia(getIsIndia());
        }

        // Delay opening gracefully so page load is uninterrupted
        const timer = setTimeout(() => {
          if (active) setIsOpen(true);
        }, 1500);

        return () => clearTimeout(timer);
      } catch (err) {
        console.warn("[LaunchOfferModal] Eligibility check error:", err);
      }
    };

    void initCheck();

    return () => {
      active = false;
    };
  }, [isPro, isProLoading, pathname]);

  // Handle 2-day snooze dismissal
  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, (Date.now() + TWO_DAYS_MS).toString());
    } catch (e) {
      console.warn("[LaunchOfferModal] Failed to persist dismissal:", e);
    }
    setIsOpen(false);
  };

  // Handle purchase click -> navigate to /pro
  const handlePurchase = () => {
    setIsOpen(false);
    router.push("/pro");
  };

  const displayPrice = isIndia ? `₹${promoPrices.inr}` : `$${promoPrices.usd}`;
  const regularPrice = isIndia ? `₹${promoPrices.regularInr}` : `$${promoPrices.regularUsd}`;
  const savingsText = isIndia ? "₹200 OFF (40% OFF)" : "$3.00 OFF (43% OFF)";

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop with dark atmosphere blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleDismiss}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Premium Obsidian Glow Modal Container - Constrained to 92dvh for all mobile viewports */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="relative z-10 w-full max-w-lg max-h-[92dvh] flex flex-col overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] p-[1.5px] sm:p-[2px] bg-gradient-to-br from-emerald-400/50 via-teal-500/30 to-cyan-500/50 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(52,211,153,0.2)]"
            >
              {/* Corner Ambient Glow Spheres */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 sm:h-48 sm:w-48 rounded-full bg-emerald-500/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 sm:h-48 sm:w-48 rounded-full bg-cyan-500/25 blur-3xl" />

              {/* Obsidian Inner Body with scrollable support */}
              <div className="relative z-10 flex flex-col overflow-y-auto custom-scrollbar rounded-[1.9rem] sm:rounded-[2.4rem] bg-gradient-to-br from-[#06141d]/98 via-[#040b12]/98 to-[#020508]/98 p-4.5 sm:p-7 backdrop-blur-3xl">
                
                {/* Header Row: Badge & Dismiss X */}
                <div className="flex items-center justify-between gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                    <BadgePercent size={13} className="text-emerald-400 shrink-0" />
                    <span>v1.6 Launch Special • Limited Time</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss offer"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-zinc-400 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Hero Title & Offer Price */}
                <div className="mt-4 sm:mt-5 text-left">
                  <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug sm:leading-tight">
                    Upgrade to Exismic Pro for{" "}
                    <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                      {displayPrice}
                    </span>
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="line-through text-zinc-500 font-bold text-xs sm:text-sm">
                      {regularPrice}/mo
                    </span>
                    <span className="rounded-full bg-emerald-400/15 border border-emerald-400/40 px-2 py-0.5 text-[9px] sm:text-[9.5px] font-black text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.25)]">
                      Save {savingsText}
                    </span>
                    <span className="text-zinc-400 text-[11px] sm:text-xs font-medium">
                      • 1st month promo
                    </span>
                  </div>
                </div>

                {/* Features Highlight Grid */}
                <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-left">
                  {[
                    {
                      icon: Coins,
                      color: "text-emerald-300",
                      bg: "border-emerald-400/30 bg-emerald-500/10",
                      title: "500 Daily Credits",
                      desc: "15,000 / month, refreshes every 24h",
                    },
                    {
                      icon: Zap,
                      color: "text-cyan-300",
                      bg: "border-cyan-400/30 bg-cyan-500/10",
                      title: "Priority GPU Queue",
                      desc: "Fast-lane route across all AI tools",
                    },
                    {
                      icon: Layers,
                      color: "text-sky-300",
                      bg: "border-sky-400/30 bg-sky-500/10",
                      title: "All 50+ Studio Tools",
                      desc: "No watermarks, clean 4K exports",
                    },
                    {
                      icon: ShieldCheck,
                      color: "text-teal-300",
                      bg: "border-teal-400/30 bg-teal-500/10",
                      title: "Commercial License",
                      desc: "Full rights for clients & revenue",
                    },
                  ].map((feat) => {
                    const FeatIcon = feat.icon;
                    return (
                      <div
                        key={feat.title}
                        className="flex items-center sm:items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2.5 sm:p-3 transition-colors hover:border-emerald-400/30 hover:bg-white/[0.04]"
                      >
                        <div className={cn("flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border", feat.bg)}>
                          <FeatIcon size={14} className={feat.color} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11.5px] sm:text-xs font-black text-white leading-snug">{feat.title}</p>
                          <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-tight mt-0.5">{feat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Urgency & Renewal Assurance */}
                <div className="mt-4 sm:mt-5 flex items-start sm:items-center gap-2 rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2 sm:px-3.5 sm:py-2.5 text-[10.5px] sm:text-[11px] font-medium text-zinc-300 text-left leading-snug">
                  <Flame size={14} className="text-amber-400 shrink-0 fill-amber-400/30 mt-0.5 sm:mt-0" />
                  <span>
                    v1.6 Launch Special. Renews at standard {regularPrice}/mo from month 2. Cancel anytime in 1-click.
                  </span>
                </div>

                {/* Actions Footer */}
                <div className="mt-5 sm:mt-6 flex flex-col gap-2">
                  {/* Primary CTA */}
                  <button
                    type="button"
                    onClick={handlePurchase}
                    className="group relative flex h-12 sm:h-13 w-full items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-emerald-400/50 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 sm:px-6 text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] sm:tracking-[0.16em] text-white shadow-[0_0_30px_rgba(52,211,153,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(52,211,153,0.7)] hover:brightness-110 active:scale-[0.98] cursor-pointer select-none"
                  >
                    {/* Shimmer sweep */}
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg] transition-transform duration-1000 group-hover:translate-x-full" />
                    
                    <span className="relative z-10 flex items-center justify-center gap-2 font-extrabold">
                      <span>Claim First Month • {displayPrice}</span>
                      <ArrowRight size={15} strokeWidth={2.5} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </button>

                  {/* Secondary: No thanks (Dismiss for 2 days) */}
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full py-2 text-center text-xs font-semibold text-zinc-400 hover:text-white active:text-white transition-colors cursor-pointer rounded-xl hover:bg-white/[0.04] active:bg-white/[0.06]"
                  >
                    No thanks, hide for 2 days
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
