import { Link } from "react-router-dom"
import { ArrowUpRight, Clock3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatClp, formatDuracion } from "@/lib/format"
import { iconoDeCategoria } from "@/components/servicios/CategoriaIcono"
import type { TratamientoPublico } from "@/types/reserva"

interface ServicioCardProps {
  servicio: TratamientoPublico
}

export function ServicioCard({ servicio }: ServicioCardProps) {
  const Icono = iconoDeCategoria(servicio.categoria)

  return (
    <Link
      to={`/tratamientos/${servicio.slug}`}
      className="group block h-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-xl"
    >
      <Card className="h-full border-none py-0 ring-1 ring-border/70 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lg group-hover:ring-primary/30">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              <Icono className="size-5" />
            </span>
            <ArrowUpRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <Badge variant="secondary" className="w-fit rounded-full">
              {servicio.categoria}
            </Badge>
            <h3 className="font-heading text-lg leading-snug font-medium text-balance">
              {servicio.nombre}
            </h3>
            {servicio.descripcion && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {servicio.descripcion}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border/70 pt-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock3 className="size-3.5" />
              {formatDuracion(servicio.duracion_minutos)}
            </span>
            <span className="font-heading text-base text-primary">
              Desde {formatClp(Number(servicio.precio))}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
