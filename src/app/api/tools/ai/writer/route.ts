import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { deductCredits, getCreditTotal } from "@/lib/credits";
import { getToolCreditCost } from "@/lib/credit-policy";
import { requireProApiUser } from "@/lib/api-security";
import { DEFAULT_GROQ_TEXT_MODEL } from "@/lib/ai-models";

export async function POST(req: NextRequest) {
  try {
    const proUser = await requireProApiUser();
    if (proUser instanceof NextResponse) return proUser;
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (!sbUser || !sbUser.email) {
      return NextResponse.json({ error: "Please sign in to use AI Writer" }, { status: 401 });
    }

    const { prompt, tone, length, format, language } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. Credit Check (Pre-flight) via Prisma
    let user = await prisma.user.findUnique({
      where: { id: sbUser.id }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: sbUser.id,
          email: sbUser.email!,
          name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0],
          dailyCredits: 50
        }
      });
    }

    const totalCreditsAvailable = getCreditTotal(user);
    const cost = getToolCreditCost("ai-writer", 8);

    if (totalCreditsAvailable < cost) {
      return NextResponse.json({ error: "Insufficient credits. AI Writer costs 8 credits." }, { status: 403 });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "The AI text generation service is currently unavailable. Please try again later." }, { status: 500 });
    }

    const lengthInstructions = length === "Short"
      ? "Target length: Short & concise (around 120-200 words). Get straight to the point."
      : length === "Long"
      ? "Target length: Comprehensive & in-depth (around 600-1000 words). Develop ideas thoroughly with clear headings and structure."
      : "Target length: Standard balanced (around 300-500 words). Well-paced and informative.";

    const systemPrompt = `You are a world-class professional AI writing assistant.
Your goal is to generate high-quality, engaging, purposeful content tailored to the user's requirements.

CONTENT GUIDELINES:
- Format: ${format || "Article"}
- Tone of Voice: ${tone || "Professional"}
- ${lengthInstructions}
- Language: Write the entire response in ${language || "English"}.
- Formatting: Use clean, standard Markdown with appropriate headings (#, ##, ###), bullet points, and paragraph breaks for maximum readability.
- Output Rules: Respond ONLY with the requested written piece. Do NOT include conversational filler, meta-announcements, greetings like "Here is your article:", or postscripts.`;

    console.log("[AiWriter] Calling Groq Cloud API...");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_GROQ_TEXT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: length === "Long" ? 2048 : length === "Medium" ? 1024 : 512,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[AiWriter] Groq Error Detail:", JSON.stringify(errorData, null, 2));
      return NextResponse.json({ 
        error: errorData.error?.message || `Groq API Error (${response.status})` 
      }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    const debitResult = await deductCredits(sbUser.id, cost, "ai-writer");
    if (!debitResult.success) {
      return NextResponse.json({ error: debitResult.error || "Insufficient credits." }, { status: 403 });
    }

    return NextResponse.json({ content });

  } catch (error: any) {
    console.error("[AiWriter] API Error:", error);
    return NextResponse.json({ error: error.message || "An error occurred during generation." }, { status: 500 });
  }
}
