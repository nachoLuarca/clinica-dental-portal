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
  [campo: string]: unknown
}

export interface RespuestaAuth {
  token: string
  token_type: string
  data: Paciente
}

export interface DatosRegistro {
  nombre: string
  email: string
  password: string
  password_confirmation: string
  fecha_nacimiento: string
}

export interface DatosLogin {
  email: string
  password: string
}
