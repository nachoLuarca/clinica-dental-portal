import { useEffect, useRef, useState } from "react"
import { listarSucursalesPublicas } from "@/services/sucursales.service"
import type { Sucursal } from "@/types/sucursales"
import type { PasoReserva } from "@/hooks/reserva/tipos"

/**
 * Estado del paso "sucursal-lista". La lista se pide una sola vez, recién al
 * llegar efectivamente a ese paso (no todas las entradas lo visitan) — mismo
 * motivo del `ref` (en vez de un flag de closure con cleanup) que el resto
 * de los efectos de carga del wizard: sobrevive el doble montaje de
 * StrictMode en dev sin duplicar el pedido ni descartar el resultado real.
 */
export function useSucursalesReserva(paso: PasoReserva) {
  const [sucursales, setSucursales] = useState<Sucursal[] | null>(null)
  const [cargandoSucursales, setCargandoSucursales] = useState(false)
  const [errorSucursales, setErrorSucursales] = useState<string | null>(null)
  const [sucursal, setSucursal] = useState<Sucursal | null>(null)

  const sucursalesSolicitadas = useRef(false)
  useEffect(() => {
    if (paso !== "sucursal-lista" || sucursalesSolicitadas.current) return
    sucursalesSolicitadas.current = true

    setCargandoSucursales(true)
    setErrorSucursales(null)
    listarSucursalesPublicas()
      .then((lista) => setSucursales(lista))
      .catch(() => {
        sucursalesSolicitadas.current = false
        setErrorSucursales(
          "No pudimos cargar las sucursales disponibles. Intenta de nuevo más tarde."
        )
      })
      .finally(() => setCargandoSucursales(false))
  }, [paso])

  return {
    sucursales,
    cargandoSucursales,
    errorSucursales,
    sucursal,
    setSucursal,
  }
}
