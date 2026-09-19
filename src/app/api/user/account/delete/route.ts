import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { confirmation } = body;

    const dbUser =
      (await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, username: true, status: true },
      })) ||
      (user.email
        ? await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, email: true, username: true, status: true },
          })
        : null);

    if (!dbUser) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
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
      return NextResponse.json(
        { error: 'Confirmation text did not match. Please type "DELETE" to confirm.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const scheduledDeletionAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        status: "pending_deletion",
        deletionRequestedAt: now,
        scheduledDeletionAt,
        deletionRecoveryRequested: false,
        deletionRecoveryReason: null,
      },
    });

    // Safely sign out the user session
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Account scheduled for deletion with 7-day safety period.",
      scheduledDeletionAt: scheduledDeletionAt.toISOString(),
    });
  } catch (error) {
    console.error("Account deletion request failed:", error);
    return NextResponse.json(
      { error: "Could not schedule account deletion. Please contact support." },
      { status: 500 }
    );
  }
}
