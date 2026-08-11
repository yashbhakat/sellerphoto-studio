import assert from "node:assert/strict";
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
