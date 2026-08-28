import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Clock3, UserRound } from "lucide-react"
import { ChipHorario } from "@/components/reserva/ChipHorario"
import { SelectorSemana } from "@/components/reserva/SelectorSemana"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { horaDe } from "@/lib/fechas"
import type { Profesional, SlotConProfesional } from "@/types/reserva"

interface PasoDisponibilidadProps {
  fecha: string
  onCambiarFecha: (fecha: string) => void
  slots: SlotConProfesional[]
  cargando: boolean
  error: string | null
  slotSeleccionado: SlotConProfesional | null
  onSeleccionarSlot: (slot: SlotConProfesional) => void
  /** Fijo cuando se entró por Profesional: una sola fila, sin agrupar. */
  profesionalFijo: Profesional | null
  avisoSlotTomado: boolean
}

type FiltroHorario = "todos" | "manana" | "tarde"

function coincideFiltro(slot: SlotConProfesional, filtro: FiltroHorario): boolean {
  if (filtro === "todos") return true
  const hora = horaDe(slot.inicio)
  return filtro === "manana" ? hora < 13 : hora >= 13
}

function FilaProfesionalConChips({
  profesional,
  slots,
  slotSeleccionado,
  onSeleccionarSlot,
}: {
  profesional: Profesional
  slots: SlotConProfesional[]
  slotSeleccionado: SlotConProfesional | null
  onSeleccionarSlot: (slot: SlotConProfesional) => void
}) {
  const nombreCompleto = [profesional.nombre, profesional.apellido]
    .filter(Boolean)
    .join(" ")
  const especialidades =
    profesional.especialidades?.map((e) => e.nombre).join(", ") ??
    profesional.especialidad

  return (
    <div className="flex flex-col gap-3 py-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-primary ring-1 ring-border/70">
          {profesional.foto_url ? (
            <img
              src={profesional.foto_url}
              alt={nombreCompleto}
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-4" />
          )}
        </span>
        <div>
          <p className="font-heading text-sm font-medium">{nombreCompleto}</p>
          {especialidades && (
            <p className="font-mono text-[0.65rem] tracking-wide text-muted-foreground uppercase">
              {especialidades}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <ChipHorario
            key={`${slot.profesional.id}-${slot.fecha_hora}`}
            slot={slot}
            activo={
              slotSeleccionado?.fecha_hora === slot.fecha_hora &&
              slotSeleccionado.profesional.id === slot.profesional.id
            }
            onSeleccionar={onSeleccionarSlot}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Pantalla combinada de disponibilidad: reemplaza los antiguos pasos
 * separados "profesional" + "horario". Selector de semana + filtro
 * Mañana/Tarde + chips de horario, agrupados por profesional cuando no hay
 * uno fijo (entrada Especialidad/Sucursal) o en una sola fila cuando sí
 * (entrada Profesional). Los slots ya vienen con `.profesional` resuelto
 * desde el hook — acá solo se agrupa y filtra por hora para mostrar, no se
 * calcula disponibilidad.
 */
export function PasoDisponibilidad({
  fecha,
  onCambiarFecha,
  slots,
  cargando,
  error,
  slotSeleccionado,
  onSeleccionarSlot,
  profesionalFijo,
  avisoSlotTomado,
}: PasoDisponibilidadProps) {
  const [filtro, setFiltro] = useState<FiltroHorario>("todos")

  // `slots` siempre viene de una consulta agregada ("cualquiera
  // disponible", ver `buscarDisponibilidad` en el hook — nunca se manda
  // `professional_id` a la API). Cuando hay un profesional fijo (entrada
  // "Profesional"), filtrar a sus slots es responsabilidad de esta pantalla,
  // no de la consulta.
  const slotsFiltrados = useMemo(() => {
    const base = profesionalFijo
      ? slots.filter((s) => s.profesional.id === profesionalFijo.id)
      : slots
    return base.filter((s) => coincideFiltro(s, filtro))
  }, [slots, filtro, profesionalFijo])

  const grupos = useMemo(() => {
    if (profesionalFijo) return null
    const porProfesional = new Map<number, SlotConProfesional[]>()
    for (const slot of slotsFiltrados) {
      const lista = porProfesional.get(slot.profesional.id) ?? []
      lista.push(slot)
      porProfesional.set(slot.profesional.id, lista)
    }
    return Array.from(porProfesional.values())
  }, [slotsFiltrados, profesionalFijo])

  return (
    <div className="flex flex-col gap-5">
      <AnimatePresence>
        {avisoSlotTomado && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0, x: [0, -6, 6, -3, 0] }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ x: { duration: 0.4 }, default: { duration: 0.2 } }}
            className="flex items-start gap-2.5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/30"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Ese horario ya no está disponible: alguien más lo reservó
              justo antes. Elige otro de la lista actualizada.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <SelectorSemana fecha={fecha} onCambiarFecha={onCambiarFecha} />

      <Tabs value={filtro} onValueChange={(v) => setFiltro(v as FiltroHorario)}>
        <TabsList>
          <TabsTrigger value="todos">Todos los horarios</TabsTrigger>
          <TabsTrigger value="manana">Mañana</TabsTrigger>
          <TabsTrigger value="tarde">Tarde</TabsTrigger>
        </TabsList>
      </Tabs>

      {cargando ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, indice) => (
            <div key={indice} className="flex flex-col gap-3">
              <Skeleton className="h-10 w-48 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-16 rounded-xl" />
                <Skeleton className="h-10 w-16 rounded-xl" />
                <Skeleton className="h-10 w-16 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : slotsFiltrados.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted/60 px-4 py-8 text-center">
          <Clock3 className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hay horarios libres para esta fecha. Prueba con otro día.
          </p>
        </div>
      ) : profesionalFijo ? (
        <div className="flex flex-wrap gap-2">
          {slotsFiltrados.map((slot) => (
            <ChipHorario
              key={slot.fecha_hora}
              slot={slot}
              activo={slotSeleccionado?.fecha_hora === slot.fecha_hora}
              onSeleccionar={onSeleccionarSlot}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border/70 rounded-3xl bg-card px-5 ring-1 ring-border/70 sm:px-8">
          {grupos?.map((slotsDelProfesional) => (
            <FilaProfesionalConChips
              key={slotsDelProfesional[0].profesional.id}
              profesional={slotsDelProfesional[0].profesional}
              slots={slotsDelProfesional}
              slotSeleccionado={slotSeleccionado}
              onSeleccionarSlot={onSeleccionarSlot}
            />
          ))}
        </div>
      )}
    </div>
  )
}
