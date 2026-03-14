import { z } from "zod/v3";

// === Constants ===

const TOURNAMENT_CATEGORIES = [
  "libre",
  "sub_20",
  "sub_17",
  "femenino",
  "veteranos",
] as const;

const TOURNAMENT_FORMATS = ["liga", "copa", "liga_copa"] as const;

const TOURNAMENT_STATUSES = [
  "inscripciones",
  "en_curso",
  "finalizado",
  "cancelado",
] as const;

const TIEBREAKER_CRITERIA = [
  "diferencia_goles",
  "goles_favor",
  "resultado_directo",
  "tarjetas_amarillas",
  "tarjetas_rojas",
  "sorteo",
] as const;

export type TournamentCategory = (typeof TOURNAMENT_CATEGORIES)[number];
export type TournamentFormat = (typeof TOURNAMENT_FORMATS)[number];
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];
export type TiebreakerCriterion = (typeof TIEBREAKER_CRITERIA)[number];

// === Create Tournament Schema (T2.1) ===

export const createTournamentSchema = z
  .object({
    nombre: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(150, "El nombre no puede superar 150 caracteres"),
    temporada: z
      .string()
      .min(1, "La temporada es requerida")
      .max(20, "La temporada no puede superar 20 caracteres"),
    categoria: z.enum(TOURNAMENT_CATEGORIES, {
      errorMap: () => ({ message: "Categoría inválida" }),
    }),
    formato: z.enum(TOURNAMENT_FORMATS, {
      errorMap: () => ({ message: "Formato inválido" }),
    }),
    fecha_inicio: z.coerce.date({
      errorMap: () => ({ message: "Fecha de inicio inválida" }),
    }),
    fecha_fin: z.coerce
      .date({
        errorMap: () => ({ message: "Fecha de fin inválida" }),
      })
      .optional()
      .nullable(),
    max_equipos: z.coerce
      .number({ message: "El máximo de equipos debe ser un número" })
      .int("El máximo de equipos debe ser un número entero")
      .min(4, "El mínimo de equipos es 4")
      .max(32, "El máximo de equipos es 32"),
    partidos_ida_vuelta: z.boolean().default(false),
    puntos_victoria: z.coerce
      .number({ message: "Los puntos por victoria deben ser un número" })
      .int("Los puntos por victoria deben ser un número entero")
      .min(0, "Los puntos por victoria no pueden ser negativos")
      .default(3),
    puntos_empate: z.coerce
      .number({ message: "Los puntos por empate deben ser un número" })
      .int("Los puntos por empate deben ser un número entero")
      .min(0, "Los puntos por empate no pueden ser negativos")
      .default(1),
    puntos_derrota: z.coerce
      .number({ message: "Los puntos por derrota deben ser un número" })
      .int("Los puntos por derrota deben ser un número entero")
      .min(0, "Los puntos por derrota no pueden ser negativos")
      .default(0),
    criterio_desempate: z
      .array(z.enum(TIEBREAKER_CRITERIA, {
        errorMap: () => ({ message: "Criterio de desempate inválido" }),
      }))
      .nonempty("Se requiere al menos un criterio de desempate")
      .refine(
        (arr) => new Set(arr).size === arr.length,
        "Los criterios de desempate no pueden repetirse",
      )
      .default([...TIEBREAKER_CRITERIA]),
    tarjetas_suspension: z.coerce
      .number({
        message: "Las tarjetas para suspensión deben ser un número",
      })
      .int("Las tarjetas para suspensión deben ser un número entero")
      .min(1, "Las tarjetas para suspensión deben ser al menos 1")
      .default(5),
    inscripcion_precio: z.coerce
      .number({ message: "El precio de inscripción debe ser un número" })
      .min(0, "El precio de inscripción no puede ser negativo")
      .default(0),
    reglas_descripcion: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.fecha_fin != null) {
        return data.fecha_fin > data.fecha_inicio;
      }
      return true;
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["fecha_fin"],
    },
  );

export type CreateTournamentFormValues = z.infer<typeof createTournamentSchema>;

// === State-Aware Update Schema (T2.2) ===

