import { notFound } from "next/navigation";
import { getTournamentById } from "../../actions";
import { EditTournamentForm } from "./edit-form";

// === Page ===

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTorneoPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getTournamentById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const t = result.data;

  // Only inscripciones and en_curso are editable
  if (t.estado !== "inscripciones" && t.estado !== "en_curso") {
    notFound();
  }

  return <EditTournamentForm tournament={t} />;
}
