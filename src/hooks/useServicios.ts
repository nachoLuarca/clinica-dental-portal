import { useEffect, useState } from "react"
import { listarTratamientosPublicos } from "@/services/reservas.service"
import type { TratamientoPublico } from "@/types/reserva"

/**
 * Catálogo público de tratamientos, leído directamente de
 * `GET /publico/tratamientos` (misma fuente que usa el flujo de reserva en
 * `useReservaWizard`). No hay una lista separada para "landing/catálogo" vs
 * "reserva": ambas comparten `id`/`slug` real de la API.
 */

const CANTIDAD_DESTACADOS = 3

interface EstadoCarga<T> {
  datos: T | null
  cargando: boolean
  error: string | null
}

function soloActivos(tratamientos: TratamientoPublico[]): TratamientoPublico[] {
  return tratamientos.filter((tratamiento) => tratamiento.activo)
}

export function useServicios() {
  const [estado, setEstado] = useState<EstadoCarga<TratamientoPublico[]>>({
    datos: null,
    cargando: true,
    error: null,
  })

  useEffect(() => {
    let vigente = true

    listarTratamientosPublicos()
      .then((tratamientos) => {
        if (vigente)
          setEstado({ datos: soloActivos(tratamientos), cargando: false, error: null })
      })
      .catch(() => {
        if (vigente)
          setEstado({
            datos: null,
            cargando: false,
            error: "No pudimos cargar los tratamientos. Intenta de nuevo más tarde.",
          })
      })

    return () => {
      vigente = false
    }
  }, [])

  return estado
}

/**
 * La API pública todavía no expone una marca de "destacado" por
 * tratamiento (eso se administra desde el portal admin, no acá). Mientras
 * ese campo no exista, se muestra una muestra acotada del catálogo activo
 * para la landing, sin inventar ningún dato nuevo.
 */
export function useServiciosDestacados() {
  const { datos, cargando, error } = useServicios()
  const destacados = datos ? datos.slice(0, CANTIDAD_DESTACADOS) : null
  return { datos: destacados, cargando, error }
}

export function useServicio(slug: string | undefined) {
  const { datos: servicios, cargando, error } = useServicios()

  if (!slug) {
    return { datos: null, cargando: false, error: "Tratamiento no encontrado." }
  }

  if (cargando) {
    return { datos: null, cargando: true, error: null }
  }

  if (error) {
    return { datos: null, cargando: false, error }
  }

  const encontrado = servicios?.find((servicio) => servicio.slug === slug) ?? null
  if (!encontrado) {
    return {
      datos: null,
      cargando: false,
      error: "No encontramos este tratamiento en nuestro catálogo.",
    }
  }

  return { datos: encontrado, cargando: false, error: null }
}
