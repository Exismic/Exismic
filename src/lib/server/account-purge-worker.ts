import 'server-only';
import { randomUUID, createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createAdminClient } from '@/utils/supabase/admin';
import { runSerializable } from '@/lib/serializable';
import { stopAccountRenewal } from './account-renewal';

export const PURGE_JOB_PREFIX = 'account_purge:';
const BUCKETS = new Set(['results', 'exismic-drive', 'avatars', 'email-results']);
type StorageObject = { bucket: string; path: string };
type PurgeJob = { version: 1; userId: string; email: string | null; stage: 'storage' | 'auth' | 'database';
  files: StorageObject[]; avatarsListed: boolean; lease: string; leaseUntil: string;
  subscriptionId: string | null; renewalStopped: boolean };
const encode = (job: PurgeJob) => `account_purge:v1:${Buffer.from(JSON.stringify(job)).toString('base64url')}`;
function decode(token: string): PurgeJob {
  if (!token.startsWith('account_purge:v1:')) throw new Error('Invalid deletion job');
  const job = JSON.parse(Buffer.from(token.slice('account_purge:v1:'.length), 'base64url').toString()) as PurgeJob;
  if (job.version !== 1 || !job.userId || !Array.isArray(job.files) || !['storage', 'auth', 'database'].includes(job.stage)) throw new Error('Invalid deletion job');
  return job;
}
/** Only this project's storage objects, never remote/provider images. */
export function accountStorageObject(url: string | null | undefined): StorageObject | null {
  if (!url) return null;
  try {
    const parsed = new URL(url), project = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    if (parsed.origin !== project.origin) return null;
    const match = /^\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/.exec(parsed.pathname);
    if (!match || !BUCKETS.has(match[1])) return null;
    const path = decodeURIComponent(match[2]);
    if (!path || path.split('/').some(part => !part || part === '.' || part === '..') || /[\x00-\x1f\\]/.test(path)) return null;
    return { bucket: match[1], path };
  } catch { return null; }
}
function uniqueFiles(files: StorageObject[]) {
  return [...new Map(files.map(file => [`${file.bucket}/${file.path}`, file])).values()];
}
const ownAvatar = (userId: string, name: string) => name.startsWith(`${userId}-`) || name.startsWith(`${userId}_`);
async function excludeOtherUsersFiles(tx: Prisma.TransactionClient, userId: string, files: StorageObject[]) {
  const otherPaths = new Set<string>();
  for (let offset = 0; offset < files.length; offset += 50) {
    const needles = files.slice(offset, offset + 50).flatMap(file => [
      `/${file.bucket}/${file.path}`, `/${file.bucket}/${file.path.split('/').map(encodeURIComponent).join('/')}`,
    ]);
    const [library, jobs, documents, agents] = await Promise.all([
      tx.userFile.findMany({ where: { userId: { not: userId }, OR: needles.flatMap(needle => [{ originalUrl: { contains: needle } }, { resultUrl: { contains: needle } }]) }, select: { originalUrl: true, resultUrl: true } }),
      tx.job.findMany({ where: { userId: { not: userId }, OR: needles.flatMap(needle => [{ originalUrl: { contains: needle } }, { resultUrl: { contains: needle } }]) }, select: { originalUrl: true, resultUrl: true } }),
      tx.support_documents.findMany({ where: { user_id: { not: userId }, OR: needles.map(needle => ({ source_url: { contains: needle } })) }, select: { source_url: true } }),
      tx.support_agents.findMany({ where: { user_id: { not: userId }, OR: needles.map(needle => ({ widget_icon_url: { contains: needle } })) }, select: { widget_icon_url: true } }),
    ]);
    const urls = [...library.flatMap(file => [file.originalUrl, file.resultUrl]), ...jobs.flatMap(job => [job.originalUrl, job.resultUrl]),
      ...documents.map(doc => doc.source_url), ...agents.map(agent => agent.widget_icon_url)];
    for (const url of urls) { const object = accountStorageObject(url); if (object) otherPaths.add(`${object.bucket}/${object.path}`); }
  }
  return files.filter(file => {
    const driveOwner = /^drive_([a-f0-9-]{36})_/i.exec(file.path)?.[1];
    return (!driveOwner || driveOwner === userId) && !otherPaths.has(`${file.bucket}/${file.path}`);
  });
}
async function claimJob(userId: string, immediate: boolean) {
  return runSerializable(() => prisma.$transaction(async tx => {
    const now = new Date(), identifier = `${PURGE_JOB_PREFIX}${userId}`;
    const account = await tx.user.findUnique({ where: { id: userId } });
    let row = await tx.verificationToken.findFirst({ where: { identifier } });
    if (row && account && account.status !== 'deleting') return null;
    if (!row) {
      if (!account || account.status !== 'pending_deletion' || (!immediate && (account.deletionRecoveryRequested || !account.scheduledDeletionAt || account.scheduledDeletionAt > now))) return null;
      const claimed = await tx.user.updateMany({ where: { id: userId, status: 'pending_deletion',
        ...(!immediate ? { deletionRecoveryRequested: false, scheduledDeletionAt: { lte: now } } : {}),
      }, data: { status: 'deleting' } });
      if (claimed.count !== 1) return null;
      const [files, jobs, documents, agents] = await Promise.all([
        tx.userFile.findMany({ where: { userId }, select: { originalUrl: true, resultUrl: true } }),
        tx.job.findMany({ where: { userId }, select: { originalUrl: true, resultUrl: true } }),
        tx.support_documents.findMany({ where: { user_id: userId }, select: { source_url: true } }),
        tx.support_agents.findMany({ where: { user_id: userId }, select: { widget_icon_url: true } }),
      ]);
      const urls = [...files.flatMap(file => [file.originalUrl, file.resultUrl]), ...jobs.flatMap(job => [job.originalUrl, job.resultUrl]),
        ...documents.map(doc => doc.source_url), ...agents.map(agent => agent.widget_icon_url), account.customAvatarUrl, account.image];
      const owned = urls.map(accountStorageObject).filter((file): file is StorageObject => Boolean(file))
        .filter(file => file.bucket !== 'avatars' || ownAvatar(userId, file.path));
      const safeFiles = await excludeOtherUsersFiles(tx, userId, uniqueFiles(owned));
      const job: PurgeJob = { version: 1, userId, email: account.email, stage: 'storage', files: safeFiles,
        avatarsListed: false, lease: '', leaseUntil: new Date(0).toISOString(), subscriptionId: account.subscriptionId, renewalStopped: false };
      row = await tx.verificationToken.create({ data: { identifier, token: encode(job), expires: new Date(now.getTime() + 365 * 86400000) } });
    }
    const job = decode(row.token);
    if (job.userId !== userId || new Date(job.leaseUntil) > now) return null;
    job.lease = randomUUID(); job.leaseUntil = new Date(now.getTime() + 300000).toISOString();
    const token = encode(job);
    const leased = await tx.verificationToken.updateMany({ where: { identifier, token: row.token }, data: { token } });
    return leased.count === 1 ? { identifier, token, job } : null;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000, maxWait: 10000 }));
}
export async function permanentlyPurgeUserAccount(userId: string, options: { immediate?: boolean; deadline?: number } = {}): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  let claim: Awaited<ReturnType<typeof claimJob>> = null;
  try {
    claim = await claimJob(userId, Boolean(options.immediate));
    if (!claim) return { success: false, skipped: true };
    const admin = createAdminClient();
    const checkpoint = async () => {
      const next = encode(claim!.job);
      const updated = await prisma.verificationToken.updateMany({ where: { identifier: claim!.identifier, token: claim!.token }, data: { token: next } });
      if (updated.count !== 1) throw new Error('Deletion job lease changed');
      claim!.token = next;
    };
    if (!claim.job.renewalStopped) {
      await stopAccountRenewal(claim.job.subscriptionId);
      claim.job.renewalStopped = true;
      await checkpoint();
    }
    if (claim.job.stage === 'storage') {
      if (!claim.job.avatarsListed) {
        for (let offset = 0; ; offset += 100) {
          if (options.deadline && Date.now() >= options.deadline) throw new Error('Deletion continues next run');
          const page = await admin.storage.from('avatars').list('', { limit: 100, offset, search: userId, sortBy: { column: 'name', order: 'asc' } });
          if (page.error) { if (String(page.error.statusCode) === '404') break; throw page.error; }
          const owned = (page.data || []).filter(file => file.id && ownAvatar(userId, file.name)).map(file => ({ bucket: 'avatars', path: file.name }));
          claim.job.files = uniqueFiles([...claim.job.files, ...owned]);
          if ((page.data?.length || 0) < 100) break;
        }
        claim.job.avatarsListed = true; await checkpoint();
      }
      while (claim.job.files.length) {
        if (options.deadline && Date.now() >= options.deadline) throw new Error('Deletion continues next run');
        const bucket = claim.job.files[0].bucket;
        const batch = claim.job.files.filter(file => file.bucket === bucket).slice(0, 100);
        const removed = await admin.storage.from(bucket).remove(batch.map(file => file.path));
        if (removed.error) throw removed.error;
        const done = new Set(batch.map(file => `${file.bucket}/${file.path}`));
        claim.job.files = claim.job.files.filter(file => !done.has(`${file.bucket}/${file.path}`));
        await checkpoint();
      }
      claim.job.stage = 'auth'; await checkpoint();
    }
    if (claim.job.stage === 'auth') {
      const deleted = await admin.auth.admin.deleteUser(userId);
      if (deleted.error && deleted.error.code !== 'user_not_found') {
        // A new avatar uploaded with an unexpired provider token can obstruct auth deletion.
        claim.job.stage = 'storage'; claim.job.avatarsListed = false;
        throw deleted.error;
      }
      claim.job.stage = 'database'; await checkpoint();
    }
    await runSerializable(() => prisma.$transaction(async tx => {
      const current = await tx.user.findUnique({ where: { id: userId }, select: { status: true } });
      if (current && current.status !== 'deleting') throw new Error('Account no longer marked for deletion');
      await tx.support_agents.deleteMany({ where: { user_id: userId } });
      await tx.support_documents.deleteMany({ where: { user_id: userId } });
      await tx.support_usage_logs.deleteMany({ where: { user_id: userId } });
      await tx.userBilling.deleteMany({ where: { userId } });
      if (claim!.job.email) await tx.verificationToken.deleteMany({ where: { identifier: { equals: claim!.job.email, mode: 'insensitive' } } });
      if (claim!.job.email) await tx.authRateLimit.deleteMany({
        where: { email: { equals: claim!.job.email, mode: 'insensitive' }, type: { startsWith: 'welcome_' } },
      });
      await tx.verificationToken.deleteMany({ where: { identifier: { startsWith: `account_recovery:${userId}:` } } });
      await tx.verificationToken.deleteMany({ where: { identifier: { startsWith: `result_email_job:${createHash('sha256').update(`user:${userId}`).digest('hex')}:` } } });
      await tx.verificationToken.deleteMany({ where: { OR: [{ identifier: `browser_trust:${userId}` }, { identifier: { startsWith: `auth_cleanup:${userId}:` } }] } });
      await tx.user.deleteMany({ where: { id: userId, status: 'deleting' } });
      const finished = await tx.verificationToken.deleteMany({ where: { identifier: claim!.identifier, token: claim!.token } });
      if (finished.count !== 1) throw new Error('Deletion job lease changed');
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));
    return { success: true };
  } catch (error) {
    console.error('[Account purge] Cleanup remains queued:', error);
    if (claim) {
      try {
        claim.job.leaseUntil = new Date(0).toISOString();
        await prisma.verificationToken.updateMany({ where: { identifier: claim.identifier, token: claim.token }, data: { token: encode(claim.job) } });
      } catch (releaseError) { console.error('[Account purge] Lease will expire for retry:', releaseError); }
    }
    return { success: false, error: 'Account deletion could not finish. Cleanup is queued for another attempt.' };
  }
}
