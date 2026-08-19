import { Link } from "react-router-dom"
import { CalendarCheck, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimelineConfirmacion } from "@/components/reserva/TimelineConfirmacion"
import type { Cita } from "@/types/reserva"

interface PasoExitoProps {
  cita: Cita
  onReservarOtra: () => void
}

const formateadorFecha = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
})
const formateadorHora = new Intl.DateTimeFormat("es-CL", {
  hour: "2-digit",
  minute: "2-digit",
})

/**
 * Pantalla de confirmación. Solo muestra lo que la API ya persistió y
 * notificó (correo/WhatsApp) — no arma ni reenvía ningún mensaje desde
 * acá, según el handoff del módulo.
 */
export function PasoExito({ cita, onReservarOtra }: PasoExitoProps) {
  const fecha = new Date(cita.fecha_hora)
  const fechaLegible = formateadorFecha.format(fecha)
  const horaLegible = formateadorHora.format(fecha)

  return (
    <div className="flex flex-col gap-8 py-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3.5 py-1 text-xs font-medium tracking-wide text-success uppercase">
          Reserva confirmada
        </span>
        <h2 className="mt-3 font-heading text-2xl font-medium text-balance">
          {cita.treatment?.nombre ?? "Tu tratamiento"}
        </h2>
      </div>

      <div className="mx-auto w-full max-w-sm rounded-3xl bg-primary p-6 text-primary-foreground">
        <p className="font-mono text-3xl leading-tight font-medium">
          {horaLegible}
        </p>
        <p className="mt-1 font-heading text-lg text-balance capitalize">
          {fechaLegible}
        </p>
        {cita.professional && (
          <p className="mt-3 border-t border-white/15 pt-3 text-sm text-primary-foreground/80">
            Con {cita.professional.nombre} {cita.professional.apellido ?? ""}
          </p>
        )}
      </div>

      <div className="mx-auto w-full max-w-sm">
        <TimelineConfirmacion />
      </div>

      <p className="mx-auto max-w-sm text-center text-xs text-muted-foreground">
        Te enviamos la confirmación por correo y WhatsApp. Si necesitas
        cancelar, hazlo desde "Mis horas" con tu RUT y fecha de nacimiento,
        sin iniciar sesión.
      </p>

      <div className="mx-auto flex w-full max-w-sm flex-col gap-2.5 sm:flex-row">
        <Button asChild variant="outline" className="flex-1 gap-2 rounded-full">
          <Link to="/mis-horas">
            <Ticket className="size-4" />
            Ver mis horas
          </Link>
        </Button>
        <Button onClick={onReservarOtra} className="flex-1 gap-2 rounded-full">
          <CalendarCheck className="size-4" />
          Reservar otra hora
        </Button>
      </div>
    </div>
  )
}
