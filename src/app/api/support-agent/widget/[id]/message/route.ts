import { NextRequest, NextResponse } from "next/server";
import { getSupportAgentPlan, type SupportAgent, type SupportDocument } from "@/lib/support-agent/types";
import { generateSupportReply } from "@/lib/support-agent/reply";
import { isUuid } from "@/lib/support-agent/api-utils";
import { prisma } from "@/lib/prisma";
import { SUPPORT_WIDGET_CORS_HEADERS } from "@/lib/support-agent/cors";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/api-security";

interface WidgetMessageBody {
  message?: string;
  visitorId?: string;
  conversationId?: string;
  lead?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Support agent not found." }, { status: 404, headers: SUPPORT_WIDGET_CORS_HEADERS });

  try {
    const requestIp = getRequestIp(request);
    const limit = checkRateLimit(`support-widget:${id}:${requestIp}`, 30, 60 * 60 * 1000);
    if (!limit.allowed) {
      const response = rateLimitResponse(limit.retryAfter);
      for (const [key, value] of Object.entries(SUPPORT_WIDGET_CORS_HEADERS)) {
        response.headers.set(key, value);
      }
      return response;
    }

    const body = (await request.json()) as WidgetMessageBody;
    const message = String(body.message || "").trim().slice(0, 1200);
    if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400, headers: SUPPORT_WIDGET_CORS_HEADERS });
    const visitorId = String(body.visitorId || "website-visitor").trim().slice(0, 120);
    const leadName = body.lead?.name ? String(body.lead.name).trim().slice(0, 120) : null;
    const leadEmail = body.lead?.email ? String(body.lead.email).trim().slice(0, 160).toLowerCase() : null;
    const leadPhone = body.lead?.phone ? String(body.lead.phone).trim().slice(0, 50) : null;

    const [agent] = await prisma.$queryRaw<SupportAgent[]>`
      select * from public.support_agents
      where id = ${id}::uuid
      limit 1
    `;
    if (!agent) return NextResponse.json({ error: "Support agent not found." }, { status: 404, headers: SUPPORT_WIDGET_CORS_HEADERS });

    const owner = await prisma.user.findUnique({ where: { id: agent.user_id }, select: { plan: true } });
    const plan = getSupportAgentPlan(owner?.plan);
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const [usage] = await prisma.$queryRaw<Array<{ used: bigint }>>`
      select coalesce(sum(units), 0)::bigint as used
      from public.support_usage_logs
      where agent_id = ${id}::uuid
      and user_id = ${agent.user_id}::uuid
      and event_type = 'message'
      and created_at >= ${monthStart}
    `;
    const used = Number(usage?.used ?? 0);
    if (used >= plan.messageLimit) {
      return NextResponse.json(
        {
          reply: "This support assistant has reached its monthly message limit. Please contact the business directly.",
          source: "limit",
        },
        { headers: SUPPORT_WIDGET_CORS_HEADERS }
      );
    }

    const documents = await prisma.$queryRaw<SupportDocument[]>`
      select * from public.support_documents
      where agent_id = ${id}::uuid
      order by updated_at desc
    `;

    let leadId: string | null = null;
    if (agent.lead_capture_enabled && leadEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail)) {
      const [lead] = await prisma.$queryRaw<Array<{ id: string }>>`
        insert into public.support_leads (agent_id, name, email, phone, message)
        values (${id}::uuid, ${leadName}, ${leadEmail}, ${leadPhone}, ${message})
        returning id
      `;
      leadId = lead?.id ?? null;
    }

    let conversationId = isUuid(body.conversationId) ? body.conversationId : undefined;
    if (conversationId) {
      const [existingConversation] = await prisma.$queryRaw<Array<{ id: string }>>`
        select id
        from public.support_conversations
        where id = ${conversationId}::uuid
        and agent_id = ${id}::uuid
        limit 1
      `;
      if (!existingConversation) conversationId = undefined;
    }

    if (!conversationId) {
      const [conversation] = await prisma.$queryRaw<Array<{ id: string }>>`
        insert into public.support_conversations (agent_id, visitor_id, lead_id, status)
        values (${id}::uuid, ${visitorId}, ${leadId}::uuid, 'open')
        returning id
      `;
      conversationId = conversation.id;
    }

    const { reply, source } = await generateSupportReply(agent, message, documents);
    const now = new Date().toISOString();
    const [messages] = await prisma.$transaction([
      prisma.$queryRaw`
        insert into public.support_messages (conversation_id, agent_id, role, content, created_at)
        values
          (${conversationId}::uuid, ${id}::uuid, 'visitor', ${message}, ${now}::timestamptz),
          (${conversationId}::uuid, ${id}::uuid, 'assistant', ${reply}, now())
        returning *
      `,
      prisma.$executeRaw`
        update public.support_conversations
        set updated_at = now()
        where id = ${conversationId}::uuid
      `,
      prisma.$executeRaw`
        insert into public.support_usage_logs (agent_id, user_id, event_type, units, metadata)
        values (${id}::uuid, ${agent.user_id}::uuid, 'message', 1, ${JSON.stringify({ source })}::jsonb)
      `,
    ]);

    return NextResponse.json({ reply, source, conversationId, messages: messages ?? [] }, { headers: SUPPORT_WIDGET_CORS_HEADERS });
  } catch (error) {
    console.error("[SupportAgent widget message]", error);
    return NextResponse.json({ error: "Support agent could not reply right now." }, { status: 500, headers: SUPPORT_WIDGET_CORS_HEADERS });
  }
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: SUPPORT_WIDGET_CORS_HEADERS,
  });
}
