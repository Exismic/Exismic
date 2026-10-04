import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { expectedRenewalAmount } from "@/lib/billing/renewal-price";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const [account, billing] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id }, select: { subscriptionId: true, subscriptionStatus: true, planExpiresAt: true } }),
      prisma.userBilling.findUnique({ where: { userId: user.id } }),
    ]);
    const recurring = /^(sub_|I-)/.test(account?.subscriptionId || "");
    const order = account?.subscriptionId ? await prisma.paymentOrder.findFirst({ where: { userId: user.id, providerOrderId: account.subscriptionId, planId: { in: ["pro", "pro_yearly"] }, status: "paid" }, orderBy: { createdAt: "desc" } }) : null;
    const planId = order?.planId || (billing?.planId === "pro_yearly" || billing?.planId === "pro" ? billing.planId : null);
    return NextResponse.json({
      interval: planId === "pro_yearly" ? "year" : planId === "pro" ? "month" : null,
      recurring,
      status: account?.subscriptionStatus || "none",
      periodEnd: account?.planExpiresAt || null,
      currency: order?.currency || null,
      amountMinor: order ? recurring ? expectedRenewalAmount(order) : order.amount : null,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[Billing] Membership details unavailable:", error);
    return NextResponse.json({ error: "Membership details could not be loaded." }, { status: 500 });
  }
}
