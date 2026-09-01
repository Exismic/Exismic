import { NextRequest, NextResponse } from "next/server";
import { requireApiUser, getRequestIp, checkDistributedRateLimit, rateLimitResponse } from "@/lib/api-security";
import { deductCredits, getUserCredits, getCreditTotal } from "@/lib/credits";
import { getToolCreditCost } from "@/lib/credit-policy";
import { DEFAULT_GROQ_TEXT_MODEL } from "@/lib/ai-models";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = DEFAULT_GROQ_TEXT_MODEL;
const TOOL_COST = getToolCreditCost("landing-page-generator", 12);

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

  // Use a random key from the pool to load balance
  const activeKey = keys[Math.floor(Math.random() * keys.length)];

  const body = {
    model: MODEL,
    messages,
    temperature: 0.55,
    max_tokens: 5000, // Large output token limit for full landing page drafts
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
 * AI Landing Page Generator API Route
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireApiUser();
    if (authResult instanceof NextResponse) return authResult;
    const authUser = authResult;

    const ip = getRequestIp(req);
    const limit = await checkDistributedRateLimit(`landing-page-gen:${authUser.id || ip}`, 10, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

    const userCredits = await getUserCredits(authUser.id);
    const available = userCredits ? getCreditTotal(userCredits) : 0;
    if (available < TOOL_COST) {
      return NextResponse.json(
        { error: `Insufficient credits. Required: ${TOOL_COST}, Available: ${available}`, code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }

    const { prompt, style = "modern" } = await req.json().catch(() => ({}));

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Please enter a description for your landing page." }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    if (cleanPrompt.length < 5) {
      return NextResponse.json({ error: "Your landing page description is too short." }, { status: 400 });
    }
    if (cleanPrompt.length > 1000) {
      return NextResponse.json({ error: "Your description is too long. Limit is 1000 characters." }, { status: 413 });
    }

    console.log(`Generating AI landing page for prompt: "${cleanPrompt}" (Style: ${style})`);

    const systemPrompt = `You are a world-class web designer and senior frontend developer specializing in high-conversion landing pages.

Task:
Generate a single-file, fully responsive, and visually stunning HTML landing page based on the user's description.

Rules:
1. Return ONLY the raw HTML code. Do NOT wrap the code in markdown code blocks like \`\`\`html ... \`\`\` or include any conversational prefaces or postfaces. Start directly with "<!DOCTYPE html>" and end with "</html>".
2. Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Configure custom dark/light theme properties using Tailwind's script config if needed, or write robust inline Tailwind utility classes.
4. Use Lucide Icons via CDN:
   - Add this script: <script src="https://unpkg.com/lucide@latest"></script>
   - At the bottom of the body (before </html>), initialize the icons: <script>lucide.createIcons();</script>
   - Render icons in HTML like: <i data-lucide="sparkles" class="w-6 h-6"></i>
5. Include premium styling assets:
   - Inter or Outfit google fonts for typography.
   - Smooth gradients, backdrop blur styling, grid overlays, and micro-hover states.
   - High-quality thematic placeholder photos from Unsplash (e.g. "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80" for tech team, etc.). Do not use broken links.
6. The page MUST have a rich, complete structure containing:
   - Floating glassmorphism navbar (logo, links, Call-to-action button).
   - Hero section (punchy H1, descriptions, primary and secondary CTA buttons, product mockup placeholder frame).
   - Features Grid (3-4 columns of styled grid cards with icon headers).
   - Stats section (milestones, numbers, glowing badges).
   - Testimonial carousel/grid (user avatars, review quotes, star ratings).
   - Pricing section (glowing professional tier card vs standard tier card).
   - FAQ accordion layout.
   - Newsletter / Footer section.

Style tone selected: ${style}. Apply matching typography, colors, and borders. Make sure the code is completely correct, syntactically valid, and beautiful.`;

    const generatedHtml = await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate a landing page for: ${cleanPrompt}` }
    ]);

    // Clean up any potential markdown wraps if the model ignored our system rule
    let cleanHtml = generatedHtml.trim();
    if (cleanHtml.startsWith("```html")) {
      cleanHtml = cleanHtml.slice(7);
    }
    if (cleanHtml.startsWith("```")) {
      cleanHtml = cleanHtml.slice(3);
    }
    if (cleanHtml.endsWith("```")) {
      cleanHtml = cleanHtml.slice(0, -3);
    }
    cleanHtml = cleanHtml.trim();

    // Atomically deduct credits
    await deductCredits(authUser.id, TOOL_COST, "landing-page-generator");

    return NextResponse.json({
      html: cleanHtml,
      creditsDeducted: TOOL_COST,
    });

  } catch (error: any) {
    console.error("[Landing Page Route Error]:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to generate landing page template." 
    }, { status: 500 });
  }
}
