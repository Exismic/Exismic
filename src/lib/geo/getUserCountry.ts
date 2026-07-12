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
    ? { market: "IN", currency: "INR", gateway: "razorpay", symbol: "Rs" }
    : { market: "GLOBAL", currency: "USD", gateway: "paypal", symbol: "$" };
}

export function resolveMarket(req: NextRequest, override?: "IN" | "GLOBAL" | null) {
  if (override === "IN") return { countryCode: "IN", ...getMarketFromCountry("IN") };
  if (override === "GLOBAL") return { countryCode: "GLOBAL", ...getMarketFromCountry("GLOBAL") };

  const countryCode = getUserCountry(req);
  return { countryCode, ...getMarketFromCountry(countryCode) };
}
