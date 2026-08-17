import { CalendarClock, MessagesSquare, ShieldCheck } from "lucide-react"

const beneficios = [
  {
    icono: CalendarClock,
    titulo: "Disponibilidad real, al tiro",
    descripcion:
      "Ves los horarios libres de cada profesional en el momento, sin esperar confirmación por teléfono.",
  },
  {
    icono: MessagesSquare,
    titulo: "Confirmación clara",
    descripcion:
      "Recibes por correo y WhatsApp el detalle de tu hora: tratamiento, profesional, fecha y cómo cancelarla si lo necesitas.",
  },
  {
    icono: ShieldCheck,
    titulo: "Equipo certificado",
    descripcion:
      "Profesionales con especialidad verificada y protocolos de higiene estrictos en cada atención.",
  },
]

export function PorQueElegirnos() {
  return (
    <section className="bg-muted/60 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-3xl font-medium sm:text-4xl">
            Reservar hora dental, sin fricción
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pensado para que agendar tu próxima visita tome menos de lo que
            demora el trámite de siempre.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {beneficios.map(({ icono: Icono, titulo, descripcion }) => (
            <div
              key={titulo}
              className="group flex flex-col gap-4 rounded-3xl bg-card p-6 ring-1 ring-border/70 transition-all duration-300 hover:-translate-y-1 hover:ring-primary/30"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icono className="size-5.5" />
              </span>
              <h3 className="font-heading text-lg font-medium">{titulo}</h3>
              <p className="text-sm text-muted-foreground">{descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
