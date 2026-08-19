import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import { formatClp, formatDuracion } from "@/lib/format"
import { iconoDeCategoria } from "@/components/servicios/CategoriaIcono"
import type { TratamientoPublico } from "@/types/reserva"

interface ServicioCardProps {
  servicio: TratamientoPublico
}

/**
 * Fila de índice editorial: nombre grande a la izquierda, metadatos
 * (categoría, duración, precio) alineados a la derecha en mono, separados
 * por un filete fino. Reemplaza la grilla de tarjetas ícono+título+texto
 * repetida que se sentía a CRUD con estilos encima.
 */
export function ServicioCard({ servicio }: ServicioCardProps) {
  const Icono = iconoDeCategoria(servicio.categoria)

  return (
    <Link
      to={`/tratamientos/${servicio.slug}`}
      className="group flex flex-col gap-3 py-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="flex items-start gap-3.5 sm:items-center">
        <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground sm:mt-0">
          <Icono className="size-4" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
            {servicio.categoria}
          </span>
          <h3 className="font-heading text-xl leading-snug font-medium text-balance transition-colors duration-200 group-hover:text-primary sm:text-2xl">
            {servicio.nombre}
          </h3>
          {servicio.descripcion && (
            <p className="line-clamp-1 max-w-md text-sm text-muted-foreground">
              {servicio.descripcion}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pl-12.5 sm:pl-0">
        <div className="flex flex-col items-start gap-0.5 font-mono text-sm sm:items-end">
          <span className="text-muted-foreground">
            {formatDuracion(servicio.duracion_minutos)}
          </span>
          <span className="text-base font-medium text-primary">
            {formatClp(Number(servicio.precio))}
          </span>
        </div>
        <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
    </Link>
  )
}
