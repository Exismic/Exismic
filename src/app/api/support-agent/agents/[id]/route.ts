import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireSupportUser, sanitizeSupportAgentInput } from "@/lib/support-agent/api-utils";
import { prisma } from "@/lib/prisma";
import type { SupportAgent } from "@/lib/support-agent/types";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSupportUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Support agent not found." }, { status: 404 });

  try {
    const [agent] = await prisma.$queryRaw<SupportAgent[]>`
      select * from public.support_agents
      where id = ${id}::uuid and user_id = ${auth.user.id}::uuid
      limit 1
    `;
    if (!agent) return NextResponse.json({ error: "Support agent not found." }, { status: 404 });
    return NextResponse.json({ agent });
  } catch (error) {
    console.error("[SupportAgent agent GET]", error);
    return NextResponse.json({ error: "Could not load support agent." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSupportUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Support agent not found." }, { status: 404 });

  try {
    const input = sanitizeSupportAgentInput(await request.json());
    if (!input.name.trim()) {
      input.name = `${input.business_name.trim()} Support`;
    }
    const [agent] = await prisma.$queryRaw<SupportAgent[]>`
      update public.support_agents
      set name = ${input.name},
          business_name = ${input.business_name},
          website_url = ${input.website_url},
          description = ${input.description},
          tone = ${input.tone},
          welcome_message = ${input.welcome_message},
          fallback_message = ${input.fallback_message},
          primary_color = ${input.primary_color},
          widget_position = ${input.widget_position},
          widget_icon_url = ${input.widget_icon_url || null},
          theme = ${input.theme},
          lead_capture_enabled = ${input.lead_capture_enabled},
          updated_at = now()
      where id = ${id}::uuid and user_id = ${auth.user.id}::uuid
      returning *
    `;
    if (!agent) return NextResponse.json({ error: "Support agent not found." }, { status: 404 });
    return NextResponse.json({ agent });
  } catch (error) {
    console.error("[SupportAgent agent PATCH]", error);
    return NextResponse.json({ error: "Could not update support agent." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSupportUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ success: true });

  try {
    await prisma.$executeRaw`
      delete from public.support_agents
      where id = ${id}::uuid and user_id = ${auth.user.id}::uuid
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SupportAgent agent DELETE]", error);
    return NextResponse.json({ error: "Could not delete support agent." }, { status: 500 });
  }
}
