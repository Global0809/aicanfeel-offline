CREATE TABLE `campaign_link_days` (
	`id` text PRIMARY KEY NOT NULL,
	`link_id` text NOT NULL,
	`date` text NOT NULL,
	`redirect_requests` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`link_id`) REFERENCES `campaign_links`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `campaign_link_days_link_date_idx` ON `campaign_link_days` (`link_id`,`date`);--> statement-breakpoint
CREATE TABLE `campaign_links` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`code` text NOT NULL,
	`destination` text NOT NULL,
	`label` text DEFAULT 'Campaign landing page' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`redirect_requests` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_links_booking_idx` ON `campaign_links` (`booking_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_links_code_idx` ON `campaign_links` (`code`);