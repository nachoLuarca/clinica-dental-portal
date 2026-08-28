import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useCatalogoReserva } from "@/hooks/reserva/useCatalogoReserva"
import { useConfirmacionReserva } from "@/hooks/reserva/useConfirmacionReserva"
import { useDisponibilidadReserva } from "@/hooks/reserva/useDisponibilidadReserva"
import { useIdentificacionReserva } from "@/hooks/reserva/useIdentificacionReserva"
import { useProfesionalesReserva } from "@/hooks/reserva/useProfesionalesReserva"
import { useSucursalesReserva } from "@/hooks/reserva/useSucursalesReserva"
import { PASOS_POR_ENTRADA } from "@/hooks/reserva/tipos"
import type {
  EspecialidadPublica,
  Profesional,
  SlotConProfesional,
  TratamientoDeEspecialidad,
} from "@/types/reserva"
import type { Sucursal } from "@/types/sucursales"

export type { EntradaReserva, PasoReserva } from "@/hooks/reserva/tipos"
import type { EntradaReserva, PasoReserva } from "@/hooks/reserva/tipos"

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
 *
 * El estado se reparte en sub-hooks por dominio (`hooks/reserva/*`) porque
 * este archivo ya había crecido a ~700 líneas manejando todo junto. Cada
 * sub-hook es dueño de su propio estado y expone lo mínimo que el resto
 * necesita (ids, listas, setters puntuales) — este archivo es el único que
 * conoce el paso actual y decide, para cada acción del paciente, a qué
 * paso siguiente ir y qué combinación de sub-hooks disparar.
 */
