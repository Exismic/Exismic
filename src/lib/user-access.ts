import { prisma } from '@/lib/prisma';

type SessionUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
};

export const ALLOWED_AVATAR_FRAMES = new Set([
  'neon-glow',
  'luxury-gold',
  'cosmic-nebula',
  'purple-energy',
  'cyberpunk-vibe',
  'cyan-beast',
  'royal-purple',
  'futuristic-hex',
]);

export const ALLOWED_NAME_GRADIENTS = new Set([
  'cyber-purple',
  'luxury-gold',
  'cosmic-rainbow',
  'neon-emerald',
  'royal-crimson',
  'void-blue',
  'sunset-flame',
]);

export const ALLOWED_PROFILE_THEMES = new Set([
  'cyber-pulse',
  'luxury-void',
  'cosmic-nebula',
  'neon-shadow',
  'royal-eclipse',
  'minimal-frost',
]);

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

  if (existing) return existing;

  return prisma.user.create({
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
    },
  });
}

export function hasActiveProAccess(user: {
  plan?: string | null;
  subscriptionStatus?: string | null;
  planExpiresAt?: Date | string | null;
}) {
  const plan = (user.plan || 'free').toLowerCase();
  const subscriptionStatus = (user.subscriptionStatus || 'none').toLowerCase();
  const hasProEntitlement = plan === 'pro' || subscriptionStatus === 'active';

  if (!hasProEntitlement) return false;

  if (!user.planExpiresAt) return true;
  const expiresAt = new Date(user.planExpiresAt);
  return Number.isNaN(expiresAt.getTime()) || expiresAt > new Date();
}
