export const PRICING_CONFIG = {
  PAYMENTS_ENABLED: true,
  PAYMENT_UNAVAILABLE_MESSAGE: 'Purchases are currently unavailable. Please check back soon.',
  PRO_PLAN: {
    USD: 6.99,
    INR: 499,
    DAILY_CREDITS: 500,
    IS_PRO_LIVE: true,
  },
  V17_LAUNCH_PROMO: {
    CODE: "EXISMIC17",
    ACTIVE: false,
    EXPIRES_AT: "2026-10-08T23:59:59Z", // 1 week from now (Oct 1 - Oct 8, 2026)
    DISCOUNT_PERCENT: 20,
    LABEL: "20% OFF (Exismic 1.7 Special)",
    PRO_MONTHLY: {
      USD: 5.59,
      INR: 399,
      REGULAR_USD: 6.99,
      REGULAR_INR: 499,
      DISCOUNT_AMOUNT_USD: 1.40,
      DISCOUNT_AMOUNT_INR: 100,
    },
    CREDIT_PACKS: {
      starter: { USD: 3.19, INR: 239, regularUSD: 3.99, regularINR: 299 },
      creator: { USD: 7.19, INR: 559, regularUSD: 8.99, regularINR: 699 },
      ultimate: { USD: 15.99, INR: 1199, regularUSD: 19.99, regularINR: 1499 },
      tier_1: { USD: 3.19, INR: 239, regularUSD: 3.99, regularINR: 299 },
      tier_2: { USD: 7.19, INR: 559, regularUSD: 8.99, regularINR: 699 },
      tier_3: { USD: 15.99, INR: 1199, regularUSD: 19.99, regularINR: 1499 },
    },
    BLOCK_CUSTOM_COUPONS: false,
  },
  V16_LAUNCH_PROMO: {
    CODE: "V16LAUNCH",
    ACTIVE: false,
    EXPIRES_AT: "2026-09-13T00:00:00Z", // Concluded - preserved in codebase for future reference
    DISCOUNTED_PRICE_USD: 3.99,
    DISCOUNTED_PRICE_INR: 299,
    DISCOUNT_AMOUNT_USD: 3.00,
    DISCOUNT_AMOUNT_INR: 200,
  },
  PRO_YEARLY_PLAN: {
    USD: 59.99,
    INR: 4499,
    DAILY_CREDITS: 500,
    IS_PRO_LIVE: true,
  },
  CREDIT_PACKAGES: [
    {
      id: 'tier_1',
      billingPlanId: 'starter',
      credits: 500,
      bonusCredits: 0,
      priceUSD: 3.99,
      priceINR: 299,
      label: 'Starter Pack',
      color: 'blue',
      icon: 'Zap'
    },
    {
      id: 'tier_2',
      billingPlanId: 'creator',
      credits: 1500,
      bonusCredits: 500,
      priceUSD: 8.99,
      priceINR: 699,
      label: 'Creator Choice',
      color: 'purple',
      popular: false,
      icon: 'Sparkles'
    },
    {
      id: 'tier_3',
      billingPlanId: 'ultimate',
      credits: 5000,
      bonusCredits: 1000,
      priceUSD: 19.99,
      priceINR: 1499,
      label: 'Studio Power',
      popular: true,
      color: 'gold',
      icon: 'Crown'
    }
  ]
};

export function getIsIndia() {
  if (typeof window === "undefined") return false;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = navigator.language || "";
    const locales = Array.isArray(navigator.languages) ? navigator.languages.join(",") : locale;
    const offset = new Date().getTimezoneOffset();

    return (
      timezone === "Asia/Kolkata" ||
      timezone === "Asia/Calcutta" ||
      offset === -330 ||
      /(^|[-_,])IN($|[-_,])/i.test(locale) ||
      /(^|[-_,])IN($|[-_,])/i.test(locales)
    );
  } catch {
    return false;
  }
}

export function formatPrice(amount: number, currency: 'USD' | 'INR') {
  if (currency === 'INR') {
    return `₹${amount}`;
  }
  return `$${amount}`;
}

export function getAnnualSavings(isIndia: boolean) {
  const monthly = isIndia ? PRICING_CONFIG.PRO_PLAN.INR : PRICING_CONFIG.PRO_PLAN.USD;
  const yearly = isIndia ? PRICING_CONFIG.PRO_YEARLY_PLAN.INR : PRICING_CONFIG.PRO_YEARLY_PLAN.USD;
  const standardYear = monthly * 12;
  return {
    percent: Math.round((1 - yearly / standardYear) * 100),
    saved: standardYear - yearly,
    standardYear,
    monthlyEquivalent: yearly / 12,
  };
}

export function isExismic17PromoActive() {
  const promo = PRICING_CONFIG.V17_LAUNCH_PROMO;
  if (!promo || !promo.ACTIVE) return false;
  return new Date() <= new Date(promo.EXPIRES_AT);
}

export function isLaunchPromoActive() {
  return isExismic17PromoActive();
}

