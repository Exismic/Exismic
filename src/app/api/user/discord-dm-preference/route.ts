import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user-access';

export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await req.json();
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean.' }, { status: 400 });
    }

    const dbUser = await getOrCreateUser(session.user);
    if (enabled && !dbUser.discordUserId) {
      return NextResponse.json({ error: 'Connect Discord before enabling Discord DMs.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { discordDmEnabled: enabled },
      select: {
        discordDmEnabled: true,
        discordUserId: true,
        discordUsername: true,
      }
    });

    await supabaseServer.auth.updateUser({
      data: { discord_dm_enabled: enabled }
    });

    return NextResponse.json({
      success: true,
      discord_dm_enabled: updatedUser.discordDmEnabled,
      discord_user_id: updatedUser.discordUserId,
      discord_username: updatedUser.discordUsername,
    });
  } catch (error: unknown) {
    console.error('Discord DM preference update failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to update Discord DM preference';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
