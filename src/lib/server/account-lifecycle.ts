import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { runSerializable } from '@/lib/serializable';

export async function cancelScheduledAccountDeletion(userId: string, proof?: { identifier: string; token: string; deadline: number } | null) {
  return runSerializable(() => prisma.$transaction(async tx => {
    const now = new Date();
    const account = await tx.user.findUnique({ where: { id: userId }, select: { id: true, email: true, status: true, scheduledDeletionAt: true } });
    if (!account || account.status !== 'pending_deletion' || !account.scheduledDeletionAt || account.scheduledDeletionAt <= now) return null;
    if (proof) {
      if (account.scheduledDeletionAt.getTime() !== proof.deadline) return null;
      const used = await tx.verificationToken.deleteMany({ where: { identifier: proof.identifier, token: proof.token, expires: { gt: now } } });
      if (used.count !== 1) return null;
    }
    const restored = await tx.user.updateMany({ where: { id: userId, status: 'pending_deletion', scheduledDeletionAt: { gt: now } }, data: {
      status: 'active', scheduledDeletionAt: null, deletionRequestedAt: null, deletionRecoveryRequested: false, deletionRecoveryReason: null,
    } });
    if (restored.count !== 1) throw new Error('Account cancellation changed concurrently.');
    await tx.verificationToken.deleteMany({ where: { identifier: { startsWith: `account_recovery:${userId}:` } } });
    return account;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));
}
