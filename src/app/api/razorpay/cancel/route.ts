import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { createNotification } from '@/lib/notifications';

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Payment provider is not configured.');
  }

  return new Razorpay({ key_id, key_secret });
}

function fallbackExpiryDate() {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);
  return expiryDate;
}

type RazorpaySubscriptionLike = {
  end_at?: number;
  current_end?: number;
  charge_at?: number;
};

function resolveRazorpayExpiry(subscription: RazorpaySubscriptionLike) {
  const endAt = subscription.end_at || subscription.current_end || subscription.charge_at;
  if (typeof endAt === 'number' && Number.isFinite(endAt)) {
    return new Date(endAt * 1000);
  }
  return fallbackExpiryDate();
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = (await prisma.user.findUnique({
      where: { id: user.id }
    })) || (await prisma.user.findUnique({
      where: { email: user.email }
    }));

    if (!dbUser) {
      return NextResponse.json({ error: 'User record not found. Please sync your account and try again.' }, { status: 404 });
    }

    const currentPlan = (dbUser.plan || 'free').toLowerCase();
    const subscriptionStatus = (dbUser.subscriptionStatus || 'none').toLowerCase();

    if (subscriptionStatus === 'cancelled') {
      return NextResponse.json({
        success: true,
        message: 'Subscription is already cancelled',
        expiryDate: dbUser.planExpiresAt?.toISOString() || null,
        cancelledFlag: true
      });
    }

    if (currentPlan !== 'pro' && !dbUser.subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    let expiryDate = fallbackExpiryDate();
    let razorpayCancelled = false;

    if (dbUser.subscriptionId?.startsWith('sub_')) {
      try {
        const razorpay = getRazorpayClient();
        const subscription = await razorpay.subscriptions.cancel(dbUser.subscriptionId, false);
        expiryDate = resolveRazorpayExpiry(subscription);
        razorpayCancelled = true;
      } catch (rzpError) {
        console.error('[Razorpay] Subscription cancel failed, marking local cancellation anyway:', rzpError);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        subscriptionStatus: 'cancelled',
        planExpiresAt: expiryDate
      }
    });

    createNotification(
      updatedUser.id,
      'Subscription Cancelled',
      `Your Pro plan has been cancelled. You will keep Pro access until ${expiryDate.toLocaleDateString()}.`,
      'warning'
    ).catch((notifError) => {
      console.error('Cancellation notification failed:', notifError);
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscriptionStatus: updatedUser.subscriptionStatus,
      expiryDate: updatedUser.planExpiresAt?.toISOString() || expiryDate.toISOString(),
      cancelledFlag: true,
      razorpayCancelled
    });
  } catch (error: unknown) {
    console.error('Cancellation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 });
  }
}
