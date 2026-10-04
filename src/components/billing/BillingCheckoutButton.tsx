"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PaymentTermsModal } from "@/components/modals/PaymentTermsModal";
import { getBillingPlan, getPlanPrice } from "@/lib/billing/plans";
import { loadRazorpayCheckout } from "@/lib/payments/loadRazorpayCheckout";
import { reportPaymentFailure } from "@/lib/payments/reportPaymentFailure";

export function BillingCheckoutButton({ planId, marketOverride }: { planId: string; marketOverride: "IN" | "GLOBAL" }) {
  const [review, setReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const plan = getBillingPlan(planId);
  if (!plan || plan.interval === "free") return null;
  const price = getPlanPrice(plan.id, marketOverride);
  const gateway = marketOverride === "IN" ? "razorpay" : "paypal";

  async function startCheckout(couponCode?: string) {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/billing/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId, marketOverride, couponCode }) });
      const order = await response.json();
      if (!response.ok || !order.success) throw new Error(order.error || "Checkout could not be started.");
      if (order.gateway === "paypal" && order.approvalUrl) { window.location.assign(order.approvalUrl); return; }
      if (order.gateway !== "razorpay") throw new Error("This payment method is currently unavailable.");
      const Razorpay = await loadRazorpayCheckout();
      const checkout = new Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: "Exismic", description: order.plan?.name || "Exismic purchase",
        ...(order.razorpaySubscriptionId ? { subscription_id: order.razorpaySubscriptionId } : { order_id: order.razorpayOrderId }),
        theme: { color: "#8b5cf6" }, modal: { ondismiss: () => setLoading(false) },
        handler: async (payment: unknown) => {
          try {
            const verified = await fetch("/api/billing/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payment) });
            const result = await verified.json();
            if (!verified.ok || !result.success || !result.orderId) throw new Error(result.error || "Payment confirmation is pending. Check purchase history before trying again.");
            window.location.assign(`/billing/success?order=${encodeURIComponent(result.orderId)}`);
          } catch { window.location.assign(`/billing/success?order=${encodeURIComponent(order.orderId)}`); setLoading(false); }
        },
      });
      checkout.on("payment.failed", (failure: unknown) => { void reportPaymentFailure(order.orderId, failure); setError("Payment was not completed. You can try again."); setLoading(false); });
      checkout.open();
    } catch (err) { setError(err instanceof Error ? err.message : "Checkout could not be started."); setLoading(false); }
  }
  return <>
    <button type="button" onClick={() => setReview(true)} disabled={loading} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-black disabled:opacity-60">
      {loading && <Loader2 size={16} className="animate-spin" />} {gateway === "razorpay" ? "Pay with Razorpay / UPI / Cards" : "Pay with PayPal"}
    </button>
    {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    <PaymentTermsModal isOpen={review} onClose={() => setReview(false)} onConfirm={startCheckout} type={plan.interval === "one_time" ? "credits" : "pro"} planId={plan.id} packName={plan.name} price={price.display} regularPrice={price.regularDisplay} gateway={gateway} isProcessing={loading} error={error} />
  </>;
}
