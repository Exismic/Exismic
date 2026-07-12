import { CheckoutCurrency } from "@/lib/payment-pricing";

const PAYPAL_SANDBOX_API = "https://api-m.sandbox.paypal.com";
const PAYPAL_LIVE_API = "https://api-m.paypal.com";

export type PayPalCheckoutPlan = "pro" | "credits";

export type PayPalOrderContext = {
  userId: string;
  plan: PayPalCheckoutPlan;
  tierId?: string | null;
  currency: CheckoutCurrency;
  amount: number;
};

type PayPalLink = {
  href: string;
  rel: string;
  method?: string;
};

export type PayPalOrderResponse = {
  id: string;
  status: string;
  links?: PayPalLink[];
};

export type PayPalCaptureResponse = {
  id: string;
  status: string;
  purchase_units?: Array<{
    custom_id?: string;
    reference_id?: string;
    amount?: {
      currency_code?: string;
      value?: string;
    };
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: {
          currency_code?: string;
          value?: string;
        };
      }>;
    };
  }>;
};

export function isPayPalSandboxEnabled() {
  return process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_ENABLED === "true" || process.env.PAYPAL_SANDBOX_ENABLED === "true";
}

export function getPayPalMode() {
  return process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
}

export function getPayPalApiBase() {
  return getPayPalMode() === "live" ? PAYPAL_LIVE_API : PAYPAL_SANDBOX_API;
}

export function getPayPalPublicState() {
  return {
    enabled: isPayPalSandboxEnabled(),
    mode: getPayPalMode(),
  };
}

export function encodePayPalCustomId(context: PayPalOrderContext) {
  return [
    "exismic",
    context.userId,
    context.plan,
    context.tierId || "none",
    context.currency,
    context.amount.toFixed(2),
  ].join("|");
}

export function parsePayPalCustomId(customId?: string) {
  if (!customId) return null;

  const [prefix, userId, plan, tierId, currency, amount] = customId.split("|");
  if (prefix !== "exismic" || !userId || (plan !== "pro" && plan !== "credits")) return null;
  if (currency !== "USD" && currency !== "INR") return null;

  return {
    userId,
    plan,
    tierId: tierId === "none" ? null : tierId,
    currency,
    amount: Number(amount),
  };
}

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal is not configured.");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.access_token) {
    console.error("[PayPal] Could not fetch access token", data);
    throw new Error("PayPal credentials were rejected. Check the configured mode and API app credentials.");
  }

  return String(data.access_token);
}

export async function createPayPalOrder({
  context,
  description,
  returnUrl,
  cancelUrl,
}: {
  context: PayPalOrderContext;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const accessToken = await getPayPalAccessToken();
  const orderBody = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: context.plan === "credits" ? context.tierId || "credits" : "pro",
        custom_id: encodePayPalCustomId(context),
        description,
        amount: {
          currency_code: context.currency,
          value: context.amount.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: "Exismic",
      landing_page: "LOGIN",
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(orderBody),
    cache: "no-store",
  });

  const order = (await response.json().catch(() => null)) as PayPalOrderResponse | null;
  if (!response.ok || !order?.id) {
    console.error("[PayPal] Order creation failed", order);
    throw new Error("Could not create PayPal order.");
  }

  const approvalUrl = order.links?.find((link) => link.rel === "approve")?.href;
  if (!approvalUrl) {
    throw new Error("PayPal did not return an approval link.");
  }

  return { order, approvalUrl };
}


export type PayPalSubscriptionResponse = {
  id: string;
  status: string;
  custom_id?: string;
  plan_id?: string;
  billing_info?: {
    next_billing_time?: string;
    last_payment?: {
      amount?: {
        currency_code?: string;
        value?: string;
      };
      time?: string;
    };
  };
  links?: PayPalLink[];
};

