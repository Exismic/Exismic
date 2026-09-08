import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { getBillingPlan, getPlanPrice, type BillingMarket } from "@/lib/billing/plans";
import { resolveMarket } from "@/lib/geo/getUserCountry";
import { PRICING_CONFIG } from "@/config/pricing";
import { checkUserLaunchDiscountEligibility } from "@/lib/billing/launch-discount";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ valid: false, error: "Please sign in to apply coupon codes." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { code, planId, marketOverride } = body as {
      code?: string;
      planId?: string;
      marketOverride?: "IN" | "GLOBAL";
    };

    if (!code?.trim()) {
      return NextResponse.json({ valid: false, error: "Please enter a coupon code." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const plan = getBillingPlan(planId);
    if (!plan) {
      return NextResponse.json({ valid: false, error: "Please select a valid item before applying a coupon." }, { status: 400 });
    }

    // 0. Special Handling: v1.6 Launch Special One-Time Discount
    if (cleanCode === PRICING_CONFIG.V16_LAUNCH_PROMO.CODE) {
      if (plan.id !== "pro") {
        return NextResponse.json({
          valid: false,
          error: "The v1.6 Launch Special is valid exclusively for Pro Monthly memberships.",
        }, { status: 400 });
      }

      const eligibility = await checkUserLaunchDiscountEligibility(user.id);
      if (!eligibility.eligible) {
        return NextResponse.json({
          valid: false,
          error: eligibility.reason || "You have already redeemed your one-time v1.6 Launch Special discount.",
        }, { status: 400 });
      }

      const allowMarketOverride = process.env.NODE_ENV !== "production";
      const marketInfo = resolveMarket(req, allowMarketOverride ? marketOverride : null);
      const market = marketInfo.market as BillingMarket;
      const basePrice = getPlanPrice(plan.id, market);
      const isIndia = market === "IN";

      const finalAmountMinor = isIndia
        ? PRICING_CONFIG.V16_LAUNCH_PROMO.DISCOUNTED_PRICE_INR * 100
        : Math.round(PRICING_CONFIG.V16_LAUNCH_PROMO.DISCOUNTED_PRICE_USD * 100);
      const discountMinor = Math.max(0, basePrice.amountMinor - finalAmountMinor);

      return NextResponse.json({
        valid: true,
        code: cleanCode,
        discountType: "launch_special",
        discountLabel: isIndia ? "₹200 OFF (v1.6 Launch Special)" : "$3.00 OFF (v1.6 Launch Special)",
        discountMinor,
        originalAmountMinor: basePrice.amountMinor,
        finalAmountMinor,
        currency: basePrice.currency,
        displayDiscount: isIndia ? "₹200" : "$3.00",
        displayFinal: isIndia ? `₹${(finalAmountMinor / 100).toFixed(0)}` : `$${(finalAmountMinor / 100).toFixed(2)}`,
        note: "v1.6 Launch Special: First month for " + (isIndia ? "₹299" : "$3.99") + ". Auto-renews at standard " + (isIndia ? "₹499" : "$6.99") + "/mo. Cancel anytime.",
      });
    }

    // 1. Fetch promo code from DB
    const promo = await prisma.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (!promo) {
      return NextResponse.json({ valid: false, error: "Invalid or unrecognized coupon code." }, { status: 404 });
    }

    // 2. Validate expiration
    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
      return NextResponse.json({ valid: false, error: "This coupon code has expired." }, { status: 400 });
    }

    // 3. Validate overall usage limit
    if (promo.redemptionCount >= promo.maxRedemptions) {
      return NextResponse.json({ valid: false, error: "This coupon code has already been redeemed." }, { status: 400 });
    }

    // 4. Validate if this specific user already claimed this coupon
    const userClaim = await prisma.promoRedemption.findUnique({
      where: {
        promoId_userId: {
          promoId: promo.id,
          userId: user.id,
        },
      },
    });

    if (userClaim) {
      return NextResponse.json({ valid: false, error: "You have already redeemed this coupon code." }, { status: 400 });
    }

    // 5. Anti-Exploitation: 5-Day Cooldown on Discount Codes
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
      orderBy: { redeemedAt: "desc" },
    });

    if (recentRedemption) {
      const msPassed = Date.now() - new Date(recentRedemption.redeemedAt).getTime();
      const hoursRemaining = Math.ceil((FIVE_DAYS_MS - msPassed) / (1000 * 60 * 60));
      const daysRemaining = Math.ceil(hoursRemaining / 24);
      return NextResponse.json(
        {
          valid: false,
          error: `Anti-exploit cooldown: You recently used a discount voucher. Vouchers are limited to once every 5 days (cooldown ends in ${daysRemaining} day${daysRemaining > 1 ? "s" : ""}).`,
        },
        { status: 400 }
      );
    }

    // 6. Resolve Pricing and Market
    const allowMarketOverride = process.env.NODE_ENV !== "production";
    const marketInfo = resolveMarket(req, allowMarketOverride ? marketOverride : null);
    const market = marketInfo.market as BillingMarket;
    const basePrice = getPlanPrice(plan.id, market);
    const isIndia = market === "IN";

    // 7. Check Voucher Type and Apply Specific Business Rules
    const isFixedDiscountVoucher = cleanCode.startsWith("OFF") || cleanCode.startsWith("SAVE");
    const isPro20Voucher = cleanCode.startsWith("PRO20");

    if (!isFixedDiscountVoucher && !isPro20Voucher) {
      return NextResponse.json(
        {
          valid: false,
          error: "This code is a free gift or credit code, not a checkout discount coupon. Please redeem it in Account -> Redeem Codes.",
        },
        { status: 400 }
      );
    }

    // Rule A: Minimum $3.00 (or ₹249) spend constraint for OFF100 voucher
    if (isFixedDiscountVoucher) {
      if (isIndia && basePrice.amountMinor < 24900) {
        return NextResponse.json(
          {
            valid: false,
            error: "This voucher requires a minimum purchase of ₹249. Please choose a qualifying Credit Pack or Pro Pass.",
          },
          { status: 400 }
        );
      }
      if (!isIndia && basePrice.amount < 3.0) {
        return NextResponse.json(
          {
            valid: false,
            error: "This voucher requires a minimum purchase of $3.00. Please choose a qualifying Credit Pack or Pro Pass.",
          },
          { status: 400 }
        );
      }

      // ₹100 for India (10000 minor units), $1.50 for Global (150 minor units)
      const discountMinor = isIndia ? 10000 : 150;
      const appliedDiscountMinor = Math.min(basePrice.amountMinor, discountMinor);
      const finalAmountMinor = Math.max(0, basePrice.amountMinor - appliedDiscountMinor);

      return NextResponse.json({
        valid: true,
        code: cleanCode,
        discountType: "fixed",
        discountLabel: isIndia ? "₹100 OFF" : "$1.50 OFF",
        discountMinor: appliedDiscountMinor,
        originalAmountMinor: basePrice.amountMinor,
        finalAmountMinor,
        currency: basePrice.currency,
        displayDiscount: isIndia ? "₹100" : "$1.50",
        displayFinal: isIndia ? `₹${(finalAmountMinor / 100).toFixed(0)}` : `$${(finalAmountMinor / 100).toFixed(2)}`,
      });
    }

    // Rule B: PRO20 Voucher -> Strictly Monthly Pro Only (Does NOT stack on Yearly Pro, NOT for Credit Packs)
    if (isPro20Voucher) {
      if (plan.id === "pro_yearly") {
        return NextResponse.json(
          {
            valid: false,
            error: "This 20% voucher is valid on Monthly Pro only. Yearly Pro already includes a built-in ~28% annual discount.",
          },
          { status: 400 }
        );
      }

      if (plan.id !== "pro") {
        return NextResponse.json(
          {
            valid: false,
            error: "This voucher is exclusively valid for Monthly Exismic Pro memberships and cannot be applied to Credit Packs.",
          },
          { status: 400 }
        );
      }

      const discountMinor = Math.round(basePrice.amountMinor * 0.2);
      const finalAmountMinor = basePrice.amountMinor - discountMinor;

      return NextResponse.json({
        valid: true,
        code: cleanCode,
        discountType: "percent",
        discountLabel: "20% OFF",
        discountMinor,
        originalAmountMinor: basePrice.amountMinor,
        finalAmountMinor,
        currency: basePrice.currency,
        displayDiscount: "20%",
        displayFinal: isIndia ? `₹${(finalAmountMinor / 100).toFixed(0)}` : `$${(finalAmountMinor / 100).toFixed(2)}`,
        note: "Applies to your first monthly billing cycle. Subsequent months renew at standard price.",
      });
    }

    return NextResponse.json({ valid: false, error: "Unrecognized voucher code type." }, { status: 400 });
  } catch (error) {
    console.error("[VALIDATE_COUPON_POST]", error);
    return NextResponse.json({ valid: false, error: "Could not validate coupon. Please try again." }, { status: 500 });
  }
}
