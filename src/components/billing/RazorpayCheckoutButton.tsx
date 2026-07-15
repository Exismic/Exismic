"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { reportPaymentFailure } from "@/lib/payments/reportPaymentFailure";
import { loadRazorpayCheckout } from "@/lib/payments/loadRazorpayCheckout";

type RazorpayResponse = {
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export function RazorpayCheckoutButton({ planId, marketOverride }: { planId: string; marketOverride: "IN" | "GLOBAL" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const Razorpay = await loadRazorpayCheckout();
      
      const orderResponse = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, marketOverride }),
      });
      const orderData = await orderResponse.json().catch(() => null);
      if (!orderResponse.ok || !orderData?.success) throw new Error(orderData?.error || "Could not start checkout.");

      const checkoutOptions: Record<string, unknown> = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Exismic",
        description: orderData.plan?.name || "Exismic purchase",
        theme: { color: "#8b5cf6" },
        handler: async (response: RazorpayResponse) => {
          const verifyResponse = await fetch("/api/billing/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyResponse.json().catch(() => null);
          if (!verifyResponse.ok || !verifyData?.success) throw new Error(verifyData?.error || "Payment verification failed.");
          const type = orderData.plan?.id === "pro" ? "pro" : "credits";
          const credits = Number(orderData.plan?.credits || 0);
          window.location.href = `/billing/success?type=${type}&credits=${credits}`;
        },
      };

      if (orderData.razorpaySubscriptionId) {
        checkoutOptions.subscription_id = orderData.razorpaySubscriptionId;
      } else {
        checkoutOptions.order_id = orderData.razorpayOrderId;
      }

      const razorpay = new Razorpay(checkoutOptions);
      razorpay.on("payment.failed", (failure: unknown) => {
        console.error("[Billing] Razorpay failed", failure);
        reportPaymentFailure(orderData.orderId, failure);
        setError("Payment failed or was cancelled.");
        setLoading(false);
      });

      razorpay.open();
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[10px] font-black uppercase tracking-[0.18em] text-black transition-all hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        Pay with Razorpay / UPI / Cards
      </button>
      {error && <p className="mt-3 text-xs font-bold text-red-300">{error}</p>}
    </>
  );
}
