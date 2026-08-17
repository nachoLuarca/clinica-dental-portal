import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

/**
 * Protege rutas que requieren sesión de paciente. Mientras se hidrata la
 * sesión (token guardado -> /paciente/me) no redirige de inmediato para
 * evitar un parpadeo hacia /ingresar en cada recarga de página.
 */
export function RutaProtegida() {
  const { autenticado, cargandoSesion } = useAuth()
  const ubicacion = useLocation()

  if (cargandoSesion) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando tu sesión...</p>
      </div>
    )
  }

  if (!autenticado) {
    const destino = `${ubicacion.pathname}${ubicacion.search}`
    return <Navigate to={`/ingresar?next=${encodeURIComponent(destino)}`} replace />
  }

  return <Outlet />
}
