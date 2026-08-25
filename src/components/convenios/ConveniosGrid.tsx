import { ConvenioRow } from "@/components/convenios/ConvenioRow"
import { ConvenioRowSkeleton } from "@/components/convenios/ConvenioRowSkeleton"
import type { Convenio } from "@/types/convenios"

interface ConveniosGridProps {
  convenios: Convenio[]
  cargando?: boolean
}

export function ConveniosGrid({ convenios, cargando }: ConveniosGridProps) {
  if (cargando) {
    return (
      <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
        {Array.from({ length: 4 }).map((_, indice) => (
          <ConvenioRowSkeleton key={indice} />
        ))}
      </div>
    )
  }

  if (convenios.length === 0) return null

  return (
    <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
      {convenios.map((convenio) => (
        <ConvenioRow key={convenio.id} convenio={convenio} />
      ))}
    </div>
  )
}
