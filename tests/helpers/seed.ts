import { users, torneos, tournamentAdminAssignments } from '@/lib/db/schema';
import type { User, NewUser, Tournament, NewTournament, TournamentAdminAssignment } from '@/lib/db/schema';
import { generateSlug } from '@/lib/validations/tournament';
import { setupTestDb, type TestDb } from './db';

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

/**
 * Creates a fresh in-memory test database with all tables.
 * Delegates to setupTestDb() — no raw DDL duplication.
 */
export async function createTestDatabase(): Promise<TestDb> {
  return setupTestDb();
}

export async function createUser(db: TestDb, options: CreateUserOptions = {}): Promise<User> {
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
  db: TestDb,
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
  db: TestDb,
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

export async function cleanupUsers(db: TestDb): Promise<void> {
  await db.delete(users);
}
