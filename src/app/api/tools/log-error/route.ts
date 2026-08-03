import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { logToolError } from "@/lib/tool-error-logger";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { toolId, toolName, errorMessage, errorStack, metadata } = body;

    if (!toolId || !errorMessage) {
      return NextResponse.json({ error: "Missing required fields toolId or errorMessage" }, { status: 400 });
    }

    const log = await logToolError({
      toolId: String(toolId),
      toolName: String(toolName || toolId),
      userId: user?.id || null,
      userEmail: user?.email || null,
      errorMessage: String(errorMessage),
      errorStack: errorStack ? String(errorStack) : null,
      metadata: metadata && typeof metadata === "object" ? metadata : null,
    });

    return NextResponse.json({ success: true, logId: log?.id });
  } catch (error) {
    console.error("[ToolLogErrorAPI] Exception:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
