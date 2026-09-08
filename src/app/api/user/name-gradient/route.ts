import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { ALLOWED_NAME_GRADIENTS, getOrCreateUser, canUserUseNameGradient } from '@/lib/user-access';

export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gradientId } = await req.json();
    if (gradientId !== null && gradientId !== undefined && !ALLOWED_NAME_GRADIENTS.has(gradientId)) {
      return NextResponse.json({ error: 'Invalid name style.' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(user);
    if (gradientId && !canUserUseNameGradient(dbUser, gradientId)) {
      return NextResponse.json({ error: 'This Name Style is locked. Unlock it permanently with Sparks in Rewards, or access included Pro styles.' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { nameGradient: gradientId || null },
    });

    const { error: authError } = await supabaseServer.auth.updateUser({
      data: { name_gradient: gradientId || null },
    });

    if (authError) {
      console.error('Name gradient metadata update failed:', authError.message);
    }

    return NextResponse.json({ success: true, gradientId: gradientId || null });
  } catch (error: unknown) {
    console.error('Name Style Update Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update name style';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
