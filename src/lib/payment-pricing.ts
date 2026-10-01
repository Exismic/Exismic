import { PRICING_CONFIG, isExismic17PromoActive } from "@/config/pricing";

export type CheckoutCurrency = "USD" | "INR";
export type CheckoutPlan = "pro" | "credits";

export function normalizeCheckoutCurrency(currency?: string): CheckoutCurrency {
  return currency === "INR" ? "INR" : "USD";
}

export function getProPrice(currency: CheckoutCurrency, planId?: string) {
  const isYearly = planId === "pro_yearly";
  const planConfig = isYearly ? PRICING_CONFIG.PRO_YEARLY_PLAN : PRICING_CONFIG.PRO_PLAN;
  let amount = currency === "INR" ? planConfig.INR : planConfig.USD;
  const regularAmount = amount;
  const isDiscountActive = !isYearly && isExismic17PromoActive();

  if (isDiscountActive) {
    amount = currency === "INR" 
      ? PRICING_CONFIG.V17_LAUNCH_PROMO.PRO_MONTHLY.INR 
      : PRICING_CONFIG.V17_LAUNCH_PROMO.PRO_MONTHLY.USD;
  }

  const interval = isYearly ? "yr" : "mo";
  const displayAmount = currency === "INR" ? `₹${amount.toLocaleString("en-IN")}/${interval}` : `$${amount}/${interval}`;
  const regularDisplayAmount = currency === "INR" ? `₹${regularAmount.toLocaleString("en-IN")}/${interval}` : `$${regularAmount}/${interval}`;

  return {
    amount,
    amountMinor: Math.round(amount * 100),
    regularAmount,
    regularAmountMinor: Math.round(regularAmount * 100),
    isDiscounted: isDiscountActive,
    discountPercent: isDiscountActive ? 20 : 0,
    display: displayAmount,
    regularDisplay: regularDisplayAmount,
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

  let amount = currency === "INR" ? tier.priceINR : tier.priceUSD;
  const regularAmount = amount;
  const isDiscountActive = isExismic17PromoActive();

  if (isDiscountActive) {
    const pack = PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS[tier.id as keyof typeof PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS]
      || PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS[tier.billingPlanId as keyof typeof PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS];
    if (pack) {
      amount = currency === "INR" ? pack.INR : pack.USD;
    }
  }

  return {
    tier,
    amount,
    amountMinor: Math.round(amount * 100),
    regularAmount,
    regularAmountMinor: Math.round(regularAmount * 100),
    isDiscounted: isDiscountActive,
    discountPercent: isDiscountActive ? 20 : 0,
    display: currency === "INR" ? `₹${amount}` : `$${amount}`,
    regularDisplay: currency === "INR" ? `₹${regularAmount}` : `$${regularAmount}`,
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
