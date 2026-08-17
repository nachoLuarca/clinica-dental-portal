import { ArrowRight, Shuffle, UserRound } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/http-client"
import type { Profesional } from "@/types/reserva"

interface PasoProfesionalProps {
  profesionales: Profesional[] | null
  cargando: boolean
  error: ApiError | null
  onElegirEspecifico: (profesional: Profesional) => void
  onElegirCualquiera: () => void
}

export function PasoProfesional({
  profesionales,
  cargando,
  error,
  onElegirEspecifico,
  onElegirCualquiera,
}: PasoProfesionalProps) {
  if (cargando) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 3 }).map((_, indice) => (
          <Skeleton key={indice} className="h-20 rounded-2xl" />
        ))}
      </div>
    )
  }

  // La API todavía no expone un listado público de profesionales (ver
  // `services/reservas.service.ts`). Se muestra la limitación tal cual,
  // en vez de simular un profesional o una disponibilidad inexistente.
  if (error || !profesionales || profesionales.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-secondary/60 p-5">
        <p className="text-sm font-medium text-secondary-foreground">
          Por ahora no podemos mostrarte los profesionales disponibles en línea.
        </p>
        <p className="text-sm text-secondary-foreground/80">
          {error && error.status === 404
            ? "Esta clínica todavía no tiene habilitada la elección de profesional desde el sitio público."
            : "Ocurrió un problema al consultar los profesionales de la clínica."}{" "}
          Contáctala directamente para coordinar tu hora, o intenta de nuevo más
          tarde.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={onElegirCualquiera}
        className="group flex items-center gap-3 rounded-2xl bg-accent/10 p-4 text-left ring-1 ring-accent/30 transition-all duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-accent hover:shadow-md sm:col-span-2"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
          <Shuffle className="size-5" />
        </span>
        <div className="flex-1">
          <p className="font-heading text-sm font-medium">
            Cualquiera disponible
          </p>
          <p className="text-xs text-muted-foreground">
            Te mostramos los horarios libres de todo el equipo.
          </p>
        </div>
        <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
      </button>

      {profesionales.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onElegirEspecifico(p)}
          className="group flex items-center gap-3 rounded-2xl bg-card p-4 text-left ring-1 ring-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/50 hover:shadow-md"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserRound className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-heading text-sm font-medium">
              {p.nombre} {p.apellido ?? ""}
            </p>
            {p.especialidad && (
              <p className="text-xs text-muted-foreground">{p.especialidad}</p>
            )}
          </div>
          <ArrowRight className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
        </button>
      ))}
    </div>
  )
}
