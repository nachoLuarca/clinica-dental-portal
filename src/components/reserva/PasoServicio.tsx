import { ArrowRight, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatClp, formatDuracion } from "@/lib/format"
import type { TratamientoPublico } from "@/types/reserva"

interface PasoServicioProps {
  tratamientos: TratamientoPublico[] | null
  cargando: boolean
  error: string | null
  onElegir: (tratamiento: TratamientoPublico) => void
}

export function PasoServicio({
  tratamientos,
  cargando,
  error,
  onElegir,
}: PasoServicioProps) {
  if (cargando) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, indice) => (
          <Skeleton key={indice} className="h-24 rounded-2xl" />
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
    <div className="grid gap-3 sm:grid-cols-2">
      {tratamientos
        .filter((t) => t.activo)
        .map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onElegir(t)}
            className="group flex flex-col gap-2 rounded-2xl bg-card p-4 text-left ring-1 ring-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/50 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
            <p className="font-heading text-base leading-snug font-medium text-balance">
              {t.nombre}
            </p>
            {t.descripcion && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {t.descripcion}
              </p>
            )}
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {formatDuracion(t.duracion_minutos)}
              </span>
              <span className="font-heading font-medium text-primary">
                {formatClp(Number(t.precio))}
              </span>
            </div>
          </button>
        ))}
    </div>
  )
}
