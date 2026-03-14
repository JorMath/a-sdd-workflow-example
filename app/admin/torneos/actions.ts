'use server';

import { eq, and, like, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getDb, schema } from '@/lib/db/client';
import {
  canManageTorneos,
  isSuperAdmin,
  type UserRole,
} from '@/lib/auth/permissions';
import {
  createTournamentSchema,
  getUpdateTournamentSchema,
  cancelTournamentSchema,
  generateSlug,
} from '@/lib/validations/tournament';

// === T3.1 — ActionResponse type ===

type ActionResponse<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// === Helpers ===

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { error: 'No autenticado' as const, session: null };
  }
  return { error: null, session };
}

async function requireTournamentAdmin() {
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };

  const role = session!.user.role as UserRole;
  if (!canManageTorneos(role)) {
    return { error: 'No autorizado' as const, session: null };
  }
  return { error: null, session: session! };
}

/**
 * For admin_torneo users, verify they are assigned to this specific tournament.
 * super_admin bypasses this check.
 */
async function verifyTournamentAccess(
  userId: string,
  role: UserRole,
  tournamentId: string,
): Promise<boolean> {
  if (isSuperAdmin(role)) return true;

  const db = getDb();
  const assignment = await db
    .select()
    .from(schema.tournamentAdminAssignments)
    .where(
      and(
        eq(schema.tournamentAdminAssignments.tournamentId, tournamentId),
        eq(schema.tournamentAdminAssignments.userId, userId),
      ),
    )
    .limit(1);

  return assignment.length > 0;
}

/**
 * Resolve a unique slug by checking for collisions and appending -N if needed.
 */
