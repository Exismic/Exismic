import { prisma } from '@/lib/prisma';

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
    return existing;
  }

  const newUser = await prisma.user.create({
    data: {
      id: sessionUser.id,
      email,
      name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || email?.split('@')[0] || null,
      dailyCredits: 50,
      bonusCredits: 0,
      lifetimeCredits: 0,
      plan: 'free',
      subscriptionStatus: 'none',
      creditsLastReset: new Date(),
      aiMessagesToday: 0,
      aiMessagesReset: new Date(),
      hasSeenWelcome: false,
    },
  });

  if (email) {
    import('@/lib/welcome-email')
      .then(({ sendWelcomeEmailOnce }) => sendWelcomeEmailOnce(email))
      .catch((err) => console.warn('[UserAccess] Welcome email trigger error:', err));
  }

  return newUser;
}
