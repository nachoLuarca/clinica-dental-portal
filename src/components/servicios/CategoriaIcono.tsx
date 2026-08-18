import {
  Activity,
  HeartPulse,
  Radar,
  Smile,
  Sparkles,
  Stethoscope,
  Wrench,
} from "lucide-react"

/**
 * Mapa categoría -> ícono, para que cada tratamiento tenga una identidad
 * visual consistente en vez de un ícono genérico repetido en todas las
 * tarjetas. Las categorías las define el staff libremente desde el portal
 * admin, así que la clave se normaliza (sin tildes, minúscula) para no
 * depender de cómo las tipeen. Si el admin agrega una categoría nueva que
 * no está en el mapa, cae en un ícono por defecto razonable.
 */
const iconosPorCategoria: Record<string, typeof Smile> = {
  prevencion: Sparkles,
  estetica: Smile,
  ortodoncia: Radar,
  cirugia: Stethoscope,
  restauracion: Wrench,
  rehabilitacion: Wrench,
  urgencias: HeartPulse,
}

function normalizarCategoria(categoria: string): string {
  return categoria
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

export function iconoDeCategoria(categoria: string) {
  return iconosPorCategoria[normalizarCategoria(categoria)] ?? Activity
}
