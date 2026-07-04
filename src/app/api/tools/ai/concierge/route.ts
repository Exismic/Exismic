import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TOOLS, type Tool } from "@/data/tools";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/api-security";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

const aliases: Record<string, string[]> = {
  "image-eraser": ["remove background", "background removal", "remove bg", "transparent", "cutout", "erase object"],
  "image-compressor": ["compress image", "smaller image", "reduce image size", "image file size", "optimize photo"],
  "image-resizer": ["resize image", "crop image", "dimensions", "aspect ratio", "instagram size"],
  "image-converter": ["convert image", "jpg", "jpeg", "png", "webp", "gif", "image format"],
  "image-restorer": ["restore photo", "old photo", "damaged photo", "blurry photo", "repair photo"],
  "watermark-remover": ["remove watermark", "watermark", "remove logo", "remove text from image"],
  "image-collage": ["collage", "photo grid", "combine photos"],
  "youtube-thumbnail": ["youtube thumbnail", "thumbnail"],
  "ai-img-gen": ["generate image", "create image", "ai art", "text to image"],
  "ai-logo": ["logo", "brand mark", "business logo"],
  "audio-vocal-remover": ["remove vocals", "instrumental", "karaoke", "separate vocals"],
  "audio-stem-splitter": ["split stems", "drums", "bass", "music stems"],
  "audio-noise-remover": ["remove noise", "background noise", "clean audio"],
  "audio-tts": ["text to speech", "voiceover", "read text", "ai voice"],
  "pdf-merger": ["merge pdf", "combine pdf"],
  "pdf-splitter": ["split pdf", "extract pdf pages"],
  "pdf-compressor": ["compress pdf", "smaller pdf", "reduce pdf size"],
  "pdf-to-img": ["pdf to image", "pdf to jpg", "pdf to png"],
  "pdf-img-to-pdf": ["image to pdf", "jpg to pdf", "photos to pdf"],
  "pdf-to-word": ["pdf to word", "pdf to docx", "edit pdf text"],
  "pdf-ocr": ["ocr", "extract text", "scan text", "image to text"],
  "video-trimmer": ["trim video", "cut video", "shorten video"],
  "video-compressor": ["compress video", "smaller video", "reduce video size"],
  "video-subtitles": ["subtitles", "captions", "transcribe video"],
  "video-enhancer": ["enhance video", "upscale video", "improve video"],
  "video-gif": ["video to gif", "make gif"],
  "video-merger": ["merge video", "combine clips", "join videos"],
  "resume-builder": ["resume", "cv", "job application"],
  "invoice-generator": ["invoice", "bill client", "quotation"],
  "productivity-qr": ["qr code", "qr"],
  "typing-test": ["typing speed", "wpm", "typing test"],
  "social-caption-generator": ["caption", "social post", "instagram post", "linkedin post"],
  "screenshot-to-code": ["screenshot to code", "image to html", "recreate ui", "frontend from screenshot"],
  "support-agent": ["support bot", "customer support", "website chatbot", "chat widget"],
  "ai-code": ["write code", "debug code", "code editor", "build app", "programming"],
  "ai-writer": ["write article", "write copy", "blog", "rewrite", "content writing"],
  "ai-chat": ["ask ai", "research", "explain", "brainstorm", "chat"],
};

const greetingPattern = /^(hi|hey|hello|thanks|thank you|yo|sup)[!. ]*$/i;

type Recommendation = Pick<Tool, "id" | "name" | "description" | "href" | "category" | "icon"> & {
  pro: boolean;
};

