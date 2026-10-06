import { publicJson } from '@/lib/public-json';
import { retryQueuedWelcomeEmails } from '@/lib/welcome-email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return publicJson({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return publicJson({ success: true, ...await retryQueuedWelcomeEmails() });
  } catch (error) {
    console.error('[WelcomeEmail] Scheduled retry failed:', error);
    return publicJson({ error: 'Email retries could not be completed.' }, { status: 500 });
  }
}

export async function GET(request: Request) { return POST(request); }
