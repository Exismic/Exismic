import { NextRequest, NextResponse } from "next/server";
import { withToolHandler } from "@/lib/tools-handler";
import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(messages: any[]) {
  const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  const keys = rawKeys.split(",").map(k => k.trim()).filter(Boolean);
  if (keys.length === 0) throw new Error("AI service API key is not configured.");

  let lastError: any = null;
  for (const key of keys) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.75,
          max_tokens: 2048,
        },
        { headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error: any) {
      lastError = error;
      if (error.response?.status === 429) continue;
      throw error;
    }
  }
  throw lastError || new Error("All AI processing keys failed.");
}

export async function POST(req: NextRequest) {
  return withToolHandler(
    req,
    {
      toolId: "hook-script-generator",
      allowedTypes: [],
      maxSize: 0,
      creditCost: 3,
      accessMode: "pro",
      optionalFile: true,
    },
    async (_buffer, _jobId, formData) => {
      const topic = (formData.get("topic") as string || "").trim();
      const platform = (formData.get("platform") as string || "tiktok").trim();
      const tone = (formData.get("tone") as string || "controversial").trim();

      if (!topic) {
        throw new Error("Please enter a video topic or product.");
      }

      const systemPrompt = `You are a top-tier viral video strategist, screenwriter, and social media growth expert specializing in YouTube Shorts, TikTok, and Instagram Reels.

Your task is to generate high-retention video hooks, a timestamped voiceover script with vivid visual directions, and a compelling Call-To-Action tailored to the topic "${topic}", platform "${platform}", and tone "${tone}".

CRITICAL INSTRUCTIONS:
- Tailor the content DEEPLY to the actual topic. Do NOT use generic placeholder template phrases. (For example, if the topic is "5 horror stories", write scary, suspenseful hooks about real terrifying tales, eerie encounters, or dark lore).
- Generate 3 distinct, highly magnetic viral hooks.
- Create 4-5 timestamped script beats covering a complete 30-60 second short-form video.
- For each script beat, provide an engaging spoken voiceover and specific visual directions (e.g. camera angles, text overlays, b-roll footage, sound effects).
- Return ONLY a valid, raw JSON object in the following format (no markdown fences, no explanatory text):

{
  "hooks": [
    "Hook option 1",
    "Hook option 2",
    "Hook option 3"
  ],
  "script": [
    { "time": "0:00 - 0:03", "voiceover": "...", "visual": "..." },
    { "time": "0:03 - 0:12", "voiceover": "...", "visual": "..." },
    { "time": "0:12 - 0:25", "voiceover": "...", "visual": "..." },
    { "time": "0:25 - 0:40", "voiceover": "...", "visual": "..." },
    { "time": "0:40 - 0:60", "voiceover": "...", "visual": "..." }
  ],
  "cta": "Compelling call to action..."
}`;

      const aiResponse = await callGroq([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Topic: ${topic}\nTarget Platform: ${platform}\nHook Tone: ${tone}` }
      ]);

      const content = aiResponse.choices[0]?.message?.content?.trim() || "";
      const jsonStart = content.indexOf("{");
      const jsonEnd = content.lastIndexOf("}") + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error("Failed to parse AI response. Please try again.");
      }

      const parsed = JSON.parse(content.substring(jsonStart, jsonEnd));
      return {
        resultUrl: JSON.stringify(parsed),
        metadata: { topic, platform, tone }
      };
    }
  );
}
