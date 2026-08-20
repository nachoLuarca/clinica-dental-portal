import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { iconoDeEspecialidad } from "@/components/servicios/EspecialidadIcono"
import { formatClp, formatDuracion } from "@/lib/format"
import type { TratamientoPublico } from "@/types/reserva"

interface PasoServicioProps {
  tratamientos: TratamientoPublico[] | null
  cargando: boolean
  error: string | null
  onElegir: (tratamiento: TratamientoPublico) => void
}

/**
 * Mismo formato de índice editorial que el catálogo público
 * (`ServiciosGrid`/`ServicioCard`): filas separadas por un filete fino, no
 * la grilla de tarjetas ícono+título+texto que tenía antes este paso.
 */
export function PasoServicio({
  tratamientos,
  cargando,
  error,
  onElegir,
}: PasoServicioProps) {
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

  if (!tratamientos || tratamientos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta clínica todavía no tiene tratamientos publicados para reservar.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
      {tratamientos
        .filter((t) => t.activo)
        .map((t) => {
          const Icono = iconoDeEspecialidad(t.especialidad?.nombre ?? null)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onElegir(t)}
              className="group flex flex-col gap-3 py-5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="flex items-start gap-3.5 sm:items-center">
                <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground sm:mt-0">
                  <Icono className="size-4" />
                </span>
                <div className="flex flex-col gap-1">
                  {t.especialidad && (
                    <span className="font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                      {t.especialidad.nombre}
                    </span>
                  )}
                  <h3 className="font-heading text-xl leading-snug font-medium text-balance transition-colors duration-200 group-hover:text-primary sm:text-2xl">
                    {t.nombre}
                  </h3>
                  {t.descripcion && (
                    <p className="line-clamp-1 max-w-md text-sm text-muted-foreground">
                      {t.descripcion}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pl-12.5 sm:pl-0">
                <div className="flex flex-col items-start gap-0.5 font-mono text-sm sm:items-end">
                  <span className="text-muted-foreground">
                    {formatDuracion(t.duracion_minutos)}
                  </span>
                  <span className="text-base font-medium text-primary">
                    {formatClp(Number(t.precio))}
                  </span>
                </div>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
            </button>
          )
        })}
    </div>
  )
}