export function useReservaWizard() {
  const [parametros] = useSearchParams()

  const [paso, setPaso] = useState<PasoReserva>("inicio")
  const [entrada, setEntrada] = useState<EntradaReserva | null>(null)

  // Tratamiento puntual: solo llega resuelto de entrada por el atajo
  // `?servicio=`; en las otras tres puertas de entrada queda `null` hasta el
  // paso "tratamiento-especifico" (después de elegir horario).
  const [tratamiento, setTratamiento] =
    useState<TratamientoDeEspecialidad | null>(null)
  const [especialidadElegidaId, setEspecialidadElegidaId] = useState<
    number | null
  >(null)

  const pasosVisibles = useMemo(
    () => (entrada ? PASOS_POR_ENTRADA[entrada] : []),
    [entrada]
  )

  const sucursalesHook = useSucursalesReserva(paso)
  const profesionalesHook = useProfesionalesReserva({
    paso,
    sucursalId: sucursalesHook.sucursal?.id,
  })
  const catalogo = useCatalogoReserva({
    entrada,
    profesional: profesionalesHook.profesional,
    especialidadElegidaId,
  })
  const disponibilidad = useDisponibilidadReserva({
    sucursalId: sucursalesHook.sucursal?.id,
    profesionales: profesionalesHook.profesionales,
  })

  function elegirEntrada(nueva: EntradaReserva) {
    setEntrada(nueva)
    if (nueva === "especialidad") setPaso("especialidad-lista")
    else if (nueva === "profesional") setPaso("profesional-lista")
    else setPaso("sucursal-lista")
  }

  function elegirSucursal(seleccionada: Sucursal) {
    sucursalesHook.setSucursal(seleccionada)
    setPaso("especialidad-lista")
  }

  function elegirProfesionalDeLista(seleccionado: Profesional) {
    profesionalesHook.setProfesional(seleccionado)
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
    setTratamiento(null)
    disponibilidad.setSlots([])
    disponibilidad.setSlotSeleccionado(null)
    setPaso("disponibilidad")

    void profesionalesHook.cargarProfesionales({ forzar: true }).then((lista) => {
      void disponibilidad.buscarDisponibilidad(
        disponibilidad.fecha,
        { especialidadId: especialidad.id },
        lista ?? []
      )
    })
  }

  /**
   * Único camino que fija el tratamiento ANTES de ver disponibilidad: el
   * atajo `?servicio=` (ficha de un tratamiento puntual del catálogo). Ver
   * nota del hook sobre por qué las otras tres entradas no pasan por acá.
   */
  function elegirTratamientoDelCatalogo(
    seleccionado: TratamientoDeEspecialidad
  ) {
    setTratamiento(seleccionado)
    disponibilidad.setSlots([])
    disponibilidad.setSlotSeleccionado(null)
    setPaso("disponibilidad")

    void profesionalesHook
      .cargarProfesionales({ treatmentId: seleccionado.id, forzar: true })
      .then((lista) => {
        void disponibilidad.buscarDisponibilidad(
          disponibilidad.fecha,
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
    const profesional = profesionalesHook.profesional
    const especialidades = catalogo.especialidades
    if (
      especialidadUnicaAplicada.current ||
      !profesional ||
      !especialidades
    ) {
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
  }, [paso, entrada, profesionalesHook.profesional, catalogo.especialidades])

  async function cambiarFecha(nuevaFecha: string) {
    disponibilidad.setFecha(nuevaFecha)
    disponibilidad.setSlotSeleccionado(null)
    if (tratamiento) {
      await disponibilidad.buscarDisponibilidad(nuevaFecha, {
        treatmentId: tratamiento.id,
      })
    } else if (especialidadElegidaId != null) {
      await disponibilidad.buscarDisponibilidad(nuevaFecha, {
        especialidadId: especialidadElegidaId,
      })
    }
  }

  // Si el tratamiento ya viene fijo (atajo `?servicio=`), elegir un horario
  // va directo a Identificación — ya no hace falta elegir tratamiento. Si
  // no (las otras tres entradas), primero hay que resolver cuál tratamiento
  // puntual de la especialidad es, recién ahí se identifica el paciente.
  function seleccionarSlot(slot: SlotConProfesional) {
    disponibilidad.setSlotSeleccionado(slot)
    confirmacion.limpiarAvisos()
    setPaso(tratamiento ? "identificacion" : "tratamiento-especifico")
  }

  function elegirTratamientoEspecifico(seleccionado: TratamientoDeEspecialidad) {
    setTratamiento(seleccionado)
    setPaso("identificacion")
  }

  const identificacion = useIdentificacionReserva({
    onIdentificado: () => setPaso("confirmar"),
  })

  const confirmacion = useConfirmacionReserva({
    tratamiento,
    slotSeleccionado: disponibilidad.slotSeleccionado,
    rut: identificacion.rut,
    fecha: disponibilidad.fecha,
    buscarDisponibilidad: disponibilidad.buscarDisponibilidad,
    onExito: () => setPaso("exito"),
    onSlotYaNoDisponible: () => {
      disponibilidad.setSlotSeleccionado(null)
      setPaso("disponibilidad")
    },
  })

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
      void profesionalesHook.cargarProfesionales({ forzar: true }).then((lista) => {
        const encontrado = lista?.find((p) => String(p.id) === idProfesional)
        if (encontrado) {
          profesionalesHook.setProfesional(encontrado)
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
    if (slugServicio && catalogo.tratamientos) {
      const encontrado = catalogo.tratamientos.find(
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
    // una sola vez, `ref` ya lo garantiza); solo importa que
    // `catalogo.tratamientos` haya llegado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso, parametros, catalogo.tratamientos])

  function volverAPaso(destino: PasoReserva) {
    confirmacion.limpiarAvisos()
    setPaso(destino)
  }

  function reiniciar() {
    setPaso("inicio")
    setEntrada(null)
    setTratamiento(null)
    setEspecialidadElegidaId(null)
    sucursalesHook.setSucursal(null)
    profesionalesHook.setProfesional(null)
    disponibilidad.setSlots([])
    disponibilidad.setSlotSeleccionado(null)
    identificacion.reiniciar()
    confirmacion.reiniciar()
  }

  return {
    paso,
    setPaso,
    entrada,
    elegirEntrada,
    pasosVisibles,
    sucursales: sucursalesHook.sucursales,
    cargandoSucursales: sucursalesHook.cargandoSucursales,
    errorSucursales: sucursalesHook.errorSucursales,
    sucursal: sucursalesHook.sucursal,
    elegirSucursal,
    rut: identificacion.rut,
    verificandoRut: identificacion.verificandoRut,
    errorVerificarRut: identificacion.errorVerificarRut,
    pacienteExiste: identificacion.pacienteExiste,
    verificarRutYAvanzar: identificacion.verificarRutYAvanzar,
    creandoPaciente: identificacion.creandoPaciente,
    errorAltaPaciente: identificacion.errorAltaPaciente,
    crearPacienteYAvanzar: identificacion.crearPacienteYAvanzar,
    tratamiento,
    opcionesEspecialidad: catalogo.opcionesEspecialidad,
    cargandoEspecialidades: catalogo.cargandoEspecialidades,
    errorEspecialidades: catalogo.errorEspecialidades,
    especialidadElegidaId,
    elegirEspecialidad,
    tratamientosDeLaEspecialidad: catalogo.tratamientosDeLaEspecialidad,
    elegirTratamientoEspecifico,
    profesionales: profesionalesHook.profesionales,
    cargandoProfesionales: profesionalesHook.cargandoProfesionales,
    errorProfesionales: profesionalesHook.errorProfesionales,
    profesional: profesionalesHook.profesional,
    elegirProfesionalDeLista,
    fecha: disponibilidad.fecha,
    cambiarFecha,
    slots: disponibilidad.slots,
    cargandoSlots: disponibilidad.cargandoSlots,
    errorSlots: disponibilidad.errorSlots,
    slotSeleccionado: disponibilidad.slotSeleccionado,
    seleccionarSlot,
    notas: confirmacion.notas,
    setNotas: confirmacion.setNotas,
    creandoCita: confirmacion.creandoCita,
    errorCita: confirmacion.errorCita,
    citaCreada: confirmacion.citaCreada,
    slotYaNoDisponible: confirmacion.slotYaNoDisponible,
    confirmarReserva: confirmacion.confirmarReserva,
    volverAPaso,
    reiniciar,
  }
}
