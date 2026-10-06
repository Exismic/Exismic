import { publicJson } from "@/lib/public-json";
import { NextRequest } from "next/server";
import { POST as handleBgRemove } from "@/app/api/tools/image/bg-remove/route";

export async function POST(req: NextRequest) {
  try {
    return await handleBgRemove(req);
  } catch (error) {
    console.error("[/api/remove-bg] Error forwarding to bg-remove tool:", error);
    return publicJson(
      { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
