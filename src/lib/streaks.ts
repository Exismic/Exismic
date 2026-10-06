import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { resolveStreak } from './streak-state';
import { runSerializable } from './serializable';
import { isDevAccountEmail } from './dev-account';
import { getTodayInIndia, getMostRecentResetTimestamp, getNextDailyReset } from './daily-cycle';

export async function settleStreakInTransaction(tx: Prisma.TransactionClient, userId: string, now = new Date()) {
  const user = await tx.user.findUnique({ where: { id: userId }, select: {
    id: true, email: true, name: true, role: true, status: true,
    dailyStreak: true, lastClaimDate: true, streakShields: true, streakFreezeUsedAt: true,
  } });
  if (!user || user.status !== 'active' || user.role === 'developer' || isDevAccountEmail(user.email)) return null;
  const next = resolveStreak(user, now);
  if (!next.changed) return next;
  await tx.user.update({ where: { id: userId }, data: {
    dailyStreak: next.dailyStreak, streakShields: next.streakShields,
    ...(next.nextFreezeUsedAt ? { streakFreezeUsedAt: next.nextFreezeUsedAt } : {}),
  } });
  if (next.shieldsConsumed > 0) {
    // A zero-credit inventory event also acts as a durable notification outbox.
    await tx.creditTransaction.create({ data: {
      userId, amount: 0, balanceType: 'bonus', transactionType: 'streak_protection', toolId: 'streak-shield',
      description: `${next.shieldsConsumed} streak saver${next.shieldsConsumed === 1 ? '' : 's'} used automatically${next.broken ? '; protection ran out' : `; ${user.dailyStreak}-day streak saved`}.`,
      metadata: {
        streak: user.dailyStreak, shieldsUsed: next.shieldsConsumed, shieldsRemaining: next.streakShields,
        missedDays: next.missedDays, saved: !next.broken,
        protectedThrough: next.nextFreezeUsedAt!.toISOString(),
        emailStatus: user.email ? 'pending' : 'skipped', emailRetryAt: now.toISOString(),
      },
    } });
  }
  await tx.notification.create({ data: {
    userId, type: next.broken ? 'warning' : 'success',
    title: next.broken ? 'Daily streak ended' : 'Your streak saver worked',
    message: next.broken
      ? `Your streak ended after ${next.missedDays} missed reward days.${next.shieldsConsumed ? ` ${next.shieldsConsumed} saver${next.shieldsConsumed === 1 ? '' : 's'} protected part of the gap, but protection ran out.` : ''} Claim your next daily reward to start again.`
      : `${next.shieldsConsumed} saver${next.shieldsConsumed === 1 ? '' : 's'} automatically protected your ${user.dailyStreak}-day streak. You have ${next.streakShields} remaining. Claim today's reward to continue.`,
  } });
  return next;
}

export async function settleUserStreak(userId: string, now = new Date()) {
  return runSerializable(() => prisma.$transaction(tx => settleStreakInTransaction(tx, userId, now), {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  }));
}

/** Pending email is recorded in the same transaction as shield consumption. */
export async function deliverStreakProtectionEmails(userId?: string, maximum = 20, now = new Date()) {
  try { return await deliverPendingProtectionEmails(userId, maximum, now); }
  catch (error) {
    // A committed reward must never become a failed response because mail is unavailable.
    console.error('[Streaks] Email outbox unavailable; queued messages will retry:', error);
    return { sent: 0, failed: 1 };
  }
}

async function deliverPendingProtectionEmails(userId: string | undefined, maximum: number, now: Date) {
  const events = await prisma.creditTransaction.findMany({ where: {
    transactionType: 'streak_protection', ...(userId ? { userId } : {}),
    OR: [
      { AND: [{ metadata: { path: ['emailStatus'], equals: 'pending' } },
        { metadata: { path: ['emailRetryAt'], lte: now.toISOString() } }] },
      { AND: [{ metadata: { path: ['emailStatus'], equals: 'sending' } },
        { metadata: { path: ['emailLeaseUntil'], lte: now.toISOString() } }] },
    ],
  }, orderBy: { createdAt: 'asc' }, take: maximum });
  let sent = 0, failed = 0;
  for (const event of events) {
    const meta = event.metadata as Record<string, Prisma.InputJsonValue>;
    if (!meta || (meta.emailStatus === 'sending' && typeof meta.emailLeaseUntil === 'string' && new Date(meta.emailLeaseUntil) > now)
      || (meta.emailStatus === 'pending' && typeof meta.emailRetryAt === 'string' && new Date(meta.emailRetryAt) > now)) continue;
    const user = await prisma.user.findUnique({ where: { id: event.userId }, select: { email: true, name: true, status: true } });
    if (!user?.email || user.status !== 'active') {
      await prisma.creditTransaction.update({ where: { id: event.id }, data: { metadata: { ...meta, emailStatus: 'skipped' } } });
      continue;
    }
    const claimed = await prisma.creditTransaction.updateMany({ where: { id: event.id, metadata: { equals: meta } }, data: {
      metadata: { ...meta, emailStatus: 'sending', emailLeaseUntil: new Date(now.getTime() + 10 * 60 * 1000).toISOString() },
    } });
    if (claimed.count !== 1) continue;
    let accepted = false;
    try {
      const { sendStreakProtectionEmail } = await import('./emails');
      accepted = await sendStreakProtectionEmail({
        email: user.email, name: user.name, streak: Number(meta.streak), shieldsUsed: Number(meta.shieldsUsed),
        shieldsRemaining: Number(meta.shieldsRemaining), missedDays: Number(meta.missedDays), saved: meta.saved === true,
        eventId: event.id, protectedThrough: String(meta.protectedThrough),
      });
    } catch (error) { console.error('[Streaks] Protection email could not be sent:', error); }
    await prisma.creditTransaction.update({ where: { id: event.id }, data: { metadata: {
      ...meta, emailStatus: accepted ? 'sent' : 'pending',
      ...(accepted ? { emailSentAt: now.toISOString() } : { emailRetryAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString() }),
    } } });
    if (accepted) sent++; else failed++;
  }
  return { sent, failed };
}

