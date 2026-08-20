import {
  Activity,
  Baby,
  Bone,
  Layers,
  Radar,
  ShieldPlus,
  Smile,
  Wrench,
} from "lucide-react"

/**
 * Mapa especialidad -> ícono. Las especialidades ya no son texto libre del
 * staff (eso era `categoria`): vienen de un catálogo fijo del backend
 * (`especialidad.nombre`), así que el mapa puede ser exhaustivo en vez de
 * "mejor esfuerzo". Igual se normaliza (sin tildes, minúscula) por si el
 * backend cambia mayúsculas/acentos.
 */
const iconosPorEspecialidad: Record<string, typeof Smile> = {
  "cirugia maxilofacial": Bone,
  endodoncia: Activity,
  implantologia: ShieldPlus,
  "odontologia general": Smile,
  odontopediatria: Baby,
  ortodoncia: Radar,
  periodoncia: Layers,
  "rehabilitacion oral": Wrench,
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

export function iconoDeEspecialidad(especialidad: string | null) {
  if (!especialidad) return Activity
  return iconosPorEspecialidad[normalizar(especialidad)] ?? Activity
}
