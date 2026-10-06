import 'server-only';
import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { runSerializable } from '@/lib/serializable';
import { getMostRecentResetTimestamp, getNextDailyReset } from '@/lib/daily-cycle';
import { RESULT_EMAIL_LIMITS, type ResultEmailTier } from '@/config/result-email-policy';

export type EmailJob = {
  key: string;
  fingerprint: string; cycle: number; resetAt: string;
  state: 'preparing' | 'prepared' | 'sending' | 'sent' | 'failed' | 'uncertain';
  reservedUntil: number; providerId?: string; upload?: { path: string; token: string };
};
export type EmailQuota = { tier: ResultEmailTier; limit: number; used: number; reserved: number; remaining: number; resetsAt: string };
type Context = { owner: string; tier: ResultEmailTier };
export function resultEmailTier(user: { plan: string; subscriptionStatus: string; planExpiresAt: Date | null }, now = new Date()): ResultEmailTier {
  const paidPlan = ['pro', 'pro_yearly'].includes(user.plan.toLowerCase());
  const paidStatus = ['active', 'cancelled'].includes(user.subscriptionStatus.toLowerCase());
  return paidPlan && paidStatus && !!user.planExpiresAt && user.planExpiresAt.getTime() > now.getTime() ? 'pro' : 'free';
}
export function emailOwnerHash(owner: string) { return createHash('sha256').update(owner).digest('hex'); }
const prefixFor = (owner: string) => `result_email_job:${emailOwnerHash(owner)}:`;
function encode(job: EmailJob) {
  const token = `result_email:v1:${job.cycle}:${Buffer.from(JSON.stringify(job)).toString('base64url')}`;
  // Keep indexed records small; signed proofs and mail content are reconstructed outside this record.
  if (Buffer.byteLength(token) > 2100) throw new Error('Export record too large');
  return token;
}
function decode(token: string): EmailJob {
  const job = JSON.parse(Buffer.from(token.split(':')[3] || '', 'base64url').toString()) as EmailJob;
  if (!['preparing','prepared','sending','sent','failed','uncertain'].includes(job.state) || !Number.isFinite(job.cycle) || !Number.isFinite(job.reservedUntil) || !job.fingerprint || !job.key) throw new Error('Invalid export record');
  return job;
}
async function quota(tx: Prisma.TransactionClient, context: Context, now: Date): Promise<EmailQuota> {
  const cycle = getMostRecentResetTimestamp(now).getTime();
  const rows = await tx.verificationToken.findMany({ where: { identifier: { startsWith: prefixFor(context.owner) }, token: { startsWith: `result_email:v1:${cycle}:` } } });
  let used = 0, reserved = 0;
  for (const row of rows) {
    const job = decode(row.token);
    if (job.state === 'sent') used++;
    else if (job.state === 'sending' || job.state === 'uncertain' || ((job.state === 'prepared' || job.state === 'preparing') && job.reservedUntil > now.getTime())) reserved++;
  }
  const limit = RESULT_EMAIL_LIMITS[context.tier];
  return { tier: context.tier, limit, used, reserved, remaining: Math.max(0, limit - used - reserved), resetsAt: getNextDailyReset(now).toISOString() };
}
export async function getResultEmailQuota(context: Context) { return quota(prisma, context, new Date()); }
export async function getResultEmailJob(context: Context, requestId: string) {
  const identifier = `${prefixFor(context.owner)}${requestId}`;
  const row = await prisma.verificationToken.findFirst({ where: { identifier } });
  return row ? { identifier, token: row.token, job: decode(row.token) } : null;
}

/** Reservation and usage are serialized; no slots become free during outages. */
export async function reserveResultEmail(context: Context, requestId: string, fingerprint: string, preparing: boolean) {
  const identifier = `${prefixFor(context.owner)}${requestId}`;
  return runSerializable(() => prisma.$transaction(async tx => {
    const now = new Date();
    const current = await tx.verificationToken.findFirst({ where: { identifier } });
    const status = await quota(tx, context, now);
    if (current) {
      const job = decode(current.token);
      if (job.fingerprint !== fingerprint) return { kind: 'conflict' as const, quota: status };
      if (job.state === 'sent') return { kind: 'sent' as const, quota: status };
      if (job.state === 'sending' || job.state === 'uncertain') return { kind: 'pending' as const, quota: status };
      if (job.state === 'failed' || job.cycle !== getMostRecentResetTimestamp(now).getTime() || job.reservedUntil <= now.getTime()) return { kind: 'expired' as const, quota: status };
      if (status.used + status.reserved > status.limit) return { kind: 'limited' as const, quota: status };
      if (preparing) return job.upload ? { kind: 'upload' as const, upload: job.upload, reservedUntil: job.reservedUntil, quota: status } : { kind: 'pending' as const, quota: status };
      if (job.state === 'preparing') return { kind: 'pending' as const, quota: status };
      return { kind: 'ready' as const, identifier, token: current.token, job, quota: status };
    }
    if (!status.remaining) return { kind: 'limited' as const, quota: status };
    const job: EmailJob = { key: identifier, fingerprint, cycle: getMostRecentResetTimestamp(now).getTime(), resetAt: status.resetsAt, state: preparing ? 'preparing' : 'prepared', reservedUntil: Math.min(now.getTime() + 20 * 60_000, Date.parse(status.resetsAt)) };
    const token = encode(job);
    await tx.verificationToken.create({ data: { identifier, token, expires: new Date(Date.parse(status.resetsAt) + 7 * 86400000) } });
    return { kind: 'ready' as const, identifier, token, job, quota: { ...status, reserved: status.reserved + 1, remaining: status.remaining - 1 } };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));
}

export async function updateResultEmailJob(identifier: string, token: string, job: EmailJob) {
  const next = encode(job);
  const updated = await prisma.verificationToken.updateMany({ where: { identifier, token }, data: { token: next } });
  return updated.count === 1 ? next : null;
}
