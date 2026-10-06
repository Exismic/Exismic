import { publicJson } from "@/lib/public-json";
import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import type { Prisma } from "@prisma/client";
import { PRICING_CONFIG, isExismic17PromoActive } from "@/config/pricing";
import { getBillingPlan, getPlanPrice, type BillingMarket } from "@/lib/billing/plans";
import { createPayPalOrder, createPayPalSubscription } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { resolveMarket } from "@/lib/geo/getUserCountry";
import { createClient } from "@/utils/supabase/server";
import { hasActiveProAccess } from "@/lib/user-access";
import { checkUserLaunchDiscountEligibility } from "@/lib/billing/launch-discount";

type CreateOrderBody = {
  planId?: string;
  marketOverride?: "IN" | "GLOBAL";
  isGift?: boolean;
  recipientName?: string;
  recipientEmail?: string;
  recipientMessage?: string;
  couponCode?: string;
  paymentMethod?: "card" | "paypal" | "apple_pay" | "google_pay";
};

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured.");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function getRazorpayProPlanId(isYearly = false) {
  if (isYearly) {
    return process.env.RAZORPAY_PRO_YEARLY_PLAN_ID_INR || process.env.RAZORPAY_PRO_YEARLY_PLAN_ID;
  }
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
    type: (planId === "pro" || planId === "pro_yearly") ? "pro" : "credits",
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

function productionConfigurationError(gateway: "razorpay" | "paypal" | "none", planId: string, isGift = false) {
  if (process.env.NODE_ENV !== "production" || gateway === "none") return null;

  if (gateway === "razorpay") {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return "Razorpay keys (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not configured in environment variables.";
  }

  if (gateway === "paypal") {
    const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_LIVE_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET || process.env.PAYPAL_LIVE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return "PayPal keys (PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET) are not configured in environment variables.";
    }
  }

  return null;
}

const razorpayPlanCache = new Map<string, string>();

