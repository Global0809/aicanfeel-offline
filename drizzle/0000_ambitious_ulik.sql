CREATE TABLE `booking_timeline` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`status` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`public` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `timeline_booking_idx` ON `booking_timeline` (`booking_id`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`access_token_hash` text NOT NULL,
	`idempotency_hash` text NOT NULL,
	`payload_hash` text NOT NULL,
	`campaign_slug` text NOT NULL,
	`market` text NOT NULL,
	`currency` text NOT NULL,
	`brand_name` text NOT NULL,
	`contact_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`desired_date` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`addons_json` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`estimated_total_cents` integer NOT NULL,
	`approved_total_cents` integer,
	`deposit_amount_cents` integer,
	`confirmed_date` text,
	`quote_summary` text DEFAULT '' NOT NULL,
	`customer_message` text DEFAULT '' NOT NULL,
	`internal_notes` text DEFAULT '' NOT NULL,
	`quote_version` integer DEFAULT 0 NOT NULL,
	`approved_at` integer,
	`consent_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`stripe_session_id` text,
	`stripe_checkout_url` text,
	`stripe_expires_at` integer,
	`stripe_payment_intent_id` text,
	`paid_amount_cents` integer DEFAULT 0 NOT NULL,
	`payment_status` text DEFAULT 'not_requested' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_idempotency_idx` ON `bookings` (`idempotency_hash`);--> statement-breakpoint
CREATE INDEX `bookings_created_idx` ON `bookings` (`created_at`);--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE TABLE `request_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stripe_events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`booking_id` text,
	`created_at` integer NOT NULL
);
