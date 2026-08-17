import { NextRequest, NextResponse } from "next/server";
import { getOptionalApiUser, checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import { deductCredits } from "@/lib/credits";
import { DEFAULT_GROQ_TEXT_MODEL } from "@/lib/ai-models";

export const runtime = "nodejs";
export const maxDuration = 30;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PROMPT_ENHANCE_COST = 1; // 1 credit cost

function getGroqKeys() {
  return (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

export async function POST(req: NextRequest) {
  const apiUser = await getOptionalApiUser();

  const rateLimit = checkRateLimit(
    `mc-prompt-enhance:${apiUser?.id || "guest"}:${getRequestIp(req)}`,
    apiUser ? 30 : 5,
    60 * 1000
  );
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfter);

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 2) {
      return NextResponse.json({ error: "Please enter a brief idea to enhance." }, { status: 400 });
    }

    // Deduct 1 credit if user is logged in
    if (apiUser) {
      const deduction = await deductCredits(
        apiUser.id,
        PROMPT_ENHANCE_COST,
        "minecraft-skin-prompt-enhance"
      );

      if (!deduction.success) {
        return NextResponse.json(
          { error: "Insufficient credits. You need at least 1 credit to optimize prompts." },
          { status: 402 }
        );
      }
    }

    const keys = getGroqKeys();
    if (!keys.length) {
      return NextResponse.json({ error: "AI service temporarily unavailable." }, { status: 503 });
    }

    const systemPrompt = `You are an elite Minecraft skin designer and prompt engineer.
Your task is to take a raw, simple, or rough user prompt and expand it into a vivid, modern, high-quality Minecraft skin character description.
Include specific, aesthetic details:
- Character archetype (e.g. modern anime, cyberpunk ninja, netherite shadow knight, aesthetic streetwear, forest ranger, celestial paladin)
- 3D Hair style and color with highlights (e.g. messy layered bangs, silver undercut with purple tips, spiky anime locks)
- Expressive eye color and glowing features (e.g. glowing cyan eyes, crimson demon eyes, dual-color anime eyes)
- 3D Outfit details (e.g. oversized black techwear hoodie with glowing runes, open collar jacket, enchanted emerald ranger tunic, gold-trimmed paladin armor)
- Tactical / Streetwear accessories (e.g. fingerless gloves, combat boots, high-top sneakers, cross-body sash, cyber visor, headphones)
- Clean, harmonious color palette.

Keep the output concise (2 to 3 sentences maximum, 40-75 words), direct, and ready for instant generation. Do NOT include quotes, explanations, or introductory text. Return ONLY the enhanced prompt.`;

    let enhancedPrompt = "";
    for (const key of keys) {
      try {
        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: DEFAULT_GROQ_TEXT_MODEL,
            temperature: 0.7,
            max_tokens: 200,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Enhance this Minecraft skin idea: "${prompt.trim()}"` },
            ],
          }),
          signal: AbortSignal.timeout(12_000),
        });

        if (response.ok) {
          const payload = await response.json();
          enhancedPrompt = payload?.choices?.[0]?.message?.content?.trim() || "";
          if (enhancedPrompt) break;
        }
      } catch (err) {
        console.warn("[MC Prompt Enhance Error]:", err);
      }
    }

    if (!enhancedPrompt) {
      enhancedPrompt = `${prompt.trim()} with detailed layered anime hair, glowing eyes, 3D jacket overlay with accent trims, tactical belt, and matching sneakers.`;
    }

    // Strip leading/trailing quotes if any
    enhancedPrompt = enhancedPrompt.replace(/^["']|["']$/g, "").trim();

    return NextResponse.json({
      success: true,
      enhancedPrompt,
      cost: apiUser ? PROMPT_ENHANCE_COST : 0,
    });
  } catch (error: any) {
    console.error("[MC Prompt Enhance Route Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to optimize prompt." },
      { status: 500 }
    );
  }
}
