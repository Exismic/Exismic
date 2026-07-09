import { NextRequest, NextResponse } from "next/server";
import { PRICING_CONFIG } from "@/config/pricing";
import { getCreditPackagePrice, getProPrice } from "@/lib/payment-pricing";
import { createPayPalOrder, isPayPalSandboxEnabled, type PayPalCheckoutPlan } from "@/lib/paypal";
import { createClient } from "@/utils/supabase/server";

type CreatePayPalOrderBody = {
  plan?: string;
  tierId?: string;
};

function resolvePayPalPurchase(body: CreatePayPalOrderBody) {
  const plan: PayPalCheckoutPlan = body.plan === "credits" ? "credits" : "pro";

  if (plan === "credits") {
    const packagePrice = getCreditPackagePrice(body.tierId, "USD");
    if (!packagePrice) {
      return { error: "Invalid credit package selected." };
    }

    return {
      plan,
      tierId: packagePrice.tier.id,
      amount: packagePrice.amount,
      currency: "USD" as const,
      description: `${packagePrice.tier.credits.toLocaleString()} Exismic permanent credits`,
    };
  }

  const proPrice = getProPrice("USD");
  return {
    plan,
    tierId: null,
    amount: proPrice.amount,
    currency: "USD" as const,
    description: "Exismic Pro monthly membership",
  };
}

export async function POST(req: NextRequest) {
  try {


    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as CreatePayPalOrderBody;
    const resolved = resolvePayPalPurchase(body);

    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const params = new URLSearchParams({
      plan: resolved.plan,
      currency: resolved.currency,
    });

    if (resolved.tierId) params.set("tierId", resolved.tierId);

    const { order, approvalUrl } = await createPayPalOrder({
      context: {
        userId: user.id,
        plan: resolved.plan,
        tierId: resolved.tierId,
        currency: resolved.currency,
        amount: resolved.amount,
      },
      description: resolved.description,
      returnUrl: `${origin}/paypal/return?${params.toString()}`,
      cancelUrl: `${origin}/paypal/cancel?${params.toString()}`,
    });

    return NextResponse.json({
      id: order.id,
      status: order.status,
      approvalUrl,
      checkout: {
        plan: resolved.plan,
        tierId: resolved.tierId,
        currency: resolved.currency,
        amount: resolved.amount,
        display:
          resolved.plan === "credits"
            ? getCreditPackagePrice(resolved.tierId || undefined, "USD")?.display
            : getProPrice("USD").display,
      },
      mode: process.env.PAYPAL_MODE === "live" ? "live" : "sandbox",
      paymentsEnabled: PRICING_CONFIG.PAYMENTS_ENABLED,
    });
  } catch (error) {
    console.error("[PayPal] Order route failed:", error);
    const message = error instanceof Error ? error.message : "Could not start PayPal checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
