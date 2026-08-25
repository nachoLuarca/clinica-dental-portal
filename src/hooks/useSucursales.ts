import { useEffect, useState } from "react"
import { listarSucursalesPublicas } from "@/services/sucursales.service"
import type { Sucursal } from "@/types/sucursales"

interface EstadoCarga<T> {
  datos: T | null
  cargando: boolean
  error: string | null
}

export function useSucursales() {
  const [estado, setEstado] = useState<EstadoCarga<Sucursal[]>>({
    datos: null,
    cargando: true,
    error: null,
  })

  useEffect(() => {
    let vigente = true

    listarSucursalesPublicas()
      .then((sucursales) => {
        if (vigente) setEstado({ datos: sucursales, cargando: false, error: null })
      })
      .catch(() => {
        if (vigente)
          setEstado({
            datos: null,
            cargando: false,
            error: "No pudimos cargar las sucursales. Intenta de nuevo más tarde.",
          })
      })

    return () => {
      vigente = false
    }
  }, [])

  return estado
}
