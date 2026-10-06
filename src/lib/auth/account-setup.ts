import 'server-only';
import type { User } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { queueWelcomeEmail } from '@/lib/welcome-email';

/** Call only after server-side password AND device verification (or signup OTP). */
export async function ensureVerifiedCredentialAccount(identity: User) {
  const email = identity.email?.trim().toLowerCase();
  if (!identity.id || !email || !identity.email_confirmed_at) throw new Error('Account verification is incomplete.');
  return prisma.$transaction(async tx => {
    if (await tx.verificationToken.findFirst({ where: { identifier: `account_purge:${identity.id}` } })) throw new Error('This account cannot sign in right now.');
    const existing = await tx.user.findFirst({ where: { OR: [{ id: identity.id }, { email }] } });
    if (existing) {
      if (existing.id !== identity.id || existing.email !== email || existing.status !== 'active') throw new Error('This account cannot sign in right now.');
      return existing;
    }
    const account = await tx.user.upsert({
      where: { id: identity.id }, update: {},
      create: { id: identity.id, email, name: identity.user_metadata?.full_name || identity.user_metadata?.name || null, dailyCredits: 50, plan: 'free', hasSeenWelcome: false },
    });
    if (account.email !== email || account.status !== 'active') throw new Error('This account cannot sign in right now.');
    await queueWelcomeEmail(tx, account);
    return account;
  });
}
