import { NextRequest, NextResponse } from "next/server";
import { getOptionalApiUser, checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import { deductCredits } from "@/lib/credits";

export const runtime = "nodejs";
export const maxDuration = 30;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PROMPT_ENHANCE_COST = 1;

const ENHANCE_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
  "openai/gpt-oss-20b",
  "groq/compound",
];

function getGroqKeys(): string[] {
  return (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

function generateSmartFallback(rawPrompt: string): string {
  const p = rawPrompt.toLowerCase();

  if (/gentleman|suit|tuxedo|victorian|aristocrat|formal|sherlock|detective/i.test(p)) {
    return `${rawPrompt.trim()} with neatly styled dark parted hair, polished round eyeglasses, tailored charcoal double-breasted coat with 3D lapels, crimson waistcoat with a gold pocket watch chain, crisp white collared shirt with a silk cravat, and formal oxford shoes.`;
  }
  if (/goth|e-girl|e-boy|aesthetic|anime|sweater|cozy|cute/i.test(p)) {
    return `${rawPrompt.trim()} with lush 3D layered curtain bangs framing expressive gradient anime eyes, oversized cozy knit sweater with a white undershirt hem peeking out, long sleeves with folded cuffs, high-waisted shorts with thigh-high stockings, and clean two-tone sneakers.`;
  }
  if (/knight|paladin|warrior|armor|crusader|medieval|king/i.test(p)) {
    return `${rawPrompt.trim()} with polished steel plate armor, engraved glowing runic breastplate, 3D shoulder pauldrons, heavy studded leather belt with an ornate buckle, dark chainmail undergarment, and armored combat greaves.`;
  }
  if (/cyber|hacker|tech|neon|futuristic|robot|droid|sci-fi/i.test(p)) {
    return `${rawPrompt.trim()} with spiky cyber hair with neon glowing highlights, an illuminated HUD visor, matte black techwear jacket with glowing circuit conduits, tactical utility harness, and glowing high-top sneakers.`;
  }
  if (/wizard|mage|sorcerer|witch|magic|arcane/i.test(p)) {
    return `${rawPrompt.trim()} with flowing mystical robes embroidered with gold celestial runes, a deep shadowed 3D cowl hood with luminous glowing eyes, gemstone talisman necklace, and leather travel boots.`;
  }
  if (/demon|shadow|reaper|oni|undead|dark/i.test(p)) {
    return `${rawPrompt.trim()} with obsidian shadowy aura, piercing glowing eyes with fiery accents, 3D horned cowl with jagged overlay trims, dark leather trench coat, and combat battle boots.`;
  }

  return `${rawPrompt.trim()} with detailed 3D layered hair with fringe highlights, expressive dual-tone eyes with catchlight sparkle, custom tailored 3D outfit overlay with fine seam stitching, thematic accessories, and textured footwear.`;
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

    const trimmedInput = prompt.trim().slice(0, 500);

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
    let enhancedPrompt = "";

    if (keys.length > 0) {
      const systemPrompt = `You are a world-class Minecraft skin designer and prompt engineer.
Your task is to take the user's specific skin idea and expand it into a vivid, stylish, ultra-detailed 2-to-3 sentence description tailored EXACTLY to their specific archetype and theme.

Rules:
1. Deeply adhere to the user's core theme (e.g. Victorian gentleman, anime aesthetic, cyberpunk techwear, fantasy knight, cozy nature, dark demon, etc.). Never insert unrelated or generic items.
2. Detail:
   - Hair: 3D layered locks, curtain bangs, halo shines, or messy fringe.
   - Eyes: Expressive gradient colors, eyelid contours, and specular catchlights.
   - Outfit: 3D layered clothing matching their theme (e.g. double-breasted coats, oversized sweaters, plate armor, cloaks, tech jackets).
   - Details & Accessories: Pocket watch chains, silk ties, glowing conduits, aglet drawstrings, thigh-high stockings, ornate buckles, or styled footwear.
3. Length: Exactly 2 to 3 complete sentences (40 to 80 words).
4. Output ONLY the enhanced skin description. Do not include quotes, conversational preamble, or markdown formatting.`;

      for (const model of ENHANCE_MODELS) {
        if (enhancedPrompt) break;
        for (const key of keys) {
          try {
            const response = await fetch(GROQ_API_URL, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model,
                temperature: 0.7,
                max_tokens: 450,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: `Enhance this Minecraft skin concept: ${trimmedInput}` },
                ],
              }),
              signal: AbortSignal.timeout(12_000),
            });

            if (response.ok) {
              const payload = await response.json();
              let text = payload?.choices?.[0]?.message?.content?.trim() || "";
              if (text) {
                // Strip all <think>...</think> blocks or unclosed think tags
                text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
                if (text.includes("</think>")) {
                  text = text.split("</think>").pop()?.trim() || "";
                }
                text = text.replace(/^<think>[\s\S]*/gi, "").trim();
                text = text.replace(/^["']|["']$/g, "").trim();

                // Ensure clean sentence ending
                const lastDot = Math.max(text.lastIndexOf("."), text.lastIndexOf("!"), text.lastIndexOf("?"));
                if (lastDot > 30) {
                  text = text.slice(0, lastDot + 1).trim();
                }

                if (text.length > 20) {
                  enhancedPrompt = text;
                  break;
                }
              }
            }
          } catch (err) {
            console.warn(`[MC Prompt Enhance Error with ${model}]:`, err);
          }
        }
      }
    }

    if (!enhancedPrompt) {
      enhancedPrompt = generateSmartFallback(trimmedInput);
    }

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
