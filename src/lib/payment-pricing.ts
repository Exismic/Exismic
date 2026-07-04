import { PRICING_CONFIG } from "@/config/pricing";

export type CheckoutCurrency = "USD" | "INR";
export type CheckoutPlan = "pro" | "credits";

export function normalizeCheckoutCurrency(currency?: string): CheckoutCurrency {
  return currency === "INR" ? "INR" : "USD";
}

export function getProPrice(currency: CheckoutCurrency) {
  const amount = currency === "INR" ? PRICING_CONFIG.PRO_PLAN.INR : PRICING_CONFIG.PRO_PLAN.USD;
  return {
    amount,
    amountMinor: Math.round(amount * 100),
    display: currency === "INR" ? `Rs ${amount}` : `$${amount}`,
    currency,
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
    display: currency === "INR" ? `Rs ${amount}` : `$${amount}`,
    currency,
  };
}

export function getCreditPackageByCredits(credits: number) {
  return PRICING_CONFIG.CREDIT_PACKAGES.find((tier) => tier.credits === credits) || null;
}
