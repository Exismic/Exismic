import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { buyStreakShield, getUserCredits } from "@/lib/credits";
import { getOrCreateUser } from "@/lib/user-access";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credits = await getUserCredits(user.id);
    if (!credits) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      streakShields: credits.streakShields ?? 0,
      streakFreezeUsedAt: credits.streakFreezeUsedAt || null,
    });
  } catch (err) {
    console.error("[API_STREAK_SHIELD_GET]", err);
    return NextResponse.json({ error: "Failed to get shield info" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(user);

    const result = await buyStreakShield(user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to purchase Streak Shield" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      streakShields: result.streakShields,
      credits: result.credits,
    });
  } catch (err) {
    console.error("[API_STREAK_SHIELD_POST]", err);
    return NextResponse.json({ error: "Failed to purchase shield" }, { status: 500 });
  }
}
