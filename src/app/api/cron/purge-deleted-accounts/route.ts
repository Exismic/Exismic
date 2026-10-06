import { publicJson } from '@/lib/public-json';
import { prisma } from '@/lib/prisma';
import { permanentlyPurgeUserAccount, PURGE_JOB_PREFIX } from '@/lib/server/account-purge';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function GET(req: Request) { return handlePurge(req); }
export async function POST(req: Request) { return handlePurge(req); }

async function handlePurge(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return publicJson({ error: 'Unauthorized' }, { status: 401 });
  try {
    const now = new Date(), deadline = Date.now() + 45000;
    const [pending, retries] = await Promise.all([
      prisma.user.findMany({ where: { status: 'pending_deletion', scheduledDeletionAt: { lte: now }, deletionRecoveryRequested: false },
        select: { id: true }, orderBy: { scheduledDeletionAt: 'asc' }, take: 50 }),
      prisma.verificationToken.findMany({ where: { identifier: { startsWith: PURGE_JOB_PREFIX } }, select: { identifier: true }, take: 50 }),
    ]);
    const ids = [...new Set([...retries.map(job => job.identifier.slice(PURGE_JOB_PREFIX.length)), ...pending.map(account => account.id)])];
    let purgedCount = 0, failedCount = 0, skippedCount = 0;
    for (const id of ids) {
      if (Date.now() >= deadline) break;
      const result = await permanentlyPurgeUserAccount(id, { deadline });
      if (result.success) purgedCount++; else if (result.skipped) skippedCount++; else failedCount++;
    }
    return publicJson({ success: true, purgedCount, failedCount, skippedCount });
  } catch (error) {
    console.error('[Account purge cron]', error);
    return publicJson({ error: 'Account cleanup could not be completed. Please try again later.' }, { status: 500 });
  }
}
