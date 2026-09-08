import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Query pending gift card orders
    const pendingOrders = await prisma.paymentOrder.findMany({
      where: {
        gateway: "gift_card",
        status: "PENDING_VERIFICATION",
      },
      orderBy: { createdAt: "desc" },
    });

    const userIds = Array.from(new Set(pendingOrders.map((o) => o.userId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, name: true, image: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return NextResponse.json({
      success: true,
      pendingCount: pendingOrders.length,
      orders: pendingOrders.map((o) => {
        const u = userMap.get(o.userId);
        const meta = (o.metadata as Record<string, unknown>) || {};
        return {
          id: o.id,
          userId: o.userId,
          userName: u?.name || "User",
          userEmail: u?.email || meta.userEmail || "No Email",
          planId: o.planId,
          credits: o.credits,
          status: o.status,
          submittedAt: o.createdAt,
          giftCardType: meta.giftCardType || "custom",
          giftCardCode: meta.giftCardCode || "",
          planName: meta.planName || o.planId,
          isGift: Boolean(meta.isGift),
          recipientName: (meta.recipientName as string) || null,
          recipientMessage: (meta.recipientMessage as string) || null,
        };
      }),
    });
  } catch (err) {
    console.error("[GiftCardAdminQueue] Error fetching queue:", err);
    return NextResponse.json({ error: "Failed to fetch gift card queue." }, { status: 500 });
  }
}
