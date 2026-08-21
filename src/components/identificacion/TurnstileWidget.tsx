import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react"
import { env } from "@/lib/env"

declare global {
  interface Window {
    turnstile?: {
      render: (
        contenedor: string | HTMLElement,
        opciones: Record<string, unknown>
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js"

/**
 * El script de Turnstile se carga una sola vez para toda la sesión de la
 * página, aunque el widget se monte y desmonte varias veces (paso
 * Identificación, paso Confirmar): sin esta memoización cada montaje
 * inyectaría un `<script>` duplicado.
 */
let cargaScript: Promise<void> | null = null

function cargarScriptTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (!cargaScript) {
    cargaScript = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("No se pudo cargar Turnstile"))
      document.head.appendChild(script)
    })
  }
  return cargaScript
}

export interface TurnstileWidgetHandle {
  /** Fuerza un nuevo desafío: el token anterior es de un solo uso. */
  reset: () => void
}

interface TurnstileWidgetProps {
  onToken: (token: string) => void
  onExpirar?: () => void
  onError?: () => void
}

/**
 * Cada paso que necesita el widget lo monta de nuevo (el wizard remonta su
 * contenido al cambiar de paso), así que un widget fresco por instancia es
 * suficiente para el caso normal; `reset` cubre reintentos dentro del mismo
 * paso (ej. la API devuelve el token como inválido/expirado).
 */
export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget({ onToken, onExpirar, onError }, ref) {
  const contenedorId = `turnstile-${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const widgetId = useRef<string | null>(null)

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.reset(widgetId.current)
      }
    },
  }))

  useEffect(() => {
    let vigente = true

    void cargarScriptTurnstile().then(() => {
      if (!vigente || !window.turnstile) return
      widgetId.current = window.turnstile.render(`#${contenedorId}`, {
        sitekey: env.turnstileSiteKey,
        callback: onToken,
        "expired-callback": onExpirar,
        "error-callback": onError,
      })
    })

    return () => {
      vigente = false
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current)
      }
    }
    // Solo al montar: `onToken`/`onExpirar`/`onError` son closures nuevas en
    // cada render, pero re-renderizar el widget en cada una descartaría el
    // desafío que el paciente ya estaba resolviendo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenedorId])

  return (
    <div className="flex justify-center">
      <div id={contenedorId} />
    </div>
  )
})
