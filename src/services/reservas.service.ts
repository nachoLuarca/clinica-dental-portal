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

/** Listado público de profesionales de la clínica, sin login. */
export async function listarProfesionales(): Promise<Profesional[]> {
  const respuesta = await apiFetch<{ data: Profesional[] }>(
    "/publico/profesionales",
    { incluirClinica: true }
  )
  return respuesta.data
}

interface ParametrosDisponibilidad {
  /**
   * Si se omite (o es `null`), la API agrega los slots libres de todos los
   * profesionales activos del tenant (modo "cualquiera disponible"), cada
   * uno marcado con su propio `professional_id` en `SlotDisponible`.
   */
  professionalId?: number | null
  treatmentId: number
  fecha: string
}

export async function consultarDisponibilidad(
  params: ParametrosDisponibilidad
): Promise<DisponibilidadTratamiento> {
  const query = new URLSearchParams({
    treatment_id: String(params.treatmentId),
    fecha: params.fecha,
  })
  if (params.professionalId != null) {
    query.set("professional_id", String(params.professionalId))
  }
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
