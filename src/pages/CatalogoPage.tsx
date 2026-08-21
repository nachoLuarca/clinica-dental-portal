import { useEffect, useMemo, useState } from "react"
import { ServiciosGrid } from "@/components/servicios/ServiciosGrid"
import { FiltroCategorias, TODAS } from "@/components/servicios/FiltroCategorias"
import { useServicios } from "@/hooks/useServicios"
import { listarEspecialidadesPublicas } from "@/services/reservas.service"

export function CatalogoPage() {
  const { datos: servicios, cargando, error } = useServicios()
  const [especialidadActiva, setEspecialidadActiva] = useState(TODAS)

  // Las pestañas de filtro reflejan las especialidades reales del backend,
  // ya resueltas y sin duplicados por `GET /publico/especialidades` — no se
  // arma agrupando `servicios` a mano en el cliente. Un tratamiento sin
  // especialidad asignada no genera una pestaña inventada: solo aparece
  // bajo "Todos".
  const [especialidades, setEspecialidades] = useState<string[]>([])
  useEffect(() => {
    let vigente = true
    listarEspecialidadesPublicas()
      .then((lista) => {
        if (vigente) setEspecialidades(lista.map((e) => e.nombre))
      })
      .catch(() => {
        // Cosmético (pestañas de filtro): si falla, el catálogo sigue
        // mostrando todos los tratamientos sin filtro por especialidad.
      })
    return () => {
      vigente = false
    }
  }, [])

  const serviciosFiltrados = useMemo(() => {
    if (!servicios) return []
    if (especialidadActiva === TODAS) return servicios
    return servicios.filter(
      (servicio) => servicio.especialidad?.nombre === especialidadActiva
    )
  }, [servicios, especialidadActiva])

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
      <div className="max-w-2xl">
        <span className="font-mono text-xs font-medium tracking-[0.14em] text-accent uppercase">
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
        {especialidades.length > 0 && (
          <FiltroCategorias
            categorias={especialidades}
            categoriaActiva={especialidadActiva}
            onCambiarCategoria={setEspecialidadActiva}
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
