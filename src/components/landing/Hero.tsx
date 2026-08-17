import { Link } from "react-router-dom"
import { CalendarCheck, ShieldCheck, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-20 size-72 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
            <Sparkles className="size-3.5" />
            Reserva 100% en línea, sin llamadas
          </span>

          <h1 className="font-heading text-4xl leading-[1.08] font-medium text-balance sm:text-5xl lg:text-[3.4rem]">
            Cuida tu sonrisa con hora{" "}
            <span className="text-primary">reservada al instante</span>
          </h1>

          <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
            Revisa nuestros tratamientos, elige el profesional que prefieras
            y confirma tu hora en minutos, directo desde el celular.
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

        <div className="relative">
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary to-[#0a3d36] p-8 text-primary-foreground shadow-xl sm:p-10">
            <p className="font-heading text-sm tracking-wide text-primary-foreground/70 uppercase">
              Próxima hora disponible
            </p>
            <p className="mt-2 font-heading text-3xl font-medium">Hoy, 17:30</p>
            <p className="mt-1 text-sm text-primary-foreground/80">
              Limpieza dental · Dra. Camila Rojas
            </p>

            <div className="mt-8 grid grid-cols-3 gap-2">
              {["09:00", "11:30", "15:00", "16:15", "17:30", "18:45"].map(
                (hora, indice) => (
                  <span
                    key={hora}
                    className={`rounded-xl px-2 py-2 text-center text-xs font-medium ${
                      indice === 4
                        ? "bg-accent text-accent-foreground"
                        : "bg-white/10 text-primary-foreground/85"
                    }`}
                  >
                    {hora}
                  </span>
                )
              )}
            </div>

            <p className="mt-6 text-xs text-primary-foreground/60">
              Disponibilidad referencial — se confirma en tiempo real al
              reservar.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
