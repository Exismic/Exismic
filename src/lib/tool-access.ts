import "server-only";

import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { getOrCreateUser, hasActiveProAccess } from "@/lib/user-access";
import { deductCredits, getCreditTotal, getUserCredits } from "@/lib/credits";
import type { OutputTier } from "@/lib/tool-quality-policy";

export type ToolAccessMode = "free-quality" | "authenticated" | "pro";

export type ToolAccess = {
  authUser: User | null;
  appUser: Awaited<ReturnType<typeof getOrCreateUser>> | null;
  isAuthenticated: boolean;
  isPro: boolean;
  outputTier: OutputTier;
  creditCost: number;
};

function requestedOutputTier(request: NextRequest, toolId: string, formData?: FormData): OutputTier {
  const value =
    formData?.get("outputTier") ||
    request.headers.get("x-exismic-output-tier") ||
    request.cookies.get(`exismic_output_tier_${toolId}`)?.value;
  return value === "hd" ? "hd" : "standard";
}

export async function resolveToolAccess(
  request: NextRequest,
  options: {
    toolId: string;
    mode: ToolAccessMode;
    creditCost?: number;
    formData?: FormData;
  },
): Promise<ToolAccess | NextResponse> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const outputTier = requestedOutputTier(request, options.toolId, options.formData);

  if (!authUser) {
    if (options.mode !== "free-quality" || outputTier === "hd") {
      return NextResponse.json(
        {
          error: outputTier === "hd"
            ? "Sign in to unlock HD output."
            : "Please sign in to use this tool.",
          code: "LOGIN_REQUIRED",
          loginRequired: true,
          outputTier,
        },
        { status: 401 },
      );
    }

    return {
      authUser: null,
      appUser: null,
      isAuthenticated: false,
      isPro: false,
      outputTier: "standard",
      creditCost: 0,
    };
  }

  const appUser = await getOrCreateUser(authUser);
  const isPro = hasActiveProAccess(appUser);
  if (options.mode === "pro" && !isPro) {
    return NextResponse.json(
      {
        error: "Exismic Pro is required for this tool.",
        code: "PRO_REQUIRED",
        proRequired: true,
      },
      { status: 403 },
    );
  }

  const creditCost = options.mode === "free-quality"
    ? (outputTier === "hd" ? Math.max(0, options.creditCost || 0) : 0)
    : Math.max(0, options.creditCost || 0);

  if (creditCost > 0) {
    const credits = await getUserCredits(appUser.id);
    const available = credits ? getCreditTotal(credits) : 0;
    if (!credits || available < creditCost) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          code: "INSUFFICIENT_CREDITS",
          available,
          required: creditCost,
        },
        { status: 402 },
      );
    }
  }

  return {
    authUser,
    appUser,
    isAuthenticated: true,
    isPro,
    outputTier,
    creditCost,
  };
}

export function isToolAccessResponse(value: ToolAccess | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

export async function chargeToolAccess(
  access: ToolAccess,
  toolId: string,
  operationId?: string,
) {
  if (!access.appUser || access.creditCost <= 0) {
    return { success: true as const, data: null };
  }

  return deductCredits(
    access.appUser.id,
    access.creditCost,
    toolId,
    operationId,
  );
}
