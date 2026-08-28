import { useCallback, useState } from "react"
import { consultarDisponibilidad } from "@/services/reservas.service"
import type { Profesional, SlotConProfesional } from "@/types/reserva"

/**
 * Slots de la pantalla "disponibilidad". `sucursalId`/`profesionales` vienen
 * inyectados desde afuera (no acopla este hook al estado de sucursal ni al
 * hook de profesionales) — solo los necesita para acotar la consulta y
 * resolver nombre/foto de cada slot.
 *
 * Siempre en modo "cualquiera disponible" (nunca se manda
 * `professional_id`): la API agrega los slots libres del equipo — de toda
 * la clínica, o solo de la sede si se manda `sucursal_id` — y marca cada
 * slot con el profesional que lo cubre. Acá solo se resuelve ese id contra
 * la lista de profesionales para poder mostrar nombre/foto. Filtrar a un
 * solo profesional (entrada "Profesional") es responsabilidad de quien
 * consume `slots` (`PasoDisponibilidad`), no de esta consulta — mandar
 * `professional_id` acá obligaría a mandar también `treatment_id` del lado
 * de la API (ver `AvailabilityRequest`), y el wizard todavía no lo tiene
 * resuelto en ese punto del flujo.
 */
export function useDisponibilidadReserva({
  sucursalId,
  profesionales,
}: {
  sucursalId: number | undefined
  profesionales: Profesional[] | null
}) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [slots, setSlots] = useState<SlotConProfesional[]>([])
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [errorSlots, setErrorSlots] = useState<string | null>(null)
  const [slotSeleccionado, setSlotSeleccionado] =
    useState<SlotConProfesional | null>(null)

  /**
   * Recibe `consulta` (con `treatmentId` o `especialidadId`, nunca los dos)
   * como parámetro explícito, no leído de un estado externo: los llamadores
   * de esta función a veces la invocan en el mismo tick en que recién están
   * haciendo el `setState` correspondiente en otro hook, y ese `setState` es
   * asíncrono — leerlo acá adentro devolvería todavía el valor previo.
   */
  const buscarDisponibilidad = useCallback(
    async (
      fechaConsulta: string,
      consulta: { treatmentId: number } | { especialidadId: number },
      listaProfesionalesParaNombres?: Profesional[]
    ): Promise<SlotConProfesional[]> => {
      setCargandoSlots(true)
      setErrorSlots(null)
      try {
        const disponibilidad = await consultarDisponibilidad({
          ...consulta,
          fecha: fechaConsulta,
          sucursalId,
        })

        const listaNombres = listaProfesionalesParaNombres ?? profesionales ?? []
        const conProfesional = disponibilidad.slots
          .map((slot): SlotConProfesional => {
            const encontrado = listaNombres.find(
              (p) => p.id === slot.professional_id
            )
            return {
              ...slot,
              profesional: encontrado ?? {
                id: slot.professional_id ?? 0,
                nombre: "Profesional del equipo",
                apellido: null,
                especialidad: null,
              },
            }
          })
          .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))

        setSlots(conProfesional)
        return conProfesional
      } catch {
        setErrorSlots(
          "No pudimos consultar la disponibilidad en este momento. Intenta de nuevo."
        )
        setSlots([])
        return []
      } finally {
        setCargandoSlots(false)
      }
    },
    [profesionales, sucursalId]
  )

  return {
    fecha,
    setFecha,
    slots,
    setSlots,
    cargandoSlots,
    errorSlots,
    slotSeleccionado,
    setSlotSeleccionado,
    buscarDisponibilidad,
  }
}
