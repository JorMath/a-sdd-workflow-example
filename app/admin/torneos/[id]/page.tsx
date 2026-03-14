import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTournamentById } from "../actions";
import { TournamentActions } from "./tournament-actions";

// === Status badge (shared pattern) ===

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  inscripciones: {
    label: "Inscripciones",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  en_curso: {
    label: "En Curso",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  finalizado: {
    label: "Finalizado",
    className:
      "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  libre: "Libre",
  sub_20: "Sub-20",
  sub_17: "Sub-17",
  femenino: "Femenino",
  veteranos: "Veteranos",
};

const FORMAT_LABELS: Record<string, string> = {
  liga: "Liga",
  copa: "Copa",
  liga_copa: "Liga + Copa",
};

function StatusBadge({ estado }: { estado: string }) {
  const config = STATUS_CONFIG[estado] ?? STATUS_CONFIG.inscripciones;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// === Detail field row ===

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2.5 border-b border-border/50 last:border-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value ?? "—"}</dd>
    </div>
  );
}

// === Page ===

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TorneoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getTournamentById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const t = result.data;
  const isEditable = t.estado === "inscripciones" || t.estado === "en_curso";
  const criterios = Array.isArray(t.criterioDesempate)
    ? (t.criterioDesempate as string[])
    : [];

  const criterioLabels: Record<string, string> = {
    diferencia_goles: "Diferencia de goles",
    goles_favor: "Goles a favor",
    resultado_directo: "Resultado directo",
    tarjetas_amarillas: "Tarjetas amarillas",
    tarjetas_rojas: "Tarjetas rojas",
    sorteo: "Sorteo",
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/torneos"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Volver a torneos
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.nombre}</h1>
            <p className="text-sm text-muted-foreground">
              {t.temporada} &middot; {t.slug}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge estado={t.estado} />
            {isEditable && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/torneos/${t.id}/edit`}>
                  Editar
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel reason notice */}
      {t.estado === "cancelado" && t.cancelReason && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            Motivo de cancelación
          </p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-400">
            {t.cancelReason}
          </p>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* General info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Nombre" value={t.nombre} />
              <DetailRow
                label="Categoría"
                value={CATEGORY_LABELS[t.categoria] ?? t.categoria}
              />
              <DetailRow
                label="Formato"
                value={FORMAT_LABELS[t.formato] ?? t.formato}
              />
              <DetailRow label="Temporada" value={t.temporada} />
              <DetailRow
                label="Máx. Equipos"
                value={t.maxEquipos.toString()}
              />
              <DetailRow
                label="Ida y Vuelta"
                value={t.partidosIdaVuelta ? "Sí" : "No"}
              />
            </dl>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fechas</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Fecha Inicio" value={t.fechaInicio} />
              <DetailRow
                label="Fecha Fin"
                value={t.fechaFin ?? "No definida"}
              />
              <DetailRow
                label="Creado"
                value={
                  t.createdAt
                    ? new Date(t.createdAt).toLocaleDateString("es-EC", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"
                }
              />
              <DetailRow
                label="Última modificación"
                value={
                  t.updatedAt
                    ? new Date(t.updatedAt).toLocaleDateString("es-EC", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"
                }
              />
            </dl>
          </CardContent>
        </Card>

        {/* Scoring */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Puntuación</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow
                label="Pts. Victoria"
                value={t.puntosVictoria.toString()}
              />
              <DetailRow
                label="Pts. Empate"
                value={t.puntosEmpate.toString()}
              />
              <DetailRow
                label="Pts. Derrota"
                value={t.puntosDerrota.toString()}
              />
              <DetailRow
                label="Tarjetas Suspensión"
                value={t.tarjetasSuspension.toString()}
              />
              <DetailRow
                label="Precio Inscripción"
                value={`$${t.inscripcionPrecio}`}
              />
            </dl>
          </CardContent>
        </Card>

        {/* Tiebreaker & rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desempate y Reglas</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow
                label="Criterios de Desempate"
                value={
                  criterios.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-0.5">
                      {criterios.map((c, i) => (
                        <li key={i} className="text-sm">
                          {criterioLabels[c] ?? c}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailRow
                label="Reglas"
                value={
                  t.reglasDescripcion ? (
                    <p className="whitespace-pre-wrap text-sm">
                      {t.reglasDescripcion}
                    </p>
                  ) : (
                    "Sin reglas adicionales"
                  )
                }
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* State transition actions — client component */}
      <TournamentActions id={t.id} estado={t.estado} />
    </div>
  );
}
