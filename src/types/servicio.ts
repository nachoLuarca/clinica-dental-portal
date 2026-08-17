/**
 * Forma de un servicio/tratamiento tal como lo expone (o deberá exponer)
 * el catálogo público de `clinica-dental-api`.
 *
 * Esta interfaz es el contrato que usan tanto el mock temporal
 * (`src/data/servicios.mock.ts`) como, a futuro, el cliente real de la API.
 * Mientras esos campos no cambien, las páginas no deberían tocarse al
 * migrar de mock a datos reales.
 */
export interface Servicio {
  id: string
  /** Identificador legible en URL, ej. "limpieza-dental" */
  slug: string
  nombre: string
  categoria: string
  /** Texto corto para tarjetas de listado (1-2 líneas) */
  resumen: string
  /** Texto largo para la ficha de detalle */
  descripcion: string
  duracionMinutos: number
  /**
   * Precio de referencia en pesos chilenos. Es un valor "desde": el valor
   * final puede variar según diagnóstico profesional (esto lo resuelve la
   * clínica, no se recalcula en este frontend).
   */
  precioDesdeClp: number
  /** Qué incluye la sesión/tratamiento, para la ficha de detalle */
  incluye: string[]
  /** Se usa para elegir qué tratamientos destacar en la landing */
  destacado: boolean
}
