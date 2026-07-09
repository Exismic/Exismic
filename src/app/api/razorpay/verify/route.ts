import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { createNotification } from '@/lib/notifications';
import { sendProWelcomeEmail, sendCreditsPurchasedEmail } from '@/lib/emails';
import { PRICING_CONFIG } from '@/config/pricing';
import { getCreditPackagePrice, getProPrice, normalizeCheckoutCurrency, type CheckoutCurrency } from '@/lib/payment-pricing';

function buildInvoiceId(paymentId: string) {
  return `INV-${paymentId.slice(-8).toUpperCase()}`;
}

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Payment provider is not configured.');
  }

  return new Razorpay({ key_id, key_secret });
}

type VerifyPaymentBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  plan?: string;
  tierId?: string;
  isINR?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    if (!PRICING_CONFIG.PAYMENTS_ENABLED) {
      return NextResponse.json(
        {
          error: PRICING_CONFIG.PAYMENT_UNAVAILABLE_MESSAGE,
          code: 'PAYMENTS_UNAVAILABLE',
        },
        { status: 503 },
      );
    }

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
    } = (await req.json()) as VerifyPaymentBody;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay verification fields' }, { status: 400 });
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpaySecret) {
      return NextResponse.json({ error: 'Payment provider is not configured.' }, { status: 500 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(body)
      .digest('hex');

    const expectedSignatureBuffer = Buffer.from(expectedSignature);
    const receivedSignatureBuffer = Buffer.from(razorpay_signature);
    const isAuthentic =
      expectedSignatureBuffer.length === receivedSignatureBuffer.length &&
      crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer);

    if (!isAuthentic) {
      console.error('[Razorpay] Invalid signature', {
        userId: user.id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json({
        success: false,
        error: 'Payment verification failed. Signature did not match the order.'
      }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.order_id !== razorpay_order_id) {
      return NextResponse.json({ success: false, error: 'Payment does not belong to this order.' }, { status: 400 });
    }

    if (!['captured', 'authorized'].includes(String(payment.status))) {
      return NextResponse.json({ success: false, error: `Payment is not completed yet (${payment.status}).` }, { status: 400 });
    }

    const orderNotes = (order.notes || {}) as Record<string, string | undefined>;
    const orderUserId = orderNotes.userId;

    if (orderUserId && orderUserId !== user.id) {
      console.error('[Razorpay] Order user mismatch', {
        sessionUserId: user.id,
        orderUserId,
        orderId: razorpay_order_id,
      });
      return NextResponse.json({ success: false, error: 'This payment order does not belong to the signed-in user.' }, { status: 403 });
    }

    const verifiedPlan = orderNotes.plan === 'credits' ? 'credits' : plan === 'credits' ? 'credits' : 'pro';
    const verifiedTierId = orderNotes.tierId || tierId;
    const verifiedCurrency = normalizeCheckoutCurrency(String(order.currency || (isINR ? 'INR' : 'USD')));
    const orderAmount = Number(order.amount);
    const paymentAmount = Number(payment.amount);

    if (paymentAmount !== orderAmount) {
      return NextResponse.json({ success: false, error: 'Payment amount does not match the order.' }, { status: 400 });
    }

    const existingTransaction = await prisma.paymentTransaction.findUnique({
      where: { providerPaymentId: razorpay_payment_id },
    });

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        message: 'Payment was already verified',
        plan: existingTransaction.kind,
        currency: existingTransaction.currency,
        emailSent: false,
        duplicate: true,
      });
    }

    let emailSent = false;

    if (verifiedPlan === 'credits') {
      const packagePrice = getCreditPackagePrice(verifiedTierId, verifiedCurrency);

      if (!packagePrice) {
        return NextResponse.json({ error: 'Invalid credit package selected' }, { status: 400 });
      }
      if (orderAmount !== packagePrice.amountMinor) {
        return NextResponse.json({ success: false, error: 'Payment amount does not match the selected credit package.' }, { status: 400 });
      }

      const tier = packagePrice.tier;
      const creditsToAdd = tier.credits;

      await prisma.$transaction([
        prisma.user.upsert({
          where: { id: user.id },
          update: {
            lifetimeCredits: { increment: creditsToAdd }
          },
          create: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split('@')[0],
            lifetimeCredits: creditsToAdd,
            bonusCredits: 0,
            dailyCredits: 50,
            plan: 'free'
          }
        }),
        prisma.paymentTransaction.create({
          data: {
            providerPaymentId: razorpay_payment_id,
            providerOrderId: razorpay_order_id,
            userId: user.id,
            kind: 'credits',
            amount: orderAmount,
            currency: verifiedCurrency,
            metadata: {
              tierId: tier.id,
              credits: tier.credits,
            },
          },
        }),
        prisma.creditTransaction.create({
          data: {
            userId: user.id,
            amount: creditsToAdd,
            balanceType: 'permanent',
            transactionType: 'purchase',
            description: `Purchased ${tier.credits} permanent credits`,
            metadata: {
              tierId: tier.id,
              providerPaymentId: razorpay_payment_id,
              providerOrderId: razorpay_order_id,
            },
          },
        }),
      ]);

      emailSent = await sendCreditsPurchasedEmail(user.email, {
        credits: tier.credits,
        amount: packagePrice.display,
        invoiceId: buildInvoiceId(razorpay_payment_id)
      });

      if (!emailSent) {
        console.error(`[Razorpay] Credits purchase email failed for ${user.email}`);
      }
    } else {
      const proPrice = getProPrice(verifiedCurrency as CheckoutCurrency);
      if (orderAmount !== proPrice.amountMinor) {
        return NextResponse.json({ success: false, error: 'Payment amount does not match Exismic Pro pricing.' }, { status: 400 });
      }

      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
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
          dailyCredits: PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS,
          bonusCredits: 0,
          lifetimeCredits: 0,
        }
      });

      await prisma.paymentTransaction.create({
        data: {
          providerPaymentId: razorpay_payment_id,
          providerOrderId: razorpay_order_id,
          userId: user.id,
          kind: 'pro',
          amount: orderAmount,
          currency: verifiedCurrency,
          metadata: {
            planExpiresAt: nextBillingDate.toISOString(),
          },
        },
      });

      console.log(`[Razorpay] Successfully activated Pro for ${user.email}`);

      emailSent = await sendProWelcomeEmail(user.email, {
        invoiceId: buildInvoiceId(razorpay_payment_id),
        amount: proPrice.display,
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
        verifiedPlan === 'credits' ? 'Reserve Refueled' : 'Pro Activated',
        verifiedPlan === 'credits' ? 'Permanent credits added to your reserve.' : 'Welcome to the elite club! You now have unlimited access.',
        'success'
      );
    } catch (notifError) {
      console.error('Notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and account updated',
      plan: verifiedPlan,
      currency: verifiedCurrency,
      emailSent
    });
  } catch (error: unknown) {
    console.error('Razorpay verification error:', error);
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
