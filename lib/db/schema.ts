import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';

// --- Enum value arrays (app-level validation via Zod, compile-time TS checks via text({ enum })) ---

export const userRoleValues = [
  'super_admin',
  'admin_torneo',
  'arbitro',
  'capitan',
  'jugador',
] as const;

export const tournamentCategoryValues = [
  'libre',
  'sub_20',
  'sub_17',
  'femenino',
  'veteranos',
] as const;

export const tournamentFormatValues = [
  'liga',
  'copa',
  'liga_copa',
] as const;

export const tournamentStatusValues = [
  'inscripciones',
  'en_curso',
  'finalizado',
  'cancelado',
] as const;

// --- Tables ---

export const users = sqliteTable('users', {
  id: text('id')
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: userRoleValues }).notNull().default('jugador'),
  cedula: text('cedula').unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// --- Tournament tables ---

export const torneos = sqliteTable('torneos', {
  id: text('id')
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  nombre: text('nombre').notNull(),
  slug: text('slug').notNull().unique(),
  temporada: text('temporada').notNull(),
  categoria: text('categoria', { enum: tournamentCategoryValues }).notNull(),
  formato: text('formato', { enum: tournamentFormatValues }).notNull(),
  estado: text('estado', { enum: tournamentStatusValues })
    .notNull()
    .default('inscripciones'),
  fechaInicio: text('fecha_inicio').notNull(),
  fechaFin: text('fecha_fin'),
  maxEquipos: integer('max_equipos').notNull(),
  partidosIdaVuelta: integer('partidos_ida_vuelta', { mode: 'boolean' })
    .notNull()
    .default(false),
  puntosVictoria: integer('puntos_victoria').notNull().default(3),
  puntosEmpate: integer('puntos_empate').notNull().default(1),
  puntosDerrota: integer('puntos_derrota').notNull().default(0),
  criterioDesempate: text('criterio_desempate', { mode: 'json' })
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
  inscripcionPrecio: text('inscripcion_precio').notNull().default('0.00'),
  reglasDescripcion: text('reglas_descripcion'),
  cancelReason: text('cancel_reason'),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const tournamentAdminAssignments = sqliteTable(
  'tournament_admin_assignments',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    tournamentId: text('tournament_id')
      .notNull()
      .references(() => torneos.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    assignedAt: integer('assigned_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    assignedBy: text('assigned_by')
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
