import { SucursalRow } from "@/components/sucursales/SucursalRow"
import { SucursalRowSkeleton } from "@/components/sucursales/SucursalRowSkeleton"
import type { Sucursal } from "@/types/sucursales"

interface SucursalesGridProps {
  sucursales: Sucursal[]
  cargando?: boolean
}

export function SucursalesGrid({ sucursales, cargando }: SucursalesGridProps) {
  if (cargando) {
    return (
      <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
        {Array.from({ length: 3 }).map((_, indice) => (
          <SucursalRowSkeleton key={indice} />
        ))}
      </div>
    )
  }

  if (sucursales.length === 0) return null

  return (
    <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
      {sucursales.map((sucursal) => (
        <SucursalRow key={sucursal.id} sucursal={sucursal} />
      ))}
    </div>
  )
}
