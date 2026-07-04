import { NextRequest, NextResponse } from "next/server";
import { isUuid, requireSupportUser } from "@/lib/support-agent/api-utils";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  const auth = await requireSupportUser();
  if (auth instanceof NextResponse) return auth;
  const { id, documentId } = await params;
  if (!isUuid(id) || !isUuid(documentId)) return NextResponse.json({ success: true });

  try {
    await prisma.$executeRaw`
      delete from public.support_documents
      where id = ${documentId}::uuid
      and agent_id = ${id}::uuid
      and user_id = ${auth.user.id}::uuid
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SupportAgent document DELETE]", error);
    return NextResponse.json({ error: "Could not delete knowledge item." }, { status: 500 });
  }
}
