import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  getUserRewardProfile,
  getTodayTrivia,
  getTodayPoll,
  REWARDS_CATALOG,
  EARNING_QUESTS,
} from "@/lib/rewards";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const todayTriviaFull = getTodayTrivia();
    // Sanitize trivia questions for the client (omit correctIndex to prevent cheating)
    const sanitizedTrivia = todayTriviaFull.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    const todayPoll = getTodayPoll();

    if (!user?.id) {
      // Return guest default profile
      return NextResponse.json(
        {
          success: true,
          isLoggedIn: false,
          profile: {
            userId: "guest",
            points: 0,
            lifetimePoints: 0,
            currentStreak: 0,
            lastCheckInDate: null,
            hasCheckedInToday: false,
            hasCompletedQuizToday: false,
            hasVotedPollToday: false,
            selectedGoalId: "reward_pro_30d",
            completedQuestIds: [],
            recentRedemptions: [],
          },
          todayTrivia: sanitizedTrivia,
          todayPoll,
          catalog: REWARDS_CATALOG,
          quests: EARNING_QUESTS,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    const profile = await getUserRewardProfile(user.id);

    return NextResponse.json(
      {
        success: true,
        isLoggedIn: true,
        profile,
        todayTrivia: sanitizedTrivia,
        todayPoll,
        catalog: REWARDS_CATALOG,
        quests: EARNING_QUESTS,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("[API_REWARDS_PROFILE] Error:", err);
    return NextResponse.json({ error: "Failed to load rewards profile" }, { status: 500 });
  }
}
