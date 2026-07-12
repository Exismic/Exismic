import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { deductCredits, getCreditTotal } from "@/lib/credits";
import { getToolCreditCost } from "@/lib/credit-policy";
import { requireProApiUser } from "@/lib/api-security";

export async function POST(req: Request) {
  try {
    const proUser = await requireProApiUser();
    if (proUser instanceof NextResponse) return proUser;
    const supabase = await createClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (!sbUser || !sbUser.email) {
      return NextResponse.json({ error: "Please sign in to generate code" }, { status: 401 });
    }

    // Check credits
    let user = await prisma.user.findUnique({ where: { id: sbUser.id } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: sbUser.id,
          email: sbUser.email,
          name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email.split('@')[0],
          dailyCredits: 50,
          plan: 'free'
        }
      });
    }

    // Credit system (Sync with Prisma)
    const totalCreditsAvailable = getCreditTotal(user);
    const cost = getToolCreditCost("ai-code", 8);
    if (totalCreditsAvailable < cost) {
      return NextResponse.json({ error: `Insufficient credits. Code generation costs ${cost} credits.` }, { status: 403 });
    }

    const { prompt, language, framework } = await req.json();

    const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
    const groqKeys = rawKeys.split(",").map(k => k.trim()).filter(Boolean);
    
    if (groqKeys.length === 0) {
      console.error("[Code Gen] No GROQ_API_KEY found in environment");
      return NextResponse.json({ error: "AI Service Configuration Error" }, { status: 500 });
    }

    async function callGroq(payload: any) {
      let lastError = null;
      for (const key of groqKeys) {
        try {
          const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", payload, {
            headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
            timeout: 30000
          });
          return res.data;
        } catch (err: any) {
          lastError = err;
          if (err.response?.status === 429) continue;
          throw err;
        }
      }
      throw lastError || new Error("All AI keys exhausted or failed");
    }

    const systemPrompt = `You are Exismic Code Genius, an elite AI software engineer. 
Your goal is to generate clean, modern, and highly efficient code.

RESPONSE STRUCTURE (STRICTLY FOLLOW THIS):
1. [CODE_START]
   <Your clean code block here>
   [CODE_END]

2. [GUIDE_START]
   <A concise, professional step-by-step implementation guide>
   [GUIDE_END]

3. [SUGGESTIONS_START]
   - Suggestion 1 (Plain text only, max 10 words)
   - Suggestion 2 (Plain text only, max 10 words)
   - Suggestion 3 (Plain text only, max 10 words)
   [SUGGESTIONS_END]

Instructions:
- Target Language: ${language || 'Auto-detect'}
- Target Framework: ${framework || 'None'}
- Never include instructions inside the code block.
- Ensure delimiters are on their own lines.`;

    const response = await callGroq({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.2, // Lower temperature for more accurate code
      max_tokens: 2048
    });

    const codeOutput = response.choices[0].message.content;

    const debitResult = await deductCredits(user.id, cost, "ai-code");
    if (!debitResult.success) {
      return NextResponse.json({ error: debitResult.error || "Insufficient credits." }, { status: 403 });
    }

    await prisma.job.create({
      data: {
        userId: user.id,
        toolType: 'ai-code',
        status: 'COMPLETED',
        originalUrl: prompt,
        resultUrl: codeOutput,
        metadata: { language, framework, model: "llama-3.3-70b-versatile" }
      }
    });

    return NextResponse.json({ code: codeOutput });

  } catch (error: any) {
    console.error("Code Gen Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to generate code. Please try again." }, { status: 500 });
  }
}
