import { publicJson } from "@/lib/public-json";
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redeemRewardWithPoints } from "@/lib/rewards";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return publicJson({ error: "Please sign in to redeem rewards." }, { status: 401 });
    }

    const body = await request.json();
    const { rewardId } = body;

    if (!rewardId) {
      return publicJson({ error: "Missing rewardId" }, { status: 400 });
    }

    const result = await redeemRewardWithPoints(user.id, rewardId);

    if (!result.success) {
      return publicJson({ error: result.error }, { status: 400 });
    }

    return publicJson({
      success: true,
      reward: result.reward,
      voucherCode: result.voucherCode,
      remainingPoints: result.remainingPoints,
    });
  } catch (err) {
    console.error("[API_REWARDS_REDEEM] Error:", err);
    return publicJson({ error: "Failed to process reward redemption" }, { status: 500 });
  }
}
