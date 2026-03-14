import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  pgEnum,
  integer,
  text,
  date,
  numeric,
  json,
  unique,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'admin_torneo',
  'arbitro',
  'capitan',
  'jugador',
]);

// --- Tournament enums ---

export const tournamentCategoryEnum = pgEnum('tournament_category', [
  'libre',
  'sub_20',
  'sub_17',
  'femenino',
  'veteranos',
]);

export const tournamentFormatEnum = pgEnum('tournament_format', [
  'liga',
  'copa',
  'liga_copa',
]);

export const tournamentStatusEnum = pgEnum('tournament_status', [
  'inscripciones',
  'en_curso',
  'finalizado',
  'cancelado',
]);

// --- Tables ---

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('jugador'),
  cedula: varchar('cedula', { length: 10 }).unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// --- Tournament tables ---

export const torneos = pgTable('torneos', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: varchar('nombre', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  temporada: varchar('temporada', { length: 20 }).notNull(),
  categoria: tournamentCategoryEnum('categoria').notNull(),
  formato: tournamentFormatEnum('formato').notNull(),
  estado: tournamentStatusEnum('estado').notNull().default('inscripciones'),
  fechaInicio: date('fecha_inicio', { mode: 'string' }).notNull(),
  fechaFin: date('fecha_fin', { mode: 'string' }),
  maxEquipos: integer('max_equipos').notNull(),
  partidosIdaVuelta: boolean('partidos_ida_vuelta').notNull().default(false),
  puntosVictoria: integer('puntos_victoria').notNull().default(3),
  puntosEmpate: integer('puntos_empate').notNull().default(1),
  puntosDerrota: integer('puntos_derrota').notNull().default(0),
  criterioDesempate: json('criterio_desempate')
    .notNull()
    .$type<string[]>()
    .default([
      'diferencia_goles',
      'goles_favor',
      'resultado_directo',
      'tarjetas_amarillas',
      'tarjetas_rojas',
      'sorteo',
    ]),
  tarjetasSuspension: integer('tarjetas_suspension').notNull().default(5),
  inscripcionPrecio: numeric('inscripcion_precio', {
    precision: 8,
    scale: 2,
  })
    .notNull()
    .default('0.00'),
  reglasDescripcion: text('reglas_descripcion'),
  cancelReason: text('cancel_reason'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const tournamentAdminAssignments = pgTable(
  'tournament_admin_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tournamentId: uuid('tournament_id')
      .notNull()
      .references(() => torneos.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    assignedAt: timestamp('assigned_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    assignedBy: uuid('assigned_by')
      .notNull()
      .references(() => users.id),
  },
  (table) => [unique().on(table.tournamentId, table.userId)],
);

export type Tournament = typeof torneos.$inferSelect;
export type NewTournament = typeof torneos.$inferInsert;
export type TournamentAdminAssignment =
  typeof tournamentAdminAssignments.$inferSelect;
export type NewTournamentAdminAssignment =
  typeof tournamentAdminAssignments.$inferInsert;