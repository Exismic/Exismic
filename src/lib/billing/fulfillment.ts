import { PRICING_CONFIG } from "@/config/pricing";
import { prisma } from "@/lib/prisma";
import { type BillingPlanId, getBillingPlan } from "@/lib/billing/plans";
import { generateTransactionReference } from "@/lib/payment-reference";
import { sendCreditsPurchasedEmail, sendPaymentFailedEmail, sendProRenewalReceiptEmail, sendProWelcomeEmail } from "@/lib/emails";
import { createNotification } from "@/lib/notifications";

type FulfillPaymentInput = {
  orderId: string;
  providerPaymentId?: string | null;
  periodEnd?: Date | null;
  rawMetadata?: Record<string, unknown>;
};

function periodEndFor(planId: BillingPlanId) {
  if (planId !== "pro") return null;
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  return next;
}

function formatAmount(amountMinor: number, currency: string) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "INR" ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export async function recordBillingFailure({
  orderId,
  userId,
  providerPaymentId,
  reason,
}: {
  orderId: string;
  userId: string;
  providerPaymentId?: string | null;
  reason?: string;
}) {
  const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== userId) throw new Error("Payment order not found for this account.");
  if (order.status === "paid") return { recorded: false, reason: "already_paid" };

  const metadata = order.metadata && typeof order.metadata === "object"
    ? order.metadata as Record<string, unknown>
    : {};
  const safeReason = (reason || "The payment provider could not complete this transaction.").slice(0, 500);

  await prisma.paymentOrder.update({
    where: { id: order.id },
    data: {
      status: "failed",
      ...(providerPaymentId ? { providerPaymentId } : {}),
      metadata: {
        ...metadata,
        failureReason: safeReason,
        failedAt: typeof metadata.failedAt === "string" ? metadata.failedAt : new Date().toISOString(),
      },
    },
  });

  const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!dbUser?.email) return { recorded: true, emailSent: false };

  const sent = await sendPaymentFailedEmail(dbUser.email, {
    purchaseType: order.planId === "pro" ? "pro" : "credits",
    amount: formatAmount(order.amount, order.currency),
    orderId: order.id,
    reason: safeReason,
  });

  if (sent) {
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: { metadata: { ...metadata, failureReason: safeReason, failedAt: new Date().toISOString(), failureEmailSentAt: new Date().toISOString() } },
    });
  }

  return { recorded: true, emailSent: sent };
}

export async function fulfillBillingOrder({ orderId, providerPaymentId, periodEnd, rawMetadata = {} }: FulfillPaymentInput) {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.paymentOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Payment order not found.");

    if (order.status === "paid") {
      const existingTransaction = await tx.paymentTransaction.findFirst({
        where: { metadata: { path: ["billingOrderId"], equals: order.id } },
      });
      return { order, alreadyProcessed: true, transactionReference: existingTransaction?.transactionReference || null };
    }

    const plan = getBillingPlan(order.planId);
    if (!plan) throw new Error("Unknown billing plan.");

    const currentPeriodEnd = plan.id === "pro" ? periodEnd || periodEndFor(plan.id) : null;
    const existingMeta = order.metadata && typeof order.metadata === "object" ? order.metadata as Record<string, unknown> : {};
    const resolvedProviderPaymentId = providerPaymentId || order.providerPaymentId || `${order.gateway}_${order.id}`;
    const transactionKind = plan.id === "pro" ? "pro_subscription" : "credit_purchase";
    const transactionMetadata = {
      billingOrderId: order.id,
      planId: plan.id,
      credits: order.credits,
      gateway: order.gateway,
      market: order.market,
      ...(currentPeriodEnd ? { nextBillingTime: currentPeriodEnd.toISOString() } : {}),
      ...rawMetadata,
    };

    const paidOrder = await tx.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: "paid",
        providerPaymentId: resolvedProviderPaymentId,
        metadata: { ...existingMeta, ...rawMetadata, fulfilledAt: new Date().toISOString() },
      },
    });

    const paymentTransaction = await tx.paymentTransaction.upsert({
      where: { providerPaymentId: resolvedProviderPaymentId },
      update: {
        provider: order.gateway,
        providerOrderId: order.providerOrderId,
        userId: order.userId,
        kind: transactionKind,
        amount: order.amount,
        currency: order.currency,
        metadata: transactionMetadata,
      },
      create: {
        provider: order.gateway,
        providerPaymentId: resolvedProviderPaymentId,
        providerOrderId: order.providerOrderId,
        transactionReference: generateTransactionReference(transactionKind),
        userId: order.userId,
        kind: transactionKind,
        amount: order.amount,
        currency: order.currency,
        metadata: transactionMetadata,
      },
    });

    await tx.userBilling.upsert({
      where: { userId: order.userId },
      update: {
        planId: plan.id,
        status: plan.id === "pro" ? "active" : "paid",
        ...(plan.id === "pro" ? {} : { credits: { increment: order.credits } }),
        currentPeriodEnd,
        lastPaymentOrderId: order.id,
      },
      create: {
        userId: order.userId,
        planId: plan.id,
        status: plan.id === "pro" ? "active" : "paid",
        credits: plan.id === "pro" ? 0 : order.credits,
        currentPeriodEnd,
        lastPaymentOrderId: order.id,
      },
    });

    if (plan.id === "pro") {
      await tx.user.upsert({
        where: { id: order.userId },
        update: {
          plan: "pro",
          subscriptionId: order.providerOrderId || order.providerPaymentId || resolvedProviderPaymentId,
          subscriptionStatus: "active",
          planExpiresAt: currentPeriodEnd,
          dailyCredits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS,
          aiGenerationsLimit: 1000,
        },
        create: {
          id: order.userId,
          plan: "pro",
          subscriptionId: order.providerOrderId || order.providerPaymentId || resolvedProviderPaymentId,
          subscriptionStatus: "active",
          planExpiresAt: currentPeriodEnd,
          dailyCredits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS,
          aiGenerationsLimit: 1000,
          bonusCredits: 0,
          lifetimeCredits: 0,
        },
      });
    } else {
      await tx.user.upsert({
        where: { id: order.userId },
        update: {
          lifetimeCredits: { increment: order.credits },
        },
        create: {
          id: order.userId,
          plan: "free",
          dailyCredits: 50,
          bonusCredits: 0,
          lifetimeCredits: order.credits,
        },
      });

      if (order.credits > 0) {
        await tx.creditTransaction.create({
          data: {
            userId: order.userId,
            amount: order.credits,
            balanceType: "permanent",
            transactionType: "purchase",
            description: `Purchased ${order.credits} permanent credits via ${order.gateway}`,
            metadata: {
              billingOrderId: order.id,
              providerPaymentId: resolvedProviderPaymentId,
              planId: plan.id,
            },
          },
        });
      }
    }

    return {
      order: paidOrder,
      alreadyProcessed: false,
      transactionReference: paymentTransaction.transactionReference,
      plan,
      currentPeriodEnd,
    };
  });

  if (!result.alreadyProcessed && result.plan) {
    const dbUser = await prisma.user.findUnique({
      where: { id: result.order.userId },
      select: { email: true },
    });
    const email = dbUser?.email;
    const reference = result.transactionReference || result.order.providerPaymentId || result.order.id;

    if (email) {
      const emailSent = result.plan.id === "pro"
        ? await sendProWelcomeEmail(email, {
            invoiceId: reference,
            amount: formatAmount(result.order.amount, result.order.currency),
            date: (result.currentPeriodEnd || new Date()).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
          })
        : await sendCreditsPurchasedEmail(email, {
            credits: result.order.credits,
            amount: formatAmount(result.order.amount, result.order.currency),
            invoiceId: reference,
          });

      if (!emailSent) {
        console.error(`[Billing] Purchase email failed for order ${result.order.id}`);
      }
    }

    createNotification(
      result.order.userId,
      result.plan.id === "pro" ? "Pro membership active" : "Credits added",
      result.plan.id === "pro"
        ? "Your Exismic Pro membership is ready."
        : `${result.order.credits.toLocaleString()} permanent credits were added to your account.`,
      "success",
    ).catch((error) => console.error(`[Billing] Notification failed for order ${result.order.id}:`, error));
  }

  return result;
}

