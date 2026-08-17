import { Link } from "react-router-dom"
import { CalendarCheck, Mail, PartyPopper, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Cita } from "@/types/reserva"

interface PasoExitoProps {
  cita: Cita
  onReservarOtra: () => void
}

const formateadorFecha = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
})

/**
 * Pantalla de confirmación. Solo muestra lo que la API ya persistió y
 * notificó (correo/WhatsApp) — no arma ni reenvía ningún mensaje desde
 * acá, según el handoff del módulo.
 */
export function PasoExito({ cita, onReservarOtra }: PasoExitoProps) {
  const fechaLegible = formateadorFecha.format(new Date(cita.fecha_hora))

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center animate-in fade-in zoom-in-95 duration-500">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <PartyPopper className="size-7" />
      </span>

      <div>
        <h2 className="font-heading text-2xl font-medium text-balance">
          ¡Tu hora quedó reservada!
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Te enviamos la confirmación por correo y WhatsApp.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-3xl bg-card p-6 text-left ring-1 ring-border/70">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {cita.treatment?.nombre ?? "Tratamiento"}
        </p>
        <p className="mt-1 font-heading text-lg font-medium capitalize text-balance">
          {fechaLegible}
        </p>
        {cita.professional && (
          <p className="mt-1 text-sm text-muted-foreground">
            Con {cita.professional.nombre} {cita.professional.apellido ?? ""}
          </p>
        )}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
          <Mail className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Si necesitas cancelar, puedes hacerlo desde "Mis horas" con tu RUT
            y fecha de nacimiento, sin iniciar sesión.
          </span>
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2.5 sm:flex-row">
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
