import { NextRequest } from "next/server";

export type Market = {
  market: "IN" | "GLOBAL";
  currency: "INR" | "USD";
  gateway: "razorpay" | "paypal";
  symbol: string;
};

export function getUserCountry(req: NextRequest) {
  return (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code") ||
    "UNKNOWN"
  ).toUpperCase();
}

export function getMarketFromCountry(countryCode?: string | null): Market {
  return countryCode?.toUpperCase() === "IN"
    ? { market: "IN", currency: "INR", gateway: "razorpay", symbol: "₹" }
    : { market: "GLOBAL", currency: "USD", gateway: "paypal", symbol: "$" };
}

export function resolveMarket(req: NextRequest, override?: "IN" | "GLOBAL" | null) {
  if (override === "IN") return { countryCode: "IN", ...getMarketFromCountry("IN") };
  if (override === "GLOBAL") return { countryCode: "GLOBAL", ...getMarketFromCountry("GLOBAL") };

  // Allow explicit query override for testing / development
  const queryCurrency = req.nextUrl?.searchParams?.get("currency")?.toUpperCase();
  const queryMarket = req.nextUrl?.searchParams?.get("market")?.toUpperCase();
  if (queryCurrency === "USD" || queryMarket === "GLOBAL") {
    return { countryCode: "US", ...getMarketFromCountry("US") };
  }
  if (queryCurrency === "INR" || queryMarket === "IN") {
    return { countryCode: "IN", ...getMarketFromCountry("IN") };
  }

  // Pure IP-based auto detection in production (via Vercel/Cloudflare country header)
  const countryCode = getUserCountry(req);
  if (countryCode && countryCode !== "UNKNOWN") {
    return { countryCode, ...getMarketFromCountry(countryCode) };
  }

  // Fallback for localhost / environments without IP headers
  const cookieCurrency = req.cookies?.get("exismic_currency")?.value?.toUpperCase();
  const cookieMarket = req.cookies?.get("exismic_market")?.value?.toUpperCase();
  if (cookieCurrency === "USD" || cookieMarket === "GLOBAL") {
    return { countryCode: "US", ...getMarketFromCountry("US") };
  }
  if (cookieCurrency === "INR" || cookieMarket === "IN") {
    return { countryCode: "IN", ...getMarketFromCountry("IN") };
  }

  return { countryCode: "UNKNOWN", ...getMarketFromCountry("UNKNOWN") };
}
