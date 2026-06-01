import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const serializedUser = {
      ...dbUser,
      custom_avatar_url: dbUser.customAvatarUrl,
      theme_preference: dbUser.themePreference,
      avatar_frame: dbUser.avatarFrame,
      name_gradient: dbUser.nameGradient,
      discord_user_id: dbUser.discordUserId,
      discord_username: dbUser.discordUsername,
      discord_dm_enabled: dbUser.discordDmEnabled,
      subscription_status: dbUser.subscriptionStatus,
      plan_expires_at: dbUser.planExpiresAt,
      daily_credits: dbUser.dailyCredits,
      lifetime_credits: dbUser.lifetimeCredits,
      ai_messages_today: dbUser.aiMessagesToday,
    };

    return NextResponse.json({
      success: true,
      user: serializedUser
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (err: unknown) {
    console.error('[API] Error fetching profile:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
