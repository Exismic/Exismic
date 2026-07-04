import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const CHAT_MODES = ["auto", "default", "coding", "research", "business", "creative", "fast"] as const;
const RESPONSE_STYLES = ["balanced", "concise", "detailed", "teacher", "operator"] as const;
const DETAIL_LEVELS = ["short", "standard", "deep"] as const;

const DEFAULT_AI_CHAT_SETTINGS = {
  defaultChatMode: "auto",
  defaultStudentMode: false,
  memoryEnabled: true,
  typingAnimation: true,
  smartFollowUps: true,
  responseStyle: "balanced",
  detailLevel: "standard",
  customInstructions: "",
};

type AiChatSettings = typeof DEFAULT_AI_CHAT_SETTINGS;

function parseJsonObject(value?: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeSettings(input: unknown): AiChatSettings {
  const source = typeof input === "object" && input !== null ? input as Record<string, unknown> : {};
  const defaultChatMode = CHAT_MODES.includes(source.defaultChatMode as any)
    ? source.defaultChatMode as AiChatSettings["defaultChatMode"]
    : DEFAULT_AI_CHAT_SETTINGS.defaultChatMode;
  const responseStyle = RESPONSE_STYLES.includes(source.responseStyle as any)
    ? source.responseStyle as AiChatSettings["responseStyle"]
    : DEFAULT_AI_CHAT_SETTINGS.responseStyle;
  const detailLevel = DETAIL_LEVELS.includes(source.detailLevel as any)
    ? source.detailLevel as AiChatSettings["detailLevel"]
    : DEFAULT_AI_CHAT_SETTINGS.detailLevel;

  return {
    defaultChatMode,
    defaultStudentMode: typeof source.defaultStudentMode === "boolean" ? source.defaultStudentMode : DEFAULT_AI_CHAT_SETTINGS.defaultStudentMode,
    memoryEnabled: typeof source.memoryEnabled === "boolean" ? source.memoryEnabled : DEFAULT_AI_CHAT_SETTINGS.memoryEnabled,
    typingAnimation: typeof source.typingAnimation === "boolean" ? source.typingAnimation : DEFAULT_AI_CHAT_SETTINGS.typingAnimation,
    smartFollowUps: typeof source.smartFollowUps === "boolean" ? source.smartFollowUps : DEFAULT_AI_CHAT_SETTINGS.smartFollowUps,
    responseStyle,
    detailLevel,
    customInstructions: typeof source.customInstructions === "string" ? source.customInstructions.slice(0, 1600) : DEFAULT_AI_CHAT_SETTINGS.customInstructions,
  };
}

function parseMemories(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => typeof item === "string" && item.trim()).map(item => item.trim()).slice(0, 40);
    }
  } catch {
    // Existing installs may have plain text memories.
  }

  return value
    .split(/\n+/)
    .map(item => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 40);
}

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id || !user.email) return null;

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email.split("@")[0],
    },
  });

  return user;
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const context = await prisma.userContext.findUnique({
      where: { userId: user.id },
      select: { preferences: true, memories: true },
    });
    const preferences = parseJsonObject(context?.preferences);

    return NextResponse.json({
      success: true,
      settings: normalizeSettings(preferences.aiChat),
      memories: parseMemories(context?.memories),
    });
  } catch (error) {
    console.error("[AI Chat Settings GET]", error);
    return NextResponse.json({ error: "Could not load AI chat settings." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const context = await prisma.userContext.findUnique({
      where: { userId: user.id },
      select: { preferences: true, memories: true },
    });

    const preferences = parseJsonObject(context?.preferences);
    const existingSettings = normalizeSettings(preferences.aiChat);
    let nextSettings = existingSettings;
    let nextMemories = parseMemories(context?.memories);

    if (body?.settings) {
      nextSettings = normalizeSettings({ ...existingSettings, ...body.settings });
    }

    if (body?.action === "add-memory") {
      const memory = String(body.memory || "").replace(/\s+/g, " ").trim().slice(0, 500);
      if (!memory) return NextResponse.json({ error: "Memory cannot be empty." }, { status: 400 });
      const lower = memory.toLowerCase();
      nextMemories = [memory, ...nextMemories.filter(item => item.toLowerCase() !== lower)].slice(0, 40);
    }

    if (body?.action === "delete-memory") {
      const memory = String(body.memory || "").trim().toLowerCase();
      nextMemories = nextMemories.filter(item => item.toLowerCase() !== memory);
    }

    if (body?.action === "clear-memories") {
      nextMemories = [];
    }

    if (Array.isArray(body?.memories)) {
      nextMemories = body.memories
        .filter((item: unknown) => typeof item === "string" && item.trim())
        .map((item: string) => item.replace(/\s+/g, " ").trim().slice(0, 500))
        .slice(0, 40);
    }

    const nextPreferences = {
      ...preferences,
      aiChat: nextSettings,
    };

    await prisma.userContext.upsert({
      where: { userId: user.id },
      update: {
        preferences: JSON.stringify(nextPreferences),
        memories: JSON.stringify(nextMemories),
      },
      create: {
        userId: user.id,
        preferences: JSON.stringify(nextPreferences),
        memories: JSON.stringify(nextMemories),
      },
    });

    return NextResponse.json({
      success: true,
      settings: nextSettings,
      memories: nextMemories,
    });
  } catch (error) {
    console.error("[AI Chat Settings POST]", error);
    return NextResponse.json({ error: "Could not save AI chat settings." }, { status: 500 });
  }
}
