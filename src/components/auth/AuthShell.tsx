import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react"

interface AuthShellProps {
  titulo: string
  subtitulo: string
  children: ReactNode
}

/**
 * Envoltorio visual compartido por /ingresar y /registro. Reutiliza el
 * lenguaje visual de la landing (orbes de acento, panel degradado en la
 * marca) para que el flujo de auth no se sienta como un formulario
 * genérico aparte del resto del sitio.
 */
export function AuthShell({ titulo, subtitulo, children }: AuthShellProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -left-20 size-72 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
        <div className="hidden flex-col gap-6 rounded-4xl bg-gradient-to-br from-primary to-[#0a3d36] p-10 text-primary-foreground shadow-xl lg:flex">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
            <HeartHandshake className="size-6" />
          </span>
          <h2 className="font-heading text-3xl leading-tight font-medium text-balance">
            Tu sonrisa, con hora asegurada
          </h2>
          <p className="text-primary-foreground/80">
            Guarda tus datos una vez y reserva, revisa y cancela tus horas
            cuando quieras, sin repetir el proceso cada vez.
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-primary-foreground/85">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0" />
              Tus datos se usan solo para tus reservas en esta clínica.
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 shrink-0" />
              Confirmación al instante por correo y WhatsApp.
            </span>
          </div>
        </div>

        <div className="rounded-4xl bg-card p-6 shadow-sm ring-1 ring-border/70 sm:p-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Clínica Sonrisa
          </Link>
          <h1 className="mt-4 font-heading text-2xl font-medium text-balance sm:text-3xl">
            {titulo}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitulo}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  )
}
