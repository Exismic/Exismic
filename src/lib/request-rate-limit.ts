import 'server-only';
import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type RequestLimit = { allowed: boolean; remaining: number; retryAfter: number; unavailable?: boolean };

export async function cleanupRequestLimits() {
  // Namespace and expiry checks exclude all authentication/security records.
  return prisma.verificationToken.deleteMany({ where: {
    OR: [{ identifier: { startsWith: 'request_rate:' } }, { identifier: { startsWith: 'result_email_job:' } }],
    expires: { lte: new Date() },
  } });
}

/** Database is authoritative across instances, Redis outages and restarts. */
export async function consumeRequestLimit(key: string, limit: number, windowMs: number): Promise<RequestLimit> {
  if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowMs) || windowMs < 1) return { allowed: false, remaining: 0, retryAfter: 30, unavailable: true };
  const hash = createHash('sha256').update(`${key}:${windowMs}`).digest('hex');
  const identifier = `request_rate:${hash}`, prefix = `request_rate:v1:${hash}:`;
  try {
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        return await prisma.$transaction(async tx => {
          const now = new Date();
          const row = await tx.verificationToken.findFirst({ where: { identifier } });
          const current = row && row.expires > now ? Number(row.token.slice(prefix.length)) : 0;
          if (row && row.expires > now && (!row.token.startsWith(prefix) || !Number.isSafeInteger(current) || current < 1)) throw new Error('Invalid rate record');
          if (current >= limit) return { allowed: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((row!.expires.getTime() - now.getTime()) / 1000)) };
          const expires = current ? row!.expires : new Date(now.getTime() + windowMs);
          const token = `${prefix}${current + 1}`;
          if (row) {
            const updated = await tx.verificationToken.updateMany({ where: { identifier, token: row.token, expires: row.expires }, data: { token, expires } });
            if (updated.count !== 1) throw new Error('Rate record changed');
          } else await tx.verificationToken.create({ data: { identifier, token, expires } });
          return { allowed: true, remaining: Math.max(0, limit - current - 1), retryAfter: 0 };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } catch (error) {
        const code = (error as { code?: string }).code;
        if ((code !== 'P2034' && code !== 'P2002') || attempt === 7) throw error;
      }
    }
  } catch (error) { console.error('[RateLimit] Shared counter unavailable:', error); }
  return { allowed: false, remaining: 0, retryAfter: 30, unavailable: true };
}
