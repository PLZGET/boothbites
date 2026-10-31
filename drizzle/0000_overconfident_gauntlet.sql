CREATE TABLE `booths` (
	`id` text PRIMARY KEY NOT NULL,
	`access_hash` text NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