async function resolveUniqueSlug(baseSlug: string): Promise<string> {
  const db = getDb();

  // Find all existing slugs that start with our base slug
  const existing = await db
    .select({ slug: schema.torneos.slug })
    .from(schema.torneos)
    .where(like(schema.torneos.slug, `${baseSlug}%`));

  const existingSlugs = new Set(existing.map((r) => r.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  // Find next available suffix
  let counter = 2;
  while (existingSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

// === T3.2 — createTournament ===

export async function createTournament(
  input: unknown,
): Promise<ActionResponse<typeof schema.torneos.$inferSelect>> {
  const { error: authError, session } = await requireTournamentAdmin();
  if (authError) return { success: false, error: authError };

  const parsed = createTournamentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Error de validación',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const baseSlug = generateSlug(data.nombre);
  const slug = await resolveUniqueSlug(baseSlug);

  const db = getDb();

  try {
    const [tournament] = await db
      .insert(schema.torneos)
      .values({
        nombre: data.nombre,
        slug,
        temporada: data.temporada,
        categoria: data.categoria,
        formato: data.formato,
        fechaInicio: data.fecha_inicio.toISOString().split('T')[0],
        fechaFin: data.fecha_fin
          ? data.fecha_fin.toISOString().split('T')[0]
          : null,
        maxEquipos: data.max_equipos,
        partidosIdaVuelta: data.partidos_ida_vuelta,
        puntosVictoria: data.puntos_victoria,
        puntosEmpate: data.puntos_empate,
        puntosDerrota: data.puntos_derrota,
        criterioDesempate: data.criterio_desempate as string[],
        tarjetasSuspension: data.tarjetas_suspension,
        inscripcionPrecio: data.inscripcion_precio.toString(),
        reglasDescripcion: data.reglas_descripcion ?? null,
        createdBy: session!.user.id,
      })
      .returning();

    return { success: true, data: tournament };
  } catch (err) {
    console.error('Error creating tournament:', err);
    return { success: false, error: 'Error al crear el torneo' };
  }
}

// === T3.3 — getTournaments & getTournamentById ===

export async function getTournaments(
  filters?: { estado?: string; categoria?: string },
): Promise<ActionResponse<(typeof schema.torneos.$inferSelect)[]>> {
  const { error: authError } = await requireAuth();
  if (authError) return { success: false, error: authError };

  const db = getDb();

  try {
    const conditions = [];

    if (filters?.estado) {
      conditions.push(
        eq(
          schema.torneos.estado,
          filters.estado as typeof schema.torneos.estado.enumValues[number],
        ),
      );
    }
    if (filters?.categoria) {
      conditions.push(
        eq(
          schema.torneos.categoria,
          filters.categoria as typeof schema.torneos.categoria.enumValues[number],
        ),
      );
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const tournaments = await db
      .select()
      .from(schema.torneos)
      .where(whereClause)
      .orderBy(desc(schema.torneos.createdAt));

    return { success: true, data: tournaments };
  } catch (err) {
    console.error('Error fetching tournaments:', err);
    return { success: false, error: 'Error al obtener los torneos' };
  }
}

export async function getTournamentById(
  id: string,
): Promise<ActionResponse<typeof schema.torneos.$inferSelect>> {
  const { error: authError } = await requireAuth();
  if (authError) return { success: false, error: authError };

  const db = getDb();

  try {
    const [tournament] = await db
      .select()
      .from(schema.torneos)
      .where(eq(schema.torneos.id, id))
      .limit(1);

    if (!tournament) {
      return { success: false, error: 'Torneo no encontrado' };
    }

    return { success: true, data: tournament };
  } catch (err) {
    console.error('Error fetching tournament:', err);
    return { success: false, error: 'Error al obtener el torneo' };
  }
}

// === T3.4 — updateTournament ===

export async function updateTournament(
  id: string,
  input: unknown,
): Promise<ActionResponse<typeof schema.torneos.$inferSelect>> {
  const { error: authError, session } = await requireTournamentAdmin();
  if (authError) return { success: false, error: authError };

  const role = session!.user.role as UserRole;
  const userId = session!.user.id;

  const db = getDb();

  // Fetch current tournament
  const [current] = await db
    .select()
    .from(schema.torneos)
    .where(eq(schema.torneos.id, id))
    .limit(1);

  if (!current) {
    return { success: false, error: 'Torneo no encontrado' };
  }

  // For admin_torneo: verify assignment
  if (!await verifyTournamentAccess(userId, role, id)) {
    return { success: false, error: 'No autorizado para este torneo' };
  }

  // Get state-aware schema — throws for terminal states
  let updateSchema;
  try {
    updateSchema = getUpdateTournamentSchema(current.estado);
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Error de validación',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  // Build update values — map from snake_case Zod fields to camelCase Drizzle columns
  // Slug and createdBy are NEVER updated
  const updateValues: Record<string, unknown> = {};

  if (data.nombre !== undefined) updateValues.nombre = data.nombre;
  if ('temporada' in data && data.temporada !== undefined)
    updateValues.temporada = data.temporada;
  if ('categoria' in data && data.categoria !== undefined)
    updateValues.categoria = data.categoria;
  if ('formato' in data && data.formato !== undefined)
    updateValues.formato = data.formato;
  if ('fecha_inicio' in data && data.fecha_inicio !== undefined)
    updateValues.fechaInicio = (data.fecha_inicio as Date)
      .toISOString()
      .split('T')[0];
  if ('fecha_fin' in data && data.fecha_fin !== undefined)
    updateValues.fechaFin = data.fecha_fin
      ? (data.fecha_fin as Date).toISOString().split('T')[0]
      : null;
  if ('max_equipos' in data && data.max_equipos !== undefined)
    updateValues.maxEquipos = data.max_equipos;
  if ('partidos_ida_vuelta' in data && data.partidos_ida_vuelta !== undefined)
    updateValues.partidosIdaVuelta = data.partidos_ida_vuelta;
  if ('puntos_victoria' in data && data.puntos_victoria !== undefined)
    updateValues.puntosVictoria = data.puntos_victoria;
  if ('puntos_empate' in data && data.puntos_empate !== undefined)
    updateValues.puntosEmpate = data.puntos_empate;
  if ('puntos_derrota' in data && data.puntos_derrota !== undefined)
    updateValues.puntosDerrota = data.puntos_derrota;
  if ('criterio_desempate' in data && data.criterio_desempate !== undefined)
    updateValues.criterioDesempate = data.criterio_desempate;
  if ('tarjetas_suspension' in data && data.tarjetas_suspension !== undefined)
    updateValues.tarjetasSuspension = data.tarjetas_suspension;
  if ('inscripcion_precio' in data && data.inscripcion_precio !== undefined)
    updateValues.inscripcionPrecio = (
      data.inscripcion_precio as number
    ).toString();
  if (data.reglas_descripcion !== undefined)
    updateValues.reglasDescripcion = data.reglas_descripcion;

  // Always update the timestamp
  updateValues.updatedAt = new Date();

  if (Object.keys(updateValues).length === 1) {
    // Only updatedAt — no real changes
    return { success: true, data: current };
  }

  try {
    const [updated] = await db
      .update(schema.torneos)
      .set(updateValues)
      .where(eq(schema.torneos.id, id))
      .returning();

    return { success: true, data: updated };
  } catch (err) {
    console.error('Error updating tournament:', err);
    return { success: false, error: 'Error al actualizar el torneo' };
  }
}

// === T3.5 — State transition actions ===

export async function startTournament(
  id: string,
): Promise<ActionResponse<typeof schema.torneos.$inferSelect>> {
  const { error: authError, session } = await requireTournamentAdmin();
  if (authError) return { success: false, error: authError };

  const role = session!.user.role as UserRole;

  if (!await verifyTournamentAccess(session!.user.id, role, id)) {
    return { success: false, error: 'No autorizado para este torneo' };
  }

  const db = getDb();

  try {
    // Use a transaction to enforce BR-T4 atomically
    const result = await db.transaction(async (tx) => {
      const [tournament] = await tx
        .select()
        .from(schema.torneos)
        .where(eq(schema.torneos.id, id))
        .limit(1);

      if (!tournament) {
        return { success: false as const, error: 'Torneo no encontrado' };
      }

      if (
        tournament.estado === 'finalizado' ||
        tournament.estado === 'cancelado'
      ) {
        const msg =
          tournament.estado === 'finalizado'
            ? 'No se puede cambiar el estado de un torneo finalizado'
            : 'No se puede cambiar el estado de un torneo cancelado';
        return { success: false as const, error: msg };
      }

      if (tournament.estado !== 'inscripciones') {
        return {
          success: false as const,
          error: 'Transición de estado inválida',
        };
      }

      // BR-T4: Check no other en_curso tournament in same category
      const [conflict] = await tx
        .select({ id: schema.torneos.id })
        .from(schema.torneos)
        .where(
          and(
            eq(schema.torneos.categoria, tournament.categoria),
            eq(schema.torneos.estado, 'en_curso'),
          ),
        )
        .limit(1);

      if (conflict) {
        return {
          success: false as const,
          error: 'Ya existe un torneo en curso para esta categoría',
        };
      }

      const [updated] = await tx
        .update(schema.torneos)
        .set({ estado: 'en_curso', updatedAt: new Date() })
        .where(eq(schema.torneos.id, id))
        .returning();

      return { success: true as const, data: updated };
    });

    return result;
  } catch (err) {
    console.error('Error starting tournament:', err);
    return { success: false, error: 'Error al iniciar el torneo' };
  }
}

export async function finalizeTournament(
  id: string,
): Promise<ActionResponse<typeof schema.torneos.$inferSelect>> {
  const { error: authError, session } = await requireTournamentAdmin();
  if (authError) return { success: false, error: authError };

  const role = session!.user.role as UserRole;

  if (!await verifyTournamentAccess(session!.user.id, role, id)) {
    return { success: false, error: 'No autorizado para este torneo' };
  }

  const db = getDb();

  try {
    const [tournament] = await db
      .select()
      .from(schema.torneos)
      .where(eq(schema.torneos.id, id))
      .limit(1);

    if (!tournament) {
      return { success: false, error: 'Torneo no encontrado' };
    }

    if (
      tournament.estado === 'finalizado' ||
      tournament.estado === 'cancelado'
    ) {
      const msg =
        tournament.estado === 'finalizado'
          ? 'No se puede cambiar el estado de un torneo finalizado'
          : 'No se puede cambiar el estado de un torneo cancelado';
      return { success: false, error: msg };
    }

    if (tournament.estado !== 'en_curso') {
      return { success: false, error: 'Transición de estado inválida' };
    }

    const [updated] = await db
      .update(schema.torneos)
      .set({ estado: 'finalizado', updatedAt: new Date() })
      .where(eq(schema.torneos.id, id))
      .returning();

    return { success: true, data: updated };
  } catch (err) {
    console.error('Error finalizing tournament:', err);
    return { success: false, error: 'Error al finalizar el torneo' };
  }
}

export async function cancelTournament(
  id: string,
  reason: string,
): Promise<ActionResponse<typeof schema.torneos.$inferSelect>> {
  const { error: authError, session } = await requireTournamentAdmin();
  if (authError) return { success: false, error: authError };

  const role = session!.user.role as UserRole;

  if (!await verifyTournamentAccess(session!.user.id, role, id)) {
    return { success: false, error: 'No autorizado para este torneo' };
  }

  // Validate reason
  const parsed = cancelTournamentSchema.safeParse({ reason });
  if (!parsed.success) {
    return {
      success: false,
      error: 'Se requiere un motivo para cancelar el torneo',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const db = getDb();

  try {
    const [tournament] = await db
      .select()
      .from(schema.torneos)
      .where(eq(schema.torneos.id, id))
      .limit(1);

    if (!tournament) {
      return { success: false, error: 'Torneo no encontrado' };
    }

    if (tournament.estado === 'finalizado') {
      return {
        success: false,
        error: 'No se puede cambiar el estado de un torneo finalizado',
      };
    }

    if (tournament.estado === 'cancelado') {
      return {
        success: false,
        error: 'No se puede cambiar el estado de un torneo cancelado',
      };
    }

    if (
      tournament.estado !== 'inscripciones' &&
      tournament.estado !== 'en_curso'
    ) {
      return { success: false, error: 'Transición de estado inválida' };
    }

    const [updated] = await db
      .update(schema.torneos)
      .set({
        estado: 'cancelado',
        cancelReason: parsed.data.reason,
        updatedAt: new Date(),
      })
      .where(eq(schema.torneos.id, id))
      .returning();

    return { success: true, data: updated };
  } catch (err) {
    console.error('Error canceling tournament:', err);
    return { success: false, error: 'Error al cancelar el torneo' };
  }
}

// === T3.6 — assignTournamentAdmin ===

export async function assignTournamentAdmin(
  tournamentId: string,
  userId: string,
): Promise<ActionResponse<typeof schema.tournamentAdminAssignments.$inferSelect>> {
  const { error: authError, session } = await requireAuth();
  if (authError) return { success: false, error: authError };

  const role = session!.user.role as UserRole;

  // Only super_admin can assign tournament admins
  if (!isSuperAdmin(role)) {
    return { success: false, error: 'No autorizado' };
  }

  const db = getDb();

  try {
    const [assignment] = await db
      .insert(schema.tournamentAdminAssignments)
      .values({
        tournamentId,
        userId,
        assignedBy: session!.user.id,
      })
      .returning();

    return { success: true, data: assignment };
  } catch (err) {
    // Handle unique constraint violation (duplicate assignment)
    const error = err as Error;
    if (
      error.message?.includes('unique') ||
      error.message?.includes('duplicate') ||
      error.message?.includes('UNIQUE')
    ) {
      return {
        success: false,
        error: 'Este usuario ya está asignado a este torneo',
      };
    }
    console.error('Error assigning tournament admin:', err);
    return { success: false, error: 'Error al asignar administrador' };
  }
}
