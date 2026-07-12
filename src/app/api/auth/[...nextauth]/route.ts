import { NextResponse } from "next/server";

function legacyAuthDisabled() {
  return NextResponse.json(
    { error: "This authentication endpoint is no longer available." },
    { status: 410 },
  );
}

export const GET = legacyAuthDisabled;
export const POST = legacyAuthDisabled;
