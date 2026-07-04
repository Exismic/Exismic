import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentSupportPlan,
  requireSupportUser,
  sanitizeSupportAgentInput,
} from "@/lib/support-agent/api-utils";
import { prisma } from "@/lib/prisma";
import type { SupportAgent } from "@/lib/support-agent/types";

export async function GET() {
  const auth = await requireSupportUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const agents = await prisma.$queryRaw<SupportAgent[]>`
      select * from public.support_agents
      where user_id = ${auth.user.id}::uuid
      order by updated_at desc
    `;
    return NextResponse.json({ agents });
  } catch (error) {
    console.error("[SupportAgent agents GET]", error);
    return NextResponse.json({ error: "Could not load support agents." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireSupportUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const input = sanitizeSupportAgentInput(await request.json());
    if (!input.business_name.trim()) {
      return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    }
    if (!input.name.trim()) {
      input.name = `${input.business_name.trim()} Support`;
    }

    const plan = await getCurrentSupportPlan(auth.supabase, auth.user.id);
    const [{ count }] = await prisma.$queryRaw<Array<{ count: bigint }>>`
      select count(*)::bigint as count from public.support_agents
      where user_id = ${auth.user.id}::uuid
    `;

    if (Number(count ?? 0) >= plan.agentLimit) {
      return NextResponse.json({ error: `${plan.name} supports up to ${plan.agentLimit} support agent${plan.agentLimit === 1 ? "" : "s"}.` }, { status: 402 });
    }

    const [agent] = await prisma.$queryRaw<SupportAgent[]>`
      insert into public.support_agents (
        user_id, name, business_name, website_url, description, tone,
        welcome_message, fallback_message, primary_color, widget_position,
        widget_icon_url, theme, lead_capture_enabled
      ) values (
        ${auth.user.id}::uuid, ${input.name}, ${input.business_name}, ${input.website_url},
        ${input.description}, ${input.tone}, ${input.welcome_message}, ${input.fallback_message},
        ${input.primary_color}, ${input.widget_position}, ${input.widget_icon_url || null}, ${input.theme}, ${input.lead_capture_enabled}
      )
      returning *
    `;
    return NextResponse.json({ agent });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create support agent.";
    console.error("[SupportAgent agents POST]", error);
    return NextResponse.json({ error: message || "Could not create support agent." }, { status: 500 });
  }
}
