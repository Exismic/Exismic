import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Update in Prisma (Local DB)
    await prisma.user.update({
      where: { email: user.email! },
      data: { 
        plan: 'free',
        aiGenerationsLimit: 50 // Reset to free limit
      },
    });

    // 2. Update in Supabase
    try {
      await supabase
        .from('User') 
        .update({ plan: 'free' })
        .eq('email', user.email!);
    } catch (supabaseError) {
      console.error('Supabase update failed:', supabaseError);
    }

    // 3. Notify User
    try {
      await createNotification(
        user.id,
        'Subscription Cancelled 🛡️',
        'Your Pro plan has been cancelled. You still have access until the end of your billing cycle (simulated).',
        'warning'
      );
    } catch (notifError) {
      console.error('Notification failed:', notifError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription cancelled successfully' 
    });
  } catch (error: any) {
    console.error('Razorpay cancel error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
