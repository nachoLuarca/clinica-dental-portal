import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { AuthContext, type AuthContextValue } from "@/context/AuthContext"
import {
  cerrarSesionPaciente,
  iniciarSesionPaciente,
  obtenerPacienteActual,
  registrarPaciente,
} from "@/services/auth.service"
import { guardarToken, limpiarToken, obtenerToken } from "@/lib/session"
import type { DatosLogin, DatosRegistro, Paciente } from "@/types/paciente"

/**
 * Maneja el estado global de sesión del paciente: hidrata al cargar la app
 * si hay un token guardado, y expone login/registro/logout para el resto
 * de la aplicación vía `useAuth`.
 *
 * Se usa Context + useState en vez de una librería de estado externa: es
 * un solo valor global de tamaño pequeño, no justifica una dependencia
 * adicional.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)

  useEffect(() => {
    const token = obtenerToken()
    if (!token) {
      setCargandoSesion(false)
      return
    }

    let vigente = true
    obtenerPacienteActual()
      .then((datos) => {
        if (vigente) setPaciente(datos)
      })
      .catch(() => {
        // Token vencido/inválido: se limpia para no quedar en un estado
        // de sesión inconsistente.
        limpiarToken()
      })
      .finally(() => {
        if (vigente) setCargandoSesion(false)
      })

    return () => {
      vigente = false
    }
  }, [])

  const iniciarSesion = useCallback(async (datos: DatosLogin) => {
    const respuesta = await iniciarSesionPaciente(datos)
    guardarToken(respuesta.token)
    setPaciente(respuesta.data)
    return respuesta.data
  }, [])

  const registrarse = useCallback(async (datos: DatosRegistro) => {
    const respuesta = await registrarPaciente(datos)
    guardarToken(respuesta.token)
    setPaciente(respuesta.data)
    return respuesta.data
  }, [])

  const cerrarSesion = useCallback(async () => {
    try {
      await cerrarSesionPaciente()
    } finally {
      limpiarToken()
      setPaciente(null)
    }
  }, [])

  const valor = useMemo<AuthContextValue>(
    () => ({
      paciente,
      cargandoSesion,
      autenticado: paciente !== null,
      iniciarSesion,
      registrarse,
      cerrarSesion,
    }),
    [paciente, cargandoSesion, iniciarSesion, registrarse, cerrarSesion]
  )

  return <AuthContext value={valor}>{children}</AuthContext>
}
