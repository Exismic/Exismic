export const PRICING_CONFIG = {
  PAYMENTS_ENABLED: true,
  PAYMENT_UNAVAILABLE_MESSAGE: 'Purchases are currently unavailable. Please check back soon.',
  PRO_PLAN: {
    USD: 6.99,
    INR: 499,
    DAILY_CREDITS: 500,
    IS_PRO_LIVE: true,
  },
  PRO_STACKER_BUNDLE: {
    USD: 8.99,
    INR: 599,
    DAILY_CREDITS: 500,
    MAX_STACKED_CAP: 2500,
    WELCOME_BONUS: 250,
  },
  PRO_STACKING_ADDON: {
    USD: 2.99,
    INR: 199,
    MAX_STACKED_CAP: 2500,
    WELCOME_BONUS: 250,
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
      popular: true,
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
      color: 'gold',
      icon: 'Crown'
    }
  ]
};

export function getIsIndia() {
  if (typeof window === "undefined") return false;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = navigator.language || "";
  const locales = Array.isArray(navigator.languages) ? navigator.languages.join(",") : locale;

  return (
    timezone === "Asia/Kolkata" ||
    timezone === "Asia/Calcutta" ||
    /(^|[-_,])IN($|[-_,])/i.test(locale) ||
    /(^|[-_,])IN($|[-_,])/i.test(locales)
  );
}

export function formatPrice(amount: number, currency: 'USD' | 'INR') {
  if (currency === 'INR') {
    return `₹${amount}`;
  }
  return `$${amount}`;
}
