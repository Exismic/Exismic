import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This checkout endpoint has been retired. Refresh the page and try again." },
    { status: 410 },
  );
}
