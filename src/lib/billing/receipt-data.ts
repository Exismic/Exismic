import type { PaymentOrder, PaymentTransaction } from "@prisma/client";
import { getBillingPlan } from "./plans";

export function billingMetadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function billingAmount(amount: number, currency: string) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency", currency, minimumFractionDigits: 2,
  }).format(amount / 100);
}

export function receiptUrl(transactionId: string) {
  return `/api/billing/receipt?transactionId=${encodeURIComponent(transactionId)}`;
}

export type BillingReceipt = {
  transactionId: string;
  reference: string;
  paidAt: string;
  buyerName: string;
  buyerEmail: string;
  item: string;
  description: string;
  amountMinor: number;
  currency: string;
  originalAmountMinor: number | null;
  discountMinor: number | null;
  provider: string;
  providerPaymentId: string;
  providerOrderId: string | null;
  orderId: string | null;
  periodEnd: string | null;
  isGift: boolean;
  giftCode: string | null;
  recurring: boolean;
};

const receiptKinds = new Set(["credit_purchase", "pro_subscription", "pro_renewal", "gift_pro_pass", "gift_credit_pack"]);

export function buildBillingReceipt(
  transaction: PaymentTransaction,
  order: PaymentOrder | null,
  buyer: { name?: string | null; email?: string | null },
): BillingReceipt | null {
  if (!receiptKinds.has(transaction.kind) || transaction.amount <= 0 || !["INR", "USD"].includes(transaction.currency)) return null;
  // Orders are not receipts: a completed ledger entry is required, and unpaid orders stay excluded.
  if (order && !["paid", "COMPLETED"].includes(order.status)) return null;
  const meta = billingMetadata(transaction.metadata);
  const orderMeta = billingMetadata(order?.metadata);
  const snapshot = billingMetadata(meta.receiptSnapshot || orderMeta.receiptSnapshot);
  const planId = String(meta.planId || order?.planId || "");
  const plan = getBillingPlan(planId);
  const isGift = transaction.kind.startsWith("gift_");
  const pro = transaction.kind.includes("pro");
  const yearly = planId === "pro_yearly";
  const credits = Number(meta.credits ?? order?.credits ?? 0);
  const recurring = !isGift && pro && (transaction.kind === "pro_renewal" || snapshot.recurring === true || Boolean(orderMeta.razorpaySubscription || orderMeta.paypalSubscription) || /^(sub_|I-)/.test(transaction.providerOrderId || ""));
  const original = Number(snapshot.regularAmountMinor);
  const originalAmountMinor = Number.isInteger(original) && original >= transaction.amount ? original : null;
  const item = typeof snapshot.itemName === "string" ? snapshot.itemName : pro
    ? `Exismic Pro (${plan ? yearly ? "Annual" : "Monthly" : "Membership"})${transaction.kind === "pro_renewal" ? " renewal" : ""}${isGift ? " gift pass" : ""}`
    : `${Number.isFinite(credits) ? credits.toLocaleString("en-US") : ""} permanent credits${isGift ? " gift voucher" : ""}`;
  const end = meta.nextBillingTime || orderMeta.nextBillingTime;
  return {
    transactionId: transaction.id,
    reference: transaction.transactionReference || `EXM-${transaction.id}`,
    paidAt: transaction.createdAt.toISOString(),
    buyerName: typeof snapshot.buyerName === "string" ? snapshot.buyerName : buyer.name || "Exismic customer",
    buyerEmail: typeof snapshot.buyerEmail === "string" ? snapshot.buyerEmail : buyer.email || "Not recorded",
    item,
    description: pro ? `${plan?.credits || 500} daily credits; unused daily credits reset each day. ${isGift ? `${yearly ? "12 months" : "1 month"} starting when redeemed. One-time gift purchase.` : recurring ? "Recurring membership." : "Prepaid membership."}`
      : `${credits.toLocaleString("en-US")} credits, including any pack bonus. Never expire. One-time purchase.`,
    amountMinor: transaction.amount,
    currency: transaction.currency,
    originalAmountMinor,
    discountMinor: originalAmountMinor === null ? null : originalAmountMinor - transaction.amount,
    provider: transaction.provider,
    providerPaymentId: transaction.providerPaymentId,
    providerOrderId: transaction.providerOrderId,
    orderId: order?.id || (typeof meta.billingOrderId === "string" ? meta.billingOrderId : null),
    periodEnd: !isGift && typeof end === "string" && !Number.isNaN(Date.parse(end)) ? end : null,
    isGift,
    giftCode: isGift && typeof (meta.giftCode || orderMeta.giftCode) === "string" ? String(meta.giftCode || orderMeta.giftCode) : null,
    recurring,
  };
}
