import { useState } from "react"
import {
  AlertTriangle,
  CalendarClock,
  Loader2,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EstadoCitaBadge } from "@/components/mis-horas/EstadoCitaBadge"
import { formatDuracion } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Cita } from "@/types/reserva"

interface CitaGestionCardProps {
  cita: Cita
  cancelando: boolean
  onCancelar: (citaId: number) => void
}

const formateadorFecha = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
})

/**
 * Ficha de una cita gestionable sin sesión. Cancelar es una acción
 * destructiva desde la perspectiva del paciente (queda su hora liberada
 * para otra persona), así que pide confirmación explícita dentro de la
 * misma ficha en vez de disparar la cancelación al primer clic.
 */
export function CitaGestionCard({
  cita,
  cancelando,
  onCancelar,
}: CitaGestionCardProps) {
  const [confirmando, setConfirmando] = useState(false)
  const puedeCancelar = cita.estado === "reservada" || cita.estado === "confirmada"
  const fechaLegible = formateadorFecha.format(new Date(cita.fecha_hora))

  return (
    <div
      className={cn(
        "rounded-3xl bg-card p-5 ring-1 ring-border/70 transition-all",
        cita.estado === "cancelada" && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            {cita.treatment?.nombre ?? "Tratamiento"}
          </p>
          <p className="mt-1 font-heading text-lg font-medium capitalize text-balance">
            {fechaLegible}
          </p>
        </div>
        <EstadoCitaBadge estado={cita.estado} />
      </div>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
        {cita.professional && (
          <div className="flex items-center gap-2">
            <UserRound className="size-4 shrink-0" />
            <span>
              {cita.professional.nombre} {cita.professional.apellido ?? ""}
              {cita.professional.especialidad
                ? ` · ${cita.professional.especialidad}`
                : ""}
            </span>
          </div>
        )}
        {cita.treatment && (
          <div className="flex items-center gap-2">
            <Stethoscope className="size-4 shrink-0" />
            <span>{formatDuracion(cita.treatment.duracion_minutos)}</span>
          </div>
        )}
        {cita.notas && (
          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 shrink-0" />
            <span>{cita.notas}</span>
          </div>
        )}
      </div>

      {puedeCancelar && !confirmando && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setConfirmando(true)}
          className="mt-4 gap-1.5 rounded-full"
        >
          <X className="size-3.5" />
          Cancelar esta hora
        </Button>
      )}

      {confirmando && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-destructive/5 p-4 ring-1 ring-destructive/20">
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              ¿Seguro que quieres cancelar esta hora? Esta acción no se puede
              deshacer y el horario quedará disponible para otro paciente.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={cancelando}
              onClick={() => setConfirmando(false)}
              className="flex-1 rounded-full"
            >
              No, mantener mi hora
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={cancelando}
              onClick={() => onCancelar(cita.id)}
              className="flex-1 gap-1.5 rounded-full"
            >
              {cancelando ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Sí, cancelar"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
