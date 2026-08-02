import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { fulfillBillingOrder } from "@/lib/billing/fulfillment";
import { sendGiftCardApprovedEmail, sendGiftCardRejectedEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: adminUser } } = await supabase.auth.getUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const dbAdmin = await prisma.user.findUnique({
      where: { id: adminUser.id },
      select: { role: true },
    });

    const isDev = process.env.NODE_ENV !== "production";
    if (dbAdmin?.role !== "admin" && dbAdmin?.role !== "superadmin" && !isDev) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { orderId, action, rejectionReason } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: "Missing required orderId or action." }, { status: 400 });
    }

    const order = await prisma.paymentOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ error: "Order has already been fulfilled." }, { status: 409 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { email: true },
    });

    const meta = (order.metadata as Record<string, unknown>) || {};
    const planName = (meta.planName as string) || order.planId;
    const targetEmail = targetUser?.email || (meta.userEmail as string);

    if (action === "reject") {
      const reason = rejectionReason || "Code was invalid, expired, or already redeemed.";

      await prisma.paymentOrder.update({
        where: { id: orderId },
        data: {
          status: "failed",
          metadata: {
            ...meta,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason,
          },
        },
      });

      if (targetEmail) {
        await sendGiftCardRejectedEmail(targetEmail, {
          planName,
          orderId: order.id,
          reason,
        }).catch((err) => console.error("Failed sending rejection email:", err));
      }

      return NextResponse.json({
        success: true,
        status: "REJECTED",
        message: "Gift card submission rejected and user notified via email.",
      });
    }

    if (action === "approve") {
      // Grant credits or Pro status using fulfillBillingOrder
      const result = await fulfillBillingOrder({
        orderId: order.id,
        providerPaymentId: `gift_approval_${order.id}_${Date.now()}`,
        rawMetadata: {
          approvedAt: new Date().toISOString(),
          approvedBy: adminUser.email,
        },
      });

      if (targetEmail) {
        const isPro = order.planId === "pro";
        await sendGiftCardApprovedEmail(targetEmail, {
          planName,
          orderId: order.id,
          credits: order.credits,
          isPro,
        }).catch((err) => console.error("Failed sending approval email:", err));
      }

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        message: `Order #${orderId.slice(-8)} approved, fulfilled, and confirmation email sent!`,
        result,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("[GiftCardFulfill] Error fulfilling order:", err);
    return NextResponse.json({ error: "Failed to process gift card fulfillment." }, { status: 500 });
  }
}
