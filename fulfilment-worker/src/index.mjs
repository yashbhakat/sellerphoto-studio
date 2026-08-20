import {
  allowedOrigin,
  constantTimeEqual,
  corsHeaders,
  createAdminSessionToken,
  createDownloadToken,
  hmacSha256,
  integerSetting,
  isRazorpayId,
  sha256,
  validateIdempotencyKey,
  verifyAdminSessionToken,
  verifyDownloadToken,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "./core.mjs";
import { PRODUCT } from "../../config/product.mjs";

let operationalSchemaReady;

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function json(body, status = 200, origin = null, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...corsHeaders(origin), ...extra } });
}

function apiError(message, status, origin, code = "request_failed", extra = {}) {
  return json({ ok: false, error: code, message }, status, origin, extra);
}

async function readJson(request, origin) {
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    throw Object.assign(new Error("Use application/json."), { status: 415, origin });
  }
  const raw = await request.text();
  if (!raw || raw.length > 8_192) throw Object.assign(new Error("Invalid request body."), { status: 400, origin });
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error("Invalid JSON."), { status: 400, origin }); }
}

function requireBrowserOrigin(request, env) {
  const origin = allowedOrigin(request, env);
  if (!origin) throw Object.assign(new Error("This checkout request is not from the SellerPhoto Studio website."), { status: 403, origin: null });
  return origin;
}

function basicAuth(env) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) throw new Error("Razorpay credentials are not configured");
  return `Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`;
}

function productSettings(env) {
  return {
    version: env.PRODUCT_VERSION || PRODUCT.version,
    filename: env.PRODUCT_FILENAME || PRODUCT.filename,
    key: env.PRODUCT_KEY || PRODUCT.r2Key,
    amount: integerSetting(env.PRODUCT_AMOUNT, PRODUCT.amountMinor),
    currency: env.PRODUCT_CURRENCY || PRODUCT.currency,
    checksum: env.PRODUCT_SHA256 || PRODUCT.sha256,
    ttlSeconds: integerSetting(env.DOWNLOAD_TTL_SECONDS, PRODUCT.downloadTtlSeconds),
    maxDownloads: integerSetting(env.MAX_DOWNLOADS, PRODUCT.maxDownloads),
  };
}

async function ensureOperationalSchema(env) {
  if (!operationalSchemaReady) {
    operationalSchemaReady = env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_sessions (
        id text PRIMARY KEY NOT NULL,
        username text NOT NULL,
        created_at integer NOT NULL,
        expires_at integer NOT NULL,
        last_used_at integer NOT NULL,
        revoked_at integer
      )`),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_revoked ON admin_sessions (expires_at, revoked_at)"),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_checkout_attempts_created ON checkout_attempts (created_at)"),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_checkout_orders_status_created ON checkout_orders (status, created_at)"),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_entitlements_expires_revoked ON entitlements (expires_at, revoked_at)"),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_webhook_events_created_processed ON webhook_events (created_at, processed_at)"),
    ]).catch((error) => {
      operationalSchemaReady = null;
      throw error;
    });
  }
  return operationalSchemaReady;
}

function adminConfiguration(env) {
  const username = String(env.ADMIN_USERNAME || "").trim().toLowerCase();
  const password = String(env.ADMIN_PASSWORD || "");
  const sessionSecret = String(env.ADMIN_SESSION_SECRET || "");
  if (!username || !password || !sessionSecret) throw new Error("Admin access is not configured");
  return { username, password, sessionSecret };
}

async function adminOperations(env) {
  const now = Math.floor(Date.now() / 1000);
  const product = productSettings(env);
  const [orders, entitlements, webhooks, sessions, archive] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS total,
      SUM(CASE WHEN status = 'captured' THEN 1 ELSE 0 END) AS captured,
      SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) AS refunded,
      SUM(CASE WHEN status = 'created' THEN 1 ELSE 0 END) AS pending
      FROM checkout_orders`).first(),
    env.DB.prepare(`SELECT COUNT(*) AS total,
      SUM(CASE WHEN revoked_at IS NULL AND expires_at > ? THEN 1 ELSE 0 END) AS active,
      COALESCE(SUM(download_count), 0) AS downloads
      FROM entitlements`).bind(now).first(),
    env.DB.prepare(`SELECT COUNT(*) AS total,
      SUM(CASE WHEN processed_at = 0 THEN 1 ELSE 0 END) AS pending,
      MAX(processed_at) AS last_processed_at
      FROM webhook_events`).first(),
    env.DB.prepare(`SELECT COUNT(*) AS active FROM admin_sessions
      WHERE revoked_at IS NULL AND expires_at > ?`).bind(now).first(),
    env.PRODUCTS.head(product.key),
  ]);
  return {
    orders: {
      total: Number(orders?.total || 0),
      captured: Number(orders?.captured || 0),
      refunded: Number(orders?.refunded || 0),
      pending: Number(orders?.pending || 0),
    },
    entitlements: {
      total: Number(entitlements?.total || 0),
      active: Number(entitlements?.active || 0),
      downloads: Number(entitlements?.downloads || 0),
    },
    webhooks: {
      total: Number(webhooks?.total || 0),
      pending: Number(webhooks?.pending || 0),
      lastProcessedAt: Number(webhooks?.last_processed_at || 0),
    },
    activeAdminSessions: Number(sessions?.active || 0),
    archive: { available: Boolean(archive), size: Number(archive?.size || 0) },
  };
}

