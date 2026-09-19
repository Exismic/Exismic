import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { permanentlyPurgeUserAccount } from "@/lib/server/account-purge";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: targetUserId } = await params;
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, username: true, status: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    if (action === "restore") {
      // 1-Click revoke deletion and restore to active
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          status: "active",
          deletionRequestedAt: null,
          scheduledDeletionAt: null,
          deletionRecoveryRequested: false,
          deletionRecoveryReason: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Account for ${targetUser.username || targetUser.email} has been restored to active.`,
      });
    }

    if (action === "purge") {
      // Immediate permanent purge ahead of schedule
      const purgeResult = await permanentlyPurgeUserAccount(targetUserId);
      if (!purgeResult.success) {
        return NextResponse.json({ error: purgeResult.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Account for ${targetUser.username || targetUser.email} has been permanently purged.`,
      });
    }

    return NextResponse.json({ error: "Invalid action. Use 'restore' or 'purge'." }, { status: 400 });
  } catch (error) {
    console.error("Failed to execute pending deletion action:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
