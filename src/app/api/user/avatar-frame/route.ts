import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { ALLOWED_AVATAR_FRAMES, getOrCreateUser, hasActiveProAccess } from '@/lib/user-access';

export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { frameId } = await req.json();
    if (frameId !== null && frameId !== undefined && !ALLOWED_AVATAR_FRAMES.has(frameId)) {
      return NextResponse.json({ error: 'Invalid avatar frame.' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(user);
    if (frameId && !hasActiveProAccess(dbUser)) {
      return NextResponse.json({ error: 'Elite Avatar Frames are exclusive to Pro members.' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { avatarFrame: frameId || null },
    });

    const { error: authError } = await supabaseServer.auth.updateUser({
      data: { avatar_frame: frameId || null },
    });

    if (authError) {
      console.error('Avatar frame metadata update failed:', authError.message);
    }

    return NextResponse.json({ success: true, frameId: frameId || null });
  } catch (error: unknown) {
    console.error('Frame Update Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update frame';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
