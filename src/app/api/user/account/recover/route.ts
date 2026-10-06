import { consumeAuthLimit } from '@/lib/auth/security';
import { getDeletionRecoveryProof, clearDeletionRecoveryProof } from '@/lib/auth/deletion-recovery';
import { clearSessionProof } from '@/lib/auth/session-proof';
import { cancelScheduledAccountDeletion } from '@/lib/server/account-lifecycle';
import { extractClientIp } from '@/lib/device-security';
import { publicJson } from '@/lib/public-json';
import { createClient } from '@/utils/supabase/server';
import { createNotification } from '@/lib/notifications';
import { sendAccountRecoveryRequestedEmail } from '@/lib/emails';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin');
    if (origin && origin !== new URL(req.url).origin) return publicJson({ error: 'Unauthorized' }, { status: 403 });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let userId = user?.id;
    const proof = !userId ? await getDeletionRecoveryProof() : null;
    if (proof) userId = proof.userId;
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;
    if (!userId && email && password) {
      const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || typeof password !== 'string' || password.length > 128) {
        return publicJson({ error: 'Please check your email and password.' }, { status: 400 });
      }
      const allowed = await consumeAuthLimit(`recover-ip:${extractClientIp(req.headers)}`, 20, 900000)
        && await consumeAuthLimit(`recover-email:${cleanEmail}`, 5, 900000);
      if (!allowed) return publicJson({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      await supabase.auth.signOut({ scope: 'local' });
      await clearSessionProof();
      if (!error && data.user) userId = data.user.id;
    }
    if (!userId) return publicJson({ error: 'Please sign in again to cancel account deletion.' }, { status: 401 });
    const restored = await cancelScheduledAccountDeletion(userId, proof);
    if (!restored) return publicJson({ error: 'Your account can no longer be restored automatically. Please contact support.' }, { status: 409 });
    // Restoration is already committed; cookie/provider cleanup must not report it as failed.
    const cleanup = await Promise.allSettled([clearDeletionRecoveryProof(), clearSessionProof(), supabase.auth.signOut({ scope: 'local' })]);
    for (const result of cleanup) if (result.status === 'rejected') console.error('[Account recovery] Session cleanup failed:', result.reason);
    await createNotification(userId, 'Account deletion cancelled', 'Your account deletion has been cancelled. Sign in again to continue.', 'success');
    if (restored.email) {
      try { await sendAccountRecoveryRequestedEmail(restored.email, true); }
      catch (error) { console.error('[Account recovery] Cancellation notice failed:', error); }
    }
    return publicJson({ success: true, cancelled: true, message: 'Account deletion cancelled. Please sign in again to continue.' });
  } catch (error) {
    console.error('[Account recovery]', error);
    return publicJson({ error: 'Could not cancel account deletion. Please try again later.' }, { status: 500 });
  }
}
