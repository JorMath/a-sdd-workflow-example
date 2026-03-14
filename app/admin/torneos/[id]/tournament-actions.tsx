"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  startTournament,
  finalizeTournament,
  cancelTournament,
} from "../actions";

// === Types ===

type TournamentActionsProps = {
  id: string;
  estado: string;
};

// === Component ===

export function TournamentActions({ id, estado }: TournamentActionsProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // No actions for terminal states
  if (estado === "finalizado" || estado === "cancelado") {
    return null;
  }

  const handleStart = async () => {
    setError(null);
    setIsStarting(true);

    try {
      const result = await startTournament(id);
      if (!result.success) {
        setError(result.error ?? "Error al iniciar el torneo");
        return;
      }
      router.refresh();
    } catch {
      setError("Error inesperado al iniciar el torneo");
    } finally {
      setIsStarting(false);
    }
  };

  const handleFinalize = async () => {
    setError(null);
    setIsFinalizing(true);

    try {
      const result = await finalizeTournament(id);
      if (!result.success) {
        setError(result.error ?? "Error al finalizar el torneo");
        return;
      }
      router.refresh();
    } catch {
      setError("Error inesperado al finalizar el torneo");
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleCancel = async () => {
    setCancelReasonError(null);
    setError(null);

    if (!cancelReason.trim()) {
      setCancelReasonError(
        "Se requiere un motivo para cancelar el torneo",
      );
      return;
    }

    setIsCancelling(true);

    try {
      const result = await cancelTournament(id, cancelReason.trim());
      if (!result.success) {
        setError(result.error ?? "Error al cancelar el torneo");
        return;
      }
      router.refresh();
    } catch {
      setError("Error inesperado al cancelar el torneo");
    } finally {
      setIsCancelling(false);
    }
  };

  const isLoading = isStarting || isFinalizing || isCancelling;

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Action buttons */}
      {!showCancelForm && (
        <div className="flex items-center gap-3">
          {estado === "inscripciones" && (
            <Button
              onClick={handleStart}
              disabled={isLoading}
            >
              {isStarting ? "Iniciando..." : "Iniciar Torneo"}
            </Button>
          )}

          {estado === "en_curso" && (
            <Button
              onClick={handleFinalize}
              disabled={isLoading}
            >
              {isFinalizing ? "Finalizando..." : "Finalizar Torneo"}
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={() => setShowCancelForm(true)}
            disabled={isLoading}
          >
            Cancelar Torneo
          </Button>
        </div>
      )}

      {/* Cancel confirmation form */}
      {showCancelForm && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">
              Cancelar Torneo
            </CardTitle>
            <CardDescription>
              Esta acción es irreversible. Ingresa el motivo de cancelación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="cancel-reason"
                className="text-sm font-medium leading-none"
              >
                Motivo de cancelación
              </label>
              <textarea
                id="cancel-reason"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Explica por qué se cancela el torneo..."
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (e.target.value.trim()) {
                    setCancelReasonError(null);
                  }
                }}
                disabled={isCancelling}
              />
              {cancelReasonError && (
                <p className="text-sm font-medium text-destructive">
                  {cancelReasonError}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling
                  ? "Cancelando..."
                  : "Confirmar Cancelación"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelForm(false);
                  setCancelReason("");
                  setCancelReasonError(null);
                }}
                disabled={isCancelling}
              >
                No, volver
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
