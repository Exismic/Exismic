import { NextRequest, NextResponse } from "next/server";
import { POST as handleBgRemove } from "@/app/api/tools/image/bg-remove/route";

export async function POST(req: NextRequest) {
  try {
    return await handleBgRemove(req);
  } catch (error) {
    console.error("[/api/remove-bg] Error forwarding to bg-remove tool:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
