import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { getOrCreateUser, hasActiveProAccess } from "@/lib/user-access";

type RateBucket = {
  count: number;
  resetAt: number;
};

const rateBuckets = new Map<string, RateBucket>();

export async function requireApiUser(): Promise<User | NextResponse> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Please sign in to use this tool." }, { status: 401 });
  }

  return user;
}

export async function getOptionalApiUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user || null;
}

export async function requireProApiUser(): Promise<User | NextResponse> {
  const authUser = await requireApiUser();
  if (authUser instanceof NextResponse) return authUser;
  const appUser = await getOrCreateUser(authUser);
  if (!hasActiveProAccess(appUser)) {
    return NextResponse.json(
      { error: "Exismic Pro is required for this tool.", code: "PRO_REQUIRED", proRequired: true },
      { status: 403 },
    );
  }
  return authUser;
}

export function getRequestIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfter: 0,
  };
}

export function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    }
  );
}

export function validateUploadedFile(
  file: File | null | undefined,
  options: {
    required?: boolean;
    maxBytes: number;
    allowedMimePrefixes?: string[];
    label?: string;
  }
) {
  const label = options.label || "file";

  if (!file) {
    if (options.required === false) return null;
    return NextResponse.json({ error: `No ${label} uploaded.` }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: `${label} is empty.` }, { status: 400 });
  }

  if (file.size > options.maxBytes) {
    return NextResponse.json(
      { error: `${label} is too large. Maximum size is ${Math.round(options.maxBytes / 1024 / 1024)}MB.` },
      { status: 413 }
    );
  }

  if (options.allowedMimePrefixes?.length) {
    const matches = options.allowedMimePrefixes.some((prefix) => file.type.startsWith(prefix));
    if (!matches) {
      return NextResponse.json({ error: `Unsupported ${label} type.` }, { status: 415 });
    }
  }

  return null;
}
