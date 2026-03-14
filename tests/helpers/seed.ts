import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { users, torneos, tournamentAdminAssignments } from '@/lib/db/schema';
import type { NewUser, Tournament, NewTournament, TournamentAdminAssignment } from '@/lib/db/schema';
import { generateSlug } from '@/lib/validations/tournament';

export type UserRole = 'super_admin' | 'admin_torneo' | 'arbitro' | 'capitan' | 'jugador';

export interface CreateUserOptions {
  email?: string;
  name?: string;
  role?: UserRole;
  cedula?: string;
  passwordHash?: string;
  isActive?: boolean;
}

const DEFAULT_USER: CreateUserOptions = {
  email: 'test@example.com',
  name: 'Test User',
  role: 'jugador',
  isActive: true,
};

function generateUniqueEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

export async function createTestDatabase() {
  const client = new PGlite();
  const db = drizzlePglite(client);

  // --- Enums ---
  await db.execute(`CREATE TYPE "user_role" AS ENUM ('super_admin', 'admin_torneo', 'arbitro', 'capitan', 'jugador')`);
  await db.execute(`CREATE TYPE "tournament_category" AS ENUM ('libre', 'sub_20', 'sub_17', 'femenino', 'veteranos')`);
  await db.execute(`CREATE TYPE "tournament_format" AS ENUM ('liga', 'copa', 'liga_copa')`);
  await db.execute(`CREATE TYPE "tournament_status" AS ENUM ('inscripciones', 'en_curso', 'finalizado', 'cancelado')`);

  // --- Tables ---
  await db.execute(`
    CREATE TABLE "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "email" varchar(255) NOT NULL UNIQUE,
      "password_hash" varchar(255) NOT NULL,
      "name" varchar(255) NOT NULL,
      "role" "user_role" NOT NULL DEFAULT 'jugador',
      "cedula" varchar(10) UNIQUE,
      "is_active" boolean NOT NULL DEFAULT true,
      "created_at" timestamptz NOT NULL DEFAULT NOW(),
      "updated_at" timestamptz NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(`
    CREATE TABLE "torneos" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "nombre" varchar(150) NOT NULL,
      "slug" varchar(200) NOT NULL UNIQUE,
      "temporada" varchar(20) NOT NULL,
      "categoria" "tournament_category" NOT NULL,
      "formato" "tournament_format" NOT NULL,
      "estado" "tournament_status" NOT NULL DEFAULT 'inscripciones',
      "fecha_inicio" date NOT NULL,
      "fecha_fin" date,
      "max_equipos" integer NOT NULL,
      "partidos_ida_vuelta" boolean NOT NULL DEFAULT false,
      "puntos_victoria" integer NOT NULL DEFAULT 3,
      "puntos_empate" integer NOT NULL DEFAULT 1,
      "puntos_derrota" integer NOT NULL DEFAULT 0,
      "criterio_desempate" json NOT NULL DEFAULT '["diferencia_goles","goles_favor","resultado_directo","tarjetas_amarillas","tarjetas_rojas","sorteo"]',
      "tarjetas_suspension" integer NOT NULL DEFAULT 5,
      "inscripcion_precio" numeric(8, 2) NOT NULL DEFAULT '0.00',
      "reglas_descripcion" text,
      "cancel_reason" text,
      "created_by" uuid NOT NULL REFERENCES "users"("id"),
      "created_at" timestamptz NOT NULL DEFAULT NOW(),
      "updated_at" timestamptz NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(`
    CREATE TABLE "tournament_admin_assignments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "tournament_id" uuid NOT NULL REFERENCES "torneos"("id"),
      "user_id" uuid NOT NULL REFERENCES "users"("id"),
      "assigned_at" timestamptz NOT NULL DEFAULT NOW(),
      "assigned_by" uuid NOT NULL REFERENCES "users"("id"),
      UNIQUE ("tournament_id", "user_id")
    )
  `);

  return db;
}

export async function createUser(db: ReturnType<typeof drizzlePglite>, options: CreateUserOptions = {}): Promise<NewUser> {
  const userData: NewUser = {
    email: options.email ?? generateUniqueEmail(),
    name: options.name ?? DEFAULT_USER.name!,
    role: options.role ?? DEFAULT_USER.role!,
    passwordHash: options.passwordHash ?? 'hashed_password_' + Math.random().toString(36),
    cedula: options.cedula,
    isActive: options.isActive ?? DEFAULT_USER.isActive!,
  };

  const [created] = await db.insert(users).values(userData).returning();
  return created;
}

// --- Tournament factories ---

export interface CreateTournamentOptions {
  nombre?: string;
  slug?: string;
  temporada?: string;
  categoria?: 'libre' | 'sub_20' | 'sub_17' | 'femenino' | 'veteranos';
  formato?: 'liga' | 'copa' | 'liga_copa';
  estado?: 'inscripciones' | 'en_curso' | 'finalizado' | 'cancelado';
  fechaInicio?: string;
  fechaFin?: string | null;
  maxEquipos?: number;
  partidosIdaVuelta?: boolean;
  puntosVictoria?: number;
  puntosEmpate?: number;
  puntosDerrota?: number;
  criterioDesempate?: string[];
  tarjetasSuspension?: number;
  inscripcionPrecio?: string;
  reglasDescripcion?: string | null;
  cancelReason?: string | null;
  createdBy: string; // required — the user UUID
}

export async function createTournament(
  db: ReturnType<typeof drizzlePglite>,
  options: CreateTournamentOptions,
): Promise<Tournament> {
  const nombre = options.nombre ?? 'Torneo Test';
  const tournamentData: NewTournament = {
    nombre,
    slug: options.slug ?? generateSlug(nombre) + '-' + Math.random().toString(36).substring(2, 7),
    temporada: options.temporada ?? '2026',
    categoria: options.categoria ?? 'libre',
    formato: options.formato ?? 'liga',
    estado: options.estado ?? 'inscripciones',
    fechaInicio: options.fechaInicio ?? new Date().toISOString().split('T')[0],
    fechaFin: options.fechaFin ?? null,
    maxEquipos: options.maxEquipos ?? 8,
    partidosIdaVuelta: options.partidosIdaVuelta ?? false,
    puntosVictoria: options.puntosVictoria ?? 3,
    puntosEmpate: options.puntosEmpate ?? 1,
    puntosDerrota: options.puntosDerrota ?? 0,
    criterioDesempate: options.criterioDesempate ?? [
      'diferencia_goles',
      'goles_favor',
      'resultado_directo',
      'tarjetas_amarillas',
      'tarjetas_rojas',
      'sorteo',
    ],
    tarjetasSuspension: options.tarjetasSuspension ?? 5,
    inscripcionPrecio: options.inscripcionPrecio ?? '0.00',
    reglasDescripcion: options.reglasDescripcion ?? null,
    cancelReason: options.cancelReason ?? null,
    createdBy: options.createdBy,
  };

  const [created] = await db.insert(torneos).values(tournamentData).returning();
  return created;
}

export interface AssignTournamentAdminOptions {
  tournamentId: string;
  userId: string;
  assignedBy: string;
}

export async function assignTournamentAdmin(
  db: ReturnType<typeof drizzlePglite>,
  options: AssignTournamentAdminOptions,
): Promise<TournamentAdminAssignment> {
  const [created] = await db
    .insert(tournamentAdminAssignments)
    .values({
      tournamentId: options.tournamentId,
      userId: options.userId,
      assignedBy: options.assignedBy,
    })
    .returning();
  return created;
}

export async function cleanupUsers(db: ReturnType<typeof drizzlePglite>): Promise<void> {
  await db.delete(users);
}
