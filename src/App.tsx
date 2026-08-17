import { Route, Routes } from "react-router-dom"
import { SiteLayout } from "@/components/layout/SiteLayout"
import { RutaProtegida } from "@/components/auth/RutaProtegida"
import { LandingPage } from "@/pages/LandingPage"
import { CatalogoPage } from "@/pages/CatalogoPage"
import { ServicioDetallePage } from "@/pages/ServicioDetallePage"
import { IngresarPage } from "@/pages/IngresarPage"
import { RegistroPage } from "@/pages/RegistroPage"
import { CuentaPage } from "@/pages/CuentaPage"
import { ProximamentePage } from "@/pages/ProximamentePage"
import { NotFoundPage } from "@/pages/NotFoundPage"

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="tratamientos" element={<CatalogoPage />} />
        <Route path="tratamientos/:slug" element={<ServicioDetallePage />} />
        <Route
          path="reservar"
          element={
            <ProximamentePage
              titulo="El flujo de reserva está en construcción"
              descripcion="Muy pronto vas a poder elegir profesional, ver disponibilidad en tiempo real y confirmar tu hora aquí mismo."
            />
          }
        />
        <Route
          path="mis-horas"
          element={
            <ProximamentePage
              titulo="Gestión de horas por RUT en construcción"
              descripcion="Muy pronto vas a poder ingresar tu RUT para ver tus horas pedidas y cancelarlas si lo necesitas."
            />
          }
        />
        <Route path="ingresar" element={<IngresarPage />} />
        <Route path="registro" element={<RegistroPage />} />
        <Route element={<RutaProtegida />}>
          <Route path="cuenta" element={<CuentaPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
