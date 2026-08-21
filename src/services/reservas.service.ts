import { apiFetch } from "@/lib/http-client"
import type {
  Cita,
  DatosCrearCitaPublica,
  DisponibilidadTratamiento,
  EspecialidadPublica,
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
 * Especialidades con sus tratamientos activos y cantidad de profesionales
 * que las cubren, ya agrupado y contado por el backend en una sola query.
 * Reemplaza el patrón anterior de agrupar tratamientos por especialidad y
 * pedir profesionales por cada una para contar cuántos hay.
 */
export async function listarEspecialidadesPublicas(): Promise<
  EspecialidadPublica[]
> {
  const respuesta = await apiFetch<{ data: EspecialidadPublica[] }>(
    "/publico/especialidades",
    { incluirClinica: true }
  )
  return respuesta.data
}

/**
 * Listado público de profesionales de la clínica, sin login. Si se pasa
 * `treatmentId`, la API devuelve solo los profesionales cuya especialidad
 * cubre la categoría de ese tratamiento (mismo shape que sin filtro).
 */
export async function listarProfesionales(
  treatmentId?: number
): Promise<Profesional[]> {
  const query =
    treatmentId != null ? `?treatment_id=${treatmentId}` : ""
  const respuesta = await apiFetch<{ data: Profesional[] }>(
    `/publico/profesionales${query}`,
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
 * Crea la cita identificando al paciente por RUT + Turnstile (sin sesión).
 * Reemplaza el flujo antiguo de `/paciente/appointments`, que requería
 * login por password.
 */
export async function crearCitaPublica(
  datos: DatosCrearCitaPublica
): Promise<Cita> {
  const respuesta = await apiFetch<{ data: Cita }>("/publico/citas", {
    method: "POST",
    body: datos,
    incluirClinica: true,
  })
  return respuesta.data
}

interface IdentificacionPaciente {
  rut: string
  fechaNacimiento: string
}

/**
 * Gestión de citas SIN sesión (Módulo 5): el paciente se identifica con
 * RUT + fecha de nacimiento en cada llamada (nunca se guarda un token). La
 * API resuelve al paciente con ese par y responde 422 genérico si no
 * calzan, sin distinguir "RUT inexistente" de "fecha incorrecta" — acá
 * solo se propaga ese mensaje, no se agrega lógica propia de validación.
 */
export async function buscarCitasPorRut({
  rut,
  fechaNacimiento,
}: IdentificacionPaciente): Promise<Cita[]> {
  const query = new URLSearchParams({
    rut,
    fecha_nacimiento: fechaNacimiento,
    per_page: "50",
  })
  const respuesta = await apiFetch<{ data: Cita[] }>(
    `/publico/citas?${query.toString()}`,
    { incluirClinica: true }
  )
  return respuesta.data
}

export async function cancelarCitaPorRut(
  citaId: number,
  { rut, fechaNacimiento }: IdentificacionPaciente
): Promise<Cita> {
  const query = new URLSearchParams({
    rut,
    fecha_nacimiento: fechaNacimiento,
  })
  const respuesta = await apiFetch<{ data: Cita }>(
    `/publico/citas/${citaId}?${query.toString()}`,
    { method: "DELETE", incluirClinica: true }
  )
  return respuesta.data
}
