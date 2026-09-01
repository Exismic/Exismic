import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserPurchasedGifts } from "@/lib/gifts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gifts = await getUserPurchasedGifts(user.id);

    return NextResponse.json({
      success: true,
      gifts,
      totalGifts: gifts.length,
      unclaimedCount: gifts.filter((g) => !g.isRedeemed).length,
    });
  } catch (error) {
    console.error("[API_USER_GIFTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to load purchased gifts" }, { status: 500 });
  }
}
