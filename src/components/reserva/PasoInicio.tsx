import { ArrowRight, MapPin, Stethoscope, UserRound } from "lucide-react"
import type { EntradaReserva } from "@/hooks/useReservaWizard"

interface PasoInicioProps {
  onElegir: (entrada: EntradaReserva) => void
}

const OPCIONES: {
  id: EntradaReserva
  icono: typeof Stethoscope
  titulo: string
  descripcion: string
}[] = [
  {
    id: "especialidad",
    icono: Stethoscope,
    titulo: "Por tratamiento",
    descripcion: "Elige qué necesitas y te mostramos quién lo cubre.",
  },
  {
    id: "profesional",
    icono: UserRound,
    titulo: "Por profesional",
    descripcion: "Elige con quién quieres atenderte.",
  },
  {
    id: "sucursal",
    icono: MapPin,
    titulo: "Por sucursal",
    descripcion: "Elige la sede que te queda más cerca.",
  },
]

/**
 * Primer paso del wizard: tres puertas de entrada que convergen en la misma
 * pantalla de Disponibilidad (ver `PASOS_POR_ENTRADA` en
 * `useReservaWizard`). Mismo lenguaje visual de tarjeta grande que el resto
 * del wizard (ring + hover lift), no genérico.
 */
export function PasoInicio({ onElegir }: PasoInicioProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {OPCIONES.map((opcion) => {
        const Icono = opcion.icono
        return (
          <button
            key={opcion.id}
            type="button"
            onClick={() => onElegir(opcion.id)}
            className="group flex flex-col items-start gap-3 rounded-2xl bg-card p-5 text-left ring-1 ring-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/50 hover:shadow-md"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icono className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-heading text-base font-medium">
                {opcion.titulo}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {opcion.descripcion}
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
          </button>
        )
      })}
    </div>
  )
}
