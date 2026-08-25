import { SucursalesGrid } from "@/components/sucursales/SucursalesGrid"
import { useSucursales } from "@/hooks/useSucursales"

export function SucursalesPage() {
  const { datos: sucursales, cargando, error } = useSucursales()

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
      <div className="max-w-2xl">
        <span className="font-mono text-xs font-medium tracking-[0.14em] text-accent uppercase">
          Sucursales
        </span>
        <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">
          Dónde atendemos
        </h1>
        <p className="mt-3 text-muted-foreground">
          Dirección, teléfono y horario de cada sede.
        </p>
      </div>

      <div className="mt-8">
        {error ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {error}
          </p>
        ) : (
          <SucursalesGrid sucursales={sucursales ?? []} cargando={cargando} />
        )}

        {!cargando && !error && sucursales?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no hay sucursales publicadas.
          </p>
        )}
      </div>
    </section>
  )
}
