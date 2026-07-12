"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { MarketSwitcher } from "@/components/billing/MarketSwitcher";
import { PayPalCheckoutButton } from "@/components/billing/PayPalCheckoutButton";
import { RazorpayCheckoutButton } from "@/components/billing/RazorpayCheckoutButton";
import { cn } from "@/lib/utils";
import { getIsIndia } from "@/config/pricing";

type Market = "IN" | "GLOBAL";
type Plan = {
  id: string;
  name: string;
  description: string;
  credits: number;
  interval: "free" | "one_time" | "month";
  features: string[];
  price: {
    amount: number;
    display: string;
    currency: "INR" | "USD";
    gateway: "none" | "razorpay" | "paypal";
  };
};

type MarketPayload = {
  countryCode: string;
  market: Market;
  currency: "INR" | "USD";
  gateway: "razorpay" | "paypal";
  plans: Plan[];
};

export function PricingCards() {
  const [market, setMarket] = useState<Market>("GLOBAL");
  const [detectedCountry, setDetectedCountry] = useState("UNKNOWN");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMarket(nextMarket?: Market) {
    setLoading(true);
    setError(null);
    try {
      const url = nextMarket ? `/api/billing/market?market=${nextMarket}` : "/api/billing/market";
      const response = await fetch(url, { cache: "no-store" });
      const data = await response.json().catch(() => null) as MarketPayload | null;
      if (!response.ok || !data) throw new Error(data && "error" in data ? String((data as any).error) : "Could not load pricing.");
      if (!nextMarket && data.countryCode === "UNKNOWN" && getIsIndia()) {
        const indiaResponse = await fetch("/api/billing/market?market=IN", { cache: "no-store" });
        const indiaData = await indiaResponse.json().catch(() => null) as MarketPayload | null;
        if (indiaResponse.ok && indiaData) {
          setDetectedCountry("IN");
          setMarket("IN");
          setPlans(indiaData.plans);
          return;
        }
      }
      setDetectedCountry(data.countryCode);
      setMarket(data.market);
      setPlans(data.plans);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load pricing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMarket();
  }, []);

  async function switchMarket(nextMarket: Market) {
    await loadMarket(nextMarket);
  }

  const note = useMemo(() => {
    return market === "IN"
      ? "Prices shown in INR for India. Checkout uses Razorpay, UPI, cards, and wallets where available."
      : "Prices shown in USD. Checkout uses PayPal for international payments.";
  }, [market]);

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] text-white">
        <Loader2 className="mr-3 animate-spin text-cyan-200" /> Loading regional pricing...
      </div>
    );
  }

  if (error) {
    return <div className="rounded-2xl border border-red-300/20 bg-red-300/[0.06] p-5 text-sm font-bold text-red-200">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">Regional checkout</p>
          <p className="mt-2 text-sm font-medium leading-6 text-zinc-400">{note}</p>
          <p className="mt-1 text-xs font-medium text-zinc-600">Detected country: {detectedCountry}. Country detection is automatic. You can switch manually if needed.</p>
        </div>
        <MarketSwitcher value={market} onChange={(value) => void switchMarket(value)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative overflow-hidden rounded-[2rem] border bg-white/[0.035] p-5 shadow-2xl",
              plan.id === "pro" ? "border-cyan-300/30 shadow-cyan-500/10" : "border-white/10"
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.11),transparent_36%)]" />
            <div className="relative">
              {plan.id === "pro" && <span className="rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100">Most popular</span>}
              <h3 className="mt-5 text-2xl font-black text-white">{plan.name}</h3>
              <p className="mt-2 min-h-12 text-sm font-medium leading-6 text-zinc-500">{plan.description}</p>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-black text-white">{plan.price.display}</span>
                <span className="pb-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">{plan.interval === "month" ? "/ month" : plan.interval === "one_time" ? "one time" : "forever"}</span>
              </div>
              <div className="mt-5 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex gap-2 text-sm font-semibold text-zinc-400">
                    <Check size={15} className="mt-0.5 shrink-0 text-cyan-300" /> {feature}
                  </div>
                ))}
              </div>

              {plan.price.gateway === "razorpay" && <RazorpayCheckoutButton planId={plan.id} marketOverride={market} />}
              {plan.price.gateway === "paypal" && <PayPalCheckoutButton planId={plan.id} marketOverride={market} />}
              {plan.price.gateway === "none" && (
                <button className="mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  Current free access
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
        <ShieldCheck size={13} /> Server-verified payments. No client-side price trust.
      </div>
    </div>
  );
}

