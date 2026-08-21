import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { ApiError } from "@/lib/http-client"
import { normalizarRutParaApi } from "@/lib/rut"
import { crearPaciente, verificarRut } from "@/services/pacientes.service"
import {
  consultarDisponibilidad,
  crearCitaPublica,
  listarProfesionales,
  listarTratamientosPublicos,
} from "@/services/reservas.service"
import type { DatosAltaPaciente } from "@/types/identificacion"
import type {
  Cita,
  Profesional,
  SlotConProfesional,
  TratamientoPublico,
} from "@/types/reserva"

export type PasoReserva =
  | "identificacion"
  | "servicio"
  | "profesional"
  | "horario"
  | "confirmar"
  | "exito"

export const PASOS_RESERVA: { id: PasoReserva; titulo: string }[] = [
  { id: "identificacion", titulo: "Identificación" },
  { id: "servicio", titulo: "Tratamiento" },
  { id: "profesional", titulo: "Profesional" },
  { id: "horario", titulo: "Horario" },
  { id: "confirmar", titulo: "Confirmar" },
]

/**
 * Orquesta los pasos del flujo de reserva. La disponibilidad y la creación
 * de la cita siempre se piden a la API — este hook no calcula horarios ni
 * valida choques, solo maneja estado de UI (paso actual, selección en
 * curso, errores para mostrar).
 *
 * El paciente se identifica por RUT + Turnstile (paso "identificacion"),
 * sin login ni password: no hay sesión que sobrevivir a una redirección, así
 * que a diferencia de versiones anteriores este hook no persiste nada en
 * `sessionStorage` — todo el estado vive mientras la pestaña sigue abierta.
 */
