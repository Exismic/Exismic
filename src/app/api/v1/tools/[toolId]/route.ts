import { NextRequest, NextResponse } from "next/server";
import { verifyAndAuthenticateApiKey } from "@/lib/api-keys";
import { deductCredits, getUserCredits, getCreditTotal } from "@/lib/credits";
import { getApiToolDefinition, API_TOOL_REGISTRY } from "@/lib/api-v1-registry";
import { checkDistributedRateLimit, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import { GROQ_TEXT_MODELS } from "@/lib/ai-models";

export const dynamic = "force-dynamic";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroqDirect(messages: { role: string; content: string }[], temperature = 0.5, jsonMode = false, maxTokens = 3000) {
  const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  const keys = rawKeys.split(",").map((k) => k.trim()).filter(Boolean);
  if (!keys.length) throw new Error("AI provider unconfigured on server.");

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
            ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = new Error(`Model ${model} failed (${response.status}): ${errText.slice(0, 150)}`);
          continue;
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error("All AI models and API keys exhausted.");
}

/**
 * Universal Developer v1 Endpoint: POST /api/v1/tools/:toolId
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  try {
    const { toolId } = await params;
    const tool = getApiToolDefinition(toolId);

    if (!tool) {
      return NextResponse.json(
        {
          error: `Tool '${toolId}' not found. Available tools: ${Object.keys(API_TOOL_REGISTRY).join(", ")}`,
          code: "TOOL_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const auth = await verifyAndAuthenticateApiKey(authHeader);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error, code: "UNAUTHORIZED" }, { status: auth.status });
    }

    const ip = getRequestIp(req);
    const rateCheck = await checkDistributedRateLimit(`api-v1-universal:${auth.userId || ip}`, 60, 60 * 1000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.retryAfter);
    }

    const currentCredits = await getUserCredits(auth.userId);
    const available = currentCredits ? getCreditTotal(currentCredits) : 0;
    if (available < tool.creditCost) {
      return NextResponse.json(
        {
          error: `Insufficient credits for '${tool.name}'. Required: ${tool.creditCost}, Available: ${available}`,
          code: "INSUFFICIENT_CREDITS",
          availableCredits: available,
          requiredCredits: tool.creditCost,
        },
        { status: 402 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Dynamic execution router based on toolId
    let resultData: any = null;

    if (toolId === "generate-text") {
      const { prompt, systemPrompt, temperature = 0.7 } = body;
      if (!prompt) return NextResponse.json({ error: "Missing 'prompt' parameter" }, { status: 400 });
      const messages = [];
      if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
      messages.push({ role: "user", content: prompt });
      const text = await callGroqDirect(messages, temperature);
      resultData = { text };
    } else if (toolId === "essay-outline") {
      const { topic, paperType = "argumentative", academicTone = "standard" } = body;
      if (!topic) return NextResponse.json({ error: "Missing 'topic' parameter" }, { status: 400 });
      const systemPrompt = "You are a university professor. Generate a detailed essay outline. Respond ONLY in valid JSON with fields: thesisOptions, sections, scholarKeywords.";
      const raw = await callGroqDirect(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Topic: ${topic}\nFormat: ${paperType}\nTone: ${academicTone}` },
        ],
        0.5,
        true
      );
      resultData = JSON.parse(raw);
    } else if (toolId === "plagiarism-checker") {
      const { doc1, doc2 } = body;
      if (!doc1 || !doc2) return NextResponse.json({ error: "Missing 'doc1' and 'doc2' parameters" }, { status: 400 });
      const systemPrompt = "Compare Document 1 vs Document 2 for plagiarism and semantic overlap. Respond ONLY in JSON with exactMatchScore, semanticSimilarityScore, riskLevel, summary.";
      const raw = await callGroqDirect(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: `DOC1:\n${doc1}\n\nDOC2:\n${doc2}` },
        ],
        0.2,
        true
      );
      resultData = JSON.parse(raw);
    } else if (toolId === "readability-assessor") {
      const { text } = body;
      if (!text) return NextResponse.json({ error: "Missing 'text' parameter" }, { status: 400 });
      const systemPrompt = "Analyze readability, Flesch score, grade level, and jargon words. Respond ONLY in JSON with fleschEase, gradeLevel, targetAudience, jargonWords.";
      const raw = await callGroqDirect(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Text:\n${text}` },
        ],
        0.3,
        true
      );
      resultData = JSON.parse(raw);
    } else if (toolId === "landing-page-generator") {
      const { prompt, style = "modern" } = body;
      if (!prompt) return NextResponse.json({ error: "Missing 'prompt' parameter" }, { status: 400 });
      const systemPrompt = `Generate a single-file Tailwind HTML landing page. Return ONLY raw HTML starting with <!DOCTYPE html> and ending with </html>. Style: ${style}`;
      const raw = await callGroqDirect(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create landing page for: ${prompt}` },
        ],
        0.5,
        false,
        4500
      );
      let clean = raw.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
      resultData = { html: clean };
    } else {
      return NextResponse.json({ error: `Tool execution logic not configured for '${toolId}'` }, { status: 501 });
    }

    // Atomically deduct credits
    const debit = await deductCredits(auth.userId, tool.creditCost, `api-${toolId}`);
    const remainingCredits = debit.data ? getCreditTotal(debit.data) : available - tool.creditCost;

    return NextResponse.json({
      success: true,
      toolId,
      toolName: tool.name,
      data: resultData,
      usage: {
        creditsDeducted: tool.creditCost,
        remainingCredits,
      },
    });
  } catch (error: any) {
    console.error("[Universal API Route Error]:", error);
    return NextResponse.json({ error: error.message || "Execution error", code: "EXECUTION_FAILED" }, { status: 500 });
  }
}
