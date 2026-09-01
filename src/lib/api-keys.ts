import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCreditTotal, deductCredits } from "@/lib/credits";

export interface ApiKeyPayload {
  keyId: string;
  name: string;
  keyPrefix: string;
  hashedKey: string;
  createdAt: string;
  lastUsedAt?: string | null;
}

export function generateNewApiKey(name: string = "Default API Key") {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const rawKey = `ex_live_${randomBytes}`;
  const keyPrefix = rawKey.slice(0, 12);
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyId = crypto.randomUUID();

  return {
    rawKey,
    keyMetadata: {
      keyId,
      name,
      keyPrefix,
      hashedKey,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    } as ApiKeyPayload,
  };
}

export async function verifyAndAuthenticateApiKey(authHeader?: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header. Use 'Bearer ex_live_...'", status: 401 };
  }

  const rawKey = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!rawKey.startsWith("ex_live_")) {
    return { error: "Invalid API key format", status: 401 };
  }

  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

  // Search across UserContext preferences for matching hashedKey
  const allContexts = await prisma.userContext.findMany({
    where: { preferences: { contains: hashedKey } },
    include: { user: true },
  });

  if (!allContexts.length) {
    return { error: "Invalid or revoked API key", status: 401 };
  }

  const context = allContexts[0];
  const user = context.user;

  if (user.status === "suspended") {
    return { error: "Account suspended", status: 403 };
  }

  const credits = getCreditTotal(user);
  if (credits <= 0) {
    return { error: "Insufficient credits for API call", status: 402, credits: 0 };
  }

  return {
    success: true,
    user,
    userId: user.id,
    credits,
    plan: user.plan,
  };
}
