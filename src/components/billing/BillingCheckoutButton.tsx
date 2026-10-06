"use client";

import { useRouter } from "next/navigation";
import { getBillingPlan } from "@/lib/billing/plans";

export function BillingCheckoutButton({ planId, marketOverride }: { planId: string; marketOverride: "IN" | "GLOBAL" }) {
  const router = useRouter();
  const plan = getBillingPlan(planId);
  if (!plan || plan.interval === "free") return null;
  const gateway = marketOverride === "IN" ? "razorpay" : "paypal";

  return (
    <button
      type="button"
      onClick={() => router.push(`/checkout?plan=${planId}${marketOverride === "IN" ? "&market=IN" : ""}`)}
      className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-black hover:bg-zinc-200 transition-all active:scale-[0.98] cursor-pointer"
    >
      {gateway === "razorpay" ? "Pay with UPI / Cards / Razorpay" : "Pay with Card / PayPal"}
    </button>
  );
}
