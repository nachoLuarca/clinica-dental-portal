import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { SiteLayout } from "@/components/layout/SiteLayout"
import { RutaProtegida } from "@/components/auth/RutaProtegida"
import { NotFoundPage } from "@/pages/NotFoundPage"

// Paginas cargadas por separado (code-splitting por ruta): el bundle
// principal solo trae layout/routing, cada pagina se pide al navegar a
// ella. NotFoundPage queda fuera de este grupo porque es el fallback de
// "*" y conviene que este siempre disponible sin una carga extra.
const LandingPage = lazy(() =>
  import("@/pages/LandingPage").then((m) => ({ default: m.LandingPage }))
)
const CatalogoPage = lazy(() =>
  import("@/pages/CatalogoPage").then((m) => ({ default: m.CatalogoPage }))
)
const ServicioDetallePage = lazy(() =>
  import("@/pages/ServicioDetallePage").then((m) => ({
    default: m.ServicioDetallePage,
  }))
)
const ConveniosPage = lazy(() =>
  import("@/pages/ConveniosPage").then((m) => ({ default: m.ConveniosPage }))
)
const SucursalesPage = lazy(() =>
  import("@/pages/SucursalesPage").then((m) => ({
    default: m.SucursalesPage,
  }))
)
const EquipoPage = lazy(() =>
  import("@/pages/EquipoPage").then((m) => ({ default: m.EquipoPage }))
)
const IngresarPage = lazy(() =>
  import("@/pages/IngresarPage").then((m) => ({ default: m.IngresarPage }))
)
const RegistroPage = lazy(() =>
  import("@/pages/RegistroPage").then((m) => ({ default: m.RegistroPage }))
)
const CuentaPage = lazy(() =>
  import("@/pages/CuentaPage").then((m) => ({ default: m.CuentaPage }))
)
const ReservaPage = lazy(() =>
  import("@/pages/ReservaPage").then((m) => ({ default: m.ReservaPage }))
)
const MisHorasPage = lazy(() =>
  import("@/pages/MisHorasPage").then((m) => ({ default: m.MisHorasPage }))
)

function CargandoPagina() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<CargandoPagina />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="tratamientos" element={<CatalogoPage />} />
          <Route path="tratamientos/:slug" element={<ServicioDetallePage />} />
          <Route path="convenios" element={<ConveniosPage />} />
          <Route path="sucursales" element={<SucursalesPage />} />
          <Route path="equipo" element={<EquipoPage />} />
          <Route path="reservar" element={<ReservaPage />} />
          <Route path="mis-horas" element={<MisHorasPage />} />
          <Route path="ingresar" element={<IngresarPage />} />
          <Route path="registro" element={<RegistroPage />} />
          <Route element={<RutaProtegida />}>
            <Route path="cuenta" element={<CuentaPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
