import { CalendarCheck, MessageCircle, Stamp } from "lucide-react"
import { cn } from "@/lib/utils"

const HITOS = [
  {
    icono: CalendarCheck,
    titulo: "Reservaste",
    descripcion: "Tu hora quedó tomada en la agenda de la clínica.",
  },
  {
    icono: Stamp,
    titulo: "Confirmación",
    descripcion: "Te llegó por correo con el detalle y cómo cancelar.",
  },
  {
    icono: MessageCircle,
    titulo: "Recordatorio WhatsApp",
    descripcion: "Te escribimos un día antes para que no se te olvide.",
  },
] as const

/**
 * Línea de tiempo horizontal que reemplaza la pantalla de confirmación
 * genérica: sitúa la reserva recién hecha dentro de lo que sigue (la
 * clínica ya la registró y notificó; el recordatorio llega más adelante),
 * en vez de un mensaje ambiguo tipo "operación exitosa".
 */
export function TimelineConfirmacion() {
  return (
    <ol className="flex w-full items-start gap-1.5 sm:gap-3">
      {HITOS.map((hito, indice) => {
        const esUltimo = indice === HITOS.length - 1
        const Icono = hito.icono

        return (
          <li key={hito.titulo} className="flex flex-1 items-start gap-1.5 sm:gap-3">
            <div className="flex flex-1 flex-col items-center gap-2 text-center">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full ring-1 sm:size-10",
                  esUltimo
                    ? "bg-muted text-muted-foreground ring-border"
                    : "bg-success/15 text-success ring-success/30"
                )}
              >
                <Icono className="size-4" />
              </span>
              <div>
                <p className="text-xs font-medium text-foreground sm:text-sm">
                  {hito.titulo}
                </p>
                <p className="mt-0.5 hidden text-[0.7rem] text-muted-foreground sm:block">
                  {hito.descripcion}
                </p>
              </div>
            </div>
            {!esUltimo && (
              <div
                aria-hidden
                className="mt-4.5 h-0.5 flex-1 rounded-full bg-success/30 sm:mt-5"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
