import { ArrowRight, Clock3, MapPin } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatHorarioSemanal } from "@/lib/format"
import type { Sucursal } from "@/types/sucursales"

interface PasoSucursalListaProps {
  sucursales: Sucursal[] | null
  cargando: boolean
  error: string | null
  onElegir: (sucursal: Sucursal) => void
}

/**
 * A diferencia de `SucursalRow`/`SucursalesGrid` (informativas, sin
 * selección), acá cada fila es un botón: elegir sucursal acota profesionales
 * y disponibilidad a esa sede vía `sucursal_id` en
 * `GET /publico/profesionales` y `GET /publico/availability`.
 */
export function PasoSucursalLista({
  sucursales,
  cargando,
  error,
  onElegir,
}: PasoSucursalListaProps) {
  if (cargando) {
    return (
      <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
        {Array.from({ length: 3 }).map((_, indice) => (
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

  if (!sucursales || sucursales.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta clínica todavía no tiene sucursales publicadas.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
      {sucursales.map((sucursal) => {
        const lineasHorario = formatHorarioSemanal(sucursal.horarios)
        return (
          <button
            key={sucursal.id}
            type="button"
            onClick={() => onElegir(sucursal)}
            className="group flex items-center gap-3.5 py-5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
              <MapPin className="size-4" />
            </span>
            <div className="flex-1">
              <p className="font-heading text-base font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                {sucursal.nombre}
              </p>
              <p className="text-xs text-muted-foreground">
                {sucursal.direccion}, {sucursal.comuna}
              </p>
              {lineasHorario.length > 0 && (
                <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[0.7rem] text-muted-foreground">
                  <Clock3 className="size-3" />
                  {lineasHorario[0]}
                </p>
              )}
            </div>
            <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
          </button>
        )
      })}
    </div>
  )
}
