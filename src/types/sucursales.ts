/**
 * Franja horaria de un día de la semana. `dia_semana` va de 1 (lunes) a 7
 * (domingo) — ASUNCIÓN: la API no documenta explícitamente la convención,
 * se asume ISO-8601 (lunes = 1) porque es la que usa el resto del stack
 * PHP/Carbon. Un día sin fila = cerrado ese día.
 */
export interface HorarioSucursal {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

/** Sucursal tal como la expone `GET /publico/sucursales`. */
export interface Sucursal {
  id: number
  nombre: string
  direccion: string
  comuna: string
  telefono: string
  horarios: HorarioSucursal[]
}
