# SellerPhoto Studio architecture

## Production topology

1. GitHub Pages serves the statically exported Next.js storefront at `sellerphotostudio.in`.
2. The storefront loads Razorpay Checkout only after a buyer starts checkout.
3. `fulfilment-worker/` creates fixed-price orders, verifies captured payments, processes signed webhooks, manages administrator sessions, and streams the private release.
4. Cloudflare D1 is the durable source of truth for orders, entitlements, download counts, webhook idempotency, rate limits, and revocable administrator sessions.
5. Cloudflare R2 stores the reviewed ZIP privately. Neither the storefront nor GitHub contains a public paid-download URL.

## Authoritative configuration

`config/product.mjs` owns the release version, price, filename, private object key, checksum, analytics item ID, access lifetime, and download limit. Deployment configuration mirrors these values, and launch-readiness tests fail if they drift.

## Recovery and lifecycle

- A cryptographically random checkout attempt ID is held locally as a same-device recovery pass.
- Razorpay's signed `payment.captured` webhook creates the entitlement even when the checkout tab closes.
- The protected download page can exchange the recovery pass for the existing time-limited entitlement.
- Refund webhooks revoke entitlement access.
- Administrator sessions are signed, stored in D1, revocable on sign-out, and expire after eight hours.
- A daily Worker schedule removes transient rate-limit rows, old processed webhook records, and expired administrator sessions. Financial order and entitlement records are retained.

## Deployment ownership

- `.github/workflows/deploy-pages.yml`: public storefront build and GitHub Pages publication.
- `fulfilment-worker/wrangler.jsonc`: protected API, D1, R2, schedule, and Worker deployment.
- `.openai/hosting.json`, `vite.config.ts`, and `worker/`: maintained development/alternative-hosting adapter; they are not the public production payment service.
