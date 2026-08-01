import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(messages: any[], model: string = "llama-3.3-70b-versatile") {
  const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  const keys = rawKeys.split(",").map((k) => k.trim()).filter(Boolean);
  if (keys.length === 0) {
    throw new Error("GROQ_API_KEY is not configured on the server.");
  }

  let lastError: any = null;
  for (const key of keys) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model,
          messages,
          temperature: 0.3,
          max_tokens: 2500,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json"
          }
        }
      );
      return response.data;
    } catch (error: any) {
      lastError = error;
      if (error.response?.status === 429) continue;
      throw error;
    }
  }
  throw lastError || new Error("All Groq API keys failed.");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Please provide text to evaluate readability." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert reading specialist, linguistic scientist, and editor.
Evaluate the readability of the user's text for vocabulary complexity, sentence length, target audience level, and grade level.

Respond ONLY with a JSON object in this exact schema:
{
  "fleschEase": 42,
  "gradeLevel": "Grade 12 (High School Senior)",
  "targetAudience": "Academic / Specialist",
  "readabilityStatus": "Difficult / Dense",
  "jargonWords": ["superposition", "cryptographic", "leverages"],
  "complexSentences": [
    {
      "originalSentence": "...",
      "reason": "Overly long (35+ words) with multiple clauses",
      "simplifiedSuggestion": "Clearer, split 8th-grade version..."
    }
  ],
  "simplifiedRewrites": {
    "middleSchool": "Easier 8th-grade level rewrite...",
    "highSchool": "Balanced 10th-grade level rewrite...",
    "executive": "Concise executive summary rewrite..."
  },
  "keyRecommendations": [
    "Tip 1...",
    "Tip 2..."
  ]
}`;

    const userPrompt = `TEXT TO ANALYZE:
"""
${text.trim()}
"""`;

    const groqResponse = await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    const content = groqResponse.choices[0].message.content.trim();
    const parsedData = JSON.parse(content);

    return NextResponse.json({
      success: true,
      data: parsedData
    });
  } catch (error: any) {
    console.error("[ReadabilityAssessor API Error]:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.message || "Failed to analyze readability via Groq AI." },
      { status: 500 }
    );
  }
}