async function adminLogin(request, env) {
  const origin = requireBrowserOrigin(request, env);
  const body = await readJson(request, origin);
  const suppliedUsername = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const suppliedPassword = typeof body.password === "string" ? body.password : "";
  if (!suppliedUsername || suppliedUsername.length > 120 || !suppliedPassword || suppliedPassword.length > 200) {
    return apiError("Enter the admin username and password.", 400, origin, "invalid_admin_login");
  }

  const { username, password, sessionSecret } = adminConfiguration(env);
  const now = Math.floor(Date.now() / 1000);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await hmacSha256(env.DOWNLOAD_SIGNING_SECRET, `admin-ip:${ip}`);
  const recent = await env.DB.prepare("SELECT COUNT(*) AS total FROM checkout_attempts WHERE client_hash = ? AND created_at >= ?")
    .bind(ipHash, now - 900).first();
  if (Number(recent?.total || 0) >= 12) {
    return apiError("Too many admin login attempts. Wait 15 minutes and try again.", 429, origin, "admin_rate_limited", { "Retry-After": "900" });
  }
  await env.DB.prepare("INSERT INTO checkout_attempts (client_hash, created_at) VALUES (?, ?)").bind(ipHash, now).run();

  const [suppliedUsernameHash, configuredUsernameHash, suppliedPasswordHash, configuredPasswordHash] = await Promise.all([
    sha256(suppliedUsername),
    sha256(username),
    sha256(suppliedPassword),
    sha256(password),
  ]);
  if (!constantTimeEqual(suppliedUsernameHash, configuredUsernameHash) || !constantTimeEqual(suppliedPasswordHash, configuredPasswordHash)) {
    return apiError("The admin username or password is incorrect.", 401, origin, "invalid_admin_credentials");
  }

  const product = productSettings(env);
  const expiresAt = now + 28_800;
  const sessionId = `ads_${crypto.randomUUID().replaceAll("-", "")}`;
  await env.DB.prepare(`INSERT INTO admin_sessions
    (id, username, created_at, expires_at, last_used_at, revoked_at)
    VALUES (?, ?, ?, ?, ?, NULL)`).bind(sessionId, username, now, expiresAt, now).run();
  const token = await createAdminSessionToken(username, sessionId, expiresAt, sessionSecret);
  return json({
    ok: true,
    token,
    expiresAt,
    username,
    releaseVersion: product.version,
    checksum: product.checksum,
    operations: await adminOperations(env),
  }, 200, origin);
}

