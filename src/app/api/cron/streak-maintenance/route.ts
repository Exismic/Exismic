import { NextRequest } from 'next/server';
import { publicJson } from '@/lib/public-json';
import { runStreakMaintenance } from '@/lib/streaks';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return publicJson({ error: 'Unauthorized' }, { status: 401 });
  }
  try { return publicJson({ success: true, ...await runStreakMaintenance() }); }
  catch (error) {
    console.error('[CRON_STREAK_ERROR]', error);
    return publicJson({ error: 'Streak updates could not be completed. Please try again later.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) { return POST(request); }
