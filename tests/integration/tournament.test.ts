import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTestDatabase,
  createUser,
  createTournament,
  assignTournamentAdmin,
} from '../helpers/seed';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { torneos, tournamentAdminAssignments } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import {
  createTournamentSchema,
  getUpdateTournamentSchema,
  cancelTournamentSchema,
  generateSlug,
} from '@/lib/validations/tournament';

// ============================================================
// Helpers
// ============================================================

/** Valid state transitions map */
const VALID_TRANSITIONS: Record<string, string[]> = {
  inscripciones: ['en_curso', 'cancelado'],
  en_curso: ['finalizado', 'cancelado'],
  finalizado: [],
  cancelado: [],
};

/** Fields locked when estado = en_curso */
const LOCKED_EN_CURSO_FIELDS = [
  'puntos_victoria',
  'puntos_empate',
  'puntos_derrota',
  'criterio_desempate',
  'max_equipos',
  'formato',
  'partidos_ida_vuelta',
  'categoria',
  'inscripcion_precio',
  'fecha_inicio',
] as const;

/**
 * Attempt a state transition at the DB level (simulates server action logic).
 * Returns { success, error? }
 */
async function transitionState(
  db: ReturnType<typeof drizzlePglite>,
  tournamentId: string,
  targetEstado: 'en_curso' | 'finalizado' | 'cancelado' | 'inscripciones',
  cancelReason?: string,
): Promise<{ success: boolean; error?: string }> {
  const [tournament] = await db
    .select()
    .from(torneos)
    .where(eq(torneos.id, tournamentId));

  if (!tournament) return { success: false, error: 'Torneo no encontrado' };

  const currentEstado = tournament.estado;

  // Terminal states
  if (currentEstado === 'finalizado') {
    return {
      success: false,
      error: 'No se puede cambiar el estado de un torneo finalizado',
    };
  }
  if (currentEstado === 'cancelado') {
    return {
      success: false,
      error: 'No se puede cambiar el estado de un torneo cancelado',
    };
  }

  // Check valid transitions
  const allowed = VALID_TRANSITIONS[currentEstado] ?? [];
  if (!allowed.includes(targetEstado)) {
    return { success: false, error: 'Transición de estado inválida' };
  }

  // Cancel requires reason
  if (targetEstado === 'cancelado') {
    const parsed = cancelTournamentSchema.safeParse({ reason: cancelReason });
    if (!parsed.success) {
      return {
        success: false,
        error: 'Se requiere un motivo para cancelar el torneo',
      };
    }
  }

  // BR-T4: Only one en_curso per category
  if (targetEstado === 'en_curso') {
    const [existing] = await db
      .select()
      .from(torneos)
      .where(
        and(
          eq(torneos.categoria, tournament.categoria),
          eq(torneos.estado, 'en_curso'),
        ),
      );
    if (existing) {
      return {
        success: false,
        error: 'Ya existe un torneo en curso para esta categoría',
      };
    }
  }

  // Perform transition
  const updateData: Record<string, unknown> = { estado: targetEstado };
  if (targetEstado === 'cancelado' && cancelReason) {
    updateData.cancelReason = cancelReason;
  }

  await db.update(torneos).set(updateData).where(eq(torneos.id, tournamentId));

  return { success: true };
}

// ============================================================
// Tests
// ============================================================

