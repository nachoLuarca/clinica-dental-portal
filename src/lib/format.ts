const formateadorClp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
})

export function formatClp(valor: number): string {
  return formateadorClp.format(valor)
}

export function formatDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`

  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60

  if (resto === 0) return `${horas} h`
  return `${horas} h ${resto} min`
}

/**
 * "caja_compensacion" -> "caja compensacion" (el componente que lo muestra
 * ya lo pone en mayúsculas vía CSS, como el resto de las etiquetas mono del
 * sitio). El backend no documenta un enum cerrado de valores para `tipo`
 * de convenio, así que en vez de mapear a mano una lista que se puede
 * desactualizar, solo se le saca el guion bajo.
 */
export function formatTipoConvenio(tipo: string): string {
  return tipo.replace(/_/g, " ")
}

const DIAS_ABREVIADOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

function formatHoraCorta(horaHms: string): string {
  return horaHms.slice(0, 5)
}

interface HorarioParaAgrupar {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

/**
 * Agrupa los días consecutivos con el mismo horario en una línea por rango
 * (ej. "Lun a Vie 09:00–19:00", "Sáb 09:00–13:00") en vez de una fila por
 * cada uno de los 7 días. Un día sin horario cargado (backend no manda esa
 * fila) queda simplemente afuera — no se muestra como "cerrado" porque eso
 * sería un dato que la API no confirmó.
 */
export function formatHorarioSemanal(horarios: HorarioParaAgrupar[]): string[] {
  const porDia = new Map(horarios.map((h) => [h.dia_semana, h]))
  const lineas: string[] = []
  let inicioTramo: number | null = null

  for (let dia = 1; dia <= 7; dia++) {
    const actual = porDia.get(dia)
    const anterior = porDia.get(dia - 1)
    const mismoHorarioQueAyer =
      actual &&
      anterior &&
      actual.hora_inicio === anterior.hora_inicio &&
      actual.hora_fin === anterior.hora_fin

    if (actual && !mismoHorarioQueAyer) {
      inicioTramo = dia
    }

    const siguiente = porDia.get(dia + 1)
    const continuaMañana =
      actual &&
      siguiente &&
      siguiente.hora_inicio === actual.hora_inicio &&
      siguiente.hora_fin === actual.hora_fin

    if (actual && !continuaMañana && inicioTramo !== null) {
      const rango =
        inicioTramo === dia
          ? DIAS_ABREVIADOS[inicioTramo - 1]
          : `${DIAS_ABREVIADOS[inicioTramo - 1]} a ${DIAS_ABREVIADOS[dia - 1]}`
      lineas.push(
        `${rango} ${formatHoraCorta(actual.hora_inicio)}–${formatHoraCorta(actual.hora_fin)}`
      )
      inicioTramo = null
    }
  }

  return lineas
}
