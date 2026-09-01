import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { generateNewApiKey, type ApiKeyPayload } from "@/lib/api-keys";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [context, dbUser] = await Promise.all([
      prisma.userContext.findUnique({ where: { userId: user.id } }),
      prisma.user.findUnique({ where: { id: user.id }, select: { plan: true, role: true } }),
    ]);

    const isPro = dbUser?.plan === "pro" || dbUser?.role === "admin";
    const maxKeys = isPro ? 10 : 1;

    let keys: ApiKeyPayload[] = [];
    if (context?.preferences) {
      try {
        const parsed = JSON.parse(context.preferences);
        keys = (parsed.apiKeys || []).map((k: ApiKeyPayload) => ({
          keyId: k.keyId,
          name: k.name,
          keyPrefix: k.keyPrefix,
          createdAt: k.createdAt,
          lastUsedAt: k.lastUsedAt,
        }));
      } catch {}
    }

    return NextResponse.json({ 
      keys, 
      plan: dbUser?.plan || "free",
      isPro,
      maxKeys,
      remaining: Math.max(0, maxKeys - keys.length),
    });
  } catch (error) {
    console.error("[API_KEYS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [context, dbUser] = await Promise.all([
      prisma.userContext.findUnique({ where: { userId: user.id } }),
      prisma.user.findUnique({ where: { id: user.id }, select: { plan: true, role: true } }),
    ]);

    const isPro = dbUser?.plan === "pro" || dbUser?.role === "admin";
    const maxKeys = isPro ? 10 : 1;

    let currentPreferences: Record<string, any> = {};
    if (context?.preferences) {
      try {
        currentPreferences = JSON.parse(context.preferences);
      } catch {}
    }

    const existingKeys: ApiKeyPayload[] = currentPreferences.apiKeys || [];

    if (existingKeys.length >= maxKeys) {
      return NextResponse.json(
        {
          error: isPro
            ? `You have reached the maximum limit of ${maxKeys} API keys.`
            : `Free tier accounts are limited to 1 active API key. Please upgrade to Pro for up to 10 API keys.`,
          code: "API_KEY_LIMIT_REACHED",
          maxKeys,
          currentCount: existingKeys.length,
          isPro,
        },
        { status: 403 }
      );
    }

    const { name } = await request.json().catch(() => ({ name: "Default API Key" }));
    const { rawKey, keyMetadata } = generateNewApiKey(name || "Default API Key");

    existingKeys.unshift(keyMetadata);
    currentPreferences.apiKeys = existingKeys;

    await prisma.userContext.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        preferences: JSON.stringify(currentPreferences),
      },
      update: {
        preferences: JSON.stringify(currentPreferences),
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: rawKey,
      keyMetadata: {
        keyId: keyMetadata.keyId,
        name: keyMetadata.name,
        keyPrefix: keyMetadata.keyPrefix,
        createdAt: keyMetadata.createdAt,
      },
      maxKeys,
      remaining: Math.max(0, maxKeys - existingKeys.length),
    });
  } catch (error) {
    console.error("[API_KEYS_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyId } = await request.json();
    const context = await prisma.userContext.findUnique({
      where: { userId: user.id },
    });

    if (!context?.preferences) {
      return NextResponse.json({ error: "No keys found" }, { status: 404 });
    }

    const currentPreferences = JSON.parse(context.preferences);
    const existingKeys: ApiKeyPayload[] = currentPreferences.apiKeys || [];
    currentPreferences.apiKeys = existingKeys.filter((k) => k.keyId !== keyId);

    await prisma.userContext.update({
      where: { userId: user.id },
      data: { preferences: JSON.stringify(currentPreferences) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API_KEYS_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 });
  }
}