async function requireAdmin(request, env) {
  const origin = requireBrowserOrigin(request, env);
  const { username, sessionSecret } = adminConfiguration(env);
  const authorization = request.headers.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const checked = await verifyAdminSessionToken(token, username, sessionSecret);
  if (checked.valid) {
    const now = Math.floor(Date.now() / 1000);
    const session = await env.DB.prepare(`UPDATE admin_sessions SET last_used_at = ?
      WHERE id = ? AND username = ? AND expires_at = ? AND expires_at > ? AND revoked_at IS NULL
      RETURNING id`).bind(now, checked.sessionId, username, checked.expiresAt, now).first();
    if (!session) return { origin, username, checked: { valid: false, reason: "revoked" } };
  }
  return { origin, username, checked };
}

async function adminStatus(request, env) {
  const { origin, username, checked } = await requireAdmin(request, env);
  if (!checked.valid) {
    return apiError(checked.reason === "expired" ? "The admin session has expired." : "Admin sign-in is required.", 401, origin, checked.reason === "expired" ? "admin_session_expired" : "admin_unauthorized");
  }
  const product = productSettings(env);
  return json({
    ok: true,
    username,
    expiresAt: checked.expiresAt,
    releaseVersion: product.version,
    checksum: product.checksum,
    operations: await adminOperations(env),
  }, 200, origin);
}

async function adminLogout(request, env) {
  const { origin, checked } = await requireAdmin(request, env);
  if (!checked.valid) return new Response(null, { status: 204, headers: corsHeaders(origin) });
  await env.DB.prepare("UPDATE admin_sessions SET revoked_at = COALESCE(revoked_at, ?) WHERE id = ?")
    .bind(Math.floor(Date.now() / 1000), checked.sessionId).run();
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

async function adminDownload(request, env) {
  const { origin, checked } = await requireAdmin(request, env);
  if (!checked.valid) {
    return apiError(checked.reason === "expired" ? "The admin session has expired." : "Admin sign-in is required.", 401, origin, checked.reason === "expired" ? "admin_session_expired" : "admin_unauthorized");
  }
  const settings = productSettings(env);
  const product = await env.PRODUCTS.get(settings.key);
  if (!product) return apiError("The product archive is temporarily unavailable.", 503, origin, "product_unavailable");
  const headers = new Headers(corsHeaders(origin));
  product.writeHttpMetadata(headers);
  headers.set("Content-Type", "application/zip");
  headers.set("Content-Disposition", `attachment; filename="${settings.filename}"`);
  headers.set("Content-Length", String(product.size));
  headers.set("Cache-Control", "no-store, private");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Product-SHA256", settings.checksum);
  return new Response(product.body, { headers });
}

async function razorpayRequest(env, path, init = {}) {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: { Authorization: basicAuth(env), "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Razorpay request failed", response.status, payload?.error?.code || "unknown");
    throw Object.assign(new Error("The payment service could not start checkout. Please retry."), { status: 502 });
  }
  return payload;
}

async function createOrder(request, env) {
  const origin = requireBrowserOrigin(request, env);
  const body = await readJson(request, origin);
  if (!validateIdempotencyKey(body.idempotencyKey)) return apiError("Start checkout again.", 400, origin, "invalid_checkout_attempt");

  const keyHash = await hmacSha256(env.DOWNLOAD_SIGNING_SECRET, `checkout:${body.idempotencyKey}`);
  const existing = await env.DB.prepare("SELECT razorpay_order_id, amount, currency FROM checkout_orders WHERE client_key_hash = ?")
    .bind(keyHash).first();
  if (existing) return orderResponse(existing, env, origin);

  const now = Math.floor(Date.now() / 1000);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await hmacSha256(env.DOWNLOAD_SIGNING_SECRET, `ip:${ip}`);
  const recent = await env.DB.prepare("SELECT COUNT(*) AS total FROM checkout_attempts WHERE client_hash = ? AND created_at >= ?")
    .bind(ipHash, now - 600).first();
  if (Number(recent?.total || 0) >= 5) return apiError("Too many checkout attempts. Please wait 10 minutes.", 429, origin, "rate_limited", { "Retry-After": "600" });
  await env.DB.prepare("INSERT INTO checkout_attempts (client_hash, created_at) VALUES (?, ?)").bind(ipHash, now).run();

  const product = productSettings(env);
  const amount = product.amount;
  const currency = product.currency;
  const receipt = `sp_${(await sha256(body.idempotencyKey)).slice(0, 32)}`;
  const order = await razorpayRequest(env, "/orders", {
    method: "POST",
    body: JSON.stringify({
      amount,
      currency,
      receipt,
      partial_payment: false,
      notes: { product: "seller-photo-studio-pro", release: product.version },
    }),
  });
  if (!isRazorpayId(order.id, "order") || order.amount !== amount || order.currency !== currency) throw new Error("Unexpected Razorpay order response");

  await env.DB.prepare(`INSERT OR IGNORE INTO checkout_orders
    (razorpay_order_id, client_key_hash, receipt, amount, currency, product_key, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'created', ?)`)
    .bind(order.id, keyHash, receipt, amount, currency, product.key, now).run();
  return orderResponse(order, env, origin);
}

