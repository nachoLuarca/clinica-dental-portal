import { apiFetch } from "@/lib/http-client"
import type {
  Cita,
  DatosCrearCita,
  DisponibilidadTratamiento,
  Profesional,
  TratamientoPublico,
} from "@/types/reserva"

/**
 * Capa de acceso al flujo de reserva de `clinica-dental-api`. Ninguna
 * función de acá calcula disponibilidad ni valida choques de horario: solo
 * pide y muestra lo que la API resuelve.
 */

export async function listarTratamientosPublicos(): Promise<TratamientoPublico[]> {
  const respuesta = await apiFetch<{ data: TratamientoPublico[] }>(
    "/publico/tratamientos?per_page=100",
    { incluirClinica: true }
  )
  return respuesta.data
}

/**
 * DUDA A REPORTAR AL BACKEND: `clinica-dental-api` no expone (todavía) un
 * endpoint público para listar profesionales — solo existe
 * `GET /staff/professionals`, protegido por el guard de staff, y
 * `professional_id` es un campo **requerido** (no nullable) tanto en
 * `GET /publico/availability` como en `POST /paciente/appointments`
 * (ver `AvailabilityRequest` y `Paciente\AppointmentStoreRequest`). Sin una
 * ruta pública análoga a `/publico/tratamientos` no hay forma de que el
 * sitio del paciente muestre profesionales para elegir, ni de implementar
 * "cualquiera disponible" (que necesitaría igual conocer al menos el
 * listado para probar disponibilidad de cada uno).
 *
 * Esta función asume el endpoint que falta, siguiendo la misma convención
 * de nombres del resto del namespace `publico` (`/publico/profesionales`).
 * Mientras no exista, responde 404 y el paso "Elegir profesional" del
 * wizard lo muestra como un aviso claro en vez de inventar un
 * comportamiento (ej. slots ficticios o un profesional fijo hardcodeado).
 */
export async function listarProfesionales(): Promise<Profesional[]> {
  const respuesta = await apiFetch<{ data: Profesional[] }>(
    "/publico/profesionales",
    { incluirClinica: true }
  )
  return respuesta.data
}

interface ParametrosDisponibilidad {
  professionalId: number
  treatmentId: number
  fecha: string
}

export async function consultarDisponibilidad(
  params: ParametrosDisponibilidad
): Promise<DisponibilidadTratamiento> {
  const query = new URLSearchParams({
    professional_id: String(params.professionalId),
    treatment_id: String(params.treatmentId),
    fecha: params.fecha,
  })
  const respuesta = await apiFetch<{ data: DisponibilidadTratamiento }>(
    `/publico/availability?${query.toString()}`,
    { incluirClinica: true }
  )
  return respuesta.data
}

/**
 * Crea la cita del paciente autenticado. No se envía `X-Clinica`: el tenant
 * sale del token, igual que el resto de las rutas `auth:paciente`.
 */
export async function crearCita(datos: DatosCrearCita): Promise<Cita> {
  const respuesta = await apiFetch<{ data: Cita }>("/paciente/appointments", {
    method: "POST",
    body: datos,
    autenticado: true,
  })
  return respuesta.data
}
