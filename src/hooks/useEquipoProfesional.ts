import { useEffect, useState } from "react"
import { listarProfesionales } from "@/services/reservas.service"
import type { Profesional } from "@/types/reserva"

interface EstadoCarga<T> {
  datos: T | null
  cargando: boolean
  error: string | null
}

/**
 * Directorio público del equipo: mismo `GET /publico/profesionales` que ya
 * consume el wizard de reserva (`listarProfesionales`), sin `treatment_id`
 * para traer a todo el equipo activo en vez de filtrar por tratamiento.
 */
export function useEquipoProfesional() {
  const [estado, setEstado] = useState<EstadoCarga<Profesional[]>>({
    datos: null,
    cargando: true,
    error: null,
  })

  useEffect(() => {
    let vigente = true

    listarProfesionales()
      .then((profesionales) => {
        if (vigente) setEstado({ datos: profesionales, cargando: false, error: null })
      })
      .catch(() => {
        if (vigente)
          setEstado({
            datos: null,
            cargando: false,
            error: "No pudimos cargar el equipo profesional. Intenta de nuevo más tarde.",
          })
      })

    return () => {
      vigente = false
    }
  }, [])

  return estado
}
