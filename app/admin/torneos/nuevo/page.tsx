"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  createTournamentSchema,
  type CreateTournamentFormValues,
} from "@/lib/validations/tournament";
import { createTournament } from "../actions";

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

// === Page ===

export default function NuevoTorneoPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<CreateTournamentFormValues, any, any>({
    resolver: zodResolver(createTournamentSchema) as any,
    defaultValues: {
      nombre: "",
      temporada: "",
      categoria: "libre",
      formato: "liga",
      fecha_inicio: undefined,
      fecha_fin: undefined,
      max_equipos: 16,
      partidos_ida_vuelta: false,
      puntos_victoria: 3,
      puntos_empate: 1,
      puntos_derrota: 0,
      criterio_desempate: [
        "diferencia_goles",
        "goles_favor",
        "resultado_directo",
        "tarjetas_amarillas",
        "tarjetas_rojas",
        "sorteo",
      ],
      tarjetas_suspension: 5,
      inscripcion_precio: 0,
      reglas_descripcion: "",
    },
  });

  const onSubmit = async (data: CreateTournamentFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const result = await createTournament(data);

      if (!result.success) {
        // Set field-level errors from server
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof CreateTournamentFormValues, {
              message: messages[0],
            });
          }
        }
        setServerError(result.error ?? "Error al crear el torneo");
        return;
      }

      // Redirect to the new tournament's detail page
      router.push(`/admin/torneos/${result.data!.id}`);
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
          href="/admin/torneos"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Volver a torneos
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Nuevo Torneo
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea un nuevo torneo para la liga
        </p>
      </div>

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
              <CardTitle className="text-lg">Información General</CardTitle>
              <CardDescription>
                Datos básicos del torneo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Torneo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Copa Zámbiza 2026"
                        {...field}
                      />
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
                        <Input placeholder="2026" {...field} />
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
                      <FormLabel>Categoría</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={field.value}
                          onChange={field.onChange}
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
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={field.value}
                          onChange={field.onChange}
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
                      <FormLabel>Máximo de Equipos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={4}
                          max={32}
                          {...field}
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
                          value={
                            field.value instanceof Date
                              ? field.value.toISOString().split("T")[0]
                              : (field.value ?? "")
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val ? new Date(val) : undefined);
                          }}
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
                          value={
                            field.value instanceof Date
                              ? field.value.toISOString().split("T")[0]
                              : (field.value ?? "")
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(
                              val ? new Date(val) : null,
                            );
                          }}
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
                Configuración de puntos y reglas del torneo
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
                        className="h-4 w-4 rounded border-input"
                        checked={field.value}
                        onChange={field.onChange}
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
                        <Input type="number" min={0} {...field} />
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
                        <Input type="number" min={0} {...field} />
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
                        <Input type="number" min={0} {...field} />
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
                    <FormLabel>Tarjetas para Suspensión</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormDescription>
                      Cantidad de tarjetas amarillas acumuladas para suspensión
                      automática
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
                      Selecciona los criterios de desempate en orden de prioridad
                    </FormDescription>
                    <div className="space-y-2">
                      {TIEBREAKER_OPTIONS.map((opt) => {
                        const isChecked = (field.value ?? []).includes(
                          opt.value as typeof TIEBREAKER_OPTIONS[number]["value"],
                        );
                        return (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-input"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = field.value ?? [];
                                if (e.target.checked) {
                                  field.onChange([...current, opt.value]);
                                } else {
                                  field.onChange(
                                    current.filter((v: string) => v !== opt.value),
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
              <CardTitle className="text-lg">Inscripción y Reglas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="inscripcion_precio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Inscripción ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...field}
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
                    <FormLabel>Descripción de Reglas (opcional)</FormLabel>
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
              {isSubmitting ? "Creando..." : "Crear Torneo"}
            </Button>
            <Link href="/admin/torneos">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
