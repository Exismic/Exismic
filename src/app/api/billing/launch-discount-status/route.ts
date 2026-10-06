import { publicJson } from "@/lib/public-json";
import { createClient } from "@/utils/supabase/server";
import { checkUserLaunchDiscountEligibility } from "@/lib/billing/launch-discount";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const eligibility = await checkUserLaunchDiscountEligibility(user?.id);
    return publicJson(eligibility);
  } catch (error) {
    console.error("[LaunchDiscountStatus] GET error:", error);
    return publicJson({ eligible: false, error: "Internal error" }, { status: 500 });
  }
}
