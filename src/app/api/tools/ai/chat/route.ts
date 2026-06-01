import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import axios from 'axios';

export const dynamic = 'force-dynamic';

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
    const { messages, sessionId, safeMode = true } = body;

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

    if (isImageRequest(userPrompt)) {
      // Extract the prompt for the image
      let imagePrompt = lastMessage.content;
      const cleanRegex = /^(generate|create|make|draw|paint|show me|render|visualize|produce|design)\s+(an?|the|some)?\s*(image|picture|photo|pic|artwork|drawing|illustration|visual|painting|render|portrait|graphic)?\s*(of|about)?\s+/i;
      imagePrompt = imagePrompt.replace(cleanRegex, "").trim();

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
            enhancedPrompt: imageGenResponse.data.enhancedPrompt
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

    const contextStr = `USER CONTEXT: Preferences: ${userContext?.preferences || 'None'}, Memories: ${userContext?.memories || 'None'}`;
    const systemPrompt = `You are Lumora AI. Be direct, witty, and proactive. Use markdown. ${contextStr}`;
    // Process vision/text attachments in messages
    let activeModel = "llama-3.3-70b-versatile";
    
    // Check if any message contains image attachments
    const hasImages = messages.some((m: any) => m.attachments?.some((a: any) => a.type?.startsWith("image/")));
    if (hasImages) {
      activeModel = "llama-3.2-11b-vision-preview";
    }

    const sanitizedMessages = messages.map((m: any) => {
      // Process attachments in user messages
      const attachments = m.attachments || [];
      const imageAttachments = attachments.filter((a: any) => a.type?.startsWith("image/"));
      const textAttachments = attachments.filter((a: any) => !a.type?.startsWith("image/"));

      // Append text attachments contents to prompt
      let textContent = m.content || "";
      if (textAttachments.length > 0) {
        textContent += "\n\n[Attached Files]";
        textAttachments.forEach((file: any) => {
          textContent += `\n\n--- File: ${file.name} (${file.type}) ---\n${file.data}\n-------------------------`;
        });
      }

      if (imageAttachments.length > 0) {
        // Multi-modal format for vision model
        const contentArray: any[] = [{ type: "text", text: textContent || "Analyze the uploaded image(s)." }];
        imageAttachments.forEach((img: any) => {
          contentArray.push({
            type: "image_url",
            image_url: {
              url: img.data // Base64 data URL
            }
          });
        });
        return { role: m.role, content: contentArray };
      }

      return { role: m.role, content: textContent };
    });

    const groqPayload = { 
      model: activeModel, 
      messages: [{ role: "system", content: systemPrompt }, ...sanitizedMessages], 
      temperature: 0.5 
    };

    let data;
    try {
      data = await callGroq(groqPayload);
    } catch (visionErr) {
      if (activeModel === "llama-3.2-11b-vision-preview") {
        console.warn("Vision model call failed, falling back to text-only model...", visionErr);
        
        // Strip image urls and use standard text model
        const textOnlyMessages = messages.map((m: any) => {
          const attachments = m.attachments || [];
          const textAttachments = attachments.filter((a: any) => !a.type?.startsWith("image/"));
          const imageAttachments = attachments.filter((a: any) => a.type?.startsWith("image/"));
          
          let textContent = m.content || "";
          if (textAttachments.length > 0) {
            textContent += "\n\n[Attached Files]";
            textAttachments.forEach((file: any) => {
              textContent += `\n\n--- File: ${file.name} (${file.type}) ---\n${file.data}\n-------------------------`;
            });
          }
          if (imageAttachments.length > 0) {
            textContent += `\n\n[Attached Image description: User uploaded ${imageAttachments.length} image file(s) named ${imageAttachments.map((i: any) => i.name).join(", ")}]`;
          }
          return { role: m.role, content: textContent };
        });
        
        const fallbackPayload = {
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: systemPrompt }, ...textOnlyMessages],
          temperature: 0.5
        };
        data = await callGroq(fallbackPayload);
      } else {
        throw visionErr;
      }
    }
    if (!data?.choices?.[0]) throw new Error("AI Service invalid response");

    const finalAiContent = data.choices[0].message.content || "";
    const finalMessages = [...messages, { role: "assistant", content: finalAiContent }];
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

    return NextResponse.json({ message: finalAiContent, id: activeSessionId });
  } catch (err: any) {
    console.error("[Chat] POST Error:", err.message);
    const errorMsg = err.response?.data?.error?.message || err.message || "AI failed to respond";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

