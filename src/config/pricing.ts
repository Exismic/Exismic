export const PRICING_CONFIG = {
  PAYMENTS_ENABLED: process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true',
  PAYMENT_UNAVAILABLE_MESSAGE: 'Purchases are currently unavailable. Please check back soon.',
  PRO_PLAN: {
    USD: 6.99,
    INR: 499,
    DAILY_CREDITS: 500,
    IS_PRO_LIVE: true,
  },
  CREDIT_PACKAGES: [
    {
      id: 'tier_1',
      billingPlanId: 'starter',
      credits: 500,
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
      priceUSD: 24.99,
      priceINR: 1999,
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
    return `Rs ${amount}`;
  }
  return `$${amount}`;
}
