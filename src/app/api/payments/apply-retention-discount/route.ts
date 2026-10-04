import { NextResponse } from "next/server";

// The former action recorded a local flag without changing either provider's price.
export async function POST() {
  return NextResponse.json({ success: false, error: "This renewal discount is unavailable. No billing change was made. You can manage future renewals in membership settings." }, { status: 410 });
}
