import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const pendingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { status: "pending_deletion" },
          { scheduledDeletionAt: { not: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        status: true,
        plan: true,
        createdAt: true,
        deletionRequestedAt: true,
        scheduledDeletionAt: true,
        deletionRecoveryRequested: true,
        deletionRecoveryReason: true,
        _count: {
          select: {
            files: true,
            chatSessions: true,
            jobs: true,
          },
        },
      },
      orderBy: {
        scheduledDeletionAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      pendingUsers,
    });
  } catch (error) {
    console.error("Failed to fetch pending deletions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
