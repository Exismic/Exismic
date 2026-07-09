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
      credits: 500,
      priceUSD: 4.99,
      priceINR: 349,
      label: 'Starter Pack',
      color: 'blue',
      icon: 'Zap'
    },
    {
      id: 'tier_2',
      credits: 1500,
      priceUSD: 9.99,
      priceINR: 699,
      label: 'Creator Choice',
      color: 'purple',
      popular: true,
      icon: 'Sparkles'
    },
    {
      id: 'tier_3',
      credits: 5000,
      priceUSD: 24.99,
      priceINR: 1799,
      label: 'Studio Power',
      color: 'gold',
      icon: 'Crown'
    }
  ]
};

export function getIsIndia() {
  return false;
}

export function formatPrice(amount: number, currency: 'USD' | 'INR') {
  if (currency === 'INR') {
    return `Rs ${amount}`;
  }
  return `$${amount}`;
}
