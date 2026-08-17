import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { AuthShell } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { ApiError } from "@/lib/http-client"
import { esEmailValido } from "@/lib/validacion"

export function IngresarPage() {
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const { iniciarSesion } = useAuth()
  const siguiente = parametros.get("next")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({})

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErrorGeneral(null)
    setErroresCampo({})

    const errores: Record<string, string> = {}
    if (!esEmailValido(email)) {
      errores.email = "Ingresa un correo válido."
    }
    if (!password) {
      errores.password = "Ingresa tu contraseña."
    }
    if (Object.keys(errores).length > 0) {
      setErroresCampo(errores)
      return
    }

    setEnviando(true)
    try {
      await iniciarSesion({ email: email.trim(), password })
      navigate(siguiente || "/cuenta", { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setErroresCampo(
          Object.fromEntries(
            Object.entries(error.errors ?? {}).map(([campo, mensajes]) => [
              campo,
              mensajes[0],
            ])
          )
        )
        setErrorGeneral(error.errors ? null : error.message)
      } else {
        setErrorGeneral("No pudimos iniciar sesión. Intenta de nuevo.")
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthShell
      titulo="Ingresa a tu cuenta"
      subtitulo="Revisa tus horas reservadas o pide una nueva en un par de pasos."
    >
      <form className="flex flex-col gap-5" onSubmit={manejarEnvio} noValidate>
        {errorGeneral && (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {errorGeneral}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu.correo@ejemplo.cl"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            aria-invalid={Boolean(erroresCampo.email)}
            className="h-11 rounded-xl px-4"
          />
          {erroresCampo.email && (
            <p className="text-xs text-destructive">{erroresCampo.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              aria-invalid={Boolean(erroresCampo.password)}
              className="h-11 rounded-xl px-4 pr-11"
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((valor) => !valor)}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {mostrarPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {erroresCampo.password && (
            <p className="text-xs text-destructive">{erroresCampo.password}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={enviando}
          className="mt-2 w-full gap-2 rounded-full"
        >
          <LogIn className="size-4" />
          {enviando ? "Ingresando..." : "Ingresar"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          ¿Todavía no tienes cuenta?{" "}
          <Link
            to={siguiente ? `/registro?next=${encodeURIComponent(siguiente)}` : "/registro"}
            className="font-medium text-primary hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
