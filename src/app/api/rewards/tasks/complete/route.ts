import { publicJson } from "@/lib/public-json";
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { completeRewardTask, getTodayTrivia, saveUserRewardProfile } from "@/lib/rewards";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return publicJson({ error: "Please sign in to earn Reward Points." }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, answers, pollOptionId, proofUrl, selectedGoalId } = body;

    // Handle goal setting update
    if (selectedGoalId) {
      await saveUserRewardProfile(user.id, { selectedGoalId });
      return publicJson({ success: true, selectedGoalId });
    }

    if (!taskId) {
      return publicJson({ error: "Missing taskId" }, { status: 400 });
    }

    const result = await completeRewardTask(user.id, taskId, {
      answers,
      pollOptionId,
      proofUrl,
    });

    if (!result.success) {
      return publicJson({ error: result.error }, { status: 400 });
    }

    // If quiz completed, also provide trivia solutions for client review
    let triviaReview = null;
    if (taskId === "daily_quiz") {
      triviaReview = getTodayTrivia();
    }

    return publicJson({
      success: true,
      pointsAwarded: result.pointsAwarded,
      newTotal: result.newTotal,
      streak: result.streak,
      triviaReview,
    });
  } catch (err) {
    console.error("[API_REWARDS_COMPLETE] Error:", err);
    return publicJson({ error: "Failed to process task completion" }, { status: 500 });
  }
}
