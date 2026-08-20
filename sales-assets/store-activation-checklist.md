# Store activation checklist

## Razorpay Payment Page

1. Create or sign in to your Razorpay account.
2. Complete account activation using your real business, legal, bank, support, and tax information.
3. In the Razorpay Dashboard, create a Payment Page for “SellerPhoto Studio — Full Offline Edition”.
4. Set the launch price to ₹499 and limit the offer operationally to the first 20 customers.
5. Collect the buyer's name, email address, and phone number so the purchase can be matched to fulfilment.
6. Add the relevant copy from `product-listing.md`, plus the support and refund wording approved for your business.
7. Test the page in test mode, then activate it and copy its live URL.

## Fulfilment

The repository now includes an automated delivery Worker in `fulfilment-worker/`. It creates the ₹499 INR Razorpay Order on the server, verifies the Checkout signature and captured amount/status, then issues a signed pass for at most three private downloads within seven days. D1 stores order/entitlement state and the reviewed ZIP remains private in R2. Refund webhooks revoke access.

Do not publish “instant download” wording until the Worker, D1 migration, R2 archive, Worker secrets, live Razorpay keys, webhook, and complete test-mode buyer journey have all been verified. Until then, keep the existing Payment Page and `manual-fulfilment-runbook.md` as the operational fallback.

## Connect the checkout

Keep `NEXT_PUBLIC_CHECKOUT_URL` set to the live Razorpay Payment Page while provisioning. After the Worker passes test mode, set `NEXT_PUBLIC_FULFILMENT_API_URL` to its HTTPS origin and rebuild. Automated mode intercepts every purchase button and does not fall through to the manual Payment Page.

## Before sending traffic

- Complete a Razorpay test-mode payment through Standard Checkout; do not make a real charge merely to test code.
- Confirm the payment appears in Razorpay and contains the buyer details needed for fulfilment.
- Confirm signature verification rejects an altered payment ID and a non-captured payment cannot obtain a token.
- Confirm the protected page displays the correct v1.1 checksum and streams the ZIP only with a valid pass.
- Confirm the fourth download fails, an expired pass fails, and a refund webhook revokes access.
- Download and extract the ZIP on another device.
- Open `index.html`, process three photos, and confirm the result ZIP opens correctly.
- Check that your support email and refund wording are visible on the checkout page.
- Keep your own Indian income and tax records; merchant-of-record sales-tax handling does not replace your local reporting obligations.

## Minimal launch distribution

- Post the 30-second demo in three seller communities where promotional posts are permitted.
- Publish one before/after example on Instagram and WhatsApp Status.
- Offer the ₹499 price only to the first 20 customers.
- Ask buyers one question after purchase: “What would save you the most time in version 1.1?”
