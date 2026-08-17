/**
 * Persistencia del token de sesión del paciente en `localStorage`.
 *
 * Capa aislada a propósito: si en el futuro se cambia el mecanismo de
 * almacenamiento (por ejemplo a cookies httpOnly manejadas por la API),
 * solo este archivo debería tocarse.
 */
const TOKEN_KEY = "clinica_paciente_token"

export function obtenerToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function guardarToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Almacenamiento no disponible (modo privado, cuotas, etc.): la sesión
    // simplemente no persiste entre recargas, pero la app sigue funcionando.
  }
}

export function limpiarToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Ver nota en guardarToken.
  }
}
