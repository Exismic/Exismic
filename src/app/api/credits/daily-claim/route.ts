import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { claimDailyShopCredits, getCreditTotal } from "@/lib/credits";
import { getOrCreateUser } from "@/lib/user-access";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(user);

    const result = await claimDailyShopCredits(user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          alreadyClaimed: result.alreadyClaimed || false,
          error: result.error || "Daily reward unavailable.",
          amount: result.amount,
          rarity: result.rarity,
        },
        { status: result.alreadyClaimed ? 409 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      amount: result.amount,
      rarity: result.rarity,
      type: result.type,
      credits: result.credits,
      totalCredits: result.credits ? getCreditTotal(result.credits) : undefined,
    });
  } catch (error) {
    console.error("[CreditsShopClaim]", error);
    return NextResponse.json(
      { error: "Could not claim today's reward." },
      { status: 500 }
    );
  }
}