export async function runStreakMaintenance(now = new Date()) {
  const today = getTodayInIndia(now), reset = getMostRecentResetTimestamp(now);
  const deadline = Date.now() + 40_000;
  let processed = 0, shieldsUsed = 0, streaksEnded = 0;
  // Settled users no longer match this cutoff, allowing subsequent runs to continue.
  while (Date.now() < deadline) {
    const users = await prisma.user.findMany({ where: {
      status: 'active', role: { not: 'developer' }, dailyStreak: { gt: 0 },
      lastClaimDate: { lt: new Date(today.getTime() - 24 * 60 * 60 * 1000) },
      OR: [{ streakFreezeUsedAt: null }, { streakFreezeUsedAt: { lt: reset } }],
    }, select: { id: true }, orderBy: { id: 'asc' }, take: 100 });
    if (users.length === 0) break;
    let changed = 0;
    for (const user of users) {
      if (Date.now() >= deadline) break;
      const result = await settleUserStreak(user.id, now);
      processed++;
      if (result?.changed) changed++;
      shieldsUsed += result?.shieldsConsumed || 0;
      if (result?.broken) streaksEnded++;
    }
    if (!changed) break;
  }
  const email = await deliverStreakProtectionEmails(undefined, 20, now);
  return { processed, shieldsUsed, streaksEnded, protectionEmailsSent: email.sent, protectionEmailsFailed: email.failed };
}

export async function sendStreakReminders(now = new Date()) {
  const today = getTodayInIndia(now);
  const hoursRemaining = Math.max(1, Math.ceil((getNextDailyReset(now).getTime() - now.getTime()) / (60 * 60 * 1000)));
  if (hoursRemaining > 8) return { emailsSent: 0, hoursRemaining, skipped: true };
  const users = await prisma.user.findMany({ where: {
    status: 'active', role: { not: 'developer' }, dailyStreak: { gt: 0 }, email: { not: null }, lastClaimDate: { lt: today },
    OR: [{ lastStreakReminderSentAt: null }, { lastStreakReminderSentAt: { lt: getMostRecentResetTimestamp(now) } }],
  }, select: { id: true }, orderBy: { lastStreakReminderSentAt: 'asc' }, take: 100 });
  let emailsSent = 0;
  for (const candidate of users) {
    await settleUserStreak(candidate.id, now);
    const user = await prisma.user.findUnique({ where: { id: candidate.id }, select: {
      email: true, name: true, role: true, status: true, dailyStreak: true, streakShields: true, lastClaimDate: true,
      lastStreakReminderSentAt: true,
    } });
    if (!user?.email || user.status !== 'active' || !user.dailyStreak || user.role === 'developer' || isDevAccountEmail(user.email)
      || (user.lastStreakReminderSentAt && user.lastStreakReminderSentAt >= getMostRecentResetTimestamp(now))
      || (user.lastClaimDate && user.lastClaimDate >= today)) continue;
    const { sendStreakExpiryWarningEmail } = await import('./emails');
    const sent = await sendStreakExpiryWarningEmail({ email: user.email, name: user.name, streak: user.dailyStreak,
      hoursRemaining, hasShield: user.streakShields > 0, cycleDate: today.toISOString().slice(0, 10) });
    if (sent) {
      await prisma.user.update({ where: { id: candidate.id }, data: { lastStreakReminderSentAt: now } });
      emailsSent++;
    }
  }
  return { emailsSent, hoursRemaining, usersEvaluated: users.length, skipped: false };
}
