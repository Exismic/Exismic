import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Loader2 } from "lucide-react";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Exismic",
  description: "Complete your Exismic membership or credits purchase with fast, protected checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

interface CheckoutPageProps {
  searchParams: Promise<{
    plan?: string;
    coupon?: string;
    market?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedParams = await searchParams;
  const planId = resolvedParams.plan || "starter";

  // Check URL query override if explicitly provided (for dev/testing)
  const queryMarket = resolvedParams.market?.toUpperCase();
  let market: "IN" | "GLOBAL" | undefined =
    queryMarket === "IN" ? "IN" : queryMarket === "GLOBAL" ? "GLOBAL" : undefined;

  // Server-side IP geo-detection via Vercel headers
  if (!market) {
    try {
      const headerList = await headers();
      const country = (
        headerList.get("x-vercel-ip-country") ||
        headerList.get("cf-ipcountry") ||
        headerList.get("x-country-code") ||
        ""
      ).toUpperCase();

      if (country === "IN") {
        market = "IN";
      } else if (country && country !== "UNKNOWN") {
        market = "GLOBAL";
      }
    } catch {
      // fallback to client-side detection
    }
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06080d] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Loading Secure Checkout...
            </span>
          </div>
        </div>
      }
    >
      <CheckoutClient initialPlanId={planId} initialMarket={market} />
    </Suspense>
  );
}
