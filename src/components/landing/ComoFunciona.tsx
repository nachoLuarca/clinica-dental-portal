import { CalendarCheck, ClipboardList, Stethoscope } from "lucide-react"

const pasos = [
  {
    numero: "01",
    icono: ClipboardList,
    titulo: "Elige tu tratamiento",
    descripcion:
      "Revisa el catálogo y su ficha con duración y precio de referencia.",
  },
  {
    numero: "02",
    icono: Stethoscope,
    titulo: "Elige profesional y horario",
    descripcion:
      "Puedes elegir a un profesional específico o dejar que te asignemos el primer horario disponible.",
  },
  {
    numero: "03",
    icono: CalendarCheck,
    titulo: "Confirma tu hora",
    descripcion:
      "Recibes la confirmación por correo y WhatsApp, con todo lo necesario para llegar preparado.",
  },
]

export function ComoFunciona() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-medium sm:text-4xl">
              Cómo funciona
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Tres pasos, sin crear cuenta hasta que estés listo para
              confirmar.
            </p>
          </div>
        </div>

        <div className="relative mt-12 grid gap-8 sm:grid-cols-3">
          <div
            aria-hidden
            className="absolute top-6 right-0 left-0 hidden h-px bg-border sm:block"
          />
          {pasos.map(({ numero, icono: Icono, titulo, descripcion }) => (
            <div key={numero} className="relative flex flex-col gap-4">
              <span className="relative z-10 flex size-12 items-center justify-center rounded-full border-2 border-primary bg-background font-heading text-sm font-medium text-primary">
                {numero}
              </span>
              <div className="flex items-center gap-2 text-primary">
                <Icono className="size-5" />
                <h3 className="font-heading text-lg font-medium text-foreground">
                  {titulo}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">{descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
