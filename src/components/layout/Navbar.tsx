import { useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { LogOut, Menu, Smile, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useTenantBranding } from "@/hooks/useTenantBranding"
import { cn } from "@/lib/utils"

const NOMBRE_CLINICA_POR_DEFECTO = "Clínica Sonrisa"

const enlaces = [
  { href: "/", label: "Inicio" },
  { href: "/tratamientos", label: "Tratamientos" },
  { href: "/mis-horas", label: "Mis horas" },
]

export function Navbar() {
  const [abierto, setAbierto] = useState(false)
  const [logoRoto, setLogoRoto] = useState(false)
  const { autenticado, paciente, cerrarSesion } = useAuth()
  const { marca } = useTenantBranding()
  const primerNombre = paciente?.nombre?.split(" ")[0]
  const nombreClinica = marca?.nombre ?? NOMBRE_CLINICA_POR_DEFECTO
  const mostrarLogo = Boolean(marca?.logo_url) && !logoRoto

  function manejarCerrarSesion() {
    setAbierto(false)
    void cerrarSesion()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-heading text-lg font-medium text-primary"
          onClick={() => setAbierto(false)}
        >
          {mostrarLogo ? (
            <img
              src={marca?.logo_url ?? undefined}
              alt={nombreClinica}
              className="size-9 rounded-full object-cover"
              onError={() => setLogoRoto(true)}
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Smile className="size-4.5" />
            </span>
          )}
          {nombreClinica}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.href}
              to={enlace.href}
              end={enlace.href === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground",
                  isActive && "bg-secondary text-secondary-foreground"
                )
              }
            >
              {enlace.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {autenticado ? (
            <>
              <Button asChild variant="ghost" className="gap-1.5 rounded-full">
                <Link to="/cuenta">
                  <User className="size-4" />
                  {primerNombre ?? "Mi cuenta"}
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="gap-1.5 rounded-full text-muted-foreground"
                onClick={manejarCerrarSesion}
              >
                <LogOut className="size-4" />
                Salir
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/ingresar">Ingresar</Link>
            </Button>
          )}
          <Button asChild className="rounded-full px-5">
            <Link to="/tratamientos">Reservar hora</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted md:hidden"
          onClick={() => setAbierto((valor) => !valor)}
        >
          {abierto ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {abierto && (
        <div className="border-t border-border/70 bg-background px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.href}
                to={enlace.href}
                end={enlace.href === "/"}
                onClick={() => setAbierto(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted",
                    isActive && "bg-secondary text-secondary-foreground"
                  )
                }
              >
                {enlace.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            {autenticado ? (
              <>
                <Button asChild variant="outline" className="w-full gap-1.5 rounded-full">
                  <Link to="/cuenta" onClick={() => setAbierto(false)}>
                    <User className="size-4" />
                    {primerNombre ?? "Mi cuenta"}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full gap-1.5 rounded-full text-muted-foreground"
                  onClick={manejarCerrarSesion}
                >
                  <LogOut className="size-4" />
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link to="/ingresar" onClick={() => setAbierto(false)}>
                  Ingresar
                </Link>
              </Button>
            )}
            <Button asChild className="w-full rounded-full">
              <Link to="/tratamientos" onClick={() => setAbierto(false)}>
                Reservar hora
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
