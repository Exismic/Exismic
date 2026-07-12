import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "This server endpoint has been retired. PDF pages are rendered securely in your browser by the PDF to Image tool.",
      toolUrl: "/tools/pdf/to-img",
    },
    { status: 410 },
  );
}
