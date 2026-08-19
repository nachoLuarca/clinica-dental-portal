import { Link } from "react-router-dom"
import { CalendarHeart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaBanner() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-4xl bg-gradient-to-br from-primary to-[#0a3d36] px-6 py-14 text-center text-primary-foreground sm:px-12">
        <span className="flex size-14 items-center justify-center rounded-full bg-white/10">
          <CalendarHeart className="size-6" />
        </span>
        <h2 className="max-w-lg font-heading text-3xl font-medium text-balance sm:text-4xl">
          Tu próxima hora dental está a un par de clics
        </h2>
        <p className="max-w-md text-primary-foreground/80">
          Sin llamadas, sin esperar en línea. Elige tratamiento, horario y
          listo.
        </p>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="gap-2 rounded-full bg-accent px-7 text-accent-foreground hover:bg-accent/90"
        >
          <Link to="/reservar">Reservar mi hora</Link>
        </Button>
      </div>
    </section>
  )
}
