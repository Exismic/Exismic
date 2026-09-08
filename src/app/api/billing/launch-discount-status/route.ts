import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkUserLaunchDiscountEligibility } from "@/lib/billing/launch-discount";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const eligibility = await checkUserLaunchDiscountEligibility(user?.id);
    return NextResponse.json(eligibility);
  } catch (error) {
    console.error("[LaunchDiscountStatus] GET error:", error);
    return NextResponse.json({ eligible: false, error: "Internal error" }, { status: 500 });
  }
}
