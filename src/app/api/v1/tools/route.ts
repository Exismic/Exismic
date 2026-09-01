import { NextResponse } from "next/server";
import { getAllApiTools } from "@/lib/api-v1-registry";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/tools
 * Public endpoint to list all available tools, endpoints, credit costs, and request schemas.
 */
export async function GET() {
  const tools = getAllApiTools();
  return NextResponse.json({
    success: true,
    totalTools: tools.length,
    version: "v1",
    baseUrl: "https://exismic.com/api/v1/tools",
    tools,
  });
}
