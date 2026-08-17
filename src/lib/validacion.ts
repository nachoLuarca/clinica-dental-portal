/** Validaciones de cliente para los formularios de auth de paciente.
 *
 * Reflejan las mismas reglas mínimas que ya exige la API (email válido,
 * password de 8+ caracteres, fecha de nacimiento pasada) para dar feedback
 * inmediato — la validación real y definitiva siempre la hace la API.
 */

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function esEmailValido(email: string): boolean {
  return REGEX_EMAIL.test(email.trim())
}

export function esPasswordValida(password: string): boolean {
  return password.length >= 8
}

export function esFechaNacimientoValida(fecha: string): boolean {
  if (!fecha) return false
  const fechaIngresada = new Date(`${fecha}T00:00:00`)
  if (Number.isNaN(fechaIngresada.getTime())) return false
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return fechaIngresada < hoy
}
