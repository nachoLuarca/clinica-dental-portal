import { useState, type FormEvent } from "react"
import { Loader2, Search, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { esRutValido, formatearRut } from "@/lib/rut"
import { esFechaNacimientoValida } from "@/lib/validacion"

interface FormularioBuscarHorasProps {
  buscando: boolean
  error: string | null
  onBuscar: (rut: string, fechaNacimiento: string) => void
}

export function FormularioBuscarHoras({
  buscando,
  error,
  onBuscar,
}: FormularioBuscarHorasProps) {
  const [rut, setRut] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({})

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const errores: Record<string, string> = {}
    if (!esRutValido(rut)) {
      errores.rut = "Ingresa un RUT válido, ej. 12.345.678-9."
    }
    if (!esFechaNacimientoValida(fechaNacimiento)) {
      errores.fecha_nacimiento = "Ingresa una fecha de nacimiento válida."
    }
    if (Object.keys(errores).length > 0) {
      setErroresCampo(errores)
      return
    }
    setErroresCampo({})
    onBuscar(rut, fechaNacimiento)
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-4xl bg-card p-6 shadow-sm ring-1 ring-border/70 sm:p-8">
        <h1 className="font-heading text-2xl font-medium text-balance sm:text-3xl">
          Revisa o cancela tu hora
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresa el mismo RUT y fecha de nacimiento que usaste al reservar.
          No necesitas contraseña ni iniciar sesión.
        </p>

        <form className="mt-6 flex flex-col gap-5" onSubmit={manejarEnvio} noValidate>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rut-mis-horas">RUT</Label>
            <Input
              id="rut-mis-horas"
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
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha-mis-horas">Fecha de nacimiento</Label>
            <Input
              id="fecha-mis-horas"
              type="date"
              autoComplete="bday"
              max={new Date().toISOString().split("T")[0]}
              value={fechaNacimiento}
              onChange={(evento) => setFechaNacimiento(evento.target.value)}
              aria-invalid={Boolean(erroresCampo.fecha_nacimiento)}
              className="h-11 rounded-xl px-4"
            />
            {erroresCampo.fecha_nacimiento && (
              <p className="text-xs text-destructive">
                {erroresCampo.fecha_nacimiento}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={buscando}
            className="mt-1 w-full gap-2 rounded-full"
          >
            {buscando ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Buscando tus horas...
              </>
            ) : (
              <>
                <Search className="size-4" />
                Buscar mis horas
              </>
            )}
          </Button>

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Pedimos ambos datos para proteger tu información: así nadie más
            puede ver o cancelar tus horas con solo tu RUT.
          </p>
        </form>
      </div>
    </div>
  )
}
