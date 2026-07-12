import { NextRequest, NextResponse } from "next/server";
import { fulfillBillingOrder } from "@/lib/billing/fulfillment";
import { capturePayPalOrder, getPayPalCapture } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

type CaptureBody = {
  paypalOrderId?: string;
};

function amountsMatch(actual: number, expectedMinor: number) {
  return Math.round(actual * 100) === expectedMinor;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { paypalOrderId } = (await req.json()) as CaptureBody;
    if (!paypalOrderId) return NextResponse.json({ error: "Missing PayPal order id." }, { status: 400 });

    const paymentOrder = await prisma.paymentOrder.findFirst({
      where: { providerOrderId: paypalOrderId, gateway: "paypal" },
    });

    if (!paymentOrder || paymentOrder.userId !== user.id) {
      return NextResponse.json({ error: "Payment order not found for this account." }, { status: 404 });
    }

    if (paymentOrder.status === "paid") {
      return NextResponse.json({ success: true, alreadyProcessed: true, orderId: paymentOrder.id });
    }

    const capture = await capturePayPalOrder(paypalOrderId);
    const parsed = getPayPalCapture(capture);

    if (String(parsed.status).toUpperCase() !== "COMPLETED") {
      return NextResponse.json({ error: "PayPal payment is not completed." }, { status: 400 });
    }

    if (parsed.currency !== paymentOrder.currency || !amountsMatch(parsed.amount, paymentOrder.amount)) {
      return NextResponse.json({ error: "PayPal payment amount or currency does not match this order." }, { status: 400 });
    }

    const result = await fulfillBillingOrder({
      orderId: paymentOrder.id,
      providerPaymentId: parsed.captureId,
      rawMetadata: { verifiedBy: "paypal_capture", paypalCapture: capture },
    });

    return NextResponse.json({ success: true, alreadyProcessed: result.alreadyProcessed, orderId: paymentOrder.id });
  } catch (error) {
    console.error("[Billing] PayPal capture failed:", error);
    const message = process.env.NODE_ENV === "production"
      ? "Could not verify PayPal payment. Please contact support if you were charged."
      : error instanceof Error ? error.message : "Could not capture PayPal payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
