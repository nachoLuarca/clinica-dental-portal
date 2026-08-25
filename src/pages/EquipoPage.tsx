import { EquipoGrid } from "@/components/equipo/EquipoGrid"
import { useEquipoProfesional } from "@/hooks/useEquipoProfesional"

export function EquipoPage() {
  const { datos: profesionales, cargando, error } = useEquipoProfesional()

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
      <div className="max-w-2xl">
        <span className="font-mono text-xs font-medium tracking-[0.14em] text-accent uppercase">
          Equipo
        </span>
        <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">
          Nuestro equipo profesional
        </h1>
        <p className="mt-3 text-muted-foreground">
          Conoce a los profesionales de la clínica y reserva hora
          directamente con quien prefieras.
        </p>
      </div>

      <div className="mt-8">
        {error ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {error}
          </p>
        ) : (
          <EquipoGrid profesionales={profesionales ?? []} cargando={cargando} />
        )}

        {!cargando && !error && profesionales?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no hay profesionales publicados.
          </p>
        )}
      </div>
    </section>
  )
}
