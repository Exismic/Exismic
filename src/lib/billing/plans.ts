import { PRICING_CONFIG, isExismic17PromoActive } from "@/config/pricing";

export type BillingPlanId = "free" | "starter" | "creator" | "pro" | "pro_yearly" | "ultimate";
export type BillingMarket = "IN" | "GLOBAL";
export type BillingGateway = "none" | "razorpay" | "paypal";

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  description: string;
  credits: number;
  interval: "free" | "one_time" | "month" | "year";
  prices: {
    IN: { amount: number; currency: "INR"; symbol: string; gateway: BillingGateway };
    GLOBAL: { amount: number; currency: "USD"; symbol: string; gateway: BillingGateway };
  };
  features: string[];
};

export const BILLING_PLANS: Record<BillingPlanId, BillingPlan> = {
  free: {
    id: "free",
    name: "Free",
    description: "Start with essential Exismic access.",
    credits: 50,
    interval: "free",
    prices: {
      IN: { amount: 0, currency: "INR", symbol: "₹", gateway: "none" },
      GLOBAL: { amount: 0, currency: "USD", symbol: "$", gateway: "none" },
    },
    features: ["Starter credits", "Core tools", "Standard processing"],
  },
  starter: {
    id: "starter",
    name: "Starter",
    description: "A small permanent credit pack for casual workflows.",
    credits: 500,
    interval: "one_time",
    prices: {
      IN: { amount: 299, currency: "INR", symbol: "₹", gateway: "razorpay" },
      GLOBAL: { amount: 3.99, currency: "USD", symbol: "$", gateway: "paypal" },
    },
    features: ["500 permanent credits", "Instant account update", "Secure checkout"],
  },
  creator: {
    id: "creator",
    name: "Creator",
    description: "A stronger permanent credit pack for regular creators.",
    credits: 2000,
    interval: "one_time",
    prices: {
      IN: { amount: 699, currency: "INR", symbol: "₹", gateway: "razorpay" },
      GLOBAL: { amount: 8.99, currency: "USD", symbol: "$", gateway: "paypal" },
    },
    features: ["2,000 permanent credits (including 500 bonus)", "For regular creators", "Secure checkout"],
  },
  pro: {
    id: "pro",
    name: "Exismic Pro",
    description: "Monthly Pro access with priority creative capacity.",
    credits: 500,
    interval: "month",
    prices: {
      IN: { amount: 499, currency: "INR", symbol: "₹", gateway: "razorpay" },
      GLOBAL: { amount: 6.99, currency: "USD", symbol: "$", gateway: "paypal" },
    },
    features: ["Pro membership", "500 daily credits", "Priority processing", "Commercial exports"],
  },
  pro_yearly: {
    id: "pro_yearly",
    name: "Exismic Pro Yearly",
    description: "Yearly Pro access with savings compared with 12 standard monthly payments.",
    credits: 500,
    interval: "year",
    prices: {
      IN: { amount: 4499, currency: "INR", symbol: "₹", gateway: "razorpay" },
      GLOBAL: { amount: 59.99, currency: "USD", symbol: "$", gateway: "paypal" },
    },
    features: ["Pro membership (1 Year)", "500 daily credits", "Priority processing", "Commercial exports"],
  },
  ultimate: {
    id: "ultimate",
    name: "Ultimate",
    description: "Large permanent credit reserve for heavy creators.",
    credits: 6000,
    interval: "one_time",
    prices: {
      IN: { amount: 1499, currency: "INR", symbol: "₹", gateway: "razorpay" },
      GLOBAL: { amount: 19.99, currency: "USD", symbol: "$", gateway: "paypal" },
    },
    features: ["6,000 permanent credits (including 1,000 bonus)", "Lowest price per credit", "Downloadable payment receipt"],
  },
};

export function getBillingPlan(planId?: string | null) {
  if (!planId || !Object.hasOwn(BILLING_PLANS, planId)) return null;
  return BILLING_PLANS[planId as BillingPlanId];
}

export function getPlanPrice(planId: BillingPlanId, market: BillingMarket) {
  const plan = BILLING_PLANS[planId];
  const price = plan.prices[market];
  let amount = price.amount;

  if (isExismic17PromoActive()) {
    if (planId === "pro") {
      amount = market === "IN" 
        ? PRICING_CONFIG.V17_LAUNCH_PROMO.PRO_MONTHLY.INR 
        : PRICING_CONFIG.V17_LAUNCH_PROMO.PRO_MONTHLY.USD;
    } else if (planId === "starter" || planId === "creator" || planId === "ultimate") {
      const pack = PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS[planId as keyof typeof PRICING_CONFIG.V17_LAUNCH_PROMO.CREDIT_PACKS];
      if (pack) {
        amount = market === "IN" ? pack.INR : pack.USD;
      }
    }
    // Pro Yearly planId === "pro_yearly": explicitly no discount added
  }

  const isDiscounted = amount < price.amount;

  return {
    plan,
    market,
    currency: price.currency,
    symbol: price.symbol,
    gateway: price.gateway,
    amount,
    amountMinor: Math.round(amount * 100),
    regularAmount: price.amount,
    regularAmountMinor: Math.round(price.amount * 100),
    isDiscounted,
    discountPercent: isDiscounted ? 20 : 0,
    display: price.currency === "INR" ? `₹${amount}` : `$${amount}`,
    regularDisplay: price.currency === "INR" ? `₹${price.amount}` : `$${price.amount}`,
  };
}

export function publicBillingPlans(market: BillingMarket) {
  return Object.values(BILLING_PLANS).map((plan) => {
    const price = getPlanPrice(plan.id, market);
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      credits: plan.credits,
      interval: plan.interval,
      features: plan.features,
      price: {
        amount: price.amount,
        amountMinor: price.amountMinor,
        currency: price.currency,
        symbol: price.symbol,
        gateway: price.gateway,
        display: price.display,
      },
    };
  });
}
