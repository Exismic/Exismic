import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getSupportAgentPlan, SUPPORT_AGENT_DEFAULTS, type SupportAgentInput } from "./types";
import { prisma } from "@/lib/prisma";

export function supportSchemaUnavailable(error: unknown) {
  const message = error instanceof Error ? error.message : JSON.stringify(error);
  return /support_agents|support_documents|support_conversations|support_messages|support_leads|support_usage_logs|relation .* does not exist|schema cache/i.test(message);
}

export function schemaFallbackResponse() {
  return NextResponse.json(
    {
      error: "Support Agent storage is not connected yet.",
      fallback: "local",
    },
    { status: 424 }
  );
}

export async function requireSupportUser(): Promise<{ supabase: SupabaseClient; user: User } | NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to use Support Agent." }, { status: 401 });
  }

  return { supabase, user };
}

export function supportAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createAdminClient();
}

export function sanitizeSupportAgentInput(body: Partial<SupportAgentInput>): SupportAgentInput {
  const rawIconUrl = String(body.widget_icon_url || "").trim();
  const widgetIconUrl =
    /^https?:\/\/.{3,500}$/i.test(rawIconUrl) || /^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,[a-z0-9+/=]+$/i.test(rawIconUrl)
      ? rawIconUrl.slice(0, 80000)
      : "";

  return {
    name: String(body.name || SUPPORT_AGENT_DEFAULTS.name).slice(0, 80),
    business_name: String(body.business_name || "").slice(0, 120),
    website_url: String(body.website_url || "").slice(0, 220),
    description: String(body.description || "").slice(0, 2000),
    tone: body.tone || SUPPORT_AGENT_DEFAULTS.tone,
    welcome_message: String(body.welcome_message || SUPPORT_AGENT_DEFAULTS.welcome_message).slice(0, 500),
    fallback_message: String(body.fallback_message || SUPPORT_AGENT_DEFAULTS.fallback_message).slice(0, 500),
    primary_color: /^#[0-9A-Fa-f]{6}$/.test(String(body.primary_color)) ? String(body.primary_color) : SUPPORT_AGENT_DEFAULTS.primary_color,
    widget_position: body.widget_position === "bottom-left" ? "bottom-left" : "bottom-right",
    widget_icon_url: widgetIconUrl,
    theme: body.theme || SUPPORT_AGENT_DEFAULTS.theme,
    lead_capture_enabled: Boolean(body.lead_capture_enabled),
  };
}

export async function getCurrentSupportPlan(supabase: SupabaseClient, userId: string) {
  void supabase;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  return getSupportAgentPlan(user?.plan);
}

export function isUuid(value?: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}
