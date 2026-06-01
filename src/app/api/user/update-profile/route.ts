import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, username } = await req.json();
    const cleanName = typeof name === 'string' ? name.trim().slice(0, 80) : undefined;
    const cleanUsername = typeof username === 'string' ? username.trim().toLowerCase() : undefined;

    if (cleanUsername && (cleanUsername.length < 3 || cleanUsername.length > 20)) {
      return NextResponse.json({ error: 'Username must be between 3 and 20 characters.' }, { status: 400 });
    }

    if (cleanUsername && !/^[a-z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores.' }, { status: 400 });
    }

    if (cleanUsername) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: cleanUsername,
          NOT: { id: session.user.id },
        },
        select: { id: true },
      });

      if (existingUser) {
        const suggestions = [
          `${cleanUsername}${Math.floor(Math.random() * 999)}`,
          `${cleanUsername}_pro`,
          `${cleanUsername}_${new Date().getFullYear()}`
        ];
        return NextResponse.json({
          error: 'Username already taken.',
          suggestions
        }, { status: 409 });
      }
    }

    const updatedUser = await prisma.user.upsert({
      where: { id: session.user.id },
      update: {
        ...(cleanName ? { name: cleanName } : {}),
        ...(cleanUsername ? { username: cleanUsername } : {}),
      },
      create: {
        id: session.user.id,
        email: session.user.email.toLowerCase(),
        name: cleanName || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
        username: cleanUsername,
        dailyCredits: 50,
        lifetimeCredits: 0,
        plan: 'free',
      },
    });

    const { error: authError } = await supabaseServer.auth.updateUser({
      data: {
        full_name: cleanName || session.user.user_metadata?.full_name,
        username: cleanUsername || session.user.user_metadata?.username,
      }
    });

    if (authError) {
      console.error('Profile auth metadata update failed:', authError.message);
    }

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        avatar_frame: updatedUser.avatarFrame,
        name_gradient: updatedUser.nameGradient,
        theme_preference: updatedUser.themePreference,
        custom_avatar_url: updatedUser.customAvatarUrl,
      }
    });
  } catch (error: unknown) {
    console.error('Profile Update Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
