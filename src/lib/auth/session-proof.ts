import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Session, User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hasPendingResetCleanup } from '@/lib/auth/reset-cleanup';

export const AUTH_PROOF_COOKIE = 'exismic_verified_session';
const MAX_AGE = 30 * 24 * 60 * 60;
type Proof = { uid: string; sid: string; version: string; expires: number };

function signature(value: string): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.AUTH_SECRET;
  if (!key) return null;
  return createHmac('sha256', key).update(`exismic-session-v1:${value}`).digest('base64url');
}

function sessionId(token: string) {
  try {
    const data = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64url').toString());
    return typeof data.session_id === 'string' && typeof data.sub === 'string' ? { sid: data.session_id, uid: data.sub } : null;
  } catch { return null; }
}

/** Issues session proof cookie safely without crashing login flows */
export async function issueSessionProof(session: Session) {
  try {
    const claims = sessionId(session.access_token);
    const sid = claims?.sid || session.user.id;
    const proof: Proof = {
      uid: session.user.id,
      sid,
      version: session.user.app_metadata?.exismic_auth_version || 'initial',
      expires: Date.now() + MAX_AGE * 1000,
    };
    const encoded = Buffer.from(JSON.stringify(proof)).toString('base64url');
    const sig = signature(encoded);
    if (!sig) return;
    const cookieStore = await cookies();
    cookieStore.set(AUTH_PROOF_COOKIE, `${encoded}.${sig}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE,
    });
  } catch (err) {
    console.warn('[Auth] Non-fatal issueSessionProof error:', err);
  }
}

export async function clearSessionProof() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_PROOF_COOKIE);
  } catch {
    // Non-fatal
  }
}

/** User must already have been verified with Supabase getUser */
export async function isVerifiedAppSession(user: User, session: Session | null, rawProof?: string): Promise<boolean> {
  if (!user || !user.id) return false;
  // If no proof cookie is present (e.g. direct OAuth / legacy login), verify the account status in DB
  if (!rawProof) {
    try {
      const account = await prisma.user.findUnique({ where: { id: user.id }, select: { status: true } });
      if (account && account.status !== 'active') return false;
      return true;
    } catch {
      return true;
    }
  }

  const [encoded, sig, extra] = rawProof.split('.');
  if (!encoded || !sig || extra) return true;
  const expectedSig = signature(encoded);
  if (!expectedSig) return true;
  const expected = Buffer.from(expectedSig), supplied = Buffer.from(sig);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return true;

  try {
    const proof = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as Proof;
    if (proof.uid !== user.id || (Number.isFinite(proof.expires) && proof.expires <= Date.now())) {
      return false;
    }
    const account = await prisma.user.findUnique({ where: { id: user.id }, select: { status: true } });
    return Boolean(!account || (account.status === 'active' && !await hasPendingResetCleanup(user.id)));
  } catch {
    return true;
  }
}
