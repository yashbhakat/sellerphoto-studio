# SellerPhoto Studio v1.0 manual fulfilment runbook

Use this procedure for the first 20 customers unless an automated webhook-to-delivery flow has been implemented and tested. Razorpay confirms payment; this process delivers the product.

## Approved release

- Product: SellerPhoto Studio — Full Offline Edition
- Version: 1.0.0
- File: `releases/SellerPhotoStudio-v1.0.0.zip`
- SHA-256: `10BD48C4280EF95ACD51DBCE3372BF145727929AD5FC067770525436AC098E58`
- Expected ZIP contents: `index.html`, `README.txt`, `studio.css`, `studio.js`

Run `npm run verify:release` before sending the file. Do not rename, rebuild, or replace the archive without updating its checksum manifest and rerunning the verifier.

## Before enabling checkout

1. Choose a monitored fulfilment/support mailbox.
2. Make a private copy of `fulfilment-ledger-template.csv` outside the repository.
3. Configure the Razorpay Payment Page to collect buyer name, email, and phone number.
4. Put the real delivery timeframe and support address on the Payment Page. Do not use “instant” for this manual process.
5. Complete the test-order procedure below.

## Test-order procedure

1. Use Razorpay test mode and complete a test payment through the exact Payment Page intended for launch.
2. Confirm the Dashboard shows a successful/captured payment for ₹499 and includes the buyer email.
3. Run `npm run verify:release`.
4. Send the buyer message and release ZIP to an email address you can inspect on another device.
5. Download the attachment, confirm its SHA-256, extract it, and open `index.html`.
6. Process three sample photos and confirm the generated image ZIP opens normally.
7. Record the test as fulfilled in the private ledger.

## Per-order procedure

1. Open the Razorpay Dashboard directly. Do not fulfil from a screenshot, forwarded email, or buyer claim.
2. Confirm the payment is successful/captured, the amount is ₹499, and the payment ID has not already been fulfilled.
3. Record the payment ID, paid time, buyer email, release version, and status in the private ledger.
4. Run `npm run verify:release` and attach `SellerPhotoStudio-v1.0.0.zip` to the buyer message below.
5. Send from the monitored fulfilment mailbox to the email collected by Razorpay.
6. Record the sent time and mark the order `fulfilled`.
7. If delivery fails, retain the error in the private ledger and retry only after confirming the buyer address.

## Buyer email

Subject: Your SellerPhoto Studio v1.0 download

Hello [BUYER_NAME],

Thank you for purchasing SellerPhoto Studio.

Your SellerPhoto Studio v1.0 ZIP is attached. Extract the ZIP, then open `index.html` in Chrome, Edge, Firefox, or Safari. The included `README.txt` contains the quick-start steps.

Release checksum (SHA-256):
`10BD48C4280EF95ACD51DBCE3372BF145727929AD5FC067770525436AC098E58`

Your photos stay on your device; the app does not upload them.

For help, reply to this email or contact [SUPPORT_EMAIL].

SellerPhoto Studio

## Refunds and disputes

- Follow the refund wording published on the Payment Page and applicable law.
- Record refunds, chargebacks, and technical-resolution attempts against the original payment ID in the private ledger.
- Never delete the audit row; update its status and notes.
