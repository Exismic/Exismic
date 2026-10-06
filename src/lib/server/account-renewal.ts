import 'server-only';

/** One-time orders/credit packs are not recurring subscriptions. */
export async function stopAccountRenewal(subscriptionId: string | null) {
  if (subscriptionId?.startsWith('I-')) {
    const { getPayPalSubscription, cancelPayPalSubscription } = await import('@/lib/paypal');
    const subscription = await getPayPalSubscription(subscriptionId);
    if (!['CANCELLED', 'EXPIRED'].includes(subscription.status || '')) {
      await cancelPayPalSubscription(subscriptionId, 'Account permanently deleted by its owner');
    }
  } else if (subscriptionId?.startsWith('sub_')) {
    const { default: Razorpay } = await import('razorpay');
    const key_id = process.env.RAZORPAY_KEY_ID, key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) throw new Error('Subscription cancellation is unavailable');
    const client = new Razorpay({ key_id, key_secret });
    const current = await client.subscriptions.fetch(subscriptionId);
    if (!['cancelled', 'completed', 'expired'].includes(current.status)) {
      const result = await client.subscriptions.cancel(subscriptionId, false);
      if (result.status !== 'cancelled') throw new Error('Subscription cancellation was not confirmed');
    }
  }
}
