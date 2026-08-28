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
 * `sucursalId` acota además a los profesionales de esa sede — ambos filtros
 * son combinables.
 */
export async function listarProfesionales(
  treatmentId?: number,
  sucursalId?: number
): Promise<Profesional[]> {
  const query = new URLSearchParams()
  if (treatmentId != null) query.set("treatment_id", String(treatmentId))
  if (sucursalId != null) query.set("sucursal_id", String(sucursalId))
  const queryString = query.toString()
  const respuesta = await apiFetch<{ data: Profesional[] }>(
    `/publico/profesionales${queryString ? `?${queryString}` : ""}`,
    { incluirClinica: true }
  )
  return respuesta.data
}

/**
 * Exactamente uno de `treatmentId`/`especialidadId` va, nunca ambos (mismo
 * contrato que exige `AvailabilityRequest` en la API — 422 si mandás los
 * dos o ninguno). Con `especialidadId`, la API usa la duración del
 * tratamiento activo más largo de esa especialidad para generar los slots
 * (cualquier tratamiento puntual que el paciente termine eligiendo en
 * Confirmar entra en ese horario, sin riesgo de 409 por duración — solo por
 * carrera real entre dos pacientes). `professionalId` explícito exige
 * `treatmentId` del lado de la API (no combina con `especialidadId`): este
 * wizard nunca manda ambos a la vez, ver `useReservaWizard.buscarDisponibilidad`.
 */
type ParametrosDisponibilidad = {
  professionalId?: number | null
  fecha: string
  /** Solo tiene efecto en modo "cualquiera disponible" (sin `professionalId`). */
  sucursalId?: number | null
} & ({ treatmentId: number; especialidadId?: undefined } | {
  treatmentId?: undefined
  especialidadId: number
})

export async function consultarDisponibilidad(
  params: ParametrosDisponibilidad
): Promise<DisponibilidadTratamiento> {
  const query = new URLSearchParams({ fecha: params.fecha })
  if (params.treatmentId != null) {
    query.set("treatment_id", String(params.treatmentId))
  } else {
    query.set("especialidad_id", String(params.especialidadId))
  }
  if (params.professionalId != null) {
    query.set("professional_id", String(params.professionalId))
  }
  if (params.sucursalId != null) {
    query.set("sucursal_id", String(params.sucursalId))
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
