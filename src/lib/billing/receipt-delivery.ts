import { prisma } from "@/lib/prisma";
import { sendDownloadableReceiptEmail } from "@/lib/emails";
import { billingMetadata } from "./receipt-data";
import { findBillingReceipt } from "./receipts";

// The ledger is the authority. Provider callbacks can retry this safely without re-granting credits.
export async function deliverBillingReceipt(userId: string, providerPaymentId: string) {
  try {
    const transaction = await prisma.paymentTransaction.findUnique({ where: { providerPaymentId } });
    if (!transaction || transaction.userId !== userId) return false;
    const metadata = billingMetadata(transaction.metadata);
    if (metadata.receiptEmailSentAt) return true;
    const receipt = await findBillingReceipt(userId, { transactionId: transaction.id });
    if (!receipt || receipt.provider === "mock") return false;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user?.email) return false;
    const sent = await sendDownloadableReceiptEmail(user.email, receipt);
    if (sent) await prisma.paymentTransaction.update({ where: { id: transaction.id }, data: { metadata: { ...metadata, receiptEmailSentAt: new Date().toISOString() } } });
    return sent;
  } catch (error) {
    // Receipt delivery must not turn an already successful purchase into a failed checkout.
    console.error("[Billing] Receipt delivery failed:", error);
    return false;
  }
}
