type RazorpayFailure = {
  error?: {
    description?: string;
    reason?: string;
    metadata?: {
      payment_id?: string;
    };
  };
};

export function reportPaymentFailure(orderId: string | undefined, failure?: unknown) {
  if (!orderId) return;
  const typedFailure = failure && typeof failure === 'object' ? failure as RazorpayFailure : undefined;
  const reason = typedFailure?.error?.description || typedFailure?.error?.reason || 'The payment provider could not complete this transaction.';
  const providerPaymentId = typedFailure?.error?.metadata?.payment_id;

  void fetch('/api/razorpay/failure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, providerPaymentId, reason }),
    keepalive: true,
  }).catch((error) => console.warn('[Billing] Could not record payment failure:', error));
}
