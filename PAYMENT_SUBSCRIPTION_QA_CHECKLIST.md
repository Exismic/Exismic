# Payment Subscription QA Checklist

Use provider test mode first. Never use the PayPal seller/business sandbox account as the buyer.

## Required PayPal setup

- `PAYPAL_MODE=sandbox`
- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` from the same PayPal Sandbox REST app
- Optional for stable plans: `PAYPAL_PRO_PLAN_ID_USD`
- Required for renewal/cancel webhooks after deployment: `PAYPAL_WEBHOOK_ID` or `PAYPAL_SANDBOX_WEBHOOK_ID`
- Webhook URL in PayPal: `https://YOUR_DOMAIN/api/webhooks/paypal`

## Pro subscription purchase

1. Reset the test user to Free.
2. Open `/pro`.
3. Start PayPal Sandbox checkout.
4. Log in with a Personal sandbox buyer account, not the Business seller account.
5. Approve the subscription.
6. Return to Exismic.
7. Confirm the user row has:
   - `plan = pro`
   - `subscription_status = active`
   - `subscription_id` starts with `I-`
   - `plan_expires_at` is set to the next billing date
8. Refresh `/pro` and `/account/settings?tab=billing`; Pro should still show active.

Repeat this flow for Razorpay test mode using a configured `RAZORPAY_PRO_PLAN_ID_INR` and `https://YOUR_DOMAIN/api/webhooks/razorpay`.

## Cancel subscription

1. Open the membership modal.
2. Click Cancel membership and confirm.
3. Confirm response succeeds.
4. Refresh the page.
5. The UI should say the subscription is cancelled/scheduled and should not show another cancel action.
6. Confirm the user row has:
   - `plan = pro`
   - `subscription_status = cancelled`
   - `plan_expires_at` remains in the future
7. Confirm PayPal sandbox subscription no longer renews.

## End-of-period downgrade

1. Set a cancelled test user's `plan_expires_at` to a past timestamp.
2. Run the daily reset cron with the cron secret.
3. Confirm the user row becomes:
   - `plan = free`
   - `subscription_status = expired`
   - `subscription_id = null`
   - `daily_credits = 50`
   - `ai_generations_limit = 50`

## Renewal webhook

1. Configure the PayPal webhook URL in the PayPal app.
2. Subscribe to these events:
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
3. Trigger or simulate a completed payment event.
4. Confirm Exismic extends `plan_expires_at` and records a `payment_transactions` row.

## Safety checks

- Re-opening the PayPal return URL should not duplicate Pro transactions.
- A subscription custom ID for another user should be rejected.
- A cancelled subscription should keep Pro access until `plan_expires_at`.
- An expired cancelled subscription should not keep Pro credits.
- A failed provider cancellation must not change the local subscription to cancelled.
- Replayed checkout callbacks and webhooks must not create duplicate credits or invoices.
