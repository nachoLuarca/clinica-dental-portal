import { ProfesionalRow } from "@/components/equipo/ProfesionalRow"
import { ProfesionalRowSkeleton } from "@/components/equipo/ProfesionalRowSkeleton"
import type { Profesional } from "@/types/reserva"

interface EquipoGridProps {
  profesionales: Profesional[]
  cargando?: boolean
}

export function EquipoGrid({ profesionales, cargando }: EquipoGridProps) {
  if (cargando) {
    return (
      <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
        {Array.from({ length: 4 }).map((_, indice) => (
          <ProfesionalRowSkeleton key={indice} />
        ))}
      </div>
    )
  }

  if (profesionales.length === 0) return null

  return (
    <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
      {profesionales.map((profesional) => (
        <ProfesionalRow key={profesional.id} profesional={profesional} />
      ))}
    </div>
  )
}