async function createPayPalProduct(accessToken: string) {
  const response = await fetch(`${getPayPalApiBase()}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: "Exismic Pro",
      description: "Monthly Exismic Pro membership",
      type: "SERVICE",
      category: "SOFTWARE",
    }),
    cache: "no-store",
  });

  const product = await response.json().catch(() => null) as { id?: string } | null;
  if (!response.ok || !product?.id) {
    console.error("[PayPal] Product creation failed", product);
    throw new Error("Could not prepare PayPal subscription product.");
  }

  return product.id;
}

async function createPayPalPlan(accessToken: string, amount: number, currency: CheckoutCurrency) {
  const productId = await createPayPalProduct(accessToken);
  const response = await fetch(`${getPayPalApiBase()}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      product_id: productId,
      name: `Exismic Pro ${currency} Monthly`,
      description: "Monthly Exismic Pro membership",
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: amount.toFixed(2),
              currency_code: currency,
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
    cache: "no-store",
  });

  const plan = await response.json().catch(() => null) as { id?: string } | null;
  if (!response.ok || !plan?.id) {
    console.error("[PayPal] Plan creation failed", plan);
    throw new Error("Could not prepare PayPal subscription plan.");
  }

  return plan.id;
}

export async function resolvePayPalProPlanId(amount: number, currency: CheckoutCurrency) {
  const configured = currency === "USD"
    ? process.env.PAYPAL_PRO_PLAN_ID_USD || process.env.PAYPAL_PRO_PLAN_ID
    : process.env.PAYPAL_PRO_PLAN_ID_INR || process.env.PAYPAL_PRO_PLAN_ID;

  if (configured) return configured;

  if (getPayPalMode() === "live") {
    throw new Error("PayPal Pro subscription plan is not configured.");
  }

  const accessToken = await getPayPalAccessToken();
  return createPayPalPlan(accessToken, amount, currency);
}

export async function createPayPalSubscription({
  context,
  returnUrl,
  cancelUrl,
}: {
  context: PayPalOrderContext;
  returnUrl: string;
  cancelUrl: string;
}) {
  const accessToken = await getPayPalAccessToken();
  const planId = await resolvePayPalProPlanId(context.amount, context.currency);

  const response = await fetch(`${getPayPalApiBase()}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: encodePayPalCustomId(context),
      quantity: "1",
      application_context: {
        brand_name: "Exismic",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
    cache: "no-store",
  });

  const subscription = await response.json().catch(() => null) as PayPalSubscriptionResponse | null;
  if (!response.ok || !subscription?.id) {
    console.error("[PayPal] Subscription creation failed", subscription);
    throw new Error("Could not create PayPal subscription.");
  }

  const approvalUrl = subscription.links?.find((link) => link.rel === "approve")?.href;
  if (!approvalUrl) {
    throw new Error("PayPal did not return a subscription approval link.");
  }

  return { subscription, approvalUrl };
}

export async function getPayPalSubscription(subscriptionId: string) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalApiBase()}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const subscription = await response.json().catch(() => null) as PayPalSubscriptionResponse | null;
  if (!response.ok || !subscription?.id) {
    console.error("[PayPal] Subscription lookup failed", subscription);
    throw new Error("Could not verify PayPal subscription.");
  }

  return subscription;
}

export async function cancelPayPalSubscription(subscriptionId: string, reason = "Cancelled from Exismic account settings") {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalApiBase()}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
    cache: "no-store",
  });

  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => null);
    console.error("[PayPal] Subscription cancel failed", data);
    throw new Error("Could not cancel PayPal subscription.");
  }

  return true;
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    cache: "no-store",
  });

  const capture = (await response.json().catch(() => null)) as PayPalCaptureResponse | null;
  if (!response.ok || !capture?.id) {
    console.error("[PayPal] Capture failed", capture);
    throw new Error("Could not capture PayPal order.");
  }

  return capture;
}

export function getPayPalCapture(capture: PayPalCaptureResponse) {
  const purchaseUnit = capture.purchase_units?.[0];
  const paymentCapture = purchaseUnit?.payments?.captures?.[0];

  return {
    purchaseUnit,
    paymentCapture,
    captureId: paymentCapture?.id || capture.id,
    status: paymentCapture?.status || capture.status,
    currency: paymentCapture?.amount?.currency_code || purchaseUnit?.amount?.currency_code,
    amount: Number(paymentCapture?.amount?.value || purchaseUnit?.amount?.value || 0),
  };
}
