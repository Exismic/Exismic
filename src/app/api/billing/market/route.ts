import { NextRequest, NextResponse } from "next/server";
import { resolveMarket } from "@/lib/geo/getUserCountry";
import { publicBillingPlans } from "@/lib/billing/plans";

export async function GET(req: NextRequest) {
  const override = req.nextUrl.searchParams.get("market");
  const allowOverride = process.env.NODE_ENV !== "production";
  const requestedMarket = allowOverride && (override === "IN" || override === "GLOBAL") ? override : null;
  const market = resolveMarket(req, requestedMarket);
  return NextResponse.json({
    countryCode: market.countryCode,
    market: market.market,
    currency: market.currency,
    gateway: market.gateway,
    symbol: market.symbol,
    plans: publicBillingPlans(market.market),
  });
}
