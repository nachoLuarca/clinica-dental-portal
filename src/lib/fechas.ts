/**
 * Utilidades de fecha para el selector de semana del wizard de reserva. No
 * hay ninguna librería de fechas instalada (no hay `date-fns` ni
 * `@radix-ui/*` en package.json) — matemática simple con `Date` alcanza para
 * lo que se necesita acá: rango de la semana actual y formateo corto.
 */
const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
]

function aIso(fecha: Date): string {
  return fecha.toISOString().slice(0, 10)
}

export interface DiaSemana {
  iso: string
  diaCorto: string
  numero: number
  esHoy: boolean
  esPasado: boolean
}

/** Lunes de la semana que contiene `fechaIso` (semana ISO 8601: empieza lunes). */
export function inicioDeSemana(fechaIso: string): Date {
  const fecha = new Date(`${fechaIso}T00:00:00`)
  const diaIso = (fecha.getDay() + 6) % 7 // 0 = lunes
  fecha.setDate(fecha.getDate() - diaIso)
  return fecha
}

export function semanaDesde(fechaIso: string): DiaSemana[] {
  const lunes = inicioDeSemana(fechaIso)
  const hoyIso = aIso(new Date())
  return Array.from({ length: 7 }, (_, indice) => {
    const dia = new Date(lunes)
    dia.setDate(lunes.getDate() + indice)
    const iso = aIso(dia)
    return {
      iso,
      diaCorto: DIAS_CORTOS[dia.getDay()],
      numero: dia.getDate(),
      esHoy: iso === hoyIso,
      esPasado: iso < hoyIso,
    }
  })
}

export function sumarSemanas(fechaIso: string, cantidad: number): string {
  const fecha = new Date(`${fechaIso}T00:00:00`)
  fecha.setDate(fecha.getDate() + cantidad * 7)
  return aIso(fecha)
}

export function formatRangoSemana(dias: DiaSemana[]): string {
  const primero = new Date(`${dias[0].iso}T00:00:00`)
  const ultimo = new Date(`${dias[6].iso}T00:00:00`)
  const mesPrimero = MESES_CORTOS[primero.getMonth()]
  const mesUltimo = MESES_CORTOS[ultimo.getMonth()]
  if (mesPrimero === mesUltimo) {
    return `${primero.getDate()} al ${ultimo.getDate()} de ${mesUltimo}`
  }
  return `${primero.getDate()} ${mesPrimero} — ${ultimo.getDate()} ${mesUltimo}`
}

/** Hora (0-23) desde un "HH:MM" — para el filtro Mañana/Tarde. */
export function horaDe(horaCorta: string): number {
  return Number(horaCorta.slice(0, 2))
}
