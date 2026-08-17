import { AlertTriangle, Clock3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { SlotConProfesional } from "@/types/reserva"

interface PasoHorarioProps {
  fecha: string
  onCambiarFecha: (fecha: string) => void
  slots: SlotConProfesional[]
  cargando: boolean
  error: string | null
  slotSeleccionado: SlotConProfesional | null
  onSeleccionarSlot: (slot: SlotConProfesional) => void
  mostrarProfesional: boolean
  avisoSlotTomado: boolean
}

export function PasoHorario({
  fecha,
  onCambiarFecha,
  slots,
  cargando,
  error,
  slotSeleccionado,
  onSeleccionarSlot,
  mostrarProfesional,
  avisoSlotTomado,
}: PasoHorarioProps) {
  const hoy = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex flex-col gap-5">
      {avisoSlotTomado && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent-foreground ring-1 ring-accent/30"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
          <p>
            Ese horario se acaba de ocupar. Elegimos la disponibilidad más
            actualizada para ti — revisa los horarios de abajo.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fecha-reserva">Fecha</Label>
        <Input
          id="fecha-reserva"
          type="date"
          min={hoy}
          value={fecha}
          onChange={(evento) => onCambiarFecha(evento.target.value)}
          className="h-11 w-fit rounded-xl px-4"
        />
      </div>

      {cargando ? (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, indice) => (
            <Skeleton key={indice} className="h-11 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted/60 px-4 py-8 text-center">
          <Clock3 className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hay horarios libres para esta fecha. Prueba con otro día.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {slots.map((slot) => {
            const activo =
              slotSeleccionado?.fecha_hora === slot.fecha_hora &&
              slotSeleccionado.profesional.id === slot.profesional.id

            return (
              <button
                key={`${slot.profesional.id}-${slot.fecha_hora}`}
                type="button"
                onClick={() => onSeleccionarSlot(slot)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-sm font-medium ring-1 transition-all duration-150",
                  activo
                    ? "scale-105 bg-primary text-primary-foreground ring-primary shadow-md"
                    : "bg-card text-foreground ring-border/70 hover:-translate-y-0.5 hover:ring-primary/50"
                )}
              >
                {slot.inicio}
                {mostrarProfesional && (
                  <span
                    className={cn(
                      "text-[0.65rem] font-normal",
                      activo ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {slot.profesional.nombre}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
