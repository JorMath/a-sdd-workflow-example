"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateTournament } from "../../actions";
import type { schema } from "@/lib/db/client";

// === Types ===

type Tournament = typeof schema.torneos.$inferSelect;

type EditTournamentFormProps = {
  tournament: Tournament;
};

// === Constants ===

const CATEGORY_OPTIONS = [
  { value: "libre", label: "Libre" },
  { value: "sub_20", label: "Sub-20" },
  { value: "sub_17", label: "Sub-17" },
  { value: "femenino", label: "Femenino" },
  { value: "veteranos", label: "Veteranos" },
];

const FORMAT_OPTIONS = [
  { value: "liga", label: "Liga" },
  { value: "copa", label: "Copa" },
  { value: "liga_copa", label: "Liga + Copa" },
];

const TIEBREAKER_OPTIONS = [
  { value: "diferencia_goles", label: "Diferencia de goles" },
  { value: "goles_favor", label: "Goles a favor" },
  { value: "resultado_directo", label: "Resultado directo" },
  { value: "tarjetas_amarillas", label: "Tarjetas amarillas (menos)" },
  { value: "tarjetas_rojas", label: "Tarjetas rojas (menos)" },
  { value: "sorteo", label: "Sorteo" },
];

// === Component ===

export function EditTournamentForm({ tournament }: EditTournamentFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEnCurso = tournament.estado === "en_curso";

  // Map from Drizzle camelCase to Zod snake_case for form defaults
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm({
    defaultValues: {
      nombre: tournament.nombre,
      temporada: tournament.temporada,
      categoria: tournament.categoria,
      formato: tournament.formato,
      fecha_inicio: tournament.fechaInicio, // string (YYYY-MM-DD)
      fecha_fin: tournament.fechaFin ?? "", // string or empty
      max_equipos: tournament.maxEquipos,
      partidos_ida_vuelta: tournament.partidosIdaVuelta,
      puntos_victoria: tournament.puntosVictoria,
      puntos_empate: tournament.puntosEmpate,
      puntos_derrota: tournament.puntosDerrota,
      criterio_desempate: tournament.criterioDesempate ?? [],
      tarjetas_suspension: tournament.tarjetasSuspension,
      inscripcion_precio: parseFloat(tournament.inscripcionPrecio),
      reglas_descripcion: tournament.reglasDescripcion ?? "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // Convert date strings to Date objects for the server action
      const payload: Record<string, unknown> = { ...data };
      if (payload.fecha_inicio) {
        payload.fecha_inicio = new Date(payload.fecha_inicio as string);
      }
      if (payload.fecha_fin) {
        payload.fecha_fin = new Date(payload.fecha_fin as string);
      } else {
        payload.fecha_fin = null;
      }

      const result = await updateTournament(tournament.id, payload);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.setError(field as any, {
              message: messages[0],
            });
          }
        }
        setServerError(result.error ?? "Error al actualizar el torneo");
        return;
      }

      router.push(`/admin/torneos/${tournament.id}`);
    } catch {
      setServerError("Error inesperado. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/admin/torneos/${tournament.id}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Volver al torneo
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Editar Torneo
        </h1>
        <p className="text-sm text-muted-foreground">
          Modifica los datos del torneo &quot;{tournament.nombre}&quot;
        </p>
      </div>

      {/* En curso notice */}
      {isEnCurso && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Este torneo est&aacute; en curso. Solo se pueden modificar el
            nombre, la fecha de fin y las reglas.
          </p>
        </div>
      )}

      {/* Server error */}
      {serverError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informaci&oacute;n General</CardTitle>
              <CardDescription>Datos b&aacute;sicos del torneo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Torneo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="temporada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporada</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isEnCurso}
                          className={isEnCurso ? "opacity-60" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categor&iacute;a</FormLabel>
                      <FormControl>
                        <select
                          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            isEnCurso
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isEnCurso}
                        >
                          {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="formato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato</FormLabel>
                      <FormControl>
                        <select
                          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            isEnCurso
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isEnCurso}
                        >
                          {FORMAT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_equipos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>M&aacute;ximo de Equipos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={4}
                          max={32}
                          {...field}
                          disabled={isEnCurso}
                          className={isEnCurso ? "opacity-60" : ""}
                        />
                      </FormControl>
                      <FormDescription>Entre 4 y 32 equipos</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fecha_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Inicio</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          disabled={isEnCurso}
                          className={isEnCurso ? "opacity-60" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fecha_fin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Fin (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Competition rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reglas de Competencia</CardTitle>
              <CardDescription>
                Configuraci&oacute;n de puntos y reglas del torneo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="partidos_ida_vuelta"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        className={`h-4 w-4 rounded border-input ${
                          isEnCurso ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={isEnCurso}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Partidos ida y vuelta
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="puntos_victoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puntos por Victoria</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          disabled={isEnCurso}
                          className={isEnCurso ? "opacity-60" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="puntos_empate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puntos por Empate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          disabled={isEnCurso}
                          className={isEnCurso ? "opacity-60" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="puntos_derrota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puntos por Derrota</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          disabled={isEnCurso}
                          className={isEnCurso ? "opacity-60" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tarjetas_suspension"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarjetas para Suspensi&oacute;n</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        disabled={isEnCurso}
                        className={isEnCurso ? "opacity-60" : ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Cantidad de tarjetas amarillas acumuladas para
                      suspensi&oacute;n autom&aacute;tica
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="criterio_desempate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Criterios de Desempate</FormLabel>
                    <FormDescription>
                      Selecciona los criterios de desempate en orden de
                      prioridad
                    </FormDescription>
                    <div className="space-y-2">
                      {TIEBREAKER_OPTIONS.map((opt) => {
                        const current = (field.value ?? []) as string[];
                        const isChecked = current.includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-2 text-sm ${
                              isEnCurso
                                ? "opacity-60 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-input"
                              checked={isChecked}
                              disabled={isEnCurso}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...current, opt.value]);
                                } else {
                                  field.onChange(
                                    current.filter(
                                      (v: string) => v !== opt.value,
                                    ),
                                  );
                                }
                              }}
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Financial & description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Inscripci&oacute;n y Reglas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="inscripcion_precio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Inscripci&oacute;n ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...field}
                        disabled={isEnCurso}
                        className={isEnCurso ? "opacity-60" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reglas_descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Descripci&oacute;n de Reglas (opcional)
                    </FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Reglas adicionales del torneo..."
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/torneos/${tournament.id}`}>
                Cancelar
              </Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
