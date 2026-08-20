import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { verifyReleaseArchive } from "../scripts/verify-release.mjs";
import { verifyCheckoutHtml } from "../scripts/verify-static-checkout.mjs";
import { PRODUCT } from "../config/product.mjs";

const shell = (links, note) => `<html><body><h1>SellerPhoto Studio</h1>${links}${note}</body></html>`;

test("release ZIP exactly matches the reviewed offline product", async () => {
  const result = await verifyReleaseArchive();
  assert.deepEqual(result.files, ["README.txt", "forecast.js", "index.html", "studio.css", "studio.js", "video.js"]);
  assert.match(result.sha256, /^[A-F0-9]{64}$/);
});

test("static checkout remains safely disabled without a configured URL", () => {
  const html = shell(
    '<a href="#launch-offer">Buy</a><a href="#launch-offer">Buy</a>',
    "Secure checkout will open after store activation.",
  );
  assert.deepEqual(verifyCheckoutHtml(html), { mode: "disabled", checkoutUrl: null });
});

test("static checkout is enabled only when both purchase links are safe and verified", () => {
  const checkoutUrl = "https://rzp.io/rzp/seller-photo-studio";
  const link = `<a href="${checkoutUrl}" target="_blank" rel="noopener noreferrer">Buy</a>`;
  const html = shell(link + link, "Secure Razorpay checkout opens in a new tab.");
  assert.deepEqual(verifyCheckoutHtml(html, checkoutUrl), { mode: "enabled", checkoutUrl });
});

test("automated checkout never falls through to an unverified hosted payment", () => {
  const apiUrl = "https://sellerphoto-fulfilment.example.workers.dev";
  const link = '<a data-checkout-mode="automated" href="#launch-offer">Buy</a>';
  const html = shell(link + link, "Payment is verified server-side. Your protected download appears immediately after capture.");
  assert.deepEqual(verifyCheckoutHtml(html, "https://rzp.io/rzp/fallback", apiUrl), { mode: "automated", apiUrl });
});

test("checkout verification rejects placeholders and disabled output paired with a URL", () => {
  const disabledHtml = shell(
    '<a href="#launch-offer">Buy</a><a href="#launch-offer">Buy</a>',
    "Secure checkout will open after store activation.",
  );
  assert.throws(
    () => verifyCheckoutHtml(disabledHtml, "https://rzp.io/rzp/your-payment-page"),
    /placeholder/,
  );
  assert.throws(
    () => verifyCheckoutHtml(disabledHtml, "https://rzp.io/rzp/real-checkout"),
    /purchase buttons/,
  );
});

test("analytics requires consent and tracks checkout intent without advertising signals", async () => {
  const source = await readFile(new URL("../app/analytics-consent.tsx", import.meta.url), "utf8");
  assert.match(source, /sellerphoto-analytics-consent/);
  assert.match(source, /analytics_storage: "granted"/);
  assert.match(source, /ad_storage: "denied"/);
  assert.match(source, /allow_google_signals: false/);
  assert.match(source, /"begin_checkout"/);
  assert.match(source, /sensitiveRoute/);
  assert.match(source, /PRODUCT\.analyticsItemId/);
});

test("privacy disclosure covers local processing, analytics location scope, and checkout", async () => {
  const [privacy, workflow] = await Promise.all([
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
  ]);
  assert.match(privacy, /does not upload those files/);
  assert.match(privacy, /approximate country or/);
  assert.match(privacy, /does not receive precise GPS location/);
  assert.match(privacy, /Razorpay Standard Checkout/);
  assert.match(workflow, /vars\.NEXT_PUBLIC_BASE_PATH \|\| '__ROOT__'/);
  assert.match(workflow, /vars\.NEXT_PUBLIC_SITE_URL \|\| 'https:\/\/sellerphotostudio\.in'/);
});

