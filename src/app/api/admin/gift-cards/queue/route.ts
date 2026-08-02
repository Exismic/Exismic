import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Verify admin role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const isDev = process.env.NODE_ENV !== "production";
    if (dbUser?.role !== "admin" && dbUser?.role !== "superadmin" && !isDev) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
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
        };
      }),
    });
  } catch (err) {
    console.error("[GiftCardAdminQueue] Error fetching queue:", err);
    return NextResponse.json({ error: "Failed to fetch gift card queue." }, { status: 500 });
  }
}
