import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { TenantBrandingContext } from "@/context/TenantBrandingContext"
import { obtenerMarcaTenant } from "@/services/tenant.service"
import type { MarcaTenant } from "@/types/tenant"

const VARIABLES_COLOR_PRIMARIO = ["--primary", "--ring", "--sidebar-primary", "--sidebar-ring"]

/** Valida un hex simple (#rgb o #rrggbb) antes de aplicarlo como variable CSS. */
function esColorHexValido(valor: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(valor)
}

function aplicarColorPrimario(color: string | null) {
  const raiz = document.documentElement.style
  if (color && esColorHexValido(color)) {
    for (const variable of VARIABLES_COLOR_PRIMARIO) {
      raiz.setProperty(variable, color)
    }
  } else {
    for (const variable of VARIABLES_COLOR_PRIMARIO) {
      raiz.removeProperty(variable)
    }
  }
}

/**
 * Carga la marca pública del tenant (nombre, logo, color de acento) una
 * sola vez al montar la app y la deja disponible vía `useTenantBranding`.
 *
 * Es puramente cosmético: si la petición falla o todavía no responde, el
 * sitio se ve exactamente igual que con los valores por defecto del diseño
 * — no hay spinner bloqueante ni pantalla de error para esto.
 */
export function TenantBrandingProvider({ children }: { children: ReactNode }) {
  const [marca, setMarca] = useState<MarcaTenant | null>(null)

  useEffect(() => {
    let vigente = true
    obtenerMarcaTenant()
      .then((datos) => {
        if (!vigente) return
        setMarca(datos)
        aplicarColorPrimario(datos.color_primario)
      })
      .catch(() => {
        // Fallback silencioso: se mantiene el branding por defecto del sitio.
      })

    return () => {
      vigente = false
    }
  }, [])

  const valor = useMemo(() => ({ marca }), [marca])

  return <TenantBrandingContext value={valor}>{children}</TenantBrandingContext>
}
