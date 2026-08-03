import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discountOrder = await prisma.paymentOrder.findFirst({
      where: {
        userId: user.id,
        gateway: "retention_discount",
      },
    });

    return NextResponse.json({
      success: true,
      hasUsedDiscount: Boolean(discountOrder),
    });
  } catch (error) {
    console.error("[RetentionStatus] Error checking retention discount status:", error);
    return NextResponse.json({ hasUsedDiscount: false }, { status: 500 });
  }
}
