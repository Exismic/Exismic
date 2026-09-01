import { NextRequest, NextResponse } from "next/server";
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
      return NextResponse.json({ error: "Please sign in to redeem rewards." }, { status: 401 });
    }

    const body = await request.json();
    const { rewardId } = body;

    if (!rewardId) {
      return NextResponse.json({ error: "Missing rewardId" }, { status: 400 });
    }

    const result = await redeemRewardWithPoints(user.id, rewardId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      reward: result.reward,
      voucherCode: result.voucherCode,
      remainingPoints: result.remainingPoints,
    });
  } catch (err) {
    console.error("[API_REWARDS_REDEEM] Error:", err);
    return NextResponse.json({ error: "Failed to process reward redemption" }, { status: 500 });
  }
}
