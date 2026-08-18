import { apiFetch } from "@/lib/http-client"
import type { MarcaTenant } from "@/types/tenant"

/**
 * Capa de acceso a la marca pública del tenant activo (nombre, logo, color
 * de acento). La resuelve siempre la API/el portal admin: acá solo se pide
 * y se aplica a la UI, sin inventar valores por defecto propios del sitio.
 */
export async function obtenerMarcaTenant(): Promise<MarcaTenant> {
  const respuesta = await apiFetch<{ data: MarcaTenant }>("/publico/tenant", {
    incluirClinica: true,
  })
  return respuesta.data
}
