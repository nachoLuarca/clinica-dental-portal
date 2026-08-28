import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  formatRangoSemana,
  inicioDeSemana,
  semanaDesde,
  sumarSemanas,
} from "@/lib/fechas"

interface SelectorSemanaProps {
  fecha: string
  onCambiarFecha: (fecha: string) => void
}

const HOY_ISO = new Date().toISOString().slice(0, 10)

/**
 * Selector de semana (Lun-Dom + flechas de semana), estilo agenda de
 * clínica dental. No existe ningún primitivo de calendario en el repo
 * (sin `date-fns` ni `@radix-ui/*` instalados), así que es un componente
 * nuevo sobre `lib/fechas.ts`. Navegar de semana salta siempre al lunes de
 * la semana destino (mismo comportamiento por defecto que las agendas de
 * referencia), no conserva el día de la semana elegido.
 */
export function SelectorSemana({ fecha, onCambiarFecha }: SelectorSemanaProps) {
  const dias = semanaDesde(fecha)
  const inicioSemanaActualIso = inicioDeSemana(fecha).toISOString().slice(0, 10)
  const inicioSemanaHoyIso = inicioDeSemana(HOY_ISO).toISOString().slice(0, 10)
  const esSemanaActual = inicioSemanaActualIso === inicioSemanaHoyIso

  function irASemana(desplazamiento: number) {
    const lunesDestino = sumarSemanas(inicioSemanaActualIso, desplazamiento)
    onCambiarFecha(lunesDestino)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Semana del {formatRangoSemana(dias)}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => irASemana(-1)}
            disabled={esSemanaActual}
            aria-label="Semana anterior"
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => irASemana(1)}
            aria-label="Semana siguiente"
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {dias.map((dia) => {
          const activo = dia.iso === fecha
          return (
            <button
              key={dia.iso}
              type="button"
              disabled={dia.esPasado}
              onClick={() => onCambiarFecha(dia.iso)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-2 font-mono text-sm ring-1 transition-colors duration-150",
                activo
                  ? "bg-primary text-primary-foreground ring-primary shadow-md"
                  : "bg-card text-foreground ring-border/70 hover:ring-primary/50",
                dia.esPasado && "pointer-events-none opacity-30"
              )}
            >
              <span className="text-[0.65rem] tracking-wide uppercase opacity-70">
                {dia.diaCorto}
              </span>
              <span className="font-semibold">{dia.numero}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
