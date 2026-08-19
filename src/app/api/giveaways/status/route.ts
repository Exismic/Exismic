import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserGiveawayProgress } from "@/lib/giveaways";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const data = await getUserGiveawayProgress(user?.id || null);

    return NextResponse.json({
      success: true,
      ...data,
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split("@")[0],
          }
        : null,
    });
  } catch (error: any) {
    console.error("[Giveaway Status API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch giveaway status" },
      { status: 500 }
    );
  }
}
