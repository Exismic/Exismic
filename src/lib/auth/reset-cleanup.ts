import 'server-only';
import { prisma } from '@/lib/prisma';
import { createAdminClient } from '@/utils/supabase/admin';

export function resetCleanupIdentifier(userId: string) { return `auth_cleanup:${userId}:`; }
export async function hasPendingResetCleanup(userId: string) {
  return Boolean(await prisma.verificationToken.findFirst({ where: { identifier: { startsWith: resetCleanupIdentifier(userId) } } }));
}
/** A persistent fence blocks old phone approvals until all revocation writes commit. */
export async function finishResetCleanup(userId: string, email: string, verifiedVersion?: string) {
  const job = await prisma.verificationToken.findFirst({ where: { identifier: { startsWith: resetCleanupIdentifier(userId) } } });
  if (!job) return;
  const expectedVersion = job.identifier.split(':')[2];
  // Do not let a scheduler or concurrent login release the fence while the
  // provider update is still in progress. Reconcile uncertain updates first.
  const identity = verifiedVersion ? null : await createAdminClient().auth.admin.getUserById(userId);
  if (identity?.error) throw identity.error;
  const currentVersion = verifiedVersion || identity?.data.user?.app_metadata?.exismic_auth_version || 'initial';
  if (currentVersion !== expectedVersion && job.expires > new Date()) throw new Error('Password update is still finishing.');
  await prisma.$transaction(async tx => {
    // A stale worker cannot revoke devices registered after another worker finished.
    const claimed = await tx.verificationToken.deleteMany({ where: { identifier: job.identifier, token: job.token } });
    if (claimed.count !== 1) return;
    await tx.trustedLoginDevice.updateMany({ where: { userId }, data: { status: 'revoked', revokedAt: new Date() } });
    await tx.trustedLoginChallenge.updateMany({ where: { userId, consumedAt: null }, data: { status: 'expired' } });
    await tx.verificationToken.deleteMany({ where: { identifier: `browser_trust:${userId}` } });
    await tx.verificationToken.deleteMany({ where: { identifier: email, OR: [{ token: { startsWith: 'device_otp:' } }, { token: { startsWith: 'signup_otp:' } }, { token: { startsWith: 'signup_finish:' } }, { token: { startsWith: 'oauth_link:' } }] } });
    await tx.verificationToken.deleteMany({ where: { identifier: { startsWith: `account_recovery:${userId}:` } } });
  });
}
export async function retryResetCleanups() {
  const jobs = await prisma.verificationToken.findMany({ where: { identifier: { startsWith: 'auth_cleanup:' } }, take: 50 });
  let completed = 0, failed = 0;
  const started = Date.now();
  for (const job of jobs) {
    if (Date.now() - started > 40_000) break;
    try {
      const [, userId, , encodedEmail] = job.identifier.split(':');
      await finishResetCleanup(userId, Buffer.from(encodedEmail || '', 'base64url').toString()); completed++;
    }
    catch (error) { console.error('[Auth] Security cleanup remains queued:', error); failed++; }
  }
  return { completed, failed };
}
