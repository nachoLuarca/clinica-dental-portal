import { useMemo } from "react"
import { ArrowRight } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { iconoDeEspecialidad } from "@/components/servicios/EspecialidadIcono"
import { formatClp, formatDuracion } from "@/lib/format"
import type { TratamientoPublico } from "@/types/reserva"

interface PasoServicioProps {
  tratamientos: TratamientoPublico[] | null
  cargando: boolean
  error: string | null
  conteoProfesionalesPorEspecialidad: Record<string, number> | null
  cargandoConteoProfesionales: boolean
  onElegir: (tratamiento: TratamientoPublico) => void
}

interface GrupoEspecialidad {
  clave: string
  nombre: string
  tratamientos: TratamientoPublico[]
}

const SIN_ESPECIALIDAD = "sin-especialidad"

function agruparPorEspecialidad(
  tratamientos: TratamientoPublico[]
): GrupoEspecialidad[] {
  const grupos = new Map<string, GrupoEspecialidad>()

  for (const t of tratamientos) {
    const clave = t.especialidad ? String(t.especialidad.id) : SIN_ESPECIALIDAD
    const nombre = t.especialidad?.nombre ?? "Otros tratamientos"
    if (!grupos.has(clave)) {
      grupos.set(clave, { clave, nombre, tratamientos: [] })
    }
    grupos.get(clave)!.tratamientos.push(t)
  }

  // "Otros tratamientos" (sin especialidad asignada) siempre al final: no
  // es una especialidad real, es el resto.
  return [...grupos.values()].sort((a, b) => {
    if (a.clave === SIN_ESPECIALIDAD) return 1
    if (b.clave === SIN_ESPECIALIDAD) return -1
    return a.nombre.localeCompare(b.nombre, "es")
  })
}

function textoProfesionales(cantidad: number | undefined): string {
  if (cantidad === undefined) return ""
  if (cantidad === 0) return "Sin profesionales asignados"
  return cantidad === 1 ? "1 profesional" : `${cantidad} profesionales`
}

/**
 * El paso "Tratamiento" del wizard agrupa por especialidad (no lista los
 * tratamientos sueltos): cada especialidad muestra cuántos profesionales la
 * cubren y, al expandirla, el detalle de sus tratamientos para elegir uno
 * puntual. No aplica cuando se llega con `?servicio=` desde la ficha de un
 * tratamiento específico del catálogo — ese atajo salta este paso entero.
 */
export function PasoServicio({
  tratamientos,
  cargando,
  error,
  conteoProfesionalesPorEspecialidad,
  cargandoConteoProfesionales,
  onElegir,
}: PasoServicioProps) {
  const grupos = useMemo(() => {
    if (!tratamientos) return []
    return agruparPorEspecialidad(tratamientos.filter((t) => t.activo))
  }, [tratamientos])

  if (cargando) {
    return (
      <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div key={indice} className="flex items-center gap-3.5 py-5">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </p>
    )
  }

  if (grupos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta clínica todavía no tiene tratamientos publicados para reservar.
      </p>
    )
  }

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={grupos[0]?.clave}
      className="rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8"
    >
      {grupos.map((grupo) => {
        const Icono = iconoDeEspecialidad(
          grupo.clave === SIN_ESPECIALIDAD ? null : grupo.nombre
        )
        const conteo = conteoProfesionalesPorEspecialidad?.[grupo.clave]

        return (
          <AccordionItem key={grupo.clave} value={grupo.clave}>
            <AccordionTrigger>
              <span className="flex items-center gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                  <Icono className="size-4" />
                </span>
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-heading text-lg font-medium">
                    {grupo.nombre}
                  </span>
                  <span className="font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                    {grupo.tratamientos.length === 1
                      ? "1 tratamiento"
                      : `${grupo.tratamientos.length} tratamientos`}
                    {cargandoConteoProfesionales
                      ? " · verificando profesionales..."
                      : conteo !== undefined && ` · ${textoProfesionales(conteo)}`}
                  </span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col divide-y divide-border/60">
                {grupo.tratamientos.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onElegir(t)}
                    className="group flex items-center justify-between gap-4 py-3 text-left outline-none first:pt-0 last:pb-0 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="font-heading text-base font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                        {t.nombre}
                      </p>
                      {t.descripcion && (
                        <p className="line-clamp-1 max-w-md text-xs text-muted-foreground">
                          {t.descripcion}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-0.5 font-mono text-xs">
                        <span className="text-muted-foreground">
                          {formatDuracion(t.duracion_minutos)}
                        </span>
                        <span className="font-medium text-primary">
                          {formatClp(Number(t.precio))}
                        </span>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent" />
                    </div>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
