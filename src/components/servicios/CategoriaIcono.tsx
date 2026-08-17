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
 * tarjetas. Si el admin agrega una categoría nueva que no está en el mapa,
 * cae en un ícono por defecto razonable.
 */
const iconosPorCategoria: Record<string, typeof Smile> = {
  Prevención: Sparkles,
  Estética: Smile,
  Ortodoncia: Radar,
  Cirugía: Stethoscope,
  Rehabilitación: Wrench,
  Urgencias: HeartPulse,
}

export function iconoDeCategoria(categoria: string) {
  return iconosPorCategoria[categoria] ?? Activity
}