function orderResponse(order, env, origin) {
  return json({
    ok: true,
    keyId: env.RAZORPAY_KEY_ID,
    orderId: order.razorpay_order_id || order.id,
    amount: Number(order.amount),
    currency: order.currency,
    name: "SellerPhoto Studio",
    description: "SellerPhoto Studio Pro — Full Offline Edition",
  }, 201, origin);
}

async function ensureEntitlement(orderId, paymentId, capturedAt, env) {
  const existing = await env.DB.prepare("SELECT * FROM entitlements WHERE order_id = ?").bind(orderId).first();
  if (existing) return existing;
  const product = productSettings(env);
  const entitlementId = `ent_${crypto.randomUUID().replaceAll("-", "")}`;
  const expiresAt = Number(capturedAt) + product.ttlSeconds;
  await env.DB.prepare(`INSERT OR IGNORE INTO entitlements
    (id, order_id, payment_id, release_version, created_at, expires_at, max_downloads, download_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0)`)
    .bind(entitlementId, orderId, paymentId, product.version, Number(capturedAt), expiresAt, product.maxDownloads).run();
  return env.DB.prepare("SELECT * FROM entitlements WHERE order_id = ?").bind(orderId).first();
}

async function refreshCapturedOrder(order, env) {
  if (order.status === "captured" && isRazorpayId(order.payment_id, "pay") && Number(order.captured_at) > 0) return order;
  const payments = await razorpayRequest(env, `/orders/${encodeURIComponent(order.razorpay_order_id)}/payments`);
  const payment = Array.isArray(payments.items)
    ? payments.items.find((item) => item.status === "captured"
      && item.order_id === order.razorpay_order_id
      && Number(item.amount) === Number(order.amount)
      && item.currency === order.currency
      && isRazorpayId(item.id, "pay"))
    : null;
  if (!payment) return order;
  const capturedAt = Number(payment.captured_at || payment.created_at || Math.floor(Date.now() / 1000));
  await env.DB.prepare(`UPDATE checkout_orders SET status = 'captured', payment_id = ?, captured_at = COALESCE(captured_at, ?)
    WHERE razorpay_order_id = ?`).bind(payment.id, capturedAt, order.razorpay_order_id).run();
  return { ...order, status: "captured", payment_id: payment.id, captured_at: capturedAt };
}

