import { useCallback, useEffect, useRef, useState } from "react"
import { ApiError } from "@/lib/http-client"
import { listarProfesionales } from "@/services/reservas.service"
import type { PasoReserva } from "@/hooks/reserva/tipos"
import type { Profesional } from "@/types/reserva"

/**
 * Lista de profesionales y selección en curso. `sucursalId` viene inyectado
 * desde afuera (no lee `sucursal` directo del wizard) para no acoplar este
 * hook al estado de sucursal — solo le importa el id para acotar la
 * consulta.
 */
export function useProfesionalesReserva({
  paso,
  sucursalId,
}: {
  paso: PasoReserva
  sucursalId: number | undefined
}) {
  const [profesionales, setProfesionales] = useState<Profesional[] | null>(
    null
  )
  const [cargandoProfesionales, setCargandoProfesionales] = useState(false)
  const [errorProfesionales, setErrorProfesionales] =
    useState<ApiError | null>(null)
  const [profesional, setProfesional] = useState<Profesional | null>(null)

  const cargarProfesionales = useCallback(
    async (opciones?: {
      treatmentId?: number
      sucursalId?: number
      forzar?: boolean
    }) => {
      // `forzar` evita el corto-circuito del cache cuando el llamador ya
      // sabe que la lista quedó obsoleta (cambio de sede) en el mismo tick
      // en que pidió limpiarla con `setProfesionales(null)` — ese `null`
      // todavía no se refleja en este closure, así que sin `forzar` acá se
      // devolvería la lista vieja en vez de pedir la nueva.
      if (profesionales !== null && !opciones?.forzar) return profesionales
      setCargandoProfesionales(true)
      setErrorProfesionales(null)
      try {
        const lista = await listarProfesionales(
          opciones?.treatmentId,
          opciones?.sucursalId ?? sucursalId
        )
        setProfesionales(lista)
        return lista
      } catch (error) {
        setErrorProfesionales(
          error instanceof ApiError
            ? error
            : new ApiError("No pudimos cargar los profesionales.", 0)
        )
        return null
      } finally {
        setCargandoProfesionales(false)
      }
    },
    [profesionales, sucursalId]
  )

  // Lista completa del equipo activo (sin filtrar por tratamiento) para el
  // paso "profesional-lista" — mismo endpoint que usa el directorio público
  // de `/equipo` (`useEquipoProfesional`).
  const profesionalesListaSolicitada = useRef(false)
  useEffect(() => {
    if (paso !== "profesional-lista" || profesionalesListaSolicitada.current) {
      return
    }
    profesionalesListaSolicitada.current = true
    void cargarProfesionales({ forzar: true })
  }, [paso, cargarProfesionales])

  return {
    profesionales,
    cargandoProfesionales,
    errorProfesionales,
    profesional,
    setProfesional,
    cargarProfesionales,
  }
}
