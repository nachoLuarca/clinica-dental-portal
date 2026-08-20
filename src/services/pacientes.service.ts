import { apiFetch } from "@/lib/http-client"
import type { DatosAltaPaciente, PacientePublico } from "@/types/identificacion"

/**
 * Identificación pública de paciente (reemplaza el login por password en el
 * flujo de reserva). `verificarRut` nunca revela datos del paciente si
 * existe — solo el booleano, para no habilitar enumeración de RUTs.
 */
export async function verificarRut(
  rut: string,
  turnstileToken: string
): Promise<boolean> {
  const respuesta = await apiFetch<{ data: { existe: boolean } }>(
    "/publico/pacientes/verificar-rut",
    {
      method: "POST",
      body: { rut, turnstile_token: turnstileToken },
      incluirClinica: true,
    }
  )
  return respuesta.data.existe
}

/**
 * Alta de paciente cuando `verificarRut` respondió `existe: false`. No pide
 * un nuevo token de Turnstile: es continuación inmediata del mismo paso de
 * Identificación, ya verificado.
 */
export async function crearPaciente(
  datos: DatosAltaPaciente
): Promise<PacientePublico> {
  const respuesta = await apiFetch<{ data: PacientePublico }>(
    "/publico/pacientes",
    { method: "POST", body: datos, incluirClinica: true }
  )
  return respuesta.data
}
