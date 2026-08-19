import { ServicioCard } from "@/components/servicios/ServicioCard"
import { ServicioCardSkeleton } from "@/components/servicios/ServicioCardSkeleton"
import type { TratamientoPublico } from "@/types/reserva"

interface ServiciosGridProps {
  servicios: TratamientoPublico[]
  cargando?: boolean
}

/**
 * Índice editorial de tratamientos: filas separadas por un filete fino, en
 * vez de una grilla de tarjetas repetidas. Pensado como la tabla de
 * contenidos de una revista, no como un listado de resultados de CRUD.
 */
export function ServiciosGrid({ servicios, cargando }: ServiciosGridProps) {
  if (cargando) {
    return (
      <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
        {Array.from({ length: 5 }).map((_, indice) => (
          <ServicioCardSkeleton key={indice} />
        ))}
      </div>
    )
  }

  if (servicios.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="font-heading text-lg">No hay tratamientos en esta categoría</p>
        <p className="text-sm text-muted-foreground">
          Prueba con otra categoría o revisa el catálogo completo.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
      {servicios.map((servicio) => (
        <ServicioCard key={servicio.id} servicio={servicio} />
      ))}
    </div>
  )
}
