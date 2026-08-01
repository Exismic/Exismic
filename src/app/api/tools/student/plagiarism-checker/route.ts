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
          temperature: 0.2,
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
    const { doc1, doc2 } = body;

    if (!doc1 || !doc2 || !doc1.trim() || !doc2.trim()) {
      return NextResponse.json(
        { error: "Please provide text in both Document 1 and Document 2." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert academic plagiarism auditor, semantic text analyst, and linguistic diff engine.
Compare Document 1 (Original Source) against Document 2 (Draft to Check).

Analyze exact verbatim overlaps, semantic paraphrasing (ideas reworded using synonyms), and unique text.

Respond ONLY with a JSON object in this exact schema:
{
  "exactMatchScore": 45,
  "semanticSimilarityScore": 82,
  "riskLevel": "High Plagiarism Risk" | "Moderate Paraphrase Risk" | "Low Risk / Original",
  "summary": "Detailed overall analysis explaining key overlaps, paraphrased sections, and recommendations.",
  "sentenceAnalysis": [
    {
      "text": "Sentence from Document 2...",
      "status": "exact_copy" | "paraphrased" | "original",
      "matchedSourceSentence": "Corresponding sentence from Document 1 if applicable or empty",
      "similarityScore": 95,
      "suggestion": "Recommendation on how to cite or rewrite to avoid plagiarism..."
    }
  ]
}`;

    const userPrompt = `DOCUMENT 1 (ORIGINAL SOURCE):
"""
${doc1.trim()}
"""

DOCUMENT 2 (DRAFT TO CHECK):
"""
${doc2.trim()}
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
    console.error("[PlagiarismChecker API Error]:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.message || "Failed to run plagiarism diff check via Groq AI." },
      { status: 500 }
    );
  }
}
