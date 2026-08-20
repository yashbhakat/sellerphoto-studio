CREATE TABLE `checkout_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_checkout_attempts_client_created` ON `checkout_attempts` (`client_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `checkout_orders` (
	`razorpay_order_id` text PRIMARY KEY NOT NULL,
	`client_key_hash` text NOT NULL,
	`receipt` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`product_key` text NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`payment_id` text,
	`created_at` integer NOT NULL,
	`captured_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_checkout_orders_client_key_hash` ON `checkout_orders` (`client_key_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_checkout_orders_receipt` ON `checkout_orders` (`receipt`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_checkout_orders_payment_id` ON `checkout_orders` (`payment_id`);--> statement-breakpoint
CREATE TABLE `entitlements` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`payment_id` text NOT NULL,
	`release_version` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`max_downloads` integer DEFAULT 3 NOT NULL,
	`download_count` integer DEFAULT 0 NOT NULL,
	`last_downloaded_at` integer,
	`revoked_at` integer,
	`revocation_reason` text,
	FOREIGN KEY (`order_id`) REFERENCES `checkout_orders`(`razorpay_order_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_entitlements_order_id` ON `entitlements` (`order_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_entitlements_payment_id` ON `entitlements` (`payment_id`);--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`created_at` integer NOT NULL,
	`processed_at` integer NOT NULL
);
