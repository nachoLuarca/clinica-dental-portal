import { ArrowRight } from "lucide-react"
import { formatClp, formatDuracion } from "@/lib/format"
import type { TratamientoDeEspecialidad } from "@/types/reserva"

interface PasoTratamientoEspecificoProps {
  tratamientos: TratamientoDeEspecialidad[]
  onElegir: (tratamiento: TratamientoDeEspecialidad) => void
}

/**
 * Último dato que falta antes de identificarse: el tratamiento puntual
 * dentro de la especialidad ya elegida (`tratamientosDeLaEspecialidad` en el
 * hook). El horario ya está reservado en la selección anterior — la
 * duración mostrada ahí se calculó con el tratamiento más largo de la
 * especialidad, así que cualquiera de estos entra sin problema (ver nota en
 * `reservas.service.ts`).
 */
export function PasoTratamientoEspecifico({
  tratamientos,
  onElegir,
}: PasoTratamientoEspecificoProps) {
  if (tratamientos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No encontramos tratamientos publicados para esta especialidad.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Para terminar, elige el tratamiento puntual que necesitas.
      </p>
      <div className="flex flex-col divide-y divide-border/60 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
        {tratamientos.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onElegir(t)}
            className="group flex items-center justify-between gap-4 py-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="flex flex-col gap-0.5">
              <p className="font-heading text-base font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                {t.nombre}
              </p>
              {t.descripcion && (
                <p className="line-clamp-1 max-w-md text-xs text-muted-foreground">
                  {t.descripcion}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-0.5 font-mono text-xs">
                <span className="text-muted-foreground">
                  {formatDuracion(t.duracion_minutos)}
                </span>
                <span className="font-medium text-primary">
                  {formatClp(Number(t.precio))}
                </span>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
