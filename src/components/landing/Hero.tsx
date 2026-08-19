import { Link } from "react-router-dom"
import { ArrowUpRight, CalendarCheck, ShieldCheck, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProximaDisponibilidad } from "@/hooks/useProximaDisponibilidad"

const formateadorDia = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
})
const formateadorHora = new Intl.DateTimeFormat("es-CL", {
  hour: "2-digit",
  minute: "2-digit",
})

function etiquetaDia(fechaHora: string): string {
  const fecha = new Date(fechaHora)
  const hoy = new Date()
  const esHoy = fecha.toDateString() === hoy.toDateString()
  const manana = new Date(hoy)
  manana.setDate(hoy.getDate() + 1)
  const esManana = fecha.toDateString() === manana.toDateString()

  if (esHoy) return "Hoy"
  if (esManana) return "Mañana"
  return formateadorDia.format(fecha)
}

/**
 * El hero se organiza alrededor del widget de disponibilidad en vivo, no de
 * una imagen decorativa: lo primero que el paciente ve es una hora real que
 * puede reservar en el acto, con el resto de la propuesta como contexto
 * alrededor.
 */
export function Hero() {
  const { cargando, proxima } = useProximaDisponibilidad()

  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 size-80 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch lg:py-20">
        <div className="order-2 flex flex-col justify-center gap-6 lg:order-1">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/80 bg-card px-3.5 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Sparkles className="size-3.5 text-accent" />
            Reserva en línea, sin llamadas
          </span>

          <h1 className="font-heading text-4xl leading-[1.05] font-medium text-balance sm:text-5xl">
            Tu próxima hora dental,{" "}
            <span className="text-primary">a la vista antes de reservar</span>
          </h1>

          <p className="max-w-md text-base text-muted-foreground sm:text-lg">
            Elige el tratamiento, revisa quién atiende y confirma un horario
            real: el mismo que ves acá al lado, tomado de la agenda de la
            clínica en este momento.
          </p>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Button asChild size="lg" className="gap-2 rounded-full px-6">
              <Link to="/tratamientos">
                <CalendarCheck className="size-4" />
                Ver tratamientos y reservar
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 rounded-full px-6">
              <Link to="/mis-horas">Gestionar mi hora</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" />
              Profesionales certificados
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-accent text-accent" />
              4.9/5 en atención de pacientes
            </span>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative flex h-full min-h-72 flex-col overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-xl">
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-white/5"
            />
            <div className="relative flex flex-1 flex-col p-7 sm:p-9">
              <p className="font-mono text-xs tracking-[0.18em] text-primary-foreground/65 uppercase">
                Próxima hora disponible
              </p>

              {cargando ? (
                <div className="mt-6 flex flex-1 flex-col gap-4 animate-pulse">
                  <div className="h-10 w-48 rounded-lg bg-white/15" />
                  <div className="h-4 w-56 rounded-lg bg-white/10" />
                  <div className="mt-auto h-11 w-40 rounded-full bg-white/10" />
                </div>
              ) : proxima ? (
                <div className="mt-6 flex flex-1 flex-col">
                  <p className="font-mono text-3xl leading-tight font-medium sm:text-4xl">
                    {formateadorHora.format(new Date(proxima.fechaHora))}
                  </p>
                  <p className="mt-2 font-heading text-xl text-balance capitalize">
                    {etiquetaDia(proxima.fechaHora)}
                  </p>
                  <p className="mt-3 text-sm text-primary-foreground/80">
                    {proxima.tratamiento.nombre}
                    {proxima.profesional
                      ? ` · ${proxima.profesional.nombre} ${proxima.profesional.apellido ?? ""}`.trimEnd()
                      : ""}
                  </p>

                  <Button
                    asChild
                    size="lg"
                    className="mt-auto w-fit gap-2 self-start rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Link to={`/reservar?servicio=${proxima.tratamiento.slug}`}>
                      Reservar esta hora
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>

                  <p className="mt-4 text-xs text-primary-foreground/55">
                    Disponibilidad real: se confirma al reservar, por si otro
                    paciente la toma primero.
                  </p>
                </div>
              ) : (
                <div className="mt-6 flex flex-1 flex-col justify-center gap-3">
                  <p className="font-heading text-xl text-balance">
                    Revisa el catálogo para ver horarios disponibles
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="w-fit gap-2 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Link to="/tratamientos">
                      Ver tratamientos
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
