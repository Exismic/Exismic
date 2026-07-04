import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireSupportUser } from "@/lib/support-agent/api-utils";
import { prisma } from "@/lib/prisma";
import type { SupportConversation, SupportLead, SupportMessage } from "@/lib/support-agent/types";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSupportUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({
      conversations: [],
      messages: [],
      leads: [],
      usage: { messages: 0, documents: 0, leads: 0, conversations: 0 },
    });
  }

  try {
    const [agent] = await prisma.$queryRaw<Array<{ id: string }>>`
      select id from public.support_agents
      where id = ${id}::uuid and user_id = ${auth.user.id}::uuid
      limit 1
    `;
    if (!agent) return NextResponse.json({ error: "Support agent not found." }, { status: 404 });

    const [conversations, messages, leads, usageRows, documentRows] = await Promise.all([
      prisma.$queryRaw<SupportConversation[]>`
        select * from public.support_conversations
        where agent_id = ${id}::uuid
        order by updated_at desc
      `,
      prisma.$queryRaw<SupportMessage[]>`
        select * from public.support_messages
        where agent_id = ${id}::uuid
        order by created_at asc
      `,
      prisma.$queryRaw<SupportLead[]>`
        select * from public.support_leads
        where agent_id = ${id}::uuid
        order by created_at desc
      `,
      prisma.$queryRaw<Array<{ messages: bigint }>>`
        select coalesce(sum(units), 0)::bigint as messages
        from public.support_usage_logs
        where agent_id = ${id}::uuid
        and user_id = ${auth.user.id}::uuid
        and event_type = 'message'
      `,
      prisma.$queryRaw<Array<{ documents: bigint }>>`
        select count(*)::bigint as documents
        from public.support_documents
        where agent_id = ${id}::uuid
        and user_id = ${auth.user.id}::uuid
      `,
    ]);

    const messageUnits = Number(usageRows[0]?.messages ?? 0);

    return NextResponse.json({
      conversations,
      messages,
      leads,
      usage: {
        messages: messageUnits,
        documents: Number(documentRows[0]?.documents ?? 0),
        leads: leads.length,
        conversations: conversations.length,
      },
    });
  } catch (error) {
    console.error("[SupportAgent conversations GET]", error);
    return NextResponse.json({ error: "Could not load conversations." }, { status: 500 });
  }
}
