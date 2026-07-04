import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import {
  detectLumoraTool,
  lumoraAiToolRegistry,
  validateLumoraToolParameters,
  type LumoraAiToolId,
} from "@/lib/lumora-ai-tools";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const MAX_MESSAGES = 60;
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: Array<{ type?: string; data?: string; name?: string }>;
  [key: string]: unknown;
}

function safeFileStem(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "lumora-result";
}

function getLatestImage(messages: StoredMessage[]) {
  for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
    const attachments = messages[messageIndex].attachments || [];
    for (let attachmentIndex = attachments.length - 1; attachmentIndex >= 0; attachmentIndex -= 1) {
      const attachment = attachments[attachmentIndex];
      if (
        attachment.type?.startsWith("image/")
        && typeof attachment.data === "string"
        && /^data:image\/[a-z0-9.+-]+;base64,/i.test(attachment.data)
      ) {
        return attachment;
      }
    }
  }
  return null;
}

function fileFromDataUrl(dataUrl: string, name: string) {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/s);
  if (!match) throw new Error("The attached image data is invalid.");
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_SOURCE_BYTES) throw new Error("The attached image is too large.");
  return new File([buffer], name, { type: match[1] });
}

async function persistToolMessage({
  userId,
  email,
  sessionId,
  messages,
  assistantMessage,
  fallbackTitle,
}: {
  userId: string;
  email: string;
  sessionId: string | null;
  messages: StoredMessage[];
  assistantMessage: StoredMessage;
  fallbackTitle: string;
}) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email,
      name: email.split("@")[0],
    },
  });

  const finalMessages = [...messages, assistantMessage];
  if (sessionId) {
    const existing = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });
    if (!existing || existing.userId !== userId) {
      throw new Error("Chat session not found.");
    }
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { messages: JSON.stringify(finalMessages) },
    });
    return sessionId;
  }

  const created = await prisma.chatSession.create({
    data: {
      userId,
      title: fallbackTitle,
      messages: JSON.stringify(finalMessages),
    },
  });
  return created.id;
}

function appendParameters(form: FormData, toolId: LumoraAiToolId, parameters: Record<string, unknown>) {
  if (toolId === "image-compressor") {
    form.append("quality", String(parameters.quality));
    form.append("format", String(parameters.format));
    form.append("removeMetadata", String(parameters.removeMetadata));
    if (parameters.maxWidth) form.append("maxWidth", String(parameters.maxWidth));
    if (parameters.maxHeight) form.append("maxHeight", String(parameters.maxHeight));
  }

  if (toolId === "image-converter") {
    form.append("targetFormat", String(parameters.targetFormat));
    form.append("quality", String(parameters.quality));
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Please sign in to run Lumora tools." }, { status: 401 });
    }

    const body = await request.formData();
    const prompt = String(body.get("prompt") || "").trim();
    const sessionIdValue = String(body.get("sessionId") || "").trim();
    const sessionId = sessionIdValue || null;
    const rawMessages = String(body.get("messages") || "[]");
    let messages: StoredMessage[];
    try {
      messages = JSON.parse(rawMessages);
    } catch {
      return NextResponse.json({ error: "Invalid chat history." }, { status: 400 });
    }
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: "Invalid chat history." }, { status: 400 });
    }

    const detected = detectLumoraTool(prompt);
    if (!detected) return NextResponse.json({ handled: false });

    const registryEntry = lumoraAiToolRegistry[detected.toolId];
    if (detected.missing === "dimensions") {
      const message = "Tell me the target dimensions, for example: **resize this to 1080 x 1080**.";
      const activeSessionId = await persistToolMessage({
        userId: user.id,
        email: user.email,
        sessionId,
        messages,
        assistantMessage: { role: "assistant", content: message },
        fallbackTitle: "Resize Image",
      });
      return NextResponse.json({ handled: true, requiresInput: true, message, id: activeSessionId });
    }

    const uploaded = body.get("file");
    let sourceFile = uploaded instanceof File && uploaded.size > 0 ? uploaded : null;
    if (!sourceFile) {
      const previousImage = getLatestImage(messages);
      if (previousImage?.data) {
        sourceFile = fileFromDataUrl(previousImage.data, previousImage.name || "chat-image.jpg");
      }
    }
    if (!sourceFile) {
      return NextResponse.json({
        handled: true,
        requiresInput: true,
        message: `Upload an image so I can run ${registryEntry.label}.`,
      });
    }
    if (!sourceFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "This tool requires an image file." }, { status: 415 });
    }
    if (sourceFile.size > MAX_SOURCE_BYTES) {
      return NextResponse.json({ error: "The image is larger than 25MB." }, { status: 413 });
    }

    const parameters = validateLumoraToolParameters(detected) as Record<string, unknown>;
    const toolForm = new FormData();
    toolForm.append("file", sourceFile, sourceFile.name || "lumora-image.jpg");
    appendParameters(toolForm, detected.toolId, parameters);

    if (detected.toolId === "image-resizer") {
      const buffer = Buffer.from(await sourceFile.arrayBuffer());
      const metadata = await sharp(buffer).metadata();
      if (!metadata.width || !metadata.height) {
        return NextResponse.json({ error: "Could not read the image dimensions." }, { status: 400 });
      }
      toolForm.append("crop", JSON.stringify({
        x: 0,
        y: 0,
        width: metadata.width,
        height: metadata.height,
      }));
      toolForm.append("width", String(parameters.width));
      toolForm.append("height", String(parameters.height));
      toolForm.append("format", String(parameters.format));
      toolForm.append("quality", String(parameters.quality));
    }

    const protocol = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
    const endpoint = `${protocol}://${host}${registryEntry.endpoint}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      body: toolForm,
      signal: AbortSignal.timeout(60_000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result?.success) {
      const status = response.status >= 400 ? response.status : 500;
      return NextResponse.json(
        { error: result?.error || `${registryEntry.label} failed.` },
        { status },
      );
    }

    const resultUrl = String(result.result || result.resultUrl || "");
    if (!resultUrl) {
      return NextResponse.json({ error: `${registryEntry.label} returned no result.` }, { status: 502 });
    }

    const sourceStem = safeFileStem(sourceFile.name || "lumora-image");
    const format = String(result.format || (detected.toolId === "background-remover" ? "png" : parameters.targetFormat || parameters.format || "png"));
    const toolRun = {
      toolId: detected.toolId,
      label: registryEntry.label,
      status: "completed" as const,
      resultUrl,
      downloadName: `${sourceStem}-${detected.toolId}.${format === "jpeg" ? "jpg" : format}`,
      format,
      width: Number(result.width) || undefined,
      height: Number(result.height) || undefined,
      size: Number(result.size) || undefined,
      quality: Number(result.quality) || undefined,
      credits: registryEntry.creditCost,
      priority: Boolean(result.priority),
      processingLabel: result.processingLabel || "Completed",
    };
    const message = `${registryEntry.label} finished successfully. Your result is ready below.`;
    const assistantMessage: StoredMessage = {
      role: "assistant",
      content: message,
      toolRun,
      chatMode: "auto",
    };
    const activeSessionId = await persistToolMessage({
      userId: user.id,
      email: user.email,
      sessionId,
      messages,
      assistantMessage,
      fallbackTitle: registryEntry.label,
    });

    return NextResponse.json({
      handled: true,
      message,
      id: activeSessionId,
      toolRun,
    });
  } catch (error: unknown) {
    console.error("[Lumora AI Orchestrator]", error);
    const message = error instanceof Error ? error.message : "Lumora could not run this tool.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
