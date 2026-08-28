import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PasoReserva } from "@/hooks/useReservaWizard"

interface StepperReservaProps {
  pasos: { id: PasoReserva; titulo: string }[]
  pasoActual: PasoReserva
}

/**
 * Indicador visual del avance del flujo de reserva. Deliberadamente no es
 * un `<Tabs>` genérico: la reserva es un proceso guiado y secuencial, no
 * un conjunto de secciones intercambiables. `pasos` varía según la puerta
 * de entrada elegida (Especialidad/Profesional/Sucursal) — ver
 * `PASOS_POR_ENTRADA` en `useReservaWizard`.
 */
export function StepperReserva({ pasos, pasoActual }: StepperReservaProps) {
  const indiceActual = pasos.findIndex((p) => p.id === pasoActual)

  return (
    <ol className="flex items-center gap-1.5 sm:gap-2">
      {pasos.map((paso, indice) => {
        const completado = indice < indiceActual
        const activo = indice === indiceActual

        return (
          <li key={paso.id} className="flex flex-1 items-center gap-1.5 sm:gap-2">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 sm:size-9",
                  completado && "bg-primary text-primary-foreground",
                  activo &&
                    "bg-accent text-accent-foreground ring-4 ring-accent/20 scale-110",
                  !completado && !activo && "bg-muted text-muted-foreground"
                )}
              >
                {completado ? <Check className="size-4" /> : indice + 1}
              </span>
              <span
                className={cn(
                  "hidden text-center text-xs font-medium text-muted-foreground sm:block",
                  activo && "text-foreground"
                )}
              >
                {paso.titulo}
              </span>
            </div>
            {indice < pasos.length - 1 && (
              <div
                className={cn(
                  "mb-4 h-0.5 flex-1 rounded-full bg-muted transition-colors duration-500 sm:mb-5",
                  completado && "bg-primary"
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
