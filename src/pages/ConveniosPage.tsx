import { ConveniosGrid } from "@/components/convenios/ConveniosGrid"
import { useConvenios } from "@/hooks/useConvenios"

export function ConveniosPage() {
  const { datos: convenios, cargando, error } = useConvenios()

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
      <div className="max-w-2xl">
        <span className="font-mono text-xs font-medium tracking-[0.14em] text-accent uppercase">
          Convenios
        </span>
        <h1 className="mt-2 font-heading text-3xl font-medium sm:text-4xl">
          Trabajamos con estos convenios
        </h1>
        <p className="mt-3 text-muted-foreground">
          Esta información es referencial: la cobertura exacta depende del
          plan de cada paciente. Confírmala con tu convenio antes de tu hora.
        </p>
      </div>

      <div className="mt-8">
        {error ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            {error}
          </p>
        ) : (
          <ConveniosGrid convenios={convenios ?? []} cargando={cargando} />
        )}

        {!cargando && !error && convenios?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Todavía no hay convenios publicados.
          </p>
        )}
      </div>
    </section>
  )
}
