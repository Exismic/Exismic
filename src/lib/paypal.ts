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

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal sandbox is not configured.");
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
    throw new Error("PayPal sandbox credentials were rejected. Check that the Client ID and Secret are from the same Sandbox app.");
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
