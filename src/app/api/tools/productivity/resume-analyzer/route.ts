import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import { createClient } from "@/utils/supabase/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

interface GroqMessage {
  role: "system" | "user";
  content: string;
}

function sanitizeText(value: unknown, fallback = "", limit = 8000) {
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

async function callGroq(messages: GroqMessage[], jsonMode = true) {
  const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  const keys = rawKeys.split(",").map((key) => key.trim()).filter(Boolean);
  if (!keys.length) {
    throw new Error("The AI processing service is currently unavailable. Please try again later.");
  }

  const body = {
    model: MODEL,
    messages,
    temperature: jsonMode ? 0.2 : 0.65,
    max_tokens: 2200,
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

      const data = await response.json();
      const choices = Array.isArray(data.choices) ? data.choices : [];
      const content = sanitizeText(choices[0]?.message?.content, "", 15000);
      if (!content) throw new Error("Groq returned an empty response.");
      return content;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All Groq keys failed.");
}

function buildJobDescriptionPrompt(resumeText: string) {
  return `Based on the following candidate's resume, determine their primary field of work (e.g. frontend developer, graphic designer, product manager) and experience level.
  Then, generate a typical, highly realistic corporate Job Description that this candidate would target.

  Format the response as clean, raw text with the following outline:
  Target Job Title: [Role Name]
  
  About the Role:
  [Describe typical company environment and role goals]
  
  Key Responsibilities:
  - [4 to 6 typical responsibilities]
  
  Required Skills & Qualifications:
  - [4 to 6 core tech skills / qualifications]

  Resume Content:
  ${resumeText}

  Return ONLY the generated job description. Do not write any conversational preamble, notes, or intros.`;
}

function buildAtsPrompt(resumeText: string, jobDescription: string) {
  return `Perform a comprehensive ATS compatibility audit. Compare the candidate's resume text against the target job description.
  
  Resume Text:
  ${resumeText}
  
  Job Description:
  ${jobDescription}
  
  You MUST return a JSON object ONLY with the following exact structure:
  {
    "atsScore": 75,
    "verdict": "Summarize overall alignment (max 2 sentences)",
    "analysis": {
      "format": { "score": 85, "critique": "Critique layout, formatting, standard headers, readability (max 2 sentences)" },
      "experience": { "score": 70, "critique": "Critique work history match, action verbs, quantified results (max 2 sentences)" },
      "skills": { "score": 78, "critique": "Critique core skills, software/tool alignments, technical matches (max 2 sentences)" }
    },
    "keywords": {
      "matched": ["List up to 8 matched keyword/skill tags found in both"],
      "missing": ["List up to 8 critical keywords/skills missing or underrepresented in the resume based on the job description"]
    },
    "suggestions": [
      "List 4 to 6 highly actionable bullet points of concrete changes the user can make to improve their match score."
    ]
  }
  
  Rules:
  - atsScore must be a number between 0 and 100 representing overall compatibility.
  - All critiques must be brief, direct, and constructive.
  - Do not include any markdown format tags or introductory sentences outside the JSON output.`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const action = formData.get("action") as string | null;
    const rawJobDescription = formData.get("jobDescription") as string | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Please upload a valid PDF resume file." }, { status: 400 });
    }

    // Parse the PDF buffer using pdf-parse
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdf(buffer).catch((err: any) => {
      console.error("PDF Parsing Error:", err);
      throw new Error("Could not parse the PDF file. Please ensure it is a valid, unencrypted PDF.");
    });

    const resumeText = sanitizeText(pdfData.text, "", 10000);
    if (!resumeText.trim()) {
      return NextResponse.json({ error: "Your resume does not contain any readable text. Please ensure it is not scanned/image-only." }, { status: 400 });
    }

    if (action === "generate-job-description") {
      const systemPrompt = "You are a corporate recruiter drafting a job post targeting suitable applicants. Return only the job description.";
      const userPrompt = buildJobDescriptionPrompt(resumeText);
      const completion = await callGroq([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ], false);
      return NextResponse.json({ success: true, jobDescription: completion });
    }

    const jobDescription = sanitizeText(rawJobDescription || "", "", 8000);
    if (jobDescription.length < 20) {
      return NextResponse.json({ error: "Please provide a target job description (at least 20 characters)." }, { status: 400 });
    }

    const systemPrompt = "You are Exismic AI, an expert ATS parsing and corporate hiring consultant. Return clean, valid JSON only.";
    const userPrompt = buildAtsPrompt(resumeText, jobDescription);

    const completion = await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], true);

    const result = extractJson(completion);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[Resume Scanner Error]:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during analysis." },
      { status: 500 }
    );
  }
}
