import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import {
  getOrCreateUser,
  hasActiveProAccess,
  canUserUseAvatarFrame,
  canUserUseNameGradient,
  canUserUseInsignia,
  canUserUseCanopy,
} from '@/lib/user-access';
import { syncUserRazorpaySubscription } from '@/lib/billing/razorpay-sync';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const dbUser = await getOrCreateUser(user);
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Live sync with Razorpay if user has an active Razorpay recurring subscription
    if (dbUser.subscriptionId?.startsWith('sub_')) {
      const syncedUser = await syncUserRazorpaySubscription(dbUser.id);
      if (syncedUser) {
        Object.assign(dbUser, syncedUser);
      }
    }

    // 2. Auto-expire Pro if period has elapsed and no active renewal was received
    const isPro = hasActiveProAccess(dbUser);
    if (!isPro && (dbUser.plan === 'pro' || dbUser.subscriptionStatus === 'active')) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          plan: 'free',
          subscriptionStatus: dbUser.subscriptionStatus === 'active' ? 'expired' : dbUser.subscriptionStatus,
          dailyCredits: Math.min(dbUser.dailyCredits, 50),
          aiGenerationsLimit: 50,
        },
      });
      dbUser.plan = 'free';
      dbUser.subscriptionStatus = 'expired';
      dbUser.dailyCredits = Math.min(dbUser.dailyCredits, 50);
      dbUser.aiGenerationsLimit = 50;
    }

    // Unequip Pro-exclusive cosmetics if user no longer has active Pro
    let needsCosmeticsCleanup = false;
    const cosmeticUpdates: Record<string, any> = {};
    const authMetadataUpdates: Record<string, any> = {};

    if (dbUser.avatarFrame && !canUserUseAvatarFrame(dbUser, dbUser.avatarFrame)) {
      cosmeticUpdates.avatarFrame = null;
      authMetadataUpdates.avatar_frame = null;
      dbUser.avatarFrame = null;
      needsCosmeticsCleanup = true;
    }

    if (dbUser.nameGradient && !canUserUseNameGradient(dbUser, dbUser.nameGradient)) {
      cosmeticUpdates.nameGradient = null;
      authMetadataUpdates.name_gradient = null;
      dbUser.nameGradient = null;
      needsCosmeticsCleanup = true;
    }

    if (dbUser.insignia && !canUserUseInsignia(dbUser, dbUser.insignia)) {
      cosmeticUpdates.insignia = null;
      authMetadataUpdates.insignia = null;
      dbUser.insignia = null;
      needsCosmeticsCleanup = true;
    }

    if (dbUser.canopy && !canUserUseCanopy(dbUser, dbUser.canopy)) {
      cosmeticUpdates.canopy = null;
      authMetadataUpdates.canopy = null;
      dbUser.canopy = null;
      needsCosmeticsCleanup = true;
    }

    // Automatically purge deprecated profile theme preferences
    if (dbUser.themePreference) {
      cosmeticUpdates.themePreference = null;
      authMetadataUpdates.theme_preference = null;
      dbUser.themePreference = null;
      needsCosmeticsCleanup = true;
    }

    if (needsCosmeticsCleanup) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: cosmeticUpdates,
      });
      try {
        await supabase.auth.updateUser({
          data: authMetadataUpdates,
        });
      } catch (authErr) {
        console.warn('[Profile API] Failed to sync auth metadata for unequipped cosmetics:', authErr);
      }
    }
    
    const serializedUser = {
      ...dbUser,
      is_pro: hasActiveProAccess(dbUser),
      custom_avatar_url: dbUser.customAvatarUrl,
      avatar_frame: dbUser.avatarFrame,
      name_gradient: dbUser.nameGradient,
      insignia: dbUser.insignia,
      canopy: dbUser.canopy,
      discord_user_id: dbUser.discordUserId,
      discord_username: dbUser.discordUsername,
      discord_dm_enabled: dbUser.discordDmEnabled,
      subscription_status: dbUser.subscriptionStatus,
      plan_expires_at: dbUser.planExpiresAt,
      daily_credits: dbUser.dailyCredits,
      bonus_credits: dbUser.bonusCredits,
      lifetime_credits: dbUser.lifetimeCredits,
      ai_messages_today: dbUser.aiMessagesToday,
      unlocked_avatar_frames: Array.isArray(dbUser.unlockedAvatarFrames) ? dbUser.unlockedAvatarFrames : [],
      unlocked_name_gradients: Array.isArray(dbUser.unlockedNameGradients) ? dbUser.unlockedNameGradients : [],
      unlocked_insignias: Array.isArray(dbUser.unlockedInsignias) ? dbUser.unlockedInsignias : [],
      unlocked_canopies: Array.isArray(dbUser.unlockedCanopies) ? dbUser.unlockedCanopies : [],
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
