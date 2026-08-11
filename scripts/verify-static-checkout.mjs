import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const READY_NOTE = "Secure Razorpay checkout opens in a new tab.";
const DISABLED_NOTE = "Secure checkout will open after store activation.";

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function escapeHtmlAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function validateCheckoutUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    assert.fail("NEXT_PUBLIC_CHECKOUT_URL must be an absolute URL");
  }

  assert.equal(url.protocol, "https:", "checkout must use HTTPS");
  assert.ok(!["localhost", "127.0.0.1"].includes(url.hostname), "checkout cannot use a local hostname");
  assert.ok(!value.includes("your-payment-page"), "checkout cannot use the example placeholder");
  return url;
}

export function verifyCheckoutHtml(html, configuredCheckoutUrl = "") {
  const checkoutUrl = configuredCheckoutUrl.trim();
  assert.match(html, /SellerPhoto Studio/, "static output is not the SellerPhoto Studio storefront");

  if (!checkoutUrl) {
    assert.ok(count(html, 'href="#launch-offer"') >= 2, "disabled checkout links must stay on the launch section");
    assert.ok(html.includes(DISABLED_NOTE), "disabled checkout note is missing");
    assert.ok(!html.includes(READY_NOTE), "enabled checkout note must not appear without a URL");
    return { mode: "disabled", checkoutUrl: null };
  }

  validateCheckoutUrl(checkoutUrl);
  const checkoutHref = `href="${escapeHtmlAttribute(checkoutUrl)}"`;
  assert.ok(count(html, checkoutHref) >= 2, "both purchase buttons must use the configured checkout URL");
  assert.ok(count(html, 'target="_blank"') >= 2, "enabled checkout links must open in a new tab");
  assert.ok(count(html, 'rel="noopener noreferrer"') >= 2, "enabled checkout links must isolate the new tab");
  assert.ok(html.includes(READY_NOTE), "enabled checkout note is missing");
  assert.ok(!html.includes(DISABLED_NOTE), "disabled checkout note must not appear with a URL");
  return { mode: "enabled", checkoutUrl };
}

export async function verifyStaticCheckout({
  htmlPath = "out/index.html",
  checkoutUrl = process.env.NEXT_PUBLIC_CHECKOUT_URL ?? "",
} = {}) {
  const html = await readFile(htmlPath, "utf8");
  return verifyCheckoutHtml(html, checkoutUrl);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await verifyStaticCheckout({ htmlPath: process.argv[2] ?? "out/index.html" });
  console.log(
    result.mode === "enabled"
      ? `Verified enabled checkout: ${result.checkoutUrl}`
      : "Verified safely disabled checkout (no checkout URL configured).",
  );
}
