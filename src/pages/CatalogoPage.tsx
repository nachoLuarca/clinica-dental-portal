import { useMemo, useState } from "react"
import { ServiciosGrid } from "@/components/servicios/ServiciosGrid"
import { FiltroCategorias, TODAS } from "@/components/servicios/FiltroCategorias"
import { useServicios } from "@/hooks/useServicios"

export function CatalogoPage() {
  const { datos: servicios, cargando, error } = useServicios()
  const [categoriaActiva, setCategoriaActiva] = useState(TODAS)

  const categorias = useMemo(() => {
    if (!servicios) return []
    return Array.from(new Set(servicios.map((servicio) => servicio.categoria)))
  }, [servicios])

  const serviciosFiltrados = useMemo(() => {
    if (!servicios) return []
    if (categoriaActiva === TODAS) return servicios
    return servicios.filter((servicio) => servicio.categoria === categoriaActiva)
  }, [servicios, categoriaActiva])

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
      <div className="max-w-2xl">
        <span className="text-xs font-medium tracking-wide text-accent uppercase">
          Catálogo
        </span>
        <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">
          Todos nuestros tratamientos
        </h1>
        <p className="mt-3 text-muted-foreground">
          Precios de referencia — el valor final puede variar según el
          diagnóstico de tu profesional. Elige un tratamiento para ver el
          detalle y reservar.
        </p>
      </div>

      <div className="mt-8">
        {categorias.length > 0 && (
          <FiltroCategorias
            categorias={categorias}
            categoriaActiva={categoriaActiva}
            onCambiarCategoria={setCategoriaActiva}
          />
        )}
      </div>

      <div className="mt-8">
        {error ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {error}
          </p>
        ) : (
          <ServiciosGrid servicios={serviciosFiltrados} cargando={cargando} />
        )}
      </div>
    </section>
  )
}
