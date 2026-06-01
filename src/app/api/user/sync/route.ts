import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { PRICING_CONFIG } from '@/config/pricing';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch user from local Prisma
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser.plan !== 'pro') {
      return NextResponse.json({ 
        error: 'No active Pro subscription found. Please upgrade to access Pro features.' 
      }, { status: 403 });
    }

    // 2. Fetch existing Supabase status to prevent accidental overwrites of 'cancelled'
    let { data: existingSupabaseUser } = await supabase
      .from('User')
      .select('subscription_status, plan_expires_at')
      .eq('id', user.id)
      .single();

    if (!existingSupabaseUser) {
      const { data: fallback } = await supabase
        .from('User')
        .select('subscription_status, plan_expires_at')
        .ilike('email', user.email!)
        .single();
      existingSupabaseUser = fallback;
    }

    const currentStatus = existingSupabaseUser?.subscription_status;
    const currentExpiry = existingSupabaseUser?.plan_expires_at;

    const dbStatus = dbUser.subscriptionStatus;
    const dbExpiry = dbUser.planExpiresAt;

    // Protection: If already cancelled in Supabase, preserve that status and expiry
    const newStatus = currentStatus === 'cancelled' || dbStatus === 'cancelled' 
      ? 'cancelled' 
      : (dbUser.plan === 'pro' ? 'active' : 'none');
    
    const newExpiry = currentExpiry || (dbExpiry ? dbExpiry.toISOString() : null);

    // No need to sync to Supabase via Admin Client because Prisma and Supabase point to the same database.
    // The issue was caused by service_role lacking explicit grants to tables created by postgres role.

    return NextResponse.json({ 
      success: true, 
      message: 'Account synced successfully',
      user: {
        plan: dbUser.plan,
        credits: dbUser.plan === 'pro' ? PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS : 50
      }
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