async function recoverEntitlement(request, env) {
  const origin = requireBrowserOrigin(request, env);
  const body = await readJson(request, origin);
  if (!validateIdempotencyKey(body.idempotencyKey)) return apiError("No valid checkout recovery pass was found.", 400, origin, "invalid_recovery_pass");

  const now = Math.floor(Date.now() / 1000);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await hmacSha256(env.DOWNLOAD_SIGNING_SECRET, `recover-ip:${ip}`);
  const recent = await env.DB.prepare("SELECT COUNT(*) AS total FROM checkout_attempts WHERE client_hash = ? AND created_at >= ?")
    .bind(ipHash, now - 900).first();
  if (Number(recent?.total || 0) >= 8) return apiError("Too many recovery attempts. Wait 15 minutes and try again.", 429, origin, "recovery_rate_limited", { "Retry-After": "900" });
  await env.DB.prepare("INSERT INTO checkout_attempts (client_hash, created_at) VALUES (?, ?)").bind(ipHash, now).run();

  const keyHash = await hmacSha256(env.DOWNLOAD_SIGNING_SECRET, `checkout:${body.idempotencyKey}`);
  let order = await env.DB.prepare("SELECT * FROM checkout_orders WHERE client_key_hash = ?").bind(keyHash).first();
  if (!order) return apiError("No purchase was found for this browser recovery pass.", 404, origin, "recovery_not_found");
  if (order.status === "refunded") return apiError("This purchase was refunded and its download access has been revoked.", 403, origin, "payment_refunded");
  order = await refreshCapturedOrder(order, env);
  if (order.status !== "captured" || !isRazorpayId(order.payment_id, "pay")) {
    return json({ ok: false, pending: true, message: "Payment is still settling. Recovery will retry automatically." }, 202, origin);
  }
  const entitlement = await ensureEntitlement(order.razorpay_order_id, order.payment_id, Number(order.captured_at || now), env);
  if (!entitlement || entitlement.revoked_at) return apiError("This purchase is not eligible for download.", 403, origin, "entitlement_unavailable");
  if (Number(entitlement.expires_at) <= now) return apiError("This download recovery pass has expired.", 410, origin, "expired");
  const token = await createDownloadToken(entitlement.id, Number(entitlement.expires_at), env.DOWNLOAD_SIGNING_SECRET);
  return json({
    ok: true,
    token,
    expiresAt: Number(entitlement.expires_at),
    downloadsRemaining: Math.max(0, Number(entitlement.max_downloads) - Number(entitlement.download_count)),
    releaseVersion: entitlement.release_version,
  }, 200, origin);
}

async function verifyPayment(request, env) {
  const origin = requireBrowserOrigin(request, env);
  const body = await readJson(request, origin);
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
  if (!isRazorpayId(orderId, "order") || !isRazorpayId(paymentId, "pay")) return apiError("Invalid payment confirmation.", 400, origin, "invalid_payment");

  const order = await env.DB.prepare("SELECT * FROM checkout_orders WHERE razorpay_order_id = ?").bind(orderId).first();
  if (!order) return apiError("This order was not created by SellerPhoto Studio.", 404, origin, "order_not_found");
  if (!(await verifyPaymentSignature({ orderId: order.razorpay_order_id, paymentId, signature, keySecret: env.RAZORPAY_KEY_SECRET }))) {
    return apiError("Payment signature verification failed.", 403, origin, "invalid_signature");
  }

  const payment = await razorpayRequest(env, `/payments/${encodeURIComponent(paymentId)}`);
  if (payment.order_id !== orderId || Number(payment.amount) !== Number(order.amount) || payment.currency !== order.currency) {
    return apiError("Payment details do not match this product.", 409, origin, "payment_mismatch");
  }
  if (payment.status === "authorized" || payment.status === "created") {
    return json({ ok: false, pending: true, message: "Payment is confirmed and is waiting for capture." }, 202, origin);
  }
  if (payment.status !== "captured") return apiError("Payment is not captured. No download was issued.", 409, origin, "payment_not_captured");

  const now = Math.floor(Date.now() / 1000);
  const capturedAt = Number(payment.captured_at || payment.created_at || now);
  await env.DB.prepare("UPDATE checkout_orders SET status = 'captured', payment_id = ?, captured_at = COALESCE(captured_at, ?) WHERE razorpay_order_id = ?")
    .bind(paymentId, capturedAt, orderId).run();
  const entitlement = await ensureEntitlement(orderId, paymentId, capturedAt, env);
  if (!entitlement || entitlement.revoked_at) return apiError("This purchase is not eligible for download.", 403, origin, "entitlement_unavailable");
  const token = await createDownloadToken(entitlement.id, Number(entitlement.expires_at), env.DOWNLOAD_SIGNING_SECRET);
  return json({
    ok: true,
    token,
    expiresAt: Number(entitlement.expires_at),
    downloadsRemaining: Math.max(0, Number(entitlement.max_downloads) - Number(entitlement.download_count)),
    releaseVersion: entitlement.release_version,
  }, 200, origin);
}

