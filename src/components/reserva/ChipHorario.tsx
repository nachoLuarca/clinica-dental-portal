import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { SlotConProfesional } from "@/types/reserva"

interface ChipHorarioProps {
  slot: SlotConProfesional
  activo: boolean
  onSeleccionar: (slot: SlotConProfesional) => void
}

/**
 * Chip de horario, extraído de la versión original de `PasoHorario` para
 * reusarlo tal cual (misma animación de framer-motion) dentro de cada fila
 * de profesional en `PasoDisponibilidad`.
 */
export function ChipHorario({ slot, activo, onSeleccionar }: ChipHorarioProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSeleccionar(slot)}
      initial={false}
      animate={activo ? { scale: 1.05 } : { scale: 1 }}
      whileHover={activo ? undefined : { scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "rounded-xl px-3 py-2 font-mono text-sm font-medium ring-1 transition-colors duration-150",
        activo
          ? "bg-primary text-primary-foreground ring-primary shadow-md"
          : "bg-card text-foreground ring-border/70 hover:ring-primary/50"
      )}
    >
      {slot.inicio}
    </motion.button>
  )
}
