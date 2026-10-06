import { publicJson } from "@/lib/public-json";
import { getAllApiTools } from "@/lib/api-v1-registry";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/tools
 * Public endpoint to list all available tools, endpoints, credit costs, and request schemas.
 */
export async function GET() {
  const tools = getAllApiTools();
  return publicJson({
    success: true,
    totalTools: tools.length,
    version: "v1",
    baseUrl: "https://exismic.com/api/v1/tools",
    tools,
  });
}
