ALTER TABLE `bookings` ADD `payment_source` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `payment_reference` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `paid_at` integer;