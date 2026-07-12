import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "This legacy processing endpoint has been retired. Use the dedicated PDF merger, splitter, compressor, or converter endpoint.",
    },
    { status: 410 },
  );
}
