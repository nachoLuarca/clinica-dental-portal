import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { ApiError } from "@/lib/http-client"
import { normalizarRutParaApi } from "@/lib/rut"
import { crearPaciente, verificarRut } from "@/services/pacientes.service"
import {
  consultarDisponibilidad,
  crearCitaPublica,
  listarEspecialidadesPublicas,
  listarProfesionales,
  listarTratamientosPublicos,
} from "@/services/reservas.service"
import { listarSucursalesPublicas } from "@/services/sucursales.service"
import type { DatosAltaPaciente } from "@/types/identificacion"
import type {
  Cita,
  EspecialidadPublica,
  Profesional,
  SlotConProfesional,
  TratamientoDeEspecialidad,
  TratamientoPublico,
} from "@/types/reserva"
import type { Sucursal } from "@/types/sucursales"

/**
 * Tres puertas de entrada (estilo Dentalink) que convergen en la misma
 * pantalla de disponibilidad:
 * - "especialidad": lista de especialidades del catálogo.
 * - "profesional": elegir con quién atenderse primero; si cubre más de una
 *   especialidad, elige cuál buscar (si cubre solo una, se salta ese paso).
 * - "sucursal": elegir sede primero; de ahí en más sigue el mismo camino que
 *   "especialidad" pero con `sucursal_id` acotando profesionales/horarios.
 *
 * A propósito, ninguna de las tres pide un TRATAMIENTO puntual de entrada —
 * la disponibilidad se consulta por especialidad (`GET /publico/availability
 * ?especialidad_id=`, la API usa la duración del tratamiento más largo de
 * esa especialidad para generar los slots) y el tratamiento exacto recién se
 * elige después de reservar un horario, en el paso "tratamiento-especifico".
 * Solo cuando el paciente llega desde la ficha de un tratamiento puntual del
 * catálogo (`/tratamientos/:slug` → "Reservar este tratamiento", atajo
 * `?servicio=`) el tratamiento ya viene fijo desde el arranque y ese paso se
 * salta entero — por eso los tratamientos "sin especialidad asignada"
 * (`otrosTratamientos` en versiones anteriores de este hook) solo son
 * reservables desde ese atajo: no tienen especialidad con la que resolver
 * disponibilidad en las otras tres puertas de entrada.
 */
export type EntradaReserva = "especialidad" | "profesional" | "sucursal"

export type PasoReserva =
  | "inicio"
  | "sucursal-lista"
  | "especialidad-lista"
  | "profesional-lista"
  | "disponibilidad"
  | "tratamiento-especifico"
  | "identificacion"
  | "confirmar"
  | "exito"

const PASOS_POR_ENTRADA: Record<
  EntradaReserva,
  { id: PasoReserva; titulo: string }[]
> = {
  especialidad: [
    { id: "especialidad-lista", titulo: "Especialidad" },
    { id: "disponibilidad", titulo: "Disponibilidad" },
    { id: "tratamiento-especifico", titulo: "Tratamiento" },
    { id: "identificacion", titulo: "Identificación" },
    { id: "confirmar", titulo: "Confirmar" },
  ],
  profesional: [
    { id: "profesional-lista", titulo: "Profesional" },
    { id: "especialidad-lista", titulo: "Especialidad" },
    { id: "disponibilidad", titulo: "Disponibilidad" },
    { id: "tratamiento-especifico", titulo: "Tratamiento" },
    { id: "identificacion", titulo: "Identificación" },
    { id: "confirmar", titulo: "Confirmar" },
  ],
  sucursal: [
    { id: "sucursal-lista", titulo: "Sucursal" },
    { id: "especialidad-lista", titulo: "Especialidad" },
    { id: "disponibilidad", titulo: "Disponibilidad" },
    { id: "tratamiento-especifico", titulo: "Tratamiento" },
    { id: "identificacion", titulo: "Identificación" },
    { id: "confirmar", titulo: "Confirmar" },
  ],
}

/**
 * Orquesta los pasos del flujo de reserva. La disponibilidad y la creación
 * de la cita siempre se piden a la API — este hook no calcula horarios ni
 * valida choques, solo maneja estado de UI (paso actual, selección en
 * curso, errores para mostrar).
 *
 * El paciente se identifica por RUT + Turnstile en el paso "identificacion",
 * ubicado justo antes de "confirmar" (no al principio): se puede explorar
 * especialidad/profesional/horario sin dar datos personales todavía. Sin
 * login ni password: no hay sesión que sobrevivir a una redirección, así
 * que este hook no persiste nada en `sessionStorage` — todo el estado vive
 * mientras la pestaña sigue abierta.
 */
