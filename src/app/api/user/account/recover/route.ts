import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendAccountRecoveryRequestedEmail } from "@/lib/emails";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    let userId = user?.id;

    const body = await req.json().catch(() => ({}));
    const { reason, email, password } = body;

    // If no active session cookie, attempt verification with email + password if supplied
    if (!userId && email && password) {
      const { data: signData, error: signError } = await supabase.auth.signInWithPassword({
        email: String(email).trim().toLowerCase(),
        password: String(password),
      });
      if (!signError && signData.user) {
        userId = signData.user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Please sign in to request account recovery." }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true, scheduledDeletionAt: true, username: true, email: true },
    });

    if (!dbUser || dbUser.status !== "pending_deletion") {
      return NextResponse.json(
        { error: "Account is not currently scheduled for deletion." },
        { status: 400 }
      );
    }

    const isDirectCancel = Boolean(body.action === 'cancel' || body.cancel === true);

    if (isDirectCancel) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: "active",
          scheduledDeletionAt: null,
          deletionRequestedAt: null,
          deletionRecoveryRequested: false,
          deletionRecoveryReason: null,
        },
      });

      await createNotification(
        userId,
        "Account Deletion Cancelled",
        "Your account deletion has been cancelled. Your account and files are completely safe.",
        "success"
      );

      return NextResponse.json({
        success: true,
        cancelled: true,
        message: "Account deletion cancelled! Your account is safe and active.",
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        deletionRecoveryRequested: true,
        deletionRecoveryReason: String(reason || "User requested account recovery").slice(0, 500),
      },
    });

    // 1. In-app Notification
    await createNotification(
      userId,
      "Account Recovery Requested",
      "We received your request to restore your account. Deletion is paused while our team processes it.",
      "success"
    );

    // 2. Dispatch Confirmation Email
    const targetEmail = dbUser.email || (email ? String(email).trim().toLowerCase() : null);
    if (targetEmail) {
      void sendAccountRecoveryRequestedEmail(targetEmail).catch((err) =>
        console.error("[Account Recovery] Email send error:", err)
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your recovery request has been sent to our team. We will review and restore your account shortly.",
    });
  } catch (error) {
    console.error("Account recovery request failed:", error);
    return NextResponse.json(
      { error: "Could not submit recovery request." },
      { status: 500 }
    );
  }
}
