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
      const niche = (formData.get("niche") as string || "General").trim();
      const duration = (formData.get("duration") as string || "30-40s").trim();
      const hookFormula = (formData.get("hookFormula") as string || "pattern_interrupt").trim();
      const pacing = (formData.get("pacing") as string || "fast").trim();
      const goal = (formData.get("goal") as string || "viral_views").trim();

      if (!topic) {
        throw new Error("Please enter a video topic or product.");
      }

      const systemPrompt = `You are a world-leading viral content architect, short-form director, and psychological retention strategist who has driven over 1 Billion views across TikTok, YouTube Shorts, and Instagram Reels.

Your objective is to craft an extraordinary, hyper-optimized 100x viral video script production package for the given parameters:
- Topic / Product: "${topic}"
- Target Platform: "${platform}"
- Tone & Atmosphere: "${tone}"
- Niche / Target Audience: "${niche}"
- Video Target Duration: "${duration}"
- Desired Hook Formula: "${hookFormula}"
- Video Pacing & Energy: "${pacing}"
- Primary Campaign Goal: "${goal}"

CRITICAL VIRAL STRATEGY REQUIREMENTS:
1. Deep Contextual Specificity: Do NOT use generic placeholder template phrases. Dig deep into real insights, vivid imagery, specific pain points, shock factors, or fascinating facts about "${topic}".
2. 5 Magnetic Viral Hooks: Each hook MUST use a distinct psychological mechanism (e.g. Pattern Interrupt, Negative Constraint, Bold Claim + Proof, Curiosity Gap, In-Media-Res Storytelling). Explain the psychological trigger behind each hook.
3. Timestamped Master Scene Timeline: Breakdown the video into sequential beats covering the "${duration}" duration (e.g., 0:00 - 0:03, 0:03 - 0:10, etc.).
   For EACH scene beat provide:
   - "time": exact timestamp range
   - "voiceover": natural, high-retention spoken dialogue (add emphasis with *asterisks* on punch words)
   - "visual": precise visual direction, camera shot angle, lighting, and movement
   - "sfx": specific sound effect cue (e.g., "Whoosh + Bass Thud", "Vinyl Scratch", "Glitch SFX")
   - "onScreenText": exact dynamic text overlay captions to render on screen
   - "retentionTip": micro-strategy to prevent the viewer from scrolling away at this exact moment
4. B-Roll Asset Checklist: 4-6 specific visual B-roll or filming shot ideas to prepare before editing.
5. Platform-Tailored CTAs: 3 distinct call-to-action options (e.g. High Comment Debate trigger, Save & Share incentive, Follow/Bio Link trigger).
6. Algorithmic Hashtag Stack: 8-12 high-converting tags combining viral reach, niche targeting, and trend tags.
7. Viral Potential Index: Calculate an estimated Viral Score (0-100) and brief 1-2 sentence algorithmic analysis explaining why this script will perform.

Return ONLY a valid, raw JSON object in the exact format below (no markdown formatting, no code fences, no extra text):

{
  "viralScore": 96,
  "viralAnalysis": "Calculated score based on immediate pattern interrupt, high curiosity gap, and fast-paced visual retention loops.",
  "hooks": [
    {
      "hook": "Hook phrase option 1...",
      "trigger": "Pattern Interrupt",
      "explanation": "Why this hook triggers dopamine and halts scrolling..."
    },
    {
      "hook": "Hook phrase option 2...",
      "trigger": "Negative Constraint",
      "explanation": "Leverages fear of missing out and negative urgency..."
    },
    {
      "hook": "Hook phrase option 3...",
      "trigger": "Curiosity Gap",
      "explanation": "Creates an unanswered mental loop that forces viewers to watch till the end..."
    },
    {
      "hook": "Hook phrase option 4...",
      "trigger": "Bold Claim + Proof",
      "explanation": "Establishes instant authority and intriguing proof..."
    },
    {
      "hook": "Hook phrase option 5...",
      "trigger": "In-Media-Res Story",
      "explanation": "Drops the viewer straight into high-stakes drama..."
    }
  ],
  "script": [
    {
      "time": "0:00 - 0:03",
      "voiceover": "Spoken dialogue here...",
      "visual": "Camera angle and visual directions...",
      "sfx": "Sound effect cue...",
      "onScreenText": "TEXT OVERLAY CAPTION",
      "retentionTip": "Micro retention tip..."
    }
  ],
  "bRollList": [
    { "scene": "B-Roll Shot 1", "suggestion": "Description of footage asset..." }
  ],
  "ctaOptions": [
    { "type": "Comment Debate", "text": "Call to action text..." },
    { "type": "Save & Share", "text": "Call to action text..." },
    { "type": "Follow & Bio", "text": "Call to action text..." }
  ],
  "cta": "Primary recommended call to action...",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3"]
}`;

      const aiResponse = await callGroq([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate Master Viral Script for:\nTopic: ${topic}\nPlatform: ${platform}\nTone: ${tone}\nNiche: ${niche}\nDuration: ${duration}\nHook Formula: ${hookFormula}\nPacing: ${pacing}\nGoal: ${goal}` }
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
        metadata: { topic, platform, tone, niche, duration }
      };
    }
  );
}
