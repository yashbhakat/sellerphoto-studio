# Secure paid-product fulfilment

This Worker creates fixed-price Razorpay Orders, verifies the Standard Checkout signature on the server, confirms the payment amount/currency/status through Razorpay, and then grants a signed seven-day entitlement. The private R2 object is streamed only after an atomic D1 download-count update.

Production controls:

- exactly ₹499.00 INR, set server-side;
- captured payments only;
- 3 downloads within 7 days;
- idempotent entitlement per Razorpay Order;
- webhook-created entitlements plus same-device interrupted-checkout recovery;
- HMAC verification for Checkout and raw webhook bodies;
- refund events revoke the matching entitlement;
- exact-origin CORS and a hashed-IP checkout-attempt limit;
- revocable D1-backed administrator sessions and a daily transient-record cleanup;
- no card/UPI data or promotional email process.

Required Worker secrets (never commit values): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `DOWNLOAD_SIGNING_SECRET`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET`.

Provisioning is intentionally separate from source control. Copy `wrangler.example.jsonc` to `wrangler.jsonc`, replace the D1 database ID, create the private R2 bucket, apply `migrations/`, upload the reviewed release ZIP to `PRODUCT_KEY`, set all six secrets, deploy, and add the resulting HTTPS Worker URL to the GitHub repository variable `NEXT_PUBLIC_FULFILMENT_API_URL`.

The private `/admin/` storefront route signs in through the Worker, keeps its eight-hour session token in tab-scoped storage, and can stream the reviewed Pro ZIP without creating a payment. Sessions are also recorded in D1, so sign-out revokes them immediately. The admin password and session-signing secret exist only as encrypted Worker secrets.

The storefront stores a random checkout-attempt recovery pass on the buyer's device. It is keyed through the signing secret before lookup, is never sent to analytics, and can recover only the fixed entitlement created for that checkout. It does not extend the seven-day entitlement lifetime.

Configure Razorpay to send `payment.captured`, `payment.refunded`, and `refund.processed` events to:

`https://WORKER_HOST/api/webhooks/razorpay`

Keep the existing Payment Page URL configured only until Standard Checkout is live. In automated mode, the storefront does not fall through to the Payment Page, so an unverified payment cannot be accepted without secure delivery.
