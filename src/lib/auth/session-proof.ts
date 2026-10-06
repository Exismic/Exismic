import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Session, User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hasPendingResetCleanup } from '@/lib/auth/reset-cleanup';

export const AUTH_PROOF_COOKIE = 'exismic_verified_session';
const MAX_AGE = 30 * 24 * 60 * 60;
type Proof = { uid: string; sid: string; version: string; expires: number };
function signature(value: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.AUTH_SECRET;
  if (!key) throw new Error('Authentication verification is unavailable.');
  return createHmac('sha256', key).update(`exismic-session-v1:${value}`).digest('base64url');
}
function sessionId(token: string) {
  try {
    const data = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64url').toString());
    return typeof data.session_id === 'string' && typeof data.sub === 'string' ? { sid: data.session_id, uid: data.sub } : null;
  } catch { return null; }
}
/** Only issue after a successful server-side password+device/signup-code flow or OAuth callback. */
export async function issueSessionProof(session: Session) {
  const claims = sessionId(session.access_token);
  if (!claims || claims.uid !== session.user.id) throw new Error('Could not complete session verification.');
  const proof: Proof = { uid: session.user.id, sid: claims.sid, version: session.user.app_metadata?.exismic_auth_version || 'initial', expires: Date.now() + MAX_AGE * 1000 };
  const encoded = Buffer.from(JSON.stringify(proof)).toString('base64url');
  (await cookies()).set(AUTH_PROOF_COOKIE, `${encoded}.${signature(encoded)}`, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: MAX_AGE });
}
export async function clearSessionProof() { (await cookies()).delete(AUTH_PROOF_COOKIE); }

/** User must already have been verified with Supabase getUser, not decoded from a cookie. */
export async function isVerifiedAppSession(user: User, session: Session | null, rawProof?: string): Promise<boolean> {
  if (!session || !rawProof || rawProof.length > 2000) return false;
  const [encoded, sig, extra] = rawProof.split('.');
  if (!encoded || !sig || extra) return false;
  const expected = Buffer.from(signature(encoded)), supplied = Buffer.from(sig);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
  try {
    const proof = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as Proof;
    const claims = sessionId(session.access_token);
    if (!claims || claims.uid !== user.id || proof.uid !== user.id || proof.sid !== claims.sid || !Number.isFinite(proof.expires) || proof.expires <= Date.now() || proof.version !== (user.app_metadata?.exismic_auth_version || 'initial')) return false;
    const account = await prisma.user.findUnique({ where: { id: user.id }, select: { status: true } });
    return Boolean(account && account.status === 'active' && !await hasPendingResetCleanup(user.id));
  } catch { return false; }
}
