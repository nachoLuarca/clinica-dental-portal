import { Link } from "react-router-dom"
import { CalendarCheck, LogOut, Ticket, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export function CuentaPage() {
  const { paciente, cerrarSesion } = useAuth()

  return (
    <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="size-6" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">Hola de nuevo</p>
          <h1 className="font-heading text-2xl font-medium text-balance sm:text-3xl">
            {paciente?.nombre ?? "Tu cuenta"}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/tratamientos"
          className="flex flex-col gap-3 rounded-3xl bg-card p-6 ring-1 ring-border/70 transition-colors hover:ring-primary/40"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarCheck className="size-5" />
          </span>
          <p className="font-heading text-lg font-medium">Reservar una hora</p>
          <p className="text-sm text-muted-foreground">
            Elige un tratamiento y busca disponibilidad en tiempo real.
          </p>
        </Link>

        <Link
          to="/mis-horas"
          className="flex flex-col gap-3 rounded-3xl bg-card p-6 ring-1 ring-border/70 transition-colors hover:ring-primary/40"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Ticket className="size-5" />
          </span>
          <p className="font-heading text-lg font-medium">Mis horas</p>
          <p className="text-sm text-muted-foreground">
            Revisa y administra tus reservas pedidas.
          </p>
        </Link>
      </div>

      <Button
        variant="outline"
        className="mt-8 gap-2 rounded-full"
        onClick={() => {
          void cerrarSesion()
        }}
      >
        <LogOut className="size-4" />
        Cerrar sesión
      </Button>
    </section>
  )
}
