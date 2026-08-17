import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiciosGrid } from "@/components/servicios/ServiciosGrid"
import { useServiciosDestacados } from "@/hooks/useServicios"

export function ServiciosDestacados() {
  const { datos: servicios, cargando, error } = useServiciosDestacados()

  return (
    <section className="bg-muted/60 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-medium sm:text-4xl">
              Tratamientos más solicitados
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Una muestra de lo que puedes reservar ahora mismo.
            </p>
          </div>
          <Button asChild variant="ghost" className="w-fit gap-1.5 rounded-full">
            <Link to="/tratamientos">
              Ver catálogo completo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10">
          {error ? (
            <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
              {error}
            </p>
          ) : (
            <ServiciosGrid servicios={servicios ?? []} cargando={cargando} />
          )}
        </div>
      </div>
    </section>
  )
}
