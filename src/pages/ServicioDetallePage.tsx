import { Link, useParams } from "react-router-dom"
import { ArrowLeft, CalendarCheck, CheckCircle2, Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { iconoDeCategoria } from "@/components/servicios/CategoriaIcono"
import { formatClp, formatDuracion } from "@/lib/format"
import { useServicio } from "@/hooks/useServicios"
import { useAuth } from "@/hooks/useAuth"

export function ServicioDetallePage() {
  const { slug } = useParams<{ slug: string }>()
  const { datos: servicio, cargando, error } = useServicio(slug)
  const { autenticado } = useAuth()

  if (cargando) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-6 h-10 w-2/3" />
        <Skeleton className="mt-3 h-20 w-full" />
      </section>
    )
  }

  if (error || !servicio) {
    return (
      <section className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-medium">
          {error ?? "No encontramos este tratamiento."}
        </h1>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/tratamientos">Volver al catálogo</Link>
        </Button>
      </section>
    )
  }

  const Icono = iconoDeCategoria(servicio.categoria)

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        to="/tratamientos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Volver al catálogo
      </Link>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icono className="size-6" />
          </span>
          <div>
            <Badge variant="secondary" className="rounded-full">
              {servicio.categoria}
            </Badge>
            <h1 className="mt-2 font-heading text-3xl font-medium text-balance sm:text-4xl">
              {servicio.nombre}
            </h1>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <p className="text-base leading-relaxed text-foreground/90">
            {servicio.descripcion}
          </p>

          <div>
            <h2 className="font-heading text-lg font-medium">Qué incluye</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {servicio.incluye.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="h-fit rounded-3xl bg-card p-6 ring-1 ring-border/70">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Duración</span>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Clock3 className="size-4 text-primary" />
              {formatDuracion(servicio.duracionMinutos)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
            <span className="text-sm text-muted-foreground">Precio de referencia</span>
            <span className="font-heading text-xl text-primary">
              {formatClp(servicio.precioDesdeClp)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Valor "desde": puede variar según el diagnóstico del profesional.
          </p>

          <Button asChild size="lg" className="mt-6 w-full gap-2 rounded-full">
            <Link to={`/reservar?servicio=${servicio.slug}`}>
              <CalendarCheck className="size-4" />
              Reservar este tratamiento
            </Link>
          </Button>
          {!autenticado && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Puedes revisar horarios sin iniciar sesión; te pedimos cuenta
              recién al confirmar tu hora.
            </p>
          )}
        </aside>
      </div>
    </section>
  )
}
