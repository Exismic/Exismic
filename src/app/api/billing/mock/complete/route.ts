import { NextRequest, NextResponse } from "next/server";
import { fulfillBillingOrder } from "@/lib/billing/fulfillment";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

function canUseLocalMock(req: NextRequest) {
  const mode = process.env.EXISMIC_LOCAL_PAYMENTS || process.env.LOCAL_PAYMENT_MODE;
  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(req.nextUrl.hostname);
  return process.env.NODE_ENV !== "production" && isLocalHost && mode === "mock";
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  if (!canUseLocalMock(req)) {
    return NextResponse.redirect(`${origin}/billing/cancel?reason=mock_disabled`);
  }

  const orderId = req.nextUrl.searchParams.get("order");
  const type = req.nextUrl.searchParams.get("type") === "credits" ? "credits" : "pro";
  const credits = req.nextUrl.searchParams.get("credits") || "0";

  if (!orderId) {
    return NextResponse.redirect(`${origin}/billing/cancel?reason=missing_order`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== user.id || order.gateway !== "mock") {
    return NextResponse.redirect(`${origin}/billing/cancel?reason=invalid_order`);
  }

  try {
    await fulfillBillingOrder({
      orderId,
      providerPaymentId: `mock_pay_${orderId}`,
      rawMetadata: {
        localMock: true,
        completedVia: "local_mock_checkout",
      },
    });

    const params = new URLSearchParams({
      gateway: "mock",
      type,
      credits,
    });
    return NextResponse.redirect(`${origin}/billing/success?${params.toString()}`);
  } catch (error) {
    console.error("[Billing] Mock completion failed:", error);
    return NextResponse.redirect(`${origin}/billing/cancel?reason=mock_completion_failed`);
  }
}
