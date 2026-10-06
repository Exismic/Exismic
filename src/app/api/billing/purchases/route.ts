import { publicJson } from "@/lib/public-json";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { billingMetadata, buildBillingReceipt, receiptUrl } from "@/lib/billing/receipt-data";
import { getBillingPlan } from "@/lib/billing/plans";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return publicJson({ error: "Please sign in to view purchases." }, { status: 401 });
    const cursor = request.nextUrl.searchParams.get("before");
    let boundary: { date: string; id: string; source: "transaction" | "order" } | null = null;
    if (cursor) {
      try { boundary = JSON.parse(cursor); } catch { return publicJson({ error: "Invalid history page." }, { status: 400 }); }
      if (!boundary || typeof boundary.date !== "string" || typeof boundary.id !== "string" || Number.isNaN(Date.parse(boundary.date)) || !/^[a-zA-Z0-9_-]{1,100}$/.test(boundary.id) || !["transaction", "order"].includes(boundary.source) || (boundary.source === "order" && !/^[0-9a-f-]{36}$/i.test(boundary.id))) return publicJson({ error: "Invalid history page." }, { status: 400 });
    }
    function pageBoundary(source: "transaction" | "order") {
      if (!boundary) return {};
      const date = new Date(boundary.date);
      if (source === boundary.source) return { OR: [{ createdAt: { lt: date } }, { createdAt: date, id: { lt: boundary.id } }] };
      return { createdAt: source === "order" ? { lte: date } : { lt: date } };
    }
    const [transactions, orders, buyer] = await Promise.all([
      prisma.paymentTransaction.findMany({ where: { userId: user.id, kind: { in: ["credit_purchase", "pro_subscription", "pro_renewal", "gift_pro_pass", "gift_credit_pack"] }, ...pageBoundary("transaction") }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 31 }),
      prisma.paymentOrder.findMany({ where: { userId: user.id, AND: [{ OR: [{ status: { notIn: ["paid", "COMPLETED"] } }, { gateway: "gift_card" }] }, pageBoundary("order")] }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 31 }),
      prisma.user.findUnique({ where: { id: user.id }, select: { name: true, email: true } }),
    ]);
    const ids = transactions.map(t => billingMetadata(t.metadata).billingOrderId).filter((id): id is string => typeof id === "string");
    const paidOrders = ids.length ? await prisma.paymentOrder.findMany({ where: { userId: user.id, id: { in: ids } } }) : [];
    const purchases = [
      ...transactions.map(t => {
        const order = paidOrders.find(o => o.id === billingMetadata(t.metadata).billingOrderId) || null;
        const receipt = buildBillingReceipt(t, order, buyer || {});
        if (!receipt) return null;
        return { id: t.id, source: "transaction", name: receipt.item, status: "paid", amount: t.amount, currency: t.currency, date: t.createdAt.toISOString(), gateway: t.provider, reference: receipt.reference, receiptUrl: receiptUrl(t.id), giftUrl: receipt.isGift && order ? `/billing/success?order=${encodeURIComponent(order.id)}` : null };
      }).filter(p => p !== null),
      ...orders.filter(o => !ids.includes(o.id)).map(o => {
        const plan = getBillingPlan(o.planId);
        const meta = billingMetadata(o.metadata);
        return { id: o.id, source: "order", name: typeof meta.planName === "string" ? meta.planName : plan?.interval === "one_time" ? `${o.credits.toLocaleString()} permanent credits` : plan?.name || "Exismic purchase", status: o.status === "COMPLETED" ? "paid" : o.status, amount: o.amount, currency: o.currency, date: o.createdAt.toISOString(), gateway: o.gateway, reference: o.id, receiptUrl: null };
      }),
    ].sort((a, b) => b.date.localeCompare(a.date) || b.source.localeCompare(a.source) || b.id.localeCompare(a.id));
    const page = purchases.slice(0, 30);
    return publicJson({ purchases: page, nextCursor: purchases.length > 30 && page.length ? JSON.stringify({ date: page[page.length - 1].date, id: page[page.length - 1].id, source: page[page.length - 1].source }) : null }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[Billing] Purchase history unavailable:", error);
    return publicJson({ error: "Purchase history could not be loaded. Please try again." }, { status: 500 });
  }
}
