import { ServicioCard } from "@/components/servicios/ServicioCard"
import { ServicioCardSkeleton } from "@/components/servicios/ServicioCardSkeleton"
import type { Servicio } from "@/types/servicio"

interface ServiciosGridProps {
  servicios: Servicio[]
  cargando?: boolean
}

export function ServiciosGrid({ servicios, cargando }: ServiciosGridProps) {
  if (cargando) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, indice) => (
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {servicios.map((servicio, indice) => (
        <div
          key={servicio.id}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{ animationDelay: `${Math.min(indice, 8) * 60}ms` }}
        >
          <ServicioCard servicio={servicio} />
        </div>
      ))}
    </div>
  )
}
