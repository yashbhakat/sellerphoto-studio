CREATE TABLE IF NOT EXISTS `admin_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `username` text NOT NULL,
  `created_at` integer NOT NULL,
  `expires_at` integer NOT NULL,
  `last_used_at` integer NOT NULL,
  `revoked_at` integer
);
CREATE INDEX IF NOT EXISTS `idx_admin_sessions_expires_revoked`
ON `admin_sessions` (`expires_at`, `revoked_at`);
CREATE INDEX IF NOT EXISTS `idx_checkout_attempts_created`
ON `checkout_attempts` (`created_at`);
CREATE INDEX IF NOT EXISTS `idx_checkout_orders_status_created`
ON `checkout_orders` (`status`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_entitlements_expires_revoked`
ON `entitlements` (`expires_at`, `revoked_at`);
CREATE INDEX IF NOT EXISTS `idx_webhook_events_created_processed`
ON `webhook_events` (`created_at`, `processed_at`);
PRAGMA optimize;
