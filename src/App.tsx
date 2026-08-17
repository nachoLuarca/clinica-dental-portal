import { CalendarCheck, Sparkles, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * Pantalla de verificación del sistema de diseño (Módulo 1 — Setup).
 * Sirve para confirmar que paleta, tipografía, iconografía y componentes
 * base de shadcn quedaron correctamente integrados antes de construir
 * el catálogo real de tratamientos (Módulo 2).
 */
function App() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
        <Badge className="gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-secondary-foreground">
          <Sparkles className="size-3.5" />
          Sistema de diseño listo
        </Badge>

        <h1 className="text-4xl leading-tight font-medium text-balance sm:text-5xl">
          Tu próxima sonrisa empieza con una hora bien tomada
        </h1>

        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          Base del portal de pacientes: paleta propia, tipografía con
          carácter y componentes listos para construir el catálogo de
          tratamientos y el flujo de reserva.
        </p>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button size="lg" className="gap-2 rounded-full px-6">
            <CalendarCheck className="size-4" />
            Reservar hora
          </Button>
          <Button size="lg" variant="outline" className="gap-2 rounded-full px-6">
            <Smile className="size-4" />
            Ver tratamientos
          </Button>
        </div>

        <Card className="mt-10 w-full border-border/60">
          <CardContent className="flex flex-col gap-2 p-6 text-left">
            <span className="font-heading text-lg text-primary">
              Menta profunda + Damasco
            </span>
            <span className="text-sm text-muted-foreground">
              Paleta propia de la clínica, tipografía Fraunces + Plus Jakarta
              Sans e iconografía Lucide como sistema consistente.
            </span>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default App
