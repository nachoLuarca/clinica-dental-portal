import { useState } from "react"
import { Link } from "react-router-dom"
import { CalendarCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Profesional } from "@/types/reserva"

interface ProfesionalRowProps {
  profesional: Profesional
}

export function ProfesionalRow({ profesional }: ProfesionalRowProps) {
  const [fotoRota, setFotoRota] = useState(false)
  const mostrarFoto = Boolean(profesional.foto_url) && !fotoRota
  const nombreCompleto = [profesional.nombre, profesional.apellido]
    .filter(Boolean)
    .join(" ")
  const especialidades =
    profesional.especialidades?.map((e) => e.nombre).join(", ") ??
    profesional.especialidad

  return (
    <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:gap-6">
      <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-primary ring-1 ring-border/70">
        {mostrarFoto ? (
          <img
            src={profesional.foto_url ?? undefined}
            alt={nombreCompleto}
            className="size-full object-cover"
            onError={() => setFotoRota(true)}
          />
        ) : (
          <UserRound className="size-7" />
        )}
      </span>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="font-heading text-xl font-medium text-balance sm:text-2xl">
          {nombreCompleto}
        </h3>
        {especialidades && (
          <span className="font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
            {especialidades}
            {profesional.matricula && ` · Matrícula ${profesional.matricula}`}
          </span>
        )}
        {profesional.bio && (
          <p className="mt-1 line-clamp-2 max-w-xl text-sm text-muted-foreground">
            {profesional.bio}
          </p>
        )}
      </div>

      <Button asChild variant="outline" className="shrink-0 gap-2 rounded-full self-start">
        <Link to={`/reservar?profesional=${profesional.id}`}>
          <CalendarCheck className="size-4" />
          Reservar con {profesional.nombre}
        </Link>
      </Button>
    </div>
  )
}
