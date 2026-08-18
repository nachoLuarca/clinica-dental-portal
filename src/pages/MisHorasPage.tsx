import { CalendarX2, PartyPopper, RotateCcw, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CitaGestionCard } from "@/components/mis-horas/CitaGestionCard"
import { FormularioBuscarHoras } from "@/components/mis-horas/FormularioBuscarHoras"
import { useGestionHoras } from "@/hooks/useGestionHoras"

const formateadorFecha = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
})

/**
 * Gestión de horas SIN sesión (Módulo 5): el paciente se identifica con
 * RUT + fecha de nacimiento en cada consulta a la API, tal como lo expone
 * `/publico/citas`. No comparte estado ni datos con el guard `auth:paciente`
 * — es intencionalmente independiente, según el handoff del módulo.
 */
export function MisHorasPage() {
  const gestion = useGestionHoras()

  if (!gestion.identificacion || !gestion.citas) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <FormularioBuscarHoras
          buscando={gestion.buscando}
          error={gestion.errorBusqueda}
          onBuscar={(rut, fecha) => void gestion.buscar(rut, fecha)}
        />
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-medium text-balance sm:text-3xl">
            Tus horas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {gestion.citas.length === 0
              ? "No encontramos citas asociadas a estos datos."
              : `Encontramos ${gestion.citas.length} ${gestion.citas.length === 1 ? "hora" : "horas"} a tu nombre.`}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={gestion.buscarConOtroRut}
          className="shrink-0 gap-1.5 rounded-full text-muted-foreground"
        >
          <RotateCcw className="size-3.5" />
          Buscar con otro RUT
        </Button>
      </div>

      {gestion.citaRecienCancelada && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-2xl bg-primary/10 px-4 py-4 text-sm ring-1 ring-primary/30 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <PartyPopper className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">
              Tu hora del{" "}
              {formateadorFecha.format(
                new Date(gestion.citaRecienCancelada.fecha_hora)
              )}{" "}
              quedó cancelada.
            </p>
            <p className="mt-0.5 text-muted-foreground">
              El horario ya está liberado y disponible para otro paciente. Te
              enviamos la confirmación de la cancelación por correo.
            </p>
          </div>
        </div>
      )}

      {gestion.errorCancelacion && (
        <p
          role="alert"
          className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {gestion.errorCancelacion}
        </p>
      )}

      {gestion.citas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-muted/60 px-6 py-12 text-center">
          <Ticket className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Todavía no tienes horas reservadas con estos datos.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {gestion.citas.map((cita) => (
            <CitaGestionCard
              key={cita.id}
              cita={cita}
              cancelando={gestion.citaCancelandoId === cita.id}
              onCancelar={(id) => void gestion.cancelar(id)}
            />
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <CalendarX2 className="size-3.5" />
        <span>¿Necesitas otra hora? Puedes reservar una nueva cuando quieras.</span>
      </div>
    </section>
  )
}
