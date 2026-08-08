# SellerPhoto Studio

SellerPhoto Studio is an offline-first batch product-photo formatter for independent online sellers. It includes:

- a public storefront and three-photo browser demo;
- a full offline edition supporting up to 50 photos per batch;
- marketplace size presets, fit controls, branding, price badges, and logo placement;
- JPG and PNG output with a dependency-free ZIP exporter;
- product listing copy, a short demo script, and a store-activation checklist.

## Product release

The sale-ready archive is `releases/SellerPhotoStudio-v1.0.0.zip`.

Buyers extract the archive and open `index.html`. No account, server, or internet connection is required for the offline edition.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

The standard scripts use POSIX-style environment assignment. On Windows, run the vinext CLI with `WRANGLER_LOG_PATH` set in the current shell.

## Verification

```bash
npm run build
node --test tests/rendered-html.test.mjs
```

## Checkout activation

After the digital product is approved in Lemon Squeezy, set `NEXT_PUBLIC_CHECKOUT_URL` to its checkout URL and publish a new site version. See `sales-assets/store-activation-checklist.md`.

## Privacy model

Product photos, logos, and exports are processed entirely in the buyer's browser. The app does not upload or persist them.
