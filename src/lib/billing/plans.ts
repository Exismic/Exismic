export type BillingPlanId = "free" | "starter" | "creator" | "pro" | "ultimate";
export type BillingMarket = "IN" | "GLOBAL";
export type BillingGateway = "none" | "razorpay" | "paypal";

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  description: string;
  credits: number;
  interval: "free" | "one_time" | "month";
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
      IN: { amount: 0, currency: "INR", symbol: "Rs", gateway: "none" },
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
      IN: { amount: 299, currency: "INR", symbol: "Rs", gateway: "razorpay" },
      GLOBAL: { amount: 3.99, currency: "USD", symbol: "$", gateway: "paypal" },
    },
    features: ["500 permanent credits", "Instant account update", "Secure checkout"],
  },
  creator: {
    id: "creator",
    name: "Creator",
    description: "A stronger permanent credit pack for regular creators.",
    credits: 1500,
    interval: "one_time",
    prices: {
      IN: { amount: 699, currency: "INR", symbol: "Rs", gateway: "razorpay" },
      GLOBAL: { amount: 8.99, currency: "USD", symbol: "$", gateway: "paypal" },
    },
    features: ["1,500 permanent credits", "Best everyday value", "Secure checkout"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Monthly Pro access with priority creative capacity.",
    credits: 500,
    interval: "month",
    prices: {
      IN: { amount: 499, currency: "INR", symbol: "Rs", gateway: "razorpay" },
      GLOBAL: { amount: 6.99, currency: "USD", symbol: "$", gateway: "paypal" },
    },
    features: ["Pro membership", "500 daily credits", "Priority processing", "Commercial exports"],
  },
  ultimate: {
    id: "ultimate",
    name: "Ultimate",
    description: "Large permanent credit reserve for heavy creators.",
    credits: 5000,
    interval: "one_time",
    prices: {
      IN: { amount: 1999, currency: "INR", symbol: "Rs", gateway: "razorpay" },
      GLOBAL: { amount: 24.99, currency: "USD", symbol: "$", gateway: "paypal" },
    },
    features: ["5,000 permanent credits", "Best for bulk jobs", "Support tracking invoice"],
  },
};

export function getBillingPlan(planId?: string | null) {
  if (!planId || !(planId in BILLING_PLANS)) return null;
  return BILLING_PLANS[planId as BillingPlanId];
}

export function getPlanPrice(planId: BillingPlanId, market: BillingMarket) {
  const plan = BILLING_PLANS[planId];
  const price = plan.prices[market];
  return {
    plan,
    market,
    ...price,
    amountMinor: Math.round(price.amount * 100),
    display: price.currency === "INR" ? `Rs ${price.amount}` : `$${price.amount}`,
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
