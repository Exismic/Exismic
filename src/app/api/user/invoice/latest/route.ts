import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fallbackTransactionReference, generateTransactionReference, getPaymentInvoiceType } from "@/lib/payment-reference";
import { createClient } from "@/utils/supabase/server";

type PaymentRow = NonNullable<Awaited<ReturnType<typeof prisma.paymentTransaction.findFirst>>>;
type PaymentOrderRow = NonNullable<Awaited<ReturnType<typeof prisma.paymentOrder.findFirst>>>;

function formatMoney(amountMinor: number, currency: string) {
  const amount = amountMinor / 100;
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "INR" ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function paymentMethod(provider: string) {
  if (provider === "paypal") return "PayPal secure checkout";
  if (provider === "razorpay") return "Razorpay secure checkout";
  return "Secure checkout";
}

function planLabel(kind: string, metadata: unknown) {
  const meta = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : {};
  if (getPaymentInvoiceType(kind) === "credits") {
    const credits = typeof meta.credits === "number" ? meta.credits.toLocaleString() : "Permanent";
    return `${credits} Exismic permanent credits`;
  }
  if (kind.includes("renewal")) return "Exismic Pro - Monthly renewal";
  if (kind.includes("subscription")) return "Exismic Pro - Monthly subscription";
  return "Exismic Pro - Monthly";
}

async function ensureTransactionReference(payment: PaymentRow) {
  if (payment.transactionReference) return payment.transactionReference;

  const reference = fallbackTransactionReference(payment.kind, payment.providerPaymentId, payment.createdAt);

  try {
    await prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: { transactionReference: reference },
    });
  } catch (error) {
    console.error("[Invoice] Could not backfill transaction reference:", error);
  }

  return reference;
}

async function ensureInvoiceTransactionFromOrder(order: PaymentOrderRow) {
  const providerPaymentId = order.providerPaymentId || order.providerOrderId || `${order.gateway}_${order.id}`;
  const kind = order.planId === "pro" ? "pro_subscription" : "credit_purchase";
  const metadata = order.metadata && typeof order.metadata === "object" ? order.metadata as Record<string, unknown> : {};

  return prisma.paymentTransaction.upsert({
    where: { providerPaymentId },
    update: {
      provider: order.gateway,
      providerOrderId: order.providerOrderId,
      userId: order.userId,
      kind,
      amount: order.amount,
      currency: order.currency,
      metadata: {
        ...metadata,
        billingOrderId: order.id,
        planId: order.planId,
        credits: order.credits,
        market: order.market,
      },
    },
    create: {
      provider: order.gateway,
      providerPaymentId,
      providerOrderId: order.providerOrderId,
      transactionReference: generateTransactionReference(kind, order.updatedAt),
      userId: order.userId,
      kind,
      amount: order.amount,
      currency: order.currency,
      metadata: {
        ...metadata,
        billingOrderId: order.id,
        planId: order.planId,
        credits: order.credits,
        market: order.market,
      },
      createdAt: order.updatedAt,
    },
  });
}

async function serializeInvoice(payment: PaymentRow, dbUser: { planExpiresAt: Date | null; subscriptionStatus: string }) {
  const type = getPaymentInvoiceType(payment.kind);
  const transactionReference = await ensureTransactionReference(payment);
  const metadata = payment.metadata && typeof payment.metadata === "object"
    ? payment.metadata as Record<string, unknown>
    : {};
  const rawBillingDate = typeof metadata.nextBillingTime === "string" ? new Date(metadata.nextBillingTime) : null;
  const transactionBillingDate = rawBillingDate && !Number.isNaN(rawBillingDate.getTime()) ? rawBillingDate : null;

  return {
    id: transactionReference,
    transactionReference,
    providerPaymentId: payment.providerPaymentId,
    providerOrderId: payment.providerOrderId,
    date: formatDate(payment.createdAt),
    createdAt: payment.createdAt.toISOString(),
    amount: formatMoney(payment.amount, payment.currency),
    amountMinor: payment.amount,
    currency: payment.currency,
    plan: planLabel(payment.kind, payment.metadata),
    method: paymentMethod(payment.provider),
    status: "Paid",
    type,
    kind: payment.kind,
    nextBillingDate: type === "pro" && (transactionBillingDate || dbUser.planExpiresAt)
      ? formatDate(transactionBillingDate || dbUser.planExpiresAt!)
      : null,
    subscriptionStatus: type === "pro" ? dbUser.subscriptionStatus : null,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: user.id }, { email: { equals: user.email, mode: "insensitive" } }],
      },
      select: {
        id: true,
        planExpiresAt: true,
        subscriptionStatus: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User record not found." }, { status: 404 });
    }

    const invoiceUserIds = Array.from(new Set([dbUser.id, user.id].filter(Boolean)));

    const paidOrders = await prisma.paymentOrder.findMany({
      where: { userId: { in: invoiceUserIds }, status: "paid" },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    await Promise.all(paidOrders.map((order) => ensureInvoiceTransactionFromOrder(order)));

    const payments = await prisma.paymentTransaction.findMany({
      where: { userId: { in: invoiceUserIds } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const serialized = await Promise.all(payments.map((payment) => serializeInvoice(payment, dbUser)));
    const proInvoices = serialized.filter((invoice) => invoice.type === "pro");
    const creditInvoices = serialized.filter((invoice) => invoice.type === "credits");
    const proInvoice = proInvoices[0] || null;
    const creditsInvoice = creditInvoices[0] || null;

    return NextResponse.json({
      success: true,
      invoices: {
        pro: proInvoices,
        credits: creditInvoices,
      },
      latest: {
        pro: proInvoice,
        credits: creditsInvoice,
      },
      invoice: proInvoice || creditsInvoice,
    });
  } catch (error) {
    console.error("[Invoice] Invoice lookup failed:", error);
    return NextResponse.json({ error: "Could not load invoice details." }, { status: 500 });
  }
}
