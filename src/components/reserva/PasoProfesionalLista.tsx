import { useState } from "react"
import { ArrowRight, UserRound } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { ApiError } from "@/lib/http-client"
import type { Profesional } from "@/types/reserva"

interface PasoProfesionalListaProps {
  profesionales: Profesional[] | null
  cargando: boolean
  error: ApiError | null
  onElegir: (profesional: Profesional) => void
}

function FilaProfesional({
  profesional,
  onElegir,
}: {
  profesional: Profesional
  onElegir: (p: Profesional) => void
}) {
  const [fotoRota, setFotoRota] = useState(false)
  const mostrarFoto = Boolean(profesional.foto_url) && !fotoRota
  const nombreCompleto = [profesional.nombre, profesional.apellido]
    .filter(Boolean)
    .join(" ")
  const especialidades =
    profesional.especialidades?.map((e) => e.nombre).join(", ") ??
    profesional.especialidad

  return (
    <button
      type="button"
      onClick={() => onElegir(profesional)}
      className="group flex items-center gap-3.5 py-5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-primary ring-1 ring-border/70">
        {mostrarFoto ? (
          <img
            src={profesional.foto_url ?? undefined}
            alt={nombreCompleto}
            className="size-full object-cover"
            onError={() => setFotoRota(true)}
          />
        ) : (
          <UserRound className="size-5" />
        )}
      </span>
      <div className="flex-1">
        <p className="font-heading text-base font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
          {nombreCompleto}
        </p>
        {especialidades && (
          <p className="font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
            {especialidades}
          </p>
        )}
      </div>
      <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
    </button>
  )
}

/**
 * Entrada "Profesional": lista completa del equipo activo (mismo endpoint y
 * datos que el directorio público de `/equipo`, foto real incluida), pero
 * cada fila es un botón de selección en vez de un link — acá se elige, no se
 * navega. El tratamiento se pide recién en el paso siguiente
 * ("tratamiento-profesional"), porque la API igual lo exige para consultar
 * disponibilidad.
 */
export function PasoProfesionalLista({
  profesionales,
  cargando,
  error,
  onElegir,
}: PasoProfesionalListaProps) {
  if (cargando) {
    return (
      <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div key={indice} className="flex items-center gap-3.5 py-5">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-secondary/60 p-5">
        <p className="text-sm font-medium text-secondary-foreground">
          No pudimos cargar los profesionales de la clínica.
        </p>
        <p className="text-sm text-secondary-foreground/80">
          Ocurrió un problema al consultar el equipo. Intenta de nuevo más
          tarde, o vuelve y busca por tratamiento.
        </p>
      </div>
    )
  }

  if (!profesionales || profesionales.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta clínica todavía no tiene profesionales publicados.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
      {profesionales.map((p) => (
        <FilaProfesional key={p.id} profesional={p} onElegir={onElegir} />
      ))}
    </div>
  )
}
