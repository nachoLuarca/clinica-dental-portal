import { useEffect, useRef, useState } from "react"
import { CalendarCheck, Loader2, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/identificacion/TurnstileWidget"
import { formatClp, formatDuracion } from "@/lib/format"
import type { SlotConProfesional, TratamientoDeEspecialidad } from "@/types/reserva"

interface PasoConfirmarProps {
  tratamiento: TratamientoDeEspecialidad
  slot: SlotConProfesional
  notas: string
  onCambiarNotas: (valor: string) => void
  enviando: boolean
  error: string | null
  onConfirmar: (turnstileToken: string) => void
}

const formateadorFecha = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

export function PasoConfirmar({
  tratamiento,
  slot,
  notas,
  onCambiarNotas,
  enviando,
  error,
  onConfirmar,
}: PasoConfirmarProps) {
  const fecha = new Date(slot.fecha_hora)
  const fechaLegible = formateadorFecha.format(fecha)

  const [tokenConfirmar, setTokenConfirmar] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)

  // El token de Identificación ya se consumió (y probablemente expiró: el
  // paciente pasó por Tratamiento, Profesional y Horario de por medio) —
  // este es un desafío nuevo, de un solo uso, específico de este envío.
  useEffect(() => {
    if (error) {
      setTokenConfirmar(null)
      turnstileRef.current?.reset()
    }
  }, [error])

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#082a26] p-6 text-primary-foreground">
        <p className="font-mono text-xs tracking-[0.14em] text-primary-foreground/70 uppercase">
          Vas a reservar
        </p>
        <p className="mt-1 font-heading text-xl font-medium text-balance">
          {tratamiento.nombre}
        </p>

        <div className="mt-5 flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <UserRound className="size-4 shrink-0 text-primary-foreground/70" />
            <span className="capitalize">
              {slot.profesional.nombre} {slot.profesional.apellido ?? ""}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CalendarCheck className="size-4 shrink-0 text-primary-foreground/70" />
            <span className="font-mono capitalize">
              {fechaLegible}, {slot.inicio} - {slot.fin}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
          <span className="text-primary-foreground/70">
            {formatDuracion(tratamiento.duracion_minutos)}
          </span>
          <span className="font-mono text-lg">
            {formatClp(Number(tratamiento.precio))}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notas-reserva">¿Algo que debamos saber? (opcional)</Label>
        <textarea
          id="notas-reserva"
          value={notas}
          onChange={(evento) => onCambiarNotas(evento.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Ej. alergias, molestias puntuales, preferencias de horario..."
          className="w-full resize-none rounded-xl border border-input bg-transparent px-3.5 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <TurnstileWidget
        ref={turnstileRef}
        onToken={setTokenConfirmar}
        onExpirar={() => setTokenConfirmar(null)}
        onError={() => setTokenConfirmar(null)}
      />

      <Button
        type="button"
        size="lg"
        disabled={enviando || !tokenConfirmar}
        onClick={() => tokenConfirmar && onConfirmar(tokenConfirmar)}
        className="w-full gap-2 rounded-full"
      >
        {enviando ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Confirmando tu hora...
          </>
        ) : (
          <>
            <CalendarCheck className="size-4" />
            Confirmar reserva
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        El precio es de referencia: puede variar según el diagnóstico del
        profesional. El pago se coordina directamente con la clínica.
      </p>
    </div>
  )
}
