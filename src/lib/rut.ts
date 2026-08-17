/**
 * Utilidades de RUT chileno, compartidas por el registro de paciente (Auth)
 * y, a futuro, por la gestión pública de horas por RUT (Módulo 5).
 *
 * El regex replica EXACTO el que exige `clinica-dental-api` en
 * `PatientRegisterRequest` (`^\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]$`) para dar
 * feedback inmediato en el formulario — la validación real y definitiva
 * siempre la hace la API. No se valida dígito verificador (módulo 11): el
 * contrato del backend solo exige el formato, no el checksum.
 */
const REGEX_RUT = /^\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]$/

/** Deja solo dígitos y el dígito verificador (K/k), en mayúscula. */
export function limpiarRut(valor: string): string {
  return valor.replace(/[^0-9kK]/g, "").toUpperCase()
}

export function esRutValido(rut: string): boolean {
  return REGEX_RUT.test(rut.trim())
}

/** Aplica formato "XX.XXX.XXX-X" a medida que el usuario escribe. */
export function formatearRut(valor: string): string {
  const limpio = limpiarRut(valor).slice(0, 9)
  if (limpio.length <= 1) return limpio

  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  return `${cuerpoConPuntos}-${dv}`
}
