import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import { checkRateLimit, getOptionalApiUser, getRequestIp, rateLimitResponse } from "@/lib/api-security";
import { DEFAULT_GROQ_TEXT_MODEL } from "@/lib/ai-models";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = DEFAULT_GROQ_TEXT_MODEL;

interface GroqMessage {
  role: "system" | "user";
  content: string;
}

async function callGroq(messages: GroqMessage[]) {
  const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  const keys = rawKeys.split(",").map((key) => key.trim()).filter(Boolean);
  if (!keys.length) {
    throw new Error("AI service is currently unconfigured. Please set GROQ_API_KEY.");
  }

  const body = {
    model: MODEL,
    messages,
    temperature: 0.3,
    max_tokens: 3000,
  };

  let lastError: unknown = null;
  for (const key of keys) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const message = await response.text();
        lastError = new Error(`Groq API error (${response.status}): ${message.slice(0, 150)}`);
        continue;
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response from Groq AI.");
      return text;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to contact AI service.");
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getOptionalApiUser();
    const limit = checkRateLimit(`pdf-to-notes:${authUser?.id || "guest"}:${getRequestIp(req)}`, authUser ? 40 : 15, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    let extractedText = "";
    let fileName = "Document";
    let pageCount = 1;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const rawText = (formData.get("text") as string) || "";

      if (file && file.size > 0) {
        fileName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        try {
          const parsed = await pdf(buffer);
          extractedText = parsed.text || "";
          pageCount = parsed.numpages || 1;
        } catch (pdfErr) {
          console.error("PDF Parsing error:", pdfErr);
          return NextResponse.json({ error: "Failed to extract text from PDF file. Please ensure it is not password protected." }, { status: 400 });
        }
      } else if (rawText.trim()) {
        extractedText = rawText.trim();
      }
    } else {
      const body = await req.json().catch(() => ({}));
      extractedText = body.text || "";
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json({ error: "Please provide a valid PDF file or paste study text with at least 20 characters." }, { status: 400 });
    }

    // Truncate text if excessively long to fit AI token window
    const truncatedText = extractedText.slice(0, 18000);

    const systemPrompt = `You are an elite academic study notes generator and professor assistant.
Transform the provided textbook/lecture document into structured, high-grade study materials using Markdown.

Structure your response strictly in the following sections:

# 📌 EXECUTIVE SUMMARY
(A concise, 3-4 sentence overview of the core topic and primary thesis)

# 🔑 KEY CONCEPTS & DEFINITIONS
- **Term 1**: Definition or formula explanation.
- **Term 2**: Definition or formula explanation.
- **Term 3**: Definition or formula explanation.

# 💡 IN-DEPTH CORE TAKEAWAYS
- Bullet points covering essential theories, mechanisms, historical context, or mathematical steps.

# 🎯 EXAM REVIEW PRACTICE QUESTIONS
1. **Q1: [Question text]**
   - *Answer:* [Clear explanation]
2. **Q2: [Question text]**
   - *Answer:* [Clear explanation]
3. **Q3: [Question text]**
   - *Answer:* [Clear explanation]`;

    const userPrompt = `Study Material Content (Document: ${fileName}, Pages: ${pageCount}):\n\n${truncatedText}`;

    const notesMarkdown = await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    return NextResponse.json({
      success: true,
      fileName,
      pageCount,
      characterCount: extractedText.length,
      notes: notesMarkdown,
      extractedText: truncatedText.slice(0, 500) + "..."
    });

  } catch (error: unknown) {
    console.error("[PDF to Notes Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to generate AI study notes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
