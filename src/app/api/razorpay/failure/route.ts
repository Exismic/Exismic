import { publicJson } from "@/lib/public-json";
import { NextRequest } from 'next/server';
import { recordBillingFailure } from '@/lib/billing/fulfillment';
import { createClient } from '@/utils/supabase/server';

type FailureBody = {
  orderId?: string;
  providerPaymentId?: string;
  reason?: string;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return publicJson({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({})) as FailureBody;
    if (!body.orderId) return publicJson({ error: 'Payment order is required.' }, { status: 400 });

    const result = await recordBillingFailure({
      orderId: body.orderId,
      userId: user.id,
      providerPaymentId: body.providerPaymentId,
      reason: body.reason,
    });

    return publicJson({ success: true, ...result });
  } catch (error) {
    console.error('[Billing] Failure recording failed:', error);
    const message = error instanceof Error ? error.message : 'Could not record payment failure.';
    return publicJson({ error: message }, { status: message.includes('not found') ? 404 : 500 });
  }
}
