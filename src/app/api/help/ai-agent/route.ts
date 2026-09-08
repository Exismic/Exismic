import { NextRequest, NextResponse } from "next/server";
import { GROQ_TEXT_MODELS } from "@/lib/ai-models";
import { EXISMIC_SYSTEM_PROMPT } from "@/lib/support/exismic-knowledge";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
    const keys = rawKeys.split(",").map((k) => k.trim()).filter(Boolean);

    // Dynamic user context prompt
    let userPromptSection = "\n\n### USER SESSION CONTEXT:\nUser is currently a Guest (not logged in).";
    if (userContext && (userContext.email || userContext.name)) {
      userPromptSection = `\n\n### CURRENT LOGGED-IN USER DETAILS:
- Name: ${userContext.name || "N/A"}
- Email: ${userContext.email || "N/A"}
- Membership Plan: ${userContext.isPro ? "Pro (VIP Member)" : "Free Tier"}
- Available Credit Balance: ${userContext.credits !== undefined ? userContext.credits : "N/A"} credits
- Sparks Treasury Balance: ${userContext.sparks !== undefined ? userContext.sparks : 0} ⚡
- Daily Login Streak: ${userContext.dailyStreak || 0} days
- Active Streak Shields: ${userContext.streakShields !== undefined ? userContext.streakShields : 0} / 3
You have direct awareness of this user's account. If the user asks about their own name, email, subscription status, plan, credit balance, Sparks balance, or streak shields, answer them accurately and directly with their information above!`;
    }

    // Build chat context with system knowledge prompt
    const fullMessages = [
      { role: "system", content: `${EXISMIC_SYSTEM_PROMPT}${userPromptSection}` },
      ...messages.slice(-10).map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: String(m.content || "").slice(0, 3000),
      })),
    ];

    if (!keys.length) {
      // Fallback response if API key is not configured locally
      return NextResponse.json({
        reply: "Hi! I am the Exismic AI Support Assistant. Our support desk is currently running in local offline mode, but you can explore tools at /shop, /pro, and /developer/docs, or email us directly at support@exismic.xyz."
      });
    }

    let reply = "";
    let lastError: any = null;

    // Iterate through models and keys
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
              messages: fullMessages,
              temperature: 0.4,
              max_tokens: 650,
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            lastError = new Error(`Model ${model} failed (${response.status}): ${errText.slice(0, 100)}`);
            continue;
          }

          const data = await response.json();
          reply = data?.choices?.[0]?.message?.content?.trim() || "";
          if (reply) break;
        } catch (err) {
          lastError = err;
          continue;
        }
      }
      if (reply) break;
    }

    if (!reply) {
      return NextResponse.json({
        reply: "I apologize, but I encountered a momentary connection issue. You can reach out directly to the Exismic support team at support@exismic.xyz or file a ticket."
      });
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("AI Support Agent Error:", error);
    return NextResponse.json(
      { error: "Failed to generate support response." },
      { status: 500 }
    );
  }
}
