import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import axios from 'axios';

export const dynamic = 'force-dynamic';

const DEFAULT_AI_CHAT_SETTINGS = {
  memoryEnabled: true,
  responseStyle: "balanced",
  detailLevel: "standard",
  customInstructions: "",
};

const MANUAL_CHAT_MODES = ["default", "coding", "research", "business", "creative", "fast"] as const;
type EffectiveChatMode = typeof MANUAL_CHAT_MODES[number];
const MAX_CHAT_MESSAGES = 60;
const MAX_VISION_IMAGES = 5;
const MAX_VISION_DATA_CHARACTERS = Math.floor(3.7 * 1024 * 1024);
const MAX_TEXT_ATTACHMENT_CHARACTERS = 120_000;
const MAX_TOTAL_TEXT_ATTACHMENT_CHARACTERS = 240_000;
const DEFAULT_VISION_MODELS = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "qwen/qwen3.6-27b",
];

class AttachmentValidationError extends Error {}

function isSupportedImageDataUrl(value: unknown): value is string {
  return typeof value === "string"
    && /^data:image\/(?:jpeg|jpg|png|webp|gif);base64,[a-z0-9+/=\r\n]+$/i.test(value);
}

function prepareMessagesForGroq(messages: any[]) {
  const selectedImages = new Set<any>();
  for (let messageIndex = messages.length - 1; messageIndex >= 0 && selectedImages.size < MAX_VISION_IMAGES; messageIndex -= 1) {
    const attachments = Array.isArray(messages[messageIndex]?.attachments)
      ? messages[messageIndex].attachments
      : [];
    for (let attachmentIndex = attachments.length - 1; attachmentIndex >= 0 && selectedImages.size < MAX_VISION_IMAGES; attachmentIndex -= 1) {
      const attachment = attachments[attachmentIndex];
      if (attachment?.type?.startsWith("image/")) selectedImages.add(attachment);
    }
  }

  let imageCharacters = 0;
  let includedImageCount = 0;
  let textAttachmentCharacters = 0;

  const sanitizedMessages = messages.map((message: any) => {
    const role = message?.role === "assistant" ? "assistant" : "user";
    const attachments = Array.isArray(message?.attachments) ? message.attachments.slice(0, 8) : [];
    const imageAttachments = attachments.filter((attachment: any) => (
      attachment?.type?.startsWith("image/") && selectedImages.has(attachment)
    ));
    const textAttachments = attachments.filter((attachment: any) => !attachment?.type?.startsWith("image/"));

    let textContent = typeof message?.content === "string"
      ? message.content.slice(0, 50_000)
      : "";

    for (const file of textAttachments) {
      if (typeof file?.data !== "string") continue;
      const remaining = MAX_TOTAL_TEXT_ATTACHMENT_CHARACTERS - textAttachmentCharacters;
      if (remaining <= 0) break;
      const content = file.data.slice(0, Math.min(MAX_TEXT_ATTACHMENT_CHARACTERS, remaining));
      textAttachmentCharacters += content.length;
      const safeName = typeof file.name === "string" ? file.name.slice(0, 120) : "attachment";
      textContent += `\n\n--- Attached file: ${safeName} ---\n${content}\n--- End file ---`;
    }

    if (role === "user" && imageAttachments.length > 0) {
      const contentArray: any[] = [{
        type: "text",
        text: `${textContent.trim() || "Analyze the attached image and explain what you observe."}\n\nUse the attached image as primary evidence. Answer the user's exact question, identify visible details carefully, perform OCR when useful, and clearly state uncertainty instead of inventing details.`,
      }];

      for (const image of imageAttachments) {
        if (!isSupportedImageDataUrl(image.data)) {
          throw new AttachmentValidationError("One of the attached images is not a supported JPEG, PNG, WebP, or GIF.");
        }
        imageCharacters += image.data.length;
        if (imageCharacters > MAX_VISION_DATA_CHARACTERS) {
          throw new AttachmentValidationError("The attached images are too large together. Remove one image and try again.");
        }
        contentArray.push({
          type: "image_url",
          image_url: { url: image.data },
        });
        includedImageCount += 1;
      }

      return { role, content: contentArray };
    }

    return { role, content: textContent || "Continue." };
  });

  return {
    sanitizedMessages,
    hasImages: includedImageCount > 0,
    imageCount: includedImageCount,
  };
}

function isManualChatMode(mode: string): mode is EffectiveChatMode {
  return MANUAL_CHAT_MODES.includes(mode as EffectiveChatMode);
}

