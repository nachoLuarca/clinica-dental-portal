/**
 * Forma del paciente autenticado tal como la expone `clinica-dental-api`
 * (guard `paciente`). Los campos exactos que retorna `data` no están
 * fijados en detalle en el contrato — se modela lo mínimo confirmado
 * (nombre, correo) más un índice abierto para no perder nada que la API
 * agregue a futuro.
 */
export interface Paciente {
  id: number | string
  nombre: string
  email: string
  fecha_nacimiento?: string
  /** Requerido desde que el registro público exige RUT (ver DatosRegistro). */
  rut?: string
  [campo: string]: unknown
}

export interface RespuestaAuth {
  token: string
  token_type: string
  data: Paciente
}

export interface DatosRegistro {
  nombre: string
  /**
   * Formato chileno con o sin puntos/guion, ej. "12.345.678-9". Requerido
   * por la API: sin RUT el paciente no puede usar después la gestión
   * pública de citas (RUT + fecha de nacimiento, sin login).
   */
  rut: string
  email: string
  password: string
  password_confirmation: string
  fecha_nacimiento: string
}

export interface DatosLogin {
  email: string
  password: string
}
