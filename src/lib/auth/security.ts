import 'server-only';
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';

export const SIGNUP_CHALLENGE_COOKIE = 'exismic_signup_challenge';
export const DEVICE_CHALLENGE_COOKIE = 'exismic_device_challenge';
export const RESET_TOKEN_PREFIX = 'pwd_reset:';
export const OTP_TTL_MS = 10 * 60 * 1000;
export const RESET_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
type Purpose = 'signup' | 'device';
type Challenge = { userId: string; hash: string; attempts: number; binding?: string };

function digest(value: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.AUTH_SECRET;
  if (!secret) throw new Error('Authentication security is unavailable.');
  return createHmac('sha256', secret).update(`exismic-auth-v2:${value}`).digest('hex');
}
function sameHash(a: string, b: string) {
  return /^[a-f0-9]{64}$/.test(a) && /^[a-f0-9]{64}$/.test(b) && timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
function prefix(purpose: Purpose, id = '') { return `${purpose}_otp:v2:${id}`; }
function encode(purpose: Purpose, id: string, challenge: Challenge) {
  return `${prefix(purpose, id)}:${Buffer.from(JSON.stringify(challenge)).toString('base64url')}`;
}
function decode(token: string): Challenge | null {
  try {
    const data = JSON.parse(Buffer.from(token.split(':')[3] || '', 'base64url').toString()) as Challenge;
    return typeof data.userId === 'string' && /^[a-f0-9]{64}$/.test(data.hash) && Number.isSafeInteger(data.attempts) && data.attempts >= 0 ? data : null;
  } catch { return null; }
}
export function signupPasswordBinding(email: string, password: string) { return digest(`signup-password:${email}:${password}`); }

/** Persistent, atomic limits: no in-memory or fail-open fallback for authentication. */
export async function consumeAuthLimit(key: string, maximum: number, windowMs: number): Promise<boolean> {
  const keyHash = digest(`rate:${key}`);
  const window = Math.floor(Date.now() / windowMs);
  const identifier = `auth_rate:${keyHash}:${window}`;
  const tokenPrefix = `auth_rate:v2:${keyHash}:${window}:`;
  const expires = new Date((window + 1) * windowMs);
  for (let retry = 0; retry < 12; retry++) {
    const row = await prisma.verificationToken.findFirst({ where: { identifier } });
    if (!row) {
      try {
        await prisma.verificationToken.create({ data: { identifier, token: `${tokenPrefix}1`, expires } });
        await prisma.verificationToken.deleteMany({ where: { identifier: { startsWith: `auth_rate:${keyHash}:` }, expires: { lte: new Date() } } });
        return true;
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2002') throw error;
        continue;
      }
    }
    const count = Number(row.token.slice(tokenPrefix.length));
    if (!row.token.startsWith(tokenPrefix) || !Number.isSafeInteger(count) || count >= maximum) return false;
    const updated = await prisma.verificationToken.updateMany({ where: { identifier, token: row.token }, data: { token: `${tokenPrefix}${count + 1}` } });
    if (updated.count === 1) return true;
  }
  return false;
}

export async function createOtpChallenge(purpose: Purpose, email: string, userId: string, binding?: string) {
  const id = randomBytes(24).toString('hex');
  const otp = randomInt(100000, 1000000).toString();
  const expires = new Date(Date.now() + OTP_TTL_MS);
  const token = encode(purpose, id, { userId, hash: digest(`otp:${purpose}:${email}:${id}:${otp}`), attempts: 0, ...(binding ? { binding } : {}) });
  await prisma.verificationToken.deleteMany({ where: { identifier: email, token: { startsWith: `${purpose}_otp:` } } });
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });
  return { id, otp, expires };
}
export async function getOtpChallenge(purpose: Purpose, email: string, id: string) {
  if (!/^[a-f0-9]{48}$/.test(id)) return null;
  const row = await prisma.verificationToken.findFirst({ where: { identifier: email, token: { startsWith: `${prefix(purpose, id)}:` }, expires: { gt: new Date() } } });
  const data = row && decode(row.token);
  return row && data && data.attempts < MAX_OTP_ATTEMPTS ? { row, data } : null;
}
/** Compare-and-delete makes a valid code single-use even under concurrent requests. */
export async function consumeOtpChallenge(purpose: Purpose, email: string, id: string, otp: string, binding?: string) {
  if (!/^\d{6}$/.test(otp)) return null;
  for (let retry = 0; retry < 12; retry++) {
    const found = await getOtpChallenge(purpose, email, id);
    if (!found) return null;
    const { row, data } = found;
    const correct = sameHash(data.hash, digest(`otp:${purpose}:${email}:${id}:${otp}`)) && (!data.binding || (binding && sameHash(data.binding, binding)));
    if (correct) {
      const deleted = await prisma.verificationToken.deleteMany({ where: { identifier: email, token: row.token, expires: { gt: new Date() } } });
      if (deleted.count === 1) return { userId: data.userId };
    } else {
      const attempts = data.attempts + 1;
      const updated = attempts >= MAX_OTP_ATTEMPTS
        ? await prisma.verificationToken.deleteMany({ where: { identifier: email, token: row.token } })
        : await prisma.verificationToken.updateMany({ where: { identifier: email, token: row.token }, data: { token: encode(purpose, id, { ...data, attempts }) } });
      if (updated.count === 1) return null;
    }
  }
  return null;
}

