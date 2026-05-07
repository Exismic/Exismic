import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan 
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // 1. Update in Prisma (Local DB)
      await prisma.user.update({
        where: { email: user.email! },
        data: { 
          plan: 'pro',
          aiGenerationsLimit: 1000 // Unlimited or much higher for pro
        },
      });

      // 2. Update in Supabase (Cloud Sync as requested)
      try {
        await supabase
          .from('User') 
          .update({ plan: 'pro' })
          .eq('email', user.email!);
      } catch (supabaseError) {
        console.error('Supabase update failed, but Prisma succeeded:', supabaseError);
      }

      try {
        await createNotification(
          user.id,
          'Pro Activated 🚀',
          'Welcome to the elite club! You now have unlimited access to all tools.',
          'success'
        );
      } catch (notifError) {
        console.error('Notification failed:', notifError);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Payment verified and plan upgraded' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid signature' 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
