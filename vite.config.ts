import path from "node:path"
import { defineConfig, loadEnv, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

/**
 * Inyecta el origen (scheme+host+puerto, sin path) de `VITE_API_BASE_URL` en
 * `index.html`, para la meta CSP (`connect-src`). No se usa la sintaxis
 * `%VITE_API_BASE_URL%` de reemplazo de env de Vite porque `connect-src`
 * necesita el origen puro: un source-expression con path (`.../api`) en
 * Chrome solo matchea ESE path exacto por prefijo de directorio, no matchea
 * subrutas como `/api/publico/tenant` ni siquiera agregando un comodin
 * `/api/*` al final (verificado manualmente, se comporta distinto de lo que
 * documenta el spec) — terminaba bloqueando todas las llamadas reales a la
 * API. Con el origen solo (sin path) no hay ese problema.
 */
function inyectarOrigenApi(apiBaseUrl: string): Plugin {
  const origen = new URL(apiBaseUrl).origin
  return {
    name: "inyectar-origen-api",
    transformIndexHtml(html) {
      return html.replace(/__API_ORIGIN__/g, origen)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiBaseUrl = env.VITE_API_BASE_URL || "http://127.0.0.1:8081/api"

  return {
    plugins: [react(), tailwindcss(), inyectarOrigenApi(apiBaseUrl)],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      port: 5175,
    },
  }
})
