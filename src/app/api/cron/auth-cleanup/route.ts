import { publicJson } from '@/lib/public-json';
import { retryResetCleanups } from '@/lib/auth/reset-cleanup';
import { cleanupRequestLimits } from '@/lib/request-rate-limit';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return publicJson({ error: 'Unauthorized' }, { status: 401 });
  try {
    const auth = await retryResetCleanups();
    const expired = await cleanupRequestLimits();
    return publicJson({ success: true, ...auth, expiredLimitsRemoved: expired.count });
  }
  catch (error) { console.error('[Auth] Cleanup retry failed:', error); return publicJson({ error: 'Security updates could not finish.' }, { status: 500 }); }
}
export async function GET(request: Request) { return POST(request); }
