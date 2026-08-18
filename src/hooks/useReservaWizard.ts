import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { ApiError } from "@/lib/http-client"
import {
  consultarDisponibilidad,
  crearCita,
  listarProfesionales,
  listarTratamientosPublicos,
} from "@/services/reservas.service"
import type {
  Cita,
  Profesional,
  SlotConProfesional,
  TratamientoPublico,
} from "@/types/reserva"

export type PasoReserva =
  | "servicio"
  | "profesional"
  | "horario"
  | "confirmar"
  | "exito"

export const PASOS_RESERVA: { id: PasoReserva; titulo: string }[] = [
  { id: "servicio", titulo: "Tratamiento" },
  { id: "profesional", titulo: "Profesional" },
  { id: "horario", titulo: "Horario" },
  { id: "confirmar", titulo: "Confirmar" },
]

const CLAVE_ESTADO = "clinica_reserva_en_curso"

interface EstadoGuardado {
  tratamientoId: number
  profesionalId: number | null
  cualquieraDisponible: boolean
  fecha: string
  horaIso: string | null
  notas: string
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function guardarEstado(estado: EstadoGuardado) {
  try {
    sessionStorage.setItem(CLAVE_ESTADO, JSON.stringify(estado))
  } catch {
    // Sin sessionStorage disponible (privado/cuotas): el flujo sigue
    // funcionando, solo no sobrevive a una redirección de login.
  }
}

function leerEstadoGuardado(): EstadoGuardado | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE_ESTADO)
    return crudo ? (JSON.parse(crudo) as EstadoGuardado) : null
  } catch {
    return null
  }
}

function limpiarEstadoGuardado() {
  try {
    sessionStorage.removeItem(CLAVE_ESTADO)
  } catch {
    // Ver nota en guardarEstado.
  }
}

/**
 * Orquesta los pasos del flujo de reserva. La disponibilidad y la
 * creación de la cita siempre se piden a la API — este hook no calcula
 * horarios ni valida choques, solo maneja estado de UI (paso actual,
 * selección en curso, errores para mostrar).
 *
 * El progreso se persiste en `sessionStorage` para sobrevivir al ida-y-
 * vuelta por `/ingresar` cuando el paciente todavía no tiene sesión al
 * momento de confirmar (paso 4 del flujo, ver handoff).
 */
export function useReservaWizard() {
  const { autenticado } = useAuth()
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const yaHidrato = useRef(false)

  const [paso, setPaso] = useState<PasoReserva>("servicio")

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

  const [fecha, setFechaState] = useState(hoyISO())
  const [slots, setSlots] = useState<SlotConProfesional[]>([])
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [errorSlots, setErrorSlots] = useState<string | null>(null)
  const [slotSeleccionado, setSlotSeleccionado] =
    useState<SlotConProfesional | null>(null)

  const [notas, setNotas] = useState("")
  const [creandoCita, setCreandoCita] = useState(false)
  const [errorCita, setErrorCita] = useState<string | null>(null)
  const [citaCreada, setCitaCreada] = useState<Cita | null>(null)
  const [slotYaNoDisponible, setSlotYaNoDisponible] = useState(false)

  // Catálogo real de tratamientos (misma fuente que usa el catálogo
  // público). Si viene `?servicio=` (slug o id) desde la ficha de
  // detalle, precarga ese tratamiento como cortesía.
  useEffect(() => {
    let vigente = true
    listarTratamientosPublicos()
      .then((lista) => {
        if (!vigente) return
        setTratamientos(lista)
        setCargandoTratamientos(false)

        const guardado = leerEstadoGuardado()
        const slugPedido = parametros.get("servicio")

        if (guardado) {
          const encontrado = lista.find((t) => t.id === guardado.tratamientoId)
          if (encontrado) {
            setTratamientoState(encontrado)
            setCualquieraDisponible(guardado.cualquieraDisponible)
            setFechaState(guardado.fecha)
            setNotas(guardado.notas)
            setPaso(guardado.horaIso ? "confirmar" : "profesional")
          }
        } else if (slugPedido) {
          const encontrado = lista.find(
            (t) => t.slug === slugPedido || String(t.id) === slugPedido
          )
          if (encontrado) setTratamientoState(encontrado)
        }
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
    // Solo al montar: la hidratación desde sessionStorage/URL es un
    // gesto único, no algo que deba repetirse en cada cambio de estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Rehidrata profesional + slot elegido una vez que ya tenemos tratamiento
  // y (si aplica) la lista de profesionales, para volver exactamente donde
  // el paciente quedó antes de que lo mandáramos a /ingresar.
  useEffect(() => {
    if (yaHidrato.current || !tratamiento) return
    const guardado = leerEstadoGuardado()
    if (!guardado || guardado.tratamientoId !== tratamiento.id) return

    if (guardado.cualquieraDisponible) {
      yaHidrato.current = true
      setCualquieraDisponible(true)
      void cargarProfesionales().then((listaProfesionales) => {
        void buscarDisponibilidad(
          guardado.fecha,
          null,
          true,
          listaProfesionales ?? []
        ).then((lista) => {
          if (guardado.horaIso) {
            const slot = lista.find((s) => s.fecha_hora === guardado.horaIso)
            if (slot) setSlotSeleccionado(slot)
          }
        })
      })
    } else if (guardado.profesionalId) {
      yaHidrato.current = true
      void cargarProfesionales().then((lista) => {
        const encontrado =
          lista?.find((p) => p.id === guardado.profesionalId) ?? null
        setProfesionalState(encontrado)
        void buscarDisponibilidad(guardado.fecha, encontrado, false).then(
          (slotsCargados) => {
            if (guardado.horaIso) {
              const slot = slotsCargados.find(
                (s) => s.fecha_hora === guardado.horaIso
              )
              if (slot) setSlotSeleccionado(slot)
            }
          }
        )
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tratamiento])

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

    if (!autenticado) {
      guardarEstado({
        tratamientoId: tratamiento!.id,
        profesionalId: profesional?.id ?? null,
        cualquieraDisponible,
        fecha,
        horaIso: slot.fecha_hora,
        notas,
      })
      const destino = "/reservar"
      navigate(`/ingresar?next=${encodeURIComponent(destino)}`)
      return
    }

    setPaso("confirmar")
  }

  async function confirmarReserva() {
    if (!tratamiento || !slotSeleccionado) return

    if (!autenticado) {
      guardarEstado({
        tratamientoId: tratamiento.id,
        profesionalId: profesional?.id ?? null,
        cualquieraDisponible,
        fecha,
        horaIso: slotSeleccionado.fecha_hora,
        notas,
      })
      navigate(`/ingresar?next=${encodeURIComponent("/reservar")}`)
      return
    }

    setCreandoCita(true)
    setErrorCita(null)
    setSlotYaNoDisponible(false)
    try {
      const cita = await crearCita({
        professional_id: slotSeleccionado.profesional.id,
        treatment_id: tratamiento.id,
        fecha_hora: slotSeleccionado.fecha_hora,
        notas: notas.trim() || undefined,
      })
      setCitaCreada(cita)
      setPaso("exito")
      limpiarEstadoGuardado()
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
    limpiarEstadoGuardado()
    setPaso("servicio")
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
    tratamientos,
    cargandoTratamientos,
    errorTratamientos,
    tratamiento,
    elegirTratamiento,
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
