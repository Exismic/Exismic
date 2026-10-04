"use client";
import { BillingCheckoutButton } from "./BillingCheckoutButton";
export function PayPalCheckoutButton({ planId, marketOverride }: { planId: string; marketOverride: "IN" | "GLOBAL"; clientId?: string }) {
  return <BillingCheckoutButton planId={planId} marketOverride={marketOverride} />;
}
