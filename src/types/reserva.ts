/**
 * Formas de datos del flujo de reserva tal como las expone
 * `clinica-dental-api`. A diferencia de `types/servicio.ts` (catálogo con
 * contenido rico, hoy mock), estos tipos reflejan el contrato real y
 * mínimo que confirma el backend (ver `AvailabilityRequest`,
 * `Paciente\AppointmentStoreRequest`, `AvailabilityService`,
 * `AppointmentService` en `clinica-dental-api`).
 */

/** Tratamiento tal como lo expone `GET /publico/tratamientos`. */
export interface TratamientoPublico {
  id: number
  nombre: string
  descripcion: string | null
  /** String decimal tal como lo serializa Laravel, ej. "25000.00". */
  precio: string
  duracion_minutos: number
  es_diferencial: boolean
  activo: boolean
}

/** Profesional tal como aparece anidado en una cita ya creada. */
export interface Profesional {
  id: number
  nombre: string
  apellido: string | null
  especialidad: string | null
}

export interface SlotDisponible {
  inicio: string
  fin: string
  /** ISO 8601, es lo que se envía tal cual en `fecha_hora` al confirmar. */
  fecha_hora: string
}

export interface DisponibilidadTratamiento {
  professional_id: number
  treatment_id: number
  fecha: string
  duracion_minutos: number
  slots: SlotDisponible[]
}

/** Slot con el profesional al que pertenece, para el modo "cualquiera disponible". */
export interface SlotConProfesional extends SlotDisponible {
  profesional: Profesional
}

export interface DatosCrearCita {
  professional_id: number
  treatment_id: number
  fecha_hora: string
  notas?: string
}

export type EstadoCita = "reservada" | "confirmada" | "cancelada" | "completada"

export interface Cita {
  id: number
  professional_id: number
  patient_id: number
  treatment_id: number
  fecha_hora: string
  fecha_hora_fin: string
  duracion_minutos: number
  estado: EstadoCita
  notas: string | null
  professional?: Profesional
  treatment?: TratamientoPublico
  [campo: string]: unknown
}
