import { Link } from "react-router-dom"
import { HourglassIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProximamentePageProps {
  titulo: string
  descripcion: string
}

/**
 * Placeholder honesto para rutas de módulos que todavía no se construyen
 * en esta sesión (auth, flujo de reserva, gestión por RUT). Evita links
 * muertos mientras esos módulos no están listos.
 */
export function ProximamentePage({ titulo, descripcion }: ProximamentePageProps) {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <HourglassIcon className="size-6" />
      </span>
      <h1 className="font-heading text-2xl font-medium">{titulo}</h1>
      <p className="text-muted-foreground">{descripcion}</p>
      <Button asChild variant="outline" className="rounded-full">
        <Link to="/">Volver al inicio</Link>
      </Button>
    </section>
  )
}
