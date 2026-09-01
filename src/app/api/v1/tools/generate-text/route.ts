import { NextRequest, NextResponse } from "next/server";
import { verifyAndAuthenticateApiKey } from "@/lib/api-keys";
import { deductCredits, getUserCredits, getCreditTotal } from "@/lib/credits";
import { getToolCreditCost } from "@/lib/credit-policy";
import { GROQ_TEXT_MODELS, DEFAULT_GROQ_TEXT_MODEL } from "@/lib/ai-models";
import { checkDistributedRateLimit, getRequestIp, rateLimitResponse } from "@/lib/api-security";

export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const TOOL_COST = getToolCreditCost("api-generate-text", 5);

async function callGroq(messages: { role: string; content: string }[], temperature = 0.7, maxTokens = 2048) {
  const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  const keys = rawKeys.split(",").map((k) => k.trim()).filter(Boolean);
  if (!keys.length) {
    throw new Error("AI provider is currently unconfigured on server.");
  }

  let lastError: Error | null = null;

  for (const model of GROQ_TEXT_MODELS) {
    for (const activeKey of keys) {
      try {
        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${activeKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = new Error(`Model ${model} failed (${response.status}): ${errText.slice(0, 150)}`);
          continue;
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return { text, model };
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error("All AI models and API keys exhausted.");
}

/**
 * POST /api/v1/tools/generate-text
 * Authenticated via Bearer ex_live_... API key
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const auth = await verifyAndAuthenticateApiKey(authHeader);

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error, code: "UNAUTHORIZED" }, { status: auth.status });
    }

    const ip = getRequestIp(req);
    const rateCheck = await checkDistributedRateLimit(`api-v1-text:${auth.userId || ip}`, 60, 60 * 1000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.retryAfter);
    }

    const currentCredits = await getUserCredits(auth.userId);
    const available = currentCredits ? getCreditTotal(currentCredits) : 0;
    if (available < TOOL_COST) {
      return NextResponse.json(
        {
          error: `Insufficient credits. Required: ${TOOL_COST}, Available: ${available}`,
          code: "INSUFFICIENT_CREDITS",
          availableCredits: available,
          requiredCredits: TOOL_COST,
        },
        { status: 402 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { prompt, systemPrompt, temperature = 0.7, maxTokens = 2048 } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Field 'prompt' is required and must be a non-empty string.", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const messages: { role: string; content: string }[] = [];
    if (systemPrompt && typeof systemPrompt === "string") {
      messages.push({ role: "system", content: systemPrompt.trim() });
    }
    messages.push({ role: "user", content: prompt.trim() });

    const completion = await callGroq(
      messages,
      typeof temperature === "number" ? Math.max(0, Math.min(2, temperature)) : 0.7,
      typeof maxTokens === "number" ? Math.max(1, Math.min(4096, maxTokens)) : 2048
    );

    // Atomically deduct credits
    const debit = await deductCredits(auth.userId, TOOL_COST, "api-generate-text");
    const remainingCredits = debit.data ? getCreditTotal(debit.data) : available - TOOL_COST;

    return NextResponse.json({
      success: true,
      text: completion.text,
      model: completion.model,
      usage: {
        creditsDeducted: TOOL_COST,
        remainingCredits,
      },
    });
  } catch (error: any) {
    console.error("[API v1 generate-text Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate text completion", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
