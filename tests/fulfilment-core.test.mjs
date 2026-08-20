import assert from "node:assert/strict";
import test from "node:test";
import {
  constantTimeEqual,
  corsHeaders,
  createAdminSessionToken,
  createDownloadToken,
  hmacSha256,
  isAdminSessionId,
  validateIdempotencyKey,
  verifyAdminSessionToken,
  verifyDownloadToken,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "../fulfilment-worker/src/core.mjs";

test("verifies Razorpay Checkout using order_id|payment_id HMAC-SHA256", async () => {
  const input = { orderId: "order_ABCDEFGHIJKL", paymentId: "pay_123456789ABC", keySecret: "test_secret_value" };
  const signature = await hmacSha256(input.keySecret, `${input.orderId}|${input.paymentId}`);
  assert.equal(await verifyPaymentSignature({ ...input, signature }), true);
  assert.equal(await verifyPaymentSignature({ ...input, paymentId: "pay_123456789ABD", signature }), false);
  assert.equal(await verifyPaymentSignature({ ...input, signature: `${signature.slice(0, -1)}0` }), false);
});

test("validates Razorpay webhook signatures against the raw body", async () => {
  const rawBody = '{"event":"payment.captured","payload":{}}';
  const secret = "webhook_secret";
  const signature = await hmacSha256(secret, rawBody);
  assert.equal(await verifyWebhookSignature(rawBody, signature, secret), true);
  assert.equal(await verifyWebhookSignature(`${rawBody} `, signature, secret), false);
});

test("signed download passes reject tampering and expiration", async () => {
  const secret = "download_signing_secret";
  const entitlementId = "ent_0123456789abcdef0123456789abcdef";
  const expiresAt = 2_000_000_000;
  const token = await createDownloadToken(entitlementId, expiresAt, secret);
  assert.deepEqual(await verifyDownloadToken(token, secret, 1_900_000_000), { valid: true, entitlementId, expiresAt });
  assert.equal((await verifyDownloadToken(token.replace("ent_0", "ent_1"), secret, 1_900_000_000)).valid, false);
  assert.deepEqual(await verifyDownloadToken(token, secret, expiresAt), { valid: false, reason: "expired", entitlementId, expiresAt });
});

test("admin sessions are signed, scoped to the configured user, and expire", async () => {
  const username = "admin";
  const sessionId = "ads_0123456789abcdef0123456789abcdef";
  const secret = "admin_session_secret";
  const expiresAt = 2_000_000_000;
  const token = await createAdminSessionToken(username, sessionId, expiresAt, secret);
  assert.deepEqual(await verifyAdminSessionToken(token, username, secret, 1_900_000_000), { valid: true, sessionId, expiresAt });
  assert.equal((await verifyAdminSessionToken(token, "another-admin", secret, 1_900_000_000)).valid, false);
  assert.equal((await verifyAdminSessionToken(`${token}0`, username, secret, 1_900_000_000)).valid, false);
  assert.deepEqual(await verifyAdminSessionToken(token, username, secret, expiresAt), { valid: false, reason: "expired", sessionId, expiresAt });
  assert.equal(isAdminSessionId(sessionId), true);
  assert.equal(isAdminSessionId("ads_short"), false);
});

test("checkout attempt IDs and exact-origin CORS stay constrained", () => {
  assert.equal(validateIdempotencyKey("95c66c7d-25d3-430f-87fb-8b0f82d04d91"), true);
  assert.equal(validateIdempotencyKey("short"), false);
  assert.equal(validateIdempotencyKey("<script>invalid-attempt-id</script>"), false);
  assert.equal(corsHeaders("https://sellerphotostudio.in")["Access-Control-Allow-Origin"], "https://sellerphotostudio.in");
  assert.equal(Object.hasOwn(corsHeaders(null), "Access-Control-Allow-Origin"), false);
  assert.equal(constantTimeEqual("abc", "abc"), true);
  assert.equal(constantTimeEqual("abc", "abd"), false);
});
