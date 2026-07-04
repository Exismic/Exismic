import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/utils/supabase/server';
import { getCreditPackagePrice, getProPrice, normalizeCheckoutCurrency } from '@/lib/payment-pricing';
import { PRICING_CONFIG } from '@/config/pricing';

type CreateOrderBody = {
  plan?: string;
  currency?: string;
  tierId?: string;
};

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Payment provider is not configured.');
  }

  return new Razorpay({ key_id, key_secret });
}

function resolveOrderAmount(body: CreateOrderBody) {
  const plan = body.plan === 'credits' ? 'credits' : 'pro';
  const currency = normalizeCheckoutCurrency(body.currency);

  if (plan === 'credits') {
    const packagePrice = getCreditPackagePrice(body.tierId, currency);

    if (!packagePrice) {
      return { error: 'Invalid credit package selected.' };
    }

    return {
      amount: packagePrice.amountMinor,
      currency,
      plan,
      tierId: packagePrice.tier.id,
    };
  }

  const proPrice = getProPrice(currency);
  return {
    amount: proPrice.amountMinor,
    currency,
    plan,
    tierId: undefined,
  };
}

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

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as CreateOrderBody;
    const resolved = resolveOrderAmount(body);

    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const options = {
      amount: resolved.amount,
      currency: resolved.currency,
      receipt: `${resolved.plan}_${user.id.slice(0, 8)}_${Date.now()}`.slice(0, 40),
      notes: {
        userId: user.id,
        plan: resolved.plan,
        tierId: resolved.tierId || ''
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      ...order,
      key: process.env.RAZORPAY_KEY_ID,
      checkout: {
        plan: resolved.plan,
        tierId: resolved.tierId || null,
        currency: resolved.currency,
      },
    });
  } catch (error: unknown) {
    console.error('Razorpay order creation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create payment order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
