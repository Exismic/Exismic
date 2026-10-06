import 'server-only';
import { createHmac, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const DELETION_RECOVERY_COOKIE = 'exismic_deletion_recovery';
function hash(token: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.AUTH_SECRET;
  if (!key) throw new Error('Account recovery is unavailable.');
  return createHmac('sha256', key).update(`exismic-deletion-recovery-v1:${token}`).digest('hex');
}
/** Issue only after password/OAuth ownership verification; grants no app session. */
export async function issueDeletionRecoveryProof(userId: string, scheduledDeletionAt: Date | null) {
  if (!scheduledDeletionAt || scheduledDeletionAt <= new Date()) return;
  const token = randomBytes(32).toString('hex');
  const identifier = `account_recovery:${userId}:${scheduledDeletionAt.getTime()}`;
  const expires = new Date(Math.min(Date.now() + 600000, scheduledDeletionAt.getTime()));
  await prisma.verificationToken.create({ data: { identifier, token: `deletion_recovery:v1:${hash(token)}`, expires } });
  (await cookies()).set(DELETION_RECOVERY_COOKIE, Buffer.from(JSON.stringify({ userId, token, deadline: scheduledDeletionAt.getTime() })).toString('base64url'), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: Math.max(1, Math.floor((expires.getTime() - Date.now()) / 1000)),
  });
}
export async function getDeletionRecoveryProof() {
  const raw = (await cookies()).get(DELETION_RECOVERY_COOKIE)?.value;
  if (!raw || raw.length > 1000) return null;
  try {
    const value = JSON.parse(Buffer.from(raw, 'base64url').toString()) as { userId: string; token: string; deadline: number };
    if (typeof value.userId !== 'string' || !/^[a-f0-9]{64}$/.test(value.token) || !Number.isFinite(value.deadline) || value.deadline <= Date.now()) return null;
    const identifier = `account_recovery:${value.userId}:${value.deadline}`;
    const token = `deletion_recovery:v1:${hash(value.token)}`;
    const row = await prisma.verificationToken.findFirst({ where: { identifier, token, expires: { gt: new Date() } } });
    return row ? { userId: value.userId, deadline: value.deadline, identifier, token } : null;
  } catch { return null; }
}
export async function clearDeletionRecoveryProof() { (await cookies()).delete(DELETION_RECOVERY_COOKIE); }
