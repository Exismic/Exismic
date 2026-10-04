import { prisma } from "@/lib/prisma";
import { billingMetadata, buildBillingReceipt } from "./receipt-data";

export async function findBillingReceipt(userId: string, lookup: { transactionId?: string | null; orderId?: string | null }) {
  const transaction = lookup.transactionId
    ? await prisma.paymentTransaction.findFirst({ where: { id: lookup.transactionId, userId } })
    : lookup.orderId
      ? await prisma.paymentTransaction.findFirst({ where: { userId, metadata: { path: ["billingOrderId"], equals: lookup.orderId } } })
      : null;
  if (!transaction) return null;
  const meta = billingMetadata(transaction.metadata);
  const orderId = typeof meta.billingOrderId === "string" ? meta.billingOrderId : null;
  const [order, buyer] = await Promise.all([
    orderId ? prisma.paymentOrder.findFirst({ where: { id: orderId, userId } }) : Promise.resolve(null),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
  ]);
  if (orderId && !order) return null;
  return buildBillingReceipt(transaction, order, buyer || {});
}
