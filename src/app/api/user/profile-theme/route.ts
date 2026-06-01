import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { ALLOWED_PROFILE_THEMES, getOrCreateUser, hasActiveProAccess } from '@/lib/user-access';

export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { themeId } = await req.json();
    if (themeId !== null && themeId !== undefined && !ALLOWED_PROFILE_THEMES.has(themeId)) {
      return NextResponse.json({ error: "Invalid profile theme." }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(session.user);

    if (themeId && !hasActiveProAccess(dbUser)) {
      return NextResponse.json({ error: "Custom Profile Themes are exclusive to Pro members." }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { themePreference: themeId }
    });

    const { error: authError } = await supabaseServer.auth.updateUser({
      data: { theme_preference: themeId }
    });

    if (authError) {
      throw authError;
    }

    return NextResponse.json({ success: true, themeId });
  } catch (error: unknown) {
    console.error("Profile Theme Update Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update profile theme" }, { status: 500 });
  }
}