async function entitlementStatus(request, env) {
  const origin = requireBrowserOrigin(request, env);
  const body = await readJson(request, origin);
  const checked = await verifyDownloadToken(body.token, env.DOWNLOAD_SIGNING_SECRET);
  if (!checked.valid) return apiError(checked.reason === "expired" ? "This download link has expired." : "Invalid download link.", checked.reason === "expired" ? 410 : 403, origin, checked.reason);
  const entitlement = await env.DB.prepare("SELECT * FROM entitlements WHERE id = ?").bind(checked.entitlementId).first();
  if (!entitlement || Number(entitlement.expires_at) !== checked.expiresAt || entitlement.revoked_at) return apiError("This download is no longer available.", 403, origin, "entitlement_unavailable");
  return json({
    ok: true,
    expiresAt: Number(entitlement.expires_at),
    downloadsRemaining: Math.max(0, Number(entitlement.max_downloads) - Number(entitlement.download_count)),
    releaseVersion: entitlement.release_version,
    checksum: productSettings(env).checksum,
  }, 200, origin);
}

async function downloadProduct(request, env) {
  const origin = requireBrowserOrigin(request, env);
  const authorization = request.headers.get("Authorization") || "";
  const checked = await verifyDownloadToken(authorization.startsWith("Bearer ") ? authorization.slice(7) : "", env.DOWNLOAD_SIGNING_SECRET);
  if (!checked.valid) return apiError(checked.reason === "expired" ? "This download link has expired." : "Invalid download link.", checked.reason === "expired" ? 410 : 403, origin, checked.reason);

  const settings = productSettings(env);
  const product = await env.PRODUCTS.get(settings.key);
  if (!product) return apiError("The product archive is temporarily unavailable.", 503, origin, "product_unavailable");
  const now = Math.floor(Date.now() / 1000);
  const updated = await env.DB.prepare(`UPDATE entitlements
    SET download_count = download_count + 1, last_downloaded_at = ?
    WHERE id = ? AND expires_at = ? AND expires_at > ? AND revoked_at IS NULL AND download_count < max_downloads
    RETURNING max_downloads - download_count AS remaining`)
    .bind(now, checked.entitlementId, checked.expiresAt, now).first();
  if (!updated) return apiError("The download limit has been reached or the link is unavailable.", 429, origin, "download_limit_reached");

  const headers = new Headers(corsHeaders(origin));
  product.writeHttpMetadata(headers);
  headers.set("Content-Type", "application/zip");
  headers.set("Content-Disposition", `attachment; filename="${settings.filename}"`);
  headers.set("Content-Length", String(product.size));
  headers.set("Cache-Control", "no-store, private");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Product-SHA256", settings.checksum);
  headers.set("X-Downloads-Remaining", String(updated.remaining));
  return new Response(product.body, { headers });
}