export function useReservaWizard() {
  const [parametros] = useSearchParams()

  const [paso, setPaso] = useState<PasoReserva>("inicio")
  const [entrada, setEntrada] = useState<EntradaReserva | null>(null)

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
  // Tratamiento puntual: solo llega resuelto de entrada por el atajo
  // `?servicio=`; en las otras tres puertas de entrada queda `null` hasta el
  // paso "tratamiento-especifico" (después de elegir horario).
  const [tratamiento, setTratamientoState] =
    useState<TratamientoDeEspecialidad | null>(null)

  const [profesionales, setProfesionales] = useState<Profesional[] | null>(null)
  const [cargandoProfesionales, setCargandoProfesionales] = useState(false)
  const [errorProfesionales, setErrorProfesionales] = useState<ApiError | null>(
    null
  )
  const [profesional, setProfesionalState] = useState<Profesional | null>(null)

  const [sucursales, setSucursales] = useState<Sucursal[] | null>(null)
  const [cargandoSucursales, setCargandoSucursales] = useState(false)
  const [errorSucursales, setErrorSucursales] = useState<string | null>(null)
  const [sucursal, setSucursalState] = useState<Sucursal | null>(null)

  const [especialidades, setEspecialidades] = useState<
    EspecialidadPublica[] | null
  >(null)
  const [cargandoEspecialidades, setCargandoEspecialidades] = useState(false)
  const [errorEspecialidades, setErrorEspecialidades] = useState<
    string | null
  >(null)
  const [especialidadElegidaId, setEspecialidadElegidaId] = useState<
    number | null
  >(null)

  const [fecha, setFechaState] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )
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

  const pasosVisibles = useMemo(
    () => (entrada ? PASOS_POR_ENTRADA[entrada] : []),
    [entrada]
  )

  // Catálogo real de tratamientos, se pide apenas se monta el wizard: solo
  // sirve para resolver el atajo `?servicio=` (los tratamientos sin
  // especialidad asignada solo son reservables por ese atajo, ver nota en el
  // comentario del hook). Si esta llamada falla, el atajo simplemente no
  // encuentra match y el paciente sigue por el flujo normal desde "inicio".
  //
  // Guarda con un `ref` (no un flag de closure con cleanup) a propósito:
  // en StrictMode (dev) React monta, desmonta y vuelve a montar los
  // efectos para detectar código no idempotente. Un flag de closure que el
  // cleanup pone en `false` invalida el resultado del primer pedido real
  // sin que nadie más lo reemplace. El `ref` sobrevive ese ciclo porque es
  // la misma instancia del componente, así que no hay pedido duplicado ni
  // resultado descartado.
  const tratamientosSolicitados = useRef(false)
  useEffect(() => {
    if (tratamientosSolicitados.current) return
    tratamientosSolicitados.current = true
    listarTratamientosPublicos()
      .then((lista) => setTratamientos(lista))
      .catch(() => {
        // Ver nota arriba: sin lista, el atajo ?servicio= no encuentra
        // match, sin romper el resto.
      })
  }, [])

  // Especialidades con sus tratamientos activos, pedidas también apenas se
  // monta el wizard (no solo al llegar al paso "especialidad-lista": las
  // otras dos entradas también las necesitan — Sucursal las muestra igual
  // después de elegir sede, y Profesional las usa para resolver qué
  // tratamientos ofrecer en "tratamiento-especifico" una vez elegido el
  // horario). Mismo motivo de `ref` que el efecto de tratamientos.
  const especialidadesSolicitadas = useRef(false)
  useEffect(() => {
    if (especialidadesSolicitadas.current) return
    especialidadesSolicitadas.current = true

    setCargandoEspecialidades(true)
    setErrorEspecialidades(null)
    listarEspecialidadesPublicas()
      .then((lista) => setEspecialidades(lista))
      .catch(() => {
        especialidadesSolicitadas.current = false
        setErrorEspecialidades(
          "No pudimos cargar las especialidades disponibles. Intenta de nuevo más tarde."
        )
      })
      .finally(() => setCargandoEspecialidades(false))
  }, [])

  const cargarProfesionales = useCallback(
    async (opciones?: {
      treatmentId?: number
      sucursalId?: number
      forzar?: boolean
    }) => {
      // `forzar` evita el corto-circuito del cache cuando el llamador ya
      // sabe que la lista quedó obsoleta (cambio de sede) en el mismo tick
      // en que pidió limpiarla con `setProfesionales(null)` — ese `null`
      // todavía no se refleja en este closure, así que sin `forzar` acá se
      // devolvería la lista vieja en vez de pedir la nueva.
      if (profesionales !== null && !opciones?.forzar) return profesionales
      setCargandoProfesionales(true)
      setErrorProfesionales(null)
      try {
        const lista = await listarProfesionales(
          opciones?.treatmentId,
          opciones?.sucursalId ?? sucursal?.id
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
    [profesionales, sucursal]
  )

  const sucursalesSolicitadas = useRef(false)
  useEffect(() => {
    if (paso !== "sucursal-lista" || sucursalesSolicitadas.current) return
    sucursalesSolicitadas.current = true

    setCargandoSucursales(true)
    setErrorSucursales(null)
    listarSucursalesPublicas()
      .then((lista) => setSucursales(lista))
      .catch(() => {
        sucursalesSolicitadas.current = false
        setErrorSucursales(
          "No pudimos cargar las sucursales disponibles. Intenta de nuevo más tarde."
        )
      })
      .finally(() => setCargandoSucursales(false))
  }, [paso])

  // Lista completa del equipo activo (sin filtrar por tratamiento) para el
  // paso "profesional-lista" — mismo endpoint que usa el directorio público
  // de `/equipo` (`useEquipoProfesional`).
  const profesionalesListaSolicitada = useRef(false)
  useEffect(() => {
    if (paso !== "profesional-lista" || profesionalesListaSolicitada.current) {
      return
    }
    profesionalesListaSolicitada.current = true
    void cargarProfesionales({ forzar: true })
  }, [paso, cargarProfesionales])

  /**
   * Siempre en modo "cualquiera disponible" (nunca se manda
   * `professional_id`): la API agrega los slots libres del equipo — de toda
   * la clínica, o solo de la sede si se manda `sucursal_id` — y marca cada
   * slot con el profesional que lo cubre. Acá solo se resuelve ese id contra
   * la lista de profesionales para poder mostrar nombre/foto. Filtrar a un
   * solo profesional (entrada "Profesional") es responsabilidad de quien
   * consume `slots`, no de esta consulta — mandar `professional_id` acá
   * obligaría a mandar también `treatment_id` del lado de la API (ver
   * `AvailabilityRequest`), y este wizard todavía no lo tiene resuelto en
   * ese punto del flujo.
   *
   * Recibe `consulta` (con `treatmentId` o `especialidadId`, nunca los dos)
   * como parámetro explícito, no leído de `tratamiento`/`especialidadElegidaId`
   * del estado: los llamadores de esta función a veces la invocan en el
   * mismo tick en que recién están haciendo el `setState` correspondiente, y
   * ese `setState` es asíncrono — leerlo acá adentro devolvería todavía el
   * valor previo.
   */
  const buscarDisponibilidad = useCallback(
    async (
      fechaConsulta: string,
      consulta: { treatmentId: number } | { especialidadId: number },
      listaProfesionalesParaNombres?: Profesional[]
    ): Promise<SlotConProfesional[]> => {
      setCargandoSlots(true)
      setErrorSlots(null)
      try {
        const disponibilidad = await consultarDisponibilidad({
          ...consulta,
          fecha: fechaConsulta,
          sucursalId: sucursal?.id,
        })

        const listaNombres = listaProfesionalesParaNombres ?? profesionales ?? []
        const conProfesional = disponibilidad.slots
          .map((slot): SlotConProfesional => {
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
    [profesionales, sucursal]
  )

  // Opciones del paso "especialidad-lista": el catálogo completo, salvo
  // entrando por Profesional — ahí se acota a las especialidades que ese
  // profesional cubre (cruzando `profesional.especialidades` contra el
  // catálogo completo, para tener también `.tratamientos` resuelto — lo
  // necesita el paso "tratamiento-especifico" más adelante). Si por algún
  // motivo no hay match (dato faltante), se cae al catálogo completo para no
  // dejar al paciente en un callejón sin salida.
  const opcionesEspecialidad = useMemo(() => {
    if (!especialidades) return null
    if (entrada !== "profesional" || !profesional) return especialidades
    const ids = new Set((profesional.especialidades ?? []).map((e) => e.id))
    const filtradas = especialidades.filter((e) => ids.has(e.id))
    return filtradas.length > 0 ? filtradas : especialidades
  }, [especialidades, entrada, profesional])

  const tratamientosDeLaEspecialidad = useMemo(() => {
    if (especialidadElegidaId == null) return []
    return (
      especialidades?.find((e) => e.id === especialidadElegidaId)
        ?.tratamientos ?? []
    )
  }, [especialidades, especialidadElegidaId])

  function elegirEntrada(nueva: EntradaReserva) {
    setEntrada(nueva)
    if (nueva === "especialidad") setPaso("especialidad-lista")
    else if (nueva === "profesional") setPaso("profesional-lista")
    else setPaso("sucursal-lista")
  }

  function elegirSucursal(seleccionada: Sucursal) {
    setSucursalState(seleccionada)
    setPaso("especialidad-lista")
  }

  function elegirProfesionalDeLista(seleccionado: Profesional) {
    setProfesionalState(seleccionado)
    setPaso("especialidad-lista")
  }

  /**
   * Único punto donde se fija la especialidad a partir de la cual se
   * consulta disponibilidad (entradas Especialidad/Profesional/Sucursal).
   * El tratamiento puntual queda sin resolver hasta después de elegir
   * horario — ver "tratamiento-especifico" y `elegirTratamientoEspecifico`.
   */
  function elegirEspecialidad(especialidad: EspecialidadPublica) {
    setEspecialidadElegidaId(especialidad.id)
    setTratamientoState(null)
    setSlots([])
    setSlotSeleccionado(null)
    setPaso("disponibilidad")

    void cargarProfesionales({ sucursalId: sucursal?.id, forzar: true }).then(
      (lista) => {
        void buscarDisponibilidad(
          fecha,
          { especialidadId: especialidad.id },
          lista ?? []
        )
      }
    )
  }

  /**
   * Único camino que fija el tratamiento ANTES de ver disponibilidad: el
   * atajo `?servicio=` (ficha de un tratamiento puntual del catálogo). Ver
   * nota del hook sobre por qué las otras tres entradas no pasan por acá.
   */
  function elegirTratamientoDelCatalogo(
    seleccionado: TratamientoDeEspecialidad
  ) {
    setTratamientoState(seleccionado)
    setSlots([])
    setSlotSeleccionado(null)
    setPaso("disponibilidad")

    void cargarProfesionales({
      treatmentId: seleccionado.id,
      forzar: true,
    }).then((lista) => {
      void buscarDisponibilidad(
        fecha,
        { treatmentId: seleccionado.id },
        lista ?? []
      )
    })
  }

  // Si se entró por Profesional y ese profesional cubre una sola
  // especialidad, no tiene sentido preguntar cuál: se aplica sola apenas
  // el catálogo de especialidades está listo. `.current` solo se marca
  // `true` al aplicarlo, para no interceptar un "Volver" manual del
  // paciente a este paso más tarde (ej. si vuelve para elegir otra
  // especialidad de las que sí cubre, en el caso con más de una).
  const especialidadUnicaAplicada = useRef(false)
  useEffect(() => {
    if (paso !== "especialidad-lista" || entrada !== "profesional") return
    if (especialidadUnicaAplicada.current || !profesional || !especialidades) {
      return
    }
    const propias = profesional.especialidades ?? []
    if (propias.length !== 1) return
    const resuelta = especialidades.find((e) => e.id === propias[0].id)
    if (!resuelta) return
    especialidadUnicaAplicada.current = true
    elegirEspecialidad(resuelta)
    // `elegirEspecialidad` se recrea cada render; el guard por `ref` ya
    // evita cualquier reejecución indebida de este efecto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso, entrada, profesional, especialidades])

  async function cambiarFecha(nuevaFecha: string) {
    setFechaState(nuevaFecha)
    setSlotSeleccionado(null)
    if (tratamiento) {
      await buscarDisponibilidad(nuevaFecha, { treatmentId: tratamiento.id })
    } else if (especialidadElegidaId != null) {
      await buscarDisponibilidad(nuevaFecha, {
        especialidadId: especialidadElegidaId,
      })
    }
  }

  // Si el tratamiento ya viene fijo (atajo `?servicio=`), elegir un horario
  // va directo a Identificación — ya no hace falta elegir tratamiento. Si
  // no (las otras tres entradas), primero hay que resolver cuál tratamiento
  // puntual de la especialidad es, recién ahí se identifica el paciente.
  function seleccionarSlot(slot: SlotConProfesional) {
    setSlotSeleccionado(slot)
    setSlotYaNoDisponible(false)
    setErrorCita(null)
    setPaso(tratamiento ? "identificacion" : "tratamiento-especifico")
  }

  function elegirTratamientoEspecifico(seleccionado: TratamientoDeEspecialidad) {
    setTratamientoState(seleccionado)
    setPaso("identificacion")
  }

  // Atajos por URL, aplicados una sola vez apenas se monta el wizard:
  // `?servicio=<slug>` (desde la ficha de un tratamiento) fija ese
  // tratamiento y salta directo a Disponibilidad. `?profesional=<id>`
  // (desde la ficha de un profesional en el directorio del equipo) entra
  // por "profesional" con ese profesional ya resuelto, saltando a
  // "especialidad-lista" (que a su vez se auto-resuelve sola si ese
  // profesional cubre una única especialidad, ver el efecto de arriba).
  const atajoAplicado = useRef(false)
  useEffect(() => {
    if (atajoAplicado.current || paso !== "inicio") return

    const idProfesional = parametros.get("profesional")
    if (idProfesional) {
      atajoAplicado.current = true
      setEntrada("profesional")
      void cargarProfesionales({ forzar: true }).then((lista) => {
        const encontrado = lista?.find((p) => String(p.id) === idProfesional)
        if (encontrado) {
          setProfesionalState(encontrado)
          setPaso("especialidad-lista")
        } else {
          // No se encontró ese id (o falló la carga): se ve la lista real,
          // sin dejar al paciente en un callejón sin salida.
          setPaso("profesional-lista")
        }
      })
      return
    }

    const slugServicio = parametros.get("servicio")
    if (slugServicio && tratamientos) {
      const encontrado = tratamientos.find(
        (t) => t.slug === slugServicio || String(t.id) === slugServicio
      )
      if (encontrado) {
        atajoAplicado.current = true
        setEntrada("especialidad")
        elegirTratamientoDelCatalogo(encontrado)
      }
    }
    // `cargarProfesionales`/`elegirTratamientoDelCatalogo` dependen de
    // estado que este efecto no necesita re-observar (el atajo se aplica
    // una sola vez, `ref` ya lo garantiza); solo importa que `tratamientos`
    // haya llegado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso, parametros, tratamientos])

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
      // Tratamiento/profesional/horario ya están elegidos antes de llegar
      // acá (identificación ahora es el paso previo a confirmar): si el
      // paciente ya existe, se avanza directo.
      if (existe) setPaso("confirmar")
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
      setPaso("confirmar")
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

  function volverAPaso(destino: PasoReserva) {
    setErrorCita(null)
    setSlotYaNoDisponible(false)
    setPaso(destino)
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
        // El slot ya no está libre: refresca la disponibilidad (ahora con
        // el tratamiento puntual ya resuelto, no la aproximación por
        // especialidad) y ofrece el siguiente horario sin reiniciar el
        // flujo completo.
        setSlotYaNoDisponible(true)
        setSlotSeleccionado(null)
        setPaso("disponibilidad")
        await buscarDisponibilidad(fecha, { treatmentId: tratamiento.id })
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
    setPaso("inicio")
    setEntrada(null)
    setRut(null)
    setPacienteExiste(null)
    setErrorVerificarRut(null)
    setErrorAltaPaciente(null)
    setTratamientoState(null)
    setProfesionalState(null)
    setSucursalState(null)
    setEspecialidadElegidaId(null)
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
    entrada,
    elegirEntrada,
    pasosVisibles,
    sucursales,
    cargandoSucursales,
    errorSucursales,
    sucursal,
    elegirSucursal,
    rut,
    verificandoRut,
    errorVerificarRut,
    pacienteExiste,
    verificarRutYAvanzar,
    creandoPaciente,
    errorAltaPaciente,
    crearPacienteYAvanzar,
    tratamiento,
    opcionesEspecialidad,
    cargandoEspecialidades,
    errorEspecialidades,
    especialidadElegidaId,
    elegirEspecialidad,
    tratamientosDeLaEspecialidad,
    elegirTratamientoEspecifico,
    profesionales,
    cargandoProfesionales,
    errorProfesionales,
    profesional,
    elegirProfesionalDeLista,
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
