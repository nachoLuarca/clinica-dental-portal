import { createContext } from "react"
import type { MarcaTenant } from "@/types/tenant"

export interface TenantBrandingContextValue {
  /** null mientras carga o si la marca no está disponible: la UI usa el fallback genérico. */
  marca: MarcaTenant | null
}

export const TenantBrandingContext = createContext<TenantBrandingContextValue>({
  marca: null,
})
