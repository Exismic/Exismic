import { publicJson } from "@/lib/public-json";
import { createClient } from "@/utils/supabase/server";
import { getUserPurchasedGifts } from "@/lib/gifts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return publicJson({ error: "Unauthorized" }, { status: 401 });
    }

    const gifts = await getUserPurchasedGifts(user.id);

    return publicJson({
      success: true,
      gifts,
      totalGifts: gifts.length,
      unclaimedCount: gifts.filter((g) => !g.isRedeemed).length,
    });
  } catch (error) {
    console.error("[API_USER_GIFTS_GET_ERROR]", error);
    return publicJson({ error: "Failed to load purchased gifts" }, { status: 500 });
  }
}
