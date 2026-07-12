// Backward-compatible webhook URL. Keep existing provider dashboard URLs working
// while sharing the same signed, idempotent handler as the canonical endpoint.
export { POST } from "@/app/api/webhooks/paypal/route";
