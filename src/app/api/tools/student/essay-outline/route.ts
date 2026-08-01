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
          temperature: 0.7,
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
    const { topic, paperType, academicTone } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Please provide a valid essay topic." }, { status: 400 });
    }

    const systemPrompt = `You are a distinguished university professor and academic thesis advisor.
Given an essay topic, paper format, and academic tone, generate a rigorous, highly articulate, paragraph-by-paragraph paper outline.

Respond ONLY with a JSON object in this exact schema:
{
  "thesisOptions": [
    "Option 1: Detailed, nuanced thesis statement...",
    "Option 2: Strong stance thesis statement...",
    "Option 3: Analytical/exploratory thesis statement..."
  ],
  "sections": [
    {
      "title": "I. Introduction & Contextual Background",
      "topicSentence": "Clear, compelling topic sentence...",
      "points": [
        "Hook: ...",
        "Background: ...",
        "Thesis Statement: ..."
      ]
    },
    ... (4 to 5 detailed sections tailored specifically to the topic)
  ],
  "scholarKeywords": [
    "search query 1",
    "search query 2",
    "search query 3"
  ],
  "suggestedSources": [
    "Source 1",
    "Source 2"
  ]
}

DO NOT include boilerplate placeholders. Generate deep, domain-specific insights, relevant academic theories, empirical arguments, and specific counterarguments directly addressing the user's topic: "${topic.trim()}".`;

    const userPrompt = `Essay Topic: "${topic.trim()}"
Paper Format: ${paperType || "argumentative"}
Academic Tone: ${academicTone || "standard academic"}`;

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
    console.error("[EssayOutline API Error]:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate outline via Groq AI." },
      { status: 500 }
    );
  }
}
