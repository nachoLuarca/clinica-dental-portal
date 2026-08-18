/**
 * Formas de datos del flujo de reserva tal como las expone
 * `clinica-dental-api`. `TratamientoPublico` es también la fuente única
 * del catálogo (landing, `/tratamientos` y ficha de detalle): no hay un
 * tipo de catálogo separado, todo consume el mismo contrato real que
 * confirma el backend (ver `AvailabilityRequest`,
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
  categoria: string
  /** Qué incluye la sesión/tratamiento, para la ficha de detalle. */
  incluye: string[]
  /** Identificador legible en URL, autogenerado y único por clínica. */
  slug: string
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
  /**
   * Solo viene presente cuando se consulta `GET /publico/availability` sin
   * `professional_id` (modo "cualquiera disponible"): indica qué profesional
   * cubre ese slot específico, porque la API agrega los slots libres de
   * todo el equipo en una sola lista.
   */
  professional_id?: number
}

/** `professional_id` es `null` cuando la consulta se hizo sin especificarlo. */
export interface DisponibilidadTratamiento {
  professional_id: number | null
  treatment_id: number
  fecha: string
  duracion_minutos: number
  slots: SlotDisponible[]
}

/** Slot con el profesional al que pertenece, resuelto en el frontend para mostrarlo. */
export interface SlotConProfesional extends SlotDisponible {
  profesional: Profesional
}

export interface DatosCrearCita {
  /**
   * Opcional: si se omite, la API auto-asigna el primer profesional activo
   * con ese horario libre. Este wizard igual lo manda siempre, porque ya
   * sabe exactamente qué profesional cubre el slot elegido (mostrado en el
   * paso de horario) y no quiere arriesgarse a que la API asigne a otro.
   */
  professional_id?: number
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
