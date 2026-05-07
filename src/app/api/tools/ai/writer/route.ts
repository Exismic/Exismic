import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, tone, length } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API Key not found in environment." }, { status: 500 });
    }

    const systemPrompt = `You are a world-class AI writing assistant. 
    Your goal is to generate high-quality, engaging, and purposeful content.
    Tone: ${tone}
    Length: ${length}
    Instructions: Respond ONLY with the requested content. No conversational filler or introductions.`;

    console.log("[AiWriter] Calling Groq Cloud API...");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Upgraded to the latest Llama 3.3 model
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

    return NextResponse.json({ content });

  } catch (error: any) {
    console.error("[AiWriter] API Error:", error);
    return NextResponse.json({ error: error.message || "An error occurred during generation." }, { status: 500 });
  }
}
