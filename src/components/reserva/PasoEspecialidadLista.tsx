import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { iconoDeEspecialidad } from "@/components/servicios/EspecialidadIcono"
import type { EspecialidadPublica } from "@/types/reserva"

interface PasoEspecialidadListaProps {
  especialidades: EspecialidadPublica[] | null
  cargando: boolean
  error: string | null
  onElegir: (especialidad: EspecialidadPublica) => void
}

function textoProfesionales(cantidad: number): string {
  if (cantidad === 0) return "Sin profesionales asignados"
  return cantidad === 1 ? "1 profesional" : `${cantidad} profesionales`
}

/**
 * Elegir especialidad, no un tratamiento puntual — ver la nota en
 * `useReservaWizard` sobre por qué el tratamiento exacto se resuelve recién
 * después de elegir horario. Entrando por Profesional, `especialidades` ya
 * viene acotado a las que ese profesional cubre (`opcionesEspecialidad` en
 * el hook); acá no hay diferencia de presentación entre los tres casos.
 */
export function PasoEspecialidadLista({
  especialidades,
  cargando,
  error,
  onElegir,
}: PasoEspecialidadListaProps) {
  if (cargando) {
    return (
      <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div key={indice} className="flex items-center gap-3.5 py-5">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    )
  }

  if (!especialidades || especialidades.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta clínica todavía no tiene especialidades publicadas.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
      {especialidades.map((especialidad) => {
        const Icono = iconoDeEspecialidad(especialidad.nombre)
        return (
          <button
            key={especialidad.id}
            type="button"
            onClick={() => onElegir(especialidad)}
            className="group flex items-center gap-3.5 py-5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
              <Icono className="size-4" />
            </span>
            <div className="flex-1">
              <p className="font-heading text-base font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                {especialidad.nombre}
              </p>
              <p className="font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                {especialidad.tratamientos.length === 1
                  ? "1 tratamiento"
                  : `${especialidad.tratamientos.length} tratamientos`}
                {" · "}
                {textoProfesionales(especialidad.profesionales_count)}
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
          </button>
        )
      })}
    </div>
  )
}
