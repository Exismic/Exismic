import 'server-only';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'node:crypto';
export type OAuthLinkProvider = 'google' | 'github' | 'discord';
const OAUTH_LINK_TOKEN_PREFIX = 'oauth_link:';
const OAUTH_PROVIDER_APPROVAL_PREFIX = 'oauth_provider_approved:';
function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isOAuthLinkProvider(value: string): value is OAuthLinkProvider { return ['google','github','discord'].includes(value); }
export async function createOAuthLinkRequest(
  rawEmail: string,
  provider: OAuthLinkProvider,
) {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email) || !isOAuthLinkProvider(provider)) {
    throw new Error("Invalid OAuth account-link request.");
  }

  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      token: { startsWith: OAUTH_LINK_TOKEN_PREFIX },
    },
  });

  const nonce = randomUUID();
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: `${OAUTH_LINK_TOKEN_PREFIX}${nonce}:${provider}`,
      expires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return { nonce };
}

export async function isOAuthProviderApproved(
  rawEmail: string,
  provider: OAuthLinkProvider,
) {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email) || !isOAuthLinkProvider(provider)) return false;

  const approval = await prisma.authRateLimit.findUnique({
    where: {
      email_type: {
        email,
        type: `${OAUTH_PROVIDER_APPROVAL_PREFIX}${provider}`,
      },
    },
    select: { id: true },
  });
  return Boolean(approval);
}

export async function recordOAuthProviderApproval(
  rawEmail: string,
  provider: OAuthLinkProvider,
) {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email) || !isOAuthLinkProvider(provider)) {
    throw new Error("Invalid OAuth provider approval.");
  }

  const type = `${OAUTH_PROVIDER_APPROVAL_PREFIX}${provider}`;
  await prisma.authRateLimit.upsert({
    where: { email_type: { email, type } },
    update: { lastRequestedAt: new Date() },
    create: { email, type, lastRequestedAt: new Date() },
  });
}

