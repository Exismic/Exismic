import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { createNotification } from '@/lib/notifications';
import { sendProWelcomeEmail, sendCreditsPurchasedEmail, sendPaymentFailedEmail } from '@/lib/emails';
import { PRICING_CONFIG } from '@/config/pricing';

function buildInvoiceId(paymentId: string) {
  return `INV-${paymentId.slice(-8).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      tierId,
      isINR
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay verification fields' }, { status: 400 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(body)
      .digest('hex');

    const expectedSignatureBuffer = Buffer.from(expectedSignature);
    const receivedSignatureBuffer = Buffer.from(razorpay_signature);
    const isAuthentic =
      expectedSignatureBuffer.length === receivedSignatureBuffer.length &&
      crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer);

    if (!isAuthentic) {
      const failureEmailSent = await sendPaymentFailedEmail(user.email);
      if (!failureEmailSent) {
        console.error(`[Razorpay] Payment failure email failed for ${user.email}`);
      }

      return NextResponse.json({
        success: false,
        message: 'Invalid signature'
      }, { status: 400 });
    }

    let emailSent = false;

    if (plan === 'credits') {
      const tier = PRICING_CONFIG.CREDIT_PACKAGES.find(t => t.id === tierId) || PRICING_CONFIG.CREDIT_PACKAGES[0];
      const creditsToAdd = tier.credits;

      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          lifetimeCredits: { increment: creditsToAdd }
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          lifetimeCredits: creditsToAdd,
          dailyCredits: 50,
          plan: 'free'
        }
      });

      const finalIsINR = Boolean(isINR) || razorpay_order_id.includes('inr');
      emailSent = await sendCreditsPurchasedEmail(user.email, {
        credits: tier.credits,
        amount: finalIsINR ? `₹${tier.priceINR}` : `$${tier.priceUSD}`,
        invoiceId: buildInvoiceId(razorpay_payment_id)
      });

      if (!emailSent) {
        console.error(`[Razorpay] Credits purchase email failed for ${user.email}`);
      }
    } else {
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          plan: 'pro',
          subscriptionId: razorpay_order_id,
          subscriptionStatus: 'active',
          planExpiresAt: nextBillingDate,
          aiGenerationsLimit: 1000,
          dailyCredits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          plan: 'pro',
          subscriptionId: razorpay_order_id,
          subscriptionStatus: 'active',
          planExpiresAt: nextBillingDate,
          aiGenerationsLimit: 1000,
          dailyCredits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS
        }
      });

      console.log(`[Razorpay] Successfully activated Pro for ${user.email}`);

      emailSent = await sendProWelcomeEmail(user.email, {
        invoiceId: buildInvoiceId(razorpay_payment_id),
        amount: (isINR || razorpay_order_id.includes('inr')) ? `₹${PRICING_CONFIG.PRO_PLAN.INR}` : `$${PRICING_CONFIG.PRO_PLAN.USD}`,
        date: nextBillingDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      });

      if (!emailSent) {
        console.error(`[Razorpay] Pro welcome email failed for ${user.email}`);
      }
    }

    try {
      await createNotification(
        user.id,
        plan === 'credits' ? 'Reserve Refueled' : 'Pro Activated',
        plan === 'credits' ? 'Permanent credits added to your reserve.' : 'Welcome to the elite club! You now have unlimited access.',
        'success'
      );
    } catch (notifError) {
      console.error('Notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and account updated',
      emailSent
    });
  } catch (error: unknown) {
    console.error('Razorpay verification error:', error);
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
