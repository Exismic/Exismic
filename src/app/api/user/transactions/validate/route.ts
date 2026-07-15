import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref")?.trim();

    if (!ref) {
      return NextResponse.json({ error: "Missing ref parameter" }, { status: 400 });
    }

    // Search in paymentTransaction table by reference, paymentId, or orderId
    const transaction = await prisma.paymentTransaction.findFirst({
      where: {
        userId: user.id,
        OR: [
          { id: ref },
          { transactionReference: ref },
          { providerPaymentId: ref },
          { providerOrderId: ref },
        ],
      },
    });

    // Also search in paymentOrders in case transaction isn't linked yet
    const order = transaction ? null : await prisma.paymentOrder.findFirst({
      where: {
        userId: user.id,
        status: "paid",
        OR: [
          { id: ref },
          { providerOrderId: ref },
          { providerPaymentId: ref },
        ],
      },
    });

    const isValid = !!(transaction || order);

    return NextResponse.json({ 
      success: true, 
      isValid,
      details: transaction 
        ? { amount: transaction.amount, currency: transaction.currency, date: transaction.createdAt, kind: transaction.kind }
        : order
          ? { amount: order.amount, currency: order.currency, date: order.createdAt, kind: order.planId }
          : null
    });
  } catch (error) {
    console.error("[TRANSACTION_VALIDATE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