function countMatches(text: string, terms: string[]) {
  return terms.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0);
}

function inferChatMode(input: string): EffectiveChatMode {
  const text = input.toLowerCase();
  const scores: Record<EffectiveChatMode, number> = {
    default: 0,
    coding: countMatches(text, [
      "code", "coding", "debug", "bug", "error", "typescript", "javascript", "python", "react", "next.js", "nextjs",
      "api", "database", "sql", "prisma", "supabase", "function", "component", "backend", "frontend", "server",
      "deploy", "repository", "repo", "terminal", "npm", "build", "schema", "endpoint", "stack trace", "exception",
    ]),
    research: countMatches(text, [
      "research", "compare", "comparison", "analyze", "analysis", "study", "evidence", "pros and cons", "tradeoff",
      "latest", "sources", "facts", "market landscape", "explain the difference", "benchmark", "report",
    ]),
    business: countMatches(text, [
      "business", "pricing", "revenue", "customer", "sales", "marketing", "strategy", "growth", "startup",
      "plan", "roadmap", "metrics", "kpi", "conversion", "retention", "positioning", "launch", "brand offer",
    ]),
    creative: countMatches(text, [
      "create", "creative", "brainstorm", "ideas", "name", "names", "tagline", "slogan", "story", "script",
      "caption", "design", "visual", "style", "brand", "hero section", "copywriting", "concept", "make it premium",
    ]),
    fast: countMatches(text, [
      "quick", "fast", "short", "brief", "just tell", "one line", "tl;dr", "tldr", "summarize in", "answer only",
    ]),
  };

  if (/```|<\/?[a-z][\s\S]*>|npm\s+run|pnpm|yarn|const\s+|function\s+|class\s+|import\s+/.test(text)) {
    scores.coding += 4;
  }
  if (text.length < 90 && scores.fast > 0) {
    scores.fast += 2;
  }

  const ranked = (Object.entries(scores) as [EffectiveChatMode, number][])
    .filter(([mode]) => mode !== "default")
    .sort((a, b) => b[1] - a[1]);

  return ranked[0]?.[1] > 0 ? ranked[0][0] : "default";
}

function parseJsonObject(value?: string | null): Record<string, any> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function parseMemories(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => typeof item === "string" && item.trim()).map(item => item.trim()).slice(0, 20);
    }
  } catch {
    // Backward compatibility with earlier plain text memory storage.
  }

  return value
    .split(/\n+/)
    .map(item => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 20);
}

function readAiChatSettings(preferences?: string | null) {
  const raw = parseJsonObject(preferences);
  const aiChat = typeof raw.aiChat === "object" && raw.aiChat !== null ? raw.aiChat as Record<string, any> : {};
  return {
    ...DEFAULT_AI_CHAT_SETTINGS,
    memoryEnabled: typeof aiChat.memoryEnabled === "boolean" ? aiChat.memoryEnabled : DEFAULT_AI_CHAT_SETTINGS.memoryEnabled,
    responseStyle: typeof aiChat.responseStyle === "string" ? aiChat.responseStyle : DEFAULT_AI_CHAT_SETTINGS.responseStyle,
    detailLevel: typeof aiChat.detailLevel === "string" ? aiChat.detailLevel : DEFAULT_AI_CHAT_SETTINGS.detailLevel,
    customInstructions: typeof aiChat.customInstructions === "string" ? aiChat.customInstructions.slice(0, 1600) : "",
  };
}

export async function GET(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user: sbUser } } = await supabaseServer.auth.getUser();
    if (!sbUser || !sbUser.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const chatSessionsRaw = await prisma.chatSession.findMany({
      where: { userId: sbUser.id },
      orderBy: { updatedAt: 'desc' }
    });

    const chatSessions = chatSessionsRaw.map(s => {
      let lastMsgText = "No messages";
      try {
        const msgs = typeof s.messages === 'string' ? JSON.parse(s.messages) : s.messages;
        if (Array.isArray(msgs) && msgs.length > 0) {
          const last = msgs[msgs.length - 1];
          lastMsgText = last.content || "No content";
          if (lastMsgText.length > 60) lastMsgText = lastMsgText.substring(0, 60) + "...";
        }
      } catch (e) {
        console.error("History Parse Error:", e);
      }
      
      return {
        id: s.id,
        title: s.title,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        lastMessage: lastMsgText
      };
    });
    
    // Fetch Context from Prisma
    const context = await prisma.userContext.findUnique({
      where: { userId: sbUser.id }
    });

    let workspace = {};
    try { workspace = typeof context?.recentFiles === 'string' ? JSON.parse(context.recentFiles) : (context?.recentFiles || {}); } catch (e) {}

    return NextResponse.json({ 
      sessions: chatSessions, 
      workspace,
      activeProject: context?.activeProject || "Untitled"
    });
  } catch (error) {
    console.error("GET Chat Sessions Error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user: sbUser } } = await supabaseServer.auth.getUser();
    if (!sbUser || !sbUser.email) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

    const body = await req.json();
    const { messages, sessionId, safeMode = true, studentMode = false, chatMode = "auto", forceImage = false } = body;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_CHAT_MESSAGES) {
      return NextResponse.json({ error: "Invalid chat history." }, { status: 400 });
    }

    // Simple but robust smart NSFW Filter (Light Mode compliant)
    const EXTREME_ILLEGAL_KEYWORDS = [
      "child porn", "cp", "underage sex", "pedophil", "terrorist attack", 
      "bomb recipe", "make meth", "suicide instruction", "self harm instruction",
      "rape scene", "nonconsensual sex", "snuff film", "extreme gore"
    ];

    const STRONG_NSFW_KEYWORDS = [
      "porn", "hardcore sex", "xxx video", "fuck me", "dick pic", "pussy pics", 
      "horny sex", "pornography", "blowjob", "cumshot", "handjob"
    ];

    const lastMessage = messages[messages.length - 1];
    const userPrompt = (lastMessage?.content || "").toLowerCase();
    const requestedChatMode = typeof chatMode === "string" ? chatMode : "auto";
    const effectiveChatMode: EffectiveChatMode = requestedChatMode === "auto"
      ? inferChatMode(lastMessage?.content || "")
      : isManualChatMode(requestedChatMode)
        ? requestedChatMode
        : "default";

    // Check for high-severity illegal content (always blocked in Safe and Creative Mode)
    const hasExtreme = EXTREME_ILLEGAL_KEYWORDS.some(kw => userPrompt.includes(kw));
    if (hasExtreme) {
      console.warn(`[SAFETY DETECTED - EXTREME] Blocked extreme NSFW prompt from user ${sbUser.id} (${sbUser.email}): "${lastMessage?.content?.substring(0, 150)}"`);
      return NextResponse.json({ 
        message: "I am unable to assist with extremely explicit, illegal, or harmful content. Would you like me to help with something else?", 
        blocked: true 
      });
    }

    // Check for strong NSFW content in Safe Mode (Tasteful nudity/mild creative NSFW is ALLOWED)
    if (safeMode) {
      const hasStrongNSFW = STRONG_NSFW_KEYWORDS.some(kw => userPrompt.includes(kw));
      if (hasStrongNSFW) {
        console.warn(`[SAFETY DETECTED - LIGHT SAFE MODE] Blocked strong NSFW prompt from user ${sbUser.id} (${sbUser.email}): "${lastMessage?.content?.substring(0, 150)}"`);
        return NextResponse.json({ 
          message: "Let's keep things creative. I can help with artistic concepts, but I avoid explicit adult content. What else can I help you with?", 
          blocked: true 
        });
      }
    }
    
    // Check if user is asking to generate an image
    const isImageRequest = (prompt: string) => {
      const p = prompt.toLowerCase();
      
      // Bypass phrases (e.g. coding queries, how-to tutorials)
      const bypass = ["how to", "code", "python", "javascript", "tutorial", "guide", "steps", "instruction", "html", "css", "c++", "c#", "java", "script", "program", "api"];
      const hasBypass = bypass.some(b => p.includes(b));
      if (hasBypass) return false;

      // Keywords that signify action
      const actions = ["generate", "create", "make", "draw", "show", "paint", "render", "visualize", "produce", "design"];
      // Keywords that signify visual content
      const visuals = ["image", "picture", "photo", "pic", "artwork", "drawing", "illustration", "visual", "painting", "render", "portrait", "graphic"];
      
      const hasAction = actions.some(act => p.includes(act));
      const hasVisual = visuals.some(vis => p.includes(vis));
      
      if (hasAction && hasVisual) return true;
      
      if (p.includes("draw me") || p.includes("paint me") || p.includes("show me a") || p.startsWith("visual of")) {
        return true;
      }
      
      return false;
    };

    if (forceImage || isImageRequest(userPrompt)) {
      // Extract the prompt for the image
      let imagePrompt = lastMessage.content;
      const cleanRegex = /^(generate|create|make|draw|paint|show me|render|visualize|produce|design)\s+(an?|the|some)?\s*(image|picture|photo|pic|artwork|drawing|illustration|visual|painting|render|portrait|graphic)?\s*(of|about)?\s+/i;
      imagePrompt = imagePrompt.replace(cleanRegex, "").trim();
      if (forceImage) {
        imagePrompt = lastMessage.content.replace(/^generate\s+a\s+clear\s+educational\s+example\s+image\s+that\s+helps\s+students\s+understand\s+this\s+explanation\.\s*focus\s+on\s+the\s+main\s+concept\s+only:\s*/i, "").trim();
        imagePrompt = `Educational diagram, clean visual explanation, student-friendly, high contrast, premium dark classroom style: ${imagePrompt}`;
      }

      try {
        console.log(`[Chat Route] Image request detected. Triggering Image Generator for user ${sbUser.id}...`);
        
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
        const origin = `${protocol}://${host}`;
        const cookie = req.headers.get("cookie") || "";
        
        const imageGenResponse = await axios.post(`${origin}/api/tools/ai/image-generate`, {
          prompt: imagePrompt,
          width: 1024,
          height: 1024,
          steps: 4,
          guidance: 3.5,
          n: 1
        }, {
          headers: {
            Cookie: cookie,
            "Content-Type": "application/json"
          },
          timeout: 25000
        });

        if (imageGenResponse.data?.success) {
          const imageUrl = imageGenResponse.data.imageUrl;
          console.log(`[Chat Route] Image generated successfully: ${imageUrl}`);
          
          return NextResponse.json({
            message: `Here is the image I generated for you based on your request: "${imagePrompt}"`,
            imageUrl: imageUrl,
            isImage: true,
            enhancedPrompt: imageGenResponse.data.enhancedPrompt,
            chatMode: effectiveChatMode,
            requestedChatMode,
            studentMode
          });
        } else {
          throw new Error("Failed to generate image from downstream API");
        }
      } catch (imageGenErr: any) {
        console.error("[Chat Route] Downstream Image Gen Error:", imageGenErr.message);
        
        let userErrorMessage = "I encountered an issue while generating that image for you. Please try again in a moment.";
        
        // Return credit message ONLY on 403 Forbidden credit limit issues
        if (imageGenErr.response?.status === 403) {
          const detail = imageGenErr.response?.data?.error || "";
          if (detail.toLowerCase().includes("limit") || detail.toLowerCase().includes("credits") || detail.toLowerCase().includes("upgrade")) {
            userErrorMessage = `I encountered an issue while generating that image for you. Please make sure you have sufficient credits (image generation costs 10 credits) and try again.`;
          }
        } else if (imageGenErr.message?.includes("timeout") || imageGenErr.code === "ECONNABORTED") {
          userErrorMessage = "The image generation service timed out. Please try again with a simpler prompt or wait a few seconds.";
        }
        
        return NextResponse.json({
          message: userErrorMessage,
          error: imageGenErr.message
        });
      }
    }
    
    // Support both singular and plural env keys
    const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
    const groqKeys = rawKeys.split(",").map(k => k.trim()).filter(Boolean);
    
    if (groqKeys.length === 0) {
      console.error("[Chat] No GROQ_API_KEY found in environment");
      return NextResponse.json({ error: "AI Service Configuration Error" }, { status: 500 });
    }

    async function callGroq(payload: any) {
      let lastError = null;
      for (const key of groqKeys) {
        try {
          const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", payload, {
            headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
            timeout: 20000 
          });
          return res.data;
        } catch (err: any) {
          lastError = err;
          if (err.response?.status === 429) continue;
          if (err.response?.status === 401 || err.response?.status === 403) continue;
          throw err;
        }
      }
      throw lastError || new Error("All AI keys exhausted or failed");
    }

    // Fetch or create UserContext
    let userContext = await prisma.userContext.findUnique({ where: { userId: sbUser.id } });
    if (!userContext) {
      userContext = await prisma.userContext.create({ data: { userId: sbUser.id } });
    }

    const aiSettings = readAiChatSettings(userContext?.preferences);
    const memories = aiSettings.memoryEnabled ? parseMemories(userContext?.memories) : [];
    const styleGuide = [
      aiSettings.responseStyle !== "balanced" ? `Preferred response style: ${aiSettings.responseStyle}.` : "",
      aiSettings.detailLevel !== "standard" ? `Preferred detail level: ${aiSettings.detailLevel}.` : "",
      aiSettings.customInstructions ? `User custom instructions: ${aiSettings.customInstructions}` : "",
    ].filter(Boolean).join(" ");
    const memoryGuide = memories.length ? memories.map(memory => `- ${memory}`).join("\n") : "None";
    const contextStr = `USER CONTEXT:
Memory is ${aiSettings.memoryEnabled ? "enabled" : "disabled"}.
Saved memories:
${memoryGuide}
${styleGuide ? `\nPersonalization instructions: ${styleGuide}` : ""}`;
    const modePromptMap: Record<string, string> = {
      default: "You are Exismic Ai. Be direct, witty, and proactive. Use markdown.",
      coding: "You are Exismic Ai in Coding Mode. Prioritize correctness, architecture, security, performance, and maintainable code. Ask for missing context only when necessary. Use concise explanations, code blocks, file-level guidance, edge cases, and testing notes.",
      research: "You are Exismic Ai in Research Mode. Be careful, structured, and evidence-oriented. Separate facts from assumptions, compare options, note uncertainty, and end with concise takeaways or next research steps. Do not invent citations.",
      business: "You are Exismic Ai in Business Mode. Think like a sharp operator. Focus on strategy, execution, positioning, pricing, risks, metrics, and practical next actions. Keep answers executive-friendly and decision-oriented.",
      creative: "You are Exismic Ai in Creative Mode. Be imaginative, high-end, and original. Generate polished concepts, names, hooks, story angles, visual directions, and variations. Keep ideas usable, not vague.",
      fast: "You are Exismic Ai in Fast Answers Mode. Respond with the shortest useful answer. Lead with the answer, skip fluff, use compact bullets only when helpful, and avoid long explanations unless the user asks.",
    };
    const selectedModePrompt = modePromptMap[effectiveChatMode] || modePromptMap.default;
    const defaultSystemPrompt = `${selectedModePrompt} ${contextStr}`;
    const studentSystemPrompt = `Act as a patient, expert teacher. Explain concepts clearly with examples. Use images when helpful. Keep responses educational and focused. Break down difficult topics step-by-step.

Student Mode rules:
- Stay strictly educational and learning-focused.
- If the user asks for something non-educational, politely redirect them to a learning version of the topic.
- Use simple language first, then add depth when useful.
- Always include at least one real-world example when explaining a concept.
- Break complex topics into clear steps.
- Include practice questions, a quick quiz, or a mini exercise when appropriate.
- Use markdown headings, bullet points, numbered steps, tables, and code blocks where they improve clarity.
- Use #, ##, and ### for headings. Do not underline headings with === or ---.
- When an example image would help, suggest what visual would be useful. The app can generate it when the user clicks Generate Example Image.
- Do not claim that you generated an image unless the response includes an actual generated image URL.

${contextStr}`;
    const systemPrompt = studentMode ? studentSystemPrompt : defaultSystemPrompt;
    const { sanitizedMessages, hasImages, imageCount } = prepareMessagesForGroq(messages);
    const temperature = effectiveChatMode === "creative" ? 0.75 : effectiveChatMode === "fast" ? 0.25 : 0.5;
    const basePayload = {
      messages: [{ role: "system", content: systemPrompt }, ...sanitizedMessages],
      temperature,
      max_completion_tokens: 2048,
    };

    let data;
    if (hasImages) {
      const configuredVisionModels = (process.env.GROQ_VISION_MODELS || "")
        .split(",")
        .map(model => model.trim())
        .filter(Boolean);
      const visionModels = configuredVisionModels.length > 0 ? configuredVisionModels : DEFAULT_VISION_MODELS;
      let lastVisionError: any = null;

      for (const model of visionModels) {
        try {
          data = await callGroq({ ...basePayload, model });
          console.info(`[Chat Vision] Analyzed ${imageCount} image(s) with ${model} for user ${sbUser.id}.`);
          break;
        } catch (error: any) {
          lastVisionError = error;
          console.warn(`[Chat Vision] ${model} failed:`, error.response?.data?.error?.message || error.message);
        }
      }

      if (!data) {
        const upstreamMessage = lastVisionError?.response?.data?.error?.message;
        throw new Error(upstreamMessage || "Exismic Vision is temporarily unavailable. Please try again.");
      }
    } else {
      data = await callGroq({
        ...basePayload,
        model: "llama-3.3-70b-versatile",
      });
    }
    if (!data?.choices?.[0]) throw new Error("AI Service invalid response");

    const finalAiContent = data.choices[0].message.content || "";
    const finalMessages = [...messages, { role: "assistant", content: finalAiContent, chatMode: effectiveChatMode, requestedChatMode, studentMode }];
    let activeSessionId = sessionId;
    let finalTitle: string | undefined = undefined;

    // Ensure user exists in Prisma before creating session
    await prisma.user.upsert({
      where: { id: sbUser.id },
      update: {},
      create: {
        id: sbUser.id,
        email: sbUser.email,
        name: sbUser.user_metadata?.full_name || sbUser.email.split('@')[0],
      }
    });

    async function generateSmartTitle(userQuery: string): Promise<string> {
      try {
        const titlePayload = {
          model: "llama-3.3-70b-versatile",
          messages: [
            { 
              role: "system", 
              content: "You are a concise title generator. Generate a highly specific, clean, descriptive title of exactly 3-5 words summarizing the user's intent. Do NOT use markdown, quotes, greeting words, punctuation, or introductory phrases. Examples: 'Discord Bot Setup', 'Fitness App Landing Page', 'Nonchalant Word Meaning'." 
            },
            { role: "user", content: userQuery.substring(0, 500) }
          ],
          temperature: 0.6,
          max_tokens: 15
        };
        const titleData = await callGroq(titlePayload);
        let titleText = titleData.choices[0].message.content.trim();
        
        // Strip markdown, asterisks, brackets, hashes, backticks, quotes, double spaces
        titleText = titleText
          .replace(/[#*\_`\-\+\[\]\(\)]/g, "")
          .replace(/['"]+/g, "")
          .replace(/\s+/g, " ")
          .trim();

        if (titleText.length > 40) titleText = titleText.substring(0, 37) + "...";
        return titleText;
      } catch (err) {
        console.warn("Smart title generation failed:", err);
        // Clean fallback
        let fallback = userQuery
          .replace(/[#*\_`\-\+\[\]\(\)]/g, "")
          .replace(/['"]+/g, "")
          .replace(/\s+/g, " ")
          .trim();
        return fallback.length > 40 ? fallback.substring(0, 37) + "..." : fallback;
      }
    }

    if (activeSessionId) {
      const existingSession = await prisma.chatSession.findUnique({
        where: { id: activeSessionId },
        select: { title: true, userId: true }
      });

      if (!existingSession || existingSession.userId !== sbUser.id) {
        return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
      }
      
      const isGeneric = !existingSession?.title || 
                        existingSession.title === "New Chat" || 
                        existingSession.title.length <= 5 || 
                        /^(hi|hello|hey|test|yo|son|greeting|greetings)$/i.test(existingSession.title.trim());

      if (isGeneric && messages.length > 0) {
        const meaningfulQuery = messages.find((m: any) => m.role === 'user' && m.content.trim().length > 5)?.content;
        if (meaningfulQuery) {
          finalTitle = await generateSmartTitle(meaningfulQuery);
        }
      }

      await prisma.chatSession.update({
        where: { id: activeSessionId },
        data: { 
          messages: JSON.stringify(finalMessages),
          ...(finalTitle ? { title: finalTitle } : {})
        }
      });
    } else {
      const firstMsg = messages.find((m: any) => m.role === 'user')?.content || "New Chat";
      const smartTitle = await generateSmartTitle(firstMsg);
      const newSession = await prisma.chatSession.create({
        data: {
          userId: sbUser.id,
          title: smartTitle,
          messages: JSON.stringify(finalMessages)
        }
      });
      activeSessionId = newSession.id;
    }

    // Fire-and-forget credit consumption
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (req.url.includes('localhost') ? 'http://localhost:3000' : '');
      fetch(`${baseUrl}/api/user/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': req.headers.get('cookie') || '' },
        body: JSON.stringify({ action: 'consume-message', amount: 1 })
      }).catch(e => console.warn("[Chat] Credits sync failed:", e.message));
    } catch (e) {}

    return NextResponse.json({ message: finalAiContent, id: activeSessionId, chatMode: effectiveChatMode, requestedChatMode, studentMode });
  } catch (err: any) {
    console.error("[Chat] POST Error:", err.message);
    if (err instanceof AttachmentValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const errorMsg = err.response?.data?.error?.message || err.message || "AI failed to respond";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

