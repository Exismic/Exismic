import { NextRequest, NextResponse } from "next/server";
import { getCurrentSupportPlan, isUuid, requireSupportUser } from "@/lib/support-agent/api-utils";
import { prisma } from "@/lib/prisma";
import type { SupportDocument } from "@/lib/support-agent/types";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSupportUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ documents: [] });

  try {
    const documents = await prisma.$queryRaw<SupportDocument[]>`
      select * from public.support_documents
      where agent_id = ${id}::uuid and user_id = ${auth.user.id}::uuid
      order by updated_at desc
    `;
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("[SupportAgent documents GET]", error);
    return NextResponse.json({ error: "Could not load knowledge base." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSupportUser();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Support agent not found." }, { status: 404 });

  try {
    const body = await request.json();
    const title = String(body.title || "Business knowledge").slice(0, 160);
    const content = String(body.content || "").slice(0, 30000);
    const sourceType = ["document", "faq", "url", "note"].includes(body.source_type) ? body.source_type : "note";
    const sourceUrl = body.source_url ? String(body.source_url).slice(0, 500) : null;

    if (!content.trim()) {
      return NextResponse.json({ error: "Knowledge content is required." }, { status: 400 });
    }

    const plan = await getCurrentSupportPlan(auth.supabase, auth.user.id);
    const [{ count }] = await prisma.$queryRaw<Array<{ count: bigint }>>`
      select count(*)::bigint as count from public.support_documents
      where user_id = ${auth.user.id}::uuid
    `;

    if (Number(count ?? 0) >= plan.documentLimit) {
      return NextResponse.json({ error: `${plan.name} supports up to ${plan.documentLimit} documents.` }, { status: 402 });
    }

    const [document] = await prisma.$transaction([
      prisma.$queryRaw<SupportDocument[]>`
        insert into public.support_documents (
          agent_id, user_id, title, content, source_type, source_url
        ) values (
          ${id}::uuid, ${auth.user.id}::uuid, ${title}, ${content}, ${sourceType}, ${sourceUrl}
        )
        returning *
      `,
      prisma.$executeRaw`
        insert into public.support_usage_logs (agent_id, user_id, event_type, units)
        values (${id}::uuid, ${auth.user.id}::uuid, 'document', 1)
      `,
    ]);

    return NextResponse.json({ document: document[0] });
  } catch (error) {
    console.error("[SupportAgent documents POST]", error);
    return NextResponse.json({ error: "Could not save knowledge." }, { status: 500 });
  }
}
