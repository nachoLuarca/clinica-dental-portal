import { useEffect, useMemo, useRef, useState } from "react"
import {
  listarEspecialidadesPublicas,
  listarTratamientosPublicos,
} from "@/services/reservas.service"
import type { EntradaReserva } from "@/hooks/reserva/tipos"
import type { EspecialidadPublica, Profesional, TratamientoPublico } from "@/types/reserva"

/**
 * Catálogo de especialidades/tratamientos del tenant, compartido por las
 * tres puertas de entrada. Ambas listas se piden apenas se monta el wizard
 * (no recién al llegar a "especialidad-lista"): Sucursal y Profesional
 * también las necesitan antes de llegar ahí (Profesional para resolver el
 * caso de especialidad única, ver `useReservaWizard`). Mismo motivo de
 * `ref` (en vez de un flag de closure con cleanup) que el resto de los
 * efectos de carga del wizard.
 */
export function useCatalogoReserva({
  entrada,
  profesional,
  especialidadElegidaId,
}: {
  entrada: EntradaReserva | null
  profesional: Profesional | null
  especialidadElegidaId: number | null
}) {
  const [tratamientos, setTratamientos] = useState<TratamientoPublico[] | null>(
    null
  )
  const [especialidades, setEspecialidades] = useState<
    EspecialidadPublica[] | null
  >(null)
  const [cargandoEspecialidades, setCargandoEspecialidades] = useState(false)
  const [errorEspecialidades, setErrorEspecialidades] = useState<
    string | null
  >(null)

  // Solo sirve para resolver el atajo `?servicio=` (los tratamientos sin
  // especialidad asignada solo son reservables por ese atajo, ver nota en el
  // comentario de `useReservaWizard`). Si esta llamada falla, el atajo
  // simplemente no encuentra match y el paciente sigue por el flujo normal
  // desde "inicio".
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

  return {
    tratamientos,
    especialidades,
    cargandoEspecialidades,
    errorEspecialidades,
    opcionesEspecialidad,
    tratamientosDeLaEspecialidad,
  }
}
