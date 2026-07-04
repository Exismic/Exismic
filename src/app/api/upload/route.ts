import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "This legacy upload endpoint has been retired. Use the dedicated tool API route for the selected Lumora tool.",
    },
    { status: 410 }
  );
}
