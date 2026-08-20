const encoder = new TextEncoder();

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hmacSha256(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToHex(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

export async function sha256(message) {
  return bytesToHex(await crypto.subtle.digest("SHA-256", encoder.encode(message)));
}

export function constantTimeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string" || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyPaymentSignature({ orderId, paymentId, signature, keySecret }) {
  if (!isRazorpayId(orderId, "order") || !isRazorpayId(paymentId, "pay") || !/^[a-f0-9]{64}$/i.test(signature || "")) {
    return false;
  }
  const expected = await hmacSha256(keySecret, `${orderId}|${paymentId}`);
  return constantTimeEqual(expected, signature.toLowerCase());
}

export async function verifyWebhookSignature(rawBody, signature, webhookSecret) {
  if (!/^[a-f0-9]{64}$/i.test(signature || "")) return false;
  const expected = await hmacSha256(webhookSecret, rawBody);
  return constantTimeEqual(expected, signature.toLowerCase());
}

export async function createDownloadToken(entitlementId, expiresAt, signingSecret) {
  if (!isEntitlementId(entitlementId) || !Number.isSafeInteger(expiresAt)) throw new Error("Invalid entitlement token input");
  const signature = await hmacSha256(signingSecret, `${entitlementId}.${expiresAt}`);
  return `${entitlementId}.${expiresAt}.${signature}`;
}

export async function verifyDownloadToken(token, signingSecret, now = Math.floor(Date.now() / 1000)) {
  if (typeof token !== "string" || token.length > 220) return { valid: false, reason: "invalid" };
  const [entitlementId, expiresText, signature, extra] = token.split(".");
  const expiresAt = Number(expiresText);
  if (extra !== undefined || !isEntitlementId(entitlementId) || !Number.isSafeInteger(expiresAt) || !/^[a-f0-9]{64}$/i.test(signature || "")) {
    return { valid: false, reason: "invalid" };
  }
  const expected = await hmacSha256(signingSecret, `${entitlementId}.${expiresAt}`);
  if (!constantTimeEqual(expected, signature.toLowerCase())) return { valid: false, reason: "invalid" };
  if (expiresAt <= now) return { valid: false, reason: "expired", entitlementId, expiresAt };
  return { valid: true, entitlementId, expiresAt };
}

export async function createAdminSessionToken(username, sessionId, expiresAt, sessionSecret) {
  if (typeof username !== "string" || !username || username.length > 120 || !isAdminSessionId(sessionId) || !Number.isSafeInteger(expiresAt)) {
    throw new Error("Invalid admin session input");
  }
  const signature = await hmacSha256(sessionSecret, `admin.${username}.${sessionId}.${expiresAt}`);
  return `adm.${sessionId}.${expiresAt}.${signature}`;
}

export async function verifyAdminSessionToken(token, username, sessionSecret, now = Math.floor(Date.now() / 1000)) {
  if (typeof token !== "string" || token.length > 180 || typeof username !== "string" || !username || !sessionSecret) {
    return { valid: false, reason: "invalid" };
  }
  const [prefix, sessionId, expiresText, signature, extra] = token.split(".");
  const expiresAt = Number(expiresText);
  if (prefix !== "adm" || extra !== undefined || !isAdminSessionId(sessionId) || !Number.isSafeInteger(expiresAt) || !/^[a-f0-9]{64}$/i.test(signature || "")) {
    return { valid: false, reason: "invalid" };
  }
  const expected = await hmacSha256(sessionSecret, `admin.${username}.${sessionId}.${expiresAt}`);
  if (!constantTimeEqual(expected, signature.toLowerCase())) return { valid: false, reason: "invalid" };
  if (expiresAt <= now) return { valid: false, reason: "expired", sessionId, expiresAt };
  return { valid: true, sessionId, expiresAt };
}

export function isAdminSessionId(value) {
  return typeof value === "string" && /^ads_[a-f0-9]{32}$/.test(value);
}

export function isRazorpayId(value, prefix) {
  return typeof value === "string" && new RegExp(`^${prefix}_[A-Za-z0-9]{8,40}$`).test(value);
}

export function isEntitlementId(value) {
  return typeof value === "string" && /^ent_[a-f0-9]{32}$/.test(value);
}

export function validateIdempotencyKey(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,80}$/.test(value);
}

export function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const allowed = [env.ALLOWED_ORIGIN, env.DEV_ORIGIN].filter(Boolean);
  return allowed.includes(origin) ? origin : null;
}

export function corsHeaders(origin) {
  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Expose-Headers": "Content-Disposition, X-Downloads-Remaining, X-Product-SHA256",
        Vary: "Origin",
      }
    : {};
}

export function integerSetting(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
