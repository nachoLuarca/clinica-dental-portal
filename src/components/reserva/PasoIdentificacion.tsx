import { useEffect, useRef, useState, type FormEvent } from "react"
import { ArrowRight, ShieldCheck, UserPlus } from "lucide-react"
import { PhoneInput } from "react-international-phone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/identificacion/TurnstileWidget"
import type { ApiError } from "@/lib/http-client"
import { esRutValido, formatearRut } from "@/lib/rut"
import { esEmailValido, esFechaNacimientoValida } from "@/lib/validacion"
import type { DatosAltaPaciente } from "@/types/identificacion"

interface PasoIdentificacionProps {
  verificandoRut: boolean
  errorVerificarRut: string | null
  pacienteExiste: boolean | null
  onVerificarRut: (rut: string, turnstileToken: string) => void
  creandoPaciente: boolean
  errorAltaPaciente: ApiError | null
  onCrearPaciente: (datos: Omit<DatosAltaPaciente, "rut">) => void
}

function primerErrorDeCampo(
  error: ApiError | null,
  campo: string
): string | undefined {
  return error?.errorDeCampo(campo)
}

export function PasoIdentificacion({
  verificandoRut,
  errorVerificarRut,
  pacienteExiste,
  onVerificarRut,
  creandoPaciente,
  errorAltaPaciente,
  onCrearPaciente,
}: PasoIdentificacionProps) {
  const [rut, setRut] = useState("")
  const [errorRutLocal, setErrorRutLocal] = useState<string | null>(null)
  const [tokenIdentificacion, setTokenIdentificacion] = useState<string | null>(
    null
  )
  const turnstileRef = useRef<TurnstileWidgetHandle>(null)

  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [aceptaTratamientoDatos, setAceptaTratamientoDatos] = useState(false)
  const [erroresAlta, setErroresAlta] = useState<Record<string, string>>({})

  // El token de Turnstile es de un solo uso: si la API lo rechazó (o el RUT
  // no calzó), hay que pedir uno nuevo antes de dejar reintentar.
  useEffect(() => {
    if (errorVerificarRut) {
      setTokenIdentificacion(null)
      turnstileRef.current?.reset()
    }
  }, [errorVerificarRut])

  function manejarVerificar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!esRutValido(rut)) {
      setErrorRutLocal("Ingresa un RUT válido, ej. 12.345.678-9.")
      return
    }
    if (!tokenIdentificacion) {
      setErrorRutLocal(
        "Espera un momento a que termine la verificación de seguridad."
      )
      return
    }
    setErrorRutLocal(null)
    onVerificarRut(rut, tokenIdentificacion)
  }

  function manejarAlta(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const errores: Record<string, string> = {}
    if (nombre.trim().length < 2) errores.nombre = "Ingresa tu nombre."
    if (apellido.trim().length < 2) errores.apellido = "Ingresa tu apellido."
    if (email.trim() && !esEmailValido(email)) {
      errores.email = "Ingresa un correo válido."
    }
    if (telefono.replace(/\D/g, "").length < 8) {
      errores.telefono = "Ingresa un teléfono válido."
    }
    if (!esFechaNacimientoValida(fechaNacimiento)) {
      errores.fecha_nacimiento = "Ingresa una fecha de nacimiento válida."
    }
    if (!aceptaTratamientoDatos) {
      errores.acepta_tratamiento_datos =
        "Debes aceptar el tratamiento de datos para continuar."
    }
    if (Object.keys(errores).length > 0) {
      setErroresAlta(errores)
      return
    }
    setErroresAlta({})
    onCrearPaciente({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim() || undefined,
      telefono: telefono.trim(),
      fecha_nacimiento: fechaNacimiento,
      acepta_tratamiento_datos: true,
    })
  }

  if (pacienteExiste === false) {
    return (
      <form className="flex flex-col gap-5" onSubmit={manejarAlta} noValidate>
        <p className="text-sm text-muted-foreground">
          No encontramos una ficha con el RUT{" "}
          <span className="font-mono font-medium text-foreground">{rut}</span>.
          Completa tus datos para crearla — solo la primera vez.
        </p>

        {errorAltaPaciente && !errorAltaPaciente.errors && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorAltaPaciente.message}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alta-nombre">Nombre</Label>
            <Input
              id="alta-nombre"
              autoComplete="given-name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              aria-invalid={Boolean(
                erroresAlta.nombre || primerErrorDeCampo(errorAltaPaciente, "nombre")
              )}
              className="h-11 rounded-xl px-4"
            />
            {(erroresAlta.nombre ||
              primerErrorDeCampo(errorAltaPaciente, "nombre")) && (
              <p className="text-xs text-destructive">
                {erroresAlta.nombre ??
                  primerErrorDeCampo(errorAltaPaciente, "nombre")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alta-apellido">Apellido</Label>
            <Input
              id="alta-apellido"
              autoComplete="family-name"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              aria-invalid={Boolean(
                erroresAlta.apellido ||
                  primerErrorDeCampo(errorAltaPaciente, "apellido")
              )}
              className="h-11 rounded-xl px-4"
            />
            {(erroresAlta.apellido ||
              primerErrorDeCampo(errorAltaPaciente, "apellido")) && (
              <p className="text-xs text-destructive">
                {erroresAlta.apellido ??
                  primerErrorDeCampo(errorAltaPaciente, "apellido")}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="alta-email">Correo electrónico (opcional)</Label>
          <Input
            id="alta-email"
            type="email"
            autoComplete="email"
            placeholder="tu.correo@ejemplo.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(
              erroresAlta.email || primerErrorDeCampo(errorAltaPaciente, "email")
            )}
            className="h-11 rounded-xl px-4"
          />
          {(erroresAlta.email ||
            primerErrorDeCampo(errorAltaPaciente, "email")) && (
            <p className="text-xs text-destructive">
              {erroresAlta.email ?? primerErrorDeCampo(errorAltaPaciente, "email")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="alta-telefono">Teléfono móvil</Label>
          <PhoneInput
            defaultCountry="cl"
            value={telefono}
            onChange={setTelefono}
            className="telefono-input"
            inputClassName="!w-full !flex-1 focus-visible:!border-ring focus-visible:!outline-none focus-visible:!ring-3 focus-visible:!ring-ring/50"
            countrySelectorStyleProps={{
              buttonClassName: "focus-visible:!ring-3 focus-visible:!ring-ring/50",
            }}
            inputProps={{
              id: "alta-telefono",
              name: "telefono",
              required: true,
              autoComplete: "tel",
              "aria-invalid": Boolean(
                erroresAlta.telefono ||
                  primerErrorDeCampo(errorAltaPaciente, "telefono")
              ),
            }}
          />
          {(erroresAlta.telefono ||
            primerErrorDeCampo(errorAltaPaciente, "telefono")) && (
            <p className="text-xs text-destructive">
              {erroresAlta.telefono ??
                primerErrorDeCampo(errorAltaPaciente, "telefono")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="alta-fecha-nacimiento">Fecha de nacimiento</Label>
          <Input
            id="alta-fecha-nacimiento"
            type="date"
            autoComplete="bday"
            max={new Date().toISOString().split("T")[0]}
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            aria-invalid={Boolean(
              erroresAlta.fecha_nacimiento ||
                primerErrorDeCampo(errorAltaPaciente, "fecha_nacimiento")
            )}
            className="h-11 rounded-xl px-4"
          />
          {(erroresAlta.fecha_nacimiento ||
            primerErrorDeCampo(errorAltaPaciente, "fecha_nacimiento")) && (
            <p className="text-xs text-destructive">
              {erroresAlta.fecha_nacimiento ??
                primerErrorDeCampo(errorAltaPaciente, "fecha_nacimiento")}
            </p>
          )}
        </div>

        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={aceptaTratamientoDatos}
            onChange={(e) => setAceptaTratamientoDatos(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded border-input"
          />
          <span className="text-muted-foreground">
            Acepto el tratamiento de mis datos personales para gestionar mi
            reserva.
          </span>
        </label>
        {erroresAlta.acepta_tratamiento_datos && (
          <p className="-mt-3 text-xs text-destructive">
            {erroresAlta.acepta_tratamiento_datos}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={creandoPaciente}
          className="w-full gap-2 rounded-full"
        >
          <UserPlus className="size-4" />
          {creandoPaciente ? "Creando tu ficha..." : "Crear ficha y continuar"}
        </Button>
      </form>
    )
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={manejarVerificar} noValidate>
      <p className="text-sm text-muted-foreground">
        Ingresa tu RUT para identificarte. No necesitas contraseña ni crear
        una cuenta.
      </p>

      {errorRutLocal && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorRutLocal}
        </p>
      )}
      {!errorRutLocal && errorVerificarRut && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorVerificarRut}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rut-identificacion">RUT</Label>
        <Input
          id="rut-identificacion"
          inputMode="text"
          autoComplete="off"
          placeholder="12.345.678-9"
          value={rut}
          onChange={(evento) => setRut(formatearRut(evento.target.value))}
          className="h-11 rounded-xl px-4"
        />
      </div>

      <TurnstileWidget
        ref={turnstileRef}
        onToken={setTokenIdentificacion}
        onExpirar={() => setTokenIdentificacion(null)}
        onError={() => setTokenIdentificacion(null)}
      />

      <Button
        type="submit"
        size="lg"
        disabled={verificandoRut}
        className="w-full gap-2 rounded-full"
      >
        {verificandoRut ? (
          "Verificando..."
        ) : (
          <>
            Continuar
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        Usamos tu RUT solo para identificar tu reserva. No pedimos
        contraseña.
      </p>
    </form>
  )
}
