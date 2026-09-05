import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { claimStreakMilestone, getUserCredits, STREAK_MILESTONES } from "@/lib/credits";
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

    const rawClaimed = credits.streakMilestonesClaimed;
    const claimed: string[] = Array.isArray(rawClaimed)
      ? (rawClaimed as unknown as string[])
      : [];
    const currentStreak = credits.dailyStreak || 0;

    const milestones = Object.entries(STREAK_MILESTONES).map(([dayStr, config]) => {
      const day = Number(dayStr);
      const isClaimed = claimed.includes(dayStr);
      const isEligible = currentStreak >= day && !isClaimed;

      return {
        day,
        ...config,
        isClaimed,
        isEligible,
      };
    });

    return NextResponse.json({
      success: true,
      currentStreak,
      milestones,
    });
  } catch (err) {
    console.error("[API_STREAK_MILESTONES_GET]", err);
    return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(user);

    const body = await request.json();
    const milestoneDay = Number(body?.milestoneDay);

    if (!milestoneDay) {
      return NextResponse.json({ error: "Missing milestoneDay" }, { status: 400 });
    }

    const result = await claimStreakMilestone(user.id, milestoneDay);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to claim milestone" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      milestone: result.milestone,
      credits: result.credits,
      shieldAwarded: result.shieldAwarded,
    });
  } catch (err) {
    console.error("[API_STREAK_MILESTONES_POST]", err);
    return NextResponse.json({ error: "Failed to process milestone claim" }, { status: 500 });
  }
}
