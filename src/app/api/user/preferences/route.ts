import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

const DEFAULT_PREFERENCES = {
  autoRefreshHistory: true,
  emailNotifications: true,
  highFidelityPreview: false,
};

type PreferenceKey = keyof typeof DEFAULT_PREFERENCES;

function normalizePreferences(input: unknown) {
  const source = typeof input === 'object' && input !== null ? input as Record<string, unknown> : {};
  return {
    autoRefreshHistory: typeof source.autoRefreshHistory === 'boolean' ? source.autoRefreshHistory : DEFAULT_PREFERENCES.autoRefreshHistory,
    emailNotifications: typeof source.emailNotifications === 'boolean' ? source.emailNotifications : DEFAULT_PREFERENCES.emailNotifications,
    highFidelityPreview: typeof source.highFidelityPreview === 'boolean' ? source.highFidelityPreview : DEFAULT_PREFERENCES.highFidelityPreview,
  };
}

function parseStoredPreferences(value?: string | null) {
  if (!value) return DEFAULT_PREFERENCES;

  try {
    return normalizePreferences(JSON.parse(value));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function parseStoredPreferenceObject(value?: string | null) {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const context = await prisma.userContext.findUnique({
      where: { userId },
      select: { preferences: true },
    });

    return NextResponse.json({
      success: true,
      preferences: parseStoredPreferences(context?.preferences),
    });
  } catch (error) {
    console.error('[Preferences GET]', error);
    return NextResponse.json({ error: 'Could not load preferences.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const current = await prisma.userContext.findUnique({
      where: { userId },
      select: { preferences: true },
    });
    const rawExisting = parseStoredPreferenceObject(current?.preferences);
    const existing = normalizePreferences(rawExisting);

    let next = existing;
    if (body?.key && typeof body.value === 'boolean') {
      const key = String(body.key) as PreferenceKey;
      if (!(key in DEFAULT_PREFERENCES)) {
        return NextResponse.json({ error: 'Unknown preference.' }, { status: 400 });
      }
      next = { ...existing, [key]: body.value };
    } else {
      next = normalizePreferences(body?.preferences);
    }

    const saved = await prisma.userContext.upsert({
      where: { userId },
      update: {
        preferences: JSON.stringify({ ...rawExisting, ...next }),
      },
      create: {
        userId,
        preferences: JSON.stringify({ ...rawExisting, ...next }),
      },
      select: { preferences: true },
    });

    return NextResponse.json({
      success: true,
      preferences: parseStoredPreferences(saved.preferences),
    });
  } catch (error) {
    console.error('[Preferences POST]', error);
    return NextResponse.json({ error: 'Could not save preferences.' }, { status: 500 });
  }
}
