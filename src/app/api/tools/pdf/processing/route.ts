import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-security";

export async function POST() {
  const authUser = await requireApiUser();
  if (authUser instanceof NextResponse) return authUser;

  return NextResponse.json(
    {
      error: "This legacy processing endpoint has been retired. Use the dedicated PDF merger, splitter, compressor, or converter endpoint.",
    },
    { status: 410 },
  );
}