async function createRazorpayProSubscription(
  razorpay: ReturnType<typeof getRazorpayClient>,
  paymentOrderId: string,
  userId: string,
  price: ReturnType<typeof getPlanPrice>,
  isYearly = false,
  regularPriceMinor?: number,
) {
  const subscriptionApi = razorpay as RazorpaySubscriptionApi;
  const isIntroductoryDiscount = Boolean(regularPriceMinor && regularPriceMinor > price.amountMinor);

  if (isIntroductoryDiscount) {
    // 1. Ensure standard regular plan exists for migration after month 1
    let standardPlanId = getRazorpayProPlanId(isYearly);
    const standardCacheKey = `${price.currency}:${isYearly ? "yearly" : "monthly"}:${regularPriceMinor}`;
    if (!standardPlanId && razorpayPlanCache.has(standardCacheKey)) {
      standardPlanId = razorpayPlanCache.get(standardCacheKey);
    }
    if (!standardPlanId) {
      try {
        const standardPlan = await subscriptionApi.plans.create({
          period: isYearly ? "yearly" : "monthly",
          interval: 1,
          item: {
            name: `Exismic Pro ${isYearly ? "Yearly" : "Monthly"} (Standard)`,
            description: `Standard ${isYearly ? "Yearly" : "Monthly"} Exismic Pro membership`,
            amount: regularPriceMinor!,
            currency: price.currency,
          },
          notes: { source: "exismic_standard_pro_plan" },
        });
        standardPlanId = String(standardPlan.id);
        razorpayPlanCache.set(standardCacheKey, standardPlanId);
      } catch (planErr) {
        console.error("[Razorpay Standard Plan Creation Failed]", planErr);
        throw new Error("The standard renewal plan could not be prepared. Please try again later.");
      }
    }

    // 2. Ensure promotional plan exists at the discounted price (e.g. ₹299 / 29900 paise)
    const promoCacheKey = `promo:${price.currency}:${isYearly ? "yearly" : "monthly"}:${price.amountMinor}`;
    let promoPlanId = razorpayPlanCache.get(promoCacheKey);
    if (!promoPlanId) {
      try {
        const promoPlan = await subscriptionApi.plans.create({
          period: isYearly ? "yearly" : "monthly",
          interval: 1,
          item: {
            name: `Exismic Pro ${isYearly ? "Yearly" : "Monthly"} (Launch Special)`,
            description: `First month Exismic Pro membership at ${price.display} launch discount`,
            amount: price.amountMinor,
            currency: price.currency,
          },
          notes: {
            source: "exismic_v17_launch_plan",
          },
        });
        promoPlanId = String(promoPlan.id);
        razorpayPlanCache.set(promoCacheKey, promoPlanId);
      } catch (planErr) {
        console.error("[Razorpay Promo Plan Creation Failed]", planErr);
        throw new Error(`Razorpay Pro launch special subscription plan could not be created.`);
      }
    }

    // 3. Create the subscription on the promo plan with ZERO negative addons
    const subscriptionPayload: any = {
      plan_id: promoPlanId,
      total_count: isYearly ? 30 : 360,
      quantity: 1,
      customer_notify: 1,
      notes: {
        billingOrderId: paymentOrderId,
        userId,
        planId: isYearly ? "pro_yearly" : "pro",
        market: "IN",
        isLaunchDiscount: "true",
        standardPlanId: standardPlanId || "",
      },
    };

    return subscriptionApi.subscriptions.create(subscriptionPayload);
  }

  // Standard non-discount flow
  let planId = getRazorpayProPlanId(isYearly);
  const cacheKey = `${price.currency}:${isYearly ? "yearly" : "monthly"}:${price.amountMinor}`;
  if (!planId && razorpayPlanCache.has(cacheKey)) {
    planId = razorpayPlanCache.get(cacheKey);
  }

  if (!planId) {
    try {
      const plan = await subscriptionApi.plans.create({
        period: isYearly ? "yearly" : "monthly",
        interval: 1,
        item: {
          name: `Exismic Pro ${isYearly ? "Yearly" : "Monthly"}`,
          description: `${isYearly ? "Yearly" : "Monthly"} Exismic Pro membership`,
          amount: price.amountMinor,
          currency: price.currency,
        },
        notes: {
          source: "exismic_dynamic_plan",
        },
      });
      planId = String(plan.id);
      razorpayPlanCache.set(cacheKey, planId);
    } catch (planErr) {
      console.error("[Razorpay Plan Creation Failed]", planErr);
      throw new Error(`Razorpay Pro ${isYearly ? "yearly" : "monthly"} subscription plan could not be created.`);
    }
  }

  const subscriptionPayload: any = {
    plan_id: planId,
    total_count: isYearly ? 30 : 360,
    quantity: 1,
    customer_notify: 1,
    notes: {
      billingOrderId: paymentOrderId,
      userId,
      planId: isYearly ? "pro_yearly" : "pro",
      market: "IN",
      isLaunchDiscount: "false",
    },
  };

  return subscriptionApi.subscriptions.create(subscriptionPayload);
}
export async function POST(req: NextRequest) {
  try {
    if (!PRICING_CONFIG.PAYMENTS_ENABLED) {
      return publicJson({ error: PRICING_CONFIG.PAYMENT_UNAVAILABLE_MESSAGE }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return publicJson({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as CreateOrderBody;
    const plan = getBillingPlan(body.planId);
    if (!plan) return publicJson({ error: "Invalid plan selected." }, { status: 400 });

    const isGift = Boolean(body.isGift);
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true, subscriptionStatus: true, planExpiresAt: true, email: true, name: true },
    });
    const isProSubscriptionPlan = plan.id === "pro" || plan.id === "pro_yearly";
    if (isProSubscriptionPlan && !isGift && dbUser && hasActiveProAccess(dbUser)) {
      return publicJson({ error: "Your Pro membership is already active." }, { status: 409 });
    }

    const recentOrderCount = await prisma.paymentOrder.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    });
    if (recentOrderCount >= 5) {
      return publicJson({ error: "Too many checkout attempts. Please wait a minute and try again." }, { status: 429 });
    }

    const allowMarketOverride = process.env.NODE_ENV !== "production";
    const marketInfo = resolveMarket(req, allowMarketOverride ? body.marketOverride : null);
    const market = marketInfo.market as BillingMarket;
    const basePrice = getPlanPrice(plan.id, market);

    // Check for active retention discount to apply 30% price reduction on Pro subscription (only for personal, not gift)
    let finalAmountMinor = basePrice.amountMinor;
    let appliedRetentionDiscount = false;
    let appliedCouponCode: string | null = null;
    let appliedCouponDiscountMinor = 0;
    let isLaunchDiscount = false;

    // Check for Exismic 1.7 Launch Special (20% OFF on Pro Monthly and Credit Packs; NO discount on Yearly Pro)
    if (isExismic17PromoActive()) {
      const cleanCode = body.couponCode?.trim().toUpperCase();
      const isPromoCode = cleanCode === PRICING_CONFIG.V17_LAUNCH_PROMO.CODE || cleanCode === "EXISMIC17" || cleanCode === "V16LAUNCH";

      // Block all custom coupons during the 1-week launch sale
      if (cleanCode && !isPromoCode) {
        return publicJson({
          error: "Custom coupons cannot be used during the Exismic 1.7 Launch Sale (official 20% discount is already active from us).",
        }, { status: 400 });
      }

      if (plan.id === "pro" || plan.id === "starter" || plan.id === "creator" || plan.id === "ultimate") {
        appliedCouponCode = PRICING_CONFIG.V17_LAUNCH_PROMO.CODE;
        isLaunchDiscount = true;
        finalAmountMinor = basePrice.amountMinor;
        appliedCouponDiscountMinor = Math.max(0, basePrice.regularAmountMinor - basePrice.amountMinor);
      }
    }

    if (isProSubscriptionPlan && !isGift && !isLaunchDiscount) {
      const activeRetentionOrder = await prisma.paymentOrder.findFirst({
        where: {
          userId: user.id,
          gateway: "retention_discount",
          status: "applied",
        },
      });

      if (activeRetentionOrder) {
        finalAmountMinor = Math.round(basePrice.amountMinor * 0.7);
        appliedRetentionDiscount = true;
      }
    }

    // Strict Backend Voucher Validation & Application (for non-launch discounts)
    if (!isLaunchDiscount && body.couponCode?.trim()) {
      const cleanCode = body.couponCode.trim().toUpperCase();

      const promo = await prisma.promoCode.findUnique({
        where: { code: cleanCode },
      });

      if (!promo) {
        return publicJson({ error: "Invalid or unrecognized coupon code." }, { status: 404 });
      }

      if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
        return publicJson({ error: "This coupon code has expired." }, { status: 400 });
      }

      if (promo.redemptionCount >= promo.maxRedemptions) {
        return publicJson({ error: "This coupon code has already been claimed and cannot be used again." }, { status: 400 });
      }

      const alreadyClaimed = await prisma.promoRedemption.findUnique({
        where: {
          promoId_userId: {
            promoId: promo.id,
            userId: user.id,
          },
        },
      });

      if (alreadyClaimed) {
        return publicJson({ error: "You have already redeemed this coupon code." }, { status: 400 });
      }

      // Anti-exploitation: 5-Day Cooldown on Discount Codes
      const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
      const recentRedemption = await prisma.promoRedemption.findFirst({
        where: {
          userId: user.id,
          redeemedAt: { gte: new Date(Date.now() - FIVE_DAYS_MS) },
          promo: {
            OR: [
              { code: { startsWith: "OFF" } },
              { code: { startsWith: "SAVE" } },
              { code: { startsWith: "PRO20" } },
            ],
          },
        },
      });

      if (recentRedemption) {
        return publicJson({
          error: "Anti-exploit cooldown: Discount vouchers can only be used once every 5 days.",
        }, { status: 400 });
      }

      const isFixedDiscount = cleanCode.startsWith("OFF") || cleanCode.startsWith("SAVE");
      const isPro20 = cleanCode.startsWith("PRO20");

      if (!isFixedDiscount && !isPro20) {
        return publicJson({
          error: "This code is a free gift code. Please redeem it in Account -> Redeem Codes.",
        }, { status: 400 });
      }

      if (isFixedDiscount) {
        if (market === "IN" && basePrice.amountMinor < 24900) {
          return publicJson({
            error: "This voucher requires a minimum purchase of ₹249.",
          }, { status: 400 });
        }
        if (market !== "IN" && basePrice.amount < 3.0) {
          return publicJson({
            error: "This voucher requires a minimum purchase of $3.00.",
          }, { status: 400 });
        }

        const discountMinor = market === "IN" ? 10000 : 150;
        appliedCouponDiscountMinor = Math.min(finalAmountMinor, discountMinor);
        finalAmountMinor = Math.max(0, finalAmountMinor - appliedCouponDiscountMinor);
        appliedCouponCode = cleanCode;
      } else if (isPro20) {
        if (plan.id === "pro_yearly") {
          return publicJson({
            error: "This 20% voucher is valid on Monthly Pro only. Yearly Pro already includes a built-in annual discount.",
          }, { status: 400 });
        }
        if (plan.id !== "pro") {
          return publicJson({
            error: "This voucher is exclusively valid for Monthly Exismic Pro memberships and cannot be applied to Credit Packs.",
          }, { status: 400 });
        }

        appliedCouponDiscountMinor = Math.round(basePrice.amountMinor * 0.2);
        finalAmountMinor = Math.max(0, finalAmountMinor - appliedCouponDiscountMinor);
        appliedCouponCode = cleanCode;
      }
    }

    const price = {
      ...basePrice,
      amountMinor: finalAmountMinor,
      amount: finalAmountMinor / 100,
    };

    const localMockPayments = shouldUseLocalMockPayments(req);
    const effectiveGateway = localMockPayments ? "mock" : price.gateway;
    const configurationError = localMockPayments ? null : productionConfigurationError(price.gateway, plan.id, isGift);
    if (configurationError) {
      console.error(`[Billing Configuration Error] ${configurationError}`);
      return publicJson({
        error: "Checkout is temporarily unavailable. Please try again later.",
        details: process.env.NODE_ENV !== "production" ? configurationError : undefined
      }, { status: 503 });
    }

    if (price.amountMinor <= 0 || price.gateway === "none") {
      return publicJson({ success: true, free: true, plan: publicPlan(plan.id, market) });
    }

    const giftType = plan.id === "pro_yearly"
      ? "pro_yearly"
      : plan.id === "pro"
      ? "pro_monthly"
      : "credits";

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
          receiptSnapshot: {
            buyerName: dbUser?.name || user.user_metadata?.full_name || "Exismic customer",
            buyerEmail: dbUser?.email || user.email || "",
            itemName: isProSubscriptionPlan ? `Exismic Pro (${plan.id === "pro_yearly" ? "Annual" : "Monthly"})${isGift ? " gift pass" : ""}` : `${plan.credits.toLocaleString()} permanent credits${isGift ? " gift voucher" : ""}`,
            credits: plan.credits,
            regularAmountMinor: basePrice.regularAmountMinor,
            recurring: isProSubscriptionPlan && !isGift,
            billingInterval: isProSubscriptionPlan ? plan.id === "pro_yearly" ? "year" : "month" : "one_time",
          },
          appliedRetentionDiscount,
          appliedCouponCode,
          appliedCouponDiscountMinor,
          isLaunchDiscount,
          isGift,
          giftType,
          giftCredits: plan.credits,
          buyerEmail: dbUser?.email || user.email,
          recipientName: body.recipientName?.trim() || null,
          recipientEmail: body.recipientEmail?.trim()?.toLowerCase() || null,
          recipientMessage: body.recipientMessage?.trim() || null,
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

      return publicJson({
        success: true,
        gateway: "mock",
        orderId: paymentOrder.id,
        providerOrderId,
        approvalUrl: mockApprovalUrl(req, paymentOrder.id, plan.id, plan.credits),
        amount: price.amountMinor,
        currency: price.currency,
        plan: publicPlan(plan.id, market),
        isGift,
      });
    }
    if (price.gateway === "razorpay") {
      const razorpay = getRazorpayClient();

      if (isProSubscriptionPlan && !isGift) {
        const razorpaySubscription = await createRazorpayProSubscription(
          razorpay,
          paymentOrder.id,
          user.id,
          price,
          plan.id === "pro_yearly",
          isLaunchDiscount || appliedRetentionDiscount ? basePrice.regularAmountMinor : undefined,
        );

        await prisma.paymentOrder.update({
          where: { id: paymentOrder.id },
          data: {
            providerOrderId: razorpaySubscription.id,
            metadata: asInputJson({
              ...(paymentOrder.metadata as object),
              razorpaySubscription,
              standardPlanId: (razorpaySubscription as any)?.notes?.standardPlanId || null,
            }),
          },
        });

        return publicJson({
          success: true,
          gateway: "razorpay",
          orderId: paymentOrder.id,
          providerOrderId: razorpaySubscription.id,
          razorpaySubscriptionId: razorpaySubscription.id,
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
          amount: price.amountMinor,
          currency: price.currency,
          plan: publicPlan(plan.id, market),
          isGift,
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
          isGift: isGift ? "true" : "false",
        },
      });

      await prisma.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: { providerOrderId: razorpayOrder.id, metadata: asInputJson({ ...(paymentOrder.metadata as object), razorpayOrder }) },
      });

      return publicJson({
        success: true,
        gateway: "razorpay",
        orderId: paymentOrder.id,
        providerOrderId: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        amount: price.amountMinor,
        currency: price.currency,
        plan: publicPlan(plan.id, market),
        isGift,
      });
    }
    const origin = checkoutOrigin(req);
    const successParams = new URLSearchParams({
      gateway: "paypal",
      order: paymentOrder.id,
      type: isProSubscriptionPlan && !isGift ? "pro" : "credits",
      plan: plan.id,
      credits: String(plan.credits),
    });
    const cancelParams = new URLSearchParams({
      gateway: "paypal",
      order: paymentOrder.id,
    });

    if (isProSubscriptionPlan && !isGift) {
      const { subscription, approvalUrl } = await createPayPalSubscription({
        context: {
          userId: user.id,
          plan: "pro",
          tierId: plan.id,
          currency: price.currency,
          amount: price.amount,
          regularAmount: isLaunchDiscount || appliedRetentionDiscount ? basePrice.regularAmount : undefined,
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

      return publicJson({
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

    const isPayPalLoginPreference = body.paymentMethod === "paypal";
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
      landingPage: isPayPalLoginPreference ? "LOGIN" : "GUEST_CHECKOUT",
    });

    await prisma.paymentOrder.update({
      where: { id: paymentOrder.id },
      data: { providerOrderId: order.id, metadata: { ...(paymentOrder.metadata as object), paypalOrder: order } },
    });

    return publicJson({
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
    return publicJson({ error: message }, { status: 500 });
  }
}


function getBillingErrorMessage(error: unknown) {
  const maybe = error as { message?: unknown; error?: { code?: unknown; description?: unknown }; statusCode?: unknown };
  const nestedDescription = typeof maybe?.error?.description === "string" ? maybe.error.description : "";
  const nestedCode = typeof maybe?.error?.code === "string" ? maybe.error.code : "";
  const message = typeof maybe?.message === "string" ? maybe.message : nestedDescription;

  if (nestedCode === "BAD_REQUEST_ERROR" && /auth/i.test(nestedDescription)) {
    return "Payment could not be started right now. Please try again in a few moments.";
  }

  if (/auth/i.test(message) && (/failed/i.test(message) || /rejected/i.test(message))) {
    return "We couldn't connect to PayPal right now. Please try another payment method or try again in a moment.";
  }

  if (/Razorpay is not configured/i.test(message) || /Razorpay.*keys.*not configured/i.test(message)) {
    return "Indian checkout is temporarily unavailable. Please try again shortly.";
  }

  if (/PayPal.*not configured/i.test(message) || (/PayPal/i.test(message) && /keys.*configured/i.test(message))) {
    return "PayPal checkout is temporarily unavailable. Please try another payment method or check back shortly.";
  }

  if (process.env.NODE_ENV === "production") {
    return typeof message === "string" && message.length > 0 && !/internal/i.test(message)
      ? message
      : "Could not start checkout. Please try again.";
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





