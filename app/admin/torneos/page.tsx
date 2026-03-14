import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTournaments } from "./actions";

// === Status badge config ===

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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// === Filter bar (URL search params) ===

type FilterProps = {
  currentEstado?: string;
  currentCategoria?: string;
};

function FilterBar({ currentEstado, currentCategoria }: FilterProps) {
  const categories = [
    { value: "", label: "Todas las categorías" },
    { value: "libre", label: "Libre" },
    { value: "sub_20", label: "Sub-20" },
    { value: "sub_17", label: "Sub-17" },
    { value: "femenino", label: "Femenino" },
    { value: "veteranos", label: "Veteranos" },
  ];

  const statuses = [
    { value: "", label: "Todos los estados" },
    { value: "inscripciones", label: "Inscripciones" },
    { value: "en_curso", label: "En Curso" },
    { value: "finalizado", label: "Finalizado" },
    { value: "cancelado", label: "Cancelado" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category filter — uses native <a> links for RSC compatibility */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="filter-categoria"
          className="text-sm font-medium text-muted-foreground"
        >
          Categoría:
        </label>
        <div className="flex gap-1">
          {categories.map((cat) => {
            const params = new URLSearchParams();
            if (cat.value) params.set("categoria", cat.value);
            if (currentEstado) params.set("estado", currentEstado);
            const href = params.toString()
              ? `/admin/torneos?${params.toString()}`
              : "/admin/torneos";
            const isActive = (currentCategoria ?? "") === cat.value;

            return (
              <Link
                key={cat.value}
                href={href}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          Estado:
        </label>
        <div className="flex gap-1">
          {statuses.map((st) => {
            const params = new URLSearchParams();
            if (currentCategoria) params.set("categoria", currentCategoria);
            if (st.value) params.set("estado", st.value);
            const href = params.toString()
              ? `/admin/torneos?${params.toString()}`
              : "/admin/torneos";
            const isActive = (currentEstado ?? "") === st.value;

            return (
              <Link
                key={st.value}
                href={href}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {st.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// === Page ===

type PageProps = {
  searchParams: Promise<{ estado?: string; categoria?: string }>;
};

export default async function TorneosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: { estado?: string; categoria?: string } = {};
  if (params.estado) filters.estado = params.estado;
  if (params.categoria) filters.categoria = params.categoria;

  const result = await getTournaments(filters);
  const tournaments = result.success ? (result.data ?? []) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Torneos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los torneos de la liga
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/torneos/nuevo">Nuevo Torneo</Link>
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        currentEstado={params.estado}
        currentCategoria={params.categoria}
      />

      {/* Error state */}
      {!result.success && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {result.error ?? "Error al cargar los torneos"}
        </div>
      )}

      {/* Table */}
      {result.success && (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Categoría</th>
                <th className="px-4 py-3 text-left font-medium">Formato</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">
                  Fecha Inicio
                </th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No se encontraron torneos
                    {(params.estado || params.categoria) &&
                      " con los filtros seleccionados"}
                  </td>
                </tr>
              ) : (
                tournaments.map((tournament) => (
                  <tr
                    key={tournament.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/torneos/${tournament.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {tournament.nombre}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {tournament.temporada}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {CATEGORY_LABELS[tournament.categoria] ??
                        tournament.categoria}
                    </td>
                    <td className="px-4 py-3">
                      {FORMAT_LABELS[tournament.formato] ?? tournament.formato}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge estado={tournament.estado} />
                    </td>
                    <td className="px-4 py-3">{tournament.fechaInicio}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/torneos/${tournament.id}`}>
                          Ver
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
