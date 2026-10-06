import { publicJson } from "@/lib/public-json";
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return publicJson({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const orders = await prisma.paymentOrder.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return publicJson({
      success: true,
      orders: orders.map((o) => {
        const meta = (o.metadata as Record<string, unknown>) || {};
        const code = (meta.giftCardCode as string) || "";
        const maskedCode = code
          ? code.length > 8
            ? `${code.slice(0, 4)}••••${code.slice(-4)}`
            : "••••••••"
          : null;

        return {
          id: o.id,
          planId: o.planId,
          planName: (meta.planName as string) || (o.planId === "pro" ? "Exismic Pro" : "Credit Pack"),
          gateway: o.gateway,
          status: o.status, // "PENDING_VERIFICATION" | "paid" | "failed" | "REJECTED" | "COMPLETED"
          amount: o.amount,
          currency: o.currency,
          createdAt: o.createdAt,
          giftCardType: meta.giftCardType || null,
          maskedCode,
          rejectionReason: meta.rejectionReason || null,
        };
      }),
    });
  } catch (err) {
    console.error("[MyOrders] Error fetching billing history:", err);
    return publicJson({ error: "Failed to fetch purchase history." }, { status: 500 });
  }
}
