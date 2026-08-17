import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { ApiError } from "@/lib/http-client"
import { slugificar } from "@/lib/format"
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

  // Catálogo real de tratamientos (independiente del mock del catálogo
  // público, que no comparte identificadores con la API). Intenta
  // precargar el tratamiento pedido por `?servicio=` (slug del catálogo
  // mock o id real) como cortesía, no como fuente de verdad.
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
            (t) =>
              slugificar(t.nombre) === slugPedido || String(t.id) === slugPedido
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

  const cargarProfesionales = useCallback(async () => {
    if (profesionales !== null) return profesionales
    setCargandoProfesionales(true)
    setErrorProfesionales(null)
    try {
      const lista = await listarProfesionales()
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
  }, [profesionales])

  const buscarDisponibilidad = useCallback(
    async (
      fechaConsulta: string,
      profesionalEspecifico: Profesional | null,
      modoCualquiera: boolean,
      candidatosForzados?: Profesional[]
    ): Promise<SlotConProfesional[]> => {
      if (!tratamiento) return []
      const candidatos = modoCualquiera
        ? (candidatosForzados ?? profesionales ?? [])
        : profesionalEspecifico
          ? [profesionalEspecifico]
          : []

      if (candidatos.length === 0) {
        setSlots([])
        return []
      }

      setCargandoSlots(true)
      setErrorSlots(null)
      try {
        const resultados = await Promise.all(
          candidatos.map(async (p) => {
            const disponibilidad = await consultarDisponibilidad({
              professionalId: p.id,
              treatmentId: tratamiento.id,
              fecha: fechaConsulta,
            })
            return disponibilidad.slots.map((slot) => ({
              ...slot,
              profesional: p,
            }))
          })
        )
        const todos = resultados
          .flat()
          .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))
        setSlots(todos)
        return todos
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
    setTratamientoState(seleccionado)
    setProfesionalState(null)
    setCualquieraDisponible(false)
    setSlots([])
    setSlotSeleccionado(null)
    setPaso("profesional")
    void cargarProfesionales()
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