const updateInscripcionesSchema = z
  .object({
    nombre: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(150, "El nombre no puede superar 150 caracteres")
      .optional(),
    temporada: z
      .string()
      .min(1, "La temporada es requerida")
      .max(20, "La temporada no puede superar 20 caracteres")
      .optional(),
    categoria: z
      .enum(TOURNAMENT_CATEGORIES, {
        errorMap: () => ({ message: "Categoría inválida" }),
      })
      .optional(),
    formato: z
      .enum(TOURNAMENT_FORMATS, {
        errorMap: () => ({ message: "Formato inválido" }),
      })
      .optional(),
    fecha_inicio: z.coerce
      .date({ errorMap: () => ({ message: "Fecha de inicio inválida" }) })
      .optional(),
    fecha_fin: z.coerce
      .date({ errorMap: () => ({ message: "Fecha de fin inválida" }) })
      .optional()
      .nullable(),
    max_equipos: z.coerce
      .number({ message: "El máximo de equipos debe ser un número" })
      .int("El máximo de equipos debe ser un número entero")
      .min(4, "El mínimo de equipos es 4")
      .max(32, "El máximo de equipos es 32")
      .optional(),
    partidos_ida_vuelta: z.boolean().optional(),
    puntos_victoria: z.coerce
      .number({ message: "Los puntos por victoria deben ser un número" })
      .int("Los puntos por victoria deben ser un número entero")
      .min(0, "Los puntos por victoria no pueden ser negativos")
      .optional(),
    puntos_empate: z.coerce
      .number({ message: "Los puntos por empate deben ser un número" })
      .int("Los puntos por empate deben ser un número entero")
      .min(0, "Los puntos por empate no pueden ser negativos")
      .optional(),
    puntos_derrota: z.coerce
      .number({ message: "Los puntos por derrota deben ser un número" })
      .int("Los puntos por derrota deben ser un número entero")
      .min(0, "Los puntos por derrota no pueden ser negativos")
      .optional(),
    criterio_desempate: z
      .array(z.enum(TIEBREAKER_CRITERIA, {
        errorMap: () => ({ message: "Criterio de desempate inválido" }),
      }))
      .nonempty("Se requiere al menos un criterio de desempate")
      .refine(
        (arr) => new Set(arr).size === arr.length,
        "Los criterios de desempate no pueden repetirse",
      )
      .optional(),
    tarjetas_suspension: z.coerce
      .number({
        message: "Las tarjetas para suspensión deben ser un número",
      })
      .int("Las tarjetas para suspensión deben ser un número entero")
      .min(1, "Las tarjetas para suspensión deben ser al menos 1")
      .optional(),
    inscripcion_precio: z.coerce
      .number({ message: "El precio de inscripción debe ser un número" })
      .min(0, "El precio de inscripción no puede ser negativo")
      .optional(),
    reglas_descripcion: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.fecha_inicio != null && data.fecha_fin != null) {
        return data.fecha_fin > data.fecha_inicio;
      }
      return true;
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["fecha_fin"],
    },
  );

const updateEnCursoSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(150, "El nombre no puede superar 150 caracteres")
    .optional(),
  reglas_descripcion: z.string().optional().nullable(),
  fecha_fin: z.coerce
    .date({ errorMap: () => ({ message: "Fecha de fin inválida" }) })
    .optional()
    .nullable(),
});

export type UpdateTournamentEnCursoValues = z.infer<typeof updateEnCursoSchema>;

/**
 * Returns the appropriate update schema based on the tournament's current state.
 * - 'inscripciones': all fields editable (partial)
 * - 'en_curso': only nombre, reglas_descripcion, fecha_fin
 * - 'finalizado' / 'cancelado': throws error (no updates allowed)
 */
export function getUpdateTournamentSchema(
  currentEstado: TournamentStatus,
) {
  switch (currentEstado) {
    case "inscripciones":
      return updateInscripcionesSchema;
    case "en_curso":
      return updateEnCursoSchema;
    case "finalizado":
      throw new Error("No se puede modificar un torneo finalizado");
    case "cancelado":
      throw new Error("No se puede modificar un torneo cancelado");
    default: {
      const _exhaustive: never = currentEstado;
      throw new Error(`Estado desconocido: ${_exhaustive}`);
    }
  }
}

// === Cancel Tournament Schema ===

export const cancelTournamentSchema = z.object({
  reason: z
    .string()
    .min(1, "Se requiere un motivo para cancelar el torneo"),
});

export type CancelTournamentValues = z.infer<typeof cancelTournamentSchema>;

// === Slug Utility (T2.3) ===

/**
 * Generates a URL-friendly slug from a tournament name.
 * - Lowercase
 * - Strip diacritics (NFD normalization)
 * - Replace non-alphanumeric characters with hyphens
 * - Collapse consecutive hyphens
 * - Trim leading/trailing hyphens
 */
export function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-") // replace non-alnum with hyphens
    .replace(/-{2,}/g, "-") // collapse consecutive hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}
