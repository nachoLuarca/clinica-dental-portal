import { useState } from "react"
import { ApiError } from "@/lib/http-client"
import { normalizarRutParaApi } from "@/lib/rut"
import { crearPaciente, verificarRut } from "@/services/pacientes.service"
import type { DatosAltaPaciente } from "@/types/identificacion"

/**
 * Paso "identificacion" (RUT + Turnstile), ubicado justo antes de
 * "confirmar" — no al principio del wizard, ver el comentario de
 * `useReservaWizard` sobre por qué. `onIdentificado` es lo que hace avanzar
 * de paso una vez identificado: lo decide el orquestador, no este hook.
 */
export function useIdentificacionReserva({
  onIdentificado,
}: {
  onIdentificado: () => void
}) {
  const [rut, setRut] = useState<string | null>(null)
  const [verificandoRut, setVerificandoRut] = useState(false)
  const [errorVerificarRut, setErrorVerificarRut] = useState<string | null>(
    null
  )
  const [pacienteExiste, setPacienteExiste] = useState<boolean | null>(null)
  const [creandoPaciente, setCreandoPaciente] = useState(false)
  const [errorAltaPaciente, setErrorAltaPaciente] = useState<ApiError | null>(
    null
  )

  async function verificarRutYAvanzar(
    rutIngresado: string,
    turnstileToken: string
  ) {
    const rutNormalizado = normalizarRutParaApi(rutIngresado)
    setRut(rutNormalizado)
    setVerificandoRut(true)
    setErrorVerificarRut(null)
    try {
      const existe = await verificarRut(rutNormalizado, turnstileToken)
      setPacienteExiste(existe)
      // Tratamiento/profesional/horario ya están elegidos antes de llegar
      // acá (identificación ahora es el paso previo a confirmar): si el
      // paciente ya existe, se avanza directo.
      if (existe) onIdentificado()
    } catch (error) {
      setPacienteExiste(null)
      setErrorVerificarRut(
        error instanceof ApiError
          ? error.message
          : "No pudimos verificar tu RUT. Intenta de nuevo."
      )
    } finally {
      setVerificandoRut(false)
    }
  }

  async function crearPacienteYAvanzar(
    datos: Omit<DatosAltaPaciente, "rut">
  ) {
    if (!rut) return
    setCreandoPaciente(true)
    setErrorAltaPaciente(null)
    try {
      await crearPaciente({ rut, ...datos })
      onIdentificado()
    } catch (error) {
      setErrorAltaPaciente(
        error instanceof ApiError
          ? error
          : new ApiError("No pudimos crear tu ficha. Intenta de nuevo.", 0)
      )
    } finally {
      setCreandoPaciente(false)
    }
  }

  function reiniciar() {
    setRut(null)
    setPacienteExiste(null)
    setErrorVerificarRut(null)
    setErrorAltaPaciente(null)
  }

  return {
    rut,
    verificandoRut,
    errorVerificarRut,
    pacienteExiste,
    verificarRutYAvanzar,
    creandoPaciente,
    errorAltaPaciente,
    crearPacienteYAvanzar,
    reiniciar,
  }
}
