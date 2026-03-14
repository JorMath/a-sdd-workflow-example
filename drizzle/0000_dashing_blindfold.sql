CREATE TABLE `torneos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`slug` text NOT NULL,
	`temporada` text NOT NULL,
	`categoria` text NOT NULL,
	`formato` text NOT NULL,
	`estado` text DEFAULT 'inscripciones' NOT NULL,
	`fecha_inicio` text NOT NULL,
	`fecha_fin` text,
	`max_equipos` integer NOT NULL,
	`partidos_ida_vuelta` integer DEFAULT false NOT NULL,
	`puntos_victoria` integer DEFAULT 3 NOT NULL,
	`puntos_empate` integer DEFAULT 1 NOT NULL,
	`puntos_derrota` integer DEFAULT 0 NOT NULL,
	`criterio_desempate` text DEFAULT '["diferencia_goles","goles_favor","resultado_directo","tarjetas_amarillas","tarjetas_rojas","sorteo"]' NOT NULL,
	`tarjetas_suspension` integer DEFAULT 5 NOT NULL,
	`inscripcion_precio` text DEFAULT '0.00' NOT NULL,
	`reglas_descripcion` text,
	`cancel_reason` text,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `torneos_slug_unique` ON `torneos` (`slug`);--> statement-breakpoint
CREATE TABLE `tournament_admin_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`tournament_id` text NOT NULL,
	`user_id` text NOT NULL,
	`assigned_at` integer NOT NULL,
	`assigned_by` text NOT NULL,
	FOREIGN KEY (`tournament_id`) REFERENCES `torneos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tournament_admin_assignments_tournament_id_user_id_unique` ON `tournament_admin_assignments` (`tournament_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'jugador' NOT NULL,
	`cedula` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_cedula_unique` ON `users` (`cedula`);