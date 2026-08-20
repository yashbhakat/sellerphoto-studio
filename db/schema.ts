import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const checkoutOrders = sqliteTable("checkout_orders", {
  razorpayOrderId: text("razorpay_order_id").primaryKey(),
  clientKeyHash: text("client_key_hash").notNull(),
  receipt: text("receipt").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  productKey: text("product_key").notNull(),
  status: text("status").notNull().default("created"),
  paymentId: text("payment_id"),
  createdAt: integer("created_at").notNull(),
  capturedAt: integer("captured_at"),
}, (table) => [
  uniqueIndex("idx_checkout_orders_client_key_hash").on(table.clientKeyHash),
  uniqueIndex("idx_checkout_orders_receipt").on(table.receipt),
  uniqueIndex("idx_checkout_orders_payment_id").on(table.paymentId),
]);

export const entitlements = sqliteTable("entitlements", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => checkoutOrders.razorpayOrderId),
  paymentId: text("payment_id").notNull(),
  releaseVersion: text("release_version").notNull(),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
  maxDownloads: integer("max_downloads").notNull().default(3),
  downloadCount: integer("download_count").notNull().default(0),
  lastDownloadedAt: integer("last_downloaded_at"),
  revokedAt: integer("revoked_at"),
  revocationReason: text("revocation_reason"),
}, (table) => [
  uniqueIndex("idx_entitlements_order_id").on(table.orderId),
  uniqueIndex("idx_entitlements_payment_id").on(table.paymentId),
]);

export const checkoutAttempts = sqliteTable("checkout_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientHash: text("client_hash").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_checkout_attempts_client_created").on(table.clientHash, table.createdAt)]);

export const webhookEvents = sqliteTable("webhook_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  createdAt: integer("created_at").notNull(),
  processedAt: integer("processed_at").notNull(),
});
