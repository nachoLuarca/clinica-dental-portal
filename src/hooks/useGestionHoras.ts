import { useState } from "react"
import { ApiError } from "@/lib/http-client"
import { limpiarRut } from "@/lib/rut"
import {
  buscarCitasPorRut,
  cancelarCitaPorRut,
} from "@/services/reservas.service"
import type { Cita } from "@/types/reserva"

/**
 * Orquesta la pantalla "Mis horas" (Módulo 5): gestión de citas SIN sesión,
 * identificando al paciente con RUT + fecha de nacimiento en cada llamada.
 * Ese par se guarda solo en memoria de este hook (no en sessionStorage ni
 * cookies) para poder refrescar la lista tras cancelar sin repetir el
 * formulario — se pierde apenas se recarga o se abandona la pantalla, que
 * es la intención: no es una sesión persistente como la de `auth`.
 */
export function useGestionHoras() {
  const [identificacion, setIdentificacion] = useState<{
    rut: string
    fechaNacimiento: string
  } | null>(null)

  const [buscando, setBuscando] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  const [citas, setCitas] = useState<Cita[] | null>(null)

  const [citaCancelandoId, setCitaCancelandoId] = useState<number | null>(null)
  const [errorCancelacion, setErrorCancelacion] = useState<string | null>(null)
  const [citaRecienCancelada, setCitaRecienCancelada] = useState<Cita | null>(
    null
  )

  async function buscar(rutIngresado: string, fechaNacimiento: string) {
    const rut = limpiarRut(rutIngresado)
    setBuscando(true)
    setErrorBusqueda(null)
    setCitaRecienCancelada(null)
    try {
      const lista = await buscarCitasPorRut({ rut, fechaNacimiento })
      const ordenadas = [...lista].sort((a, b) =>
        a.fecha_hora.localeCompare(b.fecha_hora)
      )
      setCitas(ordenadas)
      setIdentificacion({ rut, fechaNacimiento })
    } catch (error) {
      // La API responde el mismo 422 genérico tanto si el RUT no existe
      // como si la fecha de nacimiento no calza, a propósito (no se puede
      // usar esta pantalla para confirmar si un RUT ajeno está registrado).
      // Acá solo se refleja ese mensaje, sin agregar distinción propia.
      if (error instanceof ApiError && (error.status === 422 || error.status === 404)) {
        setErrorBusqueda(
          "No encontramos citas con esos datos. Revisa que el RUT y la fecha de nacimiento sean los mismos que usaste al reservar."
        )
      } else if (error instanceof ApiError) {
        setErrorBusqueda(error.message)
      } else {
        setErrorBusqueda(
          "No pudimos consultar tus horas en este momento. Intenta de nuevo."
        )
      }
      setCitas(null)
      setIdentificacion(null)
    } finally {
      setBuscando(false)
    }
  }

  async function cancelar(citaId: number) {
    if (!identificacion) return
    setCitaCancelandoId(citaId)
    setErrorCancelacion(null)
    try {
      const citaCancelada = await cancelarCitaPorRut(citaId, identificacion)
      setCitas(
        (previas) =>
          previas?.map((c) => (c.id === citaId ? citaCancelada : c)) ?? null
      )
      setCitaRecienCancelada(citaCancelada)
    } catch (error) {
      setErrorCancelacion(
        error instanceof ApiError
          ? error.message
          : "No pudimos cancelar esta hora. Intenta de nuevo."
      )
    } finally {
      setCitaCancelandoId(null)
    }
  }

  function buscarConOtroRut() {
    setIdentificacion(null)
    setCitas(null)
    setErrorBusqueda(null)
    setCitaRecienCancelada(null)
  }

  function descartarConfirmacionCancelacion() {
    setCitaRecienCancelada(null)
  }

  return {
    identificacion,
    buscando,
    errorBusqueda,
    citas,
    buscar,
    buscarConOtroRut,
    citaCancelandoId,
    errorCancelacion,
    citaRecienCancelada,
    cancelar,
    descartarConfirmacionCancelacion,
  }
}
