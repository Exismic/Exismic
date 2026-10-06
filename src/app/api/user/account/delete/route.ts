import { clearSessionProof } from "@/lib/auth/session-proof";
import { clearDeletionRecoveryProof } from "@/lib/auth/deletion-recovery";
import { publicJson } from "@/lib/public-json";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendAccountDeletionScheduledEmail } from "@/lib/emails";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== new URL(req.url).origin) return publicJson({ error: 'Unauthorized' }, { status: 403 });
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return publicJson({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { confirmation } = body;

    const dbUser =
      (await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, username: true, status: true, scheduledDeletionAt: true, subscriptionId: true, subscriptionStatus: true },
      })) ||
      (user.email
        ? await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, email: true, username: true, status: true, scheduledDeletionAt: true, subscriptionId: true, subscriptionStatus: true },
          })
        : null);

    if (!dbUser) {
      return publicJson({ error: "Account not found" }, { status: 404 });
    }

    const userConfirmation = String(confirmation || "").trim().toLowerCase();

    // Safety verification check: confirmation must match "delete", or user's email/username
    const validMatches = [
      "delete",
      dbUser.email?.toLowerCase(),
      user.email?.toLowerCase(),
      dbUser.username?.toLowerCase(),
    ].filter(Boolean);

    const isMatch = validMatches.includes(userConfirmation);
    if (!isMatch) {
      return publicJson(
        { error: 'Confirmation text did not match. Please type "DELETE" to confirm.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const scheduledDeletionAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

    if (dbUser.status !== 'active') return publicJson({ error: 'This account cannot be scheduled for deletion right now.' }, { status: 409 });
    if ((dbUser.subscriptionId?.startsWith('I-') || dbUser.subscriptionId?.startsWith('sub_')) && dbUser.subscriptionStatus === 'active') {
      return publicJson({ error: 'Please cancel your active subscription before deleting your account.' }, { status: 409 });
    }
    const scheduled = await prisma.user.updateMany({
      where: { id: dbUser.id, status: 'active' },
      data: { status: 'pending_deletion', deletionRequestedAt: now, scheduledDeletionAt,
        deletionRecoveryRequested: false, deletionRecoveryReason: null },
    });
    if (scheduled.count !== 1) return publicJson({ error: 'Your account status changed. Please refresh and try again.' }, { status: 409 });

    // 1. Create In-App Notification
    await createNotification(
      dbUser.id,
      "Account Scheduled for Deletion",
      `Your account is scheduled for permanent deletion on ${scheduledDeletionAt.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}. You have 7 days to cancel or request recovery.`,
      "warning"
    );

    // 2. Dispatch Confirmation Email
    const targetEmail = dbUser.email || user.email;
    if (targetEmail) {
      await sendAccountDeletionScheduledEmail(targetEmail, {
        scheduledDeletionAt,
        username: dbUser.username,
      }).catch((err) => console.error("[Account Deletion] Email send error:", err));
    }

    // 3. Safely sign out the user session
    const cleanup = await Promise.allSettled([clearSessionProof(), clearDeletionRecoveryProof(), supabase.auth.signOut()]);
    for (const result of cleanup) if (result.status === 'rejected') console.error('[Account deletion] Session cleanup failed:', result.reason);

    return publicJson({
      success: true,
      message: "Account scheduled for deletion with 7-day safety period.",
      scheduledDeletionAt: scheduledDeletionAt.toISOString(),
    });
  } catch (error) {
    console.error("Account deletion request failed:", error);
    return publicJson(
      { error: "Could not schedule account deletion. Please contact support." },
      { status: 500 }
    );
  }
}
