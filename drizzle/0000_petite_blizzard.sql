CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`orderId` text NOT NULL,
	`actor` text NOT NULL,
	`status` text NOT NULL,
	`note` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `events_order` ON `events` (`orderId`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`customer` text NOT NULL,
	`phone` text NOT NULL,
	`car` text NOT NULL,
	`plate` text NOT NULL,
	`service` text NOT NULL,
	`slot` text NOT NULL,
	`bay` integer NOT NULL,
	`status` text DEFAULT 'booked' NOT NULL,
	`total` integer NOT NULL,
	`proposedTotal` integer,
	`proposalNote` text,
	`paid` integer DEFAULT 0 NOT NULL,
	`employee` text,
	`intake` text,
	`mileage` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `orders_user` ON `orders` (`userId`);--> statement-breakpoint
CREATE INDEX `orders_slot` ON `orders` (`slot`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`orderId` text NOT NULL,
	`slot` text NOT NULL,
	`bay` integer NOT NULL,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reservations_slot_bay` ON `reservations` (`slot`,`bay`);--> statement-breakpoint
CREATE INDEX `reservations_order` ON `reservations` (`orderId`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`orderId` text NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`rating` integer NOT NULL,
	`body` text NOT NULL,
	`approved` integer DEFAULT 0 NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_order` ON `reviews` (`orderId`);--> statement-breakpoint
CREATE INDEX `reviews_approved` ON `reviews` (`approved`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL
);
