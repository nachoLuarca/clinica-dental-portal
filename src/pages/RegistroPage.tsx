import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeOff, UserPlus } from "lucide-react"
import { AuthShell } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { ApiError } from "@/lib/http-client"
import { esRutValido, formatearRut, limpiarRut } from "@/lib/rut"
import {
  esEmailValido,
  esFechaNacimientoValida,
  esPasswordValida,
} from "@/lib/validacion"

export function RegistroPage() {
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const { registrarse } = useAuth()
  const siguiente = parametros.get("next")

  const [nombre, setNombre] = useState("")
  const [rut, setRut] = useState("")
  const [email, setEmail] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmacion, setPasswordConfirmacion] = useState("")
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({})

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErrorGeneral(null)
    setErroresCampo({})

    const errores: Record<string, string> = {}
    if (nombre.trim().length < 2) {
      errores.nombre = "Ingresa tu nombre completo."
    }
    if (!esRutValido(rut)) {
      errores.rut = "Ingresa un RUT válido, ej. 12.345.678-9."
    }
    if (!esEmailValido(email)) {
      errores.email = "Ingresa un correo válido."
    }
    if (!esFechaNacimientoValida(fechaNacimiento)) {
      errores.fecha_nacimiento = "Ingresa una fecha de nacimiento válida."
    }
    if (!esPasswordValida(password)) {
      errores.password = "La contraseña debe tener al menos 8 caracteres."
    } else if (password !== passwordConfirmacion) {
      errores.password_confirmation = "Las contraseñas no coinciden."
    }
    if (Object.keys(errores).length > 0) {
      setErroresCampo(errores)
      return
    }

    setEnviando(true)
    try {
      await registrarse({
        nombre: nombre.trim(),
        rut: limpiarRut(rut),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmacion,
        fecha_nacimiento: fechaNacimiento,
      })
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
        setErrorGeneral("No pudimos crear tu cuenta. Intenta de nuevo.")
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthShell
      titulo="Crea tu cuenta"
      subtitulo="Con tu cuenta puedes reservar, revisar y cancelar tus horas cuando quieras."
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
          <Label htmlFor="nombre">Nombre completo</Label>
          <Input
            id="nombre"
            autoComplete="name"
            placeholder="María Pérez"
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            aria-invalid={Boolean(erroresCampo.nombre)}
            className="h-11 rounded-xl px-4"
          />
          {erroresCampo.nombre && (
            <p className="text-xs text-destructive">{erroresCampo.nombre}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rut">RUT</Label>
          <Input
            id="rut"
            inputMode="text"
            autoComplete="off"
            placeholder="12.345.678-9"
            value={rut}
            onChange={(evento) => setRut(formatearRut(evento.target.value))}
            aria-invalid={Boolean(erroresCampo.rut)}
            className="h-11 rounded-xl px-4"
          />
          {erroresCampo.rut && (
            <p className="text-xs text-destructive">{erroresCampo.rut}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Lo vas a necesitar para revisar o cancelar tus horas sin iniciar sesión.
          </p>
        </div>

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
          <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
          <Input
            id="fecha_nacimiento"
            type="date"
            autoComplete="bday"
            max={new Date().toISOString().split("T")[0]}
            value={fechaNacimiento}
            onChange={(evento) => setFechaNacimiento(evento.target.value)}
            aria-invalid={Boolean(erroresCampo.fecha_nacimiento)}
            className="h-11 rounded-xl px-4"
          />
          {erroresCampo.fecha_nacimiento && (
            <p className="text-xs text-destructive">{erroresCampo.fecha_nacimiento}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password_confirmation">Confirma tu contraseña</Label>
          <Input
            id="password_confirmation"
            type={mostrarPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={passwordConfirmacion}
            onChange={(evento) => setPasswordConfirmacion(evento.target.value)}
            aria-invalid={Boolean(erroresCampo.password_confirmation)}
            className="h-11 rounded-xl px-4"
          />
          {erroresCampo.password_confirmation && (
            <p className="text-xs text-destructive">
              {erroresCampo.password_confirmation}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={enviando}
          className="mt-2 w-full gap-2 rounded-full"
        >
          <UserPlus className="size-4" />
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link
            to={siguiente ? `/ingresar?next=${encodeURIComponent(siguiente)}` : "/ingresar"}
            className="font-medium text-primary hover:underline"
          >
            Ingresa aquí
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
