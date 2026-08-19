import { useEffect, useState } from "react"
import {
  consultarDisponibilidad,
  listarProfesionales,
  listarTratamientosPublicos,
} from "@/services/reservas.service"
import type { Profesional, TratamientoPublico } from "@/types/reserva"

/** Cuántos días hacia adelante se prueban buscando el primer slot libre. */
const DIAS_A_PROBAR = 5

export interface ProximaDisponibilidad {
  tratamiento: TratamientoPublico
  fechaHora: string
  profesional: Profesional | null
}

function fechaISO(offsetDias: number): string {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + offsetDias)
  return fecha.toISOString().slice(0, 10)
}

/**
 * Busca un slot real para mostrar como teaser en el hero de la landing:
 * toma el primer tratamiento activo del catálogo y consulta disponibilidad
 * agregada ("cualquiera disponible") probando algunos días hacia adelante
 * hasta encontrar el primer slot libre. Nunca inventa un horario — si no
 * encuentra nada dentro de la ventana de días, queda en `null` y el hero
 * no muestra la tarjeta.
 */
export function useProximaDisponibilidad() {
  const [cargando, setCargando] = useState(true)
  const [proxima, setProxima] = useState<ProximaDisponibilidad | null>(null)

  useEffect(() => {
    let vigente = true

    async function buscar() {
      try {
        const tratamientos = await listarTratamientosPublicos()
        const tratamiento = tratamientos.find((t) => t.activo) ?? null
        if (!tratamiento || !vigente) return

        for (let dia = 0; dia < DIAS_A_PROBAR; dia++) {
          const disponibilidad = await consultarDisponibilidad({
            treatmentId: tratamiento.id,
            professionalId: null,
            fecha: fechaISO(dia),
          })
          if (!vigente) return
          const [primero] = disponibilidad.slots
          if (primero) {
            const profesionales = await listarProfesionales(tratamiento.id)
            if (!vigente) return
            const profesional =
              profesionales.find((p) => p.id === primero.professional_id) ??
              null
            setProxima({
              tratamiento,
              fechaHora: primero.fecha_hora,
              profesional,
            })
            return
          }
        }
      } catch {
        // Es un teaser decorativo: si falla la consulta, el hero
        // simplemente no muestra la tarjeta, sin mensaje de error visible.
      } finally {
        if (vigente) setCargando(false)
      }
    }

    void buscar()
    return () => {
      vigente = false
    }
  }, [])

  return { cargando, proxima }
}
