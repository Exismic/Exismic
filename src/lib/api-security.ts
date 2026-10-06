import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { consumeRequestLimit } from "@/lib/request-rate-limit";

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
  // All tools now accessible to registered users via the unified credit system
  return requireApiUser();
}

export function getRequestIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export const checkRateLimit = consumeRequestLimit;
export const checkDistributedRateLimit = consumeRequestLimit;

export function rateLimitResponse(retryAfter: number, unavailable = false) {
  return NextResponse.json(
    { error: unavailable ? "This service is temporarily unavailable. Please try again shortly." : "Too many requests. Please wait a moment and try again." },
    {
      status: unavailable ? 503 : 429,
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
