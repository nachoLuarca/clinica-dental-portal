import { Clock3, MapPin, Phone } from "lucide-react"
import { formatHorarioSemanal } from "@/lib/format"
import type { Sucursal } from "@/types/sucursales"

interface SucursalRowProps {
  sucursal: Sucursal
}

function normalizarTelefono(telefono: string): string {
  return telefono.replace(/[^\d+]/g, "")
}

export function SucursalRow({ sucursal }: SucursalRowProps) {
  const direccionCompleta = `${sucursal.direccion}, ${sucursal.comuna}`
  const urlMapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`
  const lineasHorario = formatHorarioSemanal(sucursal.horarios)

  return (
    <div className="flex flex-col gap-3 py-6">
      <h3 className="font-heading text-xl font-medium text-balance sm:text-2xl">
        {sucursal.nombre}
      </h3>

      <div className="flex flex-col gap-2 text-sm text-foreground/85">
        <a
          href={urlMapa}
          target="_blank"
          rel="noreferrer"
          className="group flex items-start gap-2.5 transition-colors hover:text-primary"
        >
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="underline decoration-border underline-offset-4 group-hover:decoration-primary">
            {direccionCompleta}
          </span>
        </a>

        <a
          href={`tel:${normalizarTelefono(sucursal.telefono)}`}
          className="flex items-center gap-2.5 font-mono transition-colors hover:text-primary"
        >
          <Phone className="size-4 shrink-0 text-primary" />
          {sucursal.telefono}
        </a>

        {lineasHorario.length > 0 && (
          <div className="flex items-start gap-2.5">
            <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="flex flex-col gap-0.5 font-mono">
              {lineasHorario.map((linea) => (
                <span key={linea}>{linea}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