function toRecommendation(tool: Tool): Recommendation {
  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    href: tool.href,
    category: tool.category,
    icon: tool.icon,
    pro: Boolean(tool.pro || tool.isProTool),
  };
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function localRecommendations(message: string) {
  if (greetingPattern.test(message.trim())) {
    return {
      reply: "Hi. Tell me what you want to create, edit, convert, or improve, and I will point you to the right Lumora tool.",
      tools: [] as Tool[],
    };
  }

  const query = message.toLowerCase();
  const queryTokens = new Set(tokenize(query));
  const ranked = TOOLS.map((tool) => {
    const searchable = `${tool.name} ${tool.description} ${(aliases[tool.id] || []).join(" ")}`.toLowerCase();
    let score = 0;

    for (const phrase of aliases[tool.id] || []) {
      if (query.includes(phrase)) score += phrase.includes(" ") ? 12 : 6;
    }

    for (const token of queryTokens) {
      if (searchable.includes(token)) score += 2;
    }

    if (query.includes(tool.name.toLowerCase())) score += 15;
    return { tool, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.tool);

  if (ranked.length === 0) {
    return {
      reply: "I can help with images, video, audio, PDFs, writing, coding, and productivity. Describe the result you need in one sentence.",
      tools: [] as Tool[],
    };
  }

  const primary = ranked[0];
  return {
    reply: `Start with ${primary.name}. It is the closest match for what you described${ranked.length > 1 ? ", and I added a couple of useful alternatives" : ""}.`,
    tools: ranked,
  };
}

function getGroqKeys() {
  return (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

async function askGroq(message: string) {
  const keys = getGroqKeys();
  if (keys.length === 0) throw new Error("No Groq key configured");

  const catalog = TOOLS.map((tool) => `${tool.id}: ${tool.name} - ${tool.description}`).join("\n");
  const payload = {
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are Lumora AI's tool concierge.",
          "Understand the user's intended outcome and recommend zero to three tools from the exact catalog.",
          "Never invent a tool ID. For greetings or unclear requests, ask one concise clarifying question and return an empty toolIds array.",
          "Return JSON only in this shape: {\"message\":\"short helpful response\",\"toolIds\":[\"exact-id\"]}.",
          "Keep message under 55 words. Do not mention internal systems, models, APIs, or the catalog.",
          `Catalog:\n${catalog}`,
        ].join("\n\n"),
      },
      { role: "user", content: message },
    ],
    temperature: 0.2,
    max_tokens: 180,
  };

  let lastError: unknown;
  for (const key of keys) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        lastError = new Error("Groq key rate limited");
        continue;
      }
      if (!response.ok) throw new Error(`Groq request failed with status ${response.status}`);

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty Groq response");

      const parsed = JSON.parse(content) as { message?: unknown; toolIds?: unknown };
      const toolIds = Array.isArray(parsed.toolIds)
        ? parsed.toolIds.filter((id): id is string => typeof id === "string").slice(0, 3)
        : [];
      const tools = toolIds
        .map((id) => TOOLS.find((tool) => tool.id === id))
        .filter((tool): tool is Tool => Boolean(tool));

      const modelReply = typeof parsed.message === "string" && parsed.message.trim()
        ? parsed.message.trim().slice(0, 400)
        : localRecommendations(message).reply;
      const reply = tools.length > 0 && !modelReply.toLowerCase().includes(tools[0].name.toLowerCase())
        ? `${tools[0].name} is the best match. ${modelReply}`
        : modelReply;

      return { reply, tools };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All Groq keys failed");
}

export async function POST(request: NextRequest) {
  try {
    const limit = checkRateLimit(`tool-concierge:${getRequestIp(request)}`, 20, 10 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Tell Lumora AI what you want to do." }, { status: 400 });
    }

    let result;
    try {
      result = await askGroq(parsed.data.message);
    } catch {
      result = localRecommendations(parsed.data.message);
    }

    return NextResponse.json({
      reply: result.reply,
      recommendations: result.tools.map(toRecommendation),
    });
  } catch (error) {
    console.error("[ToolConcierge]", error);
    return NextResponse.json(
      { error: "Lumora AI could not process that request. Please try again." },
      { status: 500 }
    );
  }
}
