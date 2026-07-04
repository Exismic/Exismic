import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-security";

export async function POST() {
  const authUser = await requireApiUser();
  if (authUser instanceof NextResponse) return authUser;

  return NextResponse.json(
    {
      error: "This server endpoint has been retired. PDF pages are rendered securely in your browser by the PDF to Image tool.",
      toolUrl: "/tools/pdf/to-img",
    },
    { status: 410 },
  );
}
