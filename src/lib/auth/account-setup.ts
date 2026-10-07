import 'server-only';
import type { User } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { queueWelcomeEmail } from '@/lib/welcome-email';

/** Call only after server-side password AND device verification (or signup OTP). */
export async function ensureVerifiedCredentialAccount(identity: User) {
  const email = identity.email?.trim().toLowerCase();
  if (!identity.id || !email || !identity.email_confirmed_at) throw new Error('Account verification is incomplete.');
  const account = await prisma.$transaction(async tx => {
    if (await tx.verificationToken.findFirst({ where: { identifier: `account_purge:${identity.id}` } })) throw new Error('This account cannot sign in right now.');
    const existing = await tx.user.findFirst({ where: { OR: [{ id: identity.id }, { email }] } });
    if (existing) {
      if (existing.status !== 'active') throw new Error('This account cannot sign in right now.');
      const updates: { id?: string; dailyCredits?: number; creditsLastReset?: Date } = {};
      if (existing.id !== identity.id && existing.email === email) {
        updates.id = identity.id;
      }
      if (existing.dailyCredits === 0 && !existing.creditsLastReset) {
        updates.dailyCredits = 50;
        updates.creditsLastReset = new Date();
      }
      if (Object.keys(updates).length > 0) {
        await tx.user.update({
          where: { id: existing.id },
          data: updates,
        });
      }
      return existing;
    }
    const created = await tx.user.upsert({
      where: { id: identity.id }, update: {},
      create: { id: identity.id, email, name: identity.user_metadata?.full_name || identity.user_metadata?.name || null, dailyCredits: 50, plan: 'free', hasSeenWelcome: false },
    });
    if (created.email !== email || created.status !== 'active') throw new Error('This account cannot sign in right now.');
    return created;
  });

  await queueWelcomeEmail(prisma, account).catch(() => undefined);
  return account;
}