async function handleWebhook(request, env) {
  const rawBody = await request.text();
  if (!rawBody || rawBody.length > 262_144) return new Response("Invalid body", { status: 400 });
  const signature = request.headers.get("X-Razorpay-Signature") || "";
  if (!(await verifyWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET))) return new Response("Invalid signature", { status: 403 });
  const payload = JSON.parse(rawBody);
  const eventId = request.headers.get("X-Razorpay-Event-Id") || await sha256(rawBody);
  const now = Math.floor(Date.now() / 1000);
  const previous = await env.DB.prepare("SELECT processed_at FROM webhook_events WHERE id = ?").bind(eventId).first();
  if (Number(previous?.processed_at || 0) > 0) return new Response(null, { status: 204 });
  await env.DB.prepare("INSERT OR IGNORE INTO webhook_events (id, event_type, created_at, processed_at) VALUES (?, ?, ?, 0)")
    .bind(eventId, String(payload.event || "unknown"), now).run();

  const payment = payload?.payload?.payment?.entity;
  if (payload.event === "payment.captured" && payment && isRazorpayId(payment.order_id, "order") && isRazorpayId(payment.id, "pay")) {
    const capturedAt = Number(payment.captured_at || payment.created_at || now);
    const capturedOrder = await env.DB.prepare(`UPDATE checkout_orders SET status = 'captured', payment_id = ?, captured_at = COALESCE(captured_at, ?)
      WHERE razorpay_order_id = ? AND amount = ? AND currency = ?
      RETURNING razorpay_order_id`)
      .bind(payment.id, capturedAt, payment.order_id, Number(payment.amount), payment.currency).first();
    if (capturedOrder) await ensureEntitlement(payment.order_id, payment.id, capturedAt, env);
  }
  const refundedPaymentId = payment?.id || payload?.payload?.refund?.entity?.payment_id;
  if (["payment.refunded", "refund.processed"].includes(payload.event) && isRazorpayId(refundedPaymentId, "pay")) {
    await env.DB.batch([
      env.DB.prepare("UPDATE checkout_orders SET status = 'refunded' WHERE payment_id = ?").bind(refundedPaymentId),
      env.DB.prepare("UPDATE entitlements SET revoked_at = COALESCE(revoked_at, ?), revocation_reason = 'payment_refunded' WHERE payment_id = ?").bind(now, refundedPaymentId),
    ]);
  }
  await env.DB.prepare("UPDATE webhook_events SET processed_at = ? WHERE id = ?").bind(now, eventId).run();
  return new Response(null, { status: 204 });
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      await ensureOperationalSchema(env);
      if (request.method === "GET" && url.pathname === "/health") return json({ ok: true, service: "sellerphoto-fulfilment", version: productSettings(env).version });
      if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
        const origin = allowedOrigin(request, env);
        return origin ? new Response(null, { status: 204, headers: corsHeaders(origin) }) : new Response(null, { status: 403 });
      }
      if (request.method === "POST" && url.pathname === "/api/orders") return await createOrder(request, env);
      if (request.method === "POST" && url.pathname === "/api/payments/verify") return await verifyPayment(request, env);
      if (request.method === "POST" && url.pathname === "/api/entitlements/recover") return await recoverEntitlement(request, env);
      if (request.method === "POST" && url.pathname === "/api/entitlements/status") return await entitlementStatus(request, env);
      if (request.method === "POST" && url.pathname === "/api/download") return await downloadProduct(request, env);
      if (request.method === "POST" && url.pathname === "/api/admin/login") return await adminLogin(request, env);
      if (request.method === "POST" && url.pathname === "/api/admin/status") return await adminStatus(request, env);
      if (request.method === "POST" && url.pathname === "/api/admin/logout") return await adminLogout(request, env);
      if (request.method === "POST" && url.pathname === "/api/admin/download") return await adminDownload(request, env);
      if (request.method === "POST" && url.pathname === "/api/webhooks/razorpay") return await handleWebhook(request, env);
      return json({ ok: false, error: "not_found" }, 404);
    } catch (error) {
      console.error("Fulfilment request failed", error instanceof Error ? error.message : "unknown");
      return apiError(error?.status === 400 || error?.status === 415 ? error.message : "The secure delivery service could not complete the request.", error?.status || 500, error?.origin || allowedOrigin(request, env), "service_error");
    }
  },
  async scheduled(_controller, env, ctx) {
    const now = Math.floor(Date.now() / 1000);
    ctx.waitUntil((async () => {
      await ensureOperationalSchema(env);
      await env.DB.batch([
        env.DB.prepare("DELETE FROM checkout_attempts WHERE created_at < ?").bind(now - 86_400),
        env.DB.prepare("DELETE FROM webhook_events WHERE processed_at > 0 AND created_at < ?").bind(now - 7_776_000),
        env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at < ? OR (revoked_at IS NOT NULL AND revoked_at < ?)").bind(now - 86_400, now - 86_400),
      ]);
      const archive = await env.PRODUCTS.head(productSettings(env).key);
      if (!archive) console.error("Scheduled integrity check: product archive is missing");
    })());
  },
};

export default worker;
