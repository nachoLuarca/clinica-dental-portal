import { env } from "@/lib/env"
import { obtenerToken } from "@/lib/session"

const TIMEOUT_MS_POR_DEFECTO = 10_000

/**
 * Error de la capa HTTP. Distingue entre:
 * - Errores de red/timeout (status 0): mensaje genérico propio, en español.
 * - Errores de la API (status >= 400): el mensaje viene DIRECTO de la API
 *   (`body.message`), sin traducir ni reformular, según el handoff. `errors`
 *   trae el detalle de validación por campo (formato estándar de Laravel).
 */
export class ApiError extends Error {
  readonly status: number
  readonly errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }

  /** Primer mensaje de validación de un campo puntual, si existe. */
  errorDeCampo(campo: string): string | undefined {
    return this.errors?.[campo]?.[0]
  }
}

interface OpcionesPeticion {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  /** Adjunta el header `Authorization: Bearer <token>` de la sesión actual. */
  autenticado?: boolean
  /** Adjunta el header `X-Clinica` con el slug del tenant (rutas públicas). */
  incluirClinica?: boolean
  headers?: Record<string, string>
  timeoutMs?: number
}

async function extraerCuerpoError(response: Response): Promise<{
  message: string
  errors?: Record<string, string[]>
}> {
  try {
    const cuerpo = await response.json()
    return {
      message:
        typeof cuerpo?.message === "string"
          ? cuerpo.message
          : `Ocurrió un error inesperado (${response.status}).`,
      errors: cuerpo?.errors,
    }
  } catch {
    return { message: `Ocurrió un error inesperado (${response.status}).` }
  }
}

/**
 * Cliente HTTP centralizado para `clinica-dental-api`. Capa reusable por
 * todos los módulos del sitio (auth, reserva, gestión por RUT) — evita
 * `fetch` disperso y homogeniza el manejo de errores y timeouts.
 */
export async function apiFetch<T>(
  path: string,
  opciones: OpcionesPeticion = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    autenticado = false,
    incluirClinica = false,
    headers = {},
    timeoutMs = TIMEOUT_MS_POR_DEFECTO,
  } = opciones

  const controlador = new AbortController()
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs)

  const cabeceras: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  }

  if (body !== undefined) {
    cabeceras["Content-Type"] = "application/json"
  }

  if (incluirClinica) {
    cabeceras["X-Clinica"] = env.clinicaSlug
  }

  if (autenticado) {
    const token = obtenerToken()
    if (token) {
      cabeceras.Authorization = `Bearer ${token}`
    }
  }

  let response: Response
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: cabeceras,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controlador.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("La solicitud tardó demasiado. Intenta de nuevo.", 0)
    }
    throw new ApiError(
      "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
      0
    )
  } finally {
    clearTimeout(temporizador)
  }

  if (!response.ok) {
    const { message, errors } = await extraerCuerpoError(response)
    throw new ApiError(message, response.status, errors)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
