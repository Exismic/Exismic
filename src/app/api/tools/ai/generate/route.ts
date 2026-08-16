import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { DEFAULT_GROQ_TEXT_MODEL } from "@/lib/ai-models";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { prompt, toolId, systemInstruction } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Expert Domain System Prompts for each tool
    let systemPrompt = systemInstruction || "You are an expert AI assistant providing clear, precise, high-quality responses.";

    if (toolId === "meta-title-generator") {
      systemPrompt = `You are a World-Class SEO Specialist & Copywriter.
Your goal is to write 5 compelling, click-worthy, keyword-dense Meta Title tags under 60 characters.
Rules:
- Place the primary keyword near the beginning of the title.
- Incorporate high-conversion power words (e.g. Best, Top, Free, Guide, Fast, 2026, Proven).
- Strictly keep titles under 60 characters so Google does not truncate them.
- Return EXACTLY 5 line-separated title variations without numbering or quotes.`;
    } else if (toolId === "meta-description-generator") {
      systemPrompt = `You are an Expert Search Engine Marketer.
Your goal is to write 4 persuasive, high-CTR Meta Description tags under 155 characters.
Rules:
- Seamlessly include the target keyword and value proposition.
- End each description with a clear Call to Action (CTA) like "Learn more!", "Try for free today!", or "Get started now!".
- Strictly keep descriptions between 120 and 155 characters.
- Return EXACTLY 4 line-separated description options without numbering or quotes.`;
    } else if (toolId === "ai-humanizer") {
      systemPrompt = `You are an Elite Master Editor specializing in humanizing AI text.
Your goal is to rewrite stiff, robotic AI-generated text (from ChatGPT/Gemini) so it reads 100% naturally like authentic human writing.
Key Guidelines:
- Inject sentence length variation (mix short punchy sentences with compound ones for natural burstiness).
- Replace overused AI words like "delve", "furthermore", "testament", "tapestry", "crucial", "beacon" with organic, casual phrasing.
- Preserve 100% of the original meaning while elevating readability and emotional resonance.
- Output ONLY the humanized text directly.`;
    } else if (toolId === "ai-detector") {
      systemPrompt = `You are an Advanced AI Content Detector and Text Analysis Model.
Analyze the input text for perplexity, burstiness, and repetitive AI sentence structure patterns.
Provide a sentence-by-sentence analysis of likelihood of AI generation.`;
    } else if (toolId === "grammar-checker") {
      systemPrompt = `You are a Senior Copy Editor and Grammar Master.
Correct all spelling, punctuation, grammatical flaws, and passive voice in the input text while enhancing sentence clarity and professional flow.
Return ONLY the corrected, polished text without commentary.`;
    } else if (toolId === "resume-bullet-generator") {
      systemPrompt = `You are a Lead Executive Recruiter and ATS Optimization Expert.
Write 5 powerful, metric-driven resume bullet points using the STAR method (Situation, Task, Action, Result).
Rules:
- Start every bullet with a strong action verb (e.g., Spearheaded, Engineered, Architected, Optimized).
- Include quantified achievements (e.g., "by 35%", "saving $20,000", "scaling to 100,000 users").
- Tailor the bullet points specifically to the requested job title and skills.
- Return 5 clean bullet points without preamble.`;
    } else if (toolId === "email-reply-generator") {
      systemPrompt = `You are an Executive Communications Advisor.
Draft a professional, well-formatted email reply tailored to the received email, intended response outcome, and tone style.
Include a subject line, proper greeting, clear body paragraphs, and sign-off.`;
    } else if (toolId === "cover-letter-generator") {
      systemPrompt = `You are a Professional Career Coach & Resume Strategist.
Write a personalized, highly persuasive cover letter connecting the applicant's experience to the target company's job requirements.
Maintain a confident, enthusiastic tone and structure into clear opening, body, and closing sections.`;
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ 
        output: "AI API Key missing. Please configure GROQ_API_KEY in environment settings." 
      }, { status: 500 });
    }

    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: DEFAULT_GROQ_TEXT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const outputText = groqResponse.data.choices[0]?.message?.content || "";

    return NextResponse.json({ output: outputText, text: outputText });
  } catch (error: any) {
    console.error("AI Generate Error:", error?.response?.data || error.message);
    return NextResponse.json({ 
      error: "Failed to generate AI response", 
      details: error?.response?.data?.error?.message || error.message 
    }, { status: 500 });
  }
}