export function generateResetToken() { return `${RESET_TOKEN_PREFIX}${randomBytes(32).toString('hex')}`; }
export function resetTokenHash(email: string, token: string) {
  if (!/^pwd_reset:[a-f0-9]{64}$/.test(token)) return null;
  return `${RESET_TOKEN_PREFIX}v2:${digest(`reset:${email}:${token}`)}`;
}
export async function consumeResetToken(email: string, token: string) {
  const hashed = resetTokenHash(email, token);
  if (!hashed) return false;
  const used = await prisma.verificationToken.deleteMany({ where: { identifier: email, token: hashed, expires: { gt: new Date() } } });
  return used.count === 1;
}

type SignupReceipt = { userId: string; hash: string; binding: string; version: string; leaseUntil: number; leaseId: string };
export type SignupLease = { email: string; token: string; id: string; data: SignupReceipt; expires: Date };
function receiptToken(id: string, data: SignupReceipt) { return `signup_finish:v1:${id}:${Buffer.from(JSON.stringify(data)).toString('base64url')}`; }

/** Move a valid code to a short-lived, browser/password-bound completion receipt.
 * The transaction prevents a DB failure from spending a code without saving its
 * retry proof. Leases serialize provider confirmation and account initialization.
 */
export async function claimSignupVerification(email: string, id: string, otp: string, binding: string, userId: string, version: string, alreadyConfirmed = false): Promise<SignupLease | 'busy' | null> {
  if (!/^[a-f0-9]{48}$/.test(id) || !/^\d{6}$/.test(otp)) return null;
  const receipt = await prisma.verificationToken.findFirst({ where: { identifier: email, token: { startsWith: `signup_finish:v1:${id}:` }, expires: { gt: new Date() } } });
  if (receipt) {
    let data: SignupReceipt;
    try { data = JSON.parse(Buffer.from(receipt.token.split(':')[3], 'base64url').toString()); } catch { return null; }
    if (data.userId !== userId || data.version !== version || !sameHash(data.binding, binding) || !sameHash(data.hash, digest(`otp:signup:${email}:${id}:${otp}`))) return null;
    if (data.leaseUntil > Date.now()) return 'busy';
    data.leaseUntil = Date.now() + 60_000;
    data.leaseId = randomBytes(16).toString('hex');
    const token = receiptToken(id, data);
    const claimed = await prisma.verificationToken.updateMany({ where: { identifier: email, token: receipt.token, expires: { gt: new Date() } }, data: { token } });
    return claimed.count === 1 ? { email, token, id, data, expires: receipt.expires } : 'busy';
  }
  if (alreadyConfirmed) return null;
  const challenge = await getOtpChallenge('signup', email, id);
  if (!challenge || challenge.data.userId !== userId) return null;
  if (!sameHash(challenge.data.hash, digest(`otp:signup:${email}:${id}:${otp}`)) || !challenge.data.binding || !sameHash(challenge.data.binding, binding)) {
    await consumeOtpChallenge('signup', email, id, otp, binding);
    return null;
  }
  const data: SignupReceipt = { userId, hash: challenge.data.hash, binding, version, leaseUntil: Date.now() + 60_000, leaseId: randomBytes(16).toString('hex') };
  const token = receiptToken(id, data);
  return prisma.$transaction(async tx => {
    const consumed = await tx.verificationToken.deleteMany({ where: { identifier: email, token: challenge.row.token, expires: { gt: new Date() } } });
    if (consumed.count !== 1) return 'busy' as const;
    await tx.verificationToken.create({ data: { identifier: email, token, expires: challenge.row.expires } });
    return { email, token, id, data, expires: challenge.row.expires };
  });
}

export async function releaseSignupVerification(lease: SignupLease) {
  await prisma.verificationToken.updateMany({ where: { identifier: lease.email, token: lease.token }, data: { token: receiptToken(lease.id, { ...lease.data, leaseUntil: 0 }) } });
}
export async function finishSignupVerification(lease: SignupLease) {
  return (await prisma.verificationToken.deleteMany({ where: { identifier: lease.email, token: lease.token, expires: { gt: new Date() } } })).count === 1;
}