test("automated fulfilment and administrator access are server-verified and private by construction", async () => {
  const [worker, checkout, download, admin, privacy, schema, resilientSchema, config] = await Promise.all([
    readFile(new URL("../fulfilment-worker/src/index.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/checkout-button.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/download/download-access.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/admin-access.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../fulfilment-worker/migrations/0001_secure_fulfilment.sql", import.meta.url), "utf8"),
    readFile(new URL("../fulfilment-worker/migrations/0002_resilient_delivery.sql", import.meta.url), "utf8"),
    readFile(new URL("../fulfilment-worker/wrangler.example.jsonc", import.meta.url), "utf8"),
  ]);
  assert.match(worker, /order\.razorpay_order_id \|\| order\.id/);
  assert.match(worker, /payment\.status !== "captured"/);
  assert.match(worker, /Number\(payment\.amount\) !== Number\(order\.amount\)/);
  assert.match(worker, /X-Razorpay-Signature/);
  assert.match(worker, /download_count < max_downloads/);
  assert.match(worker, /env\.PRODUCTS\.get/);
  assert.match(worker, /\/api\/admin\/login/);
  assert.match(worker, /\/api\/admin\/logout/);
  assert.match(worker, /\/api\/entitlements\/recover/);
  assert.match(worker, /ensureEntitlement/);
  assert.match(worker, /async scheduled/);
  assert.match(worker, /verifyAdminSessionToken/);
  assert.match(worker, /env\.ADMIN_PASSWORD/);
  assert.match(worker, /admin-ip:/);
  assert.match(checkout, /checkout\.razorpay\.com\/v1\/checkout\.js/);
  assert.match(checkout, /\/api\/payments\/verify/);
  assert.match(download, /Authorization: `Bearer \$\{token\}`/);
  assert.match(admin, /sessionStorage\.setItem\(TOKEN_KEY/);
  assert.match(admin, /\/api\/admin\/download/);
  assert.match(admin, /operations/);
  assert.doesNotMatch(admin, /ADMIN_PASSWORD|ADMIN_SESSION_SECRET/);
  assert.match(privacy, /one-way keyed hash/);
  assert.match(schema, /CREATE UNIQUE INDEX `idx_entitlements_order_id`/);
  assert.match(resilientSchema, /CREATE TABLE IF NOT EXISTS `admin_sessions`/);
  assert.match(resilientSchema, /idx_webhook_events_created_processed/);
  assert.match(config, new RegExp(`"PRODUCT_AMOUNT": "${PRODUCT.amountMinor}"`));
  assert.match(config, new RegExp(`"PRODUCT_VERSION": "${PRODUCT.version.replaceAll(".", "\\.")}"`));
  assert.match(config, new RegExp(PRODUCT.sha256));
  assert.match(config, /"ADMIN_USERNAME": "admin"/);
  assert.doesNotMatch(config, /key_secret|RAZORPAY_KEY_SECRET"\s*:/i);
});

test("SEO metadata and loading-critical assets stay optimized", async () => {
  const [layout, page, nextConfig, hero, product, social] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    stat(new URL("../public/hero-marketplace.jpg", import.meta.url)),
    stat(new URL("../public/seller-bag.jpg", import.meta.url)),
    stat(new URL("../public/og.png", import.meta.url)),
  ]);
  assert.match(layout, /max-image-preview/);
  assert.match(layout, /og\.png/);
  assert.match(page, /FAQPage/);
  assert.match(page, /hero-marketplace\.jpg/);
  assert.match(page, /fetchPriority="high"/);
  assert.match(page, /loading="lazy"/);
  assert.match(nextConfig, /configuredBasePath === "__ROOT__"/);
  assert.match(nextConfig, /trailingSlash: true/);
  assert.ok(hero.size < 175_000, `hero image is ${hero.size} bytes`);
  assert.ok(product.size < 300_000, `product image is ${product.size} bytes`);
  assert.ok(social.size < 400_000, `social image is ${social.size} bytes`);
});

test("sensitive static routes carry no-index and route-specific browser hardening", async () => {
  const [admin, download, robots] = await Promise.all([
    readFile(new URL("../out/admin/index.html", import.meta.url), "utf8"),
    readFile(new URL("../out/download/index.html", import.meta.url), "utf8"),
    readFile(new URL("../out/robots.txt", import.meta.url), "utf8"),
  ]);
  for (const html of [admin, download]) {
    assert.match(html, /http-equiv="Content-Security-Policy"/i);
    assert.match(html, /connect-src 'self'/);
    assert.doesNotMatch(html, /googletagmanager\.com/);
  }
  assert.match(admin, /noindex, nofollow, noarchive, nosnippet/);
  assert.match(download, /noindex, nofollow, noarchive/);
  assert.match(robots, /Disallow: \/admin\//);
  assert.match(robots, /Disallow: \/download\//);
});