type FulfillProRenewalInput = {
  userId: string;
  provider: "razorpay" | "paypal";
  subscriptionId: string;
  providerPaymentId: string;
  amount: number;
  currency: string;
  periodEnd: Date;
  rawMetadata?: Record<string, unknown>;
};

export async function fulfillProRenewal({
  userId,
  provider,
  subscriptionId,
  providerPaymentId,
  amount,
  currency,
  periodEnd,
  rawMetadata = {},
}: FulfillProRenewalInput) {
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.paymentTransaction.findUnique({ where: { providerPaymentId } });
    if (existing) return { alreadyProcessed: true, transactionReference: existing.transactionReference };

    const dbUser = await tx.user.findUnique({ where: { id: userId }, select: { subscriptionId: true } });
    if (!dbUser || dbUser.subscriptionId !== subscriptionId) {
      throw new Error("Subscription does not belong to this account.");
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        plan: "pro",
        subscriptionStatus: "active",
        planExpiresAt: periodEnd,
        dailyCredits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS,
        aiGenerationsLimit: 1000,
      },
    });

    await tx.userBilling.upsert({
      where: { userId },
      update: { planId: "pro", status: "active", currentPeriodEnd: periodEnd },
      create: { userId, planId: "pro", status: "active", currentPeriodEnd: periodEnd },
    });

    const transaction = await tx.paymentTransaction.create({
      data: {
        provider,
        providerPaymentId,
        providerOrderId: subscriptionId,
        transactionReference: generateTransactionReference("pro_renewal"),
        userId,
        kind: "pro_renewal",
        amount,
        currency,
        metadata: {
          subscriptionId,
          nextBillingTime: periodEnd.toISOString(),
          ...rawMetadata,
        },
      },
    });

    return { alreadyProcessed: false, transactionReference: transaction.transactionReference };
  });

  if (!result.alreadyProcessed) {
    const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (dbUser?.email) {
      const sent = await sendProRenewalReceiptEmail(dbUser.email, {
        amount: formatAmount(amount, currency),
        invoiceId: result.transactionReference || providerPaymentId,
        nextBillingDate: periodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      });
      if (!sent) console.error(`[Billing] Renewal receipt failed for payment ${providerPaymentId}`);
    }
    createNotification(
      userId,
      "Pro membership renewed",
      `Your Pro membership is active through ${periodEnd.toLocaleDateString()}.`,
      "success",
    ).catch((error) => console.error(`[Billing] Renewal notification failed for payment ${providerPaymentId}:`, error));
  }

  return result;
}



