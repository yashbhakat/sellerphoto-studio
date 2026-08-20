# SellerPhoto Studio

SellerPhoto Studio is an offline-first product media and commercial planning suite for online sellers. It includes:

- a public storefront, seller calculators and a three-photo browser demo;
- a paid offline Image Studio supporting up to 50 photos per batch;
- nine marketplace, quick-commerce, D2C and social image presets;
- independent toggles for image treatments, a compliance guard and six-point pre-upload inspector;
- a 12-scene product Video Studio with multiple aspect ratios, motion, transitions, captions, CTA, logo and music;
- a 12–60 month Forecast Lab covering revenue, net profit, cash flow, ROI, scenarios and sensitivity;
- JPG and PNG batch output, a dependency-free ZIP exporter, catalogue manifest, forecast CSV and printable report;
- protected Razorpay fulfilment backed by Cloudflare Worker, D1 and private R2 storage.

The production topology and ownership boundaries are documented in `ARCHITECTURE.md`.

## Product release

The sale-ready archive is releases/SellerPhotoStudio-v1.1.0.zip.

Buyers extract the archive and open index.html. All six files must remain in the same folder. Media processing and forecasting can run without an account or internet connection.

## Local development

Requires Node.js 22.13 or newer.

Run:

    npm install
    npm run dev

The standard scripts use POSIX-style environment assignment. On Windows, run the vinext CLI with WRANGLER_LOG_PATH set in the current shell.

## Verification

Run:

    npm run build
    node --test tests/rendered-html.test.mjs tests/launch-readiness.test.mjs
    npm run verify:release

The release verifier confirms the ZIP checksum, exact file set and byte-for-byte equality with the reviewed product directory. The checkout verifier proves that purchase buttons are safely disabled, linked to a configured hosted checkout, or connected to the automated protected-delivery API without falling through to an unverified payment.

## Checkout activation

The hosted Payment Page remains the manual fallback through NEXT_PUBLIC_CHECKOUT_URL. The automated flow in fulfilment-worker uses Razorpay Standard Checkout, server-side payment verification, D1 entitlements, a private R2 release, refund revocation, and signed seven-day/three-download passes.

Operational procedures are in sales-assets/automated-fulfilment-runbook.md, sales-assets/manual-fulfilment-runbook.md and sales-assets/store-activation-checklist.md.

## Privacy model

Product photos, logos, audio, video scenes, generated media and forecasts are processed entirely in the buyer's browser. The paid app does not upload or persist them. The storefront loads Google Analytics only after consent, disables advertising signals, and links to a plain-language privacy page covering approximate-location reporting and Razorpay checkout.

## Product safeguards

- Image presets are conservative starting points, not marketplace certification.
- Platform and category rules must be confirmed in the relevant seller portal.
- Forecast results are assumption-driven planning outputs, not guarantees or financial advice.
- WebM product video may need conversion when a destination explicitly requires MP4.

## Custom-domain deployment

The public site uses https://sellerphotostudio.in as its production origin. GitHub Pages remains the frontend deployment target, while the protected delivery API is deployed as a Cloudflare Worker with D1 and R2 bindings.
