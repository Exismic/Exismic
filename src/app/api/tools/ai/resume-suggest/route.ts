import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasActiveProAccess } from "@/lib/user-access";
import { normalizeResumeData, type AtsInsight, type ResumeData } from "@/lib/resume";
import { createClient } from "@/utils/supabase/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

type RequestMode = "section" | "full" | "ats";
type SectionMode = "summary" | "experience" | "skills";

interface ResumeRequestBody {
  mode?: RequestMode;
  section?: SectionMode;
  role?: string;
  context?: string;
  brief?: string;
  jobDescription?: string;
  resume?: ResumeData;
  resumeText?: string;
}

interface GroqMessage {
  role: "system" | "user";
  content: string;
}

function sanitizeText(value: unknown, fallback = "", limit = 5000) {
  if (typeof value !== "string") return fallback;
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, limit) || fallback;
}

function extractJson(content: string) {
  try {
    return JSON.parse(content) as unknown;
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("AI returned an invalid JSON response.");
    }
    return JSON.parse(content.slice(start, end + 1)) as unknown;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((item) => sanitizeText(item, "", 180))
    .filter(Boolean)
    .slice(0, 10);
}

function sanitizeAtsInsight(value: unknown): AtsInsight {
  const data = asRecord(value);
  const rawScore = Number(data.score);
  const score = Number.isFinite(rawScore) ? Math.min(100, Math.max(0, Math.round(rawScore))) : 60;

  return {
    score,
    verdict: sanitizeText(data.verdict, "Resume analysis complete.", 240),
    strengths: stringArray(data.strengths, ["Clear professional structure"]),
    gaps: stringArray(data.gaps, ["Add more measurable achievements"]),
    keywords: stringArray(data.keywords, []),
    fixes: stringArray(data.fixes, ["Add job-specific keywords and metrics"]),
  };
}

async function requireProUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Please sign in to use Exismic Ai resume features.", status: 401 };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true, planExpiresAt: true },
  });

  if (!dbUser || !hasActiveProAccess(dbUser)) {
    return { error: "Full resume generation and ATS matching are Pro features.", status: 403 };
  }

  return { status: 200 };
}

async function callGroq(messages: GroqMessage[], jsonMode = false) {
  const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  const keys = rawKeys.split(",").map((key) => key.trim()).filter(Boolean);
  if (!keys.length) throw new Error("The AI processing service is currently unavailable. Please try again later.");

  const body = {
    model: MODEL,
    messages,
    temperature: jsonMode ? 0.25 : 0.65,
    max_tokens: jsonMode ? 2200 : 900,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
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
        lastError = new Error(`Groq request failed with ${response.status}: ${message.slice(0, 140)}`);
        if (response.status === 401 || response.status === 429 || response.status >= 500) continue;
        throw lastError;
      }

      const data = asRecord(await response.json());
      const choices = Array.isArray(data.choices) ? data.choices : [];
      const first = asRecord(choices[0]);
      const message = asRecord(first.message);
      const content = sanitizeText(message.content, "", 12000);
      if (!content) throw new Error("Groq returned an empty response.");
      return content;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All Groq keys failed.");
}

function buildSectionPrompt(section: SectionMode, role: string, context: string) {
  if (section === "experience") {
    return `Write 3-4 ATS-friendly resume bullet points for a ${role || "professional"} role.
Context: ${context || "General professional responsibilities"}
Requirements:
- Start each bullet with an action verb.
- Use measurable outcomes when reasonable.
- Return only bullet points, one per line.`;
  }

  if (section === "summary") {
    return `Write a polished 2-3 sentence professional resume summary for a ${role || "professional"}.
Context: ${context || "Experienced professional"}
Requirements:
- Confident but not exaggerated.
- ATS-friendly.
- Return only the summary.`;
  }

  return `Return ONLY a comma-separated list of 12 professional skills for a ${role || "professional"}.
Context: ${context || ""}
Rules:
- No intro text.
- No sentences.
- Each skill should be 1-3 words.`;
}

