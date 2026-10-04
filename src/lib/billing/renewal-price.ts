import type { PaymentOrder } from "@prisma/client";
import { getPlanPrice } from "./plans";
import { billingMetadata } from "./receipt-data";

export function expectedRenewalAmount(order: PaymentOrder) {
  const snapshot = billingMetadata(billingMetadata(order.metadata).receiptSnapshot);
  const recorded = Number(snapshot.regularAmountMinor);
  if (Number.isInteger(recorded) && recorded > 0) return recorded;
  return getPlanPrice(order.planId === "pro_yearly" ? "pro_yearly" : "pro", order.currency === "INR" ? "IN" : "GLOBAL").regularAmountMinor;
}
