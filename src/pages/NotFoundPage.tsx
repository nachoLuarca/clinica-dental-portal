import { Link } from "react-router-dom"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Compass className="size-6" />
      </span>
      <h1 className="font-heading text-2xl font-medium">
        No encontramos esta página
      </h1>
      <p className="text-muted-foreground">
        Puede que el enlace esté mal escrito o ya no exista. Vuelve al inicio
        para seguir navegando.
      </p>
      <Button asChild className="rounded-full">
        <Link to="/">Volver al inicio</Link>
      </Button>
    </section>
  )
}