function fullResumePrompt(brief: string, role: string, jobDescription: string) {
  return `Create a polished ATS-friendly resume draft as JSON.

Target role: ${role || "Not specified"}
Candidate brief: ${brief}
Job description: ${jobDescription || "Not provided"}

Return ONLY JSON with this shape:
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "website": "",
    "summary": ""
  },
  "experience": [
    { "company": "", "role": "", "period": "", "description": "- Bullet\\n- Bullet\\n- Bullet" }
  ],
  "education": [
    { "school": "", "degree": "", "period": "" }
  ],
  "skills": ["Skill", "Skill"],
  "projects": [
    { "name": "", "role": "", "description": "- Bullet\\n- Bullet", "link": "" }
  ]
}

Rules:
- Do not invent contact details unless provided.
- Keep descriptions concise and achievement-focused.
- Use line-break separated bullets in description fields.
- Include 8-14 high-value skills.
- If experience is vague, create one relevant experience entry based only on the brief.`;
}

function atsPrompt(resumeText: string, role: string, jobDescription: string) {
  return `Score this resume against a job description as JSON.

Target role: ${role || "Not specified"}
Resume text:
${resumeText}

Job description:
${jobDescription}

Return ONLY JSON:
{
  "score": 0,
  "verdict": "",
  "strengths": ["..."],
  "gaps": ["..."],
  "keywords": ["..."],
  "fixes": ["..."]
}

Rules:
- score is 0-100.
- keywords should be missing or underused keywords from the job description.
- fixes should be specific edits the user can make.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as ResumeRequestBody;
    const mode = body.mode || "section";
    const role = sanitizeText(body.role, "", 220);
    const context = sanitizeText(body.context, "", 2500);

    if (mode === "full" || mode === "ats") {
      const gate = await requireProUser();
      if (gate.status !== 200) {
        return NextResponse.json({ error: gate.error }, { status: gate.status });
      }
    }

    if (mode === "full") {
      const brief = sanitizeText(body.brief, "", 5000);
      const jobDescription = sanitizeText(body.jobDescription, "", 6000);

      if (brief.length < 12) {
        return NextResponse.json({ error: "Tell Exismic Ai more about the resume you want." }, { status: 400 });
      }

      const content = await callGroq([
        { role: "system", content: "You are Exismic Ai, a senior resume strategist. Return clean, valid JSON only." },
        { role: "user", content: fullResumePrompt(brief, role, jobDescription) },
      ], true);
      const resume = normalizeResumeData(extractJson(content));

      return NextResponse.json({ success: true, resume });
    }

    if (mode === "ats") {
      const resumeText = sanitizeText(body.resumeText, "", 9000);
      const jobDescription = sanitizeText(body.jobDescription, "", 9000);

      if (!resumeText || jobDescription.length < 20) {
        return NextResponse.json({ error: "Add resume content and a job description first." }, { status: 400 });
      }

      const content = await callGroq([
        { role: "system", content: "You are Exismic Ai, an ATS optimization expert. Return clean, valid JSON only." },
        { role: "user", content: atsPrompt(resumeText, role, jobDescription) },
      ], true);
      const insight = sanitizeAtsInsight(extractJson(content));

      return NextResponse.json({ success: true, insight });
    }

    const section = body.section || "summary";
    const content = await callGroq([
      { role: "system", content: "You are an expert career coach and professional resume writer." },
      { role: "user", content: buildSectionPrompt(section, role, context) },
    ]);

    return NextResponse.json({
      success: true,
      suggestion: content.trim(),
    });
  } catch (error) {
    console.error("[Resume AI] Error:", error);
    const rawMessage = error instanceof Error ? error.message : "Resume AI failed.";
    const message = rawMessage.includes("The AI processing service is currently unavailable")
      ? rawMessage
      : "Resume AI is temporarily unavailable. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
