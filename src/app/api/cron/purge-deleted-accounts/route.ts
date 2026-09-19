import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { permanentlyPurgeUserAccount } from "@/lib/server/account-purge";

export async function GET(req: Request) {
  return handlePurge(req);
}

export async function POST(req: Request) {
  return handlePurge(req);
}

async function handlePurge(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Optional verification check if CRON_SECRET is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(req.url);
      const queryKey = url.searchParams.get("key");
      if (queryKey !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();

    // Find accounts where 7-day scheduled deletion has passed AND recovery was not requested
    const expiredAccounts = await prisma.user.findMany({
      where: {
        status: "pending_deletion",
        scheduledDeletionAt: { lte: now },
        deletionRecoveryRequested: false,
      },
      select: { id: true, email: true, username: true },
      take: 50,
    });

    const results = [];
    for (const account of expiredAccounts) {
      const purge = await permanentlyPurgeUserAccount(account.id);
      results.push({
        id: account.id,
        email: account.email,
        success: purge.success,
        error: purge.error,
      });
    }

    return NextResponse.json({
      success: true,
      purgedCount: results.filter((r) => r.success).length,
      failedCount: results.filter((r) => !r.success).length,
      details: results,
    });
  } catch (error) {
    console.error("Automated purge cron failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
