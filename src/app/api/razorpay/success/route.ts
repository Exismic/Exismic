import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload?.razorpay_order_id || !payload?.razorpay_payment_id || !payload?.razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment success callback is missing Razorpay verification fields.',
        },
        { status: 400 }
      );
    }

    const verifyUrl = new URL('/api/razorpay/verify', req.url);
    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: req.headers.get('cookie') || '',
      },
      body: JSON.stringify(payload),
    });
    const result = await verifyRes.json().catch(() => ({
      success: false,
      error: 'Payment verification returned an invalid response.',
    }));

    return NextResponse.json(result, { status: verifyRes.status });
  } catch (error) {
    console.error('[Razorpay success forwarder]', error);
    return NextResponse.json({ success: false, error: 'Payment success callback failed.' }, { status: 500 });
  }
}
