import { PRICING_CONFIG } from "@/config/pricing";

export type CheckoutCurrency = "USD" | "INR";
export type CheckoutPlan = "pro" | "credits";

export function normalizeCheckoutCurrency(currency?: string): CheckoutCurrency {
  return currency === "INR" ? "INR" : "USD";
}

export function getProPrice(currency: CheckoutCurrency, planId?: string) {
  const isYearly = planId === "pro_yearly";
  const planConfig = isYearly ? PRICING_CONFIG.PRO_YEARLY_PLAN : PRICING_CONFIG.PRO_PLAN;
  const amount = currency === "INR" ? planConfig.INR : planConfig.USD;
  const interval = isYearly ? "yr" : "mo";
  const displayAmount = currency === "INR" ? `₹${amount.toLocaleString("en-IN")}/${interval}` : `$${amount}/${interval}`;
  return {
    amount,
    amountMinor: Math.round(amount * 100),
    display: displayAmount,
    currency,
    interval,
  };
}


export function getCreditPackage(tierId?: string) {
  return PRICING_CONFIG.CREDIT_PACKAGES.find((tier) => tier.id === tierId) || null;
}

export function getCreditPackagePrice(tierId: string | undefined, currency: CheckoutCurrency) {
  const tier = getCreditPackage(tierId);
  if (!tier) return null;

  const amount = currency === "INR" ? tier.priceINR : tier.priceUSD;
  return {
    tier,
    amount,
    amountMinor: Math.round(amount * 100),
    display: currency === "INR" ? `₹${amount}` : `$${amount}`,
    currency,
  };
}

export function getTotalPackageCredits(tier: (typeof PRICING_CONFIG.CREDIT_PACKAGES)[number]) {
  return tier.credits + (tier.bonusCredits || 0);
}

export function getCreditPackageByCredits(credits: number) {
  return (
    PRICING_CONFIG.CREDIT_PACKAGES.find(
      (tier) =>
        tier.credits === credits ||
        tier.credits + (tier.bonusCredits || 0) === credits
    ) || null
  );
}
