import { NextRequest, NextResponse } from "next/server";
import { verifyAndAuthenticateApiKey } from "@/lib/api-keys";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const auth = await verifyAndAuthenticateApiKey(authHeader);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return NextResponse.json({
    id: auth.user.id,
    name: auth.user.name,
    email: auth.user.email,
    plan: auth.plan,
    credits: auth.credits,
    dailyCredits: auth.user.dailyCredits,
    bonusCredits: auth.user.bonusCredits,
    lifetimeCredits: auth.user.lifetimeCredits,
    status: auth.user.status,
  });
}
