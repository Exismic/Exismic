import { publicJson } from '@/lib/public-json';
import { createClient } from '@/utils/supabase/server';
import { clearSessionProof } from '@/lib/auth/session-proof';

export async function GET() {
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    return publicJson({ verified: Boolean(user) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return publicJson({ error: 'Could not check your sign-in. Please try again shortly.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  let sameOrigin = false;
  try { sameOrigin = Boolean(origin && new URL(origin).origin === new URL(request.url).origin); } catch { /* Invalid origin is rejected. */ }
  if (!sameOrigin) return publicJson({ error: 'This request is not allowed.' }, { status: 403 });
  await clearSessionProof();
  return publicJson({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
}
