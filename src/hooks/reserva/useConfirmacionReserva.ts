import { useState } from "react"
import { ApiError } from "@/lib/http-client"
import { crearCitaPublica } from "@/services/reservas.service"
import type { Cita, SlotConProfesional, TratamientoDeEspecialidad } from "@/types/reserva"

/**
 * Paso "confirmar". No toca el estado de disponibilidad ni de paso
 * directamente — el 409 (slot tomado) y el éxito los resuelve via
 * callbacks que decide el orquestador, para no acoplar este hook a
 * `useDisponibilidadReserva` ni al estado de `paso`.
 */
export function useConfirmacionReserva({
  tratamiento,
  slotSeleccionado,
  rut,
  fecha,
  buscarDisponibilidad,
  onExito,
  onSlotYaNoDisponible,
}: {
  tratamiento: TratamientoDeEspecialidad | null
  slotSeleccionado: SlotConProfesional | null
  rut: string | null
  fecha: string
  buscarDisponibilidad: (
    fecha: string,
    consulta: { treatmentId: number } | { especialidadId: number }
  ) => Promise<SlotConProfesional[]>
  onExito: () => void
  onSlotYaNoDisponible: () => void
}) {
  const [notas, setNotas] = useState("")
  const [creandoCita, setCreandoCita] = useState(false)
  const [errorCita, setErrorCita] = useState<string | null>(null)
  const [citaCreada, setCitaCreada] = useState<Cita | null>(null)
  const [slotYaNoDisponible, setSlotYaNoDisponible] = useState(false)

  async function confirmarReserva(turnstileToken: string) {
    if (!tratamiento || !slotSeleccionado || !rut) return

    setCreandoCita(true)
    setErrorCita(null)
    setSlotYaNoDisponible(false)
    try {
      const cita = await crearCitaPublica({
        rut,
        turnstile_token: turnstileToken,
        professional_id: slotSeleccionado.profesional.id,
        treatment_id: tratamiento.id,
        fecha_hora: slotSeleccionado.fecha_hora,
        notas: notas.trim() || undefined,
      })
      setCitaCreada(cita)
      onExito()
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // El slot ya no está libre: refresca la disponibilidad (ahora con
        // el tratamiento puntual ya resuelto, no la aproximación por
        // especialidad) y ofrece el siguiente horario sin reiniciar el
        // flujo completo.
        setSlotYaNoDisponible(true)
        onSlotYaNoDisponible()
        await buscarDisponibilidad(fecha, { treatmentId: tratamiento.id })
      } else if (error instanceof ApiError) {
        setErrorCita(error.message)
      } else {
        setErrorCita("No pudimos crear tu reserva. Intenta de nuevo.")
      }
    } finally {
      setCreandoCita(false)
    }
  }

  function reiniciar() {
    setNotas("")
    setCitaCreada(null)
    setErrorCita(null)
    setSlotYaNoDisponible(false)
  }

  /** Limpia los avisos de un intento anterior al volver a un paso previo. */
  function limpiarAvisos() {
    setErrorCita(null)
    setSlotYaNoDisponible(false)
  }

  return {
    notas,
    setNotas,
    creandoCita,
    errorCita,
    citaCreada,
    slotYaNoDisponible,
    confirmarReserva,
    reiniciar,
    limpiarAvisos,
  }
}
