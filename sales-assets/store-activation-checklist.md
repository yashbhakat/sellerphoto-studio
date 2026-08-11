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

Razorpay Payment Pages accept the payment; this repository does not yet contain an automatic buyer-delivery service. Before enabling the site's purchase button, choose and test one of these fulfilment paths:

- send `SellerPhotoStudio-v1.0.0.zip` to the buyer's collected email address after verifying the successful payment; or
- connect a payment webhook to a private file-delivery service, then test the complete payment-to-download flow.

Do not publish “instant download” wording unless the automated path is live and verified. For manual fulfilment, state a delivery timeframe in the Payment Page copy.

## Connect the checkout

Set the GitHub Actions repository variable `NEXT_PUBLIC_CHECKOUT_URL` to the live Razorpay Payment Page URL, then rebuild and publish the site. The storefront will open checkout in a new tab.

## Before sending traffic

- Make one real low-value test purchase or use the platform’s test mode.
- Confirm the payment appears in Razorpay and contains the buyer details needed for fulfilment.
- Complete the chosen manual or automated fulfilment path and confirm the buyer receives the ZIP.
- Download and extract the ZIP on another device.
- Open `index.html`, process three photos, and confirm the result ZIP opens correctly.
- Check that your support email and refund wording are visible on the checkout page.
- Keep your own Indian income and tax records; merchant-of-record sales-tax handling does not replace your local reporting obligations.

## Minimal launch distribution

- Post the 30-second demo in three seller communities where promotional posts are permitted.
- Publish one before/after example on Instagram and WhatsApp Status.
- Offer the ₹499 price only to the first 20 customers.
- Ask buyers one question after purchase: “What would save you the most time in version 1.1?”
