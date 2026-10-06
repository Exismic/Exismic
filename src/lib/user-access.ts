import { prisma } from '@/lib/prisma';
import { isDevAccountEmail, DEV_INFINITE_BALANCE } from '@/lib/dev-account';
import { queueWelcomeEmail, sendWelcomeEmailOnce } from '@/lib/welcome-email';

type SessionUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
};

export {
  ALLOWED_AVATAR_FRAMES,
  ALLOWED_NAME_GRADIENTS,
  ALLOWED_INSIGNIAS,
  ALLOWED_CANOPIES,
  PRO_INCLUDED_AVATAR_FRAMES,
  PRO_INCLUDED_NAME_STYLES,
  PRO_INCLUDED_INSIGNIAS,
  PRO_INCLUDED_CANOPIES,
  hasActiveProAccess,
  canUserUseAvatarFrame,
  canUserUseNameGradient,
  canUserUseInsignia,
  canUserUseCanopy,
} from '@/config/cosmetics-access';

export async function getOrCreateUser(sessionUser: SessionUser) {
  const email = sessionUser.email?.trim().toLowerCase() || null;
  const isDev = isDevAccountEmail(email);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { id: sessionUser.id },
        ...(email ? [{ email }] : []),
      ],
    },
  });

  if (existing) {
    if (existing.id !== sessionUser.id && email && existing.email === email) {
      try {
        await prisma.user.update({
          where: { id: existing.id },
          data: { id: sessionUser.id },
        });
        existing.id = sessionUser.id;
      } catch (err) {
        console.warn('[getOrCreateUser] Could not sync user ID:', err);
      }
    }

    if (isDev && (existing.plan !== 'pro' || existing.dailyCredits < DEV_INFINITE_BALANCE)) {
      try {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            plan: 'pro',
            subscriptionStatus: 'active',
            role: 'developer',
            dailyCredits: DEV_INFINITE_BALANCE,
            bonusCredits: DEV_INFINITE_BALANCE,
            lifetimeCredits: DEV_INFINITE_BALANCE,
            sparks: DEV_INFINITE_BALANCE,
            lifetimeSparks: DEV_INFINITE_BALANCE,
            planExpiresAt: null,
          },
        });
        existing.plan = 'pro';
        existing.subscriptionStatus = 'active';
        existing.role = 'developer';
        existing.dailyCredits = DEV_INFINITE_BALANCE;
        existing.bonusCredits = DEV_INFINITE_BALANCE;
        existing.lifetimeCredits = DEV_INFINITE_BALANCE;
        existing.sparks = DEV_INFINITE_BALANCE;
        existing.lifetimeSparks = DEV_INFINITE_BALANCE;
      } catch (err) {
        console.warn('[getOrCreateUser] Could not update dev user balances:', err);
      }
    }

    return existing;
  }

  const newUser = await prisma.$transaction(async tx => {
    const account = await tx.user.create({
      data: {
        id: sessionUser.id,
        email,
        name: isDev
          ? 'Exismic Developer'
          : (sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || email?.split('@')[0] || null),
        dailyCredits: isDev ? DEV_INFINITE_BALANCE : 50,
        bonusCredits: isDev ? DEV_INFINITE_BALANCE : 0,
        lifetimeCredits: isDev ? DEV_INFINITE_BALANCE : 0,
        sparks: isDev ? DEV_INFINITE_BALANCE : 0,
        lifetimeSparks: isDev ? DEV_INFINITE_BALANCE : 0,
        plan: isDev ? 'pro' : 'free',
        subscriptionStatus: isDev ? 'active' : 'none',
        role: isDev ? 'developer' : 'user',
        creditsLastReset: new Date(),
        aiMessagesToday: 0,
        aiMessagesReset: new Date(),
        hasSeenWelcome: true,
      },
    });
    await queueWelcomeEmail(tx, account);
    return account;
  });

  if (email) {
    await sendWelcomeEmailOnce(email);
  }

  return newUser;
}
