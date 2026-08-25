import { useEffect, useState } from "react"
import { listarConveniosPublicos } from "@/services/convenios.service"
import type { Convenio } from "@/types/convenios"

interface EstadoCarga<T> {
  datos: T | null
  cargando: boolean
  error: string | null
}

export function useConvenios() {
  const [estado, setEstado] = useState<EstadoCarga<Convenio[]>>({
    datos: null,
    cargando: true,
    error: null,
  })

  useEffect(() => {
    let vigente = true

    listarConveniosPublicos()
      .then((convenios) => {
        if (vigente) setEstado({ datos: convenios, cargando: false, error: null })
      })
      .catch(() => {
        if (vigente)
          setEstado({
            datos: null,
            cargando: false,
            error: "No pudimos cargar los convenios. Intenta de nuevo más tarde.",
          })
      })

    return () => {
      vigente = false
    }
  }, [])

  return estado
}
