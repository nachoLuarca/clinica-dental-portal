import { useEffect, useState } from "react"
import {
  obtenerServicioPorSlug,
  obtenerServicios,
  obtenerServiciosDestacados,
} from "@/services/servicios.service"
import type { Servicio } from "@/types/servicio"

interface EstadoCarga<T> {
  datos: T | null
  cargando: boolean
  error: string | null
}

export function useServicios() {
  const [estado, setEstado] = useState<EstadoCarga<Servicio[]>>({
    datos: null,
    cargando: true,
    error: null,
  })

  useEffect(() => {
    let vigente = true

    obtenerServicios()
      .then((servicios) => {
        if (vigente) setEstado({ datos: servicios, cargando: false, error: null })
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

export function useServiciosDestacados() {
  const [estado, setEstado] = useState<EstadoCarga<Servicio[]>>({
    datos: null,
    cargando: true,
    error: null,
  })

  useEffect(() => {
    let vigente = true

    obtenerServiciosDestacados()
      .then((servicios) => {
        if (vigente) setEstado({ datos: servicios, cargando: false, error: null })
      })
      .catch(() => {
        if (vigente)
          setEstado({
            datos: null,
            cargando: false,
            error: "No pudimos cargar los destacados. Intenta de nuevo más tarde.",
          })
      })

    return () => {
      vigente = false
    }
  }, [])

  return estado
}

export function useServicio(slug: string | undefined) {
  const [estado, setEstado] = useState<EstadoCarga<Servicio>>({
    datos: null,
    cargando: true,
    error: null,
  })

  useEffect(() => {
    if (!slug) {
      setEstado({ datos: null, cargando: false, error: "Tratamiento no encontrado." })
      return
    }

    let vigente = true
    setEstado({ datos: null, cargando: true, error: null })

    obtenerServicioPorSlug(slug)
      .then((servicio) => {
        if (!vigente) return
        if (!servicio) {
          setEstado({
            datos: null,
            cargando: false,
            error: "No encontramos este tratamiento en nuestro catálogo.",
          })
          return
        }
        setEstado({ datos: servicio, cargando: false, error: null })
      })
      .catch(() => {
        if (vigente)
          setEstado({
            datos: null,
            cargando: false,
            error: "No pudimos cargar este tratamiento. Intenta de nuevo más tarde.",
          })
      })

    return () => {
      vigente = false
    }
  }, [slug])

  return estado
}
