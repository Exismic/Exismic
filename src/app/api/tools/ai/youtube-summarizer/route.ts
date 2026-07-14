import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getOptionalApiUser, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import { getYouTubeTranscript } from "@/lib/youtube-transcript";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

interface GroqMessage {
  role: "system" | "user";
  content: string;
}

async function callGroq(messages: GroqMessage[]) {
  const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  const keys = rawKeys.split(",").map((key) => key.trim()).filter(Boolean);
  if (!keys.length) {
    throw new Error("The AI processing service is currently unavailable. Please configure Groq keys.");
  }

  const activeKey = keys[Math.floor(Math.random() * keys.length)];

  const body = {
    model: MODEL,
    messages,
    temperature: 0.6,
    max_tokens: 3000,
  };

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${activeKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Groq API Error details:", errText);
    throw new Error(`Groq API returned status ${response.status}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
}

/**
 * YouTube AI Summarizer & Repurposer API Route
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getOptionalApiUser();
    const limit = checkRateLimit(`yt-summarizer:${authUser?.id || "guest"}:${getRequestIp(req)}`, authUser ? 30 : 8, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const { url, format = "summary" } = await req.json().catch(() => ({}));

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Please enter a valid YouTube video URL." }, { status: 400 });
    }

    console.log(`Processing YouTube summarizer: "${url}" (Format: ${format})`);

    // 1. Fetch transcript from watch page
    const transcriptData = await getYouTubeTranscript(url);
    const { title, videoId, segments, rawText } = transcriptData;

    // If only requesting raw transcript, return immediately to save LLM tokens
    if (format === "transcript") {
      return NextResponse.json({
        title,
        videoId,
        segments,
        result: segments.map(s => `[${s.timeLabel}] ${s.text}`).join("\n"),
      });
    }

    // 2. Bound/slice transcript to avoid hitting LLM context limits on extremely long videos
    const maxLength = 45000; // ~8,000 words limit
    const cleanTranscript = rawText.length > maxLength 
      ? rawText.slice(0, maxLength) + " ... [Transcript truncated due to video length]"
      : rawText;

    // 3. Define prompt based on chosen output format
    let systemPrompt = "";
    
    if (format === "blog") {
      systemPrompt = `You are a professional SEO copywriter and editor.
Task: Write a comprehensive, publication-ready, SEO-optimized blog post based on the provided YouTube video transcript.

Rules:
- Write in clean, formatted Markdown.
- Organize the post with a catchy main H1 title, detailed H2 & H3 section headers, bullet lists, and bold text.
- Do NOT make up facts. Only use info spoken in the transcript.
- Focus on flow, transition, and readability. Avoid using conversational prefaces (e.g. "Sure, here is your blog post"). Start directly with the content.
- Include a brief introduction and a conclusion summarizing the takeaways.`;
    } else if (format === "thread") {
      systemPrompt = `You are a viral social media strategist specializing in Twitter/X and LinkedIn threads.
Task: Create a high-engagement, viral social media thread based on the provided YouTube video transcript.

Rules:
- Format the output as 5 to 10 numbered tweets/posts (e.g. "1/8 ...", "2/8 ...").
- The first post must contain a strong, high-converting hook.
- Use short sentences, line breaks, and clear spacing.
- Keep each post under 280 characters to fit Twitter limits.
- Separate each post in the thread with a double newline.
- Do NOT include conversational intros or outros.`;
    } else {
      // default format = summary
      systemPrompt = `You are an expert technical writer and education assistant.
Task: Analyze the provided video transcript and compile a highly structured set of study notes and key takeaways.

Rules:
- Write in clean Markdown.
- Start with a "Summary Overview" paragraph (3-4 sentences).
- Follow with a "Key Takeaways" section featuring clear bullet points detailing the main arguments, stats, and milestones mentioned in the transcript.
- Add an "Action Items / Practical Applications" list if applicable.
- Do NOT include conversational intros or outrages.`;
    }

    const aiResult = await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Here is the transcript for the video titled "${title}":\n\n${cleanTranscript}` }
    ]);

    return NextResponse.json({
      title,
      videoId,
      segments,
      result: aiResult.trim(),
    });

  } catch (error: any) {
    console.error("[YouTube Summarizer Route Error]:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to extract or process YouTube transcript." 
    }, { status: 500 });
  }
}