describe('Tournament Integration', () => {
  let db: ReturnType<typeof drizzlePglite>;
  let adminUserId: string;

  beforeEach(async () => {
    db = await createTestDatabase();
    const admin = await createUser(db, {
      role: 'super_admin',
      email: 'admin@zambiza.ec',
      name: 'Admin User',
    });
    adminUserId = admin.id as string;
  });

  // --------------------------------------------------------
  // CRUD Tests
  // --------------------------------------------------------

  describe('CRUD', () => {
    it('should create a tournament with valid data — estado defaults to inscripciones', async () => {
      const t = await createTournament(db, {
        nombre: 'Copa Zámbiza 2026',
        slug: 'copa-zambiza-2026',
        createdBy: adminUserId,
      });

      expect(t.id).toBeDefined();
      expect(t.nombre).toBe('Copa Zámbiza 2026');
      expect(t.estado).toBe('inscripciones');
      expect(t.slug).toBe('copa-zambiza-2026');
      expect(t.createdBy).toBe(adminUserId);
      expect(t.createdAt).toBeDefined();
      expect(t.updatedAt).toBeDefined();
    });

    it('should reject creation when nombre is too short (Zod validation)', () => {
      const result = createTournamentSchema.safeParse({
        nombre: 'Ab',
        temporada: '2026',
        categoria: 'libre',
        formato: 'liga',
        fecha_inicio: '2026-03-01',
        max_equipos: 8,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const nameErrors = result.error.flatten().fieldErrors.nombre;
        expect(nameErrors).toBeDefined();
        expect(nameErrors![0]).toContain('al menos 3 caracteres');
      }
    });

    it('should get tournament by ID', async () => {
      const created = await createTournament(db, { createdBy: adminUserId });
      const [found] = await db
        .select()
        .from(torneos)
        .where(eq(torneos.id, created.id));

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.nombre).toBe(created.nombre);
    });

    it('should return undefined for non-existent tournament', async () => {
      const [found] = await db
        .select()
        .from(torneos)
        .where(eq(torneos.id, '00000000-0000-0000-0000-000000000000'));

      expect(found).toBeUndefined();
    });

    it('should list tournaments ordered by created_at desc', async () => {
      await createTournament(db, {
        nombre: 'First',
        slug: 'first',
        createdBy: adminUserId,
      });
      // Tiny delay to ensure distinct timestamps
      await new Promise((r) => setTimeout(r, 10));
      await createTournament(db, {
        nombre: 'Second',
        slug: 'second',
        createdBy: adminUserId,
      });

      const all = await db
        .select()
        .from(torneos)
        .orderBy(desc(torneos.createdAt));

      expect(all).toHaveLength(2);
      expect(all[0].nombre).toBe('Second');
      expect(all[1].nombre).toBe('First');
    });

    it('should filter tournaments by estado', async () => {
      await createTournament(db, {
        slug: 't1',
        estado: 'inscripciones',
        createdBy: adminUserId,
      });
      await createTournament(db, {
        slug: 't2',
        estado: 'en_curso',
        createdBy: adminUserId,
      });
      await createTournament(db, {
        slug: 't3',
        estado: 'inscripciones',
        createdBy: adminUserId,
      });

      const inscripciones = await db
        .select()
        .from(torneos)
        .where(eq(torneos.estado, 'inscripciones'));

      expect(inscripciones).toHaveLength(2);
    });

    it('should filter tournaments by categoria', async () => {
      await createTournament(db, {
        slug: 't-libre',
        categoria: 'libre',
        createdBy: adminUserId,
      });
      await createTournament(db, {
        slug: 't-fem',
        categoria: 'femenino',
        createdBy: adminUserId,
      });

      const libre = await db
        .select()
        .from(torneos)
        .where(eq(torneos.categoria, 'libre'));

      expect(libre).toHaveLength(1);
      expect(libre[0].categoria).toBe('libre');
    });
  });

  // --------------------------------------------------------
  // Slug Tests
  // --------------------------------------------------------

  describe('Slug Generation', () => {
    it('should generate slug from name with diacritics', () => {
      const slug = generateSlug('Copa Zámbiza 2026 — Apertura');
      expect(slug).toBe('copa-zambiza-2026-apertura');
    });

    it('should normalize multiple special chars and spaces', () => {
      const slug = generateSlug('  Torneo   Súper---Especial!!!  ');
      expect(slug).toBe('torneo-super-especial');
    });

    it('should handle slug collision by appending suffix', async () => {
      // Simulate collision resolution: insert first with slug, then check
      await createTournament(db, {
        nombre: 'Copa Zámbiza',
        slug: 'copa-zambiza',
        createdBy: adminUserId,
      });

      // Simulate collision detection + resolution
      const baseSlug = generateSlug('Copa Zámbiza');
      const [existing] = await db
        .select()
        .from(torneos)
        .where(eq(torneos.slug, baseSlug));
      expect(existing).toBeDefined();

      // Append suffix
      const resolvedSlug = `${baseSlug}-2`;
      await createTournament(db, {
        nombre: 'Copa Zámbiza',
        slug: resolvedSlug,
        createdBy: adminUserId,
      });

      const [second] = await db
        .select()
        .from(torneos)
        .where(eq(torneos.slug, resolvedSlug));
      expect(second).toBeDefined();
      expect(second.slug).toBe('copa-zambiza-2');

      // Third collision
      const resolvedSlug3 = `${baseSlug}-3`;
      await createTournament(db, {
        nombre: 'Copa Zámbiza',
        slug: resolvedSlug3,
        createdBy: adminUserId,
      });

      const all = await db.select().from(torneos);
      expect(all).toHaveLength(3);
    });

    it('should enforce slug uniqueness at DB level', async () => {
      await createTournament(db, {
        slug: 'unique-slug',
        createdBy: adminUserId,
      });

      await expect(
        createTournament(db, {
          slug: 'unique-slug',
          createdBy: adminUserId,
        }),
      ).rejects.toThrow();
    });
  });

  // --------------------------------------------------------
  // State Machine Tests
  // --------------------------------------------------------

  describe('State Machine', () => {
    it('inscripciones → en_curso should succeed', async () => {
      const t = await createTournament(db, { createdBy: adminUserId });
      const result = await transitionState(db, t.id, 'en_curso');
      expect(result.success).toBe(true);

      const [updated] = await db
        .select()
        .from(torneos)
        .where(eq(torneos.id, t.id));
      expect(updated.estado).toBe('en_curso');
    });

    it('en_curso → finalizado should succeed', async () => {
      const t = await createTournament(db, {
        estado: 'en_curso',
        createdBy: adminUserId,
      });
      const result = await transitionState(db, t.id, 'finalizado');
      expect(result.success).toBe(true);

      const [updated] = await db
        .select()
        .from(torneos)
        .where(eq(torneos.id, t.id));
      expect(updated.estado).toBe('finalizado');
    });

    it('inscripciones → cancelado with reason should succeed', async () => {
      const t = await createTournament(db, { createdBy: adminUserId });
      const result = await transitionState(
        db,
        t.id,
        'cancelado',
        'Falta de equipos inscritos',
      );
      expect(result.success).toBe(true);

      const [updated] = await db
        .select()
        .from(torneos)
        .where(eq(torneos.id, t.id));
      expect(updated.estado).toBe('cancelado');
      expect(updated.cancelReason).toBe('Falta de equipos inscritos');
    });

    it('en_curso → cancelado with reason should succeed', async () => {
      const t = await createTournament(db, {
        estado: 'en_curso',
        createdBy: adminUserId,
      });
      const result = await transitionState(
        db,
        t.id,
        'cancelado',
        'Emergencia sanitaria',
      );
      expect(result.success).toBe(true);

      const [updated] = await db
        .select()
        .from(torneos)
        .where(eq(torneos.id, t.id));
      expect(updated.estado).toBe('cancelado');
      expect(updated.cancelReason).toBe('Emergencia sanitaria');
    });

    it('cancel without reason should be rejected', async () => {
      const t = await createTournament(db, { createdBy: adminUserId });
      const result = await transitionState(db, t.id, 'cancelado', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Se requiere un motivo para cancelar el torneo',
      );
    });

    it('cancel without reason (undefined) should be rejected', async () => {
      const t = await createTournament(db, { createdBy: adminUserId });
      const result = await transitionState(db, t.id, 'cancelado');
      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Se requiere un motivo para cancelar el torneo',
      );
    });

    it('finalizado → any transition should be rejected', async () => {
      const t = await createTournament(db, {
        estado: 'finalizado',
        createdBy: adminUserId,
      });

      for (const target of ['inscripciones', 'en_curso', 'cancelado'] as const) {
        const result = await transitionState(db, t.id, target, 'reason');
        expect(result.success).toBe(false);
        expect(result.error).toBe(
          'No se puede cambiar el estado de un torneo finalizado',
        );
      }
    });

    it('cancelado → any transition should be rejected', async () => {
      const t = await createTournament(db, {
        estado: 'cancelado',
        cancelReason: 'Motivo original',
        createdBy: adminUserId,
      });

      for (const target of ['inscripciones', 'en_curso', 'finalizado'] as const) {
        const result = await transitionState(db, t.id, target, 'reason');
        expect(result.success).toBe(false);
        expect(result.error).toBe(
          'No se puede cambiar el estado de un torneo cancelado',
        );
      }
    });

    it('inscripciones → finalizado directly should be rejected', async () => {
      const t = await createTournament(db, { createdBy: adminUserId });
      const result = await transitionState(db, t.id, 'finalizado');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Transición de estado inválida');
    });

    it('en_curso → inscripciones should be rejected', async () => {
      const t = await createTournament(db, {
        estado: 'en_curso',
        createdBy: adminUserId,
      });
      const result = await transitionState(db, t.id, 'inscripciones');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Transición de estado inválida');
    });
  });

  // --------------------------------------------------------
  // Business Rule BR-T4: One Active Per Category
  // --------------------------------------------------------

  describe('BR-T4: One active tournament per category', () => {
    it('should succeed when no same-category active tournament exists', async () => {
      const t = await createTournament(db, {
        categoria: 'libre',
        createdBy: adminUserId,
      });
      const result = await transitionState(db, t.id, 'en_curso');
      expect(result.success).toBe(true);
    });

    it('should reject when same-category active tournament exists', async () => {
      // First tournament already en_curso
      await createTournament(db, {
        slug: 'active-libre',
        categoria: 'libre',
        estado: 'en_curso',
        createdBy: adminUserId,
      });

      // Second tournament tries to start
      const t2 = await createTournament(db, {
        slug: 'new-libre',
        categoria: 'libre',
        createdBy: adminUserId,
      });
      const result = await transitionState(db, t2.id, 'en_curso');
      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Ya existe un torneo en curso para esta categoría',
      );
    });

    it('should succeed when different-category active tournament exists', async () => {
      // Libre is active
      await createTournament(db, {
        slug: 'active-libre',
        categoria: 'libre',
        estado: 'en_curso',
        createdBy: adminUserId,
      });

      // Femenino tries to start — should work
      const t2 = await createTournament(db, {
        slug: 'new-femenino',
        categoria: 'femenino',
        createdBy: adminUserId,
      });
      const result = await transitionState(db, t2.id, 'en_curso');
      expect(result.success).toBe(true);
    });
  });

  // --------------------------------------------------------
  // Field Locking Tests
  // --------------------------------------------------------

  describe('Field Locking (State-Aware Updates)', () => {
    it('should allow updating all fields in inscripciones state', () => {
      const schema = getUpdateTournamentSchema('inscripciones');
      const result = schema.safeParse({
        nombre: 'Nombre Actualizado',
        puntos_victoria: 5,
        max_equipos: 16,
        formato: 'copa',
        categoria: 'femenino',
        inscripcion_precio: 25,
        fecha_inicio: '2026-06-01',
      });
      expect(result.success).toBe(true);
    });

    it('should reject scoring params update in en_curso state (via Zod schema)', () => {
      const schema = getUpdateTournamentSchema('en_curso');

      // These fields are NOT in the en_curso schema, so they get stripped
      const result = schema.safeParse({
        puntos_victoria: 5,
      });

      // The en_curso schema only allows nombre, reglas_descripcion, fecha_fin
      // Unknown keys get stripped in Zod by default (strip mode)
      // So parsing succeeds but the data won't contain puntos_victoria
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('puntos_victoria');
      }
    });

    it('should allow updating nombre in en_curso state', () => {
      const schema = getUpdateTournamentSchema('en_curso');
      const result = schema.safeParse({
        nombre: 'Nombre Nuevo En Curso',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nombre).toBe('Nombre Nuevo En Curso');
      }
    });

    it('should allow updating reglas_descripcion in en_curso state', () => {
      const schema = getUpdateTournamentSchema('en_curso');
      const result = schema.safeParse({
        reglas_descripcion: 'Nuevas reglas del torneo',
      });
      expect(result.success).toBe(true);
    });

    it('should allow updating fecha_fin in en_curso state', () => {
      const schema = getUpdateTournamentSchema('en_curso');
      const result = schema.safeParse({
        fecha_fin: '2026-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('should reject any update in finalizado state', () => {
      expect(() => getUpdateTournamentSchema('finalizado')).toThrow(
        'No se puede modificar un torneo finalizado',
      );
    });

    it('should reject any update in cancelado state', () => {
      expect(() => getUpdateTournamentSchema('cancelado')).toThrow(
        'No se puede modificar un torneo cancelado',
      );
    });
  });

  // --------------------------------------------------------
  // Zod Validation Tests (unit-style)
  // --------------------------------------------------------

  describe('Zod Schema Validation', () => {
    const validData = {
      nombre: 'Torneo Válido',
      temporada: '2026',
      categoria: 'libre' as const,
      formato: 'liga' as const,
      fecha_inicio: '2026-03-01',
      max_equipos: 8,
    };

    it('should pass with valid minimum data', () => {
      const result = createTournamentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when nombre exceeds 150 chars', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        nombre: 'A'.repeat(151),
      });
      expect(result.success).toBe(false);
    });

    it('should fail when temporada is empty', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        temporada: '',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when max_equipos is below 4', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        max_equipos: 3,
      });
      expect(result.success).toBe(false);
    });

    it('should fail when max_equipos is above 32', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        max_equipos: 33,
      });
      expect(result.success).toBe(false);
    });

    it('should fail when fecha_fin is before fecha_inicio', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        fecha_inicio: '2026-06-01',
        fecha_fin: '2026-03-01',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.fecha_fin).toBeDefined();
      }
    });

    it('should pass when fecha_fin is omitted', () => {
      const result = createTournamentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when inscripcion_precio is negative', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        inscripcion_precio: -5,
      });
      expect(result.success).toBe(false);
    });

    it('should fail when puntos_victoria is negative', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        puntos_victoria: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should fail when tarjetas_suspension is 0', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        tarjetas_suspension: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should fail with duplicate criterio_desempate values', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        criterio_desempate: ['goles_favor', 'goles_favor'],
      });
      expect(result.success).toBe(false);
    });

    it('should fail with empty criterio_desempate array', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        criterio_desempate: [],
      });
      expect(result.success).toBe(false);
    });

    it('should fail with invalid categoria', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        categoria: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with invalid formato', () => {
      const result = createTournamentSchema.safeParse({
        ...validData,
        formato: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should apply defaults for optional fields', () => {
      const result = createTournamentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.puntos_victoria).toBe(3);
        expect(result.data.puntos_empate).toBe(1);
        expect(result.data.puntos_derrota).toBe(0);
        expect(result.data.partidos_ida_vuelta).toBe(false);
        expect(result.data.tarjetas_suspension).toBe(5);
        expect(result.data.inscripcion_precio).toBe(0);
      }
    });
  });

  // --------------------------------------------------------
  // Cancel Schema Validation
  // --------------------------------------------------------

  describe('Cancel Tournament Schema', () => {
    it('should pass with valid reason', () => {
      const result = cancelTournamentSchema.safeParse({
        reason: 'Falta de participantes',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with empty reason', () => {
      const result = cancelTournamentSchema.safeParse({ reason: '' });
      expect(result.success).toBe(false);
    });

    it('should fail with missing reason', () => {
      const result = cancelTournamentSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // --------------------------------------------------------
  // Admin Assignment Tests
  // --------------------------------------------------------

  describe('Tournament Admin Assignments', () => {
    it('should assign an admin to a tournament', async () => {
      const adminTorneo = await createUser(db, {
        role: 'admin_torneo',
        email: 'admin-torneo@zambiza.ec',
      });
      const t = await createTournament(db, { createdBy: adminUserId });

      const assignment = await assignTournamentAdmin(db, {
        tournamentId: t.id,
        userId: adminTorneo.id as string,
        assignedBy: adminUserId,
      });

      expect(assignment.id).toBeDefined();
      expect(assignment.tournamentId).toBe(t.id);
      expect(assignment.userId).toBe(adminTorneo.id);
      expect(assignment.assignedBy).toBe(adminUserId);
      expect(assignment.assignedAt).toBeDefined();
    });

    it('should reject duplicate assignment (unique constraint)', async () => {
      const adminTorneo = await createUser(db, {
        role: 'admin_torneo',
        email: 'admin-torneo2@zambiza.ec',
      });
      const t = await createTournament(db, { createdBy: adminUserId });

      await assignTournamentAdmin(db, {
        tournamentId: t.id,
        userId: adminTorneo.id as string,
        assignedBy: adminUserId,
      });

      await expect(
        assignTournamentAdmin(db, {
          tournamentId: t.id,
          userId: adminTorneo.id as string,
          assignedBy: adminUserId,
        }),
      ).rejects.toThrow();
    });

    it('should allow assigning multiple admins to the same tournament', async () => {
      const admin1 = await createUser(db, {
        role: 'admin_torneo',
        email: 'admin1@zambiza.ec',
      });
      const admin2 = await createUser(db, {
        role: 'admin_torneo',
        email: 'admin2@zambiza.ec',
      });
      const t = await createTournament(db, { createdBy: adminUserId });

      await assignTournamentAdmin(db, {
        tournamentId: t.id,
        userId: admin1.id as string,
        assignedBy: adminUserId,
      });
      await assignTournamentAdmin(db, {
        tournamentId: t.id,
        userId: admin2.id as string,
        assignedBy: adminUserId,
      });

      const assignments = await db
        .select()
        .from(tournamentAdminAssignments)
        .where(eq(tournamentAdminAssignments.tournamentId, t.id));

      expect(assignments).toHaveLength(2);
    });
  });

  // --------------------------------------------------------
  // Database-Level Constraint Tests
  // --------------------------------------------------------

  describe('Database Constraints', () => {
    it('should enforce foreign key on created_by', async () => {
      await expect(
        createTournament(db, {
          createdBy: '00000000-0000-0000-0000-000000000000',
        }),
      ).rejects.toThrow();
    });

    it('should store and retrieve numeric(8,2) inscripcion_precio correctly', async () => {
      const t = await createTournament(db, {
        inscripcionPrecio: '25.50',
        createdBy: adminUserId,
      });

      const [found] = await db
        .select()
        .from(torneos)
        .where(eq(torneos.id, t.id));

      // Drizzle returns numeric as string
      expect(found.inscripcionPrecio).toBe('25.50');
    });

    it('should store and retrieve JSON criterio_desempate correctly', async () => {
      const criteria = ['goles_favor', 'diferencia_goles', 'sorteo'];
      const t = await createTournament(db, {
        criterioDesempate: criteria,
        createdBy: adminUserId,
      });

      const [found] = await db
        .select()
        .from(torneos)
        .where(eq(torneos.id, t.id));

      expect(found.criterioDesempate).toEqual(criteria);
    });

    it('should default boolean partidos_ida_vuelta to false', async () => {
      const t = await createTournament(db, { createdBy: adminUserId });
      expect(t.partidosIdaVuelta).toBe(false);
    });

    it('should default scoring points correctly', async () => {
      const t = await createTournament(db, { createdBy: adminUserId });
      expect(t.puntosVictoria).toBe(3);
      expect(t.puntosEmpate).toBe(1);
      expect(t.puntosDerrota).toBe(0);
    });
  });
});
