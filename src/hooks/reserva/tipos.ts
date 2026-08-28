/**
 * Tres puertas de entrada (estilo Dentalink) que convergen en la misma
 * pantalla de disponibilidad:
 * - "especialidad": lista de especialidades del catálogo.
 * - "profesional": elegir con quién atenderse primero; si cubre más de una
 *   especialidad, elige cuál buscar (si cubre solo una, se salta ese paso).
 * - "sucursal": elegir sede primero; de ahí en más sigue el mismo camino que
 *   "especialidad" pero con `sucursal_id` acotando profesionales/horarios.
 *
 * A propósito, ninguna de las tres pide un TRATAMIENTO puntual de entrada —
 * la disponibilidad se consulta por especialidad (`GET /publico/availability
 * ?especialidad_id=`, la API usa la duración del tratamiento más largo de
 * esa especialidad para generar los slots) y el tratamiento exacto recién se
 * elige después de reservar un horario, en el paso "tratamiento-especifico".
 * Solo cuando el paciente llega desde la ficha de un tratamiento puntual del
 * catálogo (`/tratamientos/:slug` → "Reservar este tratamiento", atajo
 * `?servicio=`) el tratamiento ya viene fijo desde el arranque y ese paso se
 * salta entero — por eso los tratamientos "sin especialidad asignada"
 * (`otrosTratamientos` en versiones anteriores de este hook) solo son
 * reservables desde ese atajo: no tienen especialidad con la que resolver
 * disponibilidad en las otras tres puertas de entrada.
 */
export type EntradaReserva = "especialidad" | "profesional" | "sucursal"

export type PasoReserva =
  | "inicio"
  | "sucursal-lista"
  | "especialidad-lista"
  | "profesional-lista"
  | "disponibilidad"
  | "tratamiento-especifico"
  | "identificacion"
  | "confirmar"
  | "exito"

export const PASOS_POR_ENTRADA: Record<
  EntradaReserva,
  { id: PasoReserva; titulo: string }[]
> = {
  especialidad: [
    { id: "especialidad-lista", titulo: "Especialidad" },
    { id: "disponibilidad", titulo: "Disponibilidad" },
    { id: "tratamiento-especifico", titulo: "Tratamiento" },
    { id: "identificacion", titulo: "Identificación" },
    { id: "confirmar", titulo: "Confirmar" },
  ],
  profesional: [
    { id: "profesional-lista", titulo: "Profesional" },
    { id: "especialidad-lista", titulo: "Especialidad" },
    { id: "disponibilidad", titulo: "Disponibilidad" },
    { id: "tratamiento-especifico", titulo: "Tratamiento" },
    { id: "identificacion", titulo: "Identificación" },
    { id: "confirmar", titulo: "Confirmar" },
  ],
  sucursal: [
    { id: "sucursal-lista", titulo: "Sucursal" },
    { id: "especialidad-lista", titulo: "Especialidad" },
    { id: "disponibilidad", titulo: "Disponibilidad" },
    { id: "tratamiento-especifico", titulo: "Tratamiento" },
    { id: "identificacion", titulo: "Identificación" },
    { id: "confirmar", titulo: "Confirmar" },
  ],
}
