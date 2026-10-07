import "server-only";

import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/emails";

const PENDING_PREFIX = "welcome_pending:";
const CLAIM_TIMEOUT_MS = 10 * 60 * 1000;
const RETRY_MS = 15 * 60 * 1000;

type WelcomeAccount = { id: string; email: string | null; createdAt: Date };
export type WelcomeEmailResult = "sent" | "already_sent" | "in_progress" | "failed" | "skipped";

function jobKeys(account: WelcomeAccount) {
  // Account creation time prevents old markers suppressing a recreated account.
  const key = createHash("sha256").update(`${account.id}/${account.createdAt.toISOString()}`).digest("hex");
  return { pending: `${PENDING_PREFIX}${key}`, claim: `welcome_claim:${key}`, sent: `welcome_sent:${key}`, key };
}

/** Persist welcome email job. Non-fatal if queuing fails. */
export async function queueWelcomeEmail(tx: Prisma.TransactionClient | typeof prisma, account: WelcomeAccount) {
  const email = account.email?.trim().toLowerCase();
  if (!email) return;
  const type = jobKeys(account).pending;
  await tx.authRateLimit.upsert({
    where: { email_type: { email, type } },
    create: { email, type, lastRequestedAt: new Date() },
    update: {},
  });
}

async function acquireClaim(email: string, type: string, now: Date) {
  try {
    await prisma.authRateLimit.create({ data: { email, type, lastRequestedAt: now } });
    return true;
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
  }
  return (await prisma.authRateLimit.updateMany({
    where: { email, type, lastRequestedAt: { lte: new Date(now.getTime() - CLAIM_TIMEOUT_MS) } },
    data: { lastRequestedAt: now },
  })).count === 1;
}

/** Only sends an explicitly queued signup welcome; never enrols returning users. */
export async function sendWelcomeEmailOnce(rawEmail: string, expectedPendingType?: string): Promise<WelcomeEmailResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return "skipped";
  let ownedClaim: { email: string; type: string; lastRequestedAt: Date } | undefined;
  try {
    const account = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, createdAt: true, status: true } });
    if (!account || account.status !== "active") return "skipped";
    const keys = jobKeys(account);
    if (expectedPendingType && expectedPendingType !== keys.pending) return "skipped";
    const sent = await prisma.authRateLimit.findUnique({ where: { email_type: { email, type: keys.sent } } });
    if (sent) return "already_sent";
    const pending = await prisma.authRateLimit.findUnique({ where: { email_type: { email, type: keys.pending } } });
    if (!pending) return "skipped";

    // Preserve pre-upgrade deliveries without suppressing a recreated account.
    const legacy = await prisma.authRateLimit.findUnique({ where: { email_type: { email, type: "welcome_email_sent" } } });
    if (legacy && legacy.lastRequestedAt >= account.createdAt) {
      await prisma.$transaction(async tx => {
        await tx.authRateLimit.upsert({ where: { email_type: { email, type: keys.sent } }, create: { email, type: keys.sent, lastRequestedAt: legacy.lastRequestedAt }, update: {} });
        await tx.authRateLimit.deleteMany({ where: { email, type: keys.pending } });
      });
      return "already_sent";
    }
    const now = new Date();
    if (pending.lastRequestedAt > now) return "in_progress";
    if (!await acquireClaim(email, keys.claim, now)) return "in_progress";
    ownedClaim = { email, type: keys.claim, lastRequestedAt: now };

    // Another worker may have finished while this request acquired the lease.
    const ready = await prisma.authRateLimit.updateMany({ where: { email, type: keys.pending, lastRequestedAt: { lte: now } }, data: { lastRequestedAt: new Date(now.getTime() + RETRY_MS) } });
    if (ready.count !== 1) return "in_progress";
    const stillActive = await prisma.user.findFirst({ where: { id: account.id, email, createdAt: account.createdAt, status: "active" }, select: { id: true } });
    if (!stillActive) return "skipped";

    // Reuse the key if provider acceptance succeeds but saving the receipt fails.
    // Provider deduplication is finite; acceptance is not inbox delivery.
    if (!await sendWelcomeEmail(email, `welcome-v2/${keys.key}`)) return "failed";
    const accepted = await prisma.$transaction(async tx => {
      const released = await tx.authRateLimit.deleteMany({ where: ownedClaim });
      if (released.count !== 1) return false;
      await tx.authRateLimit.upsert({ where: { email_type: { email, type: keys.sent } }, create: { email, type: keys.sent, lastRequestedAt: new Date() }, update: {} });
      await tx.authRateLimit.deleteMany({ where: { email, type: keys.pending } });
      return true;
    });
    return accepted ? "sent" : "in_progress";
  } catch (error) {
    // Mail/database errors must not turn a completed signup into a failure.
    console.error("[WelcomeEmail] Delivery attempt failed; queued jobs remain retryable:", error);
    return "failed";
  } finally {
    if (ownedClaim) await prisma.authRateLimit.deleteMany({ where: ownedClaim }).catch(() => undefined);
  }
}

export async function retryQueuedWelcomeEmails() {
  const startedAt = Date.now();
  const jobs = await prisma.authRateLimit.findMany({ where: { type: { startsWith: PENDING_PREFIX }, lastRequestedAt: { lte: new Date() } }, orderBy: { lastRequestedAt: "asc" }, take: 50 });
  const counts = { sent: 0, failed: 0, skipped: 0, inProgress: 0 };
  for (const job of jobs) {
    if (Date.now() - startedAt > 40_000) break;
    const result = await sendWelcomeEmailOnce(job.email, job.type);
    if (result === "sent") counts.sent++;
    else if (result === "failed") counts.failed++;
    else if (result === "in_progress") counts.inProgress++;
    else {
      counts.skipped++;
      await prisma.authRateLimit.deleteMany({ where: { id: job.id, type: job.type, lastRequestedAt: job.lastRequestedAt } });
    }
  }
  return counts;
}
