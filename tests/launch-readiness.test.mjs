import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { verifyReleaseArchive } from "../scripts/verify-release.mjs";
import { verifyCheckoutHtml } from "../scripts/verify-static-checkout.mjs";

const shell = (links, note) => `<html><body><h1>SellerPhoto Studio</h1>${links}${note}</body></html>`;

test("release ZIP exactly matches the reviewed offline product", async () => {
  const result = await verifyReleaseArchive();
  assert.deepEqual(result.files, ["README.txt", "index.html", "studio.css", "studio.js"]);
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
});

test("privacy disclosure covers local processing, analytics location scope, and checkout", async () => {
  const [privacy, workflow] = await Promise.all([
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
  ]);
  assert.match(privacy, /does not upload those files/);
  assert.match(privacy, /approximate country or/);
  assert.match(privacy, /does not receive precise GPS location/);
  assert.match(privacy, /Razorpay-hosted payment page/);
  assert.match(workflow, /vars\.NEXT_PUBLIC_BASE_PATH \|\| '\/sellerphoto-studio'/);
  assert.match(workflow, /vars\.NEXT_PUBLIC_SITE_URL \|\| 'https:\/\/yashbhakat\.github\.io\/sellerphoto-studio'/);
});

test("SEO metadata and loading-critical assets stay optimized", async () => {
  const [layout, page, nextConfig, hero, product, social] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    stat(new URL("../public/hero-marketplace.jpg", import.meta.url)),
    stat(new URL("../public/seller-bag.jpg", import.meta.url)),
    stat(new URL("../public/og.jpg", import.meta.url)),
  ]);
  assert.match(layout, /max-image-preview/);
  assert.match(layout, /og\.jpg/);
  assert.match(page, /FAQPage/);
  assert.match(page, /hero-marketplace\.jpg/);
  assert.match(page, /fetchPriority="high"/);
  assert.match(page, /loading="lazy"/);
  assert.match(nextConfig, /configuredBasePath === "__ROOT__"/);
  assert.match(nextConfig, /trailingSlash: true/);
  assert.ok(hero.size < 175_000, `hero image is ${hero.size} bytes`);
  assert.ok(product.size < 300_000, `product image is ${product.size} bytes`);
  assert.ok(social.size < 250_000, `social image is ${social.size} bytes`);
});
