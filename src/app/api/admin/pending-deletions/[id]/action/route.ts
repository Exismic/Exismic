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
      const restored = await prisma.user.updateMany({
        where: { id: targetUserId, status: "pending_deletion" },
        data: {
          status: "active",
          deletionRequestedAt: null,
          scheduledDeletionAt: null,
          deletionRecoveryRequested: false,
          deletionRecoveryReason: null,
        },
      });

      if (restored.count !== 1) return NextResponse.json({ error: "Deletion already started or the account is no longer pending." }, { status: 409 });
      return NextResponse.json({
        success: true,
        message: `Account for ${targetUser.username || targetUser.email} has been restored to active.`,
      });
    }

    if (action === "purge") {
      if (!["pending_deletion", "deleting"].includes(targetUser.status)) return NextResponse.json({ error: "Account is not pending deletion." }, { status: 409 });
      // Immediate permanent purge ahead of schedule
      const purgeResult = await permanentlyPurgeUserAccount(targetUserId, { immediate: true, deadline: Date.now() + 45000 });
      if (!purgeResult.success) {
        if (purgeResult.skipped) return NextResponse.json({ error: 'Deletion is already processing or the account is no longer pending.' }, { status: 409 });
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
