import { apiFetch } from "@/lib/http-client"
import { env } from "@/lib/env"
import type {
  DatosLogin,
  DatosRegistro,
  Paciente,
  RespuestaAuth,
} from "@/types/paciente"

/**
 * Capa de acceso a la autenticación de paciente de `clinica-dental-api`
 * (guard `paciente`). El slug de la clínica se envía en el body, tal como
 * lo exige el contrato de estas rutas (a diferencia de las rutas públicas
 * de catálogo/disponibilidad, que lo resuelven vía header `X-Clinica`).
 */

export async function registrarPaciente(
  datos: DatosRegistro
): Promise<RespuestaAuth> {
  return apiFetch<RespuestaAuth>("/paciente/register", {
    method: "POST",
    body: { clinica: env.clinicaSlug, ...datos },
  })
}

export async function iniciarSesionPaciente(
  datos: DatosLogin
): Promise<RespuestaAuth> {
  return apiFetch<RespuestaAuth>("/paciente/login", {
    method: "POST",
    body: { clinica: env.clinicaSlug, ...datos },
  })
}

export async function obtenerPacienteActual(): Promise<Paciente> {
  const respuesta = await apiFetch<{ data: Paciente }>("/paciente/me", {
    autenticado: true,
  })
  return respuesta.data
}

export async function cerrarSesionPaciente(): Promise<void> {
  await apiFetch<void>("/paciente/logout", {
    method: "POST",
    autenticado: true,
  })
}
