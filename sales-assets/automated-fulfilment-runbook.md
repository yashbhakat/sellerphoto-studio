# Automated fulfilment runbook

## Buyer flow

1. The storefront asks the fulfilment Worker to create the fixed ₹499 INR Razorpay Order.
2. Razorpay Standard Checkout collects payment details; SellerPhoto Studio never receives card or UPI credentials.
3. The browser returns the order ID, payment ID, and Checkout signature to the Worker.
4. The Worker verifies HMAC-SHA256, fetches the payment from Razorpay, and requires the exact order, amount, currency, and `captured` status.
5. D1 creates one entitlement for the order. The browser receives a signed recovery pass and opens `/download/`.
6. Each download atomically increments the D1 counter before the private R2 ZIP is streamed. Access ends after three downloads or seven days.

## Release controls

- Version: 1.1.0
- R2 key: `seller-photo-studio/v1.1.0/SellerPhotoStudio-v1.1.0.zip`
- SHA-256: `50257132C4FAC9EF007158A6FFDE395453E5E4742DFEFC42145CFC2F6F4EC00A`
- Expected contents: `index.html`, `README.txt`, `studio.css`, `studio.js`, `video.js`, `forecast.js`

Run `npm run verify:release` before every R2 upload. Never overwrite an existing version key with different bytes; publish a new version/key and update the Worker configuration.

## Operational checks

- `/health` returns `ok: true`.
- D1 migrations are current and the R2 key exists.
- `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `DOWNLOAD_SIGNING_SECRET` exist only as Worker secrets.
- `ALLOWED_ORIGIN` is exactly `https://sellerphotostudio.in` in production.
- Razorpay sends `payment.captured`, `payment.refunded`, and `refund.processed` to `/api/webhooks/razorpay`.
- A refund sets `revoked_at` for the matching entitlement.
- No customer data is committed to Git, build logs, analytics, or outreach files.

## Incident fallback

If order creation, verification, D1, or R2 becomes unavailable, remove `NEXT_PUBLIC_FULFILMENT_API_URL` and redeploy. The storefront returns to the explicit hosted Payment Page/manual-delivery mode. Do not leave automated-download wording visible during fallback. Use the manual runbook only after verifying the captured payment directly in Razorpay.
