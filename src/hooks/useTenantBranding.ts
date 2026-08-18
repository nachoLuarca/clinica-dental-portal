import { use } from "react"
import { TenantBrandingContext } from "@/context/TenantBrandingContext"

/**
 * Marca pública del tenant activo. `marca` es `null` mientras carga o si el
 * fetch falló — los consumidores deben tener siempre un fallback genérico
 * para ese caso, nunca asumir que la marca está disponible.
 */
export function useTenantBranding() {
  return use(TenantBrandingContext)
}
