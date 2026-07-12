import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import type { Prisma } from "@prisma/client";
import { PRICING_CONFIG } from "@/config/pricing";
import { getBillingPlan, getPlanPrice, type BillingMarket } from "@/lib/billing/plans";
import { createPayPalOrder, createPayPalSubscription } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { resolveMarket } from "@/lib/geo/getUserCountry";
import { createClient } from "@/utils/supabase/server";
import { hasActiveProAccess } from "@/lib/user-access";

type CreateOrderBody = {
  planId?: string;
  marketOverride?: "IN" | "GLOBAL";
};

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured.");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function getRazorpayProPlanId() {
  return process.env.RAZORPAY_PRO_PLAN_ID_INR || process.env.RAZORPAY_PRO_PLAN_ID;
}

type RazorpaySubscriptionApi = ReturnType<typeof getRazorpayClient> & {
  plans: {
    create(input: unknown): Promise<{ id: string }>;
  };
  subscriptions: {
    create(input: unknown): Promise<{ id: string }>;
  };
};

function shouldUseLocalMockPayments(req: NextRequest) {
  const mode = process.env.EXISMIC_LOCAL_PAYMENTS || process.env.LOCAL_PAYMENT_MODE;
  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(req.nextUrl.hostname);
  return process.env.NODE_ENV !== "production" && isLocalHost && mode === "mock";
}

function mockApprovalUrl(req: NextRequest, orderId: string, planId: string, credits: number) {
  const origin = req.nextUrl.origin;
  const params = new URLSearchParams({
    order: orderId,
    type: planId === "pro" ? "pro" : "credits",
    credits: String(credits),
  });
  return `${origin}/api/billing/mock/complete?${params.toString()}`;
}

function checkoutOrigin(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return req.nextUrl.origin;

  try {
    const url = new URL(configured);
    const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    if (process.env.NODE_ENV === "production" && (local || url.protocol !== "https:")) {
      return req.nextUrl.origin;
    }
    return url.origin;
  } catch {
    return req.nextUrl.origin;
  }
}

function asInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function productionConfigurationError(gateway: "razorpay" | "paypal" | "none", planId: string) {
  if (process.env.NODE_ENV !== "production" || gateway === "none") return null;

  if (gateway === "razorpay") {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return "Razorpay checkout is not configured.";
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) return "Razorpay payment confirmation is not configured.";
    if (planId === "pro" && !getRazorpayProPlanId()) return "Razorpay Pro billing is not configured.";
  }

  if (gateway === "paypal") {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) return "PayPal checkout is not configured.";
    if (!process.env.PAYPAL_WEBHOOK_ID) return "PayPal payment confirmation is not configured.";
    if (planId === "pro" && !(process.env.PAYPAL_PRO_PLAN_ID_USD || process.env.PAYPAL_PRO_PLAN_ID)) {
      return "PayPal Pro billing is not configured.";
    }
  }

  return null;
}
async function createRazorpayProSubscription(
  razorpay: ReturnType<typeof getRazorpayClient>,
  paymentOrderId: string,
  userId: string,
  price: ReturnType<typeof getPlanPrice>,
) {
  let planId = getRazorpayProPlanId();
  const subscriptionApi = razorpay as RazorpaySubscriptionApi;

  if (!planId) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Razorpay Pro subscription plan is not configured.");
    }

    const plan = await subscriptionApi.plans.create({
      period: "monthly",
      interval: 1,
      item: {
        name: "Exismic Pro Monthly",
        description: "Monthly Exismic Pro membership",
        amount: price.amountMinor,
        currency: price.currency,
      },
      notes: {
        source: "exismic_dynamic_plan",
      },
    });
    planId = String(plan.id);
  }

  return subscriptionApi.subscriptions.create({
    plan_id: planId,
    // Razorpay requires a bounded cycle count. Thirty years behaves like an
    // ongoing monthly subscription while still allowing cancellation anytime.
    total_count: 360,
    quantity: 1,
    customer_notify: 1,
    notes: {
      billingOrderId: paymentOrderId,
      userId,
      planId: "pro",
      market: "IN",
    },
  });
}
export async function POST(req: NextRequest) {
  try {
    if (!PRICING_CONFIG.PAYMENTS_ENABLED) {
      return NextResponse.json({ error: PRICING_CONFIG.PAYMENT_UNAVAILABLE_MESSAGE }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as CreateOrderBody;
    const plan = getBillingPlan(body.planId);
    if (!plan) return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true, subscriptionStatus: true, planExpiresAt: true },
    });
    if (plan.id === "pro" && dbUser && hasActiveProAccess(dbUser)) {
      return NextResponse.json({ error: "Your Pro membership is already active." }, { status: 409 });
    }

    const recentOrderCount = await prisma.paymentOrder.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    });
    if (recentOrderCount >= 5) {
      return NextResponse.json({ error: "Too many checkout attempts. Please wait a minute and try again." }, { status: 429 });
    }

    const allowMarketOverride = process.env.NODE_ENV !== "production";
    const marketInfo = resolveMarket(req, allowMarketOverride ? body.marketOverride : null);
    const market = marketInfo.market as BillingMarket;
    const price = getPlanPrice(plan.id, market);
    const localMockPayments = shouldUseLocalMockPayments(req);
    const effectiveGateway = localMockPayments ? "mock" : price.gateway;
    const configurationError = localMockPayments ? null : productionConfigurationError(price.gateway, plan.id);
    if (configurationError) {
      console.error(`[Billing] ${configurationError}`);
      return NextResponse.json({ error: "Checkout is temporarily unavailable. Please try again later." }, { status: 503 });
    }

    if (price.amountMinor <= 0 || price.gateway === "none") {
      return NextResponse.json({ success: true, free: true, plan: publicPlan(plan.id, market) });
    }

    const paymentOrder = await prisma.paymentOrder.create({
      data: {
        userId: user.id,
        planId: plan.id,
        market,
        currency: price.currency,
        amount: price.amountMinor,
        gateway: effectiveGateway,
        credits: plan.credits,
        metadata: {
          countryCode: marketInfo.countryCode,
          displayAmount: price.display,
        },
      },
    });

    if (localMockPayments) {
      const providerOrderId = `mock_${paymentOrder.id}`;
      await prisma.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: {
          providerOrderId,
          metadata: {
            ...(paymentOrder.metadata as object),
            localMock: true,
            originalGateway: price.gateway,
            providerOrderId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        gateway: "mock",
        orderId: paymentOrder.id,
        providerOrderId,
        approvalUrl: mockApprovalUrl(req, paymentOrder.id, plan.id, plan.credits),
        amount: price.amountMinor,
        currency: price.currency,
        plan: publicPlan(plan.id, market),
      });
    }
    if (price.gateway === "razorpay") {
      const razorpay = getRazorpayClient();

      if (plan.id === "pro") {
        const razorpaySubscription = await createRazorpayProSubscription(razorpay, paymentOrder.id, user.id, price);

        await prisma.paymentOrder.update({
          where: { id: paymentOrder.id },
          data: {
            providerOrderId: razorpaySubscription.id,
            metadata: asInputJson({ ...(paymentOrder.metadata as object), razorpaySubscription }),
          },
        });

        return NextResponse.json({
          success: true,
          gateway: "razorpay",
          orderId: paymentOrder.id,
          providerOrderId: razorpaySubscription.id,
          razorpaySubscriptionId: razorpaySubscription.id,
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
          amount: price.amountMinor,
          currency: price.currency,
          plan: publicPlan(plan.id, market),
        });
      }

      const razorpayOrder = await razorpay.orders.create({
        amount: price.amountMinor,
        currency: price.currency,
        receipt: `exm_${paymentOrder.id}`.slice(0, 40),
        notes: {
          billingOrderId: paymentOrder.id,
          userId: user.id,
          planId: plan.id,
          market,
        },
      });

      await prisma.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: { providerOrderId: razorpayOrder.id, metadata: asInputJson({ ...(paymentOrder.metadata as object), razorpayOrder }) },
      });

      return NextResponse.json({
        success: true,
        gateway: "razorpay",
        orderId: paymentOrder.id,
        providerOrderId: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        amount: price.amountMinor,
        currency: price.currency,
        plan: publicPlan(plan.id, market),
      });
    }
    const origin = checkoutOrigin(req);
    const successParams = new URLSearchParams({
      gateway: "paypal",
      order: paymentOrder.id,
      type: plan.id === "pro" ? "pro" : "credits",
      credits: String(plan.credits),
    });
    const cancelParams = new URLSearchParams({
      gateway: "paypal",
      order: paymentOrder.id,
    });

    if (plan.id === "pro") {
      const { subscription, approvalUrl } = await createPayPalSubscription({
        context: {
          userId: user.id,
          plan: "pro",
          tierId: plan.id,
          currency: price.currency,
          amount: price.amount,
        },
        returnUrl: `${origin}/billing/success?${successParams.toString()}`,
        cancelUrl: `${origin}/billing/cancel?${cancelParams.toString()}`,
      });

      await prisma.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: {
          providerOrderId: subscription.id,
          metadata: { ...(paymentOrder.metadata as object), paypalSubscription: subscription },
        },
      });

      return NextResponse.json({
        success: true,
        gateway: "paypal",
        orderId: paymentOrder.id,
        providerOrderId: subscription.id,
        paypalSubscriptionId: subscription.id,
        approvalUrl,
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID,
        amount: price.amountMinor,
        currency: price.currency,
        plan: publicPlan(plan.id, market),
      });
    }

    const { order, approvalUrl } = await createPayPalOrder({
      context: {
        userId: user.id,
        plan: "credits",
        tierId: plan.id,
        currency: price.currency,
        amount: price.amount,
      },
      description: `${plan.name} - Exismic`,
      returnUrl: `${origin}/billing/success?${successParams.toString()}`,
      cancelUrl: `${origin}/billing/cancel?${cancelParams.toString()}`,
    });

    await prisma.paymentOrder.update({
      where: { id: paymentOrder.id },
      data: { providerOrderId: order.id, metadata: { ...(paymentOrder.metadata as object), paypalOrder: order } },
    });

    return NextResponse.json({
      success: true,
      gateway: "paypal",
      orderId: paymentOrder.id,
      providerOrderId: order.id,
      paypalOrderId: order.id,
      approvalUrl,
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID,
      amount: price.amountMinor,
      currency: price.currency,
      plan: publicPlan(plan.id, market),
    });
  } catch (error) {
    const message = getBillingErrorMessage(error);
    console.error("[Billing] Create order failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


function getBillingErrorMessage(error: unknown) {
  const maybe = error as { message?: unknown; error?: { code?: unknown; description?: unknown }; statusCode?: unknown };
  const nestedDescription = typeof maybe?.error?.description === "string" ? maybe.error.description : "";
  const nestedCode = typeof maybe?.error?.code === "string" ? maybe.error.code : "";
  const message = typeof maybe?.message === "string" ? maybe.message : nestedDescription;

  if (nestedCode === "BAD_REQUEST_ERROR" && /auth/i.test(nestedDescription)) {
    return "Payment gateway authentication failed. Please try again shortly.";
  }

  if (/auth/i.test(message) && /failed/i.test(message)) {
    return "Payment gateway authentication failed. Please try again shortly.";
  }

  if (/Razorpay is not configured/i.test(message)) {
    return "Razorpay checkout is not configured yet.";
  }

  if (/PayPal/i.test(message) && /configured/i.test(message)) {
    return "PayPal checkout is not configured yet.";
  }

  if (process.env.NODE_ENV === "production") {
    return "Could not start checkout. Please try again.";
  }
  return message || "Could not create payment order.";
}
function publicPlan(planId: string, market: BillingMarket) {
  const plan = getBillingPlan(planId)!;
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
}





