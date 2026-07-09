# PayPal Sandbox Checkout

Exismic has a sandbox-first PayPal checkout path for testing Pro and credit purchases before live payments are enabled.

## Required Environment Variables

```env
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_SANDBOX_ENABLED=true
NEXT_PUBLIC_PAYPAL_SANDBOX_ENABLED=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production preview testing, set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS domain so PayPal returns users to the correct site.

## Test Flow

1. Sign in to Exismic.
2. Open `/pro` or `/shop`.
3. Click `PayPal Sandbox`.
4. Approve the payment with a PayPal sandbox buyer account.
5. PayPal redirects to `/paypal/return`.
6. Exismic captures the order server-side and activates Pro or adds permanent credits.

## Notes

- Sandbox checkout uses USD only for now.
- Live Razorpay checkout remains controlled by `NEXT_PUBLIC_PAYMENTS_ENABLED`.
- PayPal capture is idempotent through the `payment_transactions` table, using PayPal order and capture IDs.