export function useReservaWizard() {
  const [parametros] = useSearchParams()

  const [paso, setPaso] = useState<PasoReserva>("identificacion")

  const [rut, setRut] = useState<string | null>(null)
  const [verificandoRut, setVerificandoRut] = useState(false)
  const [errorVerificarRut, setErrorVerificarRut] = useState<string | null>(
    null
  )
  const [pacienteExiste, setPacienteExiste] = useState<boolean | null>(null)
  const [creandoPaciente, setCreandoPaciente] = useState(false)
  const [errorAltaPaciente, setErrorAltaPaciente] = useState<ApiError | null>(
    null
  )

  const [tratamientos, setTratamientos] = useState<TratamientoPublico[] | null>(
    null
  )
  const [cargandoTratamientos, setCargandoTratamientos] = useState(true)
  const [errorTratamientos, setErrorTratamientos] = useState<string | null>(
    null
  )
  const [tratamiento, setTratamientoState] = useState<TratamientoPublico | null>(
    null
  )

  const [profesionales, setProfesionales] = useState<Profesional[] | null>(null)
  const [cargandoProfesionales, setCargandoProfesionales] = useState(false)
  const [errorProfesionales, setErrorProfesionales] = useState<ApiError | null>(
    null
  )
  const [profesional, setProfesionalState] = useState<Profesional | null>(null)
  const [cualquieraDisponible, setCualquieraDisponible] = useState(false)

  const [fecha, setFechaState] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [slots, setSlots] = useState<SlotConProfesional[]>([])
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [errorSlots, setErrorSlots] = useState<string | null>(null)
  const [slotSeleccionado, setSlotSeleccionado] =
    useState<SlotConProfesional | null>(null)

  const [conteoProfesionalesPorEspecialidad, setConteoProfesionalesPorEspecialidad] =
    useState<Record<string, number> | null>(null)
  const [cargandoConteoProfesionales, setCargandoConteoProfesionales] =
    useState(false)

  const [notas, setNotas] = useState("")
  const [creandoCita, setCreandoCita] = useState(false)
  const [errorCita, setErrorCita] = useState<string | null>(null)
  const [citaCreada, setCitaCreada] = useState<Cita | null>(null)
  const [slotYaNoDisponible, setSlotYaNoDisponible] = useState(false)

  // Catálogo real de tratamientos (misma fuente que usa el catálogo
  // público), se pide en paralelo a la identificación para que ya esté
  // listo cuando el paciente avance.
  useEffect(() => {
    let vigente = true
    listarTratamientosPublicos()
      .then((lista) => {
        if (!vigente) return
        setTratamientos(lista)
        setCargandoTratamientos(false)
      })
      .catch(() => {
        if (vigente) {
          setCargandoTratamientos(false)
          setErrorTratamientos(
            "No pudimos cargar los tratamientos disponibles para reservar. Intenta de nuevo más tarde."
          )
        }
      })
    return () => {
      vigente = false
    }
  }, [])

  const cargarProfesionales = useCallback(
    async (opciones?: { treatmentId?: number; forzar?: boolean }) => {
      // `forzar` evita el corto-circuito del cache cuando el llamador ya
      // sabe que la lista quedó obsoleta (cambio de tratamiento) en el
      // mismo tick en que pidió limpiarla con `setProfesionales(null)` —
      // ese `null` todavía no se refleja en este closure, así que sin
      // `forzar` acá se devolvería la lista vieja en vez de pedir la nueva.
      if (profesionales !== null && !opciones?.forzar) return profesionales
      setCargandoProfesionales(true)
      setErrorProfesionales(null)
      try {
        const lista = await listarProfesionales(
          opciones?.treatmentId ?? tratamiento?.id
        )
        setProfesionales(lista)
        return lista
      } catch (error) {
        setErrorProfesionales(
          error instanceof ApiError
            ? error
            : new ApiError("No pudimos cargar los profesionales.", 0)
        )
        return null
      } finally {
        setCargandoProfesionales(false)
      }
    },
    [profesionales, tratamiento]
  )

  // El paso "servicio" ahora agrupa por especialidad (no por tratamiento
  // suelto), y cada grupo muestra cuántos profesionales la cubren. Se pide
  // solo al llegar efectivamente a ese paso (no en el atajo `?servicio=`
  // que lo salta) y una sola vez por sesión del wizard: un profesional
  // elegible para un tratamiento de la especialidad lo es para todos
  // (misma FK especialidad_id), así que un tratamiento representante por
  // grupo alcanza para contar sin pedir uno por cada tratamiento.
  useEffect(() => {
    if (paso !== "servicio" || !tratamientos) return
    if (conteoProfesionalesPorEspecialidad || cargandoConteoProfesionales) return

    const representantePorGrupo = new Map<string, number>()
    for (const t of tratamientos) {
      const clave = t.especialidad ? String(t.especialidad.id) : "sin-especialidad"
      if (!representantePorGrupo.has(clave)) {
        representantePorGrupo.set(clave, t.id)
      }
    }
    if (representantePorGrupo.size === 0) return

    let vigente = true
    setCargandoConteoProfesionales(true)
    Promise.all(
      [...representantePorGrupo.entries()].map(async ([clave, treatmentId]) => {
        const lista = await listarProfesionales(treatmentId).catch(() => [])
        return [clave, lista.length] as const
      })
    )
      .then((resultados) => {
        if (!vigente) return
        setConteoProfesionalesPorEspecialidad(Object.fromEntries(resultados))
      })
      .finally(() => {
        if (vigente) setCargandoConteoProfesionales(false)
      })
    return () => {
      vigente = false
    }
  }, [paso, tratamientos, conteoProfesionalesPorEspecialidad, cargandoConteoProfesionales])

  /**
   * En modo "cualquiera disponible" se hace UNA sola consulta sin
   * `professional_id`: la API agrega internamente los slots libres de todo
   * el equipo (ver `AvailabilityService::forTenant`) y marca cada slot con
   * el profesional que lo cubre. Acá solo se resuelve ese id contra la
   * lista de profesionales para poder mostrar el nombre.
   */
  const buscarDisponibilidad = useCallback(
    async (
      fechaConsulta: string,
      profesionalEspecifico: Profesional | null,
      modoCualquiera: boolean,
      listaProfesionalesParaNombres?: Profesional[]
    ): Promise<SlotConProfesional[]> => {
      if (!tratamiento) return []
      if (!modoCualquiera && !profesionalEspecifico) {
        setSlots([])
        return []
      }

      setCargandoSlots(true)
      setErrorSlots(null)
      try {
        const disponibilidad = await consultarDisponibilidad({
          professionalId: modoCualquiera ? null : profesionalEspecifico!.id,
          treatmentId: tratamiento.id,
          fecha: fechaConsulta,
        })

        const listaNombres = listaProfesionalesParaNombres ?? profesionales ?? []
        const conProfesional = disponibilidad.slots
          .map((slot): SlotConProfesional => {
            if (!modoCualquiera) {
              return { ...slot, profesional: profesionalEspecifico! }
            }
            const encontrado = listaNombres.find(
              (p) => p.id === slot.professional_id
            )
            return {
              ...slot,
              profesional: encontrado ?? {
                id: slot.professional_id ?? 0,
                nombre: "Profesional del equipo",
                apellido: null,
                especialidad: null,
              },
            }
          })
          .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))

        setSlots(conProfesional)
        return conProfesional
      } catch {
        setErrorSlots(
          "No pudimos consultar la disponibilidad en este momento. Intenta de nuevo."
        )
        setSlots([])
        return []
      } finally {
        setCargandoSlots(false)
      }
    },
    [tratamiento, profesionales]
  )

  // Tras identificarse, si vino `?servicio=` desde la ficha de detalle salta
  // directo a "profesional" con ese tratamiento precargado; si no, pasa por
  // "servicio" con el listado completo.
  function avanzarTrasIdentificacion() {
    const slugPedido = parametros.get("servicio")
    const encontrado =
      slugPedido &&
      tratamientos?.find(
        (t) => t.slug === slugPedido || String(t.id) === slugPedido
      )

    if (encontrado) {
      setTratamientoState(encontrado)
      setPaso("profesional")
      void cargarProfesionales({ treatmentId: encontrado.id, forzar: true })
      return
    }
    setPaso("servicio")
  }

  async function verificarRutYAvanzar(
    rutIngresado: string,
    turnstileToken: string
  ) {
    const rutNormalizado = normalizarRutParaApi(rutIngresado)
    setRut(rutNormalizado)
    setVerificandoRut(true)
    setErrorVerificarRut(null)
    try {
      const existe = await verificarRut(rutNormalizado, turnstileToken)
      setPacienteExiste(existe)
      if (existe) avanzarTrasIdentificacion()
    } catch (error) {
      setPacienteExiste(null)
      setErrorVerificarRut(
        error instanceof ApiError
          ? error.message
          : "No pudimos verificar tu RUT. Intenta de nuevo."
      )
    } finally {
      setVerificandoRut(false)
    }
  }

  async function crearPacienteYAvanzar(
    datos: Omit<DatosAltaPaciente, "rut">
  ) {
    if (!rut) return
    setCreandoPaciente(true)
    setErrorAltaPaciente(null)
    try {
      await crearPaciente({ rut, ...datos })
      avanzarTrasIdentificacion()
    } catch (error) {
      setErrorAltaPaciente(
        error instanceof ApiError
          ? error
          : new ApiError("No pudimos crear tu ficha. Intenta de nuevo.", 0)
      )
    } finally {
      setCreandoPaciente(false)
    }
  }

  function elegirTratamiento(seleccionado: TratamientoPublico) {
    const cambioDeTratamiento = tratamiento?.id !== seleccionado.id
    setTratamientoState(seleccionado)
    setProfesionalState(null)
    setCualquieraDisponible(false)
    setSlots([])
    setSlotSeleccionado(null)
    setPaso("profesional")
    // La lista de profesionales depende del tratamiento (la API la filtra
    // por especialidad vía `treatment_id`): si cambia el tratamiento hay
    // que invalidar el cache y volver a pedirla, no arrastrar la del
    // tratamiento anterior.
    if (cambioDeTratamiento) {
      setProfesionales(null)
      void cargarProfesionales({ treatmentId: seleccionado.id, forzar: true })
    } else if (profesionales === null) {
      void cargarProfesionales({ treatmentId: seleccionado.id })
    }
  }

  async function elegirProfesionalEspecifico(seleccionado: Profesional) {
    setProfesionalState(seleccionado)
    setCualquieraDisponible(false)
    setSlotSeleccionado(null)
    setPaso("horario")
    await buscarDisponibilidad(fecha, seleccionado, false)
  }

  async function elegirCualquieraDisponible() {
    setProfesionalState(null)
    setCualquieraDisponible(true)
    setSlotSeleccionado(null)
    setPaso("horario")
    const lista = profesionales ?? (await cargarProfesionales())
    await buscarDisponibilidad(fecha, null, true, lista ?? [])
  }

  async function cambiarFecha(nuevaFecha: string) {
    setFechaState(nuevaFecha)
    setSlotSeleccionado(null)
    await buscarDisponibilidad(nuevaFecha, profesional, cualquieraDisponible)
  }

  function volverAPaso(destino: PasoReserva) {
    setErrorCita(null)
    setSlotYaNoDisponible(false)
    setPaso(destino)
  }

  function seleccionarSlot(slot: SlotConProfesional) {
    setSlotSeleccionado(slot)
    setSlotYaNoDisponible(false)
    setErrorCita(null)
    setPaso("confirmar")
  }

  async function confirmarReserva(turnstileToken: string) {
    if (!tratamiento || !slotSeleccionado || !rut) return

    setCreandoCita(true)
    setErrorCita(null)
    setSlotYaNoDisponible(false)
    try {
      const cita = await crearCitaPublica({
        rut,
        turnstile_token: turnstileToken,
        professional_id: slotSeleccionado.profesional.id,
        treatment_id: tratamiento.id,
        fecha_hora: slotSeleccionado.fecha_hora,
        notas: notas.trim() || undefined,
      })
      setCitaCreada(cita)
      setPaso("exito")
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // El slot ya no está libre: refresca la disponibilidad y ofrece
        // el siguiente horario sin reiniciar el flujo completo.
        setSlotYaNoDisponible(true)
        setSlotSeleccionado(null)
        setPaso("horario")
        await buscarDisponibilidad(fecha, profesional, cualquieraDisponible)
      } else if (error instanceof ApiError) {
        setErrorCita(error.message)
      } else {
        setErrorCita("No pudimos crear tu reserva. Intenta de nuevo.")
      }
    } finally {
      setCreandoCita(false)
    }
  }

  function reiniciar() {
    setPaso("identificacion")
    setRut(null)
    setPacienteExiste(null)
    setErrorVerificarRut(null)
    setErrorAltaPaciente(null)
    setTratamientoState(null)
    setProfesionalState(null)
    setCualquieraDisponible(false)
    setSlots([])
    setSlotSeleccionado(null)
    setNotas("")
    setCitaCreada(null)
    setErrorCita(null)
    setSlotYaNoDisponible(false)
  }

  return {
    paso,
    setPaso,
    rut,
    verificandoRut,
    errorVerificarRut,
    pacienteExiste,
    verificarRutYAvanzar,
    creandoPaciente,
    errorAltaPaciente,
    crearPacienteYAvanzar,
    tratamientos,
    cargandoTratamientos,
    errorTratamientos,
    tratamiento,
    elegirTratamiento,
    conteoProfesionalesPorEspecialidad,
    cargandoConteoProfesionales,
    profesionales,
    cargandoProfesionales,
    errorProfesionales,
    profesional,
    cualquieraDisponible,
    elegirProfesionalEspecifico,
    elegirCualquieraDisponible,
    fecha,
    cambiarFecha,
    slots,
    cargandoSlots,
    errorSlots,
    slotSeleccionado,
    seleccionarSlot,
    notas,
    setNotas,
    creandoCita,
    errorCita,
    citaCreada,
    slotYaNoDisponible,
    confirmarReserva,
    volverAPaso,
    reiniciar,
  }
}
